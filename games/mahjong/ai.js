// Computer players. They see only Hand.view(seat), the same as a human at that seat.
// Each decision picks a plan (any hand, a one-suit hand in a suit, or all pungs), scores every discard by
// how far it leaves the hand from ready under that plan (shanten), how many unseen tiles would improve it,
// whether the plan can still reach the table's minimum faan, and, late or against a threatening hand,
// how dangerous the tile is to feed.
import { kindOf, countsOf, shanten, isSuited, suitOf, isHonor, isDragon, isTerminal, KIND_COUNT } from './rules.js';

const PLANS = ['any', 'flush0', 'flush1', 'flush2', 'pungs'];

function visibleCounts(view) {
  const seen = new Array(KIND_COUNT).fill(0);
  const me = view.players[view.seat];
  for (const id of me.hand || []) seen[kindOf(id)]++;
  for (const p of view.players) {
    for (const id of p.discards) seen[kindOf(id)]++;
    for (const m of p.melds) for (const id of m.tiles) if (id != null) seen[kindOf(id)]++;
  }
  if (view.lastDiscard) { /* already in discards */ }
  return seen;
}

function planAllows(plan, k) {
  if (plan.startsWith('flush')) return !isSuited(k) || suitOf(k) === +plan[5];
  return true;
}

function meldsFit(plan, melds) {
  if (plan === 'pungs') return melds.every(m => m.type !== 'chow');
  if (plan.startsWith('flush')) return melds.every(m => planAllows(plan, m.kind));
  return true;
}

function pungShanten(c, m) {
  const need = 4 - m;
  let t3 = 0, t2 = 0;
  for (let k = 0; k < KIND_COUNT; k++) { if (c[k] >= 3) t3++; else if (c[k] === 2) t2++; }
  const sets = Math.min(t3, need);
  const rest = need - sets;
  const pair = t2 > 0 ? 1 : 0;
  const partials = Math.min(Math.max(t2 - pair, 0), rest);
  return 8 - 2 * (m + sets) - partials - pair;
}

export function planShanten(plan, c, m) {
  if (plan === 'any') return shanten(c, m);
  if (plan === 'pungs') return pungShanten(c, m);
  const s = +plan[5];
  const d = c.slice();
  for (let k = 0; k < 27; k++) if (suitOf(k) !== s) d[k] = 0;
  return shanten(d, m);
}

// Rough faan the plan would score: flowers and value pungs already held, likely value pungs from pairs,
// the plan's own pattern, and the concealed/self-draw bonuses while the hand stays closed.
function faanEstimate(plan, c, melds, view, open) {
  const me = view.players[view.seat];
  const seatW = 27 + me.wind, prevW = 27 + view.prevailing;
  let f = 0;
  const fl = me.flowers.map(kindOf);
  if (fl.length === 0) f += 1;
  if (fl.includes(34 + me.wind)) f += 1;
  if (fl.includes(38 + me.wind)) f += 1;
  const value = k => (isDragon(k) ? 1 : 0) + (k === seatW ? 1 : 0) + (k === prevW ? 1 : 0);
  for (const mm of melds) if (mm.type !== 'chow') f += value(mm.kind);
  for (let k = 27; k < KIND_COUNT; k++) {
    if (c[k] >= 3) f += value(k);
    else if (c[k] === 2) f += value(k) * 0.45;
  }
  if (plan === 'pungs') f += 3;
  if (plan.startsWith('flush')) {
    const honors = c.slice(27).some(n => n > 0) || melds.some(mm => isHonor(mm.kind));
    f += honors ? 3 : 5;
  }
  if (!open) f += 1.3;
  return f;
}

function threat(view) {
  // How worried to be about other hands: many melds, a one-suit table, or a short wall.
  let t = view.wallLeft < 24 ? 0.6 : 0;
  const flushSuits = [];
  for (const p of view.players) {
    if (p.seat === view.seat) continue;
    const open = p.melds.filter(m => !m.concealed);
    if (open.length >= 3) t = Math.max(t, 1);
    else if (open.length === 2) t = Math.max(t, 0.5);
    const suits = new Set(p.melds.filter(m => isSuited(m.kind)).map(m => suitOf(m.kind)));
    if (p.melds.length >= 2 && suits.size === 1) flushSuits.push([...suits][0]);
  }
  return { t, flushSuits };
}

function danger(k, seen, th) {
  if (seen[k] >= 4) return 0;
  let d;
  if (isHonor(k)) d = seen[k] >= 3 ? 0.1 : seen[k] === 2 ? 0.5 : 1.2;
  else d = (isTerminal(k) ? 0.8 : 1.3) - seen[k] * 0.25;
  if (isSuited(k) && th.flushSuits.includes(suitOf(k))) d += 2.5;
  return Math.max(d, 0);
}

function choosePlan(view, c, melds) {
  const minF = view.rules.minFaan;
  const open = melds.some(m => !m.concealed);
  let best = null;
  for (const plan of PLANS) {
    if (!meldsFit(plan, melds)) continue;
    const s = planShanten(plan, c, melds.length);
    const short = Math.max(0, minF - faanEstimate(plan, c, melds, view, open));
    // A plan is worth what it costs in tiles plus what it lacks in faan; 'any' wins ties.
    const cost = s + short * 1.6 + (plan === 'any' ? -0.3 : 0);
    if (!best || cost < best.cost) best = { plan, cost, s };
  }
  return best ? best.plan : 'any';
}

function evalDiscards(view, c, melds, plan) {
  const seen = visibleCounts(view);
  const th = threat(view);
  const minF = view.rules.minFaan;
  const open = melds.some(m => !m.concealed);
  const out = [];
  for (let k = 0; k < KIND_COUNT; k++) {
    if (!c[k]) continue;
    c[k]--;
    const s = planShanten(plan, c, melds.length);
    let ukeire = 0;
    for (let x = 0; x < KIND_COUNT; x++) {
      const left = 4 - seen[x];
      if (left <= 0 || !planAllows(plan, x)) continue;
      c[x]++;
      if (planShanten(plan, c, melds.length) < s) ukeire += left;
      c[x]--;
    }
    const short = Math.max(0, minF - faanEstimate(plan, c, melds, view, open));
    c[k]++;
    const far = s >= 2 ? 1 : s === 1 ? 0.5 : 0.2;
    const cost = s * 10 + short * 4 - ukeire * 0.12 + danger(k, seen, th) * th.t * far * 6 + (planAllows(plan, k) ? 0 : -3);
    out.push({ k, s, ukeire, cost });
  }
  out.sort((a, b) => a.cost - b.cost);
  return out;
}

export function botTurn(view, opts) {
  if (opts.win) return { type: 'win' };
  const me = view.players[view.seat];
  const c = countsOf(me.hand.map(kindOf));
  const melds = me.melds;
  const plan = choosePlan(view, c, melds);
  for (const kg of opts.kongs) {
    if (kg.type === 'added') return { type: 'kong', kind: kg.kind };
    const before = planShanten(plan, minusBest(c, plan, melds.length), melds.length);
    const d = c.slice(); d[kg.kind] -= 4;
    if (planShanten(plan, d, melds.length + 1) <= before) return { type: 'kong', kind: kg.kind };
  }
  const best = evalDiscards(view, c, melds, plan)[0];
  // Discard the newest copy of that kind so the hand keeps its order.
  const ids = me.hand.filter(id => kindOf(id) === best.k);
  return { type: 'discard', id: ids[ids.length - 1] };
}

function minusBest(c, plan, m) {
  let best = null, bs = 99;
  for (let k = 0; k < KIND_COUNT; k++) {
    if (!c[k]) continue;
    c[k]--; const s = planShanten(plan, c, m); c[k]++;
    if (s < bs) { bs = s; best = k; }
  }
  const d = c.slice(); if (best != null) d[best]--;
  return d;
}

export function botClaim(view, o) {
  if (o.win) return { type: 'win' };
  const me = view.players[view.seat];
  const k = kindOf(view.lastDiscard.id);
  const c = countsOf(me.hand.map(kindOf));
  const melds = me.melds;
  const m = melds.length;
  const minF = view.rules.minFaan;
  const before = Math.min(...PLANS.filter(p => meldsFit(p, melds)).map(p => planShanten(p, c, m)));
  const tryClaim = (take, type, start) => {
    const d = c.slice();
    for (const x of take) d[x]--;
    const newMeld = { type, kind: type === 'chow' ? start : k, concealed: false };
    const ms = [...melds, newMeld];
    let best = null;
    for (const plan of PLANS) {
      if (!meldsFit(plan, ms)) continue;
      // After the claim we discard one tile: take the best outcome.
      let s = 99;
      for (let x = 0; x < KIND_COUNT; x++) { if (!d[x]) continue; d[x]--; s = Math.min(s, planShanten(plan, d, m + 1)); d[x]++; }
      const f = faanEstimate(plan, d, ms, view, true);
      if (f < minF - 0.2) continue;
      if (!best || s < best.s) best = { s, plan };
    }
    return best && best.s < before ? best : null;
  };
  if (o.kong) { const r = tryClaim([k, k, k], 'kong'); if (r) return { type: 'kong' }; }
  if (o.pung) { const r = tryClaim([k, k], 'pung'); if (r) return { type: 'pung' }; }
  let bestChow = null;
  for (const st of o.chows) {
    const r = tryClaim([st, st + 1, st + 2].filter(x => x !== k), 'chow', st);
    if (r && (!bestChow || r.s < bestChow.s)) bestChow = { ...r, st };
  }
  if (bestChow) return { type: 'chow', start: bestChow.st };
  return null;
}

// For the human hint line: which kinds would complete this 13-tile hand (ignoring faan).
export function readyKinds(hand, melds) {
  const c = countsOf(hand.map(kindOf));
  if (shanten(c, melds.length) !== 0) return [];
  const out = [];
  for (let k = 0; k < KIND_COUNT; k++) {
    if (c[k] >= 4) continue;
    c[k]++;
    if (shanten(c, melds.length) === -1) out.push(k);
    c[k]--;
  }
  return out;
}

// For the human hint: shanten of the current hand.
export function handShanten(hand, melds) {
  return shanten(countsOf(hand.map(kindOf)), melds.length);
}
