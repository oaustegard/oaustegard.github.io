// Table sounds, synthesized with Web Audio (no sample files).
// Chips are modal: a ceramic chip striking another rings at a few inharmonic frequencies that die away
// within a tenth of a second, so each clack is four decaying sine partials plus a short click, with the
// pitch and timing varied per chip. A card is a swish of band-passed noise sweeping upward as it slides
// over the felt, ending in a soft snap. A check is a knuckle knocking twice on the padded rail. Everything
// passes through a gentle compressor and a short synthetic room reverb.

// `given` is an AudioContext to use instead of the page's own (an OfflineAudioContext, for tests).
export function createSound(given = null) {
  let ctx = null, out = null, wet = null, enabled = true, noiseBuf = null;

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!given && !AC) return null;
    ctx = given || new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
    const master = ctx.createGain(); master.gain.value = 0.9;
    comp.connect(master).connect(ctx.destination);
    out = ctx.createGain(); out.gain.value = 1; out.connect(comp);
    // Room: a 0.5 s impulse of decaying, slightly low-passed noise, mixed in quietly.
    const rev = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 0.5), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) { lp += 0.35 * ((Math.random() * 2 - 1) - lp); d[i] = lp * Math.pow(1 - i / len, 3.2); }
    }
    rev.buffer = ir;
    wet = ctx.createGain(); wet.gain.value = 0.16;
    out.connect(rev).connect(wet).connect(comp);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return ctx;
  }
  // Browsers start audio suspended until a gesture; call this from one.
  function unlock() { const c = init(); if (c && c.state === 'suspended') c.resume().catch(() => {}); }

  const rand = (a, b) => a + Math.random() * (b - a);
  function env(g, t, peak, attack, decay) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }
  function noise(t, dur, { type = 'bandpass', f0 = 2000, f1 = f0, q = 1, peak = 0.3, attack = 0.004, decay = dur } = {}) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = rand(0.9, 1.1);
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); env(g, t, peak, attack, decay);
    src.connect(f).connect(g).connect(out);
    src.start(t, Math.random() * 0.5); src.stop(t + attack + decay + 0.05);
  }
  function tone(t, freq, { peak = 0.2, attack = 0.002, decay = 0.1, type = 'sine', glide = 0 } = {}) {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t + attack + decay);
    const g = ctx.createGain(); env(g, t, peak, attack, decay);
    o.connect(g).connect(out);
    o.start(t); o.stop(t + attack + decay + 0.05);
  }

  // One ceramic clack.
  const PARTIALS = [[2400, 1, 0.075], [3790, 0.55, 0.055], [5270, 0.35, 0.04], [7480, 0.2, 0.028]];
  function clack(t, vel = 1, pitch = 1) {
    for (const [f, a, d] of PARTIALS) tone(t, f * pitch * rand(0.985, 1.015), { peak: 0.09 * a * vel, decay: d * rand(0.8, 1.2) });
    noise(t, 0.012, { type: 'highpass', f0: 3500, peak: 0.12 * vel, attack: 0.0008, decay: 0.01 });
  }
  // A few chips set down: clacks in quick, uneven succession, the last ones softer.
  function chips(t, n = 3, vel = 1) {
    let at = t;
    const pitch = rand(0.92, 1.08);
    for (let i = 0; i < n; i++) {
      clack(at, vel * (n > 1 && i === n - 1 ? 0.6 : rand(0.8, 1)), pitch * rand(0.97, 1.03));
      at += rand(0.028, 0.07);
    }
  }
  // A card sliding across the felt, ending with a snap.
  function card(t, vel = 1) {
    noise(t, 0.09, { f0: 1400, f1: 4800, q: 0.8, peak: 0.22 * vel, attack: 0.006, decay: 0.085 });
    noise(t + 0.085, 0.02, { type: 'highpass', f0: 2500, peak: 0.07 * vel, attack: 0.001, decay: 0.018 });
  }
  function knock(t, vel = 1) {
    tone(t, 150, { peak: 0.3 * vel, attack: 0.002, decay: 0.09, glide: 0.5 });
    noise(t, 0.04, { type: 'lowpass', f0: 900, peak: 0.22 * vel, attack: 0.001, decay: 0.035 });
  }

  const sounds = {
    chips(n = 3) { const t = ctx.currentTime + 0.01; chips(t, Math.max(1, Math.min(7, n))); },
    deal(n = 1) { const t = ctx.currentTime + 0.01; for (let i = 0; i < Math.min(n, 8); i++) card(t + i * 0.085, rand(0.8, 1)); },
    check() { const t = ctx.currentTime + 0.01; knock(t, 1); knock(t + 0.13, 0.75); },
    fold() {
      const t = ctx.currentTime + 0.01;
      noise(t, 0.16, { type: 'lowpass', f0: 2600, f1: 1000, q: 0.7, peak: 0.4, attack: 0.01, decay: 0.15 });
      noise(t + 0.15, 0.03, { type: 'lowpass', f0: 1500, peak: 0.2, attack: 0.002, decay: 0.03 });
    },
    // The pot pushed across: a long cascade of chips over a soft rustle of felt.
    win(big = false) {
      const t = ctx.currentTime + 0.02, n = big ? 16 : 10;
      noise(t, 0.6, { f0: 1800, f1: 1200, q: 0.6, peak: 0.05, attack: 0.08, decay: 0.5 });
      let at = t;
      for (let i = 0; i < n; i++) { clack(at, rand(0.5, 1) * (1 - i / (n * 1.6)), rand(0.9, 1.1)); at += rand(0.02, 0.06); }
    },
    // Your turn: a quiet two-note bell.
    turn() {
      const t = ctx.currentTime + 0.01;
      for (const [f, at] of [[1046.5, 0], [1568, 0.11]]) {
        tone(t + at, f, { peak: 0.05, attack: 0.004, decay: 0.7 });
        tone(t + at, f * 2.76, { peak: 0.012, attack: 0.002, decay: 0.25 });
      }
    },
  };

  return {
    unlock,
    get enabled() { return enabled; },
    set enabled(v) { enabled = !!v; },
    play(kind, arg) {
      if (!enabled || !sounds[kind]) return;
      try { if (!init()) return; if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {}); sounds[kind](arg); } catch {}
    },
  };
}
