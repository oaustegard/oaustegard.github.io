// tail.js: WebGPU fused tail for EG2 / remex 2-bit codes. ES module, no dependencies.
// Contract: SPEC.md (same directory tree)

const D = 768;
const WORDS = 48;              // u32 words per packed vector (192 bytes)
const LUT_STRIDE = 3073;       // 768*4 LUT entries, then the query offset
const MAX_DIM = 65535;         // max workgroups per dispatch dimension
const TOPK_CHUNK = 1024;       // (score, index) pairs per top-k workgroup
const TOPK_MAX = 256;          // k limit, so each top-k pass shrinks the input at least 4x
const ENC_TILE = 4;            // vectors per encode workgroup (the vec4 lanes in ENCODE)

// ---------------------------------------------------------------- WGSL

// Workgroup tree reduction over 256 lanes. Every invocation must call it.
// Barriers before the first write and after the read keep `red` reusable.
const REDUCE = /* wgsl */ `
var<workgroup> red: array<f32, 256>;

fn reduce_sum(tid: u32, v: f32) -> f32 {
  red[tid] = v;
  workgroupBarrier();
  for (var s: u32 = 128u; s > 0u; s = s >> 1u) {
    if (tid < s) {
      red[tid] = red[tid] + red[tid + s];
    }
    workgroupBarrier();
  }
  let r = red[0];
  workgroupBarrier();
  return r;
}
`;

// Rotated row dot product: rotated_j = sum_k R[j,k] * xs[k].
// rmat holds R TRANSPOSED (rmat[k*D + j] = R[j,k]): at each k the 256 lanes
// (j = tid + 256*i) read 256 adjacent floats, which coalesces on real GPUs.
// Row-major R had lanes 768 floats apart. Same products, same order.
const DOT_ROW = /* wgsl */ `
const D: u32 = 768u;
var<workgroup> xs: array<f32, 768>;

fn dot_row(j: u32) -> f32 {
  var a: f32 = 0.0;
  for (var k: u32 = 0u; k < D; k += 1u) {
    a += rmat[k * D + j] * xs[k];
  }
  return a;
}
`;

// Encode, TILE = 4 vectors per workgroup in the four lanes of a vec4, so each R element is read once
// per tile instead of once per vector. Every lane does the same products in the same order as a
// one-vector kernel, and the vec4 tree reduction is four scalar tree reductions, so the codes and
// floats are identical to one vector per workgroup. Workgroup memory: xs4 12 KB + red4 4 KB = the
// 16 KB default limit; after the rotation xs4 is reused to hold the codes.
const ENCODE = /* wgsl */ `
const D: u32 = 768u;
const TILE: u32 = 4u;
struct EncP {
  in_row: u32,
  out_row: u32,
  capacity: u32,
  normalize: u32,
  count: u32,
}
@group(0) @binding(0) var<uniform> ep: EncP;
@group(0) @binding(1) var<storage, read> xin: array<f32>;
@group(0) @binding(2) var<storage, read> rmat: array<f32>;
@group(0) @binding(3) var<storage, read> rmu: array<f32>;
@group(0) @binding(4) var<storage, read> cst: array<f32>;
@group(0) @binding(5) var<storage, read_write> wout: array<u32>;
@group(0) @binding(6) var<storage, read_write> aux: array<f32>;

var<workgroup> xs4: array<vec4<f32>, 768>;
var<workgroup> red4: array<vec4<f32>, 256>;

fn reduce4(tid: u32, v: vec4<f32>) -> vec4<f32> {
  red4[tid] = v;
  workgroupBarrier();
  for (var s: u32 = 128u; s > 0u; s = s >> 1u) {
    if (tid < s) {
      red4[tid] = red4[tid] + red4[tid + s];
    }
    workgroupBarrier();
  }
  let r = red4[0];
  workgroupBarrier();
  return r;
}

// rmat holds R transposed, so at each k the 256 lanes read adjacent floats (see DOT_ROW).
fn dot_row4(j: u32) -> vec4<f32> {
  var a = vec4<f32>(0.0);
  for (var k: u32 = 0u; k < D; k += 1u) {
    a += rmat[k * D + j] * xs4[k];
  }
  return a;
}

fn code_of(u: f32) -> u32 {
  var c: u32 = 0u;
  if (u > cst[0]) { c += 1u; }
  if (u > cst[1]) { c += 1u; }
  if (u > cst[2]) { c += 1u; }
  return c;
}

fn codes4(t: vec4<f32>, den: vec4<f32>) -> vec4<u32> {
  let u = t / den;
  return vec4<u32>(code_of(u.x), code_of(u.y), code_of(u.z), code_of(u.w));
}

fn cent4(c: vec4<u32>) -> vec4<f32> {
  return vec4<f32>(cst[4u + c.x], cst[4u + c.y], cst[4u + c.z], cst[4u + c.w]);
}

fn load(v: u32, j: u32) -> f32 {
  let r = ep.in_row + v;
  if (v >= ep.count) {
    return 0.0;
  }
  return xin[r * D + j];
}

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let v0 = wg.x * TILE;          // first vector of this tile, relative to in_row / out_row

  var x0 = vec4<f32>(load(v0, tid), load(v0 + 1u, tid), load(v0 + 2u, tid), load(v0 + 3u, tid));
  var x1 = vec4<f32>(load(v0, tid + 256u), load(v0 + 1u, tid + 256u), load(v0 + 2u, tid + 256u), load(v0 + 3u, tid + 256u));
  var x2 = vec4<f32>(load(v0, tid + 512u), load(v0 + 1u, tid + 512u), load(v0 + 2u, tid + 512u), load(v0 + 3u, tid + 512u));
  let ss = reduce4(tid, x0 * x0 + x1 * x1 + x2 * x2);
  if (ep.normalize != 0u) {
    let nrm = max(sqrt(ss), vec4<f32>(1e-8));
    x0 = x0 / nrm;
    x1 = x1 / nrm;
    x2 = x2 / nrm;
  }
  xs4[tid] = x0;
  xs4[tid + 256u] = x1;
  xs4[tid + 512u] = x2;
  workgroupBarrier();

  // t = R x - Rmu, for the three rows this thread owns, four vectors at once
  let r0 = rmu[tid];
  let r1 = rmu[tid + 256u];
  let r2 = rmu[tid + 512u];
  let t0 = dot_row4(tid) - r0;
  let t1 = dot_row4(tid + 256u) - r1;
  let t2 = dot_row4(tid + 512u) - r2;
  let ln = sqrt(reduce4(tid, t0 * t0 + t1 * t1 + t2 * t2));
  let md = reduce4(tid, r0 * t0 + r1 * t1 + r2 * t2);

  let den = max(ln, vec4<f32>(1e-8));
  let c0 = codes4(t0, den);
  let c1 = codes4(t1, den);
  let c2 = codes4(t2, den);

  let e0 = cent4(c0);
  let e1 = cent4(c1);
  let e2 = cent4(c2);
  let vl = sqrt(reduce4(tid, e0 * e0 + e1 * e1 + e2 * e2));
  let vm = reduce4(tid, e0 * r0 + e1 * r1 + e2 * r2);
  let scale = ln / (max(vl, vec4<f32>(1e-12)) * cst[8]);
  let bias = md - scale * vm;

  // xs4 is free now (every read of it finished before the reductions' barriers): hold the codes
  xs4[tid] = bitcast<vec4<f32>>(c0);
  xs4[tid + 256u] = bitcast<vec4<f32>>(c1);
  xs4[tid + 512u] = bitcast<vec4<f32>>(c2);
  workgroupBarrier();

  // word w holds codes 16w..16w+15; code 16w+4bb+m at shift 8bb+6-2m. 192 lanes: 48 words x 4 vectors.
  if (tid < 192u) {
    let w = tid % 48u;
    let v = tid / 48u;
    if (v0 + v < ep.count) {
      var word: u32 = 0u;
      for (var bb: u32 = 0u; bb < 4u; bb += 1u) {
        for (var m: u32 = 0u; m < 4u; m += 1u) {
          let c = bitcast<vec4<u32>>(xs4[16u * w + 4u * bb + m])[v];
          word = word | (c << (8u * bb + 6u - 2u * m));
        }
      }
      wout[w * ep.capacity + ep.out_row + v0 + v] = word;
    }
  }
  if (tid < TILE && v0 + tid < ep.count) {
    let doc = ep.out_row + v0 + tid;
    aux[doc * 4u] = scale[tid];
    aux[doc * 4u + 1u] = bias[tid];
    aux[doc * 4u + 2u] = ln[tid];
    aux[doc * 4u + 3u] = md[tid];
  }
}
`;

const POOL = /* wgsl */ `
struct PoolP {
  s: u32,
  b0: u32,
  pad0: u32,
  pad1: u32,
}
const D: u32 = 768u;
@group(0) @binding(0) var<uniform> pp: PoolP;
@group(0) @binding(1) var<storage, read> hid: array<f32>;
@group(0) @binding(2) var<storage, read> msk: array<u32>;
@group(0) @binding(3) var<storage, read_write> pout: array<f32>;

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let d = wg.x * 256u + lid.x;
  if (d >= D) {
    return;
  }
  let b = pp.b0 + wg.y;
  var sum: f32 = 0.0;
  var cnt: u32 = 0u;
  for (var s: u32 = 0u; s < pp.s; s += 1u) {
    let m = msk[b * pp.s + s];
    if (m != 0u) {
      sum += hid[(b * pp.s + s) * D + d];
      cnt += 1u;
    }
  }
  var r: f32 = 0.0;
  if (cnt > 0u) {
    r = sum / f32(cnt);
  }
  pout[b * D + d] = r;
}
`;

const PREP = /* wgsl */ `
struct PrepP {
  normalize: u32,
  q_base: u32,
  stride: u32,
  pad: u32,
}
@group(0) @binding(0) var<uniform> pq: PrepP;
@group(0) @binding(1) var<storage, read> qin: array<f32>;
@group(0) @binding(2) var<storage, read> rmat: array<f32>;
@group(0) @binding(3) var<storage, read> mu: array<f32>;
@group(0) @binding(4) var<storage, read> cst: array<f32>;
@group(0) @binding(5) var<storage, read_write> lut: array<f32>;

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let q = pq.q_base + wg.x;
  let qb = q * D;

  var a0 = qin[qb + tid];
  var a1 = qin[qb + tid + 256u];
  var a2 = qin[qb + tid + 512u];
  let ss = reduce_sum(tid, a0 * a0 + a1 * a1 + a2 * a2);
  if (pq.normalize != 0u) {
    let nrm = max(sqrt(ss), 1e-8);
    a0 = a0 / nrm;
    a1 = a1 / nrm;
    a2 = a2 / nrm;
  }
  xs[tid] = a0;
  xs[tid + 256u] = a1;
  xs[tid + 512u] = a2;
  workgroupBarrier();

  let qoff = reduce_sum(tid, a0 * mu[tid] + a1 * mu[tid + 256u] + a2 * mu[tid + 512u]);

  // lut[j*4 + c] = (R q)_j * centroid[c]
  let lb = q * pq.stride;
  for (var i: u32 = 0u; i < 3u; i += 1u) {
    let j = tid + 256u * i;
    let qr = dot_row(j);
    let jb = lb + j * 4u;
    lut[jb] = qr * cst[4];
    lut[jb + 1u] = qr * cst[5];
    lut[jb + 2u] = qr * cst[6];
    lut[jb + 3u] = qr * cst[7];
  }
  if (tid == 0u) {
    lut[lb + 3072u] = qoff;
  }
}
`;

const SCAN = /* wgsl */ `
struct ScanP {
  n: u32,
  capacity: u32,
  q_base: u32,
  stride: u32,
}
@group(0) @binding(0) var<uniform> ps: ScanP;
@group(0) @binding(1) var<storage, read> wds: array<u32>;
@group(0) @binding(2) var<storage, read> aux: array<f32>;
@group(0) @binding(3) var<storage, read> lut: array<f32>;
@group(0) @binding(4) var<storage, read_write> scores: array<f32>;

var<workgroup> lsh: array<f32, 3072>;

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let q = ps.q_base + wg.y;
  let lb = q * ps.stride;
  for (var t: u32 = tid; t < 3072u; t += 256u) {
    lsh[t] = lut[lb + t];
  }
  workgroupBarrier();

  let i = wg.x * 256u + tid;
  if (i >= ps.n) {
    return;
  }
  var acc: f32 = 0.0;
  for (var w: u32 = 0u; w < 48u; w += 1u) {
    let word = wds[w * ps.capacity + i];
    for (var bb: u32 = 0u; bb < 4u; bb += 1u) {
      for (var m: u32 = 0u; m < 4u; m += 1u) {
        let code = (word >> (8u * bb + 6u - 2u * m)) & 3u;
        acc += lsh[(w * 16u + bb * 4u + m) * 4u + code];
      }
    }
  }
  scores[q * ps.capacity + i] = aux[i * 4u] * acc + aux[i * 4u + 1u] + lut[lb + 3072u];
}
`;

const COLSUM = /* wgsl */ `
struct ColP {
  count: u32,
  pad0: u32,
  pad1: u32,
  pad2: u32,
}
@group(0) @binding(0) var<uniform> pc: ColP;
@group(0) @binding(1) var<storage, read> cin: array<f32>;
@group(0) @binding(2) var<storage, read_write> cacc: array<f32>;

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let j = wg.x * 256u + lid.x;
  if (j >= 768u) {
    return;
  }
  var s: f32 = 0.0;
  for (var b: u32 = 0u; b < pc.count; b += 1u) {
    s += cin[b * 768u + j];
  }
  cacc[j] = cacc[j] + s;
}
`;

// Top-k, one pass: each workgroup bitonic-sorts a chunk of 1024 (score, index) pairs in workgroup
// memory and writes its best k. Order: higher score first, lower index on ties (the topkRef order).
// Pass 1 reads scores [nq, capacity] with implicit indices; later passes read the previous pass's
// candidates. The host repeats passes until one chunk remains. Padding: -FLT_MAX with index
// 0xffffffff, which sorts after every finite score (WGSL rejects a -inf constant).
const TOPK = /* wgsl */ `
struct TopP {
  n: u32,          // valid entries per query in the input
  in_stride: u32,  // input row stride per query
  out_stride: u32, // output row stride per query (= chunks * k)
  k: u32,
  implicit: u32,   // 1: index = position in the row (pass 1)
  pad0: u32,
  pad1: u32,
  pad2: u32,
}
@group(0) @binding(0) var<uniform> tp: TopP;
@group(0) @binding(1) var<storage, read> sin: array<f32>;
@group(0) @binding(2) var<storage, read> iin: array<u32>;
@group(0) @binding(3) var<storage, read_write> sout: array<f32>;
@group(0) @binding(4) var<storage, read_write> iout: array<u32>;

const CH: u32 = 1024u;
var<workgroup> ks: array<f32, 1024>;
var<workgroup> ki: array<u32, 1024>;

fn before(sa: f32, ia: u32, sb: f32, ib: u32) -> bool {
  return sa > sb || (sa == sb && ia < ib);
}

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let q = wg.y;
  let base = wg.x * CH;
  for (var t: u32 = tid; t < CH; t += 256u) {
    let p = base + t;
    if (p < tp.n) {
      ks[t] = sin[q * tp.in_stride + p];
      if (tp.implicit != 0u) {
        ki[t] = p;
      } else {
        ki[t] = iin[q * tp.in_stride + p];
      }
    } else {
      ks[t] = bitcast<f32>(0xff7fffffu);   // -FLT_MAX
      ki[t] = 0xffffffffu;
    }
  }
  workgroupBarrier();

  for (var size: u32 = 2u; size <= CH; size = size << 1u) {
    for (var stride: u32 = size >> 1u; stride > 0u; stride = stride >> 1u) {
      for (var h: u32 = 0u; h < 2u; h += 1u) {
        let pr = tid + 256u * h;                       // pair 0..511
        let i = 2u * stride * (pr / stride) + pr % stride;
        let j = i + stride;
        let si = ks[i]; let ii = ki[i];
        let sj = ks[j]; let ij = ki[j];
        // blocks with (i & size) == 0 end best-first, the others worst-first; the last size is all best-first
        let want_first = (i & size) == 0u;
        if (before(sj, ij, si, ii) == want_first) {
          ks[i] = sj; ki[i] = ij;
          ks[j] = si; ki[j] = ii;
        }
      }
      workgroupBarrier();
    }
  }

  for (var t: u32 = tid; t < tp.k; t += 256u) {
    let o = q * tp.out_stride + wg.x * tp.k + t;
    sout[o] = ks[t];
    iout[o] = ki[t];
  }
}
`;

// Randomized Hadamard rotation, remex's RHTOperator.rotate_rows for d = 768: for r = rounds-1 .. 0,
// an unnormalized FWHT over each 256-wide block (pairs (i, i+h) for h = 1, 2, .., 128, in remex's
// order), then z[perm_r[i]] = y[i] * sign_r[i] / 16. Adds, subtracts and one exact power-of-two
// scale, so in float32 it is bit-identical to remex's operator. About 6k add/subs per round instead
// of the dense product's 590k multiply-adds, and no 2.36 MB matrix to read. `arr` is a 768-entry
// workgroup array (f32 or vec4<f32>); rperm and rsign hold the plan, rounds x 768 each.
function rhtWgsl(arr, rounds) {
  return /* wgsl */ `
fn rht_rotate_${arr}(tid: u32) {
  for (var rr: u32 = ${rounds}u; rr > 0u; rr -= 1u) {
    let r = rr - 1u;
    for (var h: u32 = 1u; h < 256u; h = h << 1u) {
      for (var p: u32 = tid; p < 384u; p += 256u) {
        let q = p % 128u;
        let i = (p / 128u) * 256u + (q / h) * 2u * h + q % h;
        let a = ${arr}[i];
        let b = ${arr}[i + h];
        ${arr}[i] = a + b;
        ${arr}[i + h] = a - b;
      }
      workgroupBarrier();
    }
    let y0 = ${arr}[tid];
    let y1 = ${arr}[tid + 256u];
    let y2 = ${arr}[tid + 512u];
    workgroupBarrier();
    let o = r * 768u;
    ${arr}[rperm[o + tid]] = y0 * rsign[o + tid];
    ${arr}[rperm[o + tid + 256u]] = y1 * rsign[o + tid + 256u];
    ${arr}[rperm[o + tid + 512u]] = y2 * rsign[o + tid + 512u];
    workgroupBarrier();
  }
}
`;
}

// The two rotation variants of ENCODE and PREP. 'dense' reads R^T (rmat); 'rht' applies the plan.
function encodeShader(rotation, rounds) {
  if (rotation === 'dense') return ENCODE;
  const out = ENCODE
    .replace('@group(0) @binding(2) var<storage, read> rmat: array<f32>;',
      '@group(0) @binding(2) var<storage, read> rperm: array<u32>;\n@group(0) @binding(7) var<storage, read> rsign: array<f32>;')
    .replace(/\/\/ rmat holds R transposed[^]*?\n}\n/, rhtWgsl('xs4', rounds))
    .replace(`  let t0 = dot_row4(tid) - r0;
  let t1 = dot_row4(tid + 256u) - r1;
  let t2 = dot_row4(tid + 512u) - r2;`, `  rht_rotate_xs4(tid);
  let t0 = xs4[tid] - r0;
  let t1 = xs4[tid + 256u] - r1;
  let t2 = xs4[tid + 512u] - r2;`);
  if (out.includes('rmat') || out.includes('dot_row4')) throw new Error('encodeShader: rht substitution failed');
  return out;
}

function prepShader(rotation, rounds) {
  const head = '@group(0) @binding(0) var<uniform> pq';
  if (rotation === 'dense') return PREP.replace(head, REDUCE + '\n' + DOT_ROW + '\n' + head);
  const decl = 'const D: u32 = 768u;\nvar<workgroup> xs: array<f32, 768>;\n';
  const out = PREP
    .replace(head, REDUCE + '\n' + decl + head)
    .replace('@group(0) @binding(2) var<storage, read> rmat: array<f32>;',
      '@group(0) @binding(2) var<storage, read> rperm: array<u32>;\n@group(0) @binding(6) var<storage, read> rsign: array<f32>;\n' + rhtWgsl('xs', rounds))
    .replace('  // lut[j*4 + c] = (R q)_j * centroid[c]\n', '  rht_rotate_xs(tid);\n\n  // lut[j*4 + c] = (R q)_j * centroid[c]\n')
    .replace('    let qr = dot_row(j);', '    let qr = xs[j];');
  if (out.includes('rmat') || out.includes('dot_row')) throw new Error('prepShader: rht substitution failed');
  return out;
}

const SHADERS = {
  pool: POOL,
  scan: SCAN,
  colsum: COLSUM,
  topk: TOPK,
};

// ---------------------------------------------------------------- host helpers

// Usage and map flags: the browser globals when present, spec values otherwise.
const USAGE = globalThis.GPUBufferUsage ?? {
  MAP_READ: 0x1, COPY_SRC: 0x4, COPY_DST: 0x8, UNIFORM: 0x40, STORAGE: 0x80,
};
const MAP = globalThis.GPUMapMode ?? { READ: 0x1 };

function toF32(a, n, name) {
  const f = a instanceof Float32Array ? a : Float32Array.from(a);
  if (f.length !== n) throw new Error(`${name}: ${f.length} values, expected ${n}`);
  return f;
}

// Per-dispatch uniform. Each call returns a fresh buffer that is filled at
// creation, so no queue.writeBuffer ordering can leak values between
// dispatches recorded into the same submit. Callers destroy it right after the
// submit (_submit); destruction waits for the submitted work.
function uniform(device, typed) {
  const size = Math.max(16, Math.ceil(typed.byteLength / 16) * 16);
  const buf = device.createBuffer({ size, usage: USAGE.UNIFORM, mappedAtCreation: true });
  new Uint8Array(buf.getMappedRange()).set(new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength));
  buf.unmap();
  return buf;
}

function storageBuf(device, bytes, extra = 0) {
  return device.createBuffer({ size: Math.max(4, bytes), usage: USAGE.STORAGE | USAGE.COPY_SRC | USAGE.COPY_DST | extra });
}

// R x on the host in float64, from the RHT plan (same transform as rhtWgsl).
function rhtHost(x, plan) {
  let y = Float64Array.from(x);
  const B = plan.B, inv = 1 / Math.sqrt(B);
  for (let r = plan.rounds - 1; r >= 0; r--) {
    for (let base = 0; base < D; base += B) {
      for (let h = 1; h < B; h <<= 1) {
        for (let i = base; i < base + B; i += 2 * h) {
          for (let k = i; k < i + h; k++) {
            const a = y[k], b = y[k + h];
            y[k] = a + b;
            y[k + h] = a - b;
          }
        }
      }
    }
    const z = new Float64Array(D);
    const perm = plan.perms[r], sign = plan.signs[r];
    for (let i = 0; i < D; i++) z[perm[i]] = y[i] * sign[i] * inv;
    y = z;
  }
  return y;
}

const LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

// ---------------------------------------------------------------- class

export class RemexTail {
  constructor(device) {
    this.device = device;
  }

  static async create(device, params) {
    const t = new RemexTail(device);
    await t._init(params);
    return t;
  }

  async _init(params) {
    if (!LITTLE_ENDIAN) throw new Error('RemexTail requires a little-endian host');
    const dev = this.device;
    // rotation: 'rht' (default when the plan is given) applies remex's randomized Hadamard transform;
    // 'dense' multiplies by R. Both are R; they differ in float rounding and in cost.
    this.rotation = params.rotation ?? (params.rht ? 'rht' : 'dense');
    if (this.rotation === 'rht') {
      const plan = params.rht;
      if (!plan || plan.B !== 256 || plan.perms.length !== plan.rounds || plan.perms[0].length !== D) {
        throw new Error('rotation rht needs params.rht = { B: 256, rounds, perms: [rounds][768], signs: [rounds][768] }');
      }
      this.plan = plan;
      const perm = new Uint32Array(plan.rounds * D);
      const sign = new Float32Array(plan.rounds * D);
      for (let r = 0; r < plan.rounds; r++) {
        for (let i = 0; i < D; i++) {
          perm[r * D + i] = plan.perms[r][i];
          sign[r * D + i] = plan.signs[r][i] / 16;     // 1/sqrt(B), exact
        }
      }
      this.rperm = storageBuf(dev, perm.byteLength);
      this.rsign = storageBuf(dev, sign.byteLength);
      dev.queue.writeBuffer(this.rperm, 0, perm);
      dev.queue.writeBuffer(this.rsign, 0, sign);
    } else if (this.rotation === 'dense') {
      this.R = toF32(params.R, D * D, 'R');
      this.rmat = storageBuf(dev, D * D * 4);
      const RT = new Float32Array(D * D);           // upload R^T, see DOT_ROW
      for (let j = 0; j < D; j++) for (let k = 0; k < D; k++) RT[k * D + j] = this.R[j * D + k];
      dev.queue.writeBuffer(this.rmat, 0, RT);
    } else {
      throw new Error(`unknown rotation ${this.rotation}`);
    }
    this.rmu = storageBuf(dev, D * 4);
    this.mu = storageBuf(dev, D * 4);

    // cst: [b0, b1, b2, _, c0, c1, c2, c3, kappa, _ ...]
    const b = toF32(params.boundaries, 3, 'boundaries');
    const c = toF32(params.centroids, 4, 'centroids');
    const cst = new Float32Array(16);
    cst.set(b, 0);
    cst.set(c, 4);
    cst[8] = params.kappa;
    this.cst = storageBuf(dev, 64);
    dev.queue.writeBuffer(this.cst, 0, cst);
    this.kappa = params.kappa;

    const mk = async (label, code) => {
      const module = dev.createShaderModule({ code, label });
      const info = await module.getCompilationInfo();
      const errs = info.messages.filter((m) => m.type === 'error');
      if (errs.length) {
        throw new Error(`${label} WGSL: ` + errs.map((e) => `${e.lineNum}:${e.linePos} ${e.message}`).join('; '));
      }
      return dev.createComputePipelineAsync({ layout: 'auto', compute: { module, entryPoint: 'main' }, label });
    };
    this.pipes = {
      encode: await mk('encode', encodeShader(this.rotation, this.plan?.rounds)),
      pool: await mk('pool', SHADERS.pool),
      prep: await mk('prep', prepShader(this.rotation, this.plan?.rounds)),
      scan: await mk('scan', SHADERS.scan),
      colsum: await mk('colsum', SHADERS.colsum),
      topk: await mk('topk', SHADERS.topk),
    };

    if (params.Rmu) {
      dev.queue.writeBuffer(this.rmu, 0, toF32(params.Rmu, D, 'Rmu'));
      dev.queue.writeBuffer(this.mu, 0, toF32(params.mu, D, 'mu'));
      this.mu_host = toF32(params.mu, D, 'mu');
    } else {
      this.setMean(params.mu);
    }
  }

  // Recomputes Rmu = R mu on the host (float64) and uploads mu and Rmu.
  setMean(mu) {
    const m = toF32(mu, D, 'mu');
    const rmu = this.rotation === 'rht' ? Float32Array.from(rhtHost(m, this.plan)) : new Float32Array(D);
    if (this.rotation === 'dense') {
      for (let j = 0; j < D; j++) {
        let a = 0;
        const base = j * D;
        for (let k = 0; k < D; k++) a += this.R[base + k] * m[k];
        rmu[j] = a;
      }
    }
    this.device.queue.writeBuffer(this.mu, 0, m);
    this.device.queue.writeBuffer(this.rmu, 0, rmu);
    this.mu_host = m;
    this.rmu_host = rmu;
  }

  allocCorpus(capacity) {
    const dev = this.device;
    return {
      capacity,
      filled: 0,
      words: storageBuf(dev, WORDS * capacity * 4),   // words[w * capacity + i]
      aux: storageBuf(dev, capacity * 16),            // aux[i*4 + {scale, bias, len, mdot}]
    };
  }

  _bind(pipe, buffers) {
    return this.device.createBindGroup({
      layout: pipe.getBindGroupLayout(0),
      entries: buffers.map((b, i) => ({ binding: i, resource: { buffer: b } })),
    });
  }

  // Fills binding 2 with the rotation's buffer (R^T, or the RHT permutations) and, for rht, appends
  // the signs as the last binding.
  _rot(buffers) {
    const b = buffers.slice();
    if (this.rotation === 'rht') {
      b[2] = this.rperm;
      b.push(this.rsign);
    } else {
      b[2] = this.rmat;
    }
    return b;
  }

  _submit(enc, temps) {
    this.device.queue.submit([enc.finish()]);
    for (const b of temps) b.destroy();
  }

  _dispatch(enc, pipe, buffers, dims) {
    const pass = enc.beginComputePass();
    pass.setPipeline(pipe);
    pass.setBindGroup(0, this._bind(pipe, buffers));
    pass.dispatchWorkgroups(dims[0], dims[1] ?? 1, dims[2] ?? 1);
    pass.end();
  }

  // Encodes rows inputOffsetRows.. (count rows of inputBuf) into corpus rows start..start+count-1.
  encode(inputBuf, count, corpus, start, opts = {}) {
    const normalize = (opts.normalize ?? true) ? 1 : 0;
    const inRow0 = opts.inputOffsetRows ?? 0;
    if (start + count > corpus.capacity) throw new Error(`encode: ${start}+${count} exceeds capacity ${corpus.capacity}`);
    const enc = this.device.createCommandEncoder();
    const temps = [];
    const perDispatch = MAX_DIM * ENC_TILE;
    for (let base = 0; base < count; base += perDispatch) {
      const n = Math.min(perDispatch, count - base);
      const u = uniform(this.device, new Uint32Array([inRow0 + base, start + base, corpus.capacity, normalize, n]));
      temps.push(u);
      this._dispatch(enc, this.pipes.encode,
        this._rot([u, inputBuf, null, this.rmu, this.cst, corpus.words, corpus.aux]), [Math.ceil(n / ENC_TILE), 1, 1]);
    }
    this._submit(enc, temps);
    corpus.filled = Math.max(corpus.filled, start + count);
  }

  // hidden [B,S,D] f32 + mask [B,S] u32 -> [B,D] f32 masked mean.
  pool(hiddenBuf, maskBuf, B, S) {
    const out = storageBuf(this.device, B * D * 4);
    const enc = this.device.createCommandEncoder();
    const temps = [];
    for (let base = 0; base < B; base += MAX_DIM) {
      const n = Math.min(MAX_DIM, B - base);
      const u = uniform(this.device, new Uint32Array([S, base, 0, 0]));
      temps.push(u);
      this._dispatch(enc, this.pipes.pool, [u, hiddenBuf, maskBuf, out], [3, n, 1]);
    }
    this._submit(enc, temps);
    return out;
  }

  // Scores nq queries (f32 [nq, D] in queryBuf) against the first n corpus rows
  // (default: corpus.filled). Returns scores GPUBuffer, layout [nq, capacity].
  search(queryBuf, nq, corpus, opts = {}) {
    const n = opts.n ?? corpus.filled;
    const normalize = (opts.normalize ?? true) ? 1 : 0;
    if (n > corpus.capacity) throw new Error(`search: n=${n} exceeds capacity`);
    const dev = this.device;
    const lut = storageBuf(dev, nq * LUT_STRIDE * 4);
    const scores = storageBuf(dev, nq * corpus.capacity * 4);
    const enc = dev.createCommandEncoder();
    const temps = [lut];
    for (let qb = 0; qb < nq; qb += MAX_DIM) {
      const nqq = Math.min(MAX_DIM, nq - qb);
      const u = uniform(dev, new Uint32Array([normalize, qb, LUT_STRIDE, 0]));
      temps.push(u);
      this._dispatch(enc, this.pipes.prep, this._rot([u, queryBuf, null, this.mu, this.cst, lut]), [nqq, 1, 1]);
    }
    if (n > 0) {
      for (let qb = 0; qb < nq; qb += MAX_DIM) {
        const nqq = Math.min(MAX_DIM, nq - qb);
        const u = uniform(dev, new Uint32Array([n, corpus.capacity, qb, LUT_STRIDE]));
        temps.push(u);
        this._dispatch(enc, this.pipes.scan,
          [u, corpus.words, corpus.aux, lut, scores], [Math.ceil(n / 256), nqq, 1]);
      }
    }
    this._submit(enc, temps);
    return scores;
  }

  // Sums a [count, D] f32 batch column-wise and adds it into accBuf [D] f32.
  colsum(inputBuf, count, accBuf) {
    const enc = this.device.createCommandEncoder();
    const u = uniform(this.device, new Uint32Array([count, 0, 0, 0]));
    this._dispatch(enc, this.pipes.colsum, [u, inputBuf, accBuf], [3, 1, 1]);
    this._submit(enc, [u]);
  }

  // Copies a GPU buffer of `bytes` bytes to an ArrayBuffer.
  async readBuffer(buf, bytes) {
    const dev = this.device;
    const stage = dev.createBuffer({ size: bytes, usage: USAGE.MAP_READ | USAGE.COPY_DST });
    const enc = dev.createCommandEncoder();
    enc.copyBufferToBuffer(buf, 0, stage, 0, bytes);
    dev.queue.submit([enc.finish()]);
    await stage.mapAsync(MAP.READ);
    const out = stage.getMappedRange().slice(0);
    stage.unmap();
    stage.destroy();
    return out;
  }

  // Loads precomputed remex codes into corpus rows start..start+n-1: packed is remex.pack's byte
  // stream (n x 192, doc-major), scaleBias is n x 2 float32 (remex _score_norms, _row_bias). The
  // inverse of readCorpus, so codes encoded natively by remex search here unchanged. len and mdot
  // are not needed to score and are written as 0.
  loadCodes(corpus, packed, scaleBias, start = 0) {
    const n = scaleBias.length / 2;
    if (packed.length !== n * 192) throw new Error(`loadCodes: ${packed.length} bytes for ${n} docs`);
    if (start + n > corpus.capacity) throw new Error(`loadCodes: ${start}+${n} exceeds capacity ${corpus.capacity}`);
    const cap = corpus.capacity;
    const src = new Uint32Array(packed.buffer, packed.byteOffset, n * WORDS);
    const dev = this.device;
    const row = new Uint32Array(n);
    for (let w = 0; w < WORDS; w++) {
      for (let i = 0; i < n; i++) row[i] = src[i * WORDS + w];
      dev.queue.writeBuffer(corpus.words, (w * cap + start) * 4, row);
    }
    const aux = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      aux[i * 4] = scaleBias[i * 2];
      aux[i * 4 + 1] = scaleBias[i * 2 + 1];
    }
    dev.queue.writeBuffer(corpus.aux, start * 16, aux);
    corpus.filled = Math.max(corpus.filled, start + n);
  }

  // Doc-major remex bytes plus per-doc floats for the first n docs.
  async readCorpus(corpus, n) {
    const cap = corpus.capacity;
    const w = new Uint32Array(await this.readBuffer(corpus.words, WORDS * cap * 4));
    const aux = new Float32Array(await this.readBuffer(corpus.aux, cap * 16));
    const packed = new Uint8Array(n * 192);
    const p32 = new Uint32Array(packed.buffer);
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < WORDS; k++) p32[i * WORDS + k] = w[k * cap + i];
    }
    const scale = new Float32Array(n), bias = new Float32Array(n);
    const len = new Float32Array(n), mdot = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      scale[i] = aux[i * 4];
      bias[i] = aux[i * 4 + 1];
      len[i] = aux[i * 4 + 2];
      mdot[i] = aux[i * 4 + 3];
    }
    return { packed, scale, bias, len, mdot };
  }

  // scores GPUBuffer [nq, capacity] -> Float32Array [nq, n].
  async readScores(buf, nq, corpus, n) {
    const full = new Float32Array(await this.readBuffer(buf, nq * corpus.capacity * 4));
    const out = new Float32Array(nq * n);
    for (let q = 0; q < nq; q++) {
      out.set(full.subarray(q * corpus.capacity, q * corpus.capacity + n), q * n);
    }
    return out;
  }

  // Top-k on the GPU: search, then bitonic chunk passes until one 1024-chunk per query remains;
  // reads back only nq*k (score, index) pairs. Ties go to the lower doc index. k <= 256.
  async topk(queryBuf, nq, corpus, n, k, opts = {}) {
    if (k < 1 || k > TOPK_MAX) throw new Error(`topk: k=${k} outside 1..${TOPK_MAX}`);
    if (nq > MAX_DIM) throw new Error(`topk: nq=${nq} exceeds ${MAX_DIM}`);
    const dev = this.device;
    const scoresBuf = this.search(queryBuf, nq, corpus, { ...opts, n });
    const enc = dev.createCommandEncoder();
    const temps = [scoresBuf];
    let sIn = scoresBuf, iIn = scoresBuf, m = n, inStride = corpus.capacity, implicit = 1;
    let sOut, iOut;
    for (;;) {
      const chunks = Math.max(1, Math.ceil(m / TOPK_CHUNK));
      if (chunks > MAX_DIM) throw new Error(`topk: ${chunks} chunks exceed ${MAX_DIM}`);
      const outStride = chunks * k;
      sOut = storageBuf(dev, nq * outStride * 4);
      iOut = storageBuf(dev, nq * outStride * 4);
      const u = uniform(dev, new Uint32Array([m, inStride, outStride, k, implicit, 0, 0, 0]));
      temps.push(u);
      this._dispatch(enc, this.pipes.topk, [u, sIn, iIn, sOut, iOut], [chunks, nq, 1]);
      if (chunks === 1) break;
      if (sIn !== scoresBuf) temps.push(sIn, iIn);
      sIn = sOut; iIn = iOut; m = outStride; inStride = outStride; implicit = 0;
    }
    if (sIn !== scoresBuf) temps.push(sIn, iIn);
    this._submit(enc, temps);
    const sc = new Float32Array(await this.readBuffer(sOut, nq * k * 4));
    const ix = new Uint32Array(await this.readBuffer(iOut, nq * k * 4));
    sOut.destroy();
    iOut.destroy();
    const kk = Math.min(k, n);
    const res = [];
    for (let q = 0; q < nq; q++) {
      res.push({ idx: Int32Array.from(ix.subarray(q * k, q * k + kk)), score: sc.slice(q * k, q * k + kk) });
    }
    return res;
  }

  // Top-k on the host from read-back GPU scores (the pre-GPU path, kept for comparison).
  async topkHost(queryBuf, nq, corpus, n, k, opts = {}) {
    const scoresBuf = this.search(queryBuf, nq, corpus, { ...opts, n });
    const s = await this.readScores(scoresBuf, nq, corpus, n);
    scoresBuf.destroy();
    const res = [];
    const kk = Math.min(k, n);
    for (let q = 0; q < nq; q++) {
      const row = s.subarray(q * n, (q + 1) * n);
      // Partial select: a sorted window of the best kk so far. Docs arrive in index order, so a
      // strict > keeps the lower index on ties.
      const idx = new Int32Array(kk);
      const score = new Float32Array(kk);
      let m = 0;
      for (let i = 0; i < n; i++) {
        const v = row[i];
        if (m === kk && !(v > score[kk - 1])) continue;
        let p = m < kk ? m++ : kk - 1;
        while (p > 0 && v > score[p - 1]) {
          score[p] = score[p - 1];
          idx[p] = idx[p - 1];
          p--;
        }
        score[p] = v;
        idx[p] = i;
      }
      res.push({ idx, score });
    }
    return res;
  }
}
