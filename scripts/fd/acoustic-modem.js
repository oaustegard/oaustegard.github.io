/* Acoustic modem core v2: pure functions only. No DOM, no Web Audio, no I/O.
   Scheme: 16-MFSK, phase-continuous, pilot + 8-symbol sync + versioned frame.
   Each tone is one GF(16) symbol (4 bits). Forward error correction is
   Reed-Solomon RS(15,11) over GF(16): every 11 data nibbles carry 4 parity
   nibbles, correcting 2 symbol errors OR up to 4 erasures per 15-symbol block
   (2*errors + erasures <= 4). The demodulator flags low-confidence symbols as
   erasures from the Goertzel energy spread, which the RS layer corrects at
   twice the rate of unknown errors. A CRC-16/CCITT over the payload is the
   final integrity gate after correction. Band is 4.0-6.8 kHz, above most
   voice/room noise while staying where consumer transducers still respond. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (root) { root.AcousticModem = api; }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var CFG = {
    version: 3,                 /* frame format v3: header carries chord mode */
    f0: 4500.0,                 /* first tone, Hz (band nudged up ~500 Hz) */
    df: 187.5,                  /* tone spacing, Hz (4x symbol rate: orthogonal) */
    toneCount: 16,              /* 16 tones in the band */
    symbolSec: 1.0 / 46.875,    /* 21.333 ms per symbol */
    analysisFrac: 0.75,         /* fraction of the symbol analyzed (edge guard) */
    rampSec: 0.004,             /* raised-cosine edge per symbol */
    pilotFreq: 4000.0,          /* just below the data band */
    pilotSec: 0.25,
    gapSec: 0.06,
    tailSec: 0.05,
    sync: [2, 7, 13, 0, 11, 5, 9, 14],  /* single-tone sync, mode-independent */
    amplitude: 0.8,
    maxPayload: 1024,
    eraseRatio: 1.7,            /* weakest-on / strongest-off ratio below which -> erasure */
    rsN: 15, rsK: 11, rsNsym: 4,/* RS(15,11), 4 parity, corrects t=2 per block */
    chordK: 4                   /* SEND mode: 4-tone chords -> GF(1024), 10 bits/symbol */
  };
  /* chord modes: k tones -> C(16,k) chords -> truncated to 2^bits for a clean
     GF(2^bits) so RS(15,11) runs over the field unchanged (one chord = one
     field symbol; a misdetected chord is exactly one correctable symbol). */
  var MODES = {
    1: { k: 1, bits: 4,  prim: 0x13 },     /* GF(16)   */
    2: { k: 2, bits: 6,  prim: 0x43 },     /* GF(64)   */
    4: { k: 4, bits: 10, prim: 0x409 },    /* GF(1024) */
    8: { k: 8, bits: 13, prim: 0x201B }    /* GF(8192) */
  };

  /* ===================================================================== GF */
  function makeGF(m, prim) {
    var size = 1 << m, fc = size - 1;
    var exp = new Int32Array(2 * fc), log = new Int32Array(size).fill(-1);
    var x = 1, i;
    for (i = 0; i < fc; i++) { exp[i] = x; log[x] = i; x <<= 1; if (x & size) { x ^= prim; } }
    for (i = fc; i < 2 * fc; i++) { exp[i] = exp[i - fc]; }
    return {
      m: m, size: size, fc: fc, exp: exp, log: log,
      mul: function (a, b) { return (a === 0 || b === 0) ? 0 : exp[log[a] + log[b]]; },
      div: function (a, b) { return a === 0 ? 0 : exp[((log[a] - log[b]) % fc + fc) % fc]; },
      inv: function (a) { return exp[(fc - log[a]) % fc]; },
      pow: function (a, p) { if (a === 0) { return 0; } var e = ((log[a] * p) % fc + fc) % fc; return exp[e]; }
    };
  }
  var FIELDS = {};
  (function () { for (var kk in MODES) { var M2 = MODES[kk]; FIELDS[kk] = makeGF(M2.bits, M2.prim); } })();

  /* ----------------------------------------------------- poly + RS over a GF */
  function makeRS(gf) {
    var nsym = CFG.rsNsym;
    function scale(p, x) { var r = new Array(p.length), i; for (i = 0; i < p.length; i++) { r[i] = gf.mul(p[i], x); } return r; }
    function padd(p, q) {
      var n = Math.max(p.length, q.length), r = new Array(n).fill(0), i;
      for (i = 0; i < p.length; i++) { r[i + n - p.length] = p[i]; }
      for (i = 0; i < q.length; i++) { r[i + n - q.length] ^= q[i]; }
      return r;
    }
    function pmul(p, q) {
      var r = new Array(p.length + q.length - 1).fill(0), i, j;
      for (j = 0; j < q.length; j++) { for (i = 0; i < p.length; i++) { r[i + j] ^= gf.mul(p[i], q[j]); } }
      return r;
    }
    function peval(p, x) { var y = p[0], i; for (i = 1; i < p.length; i++) { y = gf.mul(y, x) ^ p[i]; } return y; }
    var GEN = (function () { var g = [1], i; for (i = 0; i < nsym; i++) { g = pmul(g, [1, gf.pow(2, i)]); } return g; })();
    function encode(msg) {
      var out = msg.concat(new Array(nsym).fill(0)), i, j;
      for (i = 0; i < msg.length; i++) { var c = out[i]; if (c !== 0) { for (j = 1; j < GEN.length; j++) { out[i + j] ^= gf.mul(GEN[j], c); } } }
      return msg.concat(out.slice(msg.length));
    }
    function calcSynd(msg) { var s = [0], i; for (i = 0; i < nsym; i++) { s.push(peval(msg, gf.pow(2, i))); } return s; }
    function forney(synd, pos, nmess) {
      var f = synd.slice(1), i, j;
      for (i = 0; i < pos.length; i++) { var x = gf.pow(2, nmess - 1 - pos[i]); for (j = 0; j < f.length - 1; j++) { f[j] = gf.mul(f[j], x) ^ f[j + 1]; } }
      return f;
    }
    function errLocator(synd, eraseCount) {
      var eL = [1], oL = [1], i, j;
      var shift = (synd.length > nsym) ? (synd.length - nsym) : 0;
      for (i = 0; i < nsym - eraseCount; i++) {
        var Ki = i + shift, delta = synd[Ki];
        for (j = 1; j < eL.length; j++) { delta ^= gf.mul(eL[eL.length - 1 - j], synd[Ki - j]); }
        oL = oL.concat([0]);
        if (delta !== 0) {
          if (oL.length > eL.length) { var nL = scale(oL, delta); oL = scale(eL, gf.inv(delta)); eL = nL; }
          eL = padd(eL, scale(oL, delta));
        }
      }
      while (eL.length && eL[0] === 0) { eL.shift(); }
      var errs = eL.length - 1;
      if ((errs - eraseCount) * 2 + eraseCount > nsym) { return null; }
      return eL;
    }
    function findErrs(eLrev, nmess) {
      var errs = eLrev.length - 1, pos = [], i;
      for (i = 0; i < nmess; i++) { if (peval(eLrev, gf.pow(2, i)) === 0) { pos.push(nmess - 1 - i); } }
      return (pos.length !== errs) ? null : pos;
    }
    function errataLoc(coefPos) { var e = [1], i; for (i = 0; i < coefPos.length; i++) { e = pmul(e, padd([1], [gf.pow(2, coefPos[i]), 0])); } return e; }
    function errEval(synd, eL) { var r = pmul(synd, eL); return r.slice(r.length - (nsym + 1)); }
    function correct(recv, erasePos) {
      var msg = recv.slice(), ep = (erasePos || []).slice(), i;
      if (ep.length > nsym) { return null; }
      for (i = 0; i < ep.length; i++) { msg[ep[i]] = 0; }
      var synd = calcSynd(msg), maxS = 0; for (i = 0; i < synd.length; i++) { if (synd[i] > maxS) { maxS = synd[i]; } }
      if (maxS === 0) { return msg; }
      var f = forney(synd, ep, msg.length);
      var eL = errLocator(f, ep.length); if (!eL) { return null; }
      var epos = findErrs(eL.slice().reverse(), msg.length); if (!epos) { return null; }
      var allPos = ep.concat(epos);
      var coefPos = allPos.map(function (p) { return msg.length - 1 - p; });
      var eLoc = errataLoc(coefPos);
      var syndRev = synd.slice().reverse();
      var ev = errEval(syndRev, eLoc).reverse();
      var X = [], j; for (i = 0; i < coefPos.length; i++) { X.push(gf.pow(2, coefPos[i])); }
      var E = new Array(msg.length).fill(0);
      for (i = 0; i < X.length; i++) {
        var Xi = X[i], XiInv = gf.inv(Xi), prime = 1;
        for (j = 0; j < X.length; j++) { if (j !== i) { prime = gf.mul(prime, 1 ^ gf.mul(XiInv, X[j])); } }
        var y = peval(ev.slice().reverse(), XiInv); y = gf.mul(Xi, y);
        if (prime === 0) { return null; }
        E[allPos[i]] = gf.div(y, prime);
      }
      var corrected = padd(msg, E);
      var chk = calcSynd(corrected), maxC = 0; for (i = 0; i < chk.length; i++) { if (chk[i] > maxC) { maxC = chk[i]; } }
      return (maxC > 0) ? null : corrected;
    }
    return { encode: encode, correct: correct };
  }
  var RS = {}; (function () { for (var kk in FIELDS) { RS[kk] = makeRS(FIELDS[kk]); } })();

  /* --------------------------------------------------------- combinadic k-of-16 */
  var CH = (function () { var c = [], i, j; for (i = 0; i <= 16; i++) { c[i] = [1]; for (j = 1; j <= i; j++) { c[i][j] = (c[i - 1][j - 1] || 0) + (c[i - 1][j] || 0); } } return c; })();
  function choose(n, k) { if (k < 0 || k > n) { return 0; } return CH[n][k]; }
  function unrankComb(v, n, k) {
    var res = [], x = 0, r = v, i, c;
    for (i = 0; i < k; i++) { for (;;) { c = choose(n - 1 - x, k - 1 - i); if (r < c) { res.push(x); x++; break; } r -= c; x++; } }
    return res;
  }
  function rankComb(comb, n, k) {
    var r = 0, x = 0, i;
    for (i = 0; i < k; i++) { for (; x < comb[i]; x++) { r += choose(n - 1 - x, k - 1 - i); } x++; }
    return r;
  }

  /* --------------------------------------------------- bit pack bytes<->m-sym */
  function packBits(bytes, m) {
    var out = [], acc = 0, nb = 0, i, mask = (1 << m) - 1;
    for (i = 0; i < bytes.length; i++) {
      acc = ((acc << 8) | bytes[i]); nb += 8;
      while (nb >= m) { nb -= m; out.push((acc >>> nb) & mask); }
      acc &= (nb > 0 ? ((1 << nb) - 1) : 0);
    }
    if (nb > 0) { out.push((acc & ((1 << nb) - 1)) << (m - nb)); }
    return out;
  }
  function unpackBits(syms, m, nbytes) {
    var out = [], acc = 0, nb = 0, i;
    for (i = 0; i < syms.length && out.length < nbytes; i++) {
      acc = ((acc << m) | syms[i]); nb += m;
      while (nb >= 8 && out.length < nbytes) { nb -= 8; out.push((acc >>> nb) & 0xFF); }
      acc &= (nb > 0 ? ((1 << nb) - 1) : 0);
    }
    return out;
  }

  /* ------------------------------------------------------------- CRC-16 */
  function crc16(bytes) {
    var crc = 0xFFFF, i, b;
    for (i = 0; i < bytes.length; i++) {
      crc ^= bytes[i] << 8;
      for (b = 0; b < 8; b++) { crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1); crc &= 0xFFFF; }
    }
    return crc;
  }

  /* -------------------- header (always k=1 / GF16): version, mode, length -- */
  function headerNibbles(k, len) {
    return [CFG.version, k & 0xF, (len >> 12) & 0xF, (len >> 8) & 0xF, (len >> 4) & 0xF, len & 0xF];
  }
  function rsEncodeBlockGF16(dataSyms) {   /* pad to rsK, RS(15,11) over GF16 */
    var padded = dataSyms.slice();
    while (padded.length % CFG.rsK !== 0) { padded.push(0); }
    var out = [], i, j;
    for (i = 0; i < padded.length; i += CFG.rsK) { var cw = RS[1].encode(padded.slice(i, i + CFG.rsK)); for (j = 0; j < cw.length; j++) { out.push(cw[j]); } }
    return out;
  }

  /* mode-aware frame sizing */
  function payloadSymCount(len, k) {
    var m = MODES[k].bits, bits = (len + 2) * 8;   /* payload + 2 CRC bytes */
    return Math.ceil(bits / m);
  }
  function payloadBlockCount(len) {
    return Math.ceil(payloadSymCount(len, CFG.chordK) / CFG.rsK);
  }
  function payloadBlockCountK(len, k) {
    return Math.ceil(payloadSymCount(len, k) / CFG.rsK);
  }
  function frameSymbolCountK(len, k) {
    return CFG.sync.length + CFG.rsN + payloadBlockCountK(len, k) * CFG.rsN;
  }
  function frameSymbolCount(len) { return frameSymbolCountK(len, CFG.chordK); }
  function estimateSeconds(len) {
    return CFG.pilotSec + CFG.gapSec + frameSymbolCount(len) * CFG.symbolSec + CFG.tailSec;
  }

  /* -------------------- build the transmit chord sequence (tones per symbol) */
  function bytesToChords(bytes, k) {
    if (bytes.length < 1 || bytes.length > CFG.maxPayload) { throw new Error("payload must be 1.." + CFG.maxPayload + " bytes"); }
    var m = MODES[k].bits, maxSym = 1 << m;
    var chords = [], i, j;
    /* sync: single tones */
    for (i = 0; i < CFG.sync.length; i++) { chords.push([CFG.sync[i]]); }
    /* header block: GF16 single tones */
    var hdr = rsEncodeBlockGF16(headerNibbles(k, bytes.length));
    for (i = 0; i < hdr.length; i++) { chords.push([hdr[i]]); }
    /* payload: bytes + CRC -> m-bit symbols -> RS(15,11) over GF(2^m) -> chords */
    var c = crc16(bytes);
    var dataBytes = Array.prototype.slice.call(bytes).concat([(c >> 8) & 0xFF, c & 0xFF]);
    var syms = packBits(dataBytes, m);
    while (syms.length % CFG.rsK !== 0) { syms.push(0); }
    var coded = [];
    for (i = 0; i < syms.length; i += CFG.rsK) { var cw = RS[k].encode(syms.slice(i, i + CFG.rsK)); for (j = 0; j < cw.length; j++) { coded.push(cw[j]); } }
    for (i = 0; i < coded.length; i++) {
      var v = coded[i] % maxSym;                 /* guard (encoder never exceeds) */
      chords.push(unrankComb(v, CFG.toneCount, k));
    }
    return chords;
  }
  /* k=1 flat-symbol helper kept for the invariant suite */
  function bytesToSymbols(bytes) {
    return bytesToChords(bytes, 1).map(function (ch) { return ch[0]; });
  }

  /* ------------------------------------------------- chords -> PCM */
  function toneFreq(t) { return CFG.f0 + t * CFG.df; }
  function synthesize(chords, sampleRate) {
    var sr = sampleRate;
    var symF = CFG.symbolSec * sr;
    var pilotN = Math.round(CFG.pilotSec * sr);
    var gapN = Math.round(CFG.gapSec * sr);
    var tailN = Math.round(CFG.tailSec * sr);
    var dataN = Math.round(chords.length * symF);
    var total = pilotN + gapN + dataN + tailN;
    var pcm = new Float32Array(total);
    var twoPi = Math.PI * 2;
    var rampN = Math.max(1, Math.round(CFG.rampSec * sr));
    var i, n, j, phase = 0;

    var pf = twoPi * CFG.pilotFreq / sr;
    for (n = 0; n < pilotN; n++) {
      var env = 1.0;
      if (n < rampN) { env = 0.5 - 0.5 * Math.cos(Math.PI * n / rampN); }
      if (pilotN - n < rampN) { env = Math.min(env, 0.5 - 0.5 * Math.cos(Math.PI * (pilotN - n) / rampN)); }
      pcm[n] = CFG.amplitude * env * Math.sin(phase);
      phase += pf;
    }

    var base = pilotN + gapN;
    for (i = 0; i < chords.length; i++) {
      var tones = chords[i], perTone = CFG.amplitude / tones.length;
      var s0 = Math.round(i * symF), s1 = Math.round((i + 1) * symF), segN = s1 - s0;
      for (j = 0; j < tones.length; j++) {
        var inc = twoPi * toneFreq(tones[j]) / sr, ph = 0;
        for (n = 0; n < segN; n++) {
          var e = 1.0;
          if (n < rampN) { e = 0.5 - 0.5 * Math.cos(Math.PI * n / rampN); }
          if (segN - n <= rampN) { e = Math.min(e, 0.5 - 0.5 * Math.cos(Math.PI * (segN - n) / rampN)); }
          pcm[base + s0 + n] += perTone * e * Math.sin(ph);
          ph += inc;
        }
      }
    }
    return pcm;
  }
  function encodeToPcm(bytes, sampleRate) { return synthesize(bytesToChords(bytes, CFG.chordK), sampleRate); }

  /* ---------------------------------------------------------- Goertzel */
  function goertzelPower(buf, len, freq, sr) {
    var w = 2 * Math.PI * freq / sr, coeff = 2 * Math.cos(w);
    var s1 = 0, s2 = 0, s0, i;
    for (i = 0; i < len; i++) { s0 = buf[i] + coeff * s1 - s2; s2 = s1; s1 = s0; }
    return s1 * s1 + s2 * s2 - coeff * s1 * s2;
  }
  function makeHann(n) { var w = new Float32Array(n), i; for (i = 0; i < n; i++) { w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1)); } return w; }

  /* --------------------------- shared decode context (DSP + acquisition) */
  function mkCtx(pcm, sampleRate, opts) {
    opts = opts || {};
    var sr = sampleRate;
    var symF = CFG.symbolSec * sr;
    var symbolN = Math.round(symF);
    var hop = Math.max(1, symbolN >> 2);
    var anaN = Math.max(8, Math.round(symF * CFG.analysisFrac));
    var half = anaN >> 1;
    var minStart = Math.max(0, opts.minStart | 0);
    var K = CFG.toneCount;
    var freqs = new Float64Array(K), k;
    for (k = 0; k < K; k++) { freqs[k] = toneFreq(k); }
    var hann = makeHann(anaN);
    var scratch = new Float32Array(anaN);
    var energies = new Float64Array(K);

    function toneEnergiesAt(center) {
      var start = center - half, a, t;
      if (start < 0 || start + anaN > pcm.length) { return null; }
      for (a = 0; a < anaN; a++) { scratch[a] = pcm[start + a] * hann[a]; }
      for (t = 0; t < K; t++) { energies[t] = goertzelPower(scratch, anaN, freqs[t], sr); }
      return energies;
    }
    function argmax(arr) { var bi = 0, bv = -Infinity, j; for (j = 0; j < arr.length; j++) { if (arr[j] > bv) { bv = arr[j]; bi = j; } } return bi; }
    /* k=1 soft symbol (top1/top2) — used for sync + header */
    function softAt(startSample, index) {
      var center = startSample + Math.round((index + 0.5) * symF);
      var e = toneEnergiesAt(center);
      if (!e) { return null; }
      var b1 = 0, v1 = -Infinity, b2 = 0, v2 = -Infinity, j;
      for (j = 0; j < K; j++) {
        if (e[j] > v1) { v2 = v1; b2 = b1; v1 = e[j]; b1 = j; }
        else if (e[j] > v2) { v2 = e[j]; b2 = j; }
      }
      var ratio = (v2 > 0) ? (v1 / v2) : Infinity;
      return { tone: b1, ratio: ratio };
    }
    /* top-k chord symbol over GF(2^bits) — used for payload */
    function chordAt(startSample, index, kk) {
      var center = startSample + Math.round((index + 0.5) * symF);
      var e = toneEnergiesAt(center);
      if (!e) { return null; }
      var idx = [], j; for (j = 0; j < K; j++) { idx.push(j); }
      idx.sort(function (a, b) { return e[b] - e[a]; });
      var comb = idx.slice(0, kk).sort(function (a, b) { return a - b; });
      var v = rankComb(comb, K, kk);
      var maxSym = 1 << MODES[kk].bits;
      var kth = e[idx[kk - 1]], kp1 = e[idx[kk]];
      var ratio = (kp1 > 0) ? (kth / kp1) : Infinity;
      var erased = (v >= maxSym) || (ratio < CFG.eraseRatio);
      return { sym: (v >= maxSym) ? 0 : v, tones: comb, ratio: ratio, erased: erased };
    }
    /* header: 15 GF16 single-tone symbols */
    function readHeaderBlock(startSample, idx) {
      var syms = new Array(CFG.rsN), cand = [], j;
      for (j = 0; j < CFG.rsN; j++) {
        var s = softAt(startSample, idx + j);
        if (!s) { return null; }
        syms[j] = s.tone;
        if (s.ratio < CFG.eraseRatio) { cand.push({ pos: j, ratio: s.ratio }); }
      }
      cand.sort(function (a, b) { return a.ratio - b.ratio; });
      var erase = cand.slice(0, CFG.rsNsym).map(function (c) { return c.pos; });
      var corr = RS[1].correct(syms, erase);
      if (!corr) { corr = RS[1].correct(syms, []); }
      if (!corr) { return null; }
      return corr.slice(0, CFG.rsK);
    }
    /* payload: 15 GF(2^bits) chord symbols in mode kk */
    function readPayloadBlock(startSample, idx, kk) {
      var syms = new Array(CFG.rsN), cand = [], j;
      for (j = 0; j < CFG.rsN; j++) {
        var s = chordAt(startSample, idx + j, kk);
        if (!s) { return null; }
        syms[j] = s.sym;
        if (s.erased) { cand.push({ pos: j, ratio: s.ratio }); }
      }
      cand.sort(function (a, b) { return a.ratio - b.ratio; });
      var erase = cand.slice(0, CFG.rsNsym).map(function (c) { return c.pos; });
      var corr = RS[kk].correct(syms, erase);
      if (!corr) { corr = RS[kk].correct(syms, []); }
      if (!corr) { return null; }
      return corr.slice(0, CFG.rsK);
    }
    function symbolPresent(s0, index) {
      var center = s0 + Math.round((index + 0.5) * symF);
      return (center - half >= 0) && (center + (anaN - half) <= pcm.length);
    }
    function acquire() {
      var H = Math.max(0, Math.floor((pcm.length - anaN) / hop));
      var dom = new Int8Array(H).fill(-1);
      var domE = new Float64Array(H), h, kk;
      for (h = 0; h < H; h++) {
        var c = h * hop + half;
        var e = toneEnergiesAt(c);
        if (!e) { continue; }
        var bi = argmax(e); dom[h] = bi; domE[h] = e[bi];
      }
      var S = CFG.sync;
      var syncOffHops = new Int32Array(S.length);
      for (kk = 0; kk < S.length; kk++) { syncOffHops[kk] = Math.round(((kk + 0.5) * symF - half) / hop); }
      var candidates = [];
      var h0min = Math.floor(minStart / hop);
      for (h = h0min; h < H; h++) {
        var score = 0, esum = 0, valid = true;
        for (kk = 0; kk < S.length; kk++) {
          var hi = h + syncOffHops[kk];
          if (hi < 0 || hi >= H || dom[hi] < 0) { valid = false; break; }
          if (dom[hi] === S[kk]) { score++; }
          esum += domE[hi];
        }
        if (valid && score >= S.length - 1) { candidates.push({ h: h, score: score, esum: esum }); }
      }
      if (candidates.length === 0) { return []; }
      candidates.sort(function (a, b) { return (b.score - a.score) || (b.esum - a.esum); });
      var picked = [], i, jj;
      for (i = 0; i < candidates.length && picked.length < 6; i++) {
        var dup = false;
        for (jj = 0; jj < picked.length; jj++) {
          if (Math.abs(candidates[i].h - picked[jj].h) * hop < symbolN) { dup = true; break; }
        }
        if (!dup) { picked.push(candidates[i]); }
      }
      function syncQuality(startSample) {
        var q = 0, k2;
        for (k2 = 0; k2 < S.length; k2++) {
          var center = startSample + Math.round((k2 + 0.5) * symF);
          var e = toneEnergiesAt(center);
          if (!e) { return -1; }
          var tot = 1e-12, t;
          for (t = 0; t < K; t++) { tot += e[t]; }
          q += e[S[k2]] / tot;
        }
        return q;
      }
      var out = [];
      for (i = 0; i < picked.length; i++) {
        var coarse = picked[i].h * hop;
        var bestOff = 0, bestQ = -1, off;
        var step = Math.max(1, hop >> 2);
        for (off = -hop; off <= hop; off += step) { var q = syncQuality(coarse + off); if (q > bestQ) { bestQ = q; bestOff = off; } }
        out.push({ s0: coarse + bestOff, score: picked[i].score });
      }
      return out;
    }

    return {
      symF: symF, softAt: softAt, chordAt: chordAt,
      readHeaderBlock: readHeaderBlock, readPayloadBlock: readPayloadBlock,
      acquire: acquire, symbolPresent: symbolPresent
    };
  }

  /* --------- utf-8 helper (partial-safe for the live view) --------- */
  var _dec = (typeof TextDecoder !== "undefined") ? new TextDecoder("utf-8") : null;
  function utf8Partial(bytes) {
    if (_dec) { try { return _dec.decode(bytes); } catch (e) { return ""; } }
    var s = "", i; for (i = 0; i < bytes.length; i++) { s += String.fromCharCode(bytes[i]); } return s;
  }

  /* parse a header block -> {k, len} or null */
  function parseHeader(hdr) {
    if (!hdr || hdr[0] !== CFG.version) { return null; }
    var k = hdr[1];
    if (!MODES[k]) { return null; }
    var len = (hdr[2] << 12) | (hdr[3] << 8) | (hdr[4] << 4) | hdr[5];
    if (len < 1 || len > CFG.maxPayload) { return null; }
    return { k: k, len: len };
  }
  /* coded payload symbols -> payload bytes (or null on CRC fail) */
  function payloadToBytes(dataSyms, k, len) {
    var m = MODES[k].bits;
    var bytesOut = unpackBits(dataSyms, m, len + 2);
    if (bytesOut.length < len + 2) { return null; }
    var payload = bytesOut.slice(0, len);
    var rxCrc = (bytesOut[len] << 8) | bytesOut[len + 1];
    if (rxCrc !== crc16(payload)) { return null; }
    return new Uint8Array(payload);
  }

  /* ------------------------------------------------------------ decode */
  function decodeFromPcm(pcm, sampleRate, opts) {
    var ctx = mkCtx(pcm, sampleRate, opts);
    var picks = ctx.acquire();
    if (!picks.length) { return { ok: false, reason: "nosync" }; }
    var S = CFG.sync, i;
    var sawCrc = false, crcStart = -1, crcScore = 0;
    for (i = 0; i < picks.length; i++) {
      var s0 = picks[i].s0;
      var hdr = ctx.readHeaderBlock(s0, S.length);
      var ph = parseHeader(hdr);
      if (!ph) { continue; }
      var k = ph.k, len = ph.len;
      var nb = payloadBlockCountK(len, k);
      var totalSyms = frameSymbolCountK(len, k);
      if (!ctx.symbolPresent(s0, totalSyms - 1)) { continue; }
      var dataSyms = [], bad = false, bIdx = S.length + CFG.rsN, blk;
      for (blk = 0; blk < nb; blk++) {
        var data = ctx.readPayloadBlock(s0, bIdx + blk * CFG.rsN, k);
        if (!data) { bad = true; break; }
        dataSyms = dataSyms.concat(data);
      }
      if (bad) { continue; }
      var bytes = payloadToBytes(dataSyms, k, len);
      if (!bytes) { if (!sawCrc) { sawCrc = true; crcStart = s0; crcScore = picks[i].score; } continue; }
      return { ok: true, bytes: bytes, chordK: k, startSample: s0, endSample: s0 + Math.round(totalSyms * ctx.symF), syncScore: picks[i].score, reason: "ok" };
    }
    if (sawCrc) { return { ok: false, reason: "crc", startSample: crcStart, syncScore: crcScore }; }
    return { ok: false, reason: "noframe" };
  }

  /* ------------------------------- streaming progress (live view only) */
  function decodeProgress(pcm, sampleRate, opts) {
    var ctx = mkCtx(pcm, sampleRate, opts);
    var picks = ctx.acquire();
    var empty = { state: "nosync", symbols: [], nibbles: [], text: "", blocksDone: 0, blocks: 0 };
    if (!picks.length) { return empty; }
    var S = CFG.sync, hdrIdx = S.length, payIdx = S.length + CFG.rsN, i;
    for (i = 0; i < picks.length; i++) {
      var s0 = picks[i].s0;
      if (!ctx.symbolPresent(s0, payIdx - 1)) {
        if (i === picks.length - 1) { return { state: "locked", startSample: s0, syncScore: picks[i].score, symbols: [], nibbles: [], text: "", blocksDone: 0, blocks: 0 }; }
        continue;
      }
      var hdr = ctx.readHeaderBlock(s0, hdrIdx);
      var ph = parseHeader(hdr);
      if (!ph) { continue; }
      var k = ph.k, len = ph.len, m = MODES[k].bits;
      var nb = payloadBlockCountK(len, k), dataSyms = [], blocksDone = 0, blk;
      var symbols = [];
      for (blk = 0; blk < nb; blk++) {
        var bi = payIdx + blk * CFG.rsN;
        if (!ctx.symbolPresent(s0, bi + CFG.rsN - 1)) { break; }
        var jj;
        for (jj = 0; jj < CFG.rsN; jj++) {
          var cs = ctx.chordAt(s0, bi + jj, k);
          if (!cs) { break; }
          var relInBlk = jj;
          symbols.push({ sym: cs.sym, tones: cs.tones, erased: cs.erased, kind: (relInBlk < CFG.rsK ? "data" : "parity") });
        }
        var data = ctx.readPayloadBlock(s0, bi, k);
        if (!data) { break; }
        dataSyms = dataSyms.concat(data); blocksDone++;
      }
      var text = "", verified = false, outBytes = null;
      if (blocksDone > 0) {
        var partial = unpackBits(dataSyms, m, len + 2);
        var pbytes = new Uint8Array(Math.min(len, Math.max(0, partial.length - 0)).valueOf());
        var nb2 = Math.min(len, partial.length); var b2;
        pbytes = new Uint8Array(nb2);
        for (b2 = 0; b2 < nb2; b2++) { pbytes[b2] = partial[b2]; }
        text = utf8Partial(pbytes);
      }
      if (blocksDone >= nb) {
        var full = payloadToBytes(dataSyms, k, len);
        if (full) { verified = true; outBytes = full; text = utf8Partial(full); }
      }
      return {
        state: (blocksDone >= nb) ? "complete" : "receiving",
        startSample: s0, syncScore: picks[i].score, version: hdr[0], chordK: k, length: len,
        blocks: nb, blocksDone: blocksDone, symbols: symbols, nibbles: dataSyms,
        text: text, verified: verified, bytes: outBytes
      };
    }
    return empty;
  }

  return {
    CFG: CFG, MODES: MODES,
    crc16: crc16,
    bytesToSymbols: bytesToSymbols,
    bytesToChords: bytesToChords,
    encodeToPcm: encodeToPcm,
    decodeFromPcm: decodeFromPcm,
    decodeProgress: decodeProgress,
    estimateSeconds: estimateSeconds,
    frameSymbolCount: frameSymbolCount,
    payloadBlockCount: payloadBlockCount,
    goertzelPower: goertzelPower,
    makeHann: makeHann,
    /* exposed for the invariant suite (GF16 / k=1) */
    rsEncode: function (m) { return RS[1].encode(m); },
    rsCorrect: function (r, e) { return RS[1].correct(r, e); },
    _gf: { gmul: FIELDS[1].mul, gdiv: FIELDS[1].div, ginv: FIELDS[1].inv, gpow: FIELDS[1].pow }
  };
});

