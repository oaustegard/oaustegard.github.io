// List Scout: find Bluesky accounts that post about a topic, check how much of what they post is on topic,
// and put the ones you pick on a list. Everything runs in this tab:
//
//   1. search   authenticated post search (Bluesky's public AppView refuses searchPosts) for each term over
//               the last N days; authors not on the excluded list, seen at least MIN times, become candidates
//   2. sample   each candidate's last 100 posts and replies (no reposts), from the public AppView
//   3. classify Ettin-17m embeds every sampled post on the GPU (../embedders/engine.js) and a logistic
//               regression (about-ai.json, 768 weights) gives P(about AI); a candidate's share is the mean
//   4. review   a table pre-ticks accounts that look like people posting on topic; you decide
//   5. list     a new curate list (or an existing one) gets the ticked accounts
//
// Built from the analysis in oaustegard/experiments bsky-list-ai-share, which also ran a Claude judge
// over the shortlist; here the reviewer is you.

import { initializeLib, login, logout, checkStoredSession, getAuthAgent, getListMembers, getLists } from '../bsky-lib.js';
import { SmallEngine } from '../embedders/engine.js';

const E = new URL('../embedders/models/ettin/', import.meta.url).href;
const TOKENIZERS = 'https://cdn.jsdelivr.net/npm/@huggingface/tokenizers@0.2.0/dist/tokenizers.mjs';
const PUBLIC = 'https://public.api.bsky.app/xrpc';
const MAX_SEQ = 128, BATCH_TOKENS = 2048, BATCH_SEQS = 32;
const BOTWORDS = /\b(bot|bots|feed|feeds|news|newsletter|digest|daily|hourly|updates|automated|arxiv|headlines|briefing|aggregat\w*|curated|rss|jobs?|deals|crypto|signals)\b|-bot\b|bot\./i;
const DEFAULT_TERMS = ['LLM', 'LLMs', 'large language model', 'Claude', 'ChatGPT', 'OpenAI', 'Anthropic', 'Gemini', 'AI agent',
  'agentic', 'machine learning', 'neural network', 'RLHF', 'AI safety', 'alignment', 'interpretability', 'coding agent',
  'Claude Code', 'Codex', 'vibe coding', 'open weights', 'Llama', 'DeepSeek', 'Qwen', 'Mistral', 'diffusion model',
  'transformer', 'embeddings', 'RAG', 'fine-tuning', 'AI policy', 'AGI', 'frontier model', 'inference', 'benchmark',
  'arxiv', 'MCP', 'prompt injection', 'evals', 'GPU'];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (html) => { const d = document.createElement('div'); d.innerHTML = html; $('log').append(d); $('log').scrollTop = $('log').scrollHeight; };
const bar = (f) => { $('bar').style.width = `${Math.round(Math.min(1, f) * 100)}%`; };

const settings = { terms: DEFAULT_TERMS.join('\n'), days: 14, pages: 3, minHits: 3, maxCands: 200, minShare: 0.4, maxPpd: 40, minReplies: 0.15 };
try { Object.assign(settings, JSON.parse(localStorage.getItem('list-scout-settings') || '{}')); } catch (e) { /* no storage */ }
const save = () => { try { localStorage.setItem('list-scout-settings', JSON.stringify(settings)); } catch (e) { /* no storage */ } };

let candidates = [];        // [{did, handle, name, bio, followers, hits, posts, replyFrac, ppd, share, aiPerDay, samples, checked}]
let sortKey = 'aiPerDay', sortDir = -1, running = false;

// ---------------------------------------------------------------- network

async function getJSON(url, tries = 5) {
  for (let k = 0; k < tries; k++) {
    let r;
    try { r = await fetch(url); } catch (e) { await sleep(1000 * 2 ** k); continue; }
    if (r.ok) return r.json();
    if ([400, 401, 404].includes(r.status)) return null;
    await sleep(1000 * 2 ** k);                     // 429 and 5xx
  }
  return null;
}
const qs = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v != null)).toString();

async function listMembers(listUri) {
  const items = await getListMembers(listUri);
  return new Set(items.map((it) => it.subject.did));
}

async function search(terms, days, pages, exclude, me) {
  const agent = getAuthAgent();
  const since = new Date(Date.now() - days * 86400e3).toISOString().slice(0, 10);
  const hits = new Map(), seen = new Set();
  for (const [t, term] of terms.entries()) {
    let cursor;
    for (let p = 0; p < pages; p++) {
      let res;
      for (let k = 0; k < 4; k++) {
        try { res = await agent.app.bsky.feed.searchPosts({ q: `"${term}" since:${since}`, limit: 100, sort: 'latest', cursor }); break; }
        catch (e) { if (k === 3) { log(`<span class="warn">search "${esc(term)}" failed: ${esc(e.message)}</span>`); } await sleep(1000 * 2 ** k); }
      }
      if (!res) break;
      for (const post of res.data.posts || []) {
        if (seen.has(post.uri)) continue;
        seen.add(post.uri);
        const did = post.author.did;
        if (exclude.has(did) || did === me) continue;
        const h = hits.get(did) || { did, handle: post.author.handle, hits: 0 };
        h.hits++;
        hits.set(did, h);
      }
      cursor = res.data.cursor;
      if (!cursor) break;
    }
    $('stage').textContent = `searching: ${t + 1} / ${terms.length} terms, ${seen.size.toLocaleString()} posts, ${hits.size.toLocaleString()} authors`;
    bar(0.25 * (t + 1) / terms.length);
  }
  return { hits: [...hits.values()], posts: seen.size };
}

const wordy = (t) => t.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length >= 3;
async function sample(c) {
  const d = await getJSON(`${PUBLIC}/app.bsky.feed.getAuthorFeed?${qs({ actor: c.did, limit: 100, filter: 'posts_with_replies' })}`);
  const own = (d?.feed || []).filter((it) => !it.reason && it.post.author.did === c.did).map((it) => it.post);
  const posts = own.map((p) => ({ t: Date.parse(p.indexedAt), text: p.record?.text || '', reply: !!p.record?.reply, uri: p.uri }))
    .filter((p) => wordy(p.text));
  const span = posts.length > 1 ? Math.max(1, (Math.max(...posts.map((p) => p.t)) - Math.min(...posts.map((p) => p.t))) / 86400e3) : 1;
  return { ...c, posts, replyFrac: own.length ? own.filter((p) => p.record?.reply).length / own.length : 0, ppd: posts.length / span };
}

async function profiles(dids) {
  const out = new Map();
  for (let i = 0; i < dids.length; i += 25) {
    const d = await getJSON(`${PUBLIC}/app.bsky.actor.getProfiles?${dids.slice(i, i + 25).map((x) => 'actors=' + encodeURIComponent(x)).join('&')}`);
    for (const p of d?.profiles || []) out.set(p.did, p);
  }
  return out;
}

// ---------------------------------------------------------------- the classifier on the GPU

let clf = null;
async function ensureClassifier() {
  if (clf) return clf;
  const adapter = await navigator.gpu?.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) throw new Error('This page needs WebGPU (Chrome, Edge, or Safari 26+): the classifier runs on the GPU.');
  const device = await adapter.requestDevice({ requiredLimits: {
    maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize, maxBufferSize: adapter.limits.maxBufferSize } });
  $('stage').textContent = 'loading the classifier (11 MB, once)';
  const [manifest, meta, tj, model, weights, tokMod] = await Promise.all([
    fetch(E + 'manifest.json').then((r) => r.json()), fetch(E + 'meta.json').then((r) => r.json()),
    fetch(E + 'tokenizer.json').then((r) => r.json()), fetch(E + 'model.onnx').then((r) => r.arrayBuffer()),
    fetch(new URL('about-ai.json', import.meta.url)).then((r) => r.json()), import(TOKENIZERS)]);
  const tok = new tokMod.Tokenizer(tj, {});
  const dp = (meta.prompts || {}).document ?? '';
  const engine = await SmallEngine.create(device, manifest, model, { maxTokens: BATCH_TOKENS, maxSeqs: BATCH_SEQS });
  const w = Float32Array.from(weights.w), b = weights.bias, D = w.length;
  const ids = (text) => { const x = tok.encode(dp + text).ids; return x.length > MAX_SEQ ? x.slice(0, MAX_SEQ - 1).concat(x[x.length - 1]) : x; };
  // P(about the topic) for many texts, in batches the engine accepts; onBatch(done) reports progress
  const score = async (texts, onBatch) => {
    const out = new Float32Array(texts.length);
    let batch = [], start = 0, toks = 0;
    const flush = async () => {
      if (!batch.length) return;
      const V = await engine.embed(batch);
      for (let j = 0; j < batch.length; j++) {
        let z = b;
        for (let k = 0; k < D; k++) z += w[k] * V[j * D + k];
        out[start + j] = 1 / (1 + Math.exp(-z));
      }
      start += batch.length; batch = []; toks = 0;
      onBatch?.(start);
    };
    for (const t of texts) {
      const x = ids(t);
      if (batch.length === BATCH_SEQS || toks + x.length > BATCH_TOKENS) await flush();
      batch.push(x); toks += x.length;
    }
    await flush();
    return out;
  };
  clf = { score, name: weights.name };
  return clf;
}

// ---------------------------------------------------------------- the run

function flags(c) {
  const f = [];
  if (BOTWORDS.test(`${c.handle} ${c.name} ${c.bio}`)) f.push('bot/feed words');
  if (c.ppd > settings.maxPpd) f.push(`${Math.round(c.ppd)} posts/day`);
  if (c.replyFrac < settings.minReplies) f.push('rarely replies');
  if (c.posts.length < 10) f.push('few posts');
  return f;
}
const looksRight = (c) => c.share >= settings.minShare && !flags(c).length;

async function run() {
  if (running) return;
  running = true; $('run').disabled = true; $('log').textContent = ''; $('results').hidden = true; $('listCard').hidden = true;
  const t0 = performance.now();
  try {
    readSettings();
    const terms = settings.terms.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!terms.length) throw new Error('Add at least one search term.');
    const me = getAuthAgent().session.did;
    const exclude = new Set();
    for (const uri of [...$('exclude').selectedOptions].map((o) => o.value)) {
      const m = await listMembers(uri);
      m.forEach((d) => exclude.add(d));
      log(`excluding ${m.size} members of <b>${esc($('exclude').querySelector(`option[value="${CSS.escape(uri)}"]`).textContent)}</b>`);
    }
    const loading = ensureClassifier();                // load the model while searching
    loading.catch(() => {});
    const s = await search(terms, settings.days, settings.pages, exclude, me);
    let cands = s.hits.filter((h) => h.hits >= settings.minHits).sort((a, b) => b.hits - a.hits);
    log(`${s.posts.toLocaleString()} posts from ${s.hits.length.toLocaleString()} authors not excluded; ` +
        `${cands.length} seen at least ${settings.minHits} times` + (cands.length > settings.maxCands ? `, sampling the ${settings.maxCands} seen most` : ''));
    cands = cands.slice(0, settings.maxCands);
    if (!cands.length) throw new Error('No candidates: try more terms, more days, or a lower minimum.');

    const sampled = [];
    let done = 0;
    const queue = cands.slice();
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const c = queue.shift();
        sampled.push(await sample(c));
        done++;
        $('stage').textContent = `sampling posts: ${done} / ${cands.length} accounts`;
        bar(0.25 + 0.25 * done / cands.length);
      }
    }));
    const prof = await profiles(sampled.map((c) => c.did));
    for (const c of sampled) {
      const p = prof.get(c.did) || {};
      Object.assign(c, { handle: p.handle || c.handle, name: p.displayName || '', bio: (p.description || '').replace(/\s+/g, ' '),
        followers: p.followersCount ?? null, avatar: p.avatar || '' });
    }

    const { score } = await loading;
    const flat = sampled.flatMap((c) => c.posts.map((p) => p.text));
    log(`classifying ${flat.length.toLocaleString()} posts on the GPU`);
    const t1 = performance.now();
    const P = await score(flat, (n) => { $('stage').textContent = `classifying: ${n.toLocaleString()} / ${flat.length.toLocaleString()} posts`; bar(0.5 + 0.5 * n / flat.length); });
    log(`classified in ${((performance.now() - t1) / 1000).toFixed(1)} s`);
    let o = 0;
    for (const c of sampled) {
      const ps = P.subarray(o, o + c.posts.length); o += c.posts.length;
      c.posts.forEach((p, j) => { p.p = ps[j]; });
      c.share = c.posts.length ? ps.reduce((a, b) => a + b, 0) / c.posts.length : 0;
      c.aiPerDay = c.share * c.ppd;
      c.flags = flags(c);
      c.checked = looksRight(c);
    }
    candidates = sampled.filter((c) => c.posts.length);
    bar(1);
    $('stage').textContent = `done in ${((performance.now() - t0) / 1000).toFixed(0)} s: ${candidates.length} accounts scored, ` +
      `${candidates.filter((c) => c.checked).length} pre-ticked`;
    render();
    $('results').hidden = false; $('listCard').hidden = false;
  } catch (e) {
    console.error(e);
    log(`<span class="bad">${esc(e.message || e)}</span>`);
    $('stage').textContent = 'stopped';
  } finally {
    running = false; $('run').disabled = false;
  }
}

// ---------------------------------------------------------------- review table

const pct = (x) => `${Math.round(x * 100)}%`;
function render() {
  const rows = candidates.slice().sort((a, b) => sortDir * ((a[sortKey] ?? -1) > (b[sortKey] ?? -1) ? 1 : (a[sortKey] ?? -1) < (b[sortKey] ?? -1) ? -1 : 0));
  const tb = $('rows');
  tb.innerHTML = rows.map((c) => {
    const top = c.posts.slice().sort((a, b) => b.p - a.p);
    const samples = [...top.slice(0, 3), ...top.slice(-2)].map((p) =>
      `<li><span class="p">${pct(p.p)}</span> ${esc(p.text.slice(0, 240))}</li>`).join('');
    return `<tr data-did="${esc(c.did)}" class="${c.checked ? 'on' : ''}">
      <td><input type="checkbox" ${c.checked ? 'checked' : ''} aria-label="add @${esc(c.handle)}"></td>
      <td class="who"><a href="https://bsky.app/profile/${esc(c.handle)}" target="_blank" rel="noopener">@${esc(c.handle)}</a>
        <div class="name">${esc(c.name)}</div><div class="bio">${esc(c.bio.slice(0, 160))}</div>
        ${c.flags.length ? `<div class="flags">${c.flags.map((f) => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
        <details><summary>most and least on-topic posts</summary><ul>${samples}</ul></details></td>
      <td class="n"><b>${pct(c.share)}</b></td><td class="n">${c.aiPerDay.toFixed(1)}</td><td class="n">${c.ppd.toFixed(1)}</td>
      <td class="n">${pct(c.replyFrac)}</td><td class="n">${c.followers?.toLocaleString() ?? '–'}</td><td class="n">${c.hits}</td></tr>`;
  }).join('');
  for (const th of document.querySelectorAll('th[data-k]')) th.classList.toggle('sorted', th.dataset.k === sortKey);
  updateCount();
}
function updateCount() {
  const n = candidates.filter((c) => c.checked).length;
  $('count').textContent = `${n} of ${candidates.length} ticked`;
  $('make').disabled = !n;
}
$('rows').addEventListener('change', (e) => {
  const tr = e.target.closest('tr');
  const c = candidates.find((x) => x.did === tr.dataset.did);
  c.checked = e.target.checked; tr.classList.toggle('on', c.checked); updateCount();
});
for (const th of document.querySelectorAll('th[data-k]')) {
  th.addEventListener('click', () => { sortDir = sortKey === th.dataset.k ? -sortDir : -1; sortKey = th.dataset.k; render(); });
}
$('tickAll').onclick = () => { candidates.forEach((c) => { c.checked = true; }); render(); };
$('tickNone').onclick = () => { candidates.forEach((c) => { c.checked = false; }); render(); };
$('tickSuggested').onclick = () => { readSettings(); candidates.forEach((c) => { c.flags = flags(c); c.checked = looksRight(c); }); render(); };

// ---------------------------------------------------------------- make the list

async function makeList() {
  const agent = getAuthAgent(), did = agent.session.did;
  const picked = candidates.filter((c) => c.checked);
  $('make').disabled = true;
  try {
    let listUri = $('target').value;
    if (listUri === 'new') {
      const name = $('listName').value.trim() || 'List Scout candidates';
      const r = await agent.com.atproto.repo.createRecord({ repo: did, collection: 'app.bsky.graph.list', record: {
        $type: 'app.bsky.graph.list', purpose: 'app.bsky.graph.defs#curatelist', name: name.slice(0, 64),
        description: $('listDesc').value.trim().slice(0, 300), createdAt: new Date().toISOString() } });
      listUri = r.data.uri;
    }
    const already = await listMembers(listUri);
    const todo = picked.filter((c) => !already.has(c.did));
    for (const [i, c] of todo.entries()) {
      await agent.com.atproto.repo.createRecord({ repo: did, collection: 'app.bsky.graph.listitem', record: {
        $type: 'app.bsky.graph.listitem', subject: c.did, list: listUri, createdAt: new Date().toISOString() } });
      $('made').textContent = `adding ${i + 1} / ${todo.length}…`;
    }
    const url = `https://bsky.app/profile/${agent.session.handle}/lists/${listUri.split('/').pop()}`;
    $('made').innerHTML = `Added ${todo.length} account${todo.length === 1 ? '' : 's'}` +
      (picked.length > todo.length ? ` (${picked.length - todo.length} were already on it)` : '') + `. <a href="${url}" target="_blank" rel="noopener">Open the list ↗</a>`;
    await loadLists();
  } catch (e) {
    $('made').innerHTML = `<span class="bad">${esc(e.message || e)}</span>`;
  } finally { $('make').disabled = false; }
}
$('make').onclick = makeList;
$('target').onchange = () => { $('newList').hidden = $('target').value !== 'new'; };

// ---------------------------------------------------------------- settings, login

function readSettings() {
  settings.terms = $('terms').value;
  for (const k of ['days', 'pages', 'minHits', 'maxCands']) settings[k] = Math.max(1, parseInt($(k).value, 10) || settings[k]);
  settings.minShare = (parseFloat($('minShare').value) || 40) / 100;
  settings.maxPpd = parseFloat($('maxPpd').value) || 40;
  settings.minReplies = (parseFloat($('minReplies').value) || 0) / 100;
  save();
}
function fillSettings() {
  $('terms').value = settings.terms;
  for (const k of ['days', 'pages', 'minHits', 'maxCands']) $(k).value = settings[k];
  $('minShare').value = Math.round(settings.minShare * 100); $('maxPpd').value = settings.maxPpd; $('minReplies').value = Math.round(settings.minReplies * 100);
}
$('resetTerms').onclick = () => { $('terms').value = DEFAULT_TERMS.join('\n'); };

async function loadLists() {
  const agent = getAuthAgent();
  const r = await getLists(agent.session.did);
  const lists = r.data.lists.filter((l) => l.purpose === 'app.bsky.graph.defs#curatelist');
  const opts = lists.map((l) => `<option value="${esc(l.uri)}">${esc(l.name)} (${l.listItemCount ?? '?'})</option>`).join('');
  const prev = [...$('exclude').selectedOptions].map((o) => o.value);
  $('exclude').innerHTML = opts;
  for (const o of $('exclude').options) o.selected = prev.includes(o.value) || (!prev.length && /intelligence|ai\b/i.test(o.textContent));
  $('target').innerHTML = '<option value="new">a new list</option>' + opts;
  $('newList').hidden = $('target').value !== 'new';
}
async function signedIn() {
  $('who').textContent = '@' + getAuthAgent().session.handle;
  await loadLists();                                 // before showing the form, so the skip list is set when it appears
  $('authCard').hidden = true; $('scoutCard').hidden = false;
}
$('loginBtn').onclick = async () => {
  $('loginBtn').disabled = true; $('authMsg').textContent = '';
  try {
    await login($('handle').value.trim().replace(/^@/, ''), $('apppw').value);
    $('apppw').value = '';
    await signedIn();
  } catch (e) { $('authMsg').textContent = e.message || String(e); }
  finally { $('loginBtn').disabled = false; }
};
$('logout').onclick = () => { logout(); location.reload(); };
$('run').onclick = run;

fillSettings();
const listDate = new Date().toISOString().slice(0, 10);
$('listName').value = `List Scout candidates ${listDate}`;
$('listDesc').value = 'Accounts that posted about AI in Bluesky search and whose recent posts are mostly about it (List Scout). To review.';
// show(rows): render a review table from saved rows without a run (for screenshots and tests)
const show = (rows) => { candidates = rows; $('authCard').hidden = true; render(); $('results').hidden = false; };
window.scout = { get candidates() { return candidates; }, ensureClassifier, run, show };
(async () => {
  await initializeLib();
  if (await checkStoredSession()) await signedIn();
})();
