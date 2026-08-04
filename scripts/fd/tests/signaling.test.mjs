// Contract tests for scripts/fd/signaling.js — the ICE-gathering outcome
// signal and the restart-vs-reset race. No real RTCPeerConnection: these
// cover the module's own bookkeeping around the browser API, not WebRTC
// itself, which still needs the two-browser smoke test.
// Run: node --test scripts/fd/tests/signaling.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Signaling, gatherComplete, countCandidates } from '../signaling.js';

const SDP_2 = 'v=0\r\na=candidate:1 1 udp 2 10.0.0.1 1 typ host\r\na=candidate:2 1 udp 1 1.2.3.4 2 typ srflx\r\n';

/** Minimal RTCPeerConnection stand-in. `gather` controls how ICE resolves. */
function fakePC({ gather = 'complete', sdp = SDP_2 } = {}) {
  const listeners = {};
  const pc = {
    iceGatheringState: gather === 'immediate' ? 'complete' : 'gathering',
    localDescription: { sdp },
    closed: false,
    addEventListener: (e, cb) => { (listeners[e] || (listeners[e] = [])).push(cb); },
    removeEventListener: (e, cb) => {
      if (listeners[e]) listeners[e] = listeners[e].filter(x => x !== cb);
    },
    restartIce: () => {},
    createOffer: async () => ({ type: 'offer', sdp }),
    createAnswer: async () => ({ type: 'answer', sdp }),
    setLocalDescription: async () => {},
    setRemoteDescription: async () => {},
    close: () => { pc.closed = true; }
  };
  /** Drive gathering to completion, as the browser would. */
  pc.finishGathering = () => {
    pc.iceGatheringState = 'complete';
    for (const cb of (listeners.icegatheringstatechange || [])) cb();
  };
  return pc;
}

function fakeDC() {
  const dc = { readyState: 'open', sent: [], send: (m) => dc.sent.push(m), close: () => {} };
  return dc;
}

/** A Signaling wired to fakes, with the gather timeout short enough to await. */
function harness({ isInviter = true, gather = 'complete' } = {}) {
  const s = new Signaling({ iceServers: [], gatherTimeout: 20, pageUrl: () => 'https://x/fd' });
  const pc = fakePC({ gather });
  s.pc = pc;
  s.dc = fakeDC();
  s.isInviter = isInviter;
  s.wasConnected = true;
  const events = [];
  s.on('statechange', (d) => events.push(d.kind));
  return { s, pc, events };
}

const tick = () => new Promise(r => setTimeout(r, 0));

/* ---------- gathering outcome ---------- */

test('countCandidates counts candidate lines and tolerates junk', () => {
  assert.equal(countCandidates(SDP_2), 2);
  assert.equal(countCandidates('v=0\r\n'), 0);
  assert.equal(countCandidates(null), 0);
  assert.equal(countCandidates(undefined), 0);
});

test('gatherComplete reports true only when gathering actually completed', async () => {
  // Already complete before we ask.
  assert.equal(await gatherComplete(fakePC({ gather: 'immediate' }), 50), true);

  // Completes while we wait.
  const pc = fakePC();
  const p = gatherComplete(pc, 500);
  pc.finishGathering();
  assert.equal(await p, true);

  // Never completes: the timeout wins, and that is now distinguishable.
  assert.equal(await gatherComplete(fakePC(), 20), false);
});

/* ---------- restart happy path ---------- */

test('inviter restart ships an ICE_RESTART_OFFER over the channel', async () => {
  const { s, events } = harness();
  await s.tryIceRestart();
  const sent = s.dc.sent.map(JSON.parse);
  assert.deepEqual(sent.map(m => m.type), ['ICE_RESTART_OFFER']);
  assert.ok(events.includes('reconnecting'));
  s._cancelDeadTimer();
});

test('answerer nudges rather than offering, avoiding glare', async () => {
  const { s } = harness({ isInviter: false });
  await s.tryIceRestart();
  assert.deepEqual(s.dc.sent.map(m => JSON.parse(m).type), ['ICE_NUDGE']);
  s._cancelDeadTimer();
});

/* ---------- the race ----------
   resetPeer() alone is nearly harmless: the post-await send throws on a null
   channel and _connectionDead() early-returns because wasConnected is false.
   The case that bites is a re-pair — resetPeer() followed by a NEW connection,
   which is exactly what reconnectAsInviter() does. Code reading `this.pc`
   after the await then picks up the FRESH pairing and posts its SDP onto the
   fresh channel as a restart offer. */

/** Simulate the app taking the re-pair path: reset, then a new pc + open dc. */
function repair(s) {
  s.resetPeer();
  s.pc = fakePC({ sdp: 'v=0\r\na=candidate:99 1 udp 1 9.9.9.9 9 typ host\r\n' });
  s.dc = fakeDC();
  return s.dc;
}

test('a restart abandoned by a re-pair does not post onto the fresh connection', async () => {
  const { s, events } = harness({ gather: 'never' });

  const restart = s.tryIceRestart();
  await tick();
  const freshDc = repair(s);   // the user took the fresh-invite path mid-gather
  await restart;

  assert.deepEqual(freshDc.sent, [], 'the new pairing is left alone');
  assert.ok(!events.includes('dead'), 'a deliberate re-pair is not reported as a failure');
});

test('a restart ANSWER abandoned by a re-pair does not post onto the fresh connection', async () => {
  const { s, events } = harness({ isInviter: false, gather: 'never' });

  const handled = s._handleIceRestartMsg({ type: 'ICE_RESTART_OFFER', sdp: SDP_2 });
  await tick();
  const freshDc = repair(s);
  await handled;

  assert.deepEqual(freshDc.sent, []);
  assert.ok(!events.includes('dead'));
});

test('a genuine restart failure still declares the connection dead', async () => {
  const { s, events } = harness();
  s.pc.createOffer = async () => { throw new Error('InvalidStateError'); };

  await s.tryIceRestart();
  assert.ok(events.includes('dead'), 'the reset guard does not swallow real failures');
});
