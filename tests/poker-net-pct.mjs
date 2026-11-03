// node tests/poker-net-pct.mjs
// Prints the PCT table for games/poker/net.js: for each game, where the network's own first-round score
// falls among all starting hands, as [score, share of hands below it (ties count half)] knots for its
// piecewise-linear percentile units. Hold'em and five-card stud enumerate all 1,326 two-card starts, the
// seven-card stud games all 22,100 three-card starts; Omaha and draw sample 40,000 hands (fixed seed).
// It reads the score signals, which do not depend on PCT, so it can be rerun after any score change.
import { NET, probe, inputIndex } from '../games/poker/net.js';
import { rng, shuffled, fullDeck } from '../games/poker/rules.js';

const RN = '23456789TJQKA', SN = 'cdhs', name = c => RN[c >> 2] + SN[c & 3];
function score(variant, cards) {
  const x = new Float32Array(NET.nIn);
  for (const c of cards) x[inputIndex('m.' + name(c))] = 1;
  x[inputIndex('v.' + variant)] = 1; x[inputIndex('first')] = 1; x[inputIndex('n1')] = 1;
  if (variant === 'draw5') x[inputIndex('drawing')] = 1;
  return probe(x, ['score.' + variant])['score.' + variant];
}
function* combos(k) {
  const idx = Array.from({ length: k }, (_, i) => i);
  for (;;) {
    yield idx.slice();
    let i = k - 1;
    while (i >= 0 && idx[i] === 52 - k + i) i--;
    if (i < 0) return;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
}
function sample(k, n, seed) { const r = rng(seed), out = []; for (let i = 0; i < n; i++) out.push(shuffled(fullDeck(), r).slice(0, k)); return out; }
const HANDS = {
  holdem: [...combos(2)], stud5: [...combos(2)], stud7: [...combos(3)], stud8: [...combos(3)], razz: [...combos(3)],
  omaha: sample(4, 40000, 1), omaha8: sample(4, 40000, 2), draw5: sample(5, 40000, 3),
};
const TARGET = [0.05, 0.15, 0.3, 0.45, 0.6, 0.7, 0.78, 0.84, 0.88, 0.91, 0.94, 0.96, 0.975, 0.985, 0.993];
const out = {};
for (const [v, hands] of Object.entries(HANDS)) {
  const s = hands.map(h => score(v, h)).map(x => Math.round(x * 1e4) / 1e4).sort((a, b) => a - b);
  const N = s.length, vals = [...new Set(s)];
  const below = x => { let lo = 0, hi = N; while (lo < hi) { const m = (lo + hi) >> 1; if (s[m] < x) lo = m + 1; else hi = m; } return lo; };
  const pctOf = x => { const lo = below(x); let eq = lo; while (eq < N && s[eq] === x) eq++; return (lo + (eq - lo) / 2) / N; };
  const pts = [[vals[0], 0]];
  for (const t of TARGET) {
    let best = null;
    for (const x of vals) if (best == null || Math.abs(pctOf(x) - t) < Math.abs(pctOf(best) - t)) best = x;
    if (best > pts[pts.length - 1][0] && best < vals[vals.length - 1]) pts.push([best, +pctOf(best).toFixed(4)]);
  }
  pts.push([vals[vals.length - 1], 1]);
  out[v] = pts;
  console.error(`${v}: ${N} hands, ${vals.length} distinct scores`);
}
console.log('const PCT = {');
for (const [v, pts] of Object.entries(out)) console.log(`  ${v}: [${pts.map(([a, b]) => `[${+a.toFixed(4)}, ${b}]`).join(', ')}],`);
console.log('};');
