// Line specials, sector specials and messages as data, so the WGSL dispatches
// on an action code instead of a 140-case switch. Transcribed from DOOM's
// p_spec.c and p_switch.c (id Software, GPL-2.0).

// triggers
export const TR = { W: 1, S: 2, G: 3, D: 4 };
// actions
export const AC = { DOOR: 1, FLOOR: 2, PLAT: 3, CEIL: 4, STAIRS: 5, LIGHT: 6, STROBE: 7, LIGHTSOFF: 8,
  EXIT: 9, SECRETEXIT: 10, TELEPORT: 11, STOPPLAT: 12, CRUSHSTOP: 13, VDOOR: 14, LOCKED: 15, CEILFLOOR: 16, DONUT: 17 };
export const DOOR = { normal: 0, close30ThenOpen: 1, close: 2, open: 3, raiseIn5Mins: 4, blazeRaise: 5, blazeOpen: 6, blazeClose: 7 };
export const FLOOR = { lowerFloor: 0, lowerFloorToLowest: 1, turboLower: 2, raiseFloor: 3, raiseFloorToNearest: 4, raiseToTexture: 5,
  lowerAndChange: 6, raiseFloor24: 7, raiseFloor24AndChange: 8, raiseFloorCrush: 9, raiseFloorTurbo: 10, donutRaise: 11, raiseFloor512: 12 };
export const PLAT = { perpetualRaise: 0, downWaitUpStay: 1, raiseAndChange24: 2, raiseAndChange32: 3, raiseToNearestAndChange: 4, blazeDWUS: 5 };
export const CEIL = { lowerToFloor: 0, raiseToHighest: 1, lowerAndCrush: 2, crushAndRaise: 3, fastCrushAndRaise: 4, silentCrushAndRaise: 5 };
// keys for doors: 1 blue, 2 yellow, 3 red (card or skull)
const K = { blue: 1, yellow: 2, red: 3 };

const { W, S, G, D } = TR;
const { DOOR: DR, FLOOR: FL, PLAT: PL, CEIL: CE } = AC;
// special: [trigger, repeat, action, arg, key, monsters]
export const LINE_SPECIALS = {
  1: [D, 1, AC.VDOOR, DOOR.normal, 0, 1], 26: [D, 1, AC.VDOOR, DOOR.normal, K.blue], 27: [D, 1, AC.VDOOR, DOOR.normal, K.yellow],
  28: [D, 1, AC.VDOOR, DOOR.normal, K.red], 31: [D, 0, AC.VDOOR, DOOR.open], 32: [D, 0, AC.VDOOR, DOOR.open, K.blue],
  33: [D, 0, AC.VDOOR, DOOR.open, K.red], 34: [D, 0, AC.VDOOR, DOOR.open, K.yellow], 117: [D, 1, AC.VDOOR, DOOR.blazeRaise],
  118: [D, 0, AC.VDOOR, DOOR.blazeOpen],
  // walk, once
  2: [W, 0, DR, DOOR.open], 3: [W, 0, DR, DOOR.close], 4: [W, 0, DR, DOOR.normal, 0, 1], 5: [W, 0, FL, FLOOR.raiseFloor],
  6: [W, 0, CE, CEIL.fastCrushAndRaise], 8: [W, 0, AC.STAIRS, 0], 10: [W, 0, PL, PLAT.downWaitUpStay, 0, 1],
  12: [W, 0, AC.LIGHT, 0], 13: [W, 0, AC.LIGHT, 255], 16: [W, 0, DR, DOOR.close30ThenOpen], 17: [W, 0, AC.STROBE, 0],
  19: [W, 0, FL, FLOOR.lowerFloor], 22: [W, 0, PL, PLAT.raiseToNearestAndChange], 25: [W, 0, CE, CEIL.crushAndRaise],
  30: [W, 0, FL, FLOOR.raiseToTexture], 35: [W, 0, AC.LIGHT, 35], 36: [W, 0, FL, FLOOR.turboLower],
  37: [W, 0, FL, FLOOR.lowerAndChange], 38: [W, 0, FL, FLOOR.lowerFloorToLowest], 39: [W, 0, AC.TELEPORT, 0, 0, 1],
  40: [W, 0, AC.CEILFLOOR, 0], 44: [W, 0, CE, CEIL.lowerAndCrush], 52: [W, 1, AC.EXIT, 0], 53: [W, 0, PL, PLAT.perpetualRaise],
  54: [W, 0, AC.STOPPLAT, 0], 56: [W, 0, FL, FLOOR.raiseFloorCrush], 57: [W, 0, AC.CRUSHSTOP, 0], 58: [W, 0, FL, FLOOR.raiseFloor24],
  59: [W, 0, FL, FLOOR.raiseFloor24AndChange], 104: [W, 0, AC.LIGHTSOFF, 0], 108: [W, 0, DR, DOOR.blazeRaise],
  109: [W, 0, DR, DOOR.blazeOpen], 100: [W, 0, AC.STAIRS, 1], 110: [W, 0, DR, DOOR.blazeClose], 119: [W, 0, FL, FLOOR.raiseFloorToNearest],
  121: [W, 0, PL, PLAT.blazeDWUS], 124: [W, 1, AC.SECRETEXIT, 0], 125: [W, 0, AC.TELEPORT, 1, 0, 2], 130: [W, 0, FL, FLOOR.raiseFloorTurbo],
  141: [W, 0, CE, CEIL.silentCrushAndRaise],
  // walk, repeatable
  72: [W, 1, CE, CEIL.lowerAndCrush], 73: [W, 1, CE, CEIL.crushAndRaise], 74: [W, 1, AC.CRUSHSTOP, 0], 75: [W, 1, DR, DOOR.close],
  76: [W, 1, DR, DOOR.close30ThenOpen], 77: [W, 1, CE, CEIL.fastCrushAndRaise], 79: [W, 1, AC.LIGHT, 35], 80: [W, 1, AC.LIGHT, 0],
  81: [W, 1, AC.LIGHT, 255], 82: [W, 1, FL, FLOOR.lowerFloorToLowest], 83: [W, 1, FL, FLOOR.lowerFloor], 84: [W, 1, FL, FLOOR.lowerAndChange],
  86: [W, 1, DR, DOOR.open], 87: [W, 1, PL, PLAT.perpetualRaise], 88: [W, 1, PL, PLAT.downWaitUpStay, 0, 1], 89: [W, 1, AC.STOPPLAT, 0],
  90: [W, 1, DR, DOOR.normal], 91: [W, 1, FL, FLOOR.raiseFloor], 92: [W, 1, FL, FLOOR.raiseFloor24], 93: [W, 1, FL, FLOOR.raiseFloor24AndChange],
  94: [W, 1, FL, FLOOR.raiseFloorCrush], 95: [W, 1, PL, PLAT.raiseToNearestAndChange], 96: [W, 1, FL, FLOOR.raiseToTexture],
  97: [W, 1, AC.TELEPORT, 0, 0, 1], 98: [W, 1, FL, FLOOR.turboLower], 105: [W, 1, DR, DOOR.blazeRaise], 106: [W, 1, DR, DOOR.blazeOpen],
  107: [W, 1, DR, DOOR.blazeClose], 120: [W, 1, PL, PLAT.blazeDWUS], 126: [W, 1, AC.TELEPORT, 1, 0, 2], 128: [W, 1, FL, FLOOR.raiseFloorToNearest],
  129: [W, 1, FL, FLOOR.raiseFloorTurbo],
  // switch, once
  7: [S, 0, AC.STAIRS, 0], 9: [S, 0, AC.DONUT, 0], 11: [S, 0, AC.EXIT, 0], 14: [S, 0, PL, PLAT.raiseAndChange32],
  15: [S, 0, PL, PLAT.raiseAndChange24], 18: [S, 0, FL, FLOOR.raiseFloorToNearest], 20: [S, 0, PL, PLAT.raiseToNearestAndChange],
  21: [S, 0, PL, PLAT.downWaitUpStay], 23: [S, 0, FL, FLOOR.lowerFloorToLowest], 29: [S, 0, DR, DOOR.normal],
  41: [S, 0, CE, CEIL.lowerToFloor], 71: [S, 0, FL, FLOOR.turboLower], 49: [S, 0, CE, CEIL.crushAndRaise], 50: [S, 0, DR, DOOR.close],
  51: [S, 0, AC.SECRETEXIT, 0], 55: [S, 0, FL, FLOOR.raiseFloorCrush], 101: [S, 0, FL, FLOOR.raiseFloor], 102: [S, 0, FL, FLOOR.lowerFloor],
  103: [S, 0, DR, DOOR.open], 111: [S, 0, DR, DOOR.blazeRaise], 112: [S, 0, DR, DOOR.blazeOpen], 113: [S, 0, DR, DOOR.blazeClose],
  122: [S, 0, PL, PLAT.blazeDWUS], 127: [S, 0, AC.STAIRS, 1], 131: [S, 0, FL, FLOOR.raiseFloorTurbo],
  133: [S, 0, AC.LOCKED, DOOR.blazeOpen, K.blue], 135: [S, 0, AC.LOCKED, DOOR.blazeOpen, K.red], 137: [S, 0, AC.LOCKED, DOOR.blazeOpen, K.yellow],
  140: [S, 0, FL, FLOOR.raiseFloor512],
  // switch, repeatable
  42: [S, 1, DR, DOOR.close], 43: [S, 1, CE, CEIL.lowerToFloor], 45: [S, 1, FL, FLOOR.lowerFloor], 60: [S, 1, FL, FLOOR.lowerFloorToLowest],
  61: [S, 1, DR, DOOR.open], 62: [S, 1, PL, PLAT.downWaitUpStay], 63: [S, 1, DR, DOOR.normal], 64: [S, 1, FL, FLOOR.raiseFloor],
  66: [S, 1, PL, PLAT.raiseAndChange24], 67: [S, 1, PL, PLAT.raiseAndChange32], 65: [S, 1, FL, FLOOR.raiseFloorCrush],
  68: [S, 1, PL, PLAT.raiseToNearestAndChange], 69: [S, 1, FL, FLOOR.raiseFloorToNearest], 70: [S, 1, FL, FLOOR.turboLower],
  114: [S, 1, DR, DOOR.blazeRaise], 115: [S, 1, DR, DOOR.blazeOpen], 116: [S, 1, DR, DOOR.blazeClose], 123: [S, 1, PL, PLAT.blazeDWUS],
  132: [S, 1, FL, FLOOR.raiseFloorTurbo], 99: [S, 1, AC.LOCKED, DOOR.blazeOpen, K.blue], 134: [S, 1, AC.LOCKED, DOOR.blazeOpen, K.red],
  136: [S, 1, AC.LOCKED, DOOR.blazeOpen, K.yellow], 138: [S, 1, AC.LIGHT, 255], 139: [S, 1, AC.LIGHT, 35],
  // gun
  24: [G, 0, FL, FLOOR.raiseFloor], 46: [G, 1, DR, DOOR.open, 0, 1], 47: [G, 0, PL, PLAT.raiseToNearestAndChange],
};

// One word per special number: trigger | repeat<<3 | monsters<<4 | action<<8 | arg<<16 | key<<28.
export function packSpecials(maxSpecial = 256) {
  const out = new Uint32Array(maxSpecial);
  for (const [k, [tr, rep, ac, arg, key = 0, mon = 0]] of Object.entries(LINE_SPECIALS)) {
    out[+k] = tr | (rep << 3) | (mon << 4) | (ac << 8) | ((arg & 0xfff) << 16) | (key << 28);
  }
  return out;
}

export const MESSAGES = [
  "",
  "PICKED UP THE ARMOR.", "PICKED UP THE MEGAARMOR!", "PICKED UP A HEALTH BONUS.", "PICKED UP AN ARMOR BONUS.",
  "SUPERCHARGE!", "MEGASPHERE!", "PICKED UP A BLUE KEYCARD.", "PICKED UP A YELLOW KEYCARD.", "PICKED UP A RED KEYCARD.",
  "PICKED UP A BLUE SKULL KEY.", "PICKED UP A YELLOW SKULL KEY.", "PICKED UP A RED SKULL KEY.", "PICKED UP A STIMPACK.",
  "PICKED UP A MEDIKIT THAT YOU REALLY NEED!", "PICKED UP A MEDIKIT.", "INVULNERABILITY!", "BERSERK!", "PARTIAL INVISIBILITY",
  "RADIATION SHIELDING SUIT", "COMPUTER AREA MAP", "LIGHT AMPLIFICATION VISOR", "PICKED UP A CLIP.", "PICKED UP A BOX OF BULLETS.",
  "PICKED UP A ROCKET.", "PICKED UP A BOX OF ROCKETS.", "PICKED UP AN ENERGY CELL.", "PICKED UP AN ENERGY CELL PACK.",
  "PICKED UP 4 SHOTGUN SHELLS.", "PICKED UP A BOX OF SHOTGUN SHELLS.", "PICKED UP A BACKPACK FULL OF AMMO!",
  "YOU GOT THE BFG9000!  OH, YES.", "YOU GOT THE CHAINGUN!", "A CHAINSAW!  FIND SOME MEAT!", "YOU GOT THE ROCKET LAUNCHER!",
  "YOU GOT THE PLASMA GUN!", "YOU GOT THE SHOTGUN!", "YOU GOT THE SUPER SHOTGUN!",
  "YOU NEED A BLUE KEY TO OPEN THIS DOOR", "YOU NEED A YELLOW KEY TO OPEN THIS DOOR", "YOU NEED A RED KEY TO OPEN THIS DOOR",
  "YOU NEED A BLUE KEY TO ACTIVATE THIS OBJECT", "YOU NEED A YELLOW KEY TO ACTIVATE THIS OBJECT", "YOU NEED A RED KEY TO ACTIVATE THIS OBJECT",
  "A SECRET IS REVEALED!",
  "DEGREELESSNESS MODE ON", "DEGREELESSNESS MODE OFF", "VERY HAPPY AMMO ADDED", "AMMO (NO KEYS) ADDED",
  "NO CLIPPING MODE ON", "NO CLIPPING MODE OFF", "GAME SAVED.",
  "INVULN, STR, INVISO, RAD, ALLMAP, OR LITE-AMP", "POWER-UP TOGGLED",
];
export const MSG = Object.fromEntries(MESSAGES.map((m, i) => [m, i]));
