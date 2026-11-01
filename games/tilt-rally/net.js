// Tilt Rally multiplayer. A room on the rally-lobby Worker (Cloudflare, workers/rally-lobby) introduces the phones and
// keeps the time; race traffic then goes phone to phone over WebRTC data channels. A pair whose direct link does not
// come up (some mobile networks block it, and there is no TURN relay) keeps talking through the room instead.

export const LOBBY = "wss://rally-lobby.austegard.workers.dev";
const ICE = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
const DIRECT_DEADLINE = 8000;   // ms to wait for a data channel before settling on the room relay

// A peer named "observer:…" watches without racing (the test harness in tests/rally-observer.mjs): it gets no grid
// place, never hosts, and phones send it telemetry instead of opening a WebRTC link to it.
export const isObserver = (p) => typeof p?.name === "string" && p.name.startsWith("observer:");

export function roomCode() {
  const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => A[b % A.length]).join("");
}

// Events: "peers" (the list changed or a link changed path), "message" ({from, msg}), "status" (text), "closed".
export class Net extends EventTarget {
  constructor({ code, name, url = LOBBY, rtc = typeof RTCPeerConnection !== "undefined" }) {
    super();
    Object.assign(this, { code, name, url, rtc, id: null, joined: 0, peers: new Map(), offset: 0, rttBest: Infinity, open: false, gathered: {} });
  }
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }

  connect() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${this.url}/room/${this.code}?name=${encodeURIComponent(this.name)}`);
      this.ws = ws;
      const fail = setTimeout(() => { reject(new Error("The race server did not answer.")); try { ws.close(); } catch (e) {} }, 10000);
      ws.onmessage = (ev) => { let m; try { m = JSON.parse(ev.data); } catch (e) { return; } this.onRoom(m, () => { clearTimeout(fail); resolve(this); }); };
      ws.onclose = () => { clearTimeout(fail); if (!this.open) reject(new Error("Could not reach the race server.")); this.open = false; this.emit("closed"); };
      ws.onerror = () => {};
      this.keep = setInterval(() => this.raw({ t: "ping" }), 20000);
    });
  }
  raw(m) { if (this.ws?.readyState === 1) this.ws.send(JSON.stringify(m)); }
  close() {
    clearInterval(this.keep); this.open = false;
    try { this.broadcast({ k: "bye" }, { sure: true }); } catch (e) {}
    for (const p of this.peers.values()) try { p.pc?.close(); } catch (e) {}
    try { this.ws?.close(); } catch (e) {}
  }

  // the room's clock, in ms; every phone's race start is a moment on it
  now() { return performance.now() + this.offset; }
  syncClock(n = 6) {
    let k = 0;
    const tick = () => { if (k++ < n) { this.raw({ t: "time", c: performance.now() }); setTimeout(tick, 150); } };
    tick();
  }

  // the host is whoever has been in the room longest
  hostId() { let best = { id: this.id, joined: this.joined }; for (const p of this.peers.values()) if (!isObserver(p)) if (p.joined < best.joined || (p.joined === best.joined && p.id < best.id)) best = p; return best.id; }
  isHost() { return this.hostId() === this.id; }
  list() { return [{ id: this.id, name: this.name, joined: this.joined, me: true, path: "you" }, ...[...this.peers.values()].filter((p) => !isObserver(p)).map((p) => ({ id: p.id, name: p.name, joined: p.joined, path: p.path }))].sort((a, b) => a.joined - b.joined || (a.id < b.id ? -1 : 1)); }
  observers() { return [...this.peers.values()].filter(isObserver); }

  onRoom(m, ready) {
    switch (m.t) {
      case "hello":
        this.id = m.id; this.offset = m.now - performance.now(); this.open = true;
        this.joined = m.now;                                      // the room's own record of when we arrived
        for (const p of m.peers) this.addPeer(p, true);            // the newcomer calls everyone already there
        this.syncClock(); this.emit("peers"); ready(); break;
      case "join": this.addPeer(m.peer, false); this.emit("peers"); break;
      case "leave": this.dropPeer(m.id); break;
      case "full": this.emit("status", "That room is full."); break;
      case "time": { const t = performance.now(), rtt = t - m.c; if (rtt < this.rttBest) { this.rttBest = rtt; this.offset = m.s + rtt / 2 - t; } break; }
      case "name": { const p = this.peers.get(m.from); if (p) { p.name = m.name; this.emit("peers"); } break; }
      case "offer": case "answer": case "ice": this.signal(m); break;
      case "app": { const p = this.peers.get(m.from); if (p) this.emit("message", { from: m.from, msg: m.d }); break; }
    }
  }
  setName(name) { this.name = name; this.raw({ t: "name", name }); this.emit("peers"); }

  addPeer(info, call) {
    if (this.peers.has(info.id)) return;
    const p = { ...info, path: "relay", pc: null, fast: null, sure: null, since: performance.now(), connectMs: null };
    this.peers.set(info.id, p);
    if (!this.rtc || isObserver(p)) return;
    p.path = "connecting";
    const pc = new RTCPeerConnection({ iceServers: ICE }); p.pc = pc;
    pc.onicecandidate = (e) => { if (e.candidate) { const k = e.candidate.type || "?"; this.gathered[k] = (this.gathered[k] || 0) + 1; this.raw({ t: "ice", to: p.id, c: e.candidate.toJSON() }); } };
    const wire = (ch) => {
      if (ch.label === "fast") p.fast = ch; else p.sure = ch;
      ch.onopen = () => { if (p.fast?.readyState === "open" && p.sure?.readyState === "open") { p.path = "direct"; p.connectMs = Math.round(performance.now() - p.since); clearTimeout(p.deadline); this.emit("peers"); } };
      ch.onclose = () => { if (p.path === "direct") { p.path = "relay"; this.emit("peers"); } };
      ch.onmessage = (e) => { let msg; try { msg = JSON.parse(e.data); } catch (err) { return; } this.emit("message", { from: p.id, msg }); };
    };
    pc.ondatachannel = (e) => wire(e.channel);
    p.deadline = setTimeout(() => { if (p.path !== "direct") { p.path = "relay"; this.emit("peers"); } }, DIRECT_DEADLINE);
    if (call) {
      wire(pc.createDataChannel("fast", { ordered: false, maxRetransmits: 0 }));
      wire(pc.createDataChannel("sure"));
      pc.createOffer().then((o) => pc.setLocalDescription(o)).then(() => this.raw({ t: "offer", to: p.id, sdp: pc.localDescription })).catch(() => {});
    }
  }
  async signal(m) {
    const p = this.peers.get(m.from); if (!p?.pc) return;
    try {
      // candidates can overtake the offer or answer they belong to: hold them until the description is in
      const flush = async () => { for (const c of p.held || []) await p.pc.addIceCandidate(c).catch(() => {}); p.held = []; };
      if (m.t === "offer") { await p.pc.setRemoteDescription(m.sdp); await flush(); await p.pc.setLocalDescription(await p.pc.createAnswer()); this.raw({ t: "answer", to: p.id, sdp: p.pc.localDescription }); }
      else if (m.t === "answer") { await p.pc.setRemoteDescription(m.sdp); await flush(); }
      else if (m.t === "ice") { if (p.pc.remoteDescription) await p.pc.addIceCandidate(m.c); else (p.held ||= []).push(m.c); }
    } catch (e) { /* a failed handshake leaves the pair on the relay */ }
  }
  dropPeer(id) {
    const p = this.peers.get(id); if (!p) return;
    clearTimeout(p.deadline); try { p.pc?.close(); } catch (e) {}
    this.peers.delete(id); this.emit("peers"); this.emit("left", id);
  }

  // What ICE settled on for each link: candidate types (host = same network, srflx = through the NAT via STUN,
  // relay = TURN), transport, and the measured round trip.
  async linkStats() {
    const out = {};
    for (const p of this.peers.values()) {
      if (!p.pc || isObserver(p)) continue;
      const r = { ice: p.pc.iceConnectionState, connectMs: p.connectMs };
      try {
        const st = await p.pc.getStats(); let pair = null;
        st.forEach((v) => { if (v.type === "transport" && v.selectedCandidatePairId) pair = st.get(v.selectedCandidatePairId); });
        if (!pair) st.forEach((v) => { if (v.type === "candidate-pair" && v.nominated && v.state === "succeeded") pair = v; });
        if (pair) { const l = st.get(pair.localCandidateId), rm = st.get(pair.remoteCandidateId);
          Object.assign(r, { local: l?.candidateType, remote: rm?.candidateType, proto: l?.protocol, relayProto: l?.relayProtocol, rttMs: pair.currentRoundTripTime != null ? Math.round(pair.currentRoundTripTime * 1000) : null }); }
      } catch (e) { r.err = String(e.message || e); }
      out[p.id] = r;
    }
    return out;
  }

  // fast: unordered, may drop (car positions); sure: ordered and reliable (start, finish, bye)
  sendTo(id, msg, { sure = false } = {}) {
    const p = this.peers.get(id); if (!p) return;
    const ch = p.path === "direct" ? (sure ? p.sure : p.fast) : null;
    if (ch?.readyState === "open") { try { ch.send(JSON.stringify(msg)); return; } catch (e) {} }
    this.raw({ t: "app", to: id, d: msg });
  }
  broadcast(msg, opt) { for (const id of this.peers.keys()) this.sendTo(id, msg, opt); }
}
