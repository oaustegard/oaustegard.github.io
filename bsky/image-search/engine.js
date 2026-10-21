// A WebGPU inference engine, in hand-written WGSL, for EmbeddingGemma 2 cut to its first k layers
// (oaustegard/experiments eg2-layer-student). It runs the same graph as model_t3w.onnx and reads the
// same weights file (model_t3w.onnx_data) through a manifest of byte offsets (run/manifest.py), so a
// page that also keeps onnxruntime-web as a fallback downloads the weights once.
//
//   const eng = await Eg2Engine.create(device, manifest, onnxDataArrayBuffer);
//   const vecs = await eng.embed([ids0, ids1, ...]);   // Float32Array[B * 768], unit rows
//   await eng.embedTo([ids], gpuBuffer);                // leaves the vector on the GPU
//
// Graph, per token: 3-bit token table -> x * sqrt(512); PLE = rms(x W_ple * 512^-0.5) per layer;
// k layers of [rms -> q,k,v (q4) -> q/k rms+weight, v rms, RoPE -> bidirectional GQA attention ->
// o -> h += rms(o)*w ; h += rms(mlp(rms(h)*w))*w ; h = (h + rms(W_p(gelu(W_g h) * ple_i))*w) * s];
// then rms(h)*w, mean over the sequence, the 512->768 projection (q4) and L2 normalization. The
// projection is linear, so it runs once per sequence after pooling instead of once per token.
// Several sequences run in one pass, packed back to back; attention stays inside each sequence.

const WG_MM = 256; // matmul: 32 output columns x 8 k-splits, 8 tokens per workgroup
const MAX_SEQ = 128;

const HEADER = /* wgsl */ `
struct P { a: vec4<u32>, b: vec4<u32>, f: vec4<f32> };
struct Dyn { n: vec4<u32> };            // x: tokens in the batch, y: sequences
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<uniform> dn: Dyn;
`;

// Byte i of the weight file, which is bound as array<u32>.
const BYTE = /* wgsl */ `
fn wbyte(i: u32) -> u32 { return (W[i >> 2u] >> ((i & 3u) * 8u)) & 255u; }
`;

const SHADERS = {
  // One workgroup per token, one thread per 8-value group (3 bytes) of the 512-wide row.
  // p.a = (codes, scales, zp) offsets in words; p.f.x = embedding scale.
  embed: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> W: array<u32>;
@group(0) @binding(3) var<storage, read> tok: array<vec4<u32>>;
@group(0) @binding(4) var<storage, read_write> y: array<f32>;
${BYTE}
@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let t = wid.x;
  if (t >= dn.n.x) { return; }
  let id = tok[t].x;
  let g = lid.x;
  let cb = p.a.x * 4u + id * 192u + g * 3u;
  let word = wbyte(cb) | (wbyte(cb + 1u) << 8u) | (wbyte(cb + 2u) << 16u);
  let blk = g / 4u;
  let z = f32(wbyte(p.a.z * 4u + id * 16u + blk));
  let s = unpack2x16float(W[p.a.y + id * 8u + blk / 2u])[blk % 2u];
  for (var i = 0u; i < 8u; i++) {
    y[t * 512u + g * 8u + i] = (f32((word >> (3u * i)) & 7u) - z) * s * p.f.x;
  }
}`,

  // Y[r, n] = alpha * sum_k X[r, k] W[n, k], W in onnxruntime's MatMulNBits layout (4-bit,
  // block 32, low nibble first, f32 scales, packed 4-bit zero points). Workgroup: 32 columns x 8
  // k-splits, 8 rows; each thread dequantizes its weights once and applies them to all 8 rows.
  // p.a = (q, scales, zp) offsets in words, N; p.b = K, rows selector (0 tokens, 1 sequences).
  matmul: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> W: array<u32>;
@group(0) @binding(3) var<storage, read> X: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read_write> Y: array<f32>;
var<workgroup> red: array<f32, 2048>;
${BYTE}
@compute @workgroup_size(${WG_MM})
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) l: u32) {
  let N = p.a.w; let K = p.b.x;
  let rows = dn.n[p.b.y];
  let nl = l % 32u; let ks = l / 32u;
  let n = wid.x * 32u + nl;
  let r0 = wid.y * 8u;
  let nb = K / 32u; let bps = nb / 8u;
  let K4 = K / 4u;
  var rr: array<u32, 8>;
  for (var t = 0u; t < 8u; t++) { rr[t] = min(r0 + t, rows - 1u) * K4; }
  var acc = array<f32, 8>(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
  let zrow = (nb + 1u) / 2u;
  for (var b = ks * bps; b < (ks + 1u) * bps; b++) {
    let sc = bitcast<f32>(W[p.a.y + n * nb + b]);
    let z = f32((wbyte(p.a.z * 4u + n * zrow + b / 2u) >> (4u * (b % 2u))) & 15u);
    var part = array<f32, 8>(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    for (var w = 0u; w < 4u; w++) {
      let word = W[p.a.x + n * (K / 8u) + b * 4u + w];
      let lo = vec4<f32>(f32(word & 15u), f32((word >> 4u) & 15u), f32((word >> 8u) & 15u), f32((word >> 12u) & 15u)) - z;
      let hi = vec4<f32>(f32((word >> 16u) & 15u), f32((word >> 20u) & 15u), f32((word >> 24u) & 15u), f32(word >> 28u)) - z;
      let k4 = b * 8u + w * 2u;
      for (var t = 0u; t < 8u; t++) {
        part[t] += dot(lo, X[rr[t] + k4]) + dot(hi, X[rr[t] + k4 + 1u]);
      }
    }
    for (var t = 0u; t < 8u; t++) { acc[t] += sc * part[t]; }
  }
  for (var t = 0u; t < 8u; t++) { red[(ks * 8u + t) * 32u + nl] = acc[t]; }
  workgroupBarrier();
  let t = l / 32u;
  var s = 0.0;
  for (var j = 0u; j < 8u; j++) { s += red[(j * 8u + t) * 32u + nl]; }
  if (r0 + t < rows) { Y[(r0 + t) * N + n] = s * p.f.x; }
}`,

  // RMSNorm over rows of D (<= 512) values, one workgroup per row.
  // mode 0: y = rms(x) * w.   mode 1: y = (y + rms(x) * w) * p.f.y  (residual add, then layer scalar).
  // p.a = (D, weight offset in words, mode, rows selector); p.b.x = rows per selected unit; p.f.x = eps.
  norm: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> W: array<u32>;
@group(0) @binding(3) var<storage, read> x: array<f32>;
@group(0) @binding(4) var<storage, read_write> y: array<f32>;
var<workgroup> red: array<f32, 64>;
@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) l: u32) {
  let r = wid.x + wid.y * 65535u;
  if (r >= dn.n[p.a.w] * p.b.x) { return; }
  let D = p.a.x; let per = D / 64u; let base = r * D;
  var v: array<f32, 8>;
  var ss = 0.0;
  for (var i = 0u; i < per; i++) { v[i] = x[base + l * per + i]; ss += v[i] * v[i]; }
  red[l] = ss;
  workgroupBarrier();
  for (var s = 32u; s > 0u; s >>= 1u) {
    if (l < s) { red[l] += red[l + s]; }
    workgroupBarrier();
  }
  let inv = 1.0 / sqrt(red[0] / f32(D) + p.f.x);
  for (var i = 0u; i < per; i++) {
    let j = l * per + i;
    let nv = v[i] * inv * bitcast<f32>(W[p.a.y + j]);
    if (p.a.z == 0u) { y[base + j] = nv; } else { y[base + j] = (y[base + j] + nv) * p.f.y; }
  }
}`,

  // Per-head RMSNorm of q, k (with weights) and v (without), then RoPE on q and k. One workgroup
  // per (token, head slot): slots [0, nh) are q heads, [nh, nh+nkv) k heads, the rest v heads.
  // Head dim 256: thread i holds elements i and i + 128, the pair rotate_half mixes.
  // p.a = (nh, nkv, q_norm offset, k_norm offset); p.f.x = eps.
  prep: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> W: array<u32>;
@group(0) @binding(3) var<storage, read> rope: array<f32>;
@group(0) @binding(4) var<storage, read> tok: array<vec4<u32>>;
@group(0) @binding(5) var<storage, read_write> q: array<f32>;
@group(0) @binding(6) var<storage, read_write> k: array<f32>;
@group(0) @binding(7) var<storage, read_write> v: array<f32>;
var<workgroup> red: array<f32, 128>;
@compute @workgroup_size(128)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) i: u32) {
  let t = wid.x; let slot = wid.y;
  if (t >= dn.n.x) { return; }
  let nh = p.a.x; let nkv = p.a.y;
  var kind = 0u; var base = 0u;
  if (slot < nh) { base = (t * nh + slot) * 256u; }
  else if (slot < nh + nkv) { kind = 1u; base = (t * nkv + slot - nh) * 256u; }
  else { kind = 2u; base = (t * nkv + slot - nh - nkv) * 256u; }
  var x0: f32; var x1: f32;
  if (kind == 0u) { x0 = q[base + i]; x1 = q[base + i + 128u]; }
  else if (kind == 1u) { x0 = k[base + i]; x1 = k[base + i + 128u]; }
  else { x0 = v[base + i]; x1 = v[base + i + 128u]; }
  red[i] = x0 * x0 + x1 * x1;
  workgroupBarrier();
  for (var s = 64u; s > 0u; s >>= 1u) {
    if (i < s) { red[i] += red[i + s]; }
    workgroupBarrier();
  }
  let inv = 1.0 / sqrt(red[0] / 256.0 + p.f.x);
  x0 *= inv; x1 *= inv;
  if (kind == 2u) { v[base + i] = x0; v[base + i + 128u] = x1; return; }
  let wo = select(p.a.w, p.a.z, kind == 0u);
  x0 *= bitcast<f32>(W[wo + i]); x1 *= bitcast<f32>(W[wo + i + 128u]);
  let pos = tok[t].y;
  let c = rope[pos * 128u + i]; let sn = rope[${MAX_SEQ * 128}u + pos * 128u + i];
  let y0 = x0 * c - x1 * sn; let y1 = x1 * c + x0 * sn;
  if (kind == 0u) { q[base + i] = y0; q[base + i + 128u] = y1; }
  else { k[base + i] = y0; k[base + i + 128u] = y1; }
}`,

  // Bidirectional attention inside each packed sequence. One workgroup per (token, query head);
  // thread j scores key j (sequences are at most 128 tokens), then threads i, i + 128 sum the values.
  // p.a = (nh, nkv); p.f.x = score scale.
  attn: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> tok: array<vec4<u32>>;
@group(0) @binding(3) var<storage, read> seqs: array<vec4<u32>>;
@group(0) @binding(4) var<storage, read> q: array<f32>;
@group(0) @binding(5) var<storage, read> k: array<vec4<f32>>;
@group(0) @binding(6) var<storage, read> v: array<f32>;
@group(0) @binding(7) var<storage, read_write> o: array<f32>;
var<workgroup> qs: array<vec4<f32>, 64>;
var<workgroup> pr: array<f32, 128>;
var<workgroup> red: array<f32, 128>;
@compute @workgroup_size(128)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) i: u32) {
  let t = wid.x; let h = wid.y;
  if (t >= dn.n.x) { return; }
  let nh = p.a.x; let nkv = p.a.y;
  let kvh = h / (nh / nkv);
  let sq = seqs[tok[t].z];
  let start = sq.x; let len = sq.y;
  let qb = (t * nh + h) * 256u;
  if (i < 64u) { qs[i] = vec4<f32>(q[qb + 4u * i], q[qb + 4u * i + 1u], q[qb + 4u * i + 2u], q[qb + 4u * i + 3u]); }
  workgroupBarrier();
  var sc = -3.0e38;
  if (i < len) {
    let kb = ((start + i) * nkv + kvh) * 64u;
    var d = 0.0;
    for (var j = 0u; j < 64u; j++) { d += dot(qs[j], k[kb + j]); }
    sc = d * p.f.x;
  }
  red[i] = sc;
  workgroupBarrier();
  for (var s = 64u; s > 0u; s >>= 1u) {
    if (i < s) { red[i] = max(red[i], red[i + s]); }
    workgroupBarrier();
  }
  let mx = red[0];
  workgroupBarrier();
  var e = 0.0;
  if (i < len) { e = exp(sc - mx); }
  pr[i] = e; red[i] = e;
  workgroupBarrier();
  for (var s = 64u; s > 0u; s >>= 1u) {
    if (i < s) { red[i] += red[i + s]; }
    workgroupBarrier();
  }
  let inv = 1.0 / red[0];
  var a0 = 0.0; var a1 = 0.0;
  for (var j = 0u; j < len; j++) {
    let vb = ((start + j) * nkv + kvh) * 256u;
    a0 += pr[j] * v[vb + i]; a1 += pr[j] * v[vb + i + 128u];
  }
  o[qb + i] = a0 * inv; o[qb + i + 128u] = a1 * inv;
}`,

  // a[r, j] = gelu_tanh(a[r, j]) * b[r * bStride + bOff + j] for r < tokens, j < D.
  // p.a = (D, bStride, bOff).
  gelumul: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read_write> a: array<f32>;
@group(0) @binding(3) var<storage, read> b: array<f32>;
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let D = p.a.x;
  let idx = gid.x + gid.y * 65535u * 256u;
  if (idx >= dn.n.x * D) { return; }
  let r = idx / D; let j = idx % D;
  let x = a[idx];
  let u = clamp(0.7978845608028654 * (x + 0.044715 * x * x * x), -15.0, 15.0);
  a[idx] = 0.5 * x * (1.0 + tanh(u)) * b[r * p.a.y + p.a.z + j];
}`,

  // Mean over each sequence's tokens of a [tokens, 512] buffer -> [sequences, 512].
  pool: HEADER + /* wgsl */ `
@group(0) @binding(2) var<storage, read> seqs: array<vec4<u32>>;
@group(0) @binding(3) var<storage, read> x: array<f32>;
@group(0) @binding(4) var<storage, read_write> y: array<f32>;
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_index) i: u32) {
  _ = p.a;
  let b = wid.x;
  if (b >= dn.n.y) { return; }
  let sq = seqs[b];
  var s0 = 0.0; var s1 = 0.0;
  for (var t = 0u; t < sq.y; t++) { s0 += x[(sq.x + t) * 512u + i]; s1 += x[(sq.x + t) * 512u + i + 256u]; }
  y[b * 512u + i] = s0 / f32(sq.y); y[b * 512u + i + 256u] = s1 / f32(sq.y);
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
  for (var s = 128u; s > 0u; s >>= 1u) {
    if (i < s) { red[i] += red[i + s]; }
    workgroupBarrier();
  }
  let inv = 1.0 / max(sqrt(red[0]), 1e-12);
  y[b * 768u + i] = a0 * inv; y[b * 768u + i + 256u] = a1 * inv; y[b * 768u + i + 512u] = a2 * inv;
}`,
};

const U = GPUBufferUsage;

export class Eg2Engine {
  // manifest: web/manifest.json; data: the model_t3w.onnx_data bytes (ArrayBuffer or typed array).
  // opts.maxTokens bounds one batch (all sequences together); each sequence is at most 128 tokens.
  static async create(device, manifest, data, opts = {}) {
    const e = new Eg2Engine(device, manifest, opts);
    await e._init(data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
    return e;
  }

  constructor(device, manifest, opts) {
    this.device = device;
    this.m = manifest;
    this.maxTokens = opts.maxTokens ?? 512;
    this.maxSeqs = opts.maxSeqs ?? 64;
    this.dim = 768;
  }

  async _init(bytes) {
    const dev = this.device, m = this.m, T = this.maxTokens, B = this.maxSeqs;
    for (const L of m.layers) {
      if (L.head_dim !== 256 || L.n_heads % L.n_kv_heads) throw new Error("engine expects head_dim 256 and grouped heads");
    }
    if (m.hidden !== 512 || m.table.bits !== 3 || m.inv_freq.length !== 128) throw new Error("unexpected manifest shape");
    // The whole weight file in one storage buffer; every tensor is addressed by its word offset.
    const size = Math.ceil(bytes.byteLength / 4) * 4;
    this.W = dev.createBuffer({ size, usage: U.STORAGE | U.COPY_DST, label: "weights" });
    const padded = bytes.byteLength === size ? bytes : (() => { const b = new Uint8Array(size); b.set(bytes); return b; })();
    dev.queue.writeBuffer(this.W, 0, padded);

    const rope = new Float32Array(2 * MAX_SEQ * 128);
    for (let pos = 0; pos < MAX_SEQ; pos++) {
      for (let i = 0; i < 128; i++) {
        const ang = Math.fround(pos * m.inv_freq[i]); // the graph forms the angle in float32
        rope[pos * 128 + i] = Math.cos(ang);
        rope[MAX_SEQ * 128 + pos * 128 + i] = Math.sin(ang);
      }
    }
    const buf = (n, label, extra = 0) => dev.createBuffer({ size: Math.max(16, n * 4), usage: U.STORAGE | U.COPY_SRC | extra, label });
    this.rope = buf(rope.length, "rope", U.COPY_DST);
    dev.queue.writeBuffer(this.rope, 0, rope);
    const nh = m.layers[0].n_heads, nkv = m.layers[0].n_kv_heads;
    const B_ = {
      tok: buf(T * 4, "tok", U.COPY_DST), seqs: buf(B * 4, "seqs", U.COPY_DST),
      h: buf(T * 512, "h"), a: buf(T * 512, "a"), t: buf(T * 512, "t"),
      q: buf(T * nh * 256, "q"), k: buf(T * nkv * 256, "k"), v: buf(T * nkv * 256, "v"), o: buf(T * nh * 256, "o"),
      g: buf(T * 2048, "g"), u: buf(T * 2048, "u"),
      pleRaw: buf(T * m.ple_layers * m.ple_dim, "pleRaw"), ple: buf(T * m.ple_layers * m.ple_dim, "ple"),
      pooled: buf(B * 512, "pooled"), e: buf(B * 768, "e"), out: buf(B * 768, "out", U.COPY_SRC),
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

    // Every dispatch gets its own static uniform and bind group; only `dyn` changes per run.
    const W = (t) => t.offset / 4;
    this.steps = [];
    const step = (kind, params, bufs, grid) => {
      const u = new ArrayBuffer(48);
      new Uint32Array(u, 0, 8).set(params.a.concat(Array(4 - params.a.length).fill(0)).concat((params.b ?? []).concat(Array(4 - (params.b ?? []).length).fill(0))));
      new Float32Array(u, 32, 4).set((params.f ?? []).concat(Array(4 - (params.f ?? []).length).fill(0)));
      const ub = dev.createBuffer({ size: 48, usage: U.UNIFORM | U.COPY_DST, label: kind });
      dev.queue.writeBuffer(ub, 0, u);
      const entries = [{ binding: 0, resource: { buffer: ub } }, { binding: 1, resource: { buffer: this.dyn } }]
        .concat(bufs.map((b, i) => ({ binding: i + 2, resource: { buffer: b } })));
      this.steps.push({ kind, bg: dev.createBindGroup({ layout: pipes[kind].getBindGroupLayout(0), entries }), grid });
    };
    const eps = m.eps;
    const mm = (w, X, Y, rowsSel = 0, alpha = 1) => {
      if (w.N % 32 || w.K % 256 || w.block !== 32 || w.bits !== 4) throw new Error("matmul shape");
      step("matmul", { a: [W(w.q), W(w.scales), W(w.zp), w.N], b: [w.K, rowsSel], f: [alpha] }, [this.W, X, Y],
           (n) => [w.N / 32, Math.ceil(n[rowsSel] / 8)]);
    };
    const norm = (w, X, Y, D, mode = 0, scalar = 1, rowsSel = 0, mult = 1) =>
      step("norm", { a: [D, W(w), mode, rowsSel], b: [mult], f: [eps, scalar] }, [this.W, X, Y], (n) => split(n[rowsSel] * mult));
    const gelumul = (A, Bf, D, bStride, bOff) =>
      step("gelumul", { a: [D, bStride, bOff] }, [A, Bf], (n) => split(Math.ceil(n[0] * D / 256)));

    const t = m.table;
    step("embed", { a: [W(t.codes), W(t.scales), W(t.zp)], f: [m.embed_scale] }, [this.W, B_.tok, B_.h], (n) => [n[0]]);
    mm(m.ple, B_.h, B_.pleRaw, 0, m.ple_scale);
    norm(m.per_layer_projection_norm, B_.pleRaw, B_.ple, m.ple_dim, 0, 1, 0, m.ple_layers);
    m.layers.forEach((L, i) => {
      norm(L.input_layernorm, B_.h, B_.a, 512);
      mm(L.q_proj, B_.a, B_.q); mm(L.k_proj, B_.a, B_.k); mm(L.v_proj, B_.a, B_.v);
      step("prep", { a: [L.n_heads, L.n_kv_heads, W(L.q_norm), W(L.k_norm)], f: [eps] },
           [this.W, this.rope, B_.tok, B_.q, B_.k, B_.v], (n) => [n[0], L.n_heads + 2 * L.n_kv_heads]);
      step("attn", { a: [L.n_heads, L.n_kv_heads], f: [L.attn_scale] }, [B_.tok, B_.seqs, B_.q, B_.k, B_.v, B_.o],
           (n) => [n[0], L.n_heads]);
      mm(L.o_proj, B_.o, B_.t);
      norm(L.post_attention_layernorm, B_.t, B_.h, 512, 1);
      norm(L.pre_feedforward_layernorm, B_.h, B_.a, 512);
      mm(L.gate_proj, B_.a, B_.g); mm(L.up_proj, B_.a, B_.u);
      gelumul(B_.g, B_.u, L.gate_proj.N, L.gate_proj.N, 0);
      mm(L.down_proj, B_.g, B_.t);
      norm(L.post_feedforward_layernorm, B_.t, B_.h, 512, 1);
      mm(L.per_layer_input_gate, B_.h, B_.u);
      gelumul(B_.u, B_.ple, m.ple_dim, m.ple_layers * m.ple_dim, i * m.ple_dim);
      mm(L.per_layer_projection, B_.u, B_.t);
      norm(L.post_per_layer_input_norm, B_.t, B_.h, 512, 1, L.layer_scalar);
    });
    norm(m.norm, B_.h, B_.a, 512);
    step("pool", { a: [] }, [B_.seqs, B_.a, B_.pooled], (n) => [n[1]]);
    mm(m.embedding_projection, B_.pooled, B_.e, 1);
    step("l2", { a: [] }, [B_.e, B_.out], (n) => [n[1]]);
    await dev.queue.onSubmittedWorkDone();
  }

  // Encode the batch (lists of token ids) and record the forward pass; returns the sequence count.
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

  // Embed and copy the vectors into `target` (same device) without a readback.
  embedTo(batch, target, offset = 0) {
    const enc = this.device.createCommandEncoder();
    const B = this._record(enc, batch);
    enc.copyBufferToBuffer(this.b.out, 0, target, offset, B * 768 * 4);
    this.device.queue.submit([enc.finish()]);
    return this.device.queue.onSubmittedWorkDone();
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
    this.W.destroy(); this.rope.destroy(); this.dyn.destroy(); this.read.destroy();
  }
}

function split(n) { return n <= 65535 ? [n] : [65535, Math.ceil(n / 65535)]; }
