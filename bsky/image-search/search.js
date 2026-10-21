// Bluesky image search, entirely in the page. The index (built by oaustegard/experiments bsky-image-search/run/build_index.py:
// EG2 q4 image embeddings -> remex 2-bit codes, 192 B per image) loads into a WebGPU device and is
// scanned by RemexTail (tail.js, vendored). Queries are embedded in this browser too, into the same
// EG2 query space the image vectors live in:
//   cut   default: EG2's first 4 layers, distilled onto EG2's query vectors, 32K vocabulary, 3-bit token
//         table (oaustegard/experiments eg2-layer-student, release eg2-layer-onnx-20261021), ~25 MB,
//         run by engine.js, hand-written WGSL kernels on the index's device (oaustegard/experiments
//         eg2-wgsl-engine), reading model_t3w.onnx_data through model/manifest.json; onnxruntime-web
//         on the same file is the fallback (?engine=ort forces it)
//   full  EG2 text-only q4 via transformers.js (~175 MB once, then cached); closer to the vectors that
//         built the index, so better results. ?model=full or the link under the results.
// No request leaves the page except for these files and the image thumbnails.
import { RemexTail } from "./tail.js";
import { Eg2Engine } from "./engine.js";

const D = 768, K = 36;
const QUERY = "task: search result | query: ";
const ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
const TOKENIZERS = "https://cdn.jsdelivr.net/npm/@huggingface/tokenizers@0.2.0/dist/tokenizers.min.mjs";
const CUT = new URL("./model/", import.meta.url), CUT_FILE = "model_t3w.onnx", MAX_TOKENS = 128;
const P = new URLSearchParams(location.search);
const INDEX = P.get("index") || "./data/";
const EXAMPLES = ["a cat asleep in a sunbeam", "foggy mountains at dawn", "watercolor of a city street", "a bird in the snow",
                  "neon signs at night", "moss on a tree trunk", "a dog at the beach", "an old film camera"];
const $ = (id) => document.getElementById(id);
const status = (t, bad = false) => { $("status").textContent = t; $("status").className = "status" + (bad ? " bad" : ""); };
let device, tail, corpus, rows, n, qbuf, cut = null, fullModel = null, useFull = P.get("model") === "full" || P.get("local") === "1";

async function start() {
  const t0 = performance.now();
  const base = P.get("index") ? new URL(INDEX, location.href) : new URL(INDEX, import.meta.url);
  const [index, codes, aux, list, params] = await Promise.all([
    fetch(new URL("index.json", base)).then((r) => r.json()),
    fetch(new URL("codes.u8.bin", base)).then((r) => r.arrayBuffer()),
    fetch(new URL("aux.f32.bin", base)).then((r) => r.arrayBuffer()),
    fetch(new URL("rows.json", base)).then((r) => r.json()),
    fetch(new URL("./params.json", import.meta.url)).then((r) => r.json()),
  ]);
  const adapter = await navigator.gpu?.requestAdapter({ powerPreference: "high-performance" });
  if (!adapter) throw new Error("This page needs WebGPU (Chrome, Edge or Safari 26+).");
  device = await adapter.requestDevice();
  tail = await RemexTail.create(device, { rht: params.rht, mu: new Float32Array(index.mu), boundaries: params.boundaries,
                                          centroids: params.centroids, kappa: params.kappa });
  n = index.n;
  rows = list.rows.map(([a, rkey, cid, likes]) => ({ did: list.authors[a][0], handle: list.authors[a][1], rkey, likes,
                                                    thumb: `https://cdn.bsky.app/img/feed_thumbnail/plain/${list.authors[a][0]}/${cid}` }));
  corpus = tail.allocCorpus(n);
  tail.loadCodes(corpus, new Uint8Array(codes), new Float32Array(aux), 0);
  await device.queue.onSubmittedWorkDone();
  qbuf = device.createBuffer({ size: D * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  const mb = (codes.byteLength + aux.byteLength) / 1e6;
  status(`${n.toLocaleString()} images ready (${mb.toFixed(1)} MB index) in ${((performance.now() - t0) / 1000).toFixed(1)} s`);
  $("method").textContent = `Index: ${n.toLocaleString()} images from popular Bluesky feeds, embedded with EmbeddingGemma 2 (q4) and ` +
    `compressed to 2-bit remex codes. Queries are embedded in this page into the same model's search space. Nothing is sent to a ` +
    `server; images load from Bluesky's CDN. `;
  const how = Object.assign(document.createElement("a"), { href: "https://github.com/oaustegard/oaustegard.github.io/blob/main/bsky/image-search_README.md", textContent: "How it works" });
  $("method").append(how, ".");
  $("q").disabled = $("go").disabled = false;
  $("q").placeholder = "Describe an image…";
  for (const ex of EXAMPLES) {
    const b = Object.assign(document.createElement("button"), { type: "button", textContent: ex });
    b.onclick = () => { $("q").value = ex; run(ex); };
    $("examples").append(b);
  }
  if (!useFull) loadCut().catch(() => {}); // start the download now; a query awaits the same promise
  showModel();
  const q = P.get("q")?.trim(); // ?q= runs a shared query on load
  if (q) { $("q").value = q; run(q); }
}

// Text with literal special-token strings ("<bos>", "<eos>", ...) would inject control tokens; the
// teacher replaced them with spaces before embedding, and the cut was trained the same way.
let specials = [];
const clean = (t) => specials.reduce((s, sp) => s.split(sp).join(" "), t);

function loadCut() {
  cut ??= (async () => {
    const [manifest, data, tj, { Tokenizer }] = await Promise.all([
      fetch(new URL("manifest.json", CUT)).then((r) => r.json()),
      fetch(new URL(CUT_FILE + "_data", CUT)).then((r) => r.arrayBuffer()),
      fetch(new URL("tokenizer.json", CUT)).then((r) => r.json()), import(TOKENIZERS)]);
    specials = tj.added_tokens.filter((t) => t.special).map((t) => t.content).sort((a, b) => b.length - a.length);
    const tokenizer = new Tokenizer(tj, {});
    try { // the WGSL engine on the index's own device; the query vector never leaves the GPU
      if (P.get("engine") === "ort") throw new Error("?engine=ort");
      return { tokenizer, engine: await Eg2Engine.create(device, manifest, data, { maxTokens: MAX_TOKENS, maxSeqs: 1 }) };
    } catch (e) { // same weights file, run by onnxruntime-web instead
      console.warn("WGSL engine failed, using onnxruntime-web:", e);
      const [ort, graph] = await Promise.all([import(ORT + "ort.webgpu.min.mjs"),
                                              fetch(new URL(CUT_FILE, CUT)).then((r) => r.arrayBuffer())]);
      ort.env.wasm.wasmPaths = ORT;
      const session = await ort.InferenceSession.create(new Uint8Array(graph), {
        executionProviders: ["webgpu", "wasm"], externalData: [{ path: CUT_FILE + "_data", data: new Uint8Array(data) }] });
      return { tokenizer, ort, session };
    }
  })();
  cut.catch(() => { cut = null; });
  return cut;
}

// Embeds into qbuf, the GPU buffer the scan reads.
async function embedCut(text) {
  if (!cut) status("loading the 25 MB query model…");
  const { tokenizer, engine, ort, session } = await loadCut();
  const ids = tokenizer.encode(QUERY + clean(text)).ids.slice(0, MAX_TOKENS);
  if (engine) return engine.embedTo([ids], qbuf);
  const shape = [1, ids.length];
  const out = await session.run({
    input_ids: new ort.Tensor("int64", BigInt64Array.from(ids, BigInt), shape),
    attention_mask: new ort.Tensor("int64", new BigInt64Array(ids.length).fill(1n), shape) });
  device.queue.writeBuffer(qbuf, 0, new Float32Array(out.embedding.data)); // mean-pooled and L2-normalized in the graph
}

async function embedFull(text) {
  if (!fullModel) {
    status("loading EmbeddingGemma 2's text model in this browser (~175 MB the first time)…");
    const T = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1");
    const id = "onnx-community/embeddinggemma-2-ONNX";
    const config = await T.AutoConfig.from_pretrained(id);
    config.vision_config = config.audio_config = null; // text only: skip the image and audio encoders
    fullModel = { processor: await T.AutoProcessor.from_pretrained(id),
                  model: await T.AutoModel.from_pretrained(id, { config, device: "webgpu", dtype: "q4" }) };
  }
  const out = await fullModel.model(await fullModel.processor([QUERY + text]));
  device.queue.writeBuffer(qbuf, 0, new Float32Array(out.sentence_embedding.data));
}

async function embed(text) {
  if (useFull) { await embedFull(text); return "full EmbeddingGemma 2"; }
  await embedCut(text);
  return (await cut).engine ? "4-layer query model, WGSL engine" : "4-layer query model, onnxruntime-web";
}

// One line under the results that says which query model runs and switches to the other.
function showModel() {
  const el = $("model");
  const a = Object.assign(document.createElement("a"), { href: "#" });
  if (useFull) {
    el.textContent = "Queries: full EmbeddingGemma 2 (about 175 MB the first time). ";
    a.textContent = "Use the 25 MB query model";
  } else {
    el.textContent = "Queries: a 25 MB, 4-layer cut of EmbeddingGemma 2, run in this page. ";
    a.textContent = "Better results: load the full model (about 175 MB)";
  }
  a.onclick = (e) => {
    e.preventDefault();
    useFull = !useFull;
    const u = new URL(location.href);
    u.searchParams.delete("local");
    useFull ? u.searchParams.set("model", "full") : u.searchParams.delete("model");
    history.replaceState(null, "", u);
    showModel();
    shown = null; // same text, other model: search again
    if ($("q").value.trim()) run($("q").value);
  };
  el.append(a, ".");
}

// Searches run one at a time, newest text wins: typing while a search is in flight only replaces
// the queued text, so the grid follows the box without a backlog of stale queries.
let busy = false, queued = null, shown = null;

function run(text) {
  text = text.trim();
  if (!text) return;
  const u = new URL(location.href); // keep ?q= in step with the box, so the URL shares the search
  if (u.searchParams.get("q") !== text) { u.searchParams.set("q", text); history.replaceState(null, "", u); }
  queued = text;
  if (!busy) drain();
}

async function drain() {
  busy = true;
  while (queued !== null) {
    const text = queued;
    queued = null;
    if (text !== shown) await search(text);
  }
  busy = false;
}

async function search(text) {
  status("searching…");
  try {
    const t0 = performance.now();
    const how = await embed(text);
    const t1 = performance.now();
    const [top] = await tail.topk(qbuf, 1, corpus, n, K);
    const t2 = performance.now();
    render(Array.from(top.idx), Array.from(top.score));
    shown = text;
    status(`query embedded in ${(t1 - t0).toFixed(0)} ms (${how}); ${n.toLocaleString()} images scanned in ${(t2 - t1).toFixed(0)} ms`);
  } catch (e) { status(String(e.message || e), true); }
}

// Search as you type: at once when a word ends (space or punctuation), else after a short pause.
let typingTimer;
$("q").addEventListener("input", (e) => {
  clearTimeout(typingTimer);
  const v = $("q").value;
  if (e.data && /[\s\p{P}]/u.test(e.data)) run(v);
  else typingTimer = setTimeout(() => run(v), useFull ? 600 : 300);
});

function render(idx, score) {
  $("grid").replaceChildren(...idx.map((i, j) => {
    const r = rows[i];
    const post = `https://bsky.app/profile/${r.did}/post/${r.rkey}`;
    const tile = document.createElement("div");
    tile.className = "tile";
    const a = Object.assign(document.createElement("a"), { className: "img", href: post, target: "_blank", rel: "noopener" });
    a.append(Object.assign(document.createElement("img"), { src: r.thumb, loading: "lazy", alt: `Image ${j + 1} for this search, posted by @${r.handle}` }));
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.append(Object.assign(document.createElement("a"), { href: post, target: "_blank", rel: "noopener", textContent: "@" + r.handle }),
                Object.assign(document.createElement("span"), { textContent: `♥ ${r.likes.toLocaleString()}`, title: `score ${score[j].toFixed(3)}` }));
    tile.append(a, meta);
    return tile;
  }));
}

$("form").onsubmit = (e) => { e.preventDefault(); clearTimeout(typingTimer); run($("q").value); };
start().catch((e) => status(String(e.message || e), true));
