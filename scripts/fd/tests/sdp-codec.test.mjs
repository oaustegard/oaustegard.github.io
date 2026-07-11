// Contract tests for scripts/fd/sdp-codec.js.
// Guards the reversible outer codec (JSON -> deflate-raw -> base64url) and the
// base64url byte helpers during the verbatim extraction from fd.html. packSdp/
// unpackSdp are extracted byte-for-byte and covered by the browser smoke test,
// not here (they need real RTCPeerConnection SDP to exercise meaningfully).
// Run: node --test scripts/fd/tests/sdp-codec.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bytesToB64url, b64urlToBytes, encodeBlob, decodeBlob } from '../sdp-codec.js';

test('base64url byte helpers round-trip arbitrary bytes', () => {
  for (const n of [0, 1, 2, 3, 17, 255, 1000]) {
    const bytes = new Uint8Array(n);
    for (let i = 0; i < n; i++) bytes[i] = (i * 37 + 11) & 0xff;
    const s = bytesToB64url(bytes);
    assert.ok(!/[+/=]/.test(s), 'base64url has no +, /, or = padding');
    assert.deepEqual(b64urlToBytes(s), bytes, `round-trip ${n} bytes`);
  }
});

test('encodeBlob/decodeBlob round-trips a JSON object through deflate+base64url', async () => {
  const obj = { t: 'O', sdp: 'v=0\r\no=- 42 2 IN IP4 0.0.0.0\r\n', cands: [1, 2, 3], nested: { a: true, b: null } };
  const code = await encodeBlob(obj);
  assert.equal(typeof code, 'string');
  assert.ok(!/[+/=]/.test(code), 'code is base64url');
  const back = await decodeBlob(code);
  assert.deepEqual(back, obj);
});

test('encodeBlob compresses repetitive payloads below their raw size', async () => {
  const obj = { blob: 'A'.repeat(5000) };
  const code = await encodeBlob(obj);
  assert.ok(code.length < 5000, `compressed (${code.length}) smaller than raw`);
});
