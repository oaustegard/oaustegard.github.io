// Test harness for FileDrop transfer protocol v2.
// Provides an in-memory ChannelAdapter pair, a recording StorageSink, and
// File helpers, all matching scripts/fd/PROTOCOL.md exactly. No browser, no
// WebRTC. Used by transfer.test.mjs (and reusable by others).

import { webcrypto } from 'node:crypto';
import { File } from 'node:buffer';

// transfer.js references global `crypto` (works in browsers on secure origins).
// Node 20+ exposes it, but guarantee it for older runners.
if (!globalThis.crypto) globalThis.crypto = webcrypto;

export { File };

/**
 * A duplex message channel matching the ChannelAdapter interface. Pair two with
 * MockChannel.pair(). Frames are delivered asynchronously (microtask) so the
 * protocol's async flow is exercised realistically.
 *
 * Options:
 *   tap(frame, meta) -> frame | undefined | null   inspect/mutate/drop INbound
 *       frames (called on the receiving side). Return null to drop, a new frame
 *       to substitute, or undefined to pass through. Use to inject corruption.
 *   manualDrain: if true, bufferedAmount only decreases when drain() is called,
 *       so backpressure can be asserted deterministically.
 */
export class MockChannel {
  constructor(name) {
    this.name = name;
    this._peer = null;
    this._msgCb = null;
    this._closeCb = null;
    this._lowCb = null;
    this.bufferedAmount = 0;
    this.bufferedAmountLowThreshold = 0;
    this.maxMessageSize = Infinity;
    this.closed = false;
    this.sent = [];            // every frame this side sent (raw, pre-normalize)
    this.tap = null;
    this.manualDrain = false;
    this._pending = [];        // [{size}] awaiting manual drain
  }

  static pair() {
    const a = new MockChannel('A');
    const b = new MockChannel('B');
    a._peer = b;
    b._peer = a;
    return [a, b];
  }

  static sizeOf(data) {
    if (typeof data === 'string') return data.length;
    if (data instanceof ArrayBuffer) return data.byteLength;
    if (ArrayBuffer.isView(data)) return data.byteLength;
    return 0;
  }

  send(data) {
    if (this.closed) throw new Error(`send on closed channel ${this.name}`);
    this.sent.push(data);
    const size = MockChannel.sizeOf(data);
    this.bufferedAmount += size;
    if (this.manualDrain) this._pending.push(size);

    queueMicrotask(() => {
      if (!this.manualDrain) this._drainOne(size);
      const peer = this._peer;
      if (!peer || peer.closed) return;

      let deliver;
      if (typeof data === 'string') {
        deliver = data;
      } else {
        // Normalize any binary to a standalone ArrayBuffer, per PROTOCOL.md.
        const u8 = ArrayBuffer.isView(data)
          ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
          : new Uint8Array(data);
        deliver = u8.slice().buffer;
      }

      if (peer.tap) {
        const r = peer.tap(deliver, { from: this.name });
        if (r === null) return;         // drop
        if (r !== undefined) deliver = r;
      }
      if (peer._msgCb) peer._msgCb(deliver);
    });
  }

  _drainOne(size) {
    const prevAbove = this.bufferedAmount > this.bufferedAmountLowThreshold;
    this.bufferedAmount = Math.max(0, this.bufferedAmount - size);
    const nowLow = this.bufferedAmount <= this.bufferedAmountLowThreshold;
    if (prevAbove && nowLow && this._lowCb) this._lowCb();
  }

  /** Manual backpressure relief: drain all pending queued bytes. */
  drain() {
    const pend = this._pending;
    this._pending = [];
    for (const size of pend) this._drainOne(size);
  }

  onMessage(cb) { this._msgCb = cb; }
  onClose(cb) { this._closeCb = cb; }
  onBufferedAmountLow(cb) { this._lowCb = cb; }

  /** Kill this channel and its peer (simulates a dropped WebRTC connection). */
  close() {
    if (this.closed) return;
    this.closed = true;
    if (this._closeCb) this._closeCb();
    const p = this._peer;
    if (p && !p.closed) {
      p.closed = true;
      if (p._closeCb) p._closeCb();
    }
  }

  /** Count binary CHUNK frames (kind===1) this side sent, optionally filtered. */
  chunkFramesSent(pred) {
    const out = [];
    for (const f of this.sent) {
      if (typeof f === 'string') continue;
      const u8 = ArrayBuffer.isView(f) ? new Uint8Array(f.buffer, f.byteOffset, f.byteLength) : new Uint8Array(f);
      if (u8.length < 6 || u8[0] !== 1) continue;
      const fid = u8[1];
      const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
      const index = dv.getUint32(2, true);
      const rec = { fid, index };
      if (!pred || pred(rec)) out.push(rec);
    }
    return out;
  }

  controlSent() {
    return this.sent
      .filter((f) => typeof f === 'string')
      .map((s) => { try { return JSON.parse(s); } catch { return { raw: s }; } });
  }
}

/**
 * A StorageSink that records everything into memory buffers, per the
 * StorageSink interface. Doubles as the reference MemorySink behavior for
 * cross-checking, and lets tests read back reconstructed bytes.
 */
export class RecordingSink {
  constructor() {
    this.began = null;
    this.files = new Map();   // fid -> { meta, buf: Uint8Array, writes: [[offset,len]], closed, blob }
    this.finished = false;
    this.aborted = false;
  }
  async begin(collectionMeta) { this.began = collectionMeta; }
  async openFile(fileMeta) {
    const buf = new Uint8Array(fileMeta.size);
    const rec = { meta: fileMeta, buf, writes: [], closed: false, blob: null };
    this.files.set(fileMeta.fid, rec);
    return rec;
  }
  async write(handle, offset, bytes) {
    const u8 = ArrayBuffer.isView(bytes) ? new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength) : new Uint8Array(bytes);
    handle.buf.set(u8, offset);
    handle.writes.push([offset, u8.length]);
  }
  async closeFile(handle) {
    handle.closed = true;
    handle.blob = new Blob([handle.buf], { type: handle.meta.mime || 'application/octet-stream' });
    return { blob: handle.blob };
  }
  async finish() { this.finished = true; return { files: this.files.size }; }
  async abort() { this.aborted = true; }

  bytesFor(fid) { return this.files.get(fid).buf; }
}

/** Build a File from a Uint8Array/string. */
export function makeFile(data, name = 'f.bin', mime = 'application/octet-stream') {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  return new File([bytes], name, { type: mime });
}

/** Deterministic pseudo-random bytes (no Math.random — reproducible vectors). */
export function pseudoBytes(n, seed = 1) {
  const out = new Uint8Array(n);
  let x = (seed >>> 0) || 1;
  for (let i = 0; i < n; i++) {
    // xorshift32
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17;
    x ^= x << 5; x >>>= 0;
    out[i] = x & 0xff;
  }
  return out;
}

/** SHA-256 hex of bytes, for test-side assertions independent of transfer.js. */
export async function sha256hex(bytes) {
  const d = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Await until predicate() is true or timeout. Drives the microtask queue. */
export async function until(predicate, { timeout = 2000, label = 'condition' } = {}) {
  const start = Date.now();
  while (!predicate()) {
    await new Promise((r) => setTimeout(r, 0));
    if (Date.now() - start > timeout) throw new Error(`timeout waiting for ${label}`);
  }
}

/**
 * Wire a Sender and Receiver over a fresh pair, auto-accepting the offer.
 * Returns { sender, receiver, sink, chanS, chanR, done } where done resolves
 * when the receiver emits 'done'. Import the classes lazily so the harness
 * loads even before transfer.js exists (tests import it themselves).
 */
export async function runTransfer(files, { Sender, Receiver, sink, tapR, tapS, autoAccept = true } = {}) {
  const [chanS, chanR] = MockChannel.pair();
  if (tapR) chanR.tap = tapR;
  if (tapS) chanS.tap = tapS;
  const theSink = sink || new RecordingSink();
  const receiver = new Receiver(chanR, theSink);
  let doneResolve; const done = new Promise((r) => { doneResolve = r; });
  receiver.on('done', (info) => doneResolve(info));
  if (autoAccept) receiver.onOffer((offer, accept) => accept());
  const sender = new Sender(chanS);
  const sendP = sender.send(files);
  return { sender, receiver, sink: theSink, chanS, chanR, done, sendP };
}
