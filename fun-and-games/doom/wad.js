// WAD reading and packing. Everything the GPU needs goes into two u32 arrays:
// gfx (palette, colormaps, textures, flats, sprites) once per WAD, and map
// (geometry, BSP, blockmap) once per level. Texels are u16 pairs: palette
// index | 0x100 when opaque, 0 when transparent.

import { SPRNAMES, STATES, MOBJINFO, MT, MF } from "./info.js?v=20261028033804";
import { packSpecials, MESSAGES } from "./specials.js?v=20261028033804";

const td = new TextDecoder("ascii");
const lumpName = (u8, o) => td.decode(u8.subarray(o, o + 8)).replace(/\0.*$/, "").toUpperCase();

export function readWad(buf) {
  const u8 = new Uint8Array(buf);
  const dv = new DataView(buf);
  const id = td.decode(u8.subarray(0, 4));
  if (id !== "IWAD" && id !== "PWAD") throw new Error("not a WAD file");
  const n = dv.getInt32(4, true), dir = dv.getInt32(8, true);
  const lumps = [];
  for (let i = 0; i < n; i++) {
    const o = dir + 16 * i;
    lumps.push({ name: lumpName(u8, o + 8), pos: dv.getInt32(o, true), size: dv.getInt32(o + 4, true) });
  }
  const byName = new Map();
  lumps.forEach((l, i) => byName.set(l.name, i)); // last one wins, like W_GetNumForName
  const data = (i) => u8.subarray(lumps[i].pos, lumps[i].pos + lumps[i].size);
  return {
    lumps, u8, dv,
    has: (name) => byName.has(name),
    index: (name) => byName.get(name),
    get: (name) => { const i = byName.get(name); if (i === undefined) throw new Error("missing lump " + name); return data(i); },
    data,
    between(start, end) { // lumps between markers, any of several marker spellings
      const out = []; let inside = false;
      for (let i = 0; i < lumps.length; i++) {
        const nm = lumps[i].name;
        if (start.includes(nm)) { inside = true; continue; }
        if (end.includes(nm)) { inside = false; continue; }
        if (inside && lumps[i].size > 0) out.push(i);
      }
      return out;
    },
    maps: () => lumps.map((l) => l.name).filter((n) => /^E\dM\d$|^MAP\d\d$/.test(n)),
  };
}

// Words of a growing u32 array.
class Words {
  constructor() { this.a = new Uint32Array(1 << 16); this.n = 0; this.f = new Float32Array(this.a.buffer); }
  grow(k) { if (this.n + k > this.a.length) { let m = this.a.length; while (m < this.n + k) m *= 2; const b = new Uint32Array(m); b.set(this.a); this.a = b; this.f = new Float32Array(b.buffer); } }
  u(v) { this.grow(1); this.a[this.n++] = v >>> 0; }
  i(v) { this.grow(1); this.a[this.n++] = v | 0; }
  fl(v) { this.grow(1); this.f[this.n++] = v; }
  zeros(k) { this.grow(k); const s = this.n; this.n += k; return s; }
  done() { return this.a.slice(0, this.n); }
}

function patchInfo(p) {
  const dv = new DataView(p.buffer, p.byteOffset, p.byteLength);
  return { w: dv.getInt16(0, true), h: dv.getInt16(2, true), left: dv.getInt16(4, true), top: dv.getInt16(6, true), dv };
}

// Paint a patch into a column-major texel array of size w x h at (ox, oy).
function drawPatch(p, dst, w, h, ox, oy) {
  const { w: pw, dv } = patchInfo(p);
  for (let c = 0; c < pw; c++) {
    const x = ox + c;
    if (x < 0 || x >= w) continue;
    let o = dv.getUint32(8 + 4 * c, true), top = -1;
    while (o < p.length && p[o] !== 0xff) {
      const delta = p[o], len = p[o + 1];
      top = delta <= top ? top + delta : delta; // tall patches
      for (let k = 0; k < len; k++) {
        const y = oy + top + k;
        if (y >= 0 && y < h) dst[x * h + y] = p[o + 3 + k] | 0x100;
      }
      o += len + 4;
    }
  }
}

// One patch as palette indices (0x100 set where opaque), for the menu drawn on the CPU.
export function decodePatch(wad, name) {
  if (!wad.has(name)) return null;
  const p = wad.get(name), info = patchInfo(p);
  const pix = new Uint16Array(info.w * info.h);
  drawPatch(p, pix, info.w, info.h, 0, 0);
  return { w: info.w, h: info.h, left: info.left, top: info.top, pix };
}

export function buildGfx(wad) {
  const texels = []; // Uint16Array chunks
  let texelCount = 0;
  const addTexels = (arr) => { const off = texelCount; texels.push(arr); texelCount += arr.length + (arr.length & 1); if (arr.length & 1) texels.push(new Uint16Array(1)); return off; };

  // textures
  const pnamesL = wad.get("PNAMES");
  const pdv = new DataView(pnamesL.buffer, pnamesL.byteOffset);
  const pnames = [];
  for (let i = 0, n = pdv.getInt32(0, true); i < n; i++) pnames.push(lumpName(pnamesL, 4 + 8 * i));
  const patchLump = pnames.map((nm) => wad.index(nm));
  const textures = []; // {name,w,h,off,masked}
  for (const tl of ["TEXTURE1", "TEXTURE2"]) {
    if (!wad.has(tl)) continue;
    const t = wad.get(tl), dv = new DataView(t.buffer, t.byteOffset, t.byteLength);
    for (let i = 0, n = dv.getInt32(0, true); i < n; i++) {
      const o = dv.getInt32(4 + 4 * i, true);
      const name = lumpName(t, o), w = dv.getInt16(o + 12, true), h = dv.getInt16(o + 14, true), np = dv.getInt16(o + 20, true);
      const pix = new Uint16Array(w * h);
      for (let k = 0; k < np; k++) {
        const b = o + 22 + 10 * k;
        const li = patchLump[dv.getInt16(b + 4, true)];
        if (li !== undefined) drawPatch(wad.data(li), pix, w, h, dv.getInt16(b, true), dv.getInt16(b + 2, true));
      }
      let masked = 0;
      for (let k = 0; k < pix.length; k++) if (!pix[k]) { masked = 1; break; }
      textures.push({ name, w, h, off: addTexels(pix), masked });
    }
  }
  const texIndex = new Map(textures.map((t, i) => [t.name, i]));

  // flats (row-major 64x64)
  const flatLumps = wad.between(["F_START", "FF_START"], ["F_END", "FF_END"]).filter((i) => wad.lumps[i].size === 4096);
  const flats = flatLumps.map((li) => {
    const src = wad.data(li), pix = new Uint16Array(4096);
    for (let k = 0; k < 4096; k++) pix[k] = src[k] | 0x100;
    return { name: wad.lumps[li].name, off: addTexels(pix) };
  });
  const flatIndex = new Map(flats.map((f, i) => [f.name, i]));

  // sprites: every lump between S_START/S_END becomes a column-major patch
  const sprLumps = wad.between(["S_START", "SS_START"], ["S_END", "SS_END"]);
  const sprites = sprLumps.map((li) => {
    const p = wad.data(li), info = patchInfo(p);
    const pix = new Uint16Array(info.w * info.h);
    drawPatch(p, pix, info.w, info.h, 0, 0);
    return { name: wad.lumps[li].name, w: info.w, h: info.h, left: info.left, top: info.top, off: addTexels(pix) };
  });
  // frame table: per sprite name, per frame, 8 rotations of (lump | flip<<15)
  const frames = SPRNAMES.map(() => []);
  const sprNameIndex = new Map(SPRNAMES.map((s, i) => [s, i]));
  const setRot = (si, fr, rot, lump, flip) => {
    const f = (frames[si][fr] ||= new Array(8).fill(-1));
    if (rot === 0) for (let r = 0; r < 8; r++) f[r] = lump | (flip << 15);
    else f[rot - 1] = lump | (flip << 15);
  };
  sprites.forEach((s, li) => {
    const si = sprNameIndex.get(s.name.slice(0, 4));
    if (si === undefined) return;
    setRot(si, s.name.charCodeAt(4) - 65, +s.name[5], li, 0);
    if (s.name.length >= 8) setRot(si, s.name.charCodeAt(6) - 65, +s.name[7], li, 1);
  });

  // other patches used by the HUD (status bar, numbers, menu font)
  const hudNames = wad.lumps.map((l) => l.name).filter((n) => /^(STBAR|STARMS|STTNUM\d|STTMINUS|STTPRCNT|STYSNUM\d|STGNUM\d|STKEYS\d|STF\w+|STCFN\d\d\d|M_\w+|STTNUM\d)$/.test(n));
  const hud = new Map();
  for (const nm of new Set(hudNames)) {
    const p = wad.get(nm), info = patchInfo(p);
    if (info.w <= 0 || info.h <= 0 || info.w > 640) continue;
    const pix = new Uint16Array(info.w * info.h);
    drawPatch(p, pix, info.w, info.h, 0, 0);
    hud.set(nm, { w: info.w, h: info.h, left: info.left, top: info.top, off: addTexels(pix) });
  }

  // assemble
  const W = new Words();
  const L = {};
  const pal = wad.get("PLAYPAL");
  L.PAL = W.n;
  for (let i = 0; i < 14 * 256; i++) W.u(pal[3 * i] | (pal[3 * i + 1] << 8) | (pal[3 * i + 2] << 16) | 0xff000000);
  const cm = wad.get("COLORMAP");
  L.CMAP = W.n;
  for (let i = 0; i < 34 * 256; i++) W.u(cm[i]);
  L.TEXDIR = W.n;
  for (const t of textures) { W.u(t.w); W.u(t.h); W.u(t.off); W.u(t.masked); }
  L.FLATDIR = W.n;
  for (const f of flats) W.u(f.off);
  L.SPRDIR = W.n;
  for (const s of sprites) { W.u(s.w); W.u(s.h); W.i(s.left); W.i(s.top); W.u(s.off); W.u(0); }
  L.HUDDIR = W.n;
  const hudIndex = new Map();
  for (const [nm, s] of hud) { hudIndex.set(nm, hudIndex.size); W.u(s.w); W.u(s.h); W.i(s.left); W.i(s.top); W.u(s.off); W.u(0); }
  // sprite frames: SPRFRAMES[sprite] = (start, count); FRAMEROT[(start+frame)*8+rot]
  L.SPRFRAMES = W.n;
  let fstart = 0;
  for (const f of frames) { W.u(fstart); W.u(f.length); fstart += f.length; }
  L.FRAMEROT = W.n;
  for (const f of frames) for (const rot of f) for (let r = 0; r < 8; r++) { const v = rot ? rot[r] : -1; W.u(v < 0 ? 0xffffffff : v); }
  // state table: sprite, frame, tics, action, next, misc1, misc2 (7 words, padded to 8)
  L.STATES = W.n;
  for (const s of STATES) { for (let k = 0; k < 7; k++) W.i(s[k]); W.u(0); }
  // mobjinfo: 23 fields padded to 24; radius/height/speed stay as given (units)
  L.MOBJINFO = W.n;
  for (const m of MOBJINFO) { for (let k = 0; k < 23; k++) W.i(m[k]); W.u(0); }
  // animations: [first, last] in texture/flat index space, from Doom's animdefs
  const animTex = [], animFlat = [];
  for (const [a, b] of [["BLODGR1","BLODGR4"],["SLADRIP1","SLADRIP3"],["BLODRIP1","BLODRIP4"],["FIREWALA","FIREWALL"],["GSTFONT1","GSTFONT3"],["FIRELAVA","FIRELAV3"],["FIREMAG1","FIREMAG3"],["FIREBLU1","FIREBLU2"],["ROCKRED1","ROCKRED3"],["BFALL1","BFALL4"],["SFALL1","SFALL4"],["WFALL1","WFALL4"],["DBRAIN1","DBRAIN4"]]) {
    const i = texIndex.get(a), j = texIndex.get(b);
    if (i !== undefined && j !== undefined && j > i) animTex.push([i, j]);
  }
  for (const [a, b] of [["NUKAGE1","NUKAGE3"],["FWATER1","FWATER4"],["SWATER1","SWATER4"],["LAVA1","LAVA4"],["BLOOD1","BLOOD3"],["RROCK05","RROCK08"],["SLIME01","SLIME04"],["SLIME05","SLIME08"],["SLIME09","SLIME12"]]) {
    const i = flatIndex.get(a), j = flatIndex.get(b);
    if (i !== undefined && j !== undefined && j > i) animFlat.push([i, j]);
  }
  // switch pairs: texture index -> partner
  const switches = [];
  for (const [nm, i] of texIndex) if (nm.startsWith("SW1")) { const j = texIndex.get("SW2" + nm.slice(3)); if (j !== undefined) switches.push([i, j]); }

  L.LSPEC = W.n;
  for (const v of packSpecials(256)) W.u(v);
  L.ANIMTEX = W.n; W.u(animTex.length); for (const [a, b] of animTex) { W.u(a); W.u(b); }
  L.ANIMFLAT = W.n; W.u(animFlat.length); for (const [a, b] of animFlat) { W.u(a); W.u(b); }
  L.SWITCH = W.n; W.u(switches.length); for (const [a, b] of switches) { W.u(a); W.u(b); }
  L.MSGDIR = W.n;
  { let o = 0; for (const m of MESSAGES) { W.u(o); W.u(m.length); o += m.length; } }
  L.MSGCHARS = W.n;
  for (const m of MESSAGES) for (const ch of m) W.u(ch.charCodeAt(0));
  // texels last, two per word
  L.TEXELS = W.n;
  const tw = W.zeros(texelCount >> 1);
  const t16 = new Uint16Array(W.a.buffer, tw * 4, texelCount);
  let p = 0;
  for (const chunk of texels) { t16.set(chunk, p); p += chunk.length; }

  return {
    words: W.done(), layout: L, texIndex, flatIndex, hudIndex, hud,
    numTextures: textures.length, numFlats: flats.length, numSprites: sprites.length,
    textures, animTex, animFlat, switches,
    skyFlat: flatIndex.get("F_SKY1") ?? 0xffff,
  };
}

// ---------------------------------------------------------------- level

export const NF_SUBSECTOR = 0x8000;

export function buildMap(wad, gfx, mapName, skill = 3) {
  const base = wad.index(mapName);
  if (base === undefined) throw new Error("no map " + mapName);
  const lump = (k) => { // k = offset after the marker
    const names = ["THINGS", "LINEDEFS", "SIDEDEFS", "VERTEXES", "SEGS", "SSECTORS", "NODES", "SECTORS", "REJECT", "BLOCKMAP"];
    for (let i = base + 1; i < base + 12 && i < wad.lumps.length; i++) if (wad.lumps[i].name === k) { const d = wad.data(i); return new DataView(d.buffer, d.byteOffset, d.byteLength); }
    if (!names.includes(k)) throw new Error(k);
    throw new Error("map lump missing " + k);
  };
  const name8 = (dv, o) => lumpName(new Uint8Array(dv.buffer, dv.byteOffset), o);

  const V = lump("VERTEXES"), nv = V.byteLength / 4;
  const verts = []; for (let i = 0; i < nv; i++) verts.push([V.getInt16(4 * i, true), V.getInt16(4 * i + 2, true)]);

  const SE = lump("SECTORS"), nsec = SE.byteLength / 26;
  const sectors = [];
  for (let i = 0; i < nsec; i++) {
    const o = 26 * i;
    const fp = name8(SE, o + 4), cp = name8(SE, o + 12);
    sectors.push({ floor: SE.getInt16(o, true), ceil: SE.getInt16(o + 2, true), floorpic: gfx.flatIndex.get(fp) ?? 0, ceilpic: gfx.flatIndex.get(cp) ?? 0,
      light: SE.getInt16(o + 20, true), special: SE.getInt16(o + 22, true), tag: SE.getInt16(o + 24, true) });
  }
  const SD = lump("SIDEDEFS"), nsd = SD.byteLength / 30;
  const tex = (nm) => (nm === "-" || nm === "" ? 0xffff : gfx.texIndex.get(nm) ?? 0xffff);
  const sides = [];
  for (let i = 0; i < nsd; i++) {
    const o = 30 * i;
    sides.push({ xoff: SD.getInt16(o, true), yoff: SD.getInt16(o + 2, true), top: tex(name8(SD, o + 4)), bottom: tex(name8(SD, o + 12)), mid: tex(name8(SD, o + 20)), sector: SD.getInt16(o + 28, true) });
  }
  const LD = lump("LINEDEFS"), nl = LD.byteLength / 14;
  const lines = [];
  for (let i = 0; i < nl; i++) {
    const o = 14 * i;
    const s0 = LD.getUint16(o + 10, true), s1 = LD.getUint16(o + 12, true);
    const l = { v1: LD.getUint16(o, true), v2: LD.getUint16(o + 2, true), flags: LD.getUint16(o + 4, true), special: LD.getUint16(o + 6, true), tag: LD.getUint16(o + 8, true),
      s0: s0 === 0xffff ? -1 : s0, s1: s1 === 0xffff ? -1 : s1 };
    l.fsec = l.s0 >= 0 ? sides[l.s0].sector : -1;
    l.bsec = l.s1 >= 0 ? sides[l.s1].sector : -1;
    lines.push(l);
  }
  const SG = lump("SEGS"), nseg = SG.byteLength / 12;
  const segs = [];
  for (let i = 0; i < nseg; i++) {
    const o = 12 * i;
    const line = SG.getUint16(o + 6, true), side = SG.getInt16(o + 8, true);
    const l = lines[line];
    segs.push({ v1: SG.getUint16(o, true), v2: SG.getUint16(o + 2, true), line, side, offset: SG.getInt16(o + 10, true), sidedef: side ? l.s1 : l.s0 });
  }
  const SS = lump("SSECTORS"), nss = SS.byteLength / 4;
  const ssecs = [];
  for (let i = 0; i < nss; i++) {
    const n = SS.getUint16(4 * i, true), first = SS.getUint16(4 * i + 2, true);
    ssecs.push({ n, first, sector: sides[segs[first].sidedef].sector });
  }
  const ND = lump("NODES"), nn = ND.byteLength / 28;
  const nodes = [];
  for (let i = 0; i < nn; i++) {
    const o = 28 * i, g = (k) => ND.getInt16(o + 2 * k, true);
    nodes.push({ x: g(0), y: g(1), dx: g(2), dy: g(3), bb: [[g(4), g(5), g(6), g(7)], [g(8), g(9), g(10), g(11)]], ch: [ND.getUint16(o + 24, true), ND.getUint16(o + 26, true)] });
  }
  const BM = lump("BLOCKMAP");
  const bmx = BM.getInt16(0, true), bmy = BM.getInt16(2, true), bmw = BM.getInt16(4, true), bmh = BM.getInt16(6, true);
  const cells = [], blist = [];
  for (let i = 0; i < bmw * bmh; i++) {
    let o = BM.getUint16(8 + 2 * i, true) * 2;
    const start = blist.length;
    o += 2; // skip the leading 0 every list carries
    while (o + 2 <= BM.byteLength) { const v = BM.getUint16(o, true); if (v === 0xffff) break; blist.push(v); o += 2; }
    cells.push([start, blist.length - start]);
  }
  // sector -> lines
  const secLines = sectors.map(() => []);
  lines.forEach((l, i) => { if (l.fsec >= 0) secLines[l.fsec].push(i); if (l.bsec >= 0 && l.bsec !== l.fsec) secLines[l.bsec].push(i); });

  // point -> subsector on the CPU, used for spawning
  const pointInSubsector = (x, y) => {
    if (!nodes.length) return 0;
    let n = nodes.length - 1;
    while (!(n & NF_SUBSECTOR)) {
      const nd = nodes[n];
      const side = (y - nd.y) * nd.dx >= nd.dy * (x - nd.x) ? 1 : 0;
      n = nd.ch[side];
    }
    return n & ~NF_SUBSECTOR;
  };

  const W = new Words();
  const L = {};
  L.VERT = W.n; for (const [x, y] of verts) { W.fl(x); W.fl(y); }
  L.LINE = W.n; for (const l of lines) { W.u(l.v1); W.u(l.v2); W.u(l.flags); W.u(l.tag); W.i(l.s0); W.i(l.s1); W.i(l.fsec); W.i(l.bsec); }
  L.SIDE = W.n; for (const s of sides) { W.fl(s.xoff); W.fl(s.yoff); W.u(s.sector); W.u(0); }
  L.SEG = W.n; for (const s of segs) { W.u(s.v1); W.u(s.v2); W.u(s.line); W.u(s.side); W.fl(s.offset); W.u(s.sidedef); }
  L.SSEC = W.n; for (const s of ssecs) { W.u(s.n); W.u(s.first); W.u(s.sector); W.u(0); }
  L.NODE = W.n; for (const nd of nodes) { W.fl(nd.x); W.fl(nd.y); W.fl(nd.dx); W.fl(nd.dy); for (const b of nd.bb) for (const v of b) W.fl(v); W.u(nd.ch[0]); W.u(nd.ch[1]); }
  L.BMCELL = W.n; for (const [s, c] of cells) { W.u(s); W.u(c); }
  L.BMLIST = W.n; for (const v of blist) W.u(v);
  L.SECLINE = W.n; { let s = 0; for (const sl of secLines) { W.u(s); W.u(sl.length); s += sl.length; } }
  L.SECLIST = W.n; for (const sl of secLines) for (const v of sl) W.u(v);
  // REJECT bits, 32 to a word; a short or missing lump rejects nothing
  L.REJECT = W.n;
  {
    const bits = nsec * nsec, words = Math.ceil(bits / 32) + 1;
    const start = W.zeros(words);
    let rej = null;
    try { const r = lump("REJECT"); rej = new Uint8Array(r.buffer, r.byteOffset, r.byteLength); } catch { rej = null; }
    if (rej) for (let i = 0; i < Math.min(rej.length, Math.ceil(bits / 8)); i++) W.a[start + (i >> 2)] |= rej[i] << ((i & 3) * 8);
  }
  W.u(0);

  // things
  const TH = lump("THINGS"), nt = TH.byteLength / 10;
  const skillBit = skill <= 2 ? 1 : skill === 3 ? 2 : 4;
  const byEd = new Map(MOBJINFO.map((m, i) => [m[0], i]));
  const things = [];
  let player = null;
  for (let i = 0; i < nt; i++) {
    const o = 10 * i;
    const t = { x: TH.getInt16(o, true), y: TH.getInt16(o + 2, true), angle: TH.getInt16(o + 4, true), type: TH.getInt16(o + 6, true), flags: TH.getInt16(o + 8, true) };
    if (t.type === 1) { player = t; continue; }
    if (t.type >= 2 && t.type <= 4 || t.type === 11) continue; // other starts
    if (t.flags & 16) continue; // multiplayer only
    if (!(t.flags & skillBit)) continue;
    const mt = byEd.get(t.type);
    if (mt === undefined) continue;
    things.push({ ...t, mt });
  }
  const spawnSector = (x, y) => ssecs[pointInSubsector(x, y)].sector;
  // spawn points for Nightmare respawns: x, y, angle in degrees, flags; indexed by mobj.spawnidx
  L.THINGS = W.n;
  for (const t of things) { W.fl(t.x); W.fl(t.y); W.fl(t.angle); W.u(t.flags); }
  W.u(0);
  const words = W.done();
  const em = /^E(\d)M(\d)$/.exec(mapName), mm = /^MAP(\d\d)$/.exec(mapName);
  return {
    name: mapName, words, layout: L,
    episode: em ? +em[1] : 1, mapnum: em ? +em[2] : mm ? +mm[1] : 1, commercial: !!mm,
    shareware: !wad.has("E2M1") && !wad.has("MAP01") && !wad.has("E4M1"),
    counts: { verts: nv, lines: nl, sides: nsd, segs: nseg, ssecs: nss, nodes: nn, sectors: nsec },
    bmap: { x: bmx, y: bmy, w: bmw, h: bmh },
    sectors, lines, sides, things, player, spawnSector, pointInSubsector, skill,
  };
}

// Initial mobj records for the GPU (see MOBJ_WORDS in shaders.js).
export function spawnMobjs(map, mobjWords, capacity) {
  const buf = new ArrayBuffer(capacity * mobjWords * 4);
  const u = new Uint32Array(buf), i32 = new Int32Array(buf), f = new Float32Array(buf);
  let n = 0;
  const spawn = (mt, x, y, angleDeg, flagsExtra = 0, spawnIndex = 0xffffffff) => {
    const info = MOBJINFO[mt];
    const sec = map.spawnSector(x, y);
    const s = map.sectors[sec];
    const o = n * mobjWords;
    const flags = info[21] | flagsExtra;
    f[o + 0] = x; f[o + 1] = y;
    f[o + 2] = flags & MF.SPAWNCEILING ? s.ceil - info[17] : s.floor;
    f[o + 3] = angleDeg * Math.PI / 180;
    f[o + 7] = s.floor; f[o + 8] = s.ceil; f[o + 9] = info[16]; f[o + 10] = info[17];
    u[o + 11] = mt; u[o + 12] = info[1]; i32[o + 13] = STATES[info[1]][2]; u[o + 14] = flags; i32[o + 15] = info[2];
    u[o + 16] = sec; i32[o + 17] = -1; i32[o + 18] = -1; i32[o + 19] = 8; // movedir DI_NODIR
    i32[o + 21] = map.skill >= 5 ? 0 : info[5]; // reactiontime; Nightmare monsters react at once
    u[o + 24] = 1; // in use
    u[o + 26] = 0xffffffff; // no state request
    u[o + 31] = spawnIndex; // where a Nightmare respawn puts it back
    f[o + 28] = f[o]; f[o + 29] = f[o + 1]; f[o + 30] = f[o + 2]; // previous-tic position
    n++;
    return o;
  };
  const p = map.player || { x: 0, y: 0, angle: 0 };
  spawn(MT.PLAYER, p.x, p.y, p.angle);
  map.things.forEach((t, k) => spawn(t.mt, t.x, t.y, t.angle, t.flags & 8 ? MF.AMBUSH : 0, k));
  return { buf, count: n };
}
