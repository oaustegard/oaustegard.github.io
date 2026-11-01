// The computer player. It sees only what a person in its seat would see (`hand.view(seat)`), plus a
// TableModel of how each player has played in earlier hands, built from public information only.
//
// A decision has three parts:
//  1. analyze(): a Monte Carlo estimate of its share of the pot. Unseen cards are dealt at random many
//     times, but each deal is weighted by how well the opponents' sampled hands fit what they did this
//     hand: a player who raised is unlikely to hold a weak hand, one who checked is less likely to hold
//     a monster. The same pass estimates the share against only the hands that would call a bet.
//  2. The expected chips of each action: check or call (the share of the pot, discounted out of
//     position and for the price on early streets), and bets or raises of several sizes, counting the
//     chance that everyone folds (from each opponent's fold-to-bet rate, the size, and their own
//     aggression this hand) and the share against the calling hands when they do not.
//  3. A style: how tight, aggressive and bluff-prone the player is, and how much it adapts to the
//     model. The choice is a soft maximum over the actions, so close calls vary.
import { VARIANTS, evalHigh, evalLow, bestHands, qualifies8, fullDeck, rankOf, suitOf } from './rules.js';

// ---------- tunable constants ----------
// Every hand-set number the decisions use, in one place so tests/poker-tune.mjs can search over them.
// A bot takes its own copy through ctx.params; omitted, it uses these.
export const PARAMS = {
  csFloor: 0.02, csK: 2,                 // continue share: floor, and how fast the price narrows it
  pfrRe: 0.4, sizeOff: 0.75, sizeExp: 0.6, // re-raise narrowing; big raises narrow ranges beyond sizeOff × pot
  betBase: 0.25, betAggr: 0.35, betRe: 0.55, // share a player bets after the first round (+ aggression), and re-raises
  callWiden: 0.25, callFloor: 0.04,       // callers hold a wider band than bettors; weight floor for a caller
  edgeK: 0.3, trap: 0.55,                 // softness of range edges; how much a check hides monsters
  foldBias: 0.6,                          // how far a player's fold-to-bet rate moves their continue threshold
  discMul: 1,                             // scale of the early-street price discount
  oop: 0.86, studPos: 0.93,               // share realised out of position; in stud (position unknown)
  aggrK: 0.08,                            // extra value per unit of a style's aggression
  overbet: 1.3,                           // largest all-in considered, in pot-sized raises
  minRe: 0.6,                             // smallest re-raise considered, as a share of the pot
};

// ---------- personalities ----------
// tight: margin (share of the pot) a call must clear. aggr: extra value given to betting. bluff: how much
// it believes in folds (1 = as the model says). adapt: how far it moves from priors to the model.
// range: whether it reads opponents' actions at all. temp: randomness, as a share of the pot.
export const STYLES = {
  // pre: first-round ranges, as multiples of a solid player's: open (raise first in), call (a raise), re (re-raise), limp.
  tag: { key: 'tag', name: 'Tight-aggressive', tight: 0.03, aggr: 1.15, bluff: 1, adapt: 1, range: true, temp: 0.03, pre: { open: 1, call: 1, re: 1, limp: 0 } },
  lag: { key: 'lag', name: 'Loose-aggressive', tight: -0.02, aggr: 1.3, bluff: 1.4, adapt: 1, range: true, temp: 0.05, pre: { open: 1.45, call: 1.25, re: 1.6, limp: 0 } },
  rock: { key: 'rock', name: 'Rock', tight: 0.08, aggr: 0.9, bluff: 0.5, adapt: 0.5, range: true, temp: 0.03, pre: { open: 0.7, call: 0.75, re: 0.6, limp: 0 } },
  station: { key: 'station', name: 'Calling station', tight: -0.09, aggr: 0.55, bluff: 0.3, adapt: 0, range: false, temp: 0.06, pre: { open: 0.7, call: 2.4, re: 0.4, limp: 0.45 } },
  maniac: { key: 'maniac', name: 'Maniac', tight: -0.04, aggr: 1.4, bluff: 1.6, adapt: 0, range: true, temp: 0.08, pre: { open: 2.2, call: 1.5, re: 3, limp: 0 } },
};
// Which styles sit at the table for each lobby level, by seat (seat 1 first).
export const LEVELS = {
  easy: ['station', 'maniac', 'rock', 'station', 'rock', 'maniac', 'station'],
  normal: ['tag', 'station', 'lag', 'rock', 'tag', 'maniac', 'lag'],
  hard: ['tag', 'lag', 'tag', 'lag', 'tag', 'lag', 'tag'],
};
export const styleFor = (level, seat) => STYLES[(LEVELS[level] || LEVELS.normal)[(seat - 1 + 7) % 7]];

// ---------- the table model ----------
// Counts per seat, smoothed toward priors so a few hands do not swing it.
const PRIOR = { vpip: 0.3, pfr: 0.14, foldToBet: 0.45, aggr: 0.45, bluff: 0.12 };
export class TableModel {
  constructor(n) { this.n = n; this.s = Array.from({ length: n }, () => ({ hands: 0, vpip: 0, pfr: 0, faced: 0, folded: 0, aggr: 0, passive: 0, shows: 0, bluffs: 0 })); }

  // Feed one finished hand, as any seat (or nobody) saw it.
  observe(view) {
    const V = VARIANTS[view.variant];
    const dealt = view.players.filter(Boolean).map(p => p.seat);
    const vp = new Set(), pr = new Set(), bets = new Map(), lastAggr = new Map();
    let street = 0, cur = 0;
    for (const e of view.events) {
      if (e.t === 'street' && e.street > 0) { if (e.street !== street) { bets.clear(); cur = 0; } street = e.street; continue; }
      if (e.t === 'blind' || e.t === 'bringin') { bets.set(e.seat, e.amount); cur = Math.max(cur, e.amount); continue; }
      if (!['fold', 'call', 'check', 'bet', 'raise'].includes(e.t)) continue;
      const st = this.s[e.seat];
      if (!st) continue;
      if (cur > (bets.get(e.seat) || 0)) { st.faced++; if (e.t === 'fold') st.folded++; }
      if (street === 0 && (e.t === 'call' || e.t === 'bet' || e.t === 'raise')) vp.add(e.seat);
      if (e.t === 'bet' || e.t === 'raise') {
        if (street === 0) pr.add(e.seat);
        st.aggr++; bets.set(e.seat, e.to); cur = Math.max(cur, e.to); lastAggr.set(e.seat, street);
      } else if (e.t === 'call') { st.passive++; bets.set(e.seat, cur); }
    }
    for (const s of dealt) { const st = this.s[s]; st.hands++; if (vp.has(s)) st.vpip++; if (pr.has(s)) st.pfr++; }
    // At a showdown, a player who bet the last street with a weak hand was bluffing.
    const r = view.result;
    if (r && !r.uncontested) {
      for (const [k, cards] of Object.entries(r.shown)) {
        const s = +k;
        if (lastAggr.get(s) !== view.street) continue;
        const st = this.s[s];
        st.shows++;
        if (shownPercentile(V, cards, view.board, Object.values(r.shown).flat()) < 0.35) st.bluffs++;
      }
    }
  }

  stats(seat, adapt = 1) {
    const st = this.s[seat];
    const sm = (k, num, den, K) => PRIOR[k] + adapt * ((num + PRIOR[k] * K) / (den + K) - PRIOR[k]);
    if (!st) return { ...PRIOR };
    const aggr = sm('aggr', st.aggr, st.aggr + st.passive, 8);
    return {
      vpip: sm('vpip', st.vpip, st.hands, 8), pfr: sm('pfr', st.pfr, st.hands, 8),
      foldToBet: sm('foldToBet', st.folded, st.faced, 8), aggr, bluff: sm('bluff', st.bluffs, st.shows, 6),
    };
  }
}
const priorStats = () => new TableModel(0).stats(-1);

// ---------- quick strength scores, for reading ranges ----------
// Two hold'em cards, by the Chen formula: the high card's points (ace 10, king 8, queen 7, jack 6, else
// half its rank), doubled for a pair (at least 5), +2 suited, minus gap penalties, +1 for small connectors.
const CHEN = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 10];
function pre2(a, b) {
  let hi = rankOf(a), lo = rankOf(b);
  if (lo > hi) [hi, lo] = [lo, hi];
  if (hi === lo) return Math.max(5, CHEN[hi] * 2);
  let s = CHEN[hi];
  if (suitOf(a) === suitOf(b)) s += 2;
  const gap = hi - lo - 1;
  s -= gap === 0 ? 0 : gap === 1 ? 1 : gap === 2 ? 2 : gap === 3 ? 4 : 5;
  if (gap <= 1 && hi < 10) s += 1;
  return s;
}
// Hole cards before any board: hold'em directly; Omaha by its best two pairs of cards, suits, and
// (eight or better) how many low cards it holds.
function preScore(V, cards) {
  if (cards.length === 2) return pre2(cards[0], cards[1]);
  const pairs = [];
  for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) pairs.push(pre2(cards[i], cards[j]));
  pairs.sort((a, b) => b - a);
  let s = pairs[0] + 0.4 * pairs[1];
  const suits = [0, 0, 0, 0];
  for (const c of cards) suits[suitOf(c)]++;
  const suited = suits.filter(k => k >= 2).length;
  s += suited === 2 ? 2 : suited ? 1 : 0;
  if (V.split === 'hilo8') {
    const lows = new Set(cards.map(c => (rankOf(c) + 1) % 13).filter(r => r <= 7));
    s += lows.size * 1.5 + (lows.has(0) && lows.has(1) ? 5 : 0);
  }
  return s;
}
// A hand's strength now (higher is better), as [high, low]; low is null when the game has none.
function nowScore(V, cards, board) {
  if (V.kind === 'board' && board.length === 0) return [preScore(V, cards), null];
  if (V.use === 'omaha') {
    const b = bestHands(cards, board, 'omaha', V.split);
    return [b.high, b.low != null ? -b.low : null];
  }
  const all = board.length ? cards.concat(board) : cards;
  return [V.split === 'low' ? null : evalHigh(all), V.split === 'high' ? null : -evalLow(all)];
}
// Where a score falls among sorted samples, 0..1 (ties count half).
function pct(arr, x) {
  if (x == null || !arr.length) return 0;
  let lo = 0, hi = arr.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] < x) lo = m + 1; else hi = m; }
  let eq = lo;
  while (eq < arr.length && arr[eq] === x) eq++;
  return (lo + (eq - lo) / 2) / arr.length;
}
// Strength samples for a player holding `known` plus `hidden` random cards from `pool`: sorted score
// arrays for percentiles, and the sampled hands themselves ordered by percentile (weakest first), from
// which a range "the top q of hands" is drawn.
function calibrate(V, known, hidden, pool, board, n = 120) {
  const H = [], L = [], d = pool.slice(), samples = [];
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < hidden; k++) { const j = k + Math.floor(Math.random() * (d.length - k)); const t = d[k]; d[k] = d[j]; d[j] = t; }
    const cards = known.concat(d.slice(0, hidden));
    const sc = nowScore(V, cards, board);
    if (sc[0] != null) H.push(sc[0]);
    if (sc[1] != null) L.push(sc[1]);
    samples.push({ cards, sc });
  }
  H.sort((a, b) => a - b); L.sort((a, b) => a - b);
  const cal = { H, L };
  cal.list = samples.map(x => ({ cards: x.cards, p: pctOf(cal, x.sc) })).sort((a, b) => a.p - b.p);
  return cal;
}
const pctOf = (cal, [h, l]) => Math.max(pct(cal.H, h), pct(cal.L, l));
function shownPercentile(V, cards, board, exclude) {
  const known = new Set(exclude.concat(board));
  const pool = fullDeck().filter(c => !known.has(c));
  const holeN = V.kind === 'board' ? V.hole : cards.length;
  const cal = calibrate(V, [], holeN, pool, board, 100);
  return pctOf(cal, nowScore(V, cards, board));
}

// ---------- reading this hand's actions ----------
// Per seat, its voluntary actions this hand: { street, t, level, frac } where level counts the bets and
// raises in that round before it (the big blind counts as one) and frac is a raise's size over the pot.
function actionsBySeat(view) {
  const out = new Map(), put = new Map();
  let street = 0, level = 0, pot = 0, cur = 0;
  for (const e of view.events) {
    if (e.t === 'street' && e.street > 0) { if (e.street !== street) { level = 0; cur = 0; put.clear(); } street = e.street; continue; }
    if (e.t === 'ante') { pot += e.amount; continue; }
    if (e.t === 'blind' || e.t === 'bringin') { pot += e.amount; put.set(e.seat, e.amount); cur = Math.max(cur, e.amount); if (e.big) level = 1; continue; }
    if (e.t === 'return') { pot -= e.amount; continue; }
    if (!['call', 'check', 'bet', 'raise'].includes(e.t)) continue;
    if (!out.has(e.seat)) out.set(e.seat, []);
    const before = put.get(e.seat) || 0;
    let frac = 0;
    if (e.t === 'call') { pot += e.amount; put.set(e.seat, before + e.amount); }
    if (e.t === 'bet' || e.t === 'raise') {
      frac = (e.to - cur) / Math.max(1, pot + (cur - before));
      pot += e.to - before; put.set(e.seat, e.to); cur = e.to;
    }
    out.get(e.seat).push({ street, t: e.t === 'bet' ? 'raise' : e.t, level, frac });
    if (e.t === 'bet' || e.t === 'raise') level++;
  }
  return out;
}
// The share of its hands a player continues with against a bet of `frac` times the pot, from the price
// the bet offers (the caller needs frac / (1 + 2 frac) of the final pot): a tiny bet ≈ everything, a
// third of the pot ≈ the top 60%, a pot-sized bet ≈ the top 34%, a 60× pot shove ≈ the top 3%.
export const continueShare = (frac, K = PARAMS) => {
  const need = Math.max(0, frac) / (1 + 2 * Math.max(0, frac));
  return K.csFloor + (1 - K.csFloor) * Math.max(0, 1 - K.csK * need);
};
const sig = x => 1 / (1 + Math.exp(-x));
// How likely a hand at strength pPre (before the board) / pNow is, given the actions.
function rangeWeight(acts, pPre, pNow, st, curStreet, K = PARAMS) {
  if (!acts || !acts.length) return 1;
  let w = 1;
  // Bluffs are a share of a betting range, so the narrower the value range, the fewer the bluffs.
  const bluffRatio = st.bluff / (1 - st.bluff);
  const raisesIn = new Map();   // a third raise in one round says little the first two did not
  for (const a of acts) {
    const p = a.street === 0 ? pPre : pNow;
    // The edge of a range is soft, in proportion to its width (and softer for earlier rounds).
    const edge = sh => Math.max(0.012, sh * K.edgeK) * (a.street === curStreet ? 1 : 1.5);
    if (a.t === 'raise') {
      const k = (raisesIn.get(a.street) || 0) + 1;
      raisesIn.set(a.street, k);
      if (k > 2) continue;
      // Big raises come from narrower ranges than the player's usual raise.
      const size = Math.min(1, Math.pow(1 + Math.max(0, a.frac - K.sizeOff) / 2, -K.sizeExp));
      const betRange = K.betBase + K.betAggr * st.aggr;
      const share = (a.street === 0 ? st.pfr * (a.level >= 2 ? K.pfrRe : 1) : betRange * (a.level >= 1 ? K.betRe : 1)) * size;
      const sh = Math.max(0.01, share);
      w *= sig((p - (1 - sh)) / edge(sh)) + bluffRatio * sh;
    } else if (a.t === 'call') {
      const share = a.street === 0 ? Math.max(st.vpip, st.pfr + 0.05) : Math.min(0.85, K.betBase + K.betAggr * st.aggr + K.callWiden);
      w *= sig((p - (1 - share)) / edge(share)) + K.callFloor;
    } else w *= 1 - K.trap * sig((p - 0.8) / (a.street === curStreet ? 0.06 : 0.09));   // check: a monster sometimes slow-plays
  }
  return w;
}

// ---------- the Monte Carlo pass ----------
function totals(V) {
  if (V.kind === 'board') return { player: V.hole, board: 5 };
  if (V.kind === 'draw') return { player: 5, board: 0 };
  return { player: V.streets.join('').length, board: 0 };
}
function scorer(V) {
  if (V.use === 'omaha') return (hole, board) => bestHands(hole, board, 'omaha', V.split);
  return (hole, board) => {
    const all = board.length ? hole.concat(board) : hole;
    const high = V.split === 'low' ? null : evalHigh(all);
    let low = null;
    if (V.split !== 'high') { low = evalLow(all); if (V.split === 'hilo8' && !qualifies8(low)) low = null; }
    return { high, low };
  };
}
function share(V, ms, opp) {
  let hiBest = ms.high, hiTie = 1, hiWin = true, loBest = ms.low, loTie = 1, loWin = ms.low != null;
  for (const os of opp) {
    if (V.split !== 'low') {
      if (os.high > hiBest) { hiWin = false; hiBest = os.high; } else if (os.high === hiBest && hiWin) hiTie++;
    }
    if (V.split !== 'high' && os.low != null) {
      if (loBest == null || os.low < loBest) { loWin = false; loBest = os.low; } else if (os.low === loBest && loWin) loTie++;
    }
  }
  const hi = hiWin ? 1 / hiTie : 0, lo = loWin ? 1 / loTie : 0;
  if (V.split === 'high') return hi;
  if (V.split === 'low') return lo;
  return loBest == null ? hi : (hi + lo) / 2;
}

// Returns { eq, opps, raise(frac, P, r, add, opts) }: the share of the pot against the opponents' likely
// hands, per opponent what the decision needs to know, and the expected chips from a bet (see raise).
// Folds and the continuing hands come from the same weighted deals, so a player whose actions show
// strength folds less and is harder to beat when called.
// ctx: { model, adapt, range (false = everyone holds random cards), iters (fixed count; default ~60 ms), params }
export function analyze(view, ctx = {}) {
  const K = ctx.params || PARAMS;
  const V = VARIANTS[view.variant];
  const me = view.players[view.seat];
  const myCards = me.cards.map(x => x.c);
  const oppP = view.players.filter(p => p && p.seat !== view.seat && !p.folded);
  const acts = actionsBySeat(view);
  const opps = oppP.map(p => {
    const st = ctx.model ? ctx.model.stats(p.seat, ctx.adapt ?? 1) : priorStats();
    const mine = acts.get(p.seat) || [];
    return { seat: p.seat, allIn: p.allIn, bet: p.bet, st, acts: mine,
      raisedNow: mine.some(a => a.t === 'raise' && a.street === view.street), raisedBefore: mine.some(a => a.t === 'raise' && a.street < view.street) };
  });
  const flat = (e, pf) => ({ eq: e, opps, raise: (frac, P, r, add) => ({ pf, ev: pf * P + (1 - pf) * (e * (P + r + add) - r) }) });
  if (!opps.length) return flat(1, 1);
  const known = new Set(myCards.concat(view.board));
  for (const p of view.players) if (p) for (const x of p.cards) if (x.c != null) known.add(x.c);
  const unseen = fullDeck().filter(c => !known.has(c));
  const T = totals(V);
  const boardNeed = Math.max(0, T.board - view.board.length);
  const myNeed = Math.max(0, T.player - myCards.length - (V.kind === 'stud' ? view.board.length : 0));
  const oppKnown = oppP.map(p => p.cards.filter(x => x.c != null).map(x => x.c));
  const oppHidden = oppP.map(p => p.cards.filter(x => x.c == null).length);
  const oppNow = oppP.map(p => p.cards.length);
  const oppNeed = oppP.map((p, i) => Math.max(0, T.player - p.cards.length - (V.kind === 'stud' ? view.board.length : 0)) + oppHidden[i]);
  const need = boardNeed + myNeed + oppNeed.reduce((a, b) => a + b, 0);
  if (need > unseen.length) return flat(1 / (opps.length + 1), 0.2);

  // Calibrate each opponent's strength now (and before the board, in board games). Range reading
  // (ranged) weights the deals by it; fold estimates use it either way.
  const ranged = ctx.range !== false;
  const shared = V.kind === 'board' ? calibrate(V, [], V.hole, unseen, view.board, 200) : null;
  const cals = oppP.map((p, i) => shared || calibrate(V, oppKnown[i], oppHidden[i], unseen, []));
  const preCal = ranged && V.kind === 'board' && view.board.length ? calibrate(V, [], V.hole, unseen, []) : null;
  // Continue thresholds (percentiles) for a ladder of bet sizes, shifted per opponent by how often
  // they fold to bets.
  const TH = [0.3, 0.45, 0.55, 0.65, 0.75, 0.84, 0.91, 0.96, 0.985];
  const bias = opps.map(p => (p.st.foldToBet - PRIOR.foldToBet) * K.foldBias);
  const folds = opps.map(() => new Float64Array(TH.length));

  const drawing = V.kind === 'draw' && view.phase !== 'over' && view.street === 0;
  const extra = drawing ? Math.min(unseen.length - need, 3 * (opps.length + 1)) : 0;
  const deck = unseen.slice();
  let kd = 0;
  const redraw = h => { for (const c of drawDiscard(h)) { if (kd >= need + extra) break; h[h.indexOf(c)] = deck[kd++]; } };
  const score = scorer(V);
  const budget = ctx.iters ? Infinity : 60, t0 = Date.now();
  const iters = ctx.iters || 600;
  let tot = 0, wsum = 0, flatTot = 0, it = 0;
  const hands = new Array(opps.length), scores = new Array(opps.length);
  for (; it < iters; it++) {
    if (it >= 60 && (it & 15) === 0 && Date.now() - t0 > budget) break;
    for (let i = 0; i < need + extra; i++) { const j = i + Math.floor(Math.random() * (deck.length - i)); const t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
    let k = 0;
    const board = view.board.slice();
    for (let i = 0; i < boardNeed; i++) board.push(deck[k++]);
    const mine = myCards.slice();
    for (let i = 0; i < myNeed; i++) mine.push(deck[k++]);
    let w = 1;
    const pNows = new Array(opps.length);
    for (let o = 0; o < opps.length; o++) {
      const h = oppKnown[o].slice();
      for (let i = 0; i < oppNeed[o]; i++) h.push(deck[k++]);
      const now = V.kind === 'board' ? h : h.slice(0, oppNow[o]);
      const pNow = pctOf(cals[o], nowScore(V, now, V.kind === 'board' ? view.board : []));
      pNows[o] = pNow;
      if (ranged) {
        const pPre = preCal ? pctOf(preCal, [preScore(V, h), null]) : pNow;
        w *= rangeWeight(opps[o].acts, pPre, pNow, opps[o].st, view.street, K);
      }
      hands[o] = h;
    }
    // Which of these hands would continue against each bet size (all-in players are already in).
    for (let o = 0; o < opps.length; o++) {
      if (opps[o].allIn) continue;
      for (let j = 0; j < TH.length; j++) folds[o][j] += w * (1 - sig((pNows[o] - TH[j] - bias[o]) / 0.04));
    }
    kd = need;
    if (drawing) { redraw(mine); for (const h of hands) redraw(h); }
    const ms = score(mine, board);
    for (let o = 0; o < opps.length; o++) scores[o] = score(hands[o], board);
    const s = share(V, ms, scores);
    tot += w * s; wsum += w; flatTot += s;
  }
  // If no deal fits the actions at all, fall back to random hands rather than a share of zero.
  const eq = wsum > 1e-12 * it ? tot / wsum : flatTot / Math.max(1, it);
  // Per opponent, the chance it folds to a bet whose continue threshold is t (from the weighted deals).
  const foldAt = (o, t) => {
    if (wsum <= 0) return 0;
    const f = j => folds[o][j] / wsum;
    if (t <= TH[0]) return f(0);
    for (let j = 0; j + 1 < TH.length; j++) if (t <= TH[j + 1]) { const u = (t - TH[j]) / (TH[j + 1] - TH[j]); return f(j) + (f(j + 1) - f(j)) * u; }
    return f(TH.length - 1);
  };
  // Each calibration hand's weight under that opponent's range, for drawing the hands that continue.
  const listW = opps.map((p, o) => cals[o].list.map(x => ranged
    ? rangeWeight(p.acts, preCal ? pctOf(preCal, [preScore(V, x.cards), null]) : x.p, x.p, p.st, view.street, K) : 1));
  const drawFrom = (o, t, u) => {
    // A hand from opponent o's range at or above strength t (or its three strongest), by weight.
    const list = cals[o].list, W = listW[o];
    let i0 = t <= 0 ? 0 : list.findIndex(x => x.p >= t + bias[o]);
    if (i0 < 0 || i0 > list.length - 3) i0 = list.length - 3;
    i0 = Math.max(0, i0);
    let tw = 0;
    for (let i = i0; i < list.length; i++) tw += W[i];
    let x = u * tw;
    for (let m = i0; m < list.length; m++) { x -= W[m]; if (x <= 0) return list[m].cards; }
    return list[list.length - 1].cards;
  };
  // The value of betting frac × the pot (r more chips from us, `add` from each caller): every
  // opponent folds or continues by its own chance; whoever continues holds a hand from the stronger part
  // of its range; then the cards run out and the pot (with every caller's chips) is split as the game
  // splits it, high and low included. The same random numbers serve every size, so sizes compare fairly.
  const NS = ctx.iters ? Math.max(32, ctx.iters >> 1) : 64;
  const R = Array.from({ length: NS }, () => Float64Array.from({ length: 2 * opps.length + 16 }, Math.random));
  const raise = (frac, P, r, add, { bluff = 1, realize = 1 } = {}) => {
    const t = 1 - continueShare(frac, K);
    const fold = opps.map((p, o) => (p.allIn ? 0 : 1 - Math.pow(1 - foldAt(o, t), bluff)));
    const pf = fold.reduce((x, f, o) => (opps[o].allIn ? x : x * f), opps.some(p => !p.allIn) ? 1 : 0);
    let sum = 0;
    for (let i = 0; i < NS; i++) {
      const u = R[i];
      const ins = [], used = new Set();
      for (let o = 0; o < opps.length; o++) {
        if (!opps[o].allIn && u[2 * o] < fold[o]) continue;
        let h = drawFrom(o, opps[o].allIn ? 0 : t, u[2 * o + 1]);
        if (h.some(c => used.has(c))) h = drawFrom(o, opps[o].allIn ? 0 : t, (u[2 * o + 1] + 0.37) % 1);
        if (h.some(c => used.has(c))) continue;
        h.forEach(c => used.add(c));
        ins.push({ o, h });
      }
      const callers = ins.filter(x => !opps[x.o].allIn).length;
      if (!ins.length) { sum += P; continue; }
      // Only all-in players left: the bet comes back and the pot goes to a showdown with them.
      const rr = callers ? r : 0;
      const rest = unseen.filter(c => !used.has(c));
      let k = 0, rk = 2 * opps.length;
      const take = () => { const j = k + Math.floor(u[rk++ % u.length] * (rest.length - k)); const c = rest[j]; rest[j] = rest[k]; rest[k] = c; return rest[k++]; };
      const board = view.board.slice();
      for (let m = 0; m < boardNeed; m++) board.push(take());
      const mine = myCards.slice();
      for (let m = 0; m < myNeed; m++) mine.push(take());
      const theirs = ins.map(({ o, h }) => { const x = h.slice(); for (let m = 0; m < oppNeed[o] - oppHidden[o]; m++) x.push(take()); return score(x, board); });
      const sh = share(V, score(mine, board), theirs);
      sum += sh * (P + rr + add * callers) * realize - rr;
    }
    return { pf, ev: sum / NS };
  };
  return { eq, opps, raise, iters: it };
}

// Share of the pot against random hands (the hint line, and tests).
export function equity(view, iters) { return analyze(view, { range: false, iters }).eq; }

// ---------- five-card draw discards ----------
// Keep made hands and four-card draws, else the best high cards.
export function drawDiscard(cards) {
  const byRank = new Map();
  for (const c of cards) { const r = rankOf(c); byRank.set(r, (byRank.get(r) || []).concat(c)); }
  const cat = evalHigh(cards) >> 20;
  if (cat >= 4) return [];   // straight, flush, full house, quads, straight flush
  const groups = [...byRank.values()].filter(g => g.length >= 2);
  if (groups.length) {
    const keep = new Set(groups.flat());
    if (cat === 1) {   // one pair keeps an ace kicker now and then
      const ace = cards.find(c => rankOf(c) === 12 && !keep.has(c));
      if (ace != null && Math.random() < 0.4) keep.add(ace);
    }
    return cards.filter(c => !keep.has(c));
  }
  for (let s = 0; s < 4; s++) { const f = cards.filter(c => suitOf(c) === s); if (f.length === 4) return cards.filter(c => suitOf(c) !== s); }
  const rs = [...new Set(cards.map(rankOf))].sort((a, b) => a - b);
  for (let i = 0; i + 3 < rs.length; i++) {
    if (rs[i + 3] - rs[i] === 3 && rs[i] > 0 && rs[i + 3] < 12) {
      const run = new Set(rs.slice(i, i + 4)), seen = new Set();
      return cards.filter(c => { const r = rankOf(c); if (run.has(r) && !seen.has(r)) { seen.add(r); return false; } return true; });
    }
  }
  const sorted = cards.slice().sort((a, b) => rankOf(b) - rankOf(a));
  const keep = rankOf(sorted[0]) === 12 ? sorted.slice(0, rankOf(sorted[1]) >= 11 ? 2 : 1) : sorted.slice(0, 2);
  return cards.filter(c => !keep.includes(c));
}

// ---------- choosing an action ----------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function lastStreet(V, street) {
  if (V.kind === 'board') return street >= 3;
  if (V.kind === 'draw') return street >= 1;
  return street >= V.streets.length - 1;
}
// Early in a hand a call buys more than this round's pot (implied odds), so it costs less than its face.
function priceDiscount(V, street) {
  const steps = V.kind === 'board' ? [0.62, 0.8, 0.92, 1] : V.kind === 'draw' ? [0.7, 1] : V.streets.length === 5 ? [0.65, 0.75, 0.85, 0.95, 1] : [0.7, 0.82, 0.92, 1];
  return steps[Math.min(street, steps.length - 1)];
}
// Last to act after the first round (board and draw games): the button side of the live players.
function inPosition(view) {
  const V = VARIANTS[view.variant];
  if (V.kind === 'stud') return null;
  const n = view.players.length;
  let last = -1, bestD = -1;
  for (const p of view.players) {
    if (!p || p.folded) continue;
    const d = (p.seat - view.button - 1 + n) % n;
    if (d > bestD) { bestD = d; last = p.seat; }
  }
  return last === view.seat;
}

// ---------- the first betting round ----------
// Before the flop (or on third street, or before the draw) the bots play ranges by position, as people
// do: raise first in with the top share of hands for their seat, call a raise with a narrower band,
// re-raise with the top of it. Sizes are the usual ones: open to 2.5 big blinds (plus one per limper),
// re-raise to about three times. The value model takes over from the next round, when the ranges it reads
// have meaning.
let holdemPct = null;
function myPercentile(V, cards) {
  if (V.kind === 'board' && cards.length === 2) {
    // Exact over all 1,326 starting hands.
    if (!holdemPct) {
      const all = [];
      for (let a = 0; a < 52; a++) for (let b = a + 1; b < 52; b++) all.push(pre2(a, b));
      holdemPct = all.sort((x, y) => x - y);
    }
    return pct(holdemPct, pre2(cards[0], cards[1]));
  }
  const known = new Set(cards);
  const pool = fullDeck().filter(c => !known.has(c));
  const cal = calibrate(V, [], cards.length, pool, [], 300);
  return pctOf(cal, nowScore(V, cards, []));
}
function firstRound(view, o, style) {
  const V = VARIANTS[view.variant];
  const me = view.players[view.seat];
  const p = myPercentile(V, me.cards.map(x => x.c)) + (Math.random() - 0.5) * 0.03;
  const pre = style.pre || STYLES.tag.pre;
  const bb = view.stakes.bb;
  // This round so far: raises, and calls before the first raise (limpers).
  let raises = 0, limpers = 0, callers = 0;
  for (const e of view.events) {
    if (e.t === 'street' && e.street > 0) break;
    if (e.t === 'bet' || e.t === 'raise') { raises++; callers = 0; }
    else if (e.t === 'call') { if (raises === 0) limpers++; else callers++; }
  }
  // Players still to act after us this round (blinds included): fewer means a later position.
  const n = view.players.length, live = view.players.filter(q => q && !q.folded && !q.allIn);
  const order = live.map(q => q.seat).sort((x, y) => ((x - view.button - 1 + n) % n) - ((y - view.button - 1 + n) % n));
  let after = 0;
  if (V.forced === 'blinds' && raises === 0) {
    // Before the first raise the big blind acts last.
    const pre = order.filter(x => x !== view.bb), seq = view.bb != null && live.some(q => q.seat === view.bb) ? pre.concat(view.bb) : pre;
    const start = seq.indexOf(view.toAct === view.seat ? view.seat : view.seat);
    after = seq.length - 1 - start;
  } else after = Math.max(0, live.length - 1);
  const heads = live.length + view.players.filter(q => q && q.allIn).length === 2;
  const openShare = (heads ? 0.75 : [0.14, 0.42, 0.3, 0.22, 0.17, 0.14][Math.min(after, 5)]) * pre.open;
  const fixed = o.raise && o.raise.fixed;
  const raiseTo = to => (o.raise ? { type: 'raise', to: fixed ? o.raise.min : Math.max(o.raise.min, Math.min(o.raise.max, to >= o.raise.max * 0.4 ? o.raise.max : Math.round(to / (bb / 2)) * (bb / 2))) } : null);
  const passive = () => (o.canCheck ? { type: 'check' } : o.bringIn != null ? { type: 'bringin' } : { type: 'fold' });

  if (o.bringIn != null) return p >= 1 - 0.18 * pre.open && o.raise ? raiseTo(o.raise.min) : { type: 'bringin' };
  if (raises === 0) {
    // Nobody has raised: open, limp along (some styles), check the big blind, or fold.
    if (p >= 1 - Math.min(0.95, openShare)) return raiseTo(bb * 2.5 + limpers * bb) || (o.canCheck ? { type: 'check' } : { type: 'call' });
    if (o.canCheck) return { type: 'check' };
    const cheap = o.call <= bb / 2 && o.toCall > 0;   // the small blind completing
    if ((pre.limp && p >= 1 - pre.limp) || (cheap && p >= 0.55) || (limpers && p >= 1 - openShare * 1.5 && o.call <= bb)) return { type: 'call' };
    return passive();
  }
  // Facing raises: the opener's range sets how wide to defend; the big blind and a cheap price widen it.
  const priceShare = o.call / (o.pot + o.call);
  const reShare = (raises >= 2 ? 0.02 : 0.035) * pre.re * (heads ? 2.5 : 1);
  let callShare = (raises >= 2 ? 0.045 : 0.12) * pre.call * (heads ? 2.5 : 1) * (view.seat === view.bb ? 1.5 : 1) * (priceShare < 0.25 ? 1.4 : 1) / (1 + 0.25 * callers);
  callShare = Math.min(0.9, callShare);
  if (p >= 1 - reShare && o.raise) return raiseTo(o.currentBet * (raises >= 2 ? 2.3 : after > 0 ? 3.5 : 3) + callers * o.currentBet);
  if (p >= 1 - reShare - callShare) return o.call >= me.stack && p < 1 - reShare * 1.5 ? passive() : { type: 'call' };
  return passive();
}

// The bot's action for a 'turn' question (options from hand.options(seat)).
// ctx: { style, model, analysis (from analyze, to reuse), iters }
export function botAct(view, o, ctx = {}) {
  if (!o) return null;
  if (o.kind === 'draw') return { type: 'draw', discard: drawDiscard(o.cards) };
  const style = ctx.style || STYLES.tag;
  const K = ctx.params || PARAMS;
  if (view.street === 0 && !ctx.noChart) return firstRound(view, o, style);
  const a = ctx.analysis || analyze(view, { model: ctx.model, adapt: style.adapt, range: style.range, iters: ctx.iters, params: K });
  const V = VARIANTS[view.variant];
  const P = Math.max(o.pot, 1);
  const last = lastStreet(V, view.street);
  const pos = inPosition(view);
  const realize = last ? 1 : pos === true ? 1 : pos === false ? K.oop : K.studPos;
  // The implied-odds discount needs chips behind to win later; a call of most of the stack gets none.
  const behind = o.stack - o.call;
  const disc = last || behind < P ? 1 : 1 - (1 - priceDiscount(V, view.street)) * K.discMul;
  const cands = [];
  const passive = (act, put) => cands.push({ act, ev: a.eq * (P + put) * realize - put * disc - (put > 0 ? style.tight * P : 0) });

  if (o.bringIn != null) passive({ type: 'bringin' }, o.bringIn);
  else if (o.canCheck) passive({ type: 'check' }, 0);
  else {
    cands.push({ act: { type: 'fold' }, ev: 0 });
    passive({ type: 'call' }, o.call);
  }

  if (o.raise) {
    const sizes = new Set();
    if (o.raise.fixed || o.raise.min === o.raise.max) sizes.add(o.raise.min);
    else {
      const base = P + o.call;
      for (const f of [0.33, 0.5, 0.75, 1]) sizes.add(Math.round(o.currentBet + f * base));
      sizes.add(o.raise.min);
      // All in only when it is not much more than a pot-sized raise.
      if (o.raise.max <= o.currentBet + K.overbet * base) sizes.add(o.raise.max);
    }
    const unit = view.stakes.bb >= 10 ? Math.max(1, Math.round(view.stakes.bb / 2)) : 1;
    for (let X of sizes) {
      X = clamp(Math.round(X / unit) * unit, o.raise.min, o.raise.max);
      if (X >= o.raise.max * 0.7) X = o.raise.max;   // most of the stack: all of it
      if (cands.some(c => c.act.type === 'raise' && c.act.to === X)) continue;
      const r = X - o.bet, add = X - o.currentBet;
      const frac = add / (P + o.call);
      if (o.call > 0 && !o.raise.fixed && frac < K.minRe && X < o.raise.max) continue;   // no small re-raises
      const { ev } = a.raise(frac, P, r, add, { bluff: style.bluff, realize: X >= o.raise.max ? 1 : realize });
      cands.push({ act: { type: 'raise', to: X }, ev: ev + (style.aggr - 1) * K.aggrK * P });
    }
  }

  // A soft maximum: clearly better actions win, close ones are mixed.
  const T = Math.max(style.temp * P, 1e-6);
  const best = Math.max(...cands.map(c => c.ev));
  const ws = cands.map(c => Math.exp((c.ev - best) / T));
  let u = Math.random() * ws.reduce((x, y) => x + y, 0);
  for (let i = 0; i < cands.length; i++) { u -= ws[i]; if (u <= 0) return cands[i].act; }
  return cands[cands.length - 1].act;
}
