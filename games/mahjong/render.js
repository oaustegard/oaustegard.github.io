// Drawing: the tile-face atlas (Canvas 2D), the table layout, and two renderers that take the same
// sprite list: WebGPU (WGSL tiles and background scene) and a flat Canvas 2D fallback.
import { kindOf, rankOf, suitOf } from './rules.js';

export const TILE_ASPECT = 4 / 3;         // height / width of a tile face
const CELL_W = 96, CELL_H = 128, ATLAS_COLS = 8, ATLAS_ROWS = 6;
const ZH_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
export const CJK = '"Noto Serif SC", "Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", "PingFang SC", "Hiragino Mincho ProN", "WenQuanYi Zen Hei", serif';

const INK = '#1d2a4d', RED = '#b3241c', GREEN = '#1f6b3a', BLUE = '#1d4f8f';

// ---------- atlas ----------

export function buildAtlas() {
  const cv = document.createElement('canvas');
  cv.width = CELL_W * ATLAS_COLS;
  cv.height = CELL_H * ATLAS_ROWS;
  const g = cv.getContext('2d');
  for (let k = 0; k < 42; k++) {
    g.save();
    g.translate((k % ATLAS_COLS) * CELL_W, Math.floor(k / ATLAS_COLS) * CELL_H);
    g.beginPath(); g.rect(0, 0, CELL_W, CELL_H); g.clip();
    drawFace(g, k, CELL_W, CELL_H);
    g.restore();
  }
  return cv;
}

function glyph(g, ch, x, y, size, color, weight = 700) {
  g.fillStyle = color;
  g.font = `${weight} ${size}px ${CJK}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(ch, x, y);
}

function corner(g, text, color, w) {
  g.fillStyle = color;
  g.font = `700 ${Math.round(w * 0.16)}px "Fraunces", Georgia, serif`;
  g.textAlign = 'left';
  g.textBaseline = 'top';
  g.fillText(text, w * 0.07, w * 0.05);
}

function dot(g, x, y, r, color) {
  g.fillStyle = color;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f5efe0';
  g.beginPath(); g.arc(x, y, r * 0.72, 0, Math.PI * 2); g.fill();
  g.fillStyle = color;
  g.beginPath(); g.arc(x, y, r * 0.52, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#f5efe0'; g.lineWidth = r * 0.12;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.18, y + Math.sin(a) * r * 0.18);
    g.lineTo(x + Math.cos(a) * r * 0.46, y + Math.sin(a) * r * 0.46); g.stroke();
  }
  g.fillStyle = '#f5efe0';
  g.beginPath(); g.arc(x, y, r * 0.14, 0, Math.PI * 2); g.fill();
}

function stick(g, x, y, w, h, color) {
  const r = w / 2;
  g.fillStyle = color;
  g.beginPath(); g.roundRect(x - r, y - h / 2, w, h, r); g.fill();
  g.fillStyle = '#f5efe0';
  g.fillRect(x - r * 0.18, y - h / 2 + h * 0.16, r * 0.36, h * 0.68);
  g.fillStyle = color;
  for (const t of [-0.5, 0, 0.5]) { g.fillRect(x - r * 1.15, y + t * h * 0.82 - h * 0.035, r * 2.3, h * 0.07); }
}

const DOT_LAYOUT = {
  1: [[0.5, 0.5]],
  2: [[0.5, 0.27], [0.5, 0.73]],
  3: [[0.24, 0.22], [0.5, 0.5], [0.76, 0.78]],
  4: [[0.28, 0.27], [0.72, 0.27], [0.28, 0.73], [0.72, 0.73]],
  5: [[0.26, 0.22], [0.74, 0.22], [0.5, 0.5], [0.26, 0.78], [0.74, 0.78]],
  6: [[0.3, 0.18], [0.7, 0.18], [0.3, 0.52], [0.7, 0.52], [0.3, 0.82], [0.7, 0.82]],
  7: [[0.22, 0.14], [0.5, 0.26], [0.78, 0.38], [0.3, 0.6], [0.7, 0.6], [0.3, 0.84], [0.7, 0.84]],
  8: [[0.3, 0.13], [0.7, 0.13], [0.3, 0.38], [0.7, 0.38], [0.3, 0.62], [0.7, 0.62], [0.3, 0.87], [0.7, 0.87]],
  9: [[0.2, 0.18], [0.5, 0.18], [0.8, 0.18], [0.2, 0.5], [0.5, 0.5], [0.8, 0.5], [0.2, 0.82], [0.5, 0.82], [0.8, 0.82]],
};
function dotColor(n, i) {
  if (n === 1) return RED;
  if (n === 2) return i === 0 ? GREEN : BLUE;
  if (n === 3) return [BLUE, RED, GREEN][i];
  if (n === 4) return i === 0 || i === 3 ? BLUE : GREEN;
  if (n === 5) return i === 2 ? RED : (i === 0 || i === 4 ? BLUE : GREEN);
  if (n === 6) return i < 2 ? GREEN : RED;
  if (n === 7) return i < 3 ? GREEN : RED;
  if (n === 8) return BLUE;
  return [BLUE, BLUE, BLUE, RED, RED, RED, GREEN, GREEN, GREEN][i];
}
const STICK_LAYOUT = {
  2: [[0.5, 0.28], [0.5, 0.72]],
  3: [[0.5, 0.28], [0.3, 0.72], [0.7, 0.72]],
  4: [[0.3, 0.28], [0.7, 0.28], [0.3, 0.72], [0.7, 0.72]],
  5: [[0.24, 0.28], [0.76, 0.28], [0.5, 0.5], [0.24, 0.72], [0.76, 0.72]],
  6: [[0.22, 0.28], [0.5, 0.28], [0.78, 0.28], [0.22, 0.72], [0.5, 0.72], [0.78, 0.72]],
  7: [[0.5, 0.17], [0.22, 0.5], [0.5, 0.5], [0.78, 0.5], [0.22, 0.83], [0.5, 0.83], [0.78, 0.83]],
  8: [[0.17, 0.28], [0.39, 0.28], [0.61, 0.28], [0.83, 0.28], [0.17, 0.72], [0.39, 0.72], [0.61, 0.72], [0.83, 0.72]],
  9: [[0.22, 0.17], [0.5, 0.17], [0.78, 0.17], [0.22, 0.5], [0.5, 0.5], [0.78, 0.5], [0.22, 0.83], [0.5, 0.83], [0.78, 0.83]],
};
function stickColor(n, i) {
  if (n === 5 && i === 2) return RED;
  if (n === 7 && i === 0) return RED;
  if (n === 9 && i % 3 === 1) return RED;
  if (n === 8) return i % 2 ? BLUE : GREEN;
  return GREEN;
}

function bird(g, w, h) {
  // 一索: the sparrow on a bamboo stalk.
  const cx = w / 2, cy = h * 0.52;
  g.strokeStyle = GREEN; g.lineWidth = w * 0.05;
  g.beginPath(); g.moveTo(cx - w * 0.05, h * 0.92); g.quadraticCurveTo(cx - w * 0.12, cy, cx - w * 0.02, h * 0.18); g.stroke();
  g.fillStyle = GREEN;
  g.beginPath(); g.ellipse(cx + w * 0.04, cy + h * 0.04, w * 0.22, h * 0.13, -0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = BLUE;
  g.beginPath(); g.ellipse(cx + w * 0.1, cy - h * 0.0, w * 0.12, h * 0.07, -0.6, 0, Math.PI * 2); g.fill();
  g.fillStyle = RED;
  g.beginPath(); g.arc(cx + w * 0.2, cy - h * 0.13, w * 0.1, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(cx + w * 0.29, cy - h * 0.14); g.lineTo(cx + w * 0.38, cy - h * 0.11); g.lineTo(cx + w * 0.29, cy - h * 0.09); g.fill();
  g.fillStyle = '#f5efe0'; g.beginPath(); g.arc(cx + w * 0.22, cy - h * 0.145, w * 0.025, 0, Math.PI * 2); g.fill();
  g.fillStyle = RED;
  for (const [dx, dy, a] of [[-0.2, 0.16, 0.9], [-0.25, 0.1, 0.6], [-0.18, 0.22, 1.2]]) {
    g.beginPath(); g.ellipse(cx + dx * w, cy + dy * h, w * 0.16, h * 0.025, a, 0, Math.PI * 2); g.fill();
  }
}

function blossom(g, x, y, r, color) {
  g.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 - Math.PI / 2;
    g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.75, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#e8b33a'; g.beginPath(); g.arc(x, y, r * 0.5, 0, Math.PI * 2); g.fill();
}

function drawFace(g, k, w, h) {
  const pad = 0.1;
  if (k < 9) {
    const n = k + 1;
    glyph(g, ZH_NUM[k], w / 2, h * 0.3, w * 0.5, INK);
    glyph(g, '萬', w / 2, h * 0.7, w * 0.56, RED);
    corner(g, String(n), INK, w);
    return;
  }
  if (k < 18) {
    const n = k - 8;
    const pts = DOT_LAYOUT[n];
    const r = n === 1 ? w * 0.36 : n <= 3 ? w * 0.17 : n <= 5 ? w * 0.16 : n <= 7 ? w * 0.13 : n === 8 ? w * 0.115 : w * 0.125;
    pts.forEach(([px, py], i) => dot(g, w * (pad + px * (1 - 2 * pad)), h * (pad + py * (1 - 2 * pad)), r, dotColor(n, i)));
    if (n === 1) { g.strokeStyle = GREEN; g.lineWidth = w * 0.03; g.beginPath(); g.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); g.stroke(); }
    corner(g, String(n), INK, w);
    return;
  }
  if (k < 27) {
    const n = k - 17;
    if (n === 1) { bird(g, w, h); corner(g, '1', INK, w); return; }
    const pts = STICK_LAYOUT[n];
    const sh = n <= 6 ? h * 0.32 : h * 0.24;
    const sw = n === 8 ? w * 0.1 : w * 0.11;
    pts.forEach(([px, py], i) => stick(g, w * (pad + px * (1 - 2 * pad)), h * (pad + py * (1 - 2 * pad)), sw, sh, stickColor(n, i)));
    corner(g, String(n), INK, w);
    return;
  }
  if (k < 31) {
    glyph(g, '東南西北'[k - 27], w / 2, h * 0.53, w * 0.74, INK);
    corner(g, 'ESWN'[k - 27], INK, w);
    return;
  }
  if (k === 31) { glyph(g, '中', w / 2, h * 0.53, w * 0.78, RED); return; }
  if (k === 32) { glyph(g, '發', w / 2, h * 0.53, w * 0.76, GREEN); return; }
  if (k === 33) {
    g.strokeStyle = BLUE; g.lineWidth = w * 0.06;
    g.strokeRect(w * 0.2, h * 0.17, w * 0.6, h * 0.66);
    g.lineWidth = w * 0.025;
    g.strokeRect(w * 0.29, h * 0.25, w * 0.42, h * 0.5);
    return;
  }
  // Flowers 梅蘭菊竹 (red ink), seasons 春夏秋冬 (blue ink), numbered 1-4.
  const flower = k < 38;
  const i = (k - 34) % 4;
  const col = flower ? RED : BLUE;
  blossom(g, w * 0.3, h * 0.72, w * 0.08, flower ? '#c4476a' : '#3f7bc4');
  blossom(g, w * 0.66, h * 0.82, w * 0.06, flower ? '#d36b4a' : '#4aa0a8');
  glyph(g, (flower ? '梅蘭菊竹' : '春夏秋冬')[i], w / 2, h * 0.38, w * 0.58, col);
  g.fillStyle = col;
  g.font = `700 ${Math.round(w * 0.2)}px "Fraunces", Georgia, serif`;
  g.textAlign = 'right'; g.textBaseline = 'top';
  g.fillText(String(i + 1), w * 0.93, w * 0.04);
}

// ---------- layout ----------
// Every visible tile becomes a sprite: { key, k (atlas kind, -1 = face down), x, y, w, h, rot, flags, lift, spawn }.
export const F = { SELECTED: 1, FRESH: 2, CLAIMABLE: 4, DIM: 8, WIN: 16, DRAWN: 32, HOVER: 64, SWAY: 128, HINT: 256 };
const ROT = [0, -Math.PI / 2, Math.PI, Math.PI / 2];   // screen orientation of the player at relative seat 0..3

function rotAbout(cx, cy, x, y, a) {
  const c = Math.cos(a), s = Math.sin(a);
  const dx = x - cx, dy = y - cy;
  return [cx + dx * c - dy * s, cy + dx * s + dy * c];
}

// view: Hand.view(seat). ui: { selected, hover, claimKind, winHighlight }.
export function layoutTable(view, W, H, safe, ui = {}) {
  const portrait = H > W * 1.1;
  const m = 8;
  const topReserve = safe.top + (portrait ? 54 : 40);
  const tw = Math.min((W - 2 * 12) / 14.8, portrait ? 52 : Math.min(58, H * 0.1));
  const th = tw * TILE_ASPECT;
  const meldScale = portrait ? 0.78 : 0.82;
  const bottomBlock = safe.bottom + 10 + th + (portrait ? th * meldScale + 10 : 0) + 58;
  // dw: discard tile width. The centre box is cTB × cLR discard widths; each player's discards fill a zone
  // along one edge of it, `cols` long and `rows` deep. Portrait gives the side zones length and the
  // top/bottom zones depth (landscape the reverse), so the discard area fills the screen's shape.
  const [cTB, rTB, cLR, rLR] = portrait ? [6, 4, 8, 3] : [8, 3, 6, 4];
  const sideK = 0.78 * TILE_ASPECT + 0.3;
  const dwW = (W - 2 * m) / (cTB + 2 * rLR * TILE_ASPECT + 2 * sideK);
  const dwH = (H - topReserve - bottomBlock) / (cLR + 2 * rTB * TILE_ASPECT + sideK);
  const dw = Math.max(10, Math.min(dwW, dwH, 40));
  const dh = dw * TILE_ASPECT;
  const Bx = cTB * dw, By = cLR * dw;
  const Sx = Bx + 2 * rLR * dh, Sy = By + 2 * rTB * dh;
  const B = Math.min(Bx, By), S = Math.max(Sx, Sy);
  const strip = dw * 0.78 * TILE_ASPECT;  // opponent strip thickness
  const cx = W / 2;
  const freeTop = topReserve + strip + 6, freeBottom = H - bottomBlock;
  const cy = Math.max(freeTop + Sy / 2, Math.min((freeTop + freeBottom) / 2, freeBottom - Sy / 2));
  const zone = r => (r % 2 === 0 ? { L: Bx, D: By / 2, cols: cTB, rows: rTB, dist: Sy / 2 } : { L: By, D: Bx / 2, cols: cLR, rows: rLR, dist: Sx / 2 });
  const sprites = [];
  const me = view.seat;
  const rel = s => (s - me + 4) % 4;
  const last = view.lastDiscard?.id ?? view.pendingKong?.id;
  const over = view.phase === 'over';
  const winIds = new Set(over && view.result?.type === 'win' ? [...(view.players[view.result.winner].hand || []), ...view.players[view.result.winner].melds.flatMap(mm => mm.tiles.filter(t => t != null))] : []);
  const handAnchor = [];

  // Discards: six to a row from the centre box outward, rotated to face each player.
  for (const p of view.players) {
    const r = rel(p.seat);
    // A full zone widens its rows and shrinks its tiles, so the pile never leaves its zone.
    const z = zone(r);
    const perRow = Math.max(z.cols, Math.ceil(p.discards.length / z.rows));
    const sc = z.cols / perRow;
    p.discards.forEach((id, i) => {
      const row = Math.floor(i / perRow), col = i % perRow;
      let x = cx - z.L / 2 + (col + 0.5) * dw * sc, y = cy + z.D + (row + 0.5) * dh * sc;
      [x, y] = rotAbout(cx, cy, x, y, ROT[r]);
      let flags = 0;
      if (id === last) flags |= F.FRESH;
      if (ui.claimKind != null && id === last) flags |= F.CLAIMABLE;
      sprites.push({ key: 't' + id, k: kindOf(id), x, y, w: dw * sc, h: dh * sc, rot: ROT[r], flags, lift: 0, spawn: 'seat' + r });
    });
  }
  if (view.pendingKong) {
    const r = rel(view.pendingKong.seat);
    const [x, y] = rotAbout(cx, cy, cx, cy + B * 0.15, ROT[r]);
    sprites.push({ key: 't' + view.pendingKong.id, k: kindOf(view.pendingKong.id), x, y, w: dw * 1.2, h: dh * 1.2, rot: ROT[r], flags: F.FRESH | F.CLAIMABLE, lift: 0.4 });
  }

  // Opponents: concealed backs then melds then flowers along a strip outside the discard square.
  for (const p of view.players) {
    const r = rel(p.seat);
    if (r === 0) continue;
    const across = r === 2;
    const len = across ? Math.min(W - 2 * m, Sx + 2 * strip) : Sy;
    const dist = zone(r).dist + strip / 2 + 4;
    const items = [];
    const reveal = p.hand && over;
    const hidden = p.hand || new Array(p.handCount).fill(null);
    hidden.forEach((id, i) => items.push({ key: id != null ? 't' + id : `h${p.seat}-${i}`, k: reveal ? kindOf(id) : -1, flags: winIds.has(id) ? F.WIN : 0, gapBefore: 0 }));
    p.melds.forEach(md => md.tiles.forEach((id, i) => items.push({
      key: id != null ? 't' + id : `c${md.id}-${i}`, k: id != null ? kindOf(id) : -1, gapBefore: i === 0 ? 0.35 : 0, flags: winIds.has(id) ? F.WIN : 0,
    })));
    p.flowers.forEach((id, i) => items.push({ key: 't' + id, k: kindOf(id), gapBefore: i === 0 ? 0.35 : 0, small: true, flags: 0 }));
    const unit = dw * 0.78;
    const total = items.reduce((a, it) => a + (it.small ? 0.7 : 1) + it.gapBefore, 0);
    const sc = Math.min(unit, len / total);
    let x = cx - (total * sc) / 2;
    for (const it of items) {
      x += it.gapBefore * sc;
      const f = it.small ? 0.7 : 1;
      const px = x + (sc * f) / 2;
      x += sc * f;
      const [sx, sy] = rotAbout(cx, cy, cx + (px - cx), cy + dist, ROT[r]);
      sprites.push({ key: it.key, k: it.k, x: sx, y: sy, w: sc * f * 0.96, h: sc * f * 0.96 * TILE_ASPECT, rot: ROT[r], flags: it.flags, lift: 0 });
    }
    const [ax, ay] = rotAbout(cx, cy, cx, cy + dist, ROT[r]);
    handAnchor[r] = { x: ax, y: ay };
  }

  // Me: hand along the bottom, the drawn tile set apart, melds above (portrait) or to the right.
  const mine = view.players[me];
  const hand = mine.hand || [];
  const handY = H - safe.bottom - 10 - th / 2 - 50;
  const drawnGap = view.drawn != null ? 0.35 : 0;
  const meldTiles = [];
  mine.melds.forEach(md => md.tiles.forEach((id, i) => meldTiles.push({ id, md, i })));
  const meldW = tw * meldScale;
  let handLeft;
  const hitboxes = [];
  const handWidth = (hand.length + drawnGap) * tw;
  const sideMelds = !portrait && handWidth + (meldTiles.length + mine.melds.length * 0.3 + mine.flowers.length * 0.6) * meldW + 30 < W - 24;
  if (sideMelds) handLeft = (W - handWidth - (meldTiles.length + mine.melds.length * 0.3 + mine.flowers.length * 0.6) * meldW - 20) / 2;
  else handLeft = (W - handWidth) / 2;
  hand.forEach((id, i) => {
    const isDrawn = id === view.drawn && i === hand.length - 1;
    const x = handLeft + (i + (isDrawn ? drawnGap : 0) + 0.5) * tw;
    let flags = F.SWAY;
    if (ui.selected === id) flags |= F.SELECTED;
    if (ui.hover === id) flags |= F.HOVER;
    if (isDrawn) flags |= F.DRAWN;
    if (winIds.has(id)) flags |= F.WIN;
    if (ui.hint && ui.hint.includes(id)) flags |= F.HINT;
    const lift = ui.selected === id ? 1 : ui.hover === id ? 0.35 : 0;
    sprites.push({ key: 't' + id, k: kindOf(id), x, y: handY, w: tw * 0.97, h: th * 0.97, rot: 0, flags, lift, spawn: 'wall' });
    hitboxes.push({ id, x0: x - tw / 2, x1: x + tw / 2, y0: handY - th / 2 - th * 0.3, y1: handY + th / 2 });
  });
  {
    let x, y;
    if (sideMelds) { x = handLeft + handWidth + 20; y = handY + (th - meldW * TILE_ASPECT) / 2; }
    else {
      const tot = (meldTiles.length + mine.melds.length * 0.3 + mine.flowers.length * 0.6) * meldW;
      x = (W - tot) / 2; y = handY - th / 2 - 8 - meldW * TILE_ASPECT / 2;
    }
    let lastMeld = null;
    for (const { id, md, i } of meldTiles) {
      if (md !== lastMeld && lastMeld) x += meldW * 0.3;
      lastMeld = md;
      sprites.push({ key: id != null ? 't' + id : `c${md.id}-${i}`, k: id != null ? (md.concealed && (i === 0 || i === 3) ? -1 : kindOf(id)) : -1, x: x + meldW / 2, y, w: meldW * 0.96, h: meldW * 0.96 * TILE_ASPECT, rot: 0, flags: winIds.has(id) ? F.WIN : 0, lift: 0 });
      x += meldW;
    }
    if (mine.flowers.length) x += meldW * 0.3;
    for (const id of mine.flowers) {
      sprites.push({ key: 't' + id, k: kindOf(id), x: x + meldW * 0.3, y: y + meldW * 0.1, w: meldW * 0.58, h: meldW * 0.58 * TILE_ASPECT, rot: 0, flags: 0, lift: 0 });
      x += meldW * 0.6;
    }
  }
  handAnchor[0] = { x: W / 2, y: handY };

  const tableTop = Math.max(safe.top + 4, cy - Sy / 2 - strip - 14);
  const table = { x0: Math.max(4, cx - Sx / 2 - strip - 14), y0: tableTop, x1: Math.min(W - 4, cx + Sx / 2 + strip + 14), y1: Math.min(H - 4, H - safe.bottom - 4) };
  return { sprites, hitboxes, cx, cy, B, S, Bx, By, Sx, Sy, strip, dw, tw, th, handY, handLeft, handRight: handLeft + handWidth, table, handAnchor, portrait };
}

// ---------- shared animation state ----------

class Anim {
  constructor() { this.items = new Map(); this.t = 0; }
  update(sprites, anchors, dt) {
    this.t += dt;
    const seen = new Set();
    const out = [];
    const k = 1 - Math.exp(-dt * 14);
    for (const s of sprites) {
      seen.add(s.key);
      let a = this.items.get(s.key);
      if (!a) {
        let sx = s.x, sy = s.y;
        if (s.spawn && s.spawn.startsWith('seat') && anchors) { const an = anchors[+s.spawn[4]]; if (an) { sx = an.x; sy = an.y; } }
        else if (s.spawn === 'wall' && anchors) { sx = s.x; sy = s.y - s.h * 1.2; }
        a = { x: sx, y: sy, w: s.w, h: s.h, rot: s.rot, lift: s.lift, alpha: s.spawn ? 0 : 1, seed: hash(s.key) };
        this.items.set(s.key, a);
      }
      a.x += (s.x - a.x) * k; a.y += (s.y - a.y) * k;
      a.w += (s.w - a.w) * k; a.h += (s.h - a.h) * k;
      let dr = s.rot - a.rot; while (dr > Math.PI) dr -= 2 * Math.PI; while (dr < -Math.PI) dr += 2 * Math.PI;
      a.rot += dr * k;
      a.lift += (s.lift - a.lift) * (1 - Math.exp(-dt * 18));
      a.alpha += (1 - a.alpha) * (1 - Math.exp(-dt * 10));
      out.push({ ...s, x: a.x, y: a.y, w: a.w, h: a.h, rot: a.rot, lift: a.lift, alpha: a.alpha, seed: a.seed });
    }
    for (const key of this.items.keys()) if (!seen.has(key)) this.items.delete(key);
    // Draw order: lower on screen and lifted tiles last, so they overlap correctly.
    out.sort((p, q) => (p.lift > 0.05) - (q.lift > 0.05) || p.y - q.y);
    return out;
  }
}
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 10000) / 10000; }

// ---------- WebGPU ----------

const WGSL_COMMON = /* wgsl */`
struct U {
  res: vec2f, time: f32, dpr: f32,
  light: vec2f, turn: vec2f,
  table: vec4f,
  sq: vec4f,
  grid: vec4f,
};
@group(0) @binding(0) var<uniform> u: U;

fn sq(x: f32) -> f32 { return x * x; }
fn hash2(p: vec2f) -> f32 { return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453); }
fn noise(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2f(1, 0)), w.x), mix(hash2(i + vec2f(0, 1)), hash2(i + vec2f(1, 1)), w.x), w.y);
}
fn fbm(p0: vec2f) -> f32 {
  var p = p0; var a = 0.5; var s = 0.0;
  for (var i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + vec2f(1.7, 9.2); a *= 0.5; }
  return s;
}
fn sdBox(p: vec2f, b: vec2f, r: f32) -> f32 {
  let q = abs(p) - b + vec2f(r);
  return length(max(q, vec2f(0))) + min(max(q.x, q.y), 0.0) - r;
}
`;

// The room: a moonlit ink-wash landscape (山水) behind a rosewood table with a jade felt top.
const WGSL_BG = WGSL_COMMON + /* wgsl */`
@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let p = array<vec2f, 3>(vec2f(-1, -3), vec2f(-1, 1), vec2f(3, 1));
  return vec4f(p[i], 0, 1);
}

fn horizon() -> f32 {
  let wide = (u.table.z - u.table.x) > u.res.x * 0.8;
  return select(u.res.y, clamp(u.table.y + 24.0, u.res.y * 0.25, u.res.y), wide);
}
fn ridge(x: f32, seed: f32, scale: f32) -> f32 {
  return fbm(vec2f(x * scale + seed, seed * 3.1)) ;
}

fn scene(px: vec2f) -> vec3f {
  let uv = px / u.res;
  let t = u.time;
  // Night sky: indigo at the top to a smoky plum near the hills, with paper grain.
  var col = mix(vec3f(0.07, 0.08, 0.16), vec3f(0.24, 0.17, 0.24), smoothstep(0.0, 0.85, uv.y));
  // Moon with a soft halo, upper right.
  // The horizon sits at the table's top edge when the table fills the width (portrait), else low on screen.
  let wide = (u.table.z - u.table.x) > u.res.x * 0.8;
  let mc = vec2f(select((u.table.z + u.res.x) * 0.5, u.res.x * 0.74, wide), clamp(horizon() * 0.24, 40.0, 150.0));
  let md = length(px - mc);
  let mr = clamp(min(u.res.x, u.res.y) * 0.06, 22.0, 60.0);
  col += vec3f(0.9, 0.85, 0.7) * 0.22 * exp(-md / (mr * 2.6));
  let moon = smoothstep(mr, mr - 1.5, md);
  let crater = fbm((px - mc) / mr * 2.2) * 0.18;
  col = mix(col, vec3f(0.96, 0.92, 0.8) - crater, moon);
  // Stars, faint.
  let sp = floor(px / 3.0);
  let st = step(0.9985, hash2(sp)) * (0.5 + 0.5 * sin(t * 1.3 + hash2(sp + 7.0) * 40.0)) * (1.0 - smoothstep(0.1, 0.6, uv.y));
  col += vec3f(st * 0.6);
  // Mountains: four ink-wash layers, far ones pale and misty, near ones dark.
  let base = horizon();
  for (var l = 0; l < 4; l++) {
    let fl = f32(l);
    let sc = 2.2 - fl * 0.35;
    let h = base * (0.38 - fl * 0.08) + ridge(uv.x * (u.res.x / u.res.y), fl * 13.7, sc) * base * (0.26 - fl * 0.04)
      + sin(uv.x * 3.0 + fl) * base * 0.03;
    let y = base - px.y;
    let inside = smoothstep(h + 1.5, h - 1.5, y);
    // Ink wash: darker at the ridge, fading downward into mist, with brush texture.
    let depth = clamp((h - y) / (base * 0.25), 0.0, 1.0);
    let ink = mix(vec3f(0.22, 0.2, 0.3), vec3f(0.035, 0.04, 0.07), fl / 3.0);
    let wash = mix(ink * 0.85, ink + vec3f(0.12, 0.1, 0.14) * (1.0 - fl / 3.0), smoothstep(0.0, 1.0, depth));
    let brush = fbm(vec2f(px.x * 0.02, px.y * 0.09) + fl * 5.0) * 0.08;
    col = mix(col, wash - brush, inside);
    // Mist band that drifts slowly along the foot of each layer.
    let mist = fbm(vec2f(px.x * 0.004 + t * (0.01 + fl * 0.006), px.y * 0.012 - fl)) ;
    let band = exp(-sq((y - h * 0.62) / (base * 0.06)));
    col = mix(col, vec3f(0.55, 0.5, 0.58), band * mist * 0.32 * (1.0 - fl * 0.18));
  }
  // A pagoda on the second ridge.
  let pg = vec2f(u.res.x * 0.22, base - (base * 0.30 + ridge((u.res.x * 0.22 / u.res.y), 13.7, 1.85) * base * 0.22));
  let q = px - pg;
  let s = base * 0.02;
  var pag = 1e5;
  for (var i = 0; i < 4; i++) {
    let fi = f32(i);
    pag = min(pag, sdBox(q + vec2f(0, s * (1.0 + fi * 1.6)), vec2f(s * (1.4 - fi * 0.22), s * 0.18), 0.0));
    pag = min(pag, sdBox(q + vec2f(0, s * (0.2 + fi * 1.6)), vec2f(s * (0.55 - fi * 0.08), s * 0.62), 0.0));
  }
  pag = min(pag, sdBox(q + vec2f(0, s * 7.2), vec2f(s * 0.06, s * 0.9), 0.0));
  col = mix(col, vec3f(0.05, 0.05, 0.08), smoothstep(1.0, -1.0, pag) * 0.85);
  // A warm window light in the pagoda.
  col += vec3f(1.0, 0.6, 0.25) * exp(-length(q + vec2f(0, s * 2.6)) / (s * 0.5)) * (0.5 + 0.1 * sin(t * 3.0));
  // Pine branch silhouette, top left.
  let bp = px - vec2f(0.0, 0.0);
  let branch = abs(bp.y - (30.0 + bp.x * 0.35 + sin(bp.x * 0.03) * 12.0)) - (6.0 - bp.x * 0.012);
  let needles = fbm(bp * vec2f(0.08, 0.05));
  let tuft = 0.0
    + smoothstep(46.0, 40.0, length((bp - vec2f(90.0, 58.0)) * vec2f(0.7, 1.3))) * smoothstep(0.35, 0.55, needles)
    + smoothstep(40.0, 34.0, length((bp - vec2f(170.0, 92.0)) * vec2f(0.7, 1.4))) * smoothstep(0.35, 0.55, needles);
  let pine = max(smoothstep(1.0, -1.0, branch) * step(bp.x, 220.0), min(tuft, 1.0));
  col = mix(col, vec3f(0.03, 0.035, 0.05), pine * 0.9);
  // Drifting petals.
  for (var j = 0; j < 3; j++) {
    let fj = f32(j);
    let cell = 140.0 + fj * 40.0;
    let pp = px + vec2f(-t * (12.0 + fj * 5.0), -t * (18.0 + fj * 4.0));
    let id = floor(pp / cell);
    let o = vec2f(hash2(id + fj), hash2(id + fj + 3.0)) * cell;
    let lp = pp - id * cell - o;
    let a = t * (0.6 + hash2(id) * 0.8) + hash2(id) * 6.0;
    let rp = vec2f(lp.x * cos(a) - lp.y * sin(a), lp.x * sin(a) + lp.y * cos(a));
    let petal = length(rp * vec2f(1.0, 2.2)) - 3.2;
    let show = step(0.55, hash2(id + 11.0));
    col = mix(col, vec3f(0.93, 0.62, 0.7), smoothstep(1.0, -1.0, petal) * show * 0.75);
  }
  return col;
}

fn tableCol(px: vec2f, col0: vec3f) -> vec3f {
  let tb = u.table;
  let c = (tb.xy + tb.zw) * 0.5;
  let hs = (tb.zw - tb.xy) * 0.5;
  let rim = clamp(min(hs.x, hs.y) * 0.06, 8.0, 18.0);
  let d = sdBox(px - c, hs, rim + 4.0);
  var col = col0;
  // Shadow of the table on the scene.
  col *= 1.0 - 0.6 * exp(-max(d, 0.0) / 14.0) * step(0.0, d);
  if (d > 0.0) { return col; }
  // Rosewood rim: stretched grain along the edge, a lacquer highlight, brass corners.
  let inner = d + rim;
  let edgeDir = select(vec2f(px.y, px.x), vec2f(px.x, px.y), abs(px.x - c.x) / hs.x < abs(px.y - c.y) / hs.y);
  let grain = fbm(vec2f(edgeDir.x * 0.02, edgeDir.y * 0.6)) * 0.5 + fbm(vec2f(edgeDir.x * 0.08, edgeDir.y * 1.7)) * 0.25;
  var wood = mix(vec3f(0.22, 0.07, 0.04), vec3f(0.42, 0.15, 0.08), grain);
  let lac = exp(-sq((-d - rim * 0.35) / (rim * 0.18)));
  wood += vec3f(0.35, 0.22, 0.15) * lac * (0.6 + 0.4 * sin(t_light(px)));
  if (inner > 0.0) {
    // Corner brass caps.
    let cq = abs(px - c) - hs + vec2f(rim * 1.6);
    let corner = step(0.0, cq.x) * step(0.0, cq.y);
    wood = mix(wood, vec3f(0.62, 0.45, 0.2) * (0.8 + 0.4 * fbm(px * 0.2)), corner * 0.8);
    return wood;
  }
  // Felt: deep jade with fabric texture, a lamp pool at the centre, a gold fret line inside the rim.
  let f = fbm(px * 0.5) * 0.06 + fbm(px * 0.05) * 0.06;
  let lamp = exp(-length((px - u.sq.xy) / max(hs.x, hs.y)) * 1.6);
  let flick = 0.96 + 0.04 * sin(u.time * 2.3) * sin(u.time * 3.7 + 1.0);
  var felt = mix(vec3f(0.03, 0.14, 0.11), vec3f(0.09, 0.36, 0.27), lamp * flick) + vec3f(f);
  // Cloud motif (祥雲): faint spirals in the felt pile.
  let cp = (px - u.sq.xy) / 46.0;
  let ci = floor(cp + 0.5);
  let cl = cp - ci;
  let ang = atan2(cl.y, cl.x);
  let rr = length(cl);
  let spiral = abs(fract(rr * 3.0 - ang / 6.2832 + 0.5 * hash2(ci)) - 0.5);
  felt += vec3f(0.0, 0.025, 0.02) * smoothstep(0.08, 0.0, spiral) * smoothstep(0.42, 0.2, rr) * step(0.5, hash2(ci + 3.0));
  // Fret (回紋) line just inside the rim.
  let fd = abs(inner + 10.0);
  felt = mix(felt, vec3f(0.62, 0.5, 0.25), smoothstep(1.2, 0.2, fd) * 0.55);
  // Turn glow on the edge facing the player to move.
  let tdir = u.turn;
  if (length(tdir) > 0.5) {
    let toward = dot(normalize(px - u.sq.xy + vec2f(0.001)), tdir);
    felt += vec3f(0.5, 0.42, 0.18) * smoothstep(0.75, 1.0, toward) * exp(inner / 50.0) * (0.55 + 0.25 * sin(u.time * 2.5));
  }
  // Centre box: a slightly darker inlay with a thin gold rule.
  let cb = sdBox(px - u.sq.xy, u.sq.zw, 6.0);
  felt *= 1.0 - 0.18 * step(cb, 0.0);
  felt = mix(felt, vec3f(0.62, 0.5, 0.25), smoothstep(1.0, 0.0, abs(cb)) * 0.6);
  // Inner shadow under the rim.
  felt *= 1.0 - 0.45 * exp(inner / 8.0);
  return felt;
}
fn t_light(px: vec2f) -> f32 { return u.time * 0.4 + px.x * 0.004; }

@fragment fn fs(@builtin(position) fp: vec4f) -> @location(0) vec4f {
  let px = fp.xy / u.dpr;
  var col = scene(px);
  col = tableCol(px, col);
  // Vignette.
  let v = length((px / u.res - 0.5) * vec2f(1.0, 0.9));
  col *= 1.0 - 0.35 * smoothstep(0.4, 0.9, v);
  return vec4f(col, 1.0);
}
`;

const WGSL_BLIT = /* wgsl */`
@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;
struct VO { @builtin(position) pos: vec4f, @location(0) uv: vec2f };
@vertex fn vs(@builtin(vertex_index) i: u32) -> VO {
  let p = array<vec2f, 3>(vec2f(-1, -3), vec2f(-1, 1), vec2f(3, 1));
  var o: VO; o.pos = vec4f(p[i], 0, 1); o.uv = p[i] * vec2f(0.5, -0.5) + 0.5; return o;
}
@fragment fn fs(in: VO) -> @location(0) vec4f { return textureSample(src, samp, in.uv); }
`;

// Tiles: one instanced draw. Each tile is a rounded box with thickness (ivory face over a jade back),
// a soft shadow that grows as the tile lifts, a bevel lit by a slowly moving lamp, the face art from the
// atlas, and a sheen that sweeps across now and then, phased per tile.
const WGSL_TILE = WGSL_COMMON + /* wgsl */`
@group(0) @binding(1) var atlas: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

struct VOut {
  @builtin(position) pos: vec4f,
  @location(0) local: vec2f,
  @location(1) @interpolate(flat) size: vec2f,
  @location(2) @interpolate(flat) misc: vec4f,   // k, flags, lift, seed
  @location(3) @interpolate(flat) misc2: vec4f,  // alpha, rot, down.x, down.y
};

@vertex fn vs(@builtin(vertex_index) vi: u32, @location(0) a: vec4f, @location(1) b: vec4f, @location(2) c: vec4f) -> VOut {
  let corners = array<vec2f, 6>(vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1), vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1));
  let size = a.zw;
  let rot = b.x;
  let lift = b.w;
  let seed = c.x;
  let flags = u32(b.z);
  let margin = vec2f(max(size.x, size.y) * 0.45 + 10.0);
  let local = corners[vi] * (size * 0.5 + margin);
  let cs = cos(rot); let sn = sin(rot);
  var world = a.xy + vec2f(local.x * cs - local.y * sn, local.x * sn + local.y * cs);
  // Lifted tiles rise toward the viewer (up the screen); hand tiles sway a little, each on its own phase.
  var bob = -lift * size.y * 0.22;
  if ((flags & 128u) != 0u) { bob += sin(u.time * 1.4 + seed * 6.283) * 0.7; }
  world.y += bob;
  var o: VOut;
  o.pos = vec4f(world / u.res * vec2f(2, -2) + vec2f(-1, 1), 0, 1);
  o.local = local;
  o.size = size;
  o.misc = vec4f(b.y, b.z, lift, seed);
  // Screen-down in the tile's own frame, for the thickness and shadow directions.
  o.misc2 = vec4f(c.y, rot, sn, cs);
  return o;
}

@fragment fn fs(in: VOut) -> @location(0) vec4f {
  let k = i32(in.misc.x);
  let flags = u32(in.misc.y);
  let lift = in.misc.z;
  let seed = in.misc.w;
  let alpha = in.misc2.x;
  let sn = in.misc2.z; let cs = in.misc2.w;
  let toLocal = mat2x2f(vec2f(cs, -sn), vec2f(sn, cs));   // rotate a screen vector into the tile frame
  let down = toLocal * vec2f(0.0, 1.0);
  let p = in.local;
  let hs = in.size * 0.5;
  let r = min(hs.x, hs.y) * 0.18;
  let thick = max(in.size.x * 0.16, 2.0);
  let faceDown = k < 0;
  var acc = vec4f(0.0);

  // Shadow: the whole tile body, offset from the lamp and softened by lift.
  let sh_off = toLocal * (vec2f(0.12, 0.35) * in.size.x * (0.35 + lift * 0.9));
  let bodyC = down * thick * 0.5;
  let bodyH = hs + abs(down) * thick * 0.5;
  let ds = sdBox(p - bodyC - sh_off, bodyH, r);
  let blur = 1.5 + in.size.x * (0.08 + lift * 0.18);
  let sa = (1.0 - smoothstep(-blur, blur, ds)) * (0.42 - lift * 0.1);
  acc = vec4f(0.0, 0.0, 0.0, sa);

  // Glow rings for selection / claimable / fresh discard / winning hand.
  let dBody = sdBox(p - bodyC, bodyH, r);
  var glowCol = vec3f(0.0); var glowA = 0.0;
  let pulse = 0.5 + 0.5 * sin(u.time * 4.0);
  if ((flags & 1u) != 0u) { glowCol = vec3f(1.0, 0.82, 0.35); glowA = 0.9; }
  else if ((flags & 4u) != 0u) { glowCol = vec3f(1.0, 0.75, 0.3); glowA = 0.5 + 0.4 * pulse; }
  else if ((flags & 2u) != 0u) { glowCol = vec3f(0.45, 1.0, 0.8); glowA = 0.35 + 0.3 * pulse; }
  else if ((flags & 16u) != 0u) { glowCol = vec3f(1.0, 0.85, 0.4); glowA = 0.55 + 0.25 * pulse; }
  else if ((flags & 256u) != 0u) { glowCol = vec3f(0.55, 0.85, 1.0); glowA = 0.35 + 0.25 * pulse; }
  if (glowA > 0.0) {
    let gw = 3.0 + in.size.x * 0.12;
    let g = exp(-max(dBody, 0.0) / gw) * step(0.0, dBody) * glowA;
    acc = vec4f(mix(acc.rgb, glowCol, g), max(acc.a, g));
  }

  // Body side (thickness band): ivory upper layer, jade lower layer (reversed when face down).
  if (dBody < 0.5) {
    let along = clamp(dot(p, down) / max(thick, 0.001), 0.0, 2.0);   // depth past the face edge
    let ivory = vec3f(0.86, 0.82, 0.72);
    let jade = vec3f(0.08, 0.42, 0.3);
    let top = select(ivory, jade, faceDown);
    let bot = select(jade, ivory, faceDown);
    let edgeT = dot(p, down) - (hs.x * abs(down.x) + hs.y * abs(down.y));
    var side = mix(top * 0.82, bot * 0.75, smoothstep(thick * 0.45, thick * 0.6, edgeT));
    side *= 0.85 + 0.15 * smoothstep(0.0, thick, edgeT);
    let aa = 1.0 - smoothstep(-0.5, 0.5, dBody);
    acc = vec4f(mix(acc.rgb, side, aa), max(acc.a, aa));
  }

  // Face.
  let df = sdBox(p, hs, r);
  if (df < 0.5) {
    let uv = p / in.size + 0.5;
    // Bevel: a lit rim from the box SDF gradient.
    let e = clamp(-df / (in.size.x * 0.11), 0.0, 1.0);
    let eps = 0.5;
    let n2 = normalize(vec2f(sdBox(p + vec2f(eps, 0), hs, r) - sdBox(p - vec2f(eps, 0), hs, r),
                             sdBox(p + vec2f(0, eps), hs, r) - sdBox(p - vec2f(0, eps), hs, r)) + vec2f(1e-5));
    let L = toLocal * u.light;
    let bevel = (1.0 - e) * dot(n2, -L) * 0.35;
    var face: vec3f;
    if (faceDown) {
      // Jade back with veins and a carved inner border.
      let vein = fbm(uv * vec2f(3.0, 4.0) + seed * 10.0);
      face = mix(vec3f(0.05, 0.33, 0.24), vec3f(0.16, 0.55, 0.4), vein);
      let ib = sdBox(p, hs * 0.72, r * 0.6);
      face *= 1.0 - 0.18 * smoothstep(1.2, 0.0, abs(ib));
    } else {
      // Ivory with a faint warm gradient and grain.
      face = mix(vec3f(0.98, 0.96, 0.9), vec3f(0.9, 0.86, 0.76), uv.y * 0.6 + fbm(uv * 9.0 + seed * 5.0) * 0.25);
      let cols = u.grid.x;
      let cell = vec2f(f32(k % i32(cols)), f32(k / i32(cols)));
      let inset = 0.07;
      let auv = (uv - 0.5) / (1.0 - 2.0 * inset) + 0.5;
      if (all(auv >= vec2f(0.0)) && all(auv <= vec2f(1.0))) {
        let t = textureSampleLevel(atlas, samp, (cell + auv) * u.grid.zw, 0.0);
        face = mix(face, t.rgb / max(t.a, 0.001), t.a);
      }
    }
    face += vec3f(bevel);
    face *= 0.92 + 0.08 * e;
    // Sheen: a narrow diagonal band crossing the face every few seconds.
    let period = 7.0 + seed * 5.0;
    let ph = fract(u.time / period + seed) * 3.0 - 1.0;
    let band = exp(-sq((uv.x + uv.y * 0.6) * 0.62 - ph) * 90.0);
    face += vec3f(1.0, 0.97, 0.88) * band * select(0.16, 0.1, faceDown);
    if ((flags & 32u) != 0u) { face += vec3f(0.08, 0.06, 0.0) * (0.6 + 0.4 * pulse); }
    if ((flags & 16u) != 0u) {
      let sweep = exp(-sq(uv.x - fract(u.time * 0.35 + seed * 0.2) * 1.6 + 0.3) * 30.0);
      face += vec3f(0.25, 0.18, 0.02) * sweep;
    }
    if ((flags & 8u) != 0u) { face *= 0.6; }
    let aa = 1.0 - smoothstep(-0.6, 0.6, df);
    acc = vec4f(mix(acc.rgb, face, aa), max(acc.a, aa));
  }
  return vec4f(acc.rgb * acc.a, acc.a) * alpha;
}
`;

export async function initGPU(canvas, atlasCanvas) {
  if (!navigator.gpu) return null;
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  const ctx = canvas.getContext('webgpu');
  const format = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({ device, format, alphaMode: 'opaque' });

  const ubuf = device.createBuffer({ size: 96, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const tex = device.createTexture({ size: [atlasCanvas.width, atlasCanvas.height], format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT });
  const uploadAtlas = cv => device.queue.copyExternalImageToTexture({ source: cv }, { texture: tex, premultipliedAlpha: true }, [cv.width, cv.height]);
  uploadAtlas(atlasCanvas);
  const samp = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });

  const bgMod = device.createShaderModule({ code: WGSL_BG });
  const tileMod = device.createShaderModule({ code: WGSL_TILE });
  for (const mod of [bgMod, tileMod]) {
    const info = await mod.getCompilationInfo();
    const errs = info.messages.filter(m => m.type === 'error');
    if (errs.length) throw new Error('WGSL: ' + errs.map(e => `${e.lineNum}:${e.linePos} ${e.message}`).join('; '));
  }
  const bgLayout = device.createBindGroupLayout({ entries: [{ binding: 0, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX, buffer: {} }] });
  const tileLayout = device.createBindGroupLayout({ entries: [
    { binding: 0, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX, buffer: {} },
    { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
    { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
  ] });
  const bgPipe = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bgLayout] }),
    vertex: { module: bgMod, entryPoint: 'vs' },
    fragment: { module: bgMod, entryPoint: 'fs', targets: [{ format }] },
  });
  const tilePipe = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [tileLayout] }),
    vertex: { module: tileMod, entryPoint: 'vs', buffers: [{ arrayStride: 48, stepMode: 'instance', attributes: [
      { shaderLocation: 0, offset: 0, format: 'float32x4' },
      { shaderLocation: 1, offset: 16, format: 'float32x4' },
      { shaderLocation: 2, offset: 32, format: 'float32x4' },
    ] }] },
    fragment: { module: tileMod, entryPoint: 'fs', targets: [{ format, blend: {
      color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
      alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
    } }] },
  });
  const bgBind = device.createBindGroup({ layout: bgLayout, entries: [{ binding: 0, resource: { buffer: ubuf } }] });
  // The scene shader is the costly pass (fbm per pixel), so it draws at half resolution and is stretched up.
  const blitMod = device.createShaderModule({ code: WGSL_BLIT });
  const blitLayout = device.createBindGroupLayout({ entries: [
    { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} }, { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
  ] });
  const blitPipe = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [blitLayout] }),
    vertex: { module: blitMod, entryPoint: 'vs' },
    fragment: { module: blitMod, entryPoint: 'fs', targets: [{ format }] },
  });
  let bgTex = null, blitBind = null;
  const BG_SCALE = 0.5;
  function makeBgTex() {
    if (bgTex) bgTex.destroy();
    bgTex = device.createTexture({ size: [Math.max(1, Math.round(canvas.width * BG_SCALE)), Math.max(1, Math.round(canvas.height * BG_SCALE))], format, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING });
    blitBind = device.createBindGroup({ layout: blitLayout, entries: [{ binding: 0, resource: bgTex.createView() }, { binding: 1, resource: samp }] });
  }
  const tileBind = device.createBindGroup({ layout: tileLayout, entries: [
    { binding: 0, resource: { buffer: ubuf } }, { binding: 1, resource: tex.createView() }, { binding: 2, resource: samp },
  ] });
  let ibuf = device.createBuffer({ size: 48 * 256, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
  let lost = false;
  device.lost.then(info => { lost = true; console.warn('WebGPU device lost', info.message); });

  const anim = new Anim();
  let W = 1, H = 1, dpr = 1;
  return {
    kind: 'webgpu',
    get lost() { return lost; },
    uploadAtlas,
    resize(w, h, d) { W = w; H = h; dpr = d; canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); makeBgTex(); },
    frame(layout, dt, time, turnDir) {
      if (!bgTex) makeBgTex();
      if (lost) return;
      const list = anim.update(layout.sprites, layout.handAnchor, dt);
      const la = time * 0.13;
      const u = new Float32Array(24);
      u.set([W, H, time, dpr * BG_SCALE, Math.cos(la) * 0.35 - 0.3, -0.85 + Math.sin(la) * 0.1, turnDir[0], turnDir[1],
        layout.table.x0, layout.table.y0, layout.table.x1, layout.table.y1,
        layout.cx, layout.cy, layout.Bx / 2, layout.By / 2,
        ATLAS_COLS, ATLAS_ROWS, CELL_W / atlasCanvas.width, CELL_H / atlasCanvas.height]);
      device.queue.writeBuffer(ubuf, 0, u);
      if (list.length * 48 > ibuf.size) { ibuf.destroy(); ibuf = device.createBuffer({ size: 48 * (list.length + 64), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST }); }
      const inst = new Float32Array(list.length * 12);
      list.forEach((s, i) => inst.set([s.x, s.y, s.w, s.h, s.rot, s.k, s.flags, s.lift, s.seed, s.alpha, 0, 0], i * 12));
      device.queue.writeBuffer(ibuf, 0, inst);
      const enc = device.createCommandEncoder();
      const bgPass = enc.beginRenderPass({ colorAttachments: [{ view: bgTex.createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } }] });
      bgPass.setPipeline(bgPipe); bgPass.setBindGroup(0, bgBind); bgPass.draw(3); bgPass.end();
      const pass = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } }] });
      pass.setPipeline(blitPipe); pass.setBindGroup(0, blitBind); pass.draw(3);
      if (list.length) { pass.setPipeline(tilePipe); pass.setBindGroup(0, tileBind); pass.setVertexBuffer(0, ibuf); pass.draw(6, list.length); }
      pass.end();
      device.queue.submit([enc.finish()]);
    },
  };
}

// ---------- Canvas 2D fallback ----------

export function init2D(canvas, atlasIn) {
  const g = canvas.getContext('2d');
  let atlasCanvas = atlasIn;
  const anim = new Anim();
  let W = 1, H = 1, dpr = 1;
  let bg = null;
  function paintBg(layout) {
    bg = document.createElement('canvas');
    bg.width = canvas.width; bg.height = canvas.height;
    const b = bg.getContext('2d');
    b.scale(dpr, dpr);
    const sky = b.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#12142a'); sky.addColorStop(1, '#3d2b3d');
    b.fillStyle = sky; b.fillRect(0, 0, W, H);
    b.fillStyle = '#f2ead0'; b.beginPath(); b.arc(W * 0.78, Math.min(H * 0.16, 150), 30, 0, 7); b.fill();
    for (let l = 0; l < 4; l++) {
      b.fillStyle = ['#463e52', '#302a3c', '#1c1a26', '#0b0c12'][l];
      b.beginPath(); b.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) {
        const y = H - H * (0.3 + l * 0.11) - Math.sin(x * 0.01 + l * 2) * H * 0.06 - Math.sin(x * 0.033 + l) * H * 0.03;
        b.lineTo(x, y);
      }
      b.lineTo(W, H); b.fill();
    }
    const t = layout.table;
    b.fillStyle = '#4a1a0e'; b.beginPath(); b.roundRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0, 16); b.fill();
    const felt = b.createRadialGradient(layout.cx, layout.cy, 10, layout.cx, layout.cy, Math.max(t.x1 - t.x0, t.y1 - t.y0) * 0.7);
    felt.addColorStop(0, '#176049'); felt.addColorStop(1, '#08261d');
    b.fillStyle = felt; b.beginPath(); b.roundRect(t.x0 + 12, t.y0 + 12, t.x1 - t.x0 - 24, t.y1 - t.y0 - 24, 8); b.fill();
    b.strokeStyle = 'rgba(160,128,64,0.6)'; b.lineWidth = 1;
    b.strokeRect(layout.cx - layout.Bx / 2, layout.cy - layout.By / 2, layout.Bx, layout.By);
  }
  let lastKey = '';
  return {
    kind: '2d',
    lost: false,
    uploadAtlas(cv) { atlasCanvas = cv; },
    resize(w, h, d) { W = w; H = h; dpr = d; canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); lastKey = ''; },
    frame(layout, dt, time) {
      const key = [layout.table.x0, layout.table.y0, layout.table.x1, layout.table.y1, W, H].map(Math.round).join(',');
      if (key !== lastKey) { paintBg(layout); lastKey = key; }
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(bg, 0, 0);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const list = anim.update(layout.sprites, layout.handAnchor, dt);
      for (const s of list) {
        g.save();
        g.globalAlpha = s.alpha;
        g.translate(s.x, s.y - s.lift * s.h * 0.22);
        g.rotate(s.rot);
        const w = s.w, h = s.h, r = w * 0.16, th = Math.max(w * 0.16, 2);
        g.fillStyle = 'rgba(0,0,0,0.35)';
        g.beginPath(); g.roundRect(-w / 2 + 2, -h / 2 + 4, w, h + th, r); g.fill();
        if (s.flags & (F.SELECTED | F.CLAIMABLE | F.FRESH | F.WIN | F.HINT)) {
          g.strokeStyle = s.flags & F.HINT && !(s.flags & F.SELECTED) ? 'rgba(140,210,255,0.85)' : s.flags & F.FRESH && !(s.flags & F.CLAIMABLE) ? 'rgba(110,255,200,0.8)' : 'rgba(255,200,90,0.9)';
          g.lineWidth = 3; g.beginPath(); g.roundRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + th + 4, r); g.stroke();
        }
        g.fillStyle = s.k < 0 ? '#e6dcc4' : '#11573f';
        g.beginPath(); g.roundRect(-w / 2, -h / 2 + th * 0.5, w, h + th * 0.5, r); g.fill();
        g.fillStyle = s.k < 0 ? '#1b6b4f' : '#f4efe1';
        g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.fill();
        if (s.k >= 0) {
          const cx = (s.k % ATLAS_COLS) * CELL_W, cy = Math.floor(s.k / ATLAS_COLS) * CELL_H;
          const inset = 0.07;
          g.drawImage(atlasCanvas, cx, cy, CELL_W, CELL_H, -w / 2 + w * inset, -h / 2 + h * inset, w * (1 - 2 * inset), h * (1 - 2 * inset));
        }
        if (s.flags & F.DIM) { g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.fill(); }
        g.restore();
      }
    },
  };
}
