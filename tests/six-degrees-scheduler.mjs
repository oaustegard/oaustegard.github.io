// node tests/six-degrees-scheduler.mjs
// The request scheduler of bsky/six-degrees in simulated time: 1,000 mocked requests, and no 60-second window
// may hold more than 300 sends (or more than a host's own cap), with never more than 4 in flight. Then a 429
// and a low RateLimit-Remaining must pause their host until RateLimit-Reset, the ceiling must refuse to go
// above 300, and stop() must cancel what is queued.
import { createScheduler, CancelledError, MAX_CEILING } from '../bsky/six-degrees/scheduler.js';

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.log('FAIL', msg); } };

let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const flush = () => new Promise((r) => setImmediate(r));

function fakeClock(start = 1_795_000_000_000) {
  let now = start, seq = 0;
  const timers = new Map();
  return {
    now: () => now,
    setTimeout(fn, ms) { const id = ++seq; timers.set(id, { at: now + Math.max(0, ms), fn, seq: id }); return id; },
    clearTimeout(id) { timers.delete(id); },
    async run() {
      for (;;) {
        await flush(); await flush();
        if (!timers.size) return;
        let best = null;
        for (const e of timers) if (!best || e[1].at < best[1].at || (e[1].at === best[1].at && e[1].seq < best[1].seq)) best = e;
        timers.delete(best[0]);
        now = Math.max(now, best[1].at);
        best[1].fn();
      }
    },
  };
}

// A mocked network: every send is logged with its time and host; the reply comes back after 50-400 ms.
function mockNet(clock, reply = () => ({ status: 200 })) {
  const sends = [];
  let inflight = 0, maxInflight = 0;
  const fetch = (url) => {
    const host = new URL(url).host;
    const entry = { t: clock.now(), host, url };
    sends.push(entry);
    inflight++; maxInflight = Math.max(maxInflight, inflight);
    const r = reply(url, clock.now(), sends.length);
    return new Promise((resolve) => clock.setTimeout(() => {
      inflight--; entry.done = clock.now();
      const h = new Map(Object.entries(r.headers || {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
      resolve({ status: r.status, ok: r.status < 300, headers: { get: (k) => h.get(k.toLowerCase()) ?? null },
        json: async () => ({ url }), text: async () => '' });
    }, 50 + rnd() * 350));
  };
  return { sends, fetch, get maxInflight() { return maxInflight; } };
}

// Largest number of sends in any window [t, t + 60 s), over the sends that match.
function maxInWindow(sends, filter = () => true) {
  const t = sends.filter(filter).map((s) => s.t).sort((a, b) => a - b);
  let best = 0;
  for (let i = 0, j = 0; i < t.length; i++) {
    while (j < t.length && t[j] < t[i] + 60_000) j++;
    best = Math.max(best, j - i);
  }
  return best;
}

// 1. 1,000 requests to the public AppView: the global ceiling binds.
{
  const clock = fakeClock(), net = mockNet(clock);
  const s = createScheduler({ clock, fetch: net.fetch });
  const t0 = clock.now();
  const done = Promise.all(Array.from({ length: 1000 }, (_, i) => s.fetchJSON(`https://public.api.bsky.app/xrpc/x?i=${i}`)));
  await clock.run();
  const res = await done;
  ok(res.length === 1000, '1000 requests resolve');
  ok(net.sends.length === 1000, `1000 sends (got ${net.sends.length})`);
  const m = maxInWindow(net.sends);
  ok(m <= 300, `no 60 s window holds more than 300 sends (max ${m})`);
  ok(m >= 295, `the ceiling is used, not undershot (max ${m})`);
  ok(net.maxInflight <= 4, `at most 4 in flight (max ${net.maxInflight})`);
  ok(clock.now() - t0 >= 180_000, `1000 at 300/min takes over 3 minutes (${((clock.now() - t0) / 1000).toFixed(0)} s)`);
  ok(s.stats().run === 1000 && s.stats().queued === 0, 'run total 1000, queue empty');
}

// 2. Mixed hosts: each host's own cap holds inside the shared 300.
{
  const clock = fakeClock(), net = mockNet(clock);
  const s = createScheduler({ clock, fetch: net.fetch });
  const hosts = ['public.api.bsky.app', 'public.api.bsky.app', 'plc.directory', 'constellation.microcosm.blue',
    'a.us-east.host.bsky.network', 'b.us-west.host.bsky.network', 'pds.example.com'];
  const done = Promise.all(Array.from({ length: 1000 }, (_, i) =>
    s.fetchJSON(`https://${hosts[Math.floor(rnd() * hosts.length)]}/xrpc/x?i=${i}`)));
  await clock.run();
  await done;
  ok(maxInWindow(net.sends) <= 300, `mixed: global max ${maxInWindow(net.sends)} <= 300`);
  const caps = { 'plc.directory': 120, 'constellation.microcosm.blue': 60, 'a.us-east.host.bsky.network': 120,
    'b.us-west.host.bsky.network': 120, 'pds.example.com': 120 };
  for (const [h, cap] of Object.entries(caps)) {
    const m = maxInWindow(net.sends, (x) => x.host === h);
    ok(m <= cap, `mixed: ${h} max ${m} <= ${cap}`);
  }
  ok(net.maxInflight <= 4, `mixed: at most 4 in flight (max ${net.maxInflight})`);
}

// 3. A 429 with RateLimit-Reset pauses that host until the reset and is not retried before reset + 1 s.
{
  const clock = fakeClock();
  const T0 = clock.now();
  const resetAt = Math.floor(T0 / 1000) + 30;                          // epoch seconds, as a PDS sends it
  let first = true;
  const net = mockNet(clock, (url) => {
    if (url.includes('pds.example') && first) { first = false; return { status: 429, headers: { 'RateLimit-Reset': resetAt, 'RateLimit-Limit': 3000, 'RateLimit-Remaining': 0 } }; }
    return { status: 200 };
  });
  const s = createScheduler({ clock, fetch: net.fetch });
  const done = Promise.all([
    ...Array.from({ length: 20 }, (_, i) => s.fetchJSON(`https://pds.example.com/xrpc/x?i=${i}`)),
    ...Array.from({ length: 40 }, (_, i) => s.fetchJSON(`https://public.api.bsky.app/xrpc/y?i=${i}`)),
  ]);
  await clock.run();
  await done;
  const hit = net.sends.find((x) => x.host === 'pds.example.com');
  const t429 = hit.done;                                              // when the 429 arrived
  const pdsAfter = net.sends.filter((x) => x.host === 'pds.example.com' && x.t > t429);
  const replies = net.sends.filter((x) => x.host === 'pds.example.com' && x.t > t429 && x.t < resetAt * 1000);
  // requests already in flight when the 429 arrived were sent before it; nothing new goes out until the reset
  ok(replies.length === 0, `no PDS send between the 429 and its reset (${replies.length})`);
  const retry = net.sends.filter((x) => x.url === hit.url);
  ok(retry.length === 2 && retry[1].t >= resetAt * 1000 + 1000, 'the 429 is retried once, at least 1 s after the reset');
  ok(pdsAfter.length >= 1, 'the PDS resumes after the reset');
  const pub = net.sends.filter((x) => x.host === 'public.api.bsky.app');
  ok(pub.every((x) => x.t < resetAt * 1000), 'other hosts keep going during the pause');
}

// 4. RateLimit-Remaining under 10% of the limit pauses the host until the reset (delta seconds here).
{
  const clock = fakeClock();
  let n = 0, tLow = 0;
  const net = mockNet(clock, (url, now) => {
    n++;
    if (n === 1) { tLow = now; return { status: 200, headers: { 'RateLimit-Limit': 100, 'RateLimit-Remaining': 5, 'RateLimit-Reset': 20 } }; }
    return { status: 200, headers: { 'RateLimit-Limit': 100, 'RateLimit-Remaining': 90 } };
  });
  const s = createScheduler({ clock, fetch: net.fetch, concurrency: 1 });
  const done = Promise.all(Array.from({ length: 5 }, (_, i) => s.fetchJSON(`https://pds.example.com/xrpc/x?i=${i}`)));
  await clock.run();
  await done;
  ok(net.sends[1].t >= tLow + 20_000, `low remaining pauses the host ~20 s (${((net.sends[1].t - tLow) / 1000).toFixed(1)} s)`);
}

// 5. The ceiling can be lowered and cannot be raised past 300.
{
  const clock = fakeClock(), net = mockNet(clock);
  const s = createScheduler({ clock, fetch: net.fetch });
  ok(s.setCeiling(1000) === MAX_CEILING, 'setCeiling(1000) clamps to 300');
  ok(createScheduler({ clock, ceiling: 5000 }).ceiling === 300, 'constructor clamps to 300');
  s.setCeiling(100);
  const done = Promise.all(Array.from({ length: 350 }, (_, i) => s.fetchJSON(`https://public.api.bsky.app/xrpc/z?i=${i}`)));
  await clock.run();
  await done;
  ok(maxInWindow(net.sends) <= 100, `lowered ceiling holds (max ${maxInWindow(net.sends)})`);
}

// 6. stop() cancels what is queued; nothing more is sent.
{
  const clock = fakeClock(), net = mockNet(clock);
  const s = createScheduler({ clock, fetch: net.fetch });
  const ps = Array.from({ length: 500 }, (_, i) => s.fetchJSON(`https://public.api.bsky.app/xrpc/w?i=${i}`).then(() => 'ok', (e) => e));
  // let the first window fill, then stop
  for (let k = 0; k < 400 && net.sends.length < 300; k++) { await flush(); const st = s.stats(); if (st.inWindow >= 300) break; await clock.run(); }
  s.stop();
  const sentAtStop = net.sends.length;
  await clock.run();
  const out = await Promise.all(ps);
  ok(net.sends.length === sentAtStop, 'no sends after stop');
  ok(out.filter((x) => x instanceof CancelledError).length >= 500 - sentAtStop, 'queued requests reject as cancelled');
}

// 7. A window carried over from a reload still counts.
{
  const clock = fakeClock(), net = mockNet(clock);
  const prior = Array.from({ length: 300 }, (_, i) => ({ t: clock.now() - 30_000 + i, h: 'public.api.bsky.app' }));
  const s = createScheduler({ clock, fetch: net.fetch, initialLog: prior });
  const t0 = clock.now();
  const p = s.fetchJSON('https://public.api.bsky.app/xrpc/q');
  await clock.run();
  await p;
  ok(net.sends[0].t >= t0 + 30_000, `a full carried-over window delays the next send (${((net.sends[0].t - t0) / 1000).toFixed(1)} s)`);
}

console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
