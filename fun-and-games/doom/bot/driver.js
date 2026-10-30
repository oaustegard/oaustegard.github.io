// ?bot: the TRM bot plays. A loop of its own reads the game state back from the GPU, asks the bot for
// input (planning with TRM on the same GPU device as the game) and leaves it for the next tic to take.
// The bot's planner and routing come from oaustegard/experiments trm-doom, vendored here.

import { Bot } from "./bot.js?v=20261030062234";
import { TRMPlanner } from "./trm.js?v=20261030062234";
import { MOBJINFO, MF } from "../info.js?v=20261030062234";
import { LINE_SPECIALS, TR } from "../specials.js?v=20261030062234";

export class BotDriver {
  static async create(device, onStatus = () => {}) {
    const d = new BotDriver();
    d.device = device; d.onStatus = onStatus;
    const base = new URL("./", import.meta.url);
    const [w, man] = await Promise.all([
      fetch(new URL("trm.bin", base)).then((r) => r.arrayBuffer()),
      fetch(new URL("trm.json", base)).then((r) => r.json()),
    ]);
    d.weights = new Float32Array(w); d.man = man;
    d.planner = await TRMPlanner.create(device, d.weights, man);
    // a test plan: a GPU that takes long over a 32×32 window can't afford whole-level plans
    const t0 = performance.now();
    await d.planner.plan(new Uint8Array(1024).fill(2), { sup: 1 });
    await d.planner.plan(new Uint8Array(1024).fill(2), { sup: 1 });
    d.fast = (performance.now() - t0) / 2 < 120;
    d.globals = new Map();
    d.cur = {}; d.gen = 0; d.plans = 0; d.planMs = 0;
    return d;
  }

  // a new level (or a restart): a fresh bot on the engine's current map
  attach(engine, W) {
    this.engine = engine; this.W = W;
    const pl = this.planner, self = this;
    const planner = { async plan(g) { const r = await pl.plan(g, { sup: 4 }); self.plans++; self.planMs += r.ms; return r; } };
    this.bot = new Bot({ wad: engine.wad, map: engine.map, MOBJINFO, MF, LINE_SPECIALS, TR, W }, planner);
    if (this.fast) this.bot.globalPlanner = async (n) => {
      if (!this.globals.has(n)) this.globals.set(n, await TRMPlanner.create(this.device, this.weights, this.man, { w: n, h: n }));
      return this.globals.get(n);
    };
    this.cur = {};
    const gen = ++this.gen;
    this.loop(gen);
  }

  stop() { this.gen++; this.cur = {}; }

  async read() {
    const e = this.engine, d = this.device, enc = d.createCommandEncoder(), out = {};
    const parts = { world: [e.worldBuf, e.worldBuf.size], sec: [e.secBuf, e.secBuf.size], mobj: [e.mobjBuf, e.mobjBuf.size], ls: [e.lsBuf, Math.ceil(e.map.lines.length * 4 / 4) * 4] };
    const rbs = Object.entries(parts).map(([k, [b, size]]) => {
      const rb = d.createBuffer({ size, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
      enc.copyBufferToBuffer(b, 0, rb, 0, size); return [k, rb];
    });
    d.queue.submit([enc.finish()]);
    for (const [k, rb] of rbs) { await rb.mapAsync(GPUMapMode.READ); out[k] = rb.getMappedRange().slice(0); rb.unmap(); rb.destroy(); }
    return out;
  }

  async loop(gen) {
    while (gen === this.gen) {
      try {
        const st = await this.read();
        if (gen !== this.gen) return;
        this.bot.readState(st);
        const p = this.bot.s.p;
        if (p.dead) this.cur = { use: (p.leveltime >> 3) & 1 }; // restart the level
        else if (!p.exit) this.cur = await this.bot.step();
        const d = this.bot.debug();
        this.onStatus(`TRM bot · ${d.target ? d.target.kind : "looking"} · ${this.plans} plans, ${(this.planMs / Math.max(1, this.plans)).toFixed(0)} ms each`);
      } catch (err) { console.error("bot", err); }
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  // The input for one tic: the bot's, with turning and use taken once so a slow bot doesn't repeat them.
  input(base) {
    const c = this.cur;
    const out = { ...base, forward: c.forward || 0, side: c.side || 0, turn: c.turn || 0, use: !!c.use, fire: !!c.fire, weapon: c.weapon || 0 };
    this.cur = { ...c, turn: 0, use: false, weapon: 0 };
    return out;
  }
}
