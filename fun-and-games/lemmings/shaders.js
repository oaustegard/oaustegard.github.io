// Constants and WGSL loading for gPu(lemmings). The kernels live in common.wgsl, sim.wgsl,
// render.wgsl and present.wgsl; this file generates the constants they share and joins them. Every lemming state is its own small kernel. Each tick, classify puts every
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
  HOV: 11, CLICK: 12, NREM: 14, NADD: 15, SKILL: 16, SND: 24, QC: 32, DONE: 51, HOVSTATE: 52, HOVFLAGS: 53,
  ARES: 54, ASEQ: 55, ASKILL: 56, AIDX: 57, ATIME: 58, WORDS: 64 };
// what became of the last click (WD.ARES)
export const ASSIGN = { GIVEN: 1, NOBODY: 2, CANNOT: 3, NONE_LEFT: 4, NO_SKILL: 5 };
// rom: level header at 0, terrain palette at PAL, sprite meta at SMETA, sprite frames at SPR
export const ROM = { W: 0, H: 1, COUNT: 2, NHATCH: 3, NEXIT: 4, NWATER: 5, RRMIN: 6, BURST: 7, DIGITS: 8,
  HATCH: 16, EXIT: 32, WATER: 48, THEME: 80, PAL: 128, SMETA: 384, SPR: 512 };
export const ARGS_WORDS = (NS + 2) * 3;
const EOFF = NS * MAXL, AOFF = EOFF + MAXE * 4, FOFF = AOFF + MAXE * 4;
export const AUX_FIELD = FOFF;

const STATE_CONSTS = Object.entries(S).map(([k, v]) => `const S_${k} = ${v}u;`).join("\n");
const WD_CONSTS = Object.entries(WD).map(([k, v]) => `const W_${k} = ${v}u;`).join("\n");
const ROM_CONSTS = Object.entries(ROM).map(([k, v]) => `const R_${k} = ${v}u;`).join("\n");

export const STATE_KERNELS = ["WALK", "FALL", "FLOAT", "CLIMB", "HOIST", "BUILD", "SHRUG", "BASH", "MINE", "DIG",
  "BLOCK", "JUMP", "OHNO", "EXIT", "SPLAT", "DROWN", "POP"].map((s) => "k" + s);

// the constants every kernel sees, written as WGSL
export function wgslHeader() {
  return [
    `const MAXL = ${MAXL}u;`, `const MAXE = ${MAXE}u;`, `const NS = ${NS}u;`,
    `const EOFF = ${EOFF}u;`, `const AOFF = ${AOFF}u;`, `const FOFF = ${FOFF}u;`,
    `const COL = ${MAXVIEW}u;`, `const TPS = ${TPS};`, `const OPEN_TICKS = ${OPEN_TICKS}u;`,
    STATE_CONSTS, WD_CONSTS, ROM_CONSTS, "",
  ].join("\n");
}

// fetched next to this module, with its version stamp, so a page never mixes old and new kernels
async function fetchText(name) {
  const url = new URL(name + new URL(import.meta.url).search, import.meta.url);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
  return r.text();
}

export async function loadWGSL() {
  const [common, sim, render] = await Promise.all(["common.wgsl", "sim.wgsl", "render.wgsl"].map(fetchText));
  return wgslHeader() + common + sim + render;
}

export const loadPresentWGSL = () => fetchText("present.wgsl");
