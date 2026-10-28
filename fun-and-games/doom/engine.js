// GPU plumbing: buffers, pipelines, level setup and the per-frame encode.
// The game state lives in GPU buffers; JS writes input, encodes tics and a
// render, and reads back one small World block for sound and level exits.

import { readWad, buildGfx, buildMap, spawnMobjs, tableRandom, decodePatch } from "./wad.js?v=20261028055125";
import { makeWGSL, PRESENT_WGSL, MOBJ_WORDS, SECTOR_WORDS, WORLD_WORDS, MAXVIS } from "./shaders.js?v=20261028055125";
import { STATES, SFX, MF } from "./info.js?v=20261028055125";
import { MSG } from "./specials.js?v=20261028055125";

export const W = { // World word offsets (see struct World)
  viewx: 0, viewy: 1, viewz: 2, viewangle: 3, viewheight: 4, deltaviewheight: 5, bob: 6, extralight: 7,
  leveltime: 8, rng: 9, lastframe: 10, palette: 11, health: 12, armor: 13, armortype: 14, cards: 15,
  weapons: 16, readyweapon: 17, pendingweapon: 18, backpack: 19, ammo: 20, maxammo: 24,
  damagecount: 28, bonuscount: 29, attackdown: 30, usedown: 31, powers: 32, dead: 38, exit: 39,
  killcount: 40, itemcount: 41, secretcount: 42, message: 43, messagetics: 44, viscount: 45, sndcount: 46,
  nummobjs: 47, totalkills: 48, totalitems: 49, totalsecrets: 50, onground: 51, fixedcolormap: 52, skill: 53,
  snd: 64, buttons: 192, pspstate: 256, psptics: 258, pspsx: 260, pspsy: 261, refire: 262, attacker: 263,
  face: 264, facecount: 265, facepri: 266, oldhealth: 267, lastattackdown: 268, oldweapons: 269,
  pvx: 270, pvy: 271, pvz: 272, pva: 273, rx: 274, ry: 275, rz: 276, ra: 277, cheats: 310, mrng: 311, initmobjs: 312, playerslot: 313, spawncursor: 314, mobjtop: 315,
};

// P_SetThingPosition for every thing in spawn order: each blockmap cell lists its things newest
// first, as index + 1 in the cell's head and in each thing's bnext word (0 ends a list).
function linkBlocks(map, mu, ls) {
  const heads = map.lines.length + 3 * map.sides.length, mf = new Float32Array(mu.buffer);
  ls.fill(0, heads);
  for (let k = 0; k < mu.length / MOBJ_WORDS; k++) {
    const o = k * MOBJ_WORDS;
    mu[o + 23] = 0;
    if (!mu[o + 24] || (mu[o + 14] & MF.NOBLOCKMAP)) continue;
    const bx = Math.floor((mf[o] - map.bmap.x) / 128), by = Math.floor((mf[o + 1] - map.bmap.y) / 128);
    if (bx < 0 || by < 0 || bx >= map.bmap.w || by >= map.bmap.h) continue;
    const c = heads + by * map.bmap.w + bx;
    mu[o + 23] = ls[c]; ls[c] = k + 1;
  }
}

export function freshPlayer() {
  return { health: 100, armor: 0, armortype: 0, weapons: 0b11, readyweapon: 1, ammo: [50, 0, 0, 0], maxammo: [200, 50, 300, 50], backpack: 0 };
}

export { decodePatch };

export async function unpackWad(bytes) {
  const u8 = new Uint8Array(bytes);
  if (u8[0] === 0x1f && u8[1] === 0x8b) {
    const ds = new Blob([u8]).stream().pipeThrough(new DecompressionStream("gzip"));
    return await new Response(ds).arrayBuffer();
  }
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
}

export class Engine {
  // maxWidth and maxHeight size the framebuffer once; resize() moves within them without recompiling
  static async create(device, wadBuffer, { width = 640, height = 400, format = null, skill = 3, maxWidth = 2400, maxHeight = 800 } = {}) {
    const e = new Engine();
    e.device = device; e.width = width; e.height = height; e.skill = skill;
    e.viewh = Math.round(height * 168 / 200);
    e.wad = readWad(wadBuffer);
    e.gfx = buildGfx(e.wad);
    e.format = format;
    e.gfxBuf = e.buffer(e.gfx.words, GPUBufferUsage.STORAGE);
    const fbW = Math.max(maxWidth, width), fbH = Math.max(maxHeight, height);
    e.fbBuf = device.createBuffer({ size: (2 * fbW * fbH + 8 * MAXVIS) * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    e.fbMax = fbW * fbH;
    e.frameBuf = device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    e.infoBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    e.resize(width, height);
    e.layout = device.createBindGroupLayout({ entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } },
      ...[2, 3, 4, 5, 6].map((b) => ({ binding: b, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } })),
      { binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } },
    ] });
    if (format) {
      const mod = device.createShaderModule({ code: PRESENT_WGSL });
      e.presentLayout = device.createBindGroupLayout({ entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "read-only-storage" } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "read-only-storage" } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "read-only-storage" } },
        { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
      ] });
      e.presentPipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [e.presentLayout] }),
        vertex: { module: mod, entryPoint: "vs" },
        fragment: { module: mod, entryPoint: "fs", targets: [{ format }] },
        primitive: { topology: "triangle-list" },
      });
    }
    e.sounds = new Map();
    return e;
  }

  resize(width, height) {
    if (width * height > this.fbMax) throw new Error(`${width}x${height} is larger than the framebuffer`);
    this.width = width; this.height = height;
    this.viewh = Math.round(height * 168 / 200);
    this.device.queue.writeBuffer(this.infoBuf, 0, new Uint32Array([width, height, this.gfx.layout.PAL, 0]));
  }

  buffer(data, usage) {
    const b = this.device.createBuffer({ size: Math.max(16, Math.ceil(data.byteLength / 16) * 16), usage: usage | GPUBufferUsage.COPY_DST });
    this.device.queue.writeBuffer(b, 0, data.buffer, data.byteOffset, data.byteLength);
    return b;
  }

  maps() { return this.wad.maps(); }

  async loadMap(name, player = freshPlayer()) {
    const d = this.device;
    const map = buildMap(this.wad, this.gfx, name, this.skill);
    this.map = map;
    this.mapName = name;
    this.maxMobjs = map.things.length + 1 + 768;

    const code = makeWGSL({ gfx: this.gfx, map, maxMobjs: this.maxMobjs });
    // restarting a level produces the same WGSL: reuse its pipelines instead of compiling again
    this.pipeCache ||= new Map();
    const cached = this.pipeCache.get(code);
    if (cached) Object.assign(this, cached);
    else await this.compile(code);
    this.pipeCache.set(code, { renderPipe: this.renderPipe, projectPipe: this.projectPipe, hudPipe: this.hudPipe, ticPipes: this.ticPipes, amClearPipe: this.amClearPipe, amLinesPipe: this.amLinesPipe, viewSetupPipe: this.viewSetupPipe });
    if (this.pipeCache.size > 3) this.pipeCache.delete(this.pipeCache.keys().next().value);
    this.initLevel(map, player);
    return map;
  }

  async compile(code) {
    const d = this.device;
    const mod = d.createShaderModule({ code });
    const info = await mod.getCompilationInfo();
    const errs = info.messages.filter((m) => m.type === "error");
    if (errs.length) {
      const lines = code.split("\n");
      throw new Error("WGSL: " + errs.map((m) => `${m.lineNum}:${m.linePos} ${m.message}\n  ${lines[m.lineNum - 1]?.trim()}`).join("\n"));
    }
    const pl = d.createPipelineLayout({ bindGroupLayouts: [this.layout] });
    // one at a time: a failed pipeline names its kernel
    const mk = async (entryPoint) => {
      try { return await d.createComputePipelineAsync({ layout: pl, compute: { module: mod, entryPoint } }); }
      catch (err) { throw new Error(`pipeline ${entryPoint}: ${err.message}`); }
    };
    this.renderPipe = await mk("render");
    this.projectPipe = await mk("project");
    this.hudPipe = await mk("hud");
    this.amClearPipe = await mk("amClear");
    this.amLinesPipe = await mk("amLines");
    this.viewSetupPipe = await mk("viewSetup");
    this.ticPipes = [];
    for (const k of ["ticSave", "ticPlayer", "ticMobjs", "ticActivate", "ticWorld"]) this.ticPipes.push(await mk(k));
  }

  initLevel(map, player) {
    const d = this.device;

    // sectors with P_SpawnSpecials applied
    const ns = map.sectors.length;
    const sec = new ArrayBuffer(ns * SECTOR_WORDS * 4);
    const su = new Uint32Array(sec), si = new Int32Array(sec), sf = new Float32Array(sec);
    // P_LoadThings, then P_SpawnSpecials, draw from DOOM's random table in that order
    const mobjs = spawnMobjs(map, MOBJ_WORDS, this.maxMobjs, { nomonsters: this.nomonsters, rng: player.rng ?? 0 });
    let rng = mobjs.rng;
    const rnd = () => { const [v, r] = tableRandom(rng); rng = r; return v; };
    const neighbours = map.sectors.map(() => new Set());
    for (const l of map.lines) if (l.fsec >= 0 && l.bsec >= 0 && (l.flags & 4)) { neighbours[l.fsec].add(l.bsec); neighbours[l.bsec].add(l.fsec); }
    const minLight = (i, max) => { let m = max; for (const n of neighbours[i]) m = Math.min(m, map.sectors[n].light); return m; };
    const lowestCeil = (i) => { let m = 32767; for (const n of neighbours[i]) m = Math.min(m, map.sectors[n].ceil); return m; };
    let totalSecrets = 0;
    map.sectors.forEach((s, i) => {
      const o = i * SECTOR_WORDS;
      sf[o] = s.floor; sf[o + 1] = s.ceil; su[o + 2] = s.floorpic; su[o + 3] = s.ceilpic;
      sf[o + 29] = s.floor; sf[o + 30] = s.ceil; // previous-tic heights
      si[o + 4] = s.light; si[o + 5] = s.special; si[o + 6] = s.tag; si[o + 27] = -1; // no sound target
      const light = (type, extra = {}) => { su[o + 20] = type; for (const [k, v] of Object.entries(extra)) si[o + Number(k)] = v; };
      switch (s.special) {
        case 1: light(1, { 23: s.light, 22: minLight(i, s.light), 21: (rnd() & 64) + 1 }); si[o + 5] = 0; break; // & maxtime, as vanilla
        case 2: case 4: case 3: case 12: case 13: {
          const dark = s.special === 3 || s.special === 12 ? 35 : 15;
          let mn = minLight(i, s.light); if (mn === s.light) mn = 0;
          light(2, { 23: s.light, 22: mn, 24: dark, 25: 5, 21: s.special === 12 || s.special === 13 ? 1 : (rnd() & 7) + 1 });
          si[o + 5] = s.special === 4 ? 4 : 0;
          break;
        }
        case 8: light(4, { 23: s.light, 22: minLight(i, s.light), 26: -1 }); si[o + 5] = 0; break;
        case 17: light(3, { 23: s.light, 22: minLight(i, s.light) + 16, 21: 4 }); si[o + 5] = 0; break;
        case 9: totalSecrets++; break;
        case 10: su[o + 7] = 1; si[o + 8] = 0; si[o + 9] = 0; sf[o + 10] = 2; si[o + 13] = 150; si[o + 14] = 30 * 35; si[o + 5] = 0; break;
        case 14: su[o + 7] = 1; si[o + 8] = 4; si[o + 9] = 2; sf[o + 10] = 2; sf[o + 11] = lowestCeil(i) - 4; si[o + 13] = 150; si[o + 14] = 5 * 60 * 35; si[o + 5] = 0; break;
      }
    });

    // line specials and side textures
    // line specials, side textures, then one head per blockmap cell for the things in it
    const ls = new Uint32Array(map.lines.length + 3 * map.sides.length + map.bmap.w * map.bmap.h);
    map.lines.forEach((l, i) => { ls[i] = l.special; });
    map.sides.forEach((s, i) => { const o = map.lines.length + 3 * i; ls[o] = s.top; ls[o + 1] = s.bottom; ls[o + 2] = s.mid; });
    linkBlocks(map, new Uint32Array(mobjs.buf), ls);

    const mi = new Int32Array(mobjs.buf);
    let kills = 0, items = 0;
    const mu = new Uint32Array(mobjs.buf);
    for (let k = 1; k < mobjs.count; k++) { const f = mu[k * MOBJ_WORDS + 14]; if (f & 0x400000) kills++; if (f & 0x800000) items++; }

    const world = new ArrayBuffer(WORLD_WORDS * 4);
    const wu = new Uint32Array(world), wi = new Int32Array(world), wf = new Float32Array(world);
    const pf = new Float32Array(mobjs.buf);
    wf[W.viewx] = pf[0]; wf[W.viewy] = pf[1]; wf[W.viewangle] = pf[3]; wf[W.viewheight] = 41; wf[W.viewz] = pf[2] + 41;
    for (const [a, b] of [["pvx", "viewx"], ["pvy", "viewy"], ["pvz", "viewz"], ["pva", "viewangle"], ["rx", "viewx"], ["ry", "viewy"], ["rz", "viewz"], ["ra", "viewangle"]]) wf[W[a]] = wf[W[b]];
    wu[W.rng] = rng;
    // the thinker order: map things, the player's place among them, then later spawns
    this.order = { initmobjs: mobjs.count, playerslot: mobjs.playerSlot };
    wu[W.initmobjs] = mobjs.count; wu[W.playerslot] = mobjs.playerSlot; wu[W.spawncursor] = mobjs.count; wu[W.mobjtop] = mobjs.count;
    wu[W.lastframe] = 0xffffffff;
    wi[W.health] = player.health; wi[W.armor] = player.armor; wi[W.armortype] = player.armortype;
    wu[W.weapons] = player.weapons; wi[W.readyweapon] = player.readyweapon; wi[W.pendingweapon] = -1; wu[W.backpack] = player.backpack;
    for (let k = 0; k < 4; k++) { wi[W.ammo + k] = player.ammo[k]; wi[W.maxammo + k] = player.maxammo[k]; }
    wi[W.totalkills] = kills; wi[W.totalitems] = items; wi[W.totalsecrets] = totalSecrets;
    wi[W.fixedcolormap] = -1; wi[W.skill] = this.skill - 1; wi[W.attacker] = -1; wu[W.cheats] = this.cheats || 0;
    wi[W.oldhealth] = player.health; wi[W.lastattackdown] = -1; wu[W.oldweapons] = player.weapons;
    mi[15] = player.health; // player mobj health

    for (const b of [this.mapBuf, this.secBuf, this.mobjBuf, this.lsBuf, this.worldBuf]) b?.destroy();
    this.mapBuf = this.buffer(map.words, GPUBufferUsage.STORAGE);
    this.secBuf = this.buffer(new Uint32Array(sec), GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
    this.mobjBuf = this.buffer(new Uint32Array(mobjs.buf), GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
    this.lsBuf = this.buffer(ls, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
    this.worldBuf = this.buffer(new Uint32Array(world), GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
    this.bind = d.createBindGroup({ layout: this.layout, entries: [
      this.gfxBuf, this.mapBuf, this.secBuf, this.mobjBuf, this.lsBuf, this.worldBuf, this.fbBuf, this.frameBuf,
    ].map((buffer, binding) => ({ binding, resource: { buffer } })) });
    if (this.presentLayout) {
      this.presentBind = d.createBindGroup({ layout: this.presentLayout, entries: [
        { binding: 0, resource: { buffer: this.gfxBuf } }, { binding: 1, resource: { buffer: this.fbBuf } },
        { binding: 2, resource: { buffer: this.worldBuf } }, { binding: 3, resource: { buffer: this.infoBuf } },
      ] });
    }
    this.frameNo = 0;
    this.sndSeen = 0;
    this.readbacks = [0, 1].map(() => ({ buf: d.createBuffer({ size: WORLD_WORDS * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }), busy: false }));
    this.lastWorld = null;
  }

  // input: {forward, side, turn (radians per tic), mouseturn (radians), use, fire, weapon}
  encodeFrame(encoder, tics, input = {}) {
    const fu = new Uint32Array(20), ff = new Float32Array(fu.buffer);
    fu[0] = this.width; fu[1] = this.height; fu[2] = this.viewh; fu[3] = ++this.frameNo;
    // looking up and down shears the view: the horizon row moves, as in later source ports
    // projection follows height (Doom's 160 at 200 rows), so a wider screen sees more to the sides
    const proj = this.height * 0.8;
    const shear = Math.max(-0.45, Math.min(0.45, Math.tan(input.pitch || 0) * proj / this.viewh)) * this.viewh;
    ff[4] = this.width / 2; ff[5] = this.viewh / 2 + shear; ff[6] = proj;
    ff[8] = input.forward || 0; ff[9] = input.side || 0; ff[10] = input.turn || 0; ff[11] = input.mouseturn || 0;
    fu[12] = (input.fire ? 1 : 0) | (input.use ? 2 : 0); fu[13] = input.weapon || 0;
    // automap: Doom's 0.2 pixels per unit at 320 columns, times the zoom
    ff[7] = 0.2 * (this.height * 1.6 / 320) * (input.amzoom || 1); fu[15] = input.automap ? 1 : 0;
    // how far this frame is between the last tic and the next (1 draws the last tic as it is)
    ff[16] = Math.max(0, Math.min(1, input.frac ?? 1)); ff[17] = input.lookturn || 0;
    this.device.queue.writeBuffer(this.frameBuf, 0, fu);
    this.device.queue.writeBuffer(this.worldBuf, W.viscount * 4, new Uint32Array([0]));
    const pass = encoder.beginComputePass();
    pass.setBindGroup(0, this.bind);
    // ticSave runs one thread per thing (or sector); the rest are single-threaded
    const saveGroups = Math.ceil(Math.max(this.maxMobjs, this.map.sectors.length) / 64);
    for (let i = 0; i < tics; i++) this.ticPipes.forEach((p, k) => { pass.setPipeline(p); pass.dispatchWorkgroups(k === 0 ? saveGroups : 1); });
    pass.setPipeline(this.viewSetupPipe);
    pass.dispatchWorkgroups(1);
    if (input.automap) {
      pass.setPipeline(this.amClearPipe);
      pass.dispatchWorkgroups(Math.ceil(this.width / 8), Math.ceil(this.viewh / 8));
      pass.setPipeline(this.amLinesPipe);
      pass.dispatchWorkgroups(Math.ceil((this.map.lines.length + 7) / 64));
    } else {
      pass.setPipeline(this.projectPipe);
      pass.dispatchWorkgroups(Math.ceil(this.maxMobjs / 64));
      pass.setPipeline(this.renderPipe);
      pass.dispatchWorkgroups(Math.ceil(this.width / 64));
    }
    pass.setPipeline(this.hudPipe);
    pass.dispatchWorkgroups(Math.ceil(this.width / 8), Math.ceil(this.height / 8));
    pass.end();
  }

  present(encoder, view) {
    const rp = encoder.beginRenderPass({ colorAttachments: [{ view, loadOp: "clear", storeOp: "store", clearValue: [0, 0, 0, 1] }] });
    rp.setPipeline(this.presentPipeline);
    rp.setBindGroup(0, this.presentBind);
    rp.draw(3);
    rp.end();
  }

  // Copy World into a free staging buffer; resolves with an Int32Array or null if both are busy.
  readWorld(encoder) {
    const rb = this.readbacks.find((r) => !r.busy);
    if (!rb) return null;
    rb.busy = true;
    encoder.copyBufferToBuffer(this.worldBuf, 0, rb.buf, 0, WORLD_WORDS * 4);
    return rb;
  }
  async finishRead(rb) {
    await rb.buf.mapAsync(GPUMapMode.READ);
    const copy = rb.buf.getMappedRange().slice(0);
    rb.buf.unmap();
    rb.busy = false;
    this.lastWorld = copy;
    return copy;
  }

  // Save games: the level's whole GPU state (sectors, things, line specials, world), read back.
  async saveState() {
    const d = this.device, enc = d.createCommandEncoder();
    const parts = { sec: this.secBuf, mobj: this.mobjBuf, ls: this.lsBuf, world: this.worldBuf };
    const rbs = Object.entries(parts).map(([k, b]) => {
      const rb = d.createBuffer({ size: b.size, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
      enc.copyBufferToBuffer(b, 0, rb, 0, b.size);
      return [k, rb];
    });
    d.queue.submit([enc.finish()]);
    const st = { map: this.mapName, skill: this.skill, cheats: this.cheats || 0 };
    for (const [k, rb] of rbs) { await rb.mapAsync(GPUMapMode.READ); st[k] = rb.getMappedRange().slice(0); rb.unmap(); rb.destroy(); }
    return st;
  }
  // After loadMap(st.map): put a saved level's state back. False if the buffers don't fit (another WAD).
  restore(st) {
    const parts = { sec: this.secBuf, mobj: this.mobjBuf, ls: this.lsBuf, world: this.worldBuf };
    // a save from before the blockmap lists has a shorter line buffer: pad it and link the things again
    if (st.ls && st.ls.byteLength < parts.ls.size && st.mobj?.byteLength === parts.mobj.size) {
      const ls = new Uint32Array(parts.ls.size / 4); ls.set(new Uint32Array(st.ls));
      const mu = new Uint32Array(st.mobj.slice(0));
      linkBlocks(this.map, mu, ls);
      st = { ...st, ls: ls.buffer, mobj: mu.buffer };
    }
    for (const [k, b] of Object.entries(parts)) if (!st[k] || st[k].byteLength !== b.size) return false;
    for (const [k, b] of Object.entries(parts)) this.device.queue.writeBuffer(b, 0, st[k]);
    // a save from before the thinker order was kept has zeros there: use this level's
    if (!new Uint32Array(st.world)[W.initmobjs] && this.order) {
      this.device.queue.writeBuffer(this.worldBuf, W.initmobjs * 4, new Uint32Array([this.order.initmobjs, this.order.playerslot, this.order.initmobjs]));
    }
    this.cheats = st.cheats || 0;
    this.sndSeen = new Uint32Array(st.world)[W.sndcount];
    this.lastWorld = st.world;
    return true;
  }
  say(m) { this.device.queue.writeBuffer(this.worldBuf, W.message * 4, new Int32Array([MSG[m] ?? 0, 140])); }

  // DOOM's cheat codes that change the player: iddqd, idkfa, idfa, idclip/idspispopd, iddt.
  // Returns false for anything else (idclev is the page's, since it loads a level).
  cheat(code) {
    const q = this.device.queue, wb = this.worldBuf;
    const put = (field, arr) => q.writeBuffer(wb, W[field] * 4, arr);
    const say = (m) => this.say(m);
    const toggle = (bit, on, off) => { this.cheats = (this.cheats || 0) ^ bit; put("cheats", new Uint32Array([this.cheats])); say(this.cheats & bit ? on : off); return this.cheats & bit; };
    switch (code) {
      case "iddqd":
        if (toggle(2, "DEGREELESSNESS MODE ON", "DEGREELESSNESS MODE OFF")) {
          put("health", new Int32Array([100]));
          q.writeBuffer(this.mobjBuf, 15 * 4, new Int32Array([100]));
        }
        return true;
      case "idclip": case "idspispopd": toggle(1, "NO CLIPPING MODE ON", "NO CLIPPING MODE OFF"); return true;
      case "iddt": this.cheats = ((this.cheats || 0) & ~4) | (this.cheats & 4 ? 0 : 4); put("cheats", new Uint32Array([this.cheats])); return true;
      case "idkfa": case "idfa": {
        const w = this.lastWorld ? new Int32Array(this.lastWorld) : null;
        const max = w ? [0, 1, 2, 3].map((k) => w[W.maxammo + k]) : [200, 50, 300, 50];
        put("armor", new Int32Array([200, 2]));
        put("weapons", new Uint32Array([this.map.commercial ? 0x1ff : 0xff]));
        put("ammo", new Int32Array(max));
        if (code === "idkfa") put("cards", new Uint32Array([0x3f]));
        say(code === "idkfa" ? "VERY HAPPY AMMO ADDED" : "AMMO (NO KEYS) ADDED");
        return true;
      }
    }
    return false;
  }

  // Sound events since the last call: [{sfx, x, y}]
  soundEvents(worldBuf) {
    const wu = new Uint32Array(worldBuf), wf = new Float32Array(worldBuf);
    const n = wu[W.sndcount];
    const out = [];
    for (let k = Math.max(this.sndSeen, n - 32); k < n; k++) {
      const o = W.snd + 4 * (k % 32);
      out.push({ sfx: SFX[wf[o] | 0], x: wf[o + 1], y: wf[o + 2] });
    }
    this.sndSeen = n;
    return out;
  }

  playerFrom(worldBuf) {
    const wi = new Int32Array(worldBuf), wu = new Uint32Array(worldBuf);
    return {
      health: Math.max(wi[W.health], 1), armor: wi[W.armor], armortype: wi[W.armortype], weapons: wu[W.weapons],
      readyweapon: wi[W.readyweapon], backpack: wu[W.backpack], rng: wu[W.rng],
      ammo: [0, 1, 2, 3].map((k) => wi[W.ammo + k]), maxammo: [0, 1, 2, 3].map((k) => wi[W.maxammo + k]),
    };
  }

  // Headless: run tics and render one frame, return palette indices and RGBA.
  async snapshot(tics = 1, input = {}) {
    const d = this.device;
    const enc = d.createCommandEncoder();
    this.encodeFrame(enc, tics, input);
    const n = this.width * this.height;
    const rb = d.createBuffer({ size: n * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    enc.copyBufferToBuffer(this.fbBuf, 0, rb, 0, n * 4);
    const wr = d.createBuffer({ size: WORLD_WORDS * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    enc.copyBufferToBuffer(this.worldBuf, 0, wr, 0, WORLD_WORDS * 4);
    d.queue.submit([enc.finish()]);
    await Promise.all([rb.mapAsync(GPUMapMode.READ), wr.mapAsync(GPUMapMode.READ)]);
    const idx = new Uint32Array(rb.getMappedRange().slice(0));
    const world = wr.getMappedRange().slice(0);
    rb.unmap(); wr.unmap(); rb.destroy(); wr.destroy();
    const pal = new Uint32Array(world)[W.palette];
    const rgba = new Uint8ClampedArray(n * 4);
    const P = this.gfx.words, po = this.gfx.layout.PAL + pal * 256;
    for (let i = 0; i < n; i++) {
      const c = P[po + (idx[i] & 255)];
      rgba[4 * i] = c & 255; rgba[4 * i + 1] = (c >> 8) & 255; rgba[4 * i + 2] = (c >> 16) & 255; rgba[4 * i + 3] = 255;
    }
    return { indices: idx, rgba, world };
  }

  // DMX sound lump -> {rate, samples: Float32Array}
  sound(name) {
    if (this.sounds.has(name)) return this.sounds.get(name);
    let s = null;
    const lump = "DS" + name.toUpperCase();
    if (this.wad.has(lump)) {
      const d = this.wad.get(lump);
      const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
      if (d.length > 8 && dv.getUint16(0, true) === 3) {
        const rate = dv.getUint16(2, true), len = Math.min(dv.getUint32(4, true), d.length - 8);
        const pcm = new Float32Array(Math.max(len - 32, 1));
        for (let i = 0; i < pcm.length; i++) pcm[i] = (d[8 + 16 + i] - 128) / 128;
        s = { rate, samples: pcm };
      }
    }
    this.sounds.set(name, s);
    return s;
  }
}
