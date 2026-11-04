// node tests/list-scout-topic.mjs
// The topic model List Scout fits in the tab (bsky/list-scout/topic.js): on synthetic unit vectors shaped like
// Ettin's (a shared mean direction plus noise, a topic direction for the positives) it must reach the optimum of
// the balanced, L2-regularized objective, which is checked by the gradient vanishing there rather than against a
// copy of scikit-learn, and it must rank held-out posts well. Then auc() on hand-worked cases.
import { trainLogistic, predict, auc } from '../bsky/list-scout/topic.js';

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.log('FAIL', msg); } };

let seed = 1;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
const D = 64;
const mean = Float64Array.from({ length: D }, gauss), topic = Float64Array.from({ length: D }, gauss);
function make(n, frac) {
  const X = new Float32Array(n * D), y = [];
  for (let i = 0; i < n; i++) {
    const pos = rnd() < frac ? 1 : 0;
    y.push(pos);
    let s = 0;
    const v = Array.from({ length: D }, (_, k) => 2 * mean[k] + gauss() * 1.5 + (pos ? 0.9 * topic[k] : 0));
    for (const x of v) s += x * x;
    v.forEach((x, k) => { X[i * D + k] = x / Math.sqrt(s); });
  }
  return { X, y };
}

const C = 1;
const tr = make(1200, 0.3), te = make(600, 0.3);
const m = await trainLogistic(tr.X, tr.y, D, { C, iters: 600 });

// gradient of (1/n) Σ sw·logloss + |w|²/(2Cn) at the solution; sw balances the classes
const n = tr.y.length, npos = tr.y.reduce((a, v) => a + v, 0);
const p = predict(m, tr.X, D);
const g = new Float64Array(D);
let gb = 0;
for (let i = 0; i < n; i++) {
  const r = (n / (2 * (tr.y[i] ? npos : n - npos))) * (p[i] - tr.y[i]) / n;
  gb += r;
  for (let k = 0; k < D; k++) g[k] += r * tr.X[i * D + k];
}
for (let k = 0; k < D; k++) g[k] += m.w[k] / (C * n);
const gnorm = Math.hypot(...g, gb);
ok(gnorm < 1e-4, `gradient at the fitted solution is ${gnorm.toExponential(2)}, want < 1e-4`);
const a = auc(predict(m, te.X, D), te.y);
ok(a > 0.9, `held-out AUC ${a.toFixed(3)}, want > 0.9`);
// balanced weights: the mean prediction over the positives and the mean over the negatives average to 0.5
// (the unregularized bias sets the class-weighted mean prediction equal to the weighted base rate)
const meanOf = (cls) => { let s = 0, k = 0; tr.y.forEach((v, i) => { if (v === cls) { s += p[i]; k++; } }); return s / k; };
const mp = (meanOf(1) + meanOf(0)) / 2;
ok(Math.abs(mp - 0.5) < 1e-3, `class-balanced mean prediction ${mp.toFixed(4)}, want 0.5`);

ok(auc([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1]) === 0.75, 'auc on a worked case');
ok(auc([1, 1, 1], [0, 1, 1]) === 0.5, 'auc counts ties as half');
ok(auc([0.2, 0.9], [0, 1]) === 1, 'auc of a perfect ranking');
ok(Number.isNaN(auc([0.2, 0.9], [1, 1])), 'auc with one class is NaN');
let threw = false;
try { await trainLogistic(new Float32Array(2 * D), [1, 1], D); } catch (e) { threw = true; }
ok(threw, 'training on one class throws');

console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
