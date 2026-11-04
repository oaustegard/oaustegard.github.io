// Bluesky answers in one tab: Ettin-17m embeds the query, a GPU scan over 1-bit codes finds the closest
// of the last ~100,000 posts of the "Artificial (and real) Intelligence" list, then Ettin embeds every
// sentence of those posts and the best-matching sentences are the answer, each quoted from its post.
// Nothing is generated, so nothing can be misquoted.
//
// The index is live. A daily GitHub Action (scripts/answer-search/refresh.py) publishes a snapshot of the
// last 100,000 posts to the bsky-answer-search-data branch (snapshot.bin); the page loads it, then asks Bluesky for the
// posts written since, embeds them on the GPU, quantizes them into the same index (RemexTail.encode) and
// keeps doing that every minute while the tab is visible.
//
// The model and engines are the published files of ../embedders/ plus ../image-search/params.json.

import { SmallEngine } from '../embedders/engine.js';
import { RemexTail } from '../embedders/tail.js';

const E = new URL('../embedders/', import.meta.url).href;
const SNAP = new URLSearchParams(location.search).get('snap')
  ? new URL(new URLSearchParams(location.search).get('snap'), location.href).href.replace(/\/?$/, '/')
  : 'https://raw.githubusercontent.com/oaustegard/oaustegard.github.io/bsky-answer-search-data/';
const F = {
  manifest: E + 'models/ettin/manifest.json', meta: E + 'models/ettin/meta.json',
  tokenizer: E + 'models/ettin/tokenizer.json', model: E + 'models/ettin/model.onnx',
  params: new URL('../image-search/params.json', import.meta.url).href,
};
const LIST = 'at://did:plc:r2whjvupgfw55mllpksnombn/app.bsky.graph.list/3lankcdrlip2f';
const FEED = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getListFeed';
const TOKENIZERS = 'https://cdn.jsdelivr.net/npm/@huggingface/tokenizers@0.2.0/dist/tokenizers.mjs';
const CACHE = 'answer-search-v2';
const MAX_SEQ = 128;                      // Ettin's sequence cap, as on the embedders page
const BATCH_TOKENS = 2048, BATCH_SEQS = 32;
const LIVE_CAP = 20000;                   // room for posts added after the snapshot (about 11 days of the list)
const OVERLAP_S = 3600;                   // page an hour past the newest known post, for posts indexed late
const POLL_MS = 60000;
let TOTAL_BYTES = 40e6;                   // replaced by 12.5 MB of model + the snapshot's own size once its download starts
const EXAMPLES = ['claude code pricing', 'LLM reasoning', 'AI copyright lawsuits', 'local models on a laptop',
  'data center electricity bills', 'bluesky custom feeds'];

const $ = (id) => document.getElementById(id);
const now = () => performance.now();
const Q = new URLSearchParams(location.search);
const settings = { posts: 40, sentences: 10 };
try { Object.assign(settings, JSON.parse(localStorage.getItem('answer-search-settings-v2') || '{}')); } catch (e) { /* no storage */ }
const save = () => { try { localStorage.setItem('answer-search-settings-v2', JSON.stringify(settings)); } catch (e) { /* no storage */ } };

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
  const r = await fetch(url, { cache: 'no-cache' });
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
    const [manifest, meta, tj, model, params, tokMod, snap] = await Promise.all([
      json(F.manifest), json(F.meta), json(F.tokenizer), fetchCached(F.model), json(F.params), import(TOKENIZERS), loadSnapshot()]);
    const { idx, codes, aux, corpus } = snap;
    const tok = new tokMod.Tokenizer(tj, {});
    const qp = (meta.prompts || {}).query ?? '', dp = idx.doc_prompt ?? (meta.prompts || {}).document ?? '';
    const engine = await SmallEngine.create(device, manifest, model, { maxTokens: BATCH_TOKENS, maxSeqs: BATCH_SEQS });
    const tail = await RemexTail.create(device, { rht: params.rht, mu: new Float32Array(idx.mu), ...scanConstants(idx, params) });
    const docs = tail.allocCorpus(idx.n + LIVE_CAP);
    tail.loadCodes(docs, (idx.bits ?? 2) === 1 ? widen1to2(codes) : new Uint8Array(codes), new Float32Array(aux), 0);
    const qbuf = device.createBuffer({ size: idx.d * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    await device.queue.onSubmittedWorkDone();
    const known = new Set();
    corpus.posts.forEach(([a, rkey]) => known.add(corpus.authors[a][1] + '/' + rkey));
    const authorIdx = new Map(corpus.authors.map(([, did], i) => [did, i]));
    let newest = idx.newest.t;
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
      const [top] = await tail.topk(qbuf, 1, docs, corpus.posts.length, k);
      const t2 = now();
      const posts = Array.from(top.idx, (i, j) => {
        const [a, rkey, t] = corpus.posts[i];
        return { i, rank: j + 1, score: top.score[j], text: corpus.texts[i], handle: corpus.authors[a][0], rkey, t };
      });
      return { posts, qv, embedMs: t1 - t0, scanMs: t2 - t1 };
    };

    // Posts written since `newest`: page the list feed back to an hour before it, skipping known posts.
    const fetchNew = async () => {
      const out = [];
      let cursor = null;
      for (let page = 0; page < 300; page++) {
        const q = new URLSearchParams({ list: LIST, limit: '100' });
        if (cursor) q.set('cursor', cursor);
        const r = await fetch(FEED + '?' + q);
        if (!r.ok) throw new Error(`Bluesky list feed: HTTP ${r.status}`);
        const d = await r.json();
        let oldest = Infinity;
        for (const it of d.feed || []) {
          if (it.reason) continue;                           // reposts
          const p = it.post, t = Math.round(Date.parse(p.indexedAt) / 1000);
          oldest = Math.min(oldest, t);
          const text = p.record?.text || '', did = p.author.did, rkey = p.uri.split('/').pop();
          if (known.has(did + '/' + rkey)) continue;
          if (text.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length < 3) continue;
          known.add(did + '/' + rkey);
          out.push({ did, handle: p.author.handle, rkey, t, text });
        }
        cursor = d.cursor;
        if (!cursor || oldest < newest - OVERLAP_S) break;
      }
      return out.sort((a, b) => a.t - b.t);
    };
    // Embed new posts on the GPU and quantize them into the index after the last row.
    const addNew = async () => {
      let posts = await fetchNew();
      const room = docs.capacity - corpus.posts.length;
      if (posts.length > room) posts = posts.slice(posts.length - room);   // keep the newest that fit
      if (!posts.length) return 0;
      const V = await embedMany(posts.map((p) => p.text));
      const buf = device.createBuffer({ size: V.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
      device.queue.writeBuffer(buf, 0, V);
      tail.encode(buf, posts.length, docs, corpus.posts.length);
      await device.queue.onSubmittedWorkDone();
      buf.destroy();
      for (const p of posts) {
        let a = authorIdx.get(p.did);
        if (a === undefined) { a = corpus.authors.length; corpus.authors.push([p.handle, p.did]); authorIdx.set(p.did, a); }
        corpus.authors[a][0] = p.handle;
        corpus.posts.push([a, p.rkey, p.t]);
        corpus.texts.push(p.text);
        newest = Math.max(newest, p.t);
      }
      retrieval.live += posts.length;
      return posts.length;
    };
    retrieval = { search, embedMany, addNew, d: idx.d, live: 0, snapshot: idx,
      get n() { return corpus.posts.length; }, get newest() { return newest; } };
    return retrieval;
  })().finally(() => { loading = null; });
}

// RemexTail scans 2-bit codes (four centroids, three boundaries). A 1-bit snapshot runs on it unchanged: each
// 1-bit code b becomes the 2-bit index 3b, and the centroid table maps indices 0-1 to the negative 1-bit centroid
// and 2-3 to the positive one, so the scan computes exactly the 1-bit score. All three boundaries sit at the
// 1-bit boundary, so posts encoded live on the GPU get indices 0 or 3 the same way. The constants come from the
// snapshot header, written by the builder from remex itself.
function scanConstants(idx, params) {
  if ((idx.bits ?? 2) === 2) {
    return { boundaries: idx.boundaries ?? params.boundaries, centroids: idx.centroids ?? params.centroids, kappa: idx.kappa ?? params.kappa };
  }
  const [lo, hi] = idx.centroids, b = idx.boundaries[0];
  return { boundaries: [b, b, b], centroids: [lo, lo, hi, hi], kappa: idx.kappa };
}
// remex packs MSB first: a 1-bit byte holds 8 codes, a 2-bit byte 4. Each 1-bit nibble becomes one 2-bit byte.
const WIDEN = Uint8Array.from({ length: 16 }, (_, n) =>
  [0, 1, 2, 3].reduce((o, j) => o | (((n >> (3 - j)) & 1) * 3) << (6 - 2 * j), 0));
function widen1to2(buf) {
  const a = new Uint8Array(buf), out = new Uint8Array(a.length * 2);
  for (let i = 0; i < a.length; i++) { out[2 * i] = WIDEN[a[i] >> 4]; out[2 * i + 1] = WIDEN[a[i] & 15]; }
  return out;
}

// The snapshot to search: one file, snapshot.bin (b"ASNP", uint32 header length, JSON header, then the codes,
// aux and posts sections the header locates), so a CDN can never pair parts of two builds; raw.githubusercontent.com
// ignores query strings and caches each file for up to five minutes. A cached snapshot is kept until it is
// KEEP_S old: the list feed can fill in about a week of newer posts, but each one has to be embedded here, so two
// days (~3,000 posts) bounds that work while a daily visitor downloads the snapshot every other day.
const KEEP_S = 2 * 86400;
function parseSnapshot(buf) {
  const u8 = new Uint8Array(buf);
  if (String.fromCharCode(...u8.subarray(0, 4)) !== 'ASNP') throw new Error('not an answer-search snapshot');
  const hl = new DataView(buf).getUint32(4, true);
  const idx = JSON.parse(new TextDecoder().decode(u8.subarray(8, 8 + hl)));
  const sec = (k) => buf.slice(8 + hl + idx.sections[k][0], 8 + hl + idx.sections[k][0] + idx.sections[k][1]);
  const codes = sec('codes'), aux = sec('aux');
  if (codes.byteLength !== idx.n * 96 * (idx.bits ?? 2) || aux.byteLength !== idx.n * 8) throw new Error('snapshot sections do not match its header');
  return { idx, codes, aux, gz: sec('posts') };
}
async function loadSnapshot() {
  let cache = null;
  try { cache = await caches.open(CACHE); caches.delete('answer-search-v1'); } catch (e) { /* private mode */ }
  const key = SNAP + 'snapshot.bin';
  let buf = null;
  try {
    const hit = cache && await cache.match(key);
    if (hit) {
      const b = await hit.arrayBuffer();
      if (Date.now() / 1000 - parseSnapshot(b).idx.newest.t < KEEP_S) buf = b;
    }
  } catch (e) { /* a broken entry: download */ }
  if (!buf) {
    const r = await fetch(key, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`index snapshot: HTTP ${r.status}`);
    const len = +r.headers.get('content-length');
    if (len) TOTAL_BYTES = 12.5e6 + len;
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
    buf = out.buffer;
    parseSnapshot(buf);   // throws before a bad download is cached
    if (cache) { try { await cache.put(key, new Response(out)); } catch (e) { /* quota */ } }
  }
  const { idx, codes, aux, gz } = parseSnapshot(buf);
  const corpus = await gunzipJson(gz);
  if (corpus.posts.length !== idx.n || corpus.texts.length !== idx.n) throw new Error('snapshot posts do not match its header');
  return { idx, codes, aux, corpus };
}

const ago = (t) => {
  const s = Date.now() / 1000 - t;
  return s < 90 ? 'just now' : s < 5400 ? `${Math.round(s / 60)} min ago` : s < 129600 ? `${Math.round(s / 3600)} h ago` : `${Math.round(s / 86400)} days ago`;
};
function liveStatus() {
  const r = retrieval;
  const span = Math.round((r.newest - r.snapshot.oldest_t) / 86400);
  status(`${r.n.toLocaleString()} posts from the last ${span} days, newest ${ago(r.newest)}; ` +
    `${r.live.toLocaleString()} added live since the ${r.snapshot.built.slice(0, 10)} snapshot.`, 1);
}

let polling = null;
async function catchUp() {
  try { await retrieval.addNew(); liveStatus(); } catch (e) { console.warn('live update failed', e); }
}
function startPolling() {
  if (polling) return;
  polling = setInterval(() => { if (document.visibilityState === 'visible' && !busy) catchUp(); }, POLL_MS);
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
    status('catching up with posts written since the snapshot…', 1);
    await catchUp();
    window.answers.loadMs = now() - t0;
    $('load').style.display = 'none';
    startPolling();
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

// Every sentence of the retrieved posts, scored by cosine with the query; the best one from each post, best
// first, `count` of them. Sentence vectors are kept per post, so the next keystroke's search, which mostly finds
// the same posts, embeds only the posts it has not seen.
const sentCache = new Map();          // post row -> { sents, V }
const SENT_CACHE_MAX = 4000;
async function extract(posts, qv, count) {
  const t0 = now(), d = retrieval.d;
  const todo = posts.filter((p) => !sentCache.has(p.i));
  const texts = [], owner = [];
  for (const p of todo) for (const s of sentences(p.text)) { texts.push(s); owner.push(p.i); }
  const V = texts.length ? await retrieval.embedMany(texts) : new Float32Array(0);
  for (const p of todo) sentCache.set(p.i, { sents: [], V: [] });
  texts.forEach((s, j) => { const e = sentCache.get(owner[j]); e.sents.push(s); e.V.push(V.subarray(j * d, (j + 1) * d)); });
  while (sentCache.size > SENT_CACHE_MAX) sentCache.delete(sentCache.keys().next().value);
  const cands = [];
  for (const p of posts) {
    const e = sentCache.get(p.i);
    e.sents.forEach((s, j) => {
      const v = e.V[j];
      let dot = 0;
      for (let k = 0; k < d; k++) dot += v[k] * qv[k];
      cands.push({ post: p, s, score: dot });
    });
  }
  cands.sort((a, b) => b.score - a.score);
  const seen = new Set(), picks = [];
  for (const c of cands) {
    if (seen.has(c.post.i)) continue;
    seen.add(c.post.i); picks.push(c);
    if (picks.length === count) break;
  }
  return { picks, n: cands.length, embedded: texts.length, ms: now() - t0 };
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

const dateOf = (p) => p.t ? new Date(p.t * 1000).toISOString().slice(0, 10) : tidDate(p.rkey);
function renderPicks(el, picks) {
  if (!picks.length) { el.innerHTML = '<p><em>No sentences to quote in the posts found.</em></p>'; return; }
  el.innerHTML = '<ol class="picks">' + picks.map((c) =>
    `<li><blockquote>${esc(c.s)}</blockquote><div class="pmeta"><a href="${esc(postUrl(c.post))}" target="_blank" rel="noopener">@${esc(c.post.handle)}</a>` +
    `<span>${dateOf(c.post)}</span><button class="chip" data-n="${c.post.rank}" title="show the whole post">post ${c.post.rank}</button>` +
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
    const when = document.createElement('span'); when.textContent = dateOf(p);
    const sc = document.createElement('span'); sc.textContent = 'score ' + p.score.toFixed(3);
    meta.append(num, who, when, sc);
    if (used.has(p.rank)) { const u = document.createElement('span'); u.className = 'cited'; u.textContent = 'quoted above'; meta.append(u); }
    const tx = document.createElement('div'); tx.className = 'ptext'; tx.textContent = p.text;
    li.append(meta, tx);
    ol.append(li);
  }
}

// ---------------------------------------------------------------- searching as you type

// One result area, replaced by each search; nothing is kept. Typing searches at once when a word ends (space
// or punctuation) and otherwise after a 300 ms pause; only the newest pending query runs, and a search whose
// query has been overtaken stops before ranking sentences.
let busy = false, queued = null, shown = null, typingTimer = null;
function run(text) {
  text = text.trim();
  const u = new URL(location.href);
  if (text) u.searchParams.set('q', text); else u.searchParams.delete('q');
  history.replaceState(null, '', u);
  if (!text) { $('log').textContent = ''; shown = null; $('examples').hidden = false; return; }
  queued = text;
  if (!busy) drain();
}
async function drain() {
  busy = true;
  try {
    while (queued !== null) {
      const text = queued;
      queued = null;
      if (text !== shown) await search(text);
    }
  } finally { busy = false; }
}

async function search(text) {
  $('examples').hidden = true;
  if (!retrieval) $('log').innerHTML = '<div class="turn"><p class="cursor">loading the index…</p></div>';
  try {
    await load();
    if (queued !== null) return;                     // overtaken while loading
    const r = await retrieval.search(text, settings.posts);
    if (queued !== null) return;
    const x = await extract(r.posts, r.qv, settings.sentences);
    if (queued !== null) return;
    const card = document.createElement('article');
    card.className = 'turn';
    card.innerHTML = `<div class="extract"></div><div class="stats"></div>
      <details class="posts"><summary></summary><ol></ol></details>`;
    renderPicks(card.querySelector('.extract'), x.picks);
    renderPosts(card.querySelector('details.posts ol'), r.posts, new Set(x.picks.map((c) => c.post.rank)));
    card.querySelector('details.posts summary').textContent = `${r.posts.length} posts found among ${retrieval.n.toLocaleString()}`;
    card.querySelector('.stats').innerHTML = `<span>search: embed ${r.embedMs.toFixed(0)} ms, scan ${r.scanMs.toFixed(0)} ms</span>` +
      `<span>· sentences: ${x.embedded} new of ${x.n}, ${x.ms.toFixed(0)} ms</span>`;
    $('log').replaceChildren(card);
    shown = text;
    window.answers.last = { query: text, posts: r.posts, picks: x.picks };
  } catch (e) {
    console.error(e);
    $('log').innerHTML = `<div class="turn"><p class="bad">${esc(e.message || String(e))}</p></div>`;
  }
}

// ---------------------------------------------------------------- wiring

for (const [id, key] of [['posts', 'posts'], ['sents', 'sentences']]) {
  $(id).value = settings[key];
  $(id + 'V').textContent = settings[key];
  $(id).oninput = () => { settings[key] = +$(id).value; $(id + 'V').textContent = settings[key]; save(); shown = null; run($('q').value); };
}
$('q').addEventListener('input', (e) => {
  clearTimeout(typingTimer);
  const v = $('q').value;
  if (e.data && /[\s\p{P}]/u.test(e.data)) run(v);
  else typingTimer = setTimeout(() => run(v), 300);
});
$('q').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { clearTimeout(typingTimer); shown = null; run($('q').value); } });
$('load').onclick = () => load().catch(() => {});
$('clearCache').onclick = async () => {
  let a = false; try { a = await caches.delete(CACHE); } catch (e) { /* none */ }
  status(a ? 'Cached files deleted.' : 'Nothing cached.');
};
$('log').addEventListener('click', (e) => {
  const b = e.target.closest('button.chip');
  if (!b) return;
  const li = b.closest('.turn').querySelector(`details.posts ol > li[data-n="${b.dataset.n}"]`);
  if (!li) return;
  li.closest('details').open = true;
  li.scrollIntoView({ block: 'center', behavior: 'smooth' });
  li.classList.remove('flash'); void li.offsetWidth; li.classList.add('flash');
});
for (const q of EXAMPLES) {
  const b = document.createElement('button');
  b.textContent = q;
  b.onclick = () => { $('q').value = q; clearTimeout(typingTimer); run(q); };
  $('examples').append(b);
}
window.answers = { run, sentences, get retrieval() { return retrieval; }, get busy() { return busy; }, sentCache };
if (Q.get('q')) { $('q').value = Q.get('q'); run(Q.get('q')); }
