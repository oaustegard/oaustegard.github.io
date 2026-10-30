// Turns a DOOM level into the grids TRM plans on. Runs in the browser (the bot) and in node (training data),
// so the two can't drift apart.
//
// A grid is N×N cells of `cell` map units, centred on a point, row-major with rows going +y.
// Cell classes are the model's vocabulary.

export const C = { PAD: 0, WALL: 1, FREE: 2, DOOR: 3, HAZARD: 4, START: 5, GOAL: 6 };
export const VOCAB = 7;
export const N = 32, FINE = 24, COARSE = 48;
const CLEAR = 14; // a little under the player's radius of 16: a 48-unit gap still leaves a cell open

// manual doors and the key each needs (0 none, 1 blue, 2 yellow, 3 red)
export const MANUAL_DOORS = { 1: 0, 26: 1, 27: 2, 28: 3, 31: 0, 32: 1, 33: 3, 34: 2, 117: 0, 118: 0 };
// switch-triggered lifts whose switch is usually the lift's own edge: pressing use there lowers it
const USE_LIFTS = new Set([21, 62, 122, 123]);
const HURT = new Set([4, 5, 7, 11, 16]);
const ML_BLOCKING = 1;
export const KEY_THINGS = { 5: 1, 40: 1, 6: 2, 39: 2, 13: 3, 38: 3 }; // doomednum -> key colour
// cards word: bit 0..2 cards blue/yellow/red, 3..5 skulls
export const hasKey = (cards, k) => k === 0 || ((cards >> (k - 1)) & 1) || ((cards >> (k + 2)) & 1);

export function makeGridder(map, verts) {
  const ns = map.sectors.length;
  const secLines = Array.from({ length: ns }, () => []);
  map.lines.forEach((l, i) => {
    if (l.fsec >= 0) secLines[l.fsec].push(i);
    if (l.bsec >= 0 && l.bsec !== l.fsec) secLines[l.bsec].push(i);
  });
  const doorKey = new Map(); // door sector -> key it needs
  map.lines.forEach((l) => {
    const k = MANUAL_DOORS[l.special];
    if (k !== undefined && l.bsec >= 0) doorKey.set(l.bsec, Math.min(doorKey.get(l.bsec) ?? 9, k));
  });
  const lx1 = new Float64Array(map.lines.length), ly1 = lx1.slice(), lx2 = lx1.slice(), ly2 = lx1.slice();
  map.lines.forEach((l, i) => { [lx1[i], ly1[i]] = verts[l.v1]; [lx2[i], ly2[i]] = verts[l.v2]; });

  // even-odd test against the sector's own boundary: the BSP puts a point outside the map in some sector too
  function inSector(s, x, y) {
    let inside = false;
    for (const i of secLines[s]) {
      const l = map.lines[i];
      if (l.fsec === l.bsec) continue;
      const ax = lx1[i], ay = ly1[i], bx = lx2[i], by = ly2[i];
      if ((ay > y) !== (by > y) && x < ax + (y - ay) * (bx - ax) / (by - ay)) inside = !inside;
    }
    return inside;
  }

  // st: {floor: Float32Array, ceil: Float32Array, cards, solids: [[x, y, r]], usedLines?: Set}
  function lineClass(i, st) {
    const l = map.lines[i];
    if (l.fsec < 0 || l.bsec < 0 || (l.flags & ML_BLOCKING)) return C.WALL;
    const a = l.fsec, b = l.bsec;
    const open = Math.min(st.ceil[a], st.ceil[b]) - Math.max(st.floor[a], st.floor[b]);
    const step = Math.abs(st.floor[a] - st.floor[b]);
    if (open >= 56 && step <= 24) return 0;
    for (const s of [a, b]) {
      if (st.ceil[s] - st.floor[s] < 56 && doorKey.has(s)) return hasKey(st.cards, doorKey.get(s)) ? C.DOOR : C.WALL;
    }
    if (USE_LIFTS.has(l.special) && open >= 56) return C.DOOR;
    return C.WALL;
  }

  function sectorClass(s, st) {
    if (st.ceil[s] - st.floor[s] < 56) return doorKey.has(s) && hasKey(st.cards, doorKey.get(s)) ? C.DOOR : C.WALL;
    return HURT.has(map.sectors[s].special) ? C.HAZARD : C.FREE;
  }

  // segment vs axis-aligned box (closed), by separating axes
  function segHitsBox(ax, ay, bx, by, x0, y0, x1, y1) {
    if (Math.max(ax, bx) < x0 || Math.min(ax, bx) > x1 || Math.max(ay, by) < y0 || Math.min(ay, by) > y1) return false;
    const dx = bx - ax, dy = by - ay;
    const s = (px, py) => dx * (py - ay) - dy * (px - ax);
    const s0 = s(x0, y0), s1 = s(x1, y0), s2 = s(x0, y1), s3 = s(x1, y1);
    return !((s0 > 0 && s1 > 0 && s2 > 0 && s3 > 0) || (s0 < 0 && s1 < 0 && s2 < 0 && s3 < 0));
  }

  // The raw grid: n×n cells of size cs with lower-left corner (ox, oy). Walls and closed doors are drawn as the
  // cells their lines touch (a supercover, so no 4-connected path slips through a wall).
  function raster(ox, oy, cs, n, st) {
    const g = new Uint8Array(n * n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = ox + (i + 0.5) * cs, y = oy + (j + 0.5) * cs;
      const s = map.spawnSector(x, y);
      g[j * n + i] = inSector(s, x, y) ? sectorClass(s, st) : C.WALL;
    }
    const X1 = ox + n * cs, Y1 = oy + n * cs, blocking = [];
    for (let k = 0; k < map.lines.length; k++) {
      const ax = lx1[k], ay = ly1[k], bx = lx2[k], by = ly2[k];
      if (Math.max(ax, bx) < ox || Math.min(ax, bx) > X1 || Math.max(ay, by) < oy || Math.min(ay, by) > Y1) continue;
      const c = lineClass(k, st);
      if (!c) continue;
      if (c === C.WALL) blocking.push(k);
      const i0 = Math.max(0, Math.floor((Math.min(ax, bx) - ox) / cs)), i1 = Math.min(n - 1, Math.floor((Math.max(ax, bx) - ox) / cs));
      const j0 = Math.max(0, Math.floor((Math.min(ay, by) - oy) / cs)), j1 = Math.min(n - 1, Math.floor((Math.max(ay, by) - oy) / cs));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const x0 = ox + i * cs, y0 = oy + j * cs;
        if (!segHitsBox(ax, ay, bx, by, x0, y0, x0 + cs, y0 + cs)) continue;
        const o = j * n + i;
        if (c === C.WALL || g[o] !== C.WALL) g[o] = c;
      }
    }
    // clearance: an open cell whose centre is closer to a wall than the player's radius can't hold the player
    if (CLEAR > 0) for (const k of blocking) {
      const ax = lx1[k], ay = ly1[k], bx = lx2[k], by = ly2[k], dx = bx - ax, dy = by - ay, ll = dx * dx + dy * dy || 1;
      const i0 = Math.max(0, Math.floor((Math.min(ax, bx) - CLEAR - ox) / cs)), i1 = Math.min(n - 1, Math.floor((Math.max(ax, bx) + CLEAR - ox) / cs));
      const j0 = Math.max(0, Math.floor((Math.min(ay, by) - CLEAR - oy) / cs)), j1 = Math.min(n - 1, Math.floor((Math.max(ay, by) + CLEAR - oy) / cs));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const o = j * n + i;
        if (g[o] !== C.FREE && g[o] !== C.HAZARD) continue;
        const px = ox + (i + 0.5) * cs, py = oy + (j + 0.5) * cs;
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / ll));
        if (Math.hypot(ax + t * dx - px, ay + t * dy - py) < CLEAR) g[o] = C.WALL;
      }
    }
    for (const [x, y, r] of st.solids || []) {
      const i0 = Math.max(0, Math.floor((x - r - ox) / cs)), i1 = Math.min(n - 1, Math.floor((x + r - ox) / cs));
      const j0 = Math.max(0, Math.floor((y - r - oy) / cs)), j1 = Math.min(n - 1, Math.floor((y + r - oy) / cs));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) g[j * n + i] = C.WALL;
    }
    return g;
  }

  // Fine grid centred on (cx, cy).
  function fine(cx, cy, st) {
    const ox = cx - N * FINE / 2, oy = cy - N * FINE / 2;
    return { g: raster(ox, oy, FINE, N, st), ox, oy, cs: FINE };
  }

  // Coarse grid: a fN×fN fine raster pooled f×f (f = COARSE / FINE). A coarse cell is open when at least
  // f²/4 of its fine cells are. Training data used f = 4 (96 units); the bot uses f = 2, which keeps
  // corridors and doors that 96-unit cells lost while joining rooms across walls less often.
  function coarse(cx, cy, st, cs = COARSE, n = N) {
    const f = Math.round(cs / FINE), ox = cx - n * cs / 2, oy = cy - n * cs / 2, nf = n * f, need = Math.max(1, (f * f) >> 2);
    const fg = raster(ox, oy, FINE, nf, st);
    const g = new Uint8Array(n * n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      let free = 0, hurt = 0, door = 0;
      for (let b = 0; b < f; b++) for (let a = 0; a < f; a++) {
        const c = fg[(j * f + b) * nf + i * f + a];
        if (c === C.FREE) free++; else if (c === C.HAZARD) hurt++; else if (c === C.DOOR) door++;
      }
      g[j * n + i] = free + hurt >= need ? (hurt > free ? C.HAZARD : C.FREE) : free + hurt + door >= need ? C.DOOR : C.WALL;
    }
    return { g, ox, oy, cs, n };
  }

  return { fine, coarse, raster, inSector, lineClass, doorKey, secLines, lines: { lx1, ly1, lx2, ly2 } };
}

export const passable = (c) => c >= C.FREE;

// Cells on any shortest 4-connected path from START to GOAL (both included); all zeros if GOAL is unreachable.
export function shortestUnion(g, n = N) {
  const s = g.indexOf(C.START), t = g.indexOf(C.GOAL);
  const out = new Uint8Array(n * n);
  if (s < 0 || t < 0) return out;
  const bfs = (src) => {
    const d = new Int32Array(n * n).fill(-1), q = new Int32Array(n * n);
    let h = 0, e = 0; d[src] = 0; q[e++] = src;
    while (h < e) {
      const o = q[h++], i = o % n, j = (o / n) | 0;
      const nb = [i > 0 ? o - 1 : -1, i < n - 1 ? o + 1 : -1, j > 0 ? o - n : -1, j < n - 1 ? o + n : -1];
      for (const p of nb) if (p >= 0 && d[p] < 0 && passable(g[p])) { d[p] = d[o] + 1; q[e++] = p; }
    }
    return d;
  };
  const ds = bfs(s);
  if (ds[t] < 0) return out;
  const dt = bfs(t), D = ds[t];
  for (let k = 0; k < n * n; k++) if (ds[k] >= 0 && dt[k] >= 0 && ds[k] + dt[k] === D) out[k] = 1;
  return out;
}

// Sector heights as the WAD sets them; doors closed, lifts up.
export function wadState(map) {
  return {
    floor: Float32Array.from(map.sectors, (s) => s.floor),
    ceil: Float32Array.from(map.sectors, (s) => s.ceil),
    cards: 0, solids: [],
  };
}

// VERTEXES of a level (buildMap keeps them only inside its packed words)
export function mapVerts(wad, name) {
  const base = wad.index(name);
  for (let i = base + 1; i < base + 12 && i < wad.lumps.length; i++) {
    if (wad.lumps[i].name !== "VERTEXES") continue;
    const d = wad.data(i), dv = new DataView(d.buffer, d.byteOffset, d.byteLength), out = [];
    for (let k = 0; k < d.byteLength / 4; k++) out.push([dv.getInt16(4 * k, true), dv.getInt16(4 * k + 2, true)]);
    return out;
  }
  throw new Error("no VERTEXES for " + name);
}
