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

import { SPRNAMES, SFX, MT, S as ST, MF, ACTIONS } from "./info.js";
import { AC, TR, DOOR, FLOOR, PLAT, CEIL, MSG } from "./specials.js";

export const MOBJ_WORDS = 32;
export const SECTOR_WORDS = 32;
export const WORLD_WORDS = 256;
export const MAXVIS = 256;

const constBlock = (prefix, obj, type = "u32") =>
  Object.entries(obj).map(([k, v]) => `const ${prefix}${k.replace(/[^A-Za-z0-9_]/g, "_")}: ${type} = ${v}${type === "u32" ? "u" : ""};`).join("\n");

export function makeWGSL({ gfx, map, maxMobjs, width, height, viewh }) {
  const G = gfx.layout, M = map.layout, c = map.counts;
  const spr = Object.fromEntries(SPRNAMES.map((n, i) => [n, i]));
  const sfx = Object.fromEntries(SFX.map((n, i) => [n, i]));
  const hud = (n) => gfx.hudIndex.get(n) ?? 0xffff;
  const hudArr = (names) => `array<u32, ${names.length}>(${names.map((n) => hud(n) + "u").join(", ")})`;
  const msgId = (m) => MSG[m] ?? 0;
  return /* wgsl */ `
// ---- layout
const G_PAL = ${G.PAL}u; const G_CMAP = ${G.CMAP}u; const G_TEXDIR = ${G.TEXDIR}u; const G_FLATDIR = ${G.FLATDIR}u;
const G_SPRDIR = ${G.SPRDIR}u; const G_HUDDIR = ${G.HUDDIR}u; const G_SPRFRAMES = ${G.SPRFRAMES}u; const G_FRAMEROT = ${G.FRAMEROT}u;
const G_STATES = ${G.STATES}u; const G_MOBJINFO = ${G.MOBJINFO}u; const G_TEXELS = ${G.TEXELS}u; const G_LSPEC = ${G.LSPEC}u;
const G_ANIMTEX = ${G.ANIMTEX}u; const G_ANIMFLAT = ${G.ANIMFLAT}u; const G_SWITCH = ${G.SWITCH}u;
const G_MSGDIR = ${G.MSGDIR}u; const G_MSGCHARS = ${G.MSGCHARS}u;
const M_VERT = ${M.VERT}u; const M_LINE = ${M.LINE}u; const M_SIDE = ${M.SIDE}u; const M_SEG = ${M.SEG}u; const M_SSEC = ${M.SSEC}u;
const M_NODE = ${M.NODE}u; const M_BMCELL = ${M.BMCELL}u; const M_BMLIST = ${M.BMLIST}u; const M_SECLINE = ${M.SECLINE}u; const M_SECLIST = ${M.SECLIST}u;
const NUMLINES = ${c.lines}u; const NUMSIDES = ${c.sides}u; const NUMSECTORS = ${c.sectors}u; const NUMNODES = ${c.nodes}u;
const BM_X = ${map.bmap.x}.0; const BM_Y = ${map.bmap.y}.0; const BM_W = ${map.bmap.w}; const BM_H = ${map.bmap.h};
const MAXMOBJS = ${maxMobjs}u; const MAXVIS = ${MAXVIS}u;
const SKYFLAT = ${gfx.skyFlat}u; const SKYTEX = ${gfx.texIndex.get("SKY1") ?? 0}u;
const NOTEX = 0xffffu;
const WIDTH = ${width}u; const HEIGHT = ${height}u; const VIEWH = ${viewh}u;
const FB_DEPTH = ${width * height}u; const FB_VIS = ${2 * width * height}u;
const PI = 3.14159265358979;
const TAU = 6.28318530717959;

${constBlock("SPR_", spr)}
${constBlock("SFX_", sfx)}
${constBlock("MT_", MT)}
${constBlock("MF_", MF)}
const S_NULL = 0u;
const S_PLAY = ${ST.PLAY}u; const S_TFOG = ${ST.TFOG}u;
${constBlock("AC_", AC)}
${constBlock("TR_", TR)}
${constBlock("DOOR_", DOOR, "i32")}
${constBlock("FLOOR_", FLOOR, "i32")}
${constBlock("PLAT_", PLAT, "i32")}
${constBlock("CEIL_", CEIL, "i32")}

const ML_BLOCKING = 1u; const ML_BLOCKMONSTERS = 2u; const ML_TWOSIDED = 4u; const ML_DONTPEGTOP = 8u; const ML_DONTPEGBOTTOM = 16u; const ML_SECRET = 32u;

const VIEWHEIGHT = 41.0; const MAXMOVE = 30.0; const STOPSPEED = 0.0625; const FRICTION = 0.90625; const GRAVITY = 1.0;
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
  pad0: u32, pad1: u32, pad2: u32, pad3: u32,
}
struct Mobj {
  x: f32, y: f32, z: f32, angle: f32,
  momx: f32, momy: f32, momz: f32, floorz: f32,
  ceilingz: f32, radius: f32, height: f32, mtype: u32,
  state: u32, tics: i32, flags: u32, health: i32,
  sector: u32, targ: i32, tracer: i32, movedir: i32,
  movecount: i32, reactiontime: i32, threshold: i32, lastlook: i32,
  inuse: u32, dropoffz: f32, pad0: u32, pad1: u32,
  pad2: u32, pad3: u32, pad4: u32, pad5: u32,
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
  fixedcolormap: i32, skill: i32, nact: u32, act: array<u32, 9>,
  snd: array<vec4<f32>, 32>,
  buttons: array<vec4<i32>, 16>,
}
struct Frame {
  width: u32, height: u32, viewh: u32, frame: u32,
  centerx: f32, centery: f32, proj: f32, pad0: u32,
  forward: f32, side: f32, turn: f32, mouseturn: f32,
  buttons: u32, weapon: u32, run: u32, pad1: u32,
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
fn lineSpecial(l: u32) -> u32 { return LS[l]; }

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

fn pointInSubsector(p: vec2f) -> u32 {
  if (NUMNODES == 0u) { return 0u; }
  var n = max(NUMNODES, 1u) - 1u;
  for (var guard = 0; guard < 256; guard++) {
    if ((n & 0x8000u) != 0u) { return n & 0x7fffu; }
    let o = M_NODE + 14u * n;
    let side = select(0u, 1u, (p.y - mf(o + 1u)) * mf(o + 2u) >= mf(o + 3u) * (p.x - mf(o)));
    n = M[o + 12u + side];
  }
  return 0u;
}
fn sectorAt(p: vec2f) -> u32 { return M[M_SSEC + 4u * pointInSubsector(p) + 2u]; }

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
  let i = u32(y) * WIDTH + x;
  FB[i] = c;
  FB[FB_DEPTH + i] = bitcast<u32>(depth);
}
fn pixelDepth(x: u32, y: i32) -> f32 { return bitcast<f32>(FB[FB_DEPTH + u32(y) * WIDTH + x]); }

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
      let v = 100.0 + (f32(y) + 0.5 - U.centery) * 320.0 / f32(WIDTH);
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
  if (x >= WIDTH) { return; }
  let VH = i32(VIEWH);
  let p = vec2f(P.viewx, P.viewy);
  let vz = P.viewz;
  let ang = P.viewangle;
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
      let lflags = lineFlags(line);
      let fsec = sideSector(sdef);
      let F = S[fsec];
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
        if (fsky && S[bsec].ceilpic == SKYFLAT) { fceil = S[bsec].ceilh; }
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
      let B = S[bsec];
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
    let o = FB_VIS + 8u * i;
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
          FB[u32(y) * WIDTH + x] = cmap(6u, FB[u32(yy) * WIDTH + x]);
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
  let m = O[i];
  if (m.inuse == 0u) { return; }
  let st = G_STATES + 8u * m.state;
  let sprite = G[st]; let frame = G[st + 1u];
  let p = vec2f(P.viewx, P.viewy);
  let fw = vec2f(cos(P.viewangle), sin(P.viewangle));
  let rt = vec2f(sin(P.viewangle), -cos(P.viewangle));
  let rel = vec2f(m.x, m.y) - p;
  let tz = dot(rel, fw);
  if (tz < 4.0) { return; }
  let tx = dot(rel, rt);
  if (abs(tx) > tz * 4.0 + 64.0) { return; }
  let fr = frame & 0x7fffu;
  let sf = G_SPRFRAMES + 2u * sprite;
  if (fr >= G[sf + 1u]) { return; }
  let a = atan2(rel.y, rel.x);
  let rot = u32(floor(fract1((a - m.angle) / TAU + 9.0 / 16.0) * 8.0)) & 7u;
  let w = G[G_FRAMEROT + (G[sf] + fr) * 8u + rot];
  if (w == 0xffffffffu) { return; }
  let lump = w & 0x7fffu; let flip = (w >> 15u) & 1u;
  let sd = G_SPRDIR + 6u * lump;
  let sw = f32(G[sd]); let left = f32(gi(sd + 2u)); let top = f32(gi(sd + 3u));
  let scale = U.proj / tz;
  let x1 = U.centerx + (tx - left) * scale;
  let x2 = x1 + sw * scale;
  let xs = max(0, rowOf(x1)); let xe = min(i32(WIDTH) - 1, rowOf(x2) - 1);
  if (xs > xe) { return; }
  var level = 0u;
  if ((frame & 0x8000u) == 0u) { level = wallLevel((S[m.sector].light >> 4u) + P.extralight, tz); }
  else if (P.fixedcolormap > 0) { level = u32(P.fixedcolormap); }
  let slot = atomicAdd(&P.viscount, 1u);
  if (slot >= MAXVIS) { return; }
  let o = FB_VIS + 8u * slot;
  FB[o] = bitcast<u32>(x1); FB[o + 1u] = bitcast<u32>(scale); FB[o + 2u] = bitcast<u32>(m.z + top - P.viewz);
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
const HUD_FACE = ${hud("STFST01")}u; const HUD_FACEDEAD = ${hud("STFDEAD0")}u;
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
  if (x >= WIDTH || y >= HEIGHT) { return; }
  let vx = (f32(x) + 0.5) * 320.0 / f32(WIDTH);
  let vy = (f32(y) + 0.5) * 200.0 / f32(HEIGHT);
  if (y >= VIEWH) {
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
    if (o == 0u) { o = hudPatch(select(HUD_FACE, HUD_FACEDEAD, P.health <= 0), 143.0, 168.0, vx, vy); }
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
    FB[y * WIDTH + x] = t & 255u;
    return;
  }
  // message line at the top of the view
  if (P.messagetics > 0 && P.message > 0 && vy < 9.0) {
    let md = G_MSGDIR + 2u * u32(P.message);
    let start = G[md]; let len = G[md + 1u];
    var cx = 0.0;
    for (var i = 0u; i < len; i++) {
      let ch = G[G_MSGCHARS + start + i];
      if (ch == 32u || ch < 33u || ch > 95u) { cx += 4.0; continue; }
      let idx = HUD_FONT[ch - 33u];
      if (idx == 0xffffu) { cx += 4.0; continue; }
      let t = hudPatch(idx, cx, 1.0, vx, vy);
      if (t != 0u) { FB[y * WIDTH + x] = t & 255u; return; }
      cx += hudWidth(idx);
      if (cx > vx) { break; }
    }
  }
}

// =====================================================================
// TIC: one thread runs a whole game tic
// =====================================================================

fn P_Random() -> i32 {
  var s = P.rng;
  s ^= s << 13u; s ^= s >> 17u; s ^= s << 5u;
  P.rng = s;
  return i32((s >> 8u) & 255u);
}
fn startSound(sfx: u32, x: f32, y: f32) {
  let i = P.sndcount % 32u;
  P.snd[i] = vec4f(f32(sfx), x, y, 0.0);
  P.sndcount += 1u;
}
fn mobjSound(mi: u32, sfx: u32) { startSound(sfx, O[mi].x, O[mi].y); }
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
fn pointOnLineSide(p: vec2f, l: u32) -> u32 {
  let a = lineA(l); let dl = lineB(l) - a;
  if (dl.x == 0.0) { if (p.x <= a.x) { return select(0u, 1u, dl.y > 0.0); } return select(0u, 1u, dl.y < 0.0); }
  if (dl.y == 0.0) { if (p.y <= a.y) { return select(0u, 1u, dl.x < 0.0); } return select(0u, 1u, dl.x > 0.0); }
  let left = dl.y * (p.x - a.x); let right = (p.y - a.y) * dl.x;
  return select(1u, 0u, right < left);
}
// -1 if the box crosses the line, else the side
fn boxOnLineSide(lo: vec2f, hi: vec2f, l: u32) -> i32 {
  let s0 = pointOnLineSide(vec2f(lo.x, lo.y), l);
  let s1 = pointOnLineSide(vec2f(hi.x, lo.y), l);
  let s2 = pointOnLineSide(vec2f(lo.x, hi.y), l);
  let s3 = pointOnLineSide(vec2f(hi.x, hi.y), l);
  if (s0 == s1 && s1 == s2 && s2 == s3) { return i32(s0); }
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
var<private> crossq: array<vec2u, 16>;

fn checkPosition(mi: u32, pos: vec2f) -> bool {
  let me = O[mi];
  let r = me.radius;
  let lo = pos - vec2f(r, r); let hi = pos + vec2f(r, r);
  let sec = sectorAt(pos);
  tmfloorz = S[sec].floorh; tmdropoffz = tmfloorz; tmceilingz = S[sec].ceilh;
  tmblockline = -1; tmceilline = -1; tmfloorline = -1;
  numspechit = 0u;
  if ((me.flags & MF_NOCLIP) != 0u) { return true; }
  // things
  for (var j = 0u; j < MAXMOBJS; j++) {
    if (j == mi) { continue; }
    let th = O[j];
    if (th.inuse == 0u || (th.flags & (MF_SOLID | MF_SPECIAL | MF_SHOOTABLE)) == 0u) { continue; }
    let bd = th.radius + r;
    if (abs(th.x - pos.x) >= bd || abs(th.y - pos.y) >= bd) { continue; }
    if ((th.flags & MF_SPECIAL) != 0u) {
      if ((me.flags & MF_PICKUP) != 0u) { touchSpecialThing(j, mi); }
      if ((th.flags & MF_SOLID) == 0u) { continue; }
    }
    if ((th.flags & MF_SOLID) != 0u) { return false; }
  }
  // lines via the blockmap
  let x0 = max(i32(floor((lo.x - BM_X) / 128.0)), 0); let x1 = min(i32(floor((hi.x - BM_X) / 128.0)), BM_W - 1);
  let y0 = max(i32(floor((lo.y - BM_Y) / 128.0)), 0); let y1 = min(i32(floor((hi.y - BM_Y) / 128.0)), BM_H - 1);
  for (var by = y0; by <= y1; by++) {
    for (var bx = x0; bx <= x1; bx++) {
      let cell = M_BMCELL + 2u * u32(by * BM_W + bx);
      let start = M[cell]; let n = M[cell + 1u];
      for (var k = 0u; k < n; k++) {
        let l = M[M_BMLIST + start + k];
        let a = lineA(l); let b = lineB(l);
        if (hi.x <= min(a.x, b.x) || lo.x >= max(a.x, b.x) || hi.y <= min(a.y, b.y) || lo.y >= max(a.y, b.y)) { continue; }
        if (boxOnLineSide(lo, hi, l) != -1) { continue; }
        let back = lineBack(l);
        if (back < 0 || (lineFlags(l) & ML_TWOSIDED) == 0u) { tmblockline = i32(l); return false; }
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

fn tryMove(mi: u32, pos: vec2f) -> bool {
  if (!checkPosition(mi, pos)) { return false; }
  let me = O[mi];
  if ((me.flags & MF_NOCLIP) == 0u) {
    if (tmceilingz - tmfloorz < me.height) { tmblockline = tmceilline; return false; }
    if ((me.flags & MF_TELEPORT) == 0u && tmceilingz - me.z < me.height) { tmblockline = tmceilline; return false; }
    if ((me.flags & MF_TELEPORT) == 0u && tmfloorz - me.z > 24.0) { tmblockline = tmfloorline; return false; }
    if ((me.flags & (MF_DROPOFF | MF_FLOAT)) == 0u && tmfloorz - tmdropoffz > 24.0) { tmblockline = tmfloorline; return false; }
  }
  let old = vec2f(me.x, me.y);
  O[mi].floorz = tmfloorz; O[mi].ceilingz = tmceilingz; O[mi].dropoffz = tmdropoffz;
  O[mi].x = pos.x; O[mi].y = pos.y;
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
  if (P.nact < 9u) { P.act[P.nact] = l | (side << 16u) | (kind << 17u) | (mi << 19u); P.nact += 1u; }
}
fn processCrossings(mi: u32) {
  let n = numcross; numcross = 0u;
  for (var k = 0u; k < n; k++) { queueActivation(crossq[k].x, crossq[k].y, 0u, mi); }
}

// Slide along the wall that blocked us, then fall back to DOOM's stairstep.
fn slideMove(mi: u32) {
  let me = O[mi];
  let mom = vec2f(me.momx, me.momy);
  if (tmblockline >= 0) {
    let l = u32(tmblockline);
    let dl = normalize(lineB(l) - lineA(l));
    let along = dl * dot(mom, dl);
    if (tryMove(mi, vec2f(me.x, me.y) + along)) { O[mi].momx = along.x; O[mi].momy = along.y; return; }
  }
  if (tryMove(mi, vec2f(me.x, me.y + mom.y))) { O[mi].momx = 0.0; return; }
  if (tryMove(mi, vec2f(me.x + mom.x, me.y))) { O[mi].momy = 0.0; return; }
  O[mi].momx = 0.0; O[mi].momy = 0.0;
}

fn xyMovement(mi: u32, isPlayer: bool, hasCmd: bool) {
  var mom = vec2f(O[mi].momx, O[mi].momy);
  if (mom.x == 0.0 && mom.y == 0.0) { return; }
  mom = clamp(mom, vec2f(-MAXMOVE), vec2f(MAXMOVE));
  O[mi].momx = mom.x; O[mi].momy = mom.y;
  var mv = mom;
  for (var guard = 0; guard < 8; guard++) {
    var ptry: vec2f;
    if (abs(mv.x) > MAXMOVE / 2.0 || abs(mv.y) > MAXMOVE / 2.0) {
      ptry = vec2f(O[mi].x, O[mi].y) + mv * 0.5; mv *= 0.5;
    } else {
      ptry = vec2f(O[mi].x, O[mi].y) + mv; mv = vec2f(0.0);
    }
    if (!tryMove(mi, ptry)) {
      if (isPlayer) { slideMove(mi); } else { O[mi].momx = 0.0; O[mi].momy = 0.0; }
      break;
    }
    if (mv.x == 0.0 && mv.y == 0.0) { break; }
  }
  if ((O[mi].flags & (MF_MISSILE | MF_SKULLFLY)) != 0u) { return; }
  if (O[mi].z > O[mi].floorz) { return; }
  let m2 = vec2f(O[mi].momx, O[mi].momy);
  if (abs(m2.x) < STOPSPEED && abs(m2.y) < STOPSPEED && (!isPlayer || !hasCmd)) {
    O[mi].momx = 0.0; O[mi].momy = 0.0;
  } else {
    O[mi].momx = m2.x * FRICTION; O[mi].momy = m2.y * FRICTION;
  }
}

fn zMovement(mi: u32, isPlayer: bool) {
  if (isPlayer && O[mi].z < O[mi].floorz) {
    P.viewheight -= O[mi].floorz - O[mi].z;
    P.deltaviewheight = (VIEWHEIGHT - P.viewheight) / 8.0;
  }
  O[mi].z += O[mi].momz;
  if (O[mi].z <= O[mi].floorz) {
    if (O[mi].momz < 0.0) {
      if (isPlayer && O[mi].momz < -GRAVITY * 8.0) {
        P.deltaviewheight = O[mi].momz / 8.0;
        mobjSound(mi, SFX_oof);
      }
      O[mi].momz = 0.0;
    }
    O[mi].z = O[mi].floorz;
  } else if ((O[mi].flags & MF_NOGRAVITY) == 0u) {
    if (O[mi].momz == 0.0) { O[mi].momz = -GRAVITY * 2.0; } else { O[mi].momz -= GRAVITY; }
  }
  if (O[mi].z + O[mi].height > O[mi].ceilingz) {
    if (O[mi].momz > 0.0) { O[mi].momz = 0.0; }
    O[mi].z = O[mi].ceilingz - O[mi].height;
  }
}

// ---- things fitting after a sector moved (P_ChangeSector)
fn touchesSector(mi: u32, sec: u32) -> bool {
  let m = O[mi];
  if (m.sector == sec) { return true; }
  let lo = vec2f(m.x - m.radius, m.y - m.radius); let hi = vec2f(m.x + m.radius, m.y + m.radius);
  let sl = M_SECLINE + 2u * sec;
  for (var i = 0u; i < M[sl + 1u]; i++) {
    let l = M[M_SECLIST + M[sl] + i];
    let a = lineA(l); let b = lineB(l);
    if (hi.x <= min(a.x, b.x) || lo.x >= max(a.x, b.x) || hi.y <= min(a.y, b.y) || lo.y >= max(a.y, b.y)) { continue; }
    if (boxOnLineSide(lo, hi, l) == -1) { return true; }
  }
  return false;
}
fn changeSector(sec: u32, crush: bool) -> bool {
  var nofit = false;
  for (var j = 0u; j < MAXMOBJS; j++) {
    if (O[j].inuse == 0u || (O[j].flags & MF_NOBLOCKMAP) != 0u) { continue; }
    if (!touchesSector(j, sec)) { continue; }
    let onfloor = O[j].z <= O[j].floorz;
    // P_ThingHeightClip: new floor and ceiling from the lines the thing touches
    let pos = vec2f(O[j].x, O[j].y);
    let r = O[j].radius;
    let lo = pos - vec2f(r, r); let hi = pos + vec2f(r, r);
    let s0 = sectorAt(pos);
    var fz = S[s0].floorh; var cz = S[s0].ceilh;
    let x0 = max(i32(floor((lo.x - BM_X) / 128.0)), 0); let x1 = min(i32(floor((hi.x - BM_X) / 128.0)), BM_W - 1);
    let y0 = max(i32(floor((lo.y - BM_Y) / 128.0)), 0); let y1 = min(i32(floor((hi.y - BM_Y) / 128.0)), BM_H - 1);
    for (var by = y0; by <= y1; by++) {
      for (var bx = x0; bx <= x1; bx++) {
        let cell = M_BMCELL + 2u * u32(by * BM_W + bx);
        for (var k = 0u; k < M[cell + 1u]; k++) {
          let l = M[M_BMLIST + M[cell] + k];
          let a = lineA(l); let b = lineB(l);
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
    // doesn't fit
    if ((O[j].flags & MF_DROPPED) != 0u) { O[j].inuse = 0u; continue; }
    if ((O[j].flags & MF_SHOOTABLE) == 0u) { continue; }
    nofit = true;
    if (crush && (P.leveltime & 3u) == 0u) { damageMobj(j, 10); }
  }
  return nofit;
}

// T_MovePlane: 0 ok, 1 crushed, 2 pastdest
fn movePlane(sec: u32, speed: f32, dest: f32, crush: bool, ceiling: bool, dir: i32) -> i32 {
  if (!ceiling) {
    let last = S[sec].floorh;
    if (dir < 0) {
      if (last - speed < dest) {
        S[sec].floorh = dest;
        if (changeSector(sec, crush)) { S[sec].floorh = last; _ = changeSector(sec, crush); }
        return 2;
      }
      S[sec].floorh = last - speed;
      if (changeSector(sec, crush)) { S[sec].floorh = last; _ = changeSector(sec, crush); return 1; }
    } else {
      if (last + speed > dest) {
        S[sec].floorh = dest;
        if (changeSector(sec, crush)) { S[sec].floorh = last; _ = changeSector(sec, crush); }
        return 2;
      }
      S[sec].floorh = last + speed;
      if (changeSector(sec, crush)) {
        if (crush) { return 1; }
        S[sec].floorh = last; _ = changeSector(sec, crush); return 1;
      }
    }
    return 0;
  }
  let last = S[sec].ceilh;
  if (dir < 0) {
    if (last - speed < dest) {
      S[sec].ceilh = dest;
      if (changeSector(sec, crush)) { S[sec].ceilh = last; _ = changeSector(sec, crush); }
      return 2;
    }
    S[sec].ceilh = last - speed;
    if (changeSector(sec, crush)) {
      if (crush) { return 1; }
      S[sec].ceilh = last; _ = changeSector(sec, crush); return 1;
    }
  } else {
    if (last + speed > dest) {
      S[sec].ceilh = dest;
      if (changeSector(sec, crush)) { S[sec].ceilh = last; _ = changeSector(sec, crush); }
      return 2;
    }
    S[sec].ceilh = last + speed;
    _ = changeSector(sec, crush);
  }
  return 0;
}

// ---- movers (mtype: 1 door, 2 floor, 3 plat, 4 ceiling)
fn doorThink(sec: u32) {
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
      let res = movePlane(sec, S[sec].mspeed, S[sec].floorh, false, true, -1);
      if (res == 2) {
        if (ty == DOOR_blazeRaise || ty == DOOR_blazeClose) { S[sec].mtype = 0u; sectorSound(sec, SFX_bdcls); }
        else if (ty == DOOR_normal || ty == DOOR_close) { S[sec].mtype = 0u; }
        else if (ty == DOOR_close30ThenOpen) { S[sec].mdir = 0; S[sec].mcount = 35 * 30; }
      } else if (res == 1) {
        if (ty != DOOR_blazeClose && ty != DOOR_close) { S[sec].mdir = 1; sectorSound(sec, SFX_doropn); }
      }
    }
    case 1: {
      let res = movePlane(sec, S[sec].mspeed, S[sec].mtop, false, true, 1);
      if (res == 2) {
        if (ty == DOOR_blazeRaise || ty == DOOR_normal) { S[sec].mdir = 0; S[sec].mcount = S[sec].mwait; }
        else { S[sec].mtype = 0u; }
      }
    }
    default: {}
  }
}

fn floorThink(sec: u32) {
  let res = movePlane(sec, S[sec].mspeed, S[sec].mbottom, S[sec].mcrush != 0u, false, S[sec].mdir);
  if ((P.leveltime & 7u) == 0u) { sectorSound(sec, SFX_stnmov); }
  if (res == 2) {
    let ty = S[sec].msub;
    if (S[sec].mdir == 1 && ty == FLOOR_donutRaise) { S[sec].special = S[sec].mspecial; S[sec].floorpic = S[sec].mtex; }
    if (S[sec].mdir == -1 && ty == FLOOR_lowerAndChange) { S[sec].special = S[sec].mspecial; S[sec].floorpic = S[sec].mtex; }
    S[sec].mtype = 0u;
    sectorSound(sec, SFX_pstop);
  }
}

fn platThink(sec: u32) {
  let ty = S[sec].msub;
  switch (S[sec].mstatus) {
    case 0: { // up
      let res = movePlane(sec, S[sec].mspeed, S[sec].mtop, S[sec].mcrush != 0u, false, 1);
      if ((ty == PLAT_raiseAndChange24 || ty == PLAT_raiseAndChange32 || ty == PLAT_raiseToNearestAndChange) && (P.leveltime & 7u) == 0u) { sectorSound(sec, SFX_stnmov); }
      if (res == 1 && S[sec].mcrush == 0u) { S[sec].mcount = S[sec].mwait; S[sec].mstatus = 1; sectorSound(sec, SFX_pstart); }
      else if (res == 2) {
        S[sec].mcount = S[sec].mwait; S[sec].mstatus = 2; sectorSound(sec, SFX_pstop);
        if (ty != PLAT_perpetualRaise) { S[sec].mtype = 0u; }
      }
    }
    case 1: { // down
      let res = movePlane(sec, S[sec].mspeed, S[sec].mbottom, false, false, -1);
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

fn ceilingThink(sec: u32) {
  let ty = S[sec].msub;
  if (S[sec].mdir == 1) {
    let res = movePlane(sec, S[sec].mspeed, S[sec].mtop, false, true, 1);
    if ((P.leveltime & 7u) == 0u && ty != CEIL_silentCrushAndRaise) { sectorSound(sec, SFX_stnmov); }
    if (res == 2) {
      if (ty == CEIL_raiseToHighest) { S[sec].mtype = 0u; }
      else if (ty == CEIL_silentCrushAndRaise) { sectorSound(sec, SFX_pstop); S[sec].mdir = -1; }
      else if (ty == CEIL_fastCrushAndRaise || ty == CEIL_crushAndRaise) { S[sec].mdir = -1; }
    }
  } else if (S[sec].mdir == -1) {
    let res = movePlane(sec, S[sec].mspeed, S[sec].mbottom, S[sec].mcrush != 0u, true, -1);
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
    else { S[sec].light = S[sec].lmax; S[sec].lcount = (P_Random() & 63) + 1; }
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
fn tagged(l: u32, sec: u32) -> bool { return S[sec].tag == lineTag(l); }

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
  if (ty == DOOR_open || ty == DOOR_blazeOpen) { LS[l] = 0u; }
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
    for (var j = 0u; j < MAXMOBJS; j++) {
      if (O[j].inuse == 0u || O[j].mtype != MT_TELEPORTMAN || O[j].sector != sec) { continue; }
      let old = vec2f(O[mi].x, O[mi].y); let oldz = O[mi].z;
      O[mi].flags |= MF_TELEPORT;
      let ok = tryMove(mi, vec2f(O[j].x, O[j].y));
      O[mi].flags &= ~MF_TELEPORT;
      if (!ok) { return false; }
      O[mi].z = O[mi].floorz;
      if (mi == 0u) { P.viewz = O[mi].z + P.viewheight; }
      _ = spawnMobj(old.x, old.y, oldz, MT_TFOG);
      startSound(SFX_telept, old.x, old.y);
      let a = O[j].angle;
      _ = spawnMobj(O[j].x + 20.0 * cos(a), O[j].y + 20.0 * sin(a), O[mi].z, MT_TFOG);
      startSound(SFX_telept, O[j].x, O[j].y);
      if (mi == 0u) { O[mi].reactiontime = 18; }
      O[mi].angle = a; O[mi].momx = 0.0; O[mi].momy = 0.0; O[mi].momz = 0.0;
      return true;
    }
  }
  return false;
}

// Run the action of a special. Returns true when something happened.
fn runAction(l: u32, mi: u32, side: u32, info: u32) -> bool {
  let ac = (info >> 8u) & 0xffu;
  let arg = i32((info >> 16u) & 0xfffu);
  let key = info >> 28u;
  switch (ac) {
    case 1u: { return evDoDoor(l, arg); }
    case 2u: { return evDoFloor(l, arg); }
    case 3u: { return evDoPlat(l, arg); }
    case 4u: { return evDoCeiling(l, arg); }
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
      return evDoDoor(l, arg);
    }
    case 16u: { let a = evDoCeiling(l, CEIL_raiseToHighest); let b = evDoFloor(l, FLOOR_lowerFloorToLowest); return a || b; }
    case 17u: { return evDonut(l); }
    default: { return false; }
  }
}

fn changeSwitchTexture(l: u32, useAgain: bool) {
  if (!useAgain) { LS[l] = 0u; }
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
  let info = G[G_LSPEC + min(special, 255u)];
  let tr = info & 7u;
  if (side != 0u && special != 124u) { return false; }
  if (mi != 0u) {
    if ((lineFlags(l) & ML_SECRET) != 0u) { return false; }
    if (((info >> 4u) & 1u) == 0u) { return false; }
  }
  if (tr == TR_D) { return runAction(l, mi, side, info); }
  if (tr != TR_S) { return false; }
  let rep = ((info >> 3u) & 1u) != 0u;
  let ac = (info >> 8u) & 0xffu;
  let did = runAction(l, mi, side, info);
  if (did || ac == AC_EXIT || ac == AC_SECRETEXIT || ac == AC_LIGHT) {
    changeSwitchTexture(l, rep);
  }
  return true;
}

fn crossSpecialLine(l: u32, side: u32, mi: u32) {
  let special = lineSpecial(l);
  let info = G[G_LSPEC + min(special, 255u)];
  if ((info & 7u) != TR_W) { return; }
  let mon = (info >> 4u) & 3u;
  if (mi != 0u) {
    if ((O[mi].flags & MF_MISSILE) != 0u) { return; }
    if (mon == 0u) { return; }
  } else if (mon == 2u) { return; }
  let did = runAction(l, mi, side, info);
  let rep = ((info >> 3u) & 1u) != 0u;
  let ac = (info >> 8u) & 0xffu;
  if (!rep && (did || ac != AC_TELEPORT)) { LS[l] = 0u; }
}

fn shootSpecialLine(l: u32, mi: u32) {
  let special = lineSpecial(l);
  let info = G[G_LSPEC + min(special, 255u)];
  if ((info & 7u) != TR_G) { return; }
  if (mi != 0u && ((info >> 4u) & 1u) == 0u) { return; }
  if (runAction(l, mi, 0u, info)) { changeSwitchTexture(l, ((info >> 3u) & 1u) != 0u); }
}

// P_UseLines: walk the lines crossed by the use trace, nearest first.
fn useLines() {
  let me = O[0];
  let a = me.angle;
  let p0 = vec2f(me.x, me.y);
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
    queueActivation(l, pointOnLineSide(p0, l), 1u, 0u);
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
  O[sp].inuse = 0u;
  P.bonuscount += 6;
  mobjSound(0u, sound);
}

fn damageMobj(tgt: u32, damage0: i32) {
  if ((O[tgt].flags & MF_SHOOTABLE) == 0u || O[tgt].health <= 0) { return; }
  var damage = damage0;
  if (tgt == 0u) {
    if (P.powers[0] > 0 && damage < 1000) { return; }
    if (P.skill == 0) { damage = damage >> 1u; }
    if (P.armortype != 0) {
      var saved = select(damage / 2, damage / 3, P.armortype == 1);
      if (P.armor <= saved) { saved = P.armor; P.armortype = 0; }
      P.armor -= saved; damage -= saved;
    }
    P.health = max(P.health - damage, 0);
    P.damagecount = min(P.damagecount + damage, 100);
  }
  O[tgt].health -= damage;
  if (O[tgt].health <= 0) {
    if (tgt == 0u) { P.dead = 1u; O[0].flags &= ~MF_SOLID; mobjSound(0u, SFX_pldeth); }
    return;
  }
  if (tgt == 0u) { mobjSound(0u, SFX_plpain); }
}

fn spawnMobj(x: f32, y: f32, z: f32, ty: u32) -> i32 {
  for (var j = 1u; j < MAXMOBJS; j++) {
    if (O[j].inuse != 0u) { continue; }
    let mi = G_MOBJINFO + 24u * ty;
    var m: Mobj;
    m.x = x; m.y = y; m.z = z; m.angle = 0.0;
    m.radius = f32(gi(mi + 16u)); m.height = f32(gi(mi + 17u));
    m.mtype = ty; m.state = G[mi + 1u]; m.tics = gi(G_STATES + 8u * m.state + 2u);
    m.flags = G[mi + 21u]; m.health = gi(mi + 2u);
    m.sector = sectorAt(vec2f(x, y));
    m.floorz = S[m.sector].floorh; m.ceilingz = S[m.sector].ceilh;
    m.targ = -1; m.tracer = -1; m.movedir = 8; m.reactiontime = gi(mi + 5u);
    m.inuse = 1u;
    O[j] = m;
    return i32(j);
  }
  return -1;
}

// state machine without action functions (monsters come later)
fn setMobjState(mi: u32, st0: u32) -> bool {
  var st = st0;
  for (var guard = 0; guard < 16; guard++) {
    if (st == S_NULL) { O[mi].inuse = 0u; return false; }
    O[mi].state = st;
    O[mi].tics = gi(G_STATES + 8u * st + 2u);
    if (O[mi].tics != 0) { return true; }
    st = G[G_STATES + 8u * st + 4u];
  }
  return true;
}

fn mobjThink(mi: u32) {
  if (O[mi].momx != 0.0 || O[mi].momy != 0.0) { xyMovement(mi, false, false); processCrossings(mi); }
  if (O[mi].z != O[mi].floorz || O[mi].momz != 0.0) { zMovement(mi, false); }
  if (O[mi].inuse == 0u) { return; }
  if (O[mi].tics != -1) {
    O[mi].tics -= 1;
    if (O[mi].tics <= 0) { _ = setMobjState(mi, G[G_STATES + 8u * O[mi].state + 4u]); }
  }
}

fn calcHeight(onground: bool) {
  let m = O[0];
  var bob = (m.momx * m.momx + m.momy * m.momy) / 4.0;
  bob = min(bob, MAXBOB);
  if (!onground) {
    P.viewz = min(m.z + VIEWHEIGHT, m.ceilingz - 4.0);
    return;
  }
  let b = bob / 2.0 * sin(TAU * f32(P.leveltime % 20u) / 20.0);
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
  switch (sp) {
    case 5: { if (P.powers[3] == 0 && tick) { damageMobj(0u, 10); } }
    case 7: { if (P.powers[3] == 0 && tick) { damageMobj(0u, 5); } }
    case 16, 4: { if ((P.powers[3] == 0 || P_Random() < 5) && tick) { damageMobj(0u, 20); } }
    case 9: { P.secretcount += 1; S[sec].special = 0; }
    case 11: {
      if (tick) { damageMobj(0u, 20); }
      if (P.health <= 10) { P.exit = 1u; }
    }
    default: {}
  }
}

fn playerThink() {
  let first = P.lastframe != U.frame;
  P.lastframe = U.frame;
  let onground = O[0].z <= O[0].floorz;
  P.onground = select(0u, 1u, onground);
  if (P.dead != 0u) {
    // fall to the floor and wait for use to restart
    if (P.viewheight > 6.0) { P.viewheight -= 1.0; }
    P.deltaviewheight = 0.0;
    calcHeight(onground);
    if ((U.buttons & 2u) != 0u && P.usedown == 0u) { P.exit = 3u; }
    P.usedown = select(0u, 1u, (U.buttons & 2u) != 0u);
    return;
  }
  if (O[0].reactiontime > 0) {
    O[0].reactiontime -= 1;
  } else {
    O[0].angle = O[0].angle + U.turn + select(0.0, U.mouseturn, first);
    O[0].angle = O[0].angle - TAU * floor(O[0].angle / TAU);
    let a = O[0].angle;
    if (onground) {
      if (U.forward != 0.0) { O[0].momx += cos(a) * U.forward / 32.0; O[0].momy += sin(a) * U.forward / 32.0; }
      if (U.side != 0.0) { O[0].momx += sin(a) * U.side / 32.0; O[0].momy -= cos(a) * U.side / 32.0; }
    }
  }
  if (O[0].sector < NUMSECTORS && S[O[0].sector].special != 0) { playerInSpecialSector(); }
  if ((U.buttons & 2u) != 0u) {
    if (P.usedown == 0u) { useLines(); P.usedown = 1u; }
  } else { P.usedown = 0u; }
  if (U.weapon != 0u && U.weapon <= 9u) {
    let w = i32(U.weapon) - 1;
    if ((P.weapons & (1u << u32(w))) != 0u) { P.pendingweapon = w; }
  }
  if (P.pendingweapon >= 0) { P.readyweapon = P.pendingweapon; P.pendingweapon = -1; }
  for (var i = 0; i < 6; i++) {
    if (P.powers[i] > 0 && i != 1 && i != 4) {
      P.powers[i] -= 1;
      if (i == 2 && P.powers[i] == 0) { O[0].flags &= ~MF_SHADOW; }
    }
  }
  if (P.damagecount > 0) { P.damagecount -= 1; }
  if (P.bonuscount > 0) { P.bonuscount -= 1; }
}

@compute @workgroup_size(1)
fn ticPlayer() {
  if (P.exit != 0u) { return; }
  playerThink();
  let hasCmd = U.forward != 0.0 || U.side != 0.0;
  numcross = 0u;
  if (O[0].momx != 0.0 || O[0].momy != 0.0) { xyMovement(0u, true, hasCmd); processCrossings(0u); }
  if (O[0].z != O[0].floorz || O[0].momz != 0.0) { zMovement(0u, true); }
  calcHeight(O[0].z <= O[0].floorz);
}

@compute @workgroup_size(1)
fn ticMobjs() {
  if (P.exit != 0u) { return; }
  for (var i = 1u; i < MAXMOBJS; i++) {
    if (O[i].inuse != 0u) { mobjThink(i); }
  }
}

@compute @workgroup_size(1)
fn ticActivate() {
  let n = min(P.nact, 9u);
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

@compute @workgroup_size(1)
fn ticWorld() {
  if (P.exit != 0u) { return; }
  for (var s = 0u; s < NUMSECTORS; s++) {
    switch (S[s].mtype) {
      case 1u: { doorThink(s); }
      case 2u: { floorThink(s); }
      case 3u: { platThink(s); }
      case 4u: { ceilingThink(s); }
      default: {}
    }
    lightThink(s);
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
  var pal = 0u;
  if (P.damagecount > 0) { pal = min(u32((P.damagecount + 7) >> 3u), 7u) + 1u; }
  else if (P.bonuscount > 0) { pal = min(u32((P.bonuscount + 7) >> 3u), 3u) + 9u; }
  else if (P.powers[3] > 4 * 32 || (P.powers[3] & 8) != 0) { pal = 13u; }
  P.palette = pal;
  P.fixedcolormap = -1;
  if (P.powers[0] > 4 * 32 || (P.powers[0] & 8) != 0) { P.fixedcolormap = 32; }
  else if (P.powers[5] > 4 * 32 || (P.powers[5] & 8) != 0) { P.fixedcolormap = 1; }
  P.viewx = O[0].x; P.viewy = O[0].y; P.viewangle = O[0].angle;
  P.leveltime += 1u;
}
`;
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
