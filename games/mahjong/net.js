// Multiplayer over WebRTC data channels with no server: the host runs the game and each guest holds one
// peer connection to it (a star). Pairing is FileDrop's manual exchange (scripts/fd/signaling.js): the
// host's invite link or QR carries a packed SDP offer, the guest's page answers with a reply link or QR,
// and the host scans or opens that. A link can travel by text message as well as by camera.
//
// Invite link: <page>?b=<bust>#o=<code>&s=<seat>    Reply link: <page>?b=<bust>#a=<code>&s=<seat>
// Messages are JSON on the channel:
//   guest → host  { t: 'hello', name }   { t: 'act', id, action }   { t: 'next' }
//   host → guest  { t: 'welcome', seat }  { t: 'state', view, prompt, info }   { t: 'bye' }
import { Signaling } from '/scripts/fd/signaling.js';

const LABEL = 'mahjong';
const pageUrl = () => location.origin + location.pathname + '?b=' + Date.now().toString(36);

export function parseLink(text) {
  const s = String(text || '').trim();
  const pick = key => {
    const i = s.indexOf('#' + key + '=') >= 0 ? s.indexOf('#' + key + '=') : s.indexOf('&' + key + '=');
    if (i < 0) return null;
    return s.slice(i + key.length + 2).split('&')[0].split('#')[0];
  };
  const o = pick('o'), a = pick('a'), seat = pick('s');
  if (o) return { kind: 'invite', code: o, seat: seat != null ? +seat : null };
  if (a) return { kind: 'reply', code: a, seat: seat != null ? +seat : null };
  // A bare code: '2…' packed format. Which kind it is shows only after decoding, so let the caller try.
  if (/^[012][A-Za-z0-9_-]{20,}$/.test(s)) return { kind: 'code', code: s, seat: null };
  return null;
}

function wrap(channel, onMsg, onClose) {
  channel.addEventListener('message', ev => {
    if (typeof ev.data !== 'string') return;
    let m; try { m = JSON.parse(ev.data); } catch { return; }
    if (m && m.t) onMsg(m);
  });
  channel.addEventListener('close', onClose);
}

export class HostNet {
  constructor(handlers) {
    this.h = handlers;   // { onJoin(seat, name), onMessage(seat, msg), onLeave(seat), onStatus(seat, text) }
    this.peers = new Map();   // seat → { sig, dc, name, state }
  }

  async invite(seat) {
    this.drop(seat);
    const sig = new Signaling({ channelLabel: LABEL, pageUrl });
    const peer = { sig, dc: null, name: null, state: 'inviting' };
    this.peers.set(seat, peer);
    sig.on('channelopen', dc => {
      peer.dc = dc; peer.state = 'open';
      wrap(dc, m => {
        if (m.t === 'hello') { peer.name = String(m.name || 'Guest').slice(0, 16); this.send(seat, { t: 'welcome', seat }); this.h.onJoin(seat, peer.name); }
        else this.h.onMessage(seat, m);
      }, () => { if (this.peers.get(seat) === peer) { peer.state = 'closed'; this.h.onLeave(seat); } });
    });
    sig.on('statechange', st => {
      if (this.peers.get(seat) !== peer) return;
      this.h.onStatus(seat, st.kind);
      if (st.kind === 'dead' && peer.state === 'open') { peer.state = 'closed'; this.h.onLeave(seat); }
    });
    sig.on('error', e => this.h.onStatus(seat, 'error: ' + e.message));
    const { code, link } = await sig.createInvite();
    return { code, link: link + '&s=' + seat };
  }

  // Apply a reply (link or bare code). Returns the seat it connected.
  async applyReply(text) {
    const p = parseLink(text);
    if (!p || p.kind === 'invite') throw new Error(p ? 'That is an invite link. Paste the reply your friend sent back.' : 'Not a reply link.');
    let seat = p.seat;
    if (seat == null) {
      const waiting = [...this.peers].filter(([, v]) => v.state === 'inviting').map(([s]) => s);
      if (waiting.length !== 1) throw new Error('Paste the full reply link so it is clear which seat it answers.');
      seat = waiting[0];
    }
    const peer = this.peers.get(seat);
    if (!peer || peer.state !== 'inviting') throw new Error('No invite is waiting for seat ' + seat + '.');
    await peer.sig.applyAnswer(p.code);
    peer.state = 'connecting';
    return seat;
  }

  waiting() { return [...this.peers].filter(([, v]) => v.state === 'inviting').map(([s]) => s); }
  connected(seat) { const p = this.peers.get(seat); return !!p && p.state === 'open' && !!p.name; }

  send(seat, msg) {
    const p = this.peers.get(seat);
    if (!p || !p.dc || p.dc.readyState !== 'open') return false;
    try { p.dc.send(JSON.stringify(msg)); return true; } catch { return false; }
  }

  drop(seat) {
    const p = this.peers.get(seat);
    if (!p) return;
    this.peers.delete(seat);
    try { if (p.dc && p.dc.readyState === 'open') p.dc.send(JSON.stringify({ t: 'bye' })); } catch {}
    try { p.sig.resetPeer(); } catch {}
  }

  checkAfterResume() { for (const p of this.peers.values()) try { p.sig.checkAfterResume(); } catch {} }
}

export class GuestNet {
  constructor(handlers) {
    this.h = handlers;   // { onOpen(), onMessage(msg), onClose(), onStatus(text) }
    this.sig = new Signaling({ channelLabel: LABEL, pageUrl });
    this.dc = null;
    this.sig.on('channelopen', dc => {
      this.dc = dc;
      wrap(dc, m => this.h.onMessage(m), () => this.h.onClose());
      this.h.onOpen();
    });
    this.sig.on('statechange', st => { this.h.onStatus(st.kind); if (st.kind === 'dead') this.h.onClose(); });
    this.sig.on('error', e => this.h.onStatus('error: ' + e.message));
  }
  async accept(code, seat) {
    const { link } = await this.sig.answerInvite(code);
    return link + (seat != null ? '&s=' + seat : '');
  }
  send(msg) {
    if (!this.dc || this.dc.readyState !== 'open') return false;
    try { this.dc.send(JSON.stringify(msg)); return true; } catch { return false; }
  }
  checkAfterResume() { try { this.sig.checkAfterResume(); } catch {} }
}

// Reply-link bridge: a reply link opened in a new tab on the host's device hands its code to the table tab.
const BC_NAME = 'mahjong-reply';
export function listenForReplies(onReply) {
  if (typeof BroadcastChannel !== 'function') return () => {};
  const bc = new BroadcastChannel(BC_NAME);
  bc.onmessage = async ev => {
    if (!ev.data || ev.data.type !== 'reply') return;
    try { const seat = await onReply(ev.data.link); bc.postMessage({ type: 'ack', nonce: ev.data.nonce, ok: true, seat }); }
    catch (e) { bc.postMessage({ type: 'ack', nonce: ev.data.nonce, ok: false, error: e.message }); }
  };
  return () => bc.close();
}
export function forwardReply(link, timeoutMs = 1500) {
  return new Promise(resolve => {
    if (typeof BroadcastChannel !== 'function') { resolve({ ok: false, error: 'no bridge' }); return; }
    const bc = new BroadcastChannel(BC_NAME);
    const nonce = Math.random().toString(36).slice(2);
    const done = r => { clearTimeout(timer); bc.close(); resolve(r); };
    const timer = setTimeout(() => done({ ok: false, error: 'no table tab answered' }), timeoutMs);
    bc.onmessage = ev => { if (ev.data && ev.data.type === 'ack' && ev.data.nonce === nonce) done(ev.data); };
    bc.postMessage({ type: 'reply', link, nonce });
  });
}
