// Monad in the browser: onnxruntime-web 1.30 (WebGPU, WASM fallback), 8-bit weights, batch 1,
// KV cache kept on the GPU between steps. The decode loop is the one the GPU Bridge validated in
// oaustegard/experiments monad-weight-edit/bridge/job.js (Mac parity with CPU onnxruntime 5.5e-5),
// cut down to one sequence and given a sampler.

const Q = new URLSearchParams(location.search);
export const ORT_BASE = (() => {
  const q = Q.get('ort');   // local test runs serve their own copy
  return q ? new URL(q.endsWith('/') ? q : q + '/', location.href).href
    : 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/';
})();
export const BASE = (() => {
  const q = Q.get('weights');
  if (q) return new URL(q.endsWith('/') ? q : q + '/', location.href).href;
  return 'https://pub-38421218e82c4d4ba2bc53974c28b55d.r2.dev/models/monad-chat/v1/';
})();

export const MODELS = {
  fixed: { dir: 'A8p_q8', label: 'Loop-fixed Monad', short: 'loop-fixed' },
  original: { dir: 'base_q8', label: 'Original Monad', short: 'original' },
};

export const EOS = 2;
export const END = '<|im_end|>';
export const CONTEXT = 2048;
const CACHE = 'monad-chat-v1';

let ortPromise = null;
function loadOrt() {
  if (!ortPromise) {
    ortPromise = import(ORT_BASE + 'ort.webgpu.min.mjs').then((ort) => {
      ort.env.wasm.wasmPaths = ORT_BASE;
      ort.env.wasm.numThreads = 1;   // GitHub Pages is not cross-origin isolated
      return ort;
    });
  }
  return ortPromise;
}

export const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Breadcrumbs: the stage the page is in, written before each heavy step. A tab the OS kills for memory
// leaves its last stage behind, and the next visit reads it (see index.html).
export const CRUMB = 'monad-chat-crumb';
export function crumb(stage, extra = {}) {
  try { localStorage.setItem(CRUMB, JSON.stringify({ stage, ...extra, t: Date.now() })); } catch (e) { /* no storage */ }
}
export function lastCrumb() {
  try { return JSON.parse(localStorage.getItem(CRUMB) || 'null'); } catch (e) { return null; }
}

export async function pickBackend() {
  const forced = Q.get('backend');
  if (forced === 'wasm' || forced === 'webgpu') return forced;
  let pref = null;
  try { pref = localStorage.getItem('monad-chat-backend'); } catch (e) { /* no storage */ }
  if (pref === 'wasm') return 'wasm';
  try {
    if (navigator.gpu) {
      const a = await navigator.gpu.requestAdapter();
      if (a) return 'webgpu';
    }
  } catch (e) { /* fall through */ }
  return 'wasm';
}

// Fetch with the Cache API in front. onProgress(bytesSoFar, totalBytes). The body streams straight into
// one buffer of the expected size; collecting chunks and concatenating them would hold the file twice.
async function fetchBytes(url, onProgress, size = 0) {
  let cache = null;
  try { cache = await caches.open(CACHE); } catch (e) { /* private mode, file:// */ }
  if (cache) {
    try {
      const hit = await cache.match(url);
      if (hit) {
        const b = new Uint8Array(await hit.arrayBuffer());
        onProgress?.(b.length, b.length, true);
        return b;
      }
    } catch (e) { /* ignore a broken entry */ }
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  const total = +r.headers.get('content-length') || size || 0;
  const reader = r.body.getReader();
  let buf = total ? new Uint8Array(total) : null;
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (buf && got + value.length <= buf.length) buf.set(value, got);
    else {   // larger than announced (compressed transfer): fall back to chunks
      if (buf) { chunks.push(buf.subarray(0, got)); buf = null; }
      chunks.push(value);
    }
    got += value.length;
    onProgress?.(got, total, false);
  }
  let out;
  if (buf) out = got === buf.length ? buf : buf.slice(0, got);
  else {
    out = new Uint8Array(got);
    let o = 0;
    for (const c of chunks) { out.set(c, o); o += c.length; }
  }
  if (cache) {
    try { await cache.put(url, new Response(out)); } catch (e) { /* quota: run uncached */ }
  }
  return out;
}

export async function clearCache() {
  try { return await caches.delete(CACHE); } catch (e) { return false; }
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

// CRC32 in place: unlike crypto.subtle.digest, which copies its input, this needs no second 73 MB buffer.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(u8) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// model.packed stores the fp32 tensors that are exactly bf16 (embeddings, norms, scales) as bf16;
// meta.regions says where. Rebuild model.onnx.data and check its sha256 against the export.
function unpack(packed, meta) {
  if (packed.length !== meta.packed_bytes) throw new Error(`weights: ${packed.length} bytes, expected ${meta.packed_bytes}`);
  const data = new Uint8Array(meta.data_bytes), d32 = new Uint32Array(data.buffer);
  for (const [off, ln, kind, pos] of meta.regions) {
    if (kind === 'f32') { data.set(packed.subarray(pos, pos + ln), off); continue; }
    const src = new Uint16Array(packed.buffer, packed.byteOffset + pos, ln / 4), base = off / 4;
    for (let i = 0; i < src.length; i++) d32[base + i] = src[i] << 16;
  }
  return data;
}

export class Monad {
  static async load(key, backend, onStatus) {
    const ort = await loadOrt();
    const m = MODELS[key];
    const say = (s, frac) => onStatus?.(s, frac);
    say('fetching graph and metadata', 0);
    crumb('download', { model: key, backend });
    const [graph, metaBytes] = await Promise.all([
      fetchBytes(BASE + 'model.onnx'),
      fetchBytes(BASE + m.dir + '/meta.json'),
    ]);
    const meta = JSON.parse(new TextDecoder().decode(metaBytes));
    let packed = await fetchBytes(BASE + m.dir + '/model.packed', (got, total, cached) => {
      const t = total || meta.packed_bytes;
      say(cached ? 'weights from browser cache' : `downloading weights ${(got / 1e6).toFixed(1)} / ${(t / 1e6).toFixed(1)} MB`, got / t);
    }, meta.packed_bytes);
    say('unpacking weights', 1);
    crumb('unpack', { model: key, backend });
    const data = unpack(packed, meta);
    packed = null;   // the packed copy is no longer needed; let it go before the session copies the weights
    crumb('checksum', { model: key, backend });
    let ok;
    if (meta.data_crc32 !== undefined) ok = crc32(data) === meta.data_crc32;
    else if (IS_IOS) ok = true;   // older cached meta without a CRC: skip the copying SHA-256 on phones
    else ok = hex(await crypto.subtle.digest('SHA-256', data)) === meta.data_sha256;
    if (!ok) {
      await clearCache();
      throw new Error('weights failed their checksum; the browser cache was cleared, reload to try again');
    }
    say(`compiling for ${backend === 'webgpu' ? 'WebGPU' : 'CPU (WASM)'}`, 1);
    crumb('compile', { model: key, backend });
    const names = [];
    for (let l = 0; l < meta.layers; l++) names.push(`present.${l}.key`, `present.${l}.value`);
    const loc = Object.fromEntries(names.map((n) => [n, backend === 'webgpu' ? 'gpu-buffer' : 'cpu']));
    loc.logits = 'cpu';
    const sess = await ort.InferenceSession.create(graph, {
      executionProviders: [backend],
      externalData: [{ path: 'model.onnx.data', data }],
      preferredOutputLocation: loc,
      graphOptimizationLevel: 'all',
    });
    crumb('ready', { model: key, backend });
    return new Monad(ort, sess, meta, key, backend);
  }

  constructor(ort, sess, meta, key, backend) {
    Object.assign(this, { ort, sess, meta, key, backend });
    this.kv = meta.kv_heads || 4;
    this.noSharedKv = Q.get('kv') === 'growing';   // ?kv=growing: the per-step growing cache, for comparison
    this.hd = meta.head_dim || 64;
  }

  async release() {
    this.dropKv();
    try { await this.sess.release(); } catch (e) { /* already gone */ }
  }

  dropKv() {
    if (this.kvBufs) for (const b of this.kvBufs) { try { b.destroy(); } catch (e) { /* gone */ } }
    this.kvBufs = this.kvTensors = null;
    this.kvLen = 0;
  }

  // Fixed-size KV cache on the GPU: one buffer per layer for keys and one for values, each holding `len`
  // positions, bound as both the past input and the present output. GroupQueryAttention sees the same buffer
  // on both sides and writes the new position in place, so nothing is allocated per token and the shapes stay
  // fixed. The growing alternative allocates a cache one token longer for all 64 layers at every step.
  // Identical logits to the growing cache on onnxruntime CPU (experiments/monad-chat, shared-KV check).
  ensureKv(len) {
    if (this.kvBufs && this.kvLen >= len) return;
    this.dropKv();
    const dev = this.ort.env.webgpu.device;
    const bytes = 4 * this.kv * len * this.hd;
    this.kvBufs = [];
    this.kvTensors = [];
    for (let i = 0; i < 2 * this.meta.layers; i++) {
      const buf = dev.createBuffer({ size: bytes, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST });
      this.kvBufs.push(buf);
      this.kvTensors.push(this.ort.Tensor.fromGpuBuffer(buf, { dataType: 'float32', dims: [1, this.kv, len, this.hd] }));
    }
    this.kvLen = len;
  }

  get sharedKv() { return this.backend === 'webgpu' && !this.noSharedKv; }

  async *generateShared(promptIds, { maxNew, pick }) {
    const L = this.meta.layers, T = promptIds.length;
    const need = Math.min(CONTEXT, Math.ceil((T + maxNew + 1) / 128) * 128);
    this.ensureKv(need);
    const kvFeeds = {}, kvFetches = {};
    for (let l = 0; l < L; l++) {
      kvFeeds[`past_key_values.${l}.key`] = this.kvTensors[2 * l];
      kvFeeds[`past_key_values.${l}.value`] = this.kvTensors[2 * l + 1];
      kvFetches[`present.${l}.key`] = this.kvTensors[2 * l];
      kvFetches[`present.${l}.value`] = this.kvTensors[2 * l + 1];
    }
    const out = [];
    let ids = promptIds, total = T;
    for (let step = 0; step < maxNew && total < this.kvLen; step++) {
      const t0 = performance.now();
      const feeds = { input_ids: this.i64(ids, [1, ids.length]), attention_mask: this.i64(new Array(total).fill(1), [1, total]),
        logits_index: this.i64([ids.length - 1], [1]), ...kvFeeds };
      const res = await this.sess.run(feeds, { logits: null, ...kvFetches });
      const id = pick(res.logits.data, out);
      out.push(id);
      yield { id, ms: performance.now() - t0, prefill: step === 0 };
      ids = [id];
      total += 1;
    }
  }

  i64(arr, dims) {
    return new this.ort.Tensor('int64', BigInt64Array.from(arr, (x) => BigInt(x)), dims);
  }

  // Yields {id, ms} per generated token. pick(logits, generatedIds) chooses the next id.
  // The caller stops by breaking out of the loop; cached GPU tensors are released either way.
  async *generate(promptIds, opts) {
    if (this.sharedKv) { yield* this.generateShared(promptIds, opts); return; }
    yield* this.generateGrowing(promptIds, opts);
  }

  async *generateGrowing(promptIds, { maxNew, pick }) {
    const L = this.meta.layers, T = promptIds.length;
    let feeds = {
      input_ids: this.i64(promptIds, [1, T]),
      attention_mask: this.i64(new Array(T).fill(1), [1, T]),
      logits_index: this.i64([T - 1], [1]),
    };
    for (let l = 0; l < L; l++) {
      feeds[`past_key_values.${l}.key`] = new this.ort.Tensor('float32', new Float32Array(0), [1, this.kv, 0, this.hd]);
      feeds[`past_key_values.${l}.value`] = new this.ort.Tensor('float32', new Float32Array(0), [1, this.kv, 0, this.hd]);
    }
    const out = [];
    let prev = null, total = T;
    const drop = (ts) => { if (ts) for (const t of ts) if (t.location === 'gpu-buffer') t.dispose(); };
    try {
      for (let step = 0; step < maxNew && total < CONTEXT; step++) {
        const t0 = performance.now();
        const res = await this.sess.run(feeds);
        drop(prev);
        prev = [];
        for (let l = 0; l < L; l++) prev.push(res[`present.${l}.key`], res[`present.${l}.value`]);
        const id = pick(res.logits.data, out);
        const ms = performance.now() - t0;
        out.push(id);
        yield { id, ms, prefill: step === 0 };
        total += 1;
        feeds = {
          input_ids: this.i64([id], [1, 1]),
          attention_mask: this.i64(new Array(total).fill(1), [1, total]),
          logits_index: this.i64([0], [1]),
        };
        for (let l = 0; l < L; l++) {
          feeds[`past_key_values.${l}.key`] = prev[2 * l];
          feeds[`past_key_values.${l}.value`] = prev[2 * l + 1];
        }
      }
    } finally {
      drop(prev);
    }
  }
}

// ---------------------------------------------------------------- prompt and sampling

// Monad's chat template (chat_template.json): every turn is <|im_start|>role\n...<|im_end|>\n, and
// the assistant turn opens with <think>\n. The markers are plain text to its tokenizer.
export function renderPrompt(system, turns) {
  let s = system ? `<|im_start|>system\n${system}<|im_end|>\n` : '';
  for (const t of turns) s += `<|im_start|>${t.role}\n${t.content}<|im_end|>\n`;
  return s + '<|im_start|>assistant\n<think>\n';
}

// Temperature, top-p and a repetition penalty on the last `window` generated tokens (never the
// prompt), in that order: the same arithmetic as experiments/monad-chat/dryrun.py, where the
// defaults were chosen. temperature 0 is greedy.
export function makeSampler({ temperature, topP, penalty, window }) {
  return (logits, gen) => {
    const V = logits.length;
    const l = Float32Array.from(logits);
    if (penalty !== 1 && window > 0 && gen.length) {
      const seen = new Set(gen.slice(-window));
      for (const id of seen) l[id] = l[id] > 0 ? l[id] / penalty : l[id] * penalty;
    }
    let best = 0;
    for (let i = 1; i < V; i++) if (l[i] > l[best]) best = i;
    if (!(temperature > 0)) return best;
    const mx = l[best], inv = 1 / temperature;
    let z = 0;
    const p = new Float32Array(V);
    for (let i = 0; i < V; i++) { p[i] = Math.exp((l[i] - mx) * inv); z += p[i]; }
    // Sort only the tokens within a factor 1e-3 of the top one; widen to everything when they
    // hold less than top-p of the mass (a flat distribution). Same result, much less sorting.
    let cand = [], cm = 0;
    for (let i = 0; i < V; i++) if (p[i] > 1e-3) { cand.push(i); cm += p[i]; }
    if (cm / z < topP) { cand = []; for (let i = 0; i < V; i++) if (p[i] > 1e-9) cand.push(i); }
    cand.sort((a, b) => p[b] - p[a]);
    let keep = 0, mass = 0;
    while (keep < cand.length) { mass += p[cand[keep]] / z; keep++; if (mass >= topP) break; }
    let r = Math.random() * mass * z;
    for (let k = 0; k < keep; k++) { r -= p[cand[k]]; if (r <= 0) return cand[k]; }
    return cand[keep - 1];
  };
}

// True when the tail of ids is one block of p tokens repeated, over at least max(3p, 32) tokens:
// the loop Monad falls into. The page stops generation there instead of running to the limit.
export function looping(ids, maxPeriod = 64) {
  const n = ids.length;
  for (let p = 1; p <= maxPeriod; p++) {
    const span = Math.max(3 * p, 32);
    if (span > n) break;
    let ok = true;
    for (let i = n - span + p; i < n; i++) if (ids[i] !== ids[i - p]) { ok = false; break; }
    if (ok) return p;
  }
  return 0;
}
