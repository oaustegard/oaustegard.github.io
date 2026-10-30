// DOOM's music: MUS songs played through a small OPL-style FM synthesizer driven by the WAD's
// GENMIDI instrument patches, the way the Sound Blaster did it. Parsing happens here; an
// AudioWorklet runs the sequencer and the synth. Constants follow Chocolate Doom's
// i_oplmusic.c (GPL-2.0).

// MUS -> events [seconds, kind, channel, a, b]; kinds: 0 note off, 1 note on (a note, b volume),
// 2 bend (a 0-255), 3 controller (a number, b value), 4 all notes off. MUS ticks run at 140 Hz.
export function parseMus(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  if (u8[0] !== 0x4d || u8[1] !== 0x55 || u8[2] !== 0x53 || u8[3] !== 0x1a) return null;
  const len = dv.getUint16(4, true), start = dv.getUint16(6, true);
  const events = [];
  const lastVol = new Array(16).fill(127);
  let p = start, t = 0;
  const end = Math.min(u8.length, start + len);
  while (p < end) {
    const d = u8[p++], kind = (d >> 4) & 7, ch = d & 15;
    if (kind === 0) events.push([t, 0, ch, u8[p++] & 127, 0]);
    else if (kind === 1) {
      const n = u8[p++];
      if (n & 128) lastVol[ch] = u8[p++] & 127;
      events.push([t, 1, ch, n & 127, lastVol[ch]]);
    } else if (kind === 2) events.push([t, 2, ch, u8[p++], 0]);
    else if (kind === 3) { const c = u8[p++]; if (c === 10 || c === 11) events.push([t, 4, ch, 0, 0]); }
    else if (kind === 4) { const c = u8[p++], v = u8[p++]; events.push([t, 3, ch, c, v]); }
    else if (kind === 6) break;
    if (d & 128) {
      let delay = 0, b;
      do { b = u8[p++]; delay = delay * 128 + (b & 127); } while (b & 128 && p < end);
      t += delay / 140;
    }
  }
  return { events, length: t };
}

// Standard MIDI files (Freedoom ships its music this way) -> the same events. MIDI's
// percussion channel 10 (index 9) swaps with MUS's channel 15.
export function parseMidi(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  if (u8[0] !== 0x4d || u8[1] !== 0x54 || u8[2] !== 0x68 || u8[3] !== 0x64) return null;
  const ntracks = dv.getUint16(10, false), division = dv.getUint16(12, false);
  if (division & 0x8000) return null; // SMPTE time is not used by game music
  let p = 8 + dv.getUint32(4, false);
  const raw = []; // [tick, order, kind, ch, a, b] or tempo [tick, order, -1, usPerBeat]
  let order = 0;
  for (let tr = 0; tr < ntracks && p + 8 <= u8.length; tr++) {
    const len = dv.getUint32(p + 4, false);
    let q = p + 8; const end = Math.min(p + 8 + len, u8.length);
    p = end;
    let tick = 0, status = 0;
    const vlq = () => { let v = 0, b; do { b = u8[q++]; v = v * 128 + (b & 127); } while (b & 128 && q < end); return v; };
    while (q < end) {
      tick += vlq();
      let st = u8[q];
      if (st & 0x80) q++; else st = status;
      if (st === 0xff) {
        const type = u8[q++], l = vlq();
        if (type === 0x51) raw.push([tick, order++, -1, (u8[q] << 16) | (u8[q + 1] << 8) | u8[q + 2]]);
        if (type === 0x2f) { q = end; break; }
        q += l; continue;
      }
      if (st === 0xf0 || st === 0xf7) { q += vlq(); continue; }
      status = st;
      const type = st & 0xf0;
      let ch = st & 15;
      ch = ch === 9 ? 15 : ch === 15 ? 9 : ch;
      const d1 = u8[q++], d2 = type === 0xc0 || type === 0xd0 ? 0 : u8[q++];
      if (type === 0x90 && d2 > 0) raw.push([tick, order++, 1, ch, d1, d2]);
      else if (type === 0x80 || type === 0x90) raw.push([tick, order++, 0, ch, d1, 0]);
      else if (type === 0xc0) raw.push([tick, order++, 3, ch, 0, d1]);
      else if (type === 0xe0) raw.push([tick, order++, 2, ch, ((d2 << 7) | d1) >> 6, 0]);
      else if (type === 0xb0) {
        if (d1 === 7) raw.push([tick, order++, 3, ch, 3, d2]);
        else if (d1 === 10) raw.push([tick, order++, 3, ch, 4, d2]);
        else if (d1 === 123 || d1 === 120) raw.push([tick, order++, 4, ch, 0, 0]);
      }
    }
  }
  raw.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const events = [];
  let usPerBeat = 500000, lastTick = 0, t = 0;
  for (const r of raw) {
    t += ((r[0] - lastTick) * usPerBeat) / division / 1e6;
    lastTick = r[0];
    if (r[2] === -1) { usPerBeat = r[3]; continue; }
    events.push([t, r[2], r[3], r[4], r[5]]);
  }
  return { events, length: t };
}
export const parseSong = (u8) => parseMus(u8) || parseMidi(u8);

// GENMIDI: 175 instruments (128 melodic, 47 percussion for notes 35-81), 36 bytes each
export function parseGenmidi(u8) {
  if (!u8 || String.fromCharCode(...u8.subarray(0, 8)) !== "#OPL_II#") return null;
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const op = (o) => ({ trem: u8[o], att: u8[o + 1], sus: u8[o + 2], wave: u8[o + 3], scale: u8[o + 4], level: u8[o + 5] });
  const out = [];
  for (let i = 0; i < 175; i++) {
    const o = 8 + 36 * i;
    const voice = (v) => ({ mod: op(v), fb: u8[v + 6], car: op(v + 7), offset: dv.getInt16(v + 14, true) });
    out.push({ flags: dv.getUint16(o, true), fine: u8[o + 2], fixed: u8[o + 3], voices: [voice(o + 4), voice(o + 20)] });
  }
  return out;
}

// The worklet: 18 voices of two FM operators each, with OPL-style rates, waveforms and feedback.
const WORKLET = /* js */ `
const MULT = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 12, 12, 15, 15];
// OPL2 envelope times in seconds for rates 1-15: attack 0 to full, decay and release over 96 dB
const ATT = [Infinity, 2.826, 1.413, 0.706, 0.353, 0.176, 0.088, 0.044, 0.022, 0.011, 0.0055, 0.0028, 0.0014, 0.0007, 0.00035, 0.0001];
const DEC = [Infinity, 39.28, 19.64, 9.82, 4.91, 2.455, 1.227, 0.613, 0.307, 0.153, 0.0767, 0.0384, 0.0192, 0.0096, 0.0048, 0.0024];
const VOL = [0,1,3,5,6,8,10,11,13,14,16,17,19,20,22,23,25,26,27,29,30,32,33,34,36,37,39,41,43,45,47,49,50,52,54,55,57,59,60,61,63,64,66,67,68,69,71,72,73,74,75,76,77,79,80,81,82,83,84,84,85,86,87,88,89,90,91,92,92,93,94,95,96,96,97,98,99,99,100,101,101,102,103,103,104,105,105,106,107,107,108,109,109,110,110,111,112,112,113,113,114,114,115,115,116,117,117,118,118,119,119,120,120,121,121,122,122,123,123,123,124,124,125,125,126,126,127,127];
const TAU = Math.PI * 2;
function wave(w, ph) {
  const s = Math.sin(ph * TAU);
  switch (w & 3) {
    case 0: return s;
    case 1: return s > 0 ? s : 0;              // half sine
    case 2: return Math.abs(s);                // abs sine
    default: return (ph % 0.5) < 0.25 ? Math.abs(s) : 0; // quarter pulses
  }
}
class Op {
  constructor() { this.ph = 0; this.env = 0; this.stage = 4; this.prev = [0, 0]; }
  setup(p, sr) {
    this.mult = MULT[p.trem & 15]; this.egt = (p.trem & 0x20) !== 0;
    this.ar = p.att >> 4; this.dr = p.att & 15; this.sl = Math.pow(10, -3 * (p.sus >> 4) / 20) * ((p.sus >> 4) === 15 ? 0.0001 : 1);
    this.rr = p.sus & 15; this.w = p.wave; this.sr = sr;
    this.vib = (p.trem & 0x40) !== 0; this.am = (p.trem & 0x80) !== 0;
  }
  keyOn() { this.stage = 0; this.ph = 0; }
  keyOff() { if (this.stage < 3) this.stage = 3; }
  step() {
    const dt = 1 / this.sr;
    switch (this.stage) {
      case 0: this.env += dt / ATT[this.ar]; if (this.env >= 1) { this.env = 1; this.stage = 1; } break;
      case 1: this.env *= Math.pow(10, (-96 / 20) * dt / DEC[this.dr]); if (this.env <= this.sl) { this.env = this.sl; this.stage = 2; } break;
      case 2: if (!this.egt) this.env *= Math.pow(10, (-96 / 20) * dt / DEC[this.rr]); break;
      case 3: this.env *= Math.pow(10, (-96 / 20) * dt / DEC[this.rr]); if (this.env < 1e-4) { this.env = 0; this.stage = 4; } break;
    }
    return this.env;
  }
}
class Voice {
  constructor() { this.m = new Op(); this.c = new Op(); this.on = false; this.age = 0; this.ch = -1; this.note = -1; }
}
class OPLSynth extends AudioWorkletProcessor {
  constructor() {
    super();
    this.voices = Array.from({ length: 18 }, () => new Voice());
    this.instr = null; this.song = null; this.t = 0; this.next = 0; this.playing = false; this.gain = 0.6; this.clock = 0;
    this.ch = Array.from({ length: 16 }, () => ({ prog: 0, vol: 100, pan: 64, bend: 0 }));
    this.port.onmessage = (e) => {
      const m = e.data;
      if (m.instr) this.instr = m.instr;
      if (m.song !== undefined) { this.song = m.song; this.t = 0; this.next = 0; this.playing = !!m.song; this.allOff(true); this.ch.forEach((c) => Object.assign(c, { prog: 0, vol: 100, pan: 64, bend: 0 })); }
      if (m.gain !== undefined) this.gain = m.gain;
      if (m.loop !== undefined) this.loop = m.loop;
    };
  }
  allOff(hard) { for (const v of this.voices) { if (hard) { v.on = false; v.m.stage = 4; v.c.stage = 4; v.m.env = v.c.env = 0; } else if (v.on) { v.m.keyOff(); v.c.keyOff(); } } }
  hz(v) { return 14.556 * Math.pow(2, v.fidx / 384); }
  freqIndex(v) {
    const inst = v.inst, gv = inst.voices[v.vi];
    let note = v.note;
    if (!(inst.flags & 1)) note += gv.offset;
    while (note < 0) note += 12;
    while (note > 95) note -= 12;
    let f = 64 + 32 * note + this.ch[v.ch].bend;
    if (v.vi) f += (inst.fine >> 1) - 64;
    return Math.max(f, 0);
  }
  volume(v) {
    const c = this.ch[v.ch];
    const full = (VOL[v.vel] * 2 * (VOL[c.vol] + 1)) >> 9;
    const car = 63 - full;                       // carrier attenuation in 0.75 dB steps, as Doom sets it
    const gv = v.inst.voices[v.vi];
    let mod = gv.mod.level & 63;
    if ((gv.fb & 1) && mod !== 63) mod = Math.max(mod, car); // additive voices: both operators follow volume
    v.cg = Math.pow(10, -0.75 * car / 20);
    v.mg = Math.pow(10, -0.75 * mod / 20);
  }
  noteOn(ch, note, vel) {
    if (!this.instr) return;
    let inst, playNote = note;
    if (ch === 15) { if (note < 35 || note > 81) return; inst = this.instr[128 + note - 35]; playNote = inst.fixed; }
    else { inst = this.instr[this.ch[ch].prog & 127]; if (inst.flags & 1) playNote = inst.fixed; }
    const nv = inst.flags & 4 ? 2 : 1;
    for (let vi = 0; vi < nv; vi++) {
      let v = this.voices.find((x) => !x.on && x.c.stage === 4) || this.voices.find((x) => !x.on);
      if (!v) { v = this.voices.reduce((a, b) => (a.age < b.age ? a : b)); }
      const gv = inst.voices[vi];
      v.on = true; v.age = this.clock++; v.ch = ch; v.key = note; v.note = playNote; v.vel = vel; v.inst = inst; v.vi = vi;
      v.fb = (gv.fb >> 1) & 7; v.add = (gv.fb & 1) !== 0;
      v.m.setup(gv.mod, sampleRate); v.c.setup(gv.car, sampleRate);
      v.fidx = this.freqIndex(v);
      this.volume(v);
      v.m.keyOn(); v.c.keyOn(); v.m.prev = [0, 0];
    }
  }
  noteOff(ch, note) { for (const v of this.voices) if (v.on && v.ch === ch && v.key === note) { v.on = false; v.m.keyOff(); v.c.keyOff(); } }
  event(e) {
    const [, kind, ch, a, b] = e;
    if (kind === 1) this.noteOn(ch, a, b);
    else if (kind === 0) this.noteOff(ch, a);
    else if (kind === 2) { this.ch[ch].bend = (a >> 1) - 64; for (const v of this.voices) if (v.ch === ch && v.c.stage !== 4) v.fidx = this.freqIndex(v); }
    else if (kind === 3) {
      if (a === 0) this.ch[ch].prog = b;
      else if (a === 3) { this.ch[ch].vol = b & 127; for (const v of this.voices) if (v.ch === ch && v.on) this.volume(v); }
      else if (a === 4) this.ch[ch].pan = b & 127;
    } else if (kind === 4) { for (const v of this.voices) if (v.ch === ch && v.on) { v.on = false; v.m.keyOff(); v.c.keyOff(); } }
  }
  process(_, outputs) {
    const out = outputs[0], L = out[0], R = out[1] || out[0];
    const dt = 1 / sampleRate;
    for (let i = 0; i < L.length; i++) {
      if (this.playing && this.song) {
        const ev = this.song.events;
        while (this.next < ev.length && ev[this.next][0] <= this.t) this.event(ev[this.next++]);
        this.t += dt;
        if (this.next >= ev.length && this.t >= this.song.length) {
          if (this.loop === false) this.playing = false;
          else { this.t = 0; this.next = 0; }
        }
      }
      let l = 0, r = 0;
      for (const v of this.voices) {
        if (v.c.stage === 4 && v.m.stage === 4) continue;
        const f = this.hz(v);
        const me = v.m.step(), ce = v.c.step();
        // modulator with self-feedback; full output shifts the carrier's phase by two cycles
        const fb = v.fb ? ((v.m.prev[0] + v.m.prev[1]) * 4) / (1 << (9 - v.fb)) : 0;
        v.m.ph = (v.m.ph + f * v.m.mult * dt) % 1;
        const mo = wave(v.m.w, (v.m.ph + fb + 8) % 1) * me * v.mg;
        v.m.prev[1] = v.m.prev[0]; v.m.prev[0] = mo;
        v.c.ph = (v.c.ph + f * v.c.mult * dt) % 1;
        let s;
        if (v.add) s = mo + wave(v.c.w, v.c.ph) * ce * v.cg;
        else s = wave(v.c.w, (v.c.ph + 2 * mo + 8) % 1) * ce * v.cg;
        const pan = this.ch[v.ch].pan / 127;
        l += s * Math.cos(pan * Math.PI / 2); r += s * Math.sin(pan * Math.PI / 2);
      }
      L[i] = l * this.gain * 0.3; R[i] = r * this.gain * 0.3;
    }
    return true;
  }
}
registerProcessor("opl-synth", OPLSynth);
`;

// DOOM's music lump for each map
const DOOM2_MUSIC = ["runnin", "stalks", "countd", "betwee", "doom", "the_da", "shawn", "ddtblu", "in_cit", "dead",
  "stlks2", "theda2", "doom2", "ddtbl2", "runni2", "dead2", "stlks3", "romero", "shawn2", "messag", "count2", "ddtbl3",
  "ampie", "theda3", "adrian", "messg2", "romer2", "tense", "shawn3", "openin", "evil", "ultima"];
export function musicLumpFor(mapName) {
  const e = /^E(\d)M(\d)$/.exec(mapName), m = /^MAP(\d\d)$/.exec(mapName);
  if (e) return `D_E${e[1]}M${e[2]}`;
  if (m) return "D_" + (DOOM2_MUSIC[+m[1] - 1] || "runnin").toUpperCase();
  return null;
}

export class Music {
  static async create(audio, wad) {
    const instr = parseGenmidi(wad.has("GENMIDI") ? wad.get("GENMIDI") : null);
    if (!instr || !audio.audioWorklet) return null;
    const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
    await audio.audioWorklet.addModule(url);
    const node = new AudioWorkletNode(audio, "opl-synth", { outputChannelCount: [2] });
    node.connect(audio.destination);
    node.port.postMessage({ instr });
    const m = new Music();
    m.node = node; m.wad = wad; m.current = null;
    return m;
  }
  play(lump, loop = true) {
    if (lump === this.current) return;
    this.current = lump;
    const song = lump && this.wad.has(lump) ? parseSong(this.wad.get(lump)) : null;
    this.node.port.postMessage({ song, loop });
  }
  stop() { this.play(null); }
  setVolume(v) { this.node.port.postMessage({ gain: v }); }
}
