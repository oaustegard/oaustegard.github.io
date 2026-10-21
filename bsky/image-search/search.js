// Bluesky image search. The index (built by oaustegard/experiments bsky-image-search/run/build_index.py:
// EG2 q4 image embeddings -> remex 2-bit codes, 192 B per image) loads into a WebGPU device and is
// scanned by RemexTail (tail.js, vendored). Queries are embedded with EG2's text model and
// query prompt, the same q4 graph that built the image vectors' space:
//   hosted   the eg2-query-embedder Worker (no download; allowed origins only)
//   local    EG2 text-only q4 in this browser via transformers.js (~175 MB once, then cached)
// ?local=1 forces local. ?index=<dir> points at another index directory.
import { RemexTail } from "./tail.js";

const D = 768, K = 36;
const QUERY = "task: search result | query: ";
const EMBEDDER = "https://eg2-query-embedder.austegard.workers.dev/";
const P = new URLSearchParams(location.search);
const INDEX = P.get("index") || "./data/";
const EXAMPLES = ["a cat asleep in a sunbeam", "foggy mountains at dawn", "watercolor of a city street", "a bird in the snow",
                  "neon signs at night", "moss on a tree trunk", "a dog at the beach", "an old film camera"];
const $ = (id) => document.getElementById(id);
const status = (t, bad = false) => { $("status").textContent = t; $("status").className = "status" + (bad ? " bad" : ""); };
let device, tail, corpus, rows, n, qbuf, localModel = null, useLocal = P.get("local") === "1";

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
    `compressed to 2-bit remex codes. Queries use the same model's text side with its search prompt. Images load from Bluesky's CDN. `;
  const how = Object.assign(document.createElement("a"), { href: "https://github.com/oaustegard/oaustegard.github.io/blob/main/bsky/image-search_README.md", textContent: "How it works" });
  $("method").append(how, ".");
  $("q").disabled = $("go").disabled = false;
  $("q").placeholder = "Describe an image…";
  for (const ex of EXAMPLES) {
    const b = Object.assign(document.createElement("button"), { type: "button", textContent: ex });
    b.onclick = () => { $("q").value = ex; run(ex); };
    $("examples").append(b);
  }
  if (!useLocal) fetch(EMBEDDER + "warm", { method: "POST" }).catch(() => {});
}

async function embedLocal(text) {
  if (!localModel) {
    status("loading EmbeddingGemma 2's text model in this browser (~175 MB the first time)…");
    const T = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1");
    const id = "onnx-community/embeddinggemma-2-ONNX";
    const config = await T.AutoConfig.from_pretrained(id);
    config.vision_config = config.audio_config = null; // text only: skip the image and audio encoders
    localModel = { processor: await T.AutoProcessor.from_pretrained(id),
                   model: await T.AutoModel.from_pretrained(id, { config, device: "webgpu", dtype: "q4" }) };
  }
  const out = await localModel.model(await localModel.processor([QUERY + text]));
  return new Float32Array(out.sentence_embedding.data);
}

async function embed(text) {
  if (!useLocal) {
    try {
      const r = await fetch(EMBEDDER + "embed", { method: "POST", headers: { "content-type": "application/json" },
                                                 body: JSON.stringify({ text: text.slice(0, 256), dims: D }) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return { vec: new Float32Array((await r.json()).embedding), how: "hosted embedder" };
    } catch (e) { useLocal = true; }
  }
  return { vec: await embedLocal(text), how: "in-browser model" };
}

async function run(text) {
  text = text.trim();
  if (!text) return;
  $("go").disabled = true;
  status("searching…");
  try {
    const t0 = performance.now();
    const { vec, how } = await embed(text);
    const t1 = performance.now();
    device.queue.writeBuffer(qbuf, 0, vec);
    const [top] = await tail.topk(qbuf, 1, corpus, n, K);
    const t2 = performance.now();
    render(Array.from(top.idx), Array.from(top.score));
    status(`query embedded in ${(t1 - t0).toFixed(0)} ms (${how}); ${n.toLocaleString()} images scanned in ${(t2 - t1).toFixed(0)} ms`);
  } catch (e) { status(String(e.message || e), true); }
  $("go").disabled = false;
}

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

$("form").onsubmit = (e) => { e.preventDefault(); run($("q").value); };
start().catch((e) => status(String(e.message || e), true));
