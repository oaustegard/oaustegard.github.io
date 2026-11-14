// ?bot&fights=rollout: the TRM bot's fights decided by played-out futures, from oaustegard/experiments
// trm-doom-rollouts (web/combat.js and web/fork.js), adapted to run beside the live game.
//
// In a fight, every 12 tics, the game's state (four GPU buffers: sectors, things, line state, World) is copied
// into a shadow game on the same GPU device. There, each of 6 moves (the bot's own, stand, toward, away, left,
// right of the enemy) is played for 70 tics in 2 copies with other random numbers, and scored on damage dealt and
// taken, kills and death. The live game keeps running meanwhile: the shadow has buffers and a bind group of its
// own, and only reuses the engine's pipelines. Over 18 same-seed pairs on E1M4-E1M6 this cut the bot's deaths
// from 16 to 1 (trm-doom-rollouts/RESULTS.md).
//
// A decision is about 840 tics of game logic. To keep a laptop or phone cool, rollouts take at most about half
// of the wall clock, yield a frame between futures, and switch off for the session if decisions stay slow.

import { TIC_KERNELS } from "../shaders.js?v=20261114154959";

const TAU = 2 * Math.PI;
const wrap = (a) => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
const MOVES = [["bot", "route"], ["stand", null], ["toward", 0], ["away", Math.PI], ["left", Math.PI / 2], ["right", -Math.PI / 2]];

// A second game on the same device: copies of the four state buffers, a frame uniform and a scratch queue of its own.
class Shadow {
  constructor(eng, device, W) { this.eng = eng; this.d = device; this.W = W; this.src = null; }

  ensure() {
    const e = this.eng, live = [e.secBuf, e.mobjBuf, e.lsBuf, e.worldBuf];
    if (this.src && this.src.every((b, i) => b === live[i])) return;
    this.destroy();
    const d = this.d, mk = (size, usage) => d.createBuffer({ size, usage });
    const S = GPUBufferUsage;
    this.src = live;
    this.saved = live.map((b) => mk(b.size, S.COPY_SRC | S.COPY_DST));
    this.work = live.map((b) => mk(b.size, S.STORAGE | S.COPY_SRC | S.COPY_DST));
    this.frameBuf = mk(80, S.UNIFORM | S.COPY_DST);
    this.queueBuf = mk(e.queueBuf.size, S.STORAGE);
    this.bind = d.createBindGroup({ layout: e.layout, entries: [
      e.gfxBuf, e.mapBuf, this.work[0], this.work[1], this.work[2], this.work[3], e.fbBuf, this.frameBuf, this.queueBuf,
    ].map((buffer, binding) => ({ binding, resource: { buffer } })) });
    this.rb = d.createBuffer({ size: this.work[1].size + 4096, usage: S.MAP_READ | S.COPY_DST });
    this.frameNo = 1 << 30; // its own frame numbers, never equal to the live game's
  }

  destroy() { for (const b of [...(this.saved || []), ...(this.work || []), this.frameBuf, this.queueBuf, this.rb]) b?.destroy(); this.src = null; }

  copy(from, to) {
    const enc = this.d.createCommandEncoder();
    from.forEach((b, i) => enc.copyBufferToBuffer(b, 0, to[i], 0, b.size));
    this.d.queue.submit([enc.finish()]);
  }
  save() { this.ensure(); this.copy(this.src, this.saved); }
  restore() { this.copy(this.saved, this.work); }
  setWord(k, v) { this.d.queue.writeBuffer(this.work[3], k * 4, new Uint32Array([v >>> 0])); }

  // one tic of game logic on the shadow buffers, as Engine.encodeFrame runs it, without drawing
  tic(input) {
    const e = this.eng, fu = new Uint32Array(20), ff = new Float32Array(fu.buffer);
    fu[0] = e.width; fu[1] = e.height; fu[2] = e.viewh; fu[3] = ++this.frameNo;
    ff[8] = input.forward || 0; ff[9] = input.side || 0; ff[10] = input.turn || 0;
    fu[12] = (input.fire ? 1 : 0) | (input.use ? 2 : 0); fu[13] = input.weapon || 0; ff[16] = 1;
    this.d.queue.writeBuffer(this.frameBuf, 0, fu);
    this.d.queue.writeBuffer(this.work[3], this.W.viscount * 4, new Uint32Array([0]));
    const groups = { save: Math.ceil(Math.max(e.maxMobjs, e.map.sectors.length) / 64), mobj: Math.ceil(e.maxMobjs / 64), sector: Math.ceil(e.map.sectors.length / 64) };
    const te = this.d.createCommandEncoder(), tp = te.beginComputePass();
    tp.setBindGroup(0, this.bind);
    e.ticPipes.forEach((p, k) => { const g = TIC_KERNELS[k][1]; tp.setPipeline(p); tp.dispatchWorkgroups(groups[g] ?? g); });
    tp.end();
    this.d.queue.submit([te.finish()]);
  }

  // byte ranges of the shadow's world (3) and things (1) buffers, or of the saved copy
  async read(parts, from = this.work) {
    const total = parts.reduce((a, [, , n]) => a + n, 0), enc = this.d.createCommandEncoder();
    let o = 0;
    for (const [i, off, n] of parts) { enc.copyBufferToBuffer(from[i], off, this.rb, o, n); o += n; }
    this.d.queue.submit([enc.finish()]);
    await this.rb.mapAsync(GPUMapMode.READ, 0, total);
    const all = this.rb.getMappedRange(0, total).slice(0);
    this.rb.unmap();
    const out = []; o = 0;
    for (const [, , n] of parts) { out.push(all.slice(o, o + n)); o += n; }
    return out;
  }
}

export class RolloutFights {
  constructor(bot, engine, device, { W, MF }, opts = {}) {
    this.bot = bot; this.eng = engine; this.W = W; this.MF = MF;
    this.sh = new Shadow(engine, device, W);
    this.o = { horizon: 70, commit: 12, scenarios: 2, readEvery: 3, risk: 0.5, hysteresis: 5, duty: 0.5, slowMs: 2500, ...opts };
    this.plan = null; this.decisions = 0; this.ms = 0; this.off = null; this.restUntil = 0; this.busy = false;
    this.yieldFn = opts.yieldFn || (() => new Promise((r) => requestAnimationFrame(() => r())));
  }
  get s() { return this.bot.s; }
  get tic() { return this.bot.tic; }
  readState(st) { return this.bot.readState(st); }
  debug() { return this.bot.debug(); }
  status() {
    if (this.off) return `rollout fights off (${this.off})`;
    return this.decisions ? `${this.decisions} fight decisions, ${Math.round(this.ms / this.decisions)} ms each` : "rollout fights";
  }
  dispose() { this.sh.destroy(); }

  policy(move, base, px, py, pa, ex, ey, er, alive) {
    const d = Math.hypot(ex - px, ey - py) || 1, bearing = Math.atan2(ey - py, ex - px), err = wrap(bearing - pa);
    const input = { forward: 0, side: 0, turn: Math.max(-0.3, Math.min(0.3, err)), use: false, weapon: 0,
      fire: alive && Math.abs(err) < Math.max(0.05, Math.atan2(er * 0.8, d)) && (this.melee ? d < 80 : d < 900 || this.rocket) };
    let vx = 0, vy = 0;
    if (move[1] === "route") { vx = base.vx; vy = base.vy; }
    else if (move[1] !== null) { const a = bearing + move[1]; vx = Math.cos(a); vy = Math.sin(a); }
    const ca = Math.cos(pa), sa = Math.sin(pa);
    input.forward = 50 * (vx * ca + vy * sa); input.side = 40 * (vx * sa - vy * ca);
    return input;
  }
  worldMove(inp, pa) {
    const f = (inp.forward || 0) / 50, s = (inp.side || 0) / 40, ca = Math.cos(pa), sa = Math.sin(pa);
    return { vx: f * ca + s * sa, vy: f * sa - s * ca };
  }
  safe(move, p, en) {
    if (move[1] === "route" || move[1] === null) return true;
    const g = this.bot.fine?.grid;
    if (!g) return true;
    const a = Math.atan2(en.m.y - p.y, en.m.x - p.x) + move[1];
    return this.bot.gridLineClear(g, p.x, p.y, p.x + Math.cos(a) * 40, p.y + Math.sin(a) * 40, true);
  }
  monsterHealth(buf) {
    const mi = new Int32Array(buf), mu = new Uint32Array(buf), h = new Map();
    for (let k = 1; k < mu.length / 32; k++) { const o = k * 32; if (mu[o + 24] && mu[o + 14] & this.MF.COUNTKILL) h.set(k, Math.max(0, mi[o + 15])); }
    return h;
  }
  world(buf) { const wf = new Float32Array(buf), wi = new Int32Array(buf), wu = new Uint32Array(buf), W = this.W;
    return { x: wf[W.viewx], y: wf[W.viewy], angle: wf[W.viewangle], kills: wi[W.killcount], health: wi[W.health], armor: wi[W.armor], dead: wu[W.dead], rng: wu[W.rng] }; }

  async rollout(move, base, seed, en, s0) {
    const sh = this.sh, o = this.o, W = this.W;
    sh.restore(); sh.setWord(W.rng, seed);
    let px = s0.w.x, py = s0.w.y, pa = s0.w.angle, ex = s0.ex, ey = s0.ey, alive = true;
    for (let t = 0; t < o.horizon; t++) {
      if (t > 0 && t % o.readEvery === 0) {
        const [wb, mb] = await sh.read([[3, 0, 16], [1, en.m.k * 128, 128]]);
        const wf = new Float32Array(wb), mi = new Int32Array(mb), mu = new Uint32Array(mb);
        px = wf[W.viewx]; py = wf[W.viewy]; pa = wf[W.viewangle];
        ex = mi[0] / 65536; ey = mi[1] / 65536; alive = !!mu[24] && mi[15] > 0;
      }
      const inp = this.policy(move, base, px, py, pa, ex, ey, en.m.r, alive);
      if (t === 0 && base.weapon) inp.weapon = base.weapon;
      sh.tic(inp);
    }
    const [wb, mb] = await sh.read([[3, 0, 1280], [1, 0, sh.work[1].size]]);
    const w1 = this.world(wb), h1 = this.monsterHealth(mb);
    let dealt = 0;
    for (const [k, v] of s0.h) dealt += v - (h1.get(k) ?? 0);
    const hurt = (s0.w.health - Math.max(0, w1.health)) + (s0.w.armor - w1.armor) / 3;
    return dealt + 50 * (w1.kills - s0.w.kills) - 4 * hurt - 2000 * (w1.dead ? 1 : 0);
  }

  async decide(base, p, en) {
    const t0 = performance.now(), o = this.o, sh = this.sh;
    sh.save();
    // score against the snapshot itself, not the slightly older state the bot read
    const [wb, mb] = await sh.read([[3, 0, 1280], [1, 0, sh.saved[1].size]], sh.saved);
    const mi = new Int32Array(mb), slot = en.m.k * 32;
    const s0 = { w: this.world(wb), h: this.monsterHealth(mb), ex: mi[slot] / 65536, ey: mi[slot + 1] / 65536 };
    let best = null;
    for (const move of MOVES) {
      if (!this.safe(move, p, en)) continue;
      const sc = [];
      for (let k = 0; k < o.scenarios; k++) {
        sc.push(await this.rollout(move, base, (s0.w.rng + 97 + 61 * k) & 255, en, s0));
        await this.yieldFn(); // a display frame between futures, so the live game keeps drawing
      }
      const mean = sc.reduce((a, b) => a + b, 0) / sc.length, worst = Math.min(...sc);
      const score = mean - o.risk * (mean - worst) + (this.plan?.name === move[0] ? o.hysteresis : 0);
      if (!best || score > best.score) best = { name: move[0], move, score };
    }
    const ms = performance.now() - t0;
    this.decisions++; this.ms += ms;
    // at most `duty` of the wall clock: rest as long as the decision took, scaled
    this.restUntil = performance.now() + ms * (1 - o.duty) / o.duty;
    if (this.decisions === 4 && this.ms / 4 > o.slowMs) { this.off = `${Math.round(this.ms / 4)} ms a decision on this GPU`; this.dispose(); }
    return best;
  }

  async step() {
    const input = await this.bot.step();
    const p = this.s.p;
    if (this.off || p.dead || p.exit) return input;
    const en = this.bot.enemy();
    const noAmmo = p.ammo[0] <= 0 && p.ammo[1] <= 0 && p.ammo[2] <= 0 && p.ammo[3] <= 0;
    if (!en || en.unseen || (noAmmo && en.d > 120) || input.use || this.bot.unstick > 0) { this.plan = null; return input; }
    this.rocket = p.ready >= 4 && p.ready <= 6; this.melee = p.ready === 0 || p.ready === 7;
    const base = { ...this.worldMove(input, p.angle), weapon: input.weapon || 0 };
    const due = !this.plan || this.tic >= this.plan.until || this.plan.enemy !== en.m.k;
    if (due && performance.now() >= this.restUntil) {
      this.busy = true;
      try { const best = await this.decide(base, p, en); if (best) this.plan = { name: best.name, move: best.move, until: this.tic + this.o.commit, enemy: en.m.k }; }
      finally { this.busy = false; }
    }
    if (!this.plan || this.plan.name === "bot" || this.plan.enemy !== en.m.k) return input;
    const out = this.policy(this.plan.move, base, p.x, p.y, p.angle, en.m.x, en.m.y, en.m.r, true);
    out.weapon = input.weapon || 0;
    return out;
  }
}
