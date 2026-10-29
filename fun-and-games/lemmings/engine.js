// GPU plumbing for gPu(lemmings): buffers, pipelines and the per-tick encode. The whole game state
// lives in GPU buffers. JS writes the cursor, the click, the chosen skill and the release rate into
// a uniform buffer and reads back a small world block for the panel and the sounds.

import { makeWGSL, PRESENT_WGSL, MAXL, MAXVIEW, NS, WD, ROM, ARGS_WORDS, AUX_FIELD, STATE_KERNELS, SKILLS } from "./shaders.js?v=20261029034843";
import { buildSprites } from "./sprites.js?v=20261029034843";
import { buildTerrain, themeWords } from "./levels.js?v=20261029034843";

export const MINIMAP_H = 32;
const TICK_KERNELS = ["begin", "pick", "assign", "fieldStamp", "classify"];
const ARG_KERNELS = ["queueArgs", "editArgs"];
const LAST_KERNELS = ["carve", "lay", "sprites", "composite"];
export const KERNELS = [...TICK_KERNELS, ...ARG_KERNELS, ...STATE_KERNELS, ...LAST_KERNELS];

export class Game {
  // onProgress({ done, total, ms }) reports each pipeline as it compiles
  static async create(device, { format = null, onProgress = null } = {}) {
    const g = new Game();
    g.device = device;
    g.sprites = buildSprites();
    const st = (type) => ({ visibility: GPUShaderStage.COMPUTE, buffer: { type } });
    g.layout0 = device.createBindGroupLayout({ entries: [
      { binding: 0, ...st("read-only-storage") },
      ...[1, 2, 3, 4, 5].map((binding) => ({ binding, ...st("storage") })),
      { binding: 6, ...st("uniform") },
    ] });
    g.layout1 = device.createBindGroupLayout({ entries: [{ binding: 0, ...st("storage") }] });
    const code = makeWGSL();
    const mod = device.createShaderModule({ code });
    const info = await mod.getCompilationInfo();
    const errs = info.messages.filter((m) => m.type === "error");
    if (errs.length) {
      const lines = code.split("\n");
      throw new Error("WGSL: " + errs.map((m) => `${m.lineNum}:${m.linePos} ${m.message}\n  ${lines[m.lineNum - 1]?.trim()}`).join("\n"));
    }
    const pl0 = device.createPipelineLayout({ bindGroupLayouts: [g.layout0] });
    const pl1 = device.createPipelineLayout({ bindGroupLayouts: [g.layout0, g.layout1] });
    const t0 = performance.now();
    let done = 0;
    g.compileMs = {};
    const pipes = await Promise.all(KERNELS.map((entryPoint) =>
      device.createComputePipelineAsync({ layout: ARG_KERNELS.includes(entryPoint) ? pl1 : pl0, compute: { module: mod, entryPoint } })
        .catch((err) => { throw new Error(`pipeline ${entryPoint}: ${err.message}`); })
        .then((p) => {
          g.compileMs[entryPoint] = performance.now() - t0;
          onProgress?.({ done: ++done, total: KERNELS.length, ms: performance.now() - t0 });
          return p;
        })));
    g.pipe = Object.fromEntries(KERNELS.map((n, i) => [n, pipes[i]]));
    g.compileTotalMs = performance.now() - t0;

    g.inpBuf = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    g.argsBuf = device.createBuffer({ size: ARGS_WORDS * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.INDIRECT });
    g.fbBuf = device.createBuffer({ size: 2 * MAXVIEW * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    g.dimsBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    g.argsGroup = device.createBindGroup({ layout: g.layout1, entries: [{ binding: 0, resource: { buffer: g.argsBuf } }] });
    if (format) {
      const pm = device.createShaderModule({ code: PRESENT_WGSL });
      g.presentPipe = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: pm, entryPoint: "vs" },
        fragment: { module: pm, entryPoint: "fs", targets: [{ format }] },
        primitive: { topology: "triangle-list" },
      });
      g.presentGroup = device.createBindGroup({ layout: g.presentPipe.getBindGroupLayout(0), entries: [
        { binding: 0, resource: { buffer: g.fbBuf } }, { binding: 1, resource: { buffer: g.dimsBuf } },
      ] });
    }
    g.input = { curX: -9999, curY: -9999, click: 0, skill: 99, rr: 50, nuke: 0 };
    g.time = 0;
    g.world = null;
    return g;
  }

  buffer(words, usage) {
    const b = this.device.createBuffer({ size: Math.max(16, Math.ceil(words.byteLength / 16) * 16), usage: usage | GPUBufferUsage.COPY_DST });
    this.device.queue.writeBuffer(b, 0, words.buffer, words.byteOffset, words.byteLength);
    return b;
  }

  loadLevel(level) {
    const d = this.device;
    for (const b of [this.romBuf, this.terBuf, this.lemBuf, this.wdBuf, this.auxBuf]) b?.destroy();
    if (level.count > MAXL) throw new Error(`a level holds at most ${MAXL} lemmings`);
    this.level = level;
    this.W = level.w; this.H = level.h;
    const rom = new Uint32Array(ROM.SPR + this.sprites.words.length);
    const hatches = level.hatches, exits = level.exits, water = level.water || [];
    rom[ROM.W] = level.w; rom[ROM.H] = level.h; rom[ROM.COUNT] = level.count;
    rom[ROM.NHATCH] = hatches.length; rom[ROM.NEXIT] = exits.length; rom[ROM.NWATER] = water.length;
    rom[ROM.RRMIN] = level.rr; rom[ROM.BURST] = level.burst || 1; rom[ROM.DIGITS] = this.sprites.digitBase;
    hatches.forEach(([x, y], i) => { rom[ROM.HATCH + 2 * i] = x; rom[ROM.HATCH + 2 * i + 1] = y; });
    exits.forEach(([x, y], i) => { rom[ROM.EXIT + 2 * i] = x; rom[ROM.EXIT + 2 * i + 1] = y; });
    water.forEach(([x0, x1, y], i) => { rom.set([x0, x1, y], ROM.WATER + 3 * i); });
    const terrain = buildTerrain(level);
    rom.set(themeWords(level), ROM.THEME);
    rom.set(terrain.palette, ROM.PAL);
    rom.set(this.sprites.meta, ROM.SMETA);
    rom.set(this.sprites.words, ROM.SPR);
    this.romBuf = this.buffer(rom, GPUBufferUsage.STORAGE);
    this.terBuf = this.buffer(terrain.words, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
    this.lemBuf = d.createBuffer({ size: MAXL * 32, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const wd = new Uint32Array(WD.WORDS);
    SKILLS.forEach((s, i) => { wd[WD.SKILL + i] = level.skills[s] || 0; });
    wd[WD.RR] = level.rr;
    wd[WD.TIME] = level.minutes ? Math.round(level.minutes * 60 * 17) : 0xffffffff;
    wd[WD.HOVKEY] = 0xffffffff;
    wd[WD.CLICK] = this.input.click;
    this.wdBuf = this.buffer(wd, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
    this.auxBuf = d.createBuffer({ size: (AUX_FIELD + level.w * level.h) * 4, usage: GPUBufferUsage.STORAGE });
    this.group = d.createBindGroup({ layout: this.layout0, entries: [
      this.romBuf, this.terBuf, this.lemBuf, this.wdBuf, this.auxBuf, this.fbBuf, this.inpBuf,
    ].map((buffer, binding) => ({ binding, resource: { buffer } })) });
    this.input.rr = level.rr; this.input.nuke = 0; this.input.skill = 99;
    this.world = null;
    this.ticks = 0;
    this.lemGroups = Math.ceil(level.count / 64);
    this.setView(0, Math.min(level.w, 320));
  }

  // vw level pixels across; the view always shows the level's full height plus the minimap
  setView(camX, vw) {
    this.vw = Math.max(16, Math.min(Math.floor(vw), this.W, Math.floor(MAXVIEW / (this.H + MINIMAP_H))));
    this.camX = Math.max(0, Math.min(Math.round(camX), this.W - this.vw));
  }

  get rows() { return this.H + MINIMAP_H; }

  writeInput() {
    const i = this.input, a = new Int32Array(12), u = new Uint32Array(a.buffer);
    a[0] = i.curX; a[1] = i.curY; u[2] = i.click; u[3] = i.skill; u[4] = i.rr; u[5] = i.nuke;
    a[6] = this.camX; u[7] = this.vw; u[8] = this.H; u[9] = MINIMAP_H; u[10] = this.time; u[11] = 0;
    this.device.queue.writeBuffer(this.inpBuf, 0, a);
    this.device.queue.writeBuffer(this.dimsBuf, 0, new Uint32Array([this.vw, this.rows, MAXVIEW, 0]));
  }

  // a paused game still answers the cursor and takes skills, as the original did
  encodeHover(enc) {
    const p = enc.beginComputePass();
    p.setBindGroup(0, this.group);
    p.setPipeline(this.pipe.pick); p.dispatchWorkgroups(this.lemGroups);
    p.setPipeline(this.pipe.assign); p.dispatchWorkgroups(1);
    p.end();
  }

  encodeTick(enc) {
    let p = enc.beginComputePass();
    p.setBindGroup(0, this.group);
    p.setPipeline(this.pipe.begin); p.dispatchWorkgroups(1);
    p.setPipeline(this.pipe.pick); p.dispatchWorkgroups(this.lemGroups);
    p.setPipeline(this.pipe.assign); p.dispatchWorkgroups(1);
    p.setPipeline(this.pipe.fieldStamp); p.dispatchWorkgroups(this.lemGroups);
    p.setPipeline(this.pipe.classify); p.dispatchWorkgroups(this.lemGroups);
    p.end();
    // the indirect-args buffer is written in passes of its own, never while it drives a dispatch
    p = enc.beginComputePass();
    p.setBindGroup(0, this.group); p.setBindGroup(1, this.argsGroup);
    p.setPipeline(this.pipe.queueArgs); p.dispatchWorkgroups(1);
    p.end();
    p = enc.beginComputePass();
    p.setBindGroup(0, this.group);
    STATE_KERNELS.forEach((k, i) => { p.setPipeline(this.pipe[k]); p.dispatchWorkgroupsIndirect(this.argsBuf, (i + 1) * 12); });
    p.end();
    p = enc.beginComputePass();
    p.setBindGroup(0, this.group); p.setBindGroup(1, this.argsGroup);
    p.setPipeline(this.pipe.editArgs); p.dispatchWorkgroups(1);
    p.end();
    p = enc.beginComputePass();
    p.setBindGroup(0, this.group);
    p.setPipeline(this.pipe.carve); p.dispatchWorkgroupsIndirect(this.argsBuf, NS * 12);
    p.setPipeline(this.pipe.lay); p.dispatchWorkgroupsIndirect(this.argsBuf, (NS + 1) * 12);
    p.end();
    this.ticks++;
  }

  encodeRender(enc, view = null) {
    const p = enc.beginComputePass();
    p.setBindGroup(0, this.group);
    p.setPipeline(this.pipe.sprites); p.dispatchWorkgroups(this.lemGroups);
    p.setPipeline(this.pipe.composite); p.dispatchWorkgroups(Math.ceil(this.vw / 8), Math.ceil(this.rows / 8));
    p.end();
    if (view && this.presentPipe) {
      const r = enc.beginRenderPass({ colorAttachments: [{ view, loadOp: "clear", storeOp: "store", clearValue: [0, 0, 0, 1] }] });
      r.setPipeline(this.presentPipe); r.setBindGroup(0, this.presentGroup); r.draw(3); r.end();
    }
  }

  // run n ticks (0 when paused), draw, present to view and start a world readback if none is pending
  frame(n, view = null) {
    this.time++;
    this.writeInput();
    const enc = this.device.createCommandEncoder();
    if (n === 0) this.encodeHover(enc);
    for (let k = 0; k < n; k++) this.encodeTick(enc);
    this.encodeRender(enc, view);
    let staging = null;
    if (!this.reading) {
      staging = this.staging ||= this.device.createBuffer({ size: WD.WORDS * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
      enc.copyBufferToBuffer(this.wdBuf, 0, staging, 0, WD.WORDS * 4);
    }
    this.device.queue.submit([enc.finish()]);
    if (staging) {
      this.reading = true;
      const lvl = this.level;
      staging.mapAsync(GPUMapMode.READ).then(() => {
        const w = new Uint32Array(staging.getMappedRange().slice(0));
        staging.unmap();
        if (lvl === this.level) this.world = this.parseWorld(w);
      }).catch(() => {}).finally(() => { this.reading = false; });
    }
  }

  parseWorld(w) {
    const skills = SKILLS.map((_, i) => w[WD.SKILL + i]);
    return {
      tick: w[WD.TICK], released: w[WD.REL], saved: w[WD.SAVED], dead: w[WD.DEAD],
      out: w[WD.REL] - w[WD.SAVED] - w[WD.DEAD], rr: w[WD.RR], time: w[WD.TIME], done: w[WD.DONE] !== 0,
      nuked: w[WD.NUKED] !== 0, hovered: w[WD.HOV], hovState: w[WD.HOVSTATE], hovFlags: w[WD.HOVFLAGS],
      skills, snd: Array.from(w.subarray(WD.SND, WD.SND + 8)),
    };
  }

  async read(buf, bytes) {
    const s = this.device.createBuffer({ size: bytes, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = this.device.createCommandEncoder();
    enc.copyBufferToBuffer(buf, 0, s, 0, bytes);
    this.device.queue.submit([enc.finish()]);
    await s.mapAsync(GPUMapMode.READ);
    const out = s.getMappedRange().slice(0);
    s.destroy();
    return out;
  }

  async readWorld() { return this.parseWorld(new Uint32Array(await this.read(this.wdBuf, WD.WORDS * 4))); }
  async readTerrain() { return new Uint32Array(await this.read(this.terBuf, this.W * this.H * 4)); }
  async readLemmings(n) {
    const a = new Int32Array(await this.read(this.lemBuf, Math.max(1, n) * 32)), out = [];
    for (let i = 0; i < n; i++) {
      const o = i * 8;
      out.push({ i, x: a[o], y: a[o + 1], dir: a[o + 2], state: a[o + 3], frame: a[o + 4], fall: a[o + 5], flags: a[o + 6], timer: a[o + 7] });
    }
    return out;
  }
  // the last composited frame as RGBA bytes, vw x rows
  async readPixels() {
    const n = this.vw * this.rows;
    const s = this.device.createBuffer({ size: n * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = this.device.createCommandEncoder();
    enc.copyBufferToBuffer(this.fbBuf, MAXVIEW * 4, s, 0, n * 4);
    this.device.queue.submit([enc.finish()]);
    await s.mapAsync(GPUMapMode.READ);
    const out = new Uint8Array(s.getMappedRange().slice(0));
    s.destroy();
    return out;
  }
}
