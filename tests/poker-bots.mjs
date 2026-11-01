// node tests/poker-bots.mjs [deals] [game] [structure] [A] [B] [seats]
// Duplicate matches between two computer players, so luck in the cards cancels out.
// Each deal is played twice from the same deck and button: once with A in the even seats and B in the
// odd ones, then with the seats swapped. Every hand starts at 100 big blinds, and each pass keeps its own
// TableModel, so the opponent model learns over the run. Prints A's result in big blinds per 100 hands
// with a standard error; |mean| over 2 standard errors is a real difference.
//
// Players: v1 (the first bot, frozen in tests/poker-ai-v1.mjs), or a style name from ai.js
// (tag, lag, rock, station, maniac), optionally with '-norange' to turn off range reading.
// Examples:  node tests/poker-bots.mjs 400 holdem nl tag v1
//            node tests/poker-bots.mjs 300 omaha8 fl tag station 6
import { Hand, stakesFor, rng, VARIANTS } from '../games/poker/rules.js';
import { botAct, analyze, STYLES, TableModel } from '../games/poker/ai.js';
import * as v1 from './poker-ai-v1.mjs';

const [deals = 300, game = 'holdem', structure = 'nl', A = 'tag', B = 'v1', seatsArg = 6] = process.argv.slice(2);
const N = +seatsArg, BB = 20, STACK = 100 * BB, ITERS = 150;

function player(name) {
  if (name === 'v1') return { name, act: (view, o) => v1.botAct(view, o, {}, o.kind === 'bet' ? v1.equity(view, ITERS) : null) };
  const [key, flag] = name.split('-');
  const style = { ...STYLES[key] };
  if (!style.key) throw new Error('unknown player ' + name);
  if (flag === 'norange') style.range = false;
  return { name, act: (view, o, model) => botAct(view, o, { style, model, iters: ITERS }) };
}
const PA = player(A), PB = player(B);

// One hand from a fixed deck; returns each seat's chip change.
function play(deal, assign, model) {
  // Bots draw random numbers too (Monte Carlo, mixing); seed those per deal and pass as well.
  const saved = Math.random;
  Math.random = rng(deal * 7919 + 1);
  try {
    const h = new Hand({ variant: game, structure, stakes: stakesFor(BB), seats: Array.from({ length: N }, (_, s) => ({ seat: s, stack: STACK })), n: N, button: deal % N, rand: rng(1e6 + deal) });
    let steps = 0;
    while (h.phase !== 'over') {
      const s = h.toAct, o = h.options(s);
      h.act(s, assign[s].act(h.view(s), o, model));
      if (++steps > 600) throw new Error('hand did not finish');
    }
    model.observe(h.view(-1));
    return h.players.map(p => p.stack - STACK);
  } finally { Math.random = saved; }
}

const t0 = Date.now();
const modelX = new TableModel(N), modelY = new TableModel(N);
const passX = Array.from({ length: N }, (_, s) => (s % 2 ? PB : PA));
const passY = Array.from({ length: N }, (_, s) => (s % 2 ? PA : PB));
const perDeal = [];
for (let d = 0; d < +deals; d++) {
  const x = play(d, passX, modelX), y = play(d, passY, modelY);
  let a = 0;
  for (let s = 0; s < N; s++) { if (passX[s] === PA) a += x[s]; if (passY[s] === PA) a += y[s]; }
  // A's chips per hand it played, in big blinds: A held N/2 seats in each of two passes.
  perDeal.push(a / BB / N);
}
const n = perDeal.length, mean = perDeal.reduce((x, y) => x + y, 0) / n;
const sd = Math.sqrt(perDeal.reduce((x, y) => x + (y - mean) ** 2, 0) / (n - 1));
const se = sd / Math.sqrt(n);
console.log(`${VARIANTS[game].short} ${structure}, ${N} seats, ${n} deals × 2: ${A} vs ${B}: ${(mean * 100).toFixed(1)} ± ${(se * 100).toFixed(1)} bb/100 for ${A}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
