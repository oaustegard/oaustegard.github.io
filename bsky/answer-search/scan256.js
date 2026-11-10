// The Answer Search index on the GPU: remex 4-bit codes of 256-number vectors. Ettin-17m runs with its last
// layer folded from 768 outputs to 256 (../embedders/models/ettin/fold256.f32, engine.js foldHead), and that
// layer also applies remex's rotation, so queries and posts arrive already rotated and nothing here rotates.
//
//   const scan = await Scan256.create(device, { centroids, boundaries, kappa, mu });   // from the snapshot header
//   const docs = scan.allocCorpus(capacity);
//   scan.loadCodes(docs, codes, scaleBias, 0);              // the snapshot's sections
//   scan.loadCodes(docs, ...Object.values(scan.encode(V)), n);   // posts embedded in the tab
//   const { idx, score } = await scan.topk(queryVec, docs, n, 40);
//
// A score is remex 2.1.0's centred estimate of q . x, as search_adc computes it:
// (q . c[codes]) * scale + bias + q . mu, with scale and bias stored per post. encode() reproduces
// Quantizer(256, bits=4, rotation="none", mean=mu).encode on the host. Top-k is the bitonic chunk pass of
// ../embedders/tail.js (RemexTail.topk), copied: higher score first, lower row on ties.

export const D = 256, BITS = 4, WORDS = 32;          // 128 bytes per post
const TOPK_CHUNK = 1024, TOPK_MAX = 256, MAX_DIM = 65535;
const USAGE = globalThis.GPUBufferUsage ?? { MAP_READ: 0x1, COPY_SRC: 0x4, COPY_DST: 0x8, UNIFORM: 0x40, STORAGE: 0x80 };
const MAP = globalThis.GPUMapMode ?? { READ: 0x1 };

// One workgroup scores 256 posts; each thread reads its post's 32 words (word w of every post is stored
// together, so the reads coalesce). Byte m of a post holds code 2m in its high nibble and 2m+1 in its low one
// (remex pack); a little-endian word w holds bytes 4w..4w+3.
const SCAN = /* wgsl */ `
struct ScanP { n: u32, capacity: u32, qoff: f32, pad: u32 }
@group(0) @binding(0) var<uniform> ps: ScanP;
@group(0) @binding(1) var<storage, read> wds: array<u32>;
@group(0) @binding(2) var<storage, read> aux: array<f32>;
@group(0) @binding(3) var<storage, read> qc: array<f32>;
@group(0) @binding(4) var<storage, read_write> scores: array<f32>;
var<workgroup> qs: array<f32, 256>;
var<workgroup> cs: array<f32, 16>;
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  qs[tid] = qc[tid];
  if (tid < 16u) { cs[tid] = qc[256u + tid]; }
  workgroupBarrier();
  let i = wg.x * 256u + tid;
  if (i >= ps.n) { return; }
  var acc: f32 = 0.0;
  for (var w: u32 = 0u; w < 32u; w += 1u) {
    let word = wds[w * ps.capacity + i];
    for (var k: u32 = 0u; k < 4u; k += 1u) {
      let b = (word >> (8u * k)) & 255u;
      let j = 8u * w + 2u * k;
      acc += qs[j] * cs[b >> 4u] + qs[j + 1u] * cs[b & 15u];
    }
  }
  scores[i] = aux[2u * i] * acc + aux[2u * i + 1u] + ps.qoff;
}
`;

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

const LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

export class Scan256 {
  static async create(device, params) {
    const s = new Scan256(device);
    await s._init(params);
    return s;
  }

  constructor(device) { this.device = device; }

  async _init({ centroids, boundaries, kappa, mu }) {
    if (!LITTLE_ENDIAN) throw new Error('Scan256 requires a little-endian host');
    if (centroids?.length !== 16 || boundaries?.length !== 15 || mu?.length !== D || !(kappa > 0)) {
      throw new Error('Scan256 needs 16 centroids, 15 boundaries, kappa and a 256-number mean (the snapshot header)');
    }
    this.cent = Float64Array.from(centroids);
    this.bnd = Float64Array.from(boundaries);
    this.kappa = kappa;
    this.mu = Float64Array.from(mu);
    const dev = this.device;
    this.qc = dev.createBuffer({ size: (D + 16) * 4, usage: USAGE.STORAGE | USAGE.COPY_DST });
    dev.queue.writeBuffer(this.qc, D * 4, Float32Array.from(centroids));
    const mk = async (label, code) => {
      const module = dev.createShaderModule({ code, label });
      const errs = (await module.getCompilationInfo()).messages.filter((m) => m.type === 'error');
      if (errs.length) throw new Error(`${label} WGSL: ` + errs.map((e) => `${e.lineNum}:${e.linePos} ${e.message}`).join('; '));
      return dev.createComputePipelineAsync({ layout: 'auto', compute: { module, entryPoint: 'main' }, label });
    };
    this.pipes = { scan: await mk('scan256', SCAN), topk: await mk('topk', TOPK) };
  }

  allocCorpus(capacity) {
    const buf = (bytes) => this.device.createBuffer({ size: Math.max(16, bytes), usage: USAGE.STORAGE | USAGE.COPY_DST | USAGE.COPY_SRC });
    return { capacity, filled: 0, words: buf(WORDS * capacity * 4), aux: buf(capacity * 8),
             scores: buf(capacity * 4) };
  }

  // packed: n x 128 bytes (remex pack, 4 bits); scaleBias: n x 2 floats (scale, bias). Rows start.. of corpus.
  loadCodes(corpus, packed, scaleBias, start = 0) {
    const n = scaleBias.length / 2, cap = corpus.capacity;
    if (packed.length !== n * WORDS * 4) throw new Error(`loadCodes: ${packed.length} bytes for ${n} posts`);
    if (start + n > cap) throw new Error(`loadCodes: ${start}+${n} exceeds capacity ${cap}`);
    if (!n) return;
    const src = new Uint32Array(packed.buffer.slice(packed.byteOffset, packed.byteOffset + packed.byteLength));
    const row = new Uint32Array(n);
    for (let w = 0; w < WORDS; w++) {
      for (let i = 0; i < n; i++) row[i] = src[i * WORDS + w];
      this.device.queue.writeBuffer(corpus.words, (w * cap + start) * 4, row);
    }
    this.device.queue.writeBuffer(corpus.aux, start * 8, scaleBias instanceof Float32Array ? scaleBias : Float32Array.from(scaleBias));
    corpus.filled = Math.max(corpus.filled, start + n);
  }

  // remex Quantizer(256, bits=4, rotation="none", mean=mu).encode on the host, in float64: rows of V (n x 256)
  // -> { packed: n x 128 bytes, scaleBias: n x 2 floats }. Codes count the boundaries below each coordinate
  // of (x - mu) / |x - mu|; scale = |x - mu| / (|c[codes]| kappa); bias = (x - mu) . mu - scale (c[codes] . mu).
  encode(V) {
    const n = V.length / D, packed = new Uint8Array(n * WORDS * 4), scaleBias = new Float32Array(n * 2);
    const { cent, bnd, mu, kappa } = this, t = new Float64Array(D), c = new Uint8Array(D);
    for (let i = 0; i < n; i++) {
      let ln = 0, md = 0;
      for (let j = 0; j < D; j++) { const r = V[i * D + j] - mu[j]; t[j] = r; ln += r * r; md += r * mu[j]; }
      ln = Math.fround(Math.sqrt(ln));          // remex keeps the length and the mean dot as float32
      md = Math.fround(md);
      const den = Math.max(ln, 1e-8);
      let vl = 0, vm = 0;
      for (let j = 0; j < D; j++) {
        const u = Math.fround(Math.fround(t[j]) / den);
        let k = 0;
        while (k < 15 && u > bnd[k]) k++;
        c[j] = k;
        vl += cent[k] * cent[k]; vm += cent[k] * mu[j];
      }
      for (let m = 0; m < WORDS * 4; m++) packed[i * WORDS * 4 + m] = (c[2 * m] << 4) | c[2 * m + 1];
      const scale = ln / (Math.max(Math.sqrt(vl), 1e-12) * kappa);
      scaleBias[2 * i] = scale;
      scaleBias[2 * i + 1] = md - scale * vm;
    }
    return { packed, scaleBias };
  }

  // The k best of the first n posts for one query (Float32Array of 256, unit). k <= 256.
  async topk(q, corpus, n, k) {
    if (k < 1 || k > TOPK_MAX) throw new Error(`topk: k=${k} outside 1..${TOPK_MAX}`);
    if (q.length !== D) throw new Error(`topk: a query of ${q.length} numbers, expected ${D}`);
    const dev = this.device;
    let qoff = 0;
    for (let j = 0; j < D; j++) qoff += q[j] * this.mu[j];
    dev.queue.writeBuffer(this.qc, 0, q instanceof Float32Array ? q : Float32Array.from(q));
    const temps = [];
    const uniform = (u32s, f32At = -1, f32 = 0) => {
      const a = new ArrayBuffer(Math.max(16, Math.ceil(u32s.length * 4 / 16) * 16));
      new Uint32Array(a).set(u32s);
      if (f32At >= 0) new Float32Array(a)[f32At] = f32;
      const b = dev.createBuffer({ size: a.byteLength, usage: USAGE.UNIFORM, mappedAtCreation: true });
      new Uint8Array(b.getMappedRange()).set(new Uint8Array(a));
      b.unmap(); temps.push(b);
      return b;
    };
    const store = (bytes) => { const b = dev.createBuffer({ size: Math.max(16, bytes), usage: USAGE.STORAGE | USAGE.COPY_SRC }); temps.push(b); return b; };
    const bind = (pipe, bufs) => dev.createBindGroup({ layout: pipe.getBindGroupLayout(0), entries: bufs.map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    const enc = dev.createCommandEncoder();
    const run = (pipe, bufs, x, y = 1) => { const p = enc.beginComputePass(); p.setPipeline(pipe); p.setBindGroup(0, bind(pipe, bufs)); p.dispatchWorkgroups(x, y); p.end(); };
    if (Math.ceil(n / 256) > MAX_DIM) throw new Error(`topk: ${n} posts exceed one dispatch`);
    run(this.pipes.scan, [uniform([n, corpus.capacity, 0, 0], 2, qoff), corpus.words, corpus.aux, this.qc, corpus.scores], Math.ceil(n / 256));
    let sIn = corpus.scores, iIn = corpus.scores, m = n, inStride = corpus.capacity, implicit = 1, sOut, iOut;
    for (;;) {
      const chunks = Math.max(1, Math.ceil(m / TOPK_CHUNK)), outStride = chunks * k;
      sOut = store(outStride * 4); iOut = store(outStride * 4);
      run(this.pipes.topk, [uniform([m, inStride, outStride, k, implicit, 0, 0, 0]), sIn, iIn, sOut, iOut], chunks, 1);
      if (chunks === 1) break;
      sIn = sOut; iIn = iOut; m = outStride; inStride = outStride; implicit = 0;
    }
    const rb = dev.createBuffer({ size: k * 8, usage: USAGE.MAP_READ | USAGE.COPY_DST });
    enc.copyBufferToBuffer(sOut, 0, rb, 0, k * 4);
    enc.copyBufferToBuffer(iOut, 0, rb, k * 4, k * 4);
    dev.queue.submit([enc.finish()]);
    await rb.mapAsync(MAP.READ);
    const got = rb.getMappedRange().slice(0);
    rb.destroy();
    for (const b of temps) b.destroy();
    const kk = Math.min(k, n);
    return { idx: Int32Array.from(new Uint32Array(got, k * 4, k).subarray(0, kk)), score: new Float32Array(got, 0, k).slice(0, kk) };
  }
}
