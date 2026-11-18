// Differential check of the site's WebGPU kernels in headless Chromium (SwiftShader WebGPU):
// RemexTail in both copies of tail.js against float64 CPU references, and the Ettin-17m WGSL
// engine against onnxruntime-web's CPU (wasm) path. The checks live in kernels-page.js.
//   node .claude/skills/verify/kernels.mjs [--no-engine] [--real-docs N] [--both-tails]
// onnxruntime-web comes from jsDelivr once and is kept in ~/.cache/verify-kernels/; without it and
// without the network, the engine check reports SKIP (exit 0) and says so.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const argv = process.argv.slice(2);
const flag = (k) => argv.includes(k);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const ORT_URL = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/';
const ORT_FILES = ['ort.wasm.min.mjs', 'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm'];
const CACHE = join(homedir(), '.cache', 'verify-kernels', 'onnxruntime-web@1.30.0');

// Token ids for a few short texts from the Ettin tokenizer's own vocabulary (byte-level BPE: a
// leading space is 'Ġ'). Exact tokenization does not matter for a differential test; real ids do.
function ettinIds() {
  const tj = JSON.parse(readFileSync(join(ROOT, 'bsky/embedders/models/ettin/tokenizer.json'), 'utf8'));
  const vocab = tj.model.vocab;
  const special = Object.fromEntries(tj.added_tokens.map((t) => [t.content, t.id]));
  const texts = [
    'Represent this sentence for searching relevant passages: how do small language models run in a browser',
    'the raven flew over the frozen lake at dawn',
    'graphics processors multiply matrices quickly',
    'what is the capital of norway',
    // long enough to reach past ModernBERT's 64-token local attention half-window
    Array.from({ length: 12 }, () => 'the small model reads every word of this long sentence before it answers').join(' '),
  ];
  return texts.map((t) => {
    const ids = [special['[CLS]']];
    t.split(' ').forEach((w, i) => { const id = vocab[(i ? 'Ġ' : '') + w] ?? vocab[w]; if (id !== undefined) ids.push(id); });
    ids.push(special['[SEP]']);
    return ids.length > 128 ? ids.slice(0, 127).concat(ids[ids.length - 1]) : ids;   // the pages' MAX_TOKENS
  });
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm' };
const server = createServer(async (req, res) => {
  try {
    const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (u === '/__verify/blank.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end('<!doctype html><title>kernels</title>'); }
    const p = u.startsWith('/__verify/') ? join(HERE, u.slice(10)) : join(ROOT, u);
    const body = await readFile(p);
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream', 'content-length': body.length });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const t0 = Date.now();
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({
  args: ['--no-sandbox', '--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader',
    '--use-angle=swiftshader', '--use-webgpu-adapter=swiftshader'],
  proxy: proxy ? { server: proxy, bypass: '127.0.0.1,localhost' } : undefined,
});
let failed = 0, skipped = 0;
try {
  const ctx = await browser.newContext();
  // onnxruntime-web from the disk cache, filled from jsDelivr on first use.
  let ortOk = true;
  await ctx.route(ORT_URL + '**', async (route) => {
    const name = route.request().url().slice(ORT_URL.length).split('?')[0];
    const file = join(CACHE, name);
    if (existsSync(file)) return route.fulfill({ status: 200, contentType: TYPES[extname(name)] || 'application/octet-stream', body: await readFile(file) });
    try {
      const resp = await route.fetch();
      if (resp.ok()) { await mkdir(CACHE, { recursive: true }); await writeFile(file, await resp.body()); }
      return route.fulfill({ response: resp });
    } catch (e) { ortOk = false; return route.abort(); }
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.split('\n')[0]));
  await page.goto(base + '/__verify/blank.html');
  const engineWanted = !flag('--no-engine');
  // image-search/tail.js is a vendored copy with a two-line header. Test it separately only when
  // its code differs; otherwise the first copy's results cover it, and the run says so.
  const code = (p) => readFileSync(join(ROOT, p), 'utf8').split('\n').filter((l) => !/^\/\/ (Vendored from|Edit it there)/.test(l)).join('\n');
  const tails = [{ label: '[embedders/tail.js]', url: '/bsky/embedders/tail.js', real: true }];
  const sameCode = code('bsky/image-search/tail.js') === code('bsky/embedders/tail.js');
  if (!sameCode || flag('--both-tails')) tails.push({ label: '[image-search/tail.js]', url: '/bsky/image-search/tail.js', real: false });
  console.log(sameCode ? 'bsky/image-search/tail.js: same code as bsky/embedders/tail.js apart from its header, covered by the same checks'
    : 'bsky/image-search/tail.js: code differs from bsky/embedders/tail.js, checking both');
  const cfg = {
    params: '/bsky/image-search/params.json',
    realIndex: '/bsky/embedders/index/ettin/',
    realDocs: +opt('--real-docs', 8192),
    tails,
    engine: engineWanted ? { url: '/bsky/embedders/engine.js', modelDir: '/bsky/embedders/models/ettin/', ort: ORT_URL, ids: ettinIds() } : null,
  };
  const res = await page.evaluate(async (c) => (await import('/__verify/kernels-page.js')).run(c), cfg);
  console.log(`adapter: ${res.adapter}; ms per part: ${JSON.stringify(res.time)}`);
  for (const c of res.checks) {
    const offline = !ortOk && /^Ettin engine/.test(c.name) && !c.ok;
    if (offline) skipped++; else if (!c.ok) failed++;
    console.log(`${offline ? 'SKIP' : c.ok ? 'PASS' : 'FAIL'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}${offline ? ' (onnxruntime-web not cached and jsDelivr unreachable)' : ''}`);
  }
  if (errs.length) { failed++; console.log(`FAIL page errors — ${errs.join(' | ')}`); }
  console.log(`${failed ? 'FAILED' : 'OK'}: ${res.checks.length - failed - skipped}/${res.checks.length} checks${skipped ? `, ${skipped} skipped` : ''} in ${Date.now() - t0} ms`);
} finally {
  await browser.close();
  server.close();
}
process.exit(failed ? 1 : 0);
