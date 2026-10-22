// Three query embedders over one Bluesky corpus, side by side, runnable offline once cached.
//
// Ettin-17m and leaf-ir run on ../engine.js (hand-written WGSL) and search indexes of the posts they
// embedded themselves (index/<pkg>/, run/build_demo_index.py). The EG2 4-layer cut runs on
// eg2-wgsl-engine and searches the posts as full EG2 embedded them (embeddinggemma2-webgpu-tail
// web/bsky). All three indexes are remex 2-bit codes in the same layout, scanned by RemexTail on the
// GPU. Post texts come from data/corpus.json, so nothing asks Bluesky. "Make available offline"
// copies every file into the Cache API; sw.js serves them from there (cache first).
// onnxruntime-web is each model's fallback if its WGSL engine fails on this GPU.

// --- paths: published layout (ettin-native/run/publish_site.py) ---
import { RemexTail } from "./tail.js";
import { SmallEngine } from "./engine.js";
import { Eg2Engine } from "../image-search/engine.js";
const P = {
  tail: "tail.js", smallEngine: "engine.js", eg2Engine: "../image-search/engine.js",
  params: "../image-search/params.json", corpus: "data/corpus.json.gz",
  ettinModel: "models/ettin/", ettinIndex: "index/ettin/",
  leafModel: "models/leaf/", leafIndex: "index/leaf/",
  eg2Model: "../image-search/model/", eg2Index: "index/eg2/", codes: "codes.u8.bin", aux: "aux.f32.bin",
};
// --- end paths ---
const TOKENIZERS = "https://cdn.jsdelivr.net/npm/@huggingface/tokenizers@0.2.0/dist/tokenizers.mjs";
const ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
const CACHE = "ettin-demo-v1";
const K = 10, MAX_TOKENS = 128, D = 768;
const EG2_QUERY = "task: search result | query: ";
const EXAMPLES = ["claude coding agent costs", "do LLMs actually reason?", "copyright lawsuits against AI labs",
  "best local model for a laptop", "bluesky custom feeds", "why are data centers raising electricity bills"];

const MODELS = [
  { id: "ettin", name: "Ettin-17m", color: "var(--ettin)", kind: "small", dir: P.ettinModel,
    model: "model.onnx", index: P.ettinIndex, hit: 0.918, mb: 10.2, note: "int4 token table, own index" },
  { id: "leaf", name: "leaf-ir", color: "var(--leaf)", kind: "small", dir: P.leafModel,
    model: "model.onnx", index: P.leafIndex, hit: 0.942, mb: 16.1, note: "int4 token table, own index" },
  { id: "eg2", name: "EG2 4-layer cut", color: "var(--eg2)", kind: "eg2", dir: P.eg2Model,
    model: "model_t3w.onnx_data", index: P.eg2Index, hit: 0.907, mb: 22.7, note: "3-bit table, queries the full-EG2 index" },
];
const modelFiles = (m) => m.kind === "small"
  ? ["manifest.json", "meta.json", "tokenizer.json", "model.onnx"].map((f) => m.dir + f)
  : ["manifest.json", "tokenizer.json", "model_t3w.onnx", "model_t3w.onnx_data"].map((f) => m.dir + f);
const indexFiles = (m) => ["index.json", P.codes, P.aux].map((f) => m.index + f);
const ASSETS = [
  "./", "index.html", "demo.js", P.smallEngine, P.eg2Engine, P.tail, P.params, P.corpus, TOKENIZERS,
  ORT + "ort.wasm.min.mjs", ORT + "ort-wasm-simd-threaded.mjs", ORT + "ort-wasm-simd-threaded.wasm",
  ...MODELS.flatMap((m) => [...modelFiles(m), ...indexFiles(m)]),
];

const $ = (id) => document.getElementById(id);
// Form fields live in the query string too (q = search box, cold=net = the network cold-launch box), so the
// address bar is always a deep link to what is on screen. Not "net": sw.js sends ?net= requests to the network.
function setParam(k, v) {
  const u = new URL(location.href);
  if (v) u.searchParams.set(k, v); else u.searchParams.delete(k);
  if (u.href !== location.href) history.replaceState(null, "", u);
}
const now = () => performance.now();
const status = (t, bad = false) => { $("status").textContent = t; $("status").className = bad ? "bad" : ""; };
const abs = (u) => new URL(u, import.meta.url).href;
let device, corpus, Tok, params, lastQuery = "";
const state = window.demo = { models: {}, runs: [] };

// fetch from the offline cache (through sw.js) or, with net, from the network past every cache
async function get(url, net, as = "arrayBuffer") {
  const u = abs(url);
  const r = net ? await fetch(u + (u.includes("?") ? "&" : "?") + "net=" + Date.now(), { cache: "no-store" }) : await fetch(u);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r[as]();
}

// ---------------------------------------------------------------- models

const specials = new Map();
function cleanEg2(tj, text) {
  if (!specials.has(tj)) specials.set(tj, tj.added_tokens.filter((t) => t.special).map((t) => t.content).sort((a, b) => b.length - a.length));
  for (const sp of specials.get(tj)) if (text.includes(sp)) text = text.split(sp).join(" ");
  return text;
}

async function loadModel(m, net) {
  const t0 = now();
  const files = modelFiles(m);
  const small = m.kind === "small";
  const [manifest, meta, tj, ...bins] = small
    ? await Promise.all([get(files[0], net, "json"), get(files[1], net, "json"), get(files[2], net, "json"), get(files[3], net)])
    : await Promise.all([get(files[0], net, "json"), null, get(files[1], net, "json"), get(files[2], net), get(files[3], net)]);
  Tok ??= (await import(TOKENIZERS)).Tokenizer;
  const fetchMs = now() - t0;
  const bytes = bins.reduce((s, b) => s + b.byteLength, 0) + JSON.stringify(tj).length;
  const tok = new Tok(tj, {});
  let encode;
  if (m.kind === "small") {
    const qp = (meta.prompts || {}).query ?? "";
    encode = (text) => { const ids = tok.encode(qp + text).ids; return ids.length > MAX_TOKENS ? ids.slice(0, MAX_TOKENS - 1).concat(ids[ids.length - 1]) : ids; };
  } else {
    encode = (text) => tok.encode(EG2_QUERY + cleanEg2(tj, text)).ids.slice(0, MAX_TOKENS);
  }
  const t1 = now();
  const data = m.kind === "small" ? bins[0] : bins[1];
  try {
    if (new URLSearchParams(location.search).get("engine") === "ort") throw new Error("?engine=ort");
    const engine = m.kind === "small"
      ? await SmallEngine.create(device, manifest, data, { maxTokens: MAX_TOKENS, maxSeqs: 1 })
      : await Eg2Engine.create(device, manifest, data, { maxTokens: MAX_TOKENS, maxSeqs: 1 });
    return { m, encode, backend: "WebGPU engine", embed: (ids) => engine.embed([ids]), destroy: () => engine.destroy(), fetchMs, initMs: now() - t1, bytes };
  } catch (e) {
    console.warn(`${m.name}: WGSL engine failed, using onnxruntime-web`, e);
    const ort = await import(ORT + "ort.wasm.min.mjs");
    ort.env.wasm.wasmPaths = abs(ORT);
    ort.env.wasm.numThreads = 1;
    const session = m.kind === "small"
      ? await ort.InferenceSession.create(new Uint8Array(bins[0]), { executionProviders: ["wasm"], graphOptimizationLevel: "all" })
      : await ort.InferenceSession.create(new Uint8Array(bins[0]), { executionProviders: ["wasm"],
          externalData: [{ path: "model_t3w.onnx_data", data: new Uint8Array(bins[1]) }] });
    const out = session.outputNames.includes("sentence_embedding") ? "sentence_embedding" : session.outputNames[0];
    const embed = async (ids) => {
      const S = ids.length;
      const r = await session.run({ input_ids: new ort.Tensor("int64", BigInt64Array.from(ids, BigInt), [1, S]),
                                    attention_mask: new ort.Tensor("int64", new BigInt64Array(S).fill(1n), [1, S]) });
      const v = Float32Array.from(r[out].data);
      let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n);
      return v.map((x) => x / n);
    };
    return { m, encode, backend: "onnxruntime-web (fallback)", embed, destroy: () => session.release(), fetchMs, initMs: now() - t1, bytes };
  }
}

// corpus.json, or corpus.json.gz (gzip bytes, decompressed here; a server that already sent it with
// Content-Encoding: gzip hands fetch plain JSON, which is detected by the missing gzip magic bytes)
async function loadCorpus() {
  const buf = new Uint8Array(await get(P.corpus, false));
  if (buf[0] !== 0x1f || buf[1] !== 0x8b) return JSON.parse(new TextDecoder().decode(buf));
  const ds = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"));
  return JSON.parse(await new Response(ds).text());
}

// ---------------------------------------------------------------- indexes

async function loadIndex(m) {
  const files = indexFiles(m);
  const [idx, codes, aux] = await Promise.all([get(files[0], false, "json"), get(files[1], false), get(files[2], false)]);
  const tail = await RemexTail.create(device, { rht: params.rht, mu: new Float32Array(idx.mu), boundaries: params.boundaries,
                                                centroids: params.centroids, kappa: params.kappa });
  const c = tail.allocCorpus(idx.n);
  tail.loadCodes(c, new Uint8Array(codes), new Float32Array(aux), 0);
  const qbuf = device.createBuffer({ size: D * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  return { tail, corpus: c, n: idx.n, qbuf, bytes: codes.byteLength + aux.byteLength };
}

// ---------------------------------------------------------------- search

async function runModel(m, text, cold = null) {
  const s = state.models[m.id];
  const t = {};
  if (!s.model || cold) {
    if (s.model) { s.model.destroy(); s.model = null; }
    const t0 = now();
    s.model = await loadModel(m, cold === "net");
    t.cold = { from: cold === "net" ? "network" : "offline cache", fetchMs: s.model.fetchMs, initMs: s.model.initMs, mb: s.model.bytes / 1e6 };
    t.coldStart = t0;
  }
  const ids = s.model.encode(text);
  let t1 = now();
  const v = await s.model.embed(ids);
  t.embedMs = now() - t1;
  device.queue.writeBuffer(s.index.qbuf, 0, v);
  t1 = now();
  const [top] = await s.index.tail.topk(s.index.qbuf, 1, s.index.corpus, s.index.n, K);
  t.scanMs = now() - t1;
  if (t.cold) t.cold.totalMs = now() - t.coldStart;
  s.last = { idx: Array.from(top.idx), score: Array.from(top.score), t, backend: s.model.backend, tokens: ids.length };
  return s.last;
}

async function search(text, cold = null, only = null, fromBox = false) {
  text = text.trim();
  if (!text) return;
  lastQuery = text;
  if (!fromBox) $("q").value = text; // never rewrite the box while someone is typing in it
  setParam("q", text);
  setBusy(true);
  try {
    for (const m of MODELS) {
      if (only && m.id !== only) continue;
      status(`${state.models[m.id].model && !cold ? "embedding" : "loading"} with ${m.name}…`);
      await runModel(m, text, cold);
      renderCol(m);
    }
    renderShared();
    status(`"${text}": done.`);
    state.runs.push({ q: text, cold, results: Object.fromEntries(MODELS.map((m) => [m.id, state.models[m.id].last])) });
    shown = text;
  } catch (e) {
    console.error(e);
    const offline = cold === "net" && (e instanceof TypeError || !navigator.onLine);
    status(offline ? "Cold launch from the network needs a connection. Untick it to cold-launch from the offline cache."
                   : String(e.message || e), true);
  } finally {
    setBusy(false);
  }
}

// Search as you type (as bsky/image-search does): at once when a word ends (space or punctuation),
// else after 300 ms without typing. Only the newest pending query runs; one already shown is skipped.
let typingTimer, queued = null, busy = false, shown = null;
function run(text) {
  text = text.trim();
  if (!text) return;
  setParam("q", text);
  queued = text;
  if (!busy) drain();
}
async function drain() {
  busy = true;
  while (queued !== null) {
    const text = queued;
    queued = null;
    if (text !== shown) await search(text, null, null, true);
  }
  busy = false;
}

// ---------------------------------------------------------------- rendering

const B32 = "234567abcdefghijklmnopqrstuvwxyz";
function tidDate(rkey) { // Bluesky record keys are TIDs: microseconds since the epoch above a 10-bit clock id, base32-sortable
  if (!/^[2-7a-z]{13}$/.test(rkey)) return "";
  let v = 0n;
  for (const ch of rkey) v = v * 32n + BigInt(B32.indexOf(ch));
  return new Date(Number((v >> 10n) / 1000n)).toISOString().slice(0, 10);
}

function fmt(t, m) {
  const lines = [];
  if (t.cold) lines.push(`cold launch (${t.cold.from}): ${t.cold.totalMs.toFixed(0)} ms to results`,
    `  read ${t.cold.mb.toFixed(1)} MB ${t.cold.fetchMs.toFixed(0)} ms · engine ${t.cold.initMs.toFixed(0)} ms`);
  // a real first visit also downloads the model: its brotli size over a typical connection
  if (t.cold) lines.push(`  first visit adds the ${m.mb} MB download: ~${(m.mb * 8 / 50).toFixed(1)} s at 50 Mbps, ~${(m.mb * 8 / 10).toFixed(0)} s at 10`);
  lines.push(`query: embed ${t.embedMs.toFixed(1)} ms · scan ${t.scanMs.toFixed(1)} ms`);
  return lines.join("\n");
}

function renderCol(m) {
  const s = state.models[m.id], col = $("col-" + m.id);
  col.querySelector(".backend").textContent = `${s.last.backend}, ${s.last.tokens} tokens`;
  col.querySelector(".timing").textContent = fmt(s.last.t, m);
  const ol = col.querySelector("ol");
  ol.textContent = "";
  s.last.idx.forEach((i, j) => {
    const [a, rkey] = corpus.posts[i];
    const [handle] = corpus.authors[a];
    const li = document.createElement("li");
    li.dataset.idx = i;
    const meta = document.createElement("div");
    meta.className = "meta";
    const who = document.createElement("a");
    who.href = `https://bsky.app/profile/${handle}/post/${rkey}`;
    who.target = "_blank";
    who.rel = "noopener";
    who.textContent = "@" + handle;
    const when = document.createElement("span");
    when.textContent = tidDate(rkey);
    const sc = document.createElement("span");
    sc.textContent = s.last.score[j].toFixed(3);
    const sh = document.createElement("span");
    sh.className = "shared";
    sh.hidden = true;
    meta.append(who, when, sc, sh);
    const tx = document.createElement("div");
    tx.className = "text";
    tx.textContent = corpus.texts[i];
    li.append(meta, tx);
    ol.append(li);
  });
}

function renderShared() {
  const tops = Object.fromEntries(MODELS.map((m) => [m.id, new Set(state.models[m.id].last?.idx ?? [])]));
  for (const m of MODELS) {
    for (const li of $("col-" + m.id).querySelectorAll("li")) {
      const i = +li.dataset.idx;
      const also = MODELS.filter((o) => o.id !== m.id && tops[o.id].has(i)).map((o) => o.name.split(" ")[0]);
      const sh = li.querySelector(".shared");
      sh.hidden = !also.length;
      sh.textContent = also.length === 2 ? "in all three" : "also " + also.join(", ");
    }
  }
  const ov = (a, b) => [...tops[a]].filter((i) => tops[b].has(i)).length;
  $("agree").textContent = `Top-10 overlap: Ettin–leaf-ir ${ov("ettin", "leaf")}/10 · Ettin–EG2 cut ${ov("ettin", "eg2")}/10 · leaf-ir–EG2 cut ${ov("leaf", "eg2")}/10`;
}

function buildGrid() {
  for (const m of MODELS) {
    const col = document.createElement("section");
    col.className = "col";
    col.id = "col-" + m.id;
    col.innerHTML = `<h2><span class="dot" style="background:${m.color}"></span>${m.name}</h2>
      <div class="facts">hit@10 ${m.hit.toFixed(3)} · ${m.mb} MB download · ${m.note}</div>
      <div class="facts backend">not loaded</div>
      <button class="cold">Cold launch</button>
      <div class="timing">loads on the first query</div><ol></ol>`;
    col.querySelector(".cold").onclick = () => search(lastQuery || EXAMPLES[0], $("fromNet").checked ? "net" : "cache", m.id);
    $("grid").append(col);
  }
}

function setBusy(b) {
  for (const el of document.querySelectorAll("button.cold, #coldAll, #go")) el.disabled = b;
}

// ---------------------------------------------------------------- offline cache

async function cacheStatus() {
  if (!("caches" in window)) { $("offline").textContent = "offline cache: not available here"; return false; }
  const c = await caches.open(CACHE);
  let have = 0;
  for (const u of ASSETS) if (await c.match(abs(u))) have++;
  const ready = have === ASSETS.length && !!navigator.serviceWorker?.controller;
  $("offline").textContent = ready ? "available offline ✓" : `offline cache: ${have}/${ASSETS.length} files` +
    (navigator.serviceWorker?.controller ? "" : " (reload once to let the service worker take over)");
  $("offline").className = "offline" + (ready ? " ready" : "");
  return ready;
}

async function makeOffline() {
  $("cache").disabled = true;
  const c = await caches.open(CACHE);
  let done = 0, bytes = 0;
  for (const u of ASSETS) {
    // past sw.js (which would answer from this very cache) to the network, stored under the plain URL
    const r = await fetch(abs(u) + (abs(u).includes("?") ? "&" : "?") + "net=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error(`${u}: HTTP ${r.status}`);
    const b = await r.clone().arrayBuffer();
    bytes += b.byteLength;
    await c.put(abs(u), r);
    $("offline").textContent = `caching ${++done}/${ASSETS.length} files, ${(bytes / 1e6).toFixed(0)} MB…`;
  }
  $("cache").disabled = false;
  await cacheStatus();
}

// ---------------------------------------------------------------- start

async function start() {
  buildGrid();
  for (const ex of EXAMPLES) {
    const b = document.createElement("span");
    b.className = "chip";
    b.textContent = ex;
    b.onclick = () => { clearTimeout(typingTimer); $("q").value = ex; run(ex); };
    $("examples").append(b);
  }
  if ("serviceWorker" in navigator) {
    try { await navigator.serviceWorker.register("sw.js"); } catch (e) { console.warn("service worker:", e); }
  }
  $("cache").onclick = () => makeOffline().catch((e) => status("caching failed: " + e.message, true));
  const qs = new URLSearchParams(location.search);
  $("q").value = qs.get("q") ?? "";
  $("fromNet").checked = qs.get("cold") === "net";
  $("q").oninput = (e) => {
    clearTimeout(typingTimer);
    const v = $("q").value;
    setParam("q", v.trim());
    if ($("q").disabled) return; // still loading: ?q= runs once ready
    if (e.data && /[\s\p{P}]/u.test(e.data)) run(v);
    else typingTimer = setTimeout(() => run(v), 300);
  };
  $("fromNet").onchange = () => setParam("cold", $("fromNet").checked ? "net" : null);
  cacheStatus();
  const adapter = await navigator.gpu?.requestAdapter({ powerPreference: "high-performance" });
  if (!adapter) { status("This page needs WebGPU (Chrome, Edge, or Safari 26+): the scan runs on the GPU.", true); return; }
  device = await adapter.requestDevice({ requiredLimits: {
    maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize, maxBufferSize: adapter.limits.maxBufferSize } });
  status("loading the corpus and the three indexes…");
  const t0 = now();
  [corpus, params] = await Promise.all([loadCorpus(), get(P.params, false, "json")]);
  for (const m of MODELS) state.models[m.id] = { index: await loadIndex(m) };
  await device.queue.onSubmittedWorkDone();
  const mb = MODELS.reduce((s, m) => s + state.models[m.id].index.bytes, 0) / 1e6;
  status(`Ready: ${corpus.posts.length.toLocaleString()} posts, three indexes (${mb.toFixed(0)} MB) on the GPU in ${(now() - t0).toFixed(0)} ms. ` +
         "Each model loads on its first query.");
  for (const el of [$("q"), $("go"), $("coldAll")]) el.disabled = false;
  for (const el of document.querySelectorAll("button.cold")) el.disabled = false;
  $("go").onclick = () => { clearTimeout(typingTimer); run($("q").value); };
  $("q").onkeydown = (e) => { if (e.key === "Enter") { clearTimeout(typingTimer); run($("q").value); } };
  $("coldAll").onclick = () => search(lastQuery || EXAMPLES[0], $("fromNet").checked ? "net" : "cache");
  const q = new URLSearchParams(location.search).get("q");
  if (q) run(q);
}

start().catch((e) => { console.error(e); status(String(e.message || e), true); });
