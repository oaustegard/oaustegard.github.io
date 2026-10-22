// A WebGPU inference engine, in hand-written WGSL, for the small query embedders of ettin-native:
// Ettin-17m (ModernBERT) and leaf-ir (BERT). It reads the same single-file model.onnx that
// onnxruntime-web loads, through web/models/<pkg>/manifest.json (each tensor's byte range in the file,
// run/webexport.py), so a page that keeps onnxruntime-web as a fallback downloads the weights once.
// run/ref.py is the NumPy spec it follows.
//
//   const eng = await SmallEngine.create(device, manifest, modelOnnxBytes);
//   const vecs = await eng.embed([ids0, ids1, ...]);   // Float32Array[B * 768], unit rows
//
// Weights stay in their shipped formats: int8 matmul codes with one f32 scale per output column
// (transposed once at init from the file's [K, N] to [N, K]), a 4-bit (packed nibbles, fp16 scale per 32) or 3-bit (eg2-layer-student layout)
// token table, f32 norms and biases. Activations are f32 throughout. Several sequences run in one
// pass, packed back to back; attention stays inside each sequence.
// Pattern from eg2-wgsl-engine/web/engine.js (manifest, static bind groups, packed batches).

const MAX_SEQ = 128;
const NONE = 0xffffffff;

const HEADER = /* wgsl */ `
struct P { a: vec4<u32>, b: vec4<u32>, f: vec4<f32> };
struct Dyn { n: vec4<u32> };            // x: tokens in the batch, y: sequences
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<uniform> dn: Dyn;
`;
const BYTE = /* wgsl */ `
fn wbyte(i: u32) -> u32 { return (W[i >> 2u] >> ((i & 3u) * 8u)) & 255u; }
fn wf16(byteOff: u32) -> f32 { return unpack2x16float(W[byteOff >> 2u])[(byteOff >> 1u) & 1u]; }
fn wf32(word: u32) -> f32 { return bitcast<f32>(W[word]); }
`;
// Abramowitz & Stegun 7.1.26 (|error| < 1.5e-7): the exact-erf GELU both models use.
const GELU = /* wgsl */ `
fn gelu(x: f32) -> f32 {
  let a = abs(x) * 0.7071067811865476;
  let t = 1.0 / (1.0 + 0.3275911 * a);
  let y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-a * a);
  return 0.5 * x * (1.0 + sign(x) * y);
}
`;

const SHADERS = {
  // e[t, j] = table(id)[j] (+ pos[p, j] + type0[j] for BERT). One workgroup per token.
  // p.a = (H, bits, codes byte offset, scales byte offset); p.b = (zp byte offset, pos word offset or NONE, type0 word offset).
  embed: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> W: array<u32>;
@group(0) @binding(3) var<storage, read> tok: array<vec4<u32>>;
@group(0) @binding(4) var<storage, read_write> y: array<f32>;
${BYTE}
@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) l: u32) {
  let t = wid.x;
  if (t >= dn.n.x) { return; }
  let H = p.a.x; let id = tok[t].x; let pos = tok[t].y;
  let G = H / 32u;
  for (var j = l; j < H; j += 64u) {
    let s = wf16(p.a.w + (id * G + j / 32u) * 2u);
    var v: f32;
    if (p.a.y == 4u) {
      let b = wbyte(p.a.z + id * (H / 2u) + j / 2u);
      v = (f32((b >> ((j & 1u) * 4u)) & 15u) - 8.0) * s;
    } else {
      let cb = p.a.z + id * (H / 8u) * 3u + (j / 8u) * 3u;
      let word = wbyte(cb) | (wbyte(cb + 1u) << 8u) | (wbyte(cb + 2u) << 16u);
      let z = f32(wbyte(p.b.x + id * G + j / 32u));
      v = (f32((word >> (3u * (j & 7u))) & 7u) - z) * s;
    }
    if (p.b.y != ${NONE}u) { v += wf32(p.b.y + pos * H + j) + wf32(p.b.z + j); }
    y[t * H + j] = v;
  }
}`,

  // LayerNorm over rows of D (<= 512). mode 0: y = LN(x); mode 1: y = LN(y + x) (residual, in place).
  // p.a = (D, weight word offset, bias word offset or NONE, mode); p.b.x = rows selector; p.f.x = eps.
  norm: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> W: array<u32>;
@group(0) @binding(3) var<storage, read> x: array<f32>;
@group(0) @binding(4) var<storage, read_write> y: array<f32>;
var<workgroup> red: array<f32, 64>;
${BYTE}
@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) l: u32) {
  let r = wid.x;
  if (r >= dn.n[p.b.x]) { return; }
  let D = p.a.x; let base = r * D;
  var v: array<f32, 8>;
  var s = 0.0;
  var c = 0u;
  for (var j = l; j < D; j += 64u) {
    var a = x[base + j];
    if (p.a.w == 1u) { a += y[base + j]; }
    v[c] = a; s += a; c++;
  }
  red[l] = s;
  workgroupBarrier();
  for (var k = 32u; k > 0u; k >>= 1u) { if (l < k) { red[l] += red[l + k]; } workgroupBarrier(); }
  let mu = red[0] / f32(D);
  workgroupBarrier();
  var q = 0.0;
  for (var i = 0u; i < c; i++) { let d = v[i] - mu; q += d * d; }
  red[l] = q;
  workgroupBarrier();
  for (var k = 32u; k > 0u; k >>= 1u) { if (l < k) { red[l] += red[l + k]; } workgroupBarrier(); }
  let inv = 1.0 / sqrt(red[0] / f32(D) + p.f.x);
  c = 0u;
  for (var j = l; j < D; j += 64u) {
    var o = (v[c] - mu) * inv * wf32(p.a.y + j);
    if (p.a.z != ${NONE}u) { o += wf32(p.a.z + j); }
    y[base + j] = o; c++;
  }
}`,

  // Y[r, n] = sum_k X[r, k] W[n, k] (* scale[n]) (+ bias[n]), then gelu (mode bit 0) and either
  // store or add into Y (mode bit 1). Workgroup: 32 columns x 8 k-splits, 8 rows; each thread reads
  // 4 weights per u32 and applies them to all 8 rows (eg2-wgsl-engine's matmul layout).
  // Weights [N, K]: int8 from the repacked buffer Wt (transposed at init from the file's [K, N]),
  // or f32 straight from W (kind 1). p.a = (weight word offset, scale word offset in W, N, K);
  // p.b = (bias word offset in W or NONE, mode, rows selector, kind: 0 int8 in Wt, 1 f32 [N, K] in W).
  matmul: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> W: array<u32>;
@group(0) @binding(3) var<storage, read> Wt: array<u32>;
@group(0) @binding(4) var<storage, read> X: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read_write> Y: array<f32>;
var<workgroup> red: array<f32, 2048>;
${GELU}
fn i8x4(w: u32) -> vec4<f32> {
  return vec4<f32>(f32(bitcast<i32>(w << 24u) >> 24u), f32(bitcast<i32>(w << 16u) >> 24u),
                   f32(bitcast<i32>(w << 8u) >> 24u), f32(bitcast<i32>(w) >> 24u));
}
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) l: u32) {
  let N = p.a.z; let K = p.a.w; let K4 = K / 4u; let kind = p.b.w;
  let rows = dn.n[p.b.z];
  let nl = l % 32u; let ks = l / 32u;
  let n = wid.x * 32u + nl;
  let r0 = wid.y * 8u;
  var rr: array<u32, 8>;
  for (var t = 0u; t < 8u; t++) { rr[t] = min(r0 + t, rows - 1u) * K4; }
  var acc = array<f32, 8>(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
  let per = K4 / 8u;
  for (var kq = ks * per; kq < (ks + 1u) * per; kq++) {
    var w: vec4<f32>;
    if (kind == 0u) { w = i8x4(Wt[p.a.x + n * K4 + kq]); }
    else { let o = p.a.x + n * K + kq * 4u; w = vec4<f32>(bitcast<f32>(W[o]), bitcast<f32>(W[o + 1u]), bitcast<f32>(W[o + 2u]), bitcast<f32>(W[o + 3u])); }
    for (var t = 0u; t < 8u; t++) { acc[t] += dot(w, X[rr[t] + kq]); }
  }
  for (var t = 0u; t < 8u; t++) { red[(ks * 8u + t) * 32u + nl] = acc[t]; }
  workgroupBarrier();
  let t = l / 32u;
  let r = r0 + t;
  if (r >= rows) { return; }
  var s = 0.0;
  for (var j = 0u; j < 8u; j++) { s += red[(j * 8u + t) * 32u + nl]; }
  if (kind == 0u) { s *= bitcast<f32>(W[p.a.y + n]); }
  if (p.b.x != ${NONE}u) { s += bitcast<f32>(W[p.b.x + n]); }
  if ((p.b.y & 1u) != 0u) { s = gelu(s); }
  if ((p.b.y & 2u) != 0u) { Y[r * N + n] += s; } else { Y[r * N + n] = s; }
}`,

  // RoPE on the q and k parts of a fused [T, 3H] qkv buffer, in place (rotate_half convention).
  // p.a = (heads, head dim D, row stride, table: 0 global theta, 1 local theta).
  rope: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> rope: array<f32>;
@group(0) @binding(3) var<storage, read> tok: array<vec4<u32>>;
@group(0) @binding(4) var<storage, read_write> qkv: array<f32>;
@compute @workgroup_size(128)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) l: u32) {
  let t = wid.x;
  if (t >= dn.n.x) { return; }
  let nh = p.a.x; let D = p.a.y; let half = D / 2u;
  let pos = tok[t].y;
  let tb = (p.a.w * ${MAX_SEQ}u + pos) * half;
  let sinOff = 2u * ${MAX_SEQ}u * half;
  for (var i = l; i < 2u * nh * half; i += 128u) {
    let part = i / (nh * half);              // 0 = q, 1 = k
    let h = (i / half) % nh; let d = i % half;
    let base = t * p.a.z + part * nh * D + h * D;
    let c = rope[tb + d]; let s = rope[sinOff + tb + d];
    let x1 = qkv[base + d]; let x2 = qkv[base + d + half];
    qkv[base + d] = x1 * c - x2 * s;
    qkv[base + d + half] = x2 * c + x1 * s;
  }
}`,

  // Bidirectional attention inside each packed sequence, optionally limited to |i - j| <= window / 2.
  // One workgroup per (token, head); thread j scores key j (sequences <= 128), then threads d < D sum values.
  // p.a = (heads, D, row stride of q/k/v, q offset); p.b = (k offset, v offset, window or 0); p.f.x = scale.
  attn: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> tok: array<vec4<u32>>;
@group(0) @binding(3) var<storage, read> seqs: array<vec4<u32>>;
@group(0) @binding(4) var<storage, read> Q: array<f32>;
@group(0) @binding(5) var<storage, read> Kb: array<f32>;
@group(0) @binding(6) var<storage, read> Vb: array<f32>;
@group(0) @binding(7) var<storage, read_write> O: array<f32>;
var<workgroup> qs: array<f32, 64>;
var<workgroup> pr: array<f32, 128>;
var<workgroup> red: array<f32, 128>;
@compute @workgroup_size(128)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) i: u32) {
  let t = wid.x; let h = wid.y;
  if (t >= dn.n.x) { return; }
  let nh = p.a.x; let D = p.a.y; let st = p.a.z;
  let tk = tok[t];
  let sq = seqs[tk.z];
  let start = sq.x; let len = sq.y;
  if (i < D) { qs[i] = Q[t * st + p.a.w + h * D + i]; }
  workgroupBarrier();
  var sc = -3.0e38;
  if (i < len) {
    let pi = i32(tk.y); let pj = i32(i);
    if (p.b.z == 0u || u32(abs(pi - pj)) <= p.b.z / 2u) {
      let kb = (start + i) * st + p.b.x + h * D;
      var d = 0.0;
      for (var j = 0u; j < D; j++) { d += qs[j] * Kb[kb + j]; }
      sc = d * p.f.x;
    }
  }
  red[i] = sc;
  workgroupBarrier();
  for (var s = 64u; s > 0u; s >>= 1u) { if (i < s) { red[i] = max(red[i], red[i + s]); } workgroupBarrier(); }
  let mx = red[0];
  workgroupBarrier();
  var e = 0.0;
  if (sc > -1.0e38) { e = exp(sc - mx); }
  pr[i] = e; red[i] = e;
  workgroupBarrier();
  for (var s = 64u; s > 0u; s >>= 1u) { if (i < s) { red[i] += red[i + s]; } workgroupBarrier(); }
  let inv = 1.0 / red[0];
  if (i < D) {
    var a = 0.0;
    for (var j = 0u; j < len; j++) { a += pr[j] * Vb[(start + j) * st + p.b.y + h * D + i]; }
    O[t * nh * D + h * D + i] = a * inv;
  }
}`,

  // ModernBERT GLU: g[r, j] = gelu(u[r, j]) * u[r, I + j].  p.a.x = I.
  glu: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> u: array<f32>;
@group(0) @binding(3) var<storage, read_write> g: array<f32>;
${GELU}
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let I = p.a.x;
  let idx = gid.x;
  if (idx >= dn.n.x * I) { return; }
  let r = idx / I; let j = idx % I;
  g[idx] = gelu(u[r * 2u * I + j]) * u[r * 2u * I + I + j];
}`,

  // Mean over each sequence's tokens: [tokens, H] -> [sequences, H].  p.a.x = H.
  pool: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> seqs: array<vec4<u32>>;
@group(0) @binding(3) var<storage, read> x: array<f32>;
@group(0) @binding(4) var<storage, read_write> y: array<f32>;
@compute @workgroup_size(128)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) l: u32) {
  let b = wid.x;
  if (b >= dn.n.y) { return; }
  let H = p.a.x; let sq = seqs[b];
  for (var j = l; j < H; j += 128u) {
    var s = 0.0;
    for (var t = 0u; t < sq.y; t++) { s += x[(sq.x + t) * H + j]; }
    y[b * H + j] = s / f32(sq.y);
  }
}`,

  // L2-normalize rows of 768.
  l2: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> x: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) i: u32) {
  _ = p.a;
  let b = wid.x;
  if (b >= dn.n.y) { return; }
  let a0 = x[b * 768u + i]; let a1 = x[b * 768u + i + 256u]; let a2 = x[b * 768u + i + 512u];
  red[i] = a0 * a0 + a1 * a1 + a2 * a2;
  workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (i < s) { red[i] += red[i + s]; } workgroupBarrier(); }
  let inv = 1.0 / max(sqrt(red[0]), 1e-12);
  y[b * 768u + i] = a0 * inv; y[b * 768u + i + 256u] = a1 * inv; y[b * 768u + i + 512u] = a2 * inv;
}`,
};

const U = GPUBufferUsage;

export class SmallEngine {
  // manifest: web/models/<pkg>/manifest.json (copied; offsets are rewritten); data: model.onnx bytes.
  // opts.maxTokens bounds one batch (all sequences together); each sequence is at most 128 tokens.
  static async create(device, manifest, data, opts = {}) {
    const e = new SmallEngine(device, structuredClone(manifest), opts);
    await e._init(data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
    return e;
  }

  constructor(device, manifest, opts) {
    this.device = device;
    this.m = manifest;
    this.maxTokens = opts.maxTokens ?? 512;
    this.maxSeqs = opts.maxSeqs ?? 64;
    this.dim = manifest.dim;
  }

  async _init(bytes) {
    const dev = this.device, m = this.m, T = this.maxTokens, B = this.maxSeqs;
    const H = m.hidden, nh = m.heads, D = H / nh;
    if (m.dim !== 768 || D > 64 || H > 512 || H % 32) throw new Error("unexpected manifest shape");
    // The manifest gives each tensor's byte range inside model.onnx, where protobuf leaves them
    // unaligned. Copy every tensor once into a 4-byte-aligned buffer and point the manifest at it.
    const tensors = [];
    const collect = (o) => { if (o && typeof o === "object") { if ("offset" in o && "length" in o) tensors.push(o); else Object.values(o).forEach(collect); } };
    collect(m);
    let total = 0;
    for (const t of tensors) { t._src = t.offset; t.offset = total; total += Math.ceil(t.length / 4) * 4; }
    const packed = new Uint8Array(Math.max(16, total));
    for (const t of tensors) packed.set(bytes.subarray(t._src, t._src + t.length), t.offset);
    bytes = packed;
    this.W = dev.createBuffer({ size: packed.byteLength, usage: U.STORAGE | U.COPY_DST, label: "weights" });
    dev.queue.writeBuffer(this.W, 0, packed);

    const buf = (n, label, extra = 0) => dev.createBuffer({ size: Math.max(16, n * 4), usage: U.STORAGE | U.COPY_SRC | extra, label });
    // RoPE tables [global, local][pos][D/2]: cos block, then sin block. Angles formed in float32 like the graph.
    const half = D / 2;
    const rope = new Float32Array(2 * 2 * MAX_SEQ * half);
    if (m.arch === "modernbert") {
      [m.theta_global, m.theta_local].forEach((theta, sel) => {
        for (let i = 0; i < half; i++) {
          const inv = Math.fround(1 / Math.fround(Math.pow(theta, Math.fround((2 * i) / D))));
          for (let pos = 0; pos < MAX_SEQ; pos++) {
            const ang = Math.fround(pos * inv);
            rope[(sel * MAX_SEQ + pos) * half + i] = Math.cos(ang);
            rope[2 * MAX_SEQ * half + (sel * MAX_SEQ + pos) * half + i] = Math.sin(ang);
          }
        }
      });
    }
    this.rope = buf(rope.length, "rope", U.COPY_DST);
    dev.queue.writeBuffer(this.rope, 0, rope);
    const I = m.inter;
    const bert = m.arch === "bert";
    const B_ = {
      tok: buf(T * 4, "tok", U.COPY_DST), seqs: buf(B * 4, "seqs", U.COPY_DST),
      e: buf(T * H, "e"), h: buf(T * H, "h"), a: buf(T * H, "a"), o: buf(T * H, "o"), t: buf(T * H, "t"),
      qkv: buf(T * 3 * H, "qkv"), u: buf(T * (bert ? I : 2 * I), "u"), g: buf(T * I, "g"),
      pooled: buf(B * H, "pooled"), d: buf(B * 768, "d"), out: buf(B * 768, "out"),
    };
    this.b = B_;
    this.dyn = dev.createBuffer({ size: 16, usage: U.UNIFORM | U.COPY_DST, label: "dyn" });
    this.read = dev.createBuffer({ size: B * 768 * 4, usage: U.MAP_READ | U.COPY_DST, label: "readback" });

    const pipes = {};
    await Promise.all(Object.entries(SHADERS).map(async ([name, code]) => {
      const module = dev.createShaderModule({ code, label: name });
      const info = await module.getCompilationInfo();
      const errs = info.messages.filter((x) => x.type === "error");
      if (errs.length) throw new Error(`${name} WGSL: ` + errs.map((x) => `${x.lineNum}:${x.linePos} ${x.message}`).join("; "));
      pipes[name] = await dev.createComputePipelineAsync({ layout: "auto", compute: { module, entryPoint: "main" }, label: name });
    }));
    this.pipes = pipes;

    this.steps = [];
    const step = (kind, params, bufs, grid) => {
      const u = new ArrayBuffer(48);
      const pad = (x) => (x ?? []).concat(Array(4 - (x ?? []).length).fill(0));
      new Uint32Array(u, 0, 8).set(pad(params.a).concat(pad(params.b)));
      new Float32Array(u, 32, 4).set(pad(params.f));
      const ub = dev.createBuffer({ size: 48, usage: U.UNIFORM | U.COPY_DST, label: kind });
      dev.queue.writeBuffer(ub, 0, u);
      const entries = [{ binding: 0, resource: { buffer: ub } }, { binding: 1, resource: { buffer: this.dyn } }]
        .concat(bufs.map((b, i) => ({ binding: i + 2, resource: { buffer: b } })));
      this.steps.push({ kind, bg: dev.createBindGroup({ layout: pipes[kind].getBindGroupLayout(0), entries }), grid });
    };
    const word = (t) => { if (t.offset % 4) throw new Error("unaligned f32 tensor"); return t.offset / 4; };
    // Transpose every int8 matmul from the file's [K, N] to [N, K] (4 k per u32) into one buffer, once.
    const lins = [];
    const walk = (o) => { if (o && typeof o === "object") { if (o.q && o.s) lins.push(o); else Object.values(o).forEach(walk); } };
    walk(m);
    let words = 0;
    for (const w of lins) { if (w.K % 32 || w.N % 32) throw new Error("matmul shape"); w._wt = words; words += w.N * w.K / 4; }
    const wt = new Int8Array(words * 4);
    for (const w of lins) {
      const src = new Int8Array(bytes.buffer, bytes.byteOffset + w.q.offset, w.K * w.N), dst = w._wt * 4;
      for (let k = 0; k < w.K; k++) for (let n = 0; n < w.N; n++) wt[dst + n * w.K + k] = src[k * w.N + n];
    }
    this.Wt = dev.createBuffer({ size: Math.max(16, wt.byteLength), usage: U.STORAGE | U.COPY_DST, label: "int8 weights [N, K]" });
    dev.queue.writeBuffer(this.Wt, 0, wt);
    const mm = (w, X, Y, mode = 0, rowsSel = 0) => {
      let kind, a0, s = 0;
      if (w.q) { kind = 0; a0 = w._wt; s = word(w.s); }
      else if (w.f32_t) { kind = 1; a0 = word(w.f32_t); }
      else throw new Error("f32 [K, N] matmul weights are not supported; export them as [N, K]");
      if (w.K % 32 || w.N % 32) throw new Error("matmul shape");
      step("matmul", { a: [a0, s, w.N, w.K], b: [w.b ? word(w.b) : NONE, mode, rowsSel, kind] }, [this.W, this.Wt, X, Y],
           (n) => [w.N / 32, Math.ceil(n[rowsSel] / 8)]);
    };
    const norm = (w, b, X, Y, mode = 0, rowsSel = 0, Dn = H) =>
      step("norm", { a: [Dn, word(w), b ? word(b) : NONE, mode], b: [rowsSel], f: [m.eps] }, [this.W, X, Y], (n) => [n[rowsSel]]);
    const attn = (Q, K, V, stride, offs, window) =>
      step("attn", { a: [nh, D, stride, offs[0]], b: [offs[1], offs[2], window], f: [1 / Math.sqrt(D)] },
           [B_.tok, B_.seqs, Q, K, V, B_.o], (n) => [n[0], nh]);

    const tb = m.table;
    step("embed", { a: [H, tb.bits, tb.codes.offset, tb.scales.offset],
                    b: [tb.zp ? tb.zp.offset : 0, bert ? word(m.pos) : NONE, bert ? word(m.type0) : 0] },
         [this.W, B_.tok, B_.e], (n) => [n[0]]);
    if (!bert) {
      norm(m.emb_norm, null, B_.e, B_.h);
      m.layers.forEach((L) => {
        let X = B_.h;
        if (L.attn_norm) { norm(L.attn_norm, null, B_.h, B_.a); X = B_.a; }
        mm(L.Wqkv, X, B_.qkv);
        step("rope", { a: [nh, D, 3 * H, L.global ? 0 : 1] }, [this.rope, B_.tok, B_.qkv], (n) => [n[0]]);
        attn(B_.qkv, B_.qkv, B_.qkv, 3 * H, [0, H, 2 * H], L.global ? 0 : m.window);
        mm(L.Wo, B_.o, B_.h, 2);
        norm(L.mlp_norm, null, B_.h, B_.a);
        mm(L.Wi, B_.a, B_.u);
        step("glu", { a: [I] }, [B_.u, B_.g], (n) => [Math.ceil(n[0] * I / 256)]);
        mm(L.Wo_mlp, B_.g, B_.h, 2);
      });
      norm(m.final_norm, null, B_.h, B_.a);
      step("pool", { a: [H] }, [B_.seqs, B_.a, B_.pooled], (n) => [n[1]]);
    } else {
      norm(m.emb_ln.w, m.emb_ln.b, B_.e, B_.h);
      m.layers.forEach((L) => {
        mm(L.q, B_.h, B_.a); mm(L.k, B_.h, B_.t); mm(L.v, B_.h, B_.e);
        attn(B_.a, B_.t, B_.e, H, [0, 0, 0], 0);
        mm(L.o, B_.o, B_.t);
        norm(L.ln1.w, L.ln1.b, B_.t, B_.h, 1);
        mm(L.up, B_.h, B_.u, 1);
        mm(L.down, B_.u, B_.t);
        norm(L.ln2.w, L.ln2.b, B_.t, B_.h, 1);
      });
      step("pool", { a: [H] }, [B_.seqs, B_.h, B_.pooled], (n) => [n[1]]);
    }
    mm(m.dense, B_.pooled, B_.d, 0, 1);
    step("l2", { a: [] }, [B_.d, B_.out], (n) => [n[1]]);
    await dev.queue.onSubmittedWorkDone();
  }

  _record(enc, batch, nSteps = Infinity) {
    const T = batch.reduce((s, x) => s + x.length, 0), B = batch.length;
    if (!B || T > this.maxTokens || B > this.maxSeqs) throw new Error(`batch of ${B} sequences / ${T} tokens exceeds the engine's limits`);
    const tok = new Uint32Array(T * 4), seqs = new Uint32Array(B * 4);
    let o = 0;
    batch.forEach((ids, b) => {
      if (!ids.length || ids.length > MAX_SEQ) throw new Error(`sequence length ${ids.length} not in 1..${MAX_SEQ}`);
      seqs.set([o, ids.length], b * 4);
      ids.forEach((id, j) => tok.set([id, j, b], (o + j) * 4));
      o += ids.length;
    });
    const q = this.device.queue;
    q.writeBuffer(this.b.tok, 0, tok);
    q.writeBuffer(this.b.seqs, 0, seqs);
    q.writeBuffer(this.dyn, 0, new Uint32Array([T, B, 0, 0]));
    const pass = enc.beginComputePass();
    const n = [T, B];
    for (const s of this.steps.slice(0, nSteps)) {
      pass.setPipeline(this.pipes[s.kind]);
      pass.setBindGroup(0, s.bg);
      pass.dispatchWorkgroups(...s.grid(n));
    }
    pass.end();
    return B;
  }

  // Embed sequences of token ids; returns a Float32Array of B * 768 unit vectors.
  async embed(batch) {
    const enc = this.device.createCommandEncoder();
    const B = this._record(enc, batch);
    enc.copyBufferToBuffer(this.b.out, 0, this.read, 0, B * 768 * 4);
    this.device.queue.submit([enc.finish()]);
    await this.read.mapAsync(GPUMapMode.READ, 0, B * 768 * 4);
    const out = new Float32Array(this.read.getMappedRange(0, B * 768 * 4).slice(0));
    this.read.unmap();
    return out;
  }

  // Debugging: run the first nSteps dispatches and read `count` floats of an activation buffer.
  async probe(batch, nSteps, name, count) {
    const enc = this.device.createCommandEncoder();
    this._record(enc, batch, nSteps);
    const rb = this.device.createBuffer({ size: count * 4, usage: U.MAP_READ | U.COPY_DST });
    enc.copyBufferToBuffer(this.b[name], 0, rb, 0, count * 4);
    this.device.queue.submit([enc.finish()]);
    await rb.mapAsync(GPUMapMode.READ);
    const out = new Float32Array(rb.getMappedRange().slice(0));
    rb.destroy();
    return out;
  }

  destroy() {
    for (const b of Object.values(this.b)) b.destroy();
    this.W.destroy(); this.Wt.destroy(); this.rope.destroy(); this.dyn.destroy(); this.read.destroy();
  }
}
