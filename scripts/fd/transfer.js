// scripts/fd/transfer.js
// FileDrop transfer protocol v2 — transport-agnostic core.
// Pure ES module. No DOM, no WebRTC, no filesystem APIs. Talks only to an
// injected ChannelAdapter + StorageSink (see scripts/fd/PROTOCOL.md) plus
// Web Crypto (`crypto.subtle`, present in Node via node:crypto webcrypto and
// in browsers on secure origins).
//
// This file is the contract implementation for scripts/fd/tests/transfer.test.mjs.
// See PROTOCOL.md for the full wire format, state machines, and rationale.

// ------------------------------------------------------------------ constants

const MIN_CHUNK = 64 * 1024;
const MAX_CHUNKS = 4096;
const BUF_HIGH = 4 * 1024 * 1024; // pause sending above this bufferedAmount
const BUF_LOW = 1 * 1024 * 1024; // resume sending below this

const FRAME_KIND_MANIFEST = 0;
const FRAME_KIND_CHUNK = 1;

// ------------------------------------------------------------------ hex helpers

function toHex(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0');
  return s;
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// ------------------------------------------------------------- sync SHA-256
//
// collectionId() is declared synchronous in PROTOCOL.md's public API (tests
// call it without `await`), but crypto.subtle.digest is Promise-based in both
// Node and browsers. There is no synchronous Web Crypto digest, so this is a
// small self-contained, dependency-free SHA-256 implementation used *only*
// for collectionId (a tiny input — at most 32 bytes per file — so the lack
// of native acceleration is irrelevant). Per-chunk / per-manifest hashing
// (the hot path, potentially gigabytes of data) always goes through
// crypto.subtle, as directed by PROTOCOL.md.

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

/** Synchronous SHA-256 over a Uint8Array; returns a 32-byte Uint8Array digest. */
function sha256Sync(bytes) {
  const l = bytes.length;
  const withOne = l + 1;
  const withPad = (((withOne + 8 + 63) >> 6) << 6);
  const msg = new Uint8Array(withPad);
  msg.set(bytes);
  msg[l] = 0x80;
  const bitLen = l * 8;
  const dv = new DataView(msg.buffer);
  const bitLenHigh = Math.floor(bitLen / 0x100000000);
  const bitLenLow = bitLen >>> 0;
  dv.setUint32(withPad - 8, bitLenHigh, false);
  dv.setUint32(withPad - 4, bitLenLow, false);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let chunkStart = 0; chunkStart < withPad; chunkStart += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(chunkStart + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const outDv = new DataView(out.buffer);
  outDv.setUint32(0, h0, false); outDv.setUint32(4, h1, false);
  outDv.setUint32(8, h2, false); outDv.setUint32(12, h3, false);
  outDv.setUint32(16, h4, false); outDv.setUint32(20, h5, false);
  outDv.setUint32(24, h6, false); outDv.setUint32(28, h7, false);
  return out;
}

// -------------------------------------------------------------- chunk sizing

export function chunkSizeFor(size) {
  const raw = Math.ceil(size / MAX_CHUNKS);
  const ceiled = Math.ceil(raw / 65536) * 65536;
  return Math.max(MIN_CHUNK, ceiled);
}

export function chunkCountFor(size) {
  if (size === 0) return 0;
  return Math.ceil(size / chunkSizeFor(size));
}

// ------------------------------------------------------------- manifest/root

/**
 * Streaming per-file manifest: slice -> digest, never loads the whole file
 * into memory. Returns { chunkSize, nchunks, manifestBytes, root }.
 */
export async function buildManifest(file) {
  const size = file.size;
  const chunkSize = chunkSizeFor(size);
  const nchunks = chunkCountFor(size);
  const manifestBytes = new Uint8Array(nchunks * 32);
  for (let i = 0; i < nchunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, size);
    const slice = file.slice(start, end);
    const buf = await slice.arrayBuffer();
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
    manifestBytes.set(digest, i * 32);
  }
  const rootBuf = new Uint8Array(await crypto.subtle.digest('SHA-256', manifestBytes));
  const root = toHex(rootBuf);
  return { chunkSize, nchunks, manifestBytes, root };
}

/**
 * Content-addressed collection id: hex SHA-256 over the concatenation of each
 * file's root (hex-decoded to raw bytes), in files[] order. Synchronous per
 * PROTOCOL.md's public API — uses the local sha256Sync (see above) rather
 * than crypto.subtle, since Web Crypto has no synchronous digest.
 */
export function collectionId(roots) {
  const total = new Uint8Array(roots.length * 32);
  for (let i = 0; i < roots.length; i++) total.set(fromHex(roots[i]), i * 32);
  return toHex(sha256Sync(total));
}

// ------------------------------------------------------------- binary framing

function frameHeader(kind, fid, index) {
  const frame = new Uint8Array(6);
  frame[0] = kind;
  frame[1] = fid;
  new DataView(frame.buffer).setUint32(2, index, true);
  return frame;
}

function frameManifest(fid, manifestBytes) {
  const header = frameHeader(FRAME_KIND_MANIFEST, fid, 0);
  const frame = new Uint8Array(6 + manifestBytes.byteLength);
  frame.set(header, 0);
  frame.set(manifestBytes, 6);
  return frame.buffer;
}

function frameChunk(fid, index, payload) {
  const u8payload = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
  const header = frameHeader(FRAME_KIND_CHUNK, fid, index);
  const frame = new Uint8Array(6 + u8payload.byteLength);
  frame.set(header, 0);
  frame.set(u8payload, 6);
  return frame.buffer;
}

function parseFrame(buf) {
  const u8 = new Uint8Array(buf);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  return {
    kind: u8[0],
    fid: u8[1],
    index: dv.getUint32(2, true),
    payload: u8.subarray(6),
  };
}

// ------------------------------------------------------------- input normalize

/** A file item may be a plain File/Blob-like, or { file, path }. */
function normalizeInput(item) {
  if (item && typeof item === 'object' && 'file' in item && item.file) {
    const name = item.path != null ? item.path : item.file.name;
    return { file: item.file, name };
  }
  return { file: item, name: item.name };
}

// -------------------------------------------------------------------- Sender

export class Sender {
  constructor(channel, opts = {}) {
    this._opts = opts;
    this._listeners = Object.create(null);
    this._records = null;
    this._id = null;
    this._totalBytes = 0;
    this._sentBytes = 0;
    this._closed = true;
    this._acceptResolve = null;
    this._okResolve = null;
    this._drainResolve = null;
    this._bindChannel(channel);
  }

  on(event, cb) {
    (this._listeners[event] || (this._listeners[event] = [])).push(cb);
  }

  _emit(event, payload) {
    const cbs = this._listeners[event];
    if (!cbs) return;
    for (const cb of cbs) cb(payload);
  }

  _bindChannel(channel) {
    this._channel = channel;
    this._closed = false;
    try { channel.bufferedAmountLowThreshold = BUF_LOW; } catch { /* read-only in some adapters */ }
    channel.onMessage((data) => this._handleMessage(data));
    channel.onClose(() => { this._closed = true; });
    channel.onBufferedAmountLow(() => {
      if (this._drainResolve) {
        const r = this._drainResolve;
        this._drainResolve = null;
        r();
      }
    });
  }

  /** Rebind to a fresh channel post-reconnect; await a new COLLECTION_ACCEPT. */
  resume(channel) {
    this._bindChannel(channel);
  }

  _send(data) {
    if (this._closed) return;
    try {
      this._channel.send(data);
    } catch {
      this._closed = true;
    }
  }

  _waitDrain() {
    return new Promise((resolve) => { this._drainResolve = resolve; });
  }

  _awaitAccept() {
    return new Promise((resolve) => { this._acceptResolve = resolve; });
  }

  _awaitCollectionOk() {
    return new Promise((resolve) => { this._okResolve = resolve; });
  }

  _handleMessage(data) {
    if (typeof data !== 'string') return; // sender expects only control strings back
    let msg;
    try { msg = JSON.parse(data); } catch { return; }
    switch (msg.type) {
      case 'COLLECTION_ACCEPT':
        if (this._acceptResolve) { const r = this._acceptResolve; this._acceptResolve = null; r(msg); }
        break;
      case 'COLLECTION_DECLINE':
        if (this._acceptResolve) { const r = this._acceptResolve; this._acceptResolve = null; r(null); }
        break;
      case 'CHUNK_NACK':
        this._handleNack(msg.fid, msg.index).catch((err) => this._emit('error', err));
        break;
      case 'COLLECTION_OK':
        if (this._okResolve) { const r = this._okResolve; this._okResolve = null; r(); }
        break;
      case 'FILE_OK':
        // Informational; no action required of the sender.
        break;
      default:
        break;
    }
  }

  async _readChunk(rec, index) {
    const start = index * rec.chunkSize;
    const end = Math.min(start + rec.chunkSize, rec.size);
    const slice = rec.file.slice(start, end);
    return slice.arrayBuffer();
  }

  async _handleNack(fid, index) {
    const rec = this._records && this._records[fid];
    if (!rec) return;
    const buf = await this._readChunk(rec, index);
    if (this._channel.bufferedAmount >= BUF_HIGH) await this._waitDrain();
    this._send(frameChunk(fid, index, buf));
  }

  async _buildRecords(files) {
    const records = [];
    for (let fid = 0; fid < files.length; fid++) {
      const { file, name } = normalizeInput(files[fid]);
      const { chunkSize, nchunks, manifestBytes, root } = await buildManifest(file);
      records.push({
        fid, file, name, size: file.size, mime: file.type || '',
        chunkSize, nchunks, manifestBytes, root,
      });
    }
    return records;
  }

  async _sendFileFrom(fid, from) {
    const rec = this._records[fid];
    if (this._closed) return false;
    this._send(JSON.stringify({ type: 'FILE_BEGIN', fid }));
    if (this._closed) return false;
    this._send(frameManifest(fid, rec.manifestBytes));

    for (let i = from; i < rec.nchunks; i++) {
      if (this._closed) return false;
      const buf = await this._readChunk(rec, i);
      if (this._closed) return false;
      if (this._channel.bufferedAmount >= BUF_HIGH) {
        await this._waitDrain();
      }
      if (this._closed) return false;
      this._send(frameChunk(fid, i, buf));
      this._sentBytes += (buf.byteLength !== undefined ? buf.byteLength : buf.length);
      this._emit('progress', {
        id: this._id, fid, index: i, nchunks: rec.nchunks,
        sentBytes: this._sentBytes, totalBytes: this._totalBytes,
      });
    }
    if (this._closed) return false;
    this._send(JSON.stringify({ type: 'FILE_END', fid }));
    return true;
  }

  /** Send all entries in `need`; returns true iff every entry finished (not interrupted). */
  async _runTransferRound(need) {
    for (const entry of need) {
      const finished = await this._sendFileFrom(entry.fid, entry.from);
      if (!finished) return false;
    }
    return true;
  }

  async send(files) {
    try {
      this._records = await this._buildRecords(files);
      this._id = collectionId(this._records.map((r) => r.root));
      this._totalBytes = this._records.reduce((a, r) => a + r.size, 0);

      const offer = {
        type: 'COLLECTION_OFFER', v: 2, id: this._id, totalSize: this._totalBytes,
        files: this._records.map((r) => ({
          fid: r.fid, name: r.name, size: r.size, mime: r.mime,
          chunkSize: r.chunkSize, nchunks: r.nchunks, root: r.root,
        })),
      };
      this._send(JSON.stringify(offer));

      for (;;) {
        const msg = await this._awaitAccept();
        if (!msg) {
          this._emit('declined', { id: this._id });
          return { id: this._id };
        }
        const completed = await this._runTransferRound(msg.need || []);
        if (completed) break;
        // interrupted mid-round (channel closed): loop back and await the
        // next COLLECTION_ACCEPT, which arrives once resume() rebinds and
        // the receiver re-sends its watermarks.
      }

      this._send(JSON.stringify({ type: 'COLLECTION_END', id: this._id }));
      await this._awaitCollectionOk();
      this._emit('done', { id: this._id });
      return { id: this._id };
    } catch (err) {
      this._emit('error', err);
      return { id: this._id, error: err };
    }
  }
}

// ------------------------------------------------------------------ Receiver

export class Receiver {
  constructor(channel, sink, opts = {}) {
    this._sink = sink;
    this._opts = opts;
    this._listeners = Object.create(null);
    this._offerCb = null;
    this._files = null; // Map<fid, rec> once accepted
    this._id = null;
    this._totalBytes = 0;
    this._finished = false;
    this._closed = true;
    this._chunkQueue = Promise.resolve(); // serializes binary-frame processing in arrival order
    this._bindChannel(channel);
  }

  on(event, cb) {
    (this._listeners[event] || (this._listeners[event] = [])).push(cb);
  }

  _emit(event, payload) {
    const cbs = this._listeners[event];
    if (!cbs) return;
    for (const cb of cbs) cb(payload);
  }

  onOffer(cb) {
    this._offerCb = cb;
  }

  _bindChannel(channel) {
    this._channel = channel;
    this._closed = false;
    channel.onMessage((data) => this._handleMessage(data));
    channel.onClose(() => { this._closed = true; });
    if (this._files) {
      // Reconnect after having already accepted: re-announce watermarks.
      this._sendAccept();
    }
  }

  /** Rebind to a fresh channel post-reconnect. */
  resume(channel) {
    this._bindChannel(channel);
  }

  _send(data) {
    if (this._closed) return;
    try {
      this._channel.send(data);
    } catch {
      this._closed = true;
    }
  }

  _computeNeed() {
    const need = [];
    for (const [fid, rec] of this._files) {
      if (!rec.closed) need.push({ fid, from: rec.contiguous });
    }
    return need;
  }

  _sendAccept() {
    this._send(JSON.stringify({ type: 'COLLECTION_ACCEPT', id: this._id, need: this._computeNeed() }));
  }

  _handleMessage(data) {
    if (typeof data === 'string') {
      let msg;
      try { msg = JSON.parse(data); } catch { return; }
      this._handleControl(msg);
    } else {
      this._handleBinary(data);
    }
  }

  _handleControl(msg) {
    switch (msg.type) {
      case 'COLLECTION_OFFER':
        this._handleOffer(msg);
        break;
      case 'FILE_BEGIN':
      case 'FILE_END':
      case 'COLLECTION_END':
        // Informational / completion is driven reactively off verified
        // chunks, not off these markers (see _checkCollectionDone).
        break;
      default:
        break;
    }
  }

  _handleOffer(offer) {
    const accept = async () => {
      try {
        this._id = offer.id;
        this._totalBytes = offer.totalSize;
        await this._sink.begin({ id: offer.id, totalSize: offer.totalSize, files: offer.files });
        this._files = new Map();
        for (const meta of offer.files) {
          const handle = await this._sink.openFile(meta);
          this._files.set(meta.fid, {
            meta, handle, chunkSize: meta.chunkSize, nchunks: meta.nchunks,
            manifestBytes: null, verified: null, contiguous: 0, closed: false,
          });
        }
        this._sendAccept();
      } catch (err) {
        this._emit('error', err);
      }
    };
    const decline = () => {
      this._send(JSON.stringify({ type: 'COLLECTION_DECLINE', id: offer.id }));
    };
    if (this._offerCb) this._offerCb(offer, accept, decline);
  }

  _handleBinary(buf) {
    const { kind, fid, index, payload } = parseFrame(buf);
    if (kind === FRAME_KIND_MANIFEST) {
      this._chunkQueue = this._chunkQueue
        .then(() => this._handleManifest(fid, payload))
        .catch((err) => this._emit('error', err));
    } else if (kind === FRAME_KIND_CHUNK) {
      this._chunkQueue = this._chunkQueue
        .then(() => this._handleChunk(fid, index, payload))
        .catch((err) => this._emit('error', err));
    }
  }

  async _handleManifest(fid, manifestBytes) {
    if (!this._files) return;
    const rec = this._files.get(fid);
    if (!rec) return;
    const rootBuf = new Uint8Array(await crypto.subtle.digest('SHA-256', manifestBytes));
    const rootHex = toHex(rootBuf);
    if (rootHex !== rec.meta.root) {
      this._emit('error', new Error(`manifest root mismatch for fid ${fid}`));
      return;
    }
    if (!rec.manifestBytes) {
      // First time we've seen the manifest for this file — initialize
      // verification state. A resend (post-resume) must NOT reset progress.
      rec.manifestBytes = manifestBytes;
      rec.verified = new Uint8Array(rec.nchunks);
      rec.contiguous = 0;
    }
    if (rec.nchunks === 0) {
      await this._closeFileIfDone(fid);
    }
  }

  async _handleChunk(fid, index, payload) {
    if (!this._files) return;
    const rec = this._files.get(fid);
    if (!rec || rec.closed || !rec.manifestBytes) return;

    const expected = rec.manifestBytes.subarray(index * 32, index * 32 + 32);
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', payload));
    if (!bytesEqual(digest, expected)) {
      this._send(JSON.stringify({ type: 'CHUNK_NACK', fid, index }));
      return;
    }
    if (rec.verified[index]) return; // duplicate delivery, already recorded

    rec.verified[index] = 1;
    await this._sink.write(rec.handle, index * rec.chunkSize, payload);

    let c = rec.contiguous;
    while (c < rec.nchunks && rec.verified[c]) c++;
    rec.contiguous = c;

    this._emit('progress', {
      id: this._id, fid, index, nchunks: rec.nchunks,
      receivedBytes: rec.contiguous * rec.chunkSize, totalBytes: this._totalBytes,
    });

    if (rec.contiguous >= rec.nchunks) {
      await this._closeFileIfDone(fid);
    }
  }

  async _closeFileIfDone(fid) {
    const rec = this._files.get(fid);
    if (!rec || rec.closed) return;
    rec.closed = true;
    const result = await this._sink.closeFile(rec.handle);
    this._emit('file', { fid, blob: result ? result.blob : null });
    this._send(JSON.stringify({ type: 'FILE_OK', fid }));
    this._checkCollectionDone();
  }

  _checkCollectionDone() {
    if (this._finished || !this._files) return;
    for (const rec of this._files.values()) if (!rec.closed) return;
    this._finished = true;
    this._finishCollection();
  }

  async _finishCollection() {
    const summary = await this._sink.finish();
    this._send(JSON.stringify({ type: 'COLLECTION_OK', id: this._id }));
    this._emit('done', { id: this._id, summary });
  }
}
