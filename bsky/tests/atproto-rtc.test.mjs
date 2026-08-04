// Contract tests for the poll-resilience layer of bsky/atproto-rtc.js.
// Covers the pure helpers plus _pollPeer's cursor discipline and _poll's
// backoff/classification, all against a stubbed fetch. WebRTC itself is not
// exercised here — it needs a real RTCPeerConnection and belongs in a browser
// smoke test.
// Run: node --test bsky/tests/atproto-rtc.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AtprotoRTC, PeerReadError, backoffMs, isRetryableReadError, isValidTid, peerReadParams
} from '../atproto-rtc.js';

const COLL = 'com.austegard.rtc.signal';
const ME = 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa';
const PEER = 'did:plc:zzzzzzzzzzzzzzzzzzzzzzzz';   // > ME, so we knock rather than offer

/* rkeys must be real TIDs: 13 chars of sortable base32, and the alphabet has
   no 0/1/8/9 — so build them from the alphabet itself rather than from digits,
   with tid(n) sorting ascending in n. */
const B32 = '234567abcdefghijklmnopqrstuvwxyz';
const tid = (n) => '3ms222222222' + B32[n];

function record(rkey, { to = ME, msgType = 'offer', ageS = 0, payload = 'sdp' } = {}) {
  return {
    uri: `at://${PEER}/${COLL}/${rkey}`,
    value: { $type: COLL, to, msgType, payload, createdAt: new Date(Date.now() - ageS * 1000).toISOString() }
  };
}

/** An AtprotoRTC wired to a fake PDS, with WebRTC and signal writes stubbed out. */
function harness({ pages = [], failWith = null } = {}) {
  const rtc = new AtprotoRTC({ collection: COLL, iceServers: [], persistSession: false });
  rtc.me = { did: ME, handle: 'me.test', pds: 'https://pds.test', accessJwt: 'x', password: null };
  const calls = [];
  rtc.handled = [];

  globalThis.fetch = async (url) => {
    const u = new URL(url);
    calls.push(Object.fromEntries(u.searchParams));
    if (failWith) return { ok: false, status: failWith, json: async () => ({}) };
    const page = pages.shift() || [];
    return { ok: true, status: 200, json: async () => ({ records: page }) };
  };

  rtc._handleOffer = async (did, sdp) => { rtc.handled.push(sdp); };
  rtc._handleAnswer = async (did, sdp) => { rtc.handled.push(sdp); };
  rtc._offerTo = async () => {};
  rtc._sendSignal = async () => ({ uri: `at://${ME}/${COLL}/${tid(999)}` });

  const peer = rtc._upsertPeer(PEER, 'peer.test', 'https://peer.test', true);
  return { rtc, peer, calls };
}

/* ---------- pure helpers ---------- */

test('isValidTid accepts real rkeys and rejects anything else', () => {
  assert.ok(isValidTid('3msawaukmak2y'));
  assert.ok(!isValidTid('zzzznotatid'));      // wrong length and alphabet
  assert.ok(!isValidTid('3msawaukmak2Y'));    // TIDs are lowercase
  assert.ok(!isValidTid('3msawaukmak21'));    // 0, 1, 8, 9 are not in the alphabet
  assert.ok(!isValidTid(null));
  assert.ok(!isValidTid(undefined));
});

test('peerReadParams only sends a cursor when it is a usable TID', () => {
  // A bad cursor reads 200-with-empty-page on a real PDS, which would strand
  // the peer silently, so it must never reach the wire.
  const cold = peerReadParams(COLL, PEER, null, 20);
  assert.equal(cold.cursor, undefined);
  assert.equal(cold.reverse, undefined);
  assert.equal(cold.limit, '20');

  assert.equal(peerReadParams(COLL, PEER, 'garbage', 50).cursor, undefined);

  const warm = peerReadParams(COLL, PEER, '3msawaukmak2y', 50);
  assert.equal(warm.cursor, '3msawaukmak2y');
  assert.equal(warm.reverse, 'true');
});

test('backoffMs grows exponentially, jitters, and honours the cap', () => {
  const at = (n) => Array.from({ length: 50 }, () => backoffMs(n, 2000, 60000));
  for (const ms of at(0)) assert.ok(ms >= 1500 && ms <= 2500, `attempt 0: ${ms}`);
  for (const ms of at(3)) assert.ok(ms >= 12000 && ms <= 20000, `attempt 3: ${ms}`);
  for (const ms of at(20)) assert.ok(ms <= 75000, `capped: ${ms}`);
  assert.ok(new Set(at(3)).size > 1, 'jitter produces distinct values');
});

test('isRetryableReadError treats 4xx as fatal, everything else as transient', () => {
  assert.ok(!isRetryableReadError(new PeerReadError('unknown repo', 400)));
  assert.ok(!isRetryableReadError(new PeerReadError('gone', 404)));
  assert.ok(isRetryableReadError(new PeerReadError('slow down', 429)));
  assert.ok(isRetryableReadError(new PeerReadError('bad gateway', 502)));
  assert.ok(isRetryableReadError(new PeerReadError('offline')));   // no status = network
});

/* ---------- cursor discipline ---------- */

test('cold start reads a descending page, then every later read is cursored', async () => {
  const { rtc, peer, calls } = harness({
    pages: [[record(tid(2)), record(tid(1))], []]   // PDS returns newest-first
  });

  await rtc._pollPeer(PEER);
  assert.equal(calls[0].cursor, undefined, 'first read has no cursor');
  assert.equal(calls[0].limit, '20');
  assert.deepEqual(rtc.handled, ['sdp', 'sdp']);
  assert.equal(peer.cursor, tid(2), 'cursor lands on the newest record, not the last returned');

  await rtc._pollPeer(PEER);
  assert.equal(calls[1].cursor, tid(2));
  assert.equal(calls[1].reverse, 'true');
});

test('a failed handler leaves the cursor behind the record so it is re-read', async () => {
  const { rtc, peer } = harness({ pages: [[record(tid(1)), record(tid(2))]] });
  peer.cursor = tid(0);
  rtc._handleOffer = async (did, sdp) => {
    rtc.handled.push(sdp);
    if (rtc.handled.length === 2) throw new Error('answer write failed');
  };

  await assert.rejects(() => rtc._pollPeer(PEER));
  assert.equal(peer.cursor, tid(1), 'advanced past the record that succeeded, not the one that did not');
  assert.ok(!rtc._seenUris.has(`at://${PEER}/${COLL}/${tid(2)}`), 'failed record is unmarked for retry');
});

test('records not addressed to us, and expired ones, still advance the cursor', async () => {
  const { rtc, peer } = harness({
    pages: [[record(tid(1), { to: 'did:plc:someone-else' }), record(tid(2), { ageS: 9999 })]]
  });
  peer.cursor = tid(0);

  await rtc._pollPeer(PEER);
  assert.deepEqual(rtc.handled, [], 'neither record is acted on');
  assert.equal(peer.cursor, tid(2), 'but both are consumed, so they are never re-read');
});

test('every resyncEvery-th poll drops the cursor to re-read from scratch', async () => {
  const { rtc, peer, calls } = harness({ pages: Array.from({ length: 6 }, () => []) });
  rtc.resyncEvery = 3;
  peer.cursor = tid(5);

  for (let i = 0; i < 6; i++) await rtc._pollPeer(PEER);
  const cursored = calls.map(c => c.cursor !== undefined);
  // polls 0,1,2 cursored; poll 3 (polls % 3 === 0) resyncs; 4,5 cursored again
  assert.deepEqual(cursored, [true, true, true, false, true, true]);
});

/* ---------- failure handling in the loop ---------- */

test('a transient failure backs the peer off instead of hammering', async () => {
  const { rtc, peer } = harness({ failWith: 503 });
  rtc._running = false;   // no rescheduling

  await rtc._poll();
  assert.equal(peer.unreadable, false);
  assert.equal(peer.failures, 1);
  assert.ok(peer.nextPollAt > Date.now(), 'peer is parked in backoff');

  const parkedAt = peer.nextPollAt;
  await rtc._poll();
  assert.equal(peer.failures, 1, 'skipped while backing off, so no second failure counted');
  assert.equal(peer.nextPollAt, parkedAt);
});

test('a 4xx marks the peer unreadable and stops polling it', async () => {
  const { rtc, peer } = harness({ failWith: 400 });
  rtc._running = false;
  const errors = [];
  rtc.on('peererror', (did, e) => errors.push(did));

  await rtc._poll();
  assert.equal(peer.unreadable, true);
  assert.equal(errors.length, 1);

  await rtc._poll();
  assert.equal(errors.length, 1, 'no further attempts, no repeat error');
});

test('_wake clears backoff so a foregrounded tab retries immediately', async () => {
  const { rtc, peer } = harness({ failWith: 503 });
  rtc._running = false;

  await rtc._poll();
  assert.ok(peer.nextPollAt > Date.now());

  rtc._wake();
  assert.equal(peer.nextPollAt, 0);
  assert.equal(peer.failures, 0);
});

test('accept() un-blacklists a peer that had read as unreadable', () => {
  const { rtc, peer } = harness();
  peer.unreadable = true;
  peer.trusted = false;
  rtc.accept(PEER);
  assert.equal(peer.trusted, true);
  assert.equal(peer.unreadable, false);
});
