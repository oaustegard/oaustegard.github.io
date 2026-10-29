// Levels are drawn from shapes and pieces rather than stored as bitmaps. Each terrain pixel is a
// material (0 air, 1 earth, 2 steel, 3 brick, 4 decor) in its low byte and a palette colour in the
// next byte; colour 0 means the theme's own shaded earth. Decor is scenery lemmings pass through.
// Shapes paint in order, so a later shape carves or covers an earlier one.
//
// ground and masses (theme earth, material 1 unless given):
//   ["rect", x, y, w, h, mat]             ["ellipse", cx, cy, rx, ry, mat]
//   ["hills", x0, x1, top, amp, seed, bottom = H]      ground whose top wanders by ±amp
//   ["slab", x0, x1, top, bottom, seed]   a floating mass with a flat-ish top and a ragged underside
//   ["blob", cx, cy, rx, ry, seed, mat]   a lumpy ellipse; mat 0 carves a cave
// drawn pieces, in their own colours; a last argument of 1 makes a piece decor:
//   ["column", cx, base, h, w, hue]       fluted column with plinth and capital, standing on row base - 1
//   ["arch", cx, base, h, w, hue]         two columns and a round arch
//   ["crystals", cx, base, size, hue, seed]          ["mushroom", cx, base, stem, cap, hue]
//   ["bricks", x, y, w, h, hue]           ["stalactites", x0, x1, seed, len]  under whatever is above
//   ["boulder", cx, cy, r, hue]           ["tree", cx, base, h, seed]   (always decor)
//   ["chain", x, y, len]                  ["vines", x0, x1, seed]   (always decor)
// Solid pieces standing on wavy ground should start a few rows into it, or walkers pass under them.
//
// hatches: [x, y] where lemmings drop from; exits: [x, y] the row a lemming stands in to leave;
// water: [x0, x1, top] kills anything at or below top between x0 and x1.

// earth, earth 2, grass, sky top, sky bottom, water, far ridge, near ridge, backdrop kind
// (0 mountains, 1 spires, 2 forest, 3 towers)
const THEMES = {
  earth: ["#7a4a24", "#a8743c", "#4caf3a", "#04061a", "#18204a", "#2a5bd8", "#161c40", "#0c1028", 0],
  rust: ["#7c3324", "#b3583a", "#6aa23c", "#0b0610", "#3a1a2a", "#2f6fd8", "#2c1626", "#1a0c18", 3],
  sand: ["#a8803e", "#d6b46a", "#8fc24a", "#06122a", "#2a5078", "#2a78d0", "#1e3858", "#12243e", 3],
  slate: ["#3c4a66", "#6a7fa8", "#9ad0e8", "#020308", "#121a34", "#3a8ae0", "#10183a", "#080e20", 1],
  candy: ["#a8467e", "#e07ab0", "#f4e070", "#140820", "#4a2050", "#40a0e8", "#30163a", "#1e0c26", 1],
  moss: ["#3e5a2a", "#6e8a3c", "#a8d65a", "#03080a", "#12302a", "#2a70c8", "#0e2622", "#061614", 2],
  autumn: ["#8a4a1c", "#c47a2c", "#e0a030", "#0c0608", "#4a2418", "#3060c0", "#2e1610", "#1a0a08", 2],
};

// hues for drawn pieces: shades dark, mid, light, highlight
const HUES = {
  marble: ["#7c7a86", "#b4b2bc", "#dcdae2", "#f4f2fa"],
  sandstone: ["#8a6a3a", "#c09858", "#e0c080", "#f6e2b0"],
  basalt: ["#262a36", "#3e4456", "#5a6278", "#808aa4"],
  redrock: ["#5e2418", "#8e3c28", "#b85a3a", "#de8a5e"],
  brick: ["#5a2018", "#8c3624", "#a84a30", "#c8b8a0"],
  ice: ["#2a5c9c", "#4a90d8", "#8cc8f4", "#e4f6ff"],
  amethyst: ["#4a1c78", "#7a3cb4", "#b070e4", "#ecd0ff"],
  toadstool: ["#7a1010", "#c42020", "#ee4a3a", "#fff4e8"],
  candycap: ["#8a1a5a", "#d0408c", "#f080b8", "#fff0f8"],
  stem: ["#a89878", "#d0c4a4", "#ece2c8", "#fffaf0"],
  wood: ["#3e2410", "#5e3a1c", "#7e5430", "#a07448"],
  leaf: ["#1c4a1a", "#2e7426", "#4ea034", "#90d060"],
  autumnleaf: ["#6a1e08", "#a8400e", "#d8701a", "#f8b040"],
  vine: ["#18401c", "#2a6a2c", "#48943c", "#80c060"],
  iron: ["#303438", "#50565c", "#7a8088", "#a8b0b8"],
};

export const LEVELS = [
  {
    name: "Straight down", hint: "The exit is underneath you. Pick the digger, then click a lemming on the island.",
    w: 800, h: 160, theme: "earth", count: 10, need: 50, rr: 50, minutes: 5,
    skills: { digger: 10 },
    hatches: [[180, 66]], exits: [[600, 147]],
    shapes: [
      ["blob", 6, 80, 30, 110, 3], ["blob", 796, 80, 28, 110, 4],
      ["hills", 24, 776, 147, 1, 1],
      ["slab", 90, 520, 92, 114, 2],
      ["stalactites", 110, 500, 5, 12, 1],
      ["vines", 100, 510, 8],
      ["column", 102, 93, 34, 12, "marble"],
      ["crystals", 508, 94, 18, "amethyst", 3],
      ["mushroom", 60, 150, 25, 18, "toadstool"],
      ["mushroom", 88, 150, 14, 10, "toadstool"],
      ["crystals", 742, 151, 24, "ice", 7],
      ["mushroom", 690, 147, 16, 12, "toadstool", 1],
      ["tree", 300, 147, 40, 4], ["tree", 450, 147, 34, 9],
    ],
  },
  {
    name: "Bridge over troubled water", hint: "A blocker holds the crowd back while a builder spans the gap. A bomber clears the blocker afterwards.",
    w: 800, h: 160, theme: "rust", count: 20, need: 70, rr: 40, minutes: 5,
    skills: { blocker: 1, builder: 4, bomber: 1 },
    hatches: [[90, 80]], exits: [[700, 105]], water: [[340, 352, 140]],
    shapes: [
      ["blob", 6, 80, 30, 110, 5], ["blob", 796, 80, 30, 110, 6],
      ["slab", 380, 640, 0, 16, 12],
      ["stalactites", 380, 640, 11, 14],
      ["hills", 24, 340, 110, 2, 3],
      ["rect", 340, 150, 12, 10],
      ["rect", 352, 106, 424, 54],
      ["arch", 200, 110, 46, 40, "redrock", 1],
      ["column", 140, 110, 30, 9, "redrock", 1],
      ["column", 290, 111, 22, 9, "redrock", 1],
      ["bricks", 620, 70, 120, 36, "brick", 1],
      ["column", 640, 106, 36, 10, "sandstone", 1], ["column", 760, 106, 36, 10, "sandstone", 1],
      ["chain", 470, 10, 40], ["chain", 520, 12, 26],
    ],
  },
  {
    name: "Bashful", hint: "Bashers tunnel sideways through anything but steel.",
    w: 960, h: 160, theme: "sand", count: 20, need: 85, rr: 50, minutes: 5,
    skills: { basher: 5 },
    hatches: [[100, 80]], exits: [[865, 115]],
    shapes: [
      ["blob", 6, 80, 30, 110, 7], ["blob", 954, 80, 30, 110, 8],
      ["arch", 390, 120, 50, 44, "sandstone", 1],
      ["arch", 610, 120, 44, 40, "sandstone", 1],
      ["column", 180, 121, 40, 10, "sandstone", 1],
      ["tree", 150, 121, 30, 3], ["tree", 790, 121, 26, 6],
      ["hills", 24, 936, 120, 2, 5],
      ["column", 277, 125, 70, 34, "sandstone"],
      ["column", 500, 125, 86, 40, "marble"],
      ["bricks", 700, 62, 30, 64, "brick"],
      ["rect", 840, 116, 50, 10],
      ["column", 845, 116, 30, 8, "marble", 1], ["column", 885, 116, 30, 8, "marble", 1],
    ],
  },
  {
    name: "Steel yourself", hint: "Nothing goes through steel. A miner who starts early enough goes under it.",
    w: 960, h: 160, theme: "slate", count: 20, need: 75, rr: 50, minutes: 5,
    skills: { basher: 2, miner: 3 },
    hatches: [[110, 76]], exits: [[800, 149]],
    shapes: [
      ["blob", 6, 80, 30, 110, 9], ["blob", 954, 80, 30, 110, 10],
      ["crystals", 210, 109, 26, "ice", 11, 1],
      ["crystals", 300, 109, 14, "amethyst", 12, 1],
      ["hills", 24, 936, 108, 1, 7],
      ["rect", 396, 126, 500, 24, 0],
      ["blob", 520, 128, 50, 6, 3, 0], ["blob", 700, 128, 80, 7, 4, 0],
      ["stalactites", 400, 890, 21, 9, 1],
      ["rect", 420, 52, 22, 66, 2],
      ["crystals", 560, 111, 30, "ice", 13],
      ["crystals", 680, 111, 18, "amethyst", 14],
      ["crystals", 884, 152, 26, "ice", 15],
      ["crystals", 640, 150, 9, "amethyst", 16, 1], ["crystals", 470, 150, 7, "ice", 17, 1],
      ["chain", 760, 127, 10],
    ],
  },
  {
    name: "Up, up and away", hint: "Climbers scale walls; floaters survive any fall. Some lemmings need both.",
    w: 800, h: 160, theme: "candy", count: 20, need: 80, rr: 30, minutes: 6,
    skills: { climber: 20, floater: 20 },
    hatches: [[120, 100]], exits: [[640, 151]],
    shapes: [
      ["blob", 6, 80, 30, 110, 11], ["blob", 794, 80, 30, 110, 12],
      ["mushroom", 200, 130, 26, 16, "candycap", 1],
      ["mushroom", 70, 130, 14, 10, "candycap", 1],
      ["mushroom", 460, 152, 50, 26, "candycap", 1],
      ["mushroom", 560, 152, 30, 16, "toadstool", 1],
      ["crystals", 410, 152, 12, "amethyst", 21, 1],
      ["rect", 24, 130, 300, 30],
      ["bricks", 300, 40, 24, 120, "candycap"],
      ["mushroom", 312, 41, 0, 14, "candycap", 1],
      ["rect", 324, 152, 452, 8],
      ["mushroom", 744, 154, 40, 20, "candycap"],
    ],
  },
  {
    name: "Odd jobs", hint: "Dig, build, block, bash. Keep the crowd off the bridge until it is finished.",
    w: 1280, h: 160, theme: "moss", count: 30, need: 60, rr: 30, minutes: 8,
    skills: { digger: 1, blocker: 1, builder: 3, bomber: 1, basher: 2 },
    hatches: [[80, 40]], exits: [[1150, 145]], water: [[560, 600, 152]],
    shapes: [
      ["blob", 6, 80, 30, 110, 13], ["blob", 1274, 80, 30, 110, 14],
      ["tree", 420, 150, 46, 7], ["tree", 690, 146, 40, 2], ["tree", 960, 146, 50, 5], ["tree", 1080, 146, 36, 8],
      ["hills", 24, 300, 70, 1, 11, 104],
      ["column", 308, 72, 66, 22, "basalt"],
      ["rect", 24, 128, 296, 32],
      ["rect", 320, 150, 240, 10],
      ["rect", 560, 156, 40, 4],
      ["rect", 600, 146, 656, 14],
      ["bricks", 800, 60, 40, 90, "basalt"],
      ["vines", 30, 296, 15],
      ["stalactites", 40, 290, 16, 8, 1],
      ["boulder", 1240, 138, 16, "basalt"],
      ["ellipse", 980, 146, 60, 6],
    ],
  },
  {
    name: "Exodus", hint: "Ten thousand lemmings, every one of them a GPU thread. Save a quarter of them.",
    w: 1920, h: 160, theme: "autumn", count: 10000, need: 25, rr: 99, minutes: 8, burst: 3,
    skills: { climber: 500, floater: 500, bomber: 500, blocker: 500, builder: 500, basher: 500, miner: 500, digger: 500 },
    hatches: [[150, 80], [260, 74], [370, 80], [480, 74], [590, 80], [700, 74], [810, 80], [920, 74]],
    exits: [[1740, 119], [1840, 119]], water: [[1240, 1252, 140]],
    shapes: [
      ["blob", 6, 80, 30, 110, 15], ["blob", 1914, 80, 30, 110, 16],
      ["tree", 100, 116, 50, 1], ["tree", 330, 114, 44, 2], ["tree", 540, 112, 56, 3], ["tree", 760, 114, 40, 4],
      ["tree", 1010, 114, 52, 5], ["tree", 1150, 114, 46, 6], ["tree", 1330, 112, 40, 7], ["tree", 1600, 112, 54, 8],
      ["arch", 1790, 120, 44, 46, "sandstone", 1],
      ["hills", 24, 1240, 112, 4, 13],
      ["ellipse", 620, 112, 50, 10],
      ["rect", 1240, 150, 12, 10],
      ["hills", 1252, 1896, 110, 3, 17],
      ["boulder", 1495, 96, 30, "redrock"],
      ["rect", 1680, 96, 216, 24, 0],
      ["rect", 1680, 120, 216, 40],
      ["mushroom", 1200, 113, 10, 9, "toadstool", 1], ["mushroom", 1380, 112, 8, 7, "toadstool", 1],
    ],
  },
];

function hexColor(h) {
  const v = parseInt(h.slice(1), 16);
  return ((v >> 16) & 255) | (((v >> 8) & 255) << 8) | ((v & 255) << 16);
}

export function themeWords(level) {
  const t = THEMES[level.theme] || THEMES.earth;
  return [...t.slice(0, 8).map(hexColor), t[8]];
}

function wander(x, seed) {
  return 0.55 * Math.sin(x * 0.021 + seed * 1.7) + 0.3 * Math.sin(x * 0.057 + seed * 3.1) + 0.15 * Math.sin(x * 0.13 + seed * 5.3);
}
// a small deterministic generator, so a level draws the same every time
function rnd(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

export function buildTerrain(level) {
  const W = level.w, H = level.h, t = new Uint32Array(W * H);
  const palette = [0], index = new Map();
  // the palette index of shade k (0 dark .. 3 highlight, fractions blend) of a hue
  const col = (hue, k) => {
    const h = HUES[hue] || HUES.marble;
    k = Math.max(0, Math.min(3, k));
    const lo = Math.floor(k), hi = Math.min(3, lo + 1), f = k - lo;
    const a = parseInt(h[lo].slice(1), 16), b = parseInt(h[hi].slice(1), 16);
    const ch = (s) => Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f) & 0xf8;
    const word = ch(16) | (ch(8) << 8) | (ch(0) << 16);
    if (!index.has(word)) {
      if (palette.length >= 256) return palette.length - 1;
      index.set(word, palette.length); palette.push(word);
    }
    return index.get(word);
  };
  const get = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? t[y * W + x] & 255 : 2);
  const put = (x, y, m, c = 0) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    t[y * W + x] = m ? m | (c << 8) : 0;
  };
  // decor never covers solid terrain
  const paint = (x, y, c, decor) => {
    if (!decor) { put(x, y, 1, c); return; }
    const m = get(Math.round(x), Math.round(y));
    if (m === 0 || m === 4) put(x, y, 4, c);
  };

  const shapes = {
    rect(x, y, w, h, m = 1) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(i, j, m); },
    ellipse(cx, cy, rx, ry, m = 1) {
      for (let j = Math.floor(cy - ry); j <= cy + ry; j++)
        for (let i = Math.floor(cx - rx); i <= cx + rx; i++)
          if (((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2 <= 1) put(i, j, m);
    },
    hills(x0, x1, top, amp, seed, bottom = H, m = 1) {
      for (let i = x0; i < x1; i++) {
        const y = Math.round(top + amp * wander(i, seed));
        for (let j = y; j < bottom; j++) put(i, j, m);
      }
    },
    slab(x0, x1, top, bottom, seed) {
      for (let i = x0; i < x1; i++) {
        const e = Math.min(i - x0, x1 - 1 - i), taper = e < 10 ? 10 - e : 0;
        const y0 = Math.round(top + 0.6 * wander(i, seed) + taper * 0.3);
        const y1 = Math.round(bottom + 3 * wander(i * 2.3, seed + 5) - taper * 1.1);
        for (let j = y0; j < y1; j++) put(i, j, 1);
      }
    },
    blob(cx, cy, rx, ry, seed, m = 1) {
      for (let j = Math.floor(cy - ry * 1.2); j <= cy + ry * 1.2; j++)
        for (let i = Math.floor(cx - rx * 1.2); i <= cx + rx * 1.2; i++) {
          const a = Math.atan2((j - cy) / ry, (i - cx) / rx);
          const r = 1 + 0.08 * Math.sin(a * 5 + seed) + 0.05 * Math.sin(a * 11 + seed * 2.7);
          if (((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2 <= r * r) put(i, j, m);
        }
    },
    column(cx, base, h, w, hue, decor = 0) {
      const half = w / 2;
      for (let j = 0; j < h; j++) {
        const plinth = j < 4, capital = j >= h - 5;
        const hw = plinth || capital ? half + 3 : half;
        for (let i = -Math.ceil(hw); i < hw; i++) {
          const u = (i + hw) / (2 * hw);
          let k = 2.4 - 4.4 * Math.abs(u - 0.38);
          if (!plinth && !capital && (i + 64) % 4 === 0) k -= 0.7;
          if (j === h - 5 || j === 3) k -= 0.8;
          paint(cx + i, base - 1 - j, col(hue, k), decor);
        }
      }
    },
    arch(cx, base, h, w, hue, decor = 0) {
      const pw = 8, r = w / 2, yc = base - h;
      shapes.column(cx - r + pw / 2, base, h, pw, hue, decor);
      shapes.column(cx + r - pw / 2, base, h, pw, hue, decor);
      for (let j = Math.floor(yc - r - 2); j <= yc; j++)
        for (let i = Math.floor(cx - r - 1); i <= cx + r + 1; i++) {
          const d = Math.hypot(i - cx, j - yc);
          if (d > r + 1 || d < r - 6) continue;
          const voussoir = Math.floor(Math.atan2(j - yc, i - cx) * 4) & 1;
          paint(i, j, col(hue, d > r - 1 ? 2.8 : d < r - 5 ? 0.8 : 1.6 + 0.5 * voussoir), decor);
        }
    },
    crystals(cx, base, size, hue, seed, decor = 0) {
      const r = rnd(seed + 100), n = 3 + Math.floor(r() * 3);
      for (let p = 0; p < n; p++) {
        const w = 3 + Math.floor(r() * (size / 4)), h = Math.round(size * (0.45 + 0.55 * r()));
        const ox = Math.round((r() - 0.5) * size * 0.9), lean = (r() - 0.5) * 0.5;
        for (let j = 0; j < h; j++) {
          const hw = w / 2 - Math.max(0, j - (h - w)) / 2;
          for (let i = -Math.ceil(hw); i < hw; i++) {
            const k = i === 0 && j > 2 ? 3 : i < -hw / 3 ? 2.6 : i > hw / 3 ? 0.6 : 1.6;
            paint(cx + ox + i + lean * j, base - 1 - j, col(hue, k), decor);
          }
        }
      }
    },
    mushroom(cx, base, stem, cap, hue, decor = 0) {
      const sw = Math.max(3, Math.round(cap / 3));
      for (let j = 0; j < stem; j++)
        for (let i = -Math.floor(sw / 2); i < Math.ceil(sw / 2); i++)
          paint(cx + i, base - 1 - j, col("stem", 2.2 - Math.abs(i + 0.5) / sw * 2.5), decor);
      const top = base - stem, ch = Math.round(cap * 0.75), r = rnd(cap * 7 + cx);
      const spots = Array.from({ length: Math.max(2, Math.round(cap / 4)) }, () => [cx + (r() - 0.5) * cap * 1.4, top - r() * ch * 0.8, 1 + r() * cap / 7]);
      for (let j = 0; j < ch + 2; j++)
        for (let i = -cap; i <= cap; i++) {
          if ((i / cap) ** 2 + (j / ch) ** 2 > 1) continue;
          const y = top - j + 1;
          let c = col(hue, 2.2 - 1.2 * (i / cap) - (j === 0 ? 1.4 : 0));
          if (j > 0 && spots.some(([sx, sy, sr]) => Math.hypot(cx + i - sx, y - sy) < sr)) c = col(hue, 3);
          paint(cx + i, y, c, decor);
        }
    },
    bricks(x, y, w, h, hue, decor = 0) {
      for (let j = 0; j < h; j++)
        for (let i = 0; i < w; i++) {
          const row = Math.floor(j / 4), off = row & 1 ? 4 : 0;
          const mortar = j % 4 === 3 || (i + off) % 8 === 7;
          const k = mortar ? 0.4 : 1.2 + 0.8 * (((Math.floor((i + off) / 8) * 7 + row * 3) % 5) / 4);
          paint(x + i, y + j, col(hue, k), decor);
        }
    },
    stalactites(x0, x1, seed, len, decor = 0) {
      const r = rnd(seed + 300);
      for (let x = x0; x < x1; x += 4 + Math.floor(r() * 9)) {
        let y = 0;
        while (y < H && get(x, y) !== 1) y++;
        while (y < H - 1 && get(x, y + 1) === 1) y++;
        if (y >= H - 1) continue;
        const l = Math.round(len * (0.3 + 0.7 * r())), w = 2 + Math.floor(r() * 3);
        for (let j = 1; j <= l; j++) {
          const hw = w * (1 - j / (l + 1));
          for (let i = -Math.ceil(hw); i <= hw; i++) paint(x + i, y + j, decor ? col("basalt", 1.5 - i / 3) : 0, decor);
        }
      }
    },
    boulder(cx, cy, rad, hue) {
      for (let j = -rad; j <= rad; j++)
        for (let i = -rad; i <= rad; i++) {
          const a = Math.atan2(j, i), rr = rad * (1 + 0.07 * Math.sin(a * 4 + cx) + 0.04 * Math.sin(a * 9 + cy));
          const d = Math.hypot(i, j);
          if (d > rr) continue;
          put(cx + i, cy + j, 1, col(hue, 1.5 + 1.5 * (-i - j) / (rad * 1.4) - (d / rr) ** 4));
        }
    },
    tree(cx, base, h, seed) {
      const r = rnd(seed + 500), leaf = level.theme === "autumn" ? "autumnleaf" : "leaf";
      for (let j = 0; j < h * 0.6; j++) {
        const hw = 2 + (j < 4 ? 2 - j / 2 : 0);
        for (let i = -Math.ceil(hw); i < hw; i++) paint(cx + i, base - 1 - j, col("wood", 1.6 - i / hw), 1);
      }
      const blobs = 4 + Math.floor(r() * 3);
      for (let b = 0; b < blobs; b++) {
        const bx = cx + (r() - 0.5) * h * 0.5, by = base - h * 0.55 - r() * h * 0.4, br = h * (0.16 + r() * 0.12);
        for (let j = -br; j <= br; j++)
          for (let i = -br; i <= br; i++) {
            if (i * i + j * j > br * br * (0.8 + 0.4 * r())) continue;
            paint(bx + i, by + j, col(leaf, 1.6 - (i + j) / br * 0.9 + (r() < 0.12 ? 1 : 0)), 1);
          }
      }
    },
    chain(x, y, len) {
      for (let j = 0; j < len; j++) {
        if (Math.floor(j / 4) & 1) paint(x, y + j, col("iron", j % 4 === 1 ? 2.5 : 1.5), 1);
        else for (const i of [-1, 1]) paint(x + i, y + j, col("iron", i < 0 ? 2.5 : 1), 1);
      }
    },
    vines(x0, x1, seed) {
      const r = rnd(seed + 700);
      for (let x = x0; x < x1; x += 2 + Math.floor(r() * 6)) {
        // hang from the underside of the lowest overhang above the ground
        let y = H - 1;
        while (y > 0 && get(x, y) !== 0) y--;
        while (y > 0 && get(x, y) === 0) y--;
        if (y <= 0) continue;
        const l = 3 + Math.floor(r() * 12);
        for (let j = 1; j <= l; j++) paint(x + (Math.sin(j * 0.6 + x) > 0.6 ? 1 : 0), y + j, col("vine", 1 + (j & 1) + (r() < 0.15 ? 1 : 0)), 1);
      }
    },
  };

  for (const [kind, ...a] of level.shapes) {
    if (!shapes[kind]) throw new Error("unknown shape " + kind);
    shapes[kind](...a);
  }
  // tufts of grass, as decor, on open theme earth
  const r = rnd(W + H);
  for (let x = 0; x < W; x++)
    for (let y = 4; y < H; y++)
      if (t[y * W + x] === 1 && get(x, y - 1) === 0 && r() < 0.35) {
        const l = 1 + Math.floor(r() * 3);
        for (let j = 1; j <= l && get(x, y - j) === 0; j++) put(x, y - j, 4, col("vine", j === l ? 3 : 2));
      }
  return { words: t, palette: Uint32Array.from(palette) };
}
