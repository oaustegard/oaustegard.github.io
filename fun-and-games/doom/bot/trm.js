// TRM inference in WGSL. One plan = embed, then supervision steps of T recursions of
// (n latent updates z <- net(x+y+z), one answer update y <- net(y+z)), then the output head.
// The work is recorded once as a list of dispatches; plan() replays it, a slice per call if asked,
// so a frame never waits on a whole plan.

const MATMUL = /* wgsl */ `
override K: u32; override M: u32;
@group(0) @binding(0) var<storage, read> A: array<f32>;      // [L, K]
@group(0) @binding(1) var<storage, read> W: array<f32>;      // [M, K] (torch Linear)
@group(0) @binding(2) var<storage, read_write> O: array<f32>; // [L, M]
@group(0) @binding(3) var<uniform> woff: vec4u;               // weight offset in floats
var<workgroup> As: array<array<f32, 17>, 64>;
var<workgroup> Ws: array<array<f32, 17>, 64>;
@compute @workgroup_size(16, 16)
fn main(@builtin(workgroup_id) wg: vec3u, @builtin(local_invocation_id) li: vec3u) {
  let r0 = wg.y * 64u; let c0 = wg.x * 64u; let t = li.y * 16u + li.x;
  var acc = array<f32, 16>(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.);
  for (var k0 = 0u; k0 < K; k0 += 16u) {
    for (var e = t; e < 1024u; e += 256u) {
      let rr = e / 16u; let kk = e % 16u;
      As[rr][kk] = A[(r0 + rr) * K + k0 + kk];
      Ws[rr][kk] = select(0.0, W[woff.x + (c0 + rr) * K + k0 + kk], c0 + rr < M);
    }
    workgroupBarrier();
    for (var kk = 0u; kk < 16u; kk++) {
      var a: array<f32, 4>; var w: array<f32, 4>;
      for (var i = 0u; i < 4u; i++) { a[i] = As[li.y + 16u * i][kk]; w[i] = Ws[li.x + 16u * i][kk]; }
      for (var i = 0u; i < 4u; i++) { for (var j = 0u; j < 4u; j++) { acc[i * 4u + j] += a[i] * w[j]; } }
    }
    workgroupBarrier();
  }
  for (var i = 0u; i < 4u; i++) { for (var j = 0u; j < 4u; j++) {
    let c = c0 + li.x + 16u * j;
    if (c < M) { O[(r0 + li.y + 16u * i) * M + c] = acc[i * 4u + j]; }
  } }
}`;

// 3×3 convolution over a GW-wide grid as a matmul with K = 9·D: A's row gathers the cell's neighbours
// (zero outside the grid), W is [M, ky, kx, in].
const CONV = /* wgsl */ `
override K: u32; override M: u32; override GW: u32; override GH: u32;
@group(0) @binding(0) var<storage, read> A: array<f32>;      // [L, K]
@group(0) @binding(1) var<storage, read> W: array<f32>;      // [M, K] (torch Linear)
@group(0) @binding(2) var<storage, read_write> O: array<f32>; // [L, M]
@group(0) @binding(3) var<uniform> woff: vec4u;               // weight offset in floats
var<workgroup> As: array<array<f32, 17>, 64>;
var<workgroup> Ws: array<array<f32, 17>, 64>;
@compute @workgroup_size(16, 16)
fn main(@builtin(workgroup_id) wg: vec3u, @builtin(local_invocation_id) li: vec3u) {
  let r0 = wg.y * 64u; let c0 = wg.x * 64u; let t = li.y * 16u + li.x;
  var acc = array<f32, 16>(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.);
  for (var k0 = 0u; k0 < K; k0 += 16u) {
    for (var e = t; e < 1024u; e += 256u) {
      let rr = e / 16u; let kk = e % 16u;
      let kg = k0 + kk; let C = K / 9u; let tap = kg / C; let ch = kg % C;
      let r = r0 + rr; let j = i32(r / GW) + i32(tap / 3u) - 1; let i = i32(r % GW) + i32(tap % 3u) - 1;
      As[rr][kk] = select(0.0, A[u32(max(j, 0) * i32(GW) + max(i, 0)) * C + ch], j >= 0 && j < i32(GH) && i >= 0 && i < i32(GW));
      Ws[rr][kk] = select(0.0, W[woff.x + (c0 + rr) * K + k0 + kk], c0 + rr < M);
    }
    workgroupBarrier();
    for (var kk = 0u; kk < 16u; kk++) {
      var a: array<f32, 4>; var w: array<f32, 4>;
      for (var i = 0u; i < 4u; i++) { a[i] = As[li.y + 16u * i][kk]; w[i] = Ws[li.x + 16u * i][kk]; }
      for (var i = 0u; i < 4u; i++) { for (var j = 0u; j < 4u; j++) { acc[i * 4u + j] += a[i] * w[j]; } }
    }
    workgroupBarrier();
  }
  for (var i = 0u; i < 4u; i++) { for (var j = 0u; j < 4u; j++) {
    let c = c0 + li.x + 16u * j;
    if (c < M) { O[(r0 + li.y + 16u * i) * M + c] = acc[i * 4u + j]; }
  } }
}`;

// one thread per query row and head, keys streamed through workgroup memory, online softmax
const ATTN = /* wgsl */ `
override D: u32; override H: u32; override L: u32;
const HD = 32u;
@group(0) @binding(0) var<storage, read> QKV: array<f32>;      // [L, 3D]: q | k | v, heads contiguous
@group(0) @binding(1) var<storage, read_write> O: array<f32>;  // [L, D]
@group(0) @binding(2) var<storage, read> P: array<f32>;        // weights: the block's [H, 63*63] relative bias
@group(0) @binding(3) var<uniform> u: vec4u;                   // x: bias offset
var<workgroup> Ks: array<array<f32, 32>, 64>;
var<workgroup> Vs: array<array<f32, 32>, 64>;
@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wg: vec3u, @builtin(local_invocation_id) li: vec3u) {
  let h = wg.y; let row = wg.x * 64u + li.x;
  let rj = i32(row / 32u); let ri = i32(row % 32u);
  let boff = u.x + h * 3969u;
  let scale = 1.0 / sqrt(f32(HD));
  var q: array<f32, 32>; var acc = array<f32, 32>(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.);
  for (var d = 0u; d < HD; d++) { q[d] = QKV[row * 3u * D + h * HD + d] * scale; }
  var m = -3.0e38; var l = 0.0;
  for (var k0 = 0u; k0 < L; k0 += 64u) {
    for (var d = 0u; d < HD; d++) {
      Ks[li.x][d] = QKV[(k0 + li.x) * 3u * D + D + h * HD + d];
      Vs[li.x][d] = QKV[(k0 + li.x) * 3u * D + 2u * D + h * HD + d];
    }
    workgroupBarrier();
    for (var j = 0u; j < 64u; j++) {
      var s = 0.0;
      for (var d = 0u; d < HD; d++) { s += q[d] * Ks[j][d]; }
      let kr = k0 + j; let kj = i32(kr / 32u); let ki = i32(kr % 32u);
      s += P[boff + u32((rj - kj + 31) * 63 + (ri - ki + 31))];
      let mn = max(m, s); let c = exp(m - mn); let p = exp(s - mn);
      l = l * c + p;
      for (var d = 0u; d < HD; d++) { acc[d] = acc[d] * c + p * Vs[j][d]; }
      m = mn;
    }
    workgroupBarrier();
  }
  for (var d = 0u; d < HD; d++) { O[row * D + h * HD + d] = acc[d] / l; }
}`;

const ROWS = /* wgsl */ `
override D: u32; override HID: u32;
@group(0) @binding(0) var<storage, read_write> A: array<f32>;
@group(0) @binding(1) var<storage, read> B: array<f32>;
@group(0) @binding(2) var<storage, read> C: array<f32>;
@group(0) @binding(3) var<storage, read> P: array<f32>;  // weights (embedding, positions, heads)
@group(0) @binding(4) var<uniform> u: vec4u;              // x: rows, y: weight offset a, z: weight offset b, w: flag
@group(0) @binding(5) var<storage, read> TOK: array<u32>;
fn rmsRow(r: u32) {
  var ss = 0.0;
  for (var d = 0u; d < D; d++) { ss += A[r * D + d] * A[r * D + d]; }
  let inv = inverseSqrt(ss / f32(D) + 1e-5);
  for (var d = 0u; d < D; d++) { A[r * D + d] *= inv; }
}
// A = rms(A + B)
@compute @workgroup_size(64) fn addNorm(@builtin(global_invocation_id) g: vec3u) {
  let r = g.x; if (r >= u.x) { return; }
  for (var d = 0u; d < D; d++) { A[r * D + d] += B[r * D + d]; }
  rmsRow(r);
}
// A = A + B (+ C when u.w)
@compute @workgroup_size(64) fn add(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= u.x * D) { return; }
  var v = A[i] + B[i];
  if (u.w == 1u) { v += C[i]; }
  A[i] = v;
}
// A[L, HID] = silu(B[:, :HID]) * B[:, HID:]
@compute @workgroup_size(64) fn swiglu(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= u.x * HID) { return; }
  let r = i / HID; let c = i % HID;
  let gt = B[r * 2u * HID + c]; let up = B[r * 2u * HID + HID + c];
  A[i] = gt / (1.0 + exp(-gt)) * up;
}
// A = emb[TOK] + pos
@compute @workgroup_size(64) fn embed(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= u.x * D) { return; }
  let r = i / D; let d = i % D;
  A[i] = P[u.y + TOK[r] * D + d] + P[u.z + r * D + d];
}
// A = broadcast P[u.y .. u.y + D]
@compute @workgroup_size(64) fn fill(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x; if (i >= u.x * D) { return; }
  A[i] = P[u.y + i % D];
}
`;

// output head: A[r] = logit1 - logit0 for each row, and A[L] = q (halting logit from the row mean)
const HEAD = /* wgsl */ `
override D: u32; override L: u32;
@group(0) @binding(0) var<storage, read_write> A: array<f32>;
@group(0) @binding(1) var<storage, read> Y: array<f32>;
@group(0) @binding(2) var<storage, read> P: array<f32>;
@group(0) @binding(3) var<uniform> u: vec4u; // y: head offset [2, D], z: q weight offset [D] then bias
var<workgroup> part: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(local_invocation_id) li: vec3u) {
  for (var r = li.x; r < L; r += 256u) {
    var s = 0.0;
    for (var d = 0u; d < D; d++) { s += Y[r * D + d] * (P[u.y + D + d] - P[u.y + d]); }
    A[r] = s;
  }
  // q = w . mean(Y) + b
  var s = 0.0;
  for (var r = li.x; r < L; r += 256u) { for (var d = 0u; d < D; d++) { s += Y[r * D + d] * P[u.z + d]; } }
  part[li.x] = s;
  workgroupBarrier();
  if (li.x == 0u) {
    var t = 0.0; for (var i = 0u; i < 256u; i++) { t += part[i]; }
    A[L] = t / f32(L) + P[u.z + D];
  }
}`;

export class TRMPlanner {
  // weights: Float32Array of all tensors; manifest: {config, tensors: {name: {offset, shape}}}
  // grid: {w, h} to plan on a grid other than the 32×32 one it was trained on (the conv mixer is
  // translation-equivariant). Such a grid has no learned position table: positions are zero.
  static async create(device, weights, manifest, grid = null) {
    const p = new TRMPlanner();
    p.device = device; p.cfg = { ...manifest.config }; p.T = { ...manifest.tensors };
    p.gw = grid?.w ?? 32; p.gh = grid?.h ?? 32;
    if (grid) {
      if ((p.cfg.mixer || "attn") !== "conv" || (p.gw * p.gh) % 64) throw new Error("other grid sizes need the conv mixer and a multiple of 64 cells");
      p.cfg.L = p.gw * p.gh;
      const w2 = new Float32Array(weights.length + p.cfg.L * p.cfg.d); w2.set(weights); // zero positions at the end
      p.T.pos = { offset: weights.length, shape: [p.cfg.L, p.cfg.d] };
      weights = w2;
    }
    const { d: D, heads: H, layers, n, T } = p.cfg;
    const L = p.cfg.L, HID = 4 * D;
    if ((p.cfg.mixer || "attn") === "attn" && D / H !== 32 || L !== 1024) throw new Error("WGSL attention is written for head size 32 on a 32×32 grid");
    const S = GPUBufferUsage.STORAGE, CP = GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST;
    const buf = (floats, usage = S | CP) => device.createBuffer({ size: Math.max(16, floats * 4), usage });
    p.P = buf(weights.length); device.queue.writeBuffer(p.P, 0, weights);
    p.tok = buf(L);
    const X = buf(L * D), Y = buf(L * D), Z = buf(L * D), QKV = buf(L * 3 * D), ATT = buf(L * D), TMP = buf(L * D);
    const GU = buf(L * 2 * HID), ACT = buf(L * HID);
    p.out = buf(L + 4); p.read = device.createBuffer({ size: (L + 4) * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    p.bufs = { X, Y, Z, QKV, ATT, TMP, GU, ACT };
    const off = (name) => p.T[name].offset;
    const uni = (v) => { const b = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }); device.queue.writeBuffer(b, 0, new Uint32Array(v)); return b; };

    const mod = (code) => device.createShaderModule({ code });
    const mixer = p.cfg.mixer || "attn";
    const mmMod = mod(MATMUL), cvMod = mod(CONV), atMod = mod(ATTN), rowMod = mod(ROWS), headMod = mod(HEAD);
    const pipe = (module, entryPoint, constants, layout = "auto") => device.createComputePipeline({ layout, compute: { module, entryPoint, constants } });
    // the row kernels share one explicit layout, since each uses only some of the six bindings
    const ro = { type: "read-only-storage" }, C = GPUShaderStage.COMPUTE;
    const rowLayout = device.createPipelineLayout({ bindGroupLayouts: [device.createBindGroupLayout({ entries: [
      { binding: 0, visibility: C, buffer: { type: "storage" } }, { binding: 1, visibility: C, buffer: ro }, { binding: 2, visibility: C, buffer: ro },
      { binding: 3, visibility: C, buffer: ro }, { binding: 4, visibility: C, buffer: { type: "uniform" } }, { binding: 5, visibility: C, buffer: ro }] })] });
    const mmPipes = new Map();
    const mmPipe = (K, M) => { const k = K + "x" + M; if (!mmPipes.has(k)) mmPipes.set(k, pipe(mmMod, "main", { K, M })); return mmPipes.get(k); };
    const rowPipes = {}; for (const e of ["addNorm", "add", "swiglu", "embed", "fill"]) rowPipes[e] = pipe(rowMod, e, { D, HID }, rowLayout);
    const atPipe = mixer === "attn" ? pipe(atMod, "main", { D, H, L }) : null;
    const cvPipe = mixer === "conv" ? pipe(cvMod, "main", { K: 9 * D, M: D, GW: p.gw, GH: p.gh }) : null;
    const headPipe = pipe(headMod, "main", { D, L });
    const bg = (pl, bufs) => device.createBindGroup({ layout: pl.getBindGroupLayout(0), entries: bufs.map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    const dummy = buf(4);
    // rows kernels bind all six slots; unused ones get dummies
    const rowBG = (e, a, b, c, flagU) => bg(rowPipes[e], [a, b, c, p.P, flagU, p.tok]);

    const steps = []; // {pl, bg, wg: [x, y]}
    const mm = (A, wname, Oo, K, M) => { const pl = mmPipe(K, M); steps.push({ pl, bg: bg(pl, [A, p.P, Oo, uni([off(wname), 0, 0, 0])]), wg: [Math.ceil(M / 64), L / 64] }); };
    const rows64 = Math.ceil(L / 64), elems = (w) => Math.ceil(L * w / 64);
    const uRows = uni([L, 0, 0, 0]), uAdd3 = uni([L, 0, 0, 1]);
    const net = (Hb) => {
      for (let b = 0; b < layers; b++) {
        if (mixer === "conv") {
          steps.push({ pl: cvPipe, bg: bg(cvPipe, [Hb, p.P, TMP, uni([off(`blocks.${b}.conv.weight`), 0, 0, 0])]), wg: [Math.ceil(D / 64), L / 64] });
        } else {
          mm(Hb, `blocks.${b}.qkv.weight`, QKV, D, 3 * D);
          steps.push({ pl: atPipe, bg: bg(atPipe, [QKV, ATT, p.P, uni([off(`blocks.${b}.rel`), 0, 0, 0])]), wg: [L / 64, H] });
          mm(ATT, `blocks.${b}.o.weight`, TMP, D, D);
        }
        steps.push({ pl: rowPipes.addNorm, bg: rowBG("addNorm", Hb, TMP, dummy, uRows), wg: [rows64, 1] });
        mm(Hb, `blocks.${b}.gu.weight`, GU, D, 2 * HID);
        steps.push({ pl: rowPipes.swiglu, bg: rowBG("swiglu", ACT, GU, dummy, uRows), wg: [elems(HID), 1] });
        mm(ACT, `blocks.${b}.down.weight`, TMP, HID, D);
        steps.push({ pl: rowPipes.addNorm, bg: rowBG("addNorm", Hb, TMP, dummy, uRows), wg: [rows64, 1] });
      }
    };
    // init: X = embed, Y = y0, Z = z0
    p.init = [
      { pl: rowPipes.embed, bg: rowBG("embed", X, dummy, dummy, uni([L, off("emb.weight"), off("pos"), 0])), wg: [elems(D), 1] },
      { pl: rowPipes.fill, bg: rowBG("fill", Y, dummy, dummy, uni([L, off("y0"), 0, 0])), wg: [elems(D), 1] },
      { pl: rowPipes.fill, bg: rowBG("fill", Z, dummy, dummy, uni([L, off("z0"), 0, 0])), wg: [elems(D), 1] },
    ];
    // one supervision step, cut into net-call chunks
    p.chunks = [];
    for (let t = 0; t < T; t++) {
      for (let i = 0; i < n; i++) {
        steps.length = 0;
        steps.push({ pl: rowPipes.add, bg: rowBG("add", Z, X, Y, uAdd3), wg: [elems(D), 1] });
        net(Z);
        p.chunks.push(steps.slice());
      }
      steps.length = 0;
      steps.push({ pl: rowPipes.add, bg: rowBG("add", Y, Z, dummy, uRows), wg: [elems(D), 1] });
      net(Y);
      p.chunks.push(steps.slice());
    }
    p.head = [{ pl: headPipe, bg: bg(headPipe, [p.out, Y, p.P, uni([0, off("head.weight"), off("qhead.weight"), 0])]), wg: [1, 1] }];
    if (off("qhead.bias") !== off("qhead.weight") + D) throw new Error("qhead bias must follow its weight");
    p.L = L;
    return p;
  }

  encode(list) {
    const enc = this.device.createCommandEncoder(), pass = enc.beginComputePass();
    for (const s of list) { pass.setPipeline(s.pl); pass.setBindGroup(0, s.bg); pass.dispatchWorkgroups(s.wg[0], s.wg[1]); }
    pass.end();
    return enc;
  }

  // Plan on a grid (Uint8Array of L cells). Runs `sup` supervision steps, stopping early once the halting
  // head says so; `yieldEvery` net calls it awaits a frame (pass a function returning a promise).
  async plan(grid, { sup = 3, yieldFn = null } = {}) {
    const q = this.device.queue, t0 = performance.now();
    q.writeBuffer(this.tok, 0, Uint32Array.from(grid));
    q.submit([this.encode(this.init).finish()]);
    let logits = null, halt = null, steps = 0;
    for (let s = 0; s < sup; s++) {
      for (const c of this.chunks) { q.submit([this.encode(c).finish()]); if (yieldFn) await yieldFn(); }
      const enc = this.encode(this.head);
      enc.copyBufferToBuffer(this.out, 0, this.read, 0, (this.L + 4) * 4);
      q.submit([enc.finish()]);
      await this.read.mapAsync(GPUMapMode.READ);
      const r = new Float32Array(this.read.getMappedRange().slice(0));
      this.read.unmap();
      logits = r.subarray(0, this.L); halt = r[this.L]; steps = s + 1;
      if (halt > 0) break;
    }
    const path = new Uint8Array(this.L);
    for (let k = 0; k < this.L; k++) path[k] = logits[k] > 0 ? 1 : 0;
    return { path, logits, halt, steps, ms: performance.now() - t0 };
  }
}
