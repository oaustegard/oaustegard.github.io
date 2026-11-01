// Poker rules as plain state: cards, hand evaluation (high, ace-to-five low, eight-or-better), the
// variants, betting under no-limit, pot-limit and fixed-limit structures, side pots, and a Match that
// carries stacks, buy-ins and rebuys from hand to hand. No DOM; the host runs it and sends each seat
// only `hand.view(seat)`.

// ---------- cards ----------
// A card is an integer 0..51: rank = c >> 2 (0 = deuce … 12 = ace), suit = c & 3 (clubs, diamonds,
// hearts, spades: the bring-in order, clubs lowest).
export const RANKS = '23456789TJQKA';
export const SUITS = 'cdhs';
export const SUIT_SYM = ['♣', '♦', '♥', '♠'];
export const rankOf = c => c >> 2;
export const suitOf = c => c & 3;
export const cardStr = c => RANKS[c >> 2] + SUITS[c & 3];
export const cardPretty = c => (RANKS[c >> 2] === 'T' ? '10' : RANKS[c >> 2]) + SUIT_SYM[c & 3];
export const parseCard = s => RANKS.indexOf(s[0].toUpperCase()) * 4 + SUITS.indexOf(s[1].toLowerCase());
export const parseCards = s => s.trim().split(/\s+/).filter(Boolean).map(parseCard);

const RANK_NAME = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'ace'];
const RANK_PLURAL = ['twos', 'threes', 'fours', 'fives', 'sixes', 'sevens', 'eights', 'nines', 'tens', 'jacks', 'queens', 'kings', 'aces'];

export function rng(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffled(cards, rand) {
  const d = cards.slice();
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  return d;
}
export const fullDeck = () => Array.from({ length: 52 }, (_, i) => i);

// ---------- evaluation ----------
// High hands score as cat << 20 | five 4-bit ranks, so a bigger number is a better hand. Categories:
// 0 high card, 1 pair, 2 two pair, 3 trips, 4 straight, 5 flush, 6 full house, 7 quads, 8 straight flush.
// Works on 1 to 7 cards; under five cards there are no straights or flushes (a stud board showing).
export const HIGH_CAT = ['High card', 'Pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house', 'Four of a kind', 'Straight flush'];

const pack = (cat, rs) => (cat << 20) | ((rs[0] ?? 0) << 16) | ((rs[1] ?? 0) << 12) | ((rs[2] ?? 0) << 8) | ((rs[3] ?? 0) << 4) | (rs[4] ?? 0);

function straightTop(mask) {
  // Bit 0 is the ace played low, bit r + 1 is rank r.
  const m = (mask << 1) | ((mask >> 12) & 1);
  for (let t = 13; t >= 4; t--) if (((m >> (t - 4)) & 31) === 31) return t - 1;
  return -1;
}
function topBits(mask, n) {
  const out = [];
  for (let r = 12; r >= 0 && out.length < n; r--) if (mask & (1 << r)) out.push(r);
  return out;
}

export function evalHigh(cards) {
  const cnt = new Array(13).fill(0);
  const sm = [0, 0, 0, 0], sc = [0, 0, 0, 0];
  for (const c of cards) { const r = c >> 2, s = c & 3; cnt[r]++; sm[s] |= 1 << r; sc[s]++; }
  const n = cards.length;
  if (n >= 5) {
    for (let s = 0; s < 4; s++) {
      if (sc[s] < 5) continue;
      const st = straightTop(sm[s]);
      if (st >= 0) return pack(8, [st]);
      // A flush outranks everything below a full house; a full house or quads needs 7 cards with a
      // flush of exactly five, so check those before returning.
      const fl = pack(5, topBits(sm[s], 5));
      const rest = groupScore(cnt, n);
      return rest > fl ? rest : fl;
    }
    const st = straightTop(sm[0] | sm[1] | sm[2] | sm[3]);
    const g = groupScore(cnt, n);
    if (st >= 0) { const s = pack(4, [st]); return g > s ? g : s; }
    return g;
  }
  return groupScore(cnt, n);
}
// Pairs, trips, quads, full houses and high cards from rank counts (best five cards).
function groupScore(cnt) {
  const quads = [], trips = [], pairs = [], singles = [];
  for (let r = 12; r >= 0; r--) {
    const k = cnt[r];
    if (k === 4) quads.push(r); else if (k === 3) trips.push(r); else if (k === 2) pairs.push(r); else if (k === 1) singles.push(r);
  }
  const kick = (excl, n) => {
    const out = [];
    for (let r = 12; r >= 0 && out.length < n; r--) if (cnt[r] && !excl.includes(r)) out.push(r);
    return out;
  };
  if (quads.length) return pack(7, [quads[0], ...kick([quads[0]], 1)]);
  if (trips.length && (trips.length > 1 || pairs.length)) {
    const t = trips[0], p = Math.max(trips[1] ?? -1, pairs[0] ?? -1);
    return pack(6, [t, p]);
  }
  if (trips.length) return pack(3, [trips[0], ...kick([trips[0]], 2)]);
  if (pairs.length >= 2) return pack(2, [pairs[0], pairs[1], ...kick([pairs[0], pairs[1]], 1)]);
  if (pairs.length) return pack(1, [pairs[0], ...kick([pairs[0]], 3)]);
  return pack(0, kick([], 5));
}

export function highName(score) {
  const cat = score >> 20, r = i => (score >> (16 - 4 * i)) & 15;
  switch (cat) {
    case 8: return r(0) === 12 ? 'Royal flush' : `Straight flush, ${RANK_NAME[r(0)]} high`;
    case 7: return `Four ${RANK_PLURAL[r(0)]}`;
    case 6: return `Full house, ${RANK_PLURAL[r(0)]} over ${RANK_PLURAL[r(1)]}`;
    case 5: return `Flush, ${RANK_NAME[r(0)]} high`;
    case 4: return `Straight, ${RANK_NAME[r(0)]} high`;
    case 3: return `Three ${RANK_PLURAL[r(0)]}`;
    case 2: return `Two pair, ${RANK_PLURAL[r(0)]} and ${RANK_PLURAL[r(1)]}`;
    case 1: return `Pair of ${RANK_PLURAL[r(0)]}`;
    default: return `${RANK_NAME[r(0)][0].toUpperCase() + RANK_NAME[r(0)].slice(1)} high`;
  }
}

// Ace-to-five low: aces are low, straights and flushes do not count, pairs do. Scores as cat << 20 |
// ranks (ace = 0 … king = 12), highest rank first, so a SMALLER number is a better low. Categories:
// 0 no pair, 1 pair, 2 two pair, 3 trips, 4 full house, 5 quads.
const lowRank = c => ((c >> 2) + 1) % 13;
function low5(cards) {
  const cnt = new Array(13).fill(0);
  for (const c of cards) cnt[lowRank(c)]++;
  const groups = [];
  for (let r = 12; r >= 0; r--) if (cnt[r]) groups.push([cnt[r], r]);
  groups.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  const shape = groups.map(g => g[0]).join('');
  const cat = { '11111': 0, '2111': 1, '221': 2, '311': 3, '32': 4, '41': 5, '1111': 0, '111': 0, '11': 0, '1': 0, '211': 1, '21': 1, '2': 1, '22': 2, '31': 3, '3': 3, '4': 5 }[shape] ?? 0;
  return pack(cat, groups.map(g => g[1]));
}
// Five or more cards: the best low straight from rank counts. Take the five lowest ranks if there are
// five; otherwise pair up as cheaply as possible (lowest pair, two lowest pairs, lowest trips…).
export function evalLow(cards) {
  if (cards.length < 5) return low5(cards);
  const cnt = new Array(13).fill(0);
  for (const c of cards) cnt[((c >> 2) + 1) % 13]++;
  const ranks = [];
  for (let r = 0; r < 13; r++) if (cnt[r]) ranks.push(r);
  const d = ranks.length, desc = a => a.slice().sort((x, y) => y - x);
  if (d >= 5) return pack(0, desc(ranks.slice(0, 5)));
  const twos = ranks.filter(r => cnt[r] >= 2), threes = ranks.filter(r => cnt[r] >= 3);
  if (d === 4) return pack(1, [twos[0], ...desc(ranks.filter(r => r !== twos[0]))]);
  if (d === 3) {
    if (twos.length >= 2) return pack(2, [twos[1], twos[0], ranks.find(r => r !== twos[0] && r !== twos[1])]);
    return pack(3, [threes[0], ...desc(ranks.filter(r => r !== threes[0]))]);
  }
  // Two ranks: a full house if one has three and the other two, else quads.
  for (const t of threes) { const p = ranks.find(r => r !== t && cnt[r] >= 2); if (p != null) return pack(4, [t, p]); }
  const q = ranks.find(r => cnt[r] >= 4);
  return pack(5, [q, ranks.find(r => r !== q)]);
}
// Eight or better: five different ranks, none above an eight.
export const qualifies8 = low => low >> 20 === 0 && ((low >> 16) & 15) <= 7;
export function lowName(low) {
  const cat = low >> 20;
  if (cat) return 'No low';
  const rs = [0, 1, 2, 3, 4].map(i => (low >> (16 - 4 * i)) & 15).map(r => (r === 0 ? 'A' : RANKS[r - 1] === 'T' ? '10' : RANKS[r - 1]));
  return rs.join('-') + ' low';
}

export function forCombos(arr, k, fn) {
  const n = arr.length, idx = Array.from({ length: k }, (_, i) => i), pick = new Array(k);
  if (k > n) return;
  for (;;) {
    for (let i = 0; i < k; i++) pick[i] = arr[idx[i]];
    fn(pick);
    let i = k - 1;
    while (i >= 0 && idx[i] === n - k + i) i--;
    if (i < 0) return;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
}

// The best high and low a player makes. `use` is 'any' (best five of all cards) or 'omaha' (exactly two
// of the hole cards and three of the board). Returns { high, low, highCards, lowCards }; low is null
// when the variant has no low or (for 'hilo8') nothing qualifies.
export function bestHands(hole, board, use, split) {
  let high = -1, highCards = null, low = Infinity, lowCards = null;
  const wantHigh = split !== 'low', wantLow = split === 'low' || split === 'hilo8';
  const consider = five => {
    if (wantHigh) { const h = evalHigh(five); if (h > high) { high = h; highCards = five.slice(); } }
    if (wantLow) { const l = evalLow(five); if (l < low) { low = l; lowCards = five.slice(); } }
  };
  if (use === 'omaha') {
    forCombos(hole, 2, h2 => forCombos(board, 3, b3 => consider([...h2, ...b3])));
  } else {
    const all = [...hole, ...board];
    if (all.length <= 5) consider(all); else forCombos(all, 5, consider);
  }
  if (split === 'hilo8' && !(low < Infinity && qualifies8(low))) { low = null; lowCards = null; }
  if (!wantLow) low = null;
  return { high: wantHigh ? high : null, low: low === Infinity ? null : low, highCards, lowCards };
}

// ---------- variants ----------
// kind 'board': hole cards plus a shared board. 'stud': each street deals each player cards face down
// (d) or face up (u). 'draw': five cards, one draw.
export const VARIANTS = {
  holdem: { name: "Texas Hold'em", short: "Hold'em", kind: 'board', hole: 2, use: 'any', split: 'high', forced: 'blinds', structures: ['nl', 'pl', 'fl'], def: 'nl', maxSeats: 9 },
  omaha: { name: 'Omaha', short: 'Omaha', kind: 'board', hole: 4, use: 'omaha', split: 'high', forced: 'blinds', structures: ['pl', 'nl', 'fl'], def: 'pl', maxSeats: 9 },
  omaha8: { name: 'Omaha Hi-Lo (eight or better)', short: 'Omaha 8', kind: 'board', hole: 4, use: 'omaha', split: 'hilo8', forced: 'blinds', structures: ['fl', 'pl'], def: 'fl', maxSeats: 9 },
  stud7: { name: 'Seven-Card Stud', short: 'Stud', kind: 'stud', streets: ['ddu', 'u', 'u', 'u', 'd'], bigFrom: 2, use: 'any', split: 'high', forced: 'ante', structures: ['fl'], def: 'fl', maxSeats: 8 },
  stud8: { name: 'Seven-Card Stud Hi-Lo (eight or better)', short: 'Stud 8', kind: 'stud', streets: ['ddu', 'u', 'u', 'u', 'd'], bigFrom: 2, use: 'any', split: 'hilo8', forced: 'ante', structures: ['fl'], def: 'fl', maxSeats: 8 },
  razz: { name: 'Razz (seven-card stud, ace-to-five low)', short: 'Razz', kind: 'stud', streets: ['ddu', 'u', 'u', 'u', 'd'], bigFrom: 2, use: 'any', split: 'low', forced: 'ante', structures: ['fl'], def: 'fl', maxSeats: 8 },
  stud5: { name: 'Five-Card Stud', short: '5 Stud', kind: 'stud', streets: ['du', 'u', 'u', 'u'], bigFrom: 2, use: 'any', split: 'high', forced: 'ante', structures: ['fl'], def: 'fl', maxSeats: 9 },
  draw5: { name: 'Five-Card Draw', short: 'Draw', kind: 'draw', hole: 5, use: 'any', split: 'high', forced: 'blinds', structures: ['fl', 'pl', 'nl'], def: 'fl', maxSeats: 6 },
};
// Mixed games rotate through these, one orbit each (the H.O.R.S.E. order).
export const MIXED = ['holdem', 'omaha8', 'razz', 'stud7', 'stud8'];
export const STRUCT_NAME = { nl: 'No-limit', pl: 'Pot-limit', fl: 'Fixed-limit' };
const BOARD_STREETS = ['Preflop', 'Flop', 'Turn', 'River'];
const STUD_STREETS = { 5: ['Third street', 'Fourth street', 'Fifth street', 'Sixth street', 'Seventh street'], 4: ['Second street', 'Third street', 'Fourth street', 'Fifth street'] };

// Forced bets and limits from one number, the big blind (also the fixed-limit small bet).
export function stakesFor(bb) {
  return { sb: Math.max(1, Math.floor(bb / 2)), bb, small: bb, big: bb * 2, ante: Math.max(1, Math.round(bb / 10)), bringIn: Math.max(Math.max(1, Math.round(bb / 10)), Math.round(bb / 4)) };
}

// ---------- one hand ----------
export class Hand {
  // seats: [{ seat, stack }] for the players dealt in; n: seats at the table; button: a seat among them.
  constructor({ variant = 'holdem', structure, stakes, seats, n, button, rand = Math.random, handNo = 1 }) {
    const V = VARIANTS[variant];
    if (!V) throw new Error('unknown variant ' + variant);
    this.variant = variant; this.V = V;
    this.structure = V.structures.includes(structure) ? structure : V.def;
    this.stakes = stakes; this.n = n; this.button = button; this.handNo = handNo; this.rand = rand;
    this.deck = shuffled(fullDeck(), rand);
    this.muck = [];
    this.board = [];
    this.players = Array(n).fill(null);
    for (const { seat, stack } of seats) this.players[seat] = { seat, stack, start: stack, bet: 0, committed: 0, folded: false, allIn: false, acted: false, mayRaise: true, cards: [], last: null, drew: null };
    this.order = [];   // seats clockwise, starting left of the button
    for (let i = 1; i <= n; i++) { const s = (button + i) % n; if (this.players[s]) this.order.push(s); }
    if (this.order.length < 2) throw new Error('a hand needs two players');
    this.pot = 0;                 // chips collected from finished betting rounds
    this.street = 0;
    this.phase = 'bet';
    this.toAct = -1;
    this.events = []; this.evN = 0;
    this.result = null;
    this.bringIn = null;          // seat owing the bring-in at the start of a stud hand
    this.streetCount = V.kind === 'board' ? 4 : V.kind === 'draw' ? 2 : V.streets.length;
    this.log('start', { handNo, variant, structure: this.structure });
    this.postForced();
    this.dealStreet();
    this.beginRound(true);
  }

  log(t, data = {}) { this.events.push({ n: ++this.evN, t, ...data }); }
  draw1() {
    if (!this.deck.length) { this.deck = shuffled(this.muck, this.rand); this.muck = []; }
    return this.deck.pop();
  }
  live() { return this.order.filter(s => !this.players[s].folded); }
  canAct() { return this.order.filter(s => { const p = this.players[s]; return !p.folded && !p.allIn; }); }
  commit(p, amt) {
    amt = Math.min(amt, p.stack);
    p.stack -= amt; p.bet += amt; p.committed += amt;
    if (p.stack === 0) p.allIn = true;
    return amt;
  }

  postForced() {
    const st = this.stakes;
    if (this.V.forced === 'ante') {
      for (const s of this.order) { const p = this.players[s]; const a = this.commit(p, st.ante); p.bet = 0; this.pot += a; this.log('ante', { seat: s, amount: a }); }
      return;
    }
    const hu = this.order.length === 2;
    this.sbSeat = hu ? this.button : this.order[0];
    this.bbSeat = hu ? this.order[0] : this.order[1];
    const a = this.commit(this.players[this.sbSeat], st.sb); this.log('blind', { seat: this.sbSeat, amount: a, big: false });
    const b = this.commit(this.players[this.bbSeat], st.bb); this.log('blind', { seat: this.bbSeat, amount: b, big: true });
  }

  streetName() {
    if (this.V.kind === 'board') return BOARD_STREETS[this.street];
    if (this.V.kind === 'draw') return this.phase === 'draw' ? 'Draw' : this.street === 0 ? 'Before the draw' : 'After the draw';
    return STUD_STREETS[this.V.streets.length][this.street];
  }

  dealStreet() {
    const V = this.V;
    if (V.kind === 'board') {
      if (this.street === 0) {
        for (let k = 0; k < V.hole; k++) for (const s of this.order) this.players[s].cards.push({ c: this.draw1(), up: false });
      } else {
        this.muck.push(this.draw1());   // burn
        const k = this.street === 1 ? 3 : 1;
        for (let i = 0; i < k; i++) this.board.push(this.draw1());
        this.log('board', { cards: this.board.slice(), street: this.street });
      }
    } else if (V.kind === 'draw') {
      if (this.street === 0) for (let k = 0; k < V.hole; k++) for (const s of this.order) this.players[s].cards.push({ c: this.draw1(), up: false });
    } else {
      const pattern = V.streets[this.street], live = this.live();
      // Eight players can outrun the deck on the last street; then one card is dealt face up to share.
      if (this.deck.length < live.length * pattern.length) {
        const c = this.draw1(); this.board.push(c); this.log('board', { cards: this.board.slice(), street: this.street });
      } else {
        for (const ch of pattern) for (const s of live) this.players[s].cards.push({ c: this.draw1(), up: ch === 'u' });
      }
    }
    this.log('street', { street: this.street, name: this.streetName() });
  }

  // Bet unit for fixed limit on this street.
  unit() {
    const V = this.V, st = this.stakes;
    if (V.kind === 'board') return this.street >= 2 ? st.big : st.small;
    if (V.kind === 'draw') return this.street >= 1 ? st.big : st.small;
    if (this.street >= V.bigFrom) return st.big;
    // An open pair on the second up card lets the high stud games bet the big bet.
    if (this.street === 1 && V.split !== 'low' && this.live().some(s => { const up = this.players[s].cards.filter(x => x.up).map(x => x.c >> 2); return up.length >= 2 && new Set(up).size < up.length; })) return st.big;
    return st.small;
  }

  // Start a betting round. Picks who acts first; skips the round if fewer than two can act.
  beginRound(first) {
    for (const s of this.order) { const p = this.players[s]; p.acted = false; p.mayRaise = true; if (!(first && this.V.forced === 'blinds')) p.bet = 0; }
    this.phase = 'bet';
    const V = this.V;
    if (first && V.forced === 'blinds') {
      this.currentBet = this.stakes.bb; this.lastRaise = this.stakes.bb; this.bets = 1;
      const i = this.order.indexOf(this.bbSeat);
      this.toAct = this.nextFrom(this.order[(i + 1) % this.order.length], true);
    } else {
      this.currentBet = 0; this.lastRaise = this.stakes.bb; this.bets = 0;
      if (V.kind === 'stud') this.toAct = first ? this.bringInSeat() : this.studLeader();
      else this.toAct = this.nextFrom(this.order[0], true);
      if (first && V.kind === 'stud') this.bringIn = this.toAct;
    }
    if (this.roundDone()) this.endRound();
  }

  // First seat at or after `from` (clockwise) that may still act.
  nextFrom(from, inclusive) {
    const L = this.order.length, i0 = this.order.indexOf(from);
    for (let k = inclusive ? 0 : 1; k <= L; k++) {
      const s = this.order[(i0 + k) % L], p = this.players[s];
      if (!p.folded && !p.allIn) return s;
    }
    return -1;
  }

  upCards(s) { return this.players[s].cards.filter(x => x.up).map(x => x.c); }
  bringInSeat() {
    // Lowest up card brings in (clubs lowest); in razz the highest (an ace is low, spades highest).
    const low = this.V.split === 'low';
    let best = -1, bestKey = 0;
    for (const s of this.live()) {
      const c = this.upCards(s)[0];
      const r = low ? lowRank(c) : c >> 2;
      const key = low ? r * 4 + (c & 3) : -(r * 4 + (3 - (c & 3)));
      if (best < 0 || key > bestKey) { best = s; bestKey = key; }
    }
    return this.players[best].allIn ? this.nextFrom(best, false) : best;
  }
  studLeader() {
    // Best hand showing acts first (lowest in razz); ties go to the first seat clockwise from the button.
    const low = this.V.split === 'low';
    let best = -1, bestScore = 0;
    for (const s of this.order) {
      const p = this.players[s];
      if (p.folded || p.allIn) continue;
      const up = this.upCards(s);
      const sc = low ? -evalLow(up) : evalHigh(up);
      if (best < 0 || sc > bestScore) { best = s; bestScore = sc; }
    }
    return best;
  }

  roundDone() {
    const live = this.live();
    if (live.length <= 1) return true;
    const can = this.canAct();
    if (this.bringIn != null && this.toAct === this.bringIn && this.street === 0 && can.includes(this.bringIn)) return false;
    if (can.length === 0) return true;
    if (can.length === 1) return this.players[can[0]].bet >= this.currentBet;
    return can.every(s => { const p = this.players[s]; return p.acted && p.bet === this.currentBet; });
  }

  options(seat) {
    if (this.phase === 'over' || seat !== this.toAct) return null;
    const p = this.players[seat];
    if (this.phase === 'draw') return { kind: 'draw', max: 5, cards: p.cards.map(x => x.c) };
    const toCall = Math.max(0, this.currentBet - p.bet);
    const o = { kind: 'bet', toCall, call: Math.min(toCall, p.stack), canCheck: toCall === 0, stack: p.stack, bet: p.bet, currentBet: this.currentBet,
      pot: this.potTotal(), structure: this.structure, raise: null, bringIn: null, street: this.street };
    if (this.bringIn === seat && this.street === 0 && this.currentBet === 0) {
      const bi = Math.min(this.stakes.bringIn, p.stack);
      o.bringIn = bi; o.canCheck = false; o.toCall = 0; o.call = 0;
      if (p.stack > bi) o.raise = { min: Math.min(this.unit(), p.stack), max: Math.min(this.unit(), p.stack), fixed: true, label: 'Complete' };
      return o;
    }
    if (p.mayRaise && p.stack > toCall && this.othersCanCall(seat)) {
      const all = p.bet + p.stack;
      let min, max;
      if (this.structure === 'fl') {
        if (this.bets < 4) { min = max = Math.min((this.bets + 1) * this.unit(), all); }
      } else {
        min = Math.min(this.currentBet + Math.max(this.lastRaise, this.stakes.bb), all);
        max = this.structure === 'nl' ? all : Math.min(all, this.currentBet + this.potTotal() + toCall);
      }
      if (min != null && max >= min && max > this.currentBet) o.raise = { min, max, fixed: this.structure === 'fl', label: this.currentBet === 0 ? 'Bet' : this.bets === 0 ? 'Complete' : 'Raise' };
    }
    return o;
  }
  othersCanCall(seat) { return this.order.some(s => s !== seat && !this.players[s].folded && !this.players[s].allIn); }
  potTotal() { return this.pot + this.order.reduce((a, s) => a + this.players[s].bet, 0); }

  // Apply an action from the seat to act. Throws on an illegal one.
  act(seat, a) {
    if (this.phase === 'over') throw new Error('hand is over');
    if (seat !== this.toAct) throw new Error('not your turn');
    const p = this.players[seat], o = this.options(seat);
    if (this.phase === 'draw') {
      const discard = (a && a.discard) || [];
      const own = p.cards.map(x => x.c);
      if (discard.length > 5 || discard.some(c => !own.includes(c)) || new Set(discard).size !== discard.length) throw new Error('bad discard');
      p.cards = p.cards.filter(x => !discard.includes(x.c));
      this.muck.push(...discard);
      for (let i = 0; i < discard.length; i++) p.cards.push({ c: this.draw1(), up: false, fresh: true });
      p.drew = discard.length;
      this.log('draw', { seat, count: discard.length });
      this.advanceDraw(seat);
      return;
    }
    const type = a && a.type;
    if (type === 'bringin') {
      if (o.bringIn == null) throw new Error('no bring-in owed');
      const amt = this.commit(p, o.bringIn);
      this.currentBet = Math.max(this.currentBet, p.bet);
      p.acted = true; p.mayRaise = false; p.last = 'bring-in';
      // Completing to the small bet still counts as the first bet; others may call the bring-in or complete.
      this.bringIn = null;
      this.log('bringin', { seat, amount: amt });
      for (const s of this.order) if (s !== seat) this.players[s].mayRaise = true;
    } else if (type === 'fold') {
      if (o.bringIn != null) throw new Error('the bring-in is forced');
      p.folded = true; p.last = 'fold'; p.acted = true;
      if (this.bringIn === seat) this.bringIn = null;
      this.muck.push(...p.cards.map(x => x.c));
      this.log('fold', { seat });
    } else if (type === 'check') {
      if (!o.canCheck) throw new Error('cannot check');
      p.acted = true; p.mayRaise = false; p.last = 'check';
      this.log('check', { seat });
    } else if (type === 'call') {
      if (o.toCall <= 0) throw new Error('nothing to call');
      const amt = this.commit(p, o.toCall);
      p.acted = true; p.mayRaise = false; p.last = p.allIn ? 'all-in' : 'call';
      this.log('call', { seat, amount: amt, allIn: p.allIn });
    } else if (type === 'raise') {
      if (!o.raise) throw new Error('cannot raise');
      const all = p.bet + p.stack;
      let to = Math.round(+a.to);
      if (!(to >= o.raise.min && to <= o.raise.max) && to !== all) throw new Error(`raise must be ${o.raise.min}–${o.raise.max}`);
      if (to > all) to = all;
      const prev = this.currentBet, inc = to - prev;
      const wasBringIn = this.bringIn === seat;
      this.commit(p, to - p.bet);
      this.currentBet = to;
      const full = this.structure === 'fl' ? to >= (this.bets + 1) * this.unit() || wasBringIn : inc >= Math.max(this.lastRaise, this.stakes.bb) || prev === 0 && inc >= this.stakes.bb;
      p.acted = true; p.mayRaise = false;
      if (wasBringIn) this.bringIn = null;
      if (full) {
        if (this.structure !== 'fl') this.lastRaise = Math.max(inc, this.stakes.bb);
        this.bets++;
        for (const s of this.order) if (s !== seat) { const q = this.players[s]; q.acted = false; q.mayRaise = true; }
      } else {
        // A short all-in raise: whoever has to call it acts again, but only reopens raising for those who had not acted.
        for (const s of this.order) if (s !== seat) { const q = this.players[s]; if (q.bet < to) q.acted = false; }
      }
      p.last = p.allIn ? 'all-in' : prev === 0 ? 'bet' : wasBringIn ? 'complete' : 'raise';
      this.log(prev === 0 ? 'bet' : 'raise', { seat, to, allIn: p.allIn, complete: wasBringIn });
    } else throw new Error('unknown action ' + type);

    if (this.roundDone()) this.endRound();
    else this.toAct = this.nextFrom(seat, false);
  }

  endRound() {
    for (const s of this.order) { const p = this.players[s]; this.pot += p.bet; p.bet = 0; }
    this.returnUncalled();
    const live = this.live();
    if (live.length === 1) return this.finish();
    const canBet = this.canAct().length >= 2;
    // The draw happens after the first round of draw poker, even when everyone is all in.
    if (this.V.kind === 'draw' && this.street === 0) {
      this.street = 1;
      this.phase = 'draw';
      this.drawQueue = this.order.filter(s => !this.players[s].folded);
      this.toAct = this.drawQueue[0];
      this.canBetAfterDraw = canBet;
      this.log('street', { street: this.street, name: 'Draw' });
      return;
    }
    if (this.street + 1 >= this.streetCount) return this.finish();
    this.street++;
    this.dealStreet();
    if (canBet) { for (const s of this.order) this.players[s].last = null; this.beginRound(false); }
    else this.endRound();   // all in: run out the rest of the cards
  }
  advanceDraw(seat) {
    const i = this.drawQueue.indexOf(seat);
    if (i + 1 < this.drawQueue.length) { this.toAct = this.drawQueue[i + 1]; return; }
    this.log('street', { street: 1, name: 'After the draw' });
    for (const s of this.order) this.players[s].last = null;
    if (this.canBetAfterDraw) { this.beginRound(false); return; }
    this.finish();
  }

  // The part of the last bet nobody could match goes back before the pots are built.
  returnUncalled() {
    const live = this.order.filter(s => !this.players[s].folded);
    const sorted = this.order.map(s => this.players[s].committed).sort((a, b) => b - a);
    const top = sorted[0], second = sorted[1] ?? 0;
    if (top <= second) return;
    const s = live.find(x => this.players[x].committed === top);
    if (s == null) return;
    const p = this.players[s], back = top - second;
    p.committed -= back; p.stack += back; this.pot -= back;
    if (p.stack > 0) p.allIn = false;
    this.log('return', { seat: s, amount: back });
  }

  pots() {
    const rem = new Map(this.order.map(s => [s, this.players[s].committed]));
    const pots = [];
    for (;;) {
      const live = this.order.filter(s => !this.players[s].folded && rem.get(s) > 0);
      if (!live.length) break;
      const m = Math.min(...live.map(s => rem.get(s)));
      let amount = 0;
      for (const s of this.order) { const t = Math.min(rem.get(s), m); amount += t; rem.set(s, rem.get(s) - t); }
      const prev = pots[pots.length - 1];
      if (prev && prev.eligible.length === live.length) prev.amount += amount; else pots.push({ amount, eligible: live });
    }
    const left = [...rem.values()].reduce((a, b) => a + b, 0);
    if (left && pots.length) pots[pots.length - 1].amount += left;
    return pots;
  }

  holeOf(s) { return this.players[s].cards.map(x => x.c); }
  evaluate(s) { return bestHands(this.holeOf(s), this.board, this.V.use, this.V.split); }

  finish() {
    this.phase = 'over'; this.toAct = -1;
    const live = this.live();
    const res = { uncontested: live.length === 1, awards: [], shown: {}, hands: {}, pots: [] };
    const give = (s, amt, why) => {
      if (amt <= 0) return;
      this.players[s].stack += amt;
      const a = res.awards.find(x => x.seat === s && x.why === why);
      if (a) a.amount += amt; else res.awards.push({ seat: s, amount: amt, why });
    };
    if (res.uncontested) {
      give(live[0], this.pot, 'uncontested');
      res.pots.push({ amount: this.pot, winners: [live[0]] });
    } else {
      const ev = {};
      for (const s of live) {
        ev[s] = this.evaluate(s);
        res.shown[s] = this.holeOf(s);
        const e = ev[s];
        res.hands[s] = {
          high: e.high != null ? highName(e.high) : null, low: e.low != null ? lowName(e.low) : null,
          highCards: e.highCards, lowCards: e.lowCards,
        };
      }
      // Odd chips go to the first winner clockwise from the button.
      const split = (amt, winners, why) => {
        const ws = this.order.filter(s => winners.includes(s));
        const each = Math.floor(amt / ws.length);
        let odd = amt - each * ws.length;
        for (const s of ws) give(s, each + (odd-- > 0 ? 1 : 0), why);
      };
      for (const pot of this.pots()) {
        const el = pot.eligible;
        const hiW = this.V.split === 'low' ? [] : winnersBy(el, s => ev[s].high, (a, b) => a > b);
        const lows = el.filter(s => ev[s].low != null);
        const loW = lows.length ? winnersBy(lows, s => ev[s].low, (a, b) => a < b) : [];
        if (this.V.split === 'low') split(pot.amount, loW, 'low');
        else if (this.V.split === 'hilo8' && loW.length) {
          const hi = Math.ceil(pot.amount / 2);
          split(hi, hiW, 'high'); split(pot.amount - hi, loW, 'low');
        } else split(pot.amount, hiW, 'high');
        res.pots.push({ amount: pot.amount, eligible: el, high: hiW, low: loW });
      }
    }
    this.pot = 0;
    for (const s of this.order) this.players[s].committed = 0;
    this.result = res;
    this.log('end', { awards: res.awards });
  }

  view(seat) {
    const showdown = this.result && !this.result.uncontested ? this.result.shown : {};
    const players = this.players.map((p, s) => {
      if (!p) return null;
      const mine = s === seat;
      return {
        seat: s, stack: p.stack, bet: p.bet, committed: p.committed, folded: p.folded, allIn: p.allIn, last: p.last, drew: p.drew,
        cards: p.cards.map(x => ({ c: mine || x.up || (showdown[s] && !p.folded) ? x.c : null, up: x.up })),
      };
    });
    return {
      seat, handNo: this.handNo, variant: this.variant, structure: this.structure, stakes: this.stakes,
      phase: this.phase, street: this.street, streetName: this.streetName(), button: this.button, toAct: this.toAct,
      sb: this.sbSeat ?? null, bb: this.bbSeat ?? null,
      board: this.board.slice(), pot: this.pot, potTotal: this.potTotal(), currentBet: this.currentBet || 0,
      players, events: this.events.slice(), result: this.result,
    };
  }
}

function winnersBy(seats, key, better) {
  let best = null, out = [];
  for (const s of seats) {
    const k = key(s);
    if (k == null) continue;
    if (best == null || better(k, best)) { best = k; out = [s]; } else if (k === best) out.push(s);
  }
  return out;
}

// ---------- a session of many hands ----------
// Stacks start at the buy-in. A player who runs out may rebuy for the same amount (if the table allows
// it) or sits out. `bought` totals what each seat has put in, so net = stack - bought.
export class Match {
  constructor({ n, buyIn = 2000, bb = 20, rebuys = 'unlimited', game = 'holdem', structure = null, rising = 0, maxHands = 0, seed, firstButton = 0, present = null }) {
    this.n = n; this.buyIn = buyIn; this.baseBB = bb; this.rebuys = rebuys; this.game = game; this.structure = structure;
    this.rising = rising; this.maxHands = maxHands;
    this.rand = seed != null ? rng(seed) : Math.random;
    this.present = present ? present.slice() : Array(n).fill(true);
    this.stacks = this.present.map(p => (p ? buyIn : 0));
    this.bought = this.present.map(p => (p ? buyIn : 0));
    this.rebuysUsed = Array(n).fill(0);
    this.out = this.present.map(p => !p);
    this.handNo = 0;
    this.button = (firstButton - 1 + n) % n;
    this.history = [];
    this.ended = false;
    this.hand = null;
  }
  get level() { return this.rising ? Math.floor(this.handNo / this.rising) : 0; }
  bb() {
    const steps = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50, 60, 80, 100];
    return Math.round(this.baseBB * steps[Math.min(this.level, steps.length - 1)]);
  }
  variantFor(handNo = this.handNo) {
    if (this.game !== 'mixed') return this.game;
    const players = this.present.filter(Boolean).length || this.n;
    return MIXED[Math.floor(handNo / players) % MIXED.length];
  }
  canRebuy(seat) {
    if (!this.present[seat]) return false;
    if (this.rebuys === 'unlimited') return true;
    if (this.rebuys === 'none' || !this.rebuys) return false;
    return this.rebuysUsed[seat] < +this.rebuys;
  }
  busted() { return this.present.map((p, s) => p && !this.out[s] && this.stacks[s] === 0 ? s : -1).filter(s => s >= 0); }
  rebuy(seat) {
    if (!this.canRebuy(seat)) throw new Error('no rebuy');
    this.stacks[seat] += this.buyIn; this.bought[seat] += this.buyIn; this.rebuysUsed[seat]++; this.out[seat] = false;
  }
  sitOut(seat) { this.out[seat] = true; }
  sitIn(seat) { if (this.present[seat] && this.stacks[seat] > 0) this.out[seat] = false; }
  join(seat) { if (!this.present[seat]) { this.present[seat] = true; this.stacks[seat] = this.buyIn; this.bought[seat] += this.buyIn; this.out[seat] = false; } }
  active() { return this.present.map((p, s) => (p && !this.out[s] && this.stacks[s] > 0 ? s : -1)).filter(s => s >= 0); }
  get over() { return this.ended || (this.maxHands > 0 && this.handNo >= this.maxHands) || (this.active().length < 2 && this.busted().every(s => !this.canRebuy(s))); }

  newHand() {
    const act = this.active();
    if (act.length < 2) throw new Error('need two players with chips');
    for (let i = 1; i <= this.n; i++) { const s = (this.button + i) % this.n; if (act.includes(s)) { this.button = s; break; } }
    const variant = this.variantFor();
    const V = VARIANTS[variant];
    const structure = this.structure && V.structures.includes(this.structure) ? this.structure : V.def;
    this.hand = new Hand({ variant, structure, stakes: stakesFor(this.bb()), seats: act.map(s => ({ seat: s, stack: this.stacks[s] })), n: this.n, button: this.button, rand: this.rand, handNo: this.handNo + 1 });
    return this.hand;
  }
  finishHand() {
    const h = this.hand;
    for (const p of h.players) if (p) this.stacks[p.seat] = p.stack;
    this.handNo++;
    this.history.push({ handNo: h.handNo, variant: h.variant, awards: h.result ? h.result.awards : [], net: h.players.map(p => (p ? p.stack - p.start : 0)) });
    if (this.history.length > 100) this.history.shift();
  }
  standings() {
    return this.present.map((p, s) => (p ? { seat: s, stack: this.stacks[s], bought: this.bought[s], net: this.stacks[s] - this.bought[s], rebuys: this.rebuysUsed[s], out: this.out[s] } : null)).filter(Boolean);
  }
  chipsInPlay() { return this.stacks.reduce((a, b) => a + b, 0) + (this.hand && this.hand.phase !== 'over' ? this.hand.potTotal() : 0); }
}
