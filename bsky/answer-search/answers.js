// Bluesky answers in one tab, 28 MB: Ettin-17m embeds the question, a GPU scan over 2-bit codes finds the
// closest of 61,686 posts, then Ettin embeds every sentence of those posts and the best-matching sentences
// are the answer, each quoted from its post. Nothing is generated, so nothing can be misquoted.
//
// Nothing here is a copy: the model, index, post texts and engines are the published files of
// ../embedders/ plus ../image-search/params.json. If that page is republished with a different build,
// this one follows it; Ettin's model and index are published together, so they stay matched.

import { SmallEngine } from '../embedders/engine.js';
import { RemexTail } from '../embedders/tail.js';

const E = new URL('../embedders/', import.meta.url).href;
const F = {
  manifest: E + 'models/ettin/manifest.json', meta: E + 'models/ettin/meta.json',
  tokenizer: E + 'models/ettin/tokenizer.json', model: E + 'models/ettin/model.onnx',
  index: E + 'index/ettin/index.json', codes: E + 'index/ettin/codes.u8.bin', aux: E + 'index/ettin/aux.f32.bin',
  corpus: E + 'data/corpus.json.gz', params: new URL('../image-search/params.json', import.meta.url).href,
};
const TOKENIZERS = 'https://cdn.jsdelivr.net/npm/@huggingface/tokenizers@0.2.0/dist/tokenizers.mjs';
const CACHE = 'answer-search-v1';
const MAX_SEQ = 128;                      // Ettin's sequence cap, as on the embedders page
const BATCH_TOKENS = 2048, BATCH_SEQS = 32;
const TOTAL_BYTES = 27.9e6;
const EXAMPLES = ['How much do people spend on Claude Code?', 'Do LLMs actually reason?',
  'What are people saying about copyright lawsuits against AI labs?', 'Which local model runs well on a laptop?',
  'Why are data centers raising electricity bills?', 'How do Bluesky custom feeds work?'];

const $ = (id) => document.getElementById(id);
const now = () => performance.now();
const Q = new URLSearchParams(location.search);
const settings = { posts: 20, sentences: 4 };
try { Object.assign(settings, JSON.parse(localStorage.getItem('answer-search-settings') || '{}')); } catch (e) { /* no storage */ }
const save = () => { try { localStorage.setItem('answer-search-settings', JSON.stringify(settings)); } catch (e) { /* no storage */ } };

// ---------------------------------------------------------------- fetching

let bytesGot = 0;
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
    chunks.push(value); got += value.length; bytesGot += value.length;
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

let retrieval = null, loading = null;
function ensureRetrieval() {
  if (retrieval) return Promise.resolve(retrieval);
  return loading ??= (async () => {
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
  })().finally(() => { loading = null; });
}

async function load() {
  if (retrieval) return;
  $('load').disabled = true;
  const timer = setInterval(() => status(bytesGot ? `downloading ${(bytesGot / 1e6).toFixed(1)} of ${(TOTAL_BYTES / 1e6).toFixed(0)} MB`
    : 'loading…', bytesGot / TOTAL_BYTES), 200);
  const t0 = now();
  try {
    await ensureRetrieval();
    clearInterval(timer);
    status(`Ready in ${((now() - t0) / 1000).toFixed(1)} s: ${retrieval.n.toLocaleString()} posts indexed on the GPU.`, 1);
    $('load').style.display = 'none';
  } catch (e) {
    clearInterval(timer);
    console.error(e);
    status('Could not load: ' + (e.message || e), 0);
    $('load').disabled = false;
    throw e;
  }
}

// ---------------------------------------------------------------- the answer

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

function renderPosts(ol, posts, used) {
  ol.textContent = '';
  for (const p of posts) {
    const li = document.createElement('li');
    li.dataset.n = p.rank;
    if (used.has(p.rank)) li.classList.add('was-cited');
    const meta = document.createElement('div');
    meta.className = 'pmeta';
    const num = document.createElement('b'); num.textContent = `post ${p.rank}`;
    const who = document.createElement('a');
    who.href = postUrl(p); who.target = '_blank'; who.rel = 'noopener';
    who.textContent = '@' + p.handle;
    const when = document.createElement('span'); when.textContent = tidDate(p.rkey);
    const sc = document.createElement('span'); sc.textContent = 'score ' + p.score.toFixed(3);
    meta.append(num, who, when, sc);
    if (used.has(p.rank)) { const u = document.createElement('span'); u.className = 'cited'; u.textContent = 'quoted above'; meta.append(u); }
    const tx = document.createElement('div'); tx.className = 'ptext'; tx.textContent = p.text;
    li.append(meta, tx);
    ol.append(li);
  }
}

// ---------------------------------------------------------------- one question

let busy = false;
async function ask(question) {
  question = question.trim();
  if (!question || busy) return;
  busy = true; $('ask').disabled = true;
  $('examples').hidden = true;
  const u = new URL(location.href); u.searchParams.set('q', question); history.replaceState(null, '', u);
  const card = document.createElement('article');
  card.className = 'turn';
  card.innerHTML = `<div class="question"></div><div class="extract"><p class="cursor">searching…</p></div><div class="stats"></div>
    <details class="posts"><summary>Posts found</summary><ol></ol></details>`;
  card.querySelector('.question').textContent = question;
  $('log').prepend(card);
  const ex = card.querySelector('.extract');
  try {
    await load();
    const r = await retrieval.search(question, settings.posts);
    const x = await extract(r.posts, r.qv, settings.sentences);
    renderPicks(ex, x.picks);
    renderPosts(card.querySelector('ol'), r.posts, new Set(x.picks.map((c) => c.post.rank)));
    card.querySelector('details.posts summary').textContent = `${r.posts.length} posts found among ${retrieval.n.toLocaleString()}`;
    card.querySelector('.stats').innerHTML = `<span>search: embed ${r.embedMs.toFixed(0)} ms, scan ${r.scanMs.toFixed(0)} ms</span>` +
      `<span>${x.n} sentences ranked in ${x.ms.toFixed(0)} ms</span>`;
    window.answers.last = { question, posts: r.posts, picks: x.picks };
  } catch (e) {
    console.error(e);
    ex.innerHTML = `<p class="bad">${esc(e.message || String(e))}</p>`;
  } finally {
    busy = false; $('ask').disabled = false;
  }
}

// ---------------------------------------------------------------- wiring

for (const [id, key] of [['posts', 'posts'], ['sents', 'sentences']]) {
  $(id).value = settings[key];
  $(id + 'V').textContent = settings[key];
  $(id).oninput = () => { settings[key] = +$(id).value; $(id + 'V').textContent = settings[key]; save(); };
}
$('ask').onclick = () => ask($('q').value);
$('q').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask($('q').value); } });
$('load').onclick = () => load().catch(() => {});
$('clearCache').onclick = async () => {
  let a = false; try { a = await caches.delete(CACHE); } catch (e) { /* none */ }
  status(a ? 'Cached files deleted.' : 'Nothing cached.');
};
$('log').addEventListener('click', (e) => {
  const b = e.target.closest('button.chip');
  if (!b) return;
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
window.answers = { ask, sentences, get retrieval() { return retrieval; } };
if (Q.get('q')) { $('q').value = Q.get('q'); ask(Q.get('q')); }
