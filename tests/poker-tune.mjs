// node tests/poker-tune.mjs <out.json> [generations] [workers]
// Searches the computer player's constants (PARAMS in games/poker/ai.js, plus the tight-aggressive style's
// own tightness and randomness) for the values that win the most against a mixed field.
//
// Each generation draws fresh deals and plays the incumbent and four perturbed candidates on the same
// deals (duplicate format, as tests/poker-bots.mjs, against v1, the calling station, the maniac and the
// default tight-aggressive player, in no-limit and fixed-limit Hold'em and Stud Hi-Lo). A candidate
// replaces the incumbent only if it beats it on those deals by more than two paired standard errors; the
// step size grows after a success and shrinks after a failure. Every generation is checkpointed to
// out.json, and a rerun resumes from it. The last line is "done -> out.json".
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import fs from 'node:fs';
import { Hand, stakesFor, rng } from '../games/poker/rules.js';
import { botAct, STYLES, TableModel, PARAMS } from '../games/poker/ai.js';
import * as v1 from './poker-ai-v1.mjs';

// The search space: [low, high] for each constant ('tag.' names are fields of the tight-aggressive style).
const SPACE = {
  csFloor: [0.005, 0.08], csK: [1.4, 2.6], pfrRe: [0.2, 0.7], sizeOff: [0.3, 1.5], sizeExp: [0.2, 1.2],
  betBase: [0.12, 0.4], betAggr: [0.1, 0.6], betRe: [0.3, 0.9], callWiden: [0.1, 0.45], callFloor: [0.01, 0.12],
  edgeK: [0.15, 0.6], trap: [0.2, 0.8], foldBias: [0, 1.2], discMul: [0.3, 1.5], oop: [0.75, 1], studPos: [0.85, 1],
  aggrK: [0, 0.16], overbet: [1.2, 3.5], minRe: [0.4, 1], 'tag.tight': [-0.03, 0.1], 'tag.temp': [0.01, 0.08], 'tag.bluff': [0.5, 1.6],
};
const KEYS = Object.keys(SPACE);
const CELLS = [   // game, structure, deals per generation, weight (no-limit swings ~10× more)
  ['holdem', 'nl', 100, 0.15], ['holdem', 'fl', 100, 1], ['stud8', 'fl', 50, 1],
];
const OPPONENTS = ['v1', 'station', 'maniac', 'tag'];
const N = 6, BB = 20, STACK = 100 * BB, ITERS = 120;
const SCALE = +process.env.TUNE_SCALE || 1;   // shrink the deals for a quick smoke run

const defaults = () => Object.fromEntries(KEYS.map(k => [k, k.startsWith('tag.') ? STYLES.tag[k.slice(4)] : PARAMS[k]]));
const toX = v => KEYS.map(k => (v[k] - SPACE[k][0]) / (SPACE[k][1] - SPACE[k][0]));
const fromX = x => Object.fromEntries(KEYS.map((k, i) => [k, SPACE[k][0] + Math.min(1, Math.max(0, x[i])) * (SPACE[k][1] - SPACE[k][0])]));

// ---------- worker: one cell for one candidate ----------
function makePlayer(name, cand) {
  if (name === 'v1') return (view, o) => v1.botAct(view, o, {}, o.kind === 'bet' ? v1.equity(view, ITERS) : null);
  if (name === 'cand') {
    const params = { ...PARAMS }, style = { ...STYLES.tag };
    for (const [k, v] of Object.entries(cand)) { if (k.startsWith('tag.')) style[k.slice(4)] = v; else params[k] = v; }
    return (view, o, model) => botAct(view, o, { style, model, params, iters: ITERS });
  }
  const style = STYLES[name];
  return (view, o, model) => botAct(view, o, { style, model, iters: ITERS });
}
function runCell({ cand, game, structure, opp, deals, base }) {
  const A = makePlayer('cand', cand), B = makePlayer(opp);
  const passes = [Array.from({ length: N }, (_, s) => (s % 2 ? B : A)), Array.from({ length: N }, (_, s) => (s % 2 ? A : B))];
  const models = [new TableModel(N), new TableModel(N)];
  const out = [];
  const saved = Math.random;
  for (let d = base; d < base + deals; d++) {
    let a = 0;
    passes.forEach((assign, pi) => {
      Math.random = rng(d * 7919 + 1);
      const h = new Hand({ variant: game, structure, stakes: stakesFor(BB), seats: Array.from({ length: N }, (_, s) => ({ seat: s, stack: STACK })), n: N, button: d % N, rand: rng(1e6 + d) });
      let steps = 0;
      while (h.phase !== 'over' && steps++ < 600) { const s = h.toAct; h.act(s, assign[s](h.view(s), h.options(s), models[pi])); }
      models[pi].observe(h.view(-1));
      h.players.forEach((p, s) => { if (assign[s] === A) a += p.stack - STACK; });
    });
    out.push(a / BB / N * 100);   // bb/100 for the candidate on this deal
  }
  Math.random = saved;
  return out;
}
if (!isMainThread) {
  parentPort.on('message', job => parentPort.postMessage({ id: job.id, res: runCell(job) }));
} else {
  const [outPath, gensArg = 60, workersArg = 4] = process.argv.slice(2);
  if (!outPath) { console.log('usage: node tests/poker-tune.mjs <out.json> [generations] [workers]'); process.exit(1); }
  const workers = Array.from({ length: +workersArg }, () => new Worker(new URL(import.meta.url)));
  let nextId = 0;
  const waiting = new Map(), queue = [];
  const idle = workers.slice();
  const pump = () => {
    while (idle.length && queue.length) {
      const w = idle.pop(), job = queue.shift();
      w.once('message', m => { waiting.get(m.id)(m.res); waiting.delete(m.id); idle.push(w); pump(); });
      w.postMessage(job);
    }
  };
  const submit = job => new Promise(res => { job.id = nextId++; waiting.set(job.id, res); queue.push(job); pump(); });

  // One candidate's per-deal scores over every cell and opponent, weighted, on the generation's deals.
  async function evaluate(cand, base) {
    const parts = await Promise.all(CELLS.flatMap(([game, structure, deals, wt]) => OPPONENTS.map(opp =>
      submit({ cand, game, structure, opp, deals: Math.max(3, Math.round(deals * SCALE)), base: base + (game === 'stud8' ? 50000 : 0) }).then(r => r.map(x => x * wt / OPPONENTS.length)))));
    return parts.flat();
  }
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const pairedSE = (a, b) => { const d = a.map((x, i) => x - b[i]), m = mean(d); return Math.sqrt(d.reduce((x, y) => x + (y - m) ** 2, 0) / (d.length - 1) / d.length); };

  let st = { gen: 0, x: toX(defaults()), sigma: 0.12, history: [], start: defaults() };
  if (fs.existsSync(outPath)) { st = JSON.parse(fs.readFileSync(outPath, 'utf8')); console.log(`resuming at generation ${st.gen}`); }
  const R = rng(4242 + st.gen);
  const gauss = () => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  while (st.gen < +gensArg) {
    const t0 = Date.now(), base = 1000 * (st.gen + 1);
    const cands = Array.from({ length: 4 }, () => st.x.map(v => Math.min(1, Math.max(0, v + st.sigma * gauss()))));
    const [inc, ...scores] = await Promise.all([st.x, ...cands].map(x => evaluate(fromX(x), base)));
    const gains = scores.map(sc => ({ gain: mean(sc) - mean(inc), se: pairedSE(sc, inc) }));
    let best = -1;
    gains.forEach((g, i) => { if (g.gain > 2 * g.se && (best < 0 || g.gain > gains[best].gain)) best = i; });
    if (best >= 0) { st.x = cands[best]; st.sigma = Math.min(0.25, st.sigma * 1.25); } else st.sigma = Math.max(0.03, st.sigma * 0.88);
    st.history.push({ gen: st.gen, incumbent: +mean(inc).toFixed(2), gains: gains.map(g => `${g.gain.toFixed(1)}±${g.se.toFixed(1)}`), accepted: best, sigma: +st.sigma.toFixed(3), secs: Math.round((Date.now() - t0) / 1000) });
    st.best = fromX(st.x);
    st.gen++;
    fs.writeFileSync(outPath, JSON.stringify(st, null, 1));
    console.log(`gen ${st.gen - 1}: incumbent ${mean(inc).toFixed(1)}, candidates ${st.history.at(-1).gains.join(' ')}, ${best >= 0 ? 'accepted ' + best : 'kept'}, sigma ${st.sigma.toFixed(3)}, ${st.history.at(-1).secs}s`);
  }
  fs.writeFileSync(outPath, JSON.stringify(st, null, 1));
  console.log('best:', JSON.stringify(st.best));
  console.log(`done -> ${outPath}`);
  workers.forEach(w => w.terminate());
}
