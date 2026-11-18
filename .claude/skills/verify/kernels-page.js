// Runs in the page that kernels.mjs opens. Differential checks of the site's WebGPU kernels against
// float64 CPU references written here from the math, not from the kernels' own code:
//   RemexTail (bsky/*/tail.js): encode, prep + scan, top-k, pool, colsum, loadCodes/readCorpus,
//     with the rht rotation from image-search/params.json and the same rotation as a dense matrix;
//   SmallEngine (bsky/embedders/engine.js, Ettin-17m): embeddings against onnxruntime-web's CPU path.
// Every check returns { name, ok, detail }; nothing throws past run().
// Tolerances sit 5-100x above the error measured on SwiftShader on 2026-11-18, tight enough that a
// 1% RoPE-theta change or a 0.1% scale on one GLU fails (both measured near 1e-4).

const D = 768;

function rng(seed) {   // mulberry32
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-300)) * Math.cos(2 * Math.PI * r());

// ---------------------------------------------------------------- float64 references

// remex RHTOperator.rotate_rows for d = 768, B = 256: for r = rounds-1 .. 0, an unnormalized
// Walsh-Hadamard transform of each 256-wide block, then z[perm_r[i]] = y[i] * sign_r[i] / 16.
function rhtRef(x, plan) {
  let y = Float64Array.from(x);
  for (let r = plan.rounds - 1; r >= 0; r--) {
    for (let b0 = 0; b0 < D; b0 += 256) {
      for (let h = 1; h < 256; h *= 2) {
        for (let i = b0; i < b0 + 256; i += 2 * h) {
          for (let j = i; j < i + h; j++) {
            const a = y[j], c = y[j + h];
            y[j] = a + c;
            y[j + h] = a - c;
          }
        }
      }
    }
    const z = new Float64Array(D);
    for (let i = 0; i < D; i++) z[plan.perms[r][i]] = (y[i] * plan.signs[r][i]) / 16;
    y = z;
  }
  return y;
}

// The rotation as a dense row-major matrix: column k is the rotation of basis vector e_k.
function denseFromPlan(plan) {
  const R = new Float64Array(D * D);
  const e = new Float64Array(D);
  for (let k = 0; k < D; k++) {
    e.fill(0);
    e[k] = 1;
    const col = rhtRef(e, plan);
    for (let j = 0; j < D; j++) R[j * D + k] = col[j];
  }
  return R;
}

const matvec = (R, x) => {
  const y = new Float64Array(D);
  for (let j = 0; j < D; j++) {
    let a = 0;
    const b = j * D;
    for (let k = 0; k < D; k++) a += R[b + k] * x[k];
    y[j] = a;
  }
  return y;
};
const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
const unit = (x) => { const n = Math.max(Math.sqrt(dot(x, x)), 1e-8); return Float64Array.from(x, (v) => v / n); };

// remex encode of one vector: t = R x̂ - R mu, codes by strict > against the boundaries on t/|t|.
function encodeRef(x, R, Rmu, P) {
  const t = matvec(R, unit(x));
  for (let j = 0; j < D; j++) t[j] -= Rmu[j];
  const ln = Math.sqrt(dot(t, t));
  const md = dot(Rmu, t);
  const u = Float64Array.from(t, (v) => v / Math.max(ln, 1e-8));
  const codes = Uint8Array.from(u, (v) => (v > P.boundaries[0]) + (v > P.boundaries[1]) + (v > P.boundaries[2]));
  return { codes, u, ln, md };
}

// scale and bias from the codes actually stored (so a boundary flip does not spread to them)
function auxRef(codes, ln, md, Rmu, P) {
  let vl = 0, vm = 0;
  for (let j = 0; j < D; j++) { const e = P.centroids[codes[j]]; vl += e * e; vm += e * Rmu[j]; }
  const scale = ln / (Math.max(Math.sqrt(vl), 1e-12) * P.kappa);
  return { scale, bias: md - scale * vm };
}

// remex pack: byte k holds codes 4k..4k+3, most significant pair first.
function packRef(codes) {
  const out = new Uint8Array(192);
  for (let k = 0; k < 192; k++) out[k] = (codes[4 * k] << 6) | (codes[4 * k + 1] << 4) | (codes[4 * k + 2] << 2) | codes[4 * k + 3];
  return out;
}
function unpackRef(bytes, doc) {
  const c = new Uint8Array(D);
  for (let k = 0; k < 192; k++) {
    const b = bytes[doc * 192 + k];
    c[4 * k] = b >> 6; c[4 * k + 1] = (b >> 4) & 3; c[4 * k + 2] = (b >> 2) & 3; c[4 * k + 3] = b & 3;
  }
  return c;
}

// remex ADC score of a query against stored codes: scale * sum_j (R q̂)_j c[code_j] + bias + q̂·mu
function scoreRef(qr, qmu, codes, scale, bias, P) {
  let acc = 0;
  for (let j = 0; j < D; j++) acc += qr[j] * P.centroids[codes[j]];
  return scale * acc + bias + qmu;
}

// higher score first, lower index on ties
function topkRef(scores, k) {
  const idx = Array.from(scores, (_, i) => i);
  idx.sort((a, b) => (scores[b] - scores[a]) || (a - b));
  return idx.slice(0, k);
}

// ---------------------------------------------------------------- GPU helpers

function upload(device, data) {
  const b = device.createBuffer({ size: Math.max(16, data.byteLength), usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(b, 0, data);
  return b;
}

// ---------------------------------------------------------------- RemexTail

async function remexChecks(device, tailUrl, P, real) {
  const out = [];
  const add = (name, ok, detail = '') => out.push({ name, ok: !!ok, detail });
  const { RemexTail } = await import(tailUrl);
  const r = rng(20261118);

  // Reference rotation, checked first: an error here would make every comparison below meaningless.
  const R = denseFromPlan(P.rht);
  let orth = 0;
  for (let i = 0; i < D; i += 37) for (let j = 0; j < D; j++) {
    let s = 0;
    for (let k = 0; k < D; k++) s += R[i * D + k] * R[j * D + k];
    orth = Math.max(orth, Math.abs(s - (i === j ? 1 : 0)));
  }
  add('reference: the RHT plan as a matrix is orthonormal', orth < 1e-12, `max |RRᵀ-I| ${orth.toExponential(1)}`);

  // Corpus: N gaussian vectors with a shared offset (so mu matters), N not a multiple of the
  // 4-vector encode tile. Doc 7 is planted near query 0, and docs N-2, N-1 are exact copies of
  // doc 7, so the top-k must break the three-way tie by index.
  const N = 1501, NQ = 5;
  const offset = Float64Array.from({ length: D }, () => 0.4 * gauss(r));
  const X = Array.from({ length: N }, () => Float64Array.from(offset, (o) => o + gauss(r)));
  const Q = Array.from({ length: NQ }, () => Float64Array.from(offset, (o) => o + gauss(r)));
  X[7] = Float64Array.from(Q[0], (v) => v + 0.05 * gauss(r));
  X[N - 2] = X[7];
  X[N - 1] = X[7];
  const mu = new Float64Array(D);
  for (const x of X) { const xu = unit(x); for (let j = 0; j < D; j++) mu[j] += xu[j] / N; }
  const Rmu = matvec(R, mu);
  const ref = X.map((x) => encodeRef(x, R, Rmu, P));
  const qr = Q.map((q) => matvec(R, unit(q)));
  const qmu = Q.map((q) => dot(unit(q), mu));

  const xin = upload(device, Float32Array.from(X.flatMap((x) => Array.from(x))));
  const qin = upload(device, Float32Array.from(Q.flatMap((q) => Array.from(q))));
  const base = { mu: Float32Array.from(mu), boundaries: P.boundaries, centroids: P.centroids, kappa: P.kappa };
  const Rf32 = Float32Array.from(R);

  for (const rot of ['rht', 'dense']) {
    const tail = await RemexTail.create(device, rot === 'rht' ? { ...base, rht: P.rht } : { ...base, rotation: 'dense', R: Rf32 });
    const corpus = tail.allocCorpus(N);
    tail.encode(xin, N, corpus, 0);
    const got = await tail.readCorpus(corpus, N);

    // Codes: equal, except where t/|t| sits within float32 rounding of a boundary.
    let flips = 0, bad = 0, firstBad = '';
    for (let i = 0; i < N; i++) {
      const g = unpackRef(got.packed, i);
      for (let j = 0; j < D; j++) {
        if (g[j] === ref[i].codes[j]) continue;
        const u = ref[i].u[j];
        if (P.boundaries.some((b) => Math.abs(u - b) < 2e-6)) flips++;
        else { bad++; if (!firstBad) firstBad = `doc ${i} dim ${j}: gpu ${g[j]} ref ${ref[i].codes[j]} (u ${u.toExponential(3)})`; }
      }
    }
    add(`${rot}: encode codes match the reference`, bad === 0, `${N * D} codes, ${flips} boundary flips excused${bad ? `, ${bad} wrong: ${firstBad}` : ''}`);

    let packOk = true;
    for (let i = 0; i < 4 && packOk; i++) {
      const g = got.packed.subarray(i * 192, i * 192 + 192);
      const p = packRef(unpackRef(got.packed, i));
      packOk = g.every((v, k) => v === p[k]);
    }
    add(`${rot}: packed bytes use remex byte order`, packOk);

    let eAux = 0;
    for (let i = 0; i < N; i++) {
      const a = auxRef(unpackRef(got.packed, i), ref[i].ln, ref[i].md, Rmu, P);
      eAux = Math.max(eAux,
        Math.abs(got.scale[i] - a.scale) / Math.abs(a.scale),
        Math.abs(got.bias[i] - a.bias) / (Math.abs(a.bias) + 1e-3),
        Math.abs(got.len[i] - ref[i].ln) / ref[i].ln,
        Math.abs(got.mdot[i] - ref[i].md) / (Math.abs(ref[i].md) + 1e-3));
    }
    add(`${rot}: encode scale, bias, |t|, mu·t match`, eAux < 1e-4, `max rel err ${eAux.toExponential(2)}`);

    // Scan: scores from the GPU's own codes and aux, so this isolates prep + scan.
    const sbuf = tail.search(qin, NQ, corpus);
    const S = await tail.readScores(sbuf, NQ, corpus, N);
    sbuf.destroy();
    let eS = 0;
    for (let q = 0; q < NQ; q++) for (let i = 0; i < N; i++) {
      const e = scoreRef(qr[q], qmu[q], unpackRef(got.packed, i), got.scale[i], got.bias[i], P);
      eS = Math.max(eS, Math.abs(S[q * N + i] - e));
    }
    add(`${rot}: scan scores match the reference`, eS < 2e-6, `${NQ}×${N} scores, max abs err ${eS.toExponential(2)}`);

    // Top-k on the GPU (k = 256 over 1501 docs takes two passes) against a sort of the GPU's scores.
    for (const k of [10, 256]) {
      const res = await tail.topk(qin, NQ, corpus, N, k);
      let mism = '';
      for (let q = 0; q < NQ && !mism; q++) {
        const want = topkRef(S.subarray(q * N, q * N + N), k);
        const gotIdx = Array.from(res[q].idx);
        const p = want.findIndex((v, i) => v !== gotIdx[i]);
        if (p >= 0) mism = `query ${q} rank ${p + 1}: gpu ${gotIdx[p]} ref ${want[p]}`;
      }
      add(`${rot}: GPU top-${k} equals the sorted scores`, !mism, mism);
    }
    const tie = Array.from((await tail.topk(qin, 1, corpus, N, 3))[0].idx);
    add(`${rot}: tied copies rank by index`, tie.join() === `7,${N - 2},${N - 1}`, `top 3 of query 0: ${tie.join(', ')}`);

    // The real index of this page's model, through loadCodes, scored and ranked.
    if (rot === 'rht' && real) {
      const n = real.scaleBias.length / 2;
      const rc = tail.allocCorpus(n);
      const rmu = Float64Array.from(real.mu);
      tail.setMean(Float32Array.from(rmu));
      tail.loadCodes(rc, real.packed, real.scaleBias, 0);
      const back = await tail.readCorpus(rc, n);
      const same = back.packed.every((v, i) => v === real.packed[i]) && back.scale.every((v, i) => v === real.scaleBias[2 * i]);
      add('real index: loadCodes then readCorpus returns the same bytes', same, `${n} docs`);
      const rqr = Q.slice(0, 2).map((q) => matvec(R, unit(q)));
      const rqmu = Q.slice(0, 2).map((q) => dot(unit(q), rmu));
      const rb = tail.search(qin, 2, rc);
      const RS = await tail.readScores(rb, 2, rc, n);
      rb.destroy();
      let eR = 0;
      for (let q = 0; q < 2; q++) for (let i = 0; i < n; i++) {
        const e = scoreRef(rqr[q], rqmu[q], unpackRef(real.packed, i), real.scaleBias[2 * i], real.scaleBias[2 * i + 1], P);
        eR = Math.max(eR, Math.abs(RS[q * n + i] - e));
      }
      add('real index: scan scores match the reference', eR < 2e-6, `2×${n} scores, max abs err ${eR.toExponential(2)}`);
      const rt = await tail.topk(qin, 2, rc, n, 40);
      const okR = [0, 1].every((q) => topkRef(RS.subarray(q * n, q * n + n), 40).every((v, i) => v === rt[q].idx[i]));
      add('real index: GPU top-40 equals the sorted scores', okR);
      tail.setMean(Float32Array.from(mu));
    }

    // pool: masked mean over S tokens; row 2 has an empty mask and must come out zero.
    const B = 3, SL = 20;
    const hid = Float32Array.from({ length: B * SL * D }, () => gauss(r));
    const mask = Uint32Array.from({ length: B * SL }, (_, i) => (Math.floor(i / SL) === 2 ? 0 : (r() < 0.7 ? 1 : 0)));
    const hb = upload(device, hid), mb = upload(device, mask);
    const pb = tail.pool(hb, mb, B, SL);
    const pooled = new Float32Array(await tail.readBuffer(pb, B * D * 4));
    let eP = 0;
    for (let b = 0; b < B; b++) for (let d = 0; d < D; d++) {
      let s = 0, c = 0;
      for (let t = 0; t < SL; t++) if (mask[b * SL + t]) { s += hid[(b * SL + t) * D + d]; c++; }
      eP = Math.max(eP, Math.abs(pooled[b * D + d] - (c ? s / c : 0)));
    }
    add(`${rot}: pool matches the masked mean`, eP < 2e-6, `max abs err ${eP.toExponential(2)}`);
    hb.destroy(); mb.destroy(); pb.destroy();

    // colsum adds into an accumulator that already holds values.
    const C = 50;
    const cin = Float32Array.from({ length: C * D }, () => gauss(r));
    const acc0 = Float32Array.from({ length: D }, () => gauss(r));
    const cb = upload(device, cin), ab = upload(device, acc0);
    tail.colsum(cb, C, ab);
    const acc = new Float32Array(await tail.readBuffer(ab, D * 4));
    let eC = 0;
    for (let d = 0; d < D; d++) {
      let s = acc0[d];
      for (let b = 0; b < C; b++) s += cin[b * D + d];
      eC = Math.max(eC, Math.abs(acc[d] - s));
    }
    add(`${rot}: colsum matches`, eC < 5e-5, `max abs err ${eC.toExponential(2)}`);
    cb.destroy(); ab.destroy();
  }
  xin.destroy(); qin.destroy();
  return out;
}

// ---------------------------------------------------------------- SmallEngine vs onnxruntime-web

async function engineChecks(device, engineUrl, modelDir, ortBase, idsList) {
  const out = [];
  const add = (name, ok, detail = '') => out.push({ name, ok: !!ok, detail });
  const { SmallEngine } = await import(engineUrl);
  const [manifest, bytes] = await Promise.all([
    fetch(modelDir + 'manifest.json').then((r) => r.json()),
    fetch(modelDir + 'model.onnx').then((r) => r.arrayBuffer()),
  ]);
  const eng = await SmallEngine.create(device, manifest, bytes, { maxTokens: 512, maxSeqs: 8 });
  const single = [];
  for (const ids of idsList) single.push(await eng.embed([ids]));
  const batch = await eng.embed(idsList);
  eng.destroy();

  const ort = await import(ortBase + 'ort.wasm.min.mjs');
  ort.env.wasm.wasmPaths = ortBase;
  ort.env.wasm.numThreads = 1;
  const session = await ort.InferenceSession.create(new Uint8Array(bytes), { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
  const outName = session.outputNames.includes('sentence_embedding') ? 'sentence_embedding' : session.outputNames[0];
  let minCos = 1, maxAbs = 0, maxBatch = 0;
  const dim = manifest.dim;
  for (let s = 0; s < idsList.length; s++) {
    const ids = idsList[s], L = ids.length;
    const res = await session.run({
      input_ids: new ort.Tensor('int64', BigInt64Array.from(ids, BigInt), [1, L]),
      attention_mask: new ort.Tensor('int64', new BigInt64Array(L).fill(1n), [1, L]),
    });
    const ref = unit(Float64Array.from(res[outName].data));
    const g = single[s];
    minCos = Math.min(minCos, dot(ref, g));
    for (let d = 0; d < dim; d++) {
      maxAbs = Math.max(maxAbs, Math.abs(g[d] - ref[d]));
      maxBatch = Math.max(maxBatch, Math.abs(batch[s * dim + d] - g[d]));
    }
  }
  await session.release();
  add('Ettin engine: embeddings match onnxruntime-web (CPU)', maxAbs < 1e-5,
    `${idsList.length} texts, ${idsList.map((x) => x.length).join('/')} tokens; min cosine ${minCos.toFixed(7)}, max abs diff ${maxAbs.toExponential(2)}`);
  add('Ettin engine: a batch equals the same texts one at a time', maxBatch < 1e-6, `max abs diff ${maxBatch.toExponential(2)}`);
  return out;
}

// ---------------------------------------------------------------- entry

export async function run(cfg) {
  const checks = [];
  const time = {};
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) return { checks: [{ name: 'WebGPU adapter', ok: false, detail: 'navigator.gpu has no adapter' }] };
  const device = await adapter.requestDevice({ requiredLimits: { maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize } });
  const info = adapter.info || {};
  const P = await fetch(cfg.params).then((r) => r.json());
  let real = null;
  if (cfg.realIndex) {
    const [idx, codes, aux] = await Promise.all([
      fetch(cfg.realIndex + 'index.json').then((r) => r.json()),
      fetch(cfg.realIndex + 'codes.u8.bin').then((r) => r.arrayBuffer()),
      fetch(cfg.realIndex + 'aux.f32.bin').then((r) => r.arrayBuffer()),
    ]);
    const n = Math.min(cfg.realDocs, idx.n);
    real = { mu: idx.mu, packed: new Uint8Array(codes, 0, n * 192), scaleBias: new Float32Array(aux, 0, n * 2) };
  }
  for (const t of cfg.tails) {
    const t0 = performance.now();
    try {
      for (const c of await remexChecks(device, t.url, P, t.real ? real : null)) checks.push({ ...c, name: `${t.label} ${c.name}` });
    } catch (e) {
      checks.push({ name: `${t.label} RemexTail checks ran`, ok: false, detail: String(e && e.stack || e).split('\n').slice(0, 2).join(' | ') });
    }
    time[t.label] = Math.round(performance.now() - t0);
  }
  if (cfg.engine) {
    const t0 = performance.now();
    try {
      checks.push(...await engineChecks(device, cfg.engine.url, cfg.engine.modelDir, cfg.engine.ort, cfg.engine.ids));
    } catch (e) {
      checks.push({ name: 'Ettin engine checks ran', ok: false, detail: String(e && e.stack || e).split('\n').slice(0, 2).join(' | ') });
    }
    time.engine = Math.round(performance.now() - t0);
  }
  device.destroy();
  return { checks, time, adapter: `${info.vendor || '?'} ${info.architecture || ''} ${info.description || ''}`.trim() };
}
