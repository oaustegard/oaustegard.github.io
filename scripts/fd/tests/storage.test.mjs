// Contract tests for scripts/fd/storage.js (StorageSink implementations).
// Run: node --test scripts/fd/tests/storage.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Blob } from 'node:buffer';
import { MemorySink, FsaSink, storageAvailable } from '../storage.js';

const collMeta = (files) => ({ id: 'abc', totalSize: files.reduce((s, f) => s + f.size, 0), files });
const fileMeta = (fid, name, size, mime = 'application/octet-stream') => ({ fid, name, size, mime, chunkSize: 65536, nchunks: Math.ceil(size / 65536), root: '00' });

// Drive a sink through a two-file collection with positioned writes (some out of
// order) and assert the reconstructed bytes.
async function driveSink(sink, readBack) {
  const f0 = new Uint8Array([1, 2, 3, 4, 5]);
  const f1 = new Uint8Array([9, 8, 7]);
  const meta = collMeta([fileMeta(0, 'a.bin', f0.length), fileMeta(1, 'b.bin', f1.length)]);
  await sink.begin(meta);

  const h0 = await sink.openFile(meta.files[0]);
  // write out of order: bytes [2..5) first, then [0..2)
  await sink.write(h0, 2, f0.subarray(2, 5));
  await sink.write(h0, 0, f0.subarray(0, 2));
  const r0 = await sink.closeFile(h0);

  const h1 = await sink.openFile(meta.files[1]);
  await sink.write(h1, 0, f1);
  const r1 = await sink.closeFile(h1);

  const summary = await sink.finish();
  return { f0, f1, r0, r1, summary, back0: await readBack(0, r0), back1: await readBack(1, r1) };
}

test('MemorySink: reconstructs bytes and returns a Blob per file', async () => {
  const sink = new MemorySink();
  const { f0, f1, r0, r1, back0, back1 } = await driveSink(sink, async (_fid, r) => new Uint8Array(await r.blob.arrayBuffer()));
  assert.ok(r0.blob instanceof Blob, 'closeFile returns a Blob');
  assert.deepEqual(back0, f0);
  assert.deepEqual(back1, f1);
  assert.equal(r0.blob.size, f0.length);
  assert.equal(r1.blob.size, f1.length);
});

// --- Mock File System Access API objects ---
class MockWritable {
  constructor(store) { this.store = store; this.pos = 0; this.closed = false; this.ops = []; }
  async write(chunk) {
    if (chunk && typeof chunk === 'object' && chunk.type === 'write') {
      this._put(chunk.position ?? this.pos, chunk.data);
      if (chunk.position != null) this.pos = chunk.position;
      this.pos += chunk.data.byteLength ?? chunk.data.length;
      this.ops.push(['write@', chunk.position]);
    } else {
      this._put(this.pos, chunk);
      this.pos += chunk.byteLength ?? chunk.length;
      this.ops.push(['write', this.pos]);
    }
  }
  async seek(p) { this.pos = p; this.ops.push(['seek', p]); }
  async truncate(n) { this.store.length = n; }
  async close() { this.closed = true; }
  _put(pos, data) {
    const u8 = ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
    for (let i = 0; i < u8.length; i++) this.store[pos + i] = u8[i];
  }
}
class MockFileHandle {
  constructor() { this.store = []; this.writable = null; }
  async createWritable() { this.writable = new MockWritable(this.store); return this.writable; }
}
class MockDirHandle {
  constructor() { this.handles = new Map(); }
  async getFileHandle(name, opts) {
    if (!this.handles.has(name)) this.handles.set(name, new MockFileHandle());
    return this.handles.get(name);
  }
  async getDirectoryHandle(name, opts) {
    const key = 'dir:' + name;
    if (!this.handles.has(key)) this.handles.set(key, new MockDirHandle());
    return this.handles.get(key);
  }
}

test('FsaSink: single-file mode writes positioned bytes to disk and closes', async () => {
  const handles = [];
  const sink = new FsaSink({
    pickSaveFile: async (name) => { const h = new MockFileHandle(); handles.push(h); return h; },
  });
  const { f0, r0 } = await driveSink(sink, async (fid) => Uint8Array.from(handles[fid].store));
  assert.equal(r0.blob, null, 'FSA closeFile does not buffer a Blob');
  assert.deepEqual(Uint8Array.from(handles[0].store), f0);
  assert.ok(handles[0].writable.closed, 'writable closed');
});

test('FsaSink: directory mode routes files into the picked directory', async () => {
  const dir = new MockDirHandle();
  const sink = new FsaSink({ pickDirectory: async () => dir, preferDirectory: true });
  const meta = collMeta([fileMeta(0, 'a.bin', 3), fileMeta(1, 'nested/b.bin', 2)]);
  await sink.begin(meta);
  const h0 = await sink.openFile(meta.files[0]);
  await sink.write(h0, 0, new Uint8Array([1, 2, 3]));
  await sink.closeFile(h0);
  const h1 = await sink.openFile(meta.files[1]);
  await sink.write(h1, 0, new Uint8Array([4, 5]));
  await sink.closeFile(h1);
  await sink.finish();

  assert.ok(dir.handles.has('a.bin'), 'flat file created');
  // nested path creates subdirectory
  assert.ok(dir.handles.has('dir:nested'), 'subdirectory created for nested path');
});

test('storageAvailable reflects presence of the File System Access API', () => {
  assert.equal(typeof storageAvailable, 'function');
  const saved = globalThis.showSaveFilePicker;
  delete globalThis.showSaveFilePicker;
  assert.equal(storageAvailable(), false);
  globalThis.showSaveFilePicker = () => {};
  assert.equal(storageAvailable(), true);
  if (saved) globalThis.showSaveFilePicker = saved; else delete globalThis.showSaveFilePicker;
});
