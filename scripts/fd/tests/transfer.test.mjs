// Contract tests for scripts/fd/transfer.js (protocol v2).
// Run: node --test scripts/fd/tests/transfer.test.mjs
// These pin PROTOCOL.md. transfer.js must pass them unmodified.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MockChannel, RecordingSink, makeFile, pseudoBytes, sha256hex, until, runTransfer,
} from './harness.mjs';

import {
  chunkSizeFor, chunkCountFor, buildManifest, collectionId, Sender, Receiver,
} from '../transfer.js';

const MIN_CHUNK = 64 * 1024;
const MAX_CHUNKS = 4096;

// ---------------------------------------------------------------- chunk sizing
test('chunkSizeFor: small files use the 64KiB floor', () => {
  assert.equal(chunkSizeFor(0), MIN_CHUNK);
  assert.equal(chunkSizeFor(1), MIN_CHUNK);
  assert.equal(chunkSizeFor(MIN_CHUNK), MIN_CHUNK);
  assert.equal(chunkSizeFor(MIN_CHUNK * MAX_CHUNKS), MIN_CHUNK); // exactly at cap
});

test('chunkSizeFor: large files grow chunk size to keep <= MAX_CHUNKS chunks', () => {
  const big = MIN_CHUNK * MAX_CHUNKS * 4 + 12345; // needs bigger chunks
  const cs = chunkSizeFor(big);
  assert.ok(cs > MIN_CHUNK, 'chunk grew');
  assert.equal(cs % 65536, 0, 'chunk size is a multiple of 64KiB');
  assert.ok(chunkCountFor(big) <= MAX_CHUNKS, `<= ${MAX_CHUNKS} chunks, got ${chunkCountFor(big)}`);
});

test('chunkCountFor: matches ceil(size/chunkSize), 0 for empty', () => {
  assert.equal(chunkCountFor(0), 0);
  assert.equal(chunkCountFor(1), 1);
  assert.equal(chunkCountFor(MIN_CHUNK + 1), 2);
});

// ------------------------------------------------------------- manifest & root
test('buildManifest: root = SHA-256(manifestBytes), manifest = per-chunk SHA-256', async () => {
  const bytes = pseudoBytes(MIN_CHUNK + 100, 7); // 2 chunks
  const file = makeFile(bytes, 'a.bin');
  const { chunkSize, nchunks, manifestBytes, root } = await buildManifest(file);
  assert.equal(chunkSize, MIN_CHUNK);
  assert.equal(nchunks, 2);
  assert.equal(manifestBytes.length, nchunks * 32);

  // Independently recompute each chunk hash.
  for (let i = 0; i < nchunks; i++) {
    const slice = bytes.subarray(i * chunkSize, Math.min((i + 1) * chunkSize, bytes.length));
    const want = await sha256hex(slice);
    const got = [...manifestBytes.subarray(i * 32, i * 32 + 32)].map((b) => b.toString(16).padStart(2, '0')).join('');
    assert.equal(got, want, `chunk ${i} hash`);
  }
  assert.equal(root, await sha256hex(manifestBytes), 'root is hash of manifest');
});

test('buildManifest: empty file has 0 chunks and root = SHA-256("")', async () => {
  const { nchunks, manifestBytes, root } = await buildManifest(makeFile(new Uint8Array(0), 'e.bin'));
  assert.equal(nchunks, 0);
  assert.equal(manifestBytes.length, 0);
  assert.equal(root, await sha256hex(new Uint8Array(0)));
});

// -------------------------------------------------------- content addressing
test('collectionId: stable for same content, changes when content changes', async () => {
  const m1 = await buildManifest(makeFile(pseudoBytes(1000, 1), 'x'));
  const m2 = await buildManifest(makeFile(pseudoBytes(2000, 2), 'y'));
  const id = collectionId([m1.root, m2.root]);
  assert.match(id, /^[0-9a-f]{64}$/);
  assert.equal(id, collectionId([m1.root, m2.root]), 'deterministic');

  const m2b = await buildManifest(makeFile(pseudoBytes(2000, 99), 'y')); // different content
  assert.notEqual(collectionId([m1.root, m2.root]), collectionId([m1.root, m2b.root]));
});

// ------------------------------------------------------------- happy path
test('happy path: multi-chunk file reconstructs byte-identical, all chunks verified', async () => {
  const bytes = pseudoBytes(MIN_CHUNK * 3 + 777, 42);
  const file = makeFile(bytes, 'movie.bin', 'application/octet-stream');
  const { done, sink } = await runTransfer([file], { Sender, Receiver });
  await done;

  const out = sink.bytesFor(0);
  assert.equal(out.length, bytes.length);
  assert.deepEqual(out, bytes, 'reconstructed bytes match');
  assert.ok(sink.finished, 'sink.finish called');
  const r = sink.files.get(0);
  assert.ok(r.closed, 'file closed');
});

test('happy path emits COLLECTION_OK and progress with monotonic index', async () => {
  const bytes = pseudoBytes(MIN_CHUNK * 2 + 5, 3);
  const { done, chanR, receiver } = await runTransfer([makeFile(bytes)], { Sender, Receiver });
  const idxs = [];
  receiver.on('progress', (p) => { if (p.fid === 0) idxs.push(p.index); });
  await done;
  const ctrl = chanR.controlSent().map((m) => m.type);
  assert.ok(ctrl.includes('COLLECTION_ACCEPT'));
  assert.ok(ctrl.includes('COLLECTION_OK'));
  for (let i = 1; i < idxs.length; i++) assert.ok(idxs[i] >= idxs[i - 1], 'index monotonic');
});

// ------------------------------------------------------------- corruption
test('corruption: a flipped chunk is detected, NACKed, and recovered', async () => {
  const bytes = pseudoBytes(MIN_CHUNK * 2 + 10, 8); // 3 chunks
  let corrupted = false;
  // Flip a byte in the first CHUNK frame the receiver sees (kind===1, index 0).
  const tapR = (frame) => {
    if (corrupted || typeof frame === 'string') return;
    const u8 = new Uint8Array(frame);
    if (u8.length >= 7 && u8[0] === 1 && u8[1] === 0) {
      const dv = new DataView(u8.buffer);
      if (dv.getUint32(2, true) === 0) {
        u8[6] ^= 0xff;         // corrupt payload
        corrupted = true;
        return u8.buffer;
      }
    }
    return undefined;
  };
  const { done, sink, chanR } = await runTransfer([makeFile(bytes)], { Sender, Receiver, tapR });
  await done;
  assert.deepEqual(sink.bytesFor(0), bytes, 'recovered to correct bytes');
  const nacks = chanR.controlSent().filter((m) => m.type === 'CHUNK_NACK');
  assert.ok(nacks.length >= 1, 'at least one CHUNK_NACK sent');
  assert.equal(nacks[0].index, 0);
});

// ------------------------------------------------------------- resume
test('resume: reconnect resends only the gap, never re-sends verified chunks', async () => {
  const bytes = pseudoBytes(MIN_CHUNK * 5 + 3, 11); // 6 chunks
  const file = makeFile(bytes, 'big.bin');
  const sink = new RecordingSink();

  const [chanS, chanR] = MockChannel.pair();
  const receiver = new Receiver(chanR, sink);
  receiver.onOffer((offer, accept) => accept());
  const sender = new Sender(chanS);

  // Cut the channel after the receiver has verified at least 2 chunks.
  await new Promise((resolve) => {
    let cut = false;
    receiver.on('progress', (p) => {
      if (!cut && p.fid === 0 && p.index >= 1) {   // >=2 chunks verified (0 and 1)
        cut = true;
        queueMicrotask(() => { chanS.close(); resolve(); });
      }
    });
    sender.send([file]);
  });

  const verifiedBefore = sink.files.get(0)?.writes.length ?? 0;
  assert.ok(verifiedBefore >= 2, `>=2 chunks landed before cut, got ${verifiedBefore}`);

  // Reconnect on a fresh pair.
  const [chanS2, chanR2] = MockChannel.pair();
  let doneResolve; const done = new Promise((r) => { doneResolve = r; });
  receiver.on('done', () => doneResolve());
  receiver.resume(chanR2);
  sender.resume(chanS2);
  await done;

  assert.deepEqual(sink.bytesFor(0), bytes, 'full file correct after resume');
  // The resumed sender must not re-send chunks below the receiver watermark.
  const resent = chanS2.chunkFramesSent((c) => c.fid === 0);
  const minResent = Math.min(...resent.map((c) => c.index));
  assert.ok(resent.length > 0, 'some chunks resent');
  assert.ok(minResent >= verifiedBefore, `resume started at >= ${verifiedBefore}, got ${minResent}`);
});

// ------------------------------------------------------------- collections
test('collection: three files sent as one transfer, one id, all reconstruct', async () => {
  const files = [
    makeFile(pseudoBytes(100, 1), 'a.txt', 'text/plain'),
    makeFile(pseudoBytes(MIN_CHUNK + 50, 2), 'b.bin'),
    makeFile(new Uint8Array(0), 'empty.dat'),
  ];
  const { done, sink, sendP } = await runTransfer(files, { Sender, Receiver });
  const { id } = await sendP;
  await done;

  assert.match(id, /^[0-9a-f]{64}$/);
  assert.equal(sink.began.id, id, 'receiver saw same collection id');
  assert.equal(sink.began.files.length, 3);
  assert.deepEqual(sink.bytesFor(0), pseudoBytes(100, 1));
  assert.deepEqual(sink.bytesFor(1), pseudoBytes(MIN_CHUNK + 50, 2));
  assert.equal(sink.bytesFor(2).length, 0);
});

test('collection: files carry a path for directory sends', async () => {
  const files = [
    { file: makeFile(pseudoBytes(200, 5), 'x'), path: 'dir/sub/x.bin' },
  ];
  const { done, sink } = await runTransfer(files, { Sender, Receiver });
  await done;
  assert.equal(sink.began.files[0].name, 'dir/sub/x.bin');
});

// ------------------------------------------------------------- decline
test('decline: receiver can reject an offer; sender reports declined', async () => {
  const [chanS, chanR] = MockChannel.pair();
  const receiver = new Receiver(chanR, new RecordingSink());
  receiver.onOffer((offer, accept, decline) => decline());
  const sender = new Sender(chanS);
  let declined = false;
  sender.on('declined', () => { declined = true; });
  sender.send([makeFile(pseudoBytes(50, 1))]);
  await until(() => declined, { label: 'declined event' });
  assert.ok(declined);
});

// ------------------------------------------------------------- backpressure
test('backpressure: sender pauses when bufferedAmount exceeds BUF_HIGH', async () => {
  const bytes = pseudoBytes(MIN_CHUNK * 40, 6); // 40 chunks, plenty to overflow
  const [chanS, chanR] = MockChannel.pair();
  chanS.manualDrain = true;                     // hold bytes in the buffer
  const sink = new RecordingSink();
  const receiver = new Receiver(chanR, sink);
  receiver.onOffer((offer, accept) => accept());
  const sender = new Sender(chanS);
  sender.send([makeFile(bytes)]);

  // Let the sender push until it should pause on backpressure.
  await new Promise((r) => setTimeout(r, 50));
  const BUF_HIGH = 4 * 1024 * 1024;
  assert.ok(chanS.bufferedAmount <= BUF_HIGH + MIN_CHUNK * 2,
    `paused near BUF_HIGH, bufferedAmount=${chanS.bufferedAmount}`);

  // Drain repeatedly to completion.
  let doneResolve; const done = new Promise((r) => { doneResolve = r; });
  receiver.on('done', () => doneResolve());
  const pump = setInterval(() => chanS.drain(), 5);
  await done;
  clearInterval(pump);
  assert.deepEqual(sink.bytesFor(0), bytes);
});
