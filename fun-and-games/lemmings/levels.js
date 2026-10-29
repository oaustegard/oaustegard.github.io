// Levels are drawn from a few shapes rather than stored as bitmaps. Materials: 0 air, 1 earth,
// 2 steel (nothing digs it), 3 brick (what builders lay). Shapes paint in order, so a later shape
// with material 0 carves an earlier one.
//
//   ["rect", x, y, w, h, mat = 1]
//   ["ellipse", cx, cy, rx, ry, mat = 1]
//   ["hills", x0, x1, top, amp, seed, bottom = H, mat = 1]   ground whose top wanders by ±amp
//
// hatches: [x, y] where lemmings drop from; exits: [x, y] the row a lemming stands in to leave;
// water: [x0, x1, top] kills anything at or below top between x0 and x1.

const THEMES = {
  earth: ["#7a4a24", "#a8743c", "#4caf3a", "#05081a", "#14193a", "#2a5bd8"],
  rust: ["#7c3324", "#b3583a", "#5f9e3c", "#0b0610", "#2a1626", "#2f6fd8"],
  sand: ["#a8803e", "#d6b46a", "#8fc24a", "#081422", "#20406a", "#2a78d0"],
  slate: ["#3c4a66", "#6a7fa8", "#9ad0e8", "#020308", "#0e1428", "#3a8ae0"],
  candy: ["#a8467e", "#e07ab0", "#f4e070", "#100616", "#301a3e", "#40a0e8"],
  moss: ["#3e5a2a", "#6e8a3c", "#a8d65a", "#03080a", "#0e2422", "#2a70c8"],
  autumn: ["#8a4a1c", "#c47a2c", "#e0a030", "#0a0608", "#3a1e1a", "#3060c0"],
};

export const LEVELS = [
  {
    name: "Just dig!", hint: "Pick the digger, then click a lemming on the upper ledge.",
    w: 640, h: 160, theme: "earth", count: 10, need: 50, rr: 50, minutes: 5,
    skills: { digger: 10 },
    hatches: [[110, 70]], exits: [[470, 147]],
    shapes: [
      ["rect", 0, 0, 24, 160], ["rect", 616, 0, 24, 160],
      ["hills", 24, 616, 100, 2, 1, 118],
      ["rect", 24, 148, 592, 12],
      ["ellipse", 300, 118, 40, 4],
    ],
  },
  {
    name: "Bridge over troubled water", hint: "A blocker holds the crowd back while a builder spans the gap. A bomber clears the blocker afterwards.",
    w: 800, h: 160, theme: "rust", count: 20, need: 70, rr: 40, minutes: 5,
    skills: { blocker: 1, builder: 4, bomber: 1 },
    hatches: [[90, 80]], exits: [[700, 105]], water: [[340, 352, 140]],
    shapes: [
      ["rect", 0, 0, 24, 160], ["rect", 776, 0, 24, 160],
      ["hills", 24, 340, 110, 2, 3],
      ["rect", 340, 150, 12, 10],
      ["rect", 352, 106, 424, 54],
      ["ellipse", 560, 106, 60, 8, 0],
      ["rect", 520, 104, 80, 6],
    ],
  },
  {
    name: "Bashful", hint: "Bashers tunnel sideways through anything but steel.",
    w: 960, h: 160, theme: "sand", count: 20, need: 85, rr: 50, minutes: 5,
    skills: { basher: 5 },
    hatches: [[100, 80]], exits: [[865, 115]],
    shapes: [
      ["rect", 0, 0, 24, 160], ["rect", 936, 0, 24, 160],
      ["hills", 24, 936, 120, 2, 5],
      ["rect", 260, 56, 34, 70], ["ellipse", 277, 56, 17, 6],
      ["rect", 480, 40, 40, 86], ["ellipse", 500, 40, 20, 8],
      ["rect", 700, 64, 30, 62], ["ellipse", 715, 64, 15, 5],
      ["rect", 840, 116, 50, 10],
    ],
  },
  {
    name: "Steel yourself", hint: "Nothing goes through steel. A miner who starts early enough goes under it.",
    w: 960, h: 160, theme: "slate", count: 20, need: 75, rr: 50, minutes: 5,
    skills: { basher: 2, miner: 3 },
    hatches: [[110, 76]], exits: [[800, 149]],
    shapes: [
      ["rect", 0, 0, 24, 160], ["rect", 936, 0, 24, 160],
      ["hills", 24, 936, 108, 1, 7],
      ["rect", 396, 126, 500, 24, 0],
      ["ellipse", 520, 126, 50, 5, 0], ["ellipse", 700, 126, 80, 6, 0],
      ["rect", 420, 52, 22, 66, 2],
    ],
  },
  {
    name: "Up, up and away", hint: "Climbers scale walls; floaters survive any fall. Some lemmings need both.",
    w: 800, h: 160, theme: "candy", count: 20, need: 80, rr: 30, minutes: 6,
    skills: { climber: 20, floater: 20 },
    hatches: [[120, 100]], exits: [[640, 151]],
    shapes: [
      ["rect", 0, 0, 24, 160], ["rect", 776, 0, 24, 160],
      ["rect", 24, 130, 300, 30],
      ["rect", 300, 40, 24, 120], ["ellipse", 312, 40, 12, 4],
      ["rect", 324, 152, 452, 8],
      ["ellipse", 520, 152, 40, 6],
    ],
  },
  {
    name: "Odd jobs", hint: "Dig, build, block, bash. Keep the crowd off the bridge until it is finished.",
    w: 1280, h: 160, theme: "moss", count: 30, need: 60, rr: 30, minutes: 8,
    skills: { digger: 1, blocker: 1, builder: 3, bomber: 1, basher: 2 },
    hatches: [[80, 40]], exits: [[1150, 145]], water: [[560, 600, 152]],
    shapes: [
      ["rect", 0, 0, 24, 160], ["rect", 1256, 0, 24, 160],
      ["hills", 24, 300, 70, 1, 11, 104],
      ["rect", 296, 10, 24, 94], ["ellipse", 308, 10, 12, 5],
      ["rect", 24, 128, 296, 32],
      ["rect", 320, 150, 240, 10],
      ["rect", 560, 156, 40, 4],
      ["rect", 600, 146, 656, 14],
      ["rect", 800, 60, 40, 90], ["ellipse", 820, 60, 20, 8],
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
      ["rect", 0, 0, 24, 160], ["rect", 1896, 0, 24, 160],
      ["hills", 24, 1240, 112, 4, 13],
      ["ellipse", 620, 112, 50, 10],
      ["rect", 1240, 150, 12, 10],
      ["hills", 1252, 1896, 110, 3, 17],
      ["rect", 1480, 66, 30, 60], ["ellipse", 1495, 66, 15, 6],
      ["rect", 1680, 96, 216, 24, 0],
      ["rect", 1680, 120, 216, 40],
    ],
  },
];

function hexColor(h) {
  const v = parseInt(h.slice(1), 16);
  return ((v >> 16) & 255) | (((v >> 8) & 255) << 8) | ((v & 255) << 16);
}

export function themeWords(level) { return (THEMES[level.theme] || THEMES.earth).map(hexColor); }

function wander(x, seed) {
  return 0.55 * Math.sin(x * 0.021 + seed * 1.7) + 0.3 * Math.sin(x * 0.057 + seed * 3.1) + 0.15 * Math.sin(x * 0.13 + seed * 5.3);
}

export function buildTerrain(level) {
  const W = level.w, H = level.h, t = new Uint32Array(W * H);
  const put = (x, y, m) => { if (x >= 0 && x < W && y >= 0 && y < H) t[y * W + x] = m; };
  for (const [kind, ...a] of level.shapes) {
    if (kind === "rect") {
      const [x, y, w, h, m = 1] = a;
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(i, j, m);
    } else if (kind === "ellipse") {
      const [cx, cy, rx, ry, m = 1] = a;
      for (let j = Math.floor(cy - ry); j <= cy + ry; j++)
        for (let i = Math.floor(cx - rx); i <= cx + rx; i++)
          if (((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2 <= 1) put(i, j, m);
    } else if (kind === "hills") {
      const [x0, x1, top, amp, seed, bottom = H, m = 1] = a;
      for (let i = x0; i < x1; i++) {
        const y = Math.round(top + amp * wander(i, seed));
        for (let j = y; j < bottom; j++) put(i, j, m);
      }
    } else throw new Error("unknown shape " + kind);
  }
  return t;
}
