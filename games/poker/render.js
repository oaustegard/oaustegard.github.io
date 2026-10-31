// Drawing for the poker table. Card faces, the card back, chips and the dealer button are painted once
// into an atlas with Canvas 2D. WebGPU then draws the room and the table in one full-screen pass (at half
// resolution) and every card and chip in one instanced pass; a Canvas 2D path draws the same layout
// where WebGPU is missing.
import { RANKS, SUIT_SYM } from './rules.js';

export const CELL_W = 128, CELL_H = 184, ATLAS_COLS = 8, ATLAS_ROWS = 8, ATLAS_MIPS = 5;
export const CARD_ASPECT = 1.4;                    // height / width
export const K_BACK = 52, K_CHIP = 53, K_BUTTON = 59;
export const CHIP_VALUES = [1000, 500, 100, 25, 5, 1];
const CHIP_COLORS = [['#d9a93a', '#5a3d07'], ['#6b3fa0', '#f0e6ff'], ['#1d1d22', '#e9e2cf'], ['#2e8b57', '#f2f0e6'], ['#c0342b', '#f8efe2'], ['#ece6d6', '#3060a0']];
export const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif';

export const F = { SELECTED: 1, FRESH: 2, WIN: 4, DIM: 8, PRIVATE: 16, CHIP: 32, HINT: 64, TURN: 128 };

// ---------- atlas ----------
export function atlasMips(cv) {
  const out = [cv];
  let src = cv;
  for (let l = 1; l < ATLAS_MIPS; l++) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, src.width >> 1); c.height = Math.max(1, src.height >> 1);
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
    g.drawImage(src, 0, 0, c.width, c.height);
    out.push(c); src = c;
  }
  return out;
}

const RED = '#b8202a', BLACK = '#17171c';
const suitColor = s => (s === 1 || s === 2 ? RED : BLACK);

function suitPath(g, s, x, y, size, color) {
  // Drawn as paths rather than glyphs so every platform gets the same pips.
  const r = size / 2;
  g.save(); g.translate(x, y); g.beginPath();
  if (s === 2) {        // heart
    g.moveTo(0, r * 0.9);
    g.bezierCurveTo(-r * 1.25, -r * 0.05, -r * 0.65, -r * 1.05, 0, -r * 0.42);
    g.bezierCurveTo(r * 0.65, -r * 1.05, r * 1.25, -r * 0.05, 0, r * 0.9);
  } else if (s === 1) { // diamond
    g.moveTo(0, -r); g.quadraticCurveTo(r * 0.35, -r * 0.3, r * 0.78, 0); g.quadraticCurveTo(r * 0.35, r * 0.3, 0, r);
    g.quadraticCurveTo(-r * 0.35, r * 0.3, -r * 0.78, 0); g.quadraticCurveTo(-r * 0.35, -r * 0.3, 0, -r);
  } else if (s === 3) { // spade
    g.moveTo(0, -r);
    g.bezierCurveTo(r * 0.3, -r * 0.5, r * 1.15, -r * 0.15, r * 0.85, r * 0.38);
    g.bezierCurveTo(r * 0.62, r * 0.72, r * 0.2, r * 0.6, r * 0.08, r * 0.38);
    g.quadraticCurveTo(r * 0.15, r * 0.85, r * 0.42, r);
    g.lineTo(-r * 0.42, r);
    g.quadraticCurveTo(-r * 0.15, r * 0.85, -r * 0.08, r * 0.38);
    g.bezierCurveTo(-r * 0.2, r * 0.6, -r * 0.62, r * 0.72, -r * 0.85, r * 0.38);
    g.bezierCurveTo(-r * 1.15, -r * 0.15, -r * 0.3, -r * 0.5, 0, -r);
  } else {              // club
    const b = r * 0.42;
    g.arc(0, -r * 0.48, b, 0, Math.PI * 2);
    g.moveTo(-r * 0.45 + b, r * 0.12); g.arc(-r * 0.45, r * 0.12, b, 0, Math.PI * 2);
    g.moveTo(r * 0.45 + b, r * 0.12); g.arc(r * 0.45, r * 0.12, b, 0, Math.PI * 2);
    g.moveTo(-r * 0.12, 0); g.quadraticCurveTo(-r * 0.1, r * 0.7, -r * 0.45, r); g.lineTo(r * 0.45, r); g.quadraticCurveTo(r * 0.1, r * 0.7, r * 0.12, 0);
  }
  g.fillStyle = color || suitColor(s); g.fill();
  g.restore();
}

// Pip positions for 2–10 on a unit card (x, y in 0..1).
const PIPS = {
  2: [[.5, .2], [.5, .8]], 3: [[.5, .2], [.5, .5], [.5, .8]],
  4: [[.3, .2], [.7, .2], [.3, .8], [.7, .8]], 5: [[.3, .2], [.7, .2], [.5, .5], [.3, .8], [.7, .8]],
  6: [[.3, .2], [.7, .2], [.3, .5], [.7, .5], [.3, .8], [.7, .8]],
  7: [[.3, .2], [.7, .2], [.5, .35], [.3, .5], [.7, .5], [.3, .8], [.7, .8]],
  8: [[.3, .2], [.7, .2], [.5, .35], [.3, .5], [.7, .5], [.5, .65], [.3, .8], [.7, .8]],
  9: [[.3, .2], [.7, .2], [.3, .4], [.7, .4], [.5, .5], [.3, .6], [.7, .6], [.3, .8], [.7, .8]],
  10: [[.3, .2], [.7, .2], [.5, .3], [.3, .4], [.7, .4], [.3, .6], [.7, .6], [.5, .7], [.3, .8], [.7, .8]],
};

function drawFace(g, c, w, h) {
  const r = c >> 2, s = c & 3, col = suitColor(s);
  const label = RANKS[r] === 'T' ? '10' : RANKS[r];
  g.fillStyle = '#fbf8f1'; g.fillRect(0, 0, w, h);
  // Corner indices, top left and (rotated) bottom right.
  const corner = () => {
    g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = `700 ${label === '10' ? 30 : 34}px ${SERIF}`;
    g.fillText(label, 21, 38);
    suitPath(g, s, 21, 55, 22);
  };
  corner();
  g.save(); g.translate(w, h); g.rotate(Math.PI); corner(); g.restore();
  const ix = 30, iy = 22, iw = w - 60, ih = h - 44;
  if (r >= 9 && r <= 11) {
    // Court cards: a framed panel with the letter and a large pip, mirrored like a printed court.
    const grad = g.createLinearGradient(0, iy, 0, iy + ih);
    grad.addColorStop(0, s === 1 || s === 2 ? '#f6e3d8' : '#e2e6ef'); grad.addColorStop(1, '#f3ead2');
    g.fillStyle = grad; g.fillRect(ix, iy, iw, ih);
    g.strokeStyle = '#b8902f'; g.lineWidth = 2.5; g.strokeRect(ix + 1, iy + 1, iw - 2, ih - 2);
    g.strokeStyle = col; g.lineWidth = 1; g.strokeRect(ix + 5, iy + 5, iw - 10, ih - 10);
    const half = () => {
      g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `700 54px ${SERIF}`; g.fillText(RANKS[r], w / 2, iy + ih * 0.27);
      suitPath(g, s, w / 2, iy + ih * 0.44, 22);
      // A crown, a coronet or a feather, simply.
      g.strokeStyle = '#b8902f'; g.lineWidth = 2; g.beginPath();
      if (r === 11) { g.moveTo(w / 2 - 16, iy + 14); g.lineTo(w / 2 - 10, iy + 6); g.lineTo(w / 2 - 4, iy + 14); g.lineTo(w / 2, iy + 4); g.lineTo(w / 2 + 4, iy + 14); g.lineTo(w / 2 + 10, iy + 6); g.lineTo(w / 2 + 16, iy + 14); }
      else if (r === 10) { g.arc(w / 2, iy + 13, 8, Math.PI, 0); g.moveTo(w / 2 - 12, iy + 13); g.lineTo(w / 2 + 12, iy + 13); }
      else { g.moveTo(w / 2 - 12, iy + 15); g.quadraticCurveTo(w / 2, iy + 2, w / 2 + 12, iy + 9); }
      g.stroke();
    };
    half();
    g.save(); g.translate(w, h); g.rotate(Math.PI); half(); g.restore();
    g.strokeStyle = 'rgba(184,144,47,0.6)'; g.beginPath(); g.moveTo(ix + 8, h / 2); g.lineTo(ix + iw - 8, h / 2); g.stroke();
  } else if (r === 12) {
    suitPath(g, s, w / 2, h / 2, s === 3 ? 74 : 52);
    if (s === 3) { g.strokeStyle = '#b8902f'; g.lineWidth = 2; g.beginPath(); g.arc(w / 2, h / 2 + 4, 46, 0, Math.PI * 2); g.stroke(); }
  } else {
    const n = r + 2;
    for (const [px, py] of PIPS[n]) {
      const x = ix + px * iw, y = iy + py * ih;
      if (py > 0.55) { g.save(); g.translate(x, y); g.rotate(Math.PI); suitPath(g, s, 0, 0, 26); g.restore(); }
      else suitPath(g, s, x, y, 26);
    }
  }
}

function drawBack(g, w, h) {
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#7a1420'); grad.addColorStop(1, '#3c0710');
  g.fillStyle = '#fbf8f1'; g.fillRect(0, 0, w, h);
  g.fillStyle = grad; g.fillRect(8, 8, w - 16, h - 16);
  // Lattice.
  g.save(); g.beginPath(); g.rect(12, 12, w - 24, h - 24); g.clip();
  g.strokeStyle = 'rgba(232,196,120,0.35)'; g.lineWidth = 1.2;
  for (let k = -h; k < w + h; k += 12) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke(); g.beginPath(); g.moveTo(k + h, 0); g.lineTo(k, h); g.stroke(); }
  g.restore();
  g.strokeStyle = '#e1b866'; g.lineWidth = 2; g.strokeRect(12, 12, w - 24, h - 24);
  g.fillStyle = '#3c0710'; g.beginPath(); g.ellipse(w / 2, h / 2, 30, 40, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#e1b866'; g.lineWidth = 2; g.stroke();
  suitPath(g, 3, w / 2, h / 2, 36, '#e1b866');
}

function drawChip(g, i, w, h) {
  const [base, stripe] = CHIP_COLORS[i];
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 2;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = base; g.fill();
  // Edge spots.
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
  g.fillStyle = stripe;
  for (let k = 0; k < 8; k++) { g.save(); g.translate(cx, cy); g.rotate(k * Math.PI / 4); g.fillRect(-7, -R - 2, 14, 18); g.restore(); }
  g.restore();
  g.beginPath(); g.arc(cx, cy, R * 0.68, 0, Math.PI * 2); g.fillStyle = base; g.fill();
  g.strokeStyle = stripe; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.arc(cx, cy, R * 0.6, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  g.fillStyle = stripe; g.textAlign = 'center'; g.textBaseline = 'middle';
  const v = CHIP_VALUES[i];
  g.font = `700 ${v >= 1000 ? 26 : 30}px ${SERIF}`; g.fillText(v >= 1000 ? '1K' : String(v), cx, cy + 1);
}

function drawButton(g, w, h) {
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 3;
  const grad = g.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 2, cx, cy, R);
  grad.addColorStop(0, '#ffffff'); grad.addColorStop(1, '#d6cfbf');
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = grad; g.fill();
  g.strokeStyle = '#8a6a2a'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#1b1b20'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${R * 0.95}px ${SERIF}`;
  g.fillText('D', cx, cy + 2);
}

export function buildAtlas() {
  const cv = document.createElement('canvas');
  cv.width = CELL_W * ATLAS_COLS; cv.height = CELL_H * ATLAS_ROWS;
  const g = cv.getContext('2d');
  const cell = (k, fn) => {
    g.save(); g.translate((k % ATLAS_COLS) * CELL_W, Math.floor(k / ATLAS_COLS) * CELL_H);
    g.beginPath(); g.rect(0, 0, CELL_W, CELL_H); g.clip();
    fn(); g.restore();
  };
  for (let c = 0; c < 52; c++) cell(c, () => drawFace(g, c, CELL_W, CELL_H));
  cell(K_BACK, () => drawBack(g, CELL_W, CELL_H));
  for (let i = 0; i < CHIP_VALUES.length; i++) cell(K_CHIP + i, () => { g.translate(0, (CELL_H - CELL_W) / 2); drawChip(g, i, CELL_W, CELL_W); });
  cell(K_BUTTON, () => { g.translate(0, (CELL_H - CELL_W) / 2); drawButton(g, CELL_W, CELL_W); });
  return cv;
}

// Atlas cell → image URL, for cards drawn in the DOM (results, hand history).
const urlCache = new Map();
export function cardURL(atlas, k) {
  if (urlCache.has(k)) return urlCache.get(k);
  const c = document.createElement('canvas'); c.width = CELL_W; c.height = CELL_H;
  const g = c.getContext('2d');
  g.beginPath(); g.roundRect(0, 0, CELL_W, CELL_H, 12); g.clip();
  g.drawImage(atlas, (k % ATLAS_COLS) * CELL_W, Math.floor(k / ATLAS_COLS) * CELL_H, CELL_W, CELL_H, 0, 0, CELL_W, CELL_H);
  const u = c.toDataURL();
  urlCache.set(k, u);
  return u;
}
export const clearURLs = () => urlCache.clear();

// ---------- layout ----------
// Seats sit round an oval with the viewer at the bottom; play moves clockwise, so the next seat is to
// the viewer's left. Returns sprites (cards and chips) and anchors for the DOM overlays.
export function chipStack(amount) {
  const out = [];
  let left = amount;
  for (let i = 0; i < CHIP_VALUES.length && out.length < 12; i++) {
    let k = Math.floor(left / CHIP_VALUES[i]);
    left -= k * CHIP_VALUES[i];
    while (k-- > 0 && out.length < 12) out.push(i);
  }
  return out;
}

export function layoutTable(view, W, H, safe, ui = {}) {
  const portrait = H > W * 1.1;
  const top = safe.top + 50, bottom = H - safe.bottom - (ui.barH || 120);
  const n = view.players.length;
  const me = view.players[view.seat];
  const myCount = me ? me.cards.length : 0;
  // The viewer's cards sit along the bottom, outside the oval on a phone, on the rail elsewhere.
  const myH = Math.min(portrait ? H * 0.15 : H * 0.2, (W - 32) / Math.max(2.4, myCount * 0.78 + 0.5) * CARD_ASPECT, 190);
  const myW = myH / CARD_ASPECT;
  const myY = bottom - myH * 0.5 - 6;
  const cx = W / 2;
  const tableTop = top + 18, tableBot = myY - myH * (portrait ? 0.62 : 0.35);
  const cy = (tableTop + tableBot) / 2;
  const rx = Math.min(W * (portrait ? 0.43 : 0.40), (tableBot - tableTop) * (portrait ? 0.62 : 1.05));
  const ry = (tableBot - tableTop) / 2;
  const sprites = [];
  const seats = [];
  const unit = Math.min(W, H);
  const smallH = Math.max(30, Math.min(unit * (portrait ? 0.085 : 0.095), 78));
  const boardH = Math.max(44, Math.min(unit * (portrait ? 0.12 : 0.14), rx * 2 / 6.2 * CARD_ASPECT, 118));
  const showdown = view.result && !view.result.uncontested;
  const winners = new Set();
  const winCards = new Set();
  if (view.result) for (const a of view.result.awards) winners.add(a.seat);
  if (showdown) for (const s of winners) {
    const hd = view.result.hands[s]; if (!hd) continue;
    for (const c of hd.highCards || []) if (view.result.pots.some(p => (p.high || []).includes(s))) winCards.add(s + ':' + c);
    for (const c of hd.lowCards || []) if (view.result.pots.some(p => (p.low || []).includes(s))) winCards.add(s + ':' + c);
  }
  const stud = view.variant && ['stud7', 'stud8', 'razz', 'stud5'].includes(view.variant);

  for (let s = 0; s < n; s++) {
    const p = view.players[s];
    const rel = (s - view.seat + n) % n;
    const ang = Math.PI / 2 + rel * 2 * Math.PI / n;
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const ax = cx + ux * rx, ay = cy + uy * ry;
    const seat = { seat: s, rel, x: ax, y: ay, ux, uy, present: !!p };
    seats.push(seat);
    if (!p) continue;
    // Bets: toward the centre.
    const bx = cx + ux * rx * 0.5, by = cy + uy * ry * 0.5;
    seat.bet = { x: bx, y: by };
    if (p.bet > 0) {
      const chips = chipStack(p.bet);
      const ch = Math.max(16, smallH * 0.36);
      chips.forEach((ci, i) => sprites.push({ key: `bet${s}-${i}`, k: K_CHIP + ci, x: bx - ch * 0.3, y: by - i * ch * 0.14, w: ch, h: ch, rot: 0, flags: F.CHIP, lift: 0, spawn: `seat${s}` }));
      seat.betLabel = { x: bx + ch * 0.55, y: by - ch * 0.1 };
    }
    if (s === view.button) {
      const d = Math.max(18, smallH * 0.38);
      const bxx = cx + Math.cos(ang - 0.32) * rx * 0.78, byy = cy + Math.sin(ang - 0.32) * ry * 0.78;
      sprites.push({ key: 'button', k: K_BUTTON, x: bxx, y: byy, w: d, h: d, rot: 0, flags: F.CHIP, lift: 0 });
    }
    if (p.folded && !(view.phase === 'over' && false)) continue;
    const isMe = s === view.seat;
    const cards = p.cards;
    if (isMe) {
      const gap = myW * (cards.length > 5 ? 0.8 : 0.92);
      const x0 = cx - gap * (cards.length - 1) / 2;
      cards.forEach((x, i) => {
        let flags = 0, lift = 0;
        const sel = ui.selected && ui.selected.includes(x.c);
        if (sel) { flags |= F.SELECTED; lift = 1; }
        if (stud && !x.up) flags |= F.PRIVATE;
        if (winCards.has(s + ':' + x.c)) { flags |= F.WIN; lift = Math.max(lift, 0.5); }
        else if (showdown && winners.size) flags |= winners.has(s) ? 0 : F.DIM;
        const key = view.variant === 'draw5' ? `c${x.c}` : `p${s}-${i}`;
        sprites.push({ key, k: x.c ?? K_BACK, x: x0 + i * gap, y: myY, w: myW, h: myH, rot: 0, flags, lift, spawn: 'deck', card: x.c, mine: true });
      });
      seat.cards = { x: cx, y: myY - myH * 0.5 };
    } else {
      // Others: a small fan just inside the rail; stud up cards larger and spread so they can be read.
      const h = stud ? smallH * 0.95 : smallH * 0.85, w = h / CARD_ASPECT;
      const gap = stud ? w * 0.62 : w * 0.38;
      // On a narrow table the cards tuck under the seat's badge; on a wide one they sit inside the rail.
      let px = cx + ux * rx * 0.7, py = cy + uy * ry * 0.7;
      if (portrait && Math.abs(ux) > 0.3) { px = ax - ux * Math.min(rx * 0.15, 30); py = ay + 10 + 22 + h * 0.62; }
      const x0 = px - gap * (cards.length - 1) / 2;
      cards.forEach((x, i) => {
        let flags = 0, lift = 0;
        if (winCards.has(s + ':' + x.c)) { flags |= F.WIN; lift = 0.5; }
        else if (showdown && winners.size && x.c != null) flags |= winners.has(s) ? 0 : F.DIM;
        const big = showdown && x.c != null ? 1.25 : 1;
        sprites.push({ key: `p${s}-${i}`, k: x.c ?? K_BACK, x: x0 + i * gap * big, y: py + (stud && !x.up && x.c == null ? -h * 0.08 : 0), w: w * big, h: h * big, rot: 0, flags, lift, spawn: 'deck' });
      });
      seat.cards = { x: px, y: py };
    }
  }

  // Board, in the middle; the pot just under it.
  const bw = boardH / CARD_ASPECT, bgap = bw * 1.08;
  const nb = view.board.length;
  const boardY = cy - (nb ? boardH * 0.25 : 0);
  if (nb) {
    const slots = Math.max(5, nb);
    const x0 = cx - bgap * (slots - 1) / 2;
    view.board.forEach((c, i) => {
      let flags = 0, lift = 0;
      if ([...winners].some(s => winCards.has(s + ':' + c))) { flags |= F.WIN; lift = 0.4; }
      sprites.push({ key: `b${i}`, k: c, x: (nb === 1 && stud) ? cx : x0 + i * bgap, y: boardY, w: bw, h: boardH, rot: 0, flags, lift, spawn: 'deck' });
    });
  }
  const potY = nb ? boardY + boardH * 0.5 + Math.max(18, boardH * 0.28) : cy;
  if (view.pot > 0) {
    const chips = chipStack(view.pot);
    const ch = Math.max(16, smallH * 0.36);
    const cols = Math.min(4, Math.ceil(chips.length / 4));
    chips.forEach((ci, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      sprites.push({ key: `pot-${i}`, k: K_CHIP + ci, x: cx - ch * 1.2 - (cols - 1) * ch * 0.45 + col * ch * 0.9, y: potY - row * ch * 0.14, w: ch, h: ch, rot: 0, flags: F.CHIP, lift: 0, spawn: 'pot' });
    });
  }
  return { sprites, seats, cx, cy, rx, ry, potLabel: { x: cx, y: potY }, boardY, boardH, myY, myH, myW, portrait, table: { cx, cy, rx, ry } };
}

// Which of the viewer's cards is under a point (for picking discards).
export function hitCard(layout, x, y) {
  let hit = null;
  for (const s of layout.sprites) {
    if (!s.mine) continue;
    const yy = s.y - (s.lift || 0) * s.h * 0.22;
    if (Math.abs(x - s.x) <= s.w / 2 && Math.abs(y - yy) <= s.h / 2) hit = s;   // last drawn wins
  }
  return hit;
}

// ---------- animation ----------
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 10000) / 10000; }

class Anim {
  constructor() { this.items = new Map(); }
  update(sprites, layout, dt) {
    const seen = new Set(), out = [];
    const k = 1 - Math.exp(-dt * 11);
    for (const s of sprites) {
      seen.add(s.key);
      let a = this.items.get(s.key);
      if (!a) {
        let sx = s.x, sy = s.y;
        if (s.spawn === 'deck') { sx = layout.cx; sy = layout.cy - layout.ry * 0.25; }
        else if (s.spawn === 'pot') { sx = s.x; sy = s.y; }
        else if (s.spawn && s.spawn.startsWith('seat')) { const st = layout.seats[+s.spawn.slice(4)]; if (st) { sx = st.x; sy = st.y; } }
        a = { x: sx, y: sy, w: s.w, h: s.h, rot: s.rot + (s.spawn === 'deck' ? (hash(s.key) - 0.5) * 1.2 : 0), lift: s.lift, alpha: s.spawn ? 0 : 1, seed: hash(s.key), k: s.k, flip: 0 };
        this.items.set(s.key, a);
      }
      // A card turning over (a hand shown at showdown) flips: it narrows, changes face, and widens.
      if (s.k !== a.k && a.flip === 0) a.flip = 1;
      let shownK = a.k;
      let wScale = 1;
      if (a.flip > 0) {
        a.flip = Math.max(0, a.flip - dt * 4);
        if (a.flip < 0.5) { a.k = s.k; shownK = s.k; }
        wScale = Math.abs(Math.cos((1 - a.flip) * Math.PI));
        if (a.flip === 0) wScale = 1;
      } else { a.k = s.k; shownK = s.k; }
      a.x += (s.x - a.x) * k; a.y += (s.y - a.y) * k;
      a.w += (s.w - a.w) * k; a.h += (s.h - a.h) * k;
      a.rot += (s.rot - a.rot) * k;
      a.lift += (s.lift - a.lift) * (1 - Math.exp(-dt * 16));
      a.alpha += (1 - a.alpha) * (1 - Math.exp(-dt * 9));
      out.push({ ...s, k: shownK, x: a.x, y: a.y, w: a.w * wScale, h: a.h, rot: a.rot, lift: a.lift, alpha: a.alpha, seed: a.seed });
    }
    for (const key of this.items.keys()) if (!seen.has(key)) this.items.delete(key);
    // Chips under cards; the viewer's hand last; lifted cards over their neighbours.
    out.sort((p, q) => ((q.flags & F.CHIP) - (p.flags & F.CHIP)) || ((p.mine ? 1 : 0) - (q.mine ? 1 : 0)) || ((p.lift > 0.05) - (q.lift > 0.05)) || (p.flags & F.CHIP ? q.y - p.y : 0));
    return out;
  }
}

// ---------- WebGPU ----------
const WGSL_COMMON = /* wgsl */`
struct U {
  res: vec2f, time: f32, dpr: f32,
  table: vec4f,          // centre x, y, radius x, y (CSS px)
  turn: vec4f,           // x, y of the seat to act, w = strength of its glow
  light: vec4f,          // lamp position (CSS px), z = flicker seed
  grid: vec4f,           // atlas columns, rows, cell w, h (uv)
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
// Signed distance to an ellipse, approximated (good enough near the edge for shading).
fn sdEllipse(p: vec2f, r: vec2f) -> f32 {
  let k0 = length(p / r); let k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / max(k1, 1e-4);
}
`;

// The room: a dark panelled card room under one brass lamp, with haze drifting through the light, and an
// oval table with a padded leather rail, a wood trim, and a deep green felt.
const WGSL_BG = WGSL_COMMON + /* wgsl */`
@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let p = array<vec2f, 3>(vec2f(-1, -3), vec2f(-1, 1), vec2f(3, 1));
  return vec4f(p[i], 0, 1);
}
@fragment fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let px = fc.xy / u.dpr;                 // CSS px
  let t = u.time;
  let c = u.table.xy; let R = u.table.zw;
  let lamp = u.light.xy;
  let flick = 0.96 + 0.04 * sin(t * 7.3 + sin(t * 3.1) * 2.0);
  // Walls: vertical panels with grain, wainscot rail, and warm falloff from the lamp.
  let pw = 140.0;
  let panel = fract(px.x / pw);
  let edge = smoothstep(0.0, 0.03, panel) * smoothstep(1.0, 0.97, panel);
  let grain = fbm(vec2f(px.x * 0.05, px.y * 0.004) + vec2f(floor(px.x / pw) * 7.0, 0.0));
  var col = mix(vec3f(0.07, 0.035, 0.025), vec3f(0.16, 0.08, 0.045), grain) * (0.55 + 0.45 * edge);
  let wy = u.res.y * 0.42;
  col = mix(col, vec3f(0.22, 0.12, 0.05), smoothstep(3.0, 0.0, abs(px.y - wy)) * 0.8);
  // Sconces glowing on the back wall.
  for (var k = 0; k < 4; k++) {
    let sx = u.res.x * (0.12 + 0.253 * f32(k));
    let d = length((px - vec2f(sx, u.res.y * 0.17)) * vec2f(1.0, 1.3));
    col += vec3f(1.0, 0.62, 0.3) * (0.05 / (1.0 + d * d * 0.0009) + 0.25 * exp(-d * 0.09));
  }
  let ld = length((px - lamp) * vec2f(0.8, 1.0));
  col *= 0.35 + 1.2 * exp(-ld / (u.res.y * 0.55)) * flick;

  // Table.
  let q = px - c;
  let dOut = sdEllipse(q, R + vec2f(26.0));            // outer edge of the rail
  let dRail = sdEllipse(q, R);                         // rail / felt boundary
  // Drop shadow on the floor around the table.
  col *= 1.0 - 0.6 * smoothstep(60.0, -10.0, dOut);
  if (dOut < 0.0) {
    if (dRail > 0.0) {
      // Padded leather rail: rounded profile lit from the lamp.
      let k = clamp(dRail / 26.0, 0.0, 1.0);
      let n = normalize(q / (R * R)) ;
      let prof = sin(k * 3.14159);
      let lit = 0.45 + 0.55 * clamp(dot(-n, normalize(lamp - px)) * 0.5 + 0.5, 0.0, 1.0);
      var leather = vec3f(0.09, 0.045, 0.03) * (0.5 + 0.9 * prof) * lit;
      leather += vec3f(0.5, 0.35, 0.25) * pow(prof, 12.0) * 0.18 * lit;
      leather *= 0.85 + 0.3 * noise(px * 0.35);
      // Stitching along the middle of the rail.
      let st = step(0.5, fract(atan2(q.y / R.y, q.x / R.x) * 60.0)) * smoothstep(1.2, 0.0, abs(dRail - 13.0));
      leather += vec3f(0.35, 0.25, 0.12) * st * 0.35;
      col = leather;
    } else {
      // Wood trim, then felt.
      if (dRail > -7.0) {
        let wg = fbm(vec2f(atan2(q.y, q.x) * 30.0, dRail * 0.4));
        col = mix(vec3f(0.25, 0.11, 0.04), vec3f(0.45, 0.22, 0.08), wg) * (0.7 + 0.5 * smoothstep(-7.0, -2.0, dRail));
      } else {
        let fn_ = fbm(px * 0.9) * 0.5 + fbm(px * 0.12 + vec2f(3.0, 1.0)) * 0.5;
        var felt = mix(vec3f(0.02, 0.17, 0.10), vec3f(0.04, 0.27, 0.16), fn_);
        // Lamp pool on the felt.
        let lp = length((px - vec2f(c.x, c.y - R.y * 0.1)) / (R * 1.05));
        felt *= 0.45 + 0.9 * exp(-lp * lp * 1.6) * flick;
        // Inner shadow under the rail.
        felt *= 0.55 + 0.45 * smoothstep(-7.0, -40.0, dRail);
        // A gold betting line.
        let line = smoothstep(1.4, 0.0, abs(sdEllipse(q, R * 0.66)));
        felt += vec3f(0.55, 0.42, 0.15) * line * 0.5;
        // Glow toward whoever is to act.
        let tg = length(px - u.turn.xy);
        felt += vec3f(0.85, 0.65, 0.25) * u.turn.w * 0.22 * exp(-tg * tg / (R.y * R.y * 0.12)) * (0.8 + 0.2 * sin(t * 3.0));
        col = felt;
      }
    }
  }
  // Haze drifting through the lamp light.
  let haze = fbm(px * 0.004 + vec2f(t * 0.015, -t * 0.01)) * fbm(px * 0.009 - vec2f(t * 0.02, 0.0));
  col += vec3f(0.55, 0.42, 0.3) * haze * 0.22 * exp(-ld / (u.res.y * 0.7));
  // Vignette.
  let v = length((px / u.res - 0.5) * vec2f(1.1, 1.0));
  col *= 1.0 - 0.55 * smoothstep(0.35, 0.85, v);
  return vec4f(pow(col, vec3f(0.95)), 1.0);
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

// Cards and chips: one instanced draw. A card is a rounded rectangle with a soft shadow that spreads as
// it lifts, a glossy sheen that sweeps across now and then, and a glow for the selected, fresh or winning
// card. A chip is a disc with a thin edge.
const WGSL_SPRITE = WGSL_COMMON + /* wgsl */`
@group(0) @binding(1) var atlas: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;
struct VOut {
  @builtin(position) pos: vec4f,
  @location(0) local: vec2f,
  @location(1) @interpolate(flat) size: vec2f,
  @location(2) @interpolate(flat) misc: vec4f,   // k, flags, lift, seed
  @location(3) @interpolate(flat) misc2: vec4f,  // alpha, rot
};
@vertex fn vs(@builtin(vertex_index) vi: u32, @location(0) a: vec4f, @location(1) b: vec4f, @location(2) c: vec4f) -> VOut {
  let corners = array<vec2f, 6>(vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1), vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1));
  let size = a.zw; let rot = b.x; let lift = b.w;
  let margin = vec2f(max(size.x, size.y) * 0.35 + 8.0);
  let local = corners[vi] * (size * 0.5 + margin);
  let cs = cos(rot); let sn = sin(rot);
  var world = a.xy + vec2f(local.x * cs - local.y * sn, local.x * sn + local.y * cs);
  world.y -= lift * size.y * 0.22;
  var o: VOut;
  o.pos = vec4f(world / u.res * vec2f(2, -2) + vec2f(-1, 1), 0, 1);
  o.local = local; o.size = size;
  o.misc = vec4f(b.y, b.z, lift, c.x);
  o.misc2 = vec4f(c.y, rot, 0, 0);
  return o;
}
@fragment fn fs(in: VOut) -> @location(0) vec4f {
  let k = i32(in.misc.x + 0.5);
  let flags = u32(in.misc.y + 0.5);
  let lift = in.misc.z; let seed = in.misc.w; let alpha = in.misc2.x;
  let p = in.local; let hs = in.size * 0.5;
  let chip = (flags & 32u) != 0u;
  let r = select(min(hs.x, hs.y) * 0.1, min(hs.x, hs.y), chip);
  var acc = vec4f(0.0);
  // Shadow, offset away from the lamp and blurred by lift.
  let sOff = vec2f(1.5, 3.0) + vec2f(2.0, 6.0) * lift;
  let blur = 3.0 + 10.0 * lift;
  let ds = sdBox(p - sOff, hs, r);
  let sh = (1.0 - smoothstep(-blur, blur, ds)) * (0.5 - 0.15 * lift);
  acc = vec4f(0.0, 0.0, 0.0, sh);
  // Glow ring.
  var glow = vec3f(0.0); var gs = 0.0;
  if ((flags & 4u) != 0u) { glow = vec3f(1.0, 0.8, 0.3); gs = 0.9 + 0.1 * sin(u.time * 4.0); }
  else if ((flags & 1u) != 0u) { glow = vec3f(1.0, 0.85, 0.45); gs = 0.8; }
  else if ((flags & 64u) != 0u) { glow = vec3f(0.5, 0.8, 1.0); gs = 0.7; }
  let d = sdBox(p, hs, r);
  if (gs > 0.0) {
    let g = exp(-max(d, 0.0) / 5.0) * gs * smoothstep(-1.0, 1.0, d);
    acc = vec4f(mix(acc.rgb, glow, g / max(acc.a + g, 1e-3)), clamp(acc.a + g, 0.0, 1.0));
  }
  // Sampled before any branch: textureSample needs uniform control flow for its mip selection.
  let cell = vec2f(f32(k % i32(u.grid.x)), f32(k / i32(u.grid.x)));
  var uv: vec2f;
  if (chip) {
    // Chips fill a square centred in a card-shaped cell.
    let ratio = 128.0 / 184.0;
    uv = vec2f((cell.x + 0.5 + clamp(p.x / in.size.x, -0.5, 0.5)) * u.grid.z, (cell.y + (1.0 - ratio) * 0.5 + (0.5 + clamp(p.y / in.size.y, -0.5, 0.5)) * ratio) * u.grid.w);
  } else {
    uv = (cell + clamp(p / in.size, vec2f(-0.5), vec2f(0.5)) + 0.5) * u.grid.zw;
  }
  let tex = textureSample(atlas, samp, uv).rgb;
  if (d < 1.0) {
    var face = tex;
    // Lamp-lit bevel and a sheen crossing the face now and then.
    let e = clamp(-d / max(min(hs.x, hs.y) * 0.25, 1.0), 0.0, 1.0);
    face *= 0.88 + 0.12 * e;
    let toLamp = normalize(u.light.xy - in.pos.xy / u.dpr);
    face += vec3f(0.08) * clamp(dot(normalize(p + vec2f(1e-3)), toLamp), 0.0, 1.0) * (1.0 - e);
    if (!chip) {
      let ph = fract(u.time / (8.0 + seed * 5.0) + seed);
      let x = (p.x + p.y * 0.5) / in.size.x;
      face += vec3f(0.18, 0.16, 0.12) * exp(-sq(x - (ph * 6.0 - 1.5)) * 40.0);
    } else {
      // Chip edge.
      face *= 0.8 + 0.2 * smoothstep(0.0, -2.5, d);
    }
    if ((flags & 16u) != 0u) { face = mix(face, vec3f(0.55, 0.62, 0.8), 0.18); }
    if ((flags & 8u) != 0u) { face *= 0.45; }
    let aa = 1.0 - smoothstep(-0.6, 0.6, d);
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
  const ubuf = device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const tex = device.createTexture({ size: [atlasCanvas.width, atlasCanvas.height], mipLevelCount: ATLAS_MIPS, format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT });
  const uploadAtlas = cv => atlasMips(cv).forEach((lv, l) =>
    device.queue.copyExternalImageToTexture({ source: lv }, { texture: tex, mipLevel: l, premultipliedAlpha: true }, [lv.width, lv.height]));
  uploadAtlas(atlasCanvas);
  const samp = device.createSampler({ magFilter: 'linear', minFilter: 'linear', mipmapFilter: 'linear' });
  const mods = [WGSL_BG, WGSL_SPRITE, WGSL_BLIT].map(code => device.createShaderModule({ code }));
  for (const mod of mods) {
    const info = await mod.getCompilationInfo();
    const errs = info.messages.filter(m => m.type === 'error');
    if (errs.length) throw new Error('WGSL: ' + errs.map(e => `${e.lineNum}:${e.linePos} ${e.message}`).join('; '));
  }
  const [bgMod, spMod, blitMod] = mods;
  const uEntry = { binding: 0, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX, buffer: {} };
  const bgLayout = device.createBindGroupLayout({ entries: [uEntry] });
  const spLayout = device.createBindGroupLayout({ entries: [uEntry,
    { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} }, { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} }] });
  const blitLayout = device.createBindGroupLayout({ entries: [
    { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} }, { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} }] });
  const bgPipe = device.createRenderPipeline({ layout: device.createPipelineLayout({ bindGroupLayouts: [bgLayout] }),
    vertex: { module: bgMod, entryPoint: 'vs' }, fragment: { module: bgMod, entryPoint: 'fs', targets: [{ format }] } });
  const blend = { color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' } };
  const spPipe = device.createRenderPipeline({ layout: device.createPipelineLayout({ bindGroupLayouts: [spLayout] }),
    vertex: { module: spMod, entryPoint: 'vs', buffers: [{ arrayStride: 48, stepMode: 'instance', attributes: [
      { shaderLocation: 0, offset: 0, format: 'float32x4' }, { shaderLocation: 1, offset: 16, format: 'float32x4' }, { shaderLocation: 2, offset: 32, format: 'float32x4' }] }] },
    fragment: { module: spMod, entryPoint: 'fs', targets: [{ format, blend }] } });
  const blitPipe = device.createRenderPipeline({ layout: device.createPipelineLayout({ bindGroupLayouts: [blitLayout] }),
    vertex: { module: blitMod, entryPoint: 'vs' }, fragment: { module: blitMod, entryPoint: 'fs', targets: [{ format }] } });
  const bgBind = device.createBindGroup({ layout: bgLayout, entries: [{ binding: 0, resource: { buffer: ubuf } }] });
  const spBind = device.createBindGroup({ layout: spLayout, entries: [{ binding: 0, resource: { buffer: ubuf } }, { binding: 1, resource: tex.createView() }, { binding: 2, resource: samp }] });
  const BG_SCALE = 0.5;
  let bgTex = null, blitBind = null;
  function makeBgTex() {
    if (bgTex) bgTex.destroy();
    bgTex = device.createTexture({ size: [Math.max(1, Math.round(canvas.width * BG_SCALE)), Math.max(1, Math.round(canvas.height * BG_SCALE))], format, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING });
    blitBind = device.createBindGroup({ layout: blitLayout, entries: [{ binding: 0, resource: bgTex.createView() }, { binding: 1, resource: samp }] });
  }
  let ibuf = device.createBuffer({ size: 48 * 256, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
  let lost = false;
  device.lost.then(info => { lost = true; console.warn('WebGPU device lost', info.message); });
  const anim = new Anim();
  let W = 1, H = 1, dpr = 1;
  const writeU = (layout, time, turn, scale) => {
    const u = new Float32Array(20);
    u.set([W, H, time, dpr * scale, layout.cx, layout.cy, layout.rx, layout.ry, turn ? turn.x : 0, turn ? turn.y : 0, 0, turn ? 1 : 0,
      layout.cx + Math.sin(time * 0.2) * 30, layout.cy - layout.ry * 1.3, 0, 0, ATLAS_COLS, ATLAS_ROWS, CELL_W / atlasCanvas.width, CELL_H / atlasCanvas.height]);
    device.queue.writeBuffer(ubuf, 0, u);
  };
  return {
    kind: 'webgpu',
    get lost() { return lost; },
    uploadAtlas,
    resize(w, h, d) { W = w; H = h; dpr = d; canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); makeBgTex(); },
    frame(layout, dt, time, turn, target) {
      if (!bgTex) makeBgTex();
      if (lost) return;
      const list = anim.update(layout.sprites, layout, dt);
      if (list.length * 48 > ibuf.size) { ibuf.destroy(); ibuf = device.createBuffer({ size: 48 * (list.length + 64), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST }); }
      const inst = new Float32Array(list.length * 12);
      list.forEach((s, i) => inst.set([s.x, s.y, s.w, s.h, s.rot, s.k, s.flags, s.lift, s.seed, s.alpha, 0, 0], i * 12));
      device.queue.writeBuffer(ibuf, 0, inst);
      const enc = device.createCommandEncoder();
      // The background pass reads the uniforms at half resolution; the sprite pass at full.
      writeU(layout, time, turn, BG_SCALE);
      const bgPass = enc.beginRenderPass({ colorAttachments: [{ view: bgTex.createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } }] });
      bgPass.setPipeline(bgPipe); bgPass.setBindGroup(0, bgBind); bgPass.draw(3); bgPass.end();
      device.queue.submit([enc.finish()]);
      writeU(layout, time, turn, 1);
      const enc2 = device.createCommandEncoder();
      const pass = enc2.beginRenderPass({ colorAttachments: [{ view: target || ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } }] });
      pass.setPipeline(blitPipe); pass.setBindGroup(0, blitBind); pass.draw(3);
      if (list.length) { pass.setPipeline(spPipe); pass.setBindGroup(0, spBind); pass.setVertexBuffer(0, ibuf); pass.draw(6, list.length); }
      pass.end();
      device.queue.submit([enc2.finish()]);
    },
    // Renders one frame offscreen and reads it back as RGBA (for tests: a WebGPU canvas cannot always be read).
    async capture(layout, time = 1) {
      const w = canvas.width, h = canvas.height, bpr = Math.ceil(w * 4 / 256) * 256;
      const t = device.createTexture({ size: [w, h], format, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
      const buf = device.createBuffer({ size: bpr * h, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
      for (let i = 0; i < 40; i++) this.frame(layout, 0.05, time, null, t.createView());
      const enc = device.createCommandEncoder();
      enc.copyTextureToBuffer({ texture: t }, { buffer: buf, bytesPerRow: bpr }, [w, h]);
      device.queue.submit([enc.finish()]);
      await buf.mapAsync(GPUMapMode.READ);
      const src = new Uint8Array(buf.getMappedRange()), out = new Uint8ClampedArray(w * h * 4), bgra = format.startsWith('bgra');
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * bpr + x * 4, o = (y * w + x) * 4;
        out[o] = src[i + (bgra ? 2 : 0)]; out[o + 1] = src[i + 1]; out[o + 2] = src[i + (bgra ? 0 : 2)]; out[o + 3] = 255;
      }
      buf.unmap(); t.destroy(); buf.destroy();
      return { w, h, data: out };
    },
  };
}

// ---------- Canvas 2D fallback ----------
export function init2D(canvas, atlasIn) {
  const g = canvas.getContext('2d');
  let atlasCanvas = atlasIn;
  const anim = new Anim();
  let W = 1, H = 1, dpr = 1, bg = null, lastKey = '';
  function paintBg(layout) {
    bg = document.createElement('canvas'); bg.width = canvas.width; bg.height = canvas.height;
    const b = bg.getContext('2d'); b.scale(dpr, dpr);
    const wall = b.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#24130b'); wall.addColorStop(1, '#0c0605');
    b.fillStyle = wall; b.fillRect(0, 0, W, H);
    b.strokeStyle = 'rgba(0,0,0,0.35)'; b.lineWidth = 2;
    for (let x = 0; x < W; x += 140) { b.beginPath(); b.moveTo(x, 0); b.lineTo(x, H); b.stroke(); }
    const lamp = b.createRadialGradient(layout.cx, layout.cy - layout.ry, 10, layout.cx, layout.cy, Math.max(W, H) * 0.7);
    lamp.addColorStop(0, 'rgba(255,190,110,0.25)'); lamp.addColorStop(1, 'rgba(0,0,0,0.4)');
    b.fillStyle = lamp; b.fillRect(0, 0, W, H);
    const { cx, cy, rx, ry } = layout;
    b.fillStyle = 'rgba(0,0,0,0.5)'; b.beginPath(); b.ellipse(cx + 4, cy + 10, rx + 34, ry + 34, 0, 0, 7); b.fill();
    const rail = b.createRadialGradient(cx, cy - ry * 0.3, ry * 0.5, cx, cy, Math.max(rx, ry) + 26);
    rail.addColorStop(0, '#3a1d12'); rail.addColorStop(1, '#140804');
    b.fillStyle = rail; b.beginPath(); b.ellipse(cx, cy, rx + 26, ry + 26, 0, 0, 7); b.fill();
    b.fillStyle = '#6b3814'; b.beginPath(); b.ellipse(cx, cy, rx, ry, 0, 0, 7); b.fill();
    const felt = b.createRadialGradient(cx, cy - ry * 0.1, 10, cx, cy, Math.max(rx, ry));
    felt.addColorStop(0, '#11603a'); felt.addColorStop(1, '#05261a');
    b.fillStyle = felt; b.beginPath(); b.ellipse(cx, cy, rx - 7, ry - 7, 0, 0, 7); b.fill();
    b.strokeStyle = 'rgba(200,160,70,0.55)'; b.lineWidth = 1.2; b.beginPath(); b.ellipse(cx, cy, rx * 0.66, ry * 0.66, 0, 0, 7); b.stroke();
  }
  return {
    kind: '2d', lost: false,
    uploadAtlas(cv) { atlasCanvas = cv; },
    resize(w, h, d) { W = w; H = h; dpr = d; canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); lastKey = ''; },
    frame(layout, dt, time, turn) {
      const key = [layout.cx, layout.cy, layout.rx, layout.ry, W, H].map(Math.round).join(',');
      if (key !== lastKey) { paintBg(layout); lastKey = key; }
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bg, 0, 0);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (turn) {
        const gr = g.createRadialGradient(turn.x, turn.y, 4, turn.x, turn.y, layout.ry * 0.45);
        gr.addColorStop(0, `rgba(255,200,90,${0.18 + 0.05 * Math.sin(time * 3)})`); gr.addColorStop(1, 'rgba(255,200,90,0)');
        g.fillStyle = gr; g.fillRect(turn.x - layout.ry, turn.y - layout.ry, layout.ry * 2, layout.ry * 2);
      }
      for (const s of anim.update(layout.sprites, layout, dt)) {
        g.save();
        g.globalAlpha = s.alpha;
        g.translate(s.x, s.y - s.lift * s.h * 0.22); g.rotate(s.rot);
        const w = s.w, h = s.h, chip = s.flags & F.CHIP, r = chip ? Math.min(w, h) / 2 : Math.min(w, h) * 0.1;
        g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.roundRect(-w / 2 + 2, -h / 2 + 3 + s.lift * 5, w, h, r); g.fill();
        if (s.flags & (F.SELECTED | F.WIN | F.HINT)) {
          g.strokeStyle = s.flags & F.HINT ? 'rgba(140,210,255,0.9)' : 'rgba(255,205,90,0.95)';
          g.lineWidth = 3; g.beginPath(); g.roundRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, r + 2); g.stroke();
        }
        g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.clip();
        const sx = (s.k % ATLAS_COLS) * CELL_W, sy = Math.floor(s.k / ATLAS_COLS) * CELL_H;
        if (chip) g.drawImage(atlasCanvas, sx, sy + (CELL_H - CELL_W) / 2, CELL_W, CELL_W, -w / 2, -h / 2, w, h);
        else g.drawImage(atlasCanvas, sx, sy, CELL_W, CELL_H, -w / 2, -h / 2, w, h);
        if (s.flags & F.PRIVATE) { g.fillStyle = 'rgba(120,140,200,0.16)'; g.fillRect(-w / 2, -h / 2, w, h); }
        if (s.flags & F.DIM) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(-w / 2, -h / 2, w, h); }
        g.restore();
      }
    },
  };
}
