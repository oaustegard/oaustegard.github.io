// Rules tests for games/careen/logic.js. Run: node tests/careen-logic.mjs
import assert from 'node:assert/strict';
import { Board, DIR_NAMES, makeRng, scoreClear } from '../games/careen/logic.js';

let failed = 0;
function test(name, fn) {
  try { fn(); console.log('ok  ', name); }
  catch (e) { failed++; console.log('FAIL', name, '\n    ', e.message); }
}

// Build a board from rows of text: digits are colours, '.' is empty.
function fromText(rows, colors = 6) {
  const b = new Board(rows[0].length, rows.length, colors, makeRng(1));
  rows.forEach((line, r) => [...line].forEach((ch, c) => { if (ch !== '.') b.add(c, r, +ch); }));
  return b;
}
function toText(b) {
  const out = [];
  for (let r = 0; r < b.rows; r++) {
    let s = '';
    for (let c = 0; c < b.cols; c++) { const k = b.colorAt(c, r); s += k < 0 ? '.' : k; }
    out.push(s);
  }
  return out;
}

test('settle packs each line against the gravity wall, keeping order', () => {
  const b = fromText(['1..', '.2.', '3.4']);
  b.settle('down');
  assert.deepEqual(toText(b), ['...', '1..', '324']);
  b.settle('right');
  assert.deepEqual(toText(b), ['...', '..1', '324']);
  b.settle('up');
  assert.deepEqual(toText(b), ['321', '..4', '...']);
  b.settle('left');
  assert.deepEqual(toText(b), ['321', '4..', '...']);
  assert.ok(b.isSettled('left'));
  assert.ok(!b.isSettled('down'));
});

test('tile records follow their cells through settle', () => {
  const b = fromText(['1..', '...', '...']);
  b.settle('right');
  const [t] = b.tiles.values();
  assert.deepEqual([t.c, t.r], [2, 0]);
  assert.equal(b.at(2, 0), t.id);
});

test('findMatches finds rows, columns, crosses and ignores pairs', () => {
  const b = fromText(['111.', '2.1.', '221.', '3344']);
  const { runs, cells } = b.findMatches();
  assert.equal(runs.length, 2);
  assert.deepEqual([...cells].sort((a, z) => a - z), [0, 1, 2, 6, 10]);
  assert.equal(fromText(['1212', '2121']).findMatches().cells.size, 0);
  const long = fromText(['33333']).findMatches();
  assert.equal(long.runs[0].cells.length, 5);
});

test('a gravity turn can make a match that did not exist', () => {
  // Under down gravity the 1s sit in a column with a 2 between them; turning left lines them up.
  const b = fromText(['....', '1...', '.1..', '..1.']);
  b.settle('down');
  assert.equal(b.findMatches().cells.size, 3); // the 1s land in a row
  const c = fromText(['1..', '2..', '1..', '1..']);
  c.settle('down');
  assert.equal(c.findMatches().cells.size, 0);
  assert.deepEqual(c.findHint('down').kind, 'swap');
});

test('swap moves tiles, allows one empty side, rejects diagonals', () => {
  const b = fromText(['12', '3.']);
  assert.ok(b.swap([0, 0], [1, 0]));
  assert.deepEqual(toText(b), ['21', '3.']);
  assert.ok(b.swap([0, 1], [1, 1]));
  assert.deepEqual(toText(b), ['21', '.3']);
  assert.ok(!b.swap([0, 0], [1, 1]));
  const e = fromText(['1.', '..']);
  assert.ok(!e.swap([1, 0], [1, 1]));
});

test('pour lands new tiles on the stacks with the most room and reports overflow', () => {
  const b = fromText(['...', '...', '1..', '11.']);
  const { placed, overflow } = b.pour('down', [2, 2]);
  assert.ok(!overflow);
  assert.equal(placed.length, 2);
  assert.ok(b.isSettled('down'));
  assert.equal(b.colorAt(2, 3), 2); // the empty column fills first
  const full = fromText(['11', '11']);
  assert.ok(full.pour('down', [1]).overflow);
  const nearly = fromText(['.1', '11']);
  const r = nearly.pour('left', [3, 3]);
  assert.ok(r.overflow);
  assert.equal(r.placed.length, 1);
});

test('fill leaves a packed board with no matches, every direction', () => {
  for (const g of DIR_NAMES) {
    for (let seed = 1; seed < 30; seed++) {
      const b = new Board(8, 10, 5, makeRng(seed));
      b.fill(g, 0.55);
      assert.ok(b.isSettled(g), `${g} ${seed} settled`);
      assert.equal(b.findMatches().cells.size, 0, `${g} ${seed} no matches`);
      assert.equal(b.tiles.size, 44);
    }
  }
});

test('hints are real: applying one produces a match', () => {
  let found = 0;
  for (let seed = 1; seed < 60; seed++) {
    const b = new Board(7, 9, 5, makeRng(seed));
    b.fill('down', 0.6);
    const h = b.findHint('down');
    if (!h) continue;
    found++;
    if (h.kind === 'tilt') b.settle(h.dir); else b.swap(h.a, h.b);
    assert.ok(b.findMatches().cells.size >= 3, `seed ${seed} ${h.kind}`);
  }
  assert.ok(found > 40, `hints found on ${found} boards`);
});

test('scoring: 10 a tile, 20 per extra tile in a run, times chain', () => {
  assert.equal(scoreClear([{ cells: [0, 1, 2] }], 3, 1), 30);
  assert.equal(scoreClear([{ cells: [0, 1, 2, 3, 4] }], 5, 2), 180);
});

test('a long scripted game never desyncs tile records from cells', () => {
  const rng = makeRng(7), b = new Board(8, 10, 6, rng);
  b.fill('down', 0.5);
  let g = 'down', cleared = 0;
  for (let step = 0; step < 400; step++) {
    const roll = rng();
    if (roll < 0.3) g = DIR_NAMES[Math.floor(rng() * 4)];
    else if (roll < 0.8) {
      const c = Math.floor(rng() * 7), r = Math.floor(rng() * 10);
      b.swap([c, r], [c + 1, r]);
    } else if (b.pour(g, [b.randomColor(), b.randomColor()]).overflow) break;
    for (;;) {
      b.settle(g);
      const { cells } = b.findMatches();
      if (!cells.size) break;
      for (const i of cells) b.remove(b.cells[i]);
      cleared += cells.size;
    }
    for (const t of b.tiles.values()) assert.equal(b.at(t.c, t.r), t.id);
    let n = 0; for (const v of b.cells) if (v >= 0) n++;
    assert.equal(n, b.tiles.size);
  }
  assert.ok(cleared > 0);
});

if (failed) { console.log(`${failed} failed`); process.exit(1); }
console.log('all passed');
