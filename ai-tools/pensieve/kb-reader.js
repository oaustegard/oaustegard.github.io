// kb-reader.js — Pure JS reader for remax_kb v2 (.kbi + .kbc/) artifacts.
//
// Vendorable into Cloudflare Workers, Pages Functions, browsers, or Node.
// Zero external dependencies: rolls its own ZIP_STORED reader, NPY parser,
// Hamming popcount, BM25 scoring, and stacked-SimHash query encoder.
//
// Projections: `rademacher` and `srht` are regenerated here from the seed and
// need NO shipped bytes — prefer them when packing for JS. `haar` requires the
// .kbi to ship its rotations (`binarizer/rotations.f32`, or
// `binarizer/rotations.i8` + `binarizer/rotations.scale.f32` when
// `binarizer.rotations_quant == "int8"`; see SPEC_v2 §binarizer/rotations) and
// throws on absence, because bit-fidelity with NumPy's QR is impractical
// outside NumPy. The Python reader re-derives haar from (dim, k, seed) and
// ignores the sidecar, so that asymmetry is real and the error message says
// what to do about it.
//
// Codecs: `remax-centered-simhash` only. A `remex-lloyd-max` artifact is
// REFUSED at open with an actionable message — see REMEX_REFUSAL for why
// decoding it in JavaScript is not a matter of effort.
//
// Validation: this reader implements SPEC_v2 "Validation order" steps 1-7 at
// open (step 8 needs an embedder and is the caller's). It refuses the same
// artifacts remax_kb.read_v2 refuses; parity is asserted, on the identical
// corrupted bytes, by tests/gates/gate_open_validation.py.

// ─────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────

const SPEC_VERSION = "2";
const KIND = "split-index";
const BINARIZER_KIND = "remax-centered-simhash";
const REMEX_KIND = "remex-lloyd-max";
// SPEC_v2 §Field semantics: "A reader MUST refuse unknown kinds." Kept in sync
// with remax_kb.read_v2.SUPPORTED_BINARIZER_KINDS. `remex-lloyd-max` is listed
// as a *recognised* kind so it earns its own actionable refusal below rather
// than the generic "unknown kind" one — see REMEX_REFUSAL.
const SUPPORTED_BINARIZER_KINDS = [BINARIZER_KIND, REMEX_KIND];
const ROW_BYTES_CHUNK_MAP = 24;
const FLAG_TOMBSTONE = 0x01;
const RRF_C_DEFAULT = 60;

// Why this reader refuses remex outright instead of decoding it. Decoding a
// `remex-lloyd-max` row needs BOTH the Lloyd-Max centroid table AND the Haar
// rotation, and a remex `.kbi` ships NEITHER (SPEC_v2 §remex codec: "No
// rotation sidecar — the Haar rotation and Lloyd-Max boundaries are derived
// from (dim, bits, seed) alone"). Re-deriving them in JS would mean
// reproducing, bit-for-bit:
//   * numpy `default_rng(seed).standard_normal((d, d))` — PCG64 +
//     SeedSequence + the Ziggurat normal sampler, in float64;
//   * an explicit Householder QR over that matrix with Mezzadri sign
//     correction; and
//   * 300 Lloyd iterations driven by scipy's Gaussian CDF/PDF, where a 1-ulp
//     erf difference moves the centroids.
// A rotation that is merely *close* is not an approximation of the right one —
// SPEC_v2 §projection: mixing two valid projections "flips ~50% of code bits
// and collapses recall to chance". This is the same impossibility that makes
// the haar sidecar mandatory, one layer deeper. A refusal is the honest
// answer; the previous behaviour (compute `_rowBytes` as `dim*k/8`, which is
// the WRONG width for remex's `dim*bits/8`) either threw a misleading size
// error or — when the two happened to coincide — opened the artifact and
// Hamming-scored quantization indices.
// The remedy for a haar `.kbi` that arrived without its rotation sidecar.
// This reader keeps the requirement — SPEC_v2 §binarizer/rotations.f32 makes
// it a MUST for exactly this class of reader — but the old message
// ("missing required entry binarizer/rotations.f32") named the symptom and
// left the reader to guess that repacking was even an option. Every haar
// artifact ships 9 MiB of rotations at dim=768/k=4 for a consumer that may
// never need them; the seed-only projections exist so it does not have to.
const SIDECAR_REMEDY =
  "A haar .kbi MUST ship its rotations, because JavaScript cannot reproduce " +
  "numpy's PCG64 + Ziggurat + LAPACK QR (SPEC_v2 §binarizer/rotations.f32); " +
  "the Python reader re-derives them from (dim, k, seed) and needs no " +
  "sidecar, which is why an artifact can reach this reader without one. " +
  "Remedy: repack seed-only with `remax-kb pack ... --projection srht` " +
  "(structured-orthogonal, regenerated here from (dim, k, seed, " +
  "srht_rounds), ~Haar recall, ZERO shipped bytes) or `--projection " +
  "rademacher`. Both round-trip through this reader with no rotation entry " +
  "at all.";

const REMEX_REFUSAL =
  `kb-reader: binarizer.kind "${REMEX_KIND}" is not supported by this reader. ` +
  "Decoding remex needs the Lloyd-Max centroids and the Haar rotation, both " +
  "derived inside numpy/scipy from (dim, bits, seed), and a remex .kbi ships " +
  "no sidecar to read them from (SPEC_v2 §remex codec). Remedy: read this " +
  "artifact with the Python reader (remax_kb.read_v2, `pip install " +
  "'remax-kb[remex]'`), or repack it for JS with `remax-kb pack ... --codec " +
  "remax --projection srht`.";

// ─────────────────────────────────────────────────────────────────────────
// ZIP_STORED reader (no inflation; central-directory walk)
// ─────────────────────────────────────────────────────────────────────────

const SIG_LFH = 0x04034b50;
const SIG_CFH = 0x02014b50;
const SIG_EOCD = 0x06054b50;

export class ZipStored {
  /** @param {ArrayBuffer | Uint8Array} buffer */
  constructor(buffer) {
    const ab = buffer instanceof Uint8Array ? buffer.buffer : buffer;
    const off = buffer instanceof Uint8Array ? buffer.byteOffset : 0;
    const len = buffer instanceof Uint8Array ? buffer.byteLength : buffer.byteLength;
    this._view = new DataView(ab, off, len);
    this._base = off;
    this._buf = ab;
    this._entries = this._parse();
  }

  _parse() {
    const v = this._view;
    const N = v.byteLength;
    // EOCD is at least 22 bytes; comment can extend it up to 65557
    let eocd = -1;
    for (let i = N - 22; i >= Math.max(0, N - 65557); i--) {
      if (v.getUint32(i, true) === SIG_EOCD) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("kb-reader: EOCD not found in .kbi");
    const total = v.getUint16(eocd + 10, true);
    const cdOffset = v.getUint32(eocd + 16, true);

    const entries = new Map();
    let p = cdOffset;
    for (let i = 0; i < total; i++) {
      if (v.getUint32(p, true) !== SIG_CFH) {
        throw new Error(`kb-reader: bad central-directory header at ${p}`);
      }
      const method = v.getUint16(p + 10, true);
      if (method !== 0) {
        throw new Error(
          `kb-reader: zip entry uses compression method ${method}; ` +
          `only STORED (0) is supported. SPEC_v2 mandates ZIP_STORED.`
        );
      }
      const size = v.getUint32(p + 24, true);
      const nameLen = v.getUint16(p + 28, true);
      const extraLen = v.getUint16(p + 30, true);
      const commentLen = v.getUint16(p + 32, true);
      const lfh = v.getUint32(p + 42, true);
      const name = new TextDecoder().decode(
        new Uint8Array(this._buf, this._base + p + 46, nameLen)
      );
      // Walk local file header to find data offset
      if (v.getUint32(lfh, true) !== SIG_LFH) {
        throw new Error(`kb-reader: bad local-file header for ${name}`);
      }
      const lfhNameLen = v.getUint16(lfh + 26, true);
      const lfhExtraLen = v.getUint16(lfh + 28, true);
      const dataOffset = lfh + 30 + lfhNameLen + lfhExtraLen;
      entries.set(name, { offset: dataOffset, size });
      p += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
  }

  has(name) { return this._entries.has(name); }
  list() { return [...this._entries.keys()]; }

  /** @returns {Uint8Array} view (no copy) */
  read(name) {
    const e = this._entries.get(name);
    if (!e) throw new Error(`kb-reader: entry not found: ${name}`);
    return new Uint8Array(this._buf, this._base + e.offset, e.size);
  }

  readText(name) {
    return new TextDecoder().decode(this.read(name));
  }
}

// ─────────────────────────────────────────────────────────────────────────
// NPY parser (numpy binary array format)
// ─────────────────────────────────────────────────────────────────────────

const NPY_MAGIC = "\x93NUMPY";

const NPY_DTYPE_CTORS = {
  "<f4": Float32Array, "<f8": Float64Array,
  "<i4": Int32Array,   "<i8": BigInt64Array,
  "<u4": Uint32Array,
  "|i1": Int8Array,    "|u1": Uint8Array,
};

export function parseNpy(bytes) {
  for (let i = 0; i < NPY_MAGIC.length; i++) {
    if (bytes[i] !== NPY_MAGIC.charCodeAt(i)) {
      throw new Error("kb-reader: not an NPY file");
    }
  }
  const verMajor = bytes[6];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let headerLen, headerStart;
  if (verMajor === 1) {
    headerLen = view.getUint16(8, true);
    headerStart = 10;
  } else {
    headerLen = view.getUint32(8, true);
    headerStart = 12;
  }
  const header = new TextDecoder().decode(
    bytes.subarray(headerStart, headerStart + headerLen)
  );
  // Header is a Python dict literal, e.g.:
  //   {'descr': '<f4', 'fortran_order': False, 'shape': (3, 32, 32), }
  const dtype = /'descr':\s*'([^']+)'/.exec(header)?.[1];
  const fortran = /'fortran_order':\s*(True|False)/.exec(header)?.[1] === "True";
  const shapeStr = /'shape':\s*\(([^)]*)\)/.exec(header)?.[1] ?? "";
  const shape = shapeStr
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(Number);
  if (fortran) throw new Error("kb-reader: fortran_order NPY not supported");

  const Ctor = NPY_DTYPE_CTORS[dtype];
  if (!Ctor) throw new Error(`kb-reader: unsupported NPY dtype ${dtype}`);

  const dataStart = headerStart + headerLen;
  // Copy to align — typed arrays require alignment matching their elem size
  const slice = bytes.subarray(dataStart).slice();
  const elemCount = slice.byteLength / Ctor.BYTES_PER_ELEMENT;
  const array = new Ctor(slice.buffer, slice.byteOffset, elemCount);
  return { array, shape, dtype };
}

// ─────────────────────────────────────────────────────────────────────────
// Hamming popcount LUT
// ─────────────────────────────────────────────────────────────────────────

const POPCOUNT = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  let v = i, c = 0;
  while (v) { c += v & 1; v >>= 1; }
  POPCOUNT[i] = c;
}

function hammingDistance(a, b, len) {
  // a, b: Uint8Array of length >= len
  let d = 0;
  for (let i = 0; i < len; i++) d += POPCOUNT[a[i] ^ b[i]];
  return d;
}

// ─────────────────────────────────────────────────────────────────────────
// Binarizer (shipped rotations → query code)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Encode a query embedding into a v2 chunk_map code.
 *
 * Matches `remax.StackedSignBitQuantizer.encode()` bit-for-bit when given:
 *   - `qVec`: Float32Array of length `fullDim`
 *   - `mean`: Float32Array of length `fullDim` (binarizer.mean_vector)
 *   - `rotations`: Float32Array of length `k * dim * dim` (binarizer/rotations.f32)
 *
 * Bit-pack convention matches `numpy.packbits(..., bitorder='big')`:
 * within a byte, bit 0 of the projection lands at 0x80, bit 7 at 0x01.
 * Rotation outputs are concatenated in stack-order across the codeword.
 *
 * @returns {Uint8Array} of length `(dim * k) / 8`
 */
/**
 * Regenerate the Rademacher (±1) projection planes from (dim, k, seed).
 *
 * Bit-identical to `remax_kb.projection.rademacher_planes` — both compute a
 * splitmix64 stream over the flat (k, dim, dim) tensor (C-order) and map the
 * top bit of each draw to ±1. All arithmetic is unsigned 64-bit modular,
 * done here with BigInt masked to 64 bits. See SPEC_v2 §projection.
 *
 * @returns {Float32Array} of length k*dim*dim, entries ∈ {-1, +1}
 */
export function rademacherPlanes(dim, k, seed) {
  const MASK = (1n << 64n) - 1n;
  const GOLDEN = 0x9e3779b97f4a7c15n;
  const M1 = 0xbf58476d1ce4e5b9n;
  const M2 = 0x94d049bb133111ebn;
  const n = k * dim * dim;
  const out = new Float32Array(n);
  const s = BigInt(seed) & MASK;
  for (let i = 0; i < n; i++) {
    let z = (s + BigInt(i + 1) * GOLDEN) & MASK;
    z = ((z ^ (z >> 30n)) * M1) & MASK;
    z = ((z ^ (z >> 27n)) * M2) & MASK;
    z = (z ^ (z >> 31n)) & MASK;
    out[i] = (z >> 63n) & 1n ? -1 : 1;
  }
  return out;
}

/**
 * Regenerate the SRHT projection matrix from (dim, k, seed, rounds).
 *
 * Bit-identical to `remax_kb.projection.srht_matrix`. Each stack is `rounds`
 * rounds of (seed-driven ±1 diagonal, then Walsh–Hadamard) applied to the
 * `dim→pad` zero-padded identity, taken back to `dim`, then per-output-column
 * L2-normalized to float32. The FWHT is pure integer (magnitudes stay < 2^53,
 * exact in JS numbers); the normalize uses `Math.fround` to match numpy float32.
 * See SPEC_v2 §projection.
 *
 * @returns {Float32Array} of length k*dim*dim, row-major (stack, d, e)
 */
export function srhtMatrix(dim, k, seed, rounds) {
  const MASK = (1n << 64n) - 1n;
  const GOLDEN = 0x9e3779b97f4a7c15n;
  const M1 = 0xbf58476d1ce4e5b9n;
  const M2 = 0x94d049bb133111ebn;
  let pad = 1;
  while (pad < dim) pad <<= 1;
  // splitmix64 ±1 signs, flat index ((j*rounds + r)*pad + p)
  const nSign = k * rounds * pad;
  const sign = new Int32Array(nSign);
  const s = BigInt(seed) & MASK;
  for (let i = 0; i < nSign; i++) {
    let z = (s + BigInt(i + 1) * GOLDEN) & MASK;
    z = ((z ^ (z >> 30n)) * M1) & MASK;
    z = ((z ^ (z >> 27n)) * M2) & MASK;
    z = (z ^ (z >> 31n)) & MASK;
    sign[i] = (z >> 63n) & 1n ? -1 : 1;
  }
  const fwht = (a) => {
    for (let h = 1; h < pad; h <<= 1) {
      for (let i = 0; i < pad; i += h * 2) {
        for (let j = i; j < i + h; j++) {
          const x = a[j], y = a[j + h];
          a[j] = x + y; a[j + h] = x - y;
        }
      }
    }
  };
  const out = new Float32Array(k * dim * dim);
  for (let j = 0; j < k; j++) {
    const R = new Float64Array(dim * dim);  // R[d*dim + e]
    for (let d = 0; d < dim; d++) {
      const row = new Float64Array(pad);
      row[d] = 1;
      for (let r = 0; r < rounds; r++) {
        const off = (j * rounds + r) * pad;
        for (let p = 0; p < pad; p++) row[p] *= sign[off + p];
        fwht(row);
      }
      for (let e = 0; e < dim; e++) R[d * dim + e] = row[e];
    }
    for (let e = 0; e < dim; e++) {
      let ss = 0;
      for (let d = 0; d < dim; d++) { const v = R[d * dim + e]; ss += v * v; }
      const nrm = Math.sqrt(ss) || 1;
      for (let d = 0; d < dim; d++) {
        out[j * dim * dim + d * dim + e] = Math.fround(R[d * dim + e] / nrm);
      }
    }
  }
  return out;
}

export function encodeQueryCode(qVec, mean, rotations, dim, k) {
  const fullDim = mean.length;
  if (qVec.length !== fullDim) {
    throw new Error(`encodeQueryCode: qVec length ${qVec.length} != fullDim ${fullDim}`);
  }
  if (rotations.length !== k * dim * dim) {
    throw new Error(
      `encodeQueryCode: rotations length ${rotations.length} != k*dim*dim ${k * dim * dim}`
    );
  }
  // 1) Center
  const centered = new Float32Array(fullDim);
  for (let i = 0; i < fullDim; i++) centered[i] = qVec[i] - mean[i];
  // 2) Truncate to dim
  const x = centered.subarray(0, dim);

  // 3) For each rotation, compute x @ Q (length dim), then sign-pack
  const rowBytes = (dim * k) / 8;
  const code = new Uint8Array(rowBytes);
  for (let j = 0; j < k; j++) {
    const qOff = j * dim * dim;
    const bitBase = j * dim;
    for (let col = 0; col < dim; col++) {
      let sum = 0;
      const colBase = qOff + col;
      for (let row = 0; row < dim; row++) {
        sum += x[row] * rotations[colBase + row * dim];
      }
      // STRICT `> 0`, matching `remax.packing.encode_signs` ("x > 0 → bit 1;
      // x ≤ 0 → bit 0") and `StackedSignBitQuantizer.encode`'s
      // `np.packbits(rotated > 0)`. This reader packed on `>= 0` until 2026-08,
      // which produced the OPPOSITE bit from the packer for any projection
      // landing exactly on 0.0 — by construction, independent of float
      // rounding. Exact zeros are not exotic: a query orthogonal to a plane
      // (e.g. a ±1 rademacher plane against a vector whose contributions
      // cancel) hits 0.0 exactly in both f32 and f64.
      if (sum > 0) {
        // big-endian bitorder: bit `i` of byte `B` is mask (1 << (7 - i & 7))
        const bitIdx = bitBase + col;
        code[bitIdx >>> 3] |= 1 << (7 - (bitIdx & 7));
      }
    }
  }
  return code;
}

// ─────────────────────────────────────────────────────────────────────────
// Base64
// ─────────────────────────────────────────────────────────────────────────

function base64ToFloat32(b64) {
  // Workers/browsers: atob; Node: Buffer.from
  const binStr = typeof atob === "function"
    ? atob(b64)
    : Buffer.from(b64, "base64").toString("binary");
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
  // Re-slice to align to 4-byte boundary
  const aligned = bytes.slice();
  return new Float32Array(aligned.buffer, aligned.byteOffset, aligned.byteLength / 4);
}

// ─────────────────────────────────────────────────────────────────────────
// BM25 scoring from CSC (data, indices, indptr arrays)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Score a tokenized query against a BM25 corpus stored as CSC sparse matrix.
 * Returns Float32Array of scores (length = num_docs = live_count).
 */
function bm25Scores(queryTokens, bm25) {
  const { data, indices, indptr, vocab, numDocs } = bm25;
  const scores = new Float32Array(numDocs);
  for (const tok of queryTokens) {
    const col = vocab[tok];
    if (col == null) continue;
    const start = indptr[col], end = indptr[col + 1];
    for (let p = start; p < end; p++) {
      scores[indices[p]] += data[p];
    }
  }
  return scores;
}

// The writer indexes with `bm25s.tokenize(texts, stopwords=None)`, whose
// default `token_pattern` is scikit-learn's `(?u)\b\w\w+\b`: maximal runs of
// two or more Unicode word characters, lowercased. Python's `\w` covers
// `[\p{L}\p{N}_]`; JS `\w` is ASCII-only and would split `response_model`,
// `get_user` and `café` — all of which the writer keeps whole — into
// fragments that miss the vocabulary and score exactly zero.
//
// This is the ONLY place the pattern is spelled out: the Python reader calls
// bm25s.tokenize directly rather than restating it. Parity between this regex
// and bm25s's actual behaviour is asserted by running bm25s itself, in
// tests/gates/gate_tokenizer_parity.py.
const QUERY_TOKEN_RE = /[\p{L}\p{N}_]{2,}/gu;

export function tokenizeQuery(text) {
  return text.toLowerCase().match(QUERY_TOKEN_RE) || [];
}

// ─────────────────────────────────────────────────────────────────────────
// chunk_map.bin row decoder
// ─────────────────────────────────────────────────────────────────────────

function readChunkMapRow(view, rowIdx) {
  const o = rowIdx * ROW_BYTES_CHUNK_MAP;
  return {
    shardId: view.getUint16(o, true),
    flags: view.getUint8(o + 2),
    byteOffset: Number(view.getBigUint64(o + 4, true)),
    byteLength: view.getUint32(o + 12, true),
    chunkIdOffset: Number(view.getBigUint64(o + 16, true)),
  };
}

function readChunkId(chunkIds, offset) {
  let end = offset;
  while (end < chunkIds.length && chunkIds[end] !== 0) end++;
  return new TextDecoder().decode(chunkIds.subarray(offset, end));
}

// `fatal: true` makes decode() throw on malformed UTF-8 instead of silently
// substituting U+FFFD, which is what let a corrupt chunk_id through before.
const UTF8_STRICT = new TextDecoder("utf-8", { fatal: true });

/**
 * SPEC_v2 validation step 5 — every `chunk_id_offset` in chunk_map.bin must
 * lie inside chunk_ids.bin, be NUL-terminated before its end, and decode as
 * UTF-8.
 *
 * Done EAGERLY at open for the same reason the Python reader does it there: a
 * `.kbi` is fetched over HTTP from a third party, so these offsets are
 * attacker-influenceable, and deferring the check meant an unlucky row
 * produced a garbled id (or a silent U+FFFD) in the middle of a search.
 * Error text is deliberately close to read_v2._validate_chunk_id_offsets so
 * the two readers are diffable when they disagree.
 */
function validateChunkIdOffsets(view, chunkIds, total) {
  const n = chunkIds.length;
  for (let row = 0; row < total; row++) {
    const offset = Number(
      view.getBigUint64(row * ROW_BYTES_CHUNK_MAP + 16, true)
    );
    if (!(offset < n)) {
      throw new Error(
        `kb-reader: chunk_map row ${row}: chunk_id_offset ${offset} is ` +
        `outside chunk_ids.bin (${n} bytes)`
      );
    }
    let end = offset;
    while (end < n && chunkIds[end] !== 0) end++;
    if (end >= n) {
      throw new Error(
        `kb-reader: chunk_map row ${row}: chunk_id at offset ${offset} is ` +
        `not NUL-terminated before the end of chunk_ids.bin`
      );
    }
    try {
      UTF8_STRICT.decode(chunkIds.subarray(offset, end));
    } catch (exc) {
      throw new Error(
        `kb-reader: chunk_map row ${row}: chunk_id at offset ${offset} is ` +
        `not valid UTF-8 (${(exc && exc.message) || exc})`
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Main reader
// ─────────────────────────────────────────────────────────────────────────

export class KBReader {
  /**
   * Parse a .kbi byte buffer. Throws on validation failure.
   * @param {Uint8Array | ArrayBuffer} kbiBytes
   * @param {string} chunksBaseUri - absolute URL of the .kbc/ directory
   */
  constructor(kbiBytes, chunksBaseUri) {
    const zip = new ZipStored(kbiBytes);

    // Required entries (the rotation sidecar is validated below, per
    // binarizer.rotations_quant — f32 vs int8 ship different files).
    for (const name of ["manifest.json", "vectors.bin", "chunk_map.bin",
                        "chunk_ids.bin"]) {
      if (!zip.has(name)) {
        throw new Error(`kb-reader: missing required entry ${name}`);
      }
    }

    // Kept so callers (and the parity gate) can ask what the artifact actually
    // shipped — in particular whether a `binarizer/rotations.*` sidecar is
    // present, which is the whole difference between a portable seed-only
    // `.kbi` and one that carries megabytes of Haar planes.
    this._zipNames = zip.list();

    this.manifest = JSON.parse(zip.readText("manifest.json"));
    if (this.manifest.spec_version !== SPEC_VERSION) {
      throw new Error(
        `kb-reader: unsupported spec_version ${this.manifest.spec_version}`
      );
    }
    if (this.manifest.kind !== KIND) {
      throw new Error(`kb-reader: unsupported kind ${this.manifest.kind}`);
    }
    const bin = this.manifest.binarizer || {};
    // SPEC_v2 validation step 2, third clause. This MUST come before anything
    // interprets the binarizer block: `_rowBytes` below is codec-specific, so
    // an unrecognised kind that fell through here was decoded as remax
    // centered-simhash with no error and no warning — the exact v1→v2
    // regression read_v2._validate_manifest_kinds was added to close.
    if (!SUPPORTED_BINARIZER_KINDS.includes(bin.kind)) {
      throw new Error(
        `kb-reader: unsupported binarizer kind ${JSON.stringify(bin.kind)}; ` +
        `this reader speaks ${JSON.stringify(SUPPORTED_BINARIZER_KINDS)}`
      );
    }
    if (bin.kind === REMEX_KIND) throw new Error(REMEX_REFUSAL);
    this._dim = bin.dim;
    this._k = bin.k;
    this._seed = bin.seed;
    this._fullDim = this.manifest.embedder.full_dim;
    this._rowBytes = (this._dim * this._k) / 8;
    this._totalBits = this._rowBytes * 8;

    this._mean = base64ToFloat32(bin.mean_vector_b64);
    if (this._mean.length !== this._fullDim) {
      throw new Error(
        `kb-reader: mean length ${this._mean.length} != full_dim ${this._fullDim}`
      );
    }

    // Projection planes for the query encoder. 'rademacher' ships nothing and
    // is regenerated from (dim,k,seed); 'haar' ships an f32 or int8 sidecar.
    // See SPEC_v2 §binarizer/rotations + §projection.
    const nRot = this._k * this._dim * this._dim;
    const projection = bin.projection || "haar";
    const rotQuant = bin.rotations_quant || "float32";
    if (projection === "rademacher") {
      this._rotations = rademacherPlanes(this._dim, this._k, bin.seed);
    } else if (projection === "srht") {
      this._rotations = srhtMatrix(this._dim, this._k, bin.seed, bin.srht_rounds ?? 3);
    } else if (rotQuant === "int8") {
      if (!zip.has("binarizer/rotations.i8") ||
          !zip.has("binarizer/rotations.scale.f32")) {
        throw new Error(
          "kb-reader: binarizer.rotations_quant is \"int8\" but " +
          "binarizer/rotations.i8 and/or binarizer/rotations.scale.f32 are " +
          "absent. " + SIDECAR_REMEDY
        );
      }
      const i8u = zip.read("binarizer/rotations.i8").slice();
      const i8 = new Int8Array(i8u.buffer, i8u.byteOffset, i8u.length);
      const scAligned = zip.read("binarizer/rotations.scale.f32").slice();
      const scale = new Float32Array(
        scAligned.buffer, scAligned.byteOffset, this._k * this._dim
      );
      if (i8.length !== nRot) {
        throw new Error("kb-reader: rotations.i8 size mismatch");
      }
      if (scale.length !== this._k * this._dim) {
        throw new Error("kb-reader: rotations.scale.f32 size mismatch");
      }
      // Dequant: Q[j, row, col] = i8[j, row, col] * scale[j, col]
      const rot = new Float32Array(nRot);
      const d = this._dim;
      for (let j = 0; j < this._k; j++) {
        const base = j * d * d;
        const sBase = j * d;
        for (let row = 0; row < d; row++) {
          const rBase = base + row * d;
          for (let col = 0; col < d; col++) {
            rot[rBase + col] = i8[rBase + col] * scale[sBase + col];
          }
        }
      }
      this._rotations = rot;
    } else {
      if (!zip.has("binarizer/rotations.f32")) {
        throw new Error(
          `kb-reader: binarizer.projection is ${JSON.stringify(projection)} ` +
          "but binarizer/rotations.f32 is absent. " + SIDECAR_REMEDY
        );
      }
      const rotAligned = zip.read("binarizer/rotations.f32").slice();
      this._rotations = new Float32Array(
        rotAligned.buffer, rotAligned.byteOffset, nRot
      );
      if (this._rotations.length !== nRot) {
        throw new Error("kb-reader: rotations size mismatch");
      }
    }

    // Vectors
    const vecBytes = zip.read("vectors.bin");
    const total = this.manifest.chunks.total_rows;
    if (vecBytes.length !== total * this._rowBytes) {
      throw new Error(
        `kb-reader: vectors.bin size ${vecBytes.length} != ${total} * ${this._rowBytes}`
      );
    }
    this._vectors = vecBytes.slice();  // own copy
    this._totalRows = total;

    // chunk_map
    const cmBytes = zip.read("chunk_map.bin");
    if (cmBytes.length !== total * ROW_BYTES_CHUNK_MAP) {
      throw new Error("kb-reader: chunk_map.bin size mismatch");
    }
    const cmAligned = cmBytes.slice();
    this._chunkMap = cmAligned;
    this._chunkMapView = new DataView(
      cmAligned.buffer, cmAligned.byteOffset, cmAligned.byteLength
    );

    // chunk_ids — SPEC_v2 validation step 5
    this._chunkIds = zip.read("chunk_ids.bin").slice();
    validateChunkIdOffsets(this._chunkMapView, this._chunkIds, total);

    // bm25 (optional)
    if (zip.has("bm25/data.csc.index.npy")) {
      const data = parseNpy(zip.read("bm25/data.csc.index.npy")).array;
      const indices = parseNpy(zip.read("bm25/indices.csc.index.npy")).array;
      const indptr = parseNpy(zip.read("bm25/indptr.csc.index.npy")).array;
      const vocab = JSON.parse(zip.readText("bm25/vocab.index.json"));
      const params = JSON.parse(zip.readText("bm25/params.index.json"));
      this._bm25 = { data, indices, indptr, vocab, numDocs: params.num_docs };
    } else {
      this._bm25 = null;
    }

    // Tombstone mask + live→absolute row mapping
    this._tomb = new Uint8Array(total);
    this._rowOfLive = [];
    for (let i = 0; i < total; i++) {
      const f = this._chunkMapView.getUint8(i * ROW_BYTES_CHUNK_MAP + 2);
      if (f & FLAG_TOMBSTONE) {
        this._tomb[i] = 1;
      } else {
        this._rowOfLive.push(i);
      }
    }
    // SPEC_v2 validation step 6 — the manifest's live_count must match the
    // flags actually set in chunk_map.bin. Without bm25/ present nothing else
    // constrains it, so a dense-only .kbi could disagree with its own manifest.
    const declaredLive = this.manifest.chunks.live_count;
    if (declaredLive != null && this._rowOfLive.length !== declaredLive) {
      throw new Error(
        `kb-reader: live_count mismatch: counted ${this._rowOfLive.length}, ` +
        `manifest says ${declaredLive}`
      );
    }
    if (this._bm25 && this._rowOfLive.length !== this._bm25.numDocs) {
      throw new Error(
        `kb-reader: bm25 num_docs ${this._bm25.numDocs} != live rows ${this._rowOfLive.length}`
      );
    }

    this._chunksUri = chunksBaseUri.endsWith("/") ? chunksBaseUri : chunksBaseUri + "/";
  }

  get liveCount() { return this._rowOfLive.length; }

  // ───── Query path ─────

  /**
   * Run hybrid search.
   *
   * Every default here is the Python reader's default (`KB.search` in
   * remax_kb/read_v2.py). They diverged until 2026-08 — this reader
   * over-fetched `max(4k, 20)` against Python's `max(8k, 64)`, hardcoded the
   * RRF constant, and had no semantic floor at all — which meant the same
   * `.kbi` and the same query returned different results depending on which
   * conforming reader you used. Parity is asserted by
   * tests/gates/gate_cross_reader.py, which runs BOTH readers with no tuning
   * arguments at all.
   *
   * @param {string} query
   * @param {Float32Array} queryEmbedding - already-embedded query vector
   * @param {number} k - top-K to return
   * @param {number|null} alpha - null → RRF; number → weighted
   * @param {number|null} overFetch - fusion pool depth per modality;
   *   null → `defaultOverFetch(k)`
   * @param {number} rrfC - RRF rank constant (lower = sharper toward rank-1)
   * @param {number|string|null} minSim - dense floor in `dense_sim` units;
   *   null → the manifest's `retrieval.min_sim`, else off; `'auto'` → a
   *   codec-aware noise floor; `'off'` → disabled. See `resolveMinSim`.
   * @returns array of hits, NOT yet enriched with text/meta.
   */
  search(query, queryEmbedding, {
    k = 5, alpha = null, overFetch = null,
    rrfC = RRF_C_DEFAULT, minSim = null,
  } = {}) {
    let dense = this._denseSearch(queryEmbedding);

    // Semantic floor, applied BEFORE fusion (SPEC_v2 §retrieval.min_sim).
    // Dense retrieval always ranks *something* nearest, so without this the
    // top dense hit for a nonsense query earns RRF rank-credit regardless of
    // whether it is relevant at all.
    const floor = this.resolveMinSim(minSim);
    if (floor !== null) {
      dense = dense.filter(h => h.dense_sim != null && h.dense_sim >= floor);
    }

    const lex = this._bm25 ? this._bm25Search(query) : null;
    if (!lex) return dense.slice(0, k).map(h => this._withChunkId(h));

    const N = overFetch ?? defaultOverFetch(k);
    const fused = fuseRanks(dense, lex, N, alpha, rrfC);
    return fused.slice(0, k).map(h => this._withChunkId(h));
  }

  /**
   * Resolve the dense floor. Precedence, matching `read_v2._resolve_min_sim`:
   * explicit argument > manifest `retrieval.min_sim` > off.
   *
   * SPEC_v2 §retrieval.min_sim calls the manifest field "a hint, not a
   * decoding parameter … a caller-supplied floor MUST take precedence over the
   * manifest value" — hence the sentinel: `null`/`undefined` means "defer to
   * the manifest", and an explicit `'off'` beats a manifest that says
   * otherwise. It is advisory in the other direction too: a reader that
   * ignores the field entirely is still conforming, which is what this reader
   * did before.
   *
   * @param {number|string|null} minSim
   * @returns {number|null} the floor, or null for no floor
   */
  resolveMinSim(minSim = null) {
    if (minSim === null || minSim === undefined) {
      const r = this.manifest.retrieval;
      minSim = (r && r.min_sim !== undefined) ? r.min_sim : null;
    }
    if (minSim === null || minSim === undefined) return null;
    if (typeof minSim === "string") {
      const s = minSim.trim().toLowerCase();
      if (s === "off" || s === "none" || s === "") return null;
      if (s === "auto") return this.autoMinSim();
      throw new Error(
        `kb-reader: minSim must be a number, 'auto', or 'off'; got ` +
        JSON.stringify(minSim)
      );
    }
    return Number(minSim);
  }

  /**
   * A codec-aware noise floor for `dense_sim`, matching `_auto_min_sim`.
   *
   * A nonsense query embeds roughly orthogonally to every corpus vector, so
   * its similarities are noise; floor just above the expected *maximum* of N
   * such noise similarities — `E[max] ≈ std·sqrt(2 ln N)` — plus one sigma of
   * margin. For the Hamming codec `dense_sim` is the fraction of agreeing
   * bits, so random agreement is Binomial(total_bits, ½): mean ½, std
   * ½/√bits.
   *
   * (The Python reader has a second branch for remex, whose `dense_sim` is a
   * cosine: `z / sqrt(dim)`. It is deliberately absent here — this reader
   * refuses remex artifacts at open, so a remex branch would be unreachable
   * code that nothing could ever test.)
   */
  autoMinSim() {
    const n = Math.max(this.liveCount, 2);
    const z = Math.sqrt(2.0 * Math.log(n)) + 1.0;
    return 0.5 + z * 0.5 / Math.sqrt(this._totalBits);
  }

  _denseSearch(queryEmbedding) {
    const qCode = encodeQueryCode(
      queryEmbedding, this._mean, this._rotations, this._dim, this._k
    );
    const hits = [];
    for (let i = 0; i < this._totalRows; i++) {
      if (this._tomb[i]) continue;
      const d = hammingDistance(
        this._vectors.subarray(i * this._rowBytes, (i + 1) * this._rowBytes),
        qCode, this._rowBytes
      );
      hits.push({
        row: i,
        dense_dist: d,
        dense_sim: 1 - d / this._totalBits,
      });
    }
    hits.sort((a, b) => a.dense_dist - b.dense_dist);
    return hits;
  }

  _bm25Search(query) {
    const toks = tokenizeQuery(query);
    if (!toks.length) return [];
    const scores = bm25Scores(toks, this._bm25);
    const hits = [];
    for (let liveIdx = 0; liveIdx < scores.length; liveIdx++) {
      if (scores[liveIdx] <= 0) continue;
      hits.push({
        row: this._rowOfLive[liveIdx],
        bm25_score: scores[liveIdx],
      });
    }
    hits.sort((a, b) => b.bm25_score - a.bm25_score);
    return hits;
  }

  _withChunkId(hit) {
    const row = readChunkMapRow(this._chunkMapView, hit.row);
    return { ...hit, chunk_id: readChunkId(this._chunkIds, row.chunkIdOffset) };
  }

  // ───── Chunk fetch via HTTP Range ─────

  async fetchChunks(hits, fetchImpl = globalThis.fetch) {
    return await Promise.all(hits.map(async (hit) => {
      const row = readChunkMapRow(this._chunkMapView, hit.row);
      const url = this._chunksUri + `shard-${String(row.shardId).padStart(4, "0")}.bin`;
      const end = row.byteOffset + row.byteLength - 1;
      const resp = await fetchImpl(url, {
        headers: { range: `bytes=${row.byteOffset}-${end}` },
        cf: { cacheTtl: 3600, cacheEverything: true },
      });
      if (!resp.ok && resp.status !== 206) {
        throw new Error(`kb-reader: chunk fetch failed: ${resp.status}`);
      }
      const data = new Uint8Array(await resp.arrayBuffer());
      const nl = data.indexOf(0x0a);
      const headerJson = new TextDecoder().decode(data.subarray(0, nl));
      const text = new TextDecoder().decode(data.subarray(nl + 1));
      const header = JSON.parse(headerJson);
      const verified = (await sha256Hex(text)) === header.sha256;
      return {
        ...hit,
        text,
        meta: header.meta || {},
        sha256: header.sha256,
        verified,
      };
    }));
  }

  async searchAndFetch(query, queryEmbedding, opts = {}, fetchImpl) {
    const hits = this.search(query, queryEmbedding, opts);
    return await this.fetchChunks(hits, fetchImpl);
  }
}

async function sha256Hex(s) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─────────────────────────────────────────────────────────────────────────
// Fusion
// ─────────────────────────────────────────────────────────────────────────

/**
 * Default fusion pool depth per modality — `max(8k, 64)`, the same expression
 * `read_v2.KB.search` uses. Exported so a parity gate can compare the two
 * readers' defaults directly instead of restating either one.
 */
export function defaultOverFetch(k) {
  return Math.max(k * 8, 64);
}

export { RRF_C_DEFAULT };

export function fuseRanks(dense, lex, overFetch, alpha, rrfC = RRF_C_DEFAULT) {
  const denseN = dense.slice(0, overFetch);
  const lexN = lex.slice(0, overFetch);

  if (alpha == null) {
    // RRF. The constant was hardcoded at 60 here while Python exposed `rrf_c`,
    // so a caller who sharpened Python's fusion toward rank-1 could not do the
    // same in JS and the two readers silently ranked differently.
    const C = rrfC;
    const merged = new Map();
    denseN.forEach((h, idx) => {
      merged.set(h.row, { ...h, fused: 1 / (C + idx + 1) });
    });
    lexN.forEach((h, idx) => {
      const prev = merged.get(h.row);
      const add = 1 / (C + idx + 1);
      if (prev) {
        prev.bm25_score = h.bm25_score;
        prev.fused += add;
      } else {
        merged.set(h.row, { ...h, fused: add });
      }
    });
    return [...merged.values()].sort((a, b) => b.fused - a.fused);
  }

  // Weighted with min-max norm
  const dDists = denseN.map(h => h.dense_dist);
  const lScores = lexN.map(h => h.bm25_score);
  const dMin = Math.min(...dDists), dMax = Math.max(...dDists);
  const lMin = Math.min(...lScores), lMax = Math.max(...lScores);
  const nd = d => dMax === dMin ? 1 : (dMax - d) / (dMax - dMin);
  const nl = s => lMax === lMin ? 1 : (s - lMin) / (lMax - lMin);

  const merged = new Map();
  denseN.forEach(h => {
    merged.set(h.row, { ...h, fused: alpha * nd(h.dense_dist) });
  });
  lexN.forEach(h => {
    const add = (1 - alpha) * nl(h.bm25_score);
    const prev = merged.get(h.row);
    if (prev) {
      prev.bm25_score = h.bm25_score;
      prev.fused += add;
    } else {
      merged.set(h.row, { ...h, fused: add });
    }
  });
  return [...merged.values()].sort((a, b) => b.fused - a.fused);
}
