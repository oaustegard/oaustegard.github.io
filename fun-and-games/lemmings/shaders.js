// WGSL for gPu(lemmings). Every lemming state is its own small kernel. Each tick, classify puts every
// live lemming's index on the queue for its current state, args turns the queue lengths into
// indirect dispatch sizes, and each state kernel runs only over its own queue. Terrain edits (bash,
// mine, dig, bomb, brick) go on two queues of their own and are applied after every lemming has
// moved, removals before additions, so the result never depends on the order threads run in.

export const MAXL = 16384;          // lemmings
export const MAXE = 4096;           // terrain edits of each kind per tick
export const MAXVIEW = 2048 * 320;  // framebuffer pixels (view + minimap)
export const TPS = 17;              // ticks per second, as the original
export const OPEN_TICKS = 34;       // the hatch opens before the first lemming drops

export const S = { NONE: 0, WALK: 1, FALL: 2, FLOAT: 3, CLIMB: 4, HOIST: 5, BUILD: 6, SHRUG: 7, BASH: 8, MINE: 9,
  DIG: 10, BLOCK: 11, JUMP: 12, OHNO: 13, EXIT: 14, SPLAT: 15, DROWN: 16, POP: 17 };
export const NS = 18;
export const STATE_NAMES = ["", "walker", "faller", "floater", "climber", "climber", "builder", "builder", "basher",
  "miner", "digger", "blocker", "walker", "bomber", "", "", "", ""];
export const SKILLS = ["climber", "floater", "bomber", "blocker", "builder", "basher", "miner", "digger"];
export const SND = ["letsgo", "assign", "ohno", "pop", "splat", "yippee", "drown", "tink"];

// world words (WD in WGSL)
export const WD = { TICK: 0, REL: 1, SAVED: 3, DEAD: 4, RR: 5, SPAWNT: 6, NUKED: 7, NUKEC: 8, TIME: 9, HOVKEY: 10,
  HOV: 11, CLICK: 12, NREM: 14, NADD: 15, SKILL: 16, SND: 24, QC: 32, DONE: 51, HOVSTATE: 52, HOVFLAGS: 53, WORDS: 64 };
// rom: level header at 0, terrain palette at PAL, sprite meta at SMETA, sprite frames at SPR
export const ROM = { W: 0, H: 1, COUNT: 2, NHATCH: 3, NEXIT: 4, NWATER: 5, RRMIN: 6, BURST: 7, DIGITS: 8,
  HATCH: 16, EXIT: 32, WATER: 48, THEME: 80, PAL: 128, SMETA: 384, SPR: 512 };
export const ARGS_WORDS = (NS + 2) * 3;
const EOFF = NS * MAXL, AOFF = EOFF + MAXE * 4, FOFF = AOFF + MAXE * 4;
export const AUX_FIELD = FOFF;

const STATE_CONSTS = Object.entries(S).map(([k, v]) => `const S_${k} = ${v}u;`).join("\n");
const WD_CONSTS = Object.entries(WD).map(([k, v]) => `const W_${k} = ${v}u;`).join("\n");
const ROM_CONSTS = Object.entries(ROM).map(([k, v]) => `const R_${k} = ${v}u;`).join("\n");

const COMMON = /* wgsl */ `
const MAXL = ${MAXL}u;
const MAXE = ${MAXE}u;
const NS = ${NS}u;
const EOFF = ${EOFF}u;
const AOFF = ${AOFF}u;
const FOFF = ${FOFF}u;
const COL = ${MAXVIEW}u;
const TPS = ${TPS};
const OPEN_TICKS = ${OPEN_TICKS}u;
${STATE_CONSTS}
${WD_CONSTS}
${ROM_CONSTS}
const F_CLIMB = 1u;
const F_FLOAT = 2u;
const F_BOMB = 4u;
const K_BASH = 1u;
const K_MINE = 2u;
const K_DIG = 3u;
const K_BOMB = 4u;
const K_BRICK = 5u;
const M_AIR = 0u;
const M_DIRT = 1u;
const M_STEEL = 2u;
const M_BRICK = 3u;
const M_DECOR = 4u;   // scenery: drawn, but lemmings pass through it

struct Lem { x: i32, y: i32, dir: i32, state: u32, frame: u32, fall: i32, flags: u32, timer: i32 }
struct Inp { curX: i32, curY: i32, click: u32, skill: u32, rr: u32, nuke: u32, camX: i32, vw: u32, vh: u32, mmh: u32, time: u32, camY: i32 }

@group(0) @binding(0) var<storage, read> rom: array<u32>;
@group(0) @binding(1) var<storage, read_write> ter: array<u32>;
@group(0) @binding(2) var<storage, read_write> lems: array<Lem>;
@group(0) @binding(3) var<storage, read_write> wd: array<atomic<u32>>;
@group(0) @binding(4) var<storage, read_write> aux: array<u32>;
@group(0) @binding(5) var<storage, read_write> fb: array<atomic<u32>>;
@group(0) @binding(6) var<uniform> inp: Inp;

var<private> L: Lem;

fn LW() -> i32 { return i32(rom[R_W]); }
fn LH() -> i32 { return i32(rom[R_H]); }
fn ldw(i: u32) -> u32 { return atomicLoad(&wd[i]); }
fn sound(k: u32) { atomicAdd(&wd[W_SND + k], 1u); }

// the material at a pixel; the level's sides are steel, above and below it is air
fn terr(x: i32, y: i32) -> u32 {
  if (x < 0 || x >= LW()) { return M_STEEL; }
  if (y < 0 || y >= LH()) { return M_AIR; }
  return ter[u32(y * LW() + x)] & 255u;
}
fn isSolid(m: u32) -> bool { return m != M_AIR && m != M_DECOR; }
fn solid(x: i32, y: i32) -> bool { return isSolid(terr(x, y)); }
`;

const SIM = /* wgsl */ `
fn pushEdit(base: u32, ctr: u32, kind: u32, x: i32, y: i32, dir: i32) {
  let n = atomicAdd(&wd[ctr], 1u);
  if (n >= MAXE) { return; }
  let o = base + n * 4u;
  aux[o] = kind; aux[o + 1u] = bitcast<u32>(x); aux[o + 2u] = bitcast<u32>(y); aux[o + 3u] = bitcast<u32>(dir);
}

fn toState(s: u32) { L.state = s; L.frame = 0u; }
fn startFall() { toState(S_FALL); L.fall = 0; }
fn die() { L.state = S_NONE; atomicAdd(&wd[W_DEAD], 1u); }
fn explode() {
  pushEdit(EOFF, W_NREM, K_BOMB, L.x, L.y, 0);
  toState(S_POP);
  sound(3u);
}

// what the blocker field says at a pixel: -1 push left, 1 push right, 0 nothing (stamped this tick)
fn pushDir(x: i32, y: i32) -> i32 {
  if (x < 0 || x >= LW() || y < 0 || y >= LH()) { return 0; }
  let v = aux[FOFF + u32(y * LW() + x)];
  if ((v >> 2u) != (ldw(W_TICK) & 0x3fffffffu)) { return 0; }
  return select(-1, 1, (v & 3u) == 2u);
}

// leaving the level, water and exits; true when the lemming stopped being a free agent
fn hazards() -> bool {
  if (L.y >= LH()) { die(); return true; }
  for (var k = 0u; k < rom[R_NWATER]; k++) {
    let o = R_WATER + k * 3u;
    if (L.x >= i32(rom[o]) && L.x <= i32(rom[o + 1u]) && L.y >= i32(rom[o + 2u])) { toState(S_DROWN); sound(6u); return true; }
  }
  for (var k = 0u; k < rom[R_NEXIT]; k++) {
    let ex = i32(rom[R_EXIT + k * 2u]); let ey = i32(rom[R_EXIT + k * 2u + 1u]);
    if (abs(L.x - ex) <= 2 && L.y <= ey && L.y >= ey - 6) { toState(S_EXIT); sound(5u); return true; }
  }
  return false;
}

// drop onto ground up to three pixels below; false when there is none and the lemming falls
fn followDown() -> bool {
  if (solid(L.x, L.y + 1)) { return true; }
  var d = 1;
  loop { if (d > 3 || solid(L.x, L.y + d + 1)) { break; } d += 1; }
  if (d <= 3) { L.y += d; return true; }
  startFall();
  return false;
}

fn canTake(s: u32) -> bool {
  let st = L.state;
  if (st == S_NONE || st >= S_OHNO) { return false; }
  switch (s) {
    case 0u: { return (L.flags & F_CLIMB) == 0u; }
    case 1u: { return (L.flags & F_FLOAT) == 0u; }
    case 2u: { return (L.flags & F_BOMB) == 0u; }
    default: {
      let busy = st == S_WALK || st == S_SHRUG || st == S_BUILD || st == S_BASH || st == S_MINE || st == S_DIG;
      if (!busy) { return false; }
      let same = (s == 4u && st == S_BUILD) || (s == 5u && st == S_BASH) || (s == 6u && st == S_MINE) || (s == 7u && st == S_DIG);
      return !same;
    }
  }
}

fn applySkill(s: u32) {
  switch (s) {
    case 0u: { L.flags |= F_CLIMB; }
    case 1u: { L.flags |= F_FLOAT; }
    case 2u: { L.flags |= F_BOMB; L.timer = 5 * TPS; }
    case 3u: { toState(S_BLOCK); }
    case 4u: { toState(S_BUILD); L.flags &= 0xffu; }
    case 5u: { toState(S_BASH); }
    case 6u: { toState(S_MINE); }
    default: { toState(S_DIG); }
  }
}

@compute @workgroup_size(1) fn begin() {
  let t = atomicAdd(&wd[W_TICK], 1u) + 1u;
  atomicStore(&wd[W_NREM], 0u);
  atomicStore(&wd[W_NADD], 0u);
  for (var s = 0u; s < NS; s++) { atomicStore(&wd[W_QC + s], 0u); }
  if (ldw(W_DONE) != 0u) { return; }
  if (t == 1u) { sound(0u); }
  let rr = clamp(inp.rr, rom[R_RRMIN], 99u);
  atomicStore(&wd[W_RR], rr);
  if (inp.nuke != 0u) { atomicStore(&wd[W_NUKED], 1u); }
  let nuked = ldw(W_NUKED) != 0u;
  let rel = ldw(W_REL);
  if (nuked) {
    // the original arms one lemming a tick; a crowd gets more at once
    var c = ldw(W_NUKEC);
    let per = max(1u, rel / 64u);
    for (var k = 0u; k < per && c < rel; k++) {
      var l = lems[c];
      if (l.state != S_NONE && l.state < S_OHNO && (l.flags & F_BOMB) == 0u) { l.flags |= F_BOMB; l.timer = 5 * TPS; lems[c] = l; }
      c += 1u;
    }
    atomicStore(&wd[W_NUKEC], c);
  }
  var tl = ldw(W_TIME);
  if (tl > 0u) { tl -= 1u; atomicStore(&wd[W_TIME], tl); }
  let total = rom[R_COUNT];
  if (!nuked && rel < total && t > OPEN_TICKS) {
    var timer = ldw(W_SPAWNT);
    if (timer == 0u) {
      var r = rel;
      let burst = max(rom[R_BURST], 1u);
      for (var h = 0u; h < rom[R_NHATCH]; h++) {
        for (var b = 0u; b < burst && r < total; b++) {
          let hx = i32(rom[R_HATCH + h * 2u]) + (i32(b) - i32(burst / 2u)) * 3;
          let hy = i32(rom[R_HATCH + h * 2u + 1u]);
          lems[r] = Lem(hx, hy, select(-1, 1, (b & 1u) == 0u), S_FALL, 0u, 0, 0u, 0);
          r += 1u;
        }
      }
      atomicStore(&wd[W_REL], r);
      timer = 53u - rr / 2u;
    } else { timer -= 1u; }
    atomicStore(&wd[W_SPAWNT], timer);
  }
  let rel2 = ldw(W_REL);
  let gone = ldw(W_SAVED) + ldw(W_DEAD);
  if ((t > OPEN_TICKS && (rel2 >= total || nuked) && gone >= rel2) || tl == 0u) { atomicStore(&wd[W_DONE], 1u); }
}

// the lemming under the cursor: one that can take the selected skill wins, then the nearest, then the newest
@compute @workgroup_size(64) fn pick(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x;
  if (i >= ldw(W_REL)) { return; }
  L = lems[i];
  if (L.state == S_NONE || L.state >= S_EXIT) { return; }
  let dx = abs(L.x - inp.curX); let dy = abs(L.y - 5 - inp.curY);
  if (dx > 6 || dy > 8) { return; }
  let cant = select(1u, 0u, inp.skill < 8u && canTake(inp.skill));
  atomicMin(&wd[W_HOVKEY], (cant << 27u) | (u32(dx + dy) << 22u) | (0x3fffffu - i));
}

@compute @workgroup_size(1) fn assign() {
  let key = atomicExchange(&wd[W_HOVKEY], 0xffffffffu);
  if (key == 0xffffffffu) { atomicStore(&wd[W_HOV], 0u); }
  else {
    let i = 0x3fffffu - (key & 0x3fffffu);
    L = lems[i];
    atomicStore(&wd[W_HOV], i + 1u);
    atomicStore(&wd[W_HOVSTATE], L.state);
    atomicStore(&wd[W_HOVFLAGS], L.flags);
  }
  if (inp.click == ldw(W_CLICK)) { return; }
  atomicStore(&wd[W_CLICK], inp.click);
  let s = inp.skill;
  if (key == 0xffffffffu || s >= 8u || ldw(W_DONE) != 0u || ldw(W_SKILL + s) == 0u) { return; }
  let i = 0x3fffffu - (key & 0x3fffffu);
  if (!canTake(s)) { return; }
  applySkill(s);
  lems[i] = L;
  atomicSub(&wd[W_SKILL + s], 1u);
  atomicStore(&wd[W_HOVSTATE], L.state);
  atomicStore(&wd[W_HOVFLAGS], L.flags);
  sound(1u);
}

// blockers mark the pixels around them, stamped with the tick so the field never needs clearing
@compute @workgroup_size(64) fn fieldStamp(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x;
  if (i >= ldw(W_REL)) { return; }
  let l = lems[i];
  if (l.state != S_BLOCK) { return; }
  let stamp = (ldw(W_TICK) & 0x3fffffffu) << 2u;
  for (var dy = -10; dy <= 0; dy++) {
    let y = l.y + dy;
    if (y < 0 || y >= LH()) { continue; }
    for (var dx = -6; dx <= 6; dx++) {
      let x = l.x + dx;
      if (dx == 0 || x < 0 || x >= LW()) { continue; }
      aux[FOFF + u32(y * LW() + x)] = stamp | select(1u, 2u, dx > 0);
    }
  }
}

@compute @workgroup_size(64) fn classify(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x;
  if (ldw(W_DONE) != 0u || i >= ldw(W_REL)) { return; }
  L = lems[i];
  if (L.state == S_NONE) { return; }
  if ((L.flags & F_BOMB) != 0u && L.timer > 0 && L.state < S_OHNO) {
    L.timer -= 1;
    if (L.timer == 0) {
      let air = L.state == S_FALL || L.state == S_FLOAT || L.state == S_CLIMB || L.state == S_HOIST || L.state == S_JUMP;
      if (air) { explode(); } else { toState(S_OHNO); sound(2u); }
    }
  }
  lems[i] = L;
  let n = atomicAdd(&wd[W_QC + L.state], 1u);
  aux[L.state * MAXL + n] = i;
}

@group(1) @binding(0) var<storage, read_write> args: array<u32>;

@compute @workgroup_size(1) fn queueArgs() {
  for (var s = 0u; s < NS; s++) {
    args[s * 3u] = (ldw(W_QC + s) + 63u) / 64u; args[s * 3u + 1u] = 1u; args[s * 3u + 2u] = 1u;
  }
}

@compute @workgroup_size(1) fn editArgs() {
  args[NS * 3u] = min(ldw(W_NREM), MAXE); args[NS * 3u + 1u] = 1u; args[NS * 3u + 2u] = 1u;
  args[NS * 3u + 3u] = min(ldw(W_NADD), MAXE); args[NS * 3u + 4u] = 1u; args[NS * 3u + 5u] = 1u;
}

// the index of the lemming this thread runs for state s, or -1
fn slot(s: u32, g: u32) -> i32 {
  if (g >= ldw(W_QC + s)) { return -1; }
  return i32(aux[s * MAXL + g]);
}

fn doWalk() {
  let pd = pushDir(L.x, L.y);
  if (pd != 0 && pd != L.dir) { L.dir = pd; }
  let x = L.x + L.dir;
  if (solid(x, L.y)) {
    var h = 1;
    loop { if (h > 7 || !solid(x, L.y - h)) { break; } h += 1; }
    if (h <= 2) { L.x = x; L.y -= h; }
    else if (h <= 6) { L.x = x; toState(S_JUMP); return; }
    else if ((L.flags & F_CLIMB) != 0u) { toState(S_CLIMB); return; }
    else { L.dir = -L.dir; return; }
  } else {
    L.x = x;
    if (!followDown()) { hazards(); return; }
  }
  L.frame += 1u;
  hazards();
}

fn doJump() {
  for (var k = 0; k < 2; k++) { if (solid(L.x, L.y)) { L.y -= 1; } }
  L.frame += 1u;
  if (!solid(L.x, L.y)) { toState(S_WALK); }
}

fn doFall() {
  for (var k = 0; k < 3; k++) {
    if (solid(L.x, L.y + 1)) {
      if (L.fall > 60) { toState(S_SPLAT); sound(4u); } else { toState(S_WALK); }
      L.fall = 0;
      hazards();
      return;
    }
    L.y += 1; L.fall += 1;
    if (L.y >= LH()) { break; }
  }
  L.frame += 1u;
  if ((L.flags & F_FLOAT) != 0u && L.fall > 16) { toState(S_FLOAT); }
  hazards();
}

fn doFloat() {
  L.frame += 1u;
  let steps = select(1, 2, L.frame > 6u);
  for (var k = 0; k < steps; k++) {
    if (solid(L.x, L.y + 1)) { toState(S_WALK); L.fall = 0; hazards(); return; }
    L.y += 1;
  }
  hazards();
}

fn doClimb() {
  L.frame += 1u;
  if (!solid(L.x + L.dir, L.y) && !solid(L.x + L.dir, L.y - 4)) { startFall(); return; }
  if ((L.frame & 1u) == 0u) {
    if (solid(L.x, L.y - 10) || L.y <= 10) { L.dir = -L.dir; L.x += L.dir; startFall(); return; }
    L.y -= 1;
  }
  if (!solid(L.x + L.dir, L.y - 7)) { toState(S_HOIST); }
}

fn doHoist() {
  L.frame += 1u;
  if (L.frame < 8u) { return; }
  L.x += L.dir;
  for (var k = 0; k < 12; k++) { if (!solid(L.x, L.y)) { break; } L.y -= 1; }
  toState(S_WALK);
}

fn doBuild() {
  if (!solid(L.x, L.y + 1)) { startFall(); return; }
  let f = L.frame % 16u;
  var bricks = (L.flags >> 8u) & 255u;
  if (f == 8u) {
    pushEdit(AOFF, W_NADD, K_BRICK, L.x, L.y, L.dir);
    bricks += 1u;
    L.flags = (L.flags & 0xffu) | (bricks << 8u);
    if (bricks >= 10u) { sound(7u); }
  }
  if (f == 15u) {
    let nx = L.x + 2 * L.dir;
    if (solid(L.x + L.dir, L.y - 1) || solid(nx, L.y - 1) || solid(L.x + L.dir, L.y - 9)) {
      L.dir = -L.dir; toState(S_WALK); return;
    }
    L.x = nx; L.y -= 1;
    if (bricks >= 12u) { toState(S_SHRUG); return; }
  }
  L.frame += 1u;
}

fn doShrug() {
  L.frame += 1u;
  if (L.frame >= 8u) { toState(S_WALK); }
}

fn doBash() {
  if (!solid(L.x, L.y + 1) && !solid(L.x, L.y + 2) && !solid(L.x, L.y + 3)) { startFall(); return; }
  let f = L.frame % 16u;
  if (f == 0u) {
    var steel = false; var any = false;
    for (var dx = 1; dx <= 12; dx++) {
      for (var dy = 0; dy <= 9; dy++) {
        let m = terr(L.x + L.dir * dx, L.y - dy);
        if (isSolid(m)) { any = true; if (m == M_STEEL && dx <= 8) { steel = true; } }
      }
    }
    if (steel) { L.dir = -L.dir; toState(S_WALK); sound(7u); return; }
    if (!any) { toState(S_WALK); return; }
    pushEdit(EOFF, W_NREM, K_BASH, L.x, L.y, L.dir);
  }
  if (f == 3u || f == 6u || f == 9u || f == 12u) {
    let x = L.x + L.dir;
    if (solid(x, L.y) && solid(x, L.y - 1)) { L.frame += 1u; return; }   // waiting for the carve
    L.x = x;
    if (solid(L.x, L.y)) { L.y -= 1; }
    else if (!solid(L.x, L.y + 1)) { if (solid(L.x, L.y + 2)) { L.y += 1; } else if (solid(L.x, L.y + 3)) { L.y += 2; } }
  }
  L.frame += 1u;
  hazards();
}

fn inMine(u: i32, v: i32) -> bool { return u >= 0 && v >= -2 && (u - 3) * (u - 3) + (v - 2) * (v - 2) <= 36; }

fn doMine() {
  if (!followDown()) { hazards(); return; }
  let f = L.frame % 24u;
  if (f == 0u) {
    var steel = false;
    for (var u = 0; u <= 9; u++) {
      for (var v = -2; v <= 8; v++) {
        if (inMine(u, v) && terr(L.x + L.dir * u, L.y - v) == M_STEEL) { steel = true; }
      }
    }
    if (steel) { L.dir = -L.dir; toState(S_WALK); sound(7u); return; }
    pushEdit(EOFF, W_NREM, K_MINE, L.x, L.y, L.dir);
  }
  if (f == 12u) {
    L.x += 2 * L.dir;
    if (!followDown()) { hazards(); return; }
  }
  L.frame += 1u;
  hazards();
}

fn doDig() {
  let f = L.frame % 8u;
  if (f == 0u) {
    if (terr(L.x, L.y + 1) == M_STEEL) { toState(S_WALK); sound(7u); return; }
    var any = false;
    for (var dx = -4; dx <= 4; dx++) {
      for (var dy = 1; dy <= 2; dy++) { let m = terr(L.x + dx, L.y + dy); if (m == M_DIRT || m == M_BRICK) { any = true; } }
    }
    if (!any) {
      if (solid(L.x, L.y + 1)) { toState(S_WALK); } else { startFall(); }
      return;
    }
    pushEdit(EOFF, W_NREM, K_DIG, L.x, L.y, 0);
  }
  if (f == 4u) {
    for (var d = 0; d < 2; d++) { if (solid(L.x, L.y + 1)) { break; } L.y += 1; }
  }
  L.frame += 1u;
  hazards();
}

fn doBlock() {
  L.frame += 1u;
  if (!solid(L.x, L.y + 1)) { startFall(); }
}

fn doOhno() {
  L.frame += 1u;
  if (!solid(L.x, L.y + 1)) { L.y += 1; if (L.y >= LH()) { die(); return; } }
  if (L.frame >= 16u) { explode(); }
}

fn doFade(frames: u32, saved: bool) {
  L.frame += 1u;
  if (L.frame < frames) { return; }
  L.state = S_NONE;
  if (saved) { atomicAdd(&wd[W_SAVED], 1u); } else { atomicAdd(&wd[W_DEAD], 1u); }
}
`;

// one entry point per state, each a few lines around its do* function
const STATE_FNS = [
  ["WALK", "doWalk()"], ["FALL", "doFall()"], ["FLOAT", "doFloat()"], ["CLIMB", "doClimb()"], ["HOIST", "doHoist()"],
  ["BUILD", "doBuild()"], ["SHRUG", "doShrug()"], ["BASH", "doBash()"], ["MINE", "doMine()"], ["DIG", "doDig()"],
  ["BLOCK", "doBlock()"], ["JUMP", "doJump()"], ["OHNO", "doOhno()"], ["EXIT", "doFade(10u, true)"],
  ["SPLAT", "doFade(16u, false)"], ["DROWN", "doFade(16u, false)"], ["POP", "doFade(12u, false)"],
];
export const STATE_KERNELS = STATE_FNS.map(([s]) => "k" + s);
const STATE_ENTRIES = STATE_FNS.map(([s, call]) => `
@compute @workgroup_size(64) fn k${s}(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_${s}, g.x);
  if (i < 0) { return; }
  L = lems[i];
  ${call};
  lems[i] = L;
}`).join("\n");

const EDITS = /* wgsl */ `
fn inMask(kind: u32, u: i32, v: i32) -> bool {
  switch (kind) {
    case 1u: { return !(u >= 7 && (v <= 1 || v >= 8)); }
    case 2u: { return u >= 0 && v >= -2 && (u - 3) * (u - 3) + (v - 2) * (v - 2) <= 36; }
    case 3u: { return true; }
    case 4u: { return u * u * 121 + (v - 5) * (v - 5) * 81 <= 9801; }
    default: { return true; }
  }
}

// one workgroup per edit; its threads share the pixels of the edit's bounding box
fn applyEdit(o: u32, li: u32) {
  let kind = aux[o]; let x = bitcast<i32>(aux[o + 1u]); let y = bitcast<i32>(aux[o + 2u]); let dir = bitcast<i32>(aux[o + 3u]);
  var u0 = 1; var v0 = 0; var bw = 8; var bh = 10;      // bash
  if (kind == K_MINE) { u0 = 0; v0 = -2; bw = 10; bh = 11; }
  if (kind == K_DIG) { u0 = -4; v0 = -2; bw = 9; bh = 2; }
  if (kind == K_BOMB) { u0 = -9; v0 = -6; bw = 19; bh = 23; }
  if (kind == K_BRICK) { u0 = 0; v0 = 0; bw = 6; bh = 1; }
  let mirror = kind != K_DIG && kind != K_BOMB;
  for (var k = i32(li); k < bw * bh; k += 64) {
    let u = u0 + k % bw; let v = v0 + k / bw;
    if (!inMask(kind, u, v)) { continue; }
    let px = x + select(u, dir * u, mirror); let py = y - v;
    if (px < 0 || px >= LW() || py < 0 || py >= LH()) { continue; }
    let p = u32(py * LW() + px);
    let m = ter[p] & 255u;
    if (kind == K_BRICK) { if (!isSolid(m)) { ter[p] = M_BRICK; } }
    else if (m != M_STEEL) { ter[p] = M_AIR; }
  }
}

@compute @workgroup_size(64) fn carve(@builtin(workgroup_id) wg: vec3u, @builtin(local_invocation_index) li: u32) {
  applyEdit(EOFF + wg.x * 4u, li);
}
@compute @workgroup_size(64) fn lay(@builtin(workgroup_id) wg: vec3u, @builtin(local_invocation_index) li: u32) {
  applyEdit(AOFF + wg.x * 4u, li);
}
`;

const RENDER = /* wgsl */ `
fn hash(x: i32, y: i32) -> u32 {
  var h = bitcast<u32>(x) * 374761393u + bitcast<u32>(y) * 668265263u;
  h = (h ^ (h >> 13u)) * 1274126177u;
  return h ^ (h >> 16u);
}
fn hf(x: i32, y: i32) -> f32 { return f32(hash(x, y) & 1023u) / 1023.0; }
fn vnoise(x: f32, y: f32) -> f32 {
  let i = vec2i(floor(vec2f(x, y))); let f = fract(vec2f(x, y)); let u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hf(i.x, i.y), hf(i.x + 1, i.y), u.x), mix(hf(i.x, i.y + 1), hf(i.x + 1, i.y + 1), u.x), u.y);
}
fn rgb(c: u32) -> vec3f { return vec3f(f32(c & 255u), f32((c >> 8u) & 255u), f32((c >> 16u) & 255u)) / 255.0; }
fn pack(c: vec3f) -> u32 {
  let q = vec3u(clamp(c, vec3f(0.0), vec3f(1.0)) * 255.0 + 0.5);
  return q.x | (q.y << 8u) | (q.z << 16u) | 0xff000000u;
}
fn pal(i: u32) -> vec3f {
  switch (i) {
    case 1u: { return vec3f(0.16, 0.78, 0.24); }
    case 2u: { return vec3f(0.24, 0.35, 0.9); }
    case 3u: { return vec3f(0.94, 0.78, 0.63); }
    case 4u: { return vec3f(1.0, 1.0, 1.0); }
    case 5u: { return vec3f(0.59, 0.37, 0.18); }
    case 6u: { return vec3f(0.88, 0.2, 0.18); }
    case 7u: { return vec3f(0.67, 0.67, 0.7); }
    case 8u: { return vec3f(0.12, 0.12, 0.12); }
    case 9u: { return vec3f(0.98, 0.9, 0.27); }
    case 10u: { return vec3f(0.96, 0.55, 0.16); }
    case 11u: { return vec3f(0.55, 0.78, 1.0); }
    case 12u: { return vec3f(1.0, 0.47, 0.63); }
    default: { return vec3f(0.47, 1.0, 0.47); }
  }
}

fn plot(x: i32, y: i32, c: u32, i: u32) {
  let sy = y - inp.camY;
  if (sy < 0 || sy >= i32(inp.vh)) { return; }
  let sx = x - inp.camX;
  if (sx < 0 || sx >= i32(inp.vw)) { return; }
  atomicMax(&fb[u32(sy) * inp.vw + u32(sx)], ((i + 1u) << 4u) | c);
}

fn drawFrame(fr: u32, x: i32, y: i32, dir: i32, i: u32) {
  for (var row = 0u; row < 16u; row++) {
    let bits = rom[R_SPR + fr * 16u + row];
    if (bits == 0u) { continue; }
    for (var c = 0u; c < 8u; c++) {
      let p = (bits >> (c * 4u)) & 15u;
      if (p == 0u) { continue; }
      let sx = select(x + 3 - i32(c), x + i32(c) - 4, dir > 0);
      plot(sx, y - 15 + i32(row), p, i);
    }
  }
}

@compute @workgroup_size(64) fn sprites(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x;
  if (i >= ldw(W_REL)) { return; }
  let l = lems[i];
  if (l.state == S_NONE) { return; }
  // minimap dot
  let mx = u32(clamp(l.x, 0, LW() - 1)) * inp.vw / u32(LW());
  let my = inp.vh + u32(clamp(l.y - 4, 0, LH() - 1)) * inp.mmh / u32(LH());
  atomicMax(&fb[my * inp.vw + mx], ((i + 1u) << 4u) | 15u);
  if (l.x < inp.camX - 8 || l.x > inp.camX + i32(inp.vw) + 8 || l.y < inp.camY - 4 || l.y > inp.camY + i32(inp.vh) + 20) { return; }
  let m = R_SMETA + l.state * 4u;
  let fr = rom[m] + (l.frame >> rom[m + 2u]) % rom[m + 1u];
  drawFrame(fr, l.x, l.y, l.dir, i);
  if ((l.flags & F_BOMB) != 0u && l.timer > 0 && l.state < S_OHNO) {
    let d = u32((l.timer + TPS - 1) / TPS);
    drawFrame(rom[R_DIGITS] + d, l.x - 1, l.y - 1 - 10, 1, i);
  }
}

fn theme(k: u32) -> vec3f { return rgb(rom[R_THEME + k]); }

fn open(x: i32, y: i32) -> bool { return !isSolid(terr(x, y)); }

fn terrainColor(x: i32, y: i32, m: u32, ci: u32) -> vec3f {
  if (ci != 0u) {
    // a drawn piece: its own shaded colour, a little grain, and lit and shadowed edges
    var c = rgb(rom[R_PAL + ci]) * (0.94 + 0.12 * hf(x, y));
    if (m != M_DECOR) {
      if (open(x, y - 1)) { c = c * 1.18 + vec3f(0.03); }
      else if (open(x, y + 1)) { c *= 0.7; }
    }
    return c;
  }
  if (m == M_STEEL) {
    let tx = x & 7; let ty = y & 7;
    var v = 0.52 + 0.06 * hf(x >> 3, y >> 3);
    if (tx == 0 || ty == 0) { v = 0.74; }
    if (tx == 7 || ty == 7) { v = 0.3; }
    if ((tx == 2 || tx == 5) && (ty == 2 || ty == 5)) { v = 0.86; }
    return vec3f(v, v, v * 1.06);
  }
  if (m == M_BRICK) {
    var c = vec3f(0.86, 0.74, 0.5);
    if (((x + y * 3) % 6 + 6) % 6 == 0) { c *= 0.8; }
    return c;
  }
  let fx = f32(x); let fy = f32(y);
  let n = 0.5 * vnoise(fx / 11.0, fy / 7.0) + 0.3 * vnoise(fx / 4.0, fy / 3.0) + 0.2 * hf(x, y);
  var c = mix(theme(0u), theme(1u), smoothstep(0.25, 0.8, n));
  if (abs(vnoise(fx / 6.0 + 40.0, fy / 6.0) - 0.5) < 0.035) { c *= 0.72; }
  if (hf(x >> 1, y >> 1) > 0.985) { c = mix(c, vec3f(1.0), 0.25); }
  let grass = 1 + i32(hash(x, 99) % 3u);
  var lit = false;
  for (var k = 1; k <= 3; k++) {
    if (open(x, y - k)) { if (k <= grass) { c = theme(2u) * (1.15 - 0.15 * f32(k)); } else { c = mix(c, theme(2u), 0.35); } lit = true; break; }
  }
  if (!lit) {
    if (open(x, y + 1)) { c *= 0.6; }
    else if (open(x - 1, y) || open(x + 1, y)) { c *= 0.8; }
  }
  return c;
}

// the hatch: a wooden box whose doors open over OPEN_TICKS; hx, hy is where lemmings drop from
fn hatchColor(x: i32, y: i32, hx: i32, hy: i32, c: vec3f) -> vec3f {
  let dx = x - hx; let dy = y - hy;
  if (abs(dx) > 15 || dy < -21 || dy > -1) { return c; }
  let wood = vec3f(0.5, 0.31, 0.14) * (0.85 + 0.15 * hf(x, y >> 2));
  if (dy <= -19) { return vec3f(0.33, 0.2, 0.09); }
  if (abs(dx) >= 13 || dy <= -17) { return wood * 1.15; }
  let t = f32(min(ldw(W_TICK), OPEN_TICKS)) / f32(OPEN_TICKS);
  if (f32(abs(dx)) < t * 12.5) { return vec3f(0.03, 0.02, 0.02); }
  var w = wood * 0.9;
  if ((dx & 3) == 0) { w *= 0.75; }
  return w;
}

// the exit: a stone arch with torches; ex, ey is the floor row lemmings walk in on
fn exitColor(x: i32, y: i32, ex: i32, ey: i32, c: vec3f) -> vec3f {
  let dx = abs(x - ex); let dy = y - ey;
  let t = i32(inp.time / 3u);
  if (dx >= 8 && dx <= 10 && dy >= -29 && dy <= -24) {
    let f = hf(x * 7 + t, y + t * 3);
    let h = f32(dy + 29) / 6.0;
    if (f < 0.25 + 0.6 * h) { return mix(vec3f(1.0, 0.95, 0.4), vec3f(0.95, 0.35, 0.08), 1.0 - h + 0.3 * f); }
    return c;
  }
  if (dx > 10 || dy < -23 || dy > 0) { return c; }
  let stone = vec3f(0.62, 0.58, 0.52) * (0.8 + 0.2 * hf(x >> 1, y >> 1));
  if (dy <= -20) { return stone * select(1.0, 0.75, ((x >> 2) & 1) == 0 && dy == -20); }
  if (dx >= 8) { return stone * select(1.0, 0.7, dx == 10); }
  let glow = f32(dy + 20) / 20.0;
  return mix(vec3f(0.12, 0.04, 0.02), vec3f(0.95, 0.55, 0.15), glow * glow * (0.8 + 0.2 * hf(t, x)));
}

// two silhouette layers behind the terrain, scrolling slower than it; the theme picks their shape
fn ridge(bx: f32, kind: u32, near: bool) -> f32 {
  let h = 160.0;
  let s = select(1.0, 0.7, near);
  switch (kind) {
    case 1u: { // crystal spires
      let cell = floor(bx / 14.0); let f = fract(bx / 14.0);
      let tall = 0.25 + 0.75 * hf(i32(cell), select(3, 9, near));
      return select(h * 0.42, h * 0.6, near) + (1.0 - tall * (1.0 - abs(f - 0.5) * 2.0)) * h * 0.35 * s;
    }
    case 2u: { // forest
      let base = select(h * 0.5, h * 0.66, near) + 10.0 * vnoise(bx / 50.0, select(1.0, 5.0, near));
      return base - 9.0 * s * pow(abs(sin(bx * 0.21 + 1.7 * vnoise(bx / 9.0, 2.0))), 3.0);
    }
    case 3u: { // ruined city: flat-topped towers
      let cell = floor(bx / select(18.0, 26.0, near));
      return select(h * 0.4, h * 0.6, near) + h * 0.3 * s * hf(i32(cell), select(11, 17, near));
    }
    default: { // mountains
      return select(h * 0.42, h * 0.62, near) + 22.0 * s * vnoise(bx / 70.0, select(2.0, 7.0, near)) + 7.0 * vnoise(bx / 17.0, select(4.0, 8.0, near));
    }
  }
}

fn sceneColor(x: i32, y: i32) -> vec3f {
  let fy = f32(y) / f32(LH());
  var c = mix(theme(3u), theme(4u), fy);
  let sx = f32(x - inp.camX); let cx = f32(inp.camX);
  let kind = rom[R_THEME + 8u];
  // in a level taller than the view, the ridges sit at the bottom and drop away as the view rises
  let rise = f32(LH() - i32(inp.vh) - inp.camY);
  let by = f32(y - inp.camY) + f32(i32(inp.vh) - 160);
  if (by - rise * 0.5 > ridge(sx + cx * 0.6, kind, true)) { c = mix(theme(7u), theme(4u), 0.15 * fy); }
  else if (by - rise * 0.25 > ridge(sx + cx * 0.3, kind, false)) { c = mix(theme(6u), theme(4u), 0.2 * fy); }
  else {
    let star = hf(x, y * 3 + 5);
    if (star > 0.9965) { c += vec3f(0.5 + 0.4 * sin(f32(inp.time) * 0.05 + star * 900.0)) * (1.0 - fy); }
  }
  let w = ter[u32(y * LW() + x)];
  let m = w & 255u;
  if (m != M_AIR) { c = terrainColor(x, y, m, (w >> 8u) & 255u); }
  else {
    for (var k = 0u; k < rom[R_NWATER]; k++) {
      let o = R_WATER + k * 3u;
      let wy = i32(rom[o + 2u]);
      if (x >= i32(rom[o]) && x <= i32(rom[o + 1u]) && y >= wy - 1) {
        let wave = sin(f32(x) * 0.31 + f32(inp.time) * 0.12) + sin(f32(x) * 0.13 - f32(inp.time) * 0.07);
        let top = wy + i32(round(wave * 0.8));
        if (y >= top) {
          c = theme(5u) * (0.75 + 0.25 * hf(x >> 2, (y + i32(inp.time / 4u)) >> 1));
          if (y == top) { c = mix(c, vec3f(0.9, 0.95, 1.0), 0.6); }
        }
      }
    }
  }
  for (var k = 0u; k < rom[R_NHATCH]; k++) { c = hatchColor(x, y, i32(rom[R_HATCH + k * 2u]), i32(rom[R_HATCH + k * 2u + 1u]), c); }
  for (var k = 0u; k < rom[R_NEXIT]; k++) { c = exitColor(x, y, i32(rom[R_EXIT + k * 2u]), i32(rom[R_EXIT + k * 2u + 1u]), c); }
  return c;
}

fn miniColor(x: i32, y: i32) -> vec3f {
  var m = terr(x, y);
  if (!isSolid(m)) { m = terr(x, y + 2); }
  if (m == M_DECOR) { m = M_AIR; }
  if (m == M_STEEL) { return vec3f(0.6); }
  if (m == M_BRICK) { return vec3f(0.8, 0.7, 0.45); }
  if (m == M_DIRT) { return theme(0u) * 0.9 + vec3f(0.05); }
  for (var k = 0u; k < rom[R_NWATER]; k++) {
    let o = R_WATER + k * 3u;
    if (x >= i32(rom[o]) && x <= i32(rom[o + 1u]) && y >= i32(rom[o + 2u])) { return theme(5u); }
  }
  return vec3f(0.0);
}

@compute @workgroup_size(8, 8) fn composite(@builtin(global_invocation_id) g: vec3u) {
  let vw = inp.vw; let vh = inp.vh;
  if (g.x >= vw || g.y >= vh + inp.mmh) { return; }
  let p = g.y * vw + g.x;
  let o = atomicLoad(&fb[p]);
  atomicStore(&fb[p], 0u);
  var c: vec3f;
  if (g.y < vh) {
    let x = inp.camX + i32(g.x); let y = inp.camY + i32(g.y);
    if (o != 0u) { c = pal(o & 15u); } else { c = sceneColor(x, y); }
    let hv = ldw(W_HOV);
    if (hv != 0u) {
      let l = lems[hv - 1u];
      let bx = x - l.x; let by = y - l.y;
      let edge = ((bx == -6 || bx == 5) && by >= -13 && by <= 1) || ((by == -13 || by == 1) && bx >= -6 && bx <= 5);
      if (edge && ((bx + by) & 1) == 0) { c = vec3f(1.0); }
    }
  } else {
    let my = i32(g.y - vh);
    let x = i32(g.x) * LW() / i32(vw); let y = my * LH() / i32(inp.mmh);
    if (o != 0u) { c = pal(15u); } else { c = miniColor(x, y); }
    let v0 = inp.camX * i32(vw) / LW(); let v1 = (inp.camX + i32(vw)) * i32(vw) / LW() - 1;
    let w0 = inp.camY * i32(inp.mmh) / LH(); let w1 = (inp.camY + i32(vh)) * i32(inp.mmh) / LH() - 1;
    let gx = i32(g.x);
    let inX = gx >= v0 && gx <= v1; let inY = my >= w0 && my <= w1;
    if (((gx == v0 || gx == v1) && inY) || ((my == w0 || my == w1) && inX)) { c = vec3f(0.95, 0.85, 0.2); }
    if (my == 0 && (gx < v0 || gx > v1)) { c = vec3f(0.25); }
  }
  atomicStore(&fb[COL + p], pack(c));
}
`;

export function makeWGSL() { return COMMON + SIM + STATE_ENTRIES + EDITS + RENDER; }

export const PRESENT_WGSL = /* wgsl */ `
struct Dims { w: u32, h: u32, col: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> fb: array<u32>;
@group(0) @binding(1) var<uniform> dims: Dims;
@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));
  return vec4f(p * 2.0 - 1.0, 0.0, 1.0);
}
@fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let x = min(u32(pos.x), dims.w - 1u); let y = min(u32(pos.y), dims.h - 1u);
  let c = fb[dims.col + y * dims.w + x];
  return vec4f(f32(c & 255u), f32((c >> 8u) & 255u), f32((c >> 16u) & 255u), 255.0) / 255.0;
}
`;
