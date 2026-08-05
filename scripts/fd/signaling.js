/* ============================================================
   scripts/fd/signaling.js

   WebRTC connection lifecycle + manual (non-trickle) SDP code
   exchange, extracted/refactored from fd.html's inline module.

   DOM-free: no `document`, no DOM elements, no QR rendering, no
   acoustic modem. Depends only on sdp-codec.js and browser globals
   (RTCPeerConnection, location). Emits an event-based API so app.js
   can wire it to the DOM, and hands the raw open RTCDataChannel to
   the app via the 'channelopen' event so the app can pass it to the
   transport-agnostic transfer.js as a ChannelAdapter.

   See scripts/fd/PROTOCOL.md ("Layering", "Public API") for the
   module-boundary intent this file implements.
   ============================================================ */

import { encodeBlob, decodeBlob } from './sdp-codec.js';

const GATHER_TIMEOUT   = 5000;   /* ms: proceed with whatever candidates exist */
const CHANNEL_LABEL    = 'filedrop-manual';
const DISCONNECT_GRACE = 5000;   /* ms: 'disconnected' often self-heals; wait before declaring dead */
const RESTART_DEADLINE = 12000;  /* ms: an ICE restart must land within this window */

/* STUN-only, exactly as fd.html today. No TURN/relay - out of scope. */
function defaultIceServers() {
  const hashHasNostun = typeof location !== 'undefined' && location.hash.includes('nostun');
  return hashHasNostun
    ? []
    : [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];
}

/* Base page URL with a fresh cache-busting query param. The payload stays
   in the #fragment (never sent to any server); ?b= only makes each session's
   URL unique so the recipient always fetches the current page instead of a
   stale cached one - which matters, since an old cached decoder may not
   read codes produced by a newer encoder. */
function defaultPageUrl() {
  /* GitHub Pages serves /fd for fd.html, so generated links use the short form */
  return location.origin + location.pathname.replace(/\.html$/, '') + '?b=' + Date.now().toString(36);
}

/* ---------- non-trickle ICE: resolve when gathering completes ----------
   Resolves TRUE when gathering genuinely reached 'complete', FALSE when the
   timeout fired first. The two used to be indistinguishable, which meant an
   SDP could be shipped carrying no usable candidates and the only symptom
   was a connection that never came up — surfacing much later, and looking
   like the peer went away rather than like gathering never produced
   anything. Callers log the difference; none of them abort on it, since
   proceeding with a partial candidate set is still the right move. */
export function gatherComplete(pc, timeoutMs) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve(true);
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      cleanup(); resolve(false);
    }, timeoutMs);
    function onChange() {
      if (pc.iceGatheringState === 'complete') { cleanup(); resolve(true); }
    }
    function cleanup() {
      clearTimeout(timer);
      pc.removeEventListener('icegatheringstatechange', onChange);
    }
    pc.addEventListener('icegatheringstatechange', onChange);
  });
}

/** How many candidates a local description ended up carrying. */
export function countCandidates(sdp) {
  return (String(sdp || '').match(/^a=candidate:/gm) || []).length;
}

/**
 * Gather, then say plainly what came of it. `label` names the exchange in
 * the log so a truncated gather is attributable to the offer, the reply, or
 * a restart. Zero candidates after a timeout is the case worth seeing: the
 * code that follows cannot connect.
 */
async function gatherAndReport(pc, timeoutMs, label) {
  const complete = await gatherComplete(pc, timeoutMs);
  const n = countCandidates(pc.localDescription && pc.localDescription.sdp);
  if (complete) console.log('[ice] ' + label + ': gathering complete,', n, 'candidates');
  else if (n === 0) console.warn('[ice] ' + label + ': gathering timed out with NO candidates - this code cannot connect');
  else console.log('[ice] ' + label + ': gathering timed out after', timeoutMs + 'ms, proceeding with', n, 'candidates');
  return complete;
}

/**
 * Signaling: WebRTC peer-connection lifecycle + manual (link/QR/paste/
 * acoustic-agnostic) SDP code exchange. Transport only - no DOM.
 *
 * Events (via .on(event, cb)):
 *   'code'           ({kind:'invite'|'answer', code, link}) - a fresh code is ready to hand off
 *   'channelopen'     (RTCDataChannel) - the data channel is open; hand it to transfer.js
 *   'channelmessage'  (data: string|ArrayBuffer) - non-signaling message arrived on the channel
 *   'channelclose'    () - the data channel closed
 *   'statechange'     ({kind, state?}) - ICE/connection lifecycle notices for UI status text
 *   'error'           (Error) - a lifecycle operation failed
 */
export class Signaling {
  constructor(opts = {}) {
    this.iceServers   = opts.iceServers   || defaultIceServers();
    this.channelLabel = opts.channelLabel || CHANNEL_LABEL;
    this.gatherTimeout = opts.gatherTimeout != null ? opts.gatherTimeout : GATHER_TIMEOUT;
    this.pageUrl      = opts.pageUrl      || defaultPageUrl;

    this.pc = null;
    this.dc = null;

    /* ---------- connection liveness / reconnect state ---------- */
    this.isInviter     = false;   /* which side initiated the CURRENT pairing */
    this.wasConnected  = false;   /* dc has opened at least once this pairing */
    this.reconnPending = false;   /* a "connection dead" notice is outstanding */
    this.deadTimer     = null;    /* pending declare-dead fallback */

    this._listeners = {};
  }

  on(event, cb) {
    (this._listeners[event] || (this._listeners[event] = [])).push(cb);
    return this;
  }

  _emit(event, ...args) {
    const cbs = this._listeners[event];
    if (!cbs) return;
    for (const cb of cbs) {
      try { cb(...args); } catch (e) { console.error('[signaling] listener error:', e); }
    }
  }

  /* ---------- peer connection ---------- */

  _newPC() {
    const p = new RTCPeerConnection({ iceServers: this.iceServers });
    p.oniceconnectionstatechange = () => {
      console.log('[ice] state:', p.iceConnectionState);
      this._emit('statechange', { kind: 'ice', state: p.iceConnectionState });
      if (p.iceConnectionState === 'failed') {
        if (this.wasConnected) { this.tryIceRestart(); return; }
        this._emit('error', new Error(
          'Connection failed: the two machines could not reach each other ' +
          '(no relay is used). If both are on VPN or separate networks, ' +
          'this can be a firewall limitation.'
        ));
      }
      if (p.iceConnectionState === 'connected' || p.iceConnectionState === 'completed') {
        this._cancelDeadTimer();
        if (this.wasConnected) this._emit('statechange', { kind: 'connected' });
      }
      if (p.iceConnectionState === 'disconnected') {
        this._emit('statechange', { kind: 'disconnected' });
        /* often self-heals within seconds; declare dead only if it persists */
        if (this.wasConnected && !this.deadTimer) this.deadTimer = setTimeout(() => {
          this.deadTimer = null;
          if (this.pc && this.pc.iceConnectionState === 'disconnected') this._connectionDead();
        }, DISCONNECT_GRACE);
      }
      if (p.iceConnectionState === 'closed') this._emit('statechange', { kind: 'closed' });
    };
    p.addEventListener('connectionstatechange', async () => {
      if (p.connectionState === 'connected') {
        try {
          const stats = await p.getStats();
          stats.forEach((s) => {
            if (s.type === 'candidate-pair' && (s.selected || s.nominated) && s.state === 'succeeded') {
              const local = stats.get(s.localCandidateId);
              if (local) console.log('[ice] selected pair type:', local.candidateType);
            }
          });
        } catch (e) { /* stats are best-effort */ }
      }
    });
    return p;
  }

  _bindChannel(channel) {
    this.dc = channel;
    channel.binaryType = 'arraybuffer';
    channel.addEventListener('open', () => {
      console.log('[dc] open');
      this.wasConnected = true;
      this.reconnPending = false;
      this._cancelDeadTimer();
      this._emit('statechange', { kind: 'connected' });
      this._emit('channelopen', channel);
    });
    channel.addEventListener('close', () => {
      console.log('[dc] closed');
      this._emit('channelclose');
      this._connectionDead();
    });
    channel.addEventListener('message', (ev) => {
      if (typeof ev.data === 'string') {
        let msg;
        try { msg = JSON.parse(ev.data); } catch (e) { this._emit('channelmessage', ev.data); return; }
        if (msg && typeof msg.type === 'string' &&
            (msg.type === 'ICE_NUDGE' || msg.type === 'ICE_RESTART_OFFER' || msg.type === 'ICE_RESTART_ANSWER')) {
          this._handleIceRestartMsg(msg);
          return;
        }
      }
      this._emit('channelmessage', ev.data);
    });
  }

  /* ---------- sender flow ---------- */

  /** Create a fresh offer, gather ICE, and return {code, link}. Also emits 'code'. */
  async createInvite() {
    this.isInviter = true;
    this.pc = this._newPC();
    this._bindChannel(this.pc.createDataChannel(this.channelLabel, { ordered: true }));
    await this.pc.setLocalDescription(await this.pc.createOffer());
    await gatherAndReport(this.pc, this.gatherTimeout, 'invite');
    const code = await encodeBlob({ t: 'o', sdp: this.pc.localDescription.sdp });
    const link = this.pageUrl() + '#o=' + code;
    console.log('[invite] link length:', link.length, 'chars');
    this._emit('code', { kind: 'invite', code, link });
    return { code, link };
  }

  /* Accepts a raw code or a full reply link (anything before '#a=' is
     stripped). Resolves true when the answer was applied. Throws on
     failure so the caller (app.js) can surface the message. */
  async applyAnswer(codeIn) {
    let code = String(codeIn || '').trim();
    const cut = code.indexOf('#a=');
    if (cut !== -1) code = code.slice(cut + 3);
    if (!code) throw new Error('Paste the reply link first.');
    if (!this.pc || this.pc.signalingState !== 'have-local-offer') {
      throw new Error('No invite is pending in this tab - create an invite first.');
    }
    const msg = await decodeBlob(code);
    if (msg.t !== 'a') {
      throw new Error(msg.t === 'o'
        ? 'that is an invite, not a reply - your colleague should send THEIR reply link'
        : 'not a reply');
    }
    await this.pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp });
    this._emit('statechange', { kind: 'connecting' });
    return true;
  }

  /* ---------- receiver flow ---------- */

  /** Accept an invite code, gather ICE, and return {code, link} for the reply. Also emits 'code'. */
  async answerInvite(codeIn) {
    const msg = await decodeBlob(codeIn);
    if (msg.t !== 'o') throw new Error('the link does not contain a valid invite');
    this.isInviter = false;
    this.pc = this._newPC();
    this.pc.ondatachannel = (ev) => this._bindChannel(ev.channel);
    await this.pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });
    await this.pc.setLocalDescription(await this.pc.createAnswer());
    await gatherAndReport(this.pc, this.gatherTimeout, 'reply');
    const reply = await encodeBlob({ t: 'a', sdp: this.pc.localDescription.sdp });
    const replyLink = this.pageUrl() + '#a=' + reply;
    console.log('[reply] link length:', replyLink.length, 'chars');
    this._emit('code', { kind: 'answer', code: reply, link: replyLink });
    return { code: reply, link: replyLink };
  }

  /* ---------- connection death + recovery ----------
     iOS suspends a backgrounded tab; ICE consent expires (~30s) and the
     connection dies while the PAGE and its state survive. On resume the
     app detects the corpse (via 'statechange' kind:'dead') and offers a
     same-page re-pair instead of a reload: either side shows a fresh
     invite (reconnectAsInviter) and the other scans it (reconnectAsScanner
     + answerInvite). If the data channel itself is still open (brief blip /
     network change), the inviter first attempts an ICE restart negotiated
     OVER the channel - the channel is its own signaling path while it lives. */

  _cancelDeadTimer() {
    if (this.deadTimer) { clearTimeout(this.deadTimer); this.deadTimer = null; }
  }

  _connectionDead() {
    if (this.reconnPending || !this.wasConnected) return;
    this.reconnPending = true;
    this._cancelDeadTimer();
    console.log('[reconn] connection declared dead');
    this._emit('statechange', { kind: 'dead' });
  }

  /** Tear down the current peer connection + data channel; keep listeners. */
  resetPeer() {
    this._cancelDeadTimer();
    try { if (this.dc) { this.dc.onclose = null; this.dc.onmessage = null; this.dc.close(); } } catch (e) {}
    try { if (this.pc) this.pc.close(); } catch (e) {}
    this.dc = null; this.pc = null; this.wasConnected = false;
  }

  /**
   * Has the peer connection been replaced since `pc` was captured?
   *
   * The restart paths below await SDP work and ICE gathering — seconds, on a
   * flapping network — and `resetPeer()` can land in the middle of that,
   * because declaring the connection dead is exactly what prompts the app to
   * re-pair. Without this check the code after the await runs against a
   * connection that is closed or already superseded: `this.dc.send()` on a
   * null channel throws, the catch reports it as another death, and a
   * deliberate re-pair looks like a second failure.
   */
  _stale(pc) {
    return this.pc !== pc;
  }

  /** Reconnect by showing a fresh invite (reuses createInvite). Returns {code, link}. */
  async reconnectAsInviter() {
    this.reconnPending = false;
    this.resetPeer();
    return this.createInvite();
  }

  /** Reconnect by preparing to scan/receive the peer's fresh invite. The
      caller drives the actual scan/paste and then calls answerInvite(). */
  reconnectAsScanner() {
    this.reconnPending = false;
    this.resetPeer();
  }

  /* Inviter-initiated ICE restart, signaled over the still-open data channel.
     The answerer never initiates (avoids offer glare); if it detects failure
     first it nudges the inviter instead. */
  async tryIceRestart() {
    if (!this.dc || this.dc.readyState !== 'open') { this._connectionDead(); return; }
    const pc = this.pc;
    this._cancelDeadTimer();
    this.deadTimer = setTimeout(() => this._connectionDead(), RESTART_DEADLINE);
    try {
      if (!this.isInviter) {
        console.log('[reconn] nudging inviter to restart ICE');
        this.dc.send(JSON.stringify({ type: 'ICE_NUDGE' }));
        return;
      }
      console.log('[reconn] attempting ICE restart over the data channel');
      this._emit('statechange', { kind: 'reconnecting' });
      pc.restartIce();
      await pc.setLocalDescription(await pc.createOffer({ iceRestart: true }));
      if (this._stale(pc)) { console.log('[reconn] restart abandoned: peer was reset'); return; }
      await gatherAndReport(pc, this.gatherTimeout, 'restart offer');
      if (this._stale(pc)) { console.log('[reconn] restart abandoned: peer was reset'); return; }
      this.dc.send(JSON.stringify({ type: 'ICE_RESTART_OFFER', sdp: pc.localDescription.sdp }));
    } catch (e) {
      if (this._stale(pc)) { console.log('[reconn] restart abandoned: peer was reset'); return; }
      console.log('[reconn] ICE restart failed:', e.message);
      this._connectionDead();
    }
  }

  async _handleIceRestartMsg(msg) {
    const pc = this.pc;
    try {
      if (msg.type === 'ICE_NUDGE' && this.isInviter) { this.tryIceRestart(); return; }
      if (msg.type === 'ICE_RESTART_OFFER' && !this.isInviter) {
        this._cancelDeadTimer();
        this.deadTimer = setTimeout(() => this._connectionDead(), RESTART_DEADLINE);
        await pc.setRemoteDescription({ type: 'offer', sdp: String(msg.sdp || '') });
        await pc.setLocalDescription(await pc.createAnswer());
        if (this._stale(pc)) { console.log('[reconn] restart answer abandoned: peer was reset'); return; }
        await gatherAndReport(pc, this.gatherTimeout, 'restart answer');
        if (this._stale(pc)) { console.log('[reconn] restart answer abandoned: peer was reset'); return; }
        this.dc.send(JSON.stringify({ type: 'ICE_RESTART_ANSWER', sdp: pc.localDescription.sdp }));
        return;
      }
      if (msg.type === 'ICE_RESTART_ANSWER' && this.isInviter) {
        await pc.setRemoteDescription({ type: 'answer', sdp: String(msg.sdp || '') });
        return;
      }
    } catch (e) {
      if (this._stale(pc)) { console.log('[reconn] restart negotiation abandoned: peer was reset'); return; }
      console.log('[reconn] restart negotiation failed:', e.message);
      this._connectionDead();
    }
  }

  /* iOS resume: events were frozen while suspended, so the state handlers
     above may never have fired. Call this directly from a
     visibilitychange handler in app.js to check the corpse. */
  checkAfterResume() {
    if (!this.wasConnected || this.reconnPending) return;
    const pcDead = !this.pc || ['failed', 'closed', 'disconnected'].includes(this.pc.connectionState);
    const dcDead = !this.dc || this.dc.readyState !== 'open';
    if (dcDead && pcDead) this._connectionDead();
    else if (pcDead && !dcDead) this.tryIceRestart();
  }
}
