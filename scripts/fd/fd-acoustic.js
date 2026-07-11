/* ============================================================
   FileDrop acoustic link (half-duplex signaling glue)

   A fourth transport for the SAME offer/answer codes that ride
   the invite link, the QR, and the paste box. Nothing here moves
   file bytes - the WebRTC data channel does that. Sound only
   carries the tiny SDP code in either direction, one way at a time:

     TX: FDAcoustic.play(tag, code, cbs)   tag 'O' = invite, 'A' = reply
     RX: FDAcoustic.listen(cbs) / stopListen()

   The decoded payload self-describes its direction via the leading
   tag byte, so a listener routes an invite to answerInvite() and a
   reply to applyAnswer() without being told which to expect.

   The signal core (window.AcousticModem) is a pure-function module:
   4-tone chords over GF(1024), RS(15,11) FEC, CRC-16 gate, 4.5-7.3
   kHz band. This layer is the browser plumbing (Web Audio + mic),
   lifted from the standalone acoustic-link page. Browser-verify only.
   ============================================================ */
window.FDAcoustic = (function () {
  'use strict';
  var M = window.AcousticModem;
  var HAS_MODEM = !!(M && M.encodeToPcm && M.decodeFromPcm);
  var HAS_MIC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  var enc = new TextEncoder();
  var dec = new TextDecoder('utf-8');

  var ctx = null;
  function audioCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      console.log('[fd-acoustic] AudioContext created, rate =', ctx.sampleRate);
    }
    if (ctx.state === 'suspended') { ctx.resume(); }
    return ctx;
  }

  /* ------------------------------------------------------- TRANSMIT */
  var playSrc = null;
  async function play(tag, code, cbs) {
    cbs = cbs || {};
    if (!HAS_MODEM) { if (cbs.onerror) cbs.onerror('acoustic link unavailable in this browser'); return; }
    var bytes = enc.encode(String(tag) + String(code));
    if (bytes.length > M.CFG.maxPayload) {
      if (cbs.onerror) cbs.onerror('code too long to send by sound (' + bytes.length + ' B) - use the link or QR');
      return;
    }
    try {
      /* iOS binds the audio route when the context activates - force the
         loudspeaker before resuming, unless we are also listening (a single
         device playing and recording needs the play-and-record route). */
      if (!listening && 'audioSession' in navigator) {
        try { navigator.audioSession.type = 'playback'; } catch (e) {}
      }
      var ac = audioCtx();
      if (ac.state !== 'running') { try { await ac.resume(); } catch (e) {} }
      var pcm = M.encodeToPcm(bytes, ac.sampleRate);
      var buf = ac.createBuffer(1, pcm.length, ac.sampleRate);
      buf.getChannelData(0).set(pcm);
      var src = ac.createBufferSource();
      src.buffer = buf;
      var gain = ac.createGain();
      gain.gain.value = 0.9;
      src.connect(gain);
      gain.connect(ac.destination);
      var secs = pcm.length / ac.sampleRate;
      playSrc = src;
      if (cbs.onstart) cbs.onstart(secs);
      src.onended = function () { if (playSrc === src) playSrc = null; if (cbs.onend) cbs.onend(); };
      src.start();
      console.log('[fd-acoustic] playing', bytes.length, 'bytes,', secs.toFixed(2), 's at', ac.sampleRate, 'Hz');
    } catch (e) {
      playSrc = null;
      console.error('[fd-acoustic] play failed:', e);
      if (cbs.onerror) cbs.onerror('could not play sound: ' + e.message);
    }
  }
  function stopPlay() { if (playSrc) { try { playSrc.stop(); } catch (e) {} playSrc = null; } }

  /* -------------------------------------------------------- RECEIVE */
  var listening = false, mediaStream = null, srcNode = null, captureNode = null, muteNode = null;
  var chunks = [], bufLen = 0, totalAbs = 0, lastEndAbs = 0, lastText = '', lastTextAt = 0, decodeTimer = null;
  var rxCbs = null;
  var BUF_CAP_SEC = 25;

  var WORKLET_SRC =
    'class Cap extends AudioWorkletProcessor {' +
    '  process(inputs) {' +
    '    var ch = inputs[0] && inputs[0][0];' +
    '    if (ch) { var c = new Float32Array(ch); this.port.postMessage(c, [c.buffer]); }' +
    '    return true;' +
    '  }' +
    '}' +
    "registerProcessor('cap', Cap);";

  function pushChunk(f32) {
    chunks.push(f32);
    bufLen += f32.length;
    totalAbs += f32.length;
    var cap = (ctx ? ctx.sampleRate : 48000) * BUF_CAP_SEC;
    while (bufLen > cap && chunks.length > 1) { bufLen -= chunks[0].length; chunks.shift(); }
  }
  function assemble() {
    var out = new Float32Array(bufLen), off = 0, i;
    for (i = 0; i < chunks.length; i++) { out.set(chunks[i], off); off += chunks[i].length; }
    return out;
  }
  function attachCapture(ac, source) {
    /* prefer AudioWorklet (Blob URL keeps it single-file); fall back to
       ScriptProcessorNode where the worklet path is blocked (older Safari) */
    var url = URL.createObjectURL(new Blob([WORKLET_SRC], { type: 'application/javascript' }));
    return ac.audioWorklet.addModule(url).then(function () {
      var node = new AudioWorkletNode(ac, 'cap');
      node.port.onmessage = function (e) { pushChunk(e.data); };
      source.connect(node);
      muteNode = ac.createGain(); muteNode.gain.value = 0;
      node.connect(muteNode); muteNode.connect(ac.destination);
      console.log('[fd-acoustic] capture via AudioWorklet');
      return node;
    }).catch(function (err) {
      console.warn('[fd-acoustic] AudioWorklet unavailable, using ScriptProcessor:', err);
      var node = ac.createScriptProcessor(4096, 1, 1);
      node.onaudioprocess = function (e) { pushChunk(new Float32Array(e.inputBuffer.getChannelData(0))); };
      source.connect(node);
      muteNode = ac.createGain(); muteNode.gain.value = 0;
      node.connect(muteNode); muteNode.connect(ac.destination);
      console.log('[fd-acoustic] capture via ScriptProcessor');
      return node;
    });
  }
  function tryDecode() {
    if (!listening || !ctx || bufLen < (ctx.sampleRate * 1.5)) return;
    try {
      var pcm = assemble();
      var bufStartAbs = totalAbs - bufLen;
      var minStart = Math.max(0, lastEndAbs - bufStartAbs);
      if (minStart >= pcm.length) return;
      var res = M.decodeFromPcm(pcm, ctx.sampleRate, { minStart: minStart });
      if (res.ok) {
        lastEndAbs = bufStartAbs + res.endSample;
        var text = dec.decode(res.bytes), now = Date.now();
        if (text === lastText && (now - lastTextAt) < 8000) { return; }   /* room-echo dup */
        lastText = text; lastTextAt = now;
        console.log('[fd-acoustic] decoded', res.bytes.length, 'bytes, sync', res.syncScore);
        if (rxCbs && rxCbs.onCode) rxCbs.onCode(text);
      } else if (res.reason === 'crc') {
        if (rxCbs && rxCbs.onStatus) rxCbs.onStatus('heard a frame but it was garbled - move closer or raise volume', 'bad');
      }
    } catch (e) { console.error('[fd-acoustic] decode pass failed:', e); }
  }
  function listen(cbs) {
    cbs = cbs || {};
    if (listening) { if (cbs.onListening) cbs.onListening(); return; }
    if (!HAS_MODEM) { if (cbs.onError) cbs.onError('acoustic link unavailable in this browser'); return; }
    if (!HAS_MIC) { if (cbs.onError) cbs.onError('microphone needs HTTPS (or localhost)'); return; }
    rxCbs = cbs;
    if ('audioSession' in navigator) { try { navigator.audioSession.type = 'play-and-record'; } catch (e) {} }
    var ac = audioCtx();
    if (cbs.onStatus) cbs.onStatus('requesting microphone\u2026', 'busy');
    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 }
    }).then(function (stream) {
      mediaStream = stream;
      srcNode = ac.createMediaStreamSource(stream);
      return attachCapture(ac, srcNode);
    }).then(function (node) {
      captureNode = node;
      listening = true;
      totalAbs = 0; lastEndAbs = 0; chunks = []; bufLen = 0; lastText = '';
      decodeTimer = setInterval(tryDecode, 900);
      if (cbs.onListening) cbs.onListening();
      if (cbs.onStatus) cbs.onStatus('listening for a signal\u2026', 'busy');
    }).catch(function (err) {
      console.error('[fd-acoustic] mic failed:', err);
      if (cbs.onError) cbs.onError('microphone denied or unavailable: ' + err.message);
    });
  }
  function stopListen() {
    listening = false;
    if (decodeTimer) { clearInterval(decodeTimer); decodeTimer = null; }
    if (captureNode) { try { captureNode.disconnect(); } catch (e) {} captureNode = null; }
    if (srcNode) { try { srcNode.disconnect(); } catch (e) {} srcNode = null; }
    if (muteNode) { try { muteNode.disconnect(); } catch (e) {} muteNode = null; }
    if (mediaStream) { mediaStream.getTracks().forEach(function (t) { t.stop(); }); mediaStream = null; }
    chunks = []; bufLen = 0; rxCbs = null;
  }

  return {
    available: HAS_MODEM,
    canListen: HAS_MODEM && HAS_MIC,
    play: play, stopPlay: stopPlay,
    listen: listen, stopListen: stopListen,
    isListening: function () { return listening; },
    isPlaying: function () { return !!playSrc; }
  };
})();

