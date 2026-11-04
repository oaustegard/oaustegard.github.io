// The topic model List Scout learns in the tab: a logistic regression on Ettin-17m unit vectors that separates
// posts containing a search term from a background sample of Bluesky's Discover feed. Classes are weighted to
// count equally and the bias is not regularized, as in scikit-learn's LogisticRegression(C, class_weight=
// 'balanced'); Nesterov-accelerated gradient descent gets within rounding of its solution on a few thousand
// posts in about a second. No DOM here, so node can test it (tests/list-scout-topic.mjs).

// X: Float32Array of n rows of D, y: 0/1 per row. Returns { w: Float32Array(D), b }.
export async function trainLogistic(X, y, D, { C = 1, iters = 600, onIter } = {}) {
  const n = y.length;
  const npos = y.reduce((a, v) => a + v, 0);
  if (!npos || npos === n) throw new Error('need examples of both classes');
  const sw = Float64Array.from(y, (v) => n / (2 * (v ? npos : n - npos)));
  // objective: (1/n) Σ sw·logloss + |w|² / (2Cn). Rows are unit vectors, so with the bias column every row has
  // squared norm 2 and the gradient's Lipschitz constant is at most max(sw)·2/4 + 1/(Cn).
  const reg = 1 / (C * n);
  const step = 1 / (Math.max(...sw) / 2 + reg);
  let w = new Float64Array(D), b = 0, vw = new Float64Array(D), vb = 0, t = 1;
  const z = new Float64Array(n), g = new Float64Array(D);
  for (let it = 0; it < iters; it++) {
    // gradient at the look-ahead point (vw, vb)
    g.fill(0);
    let gb = 0;
    for (let i = 0; i < n; i++) {
      let s = vb;
      const o = i * D;
      for (let k = 0; k < D; k++) s += vw[k] * X[o + k];
      z[i] = sw[i] * (1 / (1 + Math.exp(-s)) - y[i]) / n;
      gb += z[i];
    }
    for (let i = 0; i < n; i++) {
      const zi = z[i], o = i * D;
      if (zi !== 0) for (let k = 0; k < D; k++) g[k] += zi * X[o + k];
    }
    const t1 = (1 + Math.sqrt(1 + 4 * t * t)) / 2, mom = (t - 1) / t1;
    const nb = vb - step * gb;
    for (let k = 0; k < D; k++) {
      const nw = vw[k] - step * (g[k] + reg * vw[k]);
      vw[k] = nw + mom * (nw - w[k]);
      w[k] = nw;
    }
    vb = nb + mom * (nb - b); b = nb; t = t1;
    if (onIter && it % 50 === 49) await onIter(it + 1, iters);
  }
  return { w: Float32Array.from(w), b };
}

export function predict(model, X, D) {
  const n = X.length / D, out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = model.b;
    for (let k = 0; k < D; k++) s += model.w[k] * X[i * D + k];
    out[i] = 1 / (1 + Math.exp(-s));
  }
  return out;
}

// Area under the ROC curve, ties counted as half.
export function auc(scores, y) {
  const idx = Array.from(scores.keys()).sort((a, b) => scores[a] - scores[b]);
  let sumPos = 0, npos = 0;
  for (let i = 0; i < idx.length;) {
    let j = i;
    while (j < idx.length && scores[idx[j]] === scores[idx[i]]) j++;
    const r = (i + j + 1) / 2;                       // mean 1-based rank of the tie group
    for (let k = i; k < j; k++) if (y[idx[k]]) { sumPos += r; npos++; }
    i = j;
  }
  const nneg = idx.length - npos;
  return npos && nneg ? (sumPos - npos * (npos + 1) / 2) / (npos * nneg) : NaN;
}

// A whole-word, case-insensitive match for any of the terms, as Bluesky's phrase search matches them.
export function termMatcher(terms) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}_])(?:${terms.map(esc).join('|')})(?![\\p{L}\\p{N}_])`, 'iu');
}
