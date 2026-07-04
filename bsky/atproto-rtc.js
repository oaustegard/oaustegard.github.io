/**
 * atproto-rtc.js
 *
 * ATProto-signaled WebRTC data channels — peer-to-peer connections
 * established between two browsers using short-lived ATProto records
 * as the signaling channel, instead of a dedicated signaling server.
 *
 * SECURITY MODEL (preserved from the source this was extracted from):
 *  - Signal records ($type = collection option) are written ONLY to the
 *    caller's OWN repo, addressed (`to`) at the peer's DID.
 *  - A peer's repo is only ever READ (unauthenticated listRecords against
 *    their PDS) — never written to.
 *  - A record's authorship is cryptographically bound to its author's
 *    account by the PDS/repo signature chain, so an offer or answer
 *    attributed to `did:plc:xyz` cannot be forged by anyone but that
 *    account's PDS. The DTLS fingerprint embedded in the SDP means the
 *    resulting encrypted channel is authenticated to that same identity.
 *  - Records are deleted the moment a connection completes, swept for
 *    staleness at every login, and ignored outright past a TTL
 *    (`signalTtlS`) regardless of deletion.
 *  - Untrusted peers (anyone who signals you without you having added
 *    them first) are NOT polled, offered to, or knocked at until your
 *    `onIncoming` consent gate returns true. This is a hard gate, not
 *    a UI nicety: no network activity toward an unaccepted peer occurs.
 *
 * This library only carries session-setup text (SDP, a few KB) over
 * ATProto. Application payloads belong on the resulting RTCDataChannel;
 * this library does not interpret or transport them.
 *
 * @license MIT
 * @version 1.1.0
 *
 * @example
 *   import { AtprotoRTC } from '/bsky/atproto-rtc.js';
 *
 *   const rtc = new AtprotoRTC(); // defaults: com.austegard.rtc.signal, google STUN
 *   rtc.onIncoming = async (did) => confirm(did + ' wants to connect. Accept?');
 *
 *   await rtc.login('alice.bsky.social', appPassword);
 *   rtc.start(); // begin poll loop + discovery
 *
 *   const conn = await rtc.connect('bob.bsky.social');
 *   conn.on('open', () => conn.channel.send('hello'));
 *   conn.on('close', () => console.log('closed'));
 *
 *   const requests = await rtc.discoverPeers(); // who has signaled me
 */

/* ---------- minimal event emitter ---------- */
class Emitter {
  constructor() { this._l = new Map(); }
  on(evt, fn) {
    if (!this._l.has(evt)) this._l.set(evt, new Set());
    this._l.get(evt).add(fn);
    return () => this._l.get(evt) && this._l.get(evt).delete(fn);
  }
  off(evt, fn) { const s = this._l.get(evt); if (s) s.delete(fn); }
  emit(evt, ...args) {
    const s = this._l.get(evt);
    if (!s) return;
    for (const fn of s) {
      try { fn(...args); } catch (e) { console.debug('[atproto-rtc] listener error:', e); }
    }
  }
}

/**
 * A single peer-to-peer connection, wrapping the RTCPeerConnection and
 * (once open) its RTCDataChannel.
 *
 * Events: 'open', 'close', 'error', 'statechange'
 */
export class AtprotoRTCConnection extends Emitter {
  constructor(did) {
    super();
    this.did = did;
    this.pc = null;
    this.channel = null;
  }

  close() {
    if (this.channel) { try { this.channel.close(); } catch (e) {} }
    if (this.pc) { try { this.pc.close(); } catch (e) {} }
    this.pc = null;
    this.channel = null;
    this.emit('close');
  }
}

/**
 * AtprotoRTC — signaling + connection manager.
 */
export class AtprotoRTC extends Emitter {
  /**
   * @param {Object} [opts]
   * @param {string} [opts.collection='com.austegard.rtc.signal']
   * @param {Array}  [opts.iceServers] default: [{urls:'stun:stun.l.google.com:19302'}]
   * @param {number} [opts.pollMs=2000]
   * @param {number} [opts.signalTtlS=300]
   */
  constructor(opts = {}) {
    super();
    this.collection  = opts.collection  || 'com.austegard.rtc.signal';
    this.iceServers  = opts.iceServers !== undefined
      ? opts.iceServers
      : [{ urls: 'stun:stun.l.google.com:19302' }];
    this.pollMs      = opts.pollMs      || 2000;
    this.signalTtlS  = opts.signalTtlS  || 300;
    this.discoverMs  = opts.discoverMs  || 6000;

    /** @type {{did:?string, handle:?string, pds:?string, accessJwt:?string, password:?string}} */
    this.me = { handle: null, did: null, pds: null, accessJwt: null, password: null };

    /** consent gate: (did) => boolean|Promise<boolean>. Default: reject all. */
    this.onIncoming = () => false;

    /* peers: did -> { did, handle, pds, trusted, pc, dc, conn, offerRkey, answerRkey, knockRkey, sending } */
    this.peers = new Map();
    this._seenUris = new Map();       /* uri -> first-seen ms */
    this._ignoredDids = new Set();
    this._discoverChecked = new Set();

    this._pollTimer = null;
    this._discoverTimer = null;
    this._running = false;

    console.debug('[atproto-rtc] iceServers:', JSON.stringify(this.iceServers));
  }

  /* ================= identity + auth ================= */

  /** Handle -> DID via the public AppView. */
  static async resolveHandle(handle) {
    const r = await fetch('https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=' + encodeURIComponent(handle));
    if (!r.ok) throw new Error('Could not resolve handle ' + handle + ' (' + r.status + ')');
    return (await r.json()).did;
  }

  /** DID -> PDS service endpoint via DID document (plc.directory or did:web). */
  static async resolvePds(did) {
    let doc;
    if (did.startsWith('did:plc:')) {
      const r = await fetch('https://plc.directory/' + did);
      if (!r.ok) throw new Error('plc.directory lookup failed for ' + did);
      doc = await r.json();
    } else if (did.startsWith('did:web:')) {
      const host = did.slice('did:web:'.length).split(':').join('/');
      const r = await fetch('https://' + host + '/.well-known/did.json');
      if (!r.ok) throw new Error('did:web lookup failed for ' + did);
      doc = await r.json();
    } else {
      throw new Error('Unsupported DID method: ' + did);
    }
    const svc = (doc.service || []).find(s => s.id === '#atproto_pds' || s.type === 'AtprotoPersonalDataServer');
    if (!svc) throw new Error('No PDS endpoint in DID document for ' + did);
    return svc.serviceEndpoint;
  }

  /**
   * Sign in. Resolves handle -> DID -> PDS, creates a session against the
   * user's OWN PDS, sweeps stale own signal records, and populates `.me`.
   */
  async login(handleOrDid, appPassword) {
    const handle = String(handleOrDid).trim().replace(/^@/, '');
    this.me.handle = handle;
    this.me.did = handle.startsWith('did:') ? handle : await AtprotoRTC.resolveHandle(handle);
    this.me.pds = await AtprotoRTC.resolvePds(this.me.did);
    this.me.password = appPassword;
    await this._createSession();
    await this._sweepOwnSignals();
    this.emit('login', this.me);
    return this.me;
  }

  async _createSession() {
    const r = await fetch(this.me.pds + '/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: this.me.handle, password: this.me.password })
    });
    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      throw new Error('Sign-in failed: ' + (body.message || r.status));
    }
    const j = await r.json();
    this.me.accessJwt = j.accessJwt;
    this.me.did = j.did;
  }

  async _pdsCall(nsid, { method = 'GET', params, body, retried } = {}) {
    let url = this.me.pds + '/xrpc/' + nsid;
    if (params) url += '?' + new URLSearchParams(params);
    const r = await fetch(url, {
      method,
      headers: {
        'Authorization': 'Bearer ' + this.me.accessJwt,
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (r.status === 401 && !retried) {          /* token expired — re-auth once */
      await this._createSession();
      return this._pdsCall(nsid, { method, params, body, retried: true });
    }
    if (!r.ok) throw new Error(nsid + ' -> ' + r.status);
    return r.json();
  }

  /* ================= signaling over ATProto records ================= */

  async _sendSignal(toDid, msgType, payload) {
    return this._pdsCall('com.atproto.repo.createRecord', {
      method: 'POST',
      body: {
        repo: this.me.did,
        collection: this.collection,
        record: {
          $type: this.collection,
          to: toDid,
          msgType: msgType,           /* 'offer' | 'answer' | 'knock' */
          payload: payload,
          createdAt: new Date().toISOString()
        }
      }
    });
  }

  async _deleteOwnRecord(rkey) {
    try {
      await this._pdsCall('com.atproto.repo.deleteRecord', {
        method: 'POST',
        body: { repo: this.me.did, collection: this.collection, rkey: rkey }
      });
    } catch (e) { console.debug('[atproto-rtc] delete failed:', e.message); }
  }

  async _listMyRecords() {
    const j = await this._pdsCall('com.atproto.repo.listRecords', {
      params: { repo: this.me.did, collection: this.collection, limit: 100 }
    });
    return j.records || [];
  }

  /** Unauthenticated read of a peer's repo, straight from their PDS. */
  async _listPeerRecords(peer) {
    const url = peer.pds + '/xrpc/com.atproto.repo.listRecords?' +
      new URLSearchParams({ repo: peer.did, collection: this.collection, limit: '50' });
    const r = await fetch(url);
    if (!r.ok) throw new Error('listRecords on ' + peer.handle + ' -> ' + r.status);
    return (await r.json()).records || [];
  }

  async _sweepOwnSignals() {
    /* remove only records past the TTL: another tab signed into the SAME
       account may have live handshakes in flight — deleting everything
       would sever them. Fresh garbage ages out and is swept next time. */
    try {
      const recs = await this._listMyRecords();
      let n = 0;
      for (const rec of recs) {
        const age = Date.now() - Date.parse(String((rec.value || {}).createdAt || ''));
        if (isNaN(age) || age > this.signalTtlS * 1000) {
          await this._deleteOwnRecord(rec.uri.split('/').pop());
          n++;
        }
      }
      if (n) console.debug('[atproto-rtc] sweep removed', n, 'stale signal records');
    } catch (e) { console.debug('[atproto-rtc] sweep failed:', e.message); }
  }

  /* ================= peers state ================= */

  _upsertPeer(did, handle, pds, trusted) {
    let p = this.peers.get(did);
    if (p) {
      if (trusted && !p.trusted) { p.trusted = true; this.emit('statechange', did, p); }
      return p;
    }
    p = {
      did, handle, pds, trusted: !!trusted,
      pc: null, dc: null, conn: null,
      offerRkey: null, answerRkey: null, knockRkey: null,
      sending: false
    };
    this.peers.set(did, p);
    this.emit('statechange', did, p);
    return p;
  }

  /* ================= WebRTC (vanilla ICE: candidates embedded in SDP) ================= */

  _summarizeCandidates(tag, sdp) {
    const lines = (sdp.match(/a=candidate:[^\r\n]+/g) || []);
    const types = {};
    let mdns = 0;
    for (const l of lines) {
      const parts = l.split(' ');
      const typ = parts[parts.indexOf('typ') + 1] || '?';
      types[typ] = (types[typ] || 0) + 1;
      if (/\.local\b/.test(l)) mdns++;
    }
    console.debug('[atproto-rtc][ice]', tag, lines.length, 'candidates', JSON.stringify(types), mdns + ' mDNS-masked');
    if (!lines.length) console.debug('[atproto-rtc][ice]', tag, 'WARNING: zero candidates in SDP');
  }

  async _logSelectedPair(pc, peerId) {
    try {
      const stats = await pc.getStats();
      stats.forEach((s) => {
        if (s.type === 'candidate-pair' && (s.selected || s.state === 'succeeded') && s.nominated) {
          const local = stats.get(s.localCandidateId) || {};
          const remote = stats.get(s.remoteCandidateId) || {};
          console.debug('[atproto-rtc][ice] selected pair with', peerId, ':',
            local.candidateType, local.address || local.ip, '<->',
            remote.candidateType, remote.address || remote.ip);
        }
      });
    } catch (e) { console.debug('[atproto-rtc][ice] getStats failed:', e.message); }
  }

  _waitIceComplete(pc) {
    if (pc.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise((resolve) => {
      const t = setTimeout(resolve, 3000); /* cap the wait */
      pc.addEventListener('icegatheringstatechange', () => {
        if (pc.iceGatheringState === 'complete') { clearTimeout(t); resolve(); }
      });
    });
  }

  _makePC(did) {
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    pc.oniceconnectionstatechange = () => {
      console.debug('[atproto-rtc][ice]', did, 'iceConnectionState ->', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        this._logSelectedPair(pc, did);
      }
    };
    pc.onconnectionstatechange = () => {
      console.debug('[atproto-rtc]', did, '->', pc.connectionState);
      const p = this.peers.get(did);
      if (!p) return;
      if (pc.connectionState === 'connected') {
        /* signaling done — remove our offer/answer/knock records */
        if (p.offerRkey)  { this._deleteOwnRecord(p.offerRkey);  p.offerRkey = null; }
        if (p.answerRkey) { this._deleteOwnRecord(p.answerRkey); p.answerRkey = null; }
        if (p.knockRkey)  { this._deleteOwnRecord(p.knockRkey);  p.knockRkey = null; }
      }
      if (pc.connectionState === 'disconnected') {
        /* transient ICE state — frequently self-recovers (mobile tab suspension,
           network blip). Nudge ICE rather than tearing down; 'failed' follows
           if it truly cannot recover. */
        try { pc.restartIce(); } catch (e) { /* older engines: no-op */ }
      }
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        p.pc = null; p.dc = null;
        if (p.conn) p.conn.emit('close');
        p.conn = null;
        /* peer remains trusted: if polling is running, the poll loop re-offers
           or re-knocks on its next tick — reconnection is automatic. */
      }
      this.emit('statechange', did, p);
      if (p.conn) p.conn.emit('statechange', pc.connectionState);
    };
    return pc;
  }

  _bindDataChannel(dc, did) {
    dc.binaryType = 'arraybuffer';
    const p = this.peers.get(did);
    dc.onopen = () => {
      console.debug('[atproto-rtc][dc] open with', did);
      if (p) { p.dc = dc; if (p.conn) { p.conn.channel = dc; p.conn.emit('open'); } this.emit('statechange', did, p); }
    };
    dc.onclose = () => {
      if (p) { p.dc = null; if (p.conn) p.conn.emit('close'); this.emit('statechange', did, p); }
    };
    dc.onerror = (ev) => {
      if (p && p.conn) p.conn.emit('error', ev);
      this.emit('error', did, ev);
    };
    dc.onmessage = (ev) => {
      if (p && p.conn) p.conn.emit('message', ev.data);
      this.emit('message', did, ev.data);   /* top-level: covers peer-initiated
                                               connections that never got a conn
                                               wrapper via connect() */
    };
  }

  async _offerTo(did) {
    const p = this.peers.get(did);
    if (!p || p.pc) return;
    console.debug('[atproto-rtc] offering to', p.handle);
    const pc = this._makePC(did);
    p.pc = pc;
    if (p.conn) p.conn.pc = pc;
    const dc = pc.createDataChannel('atproto-rtc', { ordered: true });
    p.dc = dc;
    if (p.conn) p.conn.channel = dc;
    this._bindDataChannel(dc, did);
    try {
      await pc.setLocalDescription(await pc.createOffer());
      await this._waitIceComplete(pc);
      this._summarizeCandidates('local offer to ' + p.handle, pc.localDescription.sdp);
      const res = await this._sendSignal(did, 'offer', pc.localDescription.sdp);
      p.offerRkey = res.uri.split('/').pop();
    } catch (e) {
      /* failed to publish the offer — reset so the next poll tick retries cleanly */
      try { pc.close(); } catch (e2) {}
      p.pc = null; p.dc = null;
      throw e;
    }
    this.emit('statechange', did, p);
  }

  async _handleOffer(did, sdp) {
    const p = this.peers.get(did);
    if (!p) return;
    if (p.pc && p.pc.connectionState === 'connected') return;  /* already up */
    if (p.pc) { try { p.pc.close(); } catch (e) {} }
    console.debug('[atproto-rtc] answering', p.handle);
    const pc = this._makePC(did);
    p.pc = pc;
    if (p.conn) p.conn.pc = pc;
    pc.ondatachannel = (ev) => {
      p.dc = ev.channel;
      if (p.conn) p.conn.channel = ev.channel;
      this._bindDataChannel(ev.channel, did);
    };
    try {
      this._summarizeCandidates('remote offer from ' + p.handle, sdp);
      await pc.setRemoteDescription({ type: 'offer', sdp: sdp });
      await pc.setLocalDescription(await pc.createAnswer());
      await this._waitIceComplete(pc);
      this._summarizeCandidates('local answer to ' + p.handle, pc.localDescription.sdp);
      const res = await this._sendSignal(did, 'answer', pc.localDescription.sdp);
      p.answerRkey = res.uri.split('/').pop();
    } catch (e) {
      /* failed mid-answer — reset; caller unmarks the offer record for retry */
      try { pc.close(); } catch (e2) {}
      p.pc = null; p.dc = null;
      throw e;
    }
    this.emit('statechange', did, p);
  }

  async _handleAnswer(did, sdp) {
    const p = this.peers.get(did);
    if (!p || !p.pc || p.pc.signalingState !== 'have-local-offer') return;
    console.debug('[atproto-rtc] got answer from', p.handle);
    this._summarizeCandidates('remote answer from ' + p.handle, sdp);
    await p.pc.setRemoteDescription({ type: 'answer', sdp: sdp });
  }

  /* ================= poll loop ================= */

  async _pollPeer(did) {
    const p = this.peers.get(did);
    if (!p) return;
    const recs = await this._listPeerRecords(p);
    /* oldest-first so offer/answer arrive in order */
    recs.sort((a, b) => String((a.value || {}).createdAt || '').localeCompare(String((b.value || {}).createdAt || '')));
    for (const rec of recs) {
      if (this._seenUris.has(rec.uri)) continue;
      const v = rec.value || {};
      if (v.to !== this.me.did) continue;
      const age = Date.now() - Date.parse(String(v.createdAt || ''));
      if (isNaN(age) || age > this.signalTtlS * 1000) { this._seenUris.set(rec.uri, Date.now()); continue; }
      this._seenUris.set(rec.uri, Date.now());
      try {
        if (v.msgType === 'offer')  await this._handleOffer(did, String(v.payload || ''));
        if (v.msgType === 'answer') await this._handleAnswer(did, String(v.payload || ''));
      } catch (e) {
        /* transient failure (e.g. answer write) — unmark so the record is retried */
        this._seenUris.delete(rec.uri);
        throw e;
      }
    }
  }

  async _poll() {
    /* prune tracking state so hostile record churn can't grow memory unboundedly */
    const cutoff = Date.now() - this.signalTtlS * 1000;
    for (const [uri, ts] of this._seenUris) if (ts < cutoff) this._seenUris.delete(uri);
    if (this._discoverChecked.size > 5000) this._discoverChecked.clear();  /* re-verification is cheap and gated */
    for (const did of this.peers.keys()) {
      try {
        const p = this.peers.get(did);
        if (!p.trusted) continue;   /* consent gate: no polling, offering, or knocking until accepted */
        const connected = p.dc && p.dc.readyState === 'open';
        if (!connected) await this._pollPeer(did);
        /* glare avoidance: lexicographically smaller DID initiates.
           The larger DID instead writes a one-time 'knock' so the peer
           can discover us via the backlink index without typing anything. */
        if (!p.pc && this.me.did < did) await this._offerTo(did);
        else if (!p.pc && !p.knockRkey && this.me.did > did) {
          const res = await this._sendSignal(did, 'knock', '');
          p.knockRkey = res.uri.split('/').pop();
          console.debug('[atproto-rtc][knock] sent to', p.handle);
        }
      } catch (e) {
        /* isolate: one peer's bad records or network hiccup must not halt polling of others */
        console.debug('[atproto-rtc][poll]', did, 'error:', e.message);
      }
    }
    if (this._running) this._pollTimer = setTimeout(() => this._poll(), this.pollMs);
  }

  /* ================= peer discovery via Constellation backlink index ================
     constellation.microcosm.blue indexes firehose records by link target
     (~seconds of latency, verified). Any signal record addressed to our
     DID — offer or knock — shows up as a backlink, letting us discover a
     peer we never typed. Each hit is only a HINT (the index may retain
     deleted records), so we confirm a live, TTL-valid record in the
     peer's repo before surfacing them. */

  /**
   * Poll Constellation once for backlinks (signal records addressed to
   * `me.did`), verify liveness directly against each candidate's repo,
   * and surface untrusted candidates via `onIncoming`. Returns the list
   * of DIDs discovered as pending/trusted requests in this pass.
   */
  async discoverPeers() {
    const found = [];
    try {
      const q = 'https://constellation.microcosm.blue/xrpc/blue.microcosm.links.getBacklinks?' +
        new URLSearchParams({ subject: this.me.did, source: this.collection + ':to', limit: '50' });
      const r = await fetch(q);
      if (!r.ok) throw new Error('getBacklinks -> ' + r.status);
      const j = await r.json();
      for (const rec of (j.records || [])) {
        const did = rec.did;
        const key = did + '/' + rec.rkey;  /* per-record: a fresh knock re-triggers verification */
        if (did === this.me.did || this.peers.has(did) || this._ignoredDids.has(did) || this._discoverChecked.has(key)) continue;
        this._discoverChecked.add(key);
        try {
          const pds = await AtprotoRTC.resolvePds(did);
          const live = (await this._listPeerRecords({ did, pds, handle: did })).some(x => {
            const v = x.value || {};
            const age = Date.now() - Date.parse(String(v.createdAt || ''));
            return v.to === this.me.did && !isNaN(age) && age <= this.signalTtlS * 1000;
          });
          if (!live) continue;             /* stale index entry — ignore */
          const dr = await fetch(pds + '/xrpc/com.atproto.repo.describeRepo?repo=' + encodeURIComponent(did));
          const handle = dr.ok ? (await dr.json()).handle : did;
          console.debug('[atproto-rtc][discover] live signal from', handle);

          const p = this._upsertPeer(did, handle, pds, false);   /* untrusted: pending request */
          found.push({ did, handle, pds });

          const accept = await this.onIncoming(did);
          if (accept) {
            p.trusted = true;
            this.emit('statechange', did, p);
          }
        } catch (e) { console.debug('[atproto-rtc][discover]', did, '->', e.message); }
      }
    } catch (e) {
      console.debug('[atproto-rtc][discover] error:', e.message);
    }
    return found;
  }

  /* ================= public API ================= */

  /**
   * Start the poll loop and periodic discovery. Idempotent.
   */
  start() {
    if (this._running) return;
    this._running = true;
    this._poll();
    const loop = async () => {
      if (!this._running) return;
      await this.discoverPeers();
      if (this._running) this._discoverTimer = setTimeout(loop, this.discoverMs);
    };
    loop();
    /* Fast resume: after tab suspension (mobile especially), don't wait out
       the remaining poll interval — re-signal the moment we're visible again. */
    if (typeof document !== 'undefined' && !this._visHandler) {
      this._visHandler = () => {
        if (document.visibilityState === 'visible' && this._running) {
          if (this._pollTimer) clearTimeout(this._pollTimer);
          this._poll();
        }
      };
      document.addEventListener('visibilitychange', this._visHandler);
    }
  }

  /**
   * Stop the poll loop and discovery. Does not close existing connections.
   */
  stop() {
    this._running = false;
    if (this._pollTimer) clearTimeout(this._pollTimer);
    if (this._discoverTimer) clearTimeout(this._discoverTimer);
    this._pollTimer = null;
    this._discoverTimer = null;
    if (this._visHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this._visHandler);
      this._visHandler = null;
    }
  }

  /**
   * Explicitly add / connect to a peer by handle or DID. Marks the peer
   * TRUSTED (user-initiated pairing), enabling polling and offer/knock
   * exchange for it in the poll loop. Returns an AtprotoRTCConnection
   * immediately (before the handshake completes); listen for 'open'.
   */
  async connect(didOrHandle) {
    const did = didOrHandle.startsWith('did:')
      ? didOrHandle
      : await AtprotoRTC.resolveHandle(didOrHandle);
    if (did === this.me.did) throw new Error("That's you.");
    const pds = await AtprotoRTC.resolvePds(did);
    const handle = didOrHandle.startsWith('did:') ? did : didOrHandle;
    const p = this._upsertPeer(did, handle, pds, true);   /* user-initiated = trusted */
    if (!p.conn) {
      const conn = new AtprotoRTCConnection(did);
      conn.pc = p.pc;
      conn.channel = p.dc;
      p.conn = conn;
    }
    console.debug('[atproto-rtc] connecting to', handle);
    return p.conn;
  }

  /**
   * Mark a previously-discovered (untrusted) peer as trusted, enabling
   * connection attempts. Use from application code driven by onIncoming
   * if not handled synchronously there.
   */
  accept(did) {
    const p = this.peers.get(did);
    if (!p) return;
    p.trusted = true;
    this.emit('statechange', did, p);
  }

  /**
   * Reject/dismiss a discovered peer for this session; further discovery
   * hits for this DID are ignored until page reload.
   */
  ignore(did) {
    this._ignoredDids.add(did);
    const p = this.peers.get(did);
    if (p) {
      if (p.pc) { try { p.pc.close(); } catch (e) {} }
      this.peers.delete(did);
    }
  }

  /**
   * Close a connection and forget the peer's live state (offer/answer
   * rkeys are left for the poll loop / connectionstate handler to clean
   * up as usual).
   */
  disconnect(did) {
    const p = this.peers.get(did);
    if (!p) return;
    if (p.conn) p.conn.close();
    if (p.pc) { try { p.pc.close(); } catch (e) {} }
    p.pc = null; p.dc = null; p.conn = null;
  }

  /**
   * Best-effort cleanup of in-flight signal records for all peers. Call
   * from a `beforeunload` handler. Uses `keepalive: true` fetches.
   */
  teardown() {
    for (const p of this.peers.values()) {
      for (const rkey of [p.offerRkey, p.answerRkey, p.knockRkey]) {
        if (!rkey || !this.me.accessJwt) continue;
        fetch(this.me.pds + '/xrpc/com.atproto.repo.deleteRecord', {
          method: 'POST', keepalive: true,
          headers: { 'Authorization': 'Bearer ' + this.me.accessJwt, 'Content-Type': 'application/json' },
          body: JSON.stringify({ repo: this.me.did, collection: this.collection, rkey: rkey })
        }).catch(() => {});
      }
    }
  }
}
