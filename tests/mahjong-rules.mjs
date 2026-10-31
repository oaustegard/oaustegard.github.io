// Rules tests for games/mahjong/rules.js and ai.js. Run: node tests/mahjong-rules.mjs [hands]
import assert from 'node:assert/strict';
import { Hand, Match, scoreHand, shanten, countsOf, kindOf, decompositions, isThirteenOrphans, sortIds } from '../games/mahjong/rules.js';
import { botTurn, botClaim, readyKinds } from '../games/mahjong/ai.js';

let failed = 0;
function test(name, fn) {
  try { fn(); console.log('ok  ', name); }
  catch (e) { failed++; console.log('FAIL', name, '\n    ', e.stack.split('\n').slice(0, 3).join('\n     ')); }
}

// "123m 456p 77z" style: digits then suit letter; z = honours 1-7 (E S W N Rd Gd Wd).
function K(s) {
  const out = [];
  for (const grp of s.trim().split(/\s+/)) {
    const suit = grp[grp.length - 1];
    for (const ch of grp.slice(0, -1)) {
      const n = +ch;
      out.push(suit === 'z' ? 26 + n : 'mps'.indexOf(suit) * 9 + n - 1);
    }
  }
  return out;
}
const names = r => r.items.map(i => i.zh).sort();
const P = (concealed, extra = {}) => ({ concealed: K(concealed), melds: [], flowers: [], seatWind: 1, prevailing: 0, ...extra });

test('tile kinds: 34 kinds × 4 plus 8 bonus', () => {
  const c = new Array(42).fill(0);
  for (let id = 0; id < 144; id++) c[kindOf(id)]++;
  assert.deepEqual(c.slice(0, 34), new Array(34).fill(4));
  assert.deepEqual(c.slice(34), new Array(8).fill(1));
});

test('shanten: complete = -1, ready = 0, thirteen orphans counted', () => {
  assert.equal(shanten(countsOf(K('123m 456m 789p 234s 55s')), 0), -1);
  assert.equal(shanten(countsOf(K('123m 456m 789p 234s 5s')), 0), 0);
  assert.equal(shanten(countsOf(K('19m 19p 19s 1234567z')), 0), 0);
  assert.equal(shanten(countsOf(K('19m 19p 19s 12345677z')), 0), -1);
  assert.equal(shanten(countsOf(K('159m 159p 159s 1357z')), 0) >= 3, true);
});

test('ready kinds: 2345m waits on 2m and 5m (shape 2345 + pair elsewhere)', () => {
  const ids = K('2345m 678p 999s 123s').map(k => k * 4);
  assert.deepEqual(readyKinds(ids, []), K('25m'));
});

test('all chows, concealed, no flowers, won on a discard = 3 faan', () => {
  const r = scoreHand(P('123m 456m 789p 234s 55s'), { winKind: K('5s')[0], selfDrawn: false });
  assert.deepEqual(names(r), ['平糊', '無花', '門前清'].sort());
  assert.equal(r.faan, 3);
});

test('a chicken hand with an open chow and a flower scores 0', () => {
  const r = scoreHand(P('456m 789p 234s 55s', { melds: [{ type: 'chow', kind: K('1p')[0] }], flowers: [36] }),
    { winKind: K('5s')[0], selfDrawn: false });
  assert.equal(r.faan, 1, 'only 平糊 (open all chows still counts)');
  const r2 = scoreHand(P('456m 789p 222s 55s', { melds: [{ type: 'chow', kind: K('1p')[0] }], flowers: [36] }),
    { winKind: K('5s')[0], selfDrawn: false });
  assert.equal(r2.faan, 0);
});

test('111222333m reads as three pungs or three chows, whichever scores more', () => {
  const r = scoreHand(P('111222333m 789m 55m'), { winKind: K('5m')[0], selfDrawn: true });
  assert.ok(names(r).includes('清一色'));
  // chows reading: 平糊 + 清一色 + 門前清 + 自摸 + 無花 = 11 > cap; pungs reading cannot beat it.
  assert.equal(r.faan, 10);
});

test('pure one suit, mixed one suit', () => {
  assert.ok(names(scoreHand(P('123m 345m 567m 789m 99m'), { winKind: 0 })).includes('清一色'));
  const r = scoreHand(P('123m 345m 567m 111z 99m'), { winKind: 0 });
  assert.ok(names(r).includes('混一色'));
  assert.ok(!names(r).includes('清一色'));
});

test('dragons: pung 1 each, small three dragons 5, great three dragons 8', () => {
  assert.equal(scoreHand(P('123m 456p 789s 555z 11s', { flowers: [34] }), { winKind: 0 }).faan, 1 + 1);
  const small = scoreHand(P('123m 456p 555z 666z 77z', { flowers: [34] }), { winKind: 0 });
  assert.ok(names(small).includes('小三元'));
  assert.ok(!names(small).includes('番子'));
  const big = scoreHand(P('123m 11p 555z 666z 777z', { flowers: [34] }), { winKind: 0 });
  assert.ok(names(big).includes('大三元'));
});

test('winds: seat and prevailing pungs, double wind counts twice', () => {
  // seat South (1), prevailing East (0)
  const r = scoreHand(P('123m 456p 789s 222z 11s', { flowers: [34] }), { winKind: 0 });
  assert.ok(names(r).includes('門風'));
  const dbl = scoreHand(P('123m 456p 789s 111z 11s', { seatWind: 0, flowers: [35] }), { winKind: 0 });
  assert.equal(dbl.items.filter(i => i.zh === '門風' || i.zh === '圈風').length, 2);
});

test('all pungs 3; concealed self-drawn all pungs is 坎坎糊 8', () => {
  const open = scoreHand(P('222p 333s 99s', { melds: [{ type: 'pung', kind: 0 }, { type: 'pung', kind: 5 }], flowers: [34] }), { winKind: K('9s')[0] });
  assert.ok(names(open).includes('對對糊'));
  const kk = scoreHand(P('111m 666m 222p 333s 99s', { flowers: [34] }), { winKind: K('3s')[0], selfDrawn: true });
  assert.ok(names(kk).includes('坎坎糊'));
  // Won on a discard that completes a pung: that pung is melded, so only 對對糊.
  const disc = scoreHand(P('111m 666m 222p 333s 99s', { flowers: [34] }), { winKind: K('3s')[0], selfDrawn: false });
  assert.ok(names(disc).includes('對對糊'));
  // Won on a discard into the pair: still all concealed.
  const pair = scoreHand(P('111m 666m 222p 333s 99s', { flowers: [34] }), { winKind: K('9s')[0], selfDrawn: false });
  assert.ok(names(pair).includes('坎坎糊'));
});

test('limit hands: thirteen orphans, nine gates, all honours, heavenly', () => {
  const to = scoreHand(P('19m 19p 19s 12345677z'), { winKind: 0 });
  assert.equal(to.limit, true); assert.equal(to.faan, 10); assert.deepEqual(names(to), ['十三么']);
  assert.ok(isThirteenOrphans(countsOf(K('19m 19p 19s 12345677z'))));
  const ng = scoreHand(P('11123455678999m'), { winKind: 4 });
  assert.equal(ng.limit, true); assert.ok(names(ng).includes('九蓮寶燈'));
  assert.equal(scoreHand(P('111z 222z 555z 666z 77z'), { winKind: 27 }).limit, true);
  assert.equal(scoreHand(P('123m 456p 789s 234s 55s'), { winKind: 0, selfDrawn: true, heavenly: true }).limit, true);
});

test('flowers: none 1, seat flower 1, a full set of four 2', () => {
  const base = '123m 456p 789s 234s 22z'; // pair of South = seat wind? seatWind 1 → South pair blocks 平糊
  assert.ok(names(scoreHand(P(base), { winKind: 0 })).includes('無花'));
  assert.ok(names(scoreHand(P(base, { flowers: [35] }), { winKind: 0 })).includes('正花'));
  assert.ok(!names(scoreHand(P(base, { flowers: [34] }), { winKind: 0 })).includes('正花'));
  const set = scoreHand(P(base, { flowers: [34, 35, 36, 37] }), { winKind: 0 });
  assert.ok(names(set).includes('一台花'));
});

test('not a hand returns null', () => {
  assert.equal(scoreHand(P('123m 456p 789s 234s 56s'), { winKind: 0 }), null);
  assert.equal(decompositions(countsOf(K('123m 456p 789s 234s 56s')), 4).length, 0);
});

test('deal: 13 tiles each, dealer 14, bonus tiles replaced, 144 accounted', () => {
  for (let seed = 1; seed < 40; seed++) {
    const h = new Hand({ seed, dealer: seed % 4 });
    h.start();
    h.players.forEach(p => {
      assert.equal(p.hand.length, p.seat === h.dealer ? 14 : 13);
      assert.ok(p.hand.every(id => kindOf(id) < 34));
    });
    accounted(h);
  }
});

function accounted(h) {
  const all = [];
  for (const p of h.players) all.push(...p.hand, ...p.flowers, ...p.discards, ...p.melds.flatMap(m => m.tiles));
  if (h.pendingKong) all.push(h.pendingKong.id);
  all.push(...h.wall.slice(h.front, h.back));
  assert.equal(all.length, 144, 'tile count ' + all.length);
  assert.equal(new Set(all).size, 144, 'duplicate tiles');
}

function handSizesOk(h) {
  for (const p of h.players) {
    const kongs = p.melds.filter(m => m.type === 'kong').length;
    const n = p.hand.length + p.melds.length * 3;
    const expect = (h.phase === 'turn' && h.turn === p.seat) ? 14 : 13;
    if (h.phase === 'over') continue;
    if (h.phase === 'rob' && h.pendingKong.seat === p.seat) { assert.equal(n, 13, 'rob size'); continue; }
    assert.equal(n, expect, `seat ${p.seat} holds ${n} (phase ${h.phase}, kongs ${kongs})`);
  }
}

test('claims: pung beats chow, nearest winner takes a double ron', () => {
  const h = new Hand({ seed: 3, dealer: 0 });
  h.start();
  // Rig hands: seat 0 discards 5m. Seat 1 can chow, seat 2 can pung.
  h.players[1].hand = [K('4m')[0] * 4, K('6m')[0] * 4, ...h.players[1].hand.filter(i => ![12, 20].includes(i) && kindOf(i) !== 3 && kindOf(i) !== 5).slice(0, 11)];
  h.players[2].hand = [K('5m')[0] * 4 + 1, K('5m')[0] * 4 + 2, ...h.players[2].hand.filter(i => kindOf(i) !== 4).slice(0, 11)];
  const fiveM = K('5m')[0] * 4 + 3;
  // put the 5m into seat 0's hand by swapping with any tile
  const p0 = h.players[0];
  if (!p0.hand.includes(fiveM)) {
    const owner = h.players.find(p => p.hand.includes(fiveM));
    const wallIdx = h.wall.indexOf(fiveM);
    if (owner) { owner.hand[owner.hand.indexOf(fiveM)] = p0.hand[0]; }
    else if (wallIdx >= 0) h.wall[wallIdx] = p0.hand[0];
    p0.hand[0] = fiveM;
  }
  h.drawn = p0.hand[p0.hand.length - 1];
  h.act(0, { type: 'discard', id: fiveM });
  assert.equal(h.phase, 'claim');
  assert.ok(h.claimOptions(1).chows.length > 0);
  assert.ok(h.claimOptions(2).pung);
  h.resolveClaims([null, { type: 'chow', start: 3 }, { type: 'pung' }, null]);
  assert.equal(h.turn, 2);
  assert.equal(h.players[2].melds[0].type, 'pung');
});

function playHand(h, maxSteps = 600) {
  for (let step = 0; step < maxSteps && h.phase !== 'over'; step++) {
    handSizesOk(h);
    if (h.phase === 'turn') {
      const v = h.view(h.turn);
      h.act(h.turn, botTurn(v, h.turnOptions(h.turn)));
    } else {
      const res = [0, 1, 2, 3].map(s => {
        const o = h.claimOptions(s);
        if (!o) return null;
        if (h.phase === 'rob') return o.win ? { type: 'win' } : null;
        return botClaim(h.view(s), o);
      });
      h.resolveClaims(res);
    }
    accounted(h);
  }
  assert.equal(h.phase, 'over', 'hand did not finish');
}

const N = +(process.argv[2] || 120);
test(`${N} bot hands at 3 faan minimum: tiles accounted, payments balance`, () => {
  const stats = { win: 0, draw: 0, self: 0, faan: {} , ms: 0};
  const t0 = Date.now();
  for (let seed = 1; seed <= N; seed++) {
    const h = new Hand({ seed, dealer: seed % 4, prevailing: 0 });
    h.start();
    playHand(h);
    const r = h.result;
    assert.equal(r.payments.reduce((a, b) => a + b, 0), 0);
    if (r.type === 'win') {
      stats.win++; if (r.from === null) stats.self++;
      stats.faan[r.score.faan] = (stats.faan[r.score.faan] || 0) + 1;
      assert.ok(r.score.faan >= 3);
    } else stats.draw++;
  }
  stats.ms = Math.round((Date.now() - t0) / N);
  console.log('     ', JSON.stringify(stats));
  assert.ok(stats.win / N > 0.45, 'bots win too rarely: ' + stats.win + '/' + N);
});

test('match: dealer stays on a dealer win, passes otherwise, East round ends', () => {
  const m = new Match({ seed: 7, rules: { length: 'east' }, firstDealer: 0 });
  let guard = 0;
  while (!m.over && guard++ < 40) {
    const h = m.newHand();
    playHand(h);
    const d = m.dealer;
    const { stays } = m.finishHand();
    if (h.result.type === 'draw' || h.result.winner === h.dealer) assert.equal(stays, true);
    else assert.equal(m.dealer === (d + 1) % 4 || m.over, true);
  }
  assert.equal(m.over, true);
  assert.equal(m.scores.reduce((a, b) => a + b, 0), 0);
});

test('view hides opponents\' concealed tiles', () => {
  const h = new Hand({ seed: 11 });
  h.start();
  const v = h.view(1);
  assert.ok(Array.isArray(v.players[1].hand));
  for (const s of [0, 2, 3]) assert.equal(v.players[s].hand, null);
  assert.ok(sortIds([5, 1, 9], 1).at(-1) === 1);
});

if (failed) { console.log(failed + ' failed'); process.exit(1); }
console.log('all passed');
