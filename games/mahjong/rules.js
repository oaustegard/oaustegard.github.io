// Mahjong rules: Hong Kong old style. Plain state, no DOM, no timing, no network.
// `node tests/mahjong-rules.mjs` tests it. The page (index.html) drives a Match of Hands and the
// network layer sends each seat only Hand.view(seat), so a guest never holds a tile it cannot see.
//
// Tiles: 144 ids. Ids 0..135 are four copies of 34 kinds (kind = id >> 2); 136..143 are the eight
// bonus tiles, one each (kind = 34 + id - 136).
//   kinds 0-8 characters 萬 1-9, 9-17 dots 筒 1-9, 18-26 bamboo 索 1-9,
//   27-30 winds 東南西北, 31-33 dragons 中 (red) 發 (green) 白 (white),
//   34-37 flowers 梅蘭菊竹, 38-41 seasons 春夏秋冬 (each numbered 1-4, matching seat winds E S W N).
// Seats 0-3 are fixed places at the table. Play runs 0 → 1 → 2 → 3 (counter-clockwise seen from above,
// so seat+1 sits on your right). Seat winds follow the dealer: the dealer is East.

export const KIND_COUNT = 34;
export const WIND_ZH = ['東', '南', '西', '北'];
export const WIND_EN = ['East', 'South', 'West', 'North'];
export const SUIT_EN = ['Characters', 'Dots', 'Bamboo'];
export const DRAGON_EN = ['Red', 'Green', 'White'];
export const FLOWER_EN = ['Plum', 'Orchid', 'Chrysanthemum', 'Bamboo'];
export const SEASON_EN = ['Spring', 'Summer', 'Autumn', 'Winter'];

export const kindOf = id => (id < 136 ? id >> 2 : 34 + id - 136);
export const isSuited = k => k < 27;
export const suitOf = k => (k < 27 ? Math.floor(k / 9) : -1);
export const rankOf = k => (k < 27 ? (k % 9) + 1 : 0);
export const isHonor = k => k >= 27 && k < 34;
export const isWind = k => k >= 27 && k <= 30;
export const isDragon = k => k >= 31 && k <= 33;
export const isBonus = k => k >= 34;
export const isTerminal = k => k < 27 && (k % 9 === 0 || k % 9 === 8);
export const isOrphan = k => isTerminal(k) || isHonor(k);
export const ORPHANS = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];

export function kindName(k) {
  if (k < 27) return rankOf(k) + ' ' + SUIT_EN[suitOf(k)];
  if (k < 31) return WIND_EN[k - 27] + ' wind';
  if (k < 34) return DRAGON_EN[k - 31] + ' dragon';
  if (k < 38) return FLOWER_EN[k - 34] + ' (flower ' + (k - 33) + ')';
  return SEASON_EN[k - 38] + ' (season ' + (k - 37) + ')';
}
// Short label, e.g. "3m", "7p", "E", "Rd", "F2".
export function kindShort(k) {
  if (k < 27) return rankOf(k) + 'mps'[suitOf(k)];
  if (k < 31) return 'ESWN'[k - 27];
  if (k < 34) return ['Rd', 'Gd', 'Wd'][k - 31];
  if (k < 38) return 'F' + (k - 33);
  return 'S' + (k - 37);
}

// Seeded PRNG so a seed reproduces a deal (?seed=N, tests, and the host's shuffle).
export function makeRng(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULT_RULES = { minFaan: 3, cap: 10, length: 'east' };

// Half-spicy (半辣) doubling table: points for 0..10 faan. A limit hand scores the cap.
export const POINTS = [1, 2, 4, 8, 16, 24, 32, 48, 64, 96, 128];
export const pointsFor = (faan, cap = 10) => POINTS[Math.min(faan, cap, POINTS.length - 1)];

export function countsOf(kinds) {
  const c = new Array(KIND_COUNT).fill(0);
  for (const k of kinds) if (k < KIND_COUNT) c[k]++;
  return c;
}

// ---------- hand shape ----------

// Every way to split the concealed counts into `need` sets (pung or chow) plus one pair.
export function decompositions(counts, need) {
  const out = [];
  const c = counts.slice();
  const sets = [];
  function rec(i) {
    while (i < KIND_COUNT && c[i] === 0) i++;
    if (i === KIND_COUNT) { if (sets.length === need) out.push(sets.slice()); return; }
    if (sets.length >= need) return;
    if (c[i] >= 3) { c[i] -= 3; sets.push({ type: 'pung', kind: i }); rec(i); sets.pop(); c[i] += 3; }
    if (i < 27 && i % 9 <= 6 && c[i + 1] > 0 && c[i + 2] > 0) {
      c[i]--; c[i + 1]--; c[i + 2]--;
      sets.push({ type: 'chow', kind: i }); rec(i); sets.pop();
      c[i]++; c[i + 1]++; c[i + 2]++;
    }
  }
  for (let p = 0; p < KIND_COUNT; p++) {
    if (c[p] < 2) continue;
    c[p] -= 2;
    const before = out.length;
    rec(0);
    for (let j = before; j < out.length; j++) out[j] = { pair: p, sets: out[j] };
    c[p] += 2;
  }
  return out;
}

export function isThirteenOrphans(counts) {
  let pair = false;
  for (let k = 0; k < KIND_COUNT; k++) {
    const orphan = ORPHANS.includes(k);
    if (!orphan && counts[k]) return false;
    if (orphan) { if (counts[k] === 0) return false; if (counts[k] === 2) pair = true; if (counts[k] > 2) return false; }
  }
  return pair;
}

// Standard shanten (tiles away from ready, -1 = complete) for 4 sets + a pair, with `melds` sets already
// fixed, plus the thirteen-orphans form when no sets are melded.
export function shanten(counts, melds = 0) {
  const c = counts.slice();
  let best = 8;
  const maxSets = 4 - melds;
  function rec(i, sets, partials, pair) {
    while (i < KIND_COUNT && c[i] === 0) i++;
    if (i === KIND_COUNT) {
      const p = Math.min(partials, maxSets - sets);
      const s = 8 - 2 * (sets + melds) - p - pair;
      if (s < best) best = s;
      return;
    }
    // Upper bound prune: even turning everything left into sets cannot beat best.
    if (c[i] >= 3) { c[i] -= 3; if (sets < maxSets) rec(i, sets + 1, partials, pair); c[i] += 3; }
    if (i < 27 && i % 9 <= 6 && c[i + 1] && c[i + 2] && sets < maxSets) {
      c[i]--; c[i + 1]--; c[i + 2]--; rec(i, sets + 1, partials, pair); c[i]++; c[i + 1]++; c[i + 2]++;
    }
    if (c[i] >= 2) {
      c[i] -= 2;
      if (!pair) rec(i, sets, partials, 1);
      if (sets + partials < maxSets) rec(i, sets, partials + 1, pair);
      c[i] += 2;
    }
    if (i < 27 && sets + partials < maxSets) {
      if (i % 9 <= 7 && c[i + 1]) { c[i]--; c[i + 1]--; rec(i, sets, partials + 1, pair); c[i]++; c[i + 1]++; }
      if (i % 9 <= 6 && c[i + 2]) { c[i]--; c[i + 2]--; rec(i, sets, partials + 1, pair); c[i]++; c[i + 2]++; }
    }
    const n = c[i]; c[i] = 0; rec(i + 1, sets, partials, pair); c[i] = n;
  }
  rec(0, 0, 0, 0);
  if (melds === 0) {
    let kinds = 0, pair = 0;
    for (const k of ORPHANS) { if (counts[k]) kinds++; if (counts[k] >= 2) pair = 1; }
    best = Math.min(best, 13 - kinds - pair);
  }
  return best;
}

// ---------- scoring ----------

// Faan for a winning hand. `p` = { concealed: kinds incl. the winning tile, melds, flowers: bonus kinds,
// seatWind 0-3, prevailing 0-3 }, `ctx` = { winKind, selfDrawn, lastTile, afterKong, robbing, heavenly,
// earthly }. Returns the best reading { faan, limit, items: [{ zh, en, faan }] } or null if the tiles
// do not form a hand.
export function scoreHand(p, ctx, rules = DEFAULT_RULES) {
  const cap = rules.cap || 10;
  const counts = countsOf(p.concealed);
  const melds = p.melds || [];
  const open = melds.some(m => !m.concealed);
  const flowerItems = flowerFaan(p.flowers || [], p.seatWind);
  const situational = [];
  if (ctx.selfDrawn) situational.push(['自摸', 'Self-drawn', 1]);
  if (!open) situational.push(['門前清', 'Concealed hand', 1]);
  if (ctx.afterKong) situational.push(['槓上開花', 'Win on a kong replacement', 1]);
  if (ctx.robbing) situational.push(['搶槓', 'Robbing the kong', 1]);
  if (ctx.lastTile && ctx.selfDrawn) situational.push(['海底撈月', 'Last tile of the wall', 1]);
  if (ctx.lastTile && !ctx.selfDrawn) situational.push(['河底撈魚', 'Last discard', 1]);
  const limits = [];
  if (ctx.heavenly) limits.push(['天糊', 'Heavenly hand']);
  if (ctx.earthly) limits.push(['地糊', 'Earthly hand']);
  if ((p.flowers || []).length === 8) limits.push(['八仙過海', 'All eight flowers']);

  const finish = (items, limitItems) => {
    if (limitItems.length) {
      return { faan: cap, limit: true, items: limitItems.map(([zh, en]) => ({ zh, en, faan: cap, limit: true })) };
    }
    const all = items.map(([zh, en, faan]) => ({ zh, en, faan }));
    const sum = all.reduce((a, b) => a + b.faan, 0);
    return { faan: Math.min(sum, cap), limit: sum >= cap, items: all };
  };

  let best = null;
  const consider = r => {
    if (!best || r.faan > best.faan || (r.faan === best.faan && r.items.length > best.items.length)) best = r;
  };

  if (melds.length === 0 && isThirteenOrphans(counts)) {
    consider(finish([], [['十三么', 'Thirteen orphans'], ...limits]));
  }
  for (const d of decompositions(counts, 4 - melds.length)) {
    const sets = [
      ...melds.map(m => ({ type: m.type, kind: m.kind, concealed: !!m.concealed })),
      // A pung completed by the winning discard counts as melded (exposed), unless the tile went to the pair.
      ...d.sets.map(s => ({ type: s.type, kind: s.kind, concealed: true })),
    ];
    if (!ctx.selfDrawn && ctx.winKind !== d.pair) {
      const viaChow = d.sets.some(s => s.type === 'chow' && ctx.winKind >= s.kind && ctx.winKind <= s.kind + 2);
      if (!viaChow) {
        const i = sets.findIndex((s, j) => j >= melds.length && s.type === 'pung' && s.kind === ctx.winKind);
        if (i >= 0) sets[i].concealed = false;
      }
    }
    consider(finish([...patternFaan(sets, d.pair, p, counts, open), ...situational, ...flowerItems],
      [...patternLimits(sets, d.pair, p, counts, open, ctx), ...limits]));
  }
  return best;
}

function flowerFaan(flowers, seatWind) {
  if (flowers.length === 0) return [['無花', 'No flowers', 1]];
  const items = [];
  for (const [base, zhSet, enSet, zhOne, enOne] of [
    [34, '一台花', 'All four flowers', '正花', 'Seat flower'],
    [38, '一台花', 'All four seasons', '正花', 'Seat season'],
  ]) {
    const have = flowers.filter(k => k >= base && k < base + 4);
    if (have.length === 4) items.push([zhSet, enSet, 2]);
    else if (have.includes(base + seatWind)) items.push([zhOne, enOne, 1]);
  }
  return items;
}

function patternLimits(sets, pair, p, counts, open, ctx) {
  const out = [];
  const kinds = [pair, ...sets.map(s => s.kind)];
  const allPung = sets.every(s => s.type !== 'chow');
  const windPungs = sets.filter(s => s.type !== 'chow' && isWind(s.kind)).length;
  if (kinds.every(isHonor) && sets.every(s => s.type !== 'chow')) out.push(['字一色', 'All honours']);
  if (allPung && kinds.every(isTerminal)) out.push(['清么九', 'All terminals']);
  if (windPungs === 4) out.push(['大四喜', 'Great four winds']);
  if (sets.filter(s => s.type === 'kong').length === 4) out.push(['十八羅漢', 'Four kongs']);
  if (!open && (p.melds || []).length === 0) {
    const suit = suitOf(pair);
    if (suit >= 0) {
      const c = counts.slice(suit * 9, suit * 9 + 9);
      const total = c.reduce((a, b) => a + b, 0);
      const base = [3, 1, 1, 1, 1, 1, 1, 1, 3];
      if (total === 14 && c.every((n, i) => n >= base[i])) out.push(['九蓮寶燈', 'Nine gates']);
    }
  }
  return out;
}

function patternFaan(sets, pair, p, counts, open) {
  const items = [];
  const kinds = [pair, ...sets.map(s => s.kind)];
  const pungs = sets.filter(s => s.type !== 'chow');
  const allPung = pungs.length === 4;
  const suits = new Set(kinds.filter(isSuited).map(suitOf));
  const honors = kinds.some(isHonor);
  if (suits.size === 1 && !honors) items.push(['清一色', 'Pure one suit', 7]);
  else if (suits.size === 1 && honors) items.push(['混一色', 'Mixed one suit', 3]);

  const concealedPungs = pungs.filter(s => s.concealed).length;
  if (allPung && concealedPungs === 4) items.push(['坎坎糊', 'All concealed pungs', 8]);
  else if (allPung) items.push(['對對糊', 'All pungs', 3]);

  if (sets.every(s => s.type === 'chow') && !isDragon(pair) && pair !== 27 + p.seatWind && pair !== 27 + p.prevailing) {
    items.push(['平糊', 'All chows', 1]);
  }
  if (allPung && kinds.every(isOrphan) && honors) items.push(['混么九', 'Mixed terminals and honours', 1]);

  const dragonPungs = pungs.filter(s => isDragon(s.kind)).length;
  if (dragonPungs === 3) items.push(['大三元', 'Great three dragons', 8]);
  else if (dragonPungs === 2 && isDragon(pair)) items.push(['小三元', 'Small three dragons', 5]);
  else for (const s of pungs) if (isDragon(s.kind)) items.push(['番子', DRAGON_EN[s.kind - 31] + ' dragon pung', 1]);

  const windPungs = pungs.filter(s => isWind(s.kind)).length;
  if (windPungs === 3 && isWind(pair)) items.push(['小四喜', 'Small four winds', 6]);
  else if (windPungs < 4) {
    for (const s of pungs) {
      if (s.kind === 27 + p.seatWind) items.push(['門風', 'Seat wind pung (' + WIND_EN[p.seatWind] + ')', 1]);
      if (s.kind === 27 + p.prevailing) items.push(['圈風', 'Prevailing wind pung (' + WIND_EN[p.prevailing] + ')', 1]);
    }
  }
  return items;
}

// ---------- one hand of play ----------

let MELD_SEQ = 0;

export class Hand {
  // opts: { rules, dealer (seat), prevailing (0-3), seed, handNo }
  constructor(opts = {}) {
    this.rules = { ...DEFAULT_RULES, ...(opts.rules || {}) };
    this.dealer = opts.dealer || 0;
    this.prevailing = opts.prevailing || 0;
    this.handNo = opts.handNo || 1;
    this.rng = makeRng(opts.seed ?? (Math.random() * 2 ** 32));
    this.players = [0, 1, 2, 3].map(seat => ({
      seat, wind: (seat - this.dealer + 4) % 4, hand: [], melds: [], flowers: [], discards: [],
    }));
    this.events = [];
    this.seq = 0;
    this.phase = 'deal';
    this.turn = this.dealer;
    this.drawn = null;           // id of the tile the turn player just drew
    this.lastDiscard = null;     // { id, seat }
    this.pendingKong = null;     // { seat, id, meld } while others may rob an added kong
    this.afterKong = false;      // the turn player's tile came from a kong replacement
    this.discardCount = 0;
    this.claimed = false;        // any claim happened (ends heavenly/earthly chances)
    this.result = null;
  }

  log(e) { e.n = ++this.seq; this.events.push(e); if (this.events.length > 64) this.events.shift(); }

  start() {
    const ids = Array.from({ length: 144 }, (_, i) => i);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(this.rng() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    this.wall = ids;
    this.front = 0;              // next index drawn from the front
    this.back = 144;             // one past the next index drawn from the back (replacements)
    this.wallBreak = Math.floor(this.rng() * 72) * 2;
    for (let r = 0; r < 13; r++) for (let i = 0; i < 4; i++) this.players[(this.dealer + i) % 4].hand.push(this.wall[this.front++]);
    this.players[this.dealer].hand.push(this.wall[this.front++]);
    // Bonus tiles are set aside and replaced from the back, dealer first, until nobody holds one.
    for (let again = true; again;) {
      again = false;
      for (let i = 0; i < 4; i++) {
        const pl = this.players[(this.dealer + i) % 4];
        for (const id of pl.hand.filter(id => isBonus(kindOf(id)))) {
          pl.hand.splice(pl.hand.indexOf(id), 1);
          pl.flowers.push(id);
          this.log({ t: 'flower', seat: pl.seat, id });
          if (this.back > this.front) { pl.hand.push(this.wall[--this.back]); again = true; }
        }
      }
    }
    this.phase = 'turn';
    this.turn = this.dealer;
    this.drawn = this.players[this.dealer].hand[this.players[this.dealer].hand.length - 1];
    this.log({ t: 'start', dealer: this.dealer });
  }

  get wallLeft() { return this.back - this.front; }

  // Draw for `seat`: from the front normally, from the back after a kong. Bonus tiles replace from the back.
  draw(seat, fromBack) {
    const pl = this.players[seat];
    for (;;) {
      if (this.back <= this.front) { this.endDraw(); return false; }
      const id = fromBack ? this.wall[--this.back] : this.wall[this.front++];
      if (isBonus(kindOf(id))) {
        pl.flowers.push(id);
        this.log({ t: 'flower', seat, id });
        fromBack = true;
        continue;
      }
      pl.hand.push(id);
      this.drawn = id;
      this.turn = seat;
      this.phase = 'turn';
      this.log({ t: 'draw', seat });
      return true;
    }
  }

  endDraw() {
    this.phase = 'over';
    this.result = { type: 'draw', payments: [0, 0, 0, 0] };
    this.log({ t: 'exhausted' });
  }

  seatInfo(seat) {
    const pl = this.players[seat];
    return { melds: pl.melds, flowers: pl.flowers.map(kindOf), seatWind: pl.wind, prevailing: this.prevailing };
  }

  // Would `seat` win with these concealed kinds? Returns the score if it reaches the minimum, else null.
  winScore(seat, concealedKinds, ctx) {
    const s = scoreHand({ ...this.seatInfo(seat), concealed: concealedKinds }, ctx, this.rules);
    if (!s || s.faan < this.rules.minFaan) return s ? { ...s, short: true } : null;
    return s;
  }

  // What the turn player may do now.
  turnOptions(seat) {
    if (this.phase !== 'turn' || seat !== this.turn) return null;
    const pl = this.players[seat];
    const kinds = pl.hand.map(kindOf);
    const counts = countsOf(kinds);
    const kongs = [];
    const justClaimed = this.drawn == null;
    if (!justClaimed && this.wallLeft > 0) {
      for (let k = 0; k < KIND_COUNT; k++) if (counts[k] === 4) kongs.push({ kind: k, type: 'concealed' });
      for (const m of pl.melds) if (m.type === 'pung' && counts[m.kind] > 0) kongs.push({ kind: m.kind, type: 'added' });
    }
    let win = null;
    if (!justClaimed) {
      const ws = this.winScore(seat, kinds, {
        winKind: kindOf(this.drawn), selfDrawn: true, lastTile: this.wallLeft === 0, afterKong: this.afterKong,
        heavenly: seat === this.dealer && this.discardCount === 0 && !this.claimed,
      });
      if (ws && !ws.short) win = ws;
    }
    return { discard: true, kongs, win };
  }

  // Turn actions: { type: 'discard', id } | { type: 'kong', kind } | { type: 'win' }.
  act(seat, a) {
    const opts = this.turnOptions(seat);
    if (!opts) throw new Error('not your turn');
    const pl = this.players[seat];
    if (a.type === 'win') {
      if (!opts.win) throw new Error('no win');
      return this.settleWin(seat, null, opts.win, this.drawn);
    }
    if (a.type === 'kong') {
      const k = opts.kongs.find(o => o.kind === a.kind);
      if (!k) throw new Error('no such kong');
      if (k.type === 'concealed') {
        const tiles = pl.hand.filter(id => kindOf(id) === a.kind);
        pl.hand = pl.hand.filter(id => kindOf(id) !== a.kind);
        pl.melds.push({ id: ++MELD_SEQ, type: 'kong', kind: a.kind, tiles, concealed: true, from: null });
        this.log({ t: 'kong', seat, kind: a.kind, concealed: true });
        this.afterKong = true;
        this.drawn = null;
        this.draw(seat, true);
        return;
      }
      // Added kong: others may rob it before it stands.
      const id = pl.hand.find(i => kindOf(i) === a.kind);
      pl.hand.splice(pl.hand.indexOf(id), 1);
      const meld = pl.melds.find(m => m.type === 'pung' && m.kind === a.kind);
      this.pendingKong = { seat, id, meld };
      this.drawn = null;
      this.phase = 'rob';
      this.log({ t: 'addkong', seat, kind: a.kind, id });
      if (![0, 1, 2, 3].some(s => this.claimOptions(s))) this.completeAddedKong();
      return;
    }
    if (a.type === 'discard') {
      const i = pl.hand.indexOf(a.id);
      if (i < 0) throw new Error('tile not in hand');
      pl.hand.splice(i, 1);
      pl.discards.push(a.id);
      this.lastDiscard = { id: a.id, seat };
      this.discardCount++;
      this.drawn = null;
      this.afterKong = false;
      this.phase = 'claim';
      this.log({ t: 'discard', seat, id: a.id });
      if (![0, 1, 2, 3].some(s => this.claimOptions(s))) this.nextDraw();
      return;
    }
    throw new Error('unknown action ' + a.type);
  }

  completeAddedKong() {
    const { seat, id, meld } = this.pendingKong;
    meld.type = 'kong';
    meld.tiles.push(id);
    this.pendingKong = null;
    this.log({ t: 'kong', seat, kind: meld.kind, concealed: false, added: true });
    this.afterKong = true;
    this.draw(seat, true);
  }

  nextDraw() {
    const seat = (this.lastDiscard.seat + 1) % 4;
    this.lastDiscard = null;
    this.draw(seat, false);
  }

  // What `seat` may claim right now (discard claim, or robbing an added kong). null when nothing.
  claimOptions(seat) {
    if (this.phase === 'rob') {
      const pk = this.pendingKong;
      if (seat === pk.seat) return null;
      const k = kindOf(pk.id);
      const win = this.winScore(seat, [...this.players[seat].hand.map(kindOf), k], {
        winKind: k, selfDrawn: false, robbing: true, lastTile: false,
      });
      return win && !win.short ? { win, pung: false, kong: false, chows: [] } : null;
    }
    if (this.phase !== 'claim' || !this.lastDiscard || seat === this.lastDiscard.seat) return null;
    const pl = this.players[seat];
    const k = kindOf(this.lastDiscard.id);
    const kinds = pl.hand.map(kindOf);
    const counts = countsOf(kinds);
    const win = this.winScore(seat, [...kinds, k], {
      winKind: k, selfDrawn: false, lastTile: this.wallLeft === 0,
      earthly: seat !== this.dealer && this.discardCount === 1 && !this.claimed && this.lastDiscard.seat === this.dealer,
    });
    const o = { win: win && !win.short ? win : null, pung: false, kong: false, chows: [] };
    if (this.wallLeft > 0) {
      o.pung = counts[k] >= 2;
      o.kong = counts[k] >= 3;
      if (seat === (this.lastDiscard.seat + 1) % 4 && isSuited(k)) {
        const r = rankOf(k);
        for (const start of [k - 2, k - 1, k]) {
          const sr = r - (k - start);
          if (sr < 1 || sr > 7) continue;
          const need = [start, start + 1, start + 2].filter(x => x !== k);
          if (need.every(x => counts[x] > 0)) o.chows.push(start);
        }
      }
    }
    return o.win || o.pung || o.kong || o.chows.length ? o : null;
  }

  // responses[seat] = null (pass) | { type: 'win' } | { type: 'kong' } | { type: 'pung' } | { type: 'chow', start }
  resolveClaims(responses) {
    if (this.phase !== 'claim' && this.phase !== 'rob') throw new Error('no claim pending');
    const from = this.phase === 'rob' ? this.pendingKong.seat : this.lastDiscard.seat;
    const order = [1, 2, 3].map(i => (from + i) % 4);
    const valid = s => {
      const r = responses[s];
      if (!r) return null;
      const o = this.claimOptions(s);
      if (!o) return null;
      if (r.type === 'win' && o.win) return r;
      if (r.type === 'kong' && o.kong) return r;
      if (r.type === 'pung' && o.pung) return r;
      if (r.type === 'chow' && o.chows.includes(r.start)) return r;
      return null;
    };
    // Priority: win (nearest seat after the discarder takes it: head bump) > pung/kong > chow.
    const winner = order.find(s => valid(s)?.type === 'win');
    if (winner !== undefined) {
      const o = this.claimOptions(winner);
      if (this.phase === 'rob') {
        const id = this.pendingKong.id;
        this.pendingKong = null;
        return this.settleWin(winner, from, o.win, id, true);
      }
      const id = this.lastDiscard.id;
      this.players[from].discards.pop();
      return this.settleWin(winner, from, o.win, id);
    }
    if (this.phase === 'rob') return this.completeAddedKong();
    const id = this.lastDiscard.id;
    const k = kindOf(id);
    const pk = order.find(s => ['pung', 'kong'].includes(valid(s)?.type));
    const ch = order.find(s => valid(s)?.type === 'chow');
    const claimer = pk !== undefined ? pk : ch;
    if (claimer === undefined) return this.nextDraw();
    const r = valid(claimer);
    const pl = this.players[claimer];
    this.players[from].discards.pop();
    this.claimed = true;
    let take;
    if (r.type === 'chow') take = [r.start, r.start + 1, r.start + 2].filter(x => x !== k).map(x => pl.hand.find(i => kindOf(i) === x));
    else take = pl.hand.filter(i => kindOf(i) === k).slice(0, r.type === 'kong' ? 3 : 2);
    pl.hand = pl.hand.filter(i => !take.includes(i));
    const tiles = r.type === 'chow' ? [...take, id].sort((a, b) => kindOf(a) - kindOf(b)) : [...take, id];
    pl.melds.push({ id: ++MELD_SEQ, type: r.type, kind: r.type === 'chow' ? r.start : k, tiles, concealed: false, from, claimedId: id });
    this.log({ t: r.type, seat: claimer, from, kind: k, id });
    this.lastDiscard = null;
    this.turn = claimer;
    if (r.type === 'kong') { this.afterKong = true; this.drawn = null; this.draw(claimer, true); return; }
    this.drawn = null;
    this.afterKong = false;
    this.phase = 'turn';
  }

  settleWin(seat, from, score, winId, robbed) {
    const pl = this.players[seat];
    if (from !== null && !pl.hand.includes(winId)) pl.hand.push(winId);
    const pts = pointsFor(score.faan, this.rules.cap);
    const payments = [0, 0, 0, 0];
    // Half-gun (半銃): a discarder pays the full amount and the other two half; on a self-draw all three pay full.
    for (let s = 0; s < 4; s++) {
      if (s === seat) continue;
      const pay = from === null ? pts : (s === from ? pts : pts / 2);
      payments[s] -= pay;
      payments[seat] += pay;
    }
    this.phase = 'over';
    this.result = { type: 'win', winner: seat, from, winId, score, points: pts, payments, robbed: !!robbed };
    this.log({ t: 'win', seat, from, faan: score.faan });
  }

  // What `seat` may see. Opponents' concealed tiles are counts only; concealed kongs show two ends face down.
  view(seat) {
    const over = this.phase === 'over';
    const players = this.players.map(pl => ({
      seat: pl.seat, wind: pl.wind,
      handCount: pl.hand.length,
      hand: pl.seat === seat || over ? sortIds(pl.hand, pl.seat === this.turn ? this.drawn : null) : null,
      melds: pl.melds.map(m => ({
        id: m.id, type: m.type, kind: m.kind, concealed: m.concealed, from: m.from, claimedId: m.claimedId ?? null,
        tiles: m.concealed && !over && pl.seat !== seat ? m.tiles.map((t, i) => (i === 1 || i === 2 ? t : null)) : m.tiles,
      })),
      flowers: pl.flowers.slice(),
      discards: pl.discards.slice(),
    }));
    // A hidden tile's id would give away its kind, so opponents' concealed hands carry no ids.
    return {
      seat, phase: this.phase, turn: this.turn, dealer: this.dealer, prevailing: this.prevailing, handNo: this.handNo,
      rules: this.rules, players, wallLeft: this.wallLeft, front: this.front, back: this.back, wallBreak: this.wallBreak,
      drawn: this.turn === seat ? this.drawn : null,
      lastDiscard: this.lastDiscard,
      pendingKong: this.pendingKong ? { seat: this.pendingKong.seat, id: this.pendingKong.id } : null,
      events: this.events.slice(-12),
      result: this.result,
    };
  }
}

export function sortIds(ids, drawn) {
  const rest = ids.filter(i => i !== drawn).sort((a, b) => kindOf(a) - kindOf(b) || a - b);
  return drawn != null && ids.includes(drawn) ? [...rest, drawn] : rest;
}

// ---------- a match: hands, dealer rotation, scores ----------

export class Match {
  // opts: { rules, seed, length: 'east' (one wind round) | 'full' (four wind rounds) }
  constructor(opts = {}) {
    this.rules = { ...DEFAULT_RULES, ...(opts.rules || {}) };
    this.rng = makeRng(opts.seed ?? (Math.random() * 2 ** 32));
    this.scores = [0, 0, 0, 0];
    this.prevailing = 0;
    this.firstDealer = opts.firstDealer ?? Math.floor(this.rng() * 4);
    this.dealer = this.firstDealer;
    this.passes = 0;            // dealer changes within this prevailing wind
    this.handNo = 0;
    this.history = [];
    this.over = false;
    this.hand = null;
  }

  newHand() {
    this.handNo++;
    this.hand = new Hand({ rules: this.rules, dealer: this.dealer, prevailing: this.prevailing, handNo: this.handNo, seed: Math.floor(this.rng() * 2 ** 32) });
    this.hand.start();
    return this.hand;
  }

  // Apply the finished hand: pay, then the dealer stays on a dealer win or a drawn hand, else passes on.
  finishHand() {
    const h = this.hand;
    const r = h.result;
    for (let s = 0; s < 4; s++) this.scores[s] += r.payments[s];
    this.history.push({ handNo: h.handNo, dealer: h.dealer, prevailing: h.prevailing, type: r.type, winner: r.winner, from: r.from, faan: r.score?.faan, payments: r.payments.slice() });
    const stays = r.type === 'draw' || r.winner === h.dealer;
    if (!stays) {
      this.dealer = (this.dealer + 1) % 4;
      this.passes++;
      if (this.passes === 4) {
        this.passes = 0;
        this.prevailing++;
        const rounds = this.rules.length === 'full' ? 4 : 1;
        if (this.prevailing >= rounds) this.over = true;
      }
    }
    // Guard against an endless East round: at most 16 hands per wind round.
    if (!this.over && this.history.filter(x => x.prevailing === this.prevailing).length >= 16) {
      this.passes = 0; this.prevailing++;
      if (this.prevailing >= (this.rules.length === 'full' ? 4 : 1)) this.over = true;
    }
    return { stays, over: this.over };
  }
}
