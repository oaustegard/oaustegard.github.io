// Careen rules: a board of coloured tiles that packs against whichever wall gravity points at.
// Pure state, no DOM or timing, so tests/careen-logic.mjs can play it in Node.
// Cells are indexed i = r * cols + c, row 0 at the top. A cell holds a tile id or -1.

export const DIRS = {
  down: [0, 1],
  up: [0, -1],
  left: [-1, 0],
  right: [1, 0],
};
export const DIR_NAMES = ['down', 'left', 'up', 'right'];

// mulberry32: small, seedable, good enough for tile colours.
export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Board {
  constructor(cols, rows, colors, rng = Math.random) {
    this.cols = cols;
    this.rows = rows;
    this.colors = colors;
    this.rng = rng;
    this.cells = new Int32Array(cols * rows).fill(-1);
    this.tiles = new Map(); // id -> { id, color, c, r }
    this.nextId = 1;
  }

  idx(c, r) { return r * this.cols + c; }
  inside(c, r) { return c >= 0 && r >= 0 && c < this.cols && r < this.rows; }
  at(c, r) { return this.inside(c, r) ? this.cells[this.idx(c, r)] : -1; }
  colorAt(c, r) {
    const id = this.at(c, r);
    return id < 0 ? -1 : this.tiles.get(id).color;
  }
  free() { let n = 0; for (const v of this.cells) if (v < 0) n++; return n; }
  randomColor() { return Math.floor(this.rng() * this.colors); }

  add(c, r, color) {
    const id = this.nextId++;
    this.tiles.set(id, { id, color, c, r });
    this.cells[this.idx(c, r)] = id;
    return id;
  }
  remove(id) {
    const t = this.tiles.get(id);
    if (!t) return;
    if (this.cells[this.idx(t.c, t.r)] === id) this.cells[this.idx(t.c, t.r)] = -1;
    this.tiles.delete(id);
  }

  // The lines that run along gravity, each listed from the downstream wall to the upstream one.
  lines(g) {
    const [dx, dy] = DIRS[g], out = [];
    if (dx === 0) {
      for (let c = 0; c < this.cols; c++) {
        const line = [];
        for (let k = 0; k < this.rows; k++) line.push([c, dy > 0 ? this.rows - 1 - k : k]);
        out.push(line);
      }
    } else {
      for (let r = 0; r < this.rows; r++) {
        const line = [];
        for (let k = 0; k < this.cols; k++) line.push([dx > 0 ? this.cols - 1 - k : k, r]);
        out.push(line);
      }
    }
    return out;
  }

  // Pack every tile against the downstream wall, keeping the order within each line.
  // Returns the number of tiles that changed cell.
  settle(g) {
    let moved = 0;
    for (const line of this.lines(g)) {
      const ids = [];
      for (const [c, r] of line) {
        const id = this.cells[this.idx(c, r)];
        if (id >= 0) ids.push(id);
        this.cells[this.idx(c, r)] = -1;
      }
      ids.forEach((id, k) => {
        const [c, r] = line[k], t = this.tiles.get(id);
        if (t.c !== c || t.r !== r) moved++;
        t.c = c; t.r = r;
        this.cells[this.idx(c, r)] = id;
      });
    }
    return moved;
  }

  isSettled(g) {
    for (const line of this.lines(g)) {
      let gap = false;
      for (const [c, r] of line) {
        if (this.at(c, r) < 0) gap = true;
        else if (gap) return false;
      }
    }
    return true;
  }

  // Runs of three or more equal colours along rows and columns.
  // Returns { runs: [{ color, cells: [i...] }], cells: Set<i> }.
  findMatches() {
    const runs = [], hit = new Set();
    const scan = (len, outer, cell) => {
      for (let o = 0; o < outer; o++) {
        let start = 0;
        for (let k = 1; k <= len; k++) {
          const a = k < len ? cell(o, k) : null, s = cell(o, start);
          const ca = a ? this.colorAt(a[0], a[1]) : -2, cs = this.colorAt(s[0], s[1]);
          if (ca !== cs || cs < 0) {
            if (cs >= 0 && k - start >= 3) {
              const cells = [];
              for (let j = start; j < k; j++) {
                const [c, r] = cell(o, j), i = this.idx(c, r);
                cells.push(i); hit.add(i);
              }
              runs.push({ color: cs, cells });
            }
            start = k;
          }
        }
      }
    };
    scan(this.cols, this.rows, (r, c) => [c, r]);
    scan(this.rows, this.cols, (c, r) => [c, r]);
    return { runs, cells: hit };
  }

  // Swap the contents of two orthogonally adjacent cells; either may be empty, not both.
  swap(a, b) {
    if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return false;
    if (!this.inside(a[0], a[1]) || !this.inside(b[0], b[1])) return false;
    const ia = this.idx(a[0], a[1]), ib = this.idx(b[0], b[1]);
    const ta = this.cells[ia], tb = this.cells[ib];
    if (ta < 0 && tb < 0) return false;
    this.cells[ia] = tb; this.cells[ib] = ta;
    if (ta >= 0) Object.assign(this.tiles.get(ta), { c: b[0], r: b[1] });
    if (tb >= 0) Object.assign(this.tiles.get(tb), { c: a[0], r: a[1] });
    return true;
  }

  // Drop `colors.length` new tiles in from the upstream edge. Each goes into the line with the most
  // room (ties broken at random), landing on top of that line's stack. Returns
  // { placed: [{ id, line, depth }], overflow } where depth counts tiles queued above the edge, so
  // the renderer can stack their entry points outside the board.
  pour(g, colors) {
    const lines = this.lines(g);
    const room = lines.map(line => line.filter(([c, r]) => this.at(c, r) < 0).length);
    const queued = lines.map(() => 0), placed = [];
    for (const color of colors) {
      let best = -1, bestRoom = 0, ties = 0;
      room.forEach((n, k) => {
        if (n > bestRoom) { best = k; bestRoom = n; ties = 1; }
        else if (n === bestRoom && n > 0 && this.rng() * ++ties < 1) best = k;
      });
      if (best < 0) return { placed, overflow: true };
      const line = lines[best];
      const slot = line.findIndex(([c, r]) => this.at(c, r) < 0);
      const [c, r] = line[slot];
      placed.push({ id: this.add(c, r, color), line: best, depth: queued[best]++ });
      room[best]--;
    }
    return { placed, overflow: false };
  }

  // Fill a fraction of the board, packed under g, then recolour until nothing matches.
  fill(g, fraction) {
    const lines = this.lines(g);
    let n = Math.round(this.cols * this.rows * fraction);
    while (n > 0) {
      const line = lines[Math.floor(this.rng() * lines.length)];
      const slot = line.findIndex(([c, r]) => this.at(c, r) < 0);
      if (slot < 0) continue;
      this.add(line[slot][0], line[slot][1], this.randomColor());
      n--;
    }
    this.breakMatches();
  }

  breakMatches() {
    for (let guard = 0; guard < 200; guard++) {
      const { cells } = this.findMatches();
      if (!cells.size) return;
      for (const i of cells) if (this.rng() < 0.5) this.tiles.get(this.cells[i]).color = this.randomColor();
    }
  }

  clone() {
    const b = new Board(this.cols, this.rows, this.colors, this.rng);
    b.cells = this.cells.slice();
    for (const [id, t] of this.tiles) b.tiles.set(id, { ...t });
    b.nextId = this.nextId;
    return b;
  }

  // A move that clears something right away, or null. Gravity turns come first, since they are
  // the move the game is about; then swaps of two tiles, which keep the board packed.
  findHint(g) {
    for (const d of DIR_NAMES) {
      if (d === g) continue;
      const b = this.clone();
      b.settle(d);
      if (b.findMatches().cells.size) return { kind: 'tilt', dir: d };
    }
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        for (const [dx, dy] of [[1, 0], [0, 1]]) {
          const c2 = c + dx, r2 = r + dy;
          if (!this.inside(c2, r2) || this.at(c, r) < 0 || this.at(c2, r2) < 0) continue;
          if (this.colorAt(c, r) === this.colorAt(c2, r2)) continue;
          const b = this.clone();
          b.swap([c, r], [c2, r2]);
          if (b.findMatches().cells.size) return { kind: 'swap', a: [c, r], b: [c2, r2] };
        }
      }
    }
    return null;
  }
}

// Points for one clear: 10 a tile, 20 more for each tile a run has past three, all times the chain.
export function scoreClear(runs, tiles, chain) {
  let bonus = 0;
  for (const run of runs) bonus += Math.max(0, run.cells.length - 3) * 20;
  return (tiles * 10 + bonus) * chain;
}
