// Shortest follow path A -> x -> ... -> B, by bidirectional breadth-first search.
//
// The forward side grows from A along follows (getFollows); the backward side grows from B along followers
// (getFollowers). Each step expands one whole ring of the side whose ring costs fewer pages. Accounts whose
// list runs over pageCap pages are not expanded, though they can still be where the two sides meet.
// After every forward ring, getRelationships(B, ring) asks which of the new accounts follow B directly
// (30 per call); for a celebrity B, whose follower list could never be read, that finds the last hop.
//
// The prototype stopped at the first meeting it saw in the middle of a ring, so it could report a 4-hop path
// when a 3-hop one was one ring away. Here rings always finish, and the search stops only when the best path
// found is no longer than the bound R that every path not yet found must exceed:
//   R = rF + rB                 (rF, rB = rings expanded on each side)
//   R = rF + max(rB, 1)         with the last-hop check, which gives every forward account's distance to B
//                               when it is 1, whether or not B's followers were ever read
// A path of length d <= R has an account at forward distance min(d, rF) that is also within rB of B (or follows
// B), so it is found by then. Skipped accounts break that argument only for paths through them, which the
// result reports as gaps: with gaps the path is the shortest that avoids them.

import { pagesFor } from './api.js';
import { CancelledError } from './scheduler.js';

export async function findPath(api, a, b, opt = {}) {
  const {
    mutual = false, pageCap = 10, shortcut = true, allPaths = false, maxPaths = 50,
    gate = async () => true, progress = () => {}, closeGaps: closeGapsOpt = true,
  } = opt;
  const t0 = Date.now();
  const pa = await api.resolve(a), pb = await api.resolve(b);
  const A = pa.did, B = pb.did;
  const info = new Map([[A, pa], [B, pb]]);
  const side = (name, root, kind, countKey) => ({ name, root, kind, countKey, dist: new Map([[root, 0]]), par: new Map([[root, []]]), front: [root], r: 0, skipped: [], truncated: [], gone: 0 });
  const F = side('forward', A, 'follows', 'followsCount');
  const K = side('backward', B, 'followers', 'followersCount');
  const hop1 = new Set();               // accounts known to follow B (mutual mode: to be mutuals with B)
  const links = new Map();              // H -> [X]: H follows X, found when closing gaps
  let closed = false;                   // every gap pair that could hide a one-edge shortcut was checked
  const steps = [];
  let stopped = false, error = null, exhausted = false;

  const result = (paths, len, proven) => ({
    a: pa, b: pb, paths, hops: len, proven, stopped, error, steps, mutual, pageCap,
    gaps: gaps(), rings: { forward: F.r, backward: K.r }, visited: F.dist.size + K.dist.size, ms: Date.now() - t0,
  });
  // Skipped (or cut-short) accounts in rings that were expanded, which a shorter path could pass through.
  // A path shorter than the best found that the search missed must leave the forward side's reach at a
  // forward gap (depth k) or its frontier (rF), and enter the backward side's reach at a backward gap or its
  // frontier (rB); the two ends are at least one edge apart. So a forward gap at depth k matters only if
  // k + 1 + min(rB', smallest backward gap depth) <= best - 1, where rB' = max(rB, 1) with the last-hop check
  // (it tests every forward account against B). Once closeGaps() has checked every gap-to-gap edge that could
  // do it, the two ends are at least two edges apart, and rB' is plain rB again. Backward gaps likewise.
  function gaps() {
    const g = { forward: [], backward: [] };
    for (const s of [F, K]) for (const x of [...s.skipped, ...s.truncated]) if (x.depth < s.r) g[s.name].push({ ...x, side: s.name });
    const len = best();
    if (len === Infinity) return [...g.forward, ...g.backward];
    const c = closed ? 1 : 0;
    const minF = Math.min(F.r, ...g.forward.map((x) => x.depth));
    const minK = Math.min(closed || !shortcut ? K.r : Math.max(K.r, 1), ...g.backward.map((x) => x.depth));
    return [...g.forward.filter((x) => x.depth <= len - 2 - c - minK), ...g.backward.filter((x) => x.depth <= len - 2 - c - minF)];
  }

  // Check, for each pair of accounts whose lists were not read (a forward gap or frontier account H, a backward
  // one X) close enough to make a path shorter than the best, whether H follows X. One getRelationships call
  // per 30 pairs that share an end.
  async function closeGaps() {
    const len = best();
    if (len === Infinity || !gaps().length) { closed = true; return; }
    const inc = (s, skipRoot) => {
      const m = new Map();
      for (const x of [...s.skipped, ...s.truncated]) if (x.depth < s.r) m.set(x.did, Math.min(x.depth, m.get(x.did) ?? Infinity));
      for (const n of s.front) if (!m.has(n)) m.set(n, s.r);
      if (skipRoot) m.delete(s.root);
      return m;
    };
    const IF = inc(F, false), IK = inc(K, shortcut);       // the last-hop check already tested B against all of F
    const byX = new Map(), byH = new Map();
    for (const [x, dx] of IK) for (const [h, dh] of IF) if (h !== x && dh + dx <= len - 2) {
      if (!byX.has(x)) byX.set(x, []); byX.get(x).push(h);
      if (!byH.has(h)) byH.set(h, []); byH.get(h).push(x);
    }
    const cost = (m) => [...m.values()].reduce((t, l) => t + Math.ceil(l.length / 30), 0);
    const [cx, ch] = [cost(byX), cost(byH)];
    if (!cx) { closed = true; return; }
    const step = { side: 'gaps', ring: null, nodes: byX.size + byH.size, expandable: Math.min(byX.size, byH.size), pages: 0, est: Math.min(cx, ch), listCalls: Math.min(cx, ch) };
    if (!(await gate(step))) return;
    progress({ phase: 'expand', ...step });
    const edge = (r, hFollowsX) => r && (mutual ? r.following && r.followedBy : hFollowsX(r));
    if (cx <= ch) {
      await Promise.all([...byX].map(async ([x, hs]) => {
        const rel = await api.relationships(x, hs);
        for (const h of hs) if (edge(rel.get(h), (r) => r.followedBy)) { if (!links.has(h)) links.set(h, []); links.get(h).push(x); }
      }));
    } else {
      await Promise.all([...byH].map(async ([h, xs]) => {
        const rel = await api.relationships(h, xs);
        for (const x of xs) if (edge(rel.get(x), (r) => r.following)) { if (!links.has(h)) links.set(h, []); links.get(h).push(x); }
      }));
    }
    steps.push({ ...step, found: [...links.values()].reduce((t, l) => t + l.length, 0) });
    closed = true;
  }

  if (A === B) return result([[A]], 0, true);

  const connects = (rel) => rel && (mutual ? rel.followedBy && rel.following : rel.followedBy);
  async function lastHop(nodes) {
    const ask = nodes.filter((n) => n !== B && !hop1.has(n));
    if (!ask.length) return;
    const rel = await api.relationships(B, ask);
    for (const n of ask) if (connects(rel.get(n))) hop1.add(n);
  }

  // How a node would be expanded and what that costs, or null when it is too big (or gone).
  function plan(s, n) {
    const p = info.get(n);
    if (!p) return { gone: true };
    if (!mutual) {
      const pg = pagesFor(p[s.countKey]);
      return pg > pageCap ? null : { how: 'list', pages: pg, calls: pg, est: p[s.countKey] || 0 };
    }
    const pf = pagesFor(p.followsCount), pr = pagesFor(p.followersCount);
    const opts = [];
    if (pf <= pageCap && pr <= pageCap) opts.push({ how: 'both', pages: pf + pr, calls: pf + pr });
    const small = p.followsCount <= p.followersCount ? 'follows' : 'followers';
    const sc = small === 'follows' ? p.followsCount : p.followersCount, sp = pagesFor(sc);
    if (sp <= pageCap) opts.push({ how: 'rel', small, pages: sp, calls: sp + Math.ceil((sc || 0) / 30) });
    if (!opts.length) return null;
    const best = opts.sort((x, y) => x.calls - y.calls)[0];
    return { ...best, est: Math.min(p.followsCount || 0, p.followersCount || 0) };
  }

  async function neighbors(s, n, pl) {
    if (pl.how === 'list') { const g = await api.graph(s.kind, n, pageCap); return { kids: g.dids, complete: g.complete }; }
    if (pl.how === 'both') {
      const [f, r] = await Promise.all([api.graph('follows', n, pageCap), api.graph('followers', n, pageCap)]);
      const set = new Set(r.dids);
      return { kids: f.dids.filter((d) => set.has(d)), complete: f.complete && r.complete };
    }
    const g = await api.graph(pl.small, n, pageCap);
    const rel = await api.relationships(n, g.dids);
    return { kids: g.dids.filter((d) => { const x = rel.get(d); return x && x.following && x.followedBy; }), complete: g.complete };
  }

  async function ringCost(s) {
    let pages = 0, calls = 0, est = 0, nodes = 0;
    for (const n of s.front) {
      const pl = plan(s, n);
      if (!pl || pl.gone) continue;
      nodes++; pages += pl.pages; est += pl.est;
      calls += (api.graphCached && await api.graphCached(pl.how === 'rel' ? pl.small : s.kind, n)) ? 0 : pl.calls;
    }
    // follow-up: last-hop checks (forward only) and profiles of the new ring; est counts overlaps twice
    const follow = Math.ceil(est / 25) + (s === F && shortcut ? Math.ceil(est / 30) : 0);
    return { pages, calls, follow, total: calls + follow, nodes };
  }

  function best() {
    let len = Infinity;
    for (const [m, df] of F.dist) {
      const db = K.dist.get(m);
      if (db !== undefined) len = Math.min(len, df + db);
      if (hop1.has(m)) len = Math.min(len, df + 1);
    }
    for (const [h, xs] of links) for (const x of xs) len = Math.min(len, F.dist.get(h) + 1 + K.dist.get(x));
    return len;
  }

  async function expand(s) {
    const d = s.r + 1, plans = [];
    for (const n of s.front) {
      const pl = plan(s, n);
      if (!pl) s.skipped.push({ did: n, depth: s.r, count: info.get(n)?.[s.countKey] ?? null });
      else if (pl.gone) s.gone++;
      else plans.push([n, pl]);
    }
    plans.sort((x, y) => x[1].calls - y[1].calls);
    const res = await Promise.all(plans.map(([n, pl]) => neighbors(s, n, pl)));
    const next = [];
    res.forEach(({ kids, complete }, i) => {
      const n = plans[i][0];
      if (!complete) s.truncated.push({ did: n, depth: s.r, count: info.get(n)?.[s.countKey] ?? null });
      for (const k of kids) {
        if (!s.dist.has(k)) { s.dist.set(k, d); s.par.set(k, [n]); next.push(k); }
        else if (s.dist.get(k) === d && !s.par.get(k).includes(n)) s.par.get(k).push(n);
      }
    });
    s.r = d; s.front = next;
    return next;
  }

  try {
    if (shortcut) await lastHop([A]);
    for (;;) {
      const len = best();
      const R = F.r + (shortcut ? Math.max(K.r, 1) : K.r);
      progress({ phase: 'check', best: len, bound: R, rings: { forward: F.r, backward: K.r } });
      if (len <= R) break;
      if (!F.front.length || !K.front.length) { exhausted = true; break; }   // one side reached all it can
      const [fc, kc] = await Promise.all([ringCost(F), ringCost(K)]);
      if (!fc.nodes && !kc.nodes) {                           // every account left is too big to expand
        for (const s of [F, K]) { for (const n of s.front) s.skipped.push({ did: n, depth: s.r, count: info.get(n)?.[s.countKey] ?? null }); s.r++; s.front = []; }
        exhausted = true;                                      // their skips now count as gaps
        break;
      }
      const s = !kc.nodes || (fc.nodes && fc.pages <= kc.pages) ? F : K;
      const c = s === F ? fc : kc;
      const step = { side: s.name, ring: s.r, nodes: s.front.length, expandable: c.nodes, pages: c.pages, est: c.total, listCalls: c.calls };
      if (!(await gate(step))) { stopped = true; break; }
      progress({ phase: 'expand', ...step });
      const next = await expand(s);
      if (s === F && shortcut && next.length) await lastHop(next);
      steps.push({ ...step, found: next.length });
      if (best() <= F.r + (shortcut ? Math.max(K.r, 1) : K.r)) continue;   // done: skip the profile fetch
      const fresh = next.filter((n) => !info.has(n));
      if (fresh.length) {
        progress({ phase: 'profiles', n: fresh.length });
        const m = await api.profiles(fresh);
        for (const [d, p] of m) info.set(d, p);
      }
    }
    if (!stopped && closeGapsOpt) await closeGaps();
  } catch (e) {
    if (e instanceof CancelledError || e?.name === 'CancelledError') stopped = true;
    else { error = e; stopped = true; }
  }

  const len = best();
  // proven: no shorter path exists (with gaps: none that avoids the skipped accounts)
  const R = F.r + (shortcut ? Math.max(K.r, 1) : K.r);
  const proven = !stopped && !error && (len <= R || exhausted);
  if (len === Infinity) return result([], null, proven);
  return result(enumerate(len, allPaths ? maxPaths : 1), len, proven);

  // Every shortest path (up to `cap`) through every meeting account.
  function enumerate(len, cap) {
    const out = [], seen = new Set();
    const back = (m) => {                    // chains A..m
      const res = [];
      const walk = (n, acc) => {
        if (res.length >= cap) return;
        if (n === A) { res.push([A, ...acc]); return; }
        for (const p of F.par.get(n) || []) walk(p, [n, ...acc]);
      };
      walk(m, []);
      return res;
    };
    const fwd = (m, need) => {               // chains m..B of exactly `need` hops
      const res = [];
      const walk = (n, acc) => {
        if (res.length >= cap) return;
        if (n === B) { res.push([...acc, B]); return; }
        for (const p of K.par.get(n) || []) walk(p, [...acc, n]);
      };
      if (K.dist.get(m) === need) walk(m, []);
      if (need === 1 && hop1.has(m) && !res.some((r) => r.length === 2)) res.push([m, B]);
      return res;
    };
    const add = (p) => { const key = p.join(' '); if (!seen.has(key)) { seen.add(key); out.push(p); } return out.length >= cap; };
    for (const [m, df] of F.dist) {
      const need = len - df;
      if (need < 0 || (K.dist.get(m) !== need && !(need === 1 && hop1.has(m)))) continue;
      for (const head of back(m)) for (const tail of fwd(m, need)) if (add([...head.slice(0, -1), ...tail])) return out;
    }
    for (const [h, xs] of links) for (const x of xs) {
      if (F.dist.get(h) + 1 + K.dist.get(x) !== len) continue;
      for (const head of back(h)) for (const tail of fwd(x, K.dist.get(x))) if (add([...head, ...tail])) return out;
    }
    return out;
  }
}
