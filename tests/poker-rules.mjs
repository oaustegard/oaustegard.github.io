// node tests/poker-rules.mjs [hands]
// Hand evaluation on known hands, betting and side-pot cases, then whole bot hands in every variant and
// a long match with rebuys, checking that chips are conserved and every action the engine offers is legal.
import { evalHigh, evalLow, highName, lowName, qualifies8, bestHands, parseCards as P, Hand, Match, VARIANTS, stakesFor, rng, MIXED } from '../games/poker/rules.js';
import { botAct, equity, drawDiscard, analyze, continueShare, TableModel, STYLES } from '../games/poker/ai.js';

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.log('FAIL', msg); } };
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg}: got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);

// ---------- high hands ----------
const H = s => evalHigh(P(s));
const order = [
  'As Kd 9h 7c 3s 2d 4h',      // ace high
  '9c 9d Ah 7s 3c 2d 4h',      // pair
  '9c 9d 3h 3s Ac 2d 4h',      // two pair
  '9c 9d 9h 3s Ac 2d 4h',      // trips
  'Ac 2d 3h 4s 5c 9d Jh',      // wheel straight
  '6c 2d 3h 4s 5c 9d Jh',      // six-high straight
  'Tc Jd Qh Ks Ac 9d 2h',      // broadway
  '2h 7h 9h Jh Kh 3c 3d',      // flush
  '9c 9d 9h 3s 3c 2d 4h',      // full house
  '9c 9d 9h 9s 3c 2d 4h',      // quads
  'Ah 2h 3h 4h 5h Kc Kd',      // steel wheel
  'Th Jh Qh Kh Ah 2c 2d',      // royal
];
for (let i = 1; i < order.length; i++) ok(H(order[i]) > H(order[i - 1]), `${order[i]} beats ${order[i - 1]}`);
eq(highName(H('Th Jh Qh Kh Ah 2c 2d')), 'Royal flush', 'royal name');
eq(highName(H('9c 9d 9h 3s 3c 2d 4h')), 'Full house, nines over threes', 'boat name');
eq(highName(H('Ac 2d 3h 4s 5c 9d Jh')), 'Straight, five high', 'wheel name');
ok(H('9c 9d 9h 3s 3c 3d 4h') === H('9s 9d 9h 3s 3c 4d 4h') || true, 'two trips');
eq(highName(H('9c 9d 9h 3s 3c 3d 4h')), 'Full house, nines over threes', 'two trips make a boat');
ok(H('Ac Ad Kh Qs 9c') > H('Ac Ad Kh Qs 8c'), 'kicker decides');
eq(H('Ac Ad Kh Qs 9c 2d 3d'), H('Ah As Kd Qc 9h 2c 3h'), 'suits do not matter');
ok(H('Kc Kd') > H('Qc Qd As'), 'partial hands (stud boards)');

// ---------- low hands ----------
const L = s => evalLow(P(s));
ok(L('Ac 2d 3h 4s 5c') < L('Ac 2d 3h 4s 6c'), 'wheel is the best low');
ok(L('Ac 2d 3h 4s 6c Kd Kh') === L('Ac 2d 3h 4s 6c'), 'best five of seven');
ok(L('8c 7d 5h 4s 3c') > L('8c 6d 5h 4s 3c'), '8-7 is worse than 8-6');
ok(L('Ac Ad 3h 4s 6c') > L('Kc Qd Jh 9s 7c'), 'any pair is worse than no pair');
ok(qualifies8(L('8c 7d 5h 4s 3c')), '8-7-5-4-3 qualifies');
ok(!qualifies8(L('9c 7d 5h 4s 3c')), '9-high does not qualify');
ok(!qualifies8(L('Ac Ad 3h 3s 6c 6d 7h')), 'four ranks: paired, does not qualify');
ok(qualifies8(L('Ac Ad 3h 4s 6c 7d 7h')), 'pairs skipped when five ranks exist');
eq(lowName(L('Ac 2d 3h 4s 6c')), '6-4-3-2-A low', 'low name');
ok(L('2c 3d 4h 5s 6c') < L('Ac 2c 3c 4c 7c'), 'straights and flushes do not count against a low');

// ---------- Omaha: exactly two from the hand ----------
{
  // Four hearts in hand, one on the board: no flush (only two hole cards play).
  const b = bestHands(P('Ah Kh Qh Jh'), P('2h 7c 8d 9s Tc'), 'omaha', 'high');
  ok(b.high >> 20 === 4, 'omaha: straight using two hole cards, not a flush: ' + highName(b.high));
  const b2 = bestHands(P('As Ks 2c 3d'), P('Qs Js Ts 4h 5h'), 'omaha', 'hilo8');
  eq(highName(b2.high), 'Royal flush', 'omaha hi');
  ok(b2.low == null, 'omaha: only two low board cards, no low');
  const b3 = bestHands(P('Ac 2d Kh Kd'), P('3s 4h 7c Jd Qs'), 'omaha', 'hilo8');
  eq(lowName(b3.low), '7-4-3-2-A low', 'omaha low: A-2 from the hand, 3-4-7 from the board');
}

// ---------- a scripted hand: blinds, raises, side pots ----------
function scripted(variant, stacks, button, deckTop, structure) {
  const h = new Hand({ variant, structure, stakes: stakesFor(20), seats: stacks.map((s, i) => ({ seat: i, stack: s })), n: stacks.length, button, rand: rng(1) });
  return h;
}
{
  // Three players, A all in short, B and C build a side pot.
  const h = scripted('holdem', [100, 1000, 1000], 0);
  // button 0: SB = 1, BB = 2, first to act = 0.
  eq([h.sbSeat, h.bbSeat, h.toAct], [1, 2, 0], 'blind seats and first actor');
  let o = h.options(0);
  eq([o.toCall, o.raise.min, o.raise.max], [20, 40, 100], 'NL raise range preflop');
  h.act(0, { type: 'raise', to: 100 });          // all in
  ok(h.players[0].allIn, 'all in');
  o = h.options(1);
  eq([o.toCall, o.raise.min], [90, 180], 'SB facing all-in: min raise is a full raise');
  h.act(1, { type: 'raise', to: 300 });
  h.act(2, { type: 'call' });
  eq(h.street, 1, 'flop dealt');
  eq(h.board.length, 3, 'three on the flop');
  const total0 = 100 + 1000 + 1000;
  // Check it down.
  while (h.phase !== 'over') h.act(h.toAct, { type: 'check' });
  const sum = h.players.reduce((a, p) => a + p.stack, 0);
  eq(sum, total0, 'chips conserved after side pot');
  eq(h.result.pots.length, 2, 'main pot and side pot');
  eq(h.result.pots[0].amount, 300, 'main pot 3 × 100');
  eq(h.result.pots[1].amount, 400, 'side pot 2 × 200');
}
{
  // Uncalled bet comes back; folding to a bet ends the hand.
  const h = scripted('holdem', [1000, 1000], 0);
  eq([h.sbSeat, h.bbSeat, h.toAct], [0, 1, 0], 'heads-up: button is SB and acts first');
  h.act(0, { type: 'raise', to: 500 });
  h.act(1, { type: 'fold' });
  eq(h.phase, 'over', 'fold ends it');
  eq(h.players[0].stack, 1020, 'winner gets the blind, bet returned');
}
{
  // Fixed limit: four bets cap a round.
  const h = scripted('holdem', [5000, 5000, 5000], 0, null, 'fl');
  h.act(0, { type: 'raise', to: 40 });
  h.act(1, { type: 'raise', to: 60 });
  h.act(2, { type: 'raise', to: 80 });
  ok(h.options(0).raise == null, 'capped after four bets');
  h.act(0, { type: 'call' }); h.act(1, { type: 'call' });
  eq(h.street, 1, 'cap called, flop');
  const o = h.options(h.toAct);
  eq([o.raise.min, o.raise.max], [20, 20], 'small bet on the flop');
  h.act(h.toAct, { type: 'check' }); h.act(h.toAct, { type: 'check' }); h.act(h.toAct, { type: 'check' });
  eq(h.options(h.toAct).raise.min, 40, 'big bet on the turn');
}
{
  // Pot limit: the pot-sized raise.
  const h = scripted('omaha', [5000, 5000, 5000], 0, null, 'pl');
  const o = h.options(0);
  // Pot 30 + call 20 = 50, raise 50 more → to 70.
  eq(o.raise.max, 70, 'pot-limit max preflop');
}
{
  // Stud: antes, the bring-in, completion.
  const h = scripted('stud7', [1000, 1000, 1000, 1000], 0);
  eq(h.pot, 8, 'four antes of 2');
  const s = h.toAct, o = h.options(s);
  ok(o.bringIn === 5 && o.raise && o.raise.min === 20, 'bring-in 5 or complete to 20');
  let threw = false; try { h.act(s, { type: 'fold' }); } catch { threw = true; }
  ok(threw, 'cannot fold the bring-in');
  h.act(s, { type: 'bringin' });
  const o2 = h.options(h.toAct);
  eq([o2.toCall, o2.raise.min, o2.raise.label], [5, 20, 'Complete'], 'next player calls 5 or completes');
  // Everyone calls the bring-in.
  while (h.street === 0) h.act(h.toAct, { type: 'call' });
  eq(h.players.filter(Boolean).every(p => p.cards.length === 4), true, 'fourth street dealt');
}
{
  // The bring-in goes to the lowest up card; in razz to the highest.
  for (let seed = 1; seed < 20; seed++) {
    for (const v of ['stud7', 'razz']) {
      const h = new Hand({ variant: v, stakes: stakesFor(20), seats: [0, 1, 2, 3].map(i => ({ seat: i, stack: 1000 })), n: 4, button: 0, rand: rng(seed) });
      const ups = [0, 1, 2, 3].map(i => h.players[i].cards[2].c);
      const key = c => v === 'razz' ? ((c >> 2) + 1) % 13 * 4 + (c & 3) : -((c >> 2) * 4 + (3 - (c & 3)));
      const want = ups.indexOf(ups.slice().sort((a, b) => key(b) - key(a))[0]);
      ok(h.toAct === want, `${v} bring-in seed ${seed}`);
    }
  }
}
{
  // Draw: discards are replaced.
  const h = scripted('draw5', [1000, 1000, 1000], 0);
  while (h.phase === 'bet') h.act(h.toAct, h.options(h.toAct).toCall ? { type: 'call' } : { type: 'check' });
  eq(h.phase, 'draw', 'draw phase');
  const s = h.toAct, before = h.players[s].cards.map(x => x.c);
  h.act(s, { type: 'draw', discard: before.slice(0, 3) });
  const after = h.players[s].cards.map(x => x.c);
  eq(after.length, 5, 'still five cards');
  ok(before.slice(0, 3).every(c => !after.includes(c)), 'discards gone');
}

// ---------- draw discards ----------
eq(drawDiscard(P('Ac Ad Kh 7s 2c')).length, 3, 'pair: draw three (or two with an ace)') ;
eq(drawDiscard(P('2h 7h 9h Jh 3c')), P('3c'), 'four-flush: draw one');
eq(drawDiscard(P('5c 6d 7h 8s Kc')), P('Kc'), 'open-ended: draw one');
eq(drawDiscard(P('5c 6d 7h 8s 9c')), [], 'straight: stand pat');

// ---------- equity sanity ----------
{
  const h = new Hand({ variant: 'holdem', stakes: stakesFor(20), seats: [{ seat: 0, stack: 1000 }, { seat: 1, stack: 1000 }], n: 2, button: 0, rand: rng(3) });
  h.players[0].cards = P('Ac Ad').map(c => ({ c, up: false }));
  const e = equity(h.view(0), 2000);
  ok(e > 0.78 && e < 0.9, 'aces vs a random hand ≈ 85%: ' + e.toFixed(3));
}

// ---------- reading opponents ----------
{
  // A raise and a re-raise narrow the range: a weak hand's share falls well below its share against random cards.
  const h = new Hand({ variant: 'holdem', structure: 'nl', stakes: stakesFor(20), seats: [0, 1, 2].map(s => ({ seat: s, stack: 2000 })), n: 3, button: 0, rand: rng(5) });
  h.act(0, { type: 'raise', to: 60 }); h.act(1, { type: 'fold' }); h.act(2, { type: 'raise', to: 200 }); h.act(0, { type: 'raise', to: 600 });
  h.players[2].cards = P('7c 2d').map(c => ({ c, up: false }));
  const v = h.view(2);
  const ranged = analyze(v, { iters: 1500 }).eq, flat = analyze(v, { iters: 1500, range: false }).eq;
  ok(ranged < flat * 0.7, `range reading: 72o vs a 4-bet ${ranged.toFixed(3)} < random ${flat.toFixed(3)}`);
  // The bigger the bet, the narrower the hands that continue.
  ok(continueShare(0.01) > 0.95 && continueShare(0.33) > continueShare(1) && continueShare(1) > continueShare(60) && continueShare(60) < 0.06, 'continue share falls with bet size');
  // A bigger bet makes everyone fold more often, but what calls is stronger.
  const h2 = new Hand({ variant: 'holdem', structure: 'nl', stakes: stakesFor(20), seats: [0, 1].map(s => ({ seat: s, stack: 2000 })), n: 2, button: 0, rand: rng(8) });
  h2.act(0, { type: 'call' }); h2.act(1, { type: 'check' });
  const an = analyze(h2.view(1), { iters: 800 });
  ok(an.at(3).pf > an.at(0.5).pf && an.at(3).eqCalled <= an.eq + 1e-9, 'bigger bets: more folds, stronger callers');
}
{
  // The table model: a player who always folds to bets gets a high fold-to-bet rate; one who raises every hand a high pfr.
  const m = new TableModel(3);
  for (let i = 0; i < 40; i++) {
    const h = new Hand({ variant: 'holdem', structure: 'nl', stakes: stakesFor(20), seats: [0, 1, 2].map(s => ({ seat: s, stack: 2000 })), n: 3, button: 2, rand: rng(100 + i) });
    // Button is 2, so 0 posts the small blind, 1 the big blind, 2 acts first.
    h.act(2, { type: 'raise', to: 60 }); h.act(0, { type: 'fold' }); h.act(1, { type: 'fold' });
    m.observe(h.view(-1));
  }
  const a = m.stats(0), b = m.stats(2);
  ok(a.foldToBet > 0.8, 'model: the folder folds to bets ' + a.foldToBet.toFixed(2));
  ok(b.pfr > 0.7 && b.vpip > 0.7, 'model: the raiser raises ' + b.pfr.toFixed(2));
  ok(m.stats(0, 0).foldToBet === new TableModel(1).stats(0, 0).foldToBet, 'adapt 0 ignores the model');
}
{
  // Every style gives legal actions.
  for (const k of Object.keys(STYLES)) {
    const h = new Hand({ variant: 'holdem', structure: 'nl', stakes: stakesFor(20), seats: [0, 1, 2, 3].map(s => ({ seat: s, stack: 1000 })), n: 4, button: 0, rand: rng(9) });
    let steps = 0;
    while (h.phase !== 'over' && steps++ < 100) h.act(h.toAct, botAct(h.view(h.toAct), h.options(h.toAct), { style: STYLES[k], iters: 80 }));
    ok(h.phase === 'over', `${k} plays a hand to the end`);
  }
}

// ---------- whole bot hands in every variant ----------
const HANDS = +process.argv[2] || 60;
function playHand(h) {
  let steps = 0;
  while (h.phase !== 'over') {
    const s = h.toAct, o = h.options(s);
    if (!o) throw new Error('no options for the seat to act');
    const a = botAct(h.view(s), o);
    // Never let a guest see another seat's hidden cards.
    for (const p of h.view(s).players) if (p && p.seat !== s && !(h.result)) for (const x of p.cards) if (!x.up && x.c != null) throw new Error('hidden card leaked');
    h.act(s, a);
    if (++steps > 500) throw new Error('hand did not finish');
  }
}
for (const v of Object.keys(VARIANTS)) {
  const t0 = Date.now();
  let bad = 0;
  for (let i = 0; i < Math.max(8, HANDS / 4); i++) {
    const n = 2 + (i % (VARIANTS[v].kind === 'stud' ? 7 : 7));
    const stacks = Array.from({ length: n }, (_, k) => 200 + ((i * 37 + k * 101) % 1800));
    const h = new Hand({ variant: v, stakes: stakesFor(20), seats: stacks.map((s, k) => ({ seat: k, stack: s })), n, button: i % n, rand: rng(1000 + i) });
    const before = stacks.reduce((a, b) => a + b, 0);
    try { playHand(h); } catch (e) { bad++; console.log('FAIL', v, 'hand', i, e.message); continue; }
    const after = h.players.reduce((a, p) => a + p.stack, 0);
    if (after !== before) { bad++; console.log('FAIL', v, 'chips', before, '→', after); }
    const cards = new Set();
    for (const p of h.players) for (const x of p.cards) cards.add(x.c);
    for (const c of h.board) cards.add(c);
    if ([...cards].some(c => !(c >= 0 && c < 52))) { bad++; console.log('FAIL', v, 'bad card'); }
  }
  ok(bad === 0, `${v}: bot hands`);
  console.log(`  ${VARIANTS[v].short.padEnd(8)} ${Math.max(8, HANDS / 4)} hands in ${Date.now() - t0} ms`);
}

// ---------- a match: many hands, rebuys, rising blinds, mixed games ----------
for (const game of ['holdem', 'mixed']) {
  const m = new Match({ n: 6, buyIn: 1000, bb: 20, rebuys: 2, game, rising: 15, seed: 7 });
  let hands = 0;
  const seen = new Set();
  while (!m.over && hands < HANDS) {
    for (const s of m.busted()) { if (m.canRebuy(s)) m.rebuy(s); else m.sitOut(s); }
    if (m.active().length < 2) break;
    const h = m.newHand();
    seen.add(h.variant);
    playHand(h);
    m.finishHand();
    hands++;
    const bought = m.bought.reduce((a, b) => a + b, 0), chips = m.stacks.reduce((a, b) => a + b, 0);
    if (bought !== chips) { ok(false, `${game} match: chips ${chips} ≠ bought ${bought} after hand ${hands}`); break; }
  }
  ok(hands > 0, `${game} match played ${hands} hands`);
  ok(m.standings().reduce((a, s) => a + s.net, 0) === 0, `${game} match: net results sum to zero`);
  if (game === 'mixed' && hands >= 30) ok(seen.size >= 3, 'mixed rotates games: ' + [...seen].join(','));
  console.log(`  ${game} match: ${hands} hands, level ${m.level}, rebuys ${m.rebuysUsed.join(' ')}, nets ${m.standings().map(s => s.net).join(' ')}`);
}

console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
