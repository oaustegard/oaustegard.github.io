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

// ---------- personalities ----------
// tight: margin (share of the pot) a call must clear. aggr: extra value given to betting. bluff: how much
// it believes in folds (1 = as the model says). adapt: how far it moves from priors to the model.
// range: whether it reads opponents' actions at all. temp: randomness, as a share of the pot.
export const STYLES = {
  tag: { key: 'tag', name: 'Tight-aggressive', tight: 0.03, aggr: 1.15, bluff: 1, adapt: 1, range: true, temp: 0.03 },
  lag: { key: 'lag', name: 'Loose-aggressive', tight: -0.02, aggr: 1.3, bluff: 1.4, adapt: 1, range: true, temp: 0.05 },
  rock: { key: 'rock', name: 'Rock', tight: 0.08, aggr: 0.9, bluff: 0.5, adapt: 0.5, range: true, temp: 0.03 },
  station: { key: 'station', name: 'Calling station', tight: -0.09, aggr: 0.55, bluff: 0.3, adapt: 0, range: false, temp: 0.06 },
  maniac: { key: 'maniac', name: 'Maniac', tight: -0.04, aggr: 1.4, bluff: 1.6, adapt: 0, range: true, temp: 0.08 },
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
    if (!st) return { ...PRIOR, betRange: 0.25 + 0.35 * PRIOR.aggr };
    const aggr = sm('aggr', st.aggr, st.aggr + st.passive, 8);
    return {
      vpip: sm('vpip', st.vpip, st.hands, 8), pfr: sm('pfr', st.pfr, st.hands, 8),
      foldToBet: sm('foldToBet', st.folded, st.faced, 8), aggr, bluff: sm('bluff', st.bluffs, st.shows, 6),
      betRange: 0.25 + 0.35 * aggr,   // share of hands a player bets with after the first round
    };
  }
}
const priorStats = () => new TableModel(0).stats(-1);

// ---------- quick strength scores, for reading ranges ----------
// Two hold'em cards: high cards, pairs, suits and gaps (in the spirit of the Chen formula).
function pre2(a, b) {
  let hi = rankOf(a), lo = rankOf(b);
  if (lo > hi) [hi, lo] = [lo, hi];
  let s = hi * 2 + lo;
  if (hi === lo) return s + 24 + hi * 2;
  if (suitOf(a) === suitOf(b)) s += 4;
  const gap = hi - lo - 1;
  s -= gap <= 0 ? 0 : gap === 1 ? 1 : gap === 2 ? 3 : gap === 3 ? 5 : 8;
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
  s += suited === 2 ? 4 : suited ? 2 : 0;
  if (V.split === 'hilo8') {
    const lows = new Set(cards.map(c => (rankOf(c) + 1) % 13).filter(r => r <= 7));
    s += lows.size * 3 + (lows.has(0) && lows.has(1) ? 10 : 0);
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
export const continueShare = frac => {
  const need = Math.max(0, frac) / (1 + 2 * Math.max(0, frac));
  return 0.02 + 0.98 * (1 - 2 * need);
};
const sig = x => 1 / (1 + Math.exp(-x));
// How likely a hand at strength pPre (before the board) / pNow is, given the actions.
function rangeWeight(acts, pPre, pNow, st, curStreet) {
  if (!acts || !acts.length) return 1;
  let w = 1;
  // Bluffs are a share of a betting range, so the narrower the value range, the fewer the bluffs.
  const bluffRatio = st.bluff / (1 - st.bluff);
  const raisesIn = new Map();   // a third raise in one round says little the first two did not
  for (const a of acts) {
    const p = a.street === 0 ? pPre : pNow;
    // The edge of a range is soft, in proportion to its width (and softer for earlier rounds).
    const edge = (sh, k = 0.3) => Math.max(0.012, sh * k) * (a.street === curStreet ? 1 : 1.5);
    if (a.t === 'raise') {
      const k = (raisesIn.get(a.street) || 0) + 1;
      raisesIn.set(a.street, k);
      if (k > 2) continue;
      // Big raises come from narrower ranges than the player's usual raise.
      const size = Math.min(1, Math.pow(1 + Math.max(0, a.frac - 0.75) / 2, -0.6));
      const share = (a.street === 0 ? st.pfr * (a.level >= 2 ? 0.4 : 1) : st.betRange * (a.level >= 1 ? 0.55 : 1)) * size;
      const sh = Math.max(0.01, share);
      w *= sig((p - (1 - sh)) / edge(sh)) + bluffRatio * sh;
    } else if (a.t === 'call') {
      const share = a.street === 0 ? Math.max(st.vpip, st.pfr + 0.05) : Math.min(0.85, st.betRange + 0.25);
      w *= sig((p - (1 - share)) / edge(share)) + 0.04;
    } else w *= 1 - 0.55 * sig((p - 0.8) / (a.street === curStreet ? 0.06 : 0.09));   // check: a monster sometimes slow-plays
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

// Returns { eq, opps, at(frac) }: the share of the pot against the opponents' likely hands, per opponent
// what the decision needs to know, and for a bet of frac × the pot, { eqCalled, pf }: the share against
// the hands that would continue, and the chance that every opponent folds. Both come from the same
// weighted deals, so a player whose actions show strength folds less and is harder to beat when called.
// ctx: { model, adapt, range (false = everyone holds random cards), iters (fixed count; default ~60 ms) }
export function analyze(view, ctx = {}) {
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
  const flat = (e, pf) => ({ eq: e, eqCalled: e, opps, at: () => ({ eqCalled: e, pf }) });
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
  const bias = opps.map(p => (p.st.foldToBet - PRIOR.foldToBet) * 0.6);
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
        w *= rangeWeight(opps[o].acts, pPre, pNow, opps[o].st, view.street);
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
  const pfAt = TH.map((t, j) => opps.reduce((x, p, o) => (p.allIn ? x : x * (wsum > 0 ? folds[o][j] / wsum : 0)), opps.some(p => !p.allIn) ? 1 : 0));

  // Share when called: heads-up against a hand drawn from the top of the caller's strength (at least the
  // three strongest samples), the rest of the cards dealt at random. One caller is the usual case.
  const callers = opps.map((p, o) => o).filter(o => !opps[o].allIn);
  // Each calibration hand's weight under that opponent's range, for drawing a caller's hand.
  const listW = callers.map(o => cals[o].list.map(x => ranged
    ? rangeWeight(opps[o].acts, preCal ? pctOf(preCal, [preScore(V, x.cards), null]) : x.p, x.p, opps[o].st, view.street) : 1));
  const calledCache = new Map();
  const calledEq = t => {
    const key = Math.round(t * 100);
    if (calledCache.has(key)) return calledCache.get(key);
    if (!callers.length) return eq;
    let sum = 0, n = 0;
    const N = ctx.iters ? Math.max(24, ctx.iters >> 2) : 48;
    callers.forEach((o, ci) => {
      // The hands in the caller's range strong enough to continue (or its three strongest).
      const list = cals[o].list, W = listW[ci];
      let i0 = list.findIndex(x => x.p >= t + bias[o]);
      if (i0 < 0 || i0 > list.length - 3) i0 = list.length - 3;
      i0 = Math.max(0, i0);
      let tw = 0;
      for (let i = i0; i < list.length; i++) tw += W[i];
      for (let i = 0; i < N; i++) {
        let u = Math.random() * tw, pick = list.length - 1;
        for (let m = i0; m < list.length; m++) { u -= W[m]; if (u <= 0) { pick = m; break; } }
        const opp = list[pick].cards;
        const used = new Set(opp);
        const rest = unseen.filter(c => !used.has(c));
        for (let k = 0; k < rest.length && k < 12; k++) { const j = k + Math.floor(Math.random() * (rest.length - k)); const x = rest[k]; rest[k] = rest[j]; rest[j] = x; }
        let k = 0;
        const board = view.board.slice();
        for (let m = 0; m < boardNeed; m++) board.push(rest[k++]);
        const mine = myCards.slice();
        for (let m = 0; m < myNeed; m++) mine.push(rest[k++]);
        const theirs = opp.slice();
        for (let m = 0; m < oppNeed[o] - oppHidden[o]; m++) theirs.push(rest[k++]);
        sum += share(V, score(mine, board), [score(theirs, board)]); n++;
      }
    });
    const v = n ? sum / n : eq;
    calledCache.set(key, v);
    return v;
  };
  const at = frac => {
    const t = 1 - continueShare(frac);
    let pf = pfAt[TH.length - 1];
    if (t <= TH[0]) pf = pfAt[0];
    else for (let j = 0; j + 1 < TH.length; j++) if (t <= TH[j + 1]) { const u = (t - TH[j]) / (TH[j + 1] - TH[j]); pf = pfAt[j] + (pfAt[j + 1] - pfAt[j]) * u; break; }
    // Calling hands are a stronger subset of the range, so the share against them is no higher.
    return { pf, eqCalled: Math.min(eq, calledEq(t)) };
  };
  return { eq, get eqCalled() { return at(0.75).eqCalled; }, opps, at, iters: it };
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

// The bot's action for a 'turn' question (options from hand.options(seat)).
// ctx: { style, model, analysis (from analyze, to reuse), iters }
export function botAct(view, o, ctx = {}) {
  if (!o) return null;
  if (o.kind === 'draw') return { type: 'draw', discard: drawDiscard(o.cards) };
  const style = ctx.style || STYLES.tag;
  const a = ctx.analysis || analyze(view, { model: ctx.model, adapt: style.adapt, range: style.range, iters: ctx.iters });
  const V = VARIANTS[view.variant];
  const P = Math.max(o.pot, 1);
  const last = lastStreet(V, view.street);
  const pos = inPosition(view);
  const realize = last ? 1 : pos === true ? 1 : pos === false ? 0.86 : 0.93;
  // The implied-odds discount needs chips behind to win later; a call of most of the stack gets none.
  const behind = o.stack - o.call;
  const disc = last || behind < P ? 1 : priceDiscount(V, view.street);
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
      for (const f of [0.5, 0.75, 1, 1.5]) sizes.add(Math.round(o.currentBet + f * base));
      sizes.add(o.raise.min);
      // All in only when it is not much more than a pot-sized raise.
      if (o.raise.max <= o.currentBet + 2 * base) sizes.add(o.raise.max);
    }
    const unit = view.stakes.bb >= 10 ? Math.max(1, Math.round(view.stakes.bb / 2)) : 1;
    for (let X of sizes) {
      X = clamp(Math.round(X / unit) * unit, o.raise.min, o.raise.max);
      if (X >= o.raise.max * 0.7) X = o.raise.max;   // most of the stack: all of it
      if (cands.some(c => c.act.type === 'raise' && c.act.to === X)) continue;
      const r = X - o.bet, add = X - o.currentBet;
      const frac = add / (P + o.call);
      if (o.call > 0 && !o.raise.fixed && frac < 0.6 && X < o.raise.max) continue;   // no small re-raises
      const at = a.at(frac);
      const pf = 1 - Math.pow(1 - at.pf, style.bluff);
      // A bet buys no discount: it is the price others pay that carries implied odds.
      const called = at.eqCalled * (P + r + add) * (X >= o.raise.max ? 1 : realize) - r;
      cands.push({ act: { type: 'raise', to: X }, ev: pf * P + (1 - pf) * called + (style.aggr - 1) * 0.08 * P });
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
