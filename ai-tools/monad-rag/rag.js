// Bluesky answers in one tab, 28 MB: Ettin-17m embeds the question, a GPU scan over 2-bit codes finds the
// closest of 61,686 posts, then Ettin embeds every sentence of those posts and the best-matching sentences
// are the answer, each quoted from its post. Nothing is generated, so nothing can be misquoted.
//
// Optional: loop-fixed Monad (56M, 8-bit, +66 MB) writes an answer from the top posts in SYNTH's
// <source_n> format, and every <ref> quote it writes is checked against the posts (verifyRef). In tests
// almost none were word for word, which is why it is off by default.
//
// Nothing here is a copy. Retrieval uses the published files of /bsky/embedders/ (engine.js, tail.js,
// Ettin's model and index, the post texts) plus /bsky/image-search/params.json; Monad is
// /ai-tools/monad-chat/ (monad.js, bpe.js, weights on R2), loaded only when it is switched on. A model
// added to monad.js's MODELS appears in the menu here.

import { SmallEngine } from '../../bsky/embedders/engine.js';
import { RemexTail } from '../../bsky/embedders/tail.js';

const E = new URL('../../bsky/embedders/', import.meta.url).href;
const F = {
  manifest: E + 'models/ettin/manifest.json', meta: E + 'models/ettin/meta.json',
  tokenizer: E + 'models/ettin/tokenizer.json', model: E + 'models/ettin/model.onnx',
  index: E + 'index/ettin/index.json', codes: E + 'index/ettin/codes.u8.bin', aux: E + 'index/ettin/aux.f32.bin',
  corpus: E + 'data/corpus.json.gz', params: new URL('../../bsky/image-search/params.json', import.meta.url).href,
};
const TOKENIZERS = 'https://cdn.jsdelivr.net/npm/@huggingface/tokenizers@0.2.0/dist/tokenizers.mjs';
const CACHE = 'monad-rag-v1';
const MAX_SEQ = 128;                      // Ettin's sequence cap, as on the embedders page
const BATCH_TOKENS = 2048, BATCH_SEQS = 32;
const MONAD_POSTS = 5, MIN_ROOM = 640;    // Monad gets the top 5 posts; dropped from the end to leave 640 tokens to write
const EXAMPLES = ['How much do people spend on Claude Code?', 'Do LLMs actually reason?',
  'What are people saying about copyright lawsuits against AI labs?', 'Which local model runs well on a laptop?',
  'Why are data centers raising electricity bills?', 'How do Bluesky custom feeds work?'];

const $ = (id) => document.getElementById(id);
const now = () => performance.now();
const Q = new URLSearchParams(location.search);
const settings = { posts: 20, sentences: 4, monad: false, temperature: 0.7, topP: 0.9, penalty: 1.15, maxNew: 1024 };
try { Object.assign(settings, JSON.parse(localStorage.getItem('monad-rag-settings-v2') || '{}')); } catch (e) { /* no storage */ }
if (Q.has('monad')) settings.monad = Q.get('monad') !== '0';
const save = () => { try { localStorage.setItem('monad-rag-settings-v2', JSON.stringify(settings)); } catch (e) { /* no storage */ } };

// ---------------------------------------------------------------- fetching

const bytes = { got: 0 };
function status(s, frac) {
  $('status').textContent = s;
  if (frac !== undefined) $('bar').style.width = `${Math.round(Math.min(1, Math.max(0, frac)) * 100)}%`;
}

// Cache API in front of fetch; returns an ArrayBuffer and counts bytes for the progress bar.
async function fetchCached(url) {
  let cache = null;
  try { cache = await caches.open(CACHE); } catch (e) { /* private mode */ }
  if (cache) {
    try { const hit = await cache.match(url); if (hit) return await hit.arrayBuffer(); } catch (e) { /* broken entry */ }
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url.replace(E, '')}: HTTP ${r.status}`);
  const reader = r.body.getReader(), chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); got += value.length; bytes.got += value.length;
  }
  const out = new Uint8Array(got);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  if (cache) { try { await cache.put(url, new Response(out)); } catch (e) { /* quota */ } }
  return out.buffer;
}
const json = async (u) => JSON.parse(new TextDecoder().decode(await fetchCached(u)));

async function gunzipJson(buf) {
  const b = new Uint8Array(buf);
  if (b[0] !== 0x1f || b[1] !== 0x8b) return JSON.parse(new TextDecoder().decode(b));   // server already decoded it
  const s = new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(s).text());
}

// ---------------------------------------------------------------- retrieval (Ettin-17m + RemexTail)

let retrieval = null, retrievalLoading = null;
function ensureRetrieval() {
  if (retrieval) return Promise.resolve(retrieval);
  return retrievalLoading ??= (async () => {
    const adapter = await navigator.gpu?.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) throw new Error('This page needs WebGPU (Chrome, Edge, or Safari 26+): the search runs on the GPU.');
    const device = await adapter.requestDevice({ requiredLimits: {
      maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize, maxBufferSize: adapter.limits.maxBufferSize } });
    const [manifest, meta, tj, model, idx, codes, aux, corpusBuf, params, tokMod] = await Promise.all([
      json(F.manifest), json(F.meta), json(F.tokenizer), fetchCached(F.model), json(F.index),
      fetchCached(F.codes), fetchCached(F.aux), fetchCached(F.corpus), json(F.params), import(TOKENIZERS)]);
    const corpus = await gunzipJson(corpusBuf);
    const tok = new tokMod.Tokenizer(tj, {});
    const qp = idx.query_prompt ?? (meta.prompts || {}).query ?? '', dp = idx.doc_prompt ?? (meta.prompts || {}).document ?? '';
    const engine = await SmallEngine.create(device, manifest, model, { maxTokens: BATCH_TOKENS, maxSeqs: BATCH_SEQS });
    const tail = await RemexTail.create(device, { rht: params.rht, mu: new Float32Array(idx.mu), boundaries: params.boundaries,
      centroids: params.centroids, kappa: params.kappa });
    const docs = tail.allocCorpus(idx.n);
    tail.loadCodes(docs, new Uint8Array(codes), new Float32Array(aux), 0);
    const qbuf = device.createBuffer({ size: idx.d * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    await device.queue.onSubmittedWorkDone();
    const ids = (text) => {
      const x = tok.encode(text).ids;
      return x.length > MAX_SEQ ? x.slice(0, MAX_SEQ - 1).concat(x[x.length - 1]) : x;
    };
    // Unit vectors for many texts, in batches the engine accepts.
    const embedMany = async (texts) => {
      const out = new Float32Array(texts.length * idx.d);
      let batch = [], start = 0, toks = 0;
      const flush = async () => {
        if (!batch.length) return;
        out.set(await engine.embed(batch), start * idx.d);
        start += batch.length; batch = []; toks = 0;
      };
      for (const t of texts) {
        const x = ids(dp + t);
        if (batch.length === BATCH_SEQS || toks + x.length > BATCH_TOKENS) await flush();
        batch.push(x); toks += x.length;
      }
      await flush();
      return out;
    };
    const search = async (text, k) => {
      const t0 = now();
      const qv = await engine.embed([ids(qp + text)]);
      const t1 = now();
      device.queue.writeBuffer(qbuf, 0, qv);
      const [top] = await tail.topk(qbuf, 1, docs, idx.n, k);
      const t2 = now();
      const posts = Array.from(top.idx, (i, j) => {
        const [a, rkey] = corpus.posts[i];
        return { i, rank: j + 1, score: top.score[j], text: corpus.texts[i], handle: corpus.authors[a][0], rkey };
      });
      return { posts, qv, embedMs: t1 - t0, scanMs: t2 - t1 };
    };
    retrieval = { search, embedMany, n: idx.n, d: idx.d };
    return retrieval;
  })().finally(() => { retrievalLoading = null; });
}

// ---------------------------------------------------------------- the extractive answer

// Post text -> sentences worth showing: split at sentence ends and line breaks, keep pieces with at
// least four words, drop bare links.
function sentences(text) {
  const out = [];
  for (let s of text.split(/(?<=[.!?…])\s+|\n+/)) {
    s = s.trim();
    if ((s.match(/\p{L}{2,}/gu) || []).length >= 4 && !/^\S+\.\S+\/\S*$/.test(s)) out.push(s);
  }
  return out;
}

// Every sentence of the retrieved posts, scored by cosine with the question; the best one from each post,
// best first, `count` of them.
async function extract(posts, qv, count) {
  const cands = [];
  for (const p of posts) for (const s of sentences(p.text)) cands.push({ post: p, s });
  if (!cands.length) return { picks: [], n: 0, ms: 0 };
  const t0 = now();
  const V = await retrieval.embedMany(cands.map((c) => c.s));
  const d = retrieval.d;
  for (let j = 0; j < cands.length; j++) {
    let dot = 0;
    for (let k = 0; k < d; k++) dot += V[j * d + k] * qv[k];
    cands[j].score = dot;
  }
  cands.sort((a, b) => b.score - a.score);
  const seen = new Set(), picks = [];
  for (const c of cands) {
    if (seen.has(c.post.i)) continue;
    seen.add(c.post.i); picks.push(c);
    if (picks.length === count) break;
  }
  return { picks, n: cands.length, ms: now() - t0 };
}

// ---------------------------------------------------------------- Monad (optional)

let M = null, tok = null, model = null, backend = null, modelLoading = null, monadStatus = { s: '', frac: 0 };
const loadMonadModule = async () => {
  if (!M) {
    [M, { loadTokenizer: M_loadTok }] = await Promise.all([import('../monad-chat/monad.js'), import('../monad-chat/bpe.js')]);
    for (const [key, m] of Object.entries(M.MODELS)) {
      if ([...$('model').options].some((o) => o.value === key)) continue;
      const o = document.createElement('option'); o.value = key; o.textContent = m.label; $('model').append(o);
    }
    if (M.MODELS[Q.get('model')]) $('model').value = Q.get('model');
  }
  return M;
};
let M_loadTok = null;
function ensureModel() {
  return modelLoading ??= (async () => {
    await loadMonadModule();
    const key = $('model').value;
    if (model && model.key === key) return model;
    backend ??= await M.pickBackend();
    tok ??= await M_loadTok(M.BASE + 'tokenizer.json');
    if (model) { await model.release(); model = null; }
    model = await M.Monad.load(key, backend, (s, frac) => { monadStatus = { s, frac }; });
    return model;
  })().finally(() => { modelLoading = null; });
}

// ---------------------------------------------------------------- loading

const RETRIEVAL_BYTES = 27.9e6, PACKED = 64946688;
function paintLoad(withMonad) {
  const r = retrieval ? 'posts ready' : bytes.got ? `posts ${(bytes.got / 1e6).toFixed(1)} of ${(RETRIEVAL_BYTES / 1e6).toFixed(0)} MB` : 'posts …';
  let frac = (retrieval ? RETRIEVAL_BYTES : Math.min(bytes.got, RETRIEVAL_BYTES)) / RETRIEVAL_BYTES, m = '';
  if (withMonad) {
    m = ' · ' + (model ? 'Monad ready' : 'Monad: ' + (monadStatus.s || '…'));
    frac = (frac * RETRIEVAL_BYTES + (model ? PACKED : (monadStatus.frac || 0) * PACKED)) / (RETRIEVAL_BYTES + PACKED);
  }
  status(r + m, frac);
}

async function loadAll(withMonad) {
  if (retrieval && !(withMonad && !(model && model.key === $('model').value))) return;   // all loaded already
  $('load').disabled = true;
  const timer = setInterval(() => paintLoad(withMonad), 200);
  const t0 = now();
  try {
    const needModel = withMonad && !(model && model.key === $('model').value);
    await Promise.all([ensureRetrieval(), needModel ? ensureModel() : null]);
    clearInterval(timer);
    status(`Ready in ${((now() - t0) / 1000).toFixed(1)} s: ${retrieval.n.toLocaleString()} posts indexed on the GPU` +
      (withMonad ? `, ${M.MODELS[model.key].label} on ${backend === 'webgpu' ? 'WebGPU' : 'the CPU (slow)'}.` : '.'), 1);
    $('load').style.display = 'none';
  } catch (e) {
    clearInterval(timer);
    console.error(e);
    status('Could not load: ' + (e.message || e), 0);
    $('load').disabled = false;
    throw e;
  }
}

// ---------------------------------------------------------------- quote checking (Monad's answers)

const norm = (s) => s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const has = (hay, needle) => (' ' + hay + ' ').includes(' ' + needle + ' ');

// A <ref> quote is "exact" when it appears word for word in the post it names, "moved" when it appears
// word for word in a different post, "pieced" when runs of 6+ words of it (the whole quote, if shorter)
// come from the posts but the quote as a whole does not, and "absent" otherwise.
export function verifyRef(quote, n, posts) {
  const q = norm(quote), ns = posts.map((p) => norm(p.text));
  if (!q) return { kind: 'absent', n, frac: 0 };
  if (n >= 1 && n <= ns.length && has(ns[n - 1], q)) return { kind: 'exact', n, frac: 1 };
  const m = ns.findIndex((s) => has(s, q));
  if (m >= 0) return { kind: 'moved', n, m: m + 1, frac: 1 };
  const w = q.split(' '), L = Math.min(6, w.length), cov = new Array(w.length).fill(false);
  for (let j = 0; j + L <= w.length; j++) {
    const g = w.slice(j, j + L).join(' ');
    if (ns.some((s) => has(s, g))) for (let t = j; t < j + L; t++) cov[t] = true;
  }
  const frac = cov.filter(Boolean).length / w.length;
  return { kind: frac > 0 ? 'pieced' : 'absent', n, frac };
}
const KIND = {
  exact: { mark: '✓', tip: (r) => `word for word in post ${r.n}` },
  moved: { mark: '↷', tip: (r) => `word for word, but in post ${r.m}, not ${r.n}` },
  pieced: { mark: '≈', tip: (r) => `stitched: ${Math.round(r.frac * 100)}% of its words come from runs in the posts, but no post has the sentence` },
  absent: { mark: '✗', tip: () => 'not in any of the posts' },
};

// ---------------------------------------------------------------- rendering

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const B32 = '234567abcdefghijklmnopqrstuvwxyz';
function tidDate(rkey) {   // a Bluesky record key is a TID: microseconds since the epoch above a 10-bit clock id
  if (!/^[2-7a-z]{13}$/.test(rkey)) return '';
  let v = 0n;
  for (const ch of rkey) v = v * 32n + BigInt(B32.indexOf(ch));
  return new Date(Number((v >> 10n) / 1000n)).toISOString().slice(0, 10);
}
const postUrl = (p) => `https://bsky.app/profile/${p.handle}/post/${p.rkey}`;

function renderPicks(el, picks) {
  if (!picks.length) { el.innerHTML = '<p><em>No sentences to quote in the posts found.</em></p>'; return; }
  el.innerHTML = '<ol class="picks">' + picks.map((c) =>
    `<li><blockquote>${esc(c.s)}</blockquote><div class="pmeta"><a href="${esc(postUrl(c.post))}" target="_blank" rel="noopener">@${esc(c.post.handle)}</a>` +
    `<span>${tidDate(c.post.rkey)}</span><button class="chip" data-n="${c.post.rank}" title="show the whole post">post ${c.post.rank}</button>` +
    `<span>match ${c.score.toFixed(2)}</span></div></li>`).join('') + '</ol>';
}

// Monad's answer text -> HTML. Complete <ref name="source_n">…</ref> pairs become checked quotes; an
// unclosed one (mid-stream) shows as plain text until it closes.
function renderAnswer(text, posts, refs) {
  const marks = [];
  let s = text.replace(/<ref name="([^"]*)">([\s\S]*?)<\/ref>/g, (_, name, quote) => {
    const n = parseInt((name.match(/\d+/) || ['0'])[0], 10);
    const r = { ...verifyRef(quote, n, posts), quote };
    refs.push(r);
    marks.push(r);
    return `\u0001${marks.length - 1}\u0002`;
  });
  s = s.replace(/<ref name="[^"]*">/g, '').replace(/<\/?(r(e(f[^>]*)?)?)?$/, '');
  const chip = (r) => `<q class="ref k-${r.kind}">${esc(r.quote.trim())}</q><button class="chip k-${r.kind}" ` +
    `data-n="${r.kind === 'moved' ? r.m : r.n}" title="${esc(KIND[r.kind].tip(r))}">${r.n || '?'}${r.kind === 'moved' ? '→' + r.m : ''} ${KIND[r.kind].mark}</button>`;
  const inline = (line) => esc(line).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\u0001(\d+)\u0002/g, (_, k) => chip(marks[+k]));
  const out = [];
  let list = null;
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of s.split('\n')) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { close(); continue; }
    if ((m = line.match(/^#{1,6}\s+(.*)/))) { close(); out.push(`<h4>${inline(m[1])}</h4>`); continue; }
    if ((m = line.match(/^\s*[-*•]\s+(.*)/))) { if (list !== 'ul') { close(); out.push('<ul>'); list = 'ul'; } out.push(`<li>${inline(m[1])}</li>`); continue; }
    if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== 'ol') { close(); out.push('<ol>'); list = 'ol'; } out.push(`<li>${inline(m[1])}</li>`); continue; }
    close();
    out.push(`<p>${inline(line)}</p>`);
  }
  close();
  return out.join('');
}

function renderPosts(ol, posts) {
  ol.textContent = '';
  for (const p of posts) {
    const li = document.createElement('li');
    li.dataset.n = p.rank;
    const meta = document.createElement('div');
    meta.className = 'pmeta';
    const num = document.createElement('b'); num.textContent = `post ${p.rank}`;
    const who = document.createElement('a');
    who.href = postUrl(p); who.target = '_blank'; who.rel = 'noopener';
    who.textContent = '@' + p.handle;
    const when = document.createElement('span'); when.textContent = tidDate(p.rkey);
    const sc = document.createElement('span'); sc.textContent = 'score ' + p.score.toFixed(3);
    const used = document.createElement('span'); used.className = 'cited';
    meta.append(num, who, when, sc, used);
    const tx = document.createElement('div'); tx.className = 'ptext'; tx.textContent = p.text;
    li.append(meta, tx);
    ol.append(li);
  }
}

function parse(raw) {   // raw = everything Monad wrote after the prompt's opening <think>
  let text = raw;
  const e = text.indexOf(M.END);
  if (e >= 0) text = text.slice(0, e);
  else for (let k = M.END.length - 1; k > 0; k--) if (text.endsWith(M.END.slice(0, k))) { text = text.slice(0, -k); break; }
  const c = text.indexOf('</think>');
  if (c < 0) return { think: text, answer: null };
  return { think: text.slice(0, c), answer: text.slice(c + 8).replace(/^\s+/, '') };
}

// ---------------------------------------------------------------- one question

let busy = false, stopFlag = false;
function setBusy(b) {
  busy = b;
  $('ask').textContent = b ? 'Stop' : 'Ask';
  $('ask').classList.toggle('primary', !b);
}

async function ask(question) {
  question = question.trim();
  if (!question || busy) return;
  setBusy(true); stopFlag = false;
  $('examples').hidden = true;
  const u = new URL(location.href); u.searchParams.set('q', question); history.replaceState(null, '', u);
  const withMonad = settings.monad;
  const card = document.createElement('article');
  card.className = 'turn';
  card.innerHTML = `<div class="question"></div><div class="extract"><p class="cursor">searching…</p></div><div class="stats ex"></div>
    <section class="monad" hidden><h3>Monad's answer from the top ${MONAD_POSTS} posts</h3>
      <details class="think"><summary>thinking…</summary><div class="trace"></div></details>
      <div class="answer"><p class="cursor"></p></div><div class="verdict"></div><div class="stats mo"></div></section>
    <details class="posts"><summary>Posts found</summary><ol></ol></details>`;
  card.querySelector('.question').textContent = question;
  $('log').prepend(card);
  const ex = card.querySelector('.extract'), ol = card.querySelector('ol');
  const fail = (e) => { ex.innerHTML = `<p class="bad">${esc(e.message || String(e))}</p>`; setBusy(false); };
  try { await loadAll(withMonad); } catch (e) { fail(e); return; }

  // search, then quote the best sentence of each of the best-matching posts
  let r, x;
  try {
    r = await retrieval.search(question, settings.posts);
    x = await extract(r.posts, r.qv, settings.sentences);
  } catch (e) { console.error(e); fail(e); return; }
  renderPicks(ex, x.picks);
  renderPosts(ol, r.posts);
  const usedIn = new Set(x.picks.map((c) => c.post.rank));
  for (const li of ol.children) if (usedIn.has(+li.dataset.n)) { li.classList.add('was-cited'); li.querySelector('.cited').textContent = 'quoted above'; }
  card.querySelector('details.posts summary').textContent = `${r.posts.length} posts found among ${retrieval.n.toLocaleString()}`;
  card.querySelector('.stats.ex').innerHTML = `<span>search: embed ${r.embedMs.toFixed(0)} ms, scan ${r.scanMs.toFixed(0)} ms</span>` +
    `<span>· ${x.n} sentences ranked in ${x.ms.toFixed(0)} ms</span>`;
  window.rag.last = { question, posts: r.posts, picks: x.picks };
  if (withMonad) await monadAnswer(question, r.posts.slice(0, MONAD_POSTS), card);
  setBusy(false);
}

async function monadAnswer(question, posts, card) {
  const sec = card.querySelector('.monad');
  sec.hidden = false;
  const ans = sec.querySelector('.answer'), trace = sec.querySelector('.trace'), sum = sec.querySelector('summary');
  const stats = sec.querySelector('.stats'), verdict = sec.querySelector('.verdict');
  const build = (ps) => question + '\n\n' + ps.map((p, j) =>
    `<source_${j + 1}>\n${p.text.replace(/\s*\n\s*/g, '\n').trim()}\n</source_${j + 1}>`).join('\n\n');
  let ids = tok.encode(M.renderPrompt('', [{ role: 'user', content: build(posts) }]));
  while (ids.length > M.CONTEXT - MIN_ROOM && posts.length > 1) {
    posts = posts.slice(0, -1);
    ids = tok.encode(M.renderPrompt('', [{ role: 'user', content: build(posts) }]));
  }
  const pick = M.makeSampler({ temperature: settings.temperature, topP: settings.topP, penalty: settings.penalty, window: 64 });
  const dec = tok.stream();
  const room = Math.min(settings.maxNew, M.CONTEXT - ids.length);
  let raw = '', n = 0, decodeMs = 0, prefillMs = 0, why = 'limit', thinkN = 0, pending = false, finished = false, refs = [];
  const paint = (final) => {
    pending = false;
    if (finished && !final) return;
    const p = parse(raw);
    trace.textContent = p.think.trim();
    refs = [];
    if (p.answer === null) {
      sum.textContent = `thinking… ${n} tokens`;
      ans.innerHTML = final ? '<p><em>(no answer: it did not finish thinking)</em></p>' : '<p class="cursor"></p>';
    } else {
      sum.textContent = `thought for ${thinkN} tokens`;
      ans.innerHTML = renderAnswer(p.answer, posts, refs) || '<p></p>';
      if (!final) ans.lastElementChild?.classList.add('cursor');
    }
  };
  const gen = [];
  try {
    for await (const { id, ms, prefill } of model.generate(ids, { maxNew: room, pick })) {
      if (prefill) prefillMs = ms; else decodeMs += ms;
      if (id === M.EOS) { why = 'end'; break; }
      gen.push(id); n++;
      raw += dec.push(id);
      if (!raw.includes('</think>')) thinkN = n;
      if (raw.includes(M.END)) { why = 'end'; break; }
      if (M.looping(gen)) { why = 'loop'; break; }
      if (stopFlag) { why = 'stopped'; break; }
      if (!pending) { pending = true; requestAnimationFrame(() => paint(false)); }
    }
  } catch (e) { why = 'error'; stats.textContent = 'error: ' + (e.message || e); }
  raw += dec.flush();
  finished = true;
  paint(true);
  const c = { exact: 0, moved: 0, pieced: 0, absent: 0 };
  for (const x of refs) c[x.kind]++;
  verdict.innerHTML = refs.length
    ? `${refs.length} quote${refs.length > 1 ? 's' : ''} checked against the posts: <b class="k-exact">${c.exact} word for word</b>` +
      (c.moved ? `, <b class="k-moved">${c.moved} from a different post than cited</b>` : '') +
      `, <b class="k-pieced">${c.pieced} stitched from pieces</b>, <b class="k-absent">${c.absent} not in any post</b>.`
    : 'No quotes: the answer cites none of the posts.';
  const tps = n > 1 ? (n - 1) / (decodeMs / 1000) : 0;
  const notes = { loop: 'stopped: it started repeating itself', limit: 'hit the token limit', stopped: 'stopped', end: '', error: '' };
  if (why !== 'error') {
    stats.innerHTML = `<span>${esc(M.MODELS[model.key].label)}</span><span>${n} tokens, ${tps.toFixed(0)} tok/s</span>` +
      `<span>prompt ${ids.length} tokens, ${prefillMs.toFixed(0)} ms</span>${notes[why] ? `<span class="warn">${notes[why]}</span>` : ''}`;
  }
  Object.assign(window.rag.last, { monad: { refs, raw, why, n } });
}

// ---------------------------------------------------------------- wiring

for (const [id, key] of [['posts', 'posts'], ['sents', 'sentences'], ['temp', 'temperature'], ['maxnew', 'maxNew']]) {
  $(id).value = settings[key];
  $(id + 'V').textContent = settings[key];
  $(id).oninput = () => { settings[key] = +$(id).value; $(id + 'V').textContent = settings[key]; save(); };
}
const syncMonad = () => { document.body.classList.toggle('with-monad', settings.monad); if (settings.monad) loadMonadModule().catch(() => {}); };
$('monad').checked = settings.monad;
$('monad').onchange = () => { settings.monad = $('monad').checked; save(); syncMonad(); $('load').style.display = ''; $('load').disabled = false; };
syncMonad();

const send = () => { if (busy) { stopFlag = true; return; } ask($('q').value); };
$('ask').onclick = send;
$('q').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });
$('load').onclick = () => loadAll(settings.monad).catch(() => {});
$('clearCache').onclick = async () => {
  let a = false; try { a = await caches.delete(CACHE); } catch (e) { /* none */ }
  let b = false; if (settings.monad || M) { await loadMonadModule(); b = await M.clearCache(); }
  status(a || b ? 'Cached files deleted.' : 'Nothing cached.');
};
$('log').addEventListener('click', (e) => {
  const b = e.target.closest('button.chip');
  if (!b) return;
  // a chip names a post by rank; Monad's source n is post n, since it gets the top posts in order
  const li = b.closest('.turn').querySelector(`ol > li[data-n="${b.dataset.n}"]`);
  if (!li) return;
  li.closest('details').open = true;
  li.scrollIntoView({ block: 'center', behavior: 'smooth' });
  li.classList.remove('flash'); void li.offsetWidth; li.classList.add('flash');
});
for (const q of EXAMPLES) {
  const b = document.createElement('button');
  b.textContent = q;
  b.onclick = () => { $('q').value = q; ask(q); };
  $('examples').append(b);
}
window.rag = { ask, verifyRef, sentences, get retrieval() { return retrieval; }, get model() { return model; } };
if (Q.get('q')) { $('q').value = Q.get('q'); ask(Q.get('q')); }
