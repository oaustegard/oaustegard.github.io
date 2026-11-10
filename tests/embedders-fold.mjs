// node tests/embedders-fold.mjs
// Ettin-17m with its 256 -> 768 head folded to 256 (bsky/embedders/engine.js foldHead and
// models/ettin/fold256.f32), run by the WGSL engine in headless Chromium on SwiftShader WebGPU.
// The folded outputs are the 768-dim outputs in an orthonormal basis of the head's span, so:
//   1. both widths give unit vectors, and every inner product between two sequences is the same;
//   2. List Scout's classifier (bsky/list-scout/topic.js) trained on either width scores posts the same;
//   3. fold256.f32 is the file fold256.json describes, built from this model.onnx;
//   4. List Scout's own loader (ensureEmbedder in bsky/list-scout/scout.js, reached by serving the
//      page's script with one line added that exposes it) returns 256-dim unit vectors for real posts,
//      with the inner products of a plain 768-dim engine fed the same prompt and truncation.
// Parts 1 to 3 use pseudo-random token ids and need no network. Part 4 loads the tokenizer the page
// loads, from jsDelivr, and is reported as skipped when that cannot be fetched. SwiftShader timings
// say nothing about a real GPU.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, join, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const ROOT = resolve(new URL("..", import.meta.url).pathname);
const MODEL = join(ROOT, "bsky/embedders/models/ettin");

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) { passes++; console.log("ok  ", msg); } else { fails++; console.log("FAIL", msg); } };

const sha = async (f) => createHash("sha256").update(await readFile(join(MODEL, f))).digest("hex");
const meta = JSON.parse(await readFile(join(MODEL, "fold256.json"), "utf8"));
ok(meta.sha256 === await sha("fold256.f32"), "fold256.f32 has the sha256 fold256.json records");
ok(meta.model_sha256 === await sha("model.onnx"), "fold256.json was built from this model.onnx");

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json" };
const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
    const body = await readFile(p);
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-webgpu", "--enable-features=Vulkan", "--use-angle=swiftshader", "--use-webgpu-adapter=swiftshader"] });
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(base + "/bsky/embedders/models/ettin/meta.json");

const r = await page.evaluate(async () => {
  const E = "/bsky/embedders/";
  const { SmallEngine, foldHead } = await import(E + "engine.js");
  const { trainLogistic, predict } = await import("/bsky/list-scout/topic.js");
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) return { error: "no WebGPU adapter" };
  const device = await adapter.requestDevice({ requiredLimits: {
    maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize, maxBufferSize: adapter.limits.maxBufferSize } });
  const gpuErrors = [];
  device.addEventListener("uncapturederror", (e) => gpuErrors.push(e.error.message));
  const [manifest, model, head] = await Promise.all([
    fetch(E + "models/ettin/manifest.json").then((x) => x.json()),
    fetch(E + "models/ettin/model.onnx").then((x) => x.arrayBuffer()),
    fetch(E + "models/ettin/fold256.f32").then((x) => x.arrayBuffer())]);

  // 64 sequences of 2 to 60 token ids; the first half draws from one band of the vocabulary and the
  // second half from another, so the two halves are separable and a classifier has something to learn.
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const N = 64, y = [];
  const seqs = Array.from({ length: N }, (_, i) => {
    const lo = i < N / 2 ? 2000 : 30000;
    y.push(i < N / 2 ? 1 : 0);
    return Array.from({ length: 2 + Math.floor(rnd() * 59) }, () => lo + Math.floor(rnd() * 4000));
  });
  const embedAll = async (eng) => {
    const out = new Float32Array(N * eng.dim);
    for (let s = 0; s < N; s += 16) out.set(await eng.embed(seqs.slice(s, s + 16)), s * eng.dim);
    return out;
  };
  const e768 = await SmallEngine.create(device, manifest, model, { maxTokens: 1024, maxSeqs: 16 });
  const X = await embedAll(e768);
  const [m256, bytes256] = foldHead(manifest, model, head);
  const e256 = await SmallEngine.create(device, m256, bytes256, { maxTokens: 1024, maxSeqs: 16 });
  const Y = await embedAll(e256);

  const dot = (A, D, i, j) => { let s = 0; for (let k = 0; k < D; k++) s += A[i * D + k] * A[j * D + k]; return s; };
  let gram = 0, norm = 0, spread = 1;
  for (let i = 0; i < N; i++) {
    norm = Math.max(norm, Math.abs(dot(X, 768, i, i) - 1), Math.abs(dot(Y, 256, i, i) - 1));
    for (let j = 0; j < i; j++) {
      const a = dot(X, 768, i, j);
      gram = Math.max(gram, Math.abs(a - dot(Y, 256, i, j)));
      spread = Math.min(spread, a);
    }
  }
  const hx = await trainLogistic(X, y, 768, { C: 1, iters: 600 });
  const hy = await trainLogistic(Y, y, 256, { C: 1, iters: 600 });
  const px = predict(hx, X, 768), py = predict(hy, Y, 256);
  let dp = 0, flips = 0, right = 0;
  for (let i = 0; i < N; i++) {
    dp = Math.max(dp, Math.abs(px[i] - py[i]));
    if ((px[i] > 0.5) !== (py[i] > 0.5)) flips++;
    if ((py[i] > 0.5) === (y[i] === 1)) right++;
  }
  return { dim768: e768.dim, dim256: e256.dim, manifestUntouched: manifest.dim === 768 && !!manifest.dense.q,
           gram, norm, spread, dp, flips, right, N, gpuErrors };
});

// Part 4: the page's own loader.
const page2 = await browser.newPage();
page2.on("pageerror", (e) => errors.push(String(e)));
await page2.route("**/bsky/list-scout/scout.js", async (route) => {
  const body = await readFile(join(ROOT, "bsky/list-scout/scout.js"), "utf8");
  await route.fulfill({ contentType: "text/javascript", body: "window.__ensureEmbedder = ensureEmbedder;\n" + body });
});
await page2.goto(base + "/bsky/list-scout/index.html");
await page2.waitForFunction(() => window.__ensureEmbedder, null, { timeout: 30000 });
const s = await page2.evaluate(async () => {
  const texts = [
    "Claude Code now runs subagents in parallel, which cut my refactor from an hour to ten minutes.",
    "went for a ride along the canal this morning, 62 km, legs are gone",
    "New paper: quantization-aware training for embedding models, with a rescore recipe.",
    "anyone else's sourdough starter just give up in November?",
    "The thing about vector search is that recall against exact search is not relevance.",
    "x",
    "A long post. " + "It keeps going with more words about models and indexes and shaders and browsers. ".repeat(20),
    "WebGPU compute shaders in WGSL are a reasonable way to run a small encoder in a tab.",
  ];
  let embedder;
  try { embedder = await window.__ensureEmbedder(); } catch (e) { return { skipped: String(e) }; }
  const Y = await embedder.embed(texts);
  // the plain path: the same files at 768, the same prompt and truncation rule
  const E = "/bsky/embedders/";
  const { SmallEngine } = await import(E + "engine.js");
  const tokMod = await import("https://cdn.jsdelivr.net/npm/@huggingface/tokenizers@0.2.0/dist/tokenizers.mjs");
  const [manifest, meta, tj, model] = await Promise.all([
    fetch(E + "models/ettin/manifest.json").then((x) => x.json()), fetch(E + "models/ettin/meta.json").then((x) => x.json()),
    fetch(E + "models/ettin/tokenizer.json").then((x) => x.json()), fetch(E + "models/ettin/model.onnx").then((x) => x.arrayBuffer())]);
  const tok = new tokMod.Tokenizer(tj, {});
  const dp = (meta.prompts || {}).document ?? "";
  const ids = texts.map((t) => { const x = tok.encode(dp + t).ids; return x.length > 128 ? x.slice(0, 127).concat(x[x.length - 1]) : x; });
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice({ requiredLimits: {
    maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize, maxBufferSize: adapter.limits.maxBufferSize } });
  const eng = await SmallEngine.create(device, manifest, model, { maxTokens: 2048, maxSeqs: 32 });
  const X = await eng.embed(ids);
  const N = texts.length, dot = (A, D, i, j) => { let v = 0; for (let k = 0; k < D; k++) v += A[i * D + k] * A[j * D + k]; return v; };
  let gram = 0, norm = 0;
  for (let i = 0; i < N; i++) {
    norm = Math.max(norm, Math.abs(dot(Y, 256, i, i) - 1));
    for (let j = 0; j < i; j++) gram = Math.max(gram, Math.abs(dot(X, 768, i, j) - dot(Y, 256, i, j)));
  }
  return { len: Y.length, N, gram, norm, longest: Math.max(...ids.map((x) => x.length)) };
});
await browser.close();
server.close();

if (r.error) { console.log("FAIL", r.error); process.exit(1); }
ok(r.dim768 === 768 && r.dim256 === 256, `engine widths ${r.dim768} and ${r.dim256}`);
ok(r.manifestUntouched, "foldHead leaves the caller's manifest as it was");
ok(r.norm < 1e-5, `unit vectors at both widths (max |norm² - 1| ${r.norm.toExponential(1)})`);
ok(r.spread < 0.95, `the sequences differ (smallest cosine between two of them ${r.spread.toFixed(3)})`);
ok(r.gram < 1e-5, `inner products agree between 768 and 256 dims (max difference ${r.gram.toExponential(1)})`);
ok(r.dp < 1e-4 && r.flips === 0, `the classifier scores the same at both widths (max |ΔP| ${r.dp.toExponential(1)}, ${r.flips} decisions differ)`);
ok(r.right === r.N, `the classifier separates the two halves (${r.right} of ${r.N})`);
ok(r.gpuErrors.length === 0 && errors.length === 0, "no WebGPU or page errors" + [...r.gpuErrors, ...errors].slice(0, 3).map((e) => " | " + e).join(""));
if (s.skipped) console.log("skip", "List Scout's loader did not start (network?): " + s.skipped);
else {
  ok(s.len === s.N * 256, `List Scout's loader returns ${s.len / s.N} numbers per post`);
  ok(s.longest === 128, `a long post is cut to 128 tokens (${s.longest})`);
  ok(s.norm < 1e-5 && s.gram < 1e-5, `List Scout's vectors match a plain 768-dim engine's inner products (max difference ${s.gram.toExponential(1)})`);
  ok(errors.length === 0, "no page errors in List Scout" + errors.slice(0, 3).map((e) => " | " + e).join(""));
}
console.log(`${passes} passed, ${fails} failed${s.skipped ? ", part 4 skipped" : ""}`);
process.exit(fails ? 1 : 0);
