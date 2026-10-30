// Turns a DOOM level into the grids TRM plans on. Runs in the browser (the bot) and in node (training data),
// so the two can't drift apart.
//
// A grid is N×N cells of `cell` map units, centred on a point, row-major with rows going +y.
// Cell classes are the model's vocabulary.

export const C = { PAD: 0, WALL: 1, FREE: 2, DOOR: 3, HAZARD: 4, START: 5, GOAL: 6 };
export const VOCAB = 7;
export const N = 32, FINE = 24, COARSE = 48;
const CLEAR = 14; // a little under the player's radius of 16: a 48-unit gap still leaves a cell open
// a drop into nukage, or of more than 64 units, keeps the route further away: the player's momentum carries
// it a few units past where it stops pushing, and a pit with no way out is a death
const CLEAR_DROP = 24;

// manual doors and the key each needs (0 none, 1 blue, 2 yellow, 3 red)
export const MANUAL_DOORS = { 1: 0, 26: 1, 27: 2, 28: 3, 31: 0, 32: 1, 33: 3, 34: 2, 117: 0, 118: 0 };
// switch-triggered lifts whose switch is usually the lift's own edge: pressing use there lowers it
const USE_LIFTS = new Set([21, 62, 122, 123]);
// lifts that lower, wait and rise (DOOM's downWaitUpStay and its blazing twin), by how they're triggered
export const LIFT_SPECIALS = { 10: "W", 88: "W", 120: "W", 121: "W", 21: "S", 62: "S", 122: "S", 123: "S" };
export const HURT = new Set([4, 5, 7, 11, 16]);
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
  // lift sector -> {low, high, triggers: [{line, how}]}: it rests at high and lowers to the lowest floor around it
  const lifts = new Map();
  map.lines.forEach((l, i) => {
    const how = LIFT_SPECIALS[l.special];
    if (!how || !l.tag) return;
    map.sectors.forEach((sec, k) => {
      if (sec.tag !== l.tag) return;
      if (!lifts.has(k)) {
        let low = sec.floor;
        for (const j of secLines[k]) { const o = map.lines[j].fsec === k ? map.lines[j].bsec : map.lines[j].fsec; if (o >= 0) low = Math.min(low, map.sectors[o].floor); }
        lifts.set(k, { low, high: sec.floor, triggers: [] });
      }
      lifts.get(k).triggers.push({ line: i, how });
    });
  });

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
    // a lift's edge is a way on or off when the lift can stand level with the other side (a door-like cell: passable
    // once something is done about it)
    const la = lifts.get(a), lb = lifts.get(b);
    if ((la || lb) && !(la && lb)) {
      const [L, S, lift] = la ? [a, b, la] : [b, a, lb];
      for (const h of [lift.low, lift.high]) {
        if (Math.abs(st.floor[S] - h) <= 24 && Math.min(st.ceil[L], st.ceil[S]) - Math.max(h, st.floor[S]) >= 56) return C.DOOR;
      }
    }
    if (step > 24 && !USE_LIFTS.has(l.special)) return C.WALL; // a door onto a drop is still a drop (E1M3's door into a nukage pit)
    for (const s of [a, b]) {
      if (st.ceil[s] - st.floor[s] < 56 && doorKey.has(s)) return hasKey(st.cards, doorKey.get(s)) ? C.DOOR : C.WALL;
    }
    if (USE_LIFTS.has(l.special) && open >= 56) return C.DOOR;
    return C.WALL;
  }

  function dangerousDrop(i, st) {
    const l = map.lines[i];
    if (l.fsec < 0 || l.bsec < 0) return false;
    const a = l.fsec, b = l.bsec, lo = st.floor[a] < st.floor[b] ? a : b;
    return Math.abs(st.floor[a] - st.floor[b]) > 64 || (Math.abs(st.floor[a] - st.floor[b]) > 24 && HURT.has(map.sectors[lo].special));
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
      if (c === C.WALL) blocking.push([k, dangerousDrop(k, st) ? CLEAR_DROP : CLEAR]);
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
    for (const [k, clear] of blocking) {
      const ax = lx1[k], ay = ly1[k], bx = lx2[k], by = ly2[k], dx = bx - ax, dy = by - ay, ll = dx * dx + dy * dy || 1;
      const i0 = Math.max(0, Math.floor((Math.min(ax, bx) - clear - ox) / cs)), i1 = Math.min(n - 1, Math.floor((Math.max(ax, bx) + clear - ox) / cs));
      const j0 = Math.max(0, Math.floor((Math.min(ay, by) - clear - oy) / cs)), j1 = Math.min(n - 1, Math.floor((Math.max(ay, by) + clear - oy) / cs));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const o = j * n + i;
        if (g[o] !== C.FREE && g[o] !== C.HAZARD) continue;
        const px = ox + (i + 0.5) * cs, py = oy + (j + 0.5) * cs;
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / ll));
        if (Math.hypot(ax + t * dx - px, ay + t * dy - py) < clear) g[o] = C.WALL;
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
    // Pooling joins two rooms when a wall straddles a coarse boundary: each side keeps an open fine cell and the
    // coarse cells touch (E1M3's switch room and the corridor behind it). Two open coarse neighbours with no open
    // fine pair across their shared edge are cut by walling one of them, the one with fewer open fine cells first,
    // but only when the cells it really joins stay connected around it; a cell that is a passage's only way is kept.
    const open = (i, j) => { let k = 0; for (let b = 0; b < f; b++) for (let a = 0; a < f; a++) k += passable(fg[(j * f + b) * nf + i * f + a]); return k; };
    // The fine raster closes some real doorways too, so a pair with no open fine pair across the edge still counts
    // as joined when a segment between open fine cells on either side crosses no blocking line.
    // Only lines that block both ways count: a drop of 24 to 64 units is a wall on the grid, being one-way, and
    // pooling used to carry routes over it (E1M2's ledge off the window strip).
    const walls = [];
    for (let k = 0; k < map.lines.length; k++) {
      if (lineClass(k, st) !== C.WALL) continue;
      const l = map.lines[k];
      if (l.fsec >= 0 && l.bsec >= 0 && !(l.flags & ML_BLOCKING) && !dangerousDrop(k, st) &&
        Math.min(st.ceil[l.fsec], st.ceil[l.bsec]) - Math.max(st.floor[l.fsec], st.floor[l.bsec]) >= 56) continue;
      walls.push(k);
    }
    const crosses = (ax, ay, bx, by) => walls.some((k) => {
      const cx = lx1[k], cy = ly1[k], dx = lx2[k], dy = ly2[k];
      if (Math.max(cx, dx) < Math.min(ax, bx) || Math.min(cx, dx) > Math.max(ax, bx) || Math.max(cy, dy) < Math.min(ay, by) || Math.min(cy, dy) > Math.max(ay, by)) return false;
      const o = (px, py, qx, qy, rx, ry) => Math.sign((qx - px) * (ry - py) - (qy - py) * (rx - px));
      return o(ax, ay, bx, by, cx, cy) * o(ax, ay, bx, by, dx, dy) <= 0 && o(cx, cy, dx, dy, ax, ay) * o(cx, cy, dx, dy, bx, by) <= 0;
    });
    const cells = (i, j) => { const out = [];
      for (let b = 0; b < f; b++) for (let a = 0; a < f; a++) if (passable(fg[(j * f + b) * nf + i * f + a])) out.push([ox + (i * f + a + 0.5) * FINE, oy + (j * f + b + 0.5) * FINE]);
      return out; };
    const joined = (i, j, i2, j2) => { // i2 = i + 1 or j2 = j + 1
      for (let t = 0; t < f; t++) {
        const a = i2 > i ? fg[(j * f + t) * nf + i * f + f - 1] : fg[(j * f + f - 1) * nf + i * f + t];
        const b = i2 > i ? fg[(j * f + t) * nf + i2 * f] : fg[(j2 * f) * nf + i * f + t];
        if (passable(a) && passable(b)) return true;
      }
      const B = cells(i2, j2);
      return cells(i, j).some(([ax, ay]) => B.some(([bx, by]) => !crosses(ax, ay, bx, by)));
    };
    const real = (i, j, i2, j2) => i2 >= 0 && j2 >= 0 && i2 < n && j2 < n && passable(g[j2 * n + i2]) &&
      (i2 < i || j2 < j ? joined(i2, j2, i, j) : joined(i, j, i2, j2));
    const R = 3;
    const tryCut = (i, j) => {
      const nb = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]].filter(([a, b]) => real(i, j, a, b));
      const was = g[j * n + i]; g[j * n + i] = C.WALL;
      if (nb.length > 1) { // the real neighbours must still meet inside a (2R+1)² window without this cell
        const seen = new Set([nb[0][1] * n + nb[0][0]]), q = [nb[0]];
        for (let h = 0; h < q.length; h++) { const [a, b] = q[h];
          for (const [c, d] of [[a - 1, b], [a + 1, b], [a, b - 1], [a, b + 1]]) {
            if (Math.abs(c - i) > R || Math.abs(d - j) > R || seen.has(d * n + c) || !real(a, b, c, d)) continue;
            seen.add(d * n + c); q.push([c, d]);
          } }
        if (!nb.every(([a, b]) => seen.has(b * n + a))) { g[j * n + i] = was; return false; }
      }
      return true;
    };
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      for (const [i2, j2] of [[i + 1, j], [i, j + 1]]) {
        if (i2 >= n || j2 >= n || !passable(g[j * n + i]) || !passable(g[j2 * n + i2]) || joined(i, j, i2, j2)) continue;
        const [x, y] = open(i, j) <= open(i2, j2) ? [[i, j], [i2, j2]] : [[i2, j2], [i, j]];
        if (!tryCut(...x)) tryCut(...y);
      }
    }
    return { g, ox, oy, cs, n };
  }

  return { fine, coarse, raster, inSector, lineClass, doorKey, lifts, secLines, lines: { lx1, ly1, lx2, ly2 } };
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
