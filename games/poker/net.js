// A second computer player: every decision is one forward pass through a small neural network whose
// weights were all written by hand. There is no training, no data and no gradient descent; each unit below
// is placed by a line of code that says what it computes, the way weight-space programming builds a
// network (https://rikiyat.github.io/blog/weight-space-programming/).
//
// The network is a plain multilayer perceptron with ReLU units, densely connected: each layer reads the
// inputs and every earlier layer. Its inputs are one-hot cards (mine, the board, each opponent's up cards,
// and the five draw slots) and the betting situation (price, stack, position, who has bet). Its layers:
//   1 count    cards per rank and per suit: all my usable cards, mine, the board, each opponent, each slot
//   2 step     thresholds on those counts: "a pair of kings", "four hearts", "I hold a card of jack or better"
//   3 piece    hand pieces: a straight in each five-rank window, a pair that uses my card, top pair,
//              Omaha's two-plus-three rule, eight-or-better lows, the Chen formula's gaps, opponents' pairs
//   4 made     made-hand categories, draws, board texture; each game's first-round strength
//   5 ladder   "at least a pair", "at least two pair", … "quads" (a thermometer over categories)
//   6 adjust   adjustments that hold only inside a category (pair rank, top pair, kicker), draws by cards
//              to come, penalties for dangerous boards and opponents' up cards
//   7 share1   each game's estimate of its share of the pot against one opponent, gated by the game played
//   8 knots    that share as a piecewise-linear basis
//   9 share    its share against this many opponents after this much aggression (lookup tables by bucket)
//  10 decide   the decision rule: call if the share beats the price, raise above a threshold that depends
//              on how many opponents remain and on position, bluff now and then, open by position first
//  11 out      five action logits (fold, check or call, raise half pot, raise the pot, all in) and, for
//              five-card draw, a keep score for each card
// An outer function (encode) turns the table into the input vector and another (decode) turns the largest
// legal logit into a legal action and a bet size. Neither makes a poker judgement.
import { VARIANTS, RANKS, SUITS } from './rules.js';

// ---------- the network runtime ----------
// Units are added layer by layer. A unit's weights come from a sum of named terms; a name can also be a
// "signal", a fixed linear combination of earlier units (a step is two units read as their difference).
class Builder {
  constructor() { this.units = []; this.sig = new Map(); this.layers = []; this.cur = null; }
  input(name) {
    if (this.layers.length) throw new Error('inputs come first');
    return this._unit(name, 'in', new Map(), 0, '');
  }
  layer(name, note) { this.cur = { name, note, start: this.units.length, count: 0 }; this.layers.push(this.cur); }
  form(terms, bias = 0, scale = 1) {
    const m = new Map();
    let b = bias * scale;
    const add = (name, w) => {
      if (!w) return;
      const s = this.sig.get(name);
      if (!s) throw new Error('unknown signal ' + name);
      if (s.idx != null) m.set(s.idx, (m.get(s.idx) || 0) + w * scale);
      else { for (const [i, v] of s.terms) m.set(i, (m.get(i) || 0) + w * v * scale); b += w * s.bias * scale; }
    };
    if (Array.isArray(terms)) for (const [n, w] of terms) add(n, w); else for (const n in terms) add(n, terms[n]);
    return { terms: m, bias: b };
  }
  _unit(name, act, terms, bias, note) {
    if (this.sig.has(name)) throw new Error('duplicate ' + name);
    const layer = this.layers.length, idx = this.units.length;
    for (const i of terms.keys()) if (this.units[i].layer >= layer) throw new Error(`${name} reads ${this.units[i].name} from its own layer`);
    if (act !== 'in') this.cur.count++;
    this.units.push({ name, layer, act, terms, bias, note });
    this.sig.set(name, { idx });
    return name;
  }
  relu(name, terms, bias = 0, note = '') { const f = this.form(terms, bias); return this._unit(name, 'relu', f.terms, f.bias, note); }
  linear(name, terms, bias = 0, note = '') { const f = this.form(terms, bias); return this._unit(name, 'lin', f.terms, f.bias, note); }
  def(name, terms, bias = 0) {
    if (this.sig.has(name)) throw new Error('duplicate ' + name);
    this.sig.set(name, this.form(terms, bias));
    return name;
  }
  // 1 when an integer-valued sum reaches k, else 0: relu(x − k + 1) − relu(x − k).
  step(name, terms, k, note = '') {
    const f1 = this.form(terms, 1 - k), f2 = this.form(terms, -k);
    this._unit(name + '>', 'relu', f1.terms, f1.bias, note);
    this._unit(name + '=', 'relu', f2.terms, f2.bias, note);
    return this.def(name, { [name + '>']: 1, [name + '=']: -1 });
  }
  // A steep step for a real-valued sum: clamp(s·(x − t) + ½) to 0..1 (s < 0 for "below t").
  ramp(name, terms, t, s, note = '') {
    const f1 = this.form(terms, -t, s), f2 = this.form(terms, -t, s);
    this._unit(name + '>', 'relu', f1.terms, f1.bias + 0.5, note);
    this._unit(name + '=', 'relu', f2.terms, f2.bias - 0.5, note);
    return this.def(name, { [name + '>']: 1, [name + '=']: -1 });
  }
  // AND of binary signals: relu(a + b + … − (n − 1)).
  and(name, names, note = '') { return this.relu(name, names.map(n => [n, 1]), 1 - names.length, note); }
  // min(Σ, 1) for a sum of non-negative integer signals: Σ − relu(Σ − 1).
  or(name, terms, note = '') {
    this.relu(name + '>1', terms, -1, note);
    return this.def(name, [...(Array.isArray(terms) ? terms : Object.entries(terms)), [name + '>1', -1]]);
  }
  // value when the binary gate is on, else 0, for a value in [0, B]: relu(value + B·gate − B).
  gate(name, terms, g, B = 2, note = '') {
    const t = Array.isArray(terms) ? terms.slice() : Object.entries(terms);
    t.push([g, B]);
    return this.relu(name, t, -B, note);
  }
  build() {
    const N = this.units.length;
    const layers = this.layers.map((L, li) => {
      const rows = L.count, cols = L.start, b = new Float32Array(rows), act = new Uint8Array(rows);
      const ptr = [0], col = [], val = [];
      for (let r = 0; r < rows; r++) {
        const u = this.units[L.start + r];
        b[r] = u.bias; act[r] = u.act === 'relu' ? 1 : 0;
        const ks = [...u.terms.keys()].sort((x, y) => x - y);
        for (const k of ks) { const w = u.terms.get(k); if (w === 0) continue; col.push(k); val.push(w); }
        ptr.push(col.length);
      }
      return { name: L.name, note: L.note, index: li + 1, start: L.start, rows, cols, b, act,
        ptr: Int32Array.from(ptr), col: Int32Array.from(col), val: Float32Array.from(val) };
    });
    const nIn = this.layers.length ? this.layers[0].start : N;
    return { layers, nIn, size: N, names: this.units.map(u => u.name), index: new Map(this.units.map((u, i) => [u.name, i])), sig: this.sig };
  }
}

// Forward pass: the activations of every unit, inputs first. Each layer is W·a + b over everything before
// it; W is stored by its nonzero entries (dense() rebuilds the full matrix).
function forward(net, x) {
  const a = new Float32Array(net.size);
  a.set(x);
  for (const L of net.layers) {
    const { ptr, col, val, b, act, start } = L;
    for (let r = 0; r < L.rows; r++) {
      let s = b[r];
      for (let k = ptr[r]; k < ptr[r + 1]; k++) s += val[k] * a[col[k]];
      a[start + r] = act[r] && s < 0 ? 0 : s;
    }
  }
  return a;
}
// A layer's full weight matrix, rows = its units, columns = every unit before it (inputs first).
export function dense(L) {
  const W = new Float32Array(L.rows * L.cols);
  for (let r = 0; r < L.rows; r++) for (let k = L.ptr[r]; k < L.ptr[r + 1]; k++) W[r * L.cols + L.col[k]] = L.val[k];
  return W;
}
// The value of any unit or signal from the activations.
function read(net, a, name) {
  const s = net.sig.get(name);
  if (!s) throw new Error('unknown signal ' + name);
  if (s.idx != null) return a[s.idx];
  let v = s.bias;
  for (const [i, w] of s.terms) v += w * a[i];
  return v;
}

// ---------- vocabulary ----------
const R13 = [...Array(13).keys()], S4 = [0, 1, 2, 3], C52 = [...Array(52).keys()];
const RN = r => RANKS[r], SN = s => SUITS[s];
const cardName = c => RANKS[c >> 2] + SUITS[c & 3];
const CARD = (r, s) => RANKS[r] + SUITS[s];
// Five-rank windows for straights: the wheel (A-2-3-4-5), then 2–6 up to T–A.
const WIN = [[12, 0, 1, 2, 3], ...[...Array(9).keys()].map(k => [k, k + 1, k + 2, k + 3, k + 4])];
// Four in a row with room at both ends (3-4-5-6 up to T-J-Q-K), for draw discards.
const RUN4 = [...Array(8).keys()].map(k => [k + 1, k + 2, k + 3, k + 4]);
// Ace-to-five low ranks: the ace and the deuce up to a cap (index 4 = six … 6 = eight, 11 = king).
const LOW = cap => [12, ...[...Array(cap + 1).keys()]];
const LOW8 = LOW(6);
const VKEYS = ['holdem', 'omaha', 'omaha8', 'stud7', 'stud8', 'razz', 'stud5', 'draw5'];
const CTX = ['fl', 'first', 'later', 'last', 'drawing', 'tc1', 'tc2', 'tc3', 'tcn', 'facing', 'price', 'canRaise', 'spr', 'commit',
  'n1', 'n2', 'n3', 'pos', 'agg1', 'agg2', 'init', 'flopSt',
  'after0', 'after1', 'after2', 'after3', 'after4', 'after5', 'hu', 'raised0', 'raised1', 'raised2', 'limp', 'callers', 'isBB', 'cheap', 'bringin', 'noise'];
const sum = (names, w = 1) => names.map(n => [n, w]);
const CHEN = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 10];

// ---------- hand-set numbers ----------
// Share of the pot against one opponent still in the hand, by best made hand, after the first round:
//                 nothing pair  2pair trips str   flush  fh    quads
const LADDER = {
  holdem: [0.18, 0.42, 0.80, 0.86, 0.90, 0.93, 0.97, 0.99],
  stud: [0.20, 0.46, 0.72, 0.84, 0.90, 0.93, 0.97, 0.99],
  stud5: [0.30, 0.64, 0.86, 0.92, 0.95, 0.96, 0.98, 0.99],
  draw: [0.14, 0.40, 0.76, 0.85, 0.91, 0.94, 0.97, 0.99],
  omaha: [0.25, 0.42, 0.60, 0.76, 0.80, 0.86, 0.96, 0.99],
};
// Each game's first-round strength as a percentile of its score, [score, share of hands at or below].
// Written by tests/poker-net-pct.mjs, which runs the network's own score over every starting hand
// (all 1,326 in hold'em, all 22,100 three-card stud starts) or 40,000 random ones (Omaha, draw).
const PCT = {
  holdem: [[-1.5, 0], [-0.5, 0.0543], [0.5, 0.1282], [2, 0.2805], [3, 0.4223], [4.5, 0.5807], [5, 0.6697], [6, 0.7911], [6.5, 0.825], [7.5, 0.8944], [8, 0.9148], [9, 0.9449], [10, 0.9661], [11, 0.9774], [12, 0.9827], [16, 0.9932], [20, 1]],
  stud5: [[0.4, 0], [1.2, 0.0543], [2, 0.1508], [2.8, 0.2956], [3.6, 0.4887], [4, 0.6033], [4.4, 0.73], [4.8, 0.8688], [5, 0.9434], [8, 0.9615], [10.25, 0.9751], [11.75, 0.9842], [13.25, 0.9932], [14, 1]],
  stud7: [[0.75, 0], [1.05, 0.0557], [1.35, 0.1887], [1.5, 0.2919], [1.65, 0.4235], [1.8, 0.5769], [2.25, 0.6923], [3.15, 0.778], [4.25, 0.8405], [5.3, 0.8797], [6.2, 0.9102], [7.1, 0.9395], [7.95, 0.958], [8.5, 0.9776], [8.65, 0.9841], [9, 0.9911], [17, 1]],
  stud8: [[2.25, 0], [2.55, 0.0326], [2.85, 0.1425], [3.6, 0.2729], [4.05, 0.448], [5.15, 0.6019], [5.7, 0.6848], [6.4, 0.7806], [6.95, 0.8462], [7.5, 0.8818], [7.8, 0.9128], [8.4, 0.9374], [9.2, 0.9613], [9.75, 0.9754], [11.35, 0.9841], [12.9, 0.9942], [19.7, 1]],
  razz: [[-3, 0], [-1.9, 0.0716], [-1.5, 0.1516], [-0.8, 0.2716], [0.3, 0.4632], [0.7, 0.6297], [0.9, 0.6728], [1.4, 0.7575], [1.6, 0.848], [2, 0.8769], [2.5, 0.8986], [2.7, 0.9276], [2.9, 0.9566], [3.6, 1]],
  omaha: [[0, 0], [2, 0.0448], [2.8, 0.138], [3.65, 0.3126], [4.45, 0.4592], [5.45, 0.5968], [6.05, 0.7038], [6.75, 0.7826], [7.45, 0.8386], [7.95, 0.8805], [8.35, 0.9098], [9.2, 0.9404], [10.15, 0.9607], [10.85, 0.9753], [11.6, 0.985], [12.85, 0.9932], [20.05, 1]],
  omaha8: [[0.2, 0], [1.6, 0.0607], [2.4, 0.154], [3.65, 0.3015], [4.9, 0.4493], [5.8, 0.5936], [6.7, 0.6989], [7.5, 0.7807], [8.4, 0.8442], [8.95, 0.8808], [9.6, 0.9096], [10.35, 0.9394], [11.1, 0.9596], [12, 0.9752], [12.9, 0.9846], [14.15, 0.993], [20.1, 1]],
  draw5: [[0.2, 0], [0.23, 0.0394], [0.25, 0.175], [0.26, 0.3103], [0.35, 0.452], [0.45, 0.594], [0.508, 0.7038], [0.548, 0.7839], [0.58, 0.8352], [0.602, 0.8826], [0.62, 0.9149], [0.76, 0.9492], [0.83, 0.9715], [0.85, 0.982], [0.94, 0.9935], [1.16, 1]],
};
// Position ranges for the first round: raise first in with the top share of hands, by players still to
// act behind (the usual 14% from early seats to 42% in the small blind; 75% heads-up).
const OPEN = { after0: 0.14, after1: 0.42, after2: 0.3, after3: 0.22, after4: 0.17, after5: 0.14, hu: 0.75 };

// A piecewise-linear function through points, as a sum of ReLUs on a signal: flat beyond both ends.
function pwlTerms(points, prefix, b, terms) {
  const out = [];
  let prev = 0;
  for (let j = 0; j < points.length; j++) {
    const [t] = points[j];
    const slope = j + 1 < points.length ? (points[j + 1][1] - points[j][1]) / (points[j + 1][0] - t) : 0;
    const name = `${prefix}${j}`;
    b.relu(name, terms, -t);
    out.push([name, slope - prev]);
    prev = slope;
  }
  return out;
}

// ---------- the construction ----------
function construct() {
  const b = new Builder();
  // Inputs: one-hot cards, then the situation.
  for (const p of ['m', 's']) for (const c of C52) b.input(`${p}.${cardName(c)}`);
  for (let i = 0; i < 7; i++) for (const c of C52) b.input(`q${i}.${cardName(c)}`);
  for (let j = 0; j < 5; j++) for (const c of C52) b.input(`k${j}.${cardName(c)}`);
  for (const v of VKEYS) b.input('v.' + v);
  for (const n of CTX) b.input(n);

  // ---- 1: counts ----
  b.layer('count', 'Cards per rank and per suit: all my usable cards (mine and the board), mine, the board, each opponent\'s up cards, each draw slot');
  for (const r of R13) {
    b.linear(`all.${RN(r)}`, [...S4.map(s => [`m.${CARD(r, s)}`, 1]), ...S4.map(s => [`s.${CARD(r, s)}`, 1])]);
    b.linear(`my.${RN(r)}`, S4.map(s => [`m.${CARD(r, s)}`, 1]));
    b.linear(`bd.${RN(r)}`, S4.map(s => [`s.${CARD(r, s)}`, 1]));
  }
  for (const s of S4) {
    b.linear(`all.${SN(s)}`, [...R13.map(r => [`m.${CARD(r, s)}`, 1]), ...R13.map(r => [`s.${CARD(r, s)}`, 1])]);
    b.linear(`my.${SN(s)}`, R13.map(r => [`m.${CARD(r, s)}`, 1]));
    b.linear(`bd.${SN(s)}`, R13.map(r => [`s.${CARD(r, s)}`, 1]));
  }
  b.linear('nM', C52.map(c => [`m.${cardName(c)}`, 1]));
  b.linear('nS', C52.map(c => [`s.${cardName(c)}`, 1]));
  for (let i = 0; i < 7; i++) {
    for (const r of R13) b.linear(`q${i}.${RN(r)}`, S4.map(s => [`q${i}.${CARD(r, s)}`, 1]));
    for (const s of S4) b.linear(`q${i}.${SN(s)}`, R13.map(r => [`q${i}.${CARD(r, s)}`, 1]));
    b.linear(`qn${i}`, C52.map(c => [`q${i}.${cardName(c)}`, 1]));
    b.linear(`qbad${i}`, [7, 8, 9, 10, 11].flatMap(r => S4.map(s => [`q${i}.${CARD(r, s)}`, 1])));   // nines to kings: bad for a low
  }
  for (let j = 0; j < 5; j++) {
    for (const r of R13) b.linear(`k${j}.${RN(r)}`, S4.map(s => [`k${j}.${CARD(r, s)}`, 1]));
    for (const s of S4) b.linear(`k${j}.${SN(s)}`, R13.map(r => [`k${j}.${CARD(r, s)}`, 1]));
  }

  // ---- 2: thresholds ----
  b.layer('step', 'Thresholds on the counts (pairs, trips, four to a flush, my highest card) and on the situation (low stack-to-pot, a cheap price, the dice)');
  for (const r of R13) {
    const R = RN(r);
    b.step(`has.${R}`, { [`all.${R}`]: 1 }, 1);
    b.step(`pair.${R}`, { [`all.${R}`]: 1 }, 2);
    b.step(`trip.${R}`, { [`all.${R}`]: 1 }, 3);
    b.step(`quad.${R}`, { [`all.${R}`]: 1 }, 4);
    b.step(`mhas.${R}`, { [`my.${R}`]: 1 }, 1);
    b.step(`mpair.${R}`, { [`my.${R}`]: 1 }, 2);
    b.step(`shas.${R}`, { [`bd.${R}`]: 1 }, 1);
    b.step(`spair.${R}`, { [`bd.${R}`]: 1 }, 2);
    b.step(`strip.${R}`, { [`bd.${R}`]: 1 }, 3);
  }
  // A thermometer of my highest card: mge.J is 1 when I hold a jack or better.
  for (let r = 1; r < 13; r++) b.step(`mge.${RN(r)}`, R13.filter(q => q >= r).map(q => [`my.${RN(q)}`, 1]), 1);
  for (const s of S4) {
    const S = SN(s);
    b.step(`fl5.${S}`, { [`all.${S}`]: 1 }, 5);
    b.step(`fl4.${S}`, { [`all.${S}`]: 1 }, 4);
    b.step(`fl3.${S}`, { [`all.${S}`]: 1 }, 3);
    b.step(`msu.${S}`, { [`my.${S}`]: 1 }, 1);
    b.step(`msu2.${S}`, { [`my.${S}`]: 1 }, 2);
    b.step(`sfl2.${S}`, { [`bd.${S}`]: 1 }, 2);
    b.step(`sfl3.${S}`, { [`bd.${S}`]: 1 }, 3);
  }
  for (let i = 0; i < 7; i++) {
    for (const r of R13) b.relu(`qpr${i}.${RN(r)}`, { [`q${i}.${RN(r)}`]: 1 }, -1);   // 1 for a pair showing, 2 for trips
    for (const s of S4) b.step(`qf${i}.${SN(s)}`, { [`q${i}.${SN(s)}`]: 1 }, 3);
    b.step(`qup${i}`, { [`qn${i}`]: 1 }, 1);
  }
  b.step('AK2', { 'my.A': 1, 'my.K': 1 }, 2);
  // The situation, combined.
  for (const n of [1, 2, 3]) {
    b.and(`fn${n}`, ['facing', `n${n}`]);
    b.relu(`na${n}0`, { [`n${n}`]: 1, agg1: -1, agg2: -1 });
    b.and(`na${n}1`, [`n${n}`, 'agg1']);
    b.and(`na${n}2`, [`n${n}`, 'agg2']);
  }
  b.and('r1h', ['raised1', 'hu']); b.and('r2h', ['raised2', 'hu']); b.and('r1bb', ['raised1', 'isBB']);
  b.and('r0cheap', ['raised0', 'cheap']); b.and('r0limp', ['raised0', 'limp']);
  b.ramp('lowSPR', { spr: 1 }, 1.5, -4, 'stack behind under 1.5 pots');
  b.ramp('cheapP', { price: 1 }, 0.25, -20, 'price under a quarter of the pot');
  b.ramp('bigCommit', { commit: 1 }, 0.45, 20, 'calling would cost most of my stack');
  b.ramp('dice55', { noise: 1 }, 0.55, -50); b.ramp('dice65', { noise: 1 }, 0.65, -50);

  // ---- 3: hand pieces ----
  b.layer('piece', 'Hand pieces: straights per window, pairs that use my cards, top pair and overpairs, Omaha\'s two-plus-three combinations, lows, the Chen formula\'s gaps, opponents\' up-card pairs, draw-slot memberships');
  WIN.forEach((W, w) => {
    b.relu(`st.${w}`, sum(W.map(r => `has.${RN(r)}`)), -4);    // all five ranks of the window
    b.relu(`w4.${w}`, sum(W.map(r => `has.${RN(r)}`)), -3);    // with st: four or five of them
    b.relu(`sw3.${w}`, sum(W.map(r => `shas.${RN(r)}`)), -2);  // three of the window on the board
    b.relu(`mw3.${w}`, sum(W.map(r => `mhas.${RN(r)}`)), -2);  // three of my own ranks in the window
    b.step(`om2.${w}`, sum(W.map(r => `mhas.${RN(r)}`)), 2);
    b.step(`os3.${w}`, sum(W.map(r => `shas.${RN(r)}`)), 3);
    b.step(`os2.${w}`, sum(W.map(r => `shas.${RN(r)}`)), 2);
    b.relu(`w3.${w}`, sum(W.map(r => `has.${RN(r)}`)), -2);    // three to a straight (stud starts)
  });
  for (const r of R13) {
    const R = RN(r), above = R13.filter(q => q > r).map(q => [`shas.${RN(q)}`, -1]);
    b.relu(`mp.${R}`, { [`pair.${R}`]: 1, [`mhas.${R}`]: 1 }, -1, 'a pair of R that uses my card');
    b.relu(`mt.${R}`, { [`trip.${R}`]: 1, [`mhas.${R}`]: 1 }, -1);
    b.relu(`mq.${R}`, { [`quad.${R}`]: 1, [`mhas.${R}`]: 1 }, -1);
    b.relu(`tp.${R}`, [[`pair.${R}`, 1], [`mhas.${R}`, 1], ...above], -1, 'top pair or an overpair');
    b.relu(`op.${R}`, [[`mpair.${R}`, 1], [`shas.${R}`, -1], ...above], 0, 'a pocket pair above the board');
    b.relu(`ov.${R}`, [[`mhas.${R}`, 1], [`mpair.${R}`, -1], [`shas.${R}`, -1], ...above], 0, 'an unpaired card above the board');
    b.relu(`opr.${R}`, { [`mhas.${R}`]: 1, [`shas.${R}`]: 1 }, -1, 'Omaha: my rank on the board');
    b.relu(`oset.${R}`, { [`mpair.${R}`]: 1, [`shas.${R}`]: 1 }, -1, 'Omaha: a set');
    b.relu(`otr.${R}`, { [`mhas.${R}`]: 1, [`spair.${R}`]: 1 }, -1, 'Omaha: trips with the board pair');
    b.relu(`oq.${R}`, { [`mpair.${R}`]: 1, [`spair.${R}`]: 1 }, -1);
    b.relu(`oq3.${R}`, { [`mhas.${R}`]: 1, [`strip.${R}`]: 1 }, -1);
  }
  for (const s of S4) {
    const S = SN(s);
    b.relu(`flm.${S}`, { [`fl5.${S}`]: 1, [`msu.${S}`]: 1 }, -1, 'a flush that uses my card');
    b.relu(`fdm.${S}`, { [`fl4.${S}`]: 1, [`fl5.${S}`]: -1, [`msu.${S}`]: 1 }, -1, 'four to a flush, one of them mine');
    b.relu(`ofl.${S}`, { [`msu2.${S}`]: 1, [`sfl3.${S}`]: 1 }, -1, 'Omaha flush');
    b.relu(`ofd.${S}`, { [`msu2.${S}`]: 1, [`sfl2.${S}`]: 1, [`sfl3.${S}`]: -1 }, -1, 'Omaha flush draw');
    b.relu(`onut.${S}`, { [`msu2.${S}`]: 1, [`sfl3.${S}`]: 1, [`m.A${S}`]: 1 }, -2, 'Omaha nut flush');
    b.relu(`onutd.${S}`, { [`msu2.${S}`]: 1, [`sfl2.${S}`]: 1, [`sfl3.${S}`]: -1, [`m.A${S}`]: 1 }, -2);
    b.relu(`sace.${S}`, { [`msu2.${S}`]: 1, [`m.A${S}`]: 1 }, -1, 'a suited ace');
  }
  b.step('T1', sum(R13.map(r => `trip.${RN(r)}`)), 1);
  b.step('P2', sum(R13.map(r => `pair.${RN(r)}`)), 2);
  b.step('bP', sum(R13.map(r => `spair.${RN(r)}`)), 1);
  const lo = cap => sum(LOW(cap).map(r => `has.${RN(r)}`));
  b.step('L8_3', lo(6), 3); b.step('L8_4', lo(6), 4); b.step('L8_5', lo(6), 5);
  b.step('L7_5', lo(5), 5); b.step('L6_5', lo(4), 5); b.step('L5_5', lo(3), 5);
  b.step('alive8', [...lo(6), ['tcn', 1]], 5, 'enough cards to come for an eight-low');
  b.step('Lm2', sum(LOW8.map(r => `mhas.${RN(r)}`)), 2);
  b.step('Ls2', sum(LOW8.map(r => `shas.${RN(r)}`)), 2);
  b.step('Ls3', sum(LOW8.map(r => `shas.${RN(r)}`)), 3);
  b.relu('A2', { 'mhas.A': 1, 'mhas.2': 1 }, -1); b.relu('A3', { 'mhas.A': 1, 'mhas.3': 1 }, -1);
  for (let d = 1; d <= 4; d++) for (let r = 0; r + d < 13; r++) b.relu(`dist${d}.${RN(r)}`, { [`mhas.${RN(r)}`]: 1, [`mhas.${RN(r + d)}`]: 1 }, -1);
  for (let i = 0; i < 7; i++) {
    b.step(`qp${i}`, sum(R13.map(r => `qpr${i}.${RN(r)}`)), 1, 'opponent i shows a pair');
    b.relu(`qs${i}`, [[`qup${i}`, 1], [`qbad${i}`, -1], ...sum(R13.map(r => `qpr${i}.${RN(r)}`), -1)], 0, 'opponent i shows a smooth low');
    b.step(`qr${i}`, [[`qbad${i}`, 1], ...sum(R13.map(r => `qpr${i}.${RN(r)}`))], 1, 'opponent i shows a card that spoils a low');
  }
  for (let j = 0; j < 5; j++) {
    for (const r of R13) b.relu(`kp${j}.${RN(r)}`, { [`k${j}.${RN(r)}`]: 1, [`pair.${RN(r)}`]: 1 }, -1);
    for (const s of S4) b.relu(`kf${j}.${SN(s)}`, { [`k${j}.${SN(s)}`]: 1, [`fl4.${SN(s)}`]: 1 }, -1);
    b.relu(`kqj${j}`, { [`k${j}.Q`]: 1, [`k${j}.J`]: 1, AK2: -1 }, 0);
  }
  RUN4.forEach((W, w) => b.relu(`run4.${w}`, sum(W.map(r => `has.${RN(r)}`)), -3));
  b.relu('pE', { price: 1, tc1: 1, tc2: 1, tc3: 1, lowSPR: -1 }, -1, 'the price, when cards and chips are still to come');

  // ---- 4: made hands ----
  b.layer('made', 'Made-hand categories, draws and board texture; each game\'s first-round strength as a percentile');
  const mp = sum(R13.map(r => `mp.${RN(r)}`)), mt = sum(R13.map(r => `mt.${RN(r)}`));
  b.step('cat.pair', mp, 1); b.step('cat.2pair', mp, 2); b.step('cat.trips', mt, 1);
  b.step('cat.str', sum(WIN.map((_, w) => `st.${w}`)), 1);
  b.relu('cat.fh', [['T1', 10], ['P2', 10], ...mp], -20, 'trips and another pair, with my card in a pair (any value ≥ 1 reads as 1 in the ladder)');
  b.def('cat.flush', sum(S4.map(s => `flm.${SN(s)}`)));
  b.def('cat.quads', sum(R13.map(r => `mq.${RN(r)}`)));
  const exact4 = WIN.flatMap((_, w) => [[`w4.${w}`, 1], [`st.${w}`, -2]]);
  b.step('sd1', exact4, 1, 'a straight draw'); b.step('sd2', exact4, 2, 'two ways to a straight');
  b.step('wetS', sum(WIN.map((_, w) => `sw3.${w}`)), 1, 'three to a straight on the board');
  WIN.forEach((_, w) => {
    b.relu(`ostr.${w}`, { [`st.${w}`]: 1, [`om2.${w}`]: 1, [`os3.${w}`]: 1 }, -2, 'Omaha straight in window w');
    b.relu(`ow.${w}`, { [`w4.${w}`]: 1, [`st.${w}`]: -2, [`om2.${w}`]: 1, [`os2.${w}`]: 1 }, -2, 'Omaha straight draw in window w');
  });
  const opr = sum(R13.map(r => `opr.${RN(r)}`));
  b.step('o.pair', [...opr, ...sum(R13.map(r => `mpair.${RN(r)}`))], 1);
  b.step('o.2pair', opr, 2);
  b.step('o.trips', [...sum(R13.map(r => `oset.${RN(r)}`)), ...sum(R13.map(r => `otr.${RN(r)}`))], 1);
  b.relu('o.fh1', [...sum(R13.map(r => `oset.${RN(r)}`)), ['bP', 10]], -10, 'a set and a paired board (two sets alone are not a full house in Omaha)');
  b.relu('o.fh2', [...sum(R13.map(r => `otr.${RN(r)}`), 10), ...opr], -11, 'trips with the board pair and another pairing');
  b.relu('o.fh3', [...sum(R13.map(r => `strip.${RN(r)}`), 10), ...sum(R13.map(r => `mpair.${RN(r)}`))], -10, 'trips on the board and a pocket pair');
  b.relu('o.low', { L8_5: 1, Lm2: 1, Ls3: 1 }, -2, 'an Omaha eight-low: two of mine, three of the board');
  b.relu('o.nutlow', { L8_5: 1, Lm2: 1, Ls3: 1, A2: 1 }, -3);
  b.relu('o.lowdraw', { Lm2: 1, Ls2: 1, Ls3: -1, tc1: 1, tc2: 1 }, -2);
  b.relu('lpx', { Ls2: 1, Ls3: -1, tc1: 1, tc2: 1, tc3: 1 }, -1);
  const SL = [...Array(7).keys()];
  b.relu('allRough', [...sum(SL.map(i => `qr${i}`)), ...sum(SL.map(i => `qup${i}`), -1)], 1, 'razz: every live opponent shows a bad card');
  for (let j = 0; j < 5; j++) RUN4.forEach((W, w) => b.relu(`ks${j}.${w}`, [...sum(W.map(r => `k${j}.${RN(r)}`)), [`run4.${w}`, 1]], -1));
  // First-round strength scores, then their percentiles.
  const chenHigh = [...R13.filter(r => r > 0).map(r => [`mge.${RN(r)}`, CHEN[r] - CHEN[r - 1]])];
  const dist = d => R13.filter(r => r + d < 13).map(r => `dist${d}.${RN(r)}`);
  b.def('score.holdem', [...chenHigh,
    ...R13.map(r => [`mpair.${RN(r)}`, Math.max(5, 2 * CHEN[r]) - CHEN[r] + 5]),   // a pair: doubled (at least 5), and no gap penalty
    ...S4.map(s => [`msu2.${SN(s)}`, 2]),
    ...sum(dist(1), 5), ...sum(dist(2), 4), ...sum(dist(3), 3), ...sum(dist(4), 1),
    ...sum(R13.filter(r => r + 1 <= 9).map(r => `dist1.${RN(r)}`), 1), ...sum(R13.filter(r => r + 2 <= 9).map(r => `dist2.${RN(r)}`), 1),
  ], CHEN[0] - 5);
  const omahaBase = [
    ...R13.map(r => [`mpair.${RN(r)}`, 1.5 + 0.35 * r]),
    ...S4.map(s => [`msu2.${SN(s)}`, 1.2]), ...S4.map(s => [`sace.${SN(s)}`, 1.5]),
    ...WIN.map((_, w) => [`mw3.${w}`, 0.8]),
  ];
  b.def('score.omaha', [...omahaBase, ...[8, 9, 10, 11, 12].map(r => [`mhas.${RN(r)}`, 0.4 * (r - 7)])]);
  b.def('score.omaha8', [...omahaBase, ...sum(LOW8.map(r => `mhas.${RN(r)}`), 1), ['A2', 2.5], ['A3', 1.2], ['mhas.A', 1.5],
    ...[7, 8, 9, 10].map(r => [`mhas.${RN(r)}`, -0.8])]);
  const studBase = [
    ...R13.map(r => [`trip.${RN(r)}`, 8]),
    ...R13.map(r => [`pair.${RN(r)}`, 3 + 0.35 * r]),
    ...S4.map(s => [`fl3.${SN(s)}`, 2]),
    ...WIN.map((_, w) => [`w3.${w}`, 0.6]),
    ...R13.filter(r => r > 0).map(r => [`mge.${RN(r)}`, 0.15]),
  ];
  b.def('score.stud7', studBase);
  b.def('score.stud5', [...R13.map(r => [`pair.${RN(r)}`, 5 + 0.35 * r]), ...R13.filter(r => r > 0).map(r => [`mge.${RN(r)}`, 0.4])]);
  b.def('score.stud8', [...studBase, ...sum(LOW8.map(r => `has.${RN(r)}`), 1.2), ['has.A', 1.5]]);
  b.def('score.razz', [...sum(LOW8.map(r => `has.${RN(r)}`), 1.8), ...sum(LOW(3).map(r => `has.${RN(r)}`), 0.4), ['nM', -1],
    ['has.6', -0.3], ['has.7', -0.5], ['has.8', -0.7]]);   // distinct low cards count; sixes to eights make a rougher low
  const pctNow = {};
  for (const v of ['holdem', 'omaha', 'omaha8', 'stud7', 'stud8', 'razz', 'stud5']) pctNow[v] = pwlTerms(PCT[v], `pk.${v}.`, b, [[`score.${v}`, 1]]);

  // ---- 5: ladder ----
  b.layer('ladder', 'At least a pair, at least two pair, … at least quads: a thermometer over the made-hand categories (any five cards, and Omaha\'s two plus three)');
  const ladder = (p, cats) => cats.forEach((_, k) => b.or(`${p}ge${k + 1}`, cats.slice(k).flat()));
  ladder('', [[['cat.pair', 1]], [['cat.2pair', 1]], [['cat.trips', 1]], [['cat.str', 1]], [['cat.flush', 1]], [['cat.fh', 1]], [['cat.quads', 1]]]);
  ladder('o.', [[['o.pair', 1]], [['o.2pair', 1]], [['o.trips', 1]], sum(WIN.map((_, w) => `ostr.${w}`)),
    sum(S4.map(s => `ofl.${SN(s)}`)), [['o.fh1', 1], ['o.fh2', 1], ['o.fh3', 1]], [...sum(R13.map(r => `oq.${RN(r)}`)), ...sum(R13.map(r => `oq3.${RN(r)}`))]]);
  const ow = sum(WIN.map((_, w) => `ow.${w}`));
  b.step('ow1', ow, 1); b.step('ow2', ow, 2); b.step('ow3', ow, 3);
  b.relu('vlp', { 'v.omaha8': 1, Ls3: 1, lpx: 1 }, -1, 'Omaha hi-lo with a low possible');
  b.relu('vnlp', { 'v.omaha8': 1, Ls3: -1, lpx: -1 }, 0, 'Omaha hi-lo with no low possible');
  for (const v of ['holdem', 'omaha', 'omaha8', 'stud7', 'stud8', 'razz', 'stud5']) b.gate(`fs.${v}`, pctNow[v], `v.${v}`, 1);

  // ---- 6: adjustments ----
  b.layer('adjust', 'Adjustments inside a category (pair rank, top pair, high cards), draws by cards to come, penalties for dangerous boards and up cards');
  const onlyPair = [['ge1', 1], ['ge2', -1]];
  const rankW = (w, name) => R13.map(r => [`${name}.${RN(r)}`, w * r]);
  const highW = w => R13.filter(r => r > 0).map(r => [`mge.${RN(r)}`, w]);
  b.relu('adj.hp', [...rankW(0.01, 'mp'), ...sum(R13.map(r => `tp.${RN(r)}`), 0.12), ...sum(R13.map(r => `op.${RN(r)}`), 0.05), ...onlyPair], -1, 'hold\'em: pair rank, top pair, overpair');
  b.relu('adj.hn', [...sum(R13.map(r => `ov.${RN(r)}`), 0.05), ['ge1', -1]], 0, 'hold\'em: overcards with no pair');
  b.relu('adj.sp', [...rankW(0.012, 'mp'), ...onlyPair], -1, 'stud: pair rank');
  b.relu('adj.sn', [...highW(0.012), ['ge1', -1]], 0, 'stud: high card');
  b.relu('adj.sd', { nM: 0.04, ge2: -1 }, -0.12, 'stud: a pair or less is worth less with each card dealt');
  b.relu('adj.5p', [...rankW(0.015, 'mp'), ...onlyPair], -1);
  b.relu('adj.5n', [...highW(0.018), ['ge1', -1]], 0);
  b.relu('adj.dp', [...rankW(0.018, 'mp'), ...onlyPair], -1, 'draw: pair rank');
  b.relu('adj.dn', [...highW(0.01), ['ge1', -1]], 0);
  b.relu('pen.wF', [...sum(S4.map(s => `sfl3.${SN(s)}`)), ['ge5', -1]], 0, 'three of a suit on the board, no flush');
  b.relu('pen.wS', { wetS: 1, ge4: -1 }, 0, 'three to a straight on the board, no straight');
  b.relu('pen.tP', [...sum([...Array(7).keys()].map(i => `qp${i}`)), ['ge3', -7]], 0, 'opponents showing a pair, me below trips');
  b.relu('pen.tF', [...sum([...Array(7).keys()].flatMap(i => S4.map(s => `qf${i}.${SN(s)}`))), ['ge5', -7]], 0, 'opponents showing three to a flush');
  const fd = sum(S4.map(s => `fdm.${SN(s)}`));
  for (const t of ['tc1', 'tc2', 'tc3', 'drawing']) {
    b.relu(`fd.${t}`, [...fd, [t, 1]], -1);
    b.relu(`sd1.${t}`, { sd1: 1, [t]: 1 }, -1);
    b.relu(`sd2.${t}`, { sd2: 1, [t]: 1 }, -1);
  }
  b.relu('opn.bp', { bP: 1, 'o.ge6': -1 }, 0); b.relu('opn.wF', [...sum(S4.map(s => `sfl3.${SN(s)}`)), ['o.ge5', -1]], 0); b.relu('opn.wS', { wetS: 1, 'o.ge4': -1 }, 0);
  const ofd = sum(S4.map(s => `ofd.${SN(s)}`)), onfd = sum(S4.map(s => `onutd.${SN(s)}`));
  for (const t of ['tc1', 'tc2']) {
    b.relu(`ofd.${t}`, [...ofd, [t, 1]], -1); b.relu(`onfd.${t}`, [...onfd, [t, 1]], -1);
    for (const k of [1, 2, 3]) b.relu(`ow${k}.${t}`, { [`ow${k}`]: 1, [t]: 1 }, -1);
  }
  b.relu('lo8s', [...sum(LOW8.map(r => `has.${RN(r)}`), 0.12), ['L8_5', 0.18], ['L7_5', 0.1], ['L6_5', 0.05], ['alive8', 0.6]], -0.7, 'stud hi-lo: share of the low half');
  for (let j = 0; j < 5; j++) {
    const paired = sum(R13.map(r => `kp${j}.${RN(r)}`)), f4j = sum(S4.map(s => `kf${j}.${SN(s)}`)), r4j = sum(RUN4.map((_, w) => `ks${j}.${w}`));
    const f4 = sum(S4.map(s => `fl4.${SN(s)}`)), r4 = sum(RUN4.map((_, w) => `run4.${w}`));
    b.relu(`keep.made${j}`, [['ge4', 1]], 0);
    b.relu(`keep.pair${j}`, paired, 0);
    b.relu(`keep.fl${j}`, [...f4j, ['ge1', -1]], 0);
    b.relu(`keep.run${j}`, [...r4j, ['ge1', -1], ...sum(f4.map(x => x[0]), -1)], 0);
    b.relu(`keep.hi${j}`, [[`k${j}.A`, 1], [`k${j}.K`, 1], [`kqj${j}`, 1], ['ge1', -1], ...sum(f4.map(x => x[0]), -1), ...sum(r4.map(x => x[0]), -1)], 0);
  }

  // ---- 7: share against one opponent, per game ----
  b.layer('share1', 'Each game\'s estimate of its share of the pot against one opponent still in the hand, gated by the game being played; strong draws');
  const ladderTerms = (vals, p = '') => vals.slice(1).map((v, k) => [`${p}ge${k + 1}`, v - vals[k]]);
  const E1 = {};
  E1.holdem = [...ladderTerms(LADDER.holdem), ['adj.hp', 1], ['adj.hn', 1],
    ['fd.tc2', 0.17], ['fd.tc1', 0.09], ['sd1.tc2', 0.07], ['sd2.tc2', 0.07], ['sd1.tc1', 0.035], ['sd2.tc1', 0.035],
    ['pen.wF', -0.08], ['pen.wS', -0.05]];
  E1.stud = [...ladderTerms(LADDER.stud), ['adj.sp', 1], ['adj.sn', 1], ['adj.sd', -1], ['pen.tP', -0.07], ['pen.tF', -0.04],
    ['fd.tc3', 0.2], ['fd.tc2', 0.14], ['fd.tc1', 0.08], ['sd1.tc3', 0.06], ['sd2.tc3', 0.08], ['sd1.tc2', 0.04], ['sd2.tc2', 0.06], ['sd1.tc1', 0.02], ['sd2.tc1', 0.04]];
  E1.stud5 = [...ladderTerms(LADDER.stud5), ['adj.5p', 1], ['adj.5n', 1], ['pen.tP', -0.08]];
  E1.draw = [...ladderTerms(LADDER.draw), ['adj.dp', 1], ['adj.dn', 1], ['fd.drawing', 0.12], ['sd2.drawing', 0.1], ['sd1.drawing', 0.03]];
  E1.omaha = [...ladderTerms(LADDER.omaha, 'o.'), ...S4.map(s => [`onut.${SN(s)}`, 0.1]),
    ['ofd.tc2', 0.14], ['ofd.tc1', 0.07], ['onfd.tc2', 0.06], ['onfd.tc1', 0.04],
    ['ow1.tc2', 0.05], ['ow2.tc2', 0.05], ['ow3.tc2', 0.05], ['ow1.tc1', 0.025], ['ow2.tc1', 0.025], ['ow3.tc1', 0.025],
    ['opn.bp', -0.1], ['opn.wF', -0.08], ['opn.wS', -0.05]];
  E1.olo = [['o.low', 0.62], ['o.nutlow', 0.33], ['o.lowdraw', 0.2]];
  E1.razz = [...sum(LOW8.map(r => `has.${RN(r)}`), 0.14), ['nM', -0.14], ['nS', -0.14], ['L7_5', 0.08], ['L6_5', 0.06], ['L5_5', 0.05],
    ...sum([...Array(7).keys()].map(i => `qs${i}`), -0.05), ['allRough', 0.12]];
  const withBias = (terms, bias) => [...terms, ['one', bias]];
  b.def('one', [], 1);
  const half = t => t.map(([n, w]) => [n, w / 2]);
  // The high hand's share (or the whole pot's, in a game with one winner) and, in the hi-lo games, the low
  // hand's share of the low half. Each half goes through the table on its own: a nut low keeps its half of
  // the pot however many players stay in.
  b.gate('g.holdem', withBias(E1.holdem, LADDER.holdem[0]), 'v.holdem');
  b.gate('g.stud7', withBias(E1.stud, LADDER.stud[0]), 'v.stud7');
  b.gate('g.stud8', withBias(E1.stud, LADDER.stud[0]), 'v.stud8');
  b.gate('g.razz', withBias(E1.razz, 0.45 + 0.28), 'v.razz');
  b.gate('g.stud5', withBias(E1.stud5, LADDER.stud5[0]), 'v.stud5');
  b.gate('g.draw5', withBias(E1.draw, LADDER.draw[0]), 'v.draw5');
  b.gate('g.omaha', withBias(E1.omaha, LADDER.omaha[0]), 'v.omaha');
  b.gate('g.omaha8', withBias(E1.omaha, LADDER.omaha[0]), 'v.omaha8');
  b.def('E1', sum(['g.holdem', 'g.stud7', 'g.stud8', 'g.razz', 'g.stud5', 'g.draw5', 'g.omaha', 'g.omaha8']));
  b.gate('gl.stud8', [['lo8s', 1]], 'v.stud8');
  b.gate('gl.omaha8', E1.olo, 'vlp');
  b.def('EL', sum(['gl.stud8', 'gl.omaha8']));
  // Buckets of opponents × aggression, split by whether the pot is split high and low.
  for (const n of [1, 2, 3]) for (const a of [0, 1, 2]) {
    b.relu(`nh${n}${a}`, { [`na${n}${a}`]: 1, 'v.stud8': -1, vlp: -1 }, 0);
    b.relu(`ns${n}${a}`, { [`na${n}${a}`]: 1, 'v.stud8': 1, vlp: 1 }, -1);
  }
  b.def('score.draw5', withBias(E1.draw, LADDER.draw[0]));
  const pctDraw = pwlTerms(PCT.draw5, 'pk.draw5.', b, [['score.draw5', 1]]);
  b.or('dstrong', [['fd.tc1', 1], ['fd.tc2', 1], ['fd.tc3', 1], ['sd2.tc1', 1], ['sd2.tc2', 1], ['sd2.tc3', 1], ['ofd.tc1', 1], ['ofd.tc2', 1], ['ow2.tc1', 1], ['ow2.tc2', 1]], 'a strong draw with cards to come');
  for (let j = 0; j < 5; j++) b.linear(`keep${j}`, [[`keep.made${j}`, 2], [`keep.pair${j}`, 2], [`keep.fl${j}`, 1], [`keep.run${j}`, 1], [`keep.hi${j}`, 1]], 0, 'keep card j at the draw (above ½)');

  // ---- 8: knots ----
  b.layer('knots', 'The high (or whole) and low shares against one opponent on a piecewise-linear basis; five-card draw\'s first-round percentile');
  const KN = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  KN.forEach((t, j) => b.relu(`ek${j}`, { E1: 1 }, -t));
  KN.forEach((t, j) => b.relu(`el${j}`, { EL: 1 }, -t));
  b.gate('fs.draw5', pctDraw, 'v.draw5', 1);
  b.def('FS', sum(['holdem', 'omaha', 'omaha8', 'stud7', 'stud8', 'razz', 'stud5', 'draw5'].map(v => `fs.${v}`)));

  // ---- 9: share against the table ----
  b.layer('share', 'The share of the pot against this many opponents after this much betting from them: E^k, with k = opponents + 0.6 × aggression, one table per bucket, and a table for each half of a split pot');
  const qTerms = (k, knot, w = 1) => {
    // Interpolate w · E^k at the knots (flat beyond 1) as a sum of the knot units.
    const f = e => w * Math.pow(Math.min(1, e), k), out = [];
    let prev = 0;
    for (let j = 0; j < KN.length; j++) {
      const slope = j + 1 < KN.length ? (f(KN[j + 1]) - f(KN[j])) / (KN[j + 1] - KN[j]) : 0;
      out.push([`${knot}${j}`, slope - prev]); prev = slope;
    }
    return out;
  };
  // In a split pot each opponent mostly chases one half, so about (n + 1) / 2 of them contest each half; the
  // high hand is worth 0.6 of the pot rather than half, for the times nobody makes a low and it scoops.
  const qs = [];
  for (const n of [1, 2, 3]) for (const a of [0, 1, 2]) {
    // Betting strengthens the bettor's range, not everyone's: aggression adds to the exponent once.
    const nn = n === 3 ? 3.5 : n, k = nn + 0.6 * a, kh = Math.max(1, (nn + 1) / 2) + 0.6 * a;
    qs.push(b.gate(`q${n}${a}`, qTerms(k, 'ek'), `nh${n}${a}`, 1));
    qs.push(b.gate(`qh${n}${a}`, qTerms(kh, 'ek', 0.6), `ns${n}${a}`, 1));
    qs.push(b.gate(`ql${n}${a}`, qTerms(kh, 'el', 0.5), `ns${n}${a}`, 1));
  }
  b.def('Q', sum(qs));

  // ---- 10: decide ----
  b.layer('decide', 'The decision rule: margins of the share over the price and over the betting thresholds, bluffs, and the first-round rules by position');
  const Cl = [['Q', 8], ['price', -8], ['pE', 1.2], ['facing', -0.24]];
  const neg = t => t.map(([n, w]) => [n, -w]);
  b.relu('Cl+', [...Cl, ['first', -20]], 0, 'later rounds: share minus price, when positive');
  b.relu('Cl-', [...neg(Cl), ['first', -20]], 0);
  const callT = [['raised0', 0.99], ['r0cheap', -0.44], ['r0limp', -0.22], ['raised1', 0.845], ['r1h', -0.235], ['r1bb', -0.06], ['cheapP', -0.05],
    ['raised2', 0.935], ['r2h', -0.095], ['callers', 0.02], ['bigCommit', 0.08]];
  const Cf = [['FS', 6], ['noise', 0.18], ...callT.map(([n, w]) => [n, -6 * w])];
  b.relu('Cf+', [...Cf, ['later', -20]], -0.09, 'first round: strength above the calling threshold');
  b.relu('Cf-', [...neg(Cf), ['later', -20]], 0.09);
  const theta = [['n1', 0.56], ['n2', 0.4], ['n3', 0.3], ['fn1', 0.12], ['fn2', 0.12], ['fn3', 0.12], ['pos', -0.03]];
  b.relu('vS', [['Q', 1], ...neg(theta), ['first', -2]], -0.03, 'share above the bet (or raise) threshold');
  b.relu('vL', [['Q', 1], ...neg(theta), ['first', -2]], -0.2, 'share well above it');
  b.relu('jam', { Q: 1, lowSPR: 1, first: -2 }, -1.55, 'little behind and a good share');
  b.relu('cbet', { init: 1, flopSt: 1, n1: 1, dice55: 1, facing: -1, first: -2 }, -3, 'continuation bet heads-up, about half the time');
  b.relu('semi', { dstrong: 1, dice65: 1, facing: -1, first: -2 }, -1, 'bet a strong draw, about two times in three');
  const openT = Object.entries(OPEN).map(([k, sh]) => [k, -(1 - sh)]);
  b.relu('open', [['FS', 1], ['noise', 0.03], ...openT, ['raised1', -2], ['raised2', -2], ['later', -2]], -0.015, 'raise first in: strength above the position threshold');
  b.relu('re', [['FS', 1], ['noise', 0.03], ['raised1', -0.965], ['raised2', -0.98], ['r1h', 0.055], ['r2h', 0.03], ['raised0', -2], ['later', -2]], -0.015, 're-raise');
  b.relu('shove', { FS: 1, lowSPR: 1, later: -2 }, -1.9, 'first round, short: all in with the top tenth');

  // ---- 11: out ----
  b.layer('out', 'Action logits: fold, check or call, raise half the pot, raise the pot, all in (the largest legal one is played); keep scores at the draw');
  const Cplus = [['Cl+', 1], ['Cf+', 1]];
  // Slopes are steep and the biases small, so a bias only breaks ties toward the passive action.
  const R = [['vS', 25], ['cbet', 1.5], ['semi', 1.2], ['open', 40], ['re', 40], ['later', -0.25], ['first', -0.1]];
  const Rl = [['vL', 25], ['later', -0.3], ['first', -1]];
  const J = [['jam', 25], ['shove', 30], ['later', -0.4], ['first', -1]];
  b.linear('out.fold', [], 0);
  b.linear('out.call', [['Cl+', 1], ['Cl-', -1], ['Cf+', 1], ['Cf-', -1]]);
  b.linear('out.raiseS', [...Cplus, ...R]);
  b.linear('out.raiseL', [...Cplus, ...R, ...Rl]);
  b.linear('out.allin', [...Cplus, ...R, ...Rl, ...J]);
  for (let j = 0; j < 5; j++) b.linear(`out.keep${j}`, [[`keep${j}`, 1]]);
  return b;
}

const BUILDER = construct();
export const NET = BUILDER.build();
// Every weight and bias, the zeros included, and the ones that are not zero.
NET.params = NET.layers.reduce((x, L) => x + L.rows * L.cols + L.rows, 0);
NET.nonzero = NET.layers.reduce((x, L) => x + L.val.length + L.b.reduce((k, v) => k + (v !== 0), 0), 0);
NET.units = NET.layers.reduce((x, L) => x + L.rows, 0);

// ---------- encoding the table ----------
function lastStreet(V, street) {
  if (V.kind === 'board') return street >= 3;
  if (V.kind === 'draw') return street >= 1;
  return street >= V.streets.length - 1;
}
function totalCards(V) { return V.kind === 'board' ? V.hole : V.kind === 'draw' ? 5 : V.streets.join('').length; }
function inPosition(view) {
  const V = VARIANTS[view.variant];
  if (V.kind === 'stud') return false;
  const n = view.players.length;
  let last = -1, bestD = -1;
  for (const p of view.players) {
    if (!p || p.folded) continue;
    const d = (p.seat - view.button - 1 + n) % n;
    if (d > bestD) { bestD = d; last = p.seat; }
  }
  return last === view.seat;
}

// The input vector for one decision, and what decode needs for bet sizes.
export function encode(view, o, rand = Math.random) {
  const x = new Float32Array(NET.nIn);
  const set = (name, v = 1) => { const i = NET.index.get(name); if (i == null) throw new Error('no input ' + name); x[i] = v; };
  const V = VARIANTS[view.variant];
  const me = view.players[view.seat];
  for (const c of me.cards) if (c.c != null) set('m.' + cardName(c.c));
  for (const c of view.board) set('s.' + cardName(c));
  const n = view.players.length;
  if (V.kind === 'stud') {
    let i = 0;
    for (let k = 1; k < n && i < 7; k++) {
      const p = view.players[(view.seat + k) % n];
      if (!p || p.folded) continue;
      for (const c of p.cards) if (c.c != null) set(`q${i}.${cardName(c.c)}`);
      i++;
    }
  }
  set('v.' + view.variant);
  if (o && o.kind === 'draw') { o.cards.forEach((c, j) => set(`k${j}.${cardName(c)}`)); return { x, info: { draw: true } }; }
  const street = view.street, first = street === 0;
  set('fl', view.structure === 'fl' ? 1 : 0);
  set(first ? 'first' : 'later');
  if (lastStreet(V, street)) set('last');
  const myN = me.cards.length;
  const toCome = V.kind === 'board' ? 5 - view.board.length : V.kind === 'stud' ? Math.max(0, totalCards(V) - myN - view.board.length) : 0;
  if (V.kind === 'draw' && street === 0) set('drawing');
  if (toCome >= 3) set('tc3'); else if (toCome === 2) set('tc2'); else if (toCome === 1) set('tc1');
  set('tcn', toCome);
  const facing = o.call > 0 && o.bringIn == null;
  if (facing) set('facing');
  set('price', o.call > 0 ? o.call / (o.pot + o.call) : 0);
  if (o.raise) set('canRaise');
  set('spr', Math.min(20, Math.max(0, (o.stack - o.call) / Math.max(1, o.pot + o.call))));
  set('commit', o.stack > 0 ? o.call / o.stack : 1);
  const opps = view.players.filter(p => p && p.seat !== view.seat && !p.folded);
  set(opps.length >= 3 ? 'n3' : opps.length === 2 ? 'n2' : 'n1');
  if (inPosition(view)) set('pos');
  // Opponents' bets and raises this round and earlier, and who bet last in each round.
  let st = 0, rNow = 0, rPrev = 0;
  const lastBet = [];
  for (const e of view.events) {
    if (e.t === 'street' && e.street > 0) { st = e.street; continue; }
    if (e.t !== 'bet' && e.t !== 'raise') continue;
    lastBet[st] = e.seat;
    if (e.seat === view.seat) continue;
    if (st === street) rNow++; else rPrev++;
  }
  const pat = V.kind === 'draw' && street >= 1 ? opps.filter(p => p.drew === 0).length : 0;
  // Aggression: a bet this round counts 2, a raise on top of it 2 more, each earlier bet or raise 1, each
  // opponent standing pat at the draw 2. One bet after a first-round raise (a continuation bet) is bucket 1;
  // a raise this round, or a bet after two earlier raises, is bucket 2.
  const g = 2 * Math.min(rNow, 2) + Math.min(rPrev, 2) + 2 * pat;
  if (g >= 4) set('agg2'); else if (g >= 1) set('agg1');
  if (street > 0 && lastBet[street - 1] === view.seat) set('init');
  if (street === 1) set('flopSt');
  // The first round: raises so far, limpers, callers, position, blinds (as the first-round bot reads them).
  let raises = 0, limpers = 0, callers = 0;
  for (const e of view.events) {
    if (e.t === 'street' && e.street > 0) break;
    if (e.t === 'bet' || e.t === 'raise') { raises++; callers = 0; } else if (e.t === 'call') { if (raises === 0) limpers++; else callers++; }
  }
  const live = view.players.filter(q => q && !q.folded && !q.allIn);
  const order = live.map(q => q.seat).sort((a, c) => ((a - view.button - 1 + n) % n) - ((c - view.button - 1 + n) % n));
  let after;
  if (V.forced === 'blinds' && raises === 0) {
    const pre = order.filter(s => s !== view.bb), seq = view.bb != null && live.some(q => q.seat === view.bb) ? pre.concat(view.bb) : pre;
    after = seq.length - 1 - seq.indexOf(view.seat);
  } else after = Math.max(0, live.length - 1);
  const heads = live.length + view.players.filter(q => q && q.allIn).length === 2;
  if (first) {
    if (heads) set('hu'); else set('after' + Math.min(5, Math.max(0, after)));
    set(raises === 0 ? 'raised0' : raises === 1 ? 'raised1' : 'raised2');
    if (limpers) set('limp');
    set('callers', Math.min(3, callers));
    if (view.seat === view.bb) set('isBB');
    if (o.call <= view.stakes.bb / 2 && o.toCall > 0) set('cheap');
    if (o.bringIn != null) set('bringin');
  }
  set('noise', rand());
  return { x, info: { first, raises, limpers, callers, after, heads } };
}

// ---------- decoding the output ----------
const ACTS = ['fold', 'call', 'raiseS', 'raiseL', 'allin'];
function decode(a, view, o, info) {
  if (info.draw) {
    const discard = o.cards.filter((_, j) => read(NET, a, `out.keep${j}`) < 0.5);
    return { type: 'draw', discard };
  }
  const L = ACTS.map(k => read(NET, a, 'out.' + k));
  let best = 0;
  for (let i = 1; i < L.length; i++) if ((i < 2 || o.raise) && L[i] > L[best]) best = i;
  const passive = () => (o.canCheck ? { type: 'check' } : o.bringIn != null ? { type: 'bringin' } : { type: 'fold' });
  if (best === 0) return passive();
  if (best === 1) return o.canCheck ? { type: 'check' } : o.bringIn != null ? { type: 'bringin' } : { type: 'call' };
  const { min, max, fixed } = o.raise;
  if (fixed || min === max) return { type: 'raise', to: min };
  const bb = view.stakes.bb, unit = Math.max(1, Math.round(bb / 2));
  let to;
  if (ACTS[best] === 'allin') to = max;
  else if (info.first) {
    // The usual sizes: open to 2.5 big blinds plus one per limper, re-raise to about three times.
    to = info.raises === 0 ? bb * 2.5 + info.limpers * bb
      : o.currentBet * (info.raises >= 2 ? 2.3 : info.after > 0 ? 3.5 : 3) + info.callers * o.currentBet;
  } else to = o.currentBet + (ACTS[best] === 'raiseS' ? 0.5 : 1) * (o.pot + o.call);
  to = Math.max(min, Math.min(max, Math.round(to / unit) * unit));
  if (to >= max * 0.7) to = max;
  return { type: 'raise', to };
}

// ---------- the player ----------
export const NET_STYLE = { key: 'net', name: 'Hand-wired network' };

// The bot's action for a question (options from hand.options(seat)), from one forward pass.
export function netAct(view, o) {
  if (!o) return null;
  const { x, info } = encode(view, o);
  return decode(forward(NET, x), view, o, info);
}

// The network's named quantities for one decision, for tests and for reading what it thought.
export function explain(view, o, names = ['E1', 'Q', 'FS', 'out.fold', 'out.call', 'out.raiseS', 'out.raiseL', 'out.allin']) {
  const { x, info } = encode(view, o);
  const a = forward(NET, x);
  const out = {};
  for (const n of names) out[n] = read(NET, a, n);
  out.action = decode(a, view, o, info);
  return out;
}
// For the design scripts: run the network on a raw input vector and read signals.
export function probe(x, names) {
  const a = forward(NET, x);
  return Object.fromEntries(names.map(n => [n, read(NET, a, n)]));
}
export const inputIndex = name => NET.index.get(name);
