// Latent calculator, in the browser.  Three routes over the same two ONNX
// halves of SmolLM2-135M, split after decoder layer 16:
//
//   frozen  lower + upper, nothing injected
//   text    the calculator result spliced into the prompt as " [<result>]"
//   latent  query read out of layer 16 (learned head) or off the prompt text
//           (regex), python-free calculator, then one encoder vector added to
//           hidden16 at every answer position.  No tokens cross the boundary.
//
// Mirrors pipeline.py step for step; test_web.py asserts they agree.

import { BPETokenizer } from './bpe.js';

// Where the weights live.  `?model=<url>` wins; otherwise the first base whose
// meta.json answers.  Hugging Face and raw.githubusercontent both send
// access-control-allow-origin: * and honour ranges; GitHub release assets do not.
export const ORT_BASE = (typeof window !== 'undefined' && window.ORT_BASE)
  || 'https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.24.2/';

// ORT ships as a classic script that defines a global.  Loading it with
// document.write from the page is what Chrome warns about (parser-blocking
// cross-site script); load it here instead and await it before first use.
let ortPromise = null;
export function ensureOrt(base = ORT_BASE) {
  if (typeof globalThis.ort !== 'undefined') return Promise.resolve(globalThis.ort);
  if (ortPromise) return ortPromise;
  ortPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = base + 'ort.min.js';
    s.onload = () => (typeof globalThis.ort !== 'undefined'
      ? resolve(globalThis.ort)
      : reject(new Error('ort.min.js loaded but no ort global')));
    s.onerror = () => reject(new Error('could not load ' + s.src));
    document.head.appendChild(s);
  });
  return ortPromise;
}

// Hugging Face answers resolve/main/<file> with a 302 marked `cache-control:
// no-store`, and the signed CDN URL it points at changes every time, so the
// HTTP cache never reuses a shard: every page load re-downloads 270-539 MB.
// Cache Storage is keyed on the stable resolve/main URL, so it survives.
export const STARTUP_CHECK_MS = 120000;

class TimeoutError extends Error {}

function withTimeout(p, ms, what) {
  let t;
  return Promise.race([
    p.finally(() => clearTimeout(t)),
    new Promise((_, rej) => {
      t = setTimeout(() => rej(new TimeoutError(
        `${what} did not finish in ${(ms / 1000).toFixed(0)}s`)), ms);
    }),
  ]);
}

export const WEIGHT_CACHE = 'latent-calculator-weights-v1';

async function cacheGet(url) {
  try {
    if (typeof caches === 'undefined') return null;
    const c = await caches.open(WEIGHT_CACHE);
    const r = await c.match(url);
    if (!r) return null;
    return new Uint8Array(await r.arrayBuffer());
  } catch { return null; }
}

async function cachePut(url, bytes) {
  try {
    if (typeof caches === 'undefined') return false;
    const c = await caches.open(WEIGHT_CACHE);
    await c.put(url, new Response(bytes));
    return true;
  } catch { return false; }   // quota, private mode, insecure origin
}

export async function clearWeightCache() {
  try { return await caches.delete(WEIGHT_CACHE); } catch { return false; }
}

export const MODEL_BASES = (() => {
  const q = new URLSearchParams(location.search).get('model');
  if (q) return [q.endsWith('/') ? q : q + '/'];
  const local = location.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
    ? ['./model/'] : [];
  return local.concat([
    'https://huggingface.co/austegard/latent-calculator-web/resolve/main/',
  ]);
})();
export const MODEL_BASE = MODEL_BASES[0];

async function pickBase(bases) {
  for (const b of bases) {
    try {
      const r = await fetch(b + 'meta.json', { cache: 'no-store' });
      if (r.ok) return b;
    } catch (e) { /* try the next host */ }
  }
  throw new Error('no model host answered: ' + bases.join(', '));
}

/** Bytes the page pulls for one variant, from meta.json's own manifest.
 *  The tied embedding table is shared between the halves, so count it once. */
export function variantBytes(meta, variant) {
  const v = meta.variants[variant];
  if (!v) return 0;
  const seen = new Set();
  let n = 0;
  for (const half of [v.lower, v.upper]) {
    n += half.model_bytes || 0;
    for (const e of half.external || []) {
      if (seen.has(e.location)) continue;
      seen.add(e.location);
      n += e.bytes || 0;
    }
  }
  return n;
}

/** meta.json lists every variant export_onnx.py can emit, including ones that
 *  were deliberately never uploaded (int8 costs 22 exact-match points).  HEAD
 *  each variant's lower graph so the page offers only what the host serves. */
export async function availableVariants(base, meta) {
  const out = [];
  for (const name of Object.keys(meta.variants)) {
    try {
      const r = await fetch(base + meta.variants[name].lower.model,
        { method: 'HEAD' });
      if (r.ok) out.push(name);
    } catch (e) { /* unreachable counts as absent */ }
  }
  return out;
}

const MAX_NEW = 16;
const N_OPERAND_SLOTS = 6;
const N_RESULT_SLOTS = 12;
const BLANK = 10;
const SIGN_OFFSET = 11;
const KIND_OFFSET = 13;
const OPS = ['add', 'sub', 'mul', 'cmp'];
const KINDS = ['numeric', 'greater', 'less', 'equal'];

// The twelve trained templates (data.py TEMPLATES), pre-filled.
export const EXAMPLES = [
  '4567 + 89 =', 'What is 1234 plus 56?', 'Add 908 and 77:',
  '1000 - 37 =', 'Subtract 987 from 1000.', 'What is 6790 minus 828?',
  '23 * 45 =', 'Compute 123 times 456.', 'What is 88 multiplied by 99?',
  'Which is larger, 3436 or 9549?', 'Compare 2064 and 1653:',
  'Is 222237 greater or less than 621?',
];

// ---------------------------------------------------------------- calculator
export function decodeOperand(slots) {
  let hi = -1;
  for (let i = 0; i < slots.length; i++) if (slots[i] !== BLANK) hi = i;
  if (hi < 0) return 0n;
  let v = 0n;
  for (let i = hi; i >= 0; i--) {
    const d = slots[i] === BLANK ? 0 : slots[i];
    v = v * 10n + BigInt(d);
  }
  return v;
}

export function calculate(opIdx, aSlots, bSlots) {
  const op = OPS[opIdx];
  const a = decodeOperand(aSlots);
  const b = decodeOperand(bSlots);
  if (op === 'add') return (a + b).toString();
  if (op === 'sub') return (a - b).toString();
  if (op === 'mul') return (a * b).toString();
  return a > b ? 'greater' : a < b ? 'less' : 'equal';
}

// Port of model_utils.result_symbols(..., align='left').
export function resultSymbolsLeft(s) {
  const syms = new Array(N_RESULT_SLOTS).fill(BLANK);
  let sign = 0;
  let kind = 0;
  if (s === 'greater' || s === 'less' || s === 'equal') {
    kind = KINDS.indexOf(s);
  } else {
    sign = s.startsWith('-') ? 1 : 0;
    const digits = [...s].filter((c) => c >= '0' && c <= '9');
    if (digits.length > N_RESULT_SLOTS) throw new Error('result too long: ' + s);
    digits.forEach((c, i) => { syms[i] = Number(c); });
  }
  return syms.concat([SIGN_OFFSET + sign, KIND_OFFSET + kind]);
}

// ------------------------------------------------- regex query (regex_query.py)
const CUES = [
  ['cmp', /\blarger\b|\bcompare\b|\bgreater\b|\bless\b|\bsmaller\b|\bbigger\b/],
  ['mul', /\*|\btimes\b|\bmultipl|\bproduct\b/],
  ['sub', /(?<![\w-])-\s|\bminus\b|\bsubtract\b|\bdifference\b|\bless\s+\d/],
  ['add', /\+|\bplus\b|\badd\b|\bsum\b|\btogether\b|\btotal\b/],
];
const INT_RE = /(?<![\w])-?\d+(?![\w]|\.\d)/g;

export function regexExtract(prompt) {
  const nums = [...prompt.matchAll(INT_RE)].map((m) => m[0]);
  if (nums.length < 2) return null;
  let [a, b] = nums;
  const low = prompt.toLowerCase();
  let op = null;
  for (const [name, pat] of CUES) if (pat.test(low)) { op = name; break; }
  if (op === null) return null;
  if (op === 'sub' && /\bsubtract\b[\s\S]*\bfrom\b/.test(low)) [a, b] = [b, a];
  return { op, a: BigInt(a), b: BigInt(b) };
}

export function regexCalculate(op, a, b) {
  if (op === 'add') return (a + b).toString();
  if (op === 'sub') return (a - b).toString();
  if (op === 'mul') return (a * b).toString();
  return a > b ? 'greater' : a < b ? 'less' : 'equal';
}

// ------------------------------------------------------------------- runtime
function bigints(arr) { return BigInt64Array.from(arr, (x) => BigInt(x)); }

// Works for CPU tensors and for GPU-resident ones (WebGPU output location).
async function dataOf(t) {
  return typeof t.getData === 'function' ? await t.getData(true) : t.data;
}

// float32 -> nearest float16 -> float32, round-to-nearest-even.
const _fb = new ArrayBuffer(4);
const _f32 = new Float32Array(_fb);
const _u32 = new Uint32Array(_fb);
export function roundF16(x) {
  _f32[0] = x;
  let u = _u32[0];
  const sign = u & 0x80000000;
  u &= 0x7fffffff;
  if (u >= 0x47800000) { _u32[0] = sign | 0x7f800000; return _f32[0]; }
  if (u < 0x38800000) {                       // fp16 subnormal range
    const scale = 5.960464477539063e-8;       // 2^-24
    const mag = Math.round(Math.abs(x) / scale) * scale;
    _f32[0] = mag;
    _u32[0] |= sign;
    return _f32[0];
  }
  const rounded = (u + 0x00000fff + ((u >>> 13) & 1)) & 0xffffe000;
  _u32[0] = sign | rounded;
  return _f32[0];
}

export class LatentModel {
  constructor(log = () => {}) {
    this.log = log;
    this.bufCache = new Map();      // the tied table is fetched once
    this.bytesFetched = 0;
    this.expectedBytes = 0;
  }

  progress(name, got, total, done, suffix = '') {
    const mb = (x) => (x / 1e6).toFixed(0);
    const running = this.bytesFetched + (done ? 0 : got);
    const of = this.expectedBytes
      ? ` [${mb(running)}/${mb(this.expectedBytes)} MB]` : '';
    this.log(done ? `  ${name} ${mb(got)} MB${of}${suffix}`
      : `  ${name} ${mb(got)}/${mb(total)} MB${of}`);
  }

  async fetchBytes(base, name) {
    if (this.bufCache.has(name)) return this.bufCache.get(name);
    const url = base + name;
    const hit = await cacheGet(url);
    if (hit) {
      this.bufCache.set(name, hit);
      this.bytesFetched += hit.length;
      this.progress(name, hit.length, hit.length, true, ' (from cache)');
      return hit;
    }
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
    const total = Number(r.headers.get('content-length')) || 0;
    let b;
    if (r.body && total > 8e6) {
      // Read the big shards through the stream so the log moves while a 90 MB
      // file is in flight.  A page that prints nothing for four minutes is
      // indistinguishable from a page that has died.
      const chunks = [];
      const reader = r.body.getReader();
      let got = 0;
      let mark = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        got += value.length;
        if (got - mark >= total / 4) { mark = got; this.progress(name, got, total, false); }
      }
      b = new Uint8Array(got);
      let off = 0;
      for (const c of chunks) { b.set(c, off); off += c.length; }
    } else {
      b = new Uint8Array(await r.arrayBuffer());
    }
    this.bufCache.set(name, b);
    this.bytesFetched += b.length;
    this.progress(name, b.length, b.length, true);
    await cachePut(url, b);
    return b;
  }

  /** Fetch a graph's .onnx plus its external-data files (shards concatenated)
   *  and hand them to ORT as `externalData`. */
  async loadGraph(base, man, opts) {
    const model = await this.fetchBytes(base, man.model);
    const externalData = [];
    for (const e of man.external || []) {
      let data;
      if (e.shards.length === 1) {
        data = await this.fetchBytes(base, e.shards[0]);
      } else if (this.bufCache.has(e.location)) {
        data = this.bufCache.get(e.location);
      } else {
        const parts = [];
        for (const s of e.shards) parts.push(await this.fetchBytes(base, s));
        data = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
        let off = 0;
        for (const p of parts) { data.set(p, off); off += p.length; }
        this.bufCache.set(e.location, data);
      }
      externalData.push({ path: e.location, data });
    }
    return ort.InferenceSession.create(model, { ...opts, externalData });
  }

  async init({ base = null, variant = 'fp32', backend = 'auto' } = {}) {
    if (typeof globalThis.ort === 'undefined') this.log('loading onnxruntime-web');
    await ensureOrt();
    // ORT resolves wasmPaths relative to ort.min.js, so make it absolute
    if (typeof document !== 'undefined' && typeof location !== 'undefined') {
      ort.env.wasm.wasmPaths = new URL(ORT_BASE, location.href).href;
    }
    base = base || await pickBase(MODEL_BASES);
    this.base = base;
    this.meta = await (await fetch(base + 'meta.json')).json();
    this.tok = new BPETokenizer(
      await (await fetch(base + (this.meta.tokenizer || 'tokenizer.json'))).json());
    this.newline = this.tok.encode('\n').slice(-1)[0];
    this.eos = this.meta.eos_token_id;

    ort.env.wasm.numThreads = (self.crossOriginIsolated
      && navigator.hardwareConcurrency > 1)
      ? Math.min(4, navigator.hardwareConcurrency) : 1;
    ort.env.wasm.simd = true;
    ort.env.logLevel = 'error';
    this.threads = ort.env.wasm.numThreads;

    let want = backend === 'auto'
      ? (navigator.gpu ? ['webgpu', 'wasm'] : ['wasm'])
      : [backend];
    if (!navigator.gpu && want.includes('webgpu')) {
      // No point walking the optimization ladder for an EP the browser does
      // not have: each retry re-creates sessions over hundreds of MB.
      this.log('navigator.gpu is undefined; skipping the WebGPU backend');
      want = want.filter((e) => e !== 'webgpu');
      if (!want.length) want = ['wasm'];
    }
    const asked = variant;
    if (asked === 'auto') {
      this.log(`variant auto, backend order ${want.join(', ')}`);
    }
    let lastErr = null;
    // onnxruntime-web 1.24's extended optimizers (SimplifiedLayerNormFusion)
    // reject the fp16 graph, so fall back a level at a time rather than
    // declaring the whole variant unusable.  Fetched buffers are cached, so a
    // retry costs no download.
    outer:
    for (const ep of want) {
      // fp16 is the WebGPU variant and fp32 the WASM one.  Resolve per backend,
      // not once up front: carrying fp16 onto the WASM fallback fails at every
      // optimization level, because ORT's WASM build has no fp16 kernels.
      variant = asked === 'auto'
        ? ((ep === 'webgpu' && this.meta.variants.fp16) ? 'fp16' : 'fp32')
        : asked;
      const v = this.meta.variants[variant];
      if (!v) throw new Error('no such weight variant: ' + variant);
      this.expectedBytes = variantBytes(this.meta, variant);
      this.log(`${ep}: ${variant}, ~`
        + `${(this.expectedBytes / 1e6).toFixed(0)} MB`);
      for (const level of ['all', 'basic', 'disabled']) {
        try {
          const opts = { executionProviders: [ep],
            graphOptimizationLevel: level };
          this.lower = await this.loadGraph(base, v.lower, opts);
          this.upper = await this.loadGraph(base, v.upper, opts);
          const wasmOpts = { executionProviders: ['wasm'] };
          this.qh = await this.loadGraph(base, this.meta.query_head, wasmOpts);
          this.enc = await this.loadGraph(base, this.meta.encoder, wasmOpts);
          this.backend = ep;
          this.variant = variant;
          this.optLevel = level;
          // Ground truth on startup.  A backend that loads and then computes
          // garbage looks exactly like one that works (transformers.js int8 on
          // WebGPU did this on this site once; headless Chromium's WebGPU
          // returned empty strings here).  One known prompt through the latent
          // route decides whether this backend is trusted.
          const chk = await withTimeout(this.answer('4567 + 89 =', 'regex'),
            STARTUP_CHECK_MS, `${ep} startup check`);
          const got = (chk.latent.text || '').trim();
          if (got !== '4656') {
            this.log(`backend ${ep} failed the startup check: latent '${got}' `
              + `for 4567 + 89 (expected 4656); trying the next backend`);
            this.backend = null;
            continue outer;
          }
          this.log(`backend ${ep} passed the startup check (4567 + 89 = ${got})`);
          break outer;
        } catch (e) {
          lastErr = e;
          this.log(`backend ${ep} / optimization ${level} failed: ${e.message}`);
          // A hang is not an optimizer problem, so do not walk the ladder.
          if (e instanceof TimeoutError) { this.backend = null; continue outer; }
        }
      }
    }
    if (!this.backend) throw lastErr || new Error('no backend available');
    this.log(`fetched ${(this.bytesFetched / 1e6).toFixed(0)} MB`);
    this.log(`backend=${this.backend} variant=${variant} `
      + `opt=${this.optLevel} threads=${this.threads} `
      + `coi=${self.crossOriginIsolated}`);
    return this;
  }

  emptyCache(n) {
    const kv = this.meta.num_key_value_heads;
    const hd = this.meta.head_dim;
    const dims = [n, 1, kv, 0, hd];
    return {
      k: new ort.Tensor('float32', new Float32Array(0), dims),
      v: new ort.Tensor('float32', new Float32Array(0), dims),
    };
  }

  // [1,1,T,P+T] float, 1 where attention is allowed
  causalMask(t, p) {
    const s = p + t;
    const m = new Float32Array(t * s);
    for (let i = 0; i < t; i++) {
      for (let j = 0; j <= p + i; j++) m[i * s + j] = 1;
    }
    return new ort.Tensor('float32', m, [1, 1, t, s]);
  }

  async runLower(ids, pos, cache) {
    const t = ids.length;
    const r = await this.lower.run({
      input_ids: new ort.Tensor('int64', bigints(ids), [1, t]),
      position_ids: new ort.Tensor('int64', bigints(pos), [1, t]),
      attn_mask: this.causalMask(t, cache.k.dims[3]),
      past_k: cache.k, past_v: cache.v,
    });
    return { hidden: r.hidden, cache: { k: r.present_k, v: r.present_v } };
  }

  async runUpper(hidden, pos, cache) {
    const t = hidden.dims[1];
    const r = await this.upper.run({
      hidden,
      position_ids: new ort.Tensor('int64', bigints(pos), [1, t]),
      attn_mask: this.causalMask(t, cache.k.dims[3]),
      past_k: cache.k, past_v: cache.v,
    });
    return { logits: r.logits, cache: { k: r.present_k, v: r.present_v } };
  }

  async runQueryHead(hidden) {
    // model_utils.extract_hidden_seq caches the layer-k states in fp16, so the
    // head was trained on (and is fed) fp16-rounded activations.  Reproduce it.
    const src = await dataOf(hidden);
    const f = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) f[i] = roundF16(src[i]);
    const t = hidden.dims[1];
    return this.qh.run({
      hidden: new ort.Tensor('float32', f, [1, t, hidden.dims[2]]),
      mask: new ort.Tensor('int64', bigints(new Array(t).fill(1)), [1, t]),
    });
  }

  async runEncoder(syms, step) {
    const r = await this.enc.run({
      symbols: new ort.Tensor('int64', bigints(syms), [1, syms.length]),
      step: new ort.Tensor('int64', bigints([step]), [1]),
    });
    return await dataOf(r.vec);
  }

  static async argmaxLast(logits) {
    const [, t, v] = logits.dims;
    const d = await dataOf(logits);
    const off = (t - 1) * v;
    let best = 0;
    let bv = -Infinity;
    for (let i = 0; i < v; i++) if (d[off + i] > bv) { bv = d[off + i]; best = i; }
    return best;
  }

  async addVec(hidden, vec, row) {
    const h = Float32Array.from(await dataOf(hidden));
    const H = hidden.dims[2];
    for (let i = 0; i < H; i++) h[row * H + i] += vec[i];
    return new ort.Tensor('float32', h, hidden.dims);
  }

  /** Greedy decode.  `syms` non-null turns on the latent injection. */
  async generate(ids, syms = null) {
    let loC = this.emptyCache(this.meta.n_lower_layers);
    let upC = this.emptyCache(this.meta.n_upper_layers);
    const t = ids.length - 1;
    const pos0 = [...ids.keys()];
    let r = await this.runLower(ids, pos0, loC);
    loC = r.cache;
    const promptHidden = r.hidden;
    let hidden = promptHidden;
    if (syms) {
      hidden = await this.addVec(hidden,
        await this.runEncoder(syms, -1), t);
    }
    let u = await this.runUpper(hidden, pos0, upC);
    upC = u.cache;
    let nxt = await LatentModel.argmaxLast(u.logits);
    const gen = [];
    for (let step = 0; step < MAX_NEW; step++) {
      gen.push(nxt);
      const stop = (nxt === this.newline || nxt === this.eos)
        && this.tok.decode(gen).trim() !== '';
      if (stop || step === MAX_NEW - 1) break;
      const pos = [t + 1 + step];
      r = await this.runLower([nxt], pos, loC);
      loC = r.cache;
      let h = r.hidden;
      if (syms) h = await this.addVec(h, await this.runEncoder(syms, step), 0);
      u = await this.runUpper(h, pos, upC);
      upC = u.cache;
      nxt = await LatentModel.argmaxLast(u.logits);
    }
    const text = this.tok.decode(gen).trim().split('\n')[0].trim();
    return { text, gen, promptHidden };
  }

  /** All three routes for one prompt. */
  async answer(prompt, querySource = 'learned') {
    const out = { prompt, querySource };
    const ids = this.tok.encode(prompt);

    let t0 = performance.now();
    const frozen = await this.generate(ids);
    out.frozen = { text: frozen.text, tokens: frozen.gen.length,
      ms: performance.now() - t0 };

    t0 = performance.now();
    let query = null;
    let result = null;
    if (querySource === 'regex') {
      const q = regexExtract(prompt);
      if (q) {
        query = `${q.op} ${q.a} ${q.b}`;
        result = regexCalculate(q.op, q.a, q.b);
      }
    } else {
      const loC = this.emptyCache(this.meta.n_lower_layers);
      const r0 = await this.runLower(ids, [...ids.keys()], loC);
      const qout = await this.runQueryHead(r0.hidden);
      const op = await dataOf(qout.op_logits);
      let oi = 0;
      for (let i = 1; i < 4; i++) if (op[i] > op[oi]) oi = i;
      const sl = await dataOf(qout.slot_logits);      // [1, 12, 11]
      const slots = [];
      for (let s = 0; s < 12; s++) {
        let b = 0;
        for (let c = 1; c < 11; c++) if (sl[s * 11 + c] > sl[s * 11 + b]) b = c;
        slots.push(b);
      }
      const a = decodeOperand(slots.slice(0, N_OPERAND_SLOTS));
      const bb = decodeOperand(slots.slice(N_OPERAND_SLOTS));
      query = `${OPS[oi]} ${a} ${bb}`;
      result = calculate(oi, slots.slice(0, N_OPERAND_SLOTS),
        slots.slice(N_OPERAND_SLOTS));
    }
    if (result === null) {
      out.latent = { text: '', tokens: 0, ms: performance.now() - t0,
        query: null, calculator: null };
    } else {
      const lat = await this.generate(ids, resultSymbolsLeft(result));
      out.latent = { text: lat.text, tokens: lat.gen.length,
        ms: performance.now() - t0, query, calculator: result };
    }

    t0 = performance.now();
    const tool = ' [' + (result === null ? '?' : result) + ']';
    const txt = await this.generate(this.tok.encode(prompt + tool));
    out.text = { text: txt.text, tokens: txt.gen.length,
      ms: performance.now() - t0, tool };
    return out;
  }
}

// --------------------------------------------------------------------- UI
function el(id) { return document.getElementById(id); }

function ui() {
  const logBox = el('log');
  const log = (m) => {
    logBox.textContent += m + '\n';
    logBox.scrollTop = logBox.scrollHeight;
  };
  const model = new LatentModel(log);
  window.LC = { model, loaded: false, last: null };

  // meta.json advertises int8, which was never uploaded; a 404 four minutes
  // into a load reads as a broken page.  Ask the host what it actually has.
  (async () => {
    try {
      const base = await pickBase(MODEL_BASES);
      const meta = await (await fetch(base + 'meta.json')).json();
      const have = await availableVariants(base, meta);
      const sel = el('variant');
      sel.innerHTML = '';
      const auto = document.createElement('option');
      auto.value = 'auto';
      auto.textContent = 'auto';
      sel.appendChild(auto);
      for (const name of have) {
        const o = document.createElement('option');
        o.value = name;
        o.textContent = `${name} \u2014 ${(variantBytes(meta, name) / 1e6)
          .toFixed(0)} MB` + (name === 'fp16' ? ' (WebGPU)' : '');
        sel.appendChild(o);
      }
      sel.value = 'auto';
      el('variantBadge').textContent = have.join(' / ') + ' available';
      el('backend').textContent = navigator.gpu ? 'webgpu available' : 'wasm';
      log(`weights: ${base}`);
      log(`variants served: ${have.join(', ')}`);
    } catch (e) {
      log('could not read the weight manifest: ' + e.message);
      el('backend').textContent = 'no model host';
    }
  })();

  el('examples').innerHTML = '';
  for (const ex of EXAMPLES) {
    const b = document.createElement('button');
    b.className = 'ex';
    b.textContent = ex;
    b.onclick = () => { el('prompt').value = ex; };
    el('examples').appendChild(b);
  }

  async function load() {
    el('load').disabled = true;
    el('run').disabled = true;
    el('backend').textContent = 'loading…';
    const variant = el('variant').value;
    const backend = el('backendSel').value;
    const t0 = performance.now();
    try {
      await model.init({ variant, backend });
      el('backend').textContent = 'backend: ' + model.backend;
      el('variantBadge').textContent = 'weights: ' + model.variant;
      el('threadsBadge').textContent = 'wasm threads: ' + model.threads;
      log(`loaded in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
      window.LC.loaded = true;
      window.LC.backend = model.backend;
      el('run').disabled = false;
    } catch (e) {
      el('backend').textContent = 'load failed';
      log('load failed: ' + e.message);
      window.LC.error = e.message;
    }
    el('load').disabled = false;
  }

  async function run() {
    el('run').disabled = true;
    const prompt = el('prompt').value;
    const src = el('query').value;
    try {
      const r = await model.answer(prompt, src);
      window.LC.last = r;
      render(r);
    } catch (e) {
      log('run failed: ' + e.message);
      window.LC.error = e.message;
    }
    el('run').disabled = false;
  }

  function render(r) {
    el('resultPanel').hidden = false;
    const rows = [
      ['frozen model', r.frozen, 'nothing'],
      ['tool as text', r.text, `${r.text.tool} (${r.text.tool.length} chars)`],
      ['latent port', r.latent, 'one vector per answer step, zero tokens'],
    ];
    el('results').innerHTML = rows.map(([name, a, what]) => `
      <tr><td>${name}</td>
      <td class="out mono">${escapeHtml(a.text || '(empty)')}</td>
      <td class="num">${a.tokens}</td>
      <td class="num">${a.ms.toFixed(0)}</td>
      <td class="note">${escapeHtml(what)}</td></tr>`).join('');
    el('qinfo').innerHTML = `
      <div><dt>query source</dt><dd>${r.querySource === 'regex'
        ? 'regex over the prompt text' : 'learned head over layer 16'}</dd></div>
      <div><dt>decoded query</dt><dd>${escapeHtml(r.latent.query || '(none)')}</dd></div>
      <div><dt>calculator</dt><dd>${escapeHtml(r.latent.calculator || '(none)')}</dd></div>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  el('load').onclick = load;
  el('run').onclick = run;
  const clear = el('clearCache');
  if (clear) {
    clear.onclick = async () => {
      const gone = await clearWeightCache();
      model.bufCache.clear();
      model.bytesFetched = 0;
      log(gone ? 'cached weights deleted' : 'no cached weights to delete');
    };
  }
  el('prompt').onkeydown = (e) => {
    if (e.key === 'Enter' && !el('run').disabled) run();
  };
  window.LC.load = load;
  window.LC.answer = (p, s) => model.answer(p, s);
  if (new URLSearchParams(location.search).get('autoload') === '1') load();
}

if (typeof document !== 'undefined' && document.getElementById('run')) ui();
