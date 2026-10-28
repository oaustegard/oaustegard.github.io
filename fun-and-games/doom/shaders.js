// WGSL for the whole game. JS fills in the buffer offsets per WAD and per
// level, so every table is a constant index into one of four arrays.
//
//   G  gfx: palette, colormaps, textures, flats, sprites, state and thing tables
//   M  map: vertexes, lines, sides, segs, subsectors, nodes, blockmap
//   S  sectors (read-write: heights, light, movers)
//   O  mobjs (read-write)
//   LS line specials and side textures (read-write)
//   P  world: the player, counters, sound and button queues
//   FB palette-index framebuffer, depth, visible sprites
//
// Kernels: ticPlayer, ticMobjs, ticActivate, ticWorld (one thread each, one
// game tic between them), project (one thread per mobj),
// render (one thread per screen column), hud (one thread per pixel).

import { SPRNAMES, SFX, MT, S as ST, MF, ACTIONS } from "./info.js?v=20261028170147";
import { AC, TR, DOOR, FLOOR, PLAT, CEIL, MSG } from "./specials.js?v=20261028170147";

export const MOBJ_WORDS = 32;
export const SECTOR_WORDS = 32;
export const WORLD_WORDS = 320;
export const MAXVIS = 256;

const constBlock = (prefix, obj, type = "u32") =>
  Object.entries(obj).map(([k, v]) => `const ${prefix}${k.replace(/[^A-Za-z0-9_]/g, "_")}: ${type} = ${v}${type === "u32" ? "u" : ""};`).join("\n");

export function makeWGSL({ gfx, map, maxMobjs }) {
  const G = gfx.layout, M = map.layout, c = map.counts;
  const spr = Object.fromEntries(SPRNAMES.map((n, i) => [n, i]));
  const sfx = Object.fromEntries(SFX.map((n, i) => [n, i]));
  const hud = (n) => gfx.hudIndex.get(n) ?? 0xffff;
  const hudArr = (names) => `array<u32, ${names.length}>(${names.map((n) => hud(n) + "u").join(", ")})`;
  const msgId = (m) => MSG[m] ?? 0;
  return opaqueLoops(/* wgsl */ `
// ---- layout
const G_PAL = ${G.PAL}u; const G_CMAP = ${G.CMAP}u; const G_TEXDIR = ${G.TEXDIR}u; const G_FLATDIR = ${G.FLATDIR}u;
const G_SPRDIR = ${G.SPRDIR}u; const G_HUDDIR = ${G.HUDDIR}u; const G_SPRFRAMES = ${G.SPRFRAMES}u; const G_FRAMEROT = ${G.FRAMEROT}u;
const G_RNDTABLE = ${G.RNDTABLE}u; const G_FINESINE = ${G.FINESINE}u; const G_TANTOANGLE = ${G.TANTOANGLE}u; const G_STATES = ${G.STATES}u; const G_MOBJINFO = ${G.MOBJINFO}u; const G_TEXELS = ${G.TEXELS}u; const G_LSPEC = ${G.LSPEC}u;
const G_ANIMTEX = ${G.ANIMTEX}u; const G_ANIMFLAT = ${G.ANIMFLAT}u; const G_SWITCH = ${G.SWITCH}u;
const G_MSGDIR = ${G.MSGDIR}u; const G_MSGCHARS = ${G.MSGCHARS}u;
const M_VERT = ${M.VERT}u; const M_LINE = ${M.LINE}u; const M_SIDE = ${M.SIDE}u; const M_SEG = ${M.SEG}u; const M_SSEC = ${M.SSEC}u;
const M_NODE = ${M.NODE}u; const M_REJECT = ${M.REJECT}u; const M_THINGS = ${M.THINGS}u; const M_BMCELL = ${M.BMCELL}u; const M_BMLIST = ${M.BMLIST}u; const M_SECLINE = ${M.SECLINE}u; const M_SECLIST = ${M.SECLIST}u;
const NUMLINES = ${c.lines}u; const NUMSIDES = ${c.sides}u; const NUMSECTORS = ${c.sectors}u; const NUMNODES = ${c.nodes}u;
const BM_X = ${map.bmap.x}.0; const BM_Y = ${map.bmap.y}.0; const BM_W = ${map.bmap.w}; const BM_H = ${map.bmap.h};
const MAXMOBJS = ${maxMobjs}u; const MAXVIS = ${MAXVIS}u;
const SKYFLAT = ${gfx.skyFlat}u; const SKYTEX = ${gfx.texIndex.get("SKY1") ?? 0}u;
const NOTEX = 0xffffu;
// The screen size comes from the frame uniform (U.width, U.height, U.viewh), so turning the
// phone resizes the view without recompiling. FB holds colours, then depth, then the sprite list.
const BORDERFLAT = ${gfx.flatIndex.get("FLOOR7_2") ?? gfx.flatIndex.get("GRNROCK") ?? 0xffff}u;
const PI = 3.14159265358979;
const TAU = 6.28318530717959;

${constBlock("SPR_", spr)}
${constBlock("SFX_", sfx)}
${constBlock("MT_", MT)}
${constBlock("MF_", MF)}
${constBlock("S_", ST)}
${constBlock("A_", Object.fromEntries(ACTIONS.map((n, i) => [n, i])))}
const NOREQ = 0xffffffffu; const ONFLOORZ = -32768.0;
const MELEERANGE = 64.0; const MISSILERANGE = 2048.0;
const ANG45 = 0x20000000u; const ANG90 = 0x40000000u; const ANG180 = 0x80000000u; const ANG270 = 0xc0000000u; const ANG5 = 59652323u; // ANG90 / 18
const BAM18 = TAU / 16384.0; const BAM20 = TAU / 4096.0; const BAM21 = TAU / 2048.0; const BAM26 = TAU / 64.0;
const MI_SPAWNSTATE = 1u; const MI_SPAWNHEALTH = 2u; const MI_SEESTATE = 3u; const MI_SEESOUND = 4u; const MI_ATTACKSOUND = 6u;
const MI_PAINSTATE = 7u; const MI_PAINCHANCE = 8u; const MI_PAINSOUND = 9u; const MI_MELEESTATE = 10u; const MI_MISSILESTATE = 11u;
const MI_DEATHSTATE = 12u; const MI_XDEATHSTATE = 13u; const MI_DEATHSOUND = 14u; const MI_SPEED = 15u; const MI_RADIUS = 16u;
const MI_HEIGHT = 17u; const MI_MASS = 18u; const MI_DAMAGE = 19u; const MI_ACTIVESOUND = 20u;
const GAMEEPISODE = ${map.episode}; const GAMEMAP = ${map.mapnum}; const COMMERCIAL = ${map.commercial}; const SHAREWARE = ${map.shareware};
${constBlock("AC_", AC)}
${constBlock("TR_", TR)}
${constBlock("DOOR_", DOOR, "i32")}
${constBlock("FLOOR_", FLOOR, "i32")}
${constBlock("PLAT_", PLAT, "i32")}
${constBlock("CEIL_", CEIL, "i32")}

const ML_BLOCKING = 1u; const ML_BLOCKMONSTERS = 2u; const ML_TWOSIDED = 4u; const ML_DONTPEGTOP = 8u; const ML_DONTPEGBOTTOM = 16u; const ML_SECRET = 32u;

const VIEWHEIGHT = 41.0; const MAXMOVE = 30.0; const HALFMOVE = 983040; /* MAXMOVE / 2 in 16.16 */ const STOPSPEED = 0.0625; const FRICTION = 0.90625; const GRAVITY = 1.0;
const MAXBOB = 16.0; const USERANGE = 64.0; const MAXHEALTH = 100;

// ---- data
struct Sector {
  floorh: f32, ceilh: f32, floorpic: u32, ceilpic: u32,
  light: i32, special: i32, tag: i32, mtype: u32,
  msub: i32, mdir: i32, mspeed: f32, mtop: f32,
  mbottom: f32, mwait: i32, mcount: i32, mcrush: u32,
  mtex: u32, mspecial: i32, molddir: i32, mstatus: i32,
  ltype: u32, lcount: i32, lmin: i32, lmax: i32,
  ldark: i32, lbright: i32, ldir: i32, soundtarget: i32,
  pad0: u32, pf: f32, pc: f32, pad3: u32, // pf, pc: floor and ceiling at the previous tic, for drawing between tics
}
struct Mobj {
  x: i32, y: i32, z: f32, angle: u32, // x and y in DOOM's 16.16, angle a 32-bit BAM, so both add up exactly as vanilla's
  momx: f32, momy: f32, momz: f32, floorz: f32,
  ceilingz: f32, radius: f32, height: f32, mtype: u32,
  state: u32, tics: i32, flags: u32, health: i32,
  sector: u32, targ: i32, tracer: i32, movedir: i32,
  movecount: i32, reactiontime: i32, threshold: i32, bnext: i32,   // next thing in its blockmap cell, +1 (0 ends)
  inuse: u32, dropoffz: f32, req: u32, pend: u32, // pend: tics a death takes off (P_KillMobj, + 1), or 0x100 to draw that after the state (P_ExplodeMissile)
  px: f32, py: f32, pz: f32, spawnidx: u32, // position at the previous tic; map thing it spawned from
}
struct World {
  viewx: f32, viewy: f32, viewz: f32, viewangle: f32,
  viewheight: f32, deltaviewheight: f32, bob: f32, extralight: i32,
  leveltime: u32, rng: u32, lastframe: u32, palette: u32,
  health: i32, armor: i32, armortype: i32, cards: u32,
  weapons: u32, readyweapon: i32, pendingweapon: i32, backpack: u32,
  ammo: array<i32, 4>,
  maxammo: array<i32, 4>,
  damagecount: i32, bonuscount: i32, attackdown: u32, usedown: u32,
  powers: array<i32, 6>,
  dead: u32, exit: u32,
  killcount: i32, itemcount: i32, secretcount: i32, message: i32,
  messagetics: i32, viscount: atomic<u32>, sndcount: u32, nummobjs: u32,
  totalkills: i32, totalitems: i32, totalsecrets: i32, onground: u32,
  fixedcolormap: i32, skill: i32, nact: u32, pad1: array<u32, 9>,
  snd: array<vec4<f32>, 32>,
  buttons: array<vec4<i32>, 16>,
  pspstate: array<u32, 2>,
  psptics: array<i32, 2>,
  pspsx: f32, pspsy: f32, refire: i32, attacker: i32,
  face: i32, facecount: i32, facepri: i32, oldhealth: i32,
  lastattackdown: i32, oldweapons: u32,
  pvx: f32, pvy: f32, pvz: f32, pva: f32,   // the view at the previous tic
  rx: f32, ry: f32, rz: f32, ra: f32,       // the view drawn this frame, between the two
  act: array<u32, 32>,                     // line activations waiting for the activate kernel
  cheats: u32,                              // 1 idclip, 2 iddqd, 4 iddt
  mrng: u32,                                // M_Random's index: the status bar's own walk through the table
  initmobjs: u32,                           // the map's own things are 1..initmobjs-1; later spawns follow
  playerslot: u32,                          // the player's thinker runs before this thing (its THINGS place)
  spawncursor: u32,                         // where spawnMobj looks first, so new things append
  mobjtop: u32,                             // one past the highest thing slot ever used: loops stop there
  cmdmove: u32, // this tic's command moves the player (P_XYMovement's stop test reads it)
  pad2: array<u32, 3>,
}
struct Frame {
  width: u32, height: u32, viewh: u32, frame: u32,
  centerx: f32, centery: f32, proj: f32, amscale: f32,
  forward: f32, side: f32, turn: f32, mouseturn: f32,
  buttons: u32, weapon: u32, run: u32, automap: u32,
  frac: f32, lookturn: f32, pad0: u32, zero: u32, // zero: always 0, read by opaqueLoops' bounds
}

@group(0) @binding(0) var<storage, read> G: array<u32>;
@group(0) @binding(1) var<storage, read> M: array<u32>;
@group(0) @binding(2) var<storage, read_write> S: array<Sector>;
@group(0) @binding(3) var<storage, read_write> O: array<Mobj>;
@group(0) @binding(4) var<storage, read_write> LS: array<u32>;
@group(0) @binding(5) var<storage, read_write> P: World;
@group(0) @binding(6) var<storage, read_write> FB: array<u32>;
@group(0) @binding(7) var<uniform> U: Frame;

// ---- accessors
fn mf(i: u32) -> f32 { return bitcast<f32>(M[i]); }
fn gi(i: u32) -> i32 { return bitcast<i32>(G[i]); }
fn vert(i: u32) -> vec2f { let o = M_VERT + 2u * i; return vec2f(mf(o), mf(o + 1u)); }
fn lineA(l: u32) -> vec2f { return vert(M[M_LINE + 8u * l]); }
fn lineB(l: u32) -> vec2f { return vert(M[M_LINE + 8u * l + 1u]); }
fn lineFlags(l: u32) -> u32 { return M[M_LINE + 8u * l + 2u]; }
fn lineTag(l: u32) -> i32 { return i32(M[M_LINE + 8u * l + 3u]); }
fn lineSide(l: u32, s: u32) -> i32 { return bitcast<i32>(M[M_LINE + 8u * l + 4u + s]); }
fn lineFront(l: u32) -> i32 { return bitcast<i32>(M[M_LINE + 8u * l + 6u]); }
fn lineBack(l: u32) -> i32 { return bitcast<i32>(M[M_LINE + 8u * l + 7u]); }
fn sideSector(sd: u32) -> u32 { return M[M_SIDE + 4u * sd + 2u]; }
fn sideTex(sd: u32, part: u32) -> u32 { return LS[NUMLINES + 3u * sd + part]; } // 0 top, 1 bottom, 2 mid
fn setSideTex(sd: u32, part: u32, t: u32) { LS[NUMLINES + 3u * sd + part] = t; }
// LS[l]: the line's special in the low bits, bit 31 once the renderer has drawn it (the automap's ML_MAPPED)
fn lineSpecial(l: u32) -> u32 { return LS[l] & 0xffffu; }
fn clearSpecial(l: u32) { LS[l] &= 0x80000000u; }

fn texel(off: u32) -> u32 { let w = G[G_TEXELS + (off >> 1u)]; return (w >> ((off & 1u) * 16u)) & 0xffffu; }
fn cmap(level: u32, c: u32) -> u32 { return G[G_CMAP + level * 256u + (c & 255u)]; }
fn imod(a: i32, m: i32) -> i32 { let r = a % m; return select(r, r + m, r < 0); }
fn fract1(x: f32) -> f32 { return x - floor(x); }
fn rowOf(y: f32) -> i32 { return i32(ceil(y - 0.5)); }

fn animTex(t: u32) -> u32 {
  if (t == NOTEX) { return t; }
  let n = G[G_ANIMTEX];
  for (var i = 0u; i < n; i++) {
    let a = G[G_ANIMTEX + 1u + 2u * i]; let b = G[G_ANIMTEX + 2u + 2u * i];
    if (t >= a && t <= b) { return a + (t - a + P.leveltime / 8u) % (b - a + 1u); }
  }
  return t;
}
fn animFlat(t: u32) -> u32 {
  let n = G[G_ANIMFLAT];
  for (var i = 0u; i < n; i++) {
    let a = G[G_ANIMFLAT + 1u + 2u * i]; let b = G[G_ANIMFLAT + 2u + 2u * i];
    if (t >= a && t <= b) { return a + (t - a + P.leveltime / 8u) % (b - a + 1u); }
  }
  return t;
}

// R_PointOnSide (quick = its sign-bit shortcut) and P_PointOnLineSide: the line's integer delta times
// the 16.16 offset, each product truncated to whole map units by FixedMul, so a point within about
// 1/64 unit of a line can land on its back side
fn lineSideFx(p: vec2i, a: vec2f, d: vec2f, quick: bool) -> u32 {
  let ax = i32(a.x) << 16u; let ay = i32(a.y) << 16u;
  if (d.x == 0.0) { if (p.x <= ax) { return select(0u, 1u, d.y > 0.0); } return select(0u, 1u, d.y < 0.0); }
  if (d.y == 0.0) { if (p.y <= ay) { return select(0u, 1u, d.x < 0.0); } return select(0u, 1u, d.x > 0.0); }
  let dx = p.x - ax; let dy = p.y - ay;
  let ldx = i32(d.x); let ldy = i32(d.y);
  if (quick && (ldy ^ ldx ^ dx ^ dy) < 0) { return select(0u, 1u, (ldy ^ dx) < 0); }
  return select(1u, 0u, fxMul(dy, ldx) < fxMul(ldy, dx));
}
fn pointInSubsector(p: vec2i) -> u32 {
  if (NUMNODES == 0u) { return 0u; }
  var n = max(NUMNODES, 1u) - 1u;
  for (var guard = 0; guard < 256; guard++) {
    if ((n & 0x8000u) != 0u) { return n & 0x7fffu; }
    let o = M_NODE + 14u * n;
    n = M[o + 12u + lineSideFx(p, vec2f(mf(o), mf(o + 1u)), vec2f(mf(o + 2u), mf(o + 3u)), true)];
  }
  return 0u;
}
fn sectorAt(p: vec2i) -> u32 { return M[M_SSEC + 4u * pointInSubsector(p) + 2u]; }

// light level -> colormap row, DOOM's zlight and scalelight tables
fn startmap(light: i32) -> i32 { let ln = clamp((light >> 4u) + P.extralight, 0, 15); return (15 - ln) * 4; }
fn wallLevel(lightnum: i32, depth: f32) -> u32 {
  if (P.fixedcolormap >= 0) { return u32(P.fixedcolormap); }
  let ln = clamp(lightnum, 0, 15);
  let idx = min(i32(2560.0 / max(depth, 1.0)), 47);
  return u32(clamp((15 - ln) * 4 - idx / 2, 0, 31));
}
fn planeLevel(light: i32, depth: f32) -> u32 {
  if (P.fixedcolormap >= 0) { return u32(P.fixedcolormap); }
  let j = min(i32(depth / 16.0), 127);
  return u32(clamp(startmap(light) - (160 / (j + 1)) / 2, 0, 31));
}

// =====================================================================
// RENDER: one thread per column
// =====================================================================

fn rayBox(p: vec2f, d: vec2f, o: u32) -> bool {
  // box words: top, bottom, left, right
  let top = mf(o); let bottom = mf(o + 1u); let left = mf(o + 2u); let right = mf(o + 3u);
  if (p.x >= left && p.x <= right && p.y >= bottom && p.y <= top) { return true; }
  var t0 = 0.0; var t1 = 1e30;
  if (abs(d.x) < 1e-9) { if (p.x < left || p.x > right) { return false; } }
  else {
    let a = (left - p.x) / d.x; let b = (right - p.x) / d.x;
    t0 = max(t0, min(a, b)); t1 = min(t1, max(a, b));
  }
  if (abs(d.y) < 1e-9) { if (p.y < bottom || p.y > top) { return false; } }
  else {
    let a = (bottom - p.y) / d.y; let b = (top - p.y) / d.y;
    t0 = max(t0, min(a, b)); t1 = min(t1, max(a, b));
  }
  return t0 <= t1;
}

fn putPixel(x: u32, y: i32, c: u32, depth: f32) {
  let i = u32(y) * U.width + x;
  FB[i] = c;
  FB[(U.width * U.height) + i] = bitcast<u32>(depth);
}
fn pixelDepth(x: u32, y: i32) -> f32 { return bitcast<f32>(FB[(U.width * U.height) + u32(y) * U.width + x]); }

fn drawWall(x: u32, y0: i32, y1: i32, tex: u32, u: f32, texmid: f32, scale: f32, level: u32, depth: f32) {
  if (y0 > y1) { return; }
  if (tex == NOTEX) {
    for (var y = y0; y <= y1; y++) { putPixel(x, y, 0u, depth); }
    return;
  }
  let td = G_TEXDIR + 4u * tex;
  let w = i32(G[td]); let h = i32(G[td + 1u]);
  let col = imod(i32(floor(u)), w);
  let base = G[td + 2u] + u32(col * h);
  let iscale = 1.0 / scale;
  for (var y = y0; y <= y1; y++) {
    let v = texmid + (f32(y) + 0.5 - U.centery) * iscale;
    let t = texel(base + u32(imod(i32(floor(v)), h)));
    putPixel(x, y, cmap(level, t), depth);
  }
}

fn drawPlane(x: u32, y0: i32, y1: i32, h: f32, pic: u32, light: i32, depth: f32, p: vec2f, d: vec2f, vz: f32, colAngle: f32) {
  if (y0 > y1) { return; }
  if (pic == SKYFLAT) {
    let td = G_TEXDIR + 4u * SKYTEX;
    let sw = i32(G[td]); let sh = i32(G[td + 1u]);
    let col = imod(i32(floor(fract1(colAngle / TAU) * 1024.0)), sw);
    let base = G[td + 2u] + u32(col * sh);
    let lvl = select(0u, u32(max(P.fixedcolormap, 0)), P.fixedcolormap > 0);
    for (var y = y0; y <= y1; y++) {
      let v = 100.0 + (f32(y) + 0.5 - U.centery) * 320.0 / (f32(U.height) * 1.6);
      putPixel(x, y, cmap(lvl, texel(base + u32(imod(i32(floor(v)), sh)))), 1e30);
    }
    return;
  }
  let off = G[G_FLATDIR + animFlat(pic)];
  for (var y = y0; y <= y1; y++) {
    let dy = f32(y) + 0.5 - U.centery;
    var z = (vz - h) * U.proj / dy;
    if (z <= 0.0) { z = 1e6; }
    let wp = p + d * z;
    let tx = u32(i32(floor(wp.x)) & 63);
    let ty = u32(i32(floor(-wp.y)) & 63);
    let t = texel(off + ty * 64u + tx);
    putPixel(x, y, cmap(planeLevel(light, z), t), depth);
  }
}

@compute @workgroup_size(64)
fn render(@builtin(global_invocation_id) gid: vec3u) {
  let x = gid.x;
  if (x >= U.width) { return; }
  let VH = i32(U.viewh);
  let p = vec2f(P.rx, P.ry);
  let vz = P.rz;
  let ang = P.ra;
  let fw = vec2f(cos(ang), sin(ang));
  let rt = vec2f(sin(ang), -cos(ang));
  let xo = (f32(x) + 0.5 - U.centerx) / U.proj;
  let d = fw + rt * xo;
  let colAngle = ang - atan(xo);
  let cy = U.centery;

  for (var y = 0; y < VH; y++) { putPixel(x, y, 0u, 1e30); }

  var ctop: i32 = 0;
  var cbot: i32 = VH - 1;
  var stack: array<u32, 64>;
  var sp: i32 = 1;
  stack[0] = select(max(NUMNODES, 1u) - 1u, 0x8000u, NUMNODES == 0u);
  // deferred masked mid textures
  var mA: array<vec4f, 16>; // t, u, texmid, scale
  var mB: array<vec4i, 16>; // tex, level, top row, bottom row
  var nm: i32 = 0;

  for (var guard = 0; guard < 4096; guard++) {
    if (sp == 0 || ctop > cbot) { break; }
    sp -= 1;
    let n = stack[sp];
    if ((n & 0x8000u) == 0u) {
      let o = M_NODE + 14u * n;
      let side = select(0u, 1u, (p.y - mf(o + 1u)) * mf(o + 2u) >= mf(o + 3u) * (p.x - mf(o)));
      let far = side ^ 1u;
      if (sp < 64 && rayBox(p, d, o + 4u + 4u * far)) { stack[sp] = M[o + 12u + far]; sp += 1; }
      if (sp < 64 && rayBox(p, d, o + 4u + 4u * side)) { stack[sp] = M[o + 12u + side]; sp += 1; }
      continue;
    }
    let so = M_SSEC + 4u * (n & 0x7fffu);
    let cnt = M[so]; let first = M[so + 1u];
    for (var k = 0u; k < cnt; k++) {
      let sg = M_SEG + 6u * (first + k);
      let a = vert(M[sg]); let b = vert(M[sg + 1u]);
      let e = b - a;
      if (e.x * (p.y - a.y) - e.y * (p.x - a.x) >= 0.0) { continue; }
      let den = d.x * e.y - d.y * e.x;
      if (abs(den) < 1e-9) { continue; }
      let ap = a - p;
      let t = (ap.x * e.y - ap.y * e.x) / den;
      let s = (ap.x * d.y - ap.y * d.x) / den;
      if (s < 0.0 || s > 1.0 || t <= 0.01) { continue; }

      let line = M[sg + 2u]; let segside = M[sg + 3u]; let sdef = M[sg + 5u];
      if ((LS[line] & 0x80000000u) == 0u) { LS[line] |= 0x80000000u; }
      let lflags = lineFlags(line);
      let fsec = sideSector(sdef);
      var F = S[fsec];
      F.floorh = mix(F.pf, F.floorh, U.frac); F.ceilh = mix(F.pc, F.ceilh, U.frac);
      let otherSide = lineSide(line, 1u - segside);
      let scale = U.proj / t;
      let u = mf(sg + 4u) + s * length(e) + mf(M_SIDE + 4u * sdef);
      let yoff = mf(M_SIDE + 4u * sdef + 1u);
      var ln = (F.light >> 4u) + P.extralight;
      if (a.y == b.y) { ln -= 1; } else if (a.x == b.x) { ln += 1; }
      let level = wallLevel(ln, t);
      let fsky = F.ceilpic == SKYFLAT;
      var fceil = F.ceilh;
      let ffloor = F.floorh;
      var bsec = 0u;
      let two = otherSide >= 0 && (lflags & ML_TWOSIDED) != 0u;
      if (two) {
        bsec = sideSector(u32(otherSide));
        if (fsky && S[bsec].ceilpic == SKYFLAT) { fceil = mix(S[bsec].pc, S[bsec].ceilh, U.frac); }
      }
      let ytop = cy - (fceil - vz) * scale;
      let ybot = cy - (ffloor - vz) * scale;
      let rT = rowOf(ytop); let rB = rowOf(ybot);
      let ceilVisible = fceil > vz || fsky;
      let floorVisible = ffloor < vz;
      if (ceilVisible) {
        drawPlane(x, ctop, min(rT - 1, cbot), F.ceilh, F.ceilpic, F.light, t, p, d, vz, colAngle);
      }
      if (floorVisible) {
        drawPlane(x, max(rB, ctop), cbot, ffloor, F.floorpic, F.light, t, p, d, vz, colAngle);
      }
      if (!two) {
        let tex = animTex(sideTex(sdef, 2u));
        var texmid = fceil - vz;
        if ((lflags & ML_DONTPEGBOTTOM) != 0u && tex != NOTEX) { texmid = ffloor + f32(G[G_TEXDIR + 4u * tex + 1u]) - vz; }
        drawWall(x, max(rT, ctop), min(rB - 1, cbot), tex, u, texmid + yoff, scale, level, t);
        ctop = cbot + 1;
        break;
      }
      var B = S[bsec];
      B.floorh = mix(B.pf, B.floorh, U.frac); B.ceilh = mix(B.pc, B.ceilh, U.frac);
      let yh = cy - (B.ceilh - vz) * scale;
      let yl = cy - (B.floorh - vz) * scale;
      let rH = rowOf(yh); let rL = rowOf(yl);
      var newTop = ctop; var newBot = cbot;
      if (ceilVisible) { newTop = max(newTop, rT); }
      if (floorVisible) { newBot = min(newBot, rB - 1); }
      if (B.ceilh < fceil) {
        let tex = animTex(sideTex(sdef, 0u));
        var texmid = fceil - vz;
        if ((lflags & ML_DONTPEGTOP) == 0u && tex != NOTEX) { texmid = B.ceilh + f32(G[G_TEXDIR + 4u * tex + 1u]) - vz; }
        drawWall(x, max(rT, ctop), min(min(rH, rB) - 1, cbot), tex, u, texmid + yoff, scale, level, t);
        newTop = max(newTop, max(rH, rT));
      }
      if (B.floorh > ffloor) {
        let tex = animTex(sideTex(sdef, 1u));
        var texmid = B.floorh - vz;
        if ((lflags & ML_DONTPEGBOTTOM) != 0u) { texmid = fceil - vz; }
        drawWall(x, max(max(rL, rT), ctop), min(rB - 1, cbot), tex, u, texmid + yoff, scale, level, t);
        newBot = min(newBot, min(rL, rB) - 1);
      }
      ctop = newTop; cbot = newBot;
      if (B.ceilh <= ffloor || B.floorh >= fceil) { ctop = cbot + 1; }
      let mtex = sideTex(sdef, 2u);
      if (mtex != NOTEX && nm < 16 && ctop <= cbot) {
        let mt = animTex(mtex);
        var texmid = min(F.ceilh, B.ceilh) - vz;
        if ((lflags & ML_DONTPEGBOTTOM) != 0u) { texmid = max(ffloor, B.floorh) + f32(G[G_TEXDIR + 4u * mt + 1u]) - vz; }
        mA[nm] = vec4f(t, u, texmid + yoff, scale);
        mB[nm] = vec4i(i32(mt), i32(level), ctop, cbot);
        nm += 1;
      }
      break;
    }
  }

  // masked mid textures, depth tested
  for (var i = 0; i < nm; i++) {
    let A = mA[i]; let B = mB[i];
    let td = G_TEXDIR + 4u * u32(B.x);
    let w = i32(G[td]); let h = i32(G[td + 1u]);
    let base = G[td + 2u] + u32(imod(i32(floor(A.y)), w) * h);
    for (var y = B.z; y <= B.w; y++) {
      let v = i32(floor(A.z + (f32(y) + 0.5 - cy) / A.w));
      if (v < 0 || v >= h) { continue; }
      let tx = texel(base + u32(v));
      if ((tx & 0x100u) != 0u && A.x < pixelDepth(x, y)) { putPixel(x, y, cmap(u32(B.y), tx), A.x); }
    }
  }

  // sprites, depth tested
  let nv = min(atomicLoad(&P.viscount), MAXVIS);
  for (var i = 0u; i < nv; i++) {
    let o = (2u * U.width * U.height) + 8u * i;
    let xs = bitcast<i32>(FB[o + 6u]); let xe = bitcast<i32>(FB[o + 7u]);
    if (i32(x) < xs || i32(x) > xe) { continue; }
    let x1 = bitcast<f32>(FB[o]); let scale = bitcast<f32>(FB[o + 1u]); let texmid = bitcast<f32>(FB[o + 2u]);
    let packed = FB[o + 3u]; let level = FB[o + 4u]; let tz = bitcast<f32>(FB[o + 5u]);
    let lump = packed & 0xffffu; let flip = (packed >> 16u) & 1u; let shadow = (packed >> 17u) & 1u;
    let sd = G_SPRDIR + 6u * lump;
    let w = i32(G[sd]); let h = i32(G[sd + 1u]);
    var col = i32(floor((f32(x) + 0.5 - x1) / scale));
    if (flip == 1u) { col = w - 1 - col; }
    if (col < 0 || col >= w) { continue; }
    let base = G[sd + 4u] + u32(col * h);
    let ytop = cy - texmid * scale;
    let y0 = max(0, rowOf(ytop)); let y1 = min(VH - 1, rowOf(ytop + f32(h) * scale) - 1);
    for (var y = y0; y <= y1; y++) {
      let row = clamp(i32(floor((f32(y) + 0.5 - ytop) / scale)), 0, h - 1);
      let tx = texel(base + u32(row));
      if ((tx & 0x100u) != 0u && tz < pixelDepth(x, y)) {
        if (shadow == 1u) {
          let yy = clamp(y + select(-1, 1, ((u32(y) * 7u + x * 13u + P.leveltime) & 2u) != 0u), 0, VH - 1);
          FB[u32(y) * U.width + x] = cmap(6u, FB[u32(yy) * U.width + x]);
        } else {
          putPixel(x, y, cmap(level, tx), tz);
        }
      }
    }
  }
}

// =====================================================================
// PROJECT: one thread per mobj, appends to the visible sprite list
// =====================================================================

@compute @workgroup_size(64)
fn project(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i == 0u || i >= MAXMOBJS) { return; }
  var m = O[i];
  if (m.inuse == 0u) { return; }
  let mx = mix(m.px, fxf(m.x), U.frac); let my = mix(m.py, fxf(m.y), U.frac); m.z = mix(m.pz, m.z, U.frac);
  let st = G_STATES + 8u * m.state;
  let sprite = G[st]; let frame = G[st + 1u];
  let p = vec2f(P.rx, P.ry);
  let fw = vec2f(cos(P.ra), sin(P.ra));
  let rt = vec2f(sin(P.ra), -cos(P.ra));
  let rel = vec2f(mx, my) - p;
  let tz = dot(rel, fw);
  if (tz < 4.0) { return; }
  let tx = dot(rel, rt);
  if (abs(tx) > tz * 4.0 + 64.0) { return; }
  let fr = frame & 0x7fffu;
  let sf = G_SPRFRAMES + 2u * sprite;
  if (fr >= G[sf + 1u]) { return; }
  let a = atan2(rel.y, rel.x);
  let rot = u32(floor(fract1((a - bamToRad(m.angle)) / TAU + 9.0 / 16.0) * 8.0)) & 7u;
  let w = G[G_FRAMEROT + (G[sf] + fr) * 8u + rot];
  if (w == 0xffffffffu) { return; }
  let lump = w & 0x7fffu; let flip = (w >> 15u) & 1u;
  let sd = G_SPRDIR + 6u * lump;
  let sw = f32(G[sd]); let left = f32(gi(sd + 2u)); let top = f32(gi(sd + 3u));
  let scale = U.proj / tz;
  let x1 = U.centerx + (tx - left) * scale;
  let x2 = x1 + sw * scale;
  let xs = max(0, rowOf(x1)); let xe = min(i32(U.width) - 1, rowOf(x2) - 1);
  if (xs > xe) { return; }
  var level = 0u;
  if ((frame & 0x8000u) == 0u) { level = wallLevel((S[m.sector].light >> 4u) + P.extralight, tz); }
  else if (P.fixedcolormap > 0) { level = u32(P.fixedcolormap); }
  let slot = atomicAdd(&P.viscount, 1u);
  if (slot >= MAXVIS) { return; }
  let o = (2u * U.width * U.height) + 8u * slot;
  FB[o] = bitcast<u32>(x1); FB[o + 1u] = bitcast<u32>(scale); FB[o + 2u] = bitcast<u32>(m.z + top - P.rz);
  FB[o + 3u] = lump | (flip << 16u) | (select(0u, 1u, (m.flags & MF_SHADOW) != 0u) << 17u);
  FB[o + 4u] = level; FB[o + 5u] = bitcast<u32>(tz);
  FB[o + 6u] = bitcast<u32>(xs); FB[o + 7u] = bitcast<u32>(xe);
}

// =====================================================================
// HUD: status bar and message line, one thread per pixel
// =====================================================================

var<private> HUD_TNUM = ${hudArr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => "STTNUM" + i))};
var<private> HUD_YSNUM = ${hudArr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => "STYSNUM" + i))};
var<private> HUD_GNUM = ${hudArr([2, 3, 4, 5, 6, 7].map((i) => "STGNUM" + i))};
var<private> HUD_KEYS = ${hudArr([0, 1, 2, 3, 4, 5].map((i) => "STKEYS" + i))};
const HUD_STBAR = ${hud("STBAR")}u; const HUD_STARMS = ${hud("STARMS")}u; const HUD_PRCNT = ${hud("STTPRCNT")}u;
// faces in ST_updateFaceWidget's order: per pain level 0-4, straight x3, turn right, turn left, ouch, evil grin, rampage; then god, dead
var<private> HUD_FACES = ${hudArr([0, 1, 2, 3, 4].flatMap((p) => ["STFST" + p + "0", "STFST" + p + "1", "STFST" + p + "2", "STFTR" + p + "0", "STFTL" + p + "0", "STFOUCH" + p, "STFEVL" + p, "STFKILL" + p]).concat(["STFGOD0", "STFDEAD0"]))};
var<private> HUD_FONT = ${hudArr(Array.from({ length: 63 }, (_, i) => "STCFN" + String(i + 33).padStart(3, "0")))};

// Sample one HUD patch at virtual 320x200 coords (vx, vy) drawn at (px, py). Returns texel or 0.
fn hudPatch(idx: u32, px: f32, py: f32, vx: f32, vy: f32) -> u32 {
  if (idx == 0xffffu) { return 0u; }
  let o = G_HUDDIR + 6u * idx;
  let w = i32(G[o]); let h = i32(G[o + 1u]);
  let cx = i32(floor(vx - (px - f32(gi(o + 2u)))));
  let cy = i32(floor(vy - (py - f32(gi(o + 3u)))));
  if (cx < 0 || cy < 0 || cx >= w || cy >= h) { return 0u; }
  return texel(G[o + 4u] + u32(cx * h + cy));
}
fn hudWidth(idx: u32) -> f32 { if (idx == 0xffffu) { return 0.0; } return f32(G[G_HUDDIR + 6u * idx]); }

// Right-aligned number at x, like STlib_drawNum.
fn hudNum(n: i32, digits: i32, x: f32, y: f32, vx: f32, vy: f32, big: bool) -> u32 {
  var v = max(n, 0);
  var xx = x;
  for (var k = 0; k < digits; k++) {
    let dg = u32(v % 10);
    let idx = select(HUD_YSNUM[dg], HUD_TNUM[dg], big);
    xx -= hudWidth(idx);
    let t = hudPatch(idx, xx, y, vx, vy);
    if (t != 0u) { return t; }
    v /= 10;
    if (v == 0) { break; }
  }
  return 0u;
}

@compute @workgroup_size(8, 8)
fn hud(@builtin(global_invocation_id) gid: vec3u) {
  let x = gid.x; let y = gid.y;
  if (x >= U.width || y >= U.height) { return; }
  // status bar coordinates: the original 320 columns, centred
  let vx = (f32(x) + 0.5 - (f32(U.width) - (f32(U.height) * 1.6)) / 2.0) * 320.0 / (f32(U.height) * 1.6);
  let vy = (f32(y) + 0.5) * 200.0 / f32(U.height);
  if (y >= U.viewh) {
    if (vx < 0.0 || vx >= 320.0) {
      // tile a flat beside the bar, like the border around a shrunken view
      var c = 0u;
      if (BORDERFLAT != 0xffffu) {
        let tx = u32(i32(floor(vx)) & 63); let ty = u32(i32(floor(vy)) & 63);
        c = texel(G[G_FLATDIR + BORDERFLAT] + ty * 64u + tx) & 255u;
      }
      FB[y * U.width + x] = c;
      return;
    }
    var t = hudPatch(HUD_STBAR, 0.0, 168.0, vx, vy);
    var o = 0u;
    var ammoTypes = array<i32, 9>(-1, 0, 1, 0, 3, 2, 2, -1, 1);
    let ammoType = ammoTypes[clamp(P.readyweapon, 0, 8)];
    if (ammoType >= 0) { o = hudNum(P.ammo[ammoType], 3, 44.0, 171.0, vx, vy, true); }
    if (o == 0u) { o = hudNum(P.health, 3, 90.0, 171.0, vx, vy, true); }
    if (o == 0u) { o = hudPatch(HUD_PRCNT, 90.0, 171.0, vx, vy); }
    if (o == 0u) { o = hudNum(P.armor, 3, 221.0, 171.0, vx, vy, true); }
    if (o == 0u) { o = hudPatch(HUD_PRCNT, 221.0, 171.0, vx, vy); }
    if (o == 0u) { o = hudPatch(HUD_STARMS, 104.0, 168.0, vx, vy); }
    for (var i = 0u; i < 6u && o == 0u; i++) {
      let owned = (P.weapons & (1u << (i + 1u))) != 0u;
      let idx = select(HUD_GNUM[i], HUD_YSNUM[i + 2u], owned);
      o = hudPatch(idx, 111.0 + f32(i % 3u) * 12.0, 172.0 + f32(i / 3u) * 10.0, vx, vy);
    }
    if (o == 0u) { o = hudPatch(HUD_FACES[clamp(P.face, 0, 41)], 143.0, 168.0, vx, vy); }
    for (var k = 0u; k < 3u && o == 0u; k++) {
      var card = -1;
      if ((P.cards & (1u << k)) != 0u) { card = i32(k); }
      if ((P.cards & (1u << (k + 3u))) != 0u) { card = i32(k) + 3; }
      if (card >= 0) { o = hudPatch(HUD_KEYS[card], 239.0, 171.0 + f32(k) * 10.0, vx, vy); }
    }
    var ammoY = array<f32, 4>(173.0, 179.0, 191.0, 185.0);
    for (var k = 0; k < 4 && o == 0u; k++) {
      o = hudNum(P.ammo[k], 3, 288.0, ammoY[k], vx, vy, false);
      if (o == 0u) { o = hudNum(P.maxammo[k], 3, 314.0, ammoY[k], vx, vy, false); }
    }
    if (o != 0u) { t = o; }
    FB[y * U.width + x] = t & 255u;
    return;
  }
  // message line at the top of the view
  let mx = (f32(x) + 0.5) * 320.0 / (f32(U.height) * 1.6);
  if (P.messagetics > 0 && P.message > 0 && vy < 9.0) {
    let md = G_MSGDIR + 2u * u32(P.message);
    let start = G[md]; let len = G[md + 1u];
    var cx = 0.0;
    for (var i = 0u; i < len; i++) {
      let ch = G[G_MSGCHARS + start + i];
      if (ch == 32u || ch < 33u || ch > 95u) { cx += 4.0; continue; }
      let idx = HUD_FONT[ch - 33u];
      if (idx == 0xffffu) { cx += 4.0; continue; }
      let t = hudPatch(idx, cx, 1.0, mx, vy);
      if (t != 0u) { FB[y * U.width + x] = t & 255u; return; }
      cx += hudWidth(idx);
      if (cx > mx) { break; }
    }
  }
  // the player's weapon and its muzzle flash (R_DrawPSprite), flash on top
  for (var pp = 0u; pp < 2u && U.automap == 0u; pp++) { // the automap hides the gun
    let pos = 1u - pp;
    let st = P.pspstate[pos];
    if (st == 0u) { continue; }
    let spr = G[G_STATES + 8u * st]; let frame = G[G_STATES + 8u * st + 1u];
    let sf = G_SPRFRAMES + 2u * spr; let fr = frame & 0x7fffu;
    if (fr >= G[sf + 1u]) { continue; }
    let w = G[G_FRAMEROT + (G[sf] + fr) * 8u];
    if (w == 0xffffffffu) { continue; }
    let lump = w & 0x7fffu; let flip = (w >> 15u) & 1u;
    let sd = G_SPRDIR + 6u * lump;
    let sw = i32(G[sd]); let sh = i32(G[sd + 1u]);
    let s = (f32(U.height) * 1.6) / 320.0;
    let x1 = f32(U.width) / 2.0 + (P.pspsx - 160.0 - f32(gi(sd + 2u))) * s;
    let ytop = f32(U.viewh) / 2.0 - (100.5 - (P.pspsy - f32(gi(sd + 3u)))) * s;
    var col = i32(floor((f32(x) + 0.5 - x1) / s));
    let row = i32(floor((f32(y) + 0.5 - ytop) / s));
    if (flip == 1u) { col = sw - 1 - col; }
    if (col < 0 || col >= sw || row < 0 || row >= sh) { continue; }
    let tx = texel(G[sd + 4u] + u32(col * sh + row));
    if ((tx & 0x100u) == 0u) { continue; }
    var level = 0u;
    if (P.fixedcolormap >= 0) { level = u32(P.fixedcolormap); }
    else if ((frame & 0x8000u) == 0u) { level = u32(max(startmap(S[O[0].sector].light) - 23, 0)); }
    FB[y * U.width + x] = cmap(level, tx);
    return;
  }
}

// =====================================================================
// TIC: one thread runs a whole game tic
// =====================================================================

// P_Random: DOOM's table, so the game's random numbers follow vanilla's sequence
fn P_Random() -> i32 {
  P.rng = (P.rng + 1u) & 255u;
  return i32(G[G_RNDTABLE + P.rng]);
}
fn startSound(sfx: u32, x: f32, y: f32) {
  let i = P.sndcount % 32u;
  P.snd[i] = vec4f(f32(sfx), x, y, 0.0);
  P.sndcount += 1u;
}
fn mobjSound(mi: u32, sfx: u32) { startSound(sfx, fxf(O[mi].x), fxf(O[mi].y)); }
fn sectorSound(sec: u32, sfx: u32) {
  // sector centre from its first line, good enough for panning
  let sl = M_SECLINE + 2u * sec;
  let l = M[M_SECLIST + M[sl]];
  let c = (lineA(l) + lineB(l)) * 0.5;
  startSound(sfx, c.x, c.y);
}
fn setMessage(id: i32) { P.message = id; P.messagetics = 140; }

// ---- sector neighbours
fn otherSector(l: u32, sec: u32) -> i32 {
  if ((lineFlags(l) & ML_TWOSIDED) == 0u) { return -1; }
  let f = lineFront(l); let b = lineBack(l);
  if (f == i32(sec)) { return b; }
  return f;
}
fn findLowestFloorSurrounding(sec: u32) -> f32 {
  var h = S[sec].floorh;
  let sl = M_SECLINE + 2u * sec;
  for (var i = 0u; i < M[sl + 1u]; i++) { let o = otherSector(M[M_SECLIST + M[sl] + i], sec); if (o >= 0) { h = min(h, S[o].floorh); } }
  return h;
}
fn findHighestFloorSurrounding(sec: u32) -> f32 {
  var h = -500.0;
  let sl = M_SECLINE + 2u * sec;
  for (var i = 0u; i < M[sl + 1u]; i++) { let o = otherSector(M[M_SECLIST + M[sl] + i], sec); if (o >= 0) { h = max(h, S[o].floorh); } }
  return h;
}
fn findNextHighestFloor(sec: u32, cur: f32) -> f32 {
  var h = 1e9; var found = false;
  let sl = M_SECLINE + 2u * sec;
  for (var i = 0u; i < M[sl + 1u]; i++) {
    let o = otherSector(M[M_SECLIST + M[sl] + i], sec);
    if (o >= 0 && S[o].floorh > cur && S[o].floorh < h) { h = S[o].floorh; found = true; }
  }
  return select(cur, h, found);
}
fn findLowestCeilingSurrounding(sec: u32) -> f32 {
  var h = 32767.0;
  let sl = M_SECLINE + 2u * sec;
  for (var i = 0u; i < M[sl + 1u]; i++) { let o = otherSector(M[M_SECLIST + M[sl] + i], sec); if (o >= 0) { h = min(h, S[o].ceilh); } }
  return h;
}
fn findHighestCeilingSurrounding(sec: u32) -> f32 {
  var h = 0.0;
  let sl = M_SECLINE + 2u * sec;
  for (var i = 0u; i < M[sl + 1u]; i++) { let o = otherSector(M[M_SECLIST + M[sl] + i], sec); if (o >= 0) { h = max(h, S[o].ceilh); } }
  return h;
}
fn findMinSurroundingLight(sec: u32, maxl: i32) -> i32 {
  var m = maxl;
  let sl = M_SECLINE + 2u * sec;
  for (var i = 0u; i < M[sl + 1u]; i++) { let o = otherSector(M[M_SECLIST + M[sl] + i], sec); if (o >= 0) { m = min(m, S[o].light); } }
  return m;
}

// ---- geometry for movement
fn pointOnLineSide(p: vec2i, l: u32) -> u32 { let a = lineA(l); return lineSideFx(p, a, lineB(l) - a, false); }
// P_BoxOnLineSide: -1 if the box crosses the line, else the side. Axis-aligned lines compare
// strictly, so a box edge lying on the line doesn't cross it; sloped lines test two corners.
fn boxOnLineSide(lo: vec2i, hi: vec2i, l: u32) -> i32 {
  let a = lineA(l); let d = lineB(l) - a;
  let ax = i32(a.x) << 16u; let ay = i32(a.y) << 16u;
  var p1 = 0u; var p2 = 0u;
  if (d.y == 0.0) {
    p1 = select(0u, 1u, hi.y > ay); p2 = select(0u, 1u, lo.y > ay);
    if (d.x < 0.0) { p1 ^= 1u; p2 ^= 1u; }
  } else if (d.x == 0.0) {
    p1 = select(0u, 1u, hi.x < ax); p2 = select(0u, 1u, lo.x < ax);
    if (d.y < 0.0) { p1 ^= 1u; p2 ^= 1u; }
  } else if ((d.x > 0.0) == (d.y > 0.0)) {
    p1 = pointOnLineSide(vec2i(lo.x, hi.y), l); p2 = pointOnLineSide(vec2i(hi.x, lo.y), l);
  } else {
    p1 = pointOnLineSide(vec2i(hi.x, hi.y), l); p2 = pointOnLineSide(vec2i(lo.x, lo.y), l);
  }
  if (p1 == p2) { return i32(p1); }
  return -1;
}

var<private> tmfloorz: f32;
var<private> tmceilingz: f32;
var<private> tmdropoffz: f32;
var<private> tmblockline: i32;
var<private> tmceilline: i32;
var<private> tmfloorline: i32;
var<private> numspechit: u32;
var<private> spechit: array<u32, 16>;
var<private> numcross: u32;
var<private> floatok: bool;
var<private> actTag: i32;
var<private> crossq: array<vec2u, 16>;

fn checkPosition(mi: u32, pos: vec2i) -> bool {
  let me = O[mi];
  let r = me.radius;
  let ri = fixedOf(r);
  let lo = pos - vec2i(ri); let hi = pos + vec2i(ri);
  let bmo = vec2i(i32(BM_X) << 16u, i32(BM_Y) << 16u);
  let sec = sectorAt(pos);
  tmfloorz = S[sec].floorh; tmdropoffz = tmfloorz; tmceilingz = S[sec].ceilh;
  tmblockline = -1; tmceilline = -1; tmfloorline = -1;
  numspechit = 0u;
  if ((me.flags & MF_NOCLIP) != 0u) { return true; }
  // things (PIT_CheckThing)
  // MAPBLOCKSHIFT 23: 128 units in 16.16; MAXRADIUS 32 reaches things whose centre is in a neighbouring block
  let tx0 = max((lo.x - bmo.x - 0x200000) >> 23u, 0); let tx1 = min((hi.x - bmo.x + 0x200000) >> 23u, BM_W - 1);
  let ty0 = max((lo.y - bmo.y - 0x200000) >> 23u, 0); let ty1 = min((hi.y - bmo.y + 0x200000) >> 23u, BM_H - 1);
  let ncell = max(tx1 - tx0 + 1, 0) * max(ty1 - ty0 + 1, 0);
  var cellk = 0; var cur = 0u;
  for (var guard = 0; guard < 8192; guard++) {
    if (cur == 0u) {
      if (cellk >= ncell) { break; }
      let bx = tx0 + cellk / (ty1 - ty0 + 1); let by = ty0 + cellk % (ty1 - ty0 + 1);
      cellk += 1;
      cur = LS[BLOCKHEADS + u32(by * BM_W + bx)];
      continue;
    }
    let j = cur - 1u;
    cur = u32(O[j].bnext);
    if (j == mi || O[j].inuse == 0u || (O[j].flags & (MF_SOLID | MF_SPECIAL | MF_SHOOTABLE)) == 0u) { continue; }
    let bd = fixedOf(O[j].radius) + ri;
    if (abs(O[j].x - pos.x) >= bd || abs(O[j].y - pos.y) >= bd) { continue; }
    let th = O[j];
    // a lost soul's slam and a missile's hit share one damageMobj call site (every call is inlined)
    let skull = (me.flags & MF_SKULLFLY) != 0u;
    if (!skull && (me.flags & MF_MISSILE) != 0u) {
      if (me.z > th.z + th.height || me.z + me.height < th.z) { continue; }
      if (me.targ >= 0) {
        let st = O[me.targ].mtype;
        if (st == th.mtype || (st == MT_KNIGHT && th.mtype == MT_BRUISER) || (st == MT_BRUISER && th.mtype == MT_KNIGHT)) {
          if (i32(j) == me.targ) { continue; }
          if (th.mtype != MT_PLAYER) { return false; }
        }
      }
      if ((th.flags & MF_SHOOTABLE) == 0u) {
        if ((th.flags & MF_SOLID) != 0u) { return false; }
        continue;
      }
    }
    if (skull || (me.flags & MF_MISSILE) != 0u) {
      damageMobj(j, i32(mi), select(me.targ, i32(mi), skull), (P_Random() % 8 + 1) * info(me.mtype, MI_DAMAGE));
      if (skull) {
        O[mi].flags &= ~MF_SKULLFLY;
        O[mi].momx = 0.0; O[mi].momy = 0.0; O[mi].momz = 0.0;
        O[mi].req = u32(info(me.mtype, MI_SPAWNSTATE));
      }
      return false;
    }
    if ((th.flags & MF_SPECIAL) != 0u) {
      if ((me.flags & MF_PICKUP) != 0u) { touchSpecialThing(j, mi); }
      if ((th.flags & MF_SOLID) == 0u) { continue; }
    }
    if ((th.flags & MF_SOLID) != 0u) { return false; }
  }
  // lines via the blockmap
  let x0 = max((lo.x - bmo.x) >> 23u, 0); let x1 = min((hi.x - bmo.x) >> 23u, BM_W - 1);
  let y0 = max((lo.y - bmo.y) >> 23u, 0); let y1 = min((hi.y - bmo.y) >> 23u, BM_H - 1);
  // P_CheckPosition's order: columns of blocks, each block's list from its first entry. Every vanilla
  // list starts with line 0, so line 0 is tested first (validcount keeps it to once).
  var line0 = x0 <= x1 && y0 <= y1;
  for (var bx = x0; bx <= x1; bx++) {
    for (var by = y0; by <= y1; by++) {
      let cell = M_BMCELL + 2u * u32(by * BM_W + bx);
      let start = M[cell]; let n = M[cell + 1u];
      for (var k = 0u; k <= n; k++) {
        var l = 0u;
        if (k == 0u) { if (!line0) { continue; } line0 = false; } else { l = M[M_BMLIST + start + k - 1u]; }
        let a = fxv(lineA(l)); let b = fxv(lineB(l));
        if (hi.x <= min(a.x, b.x) || lo.x >= max(a.x, b.x) || hi.y <= min(a.y, b.y) || lo.y >= max(a.y, b.y)) { continue; }
        if (boxOnLineSide(lo, hi, l) != -1) { continue; }
        let back = lineBack(l);
        if (back < 0) { tmblockline = i32(l); tmceilline = i32(l); return false; }
        if ((me.flags & MF_MISSILE) == 0u) {
          if ((lineFlags(l) & ML_BLOCKING) != 0u) { tmblockline = i32(l); return false; }
          if (mi != 0u && (lineFlags(l) & ML_BLOCKMONSTERS) != 0u) { tmblockline = i32(l); return false; }
        }
        let F = S[lineFront(l)]; let B = S[back];
        let opentop = min(F.ceilh, B.ceilh);
        let openbottom = max(F.floorh, B.floorh);
        let lowfloor = min(F.floorh, B.floorh);
        if (opentop < tmceilingz) { tmceilingz = opentop; tmceilline = i32(l); }
        if (openbottom > tmfloorz) { tmfloorz = openbottom; tmfloorline = i32(l); }
        if (lowfloor < tmdropoffz) { tmdropoffz = lowfloor; }
        if (lineSpecial(l) != 0u && numspechit < 16u) {
          var dup = false;
          for (var q = 0u; q < numspechit; q++) { if (spechit[q] == l) { dup = true; } }
          if (!dup) { spechit[numspechit] = l; numspechit += 1u; }
        }
      }
    }
  }
  return true;
}

fn tryMove(mi: u32, pos: vec2i) -> bool {
  floatok = false;
  if (!checkPosition(mi, pos)) { return false; }
  let me = O[mi];
  if ((me.flags & MF_NOCLIP) == 0u) {
    if (tmceilingz - tmfloorz < me.height) { tmblockline = tmceilline; return false; }
    floatok = true;
    if ((me.flags & MF_TELEPORT) == 0u && tmceilingz - me.z < me.height) { tmblockline = tmceilline; return false; }
    if ((me.flags & MF_TELEPORT) == 0u && tmfloorz - me.z > 24.0) { tmblockline = tmfloorline; return false; }
    if ((me.flags & (MF_DROPOFF | MF_FLOAT)) == 0u && tmfloorz - tmdropoffz > 24.0) { tmblockline = tmfloorline; return false; }
  }
  let old = vec2i(me.x, me.y);
  O[mi].floorz = tmfloorz; O[mi].ceilingz = tmceilingz; O[mi].dropoffz = tmdropoffz;
  unlinkThing(mi);
  O[mi].x = pos.x; O[mi].y = pos.y;
  linkThing(mi);
  O[mi].sector = sectorAt(pos);
  if ((me.flags & (MF_TELEPORT | MF_NOCLIP)) == 0u) {
    let n = numspechit;
    var hits = spechit;
    for (var k = n; k > 0u; k--) {
      let l = hits[k - 1u];
      let s = pointOnLineSide(pos, l); let os = pointOnLineSide(old, l);
      if (s != os && lineSpecial(l) != 0u && numcross < 16u) { crossq[numcross] = vec2u(l, os); numcross += 1u; }
    }
  }
  return true;
}

// Specials crossed during movement run after it, which keeps the call graph acyclic.
// Activations wait in World until the activate kernel runs: line | side<<16 | kind<<17 | mobj<<19.
fn queueActivation(l: u32, side: u32, kind: u32, mi: u32) {
  if (P.nact < 32u) { P.act[P.nact] = l | (side << 16u) | (kind << 17u) | (mi << 19u); P.nact += 1u; }
}
fn processCrossings(mi: u32) {
  let n = numcross; numcross = 0u;
  for (var k = 0u; k < n; k++) { queueActivation(crossq[k].x, crossq[k].y, 0u, mi); }
}

// ---- P_SlideMove's wall search: P_PathTraverse over the blockmap with PTR_SlideTraverse
var<private> bestslidefrac: i32; // 16.16
var<private> bestslideline: i32;
// P_PointOnDivlineSide
fn divlineSide(pt: vec2i, o: vec2i, d: vec2i) -> u32 {
  if (d.x == 0) { if (pt.x <= o.x) { return select(0u, 1u, d.y > 0); } return select(0u, 1u, d.y < 0); }
  if (d.y == 0) { if (pt.y <= o.y) { return select(0u, 1u, d.x < 0); } return select(0u, 1u, d.x > 0); }
  let dx = pt.x - o.x; let dy = pt.y - o.y;
  let ldx = d.x; let ldy = d.y;
  if ((ldy ^ ldx ^ dx ^ dy) < 0) { return select(0u, 1u, (ldy ^ dx) < 0); }
  return select(1u, 0u, fxMul(dy >> 8u, ldx >> 8u) < fxMul(ldy >> 8u, dx >> 8u));
}
// P_AddLineIntercepts' crossing test and P_InterceptVector, then PTR_SlideTraverse
fn slideCheckLine(l: u32, p: vec2i, d: vec2i) {
  let frac = lineIntercept(l, p, d);
  if (frac < 0 || frac > 65536 || frac >= bestslidefrac) { return; }
  if ((lineFlags(l) & ML_TWOSIDED) == 0u || lineBack(l) < 0) {
    if (pointOnLineSide(ipos(0u), l) != 0u) { return; } // don't hit the back side
  } else {
    let F = S[lineFront(l)]; let B = S[lineBack(l)];
    let opentop = min(F.ceilh, B.ceilh); let openbottom = max(F.floorh, B.floorh);
    let fits = opentop - openbottom >= O[0].height && opentop - O[0].z >= O[0].height && openbottom - O[0].z <= 24.0;
    if (fits) { return; }
  }
  bestslidefrac = frac; bestslideline = i32(l);
}
fn slideTrace(pi: vec2i, di: vec2i) {
  // every vanilla blockmap list starts with line 0, so P_BlockLinesIterator visits it in each block
  slideCheckLine(0u, pi, di);
  let p = fv(pi); let d = fv(di);
  let q = p + d;
  let lo = min(p, q); let hi = max(p, q);
  let x0 = max(i32(floor((lo.x - BM_X) / 128.0)), 0); let x1 = min(i32(floor((hi.x - BM_X) / 128.0)), BM_W - 1);
  let y0 = max(i32(floor((lo.y - BM_Y) / 128.0)), 0); let y1 = min(i32(floor((hi.y - BM_Y) / 128.0)), BM_H - 1);
  for (var by = y0; by <= y1; by++) {
    for (var bx = x0; bx <= x1; bx++) {
      // only the blocks the trace passes through (Liang-Barsky against the block)
      let c0 = vec2f(BM_X + f32(bx) * 128.0, BM_Y + f32(by) * 128.0); let c1 = c0 + vec2f(128.0);
      var t0 = 0.0; var t1 = 1.0;
      for (var ax = 0; ax < 2; ax++) {
        let dd = d[ax]; let pp = p[ax];
        if (dd == 0.0) { if (pp < c0[ax] || pp > c1[ax]) { t0 = 2.0; } }
        else {
          var ta = (c0[ax] - pp) / dd; var tb = (c1[ax] - pp) / dd;
          if (ta > tb) { let tt = ta; ta = tb; tb = tt; }
          t0 = max(t0, ta); t1 = min(t1, tb);
        }
      }
      if (t0 > t1) { continue; }
      let cell = M_BMCELL + 2u * u32(by * BM_W + bx);
      let start = M[cell]; let n = M[cell + 1u];
      for (var k = 0u; k < n; k++) { slideCheckLine(M[M_BMLIST + start + k], pi, di); }
    }
  }
}
// P_HitSlideLine: the move along the wall, with DOOM's approximate length
fn hitSlideLine(l: u32, mv: vec2f) -> vec2f {
  let dl = lineB(l) - lineA(l);
  if (dl.y == 0.0) { return vec2f(mv.x, 0.0); }
  if (dl.x == 0.0) { return vec2f(0.0, mv.y); }
  var la = pointToAngle(vec2i(0), fxv(dl));
  if (pointOnLineSide(ipos(0u), l) == 1u) { la += 0x80000000u; }
  var da = pointToAngle(vec2i(0), fxv(mv)) - la;
  if (da > 0x80000000u) { da += 0x80000000u; }
  let nl = fxMul(approxDistFx(vec2i(0), fxv(mv)), fineCosFx(da >> 19u));
  let lf = la >> 19u;
  return vec2f(f32(fxMul(nl, fineCosFx(lf))), f32(fxMul(nl, fineSinFx(lf)))) / 65536.0;
}

// P_XYMovement for the player and every other thing, as a state machine around one tryMove call site
// (the shader compiler inlines every call). A thing's blocked step ends its move; the player's goes
// on into P_SlideMove. States: 0 step, 1 find the wall (P_SlideMove's retry), 2 moved up to the wall?,
// 3 slide the remainder, 4 slid?, 5 stairstep y, 6 stairstep x, 7 next step.
fn xyMovement(mi: u32, isPlayer: bool, hasCmd: bool) {
  var m0 = vec2f(O[mi].momx, O[mi].momy);
  if (m0.x == 0.0 && m0.y == 0.0) {
    if (!isPlayer && (O[mi].flags & MF_SKULLFLY) != 0u) {
      O[mi].flags &= ~MF_SKULLFLY; O[mi].momz = 0.0;
      O[mi].req = u32(info(O[mi].mtype, MI_SPAWNSTATE));
    }
    return;
  }
  m0 = clamp(m0, vec2f(-MAXMOVE), vec2f(MAXMOVE));
  O[mi].momx = m0.x; O[mi].momy = m0.y;
  var xmove = fixedOf(m0.x); var ymove = fixedOf(m0.y);
  var st = 0u; var hit = 0;
  for (var guard = 0; guard < 48; guard++) {
    let pos = ipos(mi);
    let mom = fxv(vec2f(O[mi].momx, O[mi].momy));
    var tgt = pos; var tryNow = false;
    if (st == 7u) {
      if (xmove == 0 && ymove == 0) { break; }
      st = 0u;
    }
    if (st == 0u) {
      // vanilla halves only a positive move (no abs here), so a fast move west or south goes in one step;
      // the step is move / 2 (toward zero) and what is left move >> 1 (toward -inf)
      if (xmove > HALFMOVE || ymove > HALFMOVE) { tgt = pos + vec2i(xmove / 2, ymove / 2); xmove >>= 1u; ymove >>= 1u; }
      else { tgt = pos + vec2i(xmove, ymove); xmove = 0; ymove = 0; }
      tryNow = true;
    } else if (st == 1u) {
      hit += 1;
      if (hit == 3) { st = 5u; }
      else {
        let r = fixedOf(O[mi].radius);
        let lead = pos + vec2i(select(-r, r, mom.x > 0), select(-r, r, mom.y > 0));
        let trail = pos - vec2i(select(-r, r, mom.x > 0), select(-r, r, mom.y > 0));
        bestslidefrac = 65537; bestslideline = -1;
        slideTrace(lead, mom);
        slideTrace(vec2i(trail.x, lead.y), mom);
        slideTrace(vec2i(lead.x, trail.y), mom);
        if (bestslideline < 0) { st = 5u; }
        else {
          bestslidefrac -= 0x800; // fudge a bit to make sure it doesn't hit
          if (bestslidefrac > 0) { tgt = pos + vec2i(fxMul(mom.x, bestslidefrac), fxMul(mom.y, bestslidefrac)); tryNow = true; st = 2u; }
          else { st = 3u; }
        }
      }
    }
    if (st == 3u && !tryNow) {
      let rem = min(65536 - (bestslidefrac + 0x800), 65536);
      if (rem <= 0) { st = 7u; }
      else {
        let tm = hitSlideLine(u32(bestslideline), vec2f(f32(fxMul(mom.x, rem)), f32(fxMul(mom.y, rem))) / 65536.0);
        O[mi].momx = tm.x; O[mi].momy = tm.y;
        tgt = pos + fxv(tm); tryNow = true; st = 4u;
      }
    }
    if (st == 5u && !tryNow) { tgt = vec2i(pos.x, pos.y + mom.y); tryNow = true; }
    else if (st == 6u && !tryNow) { tgt = vec2i(pos.x + mom.x, pos.y); tryNow = true; }
    if (!tryNow) { continue; }
    let ok = tryMove(mi, tgt);
    if (st == 0u) {
      if (ok) { st = 7u; }
      else if (isPlayer) { hit = 0; st = 1u; }
      else {
        if ((O[mi].flags & MF_MISSILE) != 0u) {
          // hitting a sky wall makes the missile vanish instead of exploding
          if (tmceilline >= 0) {
            let bk = lineBack(u32(tmceilline));
            if (bk >= 0 && S[bk].ceilpic == SKYFLAT) { removeMobj(mi); return; }
          }
          explodeMissile(mi);
        } else {
          O[mi].momx = 0.0; O[mi].momy = 0.0;
        }
        break;
      }
    }
    else if (st == 2u) { st = select(5u, 3u, ok); }
    else if (st == 4u) { st = select(1u, 7u, ok); }
    else if (st == 5u) { st = select(6u, 7u, ok); }
    else if (st == 6u) { st = 7u; }
  }
  if (!isPlayer && (O[mi].flags & (MF_MISSILE | MF_SKULLFLY)) != 0u) { return; }
  if (O[mi].z > O[mi].floorz || corpseSlides(mi)) { return; }
  let m2 = vec2f(O[mi].momx, O[mi].momy);
  // the player keeps sliding while a move is held
  if (abs(m2.x) < STOPSPEED && abs(m2.y) < STOPSPEED && !(isPlayer && hasCmd)) { O[mi].momx = 0.0; O[mi].momy = 0.0; }
  else { O[mi].momx = friction(m2.x); O[mi].momy = friction(m2.y); }
}

// a corpse with some momentum keeps sliding while it hangs half off a step
fn corpseSlides(mi: u32) -> bool {
  if ((O[mi].flags & MF_CORPSE) == 0u) { return false; }
  if (abs(O[mi].momx) <= 0.25 && abs(O[mi].momy) <= 0.25) { return false; }
  return O[mi].floorz != S[O[mi].sector].floorh;
}
fn explodeMissile(mi: u32) {
  O[mi].momx = 0.0; O[mi].momy = 0.0; O[mi].momz = 0.0;
  O[mi].req = u32(info(O[mi].mtype, MI_DEATHSTATE));
  O[mi].pend = 0x100u;
  O[mi].flags &= ~MF_MISSILE;
  let s = info(O[mi].mtype, MI_DEATHSOUND);
  if (s != 0) { mobjSound(mi, u32(s)); }
}

fn zMovement(mi: u32, isPlayer: bool) {
  if (isPlayer && O[mi].z < O[mi].floorz) {
    P.viewheight -= O[mi].floorz - O[mi].z;
    P.deltaviewheight = (VIEWHEIGHT - P.viewheight) / 8.0;
  }
  O[mi].z += O[mi].momz;
  let flags = O[mi].flags;
  // floating monsters drift toward their target's height
  if ((flags & MF_FLOAT) != 0u && O[mi].targ >= 0 && (flags & (MF_SKULLFLY | MF_INFLOAT)) == 0u) {
    let t = O[O[mi].targ];
    let dist = fxf(approxDistFx(ipos(mi), ipos(u32(O[mi].targ))));
    let delta = t.z + O[mi].height / 2.0 - O[mi].z;
    if (delta < 0.0 && dist < -(delta * 3.0)) { O[mi].z -= 4.0; }
    else if (delta > 0.0 && dist < delta * 3.0) { O[mi].z += 4.0; }
  }
  if (O[mi].z <= O[mi].floorz) {
    if ((flags & MF_SKULLFLY) != 0u) { O[mi].momz = -O[mi].momz; }
    if (O[mi].momz < 0.0) {
      if (isPlayer && O[mi].momz < -GRAVITY * 8.0) {
        P.deltaviewheight = O[mi].momz / 8.0;
        mobjSound(mi, SFX_oof);
      }
      O[mi].momz = 0.0;
    }
    O[mi].z = O[mi].floorz;
    if ((flags & MF_MISSILE) != 0u && (flags & MF_NOCLIP) == 0u) { explodeMissile(mi); return; }
  } else if ((flags & MF_NOGRAVITY) == 0u) {
    if (O[mi].momz == 0.0) { O[mi].momz = -GRAVITY * 2.0; } else { O[mi].momz -= GRAVITY; }
  }
  if (O[mi].z + O[mi].height > O[mi].ceilingz) {
    if (O[mi].momz > 0.0) { O[mi].momz = 0.0; }
    O[mi].z = O[mi].ceilingz - O[mi].height;
    if ((flags & MF_SKULLFLY) != 0u) { O[mi].momz = -O[mi].momz; }
    if ((flags & MF_MISSILE) != 0u && (flags & MF_NOCLIP) == 0u) { explodeMissile(mi); return; }
  }
}

// ---- things fitting after a sector moved (P_ChangeSector)
fn touchesSector(mi: u32, sec: u32) -> bool {
  let m = O[mi];
  if (m.sector == sec) { return true; }
  let r = fixedOf(m.radius);
  let lo = vec2i(m.x - r, m.y - r); let hi = vec2i(m.x + r, m.y + r);
  let sl = M_SECLINE + 2u * sec;
  for (var i = 0u; i < M[sl + 1u]; i++) {
    let l = M[M_SECLIST + M[sl] + i];
    let a = fxv(lineA(l)); let b = fxv(lineB(l));
    if (hi.x <= min(a.x, b.x) || lo.x >= max(a.x, b.x) || hi.y <= min(a.y, b.y) || lo.y >= max(a.y, b.y)) { continue; }
    if (boxOnLineSide(lo, hi, l) == -1) { return true; }
  }
  return false;
}
fn changeSector(sec: u32, crush: bool) -> bool {
  var nofit = false;
  for (var j = 0u; j < mobjEnd(); j++) {
    if (O[j].inuse == 0u || (O[j].flags & MF_NOBLOCKMAP) != 0u) { continue; }
    if (!touchesSector(j, sec)) { continue; }
    let onfloor = O[j].z <= O[j].floorz;
    // P_ThingHeightClip: new floor and ceiling from the lines the thing touches
    let pos = ipos(j);
    let r = fixedOf(O[j].radius);
    let lo = pos - vec2i(r); let hi = pos + vec2i(r);
    let bmo = vec2i(i32(BM_X) << 16u, i32(BM_Y) << 16u);
    let s0 = sectorAt(pos);
    var fz = S[s0].floorh; var cz = S[s0].ceilh;
    let x0 = max((lo.x - bmo.x) >> 23u, 0); let x1 = min((hi.x - bmo.x) >> 23u, BM_W - 1);
    let y0 = max((lo.y - bmo.y) >> 23u, 0); let y1 = min((hi.y - bmo.y) >> 23u, BM_H - 1);
    for (var by = y0; by <= y1; by++) {
      for (var bx = x0; bx <= x1; bx++) {
        let cell = M_BMCELL + 2u * u32(by * BM_W + bx);
        for (var k = 0u; k < M[cell + 1u]; k++) {
          let l = M[M_BMLIST + M[cell] + k];
          let a = fxv(lineA(l)); let b = fxv(lineB(l));
          if (hi.x <= min(a.x, b.x) || lo.x >= max(a.x, b.x) || hi.y <= min(a.y, b.y) || lo.y >= max(a.y, b.y)) { continue; }
          if (boxOnLineSide(lo, hi, l) != -1) { continue; }
          let back = lineBack(l);
          if (back < 0) { continue; }
          let F = S[lineFront(l)]; let B = S[back];
          cz = min(cz, min(F.ceilh, B.ceilh)); fz = max(fz, max(F.floorh, B.floorh));
        }
      }
    }
    O[j].floorz = fz; O[j].ceilingz = cz;
    if (onfloor) { O[j].z = fz; } else if (O[j].z + O[j].height > cz) { O[j].z = cz - O[j].height; }
    if (cz - fz >= O[j].height) { continue; }
    // doesn't fit: corpses turn to gibs, dropped items vanish
    if (O[j].health <= 0 && j != 0u) { O[j].req = S_GIBS; O[j].flags &= ~MF_SOLID; O[j].height = 0.0; O[j].radius = 0.0; continue; }
    if ((O[j].flags & MF_DROPPED) != 0u) { removeMobj(j); continue; }
    if ((O[j].flags & MF_SHOOTABLE) == 0u) { continue; }
    nofit = true;
    if (crush && (P.leveltime & 3u) == 0u) { damageMobj(j, -1, -1, 10); }
  }
  return nofit;
}

// T_MovePlane: 0 ok, 1 crushed, 2 pastdest. The shader compiler inlines every call, so P_ChangeSector
// has one call site here: the move, then a second pass when DOOM puts the plane back where it was.
fn movePlane(sec: u32, speed: f32, dest: f32, crush: bool, ceiling: bool, dir: i32) -> i32 {
  let last = select(S[sec].floorh, S[sec].ceilh, ceiling);
  let next = select(last + speed, last - speed, dir < 0);
  let pastdest = select(next > dest, next < dest, dir < 0);
  var h = select(next, dest, pastdest);
  var res = select(0, 2, pastdest);
  let closing = ceiling == (dir < 0); // a floor going up or a ceiling coming down
  for (var round = 0u; round < 2u; round++) {
    if (ceiling) { S[sec].ceilh = h; } else { S[sec].floorh = h; }
    if (!changeSector(sec, crush) || round == 1u) { break; }
    if (!pastdest) {
      if (ceiling && dir > 0) { break; } // a rising ceiling ignores what doesn't fit
      res = 1;
      if (closing && crush) { break; } // a crusher stays put and keeps crushing
    }
    h = last;
  }
  return res;
}

// What a mover's T_ thinker would pass to T_MovePlane this tic, so ticWorld has one movePlane call site
struct MovePlan { moves: bool, dest: f32, crush: bool, ceiling: bool, dir: i32 }
fn moverPlan(sec: u32) -> MovePlan {
  let s = S[sec];
  let crush = s.mcrush != 0u;
  switch (s.mtype) {
    case 1u: { // door
      if (s.mdir == -1) { return MovePlan(true, s.floorh, false, true, -1); }
      if (s.mdir == 1) { return MovePlan(true, s.mtop, false, true, 1); }
    }
    case 2u: { return MovePlan(true, s.mbottom, crush, false, s.mdir); } // floor
    case 3u: { // plat
      if (s.mstatus == 0) { return MovePlan(true, s.mtop, crush, false, 1); }
      if (s.mstatus == 1) { return MovePlan(true, s.mbottom, false, false, -1); }
    }
    case 4u: { // ceiling
      if (s.mdir == 1) { return MovePlan(true, s.mtop, false, true, 1); }
      if (s.mdir == -1) { return MovePlan(true, s.mbottom, crush, true, -1); }
    }
    default: {}
  }
  return MovePlan(false, 0.0, false, false, 0);
}

// ---- movers (mtype: 1 door, 2 floor, 3 plat, 4 ceiling)
fn doorThink(sec: u32, res: i32) {
  let ty = S[sec].msub;
  switch (S[sec].mdir) {
    case 0: {
      S[sec].mcount -= 1;
      if (S[sec].mcount <= 0) {
        if (ty == DOOR_blazeRaise) { S[sec].mdir = -1; sectorSound(sec, SFX_bdcls); }
        else if (ty == DOOR_normal) { S[sec].mdir = -1; sectorSound(sec, SFX_dorcls); }
        else if (ty == DOOR_close30ThenOpen) { S[sec].mdir = 1; sectorSound(sec, SFX_doropn); }
      }
    }
    case 2: {
      S[sec].mcount -= 1;
      if (S[sec].mcount <= 0 && ty == DOOR_raiseIn5Mins) { S[sec].mdir = 1; S[sec].msub = DOOR_normal; sectorSound(sec, SFX_doropn); }
    }
    case -1: {
      if (res == 2) {
        if (ty == DOOR_blazeRaise || ty == DOOR_blazeClose) { S[sec].mtype = 0u; sectorSound(sec, SFX_bdcls); }
        else if (ty == DOOR_normal || ty == DOOR_close) { S[sec].mtype = 0u; }
        else if (ty == DOOR_close30ThenOpen) { S[sec].mdir = 0; S[sec].mcount = 35 * 30; }
      } else if (res == 1) {
        if (ty != DOOR_blazeClose && ty != DOOR_close) { S[sec].mdir = 1; sectorSound(sec, SFX_doropn); }
      }
    }
    case 1: {
      if (res == 2) {
        if (ty == DOOR_blazeRaise || ty == DOOR_normal) { S[sec].mdir = 0; S[sec].mcount = S[sec].mwait; }
        else { S[sec].mtype = 0u; }
      }
    }
    default: {}
  }
}

fn floorThink(sec: u32, res: i32) {
  if ((P.leveltime & 7u) == 0u) { sectorSound(sec, SFX_stnmov); }
  if (res == 2) {
    let ty = S[sec].msub;
    if (S[sec].mdir == 1 && ty == FLOOR_donutRaise) { S[sec].special = S[sec].mspecial; S[sec].floorpic = S[sec].mtex; }
    if (S[sec].mdir == -1 && ty == FLOOR_lowerAndChange) { S[sec].special = S[sec].mspecial; S[sec].floorpic = S[sec].mtex; }
    S[sec].mtype = 0u;
    sectorSound(sec, SFX_pstop);
  }
}

fn platThink(sec: u32, res: i32) {
  let ty = S[sec].msub;
  switch (S[sec].mstatus) {
    case 0: { // up
      if ((ty == PLAT_raiseAndChange24 || ty == PLAT_raiseAndChange32 || ty == PLAT_raiseToNearestAndChange) && (P.leveltime & 7u) == 0u) { sectorSound(sec, SFX_stnmov); }
      if (res == 1 && S[sec].mcrush == 0u) { S[sec].mcount = S[sec].mwait; S[sec].mstatus = 1; sectorSound(sec, SFX_pstart); }
      else if (res == 2) {
        S[sec].mcount = S[sec].mwait; S[sec].mstatus = 2; sectorSound(sec, SFX_pstop);
        if (ty != PLAT_perpetualRaise) { S[sec].mtype = 0u; }
      }
    }
    case 1: { // down
      if (res == 2) { S[sec].mcount = S[sec].mwait; S[sec].mstatus = 2; sectorSound(sec, SFX_pstop); }
    }
    case 2: { // waiting
      S[sec].mcount -= 1;
      if (S[sec].mcount <= 0) {
        S[sec].mstatus = select(1, 0, S[sec].floorh == S[sec].mbottom);
        sectorSound(sec, SFX_pstart);
      }
    }
    default: {} // 3: in stasis
  }
}

fn ceilingThink(sec: u32, res: i32) {
  let ty = S[sec].msub;
  if (S[sec].mdir == 1) {
    if ((P.leveltime & 7u) == 0u && ty != CEIL_silentCrushAndRaise) { sectorSound(sec, SFX_stnmov); }
    if (res == 2) {
      if (ty == CEIL_raiseToHighest) { S[sec].mtype = 0u; }
      else if (ty == CEIL_silentCrushAndRaise) { sectorSound(sec, SFX_pstop); S[sec].mdir = -1; }
      else if (ty == CEIL_fastCrushAndRaise || ty == CEIL_crushAndRaise) { S[sec].mdir = -1; }
    }
  } else if (S[sec].mdir == -1) {
    if ((P.leveltime & 7u) == 0u && ty != CEIL_silentCrushAndRaise) { sectorSound(sec, SFX_stnmov); }
    if (res == 2) {
      if (ty == CEIL_silentCrushAndRaise) { sectorSound(sec, SFX_pstop); S[sec].mspeed = 1.0; S[sec].mdir = 1; }
      else if (ty == CEIL_crushAndRaise) { S[sec].mspeed = 1.0; S[sec].mdir = 1; }
      else if (ty == CEIL_fastCrushAndRaise) { S[sec].mdir = 1; }
      else { S[sec].mtype = 0u; }
    } else if (res == 1) {
      if (ty == CEIL_silentCrushAndRaise || ty == CEIL_crushAndRaise || ty == CEIL_lowerAndCrush) { S[sec].mspeed = 1.0 / 8.0; }
    }
  }
}

fn lightThink(sec: u32) {
  let ty = S[sec].ltype;
  if (ty == 0u) { return; }
  if (ty == 4u) { // glow
    if (S[sec].ldir == -1) {
      S[sec].light -= 8;
      if (S[sec].light <= S[sec].lmin) { S[sec].light += 8; S[sec].ldir = 1; }
    } else {
      S[sec].light += 8;
      if (S[sec].light >= S[sec].lmax) { S[sec].light -= 8; S[sec].ldir = -1; }
    }
    return;
  }
  S[sec].lcount -= 1;
  if (S[sec].lcount > 0) { return; }
  if (ty == 1u) { // flash
    if (S[sec].light == S[sec].lmax) { S[sec].light = S[sec].lmin; S[sec].lcount = (P_Random() & 7) + 1; }
    else { S[sec].light = S[sec].lmax; S[sec].lcount = (P_Random() & 64) + 1; } // & maxtime, as vanilla
  } else if (ty == 2u) { // strobe
    if (S[sec].light == S[sec].lmin) { S[sec].light = S[sec].lmax; S[sec].lcount = S[sec].lbright; }
    else { S[sec].light = S[sec].lmin; S[sec].lcount = S[sec].ldark; }
  } else if (ty == 3u) { // fire flicker
    let amount = (P_Random() & 3) * 16;
    if (S[sec].light - amount < S[sec].lmin) { S[sec].light = S[sec].lmin; } else { S[sec].light = S[sec].lmax - amount; }
    S[sec].lcount = 4;
  }
}

// ---- activation (EV_*)
fn tagged(l: u32, sec: u32) -> bool { return S[sec].tag == actTag; }

fn evDoDoor(l: u32, ty: i32) -> bool {
  var rtn = false;
  for (var sec = 0u; sec < NUMSECTORS; sec++) {
    if (!tagged(l, sec) || S[sec].mtype != 0u) { continue; }
    rtn = true;
    S[sec].mtype = 1u; S[sec].msub = ty; S[sec].mwait = 150; S[sec].mspeed = 2.0;
    switch (ty) {
      case 7: { S[sec].mtop = findLowestCeilingSurrounding(sec) - 4.0; S[sec].mdir = -1; S[sec].mspeed = 8.0; sectorSound(sec, SFX_bdcls); }
      case 2: { S[sec].mtop = findLowestCeilingSurrounding(sec) - 4.0; S[sec].mdir = -1; sectorSound(sec, SFX_dorcls); }
      case 1: { S[sec].mtop = S[sec].ceilh; S[sec].mdir = -1; sectorSound(sec, SFX_dorcls); }
      case 5, 6: {
        S[sec].mdir = 1; S[sec].mtop = findLowestCeilingSurrounding(sec) - 4.0; S[sec].mspeed = 8.0;
        if (S[sec].mtop != S[sec].ceilh) { sectorSound(sec, SFX_bdopn); }
      }
      default: {
        S[sec].mdir = 1; S[sec].mtop = findLowestCeilingSurrounding(sec) - 4.0;
        if (S[sec].mtop != S[sec].ceilh) { sectorSound(sec, SFX_doropn); }
      }
    }
  }
  return rtn;
}

fn hasKey(key: u32) -> bool {
  if (key == 0u) { return true; }
  let k = key - 1u; // 0 blue, 1 yellow, 2 red
  return (P.cards & ((1u << k) | (1u << (k + 3u)))) != 0u;
}

fn evVerticalDoor(l: u32, mi: u32, ty: i32, key: u32) {
  if (key != 0u) {
    if (mi != 0u) { return; }
    if (!hasKey(key)) { setMessage(${msgId("YOU NEED A BLUE KEY TO OPEN THIS DOOR")} + i32(key) - 1); mobjSound(0u, SFX_oof); return; }
  }
  let bs = lineSide(l, 1u);
  if (bs < 0) { return; }
  let sec = sideSector(u32(bs));
  if (S[sec].mtype == 1u) {
    if (ty == DOOR_normal || ty == DOOR_blazeRaise) {
      if (S[sec].mdir == -1) { S[sec].mdir = 1; }
      else { if (mi != 0u) { return; } S[sec].mdir = -1; }
    }
    return;
  }
  if (S[sec].mtype != 0u) { return; }
  if (ty == DOOR_blazeRaise || ty == DOOR_blazeOpen) { sectorSound(sec, SFX_bdopn); } else { sectorSound(sec, SFX_doropn); }
  S[sec].mtype = 1u; S[sec].msub = ty; S[sec].mdir = 1; S[sec].mwait = 150;
  S[sec].mspeed = select(2.0, 8.0, ty == DOOR_blazeRaise || ty == DOOR_blazeOpen);
  S[sec].mtop = findLowestCeilingSurrounding(sec) - 4.0;
  if (ty == DOOR_open || ty == DOOR_blazeOpen) { clearSpecial(l); }
}

fn evDoFloor(l: u32, ty: i32) -> bool {
  var rtn = false;
  for (var sec = 0u; sec < NUMSECTORS; sec++) {
    if (!tagged(l, sec) || S[sec].mtype != 0u) { continue; }
    rtn = true;
    S[sec].mtype = 2u; S[sec].msub = ty; S[sec].mcrush = 0u; S[sec].mspeed = 1.0;
    let fh = S[sec].floorh;
    switch (ty) {
      case 0: { S[sec].mdir = -1; S[sec].mbottom = findHighestFloorSurrounding(sec); }
      case 1: { S[sec].mdir = -1; S[sec].mbottom = findLowestFloorSurrounding(sec); }
      case 2: {
        S[sec].mdir = -1; S[sec].mspeed = 4.0; S[sec].mbottom = findHighestFloorSurrounding(sec);
        if (S[sec].mbottom != fh) { S[sec].mbottom += 8.0; }
      }
      case 3, 9: {
        S[sec].mdir = 1; S[sec].mcrush = select(0u, 1u, ty == 9);
        S[sec].mbottom = min(findLowestCeilingSurrounding(sec), S[sec].ceilh) - select(0.0, 8.0, ty == 9);
      }
      case 10: { S[sec].mdir = 1; S[sec].mspeed = 4.0; S[sec].mbottom = findNextHighestFloor(sec, fh); }
      case 4: { S[sec].mdir = 1; S[sec].mbottom = findNextHighestFloor(sec, fh); }
      case 7: { S[sec].mdir = 1; S[sec].mbottom = fh + 24.0; }
      case 12: { S[sec].mdir = 1; S[sec].mbottom = fh + 512.0; }
      case 8: {
        S[sec].mdir = 1; S[sec].mbottom = fh + 24.0;
        let fs = lineFront(l);
        S[sec].floorpic = S[fs].floorpic; S[sec].special = S[fs].special;
      }
      case 5: {
        var minsize = 32000.0;
        let sl = M_SECLINE + 2u * sec;
        for (var i = 0u; i < M[sl + 1u]; i++) {
          let ln = M[M_SECLIST + M[sl] + i];
          if ((lineFlags(ln) & ML_TWOSIDED) == 0u) { continue; }
          for (var s = 0u; s < 2u; s++) {
            let sd = lineSide(ln, s);
            if (sd < 0) { continue; }
            let t = sideTex(u32(sd), 1u);
            if (t != NOTEX) { minsize = min(minsize, f32(G[G_TEXDIR + 4u * t + 1u])); }
          }
        }
        S[sec].mdir = 1; S[sec].mbottom = fh + minsize;
      }
      case 6: {
        S[sec].mdir = -1; S[sec].mbottom = findLowestFloorSurrounding(sec);
        S[sec].mtex = S[sec].floorpic; S[sec].mspecial = S[sec].special;
        let sl = M_SECLINE + 2u * sec;
        for (var i = 0u; i < M[sl + 1u]; i++) {
          let ln = M[M_SECLIST + M[sl] + i];
          let o = otherSector(ln, sec);
          if (o >= 0 && S[o].floorh == S[sec].mbottom) { S[sec].mtex = S[o].floorpic; S[sec].mspecial = S[o].special; break; }
        }
      }
      default: { S[sec].mtype = 0u; }
    }
  }
  return rtn;
}

fn evDoPlat(l: u32, ty: i32) -> bool {
  var rtn = false;
  // re-activate stopped perpetual plats
  if (ty == PLAT_perpetualRaise) {
    for (var sec = 0u; sec < NUMSECTORS; sec++) {
      if (tagged(l, sec) && S[sec].mtype == 3u && S[sec].mstatus == 3) { S[sec].mstatus = S[sec].molddir; rtn = true; }
    }
  }
  for (var sec = 0u; sec < NUMSECTORS; sec++) {
    if (!tagged(l, sec) || S[sec].mtype != 0u) { continue; }
    rtn = true;
    S[sec].mtype = 3u; S[sec].msub = ty; S[sec].mcrush = 0u; S[sec].mcount = 0;
    let fh = S[sec].floorh;
    let fs = lineFront(l);
    switch (ty) {
      case 4: {
        S[sec].mspeed = 0.5; S[sec].floorpic = S[fs].floorpic; S[sec].mtop = findNextHighestFloor(sec, fh);
        S[sec].mwait = 0; S[sec].mstatus = 0; S[sec].special = 0; sectorSound(sec, SFX_stnmov);
      }
      case 2, 3: {
        S[sec].mspeed = 0.5; S[sec].floorpic = S[fs].floorpic; S[sec].mtop = fh + select(24.0, 32.0, ty == 3);
        S[sec].mwait = 0; S[sec].mstatus = 0; sectorSound(sec, SFX_stnmov);
      }
      case 1, 5: {
        S[sec].mspeed = select(4.0, 8.0, ty == 5);
        S[sec].mbottom = min(findLowestFloorSurrounding(sec), fh); S[sec].mtop = fh;
        S[sec].mwait = 105; S[sec].mstatus = 1; sectorSound(sec, SFX_pstart);
      }
      case 0: {
        S[sec].mspeed = 4.0;
        S[sec].mbottom = min(findLowestFloorSurrounding(sec), fh);
        S[sec].mtop = max(findHighestFloorSurrounding(sec), fh);
        S[sec].mwait = 105; S[sec].mstatus = P_Random() & 1; sectorSound(sec, SFX_pstart);
      }
      default: { S[sec].mtype = 0u; }
    }
  }
  return rtn;
}

fn evStopPlat(l: u32) {
  for (var sec = 0u; sec < NUMSECTORS; sec++) {
    if (tagged(l, sec) && S[sec].mtype == 3u && S[sec].mstatus != 3) { S[sec].molddir = S[sec].mstatus; S[sec].mstatus = 3; }
  }
}

fn evDoCeiling(l: u32, ty: i32) -> bool {
  var rtn = false;
  if (ty == CEIL_fastCrushAndRaise || ty == CEIL_silentCrushAndRaise || ty == CEIL_crushAndRaise) {
    for (var sec = 0u; sec < NUMSECTORS; sec++) {
      if (tagged(l, sec) && S[sec].mtype == 4u && S[sec].mdir == 0) { S[sec].mdir = S[sec].molddir; rtn = true; }
    }
  }
  for (var sec = 0u; sec < NUMSECTORS; sec++) {
    if (!tagged(l, sec) || S[sec].mtype != 0u) { continue; }
    rtn = true;
    S[sec].mtype = 4u; S[sec].msub = ty; S[sec].mcrush = 0u; S[sec].mspeed = 1.0;
    switch (ty) {
      case 4: { S[sec].mcrush = 1u; S[sec].mtop = S[sec].ceilh; S[sec].mbottom = S[sec].floorh + 8.0; S[sec].mdir = -1; S[sec].mspeed = 2.0; }
      case 3, 5: { S[sec].mcrush = 1u; S[sec].mtop = S[sec].ceilh; S[sec].mbottom = S[sec].floorh + 8.0; S[sec].mdir = -1; }
      case 2: { S[sec].mcrush = 1u; S[sec].mbottom = S[sec].floorh + 8.0; S[sec].mdir = -1; }
      case 0: { S[sec].mbottom = S[sec].floorh; S[sec].mdir = -1; }
      case 1: { S[sec].mtop = findHighestCeilingSurrounding(sec); S[sec].mdir = 1; }
      default: { S[sec].mtype = 0u; }
    }
  }
  return rtn;
}

fn evCrushStop(l: u32) -> bool {
  var rtn = false;
  for (var sec = 0u; sec < NUMSECTORS; sec++) {
    if (tagged(l, sec) && S[sec].mtype == 4u && S[sec].mdir != 0) { S[sec].molddir = S[sec].mdir; S[sec].mdir = 0; rtn = true; }
  }
  return rtn;
}

fn evBuildStairs(l: u32, turbo: bool) -> bool {
  var rtn = false;
  let speed = select(0.25, 4.0, turbo);
  let stairsize = select(8.0, 16.0, turbo);
  for (var s0 = 0u; s0 < NUMSECTORS; s0++) {
    if (!tagged(l, s0) || S[s0].mtype != 0u) { continue; }
    rtn = true;
    var sec = s0;
    var height = S[sec].floorh + stairsize;
    S[sec].mtype = 2u; S[sec].msub = -1; S[sec].mdir = 1; S[sec].mspeed = speed; S[sec].mbottom = height; S[sec].mcrush = 0u;
    let texture = S[sec].floorpic;
    for (var guard = 0; guard < 256; guard++) {
      var ok = false;
      let sl = M_SECLINE + 2u * sec;
      for (var i = 0u; i < M[sl + 1u]; i++) {
        let ln = M[M_SECLIST + M[sl] + i];
        if ((lineFlags(ln) & ML_TWOSIDED) == 0u) { continue; }
        if (lineFront(ln) != i32(sec)) { continue; }
        let tsec = u32(lineBack(ln));
        if (S[tsec].floorpic != texture) { continue; }
        height += stairsize;
        if (S[tsec].mtype != 0u) { continue; }
        sec = tsec;
        S[sec].mtype = 2u; S[sec].msub = -1; S[sec].mdir = 1; S[sec].mspeed = speed; S[sec].mbottom = height; S[sec].mcrush = 0u;
        ok = true;
        break;
      }
      if (!ok) { break; }
    }
  }
  return rtn;
}

fn evDonut(l: u32) -> bool {
  var rtn = false;
  for (var s1 = 0u; s1 < NUMSECTORS; s1++) {
    if (!tagged(l, s1) || S[s1].mtype != 0u) { continue; }
    rtn = true;
    let sl = M_SECLINE + 2u * s1;
    if (M[sl + 1u] == 0u) { continue; }
    let s2i = otherSector(M[M_SECLIST + M[sl]], s1);
    if (s2i < 0) { continue; }
    let s2 = u32(s2i);
    let sl2 = M_SECLINE + 2u * s2;
    for (var i = 0u; i < M[sl2 + 1u]; i++) {
      let ln = M[M_SECLIST + M[sl2] + i];
      let bk = lineBack(ln);
      if ((lineFlags(ln) & ML_TWOSIDED) == 0u || bk == i32(s1)) { continue; }
      let s3 = u32(bk);
      S[s2].mtype = 2u; S[s2].msub = FLOOR_donutRaise; S[s2].mcrush = 0u; S[s2].mdir = 1; S[s2].mspeed = 0.5;
      S[s2].mtex = S[s3].floorpic; S[s2].mspecial = 0; S[s2].mbottom = S[s3].floorh;
      S[s1].mtype = 2u; S[s1].msub = FLOOR_lowerFloor; S[s1].mcrush = 0u; S[s1].mdir = -1; S[s1].mspeed = 0.5;
      S[s1].mbottom = S[s3].floorh;
      break;
    }
  }
  return rtn;
}

fn evLightTurnOn(l: u32, bright: i32) {
  for (var sec = 0u; sec < NUMSECTORS; sec++) {
    if (!tagged(l, sec)) { continue; }
    var b = bright;
    if (b == 0) {
      let sl = M_SECLINE + 2u * sec;
      for (var i = 0u; i < M[sl + 1u]; i++) { let o = otherSector(M[M_SECLIST + M[sl] + i], sec); if (o >= 0) { b = max(b, S[o].light); } }
    }
    S[sec].light = b;
  }
}
fn evLightsOff(l: u32) {
  for (var sec = 0u; sec < NUMSECTORS; sec++) {
    if (tagged(l, sec)) { S[sec].light = findMinSurroundingLight(sec, S[sec].light); }
  }
}
fn evStrobe(l: u32) {
  for (var sec = 0u; sec < NUMSECTORS; sec++) {
    if (!tagged(l, sec) || S[sec].ltype != 0u) { continue; }
    S[sec].ltype = 2u; S[sec].ldark = 35; S[sec].lbright = 5; S[sec].lmax = S[sec].light;
    S[sec].lmin = findMinSurroundingLight(sec, S[sec].light);
    if (S[sec].lmin == S[sec].lmax) { S[sec].lmin = 0; }
    S[sec].lcount = (P_Random() & 7) + 1;
  }
}

fn evTeleport(l: u32, side: u32, mi: u32) -> bool {
  if ((O[mi].flags & MF_MISSILE) != 0u) { return false; }
  if (side == 1u) { return false; }
  for (var sec = 0u; sec < NUMSECTORS; sec++) {
    if (!tagged(l, sec)) { continue; }
    for (var j = 0u; j < mobjEnd(); j++) {
      if (O[j].inuse == 0u || O[j].mtype != MT_TELEPORTMAN || O[j].sector != sec) { continue; }
      let old = ipos(mi); let oldz = O[mi].z;
      // P_TeleportMove: walls do not matter; things on the spot are stomped, by the player only
      // (and by monsters on MAP30)
      let dest = ipos(j);
      let stomp = mi == 0u || (COMMERCIAL && GAMEMAP == 30);
      for (var k = 0u; k < mobjEnd(); k++) {
        if (k == mi || O[k].inuse == 0u || (O[k].flags & MF_SHOOTABLE) == 0u) { continue; }
        let bd = fixedOf(O[k].radius + O[mi].radius);
        if (abs(O[k].x - dest.x) >= bd || abs(O[k].y - dest.y) >= bd) { continue; }
        if (!stomp) { return false; }
      }
      if (stomp) {
        for (var k = 0u; k < mobjEnd(); k++) {
          if (k == mi || O[k].inuse == 0u || (O[k].flags & MF_SHOOTABLE) == 0u) { continue; }
          let bd = fixedOf(O[k].radius + O[mi].radius);
          if (abs(O[k].x - dest.x) >= bd || abs(O[k].y - dest.y) >= bd) { continue; }
          damageMobj(k, i32(mi), i32(mi), 10000);
        }
      }
      let dsec = sectorAt(dest);
      unlinkThing(mi);
      O[mi].x = dest.x; O[mi].y = dest.y; O[mi].sector = dsec;
      linkThing(mi);
      O[mi].floorz = S[dsec].floorh; O[mi].ceilingz = S[dsec].ceilh; O[mi].dropoffz = S[dsec].floorh;
      O[mi].z = O[mi].floorz;
      if (mi == 0u) { P.viewz = O[mi].z + P.viewheight; }
      _ = spawnMobjI(old, oldz, MT_TFOG);
      startSound(SFX_telept, fxf(old.x), fxf(old.y));
      let a = O[j].angle;
      let fa = a >> 19u;
      _ = spawnMobjI(dest + vec2i(20 * fineCosFx(fa), 20 * fineSinFx(fa)), O[mi].z, MT_TFOG);
      startSound(SFX_telept, fxf(dest.x), fxf(dest.y));
      if (mi == 0u) { O[mi].reactiontime = 18; }
      O[mi].angle = a; O[mi].momx = 0.0; O[mi].momy = 0.0; O[mi].momz = 0.0;
      O[mi].px = fxf(O[mi].x); O[mi].py = fxf(O[mi].y); O[mi].pz = O[mi].z;
      if (mi == 0u) { P.pvx = O[mi].px; P.pvy = O[mi].py; P.pvz = P.viewz; P.pva = bamToRad(a); }
      return true;
    }
  }
  return false;
}

// Run the action of a special. Returns true when something happened.
fn runAction(l: u32, mi: u32, side: u32, spec: u32) -> bool {
  actTag = lineTag(l);
  let ac = (spec >> 8u) & 0xffu;
  let arg = i32((spec >> 16u) & 0xfffu);
  let key = spec >> 28u;
  // doors, floors and ceilings each have one call site below (every call is inlined)
  var door = -1; var floor = -1; var ceil = -1;
  switch (ac) {
    case 1u: { door = arg; }
    case 2u: { floor = arg; }
    case 3u: { return evDoPlat(l, arg); }
    case 4u: { ceil = arg; }
    case 5u: { return evBuildStairs(l, arg == 1); }
    case 6u: { evLightTurnOn(l, arg); return true; }
    case 7u: { evStrobe(l); return true; }
    case 8u: { evLightsOff(l); return true; }
    case 9u: { P.exit = 1u; return true; }
    case 10u: { P.exit = 2u; return true; }
    case 11u: { return evTeleport(l, side, mi); }
    case 12u: { evStopPlat(l); return true; }
    case 13u: { return evCrushStop(l); }
    case 14u: { evVerticalDoor(l, mi, arg, key); return true; }
    case 15u: {
      if (mi != 0u) { return false; }
      if (!hasKey(key)) { setMessage(${msgId("YOU NEED A BLUE KEY TO ACTIVATE THIS OBJECT")} + i32(key) - 1); mobjSound(0u, SFX_oof); return false; }
      door = arg;
    }
    case 16u: { ceil = CEIL_raiseToHighest; floor = FLOOR_lowerFloorToLowest; }
    case 17u: { return evDonut(l); }
    default: { return false; }
  }
  var did = false;
  if (ceil >= 0) { did = evDoCeiling(l, ceil); }
  if (floor >= 0) { let b = evDoFloor(l, floor); did = did || b; }
  if (door >= 0) { did = evDoDoor(l, door); }
  return did;
}

fn changeSwitchTexture(l: u32, useAgain: bool) {
  if (!useAgain) { clearSpecial(l); }
  let sd = lineSide(l, 0u);
  if (sd < 0) { return; }
  let n = G[G_SWITCH];
  let snd = select(SFX_swtchn, SFX_swtchx, lineSpecial(l) == 11u);
  for (var part = 0u; part < 3u; part++) {
    let t = sideTex(u32(sd), part);
    for (var i = 0u; i < n; i++) {
      let a = G[G_SWITCH + 1u + 2u * i]; let b = G[G_SWITCH + 2u + 2u * i];
      var other = NOTEX;
      if (t == a) { other = b; } else if (t == b) { other = a; }
      if (other == NOTEX) { continue; }
      startSound(snd, lineA(l).x, lineA(l).y);
      setSideTex(u32(sd), part, other);
      if (useAgain) {
        for (var k = 0u; k < 16u; k++) {
          if (P.buttons[k].w <= 0) { P.buttons[k] = vec4i(sd, i32(part), i32(t), 35); break; }
        }
      }
      return;
    }
  }
}

fn useSpecialLine(l: u32, side: u32, mi: u32) -> bool {
  let special = lineSpecial(l);
  let spec = G[G_LSPEC + min(special, 255u)];
  let tr = spec & 7u;
  if (side != 0u && special != 124u) { return false; }
  if (mi != 0u) {
    if ((lineFlags(l) & ML_SECRET) != 0u) { return false; }
    if (((spec >> 4u) & 1u) == 0u) { return false; }
  }
  if (tr != TR_D && tr != TR_S) { return false; }
  let did = runAction(l, mi, side, spec); // one call site for both kinds: every call is inlined
  if (tr == TR_D) { return did; }
  let rep = ((spec >> 3u) & 1u) != 0u;
  let ac = (spec >> 8u) & 0xffu;
  if (did || ac == AC_EXIT || ac == AC_SECRETEXIT || ac == AC_LIGHT) {
    changeSwitchTexture(l, rep);
  }
  return true;
}

fn crossSpecialLine(l: u32, side: u32, mi: u32) {
  let special = lineSpecial(l);
  let spec = G[G_LSPEC + min(special, 255u)];
  if ((spec & 7u) != TR_W) { return; }
  let mon = (spec >> 4u) & 3u;
  if (mi != 0u) {
    if ((O[mi].flags & MF_MISSILE) != 0u) { return; }
    if (mon == 0u) { return; }
  } else if (mon == 2u) { return; }
  let did = runAction(l, mi, side, spec);
  let rep = ((spec >> 3u) & 1u) != 0u;
  let ac = (spec >> 8u) & 0xffu;
  if (!rep && (did || ac != AC_TELEPORT)) { clearSpecial(l); }
}

fn shootSpecialLine(l: u32, mi: u32) {
  let special = lineSpecial(l);
  let spec = G[G_LSPEC + min(special, 255u)];
  if ((spec & 7u) != TR_G) { return; }
  if (mi != 0u && ((spec >> 4u) & 1u) == 0u) { return; }
  if (runAction(l, mi, 0u, spec)) { changeSwitchTexture(l, ((spec >> 3u) & 1u) != 0u); }
}

// P_UseLines: walk the lines crossed by the use trace, nearest first.
fn useLines() {
  let me = O[0];
  let a = bamToRad(me.angle);
  let p0 = mpos(0u);
  let p1 = p0 + vec2f(cos(a), sin(a)) * USERANGE;
  var last = -1.0;
  for (var iter = 0; iter < 16; iter++) {
    var best = 2.0; var bl = -1;
    for (var l = 0u; l < NUMLINES; l++) {
      let a1 = lineA(l); let e = lineB(l) - a1; let dd = p1 - p0;
      let den = dd.x * e.y - dd.y * e.x;
      if (abs(den) < 1e-9) { continue; }
      let ap = a1 - p0;
      let t = (ap.x * e.y - ap.y * e.x) / den;
      let s = (ap.x * dd.y - ap.y * dd.x) / den;
      if (s < 0.0 || s > 1.0 || t < 0.0 || t > 1.0 || t <= last) { continue; }
      if (t < best) { best = t; bl = i32(l); }
    }
    if (bl < 0) { return; }
    last = best;
    let l = u32(bl);
    if (lineSpecial(l) == 0u) {
      let back = lineBack(l);
      if (back < 0 || (lineFlags(l) & ML_TWOSIDED) == 0u) { mobjSound(0u, SFX_noway); return; }
      let F = S[lineFront(l)]; let B = S[back];
      if (min(F.ceilh, B.ceilh) - max(F.floorh, B.floorh) <= 0.0) { mobjSound(0u, SFX_noway); return; }
      continue;
    }
    queueActivation(l, pointOnLineSide(ipos(0u), l), 1u, 0u);
    return;
  }
}

// ---- items
fn giveAmmo(am: i32, num: i32) -> bool {
  if (P.ammo[am] >= P.maxammo[am]) { return false; }
  var clip = array<i32, 4>(10, 4, 20, 1);
  var n = select(clip[am] / 2, clip[am] * num, num > 0);
  if (P.skill == 0 || P.skill == 4) { n *= 2; }
  let old = P.ammo[am];
  P.ammo[am] = min(P.ammo[am] + n, P.maxammo[am]);
  if (old == 0) {
    // DOOM's auto-switch on picking up ammo for an empty weapon
    if (am == 0 && (P.readyweapon == 0)) { P.pendingweapon = select(1, 3, (P.weapons & 8u) != 0u); }
    if (am == 1 && (P.readyweapon == 0 || P.readyweapon == 1) && (P.weapons & 4u) != 0u) { P.pendingweapon = 2; }
  }
  return true;
}
fn giveWeapon(w: i32, dropped: bool) -> bool {
  var ammoOf = array<i32, 9>(-1, 0, 1, 0, 3, 2, 2, -1, 1);
  let am = ammoOf[w];
  var gave = false;
  if (am >= 0) { gave = giveAmmo(am, select(2, 1, dropped)); }
  if ((P.weapons & (1u << u32(w))) == 0u) {
    P.weapons |= 1u << u32(w);
    P.pendingweapon = w;
    return true;
  }
  return gave;
}
fn giveBody(n: i32) -> bool {
  if (P.health >= MAXHEALTH) { return false; }
  P.health = min(P.health + n, MAXHEALTH); O[0].health = P.health;
  return true;
}
fn giveArmor(ty: i32) -> bool {
  let hits = ty * 100;
  if (P.armor >= hits) { return false; }
  P.armortype = ty; P.armor = hits;
  return true;
}
fn givePower(pw: i32) -> bool {
  switch (pw) {
    case 0: { P.powers[0] = 30 * 35; return true; }
    case 2: { P.powers[2] = 60 * 35; O[0].flags |= MF_SHADOW; return true; }
    case 3: { P.powers[3] = 60 * 35; return true; }
    case 5: { P.powers[5] = 120 * 35; return true; }
    case 1: { _ = giveBody(100); P.powers[1] = 1; return true; }
    default: {
      if (P.powers[pw] != 0) { return false; }
      P.powers[pw] = 1; return true;
    }
  }
}

fn touchSpecialThing(sp: u32, toucher: u32) {
  if (toucher != 0u) { return; }
  let delta = O[sp].z - O[toucher].z;
  if (delta > O[toucher].height || delta < -8.0) { return; }
  if (P.health <= 0) { return; }
  let sprite = G[G_STATES + 8u * O[sp].state];
  let dropped = (O[sp].flags & MF_DROPPED) != 0u;
  var sound = SFX_itemup;
  var msg = 0;
  switch (sprite) {
    case SPR_ARM1: { if (!giveArmor(1)) { return; } msg = ${msgId("PICKED UP THE ARMOR.")}; }
    case SPR_ARM2: { if (!giveArmor(2)) { return; } msg = ${msgId("PICKED UP THE MEGAARMOR!")}; }
    case SPR_BON1: { P.health = min(P.health + 1, 200); O[0].health = P.health; msg = ${msgId("PICKED UP A HEALTH BONUS.")}; }
    case SPR_BON2: { P.armor = min(P.armor + 1, 200); if (P.armortype == 0) { P.armortype = 1; } msg = ${msgId("PICKED UP AN ARMOR BONUS.")}; }
    case SPR_SOUL: { P.health = min(P.health + 100, 200); O[0].health = P.health; msg = ${msgId("SUPERCHARGE!")}; sound = SFX_getpow; }
    case SPR_MEGA: { P.health = 200; O[0].health = 200; _ = giveArmor(2); msg = ${msgId("MEGASPHERE!")}; sound = SFX_getpow; }
    case SPR_BKEY, SPR_YKEY, SPR_RKEY, SPR_BSKU, SPR_YSKU, SPR_RSKU: {
      var k = 0u;
      if (sprite == SPR_YKEY) { k = 1u; } else if (sprite == SPR_RKEY) { k = 2u; }
      else if (sprite == SPR_BSKU) { k = 3u; } else if (sprite == SPR_YSKU) { k = 4u; } else if (sprite == SPR_RSKU) { k = 5u; }
      if ((P.cards & (1u << k)) == 0u) { msg = ${msgId("PICKED UP A BLUE KEYCARD.")} + i32(k); }
      P.cards |= 1u << k;
    }
    case SPR_STIM: { if (!giveBody(10)) { return; } msg = ${msgId("PICKED UP A STIMPACK.")}; }
    case SPR_MEDI: {
      let low = P.health < 25;
      if (!giveBody(25)) { return; }
      msg = select(${msgId("PICKED UP A MEDIKIT.")}, ${msgId("PICKED UP A MEDIKIT THAT YOU REALLY NEED!")}, low);
    }
    case SPR_PINV: { if (!givePower(0)) { return; } msg = ${msgId("INVULNERABILITY!")}; sound = SFX_getpow; }
    case SPR_PSTR: { if (!givePower(1)) { return; } msg = ${msgId("BERSERK!")}; if (P.readyweapon != 0) { P.pendingweapon = 0; } sound = SFX_getpow; }
    case SPR_PINS: { if (!givePower(2)) { return; } msg = ${msgId("PARTIAL INVISIBILITY")}; sound = SFX_getpow; }
    case SPR_SUIT: { if (!givePower(3)) { return; } msg = ${msgId("RADIATION SHIELDING SUIT")}; sound = SFX_getpow; }
    case SPR_PMAP: { if (!givePower(4)) { return; } msg = ${msgId("COMPUTER AREA MAP")}; sound = SFX_getpow; }
    case SPR_PVIS: { if (!givePower(5)) { return; } msg = ${msgId("LIGHT AMPLIFICATION VISOR")}; sound = SFX_getpow; }
    case SPR_CLIP: { if (!giveAmmo(0, select(1, 0, dropped))) { return; } msg = ${msgId("PICKED UP A CLIP.")}; }
    case SPR_AMMO: { if (!giveAmmo(0, 5)) { return; } msg = ${msgId("PICKED UP A BOX OF BULLETS.")}; }
    case SPR_ROCK: { if (!giveAmmo(3, 1)) { return; } msg = ${msgId("PICKED UP A ROCKET.")}; }
    case SPR_BROK: { if (!giveAmmo(3, 5)) { return; } msg = ${msgId("PICKED UP A BOX OF ROCKETS.")}; }
    case SPR_CELL: { if (!giveAmmo(2, 1)) { return; } msg = ${msgId("PICKED UP AN ENERGY CELL.")}; }
    case SPR_CELP: { if (!giveAmmo(2, 5)) { return; } msg = ${msgId("PICKED UP AN ENERGY CELL PACK.")}; }
    case SPR_SHEL: { if (!giveAmmo(1, 1)) { return; } msg = ${msgId("PICKED UP 4 SHOTGUN SHELLS.")}; }
    case SPR_SBOX: { if (!giveAmmo(1, 5)) { return; } msg = ${msgId("PICKED UP A BOX OF SHOTGUN SHELLS.")}; }
    case SPR_BPAK: {
      if (P.backpack == 0u) { for (var i = 0; i < 4; i++) { P.maxammo[i] *= 2; } P.backpack = 1u; }
      for (var i = 0; i < 4; i++) { _ = giveAmmo(i, 1); }
      msg = ${msgId("PICKED UP A BACKPACK FULL OF AMMO!")};
    }
    case SPR_BFUG: { if (!giveWeapon(6, false)) { return; } msg = ${msgId("YOU GOT THE BFG9000!  OH, YES.")}; sound = SFX_wpnup; }
    case SPR_MGUN: { if (!giveWeapon(3, dropped)) { return; } msg = ${msgId("YOU GOT THE CHAINGUN!")}; sound = SFX_wpnup; }
    case SPR_CSAW: { if (!giveWeapon(7, false)) { return; } msg = ${msgId("A CHAINSAW!  FIND SOME MEAT!")}; sound = SFX_wpnup; }
    case SPR_LAUN: { if (!giveWeapon(4, false)) { return; } msg = ${msgId("YOU GOT THE ROCKET LAUNCHER!")}; sound = SFX_wpnup; }
    case SPR_PLAS: { if (!giveWeapon(5, false)) { return; } msg = ${msgId("YOU GOT THE PLASMA GUN!")}; sound = SFX_wpnup; }
    case SPR_SHOT: { if (!giveWeapon(2, dropped)) { return; } msg = ${msgId("YOU GOT THE SHOTGUN!")}; sound = SFX_wpnup; }
    case SPR_SGN2: { if (!giveWeapon(8, dropped)) { return; } msg = ${msgId("YOU GOT THE SUPER SHOTGUN!")}; sound = SFX_wpnup; }
    default: { return; }
  }
  if (msg != 0) { setMessage(msg); }
  if ((O[sp].flags & MF_COUNTITEM) != 0u) { P.itemcount += 1; }
  removeMobj(sp);
  P.bonuscount += 6;
  mobjSound(0u, sound);
}

// ---- small helpers
fn info(ty: u32, field: u32) -> i32 { return gi(G_MOBJINFO + 24u * ty + field); }
fn stateNext(st: u32) -> u32 { return G[G_STATES + 8u * st + 4u]; }
fn approxDist(d: vec2f) -> f32 { let a = abs(d); return a.x + a.y - min(a.x, a.y) * 0.5; }
fn angleTo(a: vec2f, b: vec2f) -> f32 { let d = b - a; return atan2(d.y, d.x); }
// DOOM's finesine table: angle >> ANGLETOFINESHIFT, and finesine[i] = sin((i + 0.5) * 2 pi / 8192)
fn fineAngle(a: f32) -> u32 { return u32(i32(floor(a / TAU * 8192.0 + 1e-3)) & 8191); }
fn fineSinFx(i: u32) -> i32 { return gi(G_FINESINE + (i & 8191u)); }
fn fineCosFx(i: u32) -> i32 { return gi(G_FINESINE + ((i + 2048u) & 8191u)); }
fn fineSin(i: u32) -> f32 { return f32(fineSinFx(i)) / 65536.0; }
fn fineCos(i: u32) -> f32 { return fineSin(i + 2048u); }
// R_PointToAngle2 on 16.16 coordinates: SlopeDiv into tantoangle, by octant, as a 32-bit BAM
fn fixedOf(v: f32) -> i32 { return i32(round(v * 65536.0)); }
fn fxf(v: i32) -> f32 { return f32(v) / 65536.0; }
fn fxv(v: vec2f) -> vec2i { return vec2i(fixedOf(v.x), fixedOf(v.y)); }
fn fv(v: vec2i) -> vec2f { return vec2f(fxf(v.x), fxf(v.y)); }
fn bamToRad(b: u32) -> f32 { return f32(b) * (TAU / 4294967296.0); }
fn slopeDiv(num: u32, den: u32) -> u32 { if (den < 512u) { return 2048u; } return min((num << 3u) / (den >> 8u), 2048u); }
fn tanToAngle(i: u32) -> u32 { return G[G_TANTOANGLE + i]; }
fn pointToAngle(a: vec2i, b: vec2i) -> u32 {
  var x = b.x - a.x;
  var y = b.y - a.y;
  if (x == 0 && y == 0) { return 0u; }
  let A90 = 0x40000000u; let A180 = 0x80000000u; let A270 = 0xc0000000u;
  if (x >= 0) {
    if (y >= 0) {
      if (x > y) { return tanToAngle(slopeDiv(u32(y), u32(x))); }
      return A90 - 1u - tanToAngle(slopeDiv(u32(x), u32(y)));
    }
    y = -y;
    if (x > y) { return 0u - tanToAngle(slopeDiv(u32(y), u32(x))); }
    return A270 + tanToAngle(slopeDiv(u32(x), u32(y)));
  }
  x = -x;
  if (y >= 0) {
    if (x > y) { return A180 - 1u - tanToAngle(slopeDiv(u32(y), u32(x))); }
    return A90 + tanToAngle(slopeDiv(u32(x), u32(y)));
  }
  y = -y;
  if (x > y) { return A180 + tanToAngle(slopeDiv(u32(y), u32(x))); }
  return A270 - 1u - tanToAngle(slopeDiv(u32(x), u32(y)));
}
// P_AproxDistance in 16.16
fn approxDistFx(a: vec2i, b: vec2i) -> i32 {
  let dx = abs(b.x - a.x); let dy = abs(b.y - a.y);
  return dx + dy - (min(dx, dy) >> 1u);
}
fn subRandomI() -> i32 { let r = P_Random(); return r - P_Random(); }
// FixedMul without 64 bits: split both factors into 16-bit halves; wraps like DOOM's (int) cast
fn fxMul(a: i32, b: i32) -> i32 {
  let ah = a >> 16u; let al = u32(a & 0xffff); let bh = b >> 16u; let bl = u32(b & 0xffff);
  return a * bh + ah * i32(bl) + i32((al * bl) >> 16u);
}
fn fx(v: f32) -> f32 { return f32(fixedOf(v)) / 65536.0; }
// FixedDiv: (a << 16) / b truncated, saturating when the quotient overflows, by long division
fn fxDiv(a: i32, b: i32) -> i32 {
  let ua = u32(abs(a)); let ub = u32(abs(b));
  let neg = (a ^ b) < 0;
  // INT_MAX, or INT_MIN when negative, from the runtime sign: Safari folds any constant INT_MIN to the Metal
  // literal -2147483648, which is a long there, and select(int, long, bool) is ambiguous
  if ((ua >> 14u) >= ub) { return bitcast<i32>(0x7fffffffu + u32(neg)); }
  var q = ua / ub; var r = ua % ub;
  for (var k = 0; k < 16; k++) { r <<= 1u; q <<= 1u; if (r >= ub) { r -= ub; q |= 1u; } }
  return select(i32(q), -i32(q), neg);
}
// FixedMul(mom, FRICTION = 0xe800), exact: 0xe800 = 232 << 8
fn friction(m: f32) -> f32 { return f32((fixedOf(m) * 232) >> 8u) / 65536.0; }
fn wrapPi(a: f32) -> f32 { return a - TAU * floor((a + PI) / TAU); }
fn subRandom() -> f32 { return f32(P_Random() - P_Random()); }
// loops over things stop at the highest slot in use (a save from before this was kept has 0)
fn mobjEnd() -> u32 { return select(min(P.mobjtop, MAXMOBJS), MAXMOBJS, P.mobjtop == 0u); }
fn mpos(i: u32) -> vec2f { return vec2f(fxf(O[i].x), fxf(O[i].y)); }
fn ipos(i: u32) -> vec2i { return vec2i(O[i].x, O[i].y); }

// ---- blocklinks (P_SetThingPosition / P_UnsetThingPosition): each blockmap cell keeps a list of
// the things in it, newest first, so collision looks only at the cells around a move, in DOOM's order.
// The heads live in LS after the side textures, as thing index + 1 (0 is empty).
const BLOCKHEADS = NUMLINES + 3u * NUMSIDES;
fn blockCell(p: vec2i) -> i32 {
  let bx = (p.x - (i32(BM_X) << 16u)) >> 23u; let by = (p.y - (i32(BM_Y) << 16u)) >> 23u;
  if (bx < 0 || by < 0 || bx >= BM_W || by >= BM_H) { return -1; }
  return by * BM_W + bx;
}
fn unlinkThing(mi: u32) {
  if ((O[mi].flags & MF_NOBLOCKMAP) != 0u) { return; }
  let c = blockCell(ipos(mi));
  if (c < 0) { return; }
  let h = BLOCKHEADS + u32(c);
  if (LS[h] == mi + 1u) { LS[h] = u32(O[mi].bnext); return; }
  var cur = LS[h];
  for (var guard = 0; guard < 4096 && cur != 0u; guard++) {
    let nx = u32(O[cur - 1u].bnext);
    if (nx == mi + 1u) { O[cur - 1u].bnext = O[mi].bnext; return; }
    cur = nx;
  }
}
fn linkThing(mi: u32) {
  O[mi].bnext = 0;
  if ((O[mi].flags & MF_NOBLOCKMAP) != 0u) { return; }
  let c = blockCell(ipos(mi));
  if (c < 0) { return; }
  let h = BLOCKHEADS + u32(c);
  O[mi].bnext = i32(LS[h]); LS[h] = mi + 1u;
}
fn removeMobj(mi: u32) { unlinkThing(mi); O[mi].inuse = 0u; }

// ---- sight (P_CheckSight): REJECT, then DOOM's walk of the BSP from eye to target (p_sight.c).
// P_DivlineSide with its integer-truncated products and its x == node->y slip, kept as vanilla has them.
// P_DivlineSide: only the integer parts of both products, ties return 2 ("on")
fn sightSide(p: vec2i, o: vec2i, d: vec2i) -> u32 {
  if (d.x == 0) {
    if (p.x == o.x) { return 2u; }
    if (p.x <= o.x) { return select(0u, 1u, d.y > 0); }
    return select(0u, 1u, d.y < 0);
  }
  if (d.y == 0) {
    if (p.x == o.y) { return 2u; } // sic: vanilla compares x with the node's y here
    if (p.y <= o.y) { return select(0u, 1u, d.x < 0); }
    return select(0u, 1u, d.x > 0);
  }
  let left = (d.y >> 16u) * ((p.x - o.x) >> 16u);
  let right = ((p.y - o.y) >> 16u) * (d.x >> 16u);
  if (right < left) { return 0u; }
  if (left == right) { return 2u; }
  return 1u;
}
var<private> sightTop: i32;
var<private> sightBottom: i32;
var<private> sightZ: i32;
// P_CrossSubsector in 16.16
fn crossSubsector(num: u32, p0: vec2i, p1: vec2i) -> bool {
  let d = p1 - p0;
  let n = M[M_SSEC + 4u * num]; let first = M[M_SSEC + 4u * num + 1u];
  for (var k = 0u; k < n; k++) {
    let l = M[M_SEG + 6u * (first + k) + 2u];
    let a = fxv(lineA(l)); let b = fxv(lineB(l)); let dl = b - a;
    if (sightSide(a, p0, d) == sightSide(b, p0, d)) { continue; }
    if (sightSide(p0, a, dl) == sightSide(p1, a, dl)) { continue; }
    if (lineBack(l) < 0 || (lineFlags(l) & ML_TWOSIDED) == 0u) { return false; }
    let F = S[lineFront(l)]; let B = S[lineBack(l)];
    if (F.floorh == B.floorh && F.ceilh == B.ceilh) { continue; }
    let opentop = fixedOf(min(F.ceilh, B.ceilh)); let openbottom = fixedOf(max(F.floorh, B.floorh));
    if (openbottom >= opentop) { return false; }
    // P_InterceptVector2 is P_InterceptVector
    let frac = interceptVector(p0, d, a, dl);
    if (F.floorh != B.floorh) { sightBottom = max(sightBottom, fxDiv(openbottom - sightZ, frac)); }
    if (F.ceilh != B.ceilh) { sightTop = min(sightTop, fxDiv(opentop - sightZ, frac)); }
    if (sightTop <= sightBottom) { return false; }
  }
  return true;
}
fn checkSight(a: u32, b: u32) -> bool {
  let s1 = O[a].sector; let s2 = O[b].sector;
  let pnum = s1 * NUMSECTORS + s2;
  if (((M[M_REJECT + (pnum >> 5u)] >> (pnum & 31u)) & 1u) != 0u) { return false; }
  let ah = fixedOf(O[a].height);
  sightZ = fixedOf(O[a].z) + ah - (ah >> 2u);
  sightTop = fixedOf(O[b].z) + fixedOf(O[b].height) - sightZ;
  sightBottom = fixedOf(O[b].z) - sightZ;
  let p0 = ipos(a); let p1 = ipos(b);
  // P_CrossBSPNode, with an explicit stack in its visiting order
  var stack: array<u32, 64>;
  stack[0] = select(0x8000u, NUMNODES - 1u, NUMNODES > 0u);
  var sp = 1u;
  for (var guard = 0; guard < 4096 && sp > 0u; guard++) {
    sp -= 1u;
    let n = stack[sp];
    if ((n & 0x8000u) != 0u) {
      if (!crossSubsector(select(n & 0x7fffu, 0u, n == 0xffffu), p0, p1)) { return false; }
      continue;
    }
    let o = M_NODE + 14u * n;
    let no = fxv(vec2f(mf(o), mf(o + 1u))); let nd = fxv(vec2f(mf(o + 2u), mf(o + 3u)));
    var side = sightSide(p0, no, nd);
    if (side == 2u) { side = 0u; }
    if (sightSide(p1, no, nd) != side && sp < 64u) { stack[sp] = M[o + 12u + (side ^ 1u)]; sp += 1u; }
    if (sp < 64u) { stack[sp] = M[o + 12u + side]; sp += 1u; }
  }
  return true;
}

// ---- P_NoiseAlert: flood the player's noise through open lines, two sound-blocking lines deep
fn noiseAlert() {
  for (var s = 0u; s < NUMSECTORS; s++) { S[s].pad0 = 99u; }
  S[O[0].sector].pad0 = 1u;
  for (var iter = 0; iter < 96; iter++) {
    var changed = false;
    for (var l = 0u; l < NUMLINES; l++) {
      let bk = lineBack(l);
      if (bk < 0 || (lineFlags(l) & ML_TWOSIDED) == 0u) { continue; }
      let fr = u32(lineFront(l)); let bs = u32(bk);
      if (min(S[fr].ceilh, S[bs].ceilh) - max(S[fr].floorh, S[bs].floorh) <= 0.0) { continue; }
      let block = (lineFlags(l) & 64u) != 0u;
      for (var dir = 0u; dir < 2u; dir++) {
        let src = select(fr, bs, dir == 1u); let dst = select(bs, fr, dir == 1u);
        let st = S[src].pad0;
        if (st > 2u) { continue; }
        var nst = st;
        if (block) { if (st == 1u) { nst = 2u; } else { continue; } }
        if (nst < S[dst].pad0) { S[dst].pad0 = nst; changed = true; }
      }
    }
    if (!changed) { break; }
  }
  for (var s = 0u; s < NUMSECTORS; s++) { if (S[s].pad0 <= 2u) { S[s].soundtarget = 0; } }
}

// ---- spawning
fn spawnMobj(x: f32, y: f32, z: f32, ty: u32) -> i32 { return spawnMobjI(fxv(vec2f(x, y)), z, ty); }
fn spawnMobjI(p: vec2i, z: f32, ty: u32) -> i32 {
  _ = P_Random(); // P_SpawnMobj's lastlook
  // new thinkers go at the end of DOOM's list: take the next free slot after the last one used
  for (var probe = 1u; probe < MAXMOBJS; probe++) {
    let j = 1u + (max(P.spawncursor, 1u) - 1u + probe - 1u) % (MAXMOBJS - 1u);
    if (O[j].inuse != 0u) { continue; }
    P.spawncursor = j + 1u;
    P.mobjtop = max(P.mobjtop, j + 1u);
    let mi = G_MOBJINFO + 24u * ty;
    var m: Mobj;
    m.x = p.x; m.y = p.y; m.angle = 0u;
    m.radius = f32(gi(mi + 16u)); m.height = f32(gi(mi + 17u));
    m.mtype = ty; m.state = G[mi + 1u]; m.tics = gi(G_STATES + 8u * m.state + 2u);
    m.flags = G[mi + 21u]; m.health = gi(mi + 2u);
    m.sector = sectorAt(p);
    m.floorz = S[m.sector].floorh; m.ceilingz = S[m.sector].ceilh;
    m.z = z;
    if (z == ONFLOORZ) { m.z = m.floorz; }
    m.targ = -1; m.tracer = -1; m.reactiontime = select(gi(mi + 5u), 0, P.skill == 4);
    m.movedir = 0; // DI_EAST, as P_SpawnMobj's zeroed mobj has it
    m.req = NOREQ; m.inuse = 1u; m.spawnidx = NOREQ;
    m.px = fxf(m.x); m.py = fxf(m.y); m.pz = m.z;
    O[j] = m;
    linkThing(j);
    return i32(j);
  }
  return -1;
}
fn spawnPuff(p: vec2i, z0: f32, melee: bool) {
  let th = spawnMobjI(p, z0 + subRandom() / 64.0, MT_PUFF);
  if (th < 0) { return; }
  O[th].momz = 1.0;
  O[th].tics = max(O[th].tics - (P_Random() & 3), 1);
  if (melee) { O[th].state = S_PUFF3; O[th].tics = gi(G_STATES + 8u * S_PUFF3 + 2u); }
}
fn spawnBlood(p: vec2i, z0: f32, damage: i32) {
  let th = spawnMobjI(p, z0 + subRandom() / 64.0, MT_BLOOD);
  if (th < 0) { return; }
  O[th].momz = 2.0;
  O[th].tics = max(O[th].tics - (P_Random() & 3), 1);
  var st = 0u;
  if (damage <= 12 && damage >= 9) { st = S_BLOOD2; } else if (damage < 9) { st = S_BLOOD3; }
  if (st != 0u) { O[th].state = st; O[th].tics = gi(G_STATES + 8u * st + 2u); }
}

// P_SpawnMissile / P_SpawnPlayerMissile in one: aimed at dst, or along angle and slope when dst < 0.
fn spawnMissile(src: u32, dst: i32, ty: u32, an0: u32, slope: f32) {
  let th = spawnMobjI(ipos(src), O[src].z + 32.0, ty);
  if (th < 0) { return; }
  let t = u32(th);
  let ss = info(ty, MI_SEESOUND);
  if (ss != 0) { mobjSound(t, u32(ss)); }
  O[t].targ = i32(src);
  var speed = f32(info(ty, MI_SPEED));
  // Nightmare: imp, cacodemon and baron fireballs fly at 20
  if (P.skill == 4 && (ty == MT_BRUISERSHOT || ty == MT_HEADSHOT || ty == MT_TROOPSHOT)) { speed = 20.0; }
  var fa = an0 >> 19u;
  if (dst >= 0) {
    // DOOM's own arithmetic: a BAM angle from tantoangle, speeds from finesine, an integer tic count for momz
    var an = pointToAngle(ipos(src), ipos(u32(dst)));
    if ((O[dst].flags & MF_SHADOW) != 0u) { an += bitcast<u32>(subRandomI() << 20u); }
    fa = an >> 19u;
    O[t].angle = an;
    let dist = max(approxDistFx(ipos(src), ipos(u32(dst))) / (i32(speed) << 16u), 1);
    O[t].momz = f32((fixedOf(O[dst].z) - fixedOf(O[src].z)) / dist) / 65536.0;
  } else {
    O[t].angle = an0;
    O[t].momz = fxf(fxMul(i32(speed) << 16u, fixedOf(slope)));
  }
  O[t].momx = f32(i32(speed) * fineCosFx(fa)) / 65536.0; O[t].momy = f32(i32(speed) * fineSinFx(fa)) / 65536.0;
  // P_CheckMissileSpawn: step half a tic forward (momx >> 1 in 16.16) so a point-blank shot still hits
  O[t].tics = max(O[t].tics - (P_Random() & 3), 1);
  O[t].x += fixedOf(O[t].momx) >> 1u; O[t].y += fixedOf(O[t].momy) >> 1u;
  O[t].z += f32(fixedOf(O[t].momz) >> 1u) / 65536.0;
  if (!tryMove(t, ipos(t))) { explodeMissile(t); }
}

// ---- damage
fn killMobj(source: i32, tgt: u32) {
  let ty = O[tgt].mtype;
  O[tgt].flags &= ~(MF_SHOOTABLE | MF_FLOAT | MF_SKULLFLY);
  if (ty != MT_SKULL) { O[tgt].flags &= ~MF_NOGRAVITY; }
  O[tgt].flags |= MF_CORPSE | MF_DROPOFF;
  O[tgt].height /= 4.0;
  if ((O[tgt].flags & MF_COUNTKILL) != 0u) { P.killcount += 1; }
  if (tgt == 0u) {
    O[0].flags &= ~MF_SOLID;
    P.dead = 1u;
    // P_KillMobj takes 0-3 tics off the death state, the player's included; the player's thing doesn't
    // animate here, but the draw keeps the random sequence in step
    _ = P_Random();
    mobjSound(0u, select(SFX_pldeth, SFX_pdiehi, O[0].health < -50));
    return;
  }
  let xd = info(ty, MI_XDEATHSTATE);
  if (O[tgt].health < -info(ty, MI_SPAWNHEALTH) && xd != 0) { O[tgt].req = u32(xd); }
  else { O[tgt].req = u32(info(ty, MI_DEATHSTATE)); }
  // P_KillMobj takes 0-3 tics off the death state, drawn now; the state itself is set at the next think
  O[tgt].pend = u32(P_Random() & 3) + 1u;
  var item = -1;
  if (ty == MT_WOLFSS || ty == MT_POSSESSED) { item = i32(MT_CLIP); }
  else if (ty == MT_SHOTGUY) { item = i32(MT_SHOTGUN); }
  else if (ty == MT_CHAINGUY) { item = i32(MT_CHAINGUN); }
  if (item >= 0) {
    let d = spawnMobjI(ipos(tgt), ONFLOORZ, u32(item));
    if (d >= 0) { O[d].flags |= MF_DROPPED; }
  }
}

fn damageMobj(tgt: u32, inflictor: i32, source: i32, damage0: i32) {
  if ((O[tgt].flags & MF_SHOOTABLE) == 0u || O[tgt].health <= 0) { return; }
  var damage = damage0;
  if ((O[tgt].flags & MF_SKULLFLY) != 0u) { O[tgt].momx = 0.0; O[tgt].momy = 0.0; O[tgt].momz = 0.0; }
  if (tgt == 0u && P.skill == 0) { damage = damage >> 1u; }
  if (inflictor >= 0 && (O[tgt].flags & MF_NOCLIP) == 0u && !(source == 0 && P.readyweapon == 7)) {
    var ang = pointToAngle(ipos(u32(inflictor)), ipos(tgt));
    var thrust = damage * (8192 * 100) / max(info(O[tgt].mtype, MI_MASS), 1); // 16.16
    if (damage < 40 && damage > O[tgt].health && O[tgt].z - O[inflictor].z > 64.0 && (P_Random() & 1) != 0) { ang += 0x80000000u; thrust *= 4; }
    let fa = ang >> 19u;
    O[tgt].momx = f32(fixedOf(O[tgt].momx) + fxMul(thrust, fineCosFx(fa))) / 65536.0;
    O[tgt].momy = f32(fixedOf(O[tgt].momy) + fxMul(thrust, fineSinFx(fa))) / 65536.0;
  }
  if (tgt == 0u) {
    if (S[O[0].sector].special == 11 && damage >= O[0].health) { damage = O[0].health - 1; }
    if (damage < 1000 && (P.powers[0] > 0 || (P.cheats & 2u) != 0u)) { return; }
    if (P.armortype != 0) {
      var saved = select(damage / 2, damage / 3, P.armortype == 1);
      if (P.armor <= saved) { saved = P.armor; P.armortype = 0; }
      P.armor -= saved; damage -= saved;
    }
    P.health = max(P.health - damage, 0);
    P.attacker = source;
    P.damagecount = min(P.damagecount + damage, 100);
  }
  O[tgt].health -= damage;
  if (O[tgt].health <= 0) { killMobj(source, tgt); return; }
  if (P_Random() < info(O[tgt].mtype, MI_PAINCHANCE) && (O[tgt].flags & MF_SKULLFLY) == 0u) {
    O[tgt].flags |= MF_JUSTHIT;
    O[tgt].req = u32(info(O[tgt].mtype, MI_PAINSTATE));
  }
  O[tgt].reactiontime = 0;
  if ((O[tgt].threshold == 0 || O[tgt].mtype == MT_VILE) && source >= 0 && u32(source) != tgt && O[source].mtype != MT_VILE) {
    O[tgt].targ = source;
    O[tgt].threshold = 100;
    let see = info(O[tgt].mtype, MI_SEESTATE);
    // a pain state asked for above counts as the current state, as DOOM had already set it
    let cur = select(O[tgt].state, O[tgt].req, O[tgt].req != NOREQ);
    if (cur == u32(info(O[tgt].mtype, MI_SPAWNSTATE)) && see != 0) { O[tgt].req = u32(see); }
  }
}

// P_RadiusAttack: the blockmap's thing lists within reach, rows of blocks outer, as vanilla walks them
fn radiusAttack(spot: u32, source: i32, damage: i32) {
  let reach = (damage + 32) << 16u; // + MAXRADIUS
  let bmo = vec2i(i32(BM_X) << 16u, i32(BM_Y) << 16u);
  let c = ipos(spot);
  let yl = (c.y - reach - bmo.y) >> 23u; let yh = (c.y + reach - bmo.y) >> 23u;
  let xl = (c.x - reach - bmo.x) >> 23u; let xh = (c.x + reach - bmo.x) >> 23u;
  for (var by = yl; by <= yh; by++) {
    for (var bx = xl; bx <= xh; bx++) {
      if (bx < 0 || by < 0 || bx >= BM_W || by >= BM_H) { continue; }
      var cur = LS[BLOCKHEADS + u32(by * BM_W + bx)];
      for (var guard = 0; guard < 1024 && cur != 0u; guard++) {
        let j = cur - 1u;
        cur = u32(O[j].bnext);
        if ((O[j].flags & MF_SHOOTABLE) == 0u) { continue; }
        if (O[j].mtype == MT_CYBORG || O[j].mtype == MT_SPIDER) { continue; }
        let d = abs(ipos(j) - c);
        let dist = max((max(d.x, d.y) - fixedOf(O[j].radius)) >> 16u, 0);
        if (dist >= damage) { continue; }
        if (checkSight(j, spot)) { damageMobj(j, i32(spot), source, damage - dist); }
      }
    }
  }
}

// ---- hitscan: P_AimLineAttack (mode 0) and P_LineAttack (mode 1), walked as P_PathTraverse walks
// the blockmap: blocks along the trace, each block's lines then its things, sorted by 16.16 fraction
var<private> linetarget: i32;
var<private> icFrac: array<i32, 128>;
var<private> icId: array<u32, 128>;
var<private> icN: u32;
var<private> icSeen: array<u32, (NUMLINES + 31u) / 32u>; // validcount: each line is tested once a trace
var<private> trP: vec2i;
var<private> trD: vec2i;
// the crossing test (P_PointOnDivlineSide for a long trace, P_PointOnLineSide for a short one) and
// P_InterceptVector, shared with slides; -1 when the line isn't crossed
fn lineIntercept(l: u32, p: vec2i, d: vec2i) -> i32 {
  let a = fxv(lineA(l)); let dl = fxv(lineB(l)) - a;
  var s1 = 0u; var s2 = 0u;
  if (abs(d.x) > 0x100000 || abs(d.y) > 0x100000) { s1 = divlineSide(a, p, d); s2 = divlineSide(a + dl, p, d); }
  else { s1 = pointOnLineSide(p, l); s2 = pointOnLineSide(p + d, l); }
  if (s1 == s2) { return -1; }
  return interceptVector(p, d, a, dl);
}
// P_InterceptVector in 16.16, with its >> 8 pre-shifts
fn interceptVector(p: vec2i, d: vec2i, a: vec2i, dl: vec2i) -> i32 {
  let den = fxMul(dl.y >> 8u, d.x) - fxMul(dl.x >> 8u, d.y);
  if (den == 0) { return 0; }
  return fxDiv(fxMul((a.x - p.x) >> 8u, dl.y) + fxMul((p.y - a.y) >> 8u, dl.x), den);
}
// PIT_AddThingIntercepts: the thing's corner-to-corner diagonal across the trace
fn thingIntercept(j: u32, p: vec2i, d: vec2i) -> i32 {
  let r = fixedOf(O[j].radius); let c = ipos(j);
  var a = vec2i(c.x - r, c.y - r); var b = vec2i(c.x + r, c.y + r);
  if ((d.x ^ d.y) > 0) { a = vec2i(c.x - r, c.y + r); b = vec2i(c.x + r, c.y - r); }
  if (divlineSide(a, p, d) == divlineSide(b, p, d)) { return -1; }
  return interceptVector(p, d, a, b - a);
}
fn addIntercept(frac: i32, id: u32) {
  if (frac < 0 || icN >= 128u) { return; }
  icFrac[icN] = frac; icId[icN] = id; icN += 1u;
}
fn blockIntercepts(bx: i32, by: i32) {
  if (bx < 0 || by < 0 || bx >= BM_W || by >= BM_H) { return; }
  let cell = M_BMCELL + 2u * u32(by * BM_W + bx);
  let start = M[cell]; let n = M[cell + 1u];
  // every vanilla block list starts with line 0
  for (var k = 0u; k <= n; k++) {
    var l = 0u;
    if (k > 0u) { l = M[M_BMLIST + start + k - 1u]; }
    let bit = 1u << (l & 31u);
    if ((icSeen[l >> 5u] & bit) != 0u) { continue; }
    icSeen[l >> 5u] |= bit;
    addIntercept(lineIntercept(l, trP, trD), l);
  }
  var cur = LS[BLOCKHEADS + u32(by * BM_W + bx)];
  for (var guard = 0; guard < 1024 && cur != 0u; guard++) {
    let j = cur - 1u;
    cur = u32(O[j].bnext);
    addIntercept(thingIntercept(j, trP, trD), j | 0x80000000u);
  }
}
// P_PathTraverse's block walk, intercepts only
fn pathTraverse(p1: vec2i, p2: vec2i) {
  icN = 0u;
  for (var k = 0u; k < (NUMLINES + 31u) / 32u; k++) { icSeen[k] = 0u; }
  let bmo = vec2i(i32(BM_X) << 16u, i32(BM_Y) << 16u);
  var x1 = p1.x; var y1 = p1.y;
  // don't side exactly on a line
  if (((x1 - bmo.x) & 0x7fffff) == 0) { x1 += 65536; }
  if (((y1 - bmo.y) & 0x7fffff) == 0) { y1 += 65536; }
  trP = vec2i(x1, y1); trD = p2 - trP;
  let ax1 = x1 - bmo.x; let ay1 = y1 - bmo.y; let ax2 = p2.x - bmo.x; let ay2 = p2.y - bmo.y;
  let xt1 = ax1 >> 23u; let yt1 = ay1 >> 23u; let xt2 = ax2 >> 23u; let yt2 = ay2 >> 23u;
  var mapxstep = 0; var mapystep = 0; var partial = 65536; var ystep = 256 << 16u; var xstep = 256 << 16u;
  if (xt2 > xt1) { mapxstep = 1; partial = 65536 - ((ax1 >> 7u) & 0xffff); ystep = fxDiv(ay2 - ay1, abs(ax2 - ax1)); }
  else if (xt2 < xt1) { mapxstep = -1; partial = (ax1 >> 7u) & 0xffff; ystep = fxDiv(ay2 - ay1, abs(ax2 - ax1)); }
  var yintercept = (ay1 >> 7u) + fxMul(partial, ystep);
  partial = 65536;
  if (yt2 > yt1) { mapystep = 1; partial = 65536 - ((ay1 >> 7u) & 0xffff); xstep = fxDiv(ax2 - ax1, abs(ay2 - ay1)); }
  else if (yt2 < yt1) { mapystep = -1; partial = (ay1 >> 7u) & 0xffff; xstep = fxDiv(ax2 - ax1, abs(ay2 - ay1)); }
  var xintercept = (ax1 >> 7u) + fxMul(partial, xstep);
  var mapx = xt1; var mapy = yt1;
  for (var count = 0; count < 64; count++) {
    blockIntercepts(mapx, mapy);
    if (mapx == xt2 && mapy == yt2) { break; }
    if ((yintercept >> 16u) == mapy) { yintercept += ystep; mapx += mapxstep; }
    else if ((xintercept >> 16u) == mapx) { xintercept += xstep; mapy += mapystep; }
  }
}
// P_TraverseIntercepts: the nearest unvisited intercept (the first added among equals), -1 past the end
fn nextIntercept() -> i32 {
  var dist = 0x7fffffff; var best = -1;
  for (var k = 0u; k < icN; k++) { if (icFrac[k] < dist) { dist = icFrac[k]; best = i32(k); } }
  if (best < 0 || dist > 65536) { return -1; }
  return best;
}
fn trace(mi: u32, angle: u32, range: f32, mode: u32, slope0: f32, damage: i32) -> f32 {
  let fa = angle >> 19u;
  let dist0 = i32(range);
  let attackrange = dist0 << 16u;
  let p0 = ipos(mi);
  pathTraverse(p0, p0 + vec2i(dist0 * fineCosFx(fa), dist0 * fineSinFx(fa)));
  let shootz = fixedOf(O[mi].z) + (fixedOf(O[mi].height) >> 1u) + (8 << 16u);
  // can't aim outside the view: (SCREENHEIGHT / 2) * FRACUNIT / (SCREENWIDTH / 2)
  var topslope = 40960; var bottomslope = -40960;
  let aimslope = fixedOf(slope0);
  let melee = attackrange == (i32(MELEERANGE) << 16u);
  linetarget = -1;
  for (var guard = 0u; guard < 128u; guard++) {
    let k = nextIntercept();
    if (k < 0) { break; }
    let frac = icFrac[k];
    icFrac[k] = 0x7fffffff;
    let id = icId[k];
    let dist = fxMul(attackrange, frac);
    if ((id & 0x80000000u) == 0u) {
      let l = id;
      if (mode == 1u && lineSpecial(l) != 0u) { queueActivation(l, 0u, 2u, mi); }
      let bk = lineBack(l);
      var hit = bk < 0 || (lineFlags(l) & ML_TWOSIDED) == 0u;
      if (mode == 0u && hit) { return 0.0; }
      if (!hit) {
        let F = S[lineFront(l)]; let B = S[bk];
        let opentop = fixedOf(min(F.ceilh, B.ceilh)); let openbottom = fixedOf(max(F.floorh, B.floorh));
        if (mode == 0u) {
          if (openbottom >= opentop) { return 0.0; }
          if (F.floorh != B.floorh) { bottomslope = max(bottomslope, fxDiv(openbottom - shootz, dist)); }
          if (F.ceilh != B.ceilh) { topslope = min(topslope, fxDiv(opentop - shootz, dist)); }
          if (topslope <= bottomslope) { return 0.0; }
          continue;
        }
        if (F.floorh != B.floorh && fxDiv(openbottom - shootz, dist) > aimslope) { hit = true; }
        if (F.ceilh != B.ceilh && fxDiv(opentop - shootz, dist) < aimslope) { hit = true; }
      }
      if (!hit) { continue; }
      // position a bit closer
      let f2 = frac - fxDiv(4 << 16u, attackrange);
      let hp = trP + vec2i(fxMul(trD.x, f2), fxMul(trD.y, f2));
      let z = fxf(shootz + fxMul(aimslope, fxMul(f2, attackrange)));
      let F = S[lineFront(l)];
      if (F.ceilpic == SKYFLAT) {
        // don't shoot the sky
        if (z > F.ceilh) { return 0.0; }
        if (bk >= 0 && S[bk].ceilpic == SKYFLAT) { return 0.0; }
      }
      spawnPuff(hp, z, melee);
      return 0.0;
    }
    let j = id & 0x7fffffffu;
    if (j == mi || (O[j].flags & MF_SHOOTABLE) == 0u) { continue; }
    var tts = fxDiv(fixedOf(O[j].z + O[j].height) - shootz, dist);
    if (mode == 0u) {
      if (tts < bottomslope) { continue; }
      var tbs = fxDiv(fixedOf(O[j].z) - shootz, dist);
      if (tbs > topslope) { continue; }
      tts = min(tts, topslope); tbs = max(tbs, bottomslope);
      linetarget = i32(j);
      return fxf((tts + tbs) / 2);
    }
    if (tts < aimslope) { continue; }
    if (fxDiv(fixedOf(O[j].z) - shootz, dist) > aimslope) { continue; }
    let f2 = frac - fxDiv(10 << 16u, attackrange);
    let hp = trP + vec2i(fxMul(trD.x, f2), fxMul(trD.y, f2));
    let z = fxf(shootz + fxMul(aimslope, fxMul(f2, attackrange)));
    if ((O[j].flags & MF_NOBLOOD) != 0u) { spawnPuff(hp, z, melee); }
    else { spawnBlood(hp, z, damage); }
    if (damage > 0) { damageMobj(j, i32(mi), i32(mi), damage); }
    return 0.0;
  }
  return 0.0;
}

// ---- monster AI
fn faceTarget(mi: u32) {
  let t = O[mi].targ;
  if (t < 0) { return; }
  O[mi].flags &= ~MF_AMBUSH;
  var an = pointToAngle(ipos(mi), ipos(u32(t)));
  if ((O[t].flags & MF_SHADOW) != 0u) { an += bitcast<u32>(subRandomI() << 21u); }
  O[mi].angle = an;
}
// sight to the current target: the per-mobj sight kernel covers the player, else one check per think
var<private> sightTarget: bool;
var<private> sightPlayer: bool;
fn canSeeTarget(mi: u32) -> bool {
  if (O[mi].targ == 0) { return sightPlayer; }
  return sightTarget;
}
fn lookForPlayer(mi: u32, allaround: bool) -> bool {
  if (P.health <= 0 || !sightPlayer) { return false; }
  if (!allaround) {
    let an = pointToAngle(ipos(mi), ipos(0u)) - O[mi].angle;
    if (an > ANG90 && an < ANG270 && approxDistFx(ipos(mi), ipos(0u)) > (i32(MELEERANGE) << 16u)) { return false; }
  }
  O[mi].targ = 0;
  return true;
}
fn checkMeleeRange(mi: u32) -> bool {
  let t = O[mi].targ;
  if (t < 0) { return false; }
  let range = MELEERANGE - 20.0 + f32(info(O[t].mtype, MI_RADIUS));
  if (approxDist(mpos(u32(t)) - mpos(mi)) >= range) { return false; }
  return canSeeTarget(mi);
}
fn checkMissileRange(mi: u32) -> bool {
  if (!canSeeTarget(mi)) { return false; }
  if ((O[mi].flags & MF_JUSTHIT) != 0u) { O[mi].flags &= ~MF_JUSTHIT; return true; }
  if (O[mi].reactiontime != 0) { return false; }
  let ty = O[mi].mtype;
  var dist = i32(approxDist(mpos(mi) - mpos(u32(O[mi].targ)))) - 64;
  if (info(ty, MI_MELEESTATE) == 0) { dist -= 128; }
  if (ty == MT_VILE && dist > 14 * 64) { return false; }
  if (ty == MT_UNDEAD) { if (dist < 196) { return false; } dist >>= 1u; }
  if (ty == MT_CYBORG || ty == MT_SPIDER || ty == MT_SKULL) { dist >>= 1u; }
  dist = min(dist, 200);
  if (ty == MT_CYBORG) { dist = min(dist, 160); }
  return P_Random() >= dist;
}

fn dirVec(d: i32) -> vec2i {
  // DOOM's xspeed/yspeed in 16.16: the diagonal is 47000, not FRACUNIT/sqrt(2)
  var v = array<vec2i, 8>(vec2i(65536, 0), vec2i(47000, 47000), vec2i(0, 65536), vec2i(-47000, 47000),
                          vec2i(-65536, 0), vec2i(-47000, -47000), vec2i(0, -65536), vec2i(47000, -47000));
  return v[clamp(d, 0, 7)];
}

// P_Move: step in movedir; on a block, float over it or push the specials touched (doors)
fn pMove(mi: u32) -> bool {
  let md = O[mi].movedir;
  if (md < 0 || md >= 8) { return false; }
  let spd = info(O[mi].mtype, MI_SPEED);
  if (!tryMove(mi, ipos(mi) + dirVec(md) * spd)) {
    if ((O[mi].flags & MF_FLOAT) != 0u && floatok) {
      O[mi].z += select(-4.0, 4.0, O[mi].z < tmfloorz);
      O[mi].flags |= MF_INFLOAT;
      return true;
    }
    if (numspechit == 0u) { return false; }
    O[mi].movedir = 8;
    var good = false;
    let n = numspechit;
    var hits = spechit;
    for (var k = n; k > 0u; k--) { if (useSpecialLine(hits[k - 1u], 0u, mi)) { good = true; } }
    return good;
  }
  O[mi].flags &= ~MF_INFLOAT;
  if ((O[mi].flags & MF_FLOAT) == 0u) { O[mi].z = O[mi].floorz; }
  return true;
}

// P_NewChaseDir: the candidate directions in DOOM's order, walked with one P_TryWalk call site.
// The random numbers are drawn where vanilla draws them: the first only once the direct diagonal
// has failed, the second only when it falls back to searching every direction.
// With tryMovedir, A_Chase's own P_Move in the current direction goes first through the same call
// site (the shader compiler inlines every call), and the search runs only if that step fails.
fn newChaseDir(mi: u32, tryMovedir: bool) {
  var trying = tryMovedir;
  var started = false;
  var olddir = 8; var turnaround = 8; var delta = vec2f(0.0); var d1 = 8; var d2 = 8;
  var cands: array<i32, 16>; var nc = 0; var pos = 0; var phase = 0u;
  for (var guard = 0; guard < 25; guard++) {
    if (!trying) {
      if (!started) {
        // set up after the first step failed, which may have changed movedir
        started = true;
        let t = O[mi].targ;
        if (t < 0) { return; }
        olddir = O[mi].movedir;
        turnaround = select(8, (olddir + 4) % 8, olddir < 8);
        delta = mpos(u32(t)) - mpos(mi);
        if (delta.x > 10.0) { d1 = 0; } else if (delta.x < -10.0) { d1 = 4; }
        if (delta.y < -10.0) { d2 = 6; } else if (delta.y > 10.0) { d2 = 2; }
        if (d1 != 8 && d2 != 8) {
          var diags = array<i32, 4>(3, 1, 5, 7);
          let dg = diags[select(0, 2, delta.y < 0.0) + select(0, 1, delta.x > 0.0)];
          if (dg != turnaround) { cands[0] = dg; nc = 1; }
        }
      }
      if (pos >= nc) {
        if (phase == 0u) {
          phase = 1u;
          if (P_Random() > 200 || abs(delta.y) > abs(delta.x)) { let tmp = d1; d1 = d2; d2 = tmp; }
          if (d1 == turnaround) { d1 = 8; }
          if (d2 == turnaround) { d2 = 8; }
          if (d1 != 8) { cands[nc] = d1; nc += 1; }
          if (d2 != 8) { cands[nc] = d2; nc += 1; }
          if (olddir != 8) { cands[nc] = olddir; nc += 1; }
          continue;
        }
        if (phase == 1u) {
          phase = 2u;
          let fwd = (P_Random() & 1) != 0;
          for (var i = 0; i < 8; i++) {
            let td = select(7 - i, i, fwd);
            if (td != turnaround) { cands[nc] = td; nc += 1; }
          }
          if (turnaround != 8) { cands[nc] = turnaround; nc += 1; }
          continue;
        }
        break;
      }
      O[mi].movedir = cands[pos]; pos += 1;
    }
    let moved = pMove(mi);
    if (trying) {
      if (moved) { return; } // A_Chase's step worked: no new direction
      trying = false;
      continue;
    }
    if (moved) { O[mi].movecount = P_Random() & 15; return; }
  }
  O[mi].movedir = 8;
}

fn seeSound(mi: u32) {
  var s = info(O[mi].mtype, MI_SEESOUND);
  if (s == 0) { return; }
  if (u32(s) >= SFX_posit1 && u32(s) <= SFX_posit3) { s = i32(SFX_posit1) + P_Random() % 3; }
  else if (u32(s) == SFX_bgsit1 || u32(s) == SFX_bgsit2) { s = i32(SFX_bgsit1) + P_Random() % 2; }
  mobjSound(mi, u32(s));
}

fn look(mi: u32) {
  O[mi].threshold = 0;
  let st = S[O[mi].sector].soundtarget;
  var seen = false;
  if (st >= 0 && (O[st].flags & MF_SHOOTABLE) != 0u) {
    O[mi].targ = st;
    seen = (O[mi].flags & MF_AMBUSH) == 0u || canSeeTarget(mi);
  }
  if (!seen) { seen = lookForPlayer(mi, false); }
  if (!seen) { return; }
  seeSound(mi);
  O[mi].req = u32(info(O[mi].mtype, MI_SEESTATE));
}

fn chase(mi: u32) {
  let ty = O[mi].mtype;
  if (O[mi].reactiontime > 0) { O[mi].reactiontime -= 1; }
  if (O[mi].threshold > 0) {
    let t = O[mi].targ;
    if (t < 0 || O[t].health <= 0) { O[mi].threshold = 0; } else { O[mi].threshold -= 1; }
  }
  // turn toward movedir in 45 degree steps
  if (O[mi].movedir < 8) {
    O[mi].angle &= 7u << 29u;
    let delta = bitcast<i32>(O[mi].angle - (u32(O[mi].movedir) << 29u));
    if (delta > 0) { O[mi].angle -= ANG45; } else if (delta < 0) { O[mi].angle += ANG45; }
  }
  let t = O[mi].targ;
  if (t < 0 || (O[t].flags & MF_SHOOTABLE) == 0u) {
    if (lookForPlayer(mi, true)) { return; }
    O[mi].req = u32(info(ty, MI_SPAWNSTATE));
    return;
  }
  var needDir = false; var chased = false; var tryMovedir = false;
  if ((O[mi].flags & MF_JUSTATTACKED) != 0u) {
    O[mi].flags &= ~MF_JUSTATTACKED;
    if (P.skill != 4) { needDir = true; }
  } else {
    let melee = info(ty, MI_MELEESTATE);
    if (melee != 0 && checkMeleeRange(mi)) {
      let asnd = info(ty, MI_ATTACKSOUND);
      if (asnd != 0) { mobjSound(mi, u32(asnd)); }
      O[mi].req = u32(melee);
      return;
    }
    let missile = info(ty, MI_MISSILESTATE);
    if (missile != 0 && !(P.skill < 4 && O[mi].movecount != 0) && checkMissileRange(mi)) {
      O[mi].req = u32(missile);
      O[mi].flags |= MF_JUSTATTACKED;
      return;
    }
    // a step in movedir, unless movecount ran out, and a new direction if that fails
    O[mi].movecount -= 1;
    needDir = true; tryMovedir = O[mi].movecount >= 0;
    chased = true;
  }
  if (needDir) { newChaseDir(mi, tryMovedir); }
  // the active sound's draw comes after the new direction's, and not after an attack
  let act = info(ty, MI_ACTIVESOUND);
  if (chased && act != 0 && P_Random() < 3) { mobjSound(mi, u32(act)); }
}

fn bossDeath(mi: u32) {
  let ty = O[mi].mtype;
  var ok = false;
  if (COMMERCIAL) { ok = GAMEMAP == 7 && (ty == MT_FATSO || ty == MT_BABY); }
  else {
    switch (GAMEEPISODE) {
      case 1: { ok = GAMEMAP == 8 && ty == MT_BRUISER; }
      case 2: { ok = GAMEMAP == 8 && ty == MT_CYBORG; }
      case 3: { ok = GAMEMAP == 8 && ty == MT_SPIDER; }
      case 4: { ok = (GAMEMAP == 6 && ty == MT_CYBORG) || (GAMEMAP == 8 && ty == MT_SPIDER); }
      default: { ok = GAMEMAP == 8; }
    }
  }
  if (!ok || P.health <= 0) { return; }
  for (var j = 1u; j < mobjEnd(); j++) {
    if (j != mi && O[j].inuse != 0u && O[j].mtype == ty && O[j].health > 0) { return; }
  }
  // the floors that move share one evDoFloor call site (every call is inlined)
  var floor = -1;
  if (COMMERCIAL) {
    if (ty == MT_FATSO) { actTag = 666; floor = FLOOR_lowerFloorToLowest; }
    else { actTag = 667; floor = FLOOR_raiseToTexture; }
  }
  else if (GAMEEPISODE == 1 || (GAMEEPISODE == 4 && GAMEMAP == 8)) { actTag = 666; floor = FLOOR_lowerFloorToLowest; }
  else if (GAMEEPISODE == 4 && GAMEMAP == 6) { actTag = 666; _ = evDoDoor(0u, DOOR_blazeOpen); return; }
  if (floor >= 0) { _ = evDoFloor(0u, floor); return; }
  P.exit = 1u;
}

// Monster state actions. Each shared primitive has one call site at the end,
// so the compiler inlines the movement and attack code once.
fn callAction(mi: u32, act: u32) {
  let ty = O[mi].mtype;
  var doLook = false; var doChase = false; var preSound = 0u;
  var face = false; var shots = 0; var shotSound = 0u; var dmgMod = 5; var dmgMul = 3;
  var meleeMod = 0; var meleeMul = 0; var meleeSound = 0u;
  var missile = -1; var bfg = false;
  switch (act) {
    case A_Look: { doLook = true; }
    case A_Chase, A_VileChase: { doChase = true; }
    case A_Hoof: { preSound = SFX_hoof; doChase = true; }
    case A_Metal: { preSound = SFX_metal; doChase = true; }
    case A_BabyMetal: { preSound = SFX_bspwlk; doChase = true; }
    case A_FaceTarget, A_VileStart, A_VileTarget, A_VileAttack, A_FatRaise: { face = true; }
    case A_PosAttack: { face = true; shots = 1; shotSound = SFX_pistol; }
    case A_SPosAttack: { face = true; shots = 3; shotSound = SFX_shotgn; }
    case A_CPosAttack: { face = true; shots = 1; shotSound = SFX_shotgn; }
    case A_CPosRefire, A_SpidRefire: {
      faceTarget(mi);
      if (P_Random() < select(40, 10, act == A_SpidRefire)) { return; }
      let t = O[mi].targ;
      if (t < 0 || O[t].health <= 0 || !canSeeTarget(mi)) { O[mi].req = u32(info(ty, MI_SEESTATE)); }
      return;
    }
    case A_TroopAttack: { face = true; meleeMod = 8; meleeMul = 3; meleeSound = SFX_claw; missile = i32(MT_TROOPSHOT); }
    case A_SargAttack: { face = true; meleeMod = 10; meleeMul = 4; }
    case A_HeadAttack: { face = true; meleeMod = 6; meleeMul = 10; missile = i32(MT_HEADSHOT); }
    case A_BruisAttack: { meleeMod = 8; meleeMul = 10; meleeSound = SFX_claw; missile = i32(MT_BRUISERSHOT); }
    case A_CyberAttack: { face = true; missile = i32(MT_ROCKET); }
    case A_BspiAttack: { face = true; missile = i32(MT_ARACHPLAZ); }
    case A_SkelMissile: { face = true; missile = i32(MT_TRACER); }
    case A_FatAttack1, A_FatAttack2, A_FatAttack3: { face = true; missile = i32(MT_FATSHOT); }
    case A_SkelWhoosh: { faceTarget(mi); mobjSound(mi, SFX_skeswg); return; }
    case A_SkelFist: { face = true; meleeMod = 10; meleeMul = 6; meleeSound = SFX_skepch; }
    case A_SkullAttack: {
      let t = O[mi].targ;
      if (t < 0) { return; }
      O[mi].flags |= MF_SKULLFLY;
      let asnd = info(ty, MI_ATTACKSOUND);
      if (asnd != 0) { mobjSound(mi, u32(asnd)); }
      faceTarget(mi);
      let fa = O[mi].angle >> 19u;
      O[mi].momx = fxf(20 * fineCosFx(fa)); O[mi].momy = fxf(20 * fineSinFx(fa));
      let dist = max(approxDistFx(ipos(mi), ipos(u32(t))) / (20 << 16u), 1);
      O[mi].momz = fxf((fixedOf(O[t].z) + (fixedOf(O[t].height) >> 1u) - fixedOf(O[mi].z)) / dist);
      return;
    }
    case A_Scream: {
      var s = info(ty, MI_DEATHSOUND);
      if (s == 0) { return; }
      if (u32(s) >= SFX_podth1 && u32(s) <= SFX_podth3) { s = i32(SFX_podth1) + P_Random() % 3; }
      else if (u32(s) == SFX_bgdth1 || u32(s) == SFX_bgdth2) { s = i32(SFX_bgdth1) + P_Random() % 2; }
      mobjSound(mi, u32(s));
      return;
    }
    case A_XScream: { mobjSound(mi, SFX_slop); return; }
    case A_Pain: { let s = info(ty, MI_PAINSOUND); if (s != 0) { mobjSound(mi, u32(s)); } return; }
    case A_PlayerScream: { mobjSound(mi, SFX_pldeth); return; }
    case A_Fall: { O[mi].flags &= ~MF_SOLID; return; }
    case A_Explode: { radiusAttack(mi, O[mi].targ, 128); return; }
    case A_BossDeath: { bossDeath(mi); return; }
    case A_KeenDie: { O[mi].flags &= ~MF_SOLID; return; }
    case A_BFGSpray: { if (O[mi].targ < 0) { return; } bfg = true; }
    default: { return; }
  }
  // The hits below share one trace and one damageMobj call site (the shader compiler inlines every
  // call): A_BFGSpray's 40 tracers, a melee hit, or a hitscan attack's aim and then its pellets.
  var steps = 0; var melee = false;
  if (bfg) { steps = 40; }
  else {
    if (preSound != 0u) { mobjSound(mi, preSound); }
    if (doLook) { look(mi); return; }
    if (doChase) { chase(mi); return; }
    let t = O[mi].targ;
    if (t < 0) { return; }
    if (face) { faceTarget(mi); }
    if (meleeMul > 0 && checkMeleeRange(mi)) {
      if (meleeSound != 0u) { mobjSound(mi, meleeSound); }
      melee = true; steps = 1;
    } else if (missile >= 0) { spawnMissile(mi, t, u32(missile), 0u, 0.0); return; }
    else if (shots > 0) { mobjSound(mi, shotSound); steps = 1 + shots; }
  }
  var slope = 0.0;
  for (var k = 0; k < steps; k++) {
    var victim = -1; var attacker = i32(mi); var dmg = 0;
    if (melee) { victim = O[mi].targ; dmg = (P_Random() % meleeMod + 1) * meleeMul; }
    else {
      // A_BFGSpray traces from whoever fired the BFG; a hitscan attack aims, then shoots each pellet
      var src = mi; var an = O[mi].angle; var range = MISSILERANGE; var mode = 0u; var tdmg = 0;
      if (bfg) { src = u32(O[mi].targ); an = O[mi].angle - ANG90 / 2u + ANG90 / 40u * u32(k); range = 1024.0; }
      else if (k > 0) { an = O[mi].angle + bitcast<u32>(subRandomI() << 20u); mode = 1u; tdmg = (P_Random() % dmgMod + 1) * dmgMul; }
      let r = trace(src, an, range, mode, slope, tdmg);
      if (!bfg && k == 0) { slope = r; }
      if (bfg && linetarget >= 0) {
        let lt = u32(linetarget);
        _ = spawnMobjI(ipos(lt), O[lt].z + O[lt].height / 4.0, MT_EXTRABFG);
        for (var j = 0; j < 15; j++) { dmg += (P_Random() & 7) + 1; }
        victim = linetarget; attacker = i32(src);
      }
    }
    if (victim >= 0) { damageMobj(u32(victim), attacker, attacker, dmg); }
  }
}

// P_SetMobjState with actions. An action or a hit asks for a new state by
// writing req; this loop is the only place states change, so nothing recurses.
fn setMobjState(mi: u32, st0: u32) -> bool {
  var st = st0;
  for (var guard = 0; guard < 32; guard++) {
    if (st == S_NULL) { removeMobj(mi); return false; }
    O[mi].state = st;
    O[mi].tics = gi(G_STATES + 8u * st + 2u);
    // Nightmare: demons run and bite at double speed (DOOM halves these states' tics)
    if (P.skill == 4 && st >= S_SARG_RUN1 && st <= S_SARG_PAIN2) { O[mi].tics = O[mi].tics >> 1u; }
    O[mi].req = NOREQ;
    let act = G[G_STATES + 8u * st + 3u];
    if (act != 0u) { callAction(mi, act); }
    if (O[mi].inuse == 0u) { return false; }
    if (O[mi].req != NOREQ) { st = O[mi].req; continue; }
    if (O[mi].tics != 0) { return true; }
    st = stateNext(st);
  }
  return true;
}

// P_NightmareRespawn
fn nightmareRespawn(mi: u32) {
  let t = M_THINGS + 4u * O[mi].spawnidx;
  let sp = vec2f(mf(t), mf(t + 1u));
  if (!checkPosition(mi, fxv(sp))) { return; }
  let f1 = spawnMobjI(ipos(mi), S[O[mi].sector].floorh, MT_TFOG);
  if (f1 >= 0) { mobjSound(u32(f1), SFX_telept); }
  let f2 = spawnMobj(sp.x, sp.y, ONFLOORZ, MT_TFOG);
  if (f2 >= 0) { mobjSound(u32(f2), SFX_telept); }
  let ty = O[mi].mtype;
  let n = spawnMobj(sp.x, sp.y, ONFLOORZ, ty);
  if (n >= 0) {
    if ((O[n].flags & MF_SPAWNCEILING) != 0u) { O[n].z = O[n].ceilingz - O[n].height; O[n].pz = O[n].z; }
    O[n].spawnidx = O[mi].spawnidx;
    O[n].angle = ANG45 * u32(i32(mf(t + 2u)) / 45);
    if ((M[t + 3u] & 8u) != 0u) { O[n].flags |= MF_AMBUSH; }
    O[n].reactiontime = 18;
  }
  removeMobj(mi);
}

// P_MobjThinker. The player (mi 0) only moves here: its state and weapons run in ticPlayer.
fn mobjThink(mi: u32, isPlayer: bool) {
  numcross = 0u;
  if (O[mi].momx != 0.0 || O[mi].momy != 0.0 || (!isPlayer && (O[mi].flags & MF_SKULLFLY) != 0u)) {
    xyMovement(mi, isPlayer, P.cmdmove != 0u); processCrossings(mi);
  }
  if (O[mi].inuse == 0u) { return; }
  if (O[mi].z != O[mi].floorz || O[mi].momz != 0.0) { zMovement(mi, isPlayer); }
  if (isPlayer || O[mi].inuse == 0u) { return; }
  var next = NOREQ;
  // a state asked for from outside (damage, death, an explosion): DOOM had already set it, so after
  // setting it here this think also counts its first tic, as P_MobjThinker would have
  let outside = O[mi].req != NOREQ;
  if (outside) { next = O[mi].req; }
  else if (O[mi].tics != -1) {
    O[mi].tics -= 1;
    if (O[mi].tics <= 0) { next = stateNext(O[mi].state); }
  } else if (P.skill == 4 && (O[mi].flags & MF_COUNTKILL) != 0u && O[mi].spawnidx != NOREQ) {
    // Nightmare: a corpse that has lain 12 seconds may rise at its spawn point
    O[mi].movecount += 1;
    if (O[mi].movecount >= 12 * 35 && (P.leveltime & 31u) == 0u && P_Random() <= 4) { nightmareRespawn(mi); return; }
  }
  if (next != NOREQ) {
    // the actions about to run ask P_CheckSight; nothing moves before they do, so look once here
    sightPlayer = false; sightTarget = false;
    if ((O[mi].flags & MF_SHOOTABLE) != 0u && info(O[mi].mtype, MI_SEESTATE) != 0) {
      let t = O[mi].targ;
      for (var k = 0; k < 2; k++) {
        var who = 0u;
        if (k == 1) { if (t <= 0 || O[t].inuse == 0u) { break; } who = u32(t); }
        let seen = checkSight(mi, who);
        if (k == 0) { sightPlayer = seen; } else { sightTarget = seen; }
      }
    }
  }
  for (var pass2 = 0; pass2 < 2 && next != NOREQ; pass2++) {
    if (!setMobjState(mi, next)) { return; }
    next = NOREQ;
    if (pass2 == 0 && outside) {
      let pd = O[mi].pend;
      O[mi].pend = 0u;
      if (pd == 0x100u) { O[mi].tics = max(O[mi].tics - (P_Random() & 3), 1); }
      else if (pd != 0u) { O[mi].tics = max(O[mi].tics - i32(pd - 1u), 1); }
      if (O[mi].tics != -1) {
        O[mi].tics -= 1;
        if (O[mi].tics <= 0) { next = stateNext(O[mi].state); }
      }
    }
  }
  // lines a monster walked over in its chase (P_Move): teleporters, monster doors and lifts
  processCrossings(mi);
}

// ---- the player's weapons (P_SetPsprite and friends)
var<private> W_AMMO: array<i32, 9> = array<i32, 9>(-1, 0, 1, 0, 3, 2, 2, -1, 1);
var<private> W_UP: array<u32, 9> = array<u32, 9>(S_PUNCHUP, S_PISTOLUP, S_SGUNUP, S_CHAINUP, S_MISSILEUP, S_PLASMAUP, S_BFGUP, S_SAWUP, S_DSGUNUP);
var<private> W_DOWN: array<u32, 9> = array<u32, 9>(S_PUNCHDOWN, S_PISTOLDOWN, S_SGUNDOWN, S_CHAINDOWN, S_MISSILEDOWN, S_PLASMADOWN, S_BFGDOWN, S_SAWDOWN, S_DSGUNDOWN);
var<private> W_READY: array<u32, 9> = array<u32, 9>(S_PUNCH, S_PISTOL, S_SGUN, S_CHAIN, S_MISSILE, S_PLASMA, S_BFG, S_SAW, S_DSGUN);
var<private> W_ATK: array<u32, 9> = array<u32, 9>(S_PUNCH1, S_PISTOL1, S_SGUN1, S_CHAIN1, S_MISSILE1, S_PLASMA1, S_BFG1, S_SAW1, S_DSGUN1);
var<private> W_FLASH: array<u32, 9> = array<u32, 9>(S_NULL, S_PISTOLFLASH, S_SGUNFLASH1, S_CHAINFLASH1, S_MISSILEFLASH1, S_PLASMAFLASH1, S_BFGFLASH1, S_NULL, S_DSGUNFLASH1);

var<private> pq: array<vec2u, 8>;   // queued (psprite, state) changes
var<private> pqn: u32;
var<private> pspCur: u32;          // the psprite being processed
var<private> pspReq: u32;          // a new state for it, asked by its own action
fn setPsp(pos: u32, st: u32) {
  if (pos == pspCur) { pspReq = st; return; }
  if (pqn < 8u) { pq[pqn] = vec2u(pos, st); pqn += 1u; }
}
fn ammoPerShot(w: i32) -> i32 { if (w == 6) { return 40; } if (w == 8) { return 2; } return 1; }

fn checkAmmo() -> bool {
  let w = P.readyweapon;
  let am = W_AMMO[clamp(w, 0, 8)];
  if (am < 0 || P.ammo[am] >= ammoPerShot(w)) { return true; }
  let own = P.weapons;
  var nw = 0;
  if ((own & 32u) != 0u && P.ammo[2] > 0 && !SHAREWARE) { nw = 5; }
  else if ((own & 256u) != 0u && P.ammo[1] > 2 && COMMERCIAL) { nw = 8; }
  else if ((own & 8u) != 0u && P.ammo[0] > 0) { nw = 3; }
  else if ((own & 4u) != 0u && P.ammo[1] > 0) { nw = 2; }
  else if (P.ammo[0] > 0) { nw = 1; }
  else if ((own & 128u) != 0u) { nw = 7; }
  else if ((own & 16u) != 0u && P.ammo[3] > 0) { nw = 4; }
  else if ((own & 64u) != 0u && P.ammo[2] > 40 && !SHAREWARE) { nw = 6; }
  P.pendingweapon = nw;
  setPsp(0u, W_DOWN[clamp(w, 0, 8)]);
  return false;
}
fn bringUpWeapon() {
  if (P.pendingweapon < 0) { P.pendingweapon = P.readyweapon; }
  if (P.pendingweapon == 7) { mobjSound(0u, SFX_sawup); }
  let st = W_UP[clamp(P.pendingweapon, 0, 8)];
  P.pendingweapon = -1;
  P.pspsy = 128.0;
  setPsp(0u, st);
}

var<private> wantFire: bool;
var<private> wantCheckAmmo: bool;
var<private> shotKind: u32;   // 0 none, 1 bullets, 2 missile, 3 punch, 4 saw
var<private> shotCount: i32;
var<private> shotAccurate: bool;
var<private> shotMissile: u32;

fn pspAction(pos: u32, act: u32) {
  let w = clamp(P.readyweapon, 0, 8);
  let am = W_AMMO[w];
  switch (act) {
    case A_Light0: { P.extralight = 0; }
    case A_Light1: { P.extralight = 1; }
    case A_Light2: { P.extralight = 2; }
    case A_WeaponReady: {
      if (w == 7 && P.pspstate[0] == S_SAW) { mobjSound(0u, SFX_sawidl); }
      if (P.pendingweapon >= 0 || P.health <= 0) { setPsp(0u, W_DOWN[w]); return; }
      if ((U.buttons & 1u) != 0u) {
        if (P.attackdown == 0u || (w != 4 && w != 6)) { P.attackdown = 1u; wantFire = true; return; }
      } else { P.attackdown = 0u; }
      let a = TAU * f32(P.leveltime % 64u) / 64.0;
      P.pspsx = 1.0 + P.bob * cos(a);
      P.pspsy = 32.0 + P.bob * abs(sin(a));
    }
    case A_Lower: {
      P.pspsy += 6.0;
      if (P.pspsy < 128.0) { return; }
      if (P.dead != 0u) { P.pspsy = 128.0; return; }
      if (P.health <= 0) { setPsp(0u, S_NULL); return; }
      P.readyweapon = P.pendingweapon;
      bringUpWeapon();
    }
    case A_Raise: {
      P.pspsy -= 6.0;
      if (P.pspsy > 32.0) { return; }
      P.pspsy = 32.0;
      setPsp(0u, W_READY[w]);
    }
    case A_ReFire: {
      if ((U.buttons & 1u) != 0u && P.pendingweapon < 0 && P.health > 0) { P.refire += 1; wantFire = true; }
      else { P.refire = 0; wantCheckAmmo = true; }
    }
    case A_CheckReload: { wantCheckAmmo = true; }
    case A_GunFlash: { setPsp(1u, W_FLASH[w]); }
    case A_FirePistol: {
      mobjSound(0u, SFX_pistol); P.ammo[am] -= 1; setPsp(1u, W_FLASH[w]);
      shotKind = 1u; shotCount = 1; shotAccurate = P.refire == 0;
    }
    case A_FireShotgun: {
      mobjSound(0u, SFX_shotgn); P.ammo[am] -= 1; setPsp(1u, W_FLASH[w]);
      shotKind = 1u; shotCount = 7; shotAccurate = false;
    }
    case A_FireShotgun2: {
      mobjSound(0u, SFX_dshtgn); P.ammo[am] -= 2; setPsp(1u, W_FLASH[w]);
      shotKind = 1u; shotCount = 20; shotAccurate = false;
    }
    case A_FireCGun: {
      mobjSound(0u, SFX_pistol);
      if (P.ammo[am] <= 0) { return; }
      P.ammo[am] -= 1;
      setPsp(1u, W_FLASH[w] + (P.pspstate[0] - S_CHAIN1));
      shotKind = 1u; shotCount = 1; shotAccurate = P.refire == 0;
    }
    case A_FireMissile: { P.ammo[am] -= 1; shotKind = 2u; shotMissile = MT_ROCKET; }
    case A_FirePlasma: { P.ammo[am] -= 1; setPsp(1u, W_FLASH[w] + u32(P_Random() & 1)); shotKind = 2u; shotMissile = MT_PLASMA; }
    case A_FireBFG: { P.ammo[am] -= 40; shotKind = 2u; shotMissile = MT_BFG; }
    case A_BFGsound: { mobjSound(0u, SFX_bfg); }
    case A_Punch: { shotKind = 3u; }
    case A_Saw: { shotKind = 4u; }
    case A_OpenShotgun2: { mobjSound(0u, SFX_dbopn); }
    case A_LoadShotgun2: { mobjSound(0u, SFX_dbload); }
    case A_CloseShotgun2: {
      mobjSound(0u, SFX_dbcls);
      if ((U.buttons & 1u) != 0u && P.pendingweapon < 0 && P.health > 0) { P.refire += 1; wantFire = true; }
      else { P.refire = 0; wantCheckAmmo = true; }
    }
    default: {}
  }
}

// Fire what the actions asked for: one trace call site for aiming, one for shooting.
fn playerShoot() {
  let kind = shotKind;
  shotKind = 0u;
  if (kind == 0u) { return; }
  let melee = kind >= 3u;
  var an = O[0].angle; var dmg = 0; var range = 1024.0;
  if (melee) {
    dmg = (P_Random() % 10 + 1) * 2;
    if (kind == 3u && P.powers[1] != 0) { dmg *= 10; }
    an += bitcast<u32>(subRandomI() << 18u);
    range = select(MELEERANGE, MELEERANGE + 1.0, kind == 4u);
  }
  // One trace call site (the shader compiler inlines every call): first the aim, once for a fist or
  // the saw, and for a gun P_BulletSlope / P_SpawnPlayerMissile's straight, then 5.6 degrees either
  // side; then the hits. P_GunShot draws the damage before the spread; the super shotgun spreads
  // twice as wide and also up and down (A_FireShotgun2).
  var offs = array<u32, 3>(0u, 1u << 26u, 0u - (1u << 26u));
  let ssg = shotCount == 20;
  let nshots = select(shotCount, 1, melee);
  var slope = 0.0; var found = false; var aims = 0; var shots = 0; var lt = -1;
  for (var guard = 0; guard < 26; guard++) {
    let aiming = !found && aims < select(3, 1, melee);
    var ta = an; var tmode = 0u; var tsl = 0.0; var tdmg = 0; var trange = range;
    if (aiming) {
      if (!melee) { ta = O[0].angle + offs[aims]; }
    } else {
      if (kind == 2u || shots >= nshots) { break; }
      tmode = 1u; tsl = slope;
      if (melee) { tdmg = dmg; }
      else {
        tdmg = 5 * (P_Random() % 3 + 1);
        ta = O[0].angle; trange = MISSILERANGE;
        if (ssg) { ta += bitcast<u32>(subRandomI() << 19u); tsl += f32(subRandomI() << 5u) / 65536.0; }
        else if (!shotAccurate) { ta += bitcast<u32>(subRandomI() << 18u); }
      }
      shots += 1;
    }
    let r = trace(0u, ta, trange, tmode, tsl, tdmg);
    if (aiming) {
      slope = r; aims += 1;
      if (melee) { lt = linetarget; }
      else if (linetarget >= 0) { an = ta; found = true; }
    }
  }
  if (kind == 2u) {
    if (!found) { an = O[0].angle; slope = 0.0; }
    spawnMissile(0u, -1, shotMissile, an, slope);
    return;
  }
  if (!melee) { return; }
  if (lt < 0) { if (kind == 4u) { mobjSound(0u, SFX_sawful); } return; }
  mobjSound(0u, select(SFX_punch, SFX_sawhit, kind == 4u));
  let want = pointToAngle(ipos(0u), ipos(u32(lt)));
  if (kind == 3u) { O[0].angle = want; return; }
  // A_Saw turns toward the target by at most ANG90 / 20 a tic
  let d = want - O[0].angle;
  if (d > ANG180) {
    if (bitcast<i32>(d) < -i32(ANG90 / 20u)) { O[0].angle = want + ANG90 / 21u; } else { O[0].angle -= ANG90 / 20u; }
  } else {
    if (d > ANG90 / 20u) { O[0].angle = want - ANG90 / 21u; } else { O[0].angle += ANG90 / 20u; }
  }
  O[0].flags |= MF_JUSTATTACKED;
}

fn runPsprites() {
  shotKind = 0u;
  // a level's first tic first does P_SetupPsprites (the weapon's raise state and its first action),
  // which DOOM ran at spawn, before any tic; then the tic's P_MovePsprites
  let setup = P.pspstate[0] == 0u && P.dead == 0u && P.health > 0;
  for (var ph = select(1u, 0u, setup); ph < 2u; ph++) {
  pqn = 0u;
  wantFire = false; wantCheckAmmo = false;
  if (ph == 0u) { pspCur = 9u; bringUpWeapon(); }
  else {
    for (var pos = 0u; pos < 2u; pos++) {
      if (P.pspstate[pos] == 0u || P.psptics[pos] == -1) { continue; }
      P.psptics[pos] -= 1;
      if (P.psptics[pos] <= 0 && pqn < 8u) { pq[pqn] = vec2u(pos, stateNext(P.pspstate[pos])); pqn += 1u; }
    }
  }
  for (var qi = 0u; qi < 24u; qi++) {
    if (pqn == 0u) {
      // fire and ammo checks run between state changes, like DOOM's nested calls
      if (wantFire) {
        wantFire = false;
        pspCur = 9u;
        if (checkAmmo()) { setPsp(0u, W_ATK[clamp(P.readyweapon, 0, 8)]); noiseAlert(); }
      } else if (wantCheckAmmo) {
        wantCheckAmmo = false;
        pspCur = 9u;
        _ = checkAmmo();
      }
      if (pqn == 0u) { break; }
    }
    let item = pq[0];
    for (var k = 1u; k < pqn; k++) { pq[k - 1u] = pq[k]; }
    pqn -= 1u;
    let pos = item.x;
    var st = item.y;
    pspCur = pos;
    for (var guard = 0; guard < 16; guard++) {
      if (st == S_NULL) { P.pspstate[pos] = 0u; break; }
      P.pspstate[pos] = st;
      P.psptics[pos] = gi(G_STATES + 8u * st + 2u);
      let m1 = gi(G_STATES + 8u * st + 5u);
      if (m1 != 0) { P.pspsx = f32(m1); P.pspsy = f32(gi(G_STATES + 8u * st + 6u)); }
      pspReq = NOREQ;
      let act = G[G_STATES + 8u * st + 3u];
      if (act != 0u) { pspAction(pos, act); }
      if (pspReq != NOREQ) { st = pspReq; continue; }
      if (P.psptics[pos] != 0) { break; }
      st = stateNext(st);
    }
    pspCur = 9u;
  }
  }
  playerShoot();
}

fn calcHeight(onground: bool) {
  let m = O[0];
  var bob = (m.momx * m.momx + m.momy * m.momy) / 4.0;
  bob = min(bob, MAXBOB);
  P.bob = bob;
  if (!onground) {
    P.viewz = min(m.z + VIEWHEIGHT, m.ceilingz - 4.0);
    return;
  }
  // FINEANGLES/20 truncates to 409, so the bob's period is not quite 20 tics
  let b = bob / 2.0 * fineSin((409u * P.leveltime) & 8191u);
  if (P.dead == 0u) {
    P.viewheight += P.deltaviewheight;
    if (P.viewheight > VIEWHEIGHT) { P.viewheight = VIEWHEIGHT; P.deltaviewheight = 0.0; }
    if (P.viewheight < VIEWHEIGHT / 2.0) { P.viewheight = VIEWHEIGHT / 2.0; if (P.deltaviewheight <= 0.0) { P.deltaviewheight = 1.0 / 65536.0; } }
    if (P.deltaviewheight != 0.0) { P.deltaviewheight += 0.25; }
  }
  P.viewz = min(m.z + P.viewheight + b, m.ceilingz - 4.0);
}

fn playerInSpecialSector() {
  let sec = O[0].sector;
  if (O[0].z != S[sec].floorh) { return; }
  let sp = S[sec].special;
  let tick = (P.leveltime & 31u) == 0u;
  var dmg = 0;
  switch (sp) {
    case 5: { if (P.powers[3] == 0 && tick) { dmg = 10; } }
    case 7: { if (P.powers[3] == 0 && tick) { dmg = 5; } }
    case 16, 4: { if ((P.powers[3] == 0 || P_Random() < 5) && tick) { dmg = 20; } }
    case 9: { P.secretcount += 1; S[sec].special = 0; }
    case 11: {
      if (tick) { dmg = 20; }
      if (P.health <= 10) { P.exit = 1u; }
    }
    default: {}
  }
  if (dmg > 0) { damageMobj(0u, -1, -1, dmg); }
}

fn playerThink() {
  let first = P.lastframe != U.frame;
  P.lastframe = U.frame;
  let onground = O[0].z <= O[0].floorz;
  P.onground = select(0u, 1u, onground);
  // a state the player's mobj was asked for: only the pain sound matters in first person
  if (O[0].req != NOREQ) {
    if (O[0].req == u32(info(MT_PLAYER, MI_PAINSTATE)) && P.dead == 0u) { mobjSound(0u, SFX_plpain); }
    O[0].req = NOREQ;
  }
  // the chainsaw's lunge: after a hit, P_PlayerThink replaces the command with a full-speed step forward
  var fwd = U.forward; var side = U.side; var turn = U.turn + select(0.0, U.mouseturn, first);
  if ((O[0].flags & MF_JUSTATTACKED) != 0u) {
    fwd = 100.0; side = 0.0; turn = 0.0;
    O[0].flags &= ~MF_JUSTATTACKED;
  }
  P.cmdmove = select(0u, 1u, fwd != 0.0 || side != 0.0);
  let wasDead = P.dead != 0u;
  if (wasDead) {
    // fall to the floor, face the killer, wait for use to restart
    if (P.viewheight > 6.0) { P.viewheight -= 1.0; }
    P.deltaviewheight = 0.0;
    calcHeight(onground);
    if (P.attacker > 0 && O[P.attacker].inuse != 0u) {
      let want = pointToAngle(ipos(0u), ipos(u32(P.attacker)));
      let d = want - O[0].angle;
      if (d < ANG5 || d > 0u - ANG5) { O[0].angle = want; } else if (d < ANG180) { O[0].angle += ANG5; } else { O[0].angle -= ANG5; }
    }
    // once on the floor, a fresh press of use or fire restarts the level (P_DeathThink takes use only)
    let b = U.buttons & 3u;
    if (b != 0u && P.usedown == 0u && P.viewheight <= 6.0) { P.exit = 3u; }
    P.usedown = select(0u, 1u, b != 0u);
  } else {
    if (O[0].reactiontime > 0) {
      O[0].reactiontime -= 1;
    } else {
      // angleturn << 16: the turn in 1/65536ths of a circle
      O[0].angle += u32(i32(round(turn / TAU * 65536.0))) << 16u;
      if (first && turn != 0.0) { P.pva += U.mouseturn; } // not during the lunge, which drops the turn
      // P_Thrust through DOOM's finesine table: 8192 steps
      let fa = O[0].angle >> 19u;
      if (onground) {
        // P_Thrust: FixedMul(move * 2048, finecosine) is (move * finecosine) >> 5, floored
        if (fwd != 0.0) { let fm = i32(fwd); O[0].momx += f32((fm * fineCosFx(fa)) >> 5u) / 65536.0; O[0].momy += f32((fm * fineSinFx(fa)) >> 5u) / 65536.0; }
        if (side != 0.0) { let sm = i32(side); let fs = (fa + 6144u) & 8191u; O[0].momx += f32((sm * fineCosFx(fs)) >> 5u) / 65536.0; O[0].momy += f32((sm * fineSinFx(fs)) >> 5u) / 65536.0; }
      }
    }
    // P_PlayerThink: the view height follows the thrust, before the thinkers move the player
    calcHeight(onground);
    if (O[0].sector < NUMSECTORS && S[O[0].sector].special != 0) { playerInSpecialSector(); }
    if ((U.buttons & 2u) != 0u) {
      if (P.usedown == 0u) { useLines(); P.usedown = 1u; }
    } else { P.usedown = 0u; }
    if (U.weapon != 0u && U.weapon <= 9u) {
      var w = i32(U.weapon) - 1;
      // 1 toggles fist and chainsaw, 3 toggles the shotguns
      if (w == 0 && (P.weapons & 128u) != 0u && !(P.readyweapon == 7 && P.powers[1] != 0)) { w = 7; }
      if (w == 2 && COMMERCIAL && (P.weapons & 256u) != 0u && P.readyweapon != 8) { w = 8; }
      if ((P.weapons & (1u << u32(w))) != 0u && w != P.readyweapon) { P.pendingweapon = w; }
    }
  }
  // dead or alive, one call site (the shader compiler inlines every call); a dead player stops here
  runPsprites();
  if (wasDead) { return; }
  for (var i = 0; i < 6; i++) {
    if (P.powers[i] > 0 && i != 1 && i != 4) {
      P.powers[i] -= 1;
      if (i == 2 && P.powers[i] == 0) { O[0].flags &= ~MF_SHADOW; }
    }
  }
  if (P.powers[1] > 0) { P.powers[1] += 1; }
  if (P.damagecount > 0) { P.damagecount -= 1; }
  if (P.bonuscount > 0) { P.bonuscount -= 1; }
}

@compute @workgroup_size(1)
fn ticPlayer() {
  if (P.exit != 0u) { return; }
  playerThink();
  if ((P.cheats & 1u) != 0u) { O[0].flags |= MF_NOCLIP; } else { O[0].flags &= ~MF_NOCLIP; }
}
// Start of a tic: remember where everything was, so frames between tics can blend.
@compute @workgroup_size(64)
fn ticSave(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (P.exit != 0u) { return; }
  if (i == 0u) { P.pvx = P.viewx; P.pvy = P.viewy; P.pvz = P.viewz; P.pva = P.viewangle; }
  if (i < MAXMOBJS) { O[i].px = fxf(O[i].x); O[i].py = fxf(O[i].y); O[i].pz = O[i].z; }
  if (i < NUMSECTORS) { S[i].pf = S[i].floorh; S[i].pc = S[i].ceilh; }
}

// Each frame: the view between the last two tics, plus turning not yet given to a tic.
@compute @workgroup_size(1)
fn viewSetup() {
  let f = U.frac;
  P.rx = mix(P.pvx, P.viewx, f); P.ry = mix(P.pvy, P.viewy, f); P.rz = mix(P.pvz, P.viewz, f);
  P.ra = P.pva + wrapPi(P.viewangle - P.pva) * f + U.lookturn;
}

@compute @workgroup_size(1)
// DOOM's thinker list in its order: the map's things as P_LoadThings spawned them (the player's
// movement among them), then the light thinkers P_SpawnSpecials made, then everything spawned since.
fn ticMobjs() {
  if (P.exit != 0u) { return; }
  // the bound is read each pass: a thing spawned this tic was appended to DOOM's list and thinks this tic too
  // the player gets a pass of its own at its place, so that mobjThink has one call site
  var playerDue = true;
  for (var i = 1u; i < max(mobjEnd(), P.initmobjs + 1u);) {
    var mi = 0u; var isPlayer = false;
    if (i == P.playerslot && playerDue) { playerDue = false; isPlayer = true; }
    else {
      if (i == P.initmobjs) { for (var s = 0u; s < NUMSECTORS; s++) { lightThink(s); } }
      mi = i;
      i += 1u;
      if (O[mi].inuse == 0u) { continue; }
    }
    mobjThink(mi, isPlayer);
  }
}

@compute @workgroup_size(1)
fn ticActivate() {
  let n = min(P.nact, 32u);
  P.nact = 0u;
  if (P.exit != 0u) { return; }
  for (var k = 0u; k < n; k++) {
    let a = P.act[k];
    let l = a & 0xffffu; let side = (a >> 16u) & 1u; let kind = (a >> 17u) & 3u; let mi = a >> 19u;
    if (l >= NUMLINES || lineSpecial(l) == 0u) { continue; }
    if (kind == 0u) { crossSpecialLine(l, side, mi); }
    else if (kind == 1u) { _ = useSpecialLine(l, side, mi); }
    else { shootSpecialLine(l, mi); }
  }
}


// ---- the status bar face (ST_updateFaceWidget)
fn painOffset() -> i32 { return 8 * (((100 - clamp(P.health, 0, 100)) * 5) / 101); }
fn updateFace() {
  // ST_Ticker draws st_randomnumber from M_Random every tic; the game's P_Random is left alone
  P.mrng = (P.mrng + 1u) & 255u;
  let strnd = i32(G[G_RNDTABLE + P.mrng]);
  var pri = P.facepri;
  if (pri < 10 && P.health <= 0) { pri = 9; P.face = 41; P.facecount = 1; }
  if (pri < 9 && P.bonuscount > 0 && P.weapons != P.oldweapons) {
    pri = 8; P.face = painOffset() + 6; P.facecount = 70;
  }
  P.oldweapons = P.weapons;
  if (pri < 8 && P.damagecount > 0 && P.attacker > 0 && O[P.attacker].inuse != 0u) {
    pri = 7;
    if (P.oldhealth - P.health > 20) { P.face = painOffset() + 5; }
    else {
      let d = wrapPi(angleTo(mpos(0u), mpos(u32(P.attacker))) - bamToRad(O[0].angle));
      if (abs(d) < PI / 4.0) { P.face = painOffset() + 7; }
      else if (d > 0.0) { P.face = painOffset() + 4; }
      else { P.face = painOffset() + 3; }
    }
    P.facecount = 35;
  }
  if (pri < 7 && P.damagecount > 0) {
    pri = 6;
    P.face = painOffset() + select(7, 5, P.oldhealth - P.health > 20);
    P.facecount = 35;
  }
  if (pri < 6) {
    if (P.attackdown != 0u) {
      if (P.lastattackdown == -1) { P.lastattackdown = 70; }
      else {
        P.lastattackdown -= 1;
        if (P.lastattackdown <= 0) { pri = 5; P.face = painOffset() + 7; P.facecount = 1; P.lastattackdown = 1; }
      }
    } else { P.lastattackdown = -1; }
  }
  if (pri < 5 && P.powers[0] > 0) { pri = 4; P.face = 40; P.facecount = 1; }
  if (P.facecount <= 0) { P.face = painOffset() + strnd % 3; P.facecount = 17; pri = 0; }
  P.facecount -= 1;
  P.facepri = pri;
  P.oldhealth = P.health;
}

// =====================================================================
// AUTOMAP: clear the view, then one thread per line (and a few for the arrow)
// =====================================================================

fn amPlot(x: i32, y: i32, c: u32) {
  if (x < 0 || y < 0 || x >= i32(U.width) || y >= i32(U.viewh)) { return; }
  FB[u32(y) * U.width + u32(x)] = c;
}
// world to screen: follows the player, north up; vertical pixels are 1.2 times taller
fn amScreen(p: vec2f) -> vec2f {
  let d = p - vec2f(P.rx, P.ry);
  return vec2f(f32(U.width) / 2.0 + d.x * U.amscale, f32(U.viewh) / 2.0 - d.y * U.amscale / 1.2);
}
fn amLine(a: vec2f, b: vec2f, c: u32) {
  let pa = amScreen(a); let pb = amScreen(b);
  let w = f32(U.width); let h = f32(U.viewh);
  if (max(pa.x, pb.x) < 0.0 || min(pa.x, pb.x) >= w || max(pa.y, pb.y) < 0.0 || min(pa.y, pb.y) >= h) { return; }
  let n = min(i32(max(abs(pb.x - pa.x), abs(pb.y - pa.y))) + 1, 4096);
  for (var i = 0; i <= n; i++) {
    let q = mix(pa, pb, f32(i) / f32(max(n, 1)));
    amPlot(i32(floor(q.x)), i32(floor(q.y)), c);
  }
}

@compute @workgroup_size(8, 8)
fn amClear(@builtin(global_invocation_id) gid: vec3u) {
  if (gid.x < U.width && gid.y < U.viewh) { FB[gid.y * U.width + gid.x] = 0u; }
}

@compute @workgroup_size(64)
fn amLines(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i < NUMLINES) {
    let flags = lineFlags(i);
    let cheating = (P.cheats & 4u) != 0u;
    if ((flags & 128u) != 0u && !cheating) { return; } // ML_DONTDRAW
    let mapped = (LS[i] & 0x80000000u) != 0u || (flags & 256u) != 0u || cheating;
    var c = 0u;
    if (mapped) {
      let bk = lineBack(i);
      if (bk < 0 || (flags & ML_TWOSIDED) == 0u) { c = 176u; }
      else if (lineSpecial(i) == 39u) { c = 184u; }
      else if ((flags & ML_SECRET) != 0u) { c = 176u; }
      else if (S[bk].floorh != S[lineFront(i)].floorh) { c = 64u; }
      else if (S[bk].ceilh != S[lineFront(i)].ceilh) { c = 231u; }
    } else if (P.powers[4] != 0) { c = 99u; }
    if (c != 0u) { amLine(lineA(i), lineB(i), c); }
    return;
  }
  // the player's arrow, DOOM's player_arrow drawn at twice size so it reads on a phone
  let k = i - NUMLINES;
  if (k >= 7u) { return; }
  let R = 2.0 * 8.0 * 16.0 / 7.0;
  var a = array<vec4f, 7>(
    vec4f(-R + R / 8.0, 0.0, R, 0.0), vec4f(R, 0.0, R - R / 2.0, R / 4.0), vec4f(R, 0.0, R - R / 2.0, -R / 4.0),
    vec4f(-R + R / 8.0, 0.0, -R - R / 8.0, R / 4.0), vec4f(-R + R / 8.0, 0.0, -R - R / 8.0, -R / 4.0),
    vec4f(-R + 3.0 * R / 8.0, 0.0, -R + R / 8.0, R / 4.0), vec4f(-R + 3.0 * R / 8.0, 0.0, -R + R / 8.0, -R / 4.0));
  let seg = a[k];
  let c = cos(P.ra); let s = sin(P.ra);
  let rot = mat2x2f(c, s, -s, c);
  let o = vec2f(P.rx, P.ry);
  amLine(o + rot * seg.xy, o + rot * seg.zw, 209u);
}

@compute @workgroup_size(1)
fn ticWorld() {
  if (P.exit != 0u) { return; }
  for (var s = 0u; s < NUMSECTORS; s++) {
    // the plane moves first, then the thinker reads the result, as each T_ thinker does around its call
    let plan = moverPlan(s);
    var res = 0;
    if (plan.moves) { res = movePlane(s, S[s].mspeed, plan.dest, plan.crush, plan.ceiling, plan.dir); }
    switch (S[s].mtype) {
      case 1u: { doorThink(s, res); }
      case 2u: { floorThink(s, res); }
      case 3u: { platThink(s, res); }
      case 4u: { ceilingThink(s, res); }
      default: {}
    }
  }
  for (var k = 0u; k < 16u; k++) {
    if (P.buttons[k].w > 0) {
      P.buttons[k].w -= 1;
      if (P.buttons[k].w == 0) {
        setSideTex(u32(P.buttons[k].x), u32(P.buttons[k].y), u32(P.buttons[k].z));
        startSound(SFX_swtchn, P.viewx, P.viewy);
      }
    }
  }
  if (P.messagetics > 0) { P.messagetics -= 1; }
  updateFace();
  var pal = 0u;
  if (P.damagecount > 0) { pal = min(u32((P.damagecount + 7) >> 3u), 7u) + 1u; }
  else if (P.bonuscount > 0) { pal = min(u32((P.bonuscount + 7) >> 3u), 3u) + 9u; }
  else if (P.powers[3] > 4 * 32 || (P.powers[3] & 8) != 0) { pal = 13u; }
  P.palette = pal;
  P.fixedcolormap = -1;
  if (P.powers[0] > 4 * 32 || (P.powers[0] & 8) != 0) { P.fixedcolormap = 32; }
  else if (P.powers[5] > 4 * 32 || (P.powers[5] & 8) != 0) { P.fixedcolormap = 1; }
  P.viewx = fxf(O[0].x); P.viewy = fxf(O[0].y); P.viewangle = bamToRad(O[0].angle);
  P.leveltime += 1u;
}
`);
}

// Every for-loop with a constant bound (a level's sector or line count, a literal, an ALLCAPS const)
// gets a bound the compiler cannot know: U.zero is 0 at run time, but the compiler can't see that.
// With constant bounds, D3D12's and Adreno's compilers unroll these loops and copy their inlined
// bodies once per iteration: on an RTX 50-series, ticMobjs took 271-359 s to compile; with this, 48 s.
function opaqueLoops(code) {
  return code.replace(/(for \(var \w+ = [^;]+; \w+ <=? )([^;]+);/g, (m, head, bound) =>
    /^[\s(]*(NUM\w+|\d+u?|[A-Z][A-Z0-9_]+)([\s)+\-*/]*(NUM\w+|\d+u?|[A-Z][A-Z0-9_]+))*[\s)]*$/.test(bound)
      ? `${head}select((${bound}), (${bound}) - 1, U.zero != 0u);` : m);
}

// Fullscreen triangle that maps palette indices through PLAYPAL.
export const PRESENT_WGSL = /* wgsl */ `
struct Info { width: u32, height: u32, palOffset: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> G: array<u32>;
@group(0) @binding(1) var<storage, read> FB: array<u32>;
@group(0) @binding(2) var<storage, read> W: array<u32>;
@group(0) @binding(3) var<uniform> I: Info;
struct VO { @builtin(position) pos: vec4f, @location(0) uv: vec2f }
@vertex fn vs(@builtin(vertex_index) i: u32) -> VO {
  let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));
  var o: VO;
  o.pos = vec4f(p * 2.0 - 1.0, 0.0, 1.0);
  o.uv = vec2f(p.x, 1.0 - p.y);
  return o;
}
@fragment fn fs(v: VO) -> @location(0) vec4f {
  let x = min(u32(v.uv.x * f32(I.width)), I.width - 1u);
  let y = min(u32(v.uv.y * f32(I.height)), I.height - 1u);
  let c = FB[y * I.width + x] & 255u;
  let pal = W[11];
  let rgb = G[I.palOffset + pal * 256u + c];
  return vec4f(f32(rgb & 255u), f32((rgb >> 8u) & 255u), f32((rgb >> 16u) & 255u), 255.0) / 255.0;
}
`;
