// Table sounds, synthesized with Web Audio (no sample files), kept soft: a card room is a quiet place.
// Chips are clay, not glass: a clack is three decaying partials centred near 1.6 kHz with a rounded tick,
// a few chips per bet at most. A card is a low swish of band-passed noise. A check is a muted double tap.
// Your turn is a soft marimba-like pair of notes. Each sound can be panned toward the seat it comes from.
// The mix runs through a low-pass at 5 kHz, a high shelf, a gentle compressor and a little room reverb;
// `volume` scales all of it.

// `given` is an AudioContext to use instead of the page's own (an OfflineAudioContext, for tests).
export function createSound(given = null) {
  let ctx = null, bus = null, master = null, noiseBuf = null, volume = 1;

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!given && !AC) return null;
    ctx = given || new AC();
    master = ctx.createGain(); master.gain.value = 1.6 * volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -24; comp.knee.value = 18; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.25;
    const tame = ctx.createBiquadFilter(); tame.type = 'lowpass'; tame.frequency.value = 5000; tame.Q.value = 0.5;
    const shelf = ctx.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 3000; shelf.gain.value = -6;
    tame.connect(shelf).connect(comp).connect(master).connect(ctx.destination);
    bus = ctx.createGain(); bus.connect(tame);
    // Room: a 0.4 s impulse of decaying, low-passed noise, mixed in quietly.
    const rev = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 0.4), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) { lp += 0.2 * ((Math.random() * 2 - 1) - lp); d[i] = lp * Math.pow(1 - i / len, 3); }
    }
    rev.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.14;
    bus.connect(rev).connect(wet).connect(tame);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return ctx;
  }
  // Browsers start audio suspended until a gesture; call this from one.
  function unlock() { const c = init(); if (c && c.state === 'suspended') c.resume().catch(() => {}); }

  const rand = (a, b) => a + Math.random() * (b - a);
  // Each sound goes through a panner, so it comes from the side of the table where it happened.
  function voice(pan = 0) {
    const g = ctx.createGain();
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-0.8, Math.min(0.8, pan)); g.connect(p).connect(bus); }
    else g.connect(bus);
    return g;
  }
  function env(g, t, peak, attack, decay) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }
  function noise(dest, t, dur, { type = 'bandpass', f0 = 1200, f1 = f0, q = 0.8, peak = 0.2, attack = 0.006, decay = dur } = {}) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); env(g, t, peak, attack, decay);
    src.connect(f).connect(g).connect(dest);
    src.start(t, Math.random() * 0.5); src.stop(t + attack + decay + 0.05);
  }
  function tone(dest, t, freq, { peak = 0.1, attack = 0.003, decay = 0.1 } = {}) {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain(); env(g, t, peak, attack, decay);
    o.connect(g).connect(dest);
    o.start(t); o.stop(t + attack + decay + 0.05);
  }

  // One clay chip on another: a short, warm clack.
  const PARTIALS = [[1550, 1, 0.05], [2420, 0.4, 0.035], [3350, 0.15, 0.022]];
  function clack(dest, t, vel = 1, pitch = 1) {
    for (const [f, a, d] of PARTIALS) tone(dest, t, f * pitch * rand(0.98, 1.02), { peak: 0.07 * a * vel, attack: 0.0015, decay: d * rand(0.85, 1.15) });
    noise(dest, t, 0.01, { type: 'lowpass', f0: 2500, peak: 0.06 * vel, attack: 0.001, decay: 0.008 });
  }
  function chips(dest, t, n, vel) {
    let at = t;
    const pitch = rand(0.94, 1.06);
    for (let i = 0; i < n; i++) { clack(dest, at, vel * (n > 1 && i === n - 1 ? 0.65 : rand(0.8, 1)), pitch * rand(0.98, 1.02)); at += rand(0.045, 0.085); }
  }
  // A card sliding on felt: low and short.
  function card(dest, t, vel = 1) {
    noise(dest, t, 0.08, { f0: 800, f1: 2000, q: 0.7, peak: 0.3 * vel, attack: 0.01, decay: 0.07 });
  }
  function tap(dest, t, vel = 1) {
    // 220 Hz rather than a true thump, so a phone speaker can play it.
    tone(dest, t, 220, { peak: 0.1 * vel, attack: 0.004, decay: 0.06 });
    noise(dest, t, 0.03, { type: 'lowpass', f0: 900, peak: 0.1 * vel, attack: 0.002, decay: 0.03 });
  }

  // opts.pan: -1 (left) .. 1 (right); opts.vel: loudness 0..1 (quieter for other players' small actions).
  const sounds = {
    chips(n = 2, { pan = 0, vel = 1 } = {}) { chips(voice(pan), ctx.currentTime + 0.01, Math.max(1, Math.min(4, n)), vel); },
    deal(n = 1, { pan = 0, vel = 1 } = {}) { const v = voice(pan), t = ctx.currentTime + 0.01; for (let i = 0; i < Math.min(n, 3); i++) card(v, t + i * 0.11, vel * rand(0.8, 1)); },
    check({ pan = 0, vel = 1 } = {}) { const v = voice(pan), t = ctx.currentTime + 0.01; tap(v, t, vel); tap(v, t + 0.14, vel * 0.7); },
    fold({ pan = 0, vel = 1 } = {}) { noise(voice(pan), ctx.currentTime + 0.01, 0.14, { type: 'lowpass', f0: 1400, f1: 600, peak: 0.12 * vel, attack: 0.015, decay: 0.12 }); },
    // The pot pushed to you: a soft run of chips.
    win(big = false) {
      const v = voice(0), t = ctx.currentTime + 0.02, n = big ? 9 : 6;
      let at = t;
      for (let i = 0; i < n; i++) { clack(v, at, rand(0.5, 0.85) * (1 - i / (n * 1.8)), rand(0.94, 1.06)); at += rand(0.05, 0.09); }
    },
    // Your turn: two soft notes a fifth apart, like a marimba.
    turn() {
      const v = voice(0), t = ctx.currentTime + 0.01;
      for (const [f, at] of [[523.25, 0], [784, 0.13]]) {
        tone(v, t + at, f, { peak: 0.06, attack: 0.008, decay: 0.45 });
        tone(v, t + at, f * 4, { peak: 0.008, attack: 0.004, decay: 0.08 });
      }
    },
  };

  return {
    unlock,
    get volume() { return volume; },
    // 0 is off, 1 is normal.
    set volume(v) { volume = Math.max(0, v); if (master) master.gain.value = 1.6 * volume; },
    play(kind, ...args) {
      if (!volume || !sounds[kind]) return;
      try { if (!init()) return; if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {}); sounds[kind](...args); } catch {}
    },
  };
}
