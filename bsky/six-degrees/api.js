// Bluesky reads for six-degrees. Every call goes through the scheduler (scheduler.js); every result that
// names an account is cached in IndexedDB for 24 hours under its DID, so a repeat costs nothing against the
// ceiling. Without IndexedDB (Node, private windows that refuse it) the cache lives in memory.

export const APPVIEW = 'https://public.api.bsky.app';
export const CONSTELLATION = 'https://constellation.microcosm.blue';
export const PLC = 'https://plc.directory';
export const TTL_MS = 24 * 3600 * 1000;

// ---------------------------------------------------------------- cache

export function createCache({ name = 'six-degrees', ttl = TTL_MS, now = () => Date.now() } = {}) {
  const mem = new Map();
  let dbp = null;
  if (typeof indexedDB !== 'undefined') {
    dbp = new Promise((resolve) => {
      try {
        const req = indexedDB.open(name, 1);
        req.onupgradeneeded = () => req.result.createObjectStore('kv');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
  }
  const tx = async (mode, fn) => {
    const db = dbp && await dbp;
    if (!db) return undefined;
    return new Promise((resolve) => {
      try {
        const t = db.transaction('kv', mode), st = t.objectStore('kv');
        const req = fn(st);
        t.oncomplete = () => resolve(req?.result);
        t.onerror = t.onabort = () => resolve(undefined);
      } catch { resolve(undefined); }
    });
  };
  return {
    async get(key) {
      let e = mem.get(key);
      if (!e) { e = await tx('readonly', (st) => st.get(key)); if (e) mem.set(key, e); }
      if (!e || now() - e.t > ttl) return undefined;
      return e.v;
    },
    async set(key, v) {
      const e = { t: now(), v };
      mem.set(key, e);
      await tx('readwrite', (st) => st.put(e, key));
    },
    async clear() { mem.clear(); await tx('readwrite', (st) => st.clear()); },
    async count() { const n = await tx('readonly', (st) => st.count()); return n ?? mem.size; },
  };
}

// ---------------------------------------------------------------- api

const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; };
export const pagesFor = (count) => Math.max(1, Math.ceil((count || 0) / 100));

function qs(params) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) for (const x of v) u.append(k, x); else u.append(k, v);
  }
  return u.toString();
}

// A small profile record, the fields the page shows and the metrics use.
export function slim(p) {
  if (!p) return null;
  return {
    did: p.did, handle: p.handle, displayName: p.displayName || '', avatar: p.avatar || '',
    description: p.description || '', followersCount: p.followersCount ?? null, followsCount: p.followsCount ?? null,
    postsCount: p.postsCount ?? null, createdAt: p.createdAt || null, indexedAt: p.indexedAt || null,
    labels: (p.labels || []).map((l) => ({ val: l.val, src: l.src })),
    verified: p.verification?.verifiedStatus === 'valid', verifier: p.verification?.trustedVerifierStatus === 'valid',
  };
}

export function createApi({ sched, cache = createCache(), appview = APPVIEW } = {}) {
  const get = (base, nsid, params) => sched.fetchJSON(`${base}/xrpc/${nsid}?${qs(params)}`);
  const xrpc = (nsid, params) => get(appview, nsid, params);

  // HTTP 400 from the AppView means the account is gone, deactivated or never existed.
  const orNull = (p) => p.catch((e) => { if (e?.status === 400 || e?.status === 404) return null; throw e; });

  async function resolve(actor) {
    actor = String(actor || '').trim().replace(/^@/, '').replace(/^https?:\/\/bsky\.app\/profile\//, '').replace(/\/.*$/, '');
    if (!actor) throw new Error('no account given');
    if (actor.startsWith('did:')) { const m = await profiles([actor]); const p = m.get(actor); if (p) return p; }
    const p = await orNull(xrpc('app.bsky.actor.getProfile', { actor }));
    if (!p) throw new Error(`no Bluesky account ${actor}`);
    const s = slim(p);
    await cache.set(`p:${s.did}`, s);
    return s;
  }

  // Profiles for many DIDs, 25 per call; cached ones cost nothing. Returns Map did -> slim profile.
  async function profiles(dids, onProgress) {
    const out = new Map(), need = [];
    for (const d of new Set(dids)) { const c = await cache.get(`p:${d}`); if (c) out.set(d, c); else need.push(d); }
    let done = 0;
    await Promise.all(chunk(need, 25).map(async (c) => {
      const res = await orNull(xrpc('app.bsky.actor.getProfiles', { actors: c }));
      for (const p of res?.profiles || []) { const s = slim(p); out.set(s.did, s); await cache.set(`p:${s.did}`, s); }
      done += c.length; onProgress?.(done, need.length);
    }));
    return out;
  }

  // Calls profiles() would make for these DIDs, after the cache.
  async function profileCost(dids) {
    let n = 0;
    for (const d of new Set(dids)) if (!(await cache.get(`p:${d}`))) n++;
    return Math.ceil(n / 25);
  }

  // Follows ('follows') or followers ('followers') of a DID, up to maxPages pages of 100.
  // Returns {dids, complete, pages}; the page-1 profile views are kept too, for handles and avatars.
  async function graph(kind, did, maxPages = Infinity) {
    const key = `g:${kind}:${did}`;
    const c = await cache.get(key);
    if (c && (c.complete || c.pages >= maxPages)) return c;
    const nsid = kind === 'follows' ? 'app.bsky.graph.getFollows' : 'app.bsky.graph.getFollowers';
    const dids = [], views = [];
    let cursor, pages = 0;
    while (pages < maxPages) {
      const res = await orNull(xrpc(nsid, { actor: did, limit: 100, cursor }));
      pages++;
      if (!res) { cursor = undefined; break; }
      for (const x of res[kind] || []) { dids.push(x.did); views.push({ did: x.did, handle: x.handle, displayName: x.displayName || '', avatar: x.avatar || '', createdAt: x.createdAt || null }); }
      cursor = res.cursor;
      if (!cursor || !(res[kind] || []).length) { cursor = undefined; break; }
    }
    const out = { dids, complete: !cursor, pages };
    await cache.set(key, out);
    for (const v of views) if (!(await cache.get(`v:${v.did}`))) await cache.set(`v:${v.did}`, v);
    return out;
  }
  const graphCached = async (kind, did) => { const c = await cache.get(`g:${kind}:${did}`); return c?.complete ? c : null; };

  // Which of `others` follow `target` (followedBy) and which `target` follows (following); 30 per call.
  async function relationships(target, others) {
    const out = new Map();
    await Promise.all(chunk([...new Set(others)], 30).map(async (c) => {
      const res = await orNull(xrpc('app.bsky.graph.getRelationships', { actor: target, others: c }));
      for (const r of res?.relationships || []) if (r.did) out.set(r.did, { followedBy: !!r.followedBy, following: !!r.following });
    }));
    return out;
  }

  // The PDS that holds a DID's repo.
  async function pds(did) {
    const key = `pds:${did}`;
    const c = await cache.get(key);
    if (c) return c;
    let doc;
    if (did.startsWith('did:plc:')) doc = await sched.fetchJSON(`${PLC}/${did}`);
    else if (did.startsWith('did:web:')) doc = await sched.fetchJSON(`https://${decodeURIComponent(did.slice(8))}/.well-known/did.json`);
    else throw new Error(`unknown DID method: ${did}`);
    const svc = (doc.service || []).find((s) => s.id === '#atproto_pds' || s.type === 'AtprotoPersonalDataServer');
    if (!svc) throw new Error(`${did} names no PDS`);
    const url = String(svc.serviceEndpoint).replace(/\/$/, '');
    await cache.set(key, url);
    return url;
  }

  // Every record of a collection in a repo, read from its own PDS. Returns {records:[{rkey, value}], complete, pages}.
  async function listRecords(did, collection, maxPages = Infinity, onPage) {
    const key = `r:${collection}:${did}`;
    const c = await cache.get(key);
    if (c && (c.complete || c.pages >= maxPages)) return c;
    const base = await pds(did);
    const records = [];
    let cursor, pages = 0;
    while (pages < maxPages) {
      const res = await orNull(get(base, 'com.atproto.repo.listRecords', { repo: did, collection, limit: 100, cursor }));
      pages++;
      if (!res) { cursor = undefined; break; }
      for (const r of res.records || []) records.push({ rkey: r.uri.split('/').pop(), value: r.value });
      onPage?.(pages, records.length);
      cursor = res.cursor;
      if (!cursor || !(res.records || []).length) { cursor = undefined; break; }
    }
    const out = { records, complete: !cursor, pages };
    await cache.set(key, out);
    return out;
  }

  // An account's own posts, newest first (no reposts), up to `limit` of them.
  async function authorFeed(did, limit = 10) {
    const key = `f:${limit}:${did}`;
    const c = await cache.get(key);
    if (c) return c;
    const posts = [];
    let cursor, pages = 0;
    while (posts.length < limit && pages++ < Math.ceil(limit / 100)) {   // one call per 100 asked for, reposts or not
      const res = await orNull(xrpc('app.bsky.feed.getAuthorFeed', { actor: did, limit: Math.min(100, limit - posts.length), cursor, filter: 'posts_with_replies' }));
      if (!res) break;
      for (const f of res.feed || []) {
        if (f.reason || f.post?.author?.did !== did) continue;          // reposts
        const r = f.post.record || {};
        posts.push({ uri: f.post.uri, text: r.text || '', createdAt: r.createdAt || f.post.indexedAt, langs: r.langs || [], reply: !!r.reply });
      }
      cursor = res.cursor;
      if (!cursor || !(res.feed || []).length) break;
    }
    const out = { posts: posts.slice(0, limit) };
    await cache.set(key, out);
    return out;
  }

  // Constellation backlinks: records in `collection` whose `path` points at `target`. One page per call.
  async function links(target, collection, path, cursor, limit = 100) {
    const u = `${CONSTELLATION}/links?${qs({ target, collection, path, limit, cursor })}`;
    return sched.fetchJSON(u);
  }
  async function linksCount(target, collection, path) {
    const u = `${CONSTELLATION}/links/count?${qs({ target, collection, path })}`;
    return (await sched.fetchJSON(u)).total ?? 0;
  }

  const getRecord = (repo, collection, rkey) => orNull(xrpc('com.atproto.repo.getRecord', { repo, collection, rkey }));

  return { xrpc, resolve, profiles, profileCost, graph, graphCached, relationships, pds, listRecords, authorFeed,
    links, linksCount, getRecord, cache, sched, orNull };
}
