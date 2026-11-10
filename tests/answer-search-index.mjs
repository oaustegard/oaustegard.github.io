// node tests/answer-search-index.mjs SNAPSHOT_DIR
// bsky/answer-search with its 256-number index of 2 to 4-bit codes (snapshot-256x3.bin, built by
// scripts/answer-search/refresh.py into SNAPSHOT_DIR), in headless Chromium on SwiftShader WebGPU:
//   1. the page loads the snapshot through ?snap= and searches;
//   2. the GPU scan's top 40 match a host computation of the same remex score over the snapshot's codes;
//   3. Scan256.encode, given the page's own vectors of snapshot posts, writes the codes the builder wrote;
//   4. a post's own text, as a query, finds that post;
//   5. posts added live from Bluesky (when the network allows) are found by their own text.
// Needs the Bluesky public API and jsDelivr (the tokenizer) on the network. SwiftShader timings say nothing
// about a real GPU.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const ROOT = resolve(new URL("..", import.meta.url).pathname);
const SNAPDIR = resolve(process.argv[2] || "");
if (!process.argv[2]) { console.log("usage: node tests/answer-search-index.mjs SNAPSHOT_DIR"); process.exit(2); }

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) { passes++; console.log("ok  ", msg); } else { fails++; console.log("FAIL", msg); } };

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".css": "text/css" };
const server = createServer(async (req, res) => {
  try {
    const u = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const p = u.startsWith("/__snap/") ? join(SNAPDIR, u.slice(8)) : join(ROOT, u.endsWith("/") ? u + "index.html" : u);
    const body = await readFile(p);
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream", "content-length": body.length });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-webgpu", "--enable-features=Vulkan", "--use-angle=swiftshader", "--use-webgpu-adapter=swiftshader"] });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.goto(`${base}/bsky/answer-search/index.html?snap=/__snap/`);
await page.waitForFunction(() => window.answers, null, { timeout: 30000 });

const r = await page.evaluate(async () => {
  const t0 = performance.now();
  window.answers.run("claude code pricing");
  for (let i = 0; i < 6000 && !(window.answers.last && !window.answers.busy); i++) await new Promise((x) => setTimeout(x, 100));
  const R = window.answers.retrieval;
  if (!R) return { error: document.getElementById("status").textContent + " | " + document.getElementById("log").textContent };
  const firstSearchMs = performance.now() - t0;
  const out = { firstSearchMs, n: R.n, live: R.live, snapN: R.snapshot.n, d: R.d, picks: window.answers.last.picks.length,
                postsFound: window.answers.last.posts.length };

  // the snapshot file itself, parsed the way the page does
  const buf = await (await fetch("/__snap/snapshot-256x3.bin")).arrayBuffer();
  const u8 = new Uint8Array(buf), hl = new DataView(buf).getUint32(4, true);
  const idx = JSON.parse(new TextDecoder().decode(u8.subarray(8, 8 + hl)));
  const sec = (k) => buf.slice(8 + hl + idx.sections[k][0], 8 + hl + idx.sections[k][0] + idx.sections[k][1]);
  const codes = new Uint8Array(sec("codes")), aux = new Float32Array(sec("aux"));
  const gz = new Blob([sec("posts")]).stream().pipeThrough(new DecompressionStream("gzip"));
  const corpus = JSON.parse(await new Response(gz).text());
  const cent = idx.centroids, mu = idx.mu, n = idx.n, bits = idx.bits, row = 32 * bits;
  // code j of post i from its bit-planes (refresh.py planes()), written independently of scan256.js
  const code = (bytes, i, j) => { let c = 0; for (let p = 0; p < bits; p++) c = (c << 1) | ((bytes[i * row + 32 * p + (j >> 3)] >> (7 - (j & 7))) & 1); return c; };

  // 2. GPU top 40 against the host's score over the same codes, for three queries
  const hostScores = (qv) => {
    let qoff = 0; for (let j = 0; j < 256; j++) qoff += qv[j] * mu[j];
    const s = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let acc = 0;
      for (let j = 0; j < 256; j++) acc += qv[j] * cent[code(codes, i, j)];
      s[i] = aux[2 * i] * acc + aux[2 * i + 1] + qoff;
    }
    return s;
  };
  out.scan = [];
  for (const q of ["LLM reasoning", "data center electricity bills", "bluesky custom feeds"]) {
    const got = await R.search(q, 40);
    const qv = got.qv;
    const s = hostScores(qv);
    const order = Array.from(s.keys()).sort((a, b) => s[b] - s[a] || a - b).slice(0, 40);
    const gpu = got.posts.map((p) => p.i);
    let maxDiff = 0;
    got.posts.forEach((p) => { if (p.i < n) maxDiff = Math.max(maxDiff, Math.abs(p.score - s[p.i])); });
    const overlap = gpu.filter((i) => order.includes(i)).length;
    // a mismatch is only allowed where the host's 40th and 41st scores are closer than float rounding
    out.scan.push({ q, overlap, maxDiff, gpuInSnapshot: gpu.every((i) => i < n) || R.live > 0, scanMs: got.scanMs });
  }

  // 3. encode parity on 64 snapshot posts: the page's vectors, Scan256.encode, against the builder's codes
  const { Scan256 } = await import("/bsky/answer-search/scan256.js");
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  const scan = await Scan256.create(device, { bits, centroids: idx.centroids, boundaries: idx.boundaries, kappa: idx.kappa, mu: idx.mu });
  const rows = Array.from({ length: 64 }, (_, k) => Math.floor((k + 0.5) * n / 64));
  const V = await R.embedMany(rows.map((i) => corpus.texts[i]));
  const e = scan.encode(V);
  let same = 0, total = 0, maxRel = 0, oneLevel = 0;
  rows.forEach((i, k) => {
    for (let j = 0; j < 256; j++) {
      const x = code(codes, i, j), y = code(e.packed, k, j);
      total++; if (x === y) same++; else if (Math.abs(x - y) === 1) oneLevel++;
    }
    maxRel = Math.max(maxRel, Math.abs(e.scaleBias[2 * k] - aux[2 * i]) / Math.abs(aux[2 * i]));
  });
  out.bits = bits;
  out.encode = { same: same / total, oneLevelOfDiffering: total - same ? oneLevel / (total - same) : 1, maxRelScale: maxRel };

  // 4. a post's own text finds it: 20 posts of at least 12 words
  const own = [];
  for (let i = 0, k = 0; own.length < 20 && k < n; k += 4099) {
    i = k % n;
    if (corpus.texts[i].split(/\s+/).length < 12) continue;
    const got = await R.search(corpus.texts[i], 40);
    own.push(got.posts.findIndex((p) => p.i === i) + 1);
  }
  out.own = own;

  // 5. a post added live finds itself
  out.liveOwn = [];
  for (let j = 0; j < Math.min(5, R.live); j++) {
    const rowI = R.n - 1 - j, text = R.post(rowI).text;
    if (text.split(/\s+/).length < 8) continue;
    const got = await R.search(text, 40);
    out.liveOwn.push(got.posts.findIndex((x) => x.i === rowI) + 1);
  }
  return out;
});
await browser.close();
server.close();

if (r.error) { console.log("FAIL the page did not load:", r.error); process.exit(1); }
console.log(JSON.stringify({ ...r, scan: undefined }));
ok(r.d === 256 && r.bits === 3, `the page searches ${r.d}-number vectors as ${r.bits}-bit codes`);
ok(r.postsFound === 40 && r.picks > 0, `a search returns ${r.postsFound} posts and ${r.picks} quoted sentences`);
for (const s of r.scan) ok(s.overlap >= 39 && s.maxDiff < 1e-4, `"${s.q}": GPU top 40 matches the host's in ${s.overlap} of 40, scores within ${s.maxDiff.toExponential(1)} (scan ${s.scanMs.toFixed(0)} ms)`);
ok(r.encode.same > 0.995 && r.encode.oneLevelOfDiffering === 1 && r.encode.maxRelScale < 1e-3,
   `encoding in the page gives the builder's codes for ${(100 * r.encode.same).toFixed(3)}% of 16,384 (every other one a level away), scales within ${r.encode.maxRelScale.toExponential(1)}`);
const top1 = r.own.filter((k) => k === 1).length, found = r.own.filter((k) => k > 0).length;
ok(found === r.own.length && top1 >= 17, `a post's own text finds it: ${top1} of ${r.own.length} at rank 1, ${found} in the top 40 (ranks ${r.own.join(",")})`);
if (r.live > 0) ok(r.liveOwn.length > 0 && r.liveOwn.every((k) => k > 0 && k <= 3), `posts added live find themselves (ranks ${r.liveOwn.join(",")})`);
else console.log("skip", "no posts were added live (none written since the snapshot, or no network)");
ok(errors.length === 0, "no page errors" + errors.slice(0, 3).map((e) => " | " + e).join(""));
console.log(`${passes} passed, ${fails} failed; ${r.live} posts added live`);
process.exit(fails ? 1 : 0);
