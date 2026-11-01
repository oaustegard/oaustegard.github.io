// The first computer player (2026-10-31), frozen as the baseline for tests/poker-bots.mjs. Do not edit.
// The computer player. It sees only what a person in its seat would see (`hand.view(seat)`).
// Every betting decision starts from a Monte Carlo estimate of its share of the pot against the
// players still in: deal the unseen cards at random many times and score the showdowns under the
// variant's rules (high, low, or split eight-or-better). Then it compares that share with the price of
// calling and bets or raises with the strong hands, sized to the pot.
import { VARIANTS, evalHigh, evalLow, bestHands, qualifies8, fullDeck, rankOf, suitOf } from '../games/poker/rules.js';

// Cards still to come for each player and for the board, from the variant's structure.
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

// Expected share of the pot (0..1) for `view.seat` against the live opponents.
export function equity(view, iters) {
  const V = VARIANTS[view.variant];
  const me = view.players[view.seat];
  const myCards = me.cards.map(x => x.c);
  const opps = view.players.filter(p => p && p.seat !== view.seat && !p.folded);
  if (!opps.length) return 1;
  const known = new Set(myCards.concat(view.board));
  for (const p of view.players) if (p) for (const x of p.cards) if (x.c != null) known.add(x.c);
  const unseen = fullDeck().filter(c => !known.has(c));
  const T = totals(V);
  // Stud tables short of cards deal a shared card on the last street; the board then has what it has.
  const boardNeed = Math.max(0, T.board - view.board.length);
  const myNeed = Math.max(0, T.player - myCards.length - (V.kind === 'stud' ? view.board.length : 0));
  const oppKnown = opps.map(p => p.cards.filter(x => x.c != null).map(x => x.c));
  const oppNeed = opps.map(p => Math.max(0, T.player - p.cards.length - (V.kind === 'stud' ? view.board.length : 0)) + p.cards.filter(x => x.c == null).length);
  const need = boardNeed + myNeed + oppNeed.reduce((a, b) => a + b, 0);
  if (need > unseen.length) return 1 / (opps.length + 1);
  // Before the draw in draw poker, everyone (us included) draws by the same rule of thumb.
  const drawing = V.kind === 'draw' && view.phase !== 'over' && view.street === 0;
  const extra = drawing ? Math.min(unseen.length - need, 3 * (opps.length + 1)) : 0;
  const redraw = (h, k0) => {
    let k = k0;
    const d = drawDiscard(h);
    for (const c of d) { if (k >= need + extra) break; h[h.indexOf(c)] = deck[k++]; }
    return k;
  };
  const score = scorer(V);
  // A fixed count when asked (tests); otherwise as many deals as fit in about 60 ms, at least 60.
  const budget = iters ? Infinity : 60, t0 = Date.now();
  iters = iters || 400;
  const deck = unseen.slice();
  let total = 0, it = 0;
  for (; it < iters; it++) {
    if (it >= 60 && (it & 15) === 0 && Date.now() - t0 > budget) break;
    // Partial Fisher-Yates: only the cards this deal needs.
    for (let i = 0; i < need + extra; i++) { const j = i + Math.floor(Math.random() * (deck.length - i)); const t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
    let k = 0;
    const board = view.board.slice();
    for (let i = 0; i < boardNeed; i++) board.push(deck[k++]);
    const mine = myCards.slice();
    for (let i = 0; i < myNeed; i++) mine.push(deck[k++]);
    let kd = need;
    if (drawing) kd = redraw(mine, kd);
    const ms = score(mine, board);
    let hiBest = ms.high, hiTie = 1, hiWin = true, loBest = ms.low, loTie = 1, loWin = ms.low != null;
    for (let o = 0; o < opps.length; o++) {
      const h = oppKnown[o].slice();
      for (let i = 0; i < oppNeed[o]; i++) h.push(deck[k++]);
      if (drawing) kd = redraw(h, kd);
      const os = score(h, board);
      if (V.split !== 'low') {
        if (os.high > hiBest) { hiWin = false; } else if (os.high === hiBest && hiWin) hiTie++;
        if (os.high > hiBest) hiBest = os.high;
      }
      if (V.split !== 'high' && os.low != null) {
        if (loBest == null || os.low < loBest) { loWin = false; loBest = os.low; } else if (os.low === loBest && loWin) loTie++;
      }
    }
    const hiShare = hiWin ? 1 / hiTie : 0, loShare = loWin ? 1 / loTie : 0;
    if (V.split === 'high') total += hiShare;
    else if (V.split === 'low') total += loShare;
    else total += loBest == null ? hiShare : (hiShare + loShare) / 2;
  }
  return total / it;
}

// Which cards to throw in five-card draw: keep made hands and four-card draws, else the best high cards.
export function drawDiscard(cards) {
  const byRank = new Map();
  for (const c of cards) { const r = rankOf(c); byRank.set(r, (byRank.get(r) || []).concat(c)); }
  const cat = evalHigh(cards) >> 20;
  if (cat >= 4 && cat !== 7) return [];   // straight, flush, full house, straight flush
  const groups = [...byRank.values()].filter(g => g.length >= 2);
  if (groups.length) {
    const keep = new Set(groups.flat());
    // Trips draw two; one pair keeps an ace kicker now and then.
    if (cat === 1) {
      const ace = cards.find(c => rankOf(c) === 12 && !keep.has(c));
      if (ace != null && Math.random() < 0.4) keep.add(ace);
    }
    if (cat === 7) { const kick = cards.filter(c => !keep.has(c)); return kick; }
    return cards.filter(c => !keep.has(c));
  }
  for (let s = 0; s < 4; s++) { const f = cards.filter(c => suitOf(c) === s); if (f.length === 4) return cards.filter(c => suitOf(c) !== s); }
  // Four to an open-ended straight.
  const rs = [...new Set(cards.map(rankOf))].sort((a, b) => a - b);
  for (let i = 0; i + 3 < rs.length; i++) {
    if (rs[i + 3] - rs[i] === 3 && rs[i] > 0 && rs[i + 3] < 12) {
      const run = new Set(rs.slice(i, i + 4));
      const seen = new Set();
      return cards.filter(c => { const r = rankOf(c); if (run.has(r) && !seen.has(r)) { seen.add(r); return false; } return true; });
    }
  }
  const sorted = cards.slice().sort((a, b) => rankOf(b) - rankOf(a));
  const keep = rankOf(sorted[0]) === 12 ? sorted.slice(0, rankOf(sorted[1]) >= 11 ? 2 : 1) : sorted.slice(0, 2);
  return cards.filter(c => !keep.includes(c));
}

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// The bot's action for a 'turn' question: options from hand.options(seat).
export function botAct(view, o, style = {}, known = null) {
  if (!o) return null;
  if (o.kind === 'draw') return { type: 'draw', discard: drawDiscard(o.cards) };
  const opps = view.players.filter(p => p && p.seat !== view.seat && !p.folded).length;
  const eq = known ?? equity(view);
  const base = 1 / (opps + 1);
  const rel = eq / base;
  const loose = style.loose ?? 0;
  const r = Math.random();
  const raiseTo = strength => {
    if (!o.raise) return null;
    if (o.raise.fixed) return { type: 'raise', to: o.raise.min };
    const pot = o.pot + o.call;
    let frac = strength > 0.8 ? 0.9 + Math.random() * 0.4 : 0.45 + Math.random() * 0.4;
    let to = Math.round(o.currentBet + pot * frac);
    // Commit the rest when the bet would leave less than a third of the stack behind.
    if (o.raise.max - to < o.raise.max * 0.33 && strength > 0.7) to = o.raise.max;
    const unit = view.stakes.bb >= 10 ? Math.max(1, Math.round(view.stakes.bb / 2)) : 1;
    to = Math.round(to / unit) * unit;
    return { type: 'raise', to: clamp(to, o.raise.min, o.raise.max) };
  };

  if (o.bringIn != null) {
    if (o.raise && (rel > 1.5 || eq > 0.45) && r < 0.8) return raiseTo(eq);
    return { type: 'bringin' };
  }
  const strong = eq > 0.62 || rel > 1.9 + Math.random() * 0.4;
  const decent = rel > 1.15 - loose;
  if (o.canCheck) {
    if (o.raise && strong && r < 0.85) return raiseTo(eq);
    if (o.raise && decent && r < 0.35) return raiseTo(eq * 0.8);
    if (o.raise && opps <= 2 && r < 0.08) return raiseTo(0.5);   // an occasional bluff
    return { type: 'check' };
  }
  // Early in a hand the price understates what a call wins later (implied odds), so early streets
  // discount it; on the last street the plain pot odds rule.
  const V = VARIANTS[view.variant];
  const steps = V.kind === 'board' ? [0.5, 0.72, 0.88, 1] : V.kind === 'draw' ? [0.6, 1] : V.streets.length === 5 ? [0.55, 0.65, 0.8, 0.92, 1] : [0.6, 0.75, 0.9, 1];
  const odds = o.call / (o.pot + o.call) * (steps[Math.min(view.street, steps.length - 1)] ?? 1);
  if (eq > odds + 0.02 - loose * 0.05 || (view.street === 0 && rel > 1.05 && o.call <= view.stakes.bb * 2)) {
    if (o.raise && strong && r < 0.6) return raiseTo(eq);
    return { type: 'call' };
  }
  // A cheap look (a bring-in or a small blind's completion) with any hand that is not hopeless.
  if (o.call <= view.stakes.bb / 2 && eq > odds * 0.6) return { type: 'call' };
  return { type: 'fold' };
}
