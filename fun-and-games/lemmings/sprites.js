// Lemming pixel art, drawn here rather than taken from the original game. Every frame faces right,
// is 8 pixels wide and is packed as 16 rows of 4-bit palette indices, one u32 per row, bottom-aligned
// so that the last row is the row the lemming stands in. The GPU mirrors frames for left-walkers.

export const PALETTE = [
  null,          // 0 transparent
  [40, 200, 60],   // g hair
  [60, 90, 230],   // b robe
  [240, 200, 160], // s skin
  [255, 255, 255], // w white
  [150, 95, 45],   // k wood, brick
  [225, 50, 45],   // r red
  [170, 170, 180], // e steel grey
  [30, 30, 30],    // d dark
  [250, 230, 70],  // y yellow
  [245, 140, 40],  // o orange
  [140, 200, 255], // c pale blue
  [255, 120, 160], // p pink
  null, null,
  [120, 255, 120], // 15 minimap dot
];
const KEY = { ".": 0, g: 1, b: 2, s: 3, w: 4, k: 5, r: 6, e: 7, d: 8, y: 9, o: 10, c: 11, p: 12 };

// state number -> frames; the order of the states matches shaders.js
const ART = {
  walk: [
    ["...g....", "..ggg...", "..gss...", "...ss...", "..bbb...", "..bbbs..", "..bbb...", "..b.b...", ".b...b..", ".b...b.."],
    ["...g....", "..ggg...", "..gss...", "...ss...", "...bb...", "...bbs..", "...bb...", "...bb...", "...bb...", "...bb..."],
    ["...g....", "..ggg...", "..gss...", "...ss...", "..bbb...", ".sbbb...", "..bbb...", "..b.b...", ".b...b..", ".b....b."],
    ["...g....", "..ggg...", "..gss...", "...ss...", "...bb...", "..sbb...", "...bb...", "...bb...", "..b.b...", "..b.b..."],
  ],
  fall: [
    [".s...s..", ".s.g.s..", "..ggg...", "..gss...", "...ss...", "..bbb...", "..bbb...", "..b.b...", "..b.b...", "..b.b..."],
    ["s.....s.", ".s.g.s..", "..ggg...", "..gss...", "...ss...", "..bbb...", "..bbb...", "..b.b...", ".b...b..", ".b...b.."],
  ],
  float: [
    ["..rrrr..", ".rwrrwr.", "rrrrrrrr", "...e....", "...e....", "..ses...", "..ggg...", "..gss...", "...ss...", "..bbb...", "..bbb...", "..b.b...", "..b.b...", "..b.b..."],
    ["...rrrr.", "..rwrrwr", ".rrrrrrr", "....e...", "....e...", "..sse...", "..ggg...", "..gss...", "...ss...", "..bbb...", "..bbb...", "..b.b...", ".b..b...", ".b..b..."],
  ],
  climb: [
    [".....s..", "....gs..", "...ggg..", "...gss..", "....ss..", "...bbb..", "...bbs..", "...bb...", "...b.b..", "...b.b.."],
    ["........", ".....s..", "...ggs..", "...ggg..", "...gss..", "....ss..", "...bbbs.", "...bb...", "...bbb..", "...b..b."],
  ],
  hoist: [
    ["........", "........", "........", "........", "...gg...", "..gggs..", "..gsss..", "..bbbss.", "..bbb...", "...bb..."],
    ["........", "........", "........", "........", "........", "....gg..", "...gggs.", "...gsss.", ".bbbbbs.", "bb......"],
  ],
  build: [
    ["...g....", "..ggg...", "..gss...", "...ss...", "..bbb...", "..bbbs..", "..bbbkk.", "..bbb...", "..b.b...", ".bb.bb.."],
    ["...g....", "..ggg...", "..gss...", "...ss...", "..bbb...", "..bbb...", "..bbbs..", "..bbbkk.", "..b.b...", ".bb.bb.."],
  ],
  shrug: [
    ["...g....", "..ggg...", "..gss...", "s..ss..s", ".sbbbbs.", "..bbb...", "..bbb...", "..b.b...", "..b.b...", "..b.b..."],
    ["...g....", "..ggg...", "s.gss..s", ".s.ss.s.", "..bbbb..", "..bbb...", "..bbb...", "..b.b...", "..b.b...", "..b.b..."],
  ],
  bash: [
    ["...g....", "..ggg...", "..gss...", "...ss...", "..bbb...", ".sbbb...", "..bbb...", "..b.b...", ".b...b..", ".b...b.."],
    ["...g....", "..ggg...", "..gss...", "...ss...", "..bbbs..", "..bbb.s.", "..bbb...", "..b.b...", ".b...b..", ".b...b.."],
    ["...g....", "..ggg...", "..gss...", "...ss...", "..bbbsss", "..bbb...", "..bbb...", "..b.b...", ".b...b..", ".b...b.."],
    ["...g....", "..ggg...", "..gss...", "...ss...", "..bbb...", "..bbbss.", "..bbb..s", "..b.b...", ".b...b..", ".b...b.."],
  ],
  mine: [
    ["..ee....", ".e.k....", "...kg...", "..ksgg..", "...gss..", "...ss...", "..bbb...", "..bbb...", "..b.b...", ".b...b.."],
    ["....ee..", "...g.ke.", "..ggk...", "..gsk...", "...ss...", "..bbs...", "..bbb...", "..bbb...", "..b.b...", ".b...b.."],
    ["...g....", "..ggg...", "..gss...", "...ss...", "..bbbs..", "..bbb.k.", "..bbb..k", "..b.b..e", ".b...bee", ".b...b.."],
  ],
  dig: [
    ["...gg...", "..gggg..", "..ssss..", "...ss...", ".sbbbbs.", ".sbbbbs.", "..bbbb..", "..b..b..", "..b..b..", "..b..b.."],
    ["...gg...", "..gggg..", "..ssss..", "...ss...", "..bbbb..", "..bbbb..", ".sbbbbs.", ".kb..bk.", "..b..b..", "..b..b.."],
  ],
  block: [
    ["...gg...", "..gggg..", "..ssss..", "...ss...", "ssbbbbss", "..bbbb..", "..bbbb..", "..b..b..", "..b..b..", "..b..b.."],
    ["...gg...", "..gggg..", "..ssss..", "s..ss..s", ".sbbbbs.", "..bbbb..", "..bbbb..", "..b..b..", "..b..b..", ".bb..bb."],
  ],
  jump: [
    [".s...s..", ".s.g.s..", "..ggg...", "..gss...", "...ss...", "..bbb...", "..bbb...", "..b.b...", "..b.b...", "........"],
  ],
  ohno: [
    ["..sggs..", ".s.gg.s.", "..ssss..", "...ss...", "..bbbb..", "..bbbb..", "..bbbb..", "..b..b..", "..b..b..", "..b..b.."],
    [".s.gg.s.", "..sggs..", "..ssss..", "...ss...", "..bbbb..", "..bbbb..", "..bbbb..", "..b..b..", "..b..b..", ".bb..bb."],
  ],
  exit: [
    ["s......s", ".s.gg.s.", "..gggg..", "..ssss..", "...ss...", "..bbbb..", "..bbbb..", "..b..b..", "..b..b..", "..b..b.."],
    ["........", "s......s", ".s.gg.s.", "..gggg..", "..ssss..", "..bbbb..", "..bbbb..", "..bbbb..", "..b..b..", "..b..b.."],
    ["........", "........", "........", "s.....s.", ".s.gg.s.", "..gggg..", "..ssss..", "..bbbb..", "..bbbb..", "..b..b.."],
    ["........", "........", "........", "........", "........", "........", "s.gg..s.", ".sgggs..", "..ssss..", "..bbbb.."],
  ],
  splat: [
    ["........", "........", "........", "........", "........", "........", "..ggg...", ".sbbbs..", "bbbbbbb.", "sbb.bbs."],
    ["........", "........", "........", "........", "........", "........", "........", "........", ".gggbbs.", "bbbbbbbb"],
    ["........", "........", "........", "........", "........", "........", "........", "........", "r..g...r", "rbbbbbbr"],
  ],
  drown: [
    ["........", "........", "........", "........", "........", "........", "...s.s..", "...ggs..", "..ggss..", "..gsss.."],
    ["........", "........", "........", "........", "........", "........", "........", "....s...", "...gs...", "..ggs..."],
    ["........", "........", "........", "........", "........", "........", "........", "........", "....s...", "...ccc.."],
  ],
  pop: [
    ["........", "........", "...y....", "..yoy...", ".yorry..", "..yoy...", "...y....", "........", "........", "........"],
    ["y.....o.", "...r....", ".o..y..r", "..y.o...", "r..oyr.y", "..o..y..", ".y..r..o", "...o....", "o.....y.", "....r..."],
    ["o......y", "........", "r......o", "........", "y.......", ".......r", "........", "o.......", ".......y", "y......o"],
  ],
};

// The order of states in the GPU (S_* in shaders.js), and how fast each animates:
// the frame shown is (lemming.frame >> shift) % count.
export const STATE_ART = [
  [null, 0], ["walk", 0], ["fall", 1], ["float", 2], ["climb", 1], ["hoist", 2], ["build", 3], ["shrug", 2],
  ["bash", 2], ["mine", 3], ["dig", 2], ["block", 3], ["jump", 0], ["ohno", 2], ["exit", 1], ["splat", 2],
  ["drown", 2], ["pop", 2],
];

// 3x5 digits 0-9 for the bomber countdown, in palette white
const DIGITS = [
  ["www", "w w", "w w", "w w", "www"], [".w.", "ww.", ".w.", ".w.", "www"], ["www", "..w", "www", "w..", "www"],
  ["www", "..w", ".ww", "..w", "www"], ["w.w", "w.w", "www", "..w", "..w"], ["www", "w..", "www", "..w", "www"],
  ["www", "w..", "www", "w.w", "www"], ["www", "..w", ".w.", ".w.", ".w."], ["www", "w.w", "www", "w.w", "www"],
  ["www", "w.w", "www", "..w", "www"],
];

function packFrame(rows) {
  const out = new Uint32Array(16);
  const pad = 16 - rows.length;
  rows.forEach((r, y) => {
    let v = 0;
    for (let x = 0; x < 8; x++) v |= (KEY[r[x]] ?? 0) << (x * 4);
    out[pad + y] = v >>> 0;
  });
  return out;
}

// meta: per state [first frame, frame count, shift, 0]; frames: 16 u32 each; digitBase: first digit frame
export function buildSprites() {
  const frames = [], meta = new Uint32Array(STATE_ART.length * 4);
  STATE_ART.forEach(([name, shift], s) => {
    if (!name) return;
    meta[s * 4] = frames.length; meta[s * 4 + 1] = ART[name].length; meta[s * 4 + 2] = shift;
    for (const f of ART[name]) frames.push(packFrame(f));
  });
  const digitBase = frames.length;
  for (const d of DIGITS) frames.push(packFrame(d.map((r) => r.padEnd(8, "."))));
  const words = new Uint32Array(frames.length * 16);
  frames.forEach((f, i) => words.set(f, i * 16));
  return { meta, words, digitBase };
}

// draws a state's first frame onto a 2D canvas, for the skill buttons
export function drawIcon(ctx, name, scale = 3, frame = 0) {
  const rows = ART[name][frame % ART[name].length];
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const oy = ctx.canvas.height - rows.length * scale;
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    const c = PALETTE[KEY[ch]];
    if (!c) return;
    ctx.fillStyle = `rgb(${c})`;
    ctx.fillRect(x * scale, oy + y * scale, scale, scale);
  }));
}
