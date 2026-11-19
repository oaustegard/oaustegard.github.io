// node tests/six-degrees-path.mjs
// Path search of bsky/six-degrees against a mocked Bluesky graph. On hundreds of random follow graphs the length
// it reports must equal a plain BFS's, and with allPaths it must list exactly the shortest paths; the case the
// Python prototype got wrong (a 4-hop meeting seen mid-ring while a 3-hop path waits) must come back as 3 hops;
// a hub too big to expand must be reported as a gap; a celebrity target must be reached by the last-hop check
// without reading its followers; mutual mode must match BFS on the mutual-follow graph; a declined cost gate
// must leave the result unproven.
import { findPath } from '../bsky/six-degrees/path.js';

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.log('FAIL', msg); } };

let seed = 11;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

// out: Map did -> Set of dids it follows
function mockApi(out) {
  const inn = new Map();
  for (const [a, s] of out) { if (!inn.has(a)) inn.set(a, new Set()); for (const b of s) { if (!inn.has(b)) inn.set(b, new Set()); inn.get(b).add(a); } }
  for (const a of inn.keys()) if (!out.has(a)) out.set(a, new Set());
  const prof = (d) => out.has(d) ? { did: d, handle: d, followsCount: out.get(d).size, followersCount: inn.get(d).size } : null;
  const calls = { n: 0, graph: 0, rel: 0, prof: 0, by: {} };
  const tick = (k, n = 1) => { calls.n += n; calls[k] += n; };
  return {
    calls,
    async resolve(x) { const p = prof(x); if (!p) throw new Error('no ' + x); return p; },
    async profiles(dids) { tick('prof', Math.ceil(new Set(dids).size / 25)); const m = new Map(); for (const d of dids) { const p = prof(d); if (p) m.set(d, p); } return m; },
    async graph(kind, did, maxPages = Infinity) {
      const all = [...(kind === 'follows' ? out : inn).get(did) || []];
      const pages = Math.max(1, Math.ceil(all.length / 100));
      const n = Math.min(pages, maxPages);
      tick('graph', n);
      calls.by[kind] = (calls.by[kind] || 0) + n;
      return { dids: all.slice(0, n * 100), complete: n >= pages, pages: n };
    },
    async relationships(target, others) {
      tick('rel', Math.ceil(others.length / 30));
      const m = new Map();
      for (const o of others) m.set(o, { followedBy: out.get(o)?.has(target) || false, following: out.get(target)?.has(o) || false });
      return m;
    },
  };
}

function bfs(out, a, b, mutual) {
  const dist = new Map([[a, 0]]), q = [a];
  const nb = (x) => [...(out.get(x) || [])].filter((y) => !mutual || out.get(y)?.has(x));
  while (q.length) { const x = q.shift(); if (x === b) return dist.get(x); for (const y of nb(x)) if (!dist.has(y)) { dist.set(y, dist.get(x) + 1); q.push(y); } }
  return null;
}
function allShortest(out, a, b, mutual) {
  const d = bfs(out, a, b, mutual); if (d === null) return [];
  const nb = (x) => [...(out.get(x) || [])].filter((y) => !mutual || out.get(y)?.has(x));
  const toB = new Map([[b, 0]]), q = [b];         // reverse distances
  const rin = new Map();
  for (const [x, s] of out) for (const y of s) if (!mutual || out.get(y)?.has(x)) { if (!rin.has(y)) rin.set(y, []); rin.get(y).push(x); }
  while (q.length) { const x = q.shift(); for (const y of rin.get(x) || []) if (!toB.has(y)) { toB.set(y, toB.get(x) + 1); q.push(y); } }
  const res = [];
  const walk = (x, acc) => { if (x === b) { res.push(acc.join(' ')); return; } for (const y of nb(x)) if (toB.get(y) === d - acc.length) walk(y, [...acc, y]); };
  walk(a, [a]);
  return res.sort();
}
function validPath(out, p, mutual) {
  for (let i = 0; i + 1 < p.length; i++) { if (!out.get(p[i])?.has(p[i + 1])) return false; if (mutual && !out.get(p[i + 1])?.has(p[i])) return false; }
  return true;
}
function randomGraph(n, maxDeg) {
  const out = new Map();
  for (let i = 0; i < n; i++) {
    const s = new Set(), k = Math.floor(rnd() * (maxDeg + 1));
    for (let j = 0; j < k; j++) { const t = Math.floor(rnd() * n); if (t !== i) s.add('n' + t); }
    out.set('n' + i, s);
  }
  return out;
}

// 1. Random graphs: length equals BFS, every path is real, allPaths lists exactly the shortest ones.
for (const mutual of [false, true]) for (const shortcut of [true, false]) {
  let agree = 0, total = 0, listOk = 0, listed = 0;
  for (let trial = 0; trial < 150; trial++) {
    const out = randomGraph(120 + Math.floor(rnd() * 200), mutual ? 9 : 4);
    const keys = [...out.keys()];
    const a = keys[Math.floor(rnd() * keys.length)], b = keys[Math.floor(rnd() * keys.length)];
    const want = bfs(out, a, b, mutual);
    const r = await findPath(mockApi(out), a, b, { mutual, shortcut, pageCap: 1000, allPaths: true, maxPaths: 10000 });
    total++;
    if (r.hops === want && r.proven && r.paths.every((p) => p.length - 1 === want && validPath(out, p, mutual))) agree++;
    else console.log('  mismatch', { mutual, shortcut, a, b, want, got: r.hops, proven: r.proven });
    if (want !== null) { listed++; if (JSON.stringify(r.paths.map((p) => p.join(' ')).sort()) === JSON.stringify(allShortest(out, a, b, mutual))) listOk++; }
  }
  ok(agree === total, `${mutual ? 'mutual' : 'follow'} graphs, last-hop ${shortcut ? 'on' : 'off'}: length matches BFS in ${agree}/${total}`);
  ok(listOk === listed, `${mutual ? 'mutual' : 'follow'}, last-hop ${shortcut ? 'on' : 'off'}: all shortest paths listed in ${listOk}/${listed}`);
}

// 1b. Graphs with hubs too big to expand (page cap 1, hubs follow 101-160 accounts and are followed as much):
//     a result with no gaps must be the true shortest length; with gaps it must still be a real path.
for (const mutual of [false, true]) {
  let clean = 0, cleanRight = 0, gapped = 0, gappedValid = 0;
  for (let trial = 0; trial < 200; trial++) {
    const n = 400 + Math.floor(rnd() * 200);
    const out = randomGraph(n, mutual ? 8 : 3);
    for (let h = 0; h < 12; h++) {
      const hub = 'n' + Math.floor(rnd() * n), k = 101 + Math.floor(rnd() * 60);
      for (let j = 0; j < k; j++) { const t = 'n' + Math.floor(rnd() * n); if (t !== hub) { out.get(hub).add(t); if (mutual || rnd() < 0.8) out.get(t).add(hub); } }
    }
    const keys = [...out.keys()];
    const a = keys[Math.floor(rnd() * keys.length)], b = keys[Math.floor(rnd() * keys.length)];
    const want = bfs(out, a, b, mutual);
    const r = await findPath(mockApi(out), a, b, { mutual, pageCap: 1 });
    if (!r.proven) continue;
    if (!r.gaps.length) { clean++; if (r.hops === want) cleanRight++; else console.log('  wrong without gaps', { mutual, a, b, want, got: r.hops }); }
    else { gapped++; if (r.hops === null || (r.hops >= want && validPath(out, r.paths[0], mutual))) gappedValid++; }
  }
  ok(clean > 20 && cleanRight === clean, `${mutual ? "mutual" : "follow"} hub graphs: no gaps means truly shortest (${cleanRight}/${clean}, ${gapped} with gaps)`);
  ok(gappedValid === gapped, `${mutual ? 'mutual' : 'follow'} hub graphs: with gaps the path is still real (${gappedValid}/${gapped})`);
}

// 1c. A hub next to an account no ring reaches: A -> H -> y -> B (3 hops) with H too big to read, and a 4-hop
//     detour the rings do see. y is never seen, so no relationship check can close the gap: H must stay
//     reported. The same with a second hub X on B's side, A -> H -> y -> X -> B against a 6-hop detour.
{
  const out = new Map(Object.entries({ A: ['H', 'c1'], H: ['y'], y: ['B'], c1: ['c2'], c2: ['c3'], c3: ['B'], B: [] }).map(([k, v]) => [k, new Set(v)]));
  for (let i = 0; i < 150; i++) out.get('H').add('hd' + i);
  const r = await findPath(mockApi(out), 'A', 'B', { pageCap: 1 });
  ok(r.hops === 3 || r.gaps.some((g) => g.did === 'H'), `hub before an unseen account: 3 hops or H named as a gap (got ${r.hops}, gaps ${r.gaps.map((g) => g.did)})`);
}
{
  const out = new Map(Object.entries({ A: ['H', 'c1'], H: ['y'], y: ['X'], X: ['B'], c1: ['c2'], c2: ['c3'], c3: ['c4'], c4: ['c5'], c5: ['B'], B: [] }).map(([k, v]) => [k, new Set(v)]));
  for (let i = 0; i < 150; i++) { out.get('H').add('hd' + i); out.set('xd' + i, new Set(['X'])); }
  const r = await findPath(mockApi(out), 'A', 'B', { pageCap: 1 });
  ok(r.hops === 4 || r.gaps.some((g) => g.did === 'H' || g.did === 'X'), `hubs one account apart: 4 hops or a hub named as a gap (got ${r.hops}, gaps ${r.gaps.map((g) => g.did)})`);
}

// 2. The prototype's bug. B's side is cheaper, so it grows two rings first (q follows s follows B; t follows
//    B too but has 1,500 followers, too many to read). Then A's ring is read, and q (2 from B) comes back
//    before t (1 from B). The prototype returned at q, 3 hops; finishing the ring finds A -> t -> B, 2 hops.
{
  const out = new Map(Object.entries({ A: ['q', 't'], q: ['s'], s: ['B'], t: ['B'], B: [] }).map(([k, v]) => [k, new Set(v)]));
  for (let i = 0; i < 248; i++) out.get('A').add('a' + i);              // A: 250 follows, 3 pages
  for (let i = 0; i < 400; i++) out.set('dq' + i, new Set(['q']));       // q: 401 followers, 5 pages
  for (let i = 0; i < 1500; i++) out.set('dt' + i, new Set(['t']));      // t: a hub on B's side
  const api = mockApi(out);
  const order = [];
  const r = await findPath(api, 'A', 'B', { shortcut: false, progress: (e) => { if (e.phase === 'expand') order.push(e.side[0] + e.ring); } });
  ok(order.join(',') === 'b0,b1,f0', `bug case: B's side grows twice before A's ring is read (${order.join(',')})`);
  ok(r.hops === 2 && r.paths[0].join('>') === 'A>t>B', `bug case: 2 hops via t, not 3 via q (got ${r.hops}: ${r.paths[0]?.join('>')})`);
  const r2 = await findPath(mockApi(out), 'A', 'B', { shortcut: true });
  ok(r2.hops === 2 && r2.proven, `bug case with the last-hop check: 2 hops (got ${r2.hops})`);
}

// 3. A celebrity target: B has 5,000 followers, too many to read; the last-hop check finds A -> x -> B.
{
  const out = new Map();
  out.set('A', new Set(['x', 'y']));
  out.set('x', new Set(['B'])); out.set('y', new Set());
  out.set('B', new Set());
  for (let i = 0; i < 5000; i++) out.set('f' + i, new Set(['B']));
  const api = mockApi(out);
  const r = await findPath(api, 'A', 'B', { pageCap: 10 });
  ok(r.hops === 2 && r.proven && r.gaps.length === 0, `celebrity: 2 hops, proven, no gaps (got ${r.hops}, proven ${r.proven}, gaps ${r.gaps.length})`);
  ok(!api.calls.by.followers, `celebrity: B's followers never read (${api.calls.by.followers || 0} pages)`);
}

// 4. A hub too big to expand sits on the only short path: it is reported as a gap.
{
  const out = new Map();
  out.set('A', new Set(['H', 'u']));
  const hub = new Set(['v']); for (let i = 0; i < 1500; i++) hub.add('h' + i);
  out.set('H', hub); out.set('v', new Set(['B']));
  out.set('u', new Set(['u2'])); out.set('u2', new Set(['u3'])); out.set('u3', new Set(['u4'])); out.set('u4', new Set(['B']));
  out.set('B', new Set());
  const r = await findPath(mockApi(out), 'A', 'B', { pageCap: 10 });
  ok(r.hops === 5 && r.gaps.some((g) => g.did === 'H'), `hub: finds the 5-hop path and names H as a gap (got ${r.hops}, gaps ${r.gaps.map((g) => g.did)})`);
  const r2 = await findPath(mockApi(out), 'A', 'B', { pageCap: 20 });
  ok(r2.hops === 3 && r2.gaps.length === 0, `hub: with a larger page cap, 3 hops and no gaps (got ${r2.hops})`);
}

// 5. A declined cost gate stops the search; the result says it is not proven.
{
  const out = randomGraph(300, 4);
  const r = await findPath(mockApi(out), 'n1', 'n2', { gate: async () => false });
  ok(r.stopped && !r.proven, 'declined gate: stopped and unproven');
  let asked = 0;
  await findPath(mockApi(out), 'n1', 'n2', { gate: async (s) => { asked++; return s.est >= 0 && Number.isFinite(s.est); } });
  ok(asked >= 1, `the gate sees an estimate before each step (${asked} steps)`);
}

// 6. No path at all: proven absent once one side runs out.
{
  const out = new Map(Object.entries({ A: ['x'], x: [], B: ['y'], y: [] }).map(([k, v]) => [k, new Set(v)]));
  const r = await findPath(mockApi(out), 'A', 'B', {});
  ok(r.hops === null && r.paths.length === 0 && r.proven, 'no path: none found, proven');
}

console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
