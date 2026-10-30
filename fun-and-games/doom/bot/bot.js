// A DOOM bot whose every route comes from TRM. Each tic it turns the game state into input for the
// engine: it picks a target (an item, a key, the exit, a switch, or somewhere it hasn't been), asks
// TRM for a coarse route across up to 3072 map units and a fine one across the 768 around it, and
// walks the fine route while shooting anything in sight.
//
// TRM returns the set of cells on shortest routes; the bot only orders that set (a BFS inside it) to
// walk it. When the set doesn't join start to goal, that's a TRM failure: the bot counts it and heads
// for the reachable cell of the set nearest the goal.

import { makeGridder, mapVerts, C, N, FINE, COARSE, KEY_THINGS, hasKey, passable } from "./grid.js?v=20261030062234";

const ANGLE = 2 * Math.PI / 4294967296;
const HEALTH = { 2011: 10, 2012: 25, 2013: 100, 2014: 1 };
const ARMOR = { 2018: 100, 2019: 200, 2015: 1 };
const WEAPON = { 2001: 2, 2002: 3, 2003: 4, 2004: 5, 2006: 6, 2005: 7 }; // doomednum -> weapon slot
const AMMO = { 2007: 0, 2048: 0, 2008: 1, 2049: 1, 2047: 2, 17: 2, 2010: 3, 2046: 3, 8: -1 };
const EXITS = new Set([11, 52]);
const IGNORE_SWITCHES = new Set([11, 51, 42, 50, 41, 43, 44, 49, 113, 116]); // exits, closers, crushers

export class Bot {
  // ctx: {wad, map, MOBJINFO, MF, LINE_SPECIALS, TR, W}
  constructor(ctx, planner, { log = () => {} } = {}) {
    Object.assign(this, ctx);
    this.planner = planner; this.log = log;
    this.verts = mapVerts(this.wad, this.map.name);
    this.gr = makeGridder(this.map, this.verts);
    const b = this.map.bmap;
    this.bx = b.x; this.by = b.y; this.bw = b.w; this.bh = b.h;
    this.visited = new Uint8Array(b.w * b.h);
    // blockmap cells with somewhere to stand, the places worth exploring
    this.standCells = [];
    const st0 = { floor: Float32Array.from(this.map.sectors, (s) => s.floor), ceil: Float32Array.from(this.map.sectors, (s) => s.ceil) };
    for (let j = 0; j < b.h; j++) for (let i = 0; i < b.w; i++) {
      for (const [fx, fy] of [[0.5, 0.5], [0.25, 0.25], [0.75, 0.75], [0.25, 0.75], [0.75, 0.25]]) {
        const x = b.x + (i + fx) * 128, y = b.y + (j + fy) * 128, s = this.map.spawnSector(x, y);
        if (this.gr.inSector(s, x, y) && this.map.sectors[s].ceil - this.map.sectors[s].floor >= 56) { this.standCells.push({ i, j, x, y }); break; }
      }
    }
    const L = this.map.lines;
    this.lineMid = L.map((l) => { const a = this.verts[l.v1], c = this.verts[l.v2]; return [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]; });
    this.blacklist = new Map(); // target key -> tic it may be tried again
    this.blocked = []; // world points of coarse waypoints found unreachable
    this.tic = 0; this.target = null; this.fine = null; this.coarse = null;
    this.stats = { finePlans: 0, coarsePlans: 0, fineBroken: 0, coarseBroken: 0, coarseEmpty: 0, planMs: 0, stuck: 0, targets: {} };
    this.lastPos = null; this.lastProgressTic = 0; this.unstick = 0; this.useToggle = false;
    this.events = [];
  }

  // ------------------------------------------------------------ game state
  // st: {world: ArrayBuffer, mobj: ArrayBuffer, sec: ArrayBuffer, ls: ArrayBuffer} as read from the GPU
  readState(st) {
    const W = this.W;
    const wf = new Float32Array(st.world), wi = new Int32Array(st.world), wu = new Uint32Array(st.world);
    const p = {
      x: wf[W.viewx], y: wf[W.viewy], angle: wf[W.viewangle], health: wi[W.health], armor: wi[W.armor],
      cards: wu[W.cards], weapons: wu[W.weapons], ready: wi[W.readyweapon], dead: wu[W.dead], exit: wu[W.exit],
      ammo: [0, 1, 2, 3].map((k) => wi[W.ammo + k]), maxammo: [0, 1, 2, 3].map((k) => wi[W.maxammo + k]),
      kills: wi[W.killcount], items: wi[W.itemcount], attacker: wi[W.attacker], damage: wi[W.damagecount], leveltime: wu[W.leveltime],
    };
    const sf = new Float32Array(st.sec), ns = this.map.sectors.length;
    const floor = new Float32Array(ns), ceil = new Float32Array(ns);
    for (let s = 0; s < ns; s++) { floor[s] = sf[s * 32]; ceil[s] = sf[s * 32 + 1]; }
    const mi = new Int32Array(st.mobj), mu = new Uint32Array(st.mobj), mf = new Float32Array(st.mobj);
    const monsters = [], items = [], solids = [];
    for (let k = 1; k < mu.length / 32; k++) {
      const o = k * 32;
      if (!mu[o + 24]) continue;
      const info = this.MOBJINFO[mu[o + 11]], flags = mu[o + 14];
      const t = { k, x: mi[o] / 65536, y: mi[o + 1] / 65536, z: mf[o + 2], ed: info[0], r: mf[o + 9], flags, health: mi[o + 15] };
      if (flags & this.MF.COUNTKILL || info[0] === 3006) { if (t.health > 0 && !(flags & this.MF.CORPSE) && flags & this.MF.SHOOTABLE) monsters.push(t); }
      else if (flags & this.MF.SPECIAL) items.push(t);
      else if (flags & this.MF.SOLID) solids.push([t.x, t.y, t.r]);
    }
    const ls = new Uint32Array(st.ls);
    const specials = this.map.lines.map((_, i) => ls[i] & 0xffff);
    this.s = { p, floor, ceil, monsters, items, solids, specials };
    return this.s;
  }

  gridState() {
    const s = this.s;
    return { floor: s.floor, ceil: s.ceil, cards: s.p.cards, solids: s.solids };
  }

  // ------------------------------------------------------------ targets
  candidates() {
    const s = this.s, p = s.p, out = [];
    const d = (x, y) => Math.hypot(x - p.x, y - p.y);
    for (const it of s.items) {
      let want = 0;
      if (KEY_THINGS[it.ed] && !hasKey(p.cards, KEY_THINGS[it.ed])) want = 90;
      else if (HEALTH[it.ed] && p.health < (it.ed === 2014 ? 100 : 100 - HEALTH[it.ed] / 2)) want = p.health < 40 ? 95 : 30;
      else if (ARMOR[it.ed] && p.armor < 100) want = 25;
      else if (WEAPON[it.ed] !== undefined && !(p.weapons & (1 << WEAPON[it.ed]))) want = 60;
      else if (AMMO[it.ed] !== undefined && (AMMO[it.ed] < 0 || p.ammo[AMMO[it.ed]] < p.maxammo[AMMO[it.ed]] / 2)) want = 20;
      if (!want) continue;
      const dist = d(it.x, it.y);
      if (want < 90 && dist > (want >= 60 ? 1200 : 600)) continue;
      out.push({ key: "t" + it.k, kind: KEY_THINGS[it.ed] ? "key" : "item", x: it.x, y: it.y, prio: want - dist / 100, thing: it.k });
    }
    s.specials.forEach((sp, i) => {
      if (!sp) return;
      const def = this.LINE_SPECIALS[sp];
      if (!def) return;
      const [tr, , ac, , key = 0] = def;
      const [mx, my] = this.lineMid[i];
      if (EXITS.has(sp)) { out.push({ key: "l" + i, kind: "exit", x: mx, y: my, prio: 70 - d(mx, my) / 200, line: i, use: tr === this.TR.S }); return; }
      if (tr === this.TR.S && !IGNORE_SWITCHES.has(sp) && hasKey(p.cards, key)) {
        out.push({ key: "l" + i, kind: "switch", x: mx, y: my, prio: 40 - d(mx, my) / 100, line: i, use: true });
      }
    });
    // the nearest unexplored places
    const fr = [];
    for (const c of this.standCells) if (!this.visited[c.j * this.bw + c.i]) fr.push({ key: `f${c.i},${c.j}`, kind: "explore", x: c.x, y: c.y, prio: 10 - d(c.x, c.y) / 100 });
    fr.sort((a, b) => b.prio - a.prio);
    out.push(...fr.slice(0, 12));
    return out.filter((c) => !(this.blacklist.get(c.key) > this.tic)).sort((a, b) => b.prio - a.prio);
  }

  reject(t, why, tics = 1050) {
    this.blacklist.set(t.key, this.tic + tics);
    this.events.push({ tic: this.tic, ev: "reject", kind: t.kind, key: t.key, why });
    if (this.target?.key === t.key) { this.target = null; this.fine = null; this.coarse = null; }
  }

  targetDone(t) {
    const p = this.s.p;
    if (t.thing !== undefined) return !this.s.items.some((it) => it.k === t.thing);
    if (t.line !== undefined && t.use) return !this.s.specials[t.line];
    return Math.hypot(t.x - p.x, t.y - p.y) < 48;
  }

  // ------------------------------------------------------------ planning
  async runTRM(g, kind) {
    const t0 = performance.now();
    const r = await this.planner.plan(g);
    this.stats.planMs += performance.now() - t0;
    this.stats[kind + "Plans"]++;
    return r.path;
  }

  // order the TRM set: BFS inside it from START; returns {order (cells, start first), dist, toGoal}
  walkSet(g, set, goalCell, n = N, c0 = (N / 2) * N + N / 2) {
    const dist = new Int32Array(n * n).fill(-1), prev = new Int32Array(n * n).fill(-1), q = [c0];
    dist[c0] = 0;
    for (let h = 0; h < q.length; h++) {
      const o = q[h], i = o % n, j = (o / n) | 0;
      for (const m of [i > 0 ? o - 1 : -1, i < n - 1 ? o + 1 : -1, j > 0 ? o - n : -1, j < n - 1 ? o + n : -1]) {
        if (m >= 0 && dist[m] < 0 && set[m] && passable(g[m])) { dist[m] = dist[o] + 1; prev[m] = o; q.push(m); }
      }
    }
    let end = goalCell;
    const reached = dist[goalCell] >= 0;
    if (!reached) { // the reachable cell of the set nearest the goal
      let best = -1, bd = 1e9; const gi = goalCell % n, gj = (goalCell / n) | 0;
      for (const o of q) { const dd = Math.abs(o % n - gi) + Math.abs(((o / n) | 0) - gj); if (dd < bd) { bd = dd; best = o; } }
      end = best;
    }
    const path = [];
    for (let o = end; o >= 0; o = prev[o]) path.push(o);
    path.reverse();
    return { path, reached, dist };
  }

  nearestPassable(g, i, j, rmax = 3) {
    for (let r = 0; r <= rmax; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
      const a = i + di, b = j + dj;
      if (a >= 0 && b >= 0 && a < N && b < N && passable(g[b * N + a]) && !(a === N / 2 && b === N / 2)) return b * N + a;
    }
    return -1;
  }

  cellOf(grid, x, y) {
    return [Math.min(N - 1, Math.max(0, Math.floor((x - grid.ox) / grid.cs))), Math.min(N - 1, Math.max(0, Math.floor((y - grid.oy) / grid.cs)))];
  }

  // clamp a world point into a grid's window (keeping a cell's margin) and find a passable cell near it
  goalCell(grid, x, y, rmax) {
    const lo = grid.cs, hiX = grid.ox + N * grid.cs - grid.cs, hiY = grid.oy + N * grid.cs - grid.cs;
    const p = this.s.p;
    let tx = x, ty = y;
    const sx = Math.max(grid.ox + lo, Math.min(hiX, x)), sy = Math.max(grid.oy + lo, Math.min(hiY, y));
    if (sx !== x || sy !== y) { // pull in along the line to the target
      const dx = x - p.x, dy = y - p.y;
      let f = 1;
      if (tx < grid.ox + lo) f = Math.min(f, (grid.ox + lo - p.x) / dx); if (tx > hiX) f = Math.min(f, (hiX - p.x) / dx);
      if (ty < grid.oy + lo) f = Math.min(f, (grid.oy + lo - p.y) / dy); if (ty > hiY) f = Math.min(f, (hiY - p.y) / dy);
      tx = p.x + dx * f; ty = p.y + dy * f;
    }
    const [i, j] = this.cellOf(grid, tx, ty);
    return this.nearestPassable(grid.g, i, j, rmax);
  }

  // A window whose START cell (the one just up and right of its centre) is open floor next to open floor:
  // the player's own spot first, then nudged by up to a cell, since hugging a wall can put it on a wall cell.
  anchored(make, cs) {
    const p = this.s.p, st = this.gridState(), c0 = (N / 2) * N + N / 2;
    const here = this.map.sectors[this.map.spawnSector(p.x, p.y)];
    if (here && [4, 5, 7, 11, 16].includes(here.special) && this.target) this.target.hazardOK = true; // already in it: get out
    let first = null;
    for (const [dx, dy] of [[0, 0], [-0.5, -0.5], [-0.5, 0], [0, -0.5], [-1, -1], [-1, 0], [0, -1], [0.5, 0], [0, 0.5], [-1, 0.5], [0.5, -1]]) {
      const grid = make(p.x + dx * cs, p.y + dy * cs, st);
      first ||= grid;
      const g = grid.g;
      // nukage counts as wall unless this target has already failed without it
      if (!this.target?.hazardOK) for (let k = 0; k < g.length; k++) if (g[k] === C.HAZARD) g[k] = C.WALL;
      if (passable(g[c0]) && (passable(g[c0 - 1]) || passable(g[c0 + 1]) || passable(g[c0 - N]) || passable(g[c0 + N]))) return grid;
    }
    return first;
  }

  // The whole level as one grid of 48-unit cells, planned by TRM in one go (the conv mixer runs on any
  // grid size). Used instead of the 1536-unit coarse window when the bot has a global planner.
  async planGlobal() {
    const t = this.target, p = this.s.p, b = this.map.bmap, cs = COARSE;
    const n = this.globalN ||= Math.ceil(Math.max(b.w, b.h) * 128 / cs / 8) * 8 + 8;
    const cx = b.x + b.w * 64, cy = b.y + b.h * 64;
    const grid = this.gr.coarse(cx, cy, this.gridState(), cs, n);
    const g = grid.g;
    if (!t.hazardOK) for (let k = 0; k < g.length; k++) if (g[k] === C.HAZARD) g[k] = C.WALL;
    for (const [bx, by] of this.blocked) {
      const i = Math.floor((bx - grid.ox) / cs), j = Math.floor((by - grid.oy) / cs);
      if (i >= 0 && j >= 0 && i < n && j < n) g[j * n + i] = C.WALL;
    }
    const cell = (x, y, r) => {
      const i0 = Math.floor((x - grid.ox) / cs), j0 = Math.floor((y - grid.oy) / cs);
      for (let rr = 0; rr <= r; rr++) for (let dj = -rr; dj <= rr; dj++) for (let di = -rr; di <= rr; di++) {
        const i = i0 + di, j = j0 + dj;
        if (Math.max(Math.abs(di), Math.abs(dj)) === rr && i >= 0 && j >= 0 && i < n && j < n && passable(g[j * n + i])) return j * n + i;
      }
      return -1;
    };
    const s0 = cell(p.x, p.y, 2), gc = cell(t.x, t.y, 3);
    if (s0 < 0 || gc < 0 || s0 === gc) { this.noGlobal = true; const ok = await this.planCoarse(); this.noGlobal = false; return ok; }
    g[s0] = C.START; g[gc] = C.GOAL;
    const pl = await this.globalPlanner(n);
    const t0 = performance.now();
    const r = await pl.plan(g, { sup: this.globalSup || 10 });
    this.stats.planMs += performance.now() - t0; this.stats.globalPlans = (this.stats.globalPlans || 0) + 1;
    this.stats.globalMs = (this.stats.globalMs || 0) + r.ms;
    let k = 0; for (const v of r.path) k += v;
    if (!k && !t.hazardOK) { t.hazardOK = true; return this.planGlobal(); }
    if (!k) { this.stats.coarseEmpty++; this.reject(t, "TRM: no global route"); return false; }
    const w = this.walkSet(g, r.path, gc, n, s0);
    if (!w.reached) this.stats.coarseBroken++;
    this.coarse = { grid: { ...grid, cs }, path: w.path, tic: this.tic, n };
    return true;
  }

  async planCoarse() {
    if (this.globalPlanner && !this.noGlobal) return this.planGlobal();
    const t = this.target, p = this.s.p;
    const grid = this.anchored(this.gr.coarse, COARSE);
    const c0 = (N / 2) * N + N / 2;
    // waypoints the fine planner couldn't reach: the coarse grid's pooling joined them across a wall
    for (const [bx, by] of this.blocked) {
      const i = Math.floor((bx - grid.ox) / COARSE), j = Math.floor((by - grid.oy) / COARSE);
      if (i >= 0 && j >= 0 && i < N && j < N) grid.g[j * N + i] = C.WALL;
    }
    grid.g[c0] = C.START;
    const gc = this.goalCell(grid, t.x, t.y, 4);
    if (gc < 0) { this.reject(t, "no coarse goal cell"); return false; }
    grid.g[gc] = C.GOAL;
    const set = await this.runTRM(grid.g, "coarse");
    const w = this.walkSet(grid.g, set, gc);
    let n = 0; for (let k = 0; k < N * N; k++) n += set[k];
    if (n === 0 && !t.hazardOK) { t.hazardOK = true; return this.planCoarse(); }
    if (n === 0) { this.stats.coarseEmpty++; this.reject(t, "TRM: no coarse route"); return false; }
    if (!w.reached) this.stats.coarseBroken++;
    this.coarse = { grid, path: w.path, tic: this.tic };
    return true;
  }

  // Goals to try, best first: the target when it's in the window, then coarse-route cells in the window
  // from the farthest back. A goal across a wall from the coarse route's cell is common (coarse cells are
  // 96 units), so a failed goal falls back to one nearer along the route.
  fineGoals() {
    const t = this.target, p = this.s.p, out = [];
    const inWin = (x, y) => Math.abs(x - p.x) < (N / 2 - 1) * FINE && Math.abs(y - p.y) < (N / 2 - 1) * FINE;
    if (inWin(t.x, t.y)) out.push([t.x, t.y, false]);
    if (this.coarse) {
      const cg = this.coarse.grid, pts = [], cn = this.coarse.n || N;
      for (const o of this.coarse.path) {
        const x = cg.ox + (o % cn + 0.5) * cg.cs, y = cg.oy + (((o / cn) | 0) + 0.5) * cg.cs;
        if (inWin(x, y) && Math.hypot(x - p.x, y - p.y) > 2 * FINE) pts.push([x, y]);
      }
      for (let k = pts.length - 1; k >= 0; k -= 2) out.push([...pts[k], true]);
    }
    if (!out.length) out.push([t.x, t.y, false]); // clamped into the window by goalCell
    return out.slice(0, 3);
  }

  async planFine(retry = true) {
    const t = this.target, p = this.s.p;
    const base = this.anchored(this.gr.fine, FINE);
    const c0 = (N / 2) * N + N / 2;
    base.g[c0] = C.START;
    let best = null;
    const failed = [];
    for (const [gx, gy, waypoint] of this.fineGoals()) {
      const gc = this.goalCell(base, gx, gy, 3);
      if (gc < 0) continue;
      const grid = { ...base, g: base.g.slice() };
      grid.g[gc] = C.GOAL;
      const set = await this.runTRM(grid.g, "fine");
      const w = this.walkSet(grid.g, set, gc);
      if (!w.reached) this.stats.fineBroken++;
      const cand = { grid, path: w.path, reached: w.reached, tic: this.tic, goal: [gx, gy] };
      if (w.reached) { best = cand; break; }
      if (waypoint) failed.push([gx, gy]);
      // a partial route counts only if it ends well closer to the goal than we are
      const e = w.path[w.path.length - 1], ex = grid.ox + (e % N + 0.5) * FINE, ey = grid.oy + (((e / N) | 0) + 0.5) * FINE;
      cand.gain = Math.hypot(gx - p.x, gy - p.y) - Math.hypot(gx - ex, gy - ey);
      if (cand.gain > 3 * FINE && (!best || cand.gain > best.gain)) best = cand;
    }
    if (best) { this.fine = best; this.repairs = 0; return true; }
    if (failed.length && (this.repairs = (this.repairs || 0) + 1) <= 4) { // repair the coarse map and try again
      this.blocked.push(...failed);
      this.events.push({ tic: this.tic, ev: "coarse-repair", kind: t.kind, n: failed.length });
      if (await this.planCoarse()) return this.planFine(retry);
      return false;
    }
    // a near target with no coarse route yet: get one and try again
    if (retry && !this.coarse && (await this.planCoarse())) return this.planFine(false);
    if (!t.hazardOK) { // allow nukage, and get a coarse route that may use it too
      t.hazardOK = true; this.events.push({ tic: this.tic, ev: "hazard-ok", kind: t.kind, key: t.key });
      this.coarse = null;
      if (Math.hypot(t.x - p.x, t.y - p.y) >= (N / 2 - 2) * FINE && !(await this.planCoarse())) return false;
      return this.planFine(retry);
    }
    this.reject(t, "TRM: no fine route", 350);
    return false;
  }

  // ------------------------------------------------------------ acting
  sightClear(ax, ay, bx, by) {
    const L = this.map.lines, { lx1, ly1, lx2, ly2 } = this.gr.lines;
    const s = this.s;
    for (let i = 0; i < L.length; i++) {
      const l = L[i];
      if (l.bsec >= 0 && l.fsec >= 0) {
        const open = Math.min(s.ceil[l.fsec], s.ceil[l.bsec]) - Math.max(s.floor[l.fsec], s.floor[l.bsec]);
        if (open > 0) continue;
      }
      const x1 = lx1[i], y1 = ly1[i], x2 = lx2[i], y2 = ly2[i];
      const d1 = (bx - ax) * (y1 - ay) - (by - ay) * (x1 - ax), d2 = (bx - ax) * (y2 - ay) - (by - ay) * (x2 - ax);
      if ((d1 > 0) === (d2 > 0)) continue;
      const d3 = (x2 - x1) * (ay - y1) - (y2 - y1) * (ax - x1), d4 = (x2 - x1) * (by - y1) - (y2 - y1) * (bx - x1);
      if ((d3 > 0) !== (d4 > 0)) return false;
    }
    return true;
  }

  enemy() {
    const p = this.s.p;
    let best = null, bd = 1e9;
    for (const m of this.s.monsters) {
      const d = Math.hypot(m.x - p.x, m.y - p.y);
      if (d > 1400 || d > bd) continue;
      if (!this.sightClear(p.x, p.y, m.x, m.y)) continue;
      best = m; bd = d;
    }
    if (!best && p.damage > 0 && p.attacker > 0) { // whoever is hurting us, even if our sight test can't see it
      const m = this.s.monsters.find((mm) => mm.k === p.attacker);
      if (m) { const d = Math.hypot(m.x - p.x, m.y - p.y); if (d < 2000) return { m, d, unseen: true }; }
    }
    return best ? { m: best, d: bd } : null;
  }

  weaponFor(d) {
    const p = this.s.p, has = (w) => p.weapons & (1 << w);
    const am = p.ammo;
    if (has(5) && am[2] > 0) return 6;
    if (has(3) && am[0] > 0 && d > 300) return 4;
    if (has(2) && am[1] > 0) return 3;
    if (has(3) && am[0] > 0) return 4;
    if (has(4) && am[3] > 0 && d > 300) return 5;
    if (has(1) && am[0] > 0) return 2;
    return 1;
  }

  // the farthest of the next few route cells in a straight, wall-free line from the player
  lookahead() {
    const f = this.fine, p = this.s.p, g = f.grid;
    const pts = f.path.map((o) => [g.ox + (o % N + 0.5) * g.cs, g.oy + (((o / N) | 0) + 0.5) * g.cs]);
    // where along the route are we now?
    let at = 0, bd = 1e9;
    for (let k = 0; k < pts.length; k++) { const d = Math.hypot(pts[k][0] - p.x, pts[k][1] - p.y); if (d < bd) { bd = d; at = k; } }
    let pick = Math.min(at + 1, pts.length - 1);
    for (let k = at + 1; k < Math.min(pts.length, at + 8); k++) {
      if (this.gridLineClear(g, p.x, p.y, pts[k][0], pts[k][1])) pick = k; else break;
    }
    return { pt: pts[pick], k: pick, at, end: pts.length - 1, cls: f.path.slice(at, at + 4).map((o) => g.g[o]) };
  }

  gridLineClear(g, ax, ay, bx, by) {
    const n = Math.ceil(Math.hypot(bx - ax, by - ay) / (g.cs / 3)) + 1;
    for (let k = 1; k <= n; k++) {
      const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * k / n;
      const i = Math.floor((x - g.ox) / g.cs), j = Math.floor((y - g.oy) / g.cs);
      if (i < 0 || j < 0 || i >= N || j >= N) return false;
      const c = g.g[j * N + i];
      if (c === C.WALL) return false;
    }
    return true;
  }

  // One tic: the input for the engine (forward/side in DOOM's units, turn in radians).
  async step() {
    // the game's own clock, so a bot that runs slower than the game (a live page on a slow GPU) times things right
    this.tic = this.s.p.leveltime ?? this.tic + 1;
    const s = this.s, p = s.p;
    if (p.dead || p.exit) return {};
    const bi = Math.floor((p.x - this.bx) / 128), bj = Math.floor((p.y - this.by) / 128);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const i = bi + di, j = bj + dj;
      if (i >= 0 && j >= 0 && i < this.bw && j < this.bh) this.visited[j * this.bw + i] = 1;
    }

    // progress watchdog
    if (!this.lastPos || Math.hypot(p.x - this.lastPos[0], p.y - this.lastPos[1]) > 32) { this.lastPos = [p.x, p.y]; this.lastProgressTic = this.tic; }

    if (this.target && this.targetDone(this.target)) {
      this.events.push({ tic: this.tic, ev: "done", kind: this.target.kind, key: this.target.key });
      this.stats.targets[this.target.kind] = (this.stats.targets[this.target.kind] || 0) + 1;
      if (this.target.kind === "explore") this.blacklist.set(this.target.key, 1e9);
      this.target = null; this.fine = null; this.coarse = null;
    }
    if (this.target && this.tic - this.target.since > 35 * 40) this.reject(this.target, "timeout");
    // progress: the target must get closer every 12 seconds, or it's given up for now
    if (this.target) {
      const dt = Math.hypot(this.target.x - p.x, this.target.y - p.y);
      if (!(dt > (this.target.best ?? 1e9) - 64)) { this.target.best = Math.min(dt, this.target.best ?? 1e9); this.target.bestTic = this.tic; }
      else if (this.tic - this.target.bestTic > 420) this.reject(this.target, "no progress");
    }
    if (this.debugGrids && this.fine && this.tic - (this.lastDump ?? -999) > 300) {
      this.lastDump = this.tic;
      this.events.push({ tic: this.tic, ev: "dump", kind: this.target?.kind, x: Math.round(p.x), y: Math.round(p.y), angle: +p.angle.toFixed(2),
        grid: Array.from(this.fine.grid.g), path: this.fine.path, ox: this.fine.grid.ox, oy: this.fine.grid.oy, goal: this.fine.goal });
    }
    if (this.tic - this.lastProgressTic > 70 && this.target) {
      this.stats.stuck++; this.lastProgressTic = this.tic; this.unstick = 18;
      this.target.stuck = (this.target.stuck || 0) + 1;
      this.events.push({ tic: this.tic, ev: "stuck", kind: this.target.kind, x: Math.round(p.x), y: Math.round(p.y), angle: +p.angle.toFixed(2),
        ...(this.debugGrids && this.fine ? { grid: Array.from(this.fine.grid.g), path: this.fine.path, ox: this.fine.grid.ox, oy: this.fine.grid.oy } : {}) });
      if (this.target.stuck >= 3) this.reject(this.target, "stuck"); else this.fine = null;
    }

    // choose a target and plan to it
    for (let tries = 0; !this.target && tries < 4; tries++) {
      const c = this.candidates()[0];
      if (!c) break;
      this.target = { ...c, since: this.tic, presses: 0 };
      this.events.push({ tic: this.tic, ev: "target", kind: c.kind, key: c.key, x: Math.round(c.x), y: Math.round(c.y) });
      const near = Math.hypot(c.x - p.x, c.y - p.y) < (N / 2 - 2) * FINE;
      if (!near && !(await this.planCoarse())) continue;
      if (!(await this.planFine())) continue;
    }
    if (!this.target) return { turn: 0.05 };
    const t = this.target;
    const near = Math.hypot(t.x - p.x, t.y - p.y) < (N / 2 - 2) * FINE;
    if (!near && (!this.coarse || this.tic - this.coarse.tic > (this.globalPlanner ? 350 : 140))) { if (!(await this.planCoarse())) return {}; }
    const fineEnd = this.fine && this.fine.path.length ? this.fine.path[this.fine.path.length - 1] : -1;
    const atEnd = this.fine && this.lookahead().at >= this.fine.path.length - 2;
    if (!this.fine || this.tic - this.fine.tic > 24 || atEnd) { if (!(await this.planFine())) return {}; }

    // steering
    const la = this.lookahead();
    let [mx, my] = la.pt;
    const finalLeg = near && la.k === la.end;
    if (finalLeg) { mx = t.x; my = t.y; }
    const input = { forward: 0, side: 0, turn: 0, use: false, fire: false, weapon: 0 };
    const en = this.enemy();
    let face = Math.atan2(my - p.y, mx - p.x);
    if (en) {
      face = Math.atan2(en.m.y - p.y, en.m.x - p.x);
      const w = this.weaponFor(en.d);
      if (w !== p.ready + 1 && !(w === 7 && p.ready === 7)) input.weapon = w;
      const err = Math.abs(wrap(face - p.angle));
      // hitscan spreads: past ~900 units a pistol or shotgun mostly wastes ammo
      input.fire = err < Math.max(0.05, Math.atan2(en.m.r * 0.8, en.d)) && (en.d < 900 || w >= 5) && !(en.unseen && !this.sightClear(p.x, p.y, en.m.x, en.m.y));
    }
    const err = wrap(face - p.angle);
    input.turn = Math.max(-0.3, Math.min(0.3, err));
    let vx = mx - p.x, vy = my - p.y; const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
    let speed = finalLeg && vl < 64 ? 0.5 : 1;
    // breadcrumbs, the way back when a fight goes badly
    if (this.tic - (this.lastCrumb ?? -99) >= 35) { this.lastCrumb = this.tic; (this.trail ||= []).push([p.x, p.y]); if (this.trail.length > 30) this.trail.shift(); }
    if (en) {
      // fight: keep the route's direction only from afar, back off from anything close, retreat when
      // hurt, and sidestep every second so fireballs miss
      const ex = (p.x - en.m.x) / en.d, ey = (p.y - en.m.y) / en.d;
      const hurt = p.health < 35 && this.trail?.length > 3;
      let ax = vx, ay = vy;
      if (hurt) { const [bx, by] = this.trail[Math.max(0, this.trail.length - 4)]; ax = bx - p.x; ay = by - p.y; const l = Math.hypot(ax, ay) || 1; ax /= l; ay /= l; }
      else if (en.d < 192) { ax = ex; ay = ey; }
      else if (en.d < 700 && !en.unseen) { ax = 0; ay = 0; } // stand and fight rather than walk into the room
      const side = ((this.tic / 30) | 0) & 1 ? 1 : -1;
      vx = ax - ey * side * 0.8; vy = ay + ex * side * 0.8;
      const l = Math.hypot(vx, vy) || 1; vx /= l; vy /= l; speed = 1;
    }
    const ca = Math.cos(p.angle), sa = Math.sin(p.angle);
    input.forward = 50 * speed * (vx * ca + vy * sa);
    input.side = 40 * speed * (vx * sa - vy * ca);
    // doors and switches: press use once when one is just ahead, then leave it a second, since using a
    // moving DR door sends it back the way it came
    const doorAhead = la.cls.includes(C.DOOR);
    const atSwitch = t.use && Math.hypot(t.x - p.x, t.y - p.y) < 72;
    if (atSwitch && !en) { input.turn = Math.max(-0.3, Math.min(0.3, wrap(Math.atan2(t.y - p.y, t.x - p.x) - p.angle))); }
    if ((doorAhead || atSwitch || this.unstick > 0) && this.tic - (this.lastUse ?? -99) > 45) {
      input.use = true; this.lastUse = this.tic;
      // a repeatable switch keeps its special, and one we can't reach never clears: three presses is enough
      if (atSwitch && ++t.presses >= 3) { this.blacklist.set(t.key, 1e9); this.events.push({ tic: this.tic, ev: "pressed", kind: t.kind, key: t.key }); this.target = null; this.fine = null; this.coarse = null; }
    }
    if (this.unstick > 0) { this.unstick--; input.side = (this.tic >> 4) & 1 ? 40 : -40; input.forward = -20; }
    return input;
  }

  debug() {
    const p = this.s?.p;
    return { tic: this.tic, target: this.target && { kind: this.target.kind, key: this.target.key, x: Math.round(this.target.x), y: Math.round(this.target.y) },
      pos: p && [Math.round(p.x), Math.round(p.y)], health: p?.health, fine: this.fine && { len: this.fine.path.length, reached: this.fine.reached } };
  }
}

const wrap = (a) => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };
