// The one door to the network. Every request the page makes goes through schedule(), which holds it until
// sending it keeps every rolling 60-second window at or under the ceiling (300 requests, all hosts together)
// and under the host's own cap, with at most 4 requests in flight. Sliding-window log: the send time of every
// request in the last 60 s is kept, and a request waits until fewer than `ceiling` of them remain, so the
// rate never bursts the way a token bucket that refills all at once can.
//
// A 429, or a RateLimit-Remaining under 10% of RateLimit-Limit, pauses that host until RateLimit-Reset
// (60 s when the header is missing); a 429'd request then waits a further 1 s, 2 s, 4 s ... before it is
// tried again, so it is never retried at once. The clock is injectable so tests/six-degrees-scheduler.mjs
// can run 1,000 requests in simulated time.

export const MAX_CEILING = 300;
export const WINDOW_MS = 60_000;

// Per-host caps, inside the shared ceiling. Hosts not named here are PDSes: 3000 per 5 minutes per IP is
// their policy, 600 a minute, so 120 leaves room for anyone else behind the same address.
export const HOST_CAPS = {
  'public.api.bsky.app': MAX_CEILING,
  'plc.directory': 120,
  'constellation.microcosm.blue': 60,
};
export const DEFAULT_HOST_CAP = 120;

export class CancelledError extends Error {
  constructor() { super('cancelled'); this.name = 'CancelledError'; }
}
export class HttpError extends Error {
  constructor(status, url, body) {
    super(`${status} ${url}`.slice(0, 300));
    this.name = 'HttpError'; this.status = status; this.url = url; this.body = body;
  }
}

const realClock = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
};

export function hostOf(url) {
  try { return new URL(url).host; } catch { return 'unknown'; }
}

export function createScheduler(opts = {}) {
  const clock = opts.clock || realClock;
  const fetchImpl = opts.fetch || ((...a) => fetch(...a));
  const windowMs = opts.windowMs ?? WINDOW_MS;
  const concurrency = opts.concurrency ?? 4;
  const hostCaps = { ...HOST_CAPS, ...(opts.hostCaps || {}) };
  const defaultHostCap = opts.defaultHostCap ?? DEFAULT_HOST_CAP;
  const maxAttempts = opts.maxAttempts ?? 6;
  let ceiling = Math.min(MAX_CEILING, opts.ceiling ?? MAX_CEILING);

  const log = [];                 // send times, all hosts, ascending
  const hostLog = new Map();      // host -> send times, ascending
  const pausedUntil = new Map();  // host -> time it may send again
  const queue = [];               // jobs waiting: {host, fn, resolve, reject, attempt, notBefore}
  const inflight = new Set();     // {controller}
  let active = 0, total = 0, runTotal = 0, timer = null, timerAt = Infinity, gen = 0;
  const listeners = new Set();

  // A log carried over from an earlier page load still counts against the window.
  for (const e of opts.initialLog || []) {
    if (e.t > clock.now() - windowMs) { log.push(e.t); hostList(e.h).push(e.t); }
  }

  function hostList(h) { let l = hostLog.get(h); if (!l) hostLog.set(h, (l = [])); return l; }
  const capOf = (h) => Math.min(hostCaps[h] ?? defaultHostCap, ceiling);
  function prune(arr, now) { let i = 0; while (i < arr.length && arr[i] <= now - windowMs) i++; if (i) arr.splice(0, i); }

  // Earliest time this job could be sent, given the logs as they stand now.
  function readyAt(job, now) {
    let t = Math.max(now, job.notBefore || 0, pausedUntil.get(job.host) || 0);
    if (log.length >= ceiling) t = Math.max(t, log[log.length - ceiling] + windowMs + 1);
    const hl = hostList(job.host), cap = capOf(job.host);
    if (hl.length >= cap) t = Math.max(t, hl[hl.length - cap] + windowMs + 1);
    return t;
  }

  function emit() { for (const f of listeners) { try { f(); } catch { /* listener errors are not ours */ } } }

  function arm(at) {
    if (at >= timerAt && timer !== null) return;
    if (timer !== null) clock.clearTimeout(timer);
    timerAt = at;
    timer = clock.setTimeout(() => { timer = null; timerAt = Infinity; pump(); }, Math.max(0, at - clock.now()));
  }

  function pump() {
    const now = clock.now();
    prune(log, now);
    for (const l of hostLog.values()) prune(l, now);
    let next = Infinity;
    for (let i = 0; i < queue.length && active < concurrency;) {
      if (log.length >= ceiling) { next = Math.min(next, log[log.length - ceiling] + windowMs + 1); break; }
      const job = queue[i];
      const at = readyAt(job, now);
      if (at <= now) { queue.splice(i, 1); send(job, now); }
      else { next = Math.min(next, at); i++; }
    }
    if (queue.length && active < concurrency && next < Infinity) arm(next);
    emit();
  }

  function send(job, now) {
    log.push(now); hostList(job.host).push(now);
    active++; total++; runTotal++;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const handle = { controller };
    inflight.add(handle);
    const myGen = gen;
    Promise.resolve()
      .then(() => job.fn(controller?.signal))
      .then((res) => settle(job, res, null, myGen), (err) => settle(job, null, err, myGen))
      .finally(() => { inflight.delete(handle); active--; pump(); });
  }

  function header(res, name) {
    try { return res?.headers?.get?.(name) ?? null; } catch { return null; }
  }

  function resetTime(res, now) {
    const v = Number(header(res, 'ratelimit-reset'));
    if (!Number.isFinite(v) || v <= 0) return null;
    const at = v > 1e9 ? v * 1000 : now + v * 1000;            // epoch seconds (atproto PDS) or delta seconds
    return Math.min(Math.max(at, now + 1000), now + 6 * 60_000); // never past the PDS's 5-minute window, plus slack
  }

  function settle(job, res, err, myGen) {
    const now = clock.now();
    if (myGen !== gen || err?.name === 'AbortError') { job.reject(new CancelledError()); return; }
    if (err) {                                    // network error: retry with backoff
      if (job.attempt + 1 >= maxAttempts) { job.reject(err); return; }
      requeue(job, now + 1000 * 2 ** job.attempt); return;
    }
    const limit = Number(header(res, 'ratelimit-limit'));
    const remaining = Number(header(res, 'ratelimit-remaining'));
    if (res.status === 429) {
      const until = resetTime(res, now) ?? now + 60_000;
      pausedUntil.set(job.host, Math.max(pausedUntil.get(job.host) || 0, until));
      if (job.attempt + 1 >= maxAttempts) { job.reject(new HttpError(429, job.url, '')); return; }
      requeue(job, until + 1000 * 2 ** job.attempt); return;
    }
    if (header(res, 'ratelimit-remaining') !== null && limit > 0 && remaining < 0.1 * limit) {
      const until = resetTime(res, now) ?? now + 60_000;
      pausedUntil.set(job.host, Math.max(pausedUntil.get(job.host) || 0, until));
    }
    if (res.status >= 500 && job.attempt + 1 < maxAttempts) { requeue(job, now + 1000 * 2 ** job.attempt); return; }
    job.resolve(res);
  }

  function requeue(job, notBefore) {
    job.attempt++; job.notBefore = notBefore;
    queue.unshift(job);
  }

  // fn(signal) performs the request and returns a Response-like object (status, headers.get, json()).
  function schedule(host, fn, url = host) {
    return new Promise((resolve, reject) => {
      queue.push({ host, fn, url, resolve, reject, attempt: 0, notBefore: 0 });
      pump();
    });
  }

  async function fetchJSON(url, init) {
    const res = await schedule(hostOf(url), (signal) => fetchImpl(url, { ...(init || {}), signal }), url);
    if (!res.ok) {
      let body = '';
      try { body = await res.text(); } catch { /* none */ }
      throw new HttpError(res.status, url, body);
    }
    return res.json();
  }

  function stop() {
    gen++;
    const q = queue.splice(0);
    for (const j of q) j.reject(new CancelledError());
    for (const h of inflight) { try { h.controller?.abort(); } catch { /* already done */ } }
    if (timer !== null) { clock.clearTimeout(timer); timer = null; timerAt = Infinity; }
    emit();
  }

  function stats() {
    const now = clock.now();
    prune(log, now);
    const paused = [];
    for (const [h, t] of pausedUntil) if (t > now) paused.push({ host: h, until: t });
    return { inWindow: log.length, ceiling, total, run: runTotal, queued: queue.length, active, paused };
  }

  return {
    schedule, fetchJSON, stop, stats,
    setCeiling(n) { ceiling = Math.max(1, Math.min(MAX_CEILING, Math.floor(Number(n) || MAX_CEILING))); pump(); return ceiling; },
    get ceiling() { return ceiling; },
    resetRun() { runTotal = 0; emit(); },
    onChange(f) { listeners.add(f); return () => listeners.delete(f); },
    // send times still inside the window, with their hosts, so a reload can carry them over
    snapshot() {
      const now = clock.now(), out = [];
      for (const [h, l] of hostLog) for (const t of l) if (t > now - windowMs) out.push({ t, h });
      return out.sort((a, b) => a.t - b.t);
    },
  };
}

// Seconds to send n requests at the current ceiling, given what the window already holds.
export function etaSeconds(n, ceiling, inWindow = 0) {
  if (n <= 0) return 0;
  const room = Math.max(0, ceiling - inWindow);
  if (n <= room) return Math.ceil(n / 20);          // ~20 req/s with 4 in flight at ~200 ms
  return Math.ceil(((n - room) / ceiling) * 60) + Math.ceil(room / 20);
}
