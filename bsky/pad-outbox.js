/**
 * pad-outbox.js — carries a pad's content over ATProto itself.
 *
 * Each participant keeps ONE record in their own repo:
 *
 *   at://<their did>/com.austegard.pad.outbox/<docId>
 *
 * holding the whole Yjs document state, AES-GCM encrypted with a key that
 * lives only in the share link's #fragment (browsers never send fragments
 * to any server). Readers fetch every participant's record and merge them;
 * Yjs updates commute and are idempotent, so the order and repetition of
 * reads does not matter, and nobody has to be online at the same time.
 *
 * Who participates: the pad's owner (the "root", whose DID is the share
 * link's ?peer=) plus anyone whose outbox record carries
 *   ref: at://<root did>/com.austegard.pad.outbox/<docId>
 * found through the Constellation backlink index.
 *
 * What is public: that a record exists, its size, its update times and
 * which DIDs reference which root. What is not: the text, which is only
 * ciphertext without the fragment key.
 *
 * Reads are unauthenticated getRecord calls, so a guest can read without
 * logging in. Writes need a session (via AtprotoRTC's _pdsCall) and are
 * throttled: putRecord costs 2 of the PDS's 5000 points/hour.
 */

export const COLLECTION = 'com.austegard.pad.outbox';
const enc = new TextEncoder();

/* ---------- base64url ---------- */

export function b64u(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function unb64u(str) {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/* ---------- key + sealing ---------- */

/** A fresh 256-bit key as base64url, for the link fragment. */
export function newKeyString() {
  return b64u(crypto.getRandomValues(new Uint8Array(32)));
}

export async function importKey(keyString) {
  const raw = unb64u(keyString);
  if (raw.length !== 32) throw new Error('pad key must be 32 bytes');
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

const canCompress = typeof CompressionStream !== 'undefined';
async function pipe(bytes, stream) {
  const buf = await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * Encrypt `bytes` for document `docId`. The docId is bound in as AAD, so a
 * record cannot be replayed as the content of a different pad.
 */
export async function seal(key, docId, bytes) {
  const z = canCompress;
  const plain = z ? await pipe(bytes, new CompressionStream('deflate-raw')) : bytes;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: enc.encode(docId) }, key, plain));
  return { v: 1, z, iv: b64u(iv), ct: b64u(ct) };
}

/** Inverse of seal. Throws on a wrong key, wrong docId or tampering. */
export async function unseal(key, docId, rec) {
  if (rec.v !== 1) throw new Error('unknown outbox version ' + rec.v);
  const plain = new Uint8Array(await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: unb64u(rec.iv), additionalData: enc.encode(docId) }, key, unb64u(rec.ct)));
  if (!rec.z) return plain;
  if (!canCompress) throw new Error('this browser cannot decompress pad records');
  return pipe(plain, new DecompressionStream('deflate-raw'));
}

/* ---------- the outbox ---------- */

export class PadOutbox {
  /**
   * @param {Object} o
   * @param {Object} o.Y          the Yjs module
   * @param {Y.Doc}  o.ydoc
   * @param {string} o.docId      also the record key
   * @param {CryptoKey} o.key
   * @param {string} o.rootDid    owner of the pad (the share link's peer)
   * @param {Object} o.rtc        AtprotoRTC: me + _pdsCall for writes, resolvePds for reads
   * @param {*}      o.origin     transaction origin for applied remote state
   * @param {Function} [o.onStatus]  (status) => void, see this.status
   * @param {number} [o.pollMs=4000]
   * @param {number} [o.discoverMs=20000]
   * @param {number} [o.publishMs=5000]  minimum gap between writes
   */
  constructor(o) {
    Object.assign(this, {
      pollMs: 4000, discoverMs: 20000, publishMs: 5000, onStatus: () => {}
    }, o);
    this.rootUri = `at://${this.rootDid}/${COLLECTION}/${this.docId}`;
    this.sources = new Map();     /* did -> { pds, cid, error } */
    this.sources.set(this.rootDid, { pds: null, cid: null, error: null });
    this.publishing = false;
    this.status = { rootFound: null, readers: 0, lastPublish: null, lastError: null, merged: 0 };
    this._timer = null;
    this._lastDiscover = 0;
    this._lastPublishAt = 0;
    this._publishTimer = null;
    this._dirty = false;
    this._running = false;
  }

  _emit(patch) { Object.assign(this.status, patch); this.onStatus(this.status); }

  /* ----- reading ----- */

  async _pds(did) {
    const s = this.sources.get(did);
    if (s && s.pds) return s.pds;
    const pds = await this.rtc.constructor.resolvePds(did);
    if (s) s.pds = pds;
    return pds;
  }

  /** Read one participant's record; merge it if it changed. */
  async readSource(did) {
    const s = this.sources.get(did);
    const pds = await this._pds(did);
    const q = new URLSearchParams({ repo: did, collection: COLLECTION, rkey: this.docId });
    const r = await fetch(pds + '/xrpc/com.atproto.repo.getRecord?' + q);
    if (r.status === 400 || r.status === 404) {   /* RecordNotFound comes back as 400 */
      if (did === this.rootDid) this._emit({ rootFound: false });
      return false;
    }
    if (!r.ok) throw new Error('getRecord ' + r.status);
    const j = await r.json();
    if (did === this.rootDid) this._emit({ rootFound: true });
    if (j.cid && j.cid === s.cid) return false;
    const update = await unseal(this.key, this.docId, j.value || {});
    this.Y.applyUpdate(this.ydoc, update, this.origin);
    s.cid = j.cid;
    this._emit({ merged: this.status.merged + 1 });
    return true;
  }

  /** Find participants through Constellation backlinks to the root record. */
  async discover() {
    const q = 'https://constellation.microcosm.blue/xrpc/blue.microcosm.links.getBacklinks?' +
      new URLSearchParams({ subject: this.rootUri, source: COLLECTION + ':ref', limit: '100' });
    const r = await fetch(q);
    if (!r.ok) throw new Error('getBacklinks ' + r.status);
    const j = await r.json();
    for (const rec of (j.records || [])) {
      if (rec.rkey !== this.docId || this.sources.has(rec.did)) continue;
      this.sources.set(rec.did, { pds: null, cid: null, error: null });
    }
  }

  async pollOnce() {
    if (Date.now() - this._lastDiscover > this.discoverMs) {
      this._lastDiscover = Date.now();
      try { await this.discover(); } catch (e) { console.debug('[pad-outbox] discover', e.message); }
    }
    let readers = 0;
    await Promise.all([...this.sources.keys()].map(async (did) => {
      try { await this.readSource(did); this.sources.get(did).error = null; readers++; }
      catch (e) {
        this.sources.get(did).error = e.message;
        this._emit({ lastError: e.message });
        console.debug('[pad-outbox] read', did, e.message);
      }
    }));
    this._emit({ readers });
  }

  start() {
    if (this._running) return;
    this._running = true;
    const tick = async () => {
      if (!this._running) return;
      if (typeof document === 'undefined' || document.visibilityState !== 'hidden') await this.pollOnce();
      if (this._running) this._timer = setTimeout(tick, this.pollMs);
    };
    tick();
  }

  stop() {
    this._running = false;
    clearTimeout(this._timer);
  }

  /** Poll now (e.g. on returning to the foreground). */
  kick() {
    if (!this._running) return;
    clearTimeout(this._timer);
    this._running = false;
    this.start();
  }

  /* ----- writing ----- */

  /** Allow writes. Publishes the current state straight away. */
  enablePublishing() {
    this.publishing = true;
    this._dirty = true;
    return this.flush();
  }

  /** Note a local change; writes at most once per publishMs. */
  markDirty() {
    if (!this.publishing) return;
    this._dirty = true;
    if (this._publishTimer) return;
    const wait = Math.max(0, this._lastPublishAt + this.publishMs - Date.now());
    this._publishTimer = setTimeout(() => { this._publishTimer = null; this.flush(); }, wait);
  }

  async flush() {
    if (!this.publishing || !this._dirty || !this.rtc.me || !this.rtc.me.did) return;
    this._dirty = false;
    this._lastPublishAt = Date.now();
    try {
      const sealed = await seal(this.key, this.docId, this.Y.encodeStateAsUpdate(this.ydoc));
      if (sealed.ct.length > 900000) throw new Error('pad too large to publish (~' + Math.round(sealed.ct.length / 1024) + ' KB)');
      const record = { $type: COLLECTION, doc: this.docId, ...sealed, updatedAt: new Date().toISOString() };
      if (this.rtc.me.did !== this.rootDid) record.ref = this.rootUri;
      await this.rtc._pdsCall('com.atproto.repo.putRecord', {
        method: 'POST',
        body: { repo: this.rtc.me.did, collection: COLLECTION, rkey: this.docId, record }
      });
      if (!this.sources.has(this.rtc.me.did)) this.sources.set(this.rtc.me.did, { pds: this.rtc.me.pds, cid: null, error: null });
      this._emit({ lastPublish: Date.now(), lastError: null });
    } catch (e) {
      this._dirty = true;   /* retry on the next change or flush */
      this._emit({ lastError: e.message });
      console.debug('[pad-outbox] publish', e.message);
    }
  }

  /** Stop writing and delete our record (the ciphertext leaves the PDS). */
  async unpublish() {
    this.publishing = false;
    clearTimeout(this._publishTimer); this._publishTimer = null;
    if (!this.rtc.me || !this.rtc.me.did) return;
    try {
      await this.rtc._pdsCall('com.atproto.repo.deleteRecord', {
        method: 'POST',
        body: { repo: this.rtc.me.did, collection: COLLECTION, rkey: this.docId }
      });
    } catch (e) { console.debug('[pad-outbox] unpublish', e.message); }
  }
}
