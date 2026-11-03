// node tests/poker-net.mjs [samples]
// Checks the hand-wired network (games/poker/net.js) against the game's own rules:
//  1. its made-hand ladder against evalHigh's category on random five- and seven-card hands (all cards mine,
//     as in stud and draw; a straight flush reads as a flush, which the ladder ranks below a full house);
//  2. its Omaha ladder (exactly two hole cards and three from the board) against bestHands on random deals;
//  3. its eight-or-better low against evalLow/qualifies8 (any five of seven) and against Omaha's low;
//  4. its first-round hold'em score against the Chen formula on all 1,326 starting hands;
//  5. full hands of every game with the network in every seat and beside the default bot: every action
//     legal, chips conserved.
import { evalHigh, evalLow, qualifies8, bestHands, Hand, VARIANTS, stakesFor, rng, fullDeck, shuffled, rankOf, suitOf } from '../games/poker/rules.js';
import { NET, probe, inputIndex, netAct } from '../games/poker/net.js';
import { botAct, STYLES } from '../games/poker/ai.js';
import { writeFileSync } from 'node:fs';

const N = +(process.argv[2] || 20000);
const rand = rng(12345);
const RN = '23456789TJQKA', SN = 'cdhs', name = c => RN[c >> 2] + SN[c & 3];
let fails = 0;
const summary = { samples: N };   // written to $NET_JSON when set
const check = (ok, msg) => { if (!ok) { fails++; if (fails < 15) console.log('FAIL', msg); } };

function vec(variant, mine, board = [], ctx = {}) {
  const x = new Float32Array(NET.nIn);
  for (const c of mine) x[inputIndex('m.' + name(c))] = 1;
  for (const c of board) x[inputIndex('s.' + name(c))] = 1;
  x[inputIndex('v.' + variant)] = 1;
  for (const [k, v] of Object.entries({ later: 1, n1: 1, ...ctx })) x[inputIndex(k)] = v;
  return x;
}
const topOf = (p, prefix = '') => { let k = 0; for (let j = 1; j <= 7; j++) if (p[`${prefix}ge${j}`] > 0.5) k = j; return k; };
const GE = [1, 2, 3, 4, 5, 6, 7].map(j => 'ge' + j), OGE = GE.map(g => 'o.' + g);

// 1. The any-five-cards ladder.
for (const n of [5, 7]) {
  const agree = new Array(9).fill(0), seen = new Array(9).fill(0);
  for (let i = 0; i < N; i++) {
    const cards = shuffled(fullDeck(), rand).slice(0, n);
    const cat = evalHigh(cards) >> 20, want = cat === 8 ? 5 : cat;
    const got = topOf(probe(vec('stud7', cards), GE));
    seen[cat]++; if (got === want) agree[cat]++;
    check(got === want, `${n} cards ${cards.map(name).join(' ')}: ladder ${got}, evalHigh ${cat}`);
  }
  console.log(`ladder vs evalHigh, ${n} cards: ${agree.reduce((a, b) => a + b)}/${N} agree  (by category: ${seen.map((s, k) => `${k}:${agree[k]}/${s}`).join(' ')})`);
  summary[`ladder${n}`] = { agree: agree.reduce((a, b) => a + b), of: N, straightFlushes: seen[8] };
}

// 2. Omaha's ladder against bestHands (flop, turn and river).
for (const nb of [3, 4, 5]) {
  // On a paired board the ladder leaves out what the board alone makes (everyone holds the board pair), as
  // in hold'em; so it is exact only on unpaired boards, and on paired boards counts only my own pairings.
  let agree = 0, unp = 0, unpAgree = 0;
  const miss = new Map();
  for (let i = 0; i < N; i++) {
    const d = shuffled(fullDeck(), rand), hole = d.slice(0, 4), board = d.slice(4, 4 + nb);
    const cat = bestHands(hole, board, 'omaha', 'high').high >> 20, want = cat === 8 ? 5 : cat;
    const got = topOf(probe(vec('omaha', hole, board), OGE), 'o.');
    const paired = new Set(board.map(rankOf)).size < board.length;
    if (!paired) { unp++; if (got === want) unpAgree++; else { const k = `${want}->${got}`; miss.set(k, (miss.get(k) || 0) + 1); check(false, `omaha ${hole.map(name)} | ${board.map(name)}: net ${got}, rules ${cat}`); } }
    if (got === want) agree++;
  }
  console.log(`Omaha ladder vs bestHands, board ${nb}: unpaired boards ${unpAgree}/${unp} agree${miss.size ? ' (misses ' + [...miss].map(([k, v]) => k + ' ×' + v).join(', ') + ')' : ''}; all boards ${agree}/${N}`);
  summary[`omaha${nb}`] = { unpairedAgree: unpAgree, unpaired: unp, allAgree: agree, of: N };
}

// 3. Lows.
{
  let agree = 0, agreeO = 0;
  for (let i = 0; i < N; i++) {
    const cards = shuffled(fullDeck(), rand).slice(0, 7);
    const want = qualifies8(evalLow(cards)) ? 1 : 0;
    const got = probe(vec('stud8', cards), ['L8_5']).L8_5 > 0.5 ? 1 : 0;
    if (got === want) agree++;
    check(got === want, `low ${cards.map(name).join(' ')}: net ${got}, rules ${want}`);
    const d = shuffled(fullDeck(), rand), hole = d.slice(0, 4), board = d.slice(4, 9);
    const wantO = bestHands(hole, board, 'omaha', 'hilo8').low != null ? 1 : 0;
    const gotO = probe(vec('omaha8', hole, board), ['o.low'])['o.low'] > 0.5 ? 1 : 0;
    if (gotO === wantO) agreeO++;
    check(gotO === wantO, `omaha low ${hole.map(name)} | ${board.map(name)}: net ${gotO}, rules ${wantO}`);
  }
  console.log(`eight-or-better low, 7 cards: ${agree}/${N} agree; Omaha low (river): ${agreeO}/${N} agree`);
  summary.low8 = { agree, of: N }; summary.omahaLow = { agree: agreeO, of: N };
}

// 4. Chen.
{
  const CHEN = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 10];
  const chen = (a, b) => {
    let hi = rankOf(a), lo = rankOf(b);
    if (lo > hi) [hi, lo] = [lo, hi];
    if (hi === lo) return Math.max(5, CHEN[hi] * 2);
    let s = CHEN[hi];
    if (suitOf(a) === suitOf(b)) s += 2;
    const gap = hi - lo - 1;
    s -= gap === 0 ? 0 : gap === 1 ? 1 : gap === 2 ? 2 : gap === 3 ? 4 : 5;
    if (gap <= 1 && hi < 10) s += 1;
    return s;
  };
  let agree = 0, total = 0;
  for (let a = 0; a < 52; a++) for (let c = a + 1; c < 52; c++) {
    total++;
    const got = probe(vec('holdem', [a, c], [], { later: 0, first: 1 }), ['score.holdem'])['score.holdem'];
    if (Math.abs(got - chen(a, c)) < 1e-4) agree++; else check(false, `Chen ${name(a)}${name(c)}: net ${got}, formula ${chen(a, c)}`);
  }
  console.log(`hold'em first-round score vs the Chen formula: ${agree}/${total} equal`);
  summary.chen = { agree, of: total };
}

// 5. Whole hands.
{
  let hands = 0;
  for (const variant of Object.keys(VARIANTS)) for (const structure of VARIANTS[variant].structures) for (const mix of [false, true]) {
    for (let d = 0; d < 40; d++) {
      const n = 2 + (d % 5), saved = Math.random;
      Math.random = rng(d * 31 + 7);
      try {
        const h = new Hand({ variant, structure, stakes: stakesFor(20), seats: Array.from({ length: n }, (_, s) => ({ seat: s, stack: 400 + 300 * s })), n, button: d % n, rand: rng(d + 99) });
        const before = h.players.reduce((x, p) => x + p.stack, 0) + h.potTotal();
        let steps = 0;
        while (h.phase !== 'over') {
          const s = h.toAct, o = h.options(s);
          const a = mix && s % 2 ? botAct(h.view(s), o, { style: STYLES.tag, iters: 40 }) : netAct(h.view(s), o);
          try { h.act(s, a); } catch (e) { check(false, `${variant} ${structure}: illegal ${JSON.stringify(a)} (${e.message})`); h.act(s, o.kind === 'draw' ? { type: 'draw', discard: [] } : o.canCheck ? { type: 'check' } : o.bringIn != null ? { type: 'bringin' } : { type: 'fold' }); }
          if (++steps > 400) { check(false, `${variant} ${structure}: hand did not finish`); break; }
        }
        const after = h.players.reduce((x, p) => x + p.stack, 0);
        check(after === before, `${variant} ${structure}: chips ${before} -> ${after}`);
        hands++;
      } finally { Math.random = saved; }
    }
  }
  console.log(`${hands} whole hands across every game and structure`);
  summary.hands = hands;
}
console.log(fails ? `${fails} failures` : 'all checks passed');
summary.failures = fails;
if (process.env.NET_JSON) writeFileSync(process.env.NET_JSON, JSON.stringify(summary, null, 1) + '\n');
process.exit(fails ? 1 : 0);
