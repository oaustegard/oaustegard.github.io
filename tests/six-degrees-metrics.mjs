// node tests/six-degrees-metrics.mjs
// The statistics behind bsky/six-degrees' metric tiers, on cases worked by hand: Louvain must split two cliques
// joined by one edge, betweenness must peak on the bridge, Jaccard and the bootstrap interval must hold on
// known inputs, and the timezone guess must place the quiet hours at local 04:00.
import { louvain, betweenness, jaccard, bootstrap, utcOffsetFromHours, egoAnalysis, handleKind } from '../bsky/six-degrees/metrics.js';

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.log('FAIL', msg); } };

// two 6-cliques, 0-5 and 6-11, joined by the edge 5-6
const adj = Array.from({ length: 12 }, () => []);
const link = (a, b) => { adj[a].push(b); adj[b].push(a); };
for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { link(i, j); link(i + 6, j + 6); }
link(5, 6);
const { community, modularity } = louvain(adj);
ok(new Set(community.slice(0, 6)).size === 1 && new Set(community.slice(6)).size === 1 && community[0] !== community[6], `louvain splits the cliques (${community})`);
// 31 edges; each clique holds 15 and degree 31 of 62: Q = 2(15/31) - 2(31/62)^2 = 0.4677
ok(Math.abs(modularity - 0.4677) < 0.001, `modularity of the split is 0.4677 (${modularity.toFixed(4)})`);

const b = betweenness(adj);
const top = [...b.keys()].sort((x, y) => b[y] - b[x]).slice(0, 2).sort();
ok(top[0] === 5 && top[1] === 6, `betweenness peaks on the bridge ends (${top})`);
// node 5 is on every shortest path from 0-4 to 6-11: 30 pairs, counted both ways by Brandes, over (n-1)(n-2) = 110
ok(Math.abs(b[5] - 30 / 55) < 1e-9, `betweenness of a bridge end = 30/55 (${b[5]})`);
const pathAdj = [[1], [0, 2], [1, 3], [2]];
const pb = betweenness(pathAdj);
ok(Math.abs(pb[1] - 2 / 3) < 1e-9 && pb[0] === 0, `path graph: middle betweenness 2/3 (${pb})`);

ok(Math.abs(jaccard(new Set([1, 2, 3]), new Set([2, 3, 4])) - 0.5) < 1e-12, 'jaccard {1,2,3} {2,3,4} = 0.5');
ok(Number.isNaN(jaccard(new Set(), new Set())), 'jaccard of two empty sets is undefined, not 0');

const xs = Array.from({ length: 200 }, (_, i) => (i % 2 ? 1 : 0));
const ci = bootstrap(xs.length, (idx) => idx.reduce((s, i) => s + xs[i], 0) / idx.length);
ok(ci.lo < 0.5 && ci.hi > 0.5 && ci.lo > 0.38 && ci.hi < 0.62, `bootstrap 95% CI of a fair coin over 200 covers 0.5 tightly (${ci.lo.toFixed(3)}–${ci.hi.toFixed(3)})`);

// someone in UTC-5 who posts 08:00-23:00 local: quiet 00:00-08:00 local = 05:00-13:00 UTC
const hours = new Array(24).fill(0);
for (let local = 8; local < 24; local++) hours[(local + 5) % 24] += 10;
ok(utcOffsetFromHours(hours) === -5, `posting hours give UTC-5 (${utcOffsetFromHours(hours)})`);
const oslo = new Array(24).fill(0);
for (let local = 7; local < 24; local++) oslo[(local - 1 + 24) % 24] += 5;
ok(utcOffsetFromHours(oslo) === 1, `posting hours give UTC+1 (${utcOffsetFromHours(oslo)})`);

const ego = egoAnalysis([[1, 2], [0], [0, 1], []]);
ok(ego.edges === 5 && ego.mutualEdges === 2, `ego: 5 directed edges, 2 mutual pairs (${ego.edges}, ${ego.mutualEdges})`);
ok(Math.abs(ego.density - 5 / 12) < 1e-12, 'ego density = edges / n(n-1)');

ok(handleKind('a.bsky.social') === 'bsky.social' && handleKind('x.ap.brid.gy').includes('fediverse') && handleKind('austegard.com').startsWith('custom'), 'handle kinds');

console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
