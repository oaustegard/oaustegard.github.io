// Network metrics for one Bluesky account, in tiers of rising cost. Each tier has estimate(ctx) -> calls,
// which spends nothing (tier 4 spends one call to count), and run(ctx, progress) -> result. ctx is
// {api, me, data}; `data` carries what earlier tiers fetched (follows, followers, profiles) so a later tier
// reuses it, and the cache makes repeats free in any case.

import { pagesFor } from './api.js';

const DAY = 86400e3;
const ymd = (t) => new Date(t).toISOString().slice(0, 10);

// ---------------------------------------------------------------- small statistics

export function seeded(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

export function sample(arr, n, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
function quantile(sorted, q) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

// Percentile bootstrap: stat(indices) over resamples of 0..n-1 with replacement.
export function bootstrap(n, stat, reps = 2000, rnd = seeded(42)) {
  const out = [];
  const idx = new Array(n);
  for (let r = 0; r < reps; r++) {
    for (let i = 0; i < n; i++) idx[i] = Math.floor(rnd() * n);
    const v = stat(idx);
    if (Number.isFinite(v)) out.push(v);
  }
  out.sort((a, b) => a - b);
  return { lo: quantile(out, 0.025), hi: quantile(out, 0.975) };
}

export function jaccard(a, b) {
  if (!a.size && !b.size) return NaN;
  let inter = 0;
  const [s, l] = a.size < b.size ? [a, b] : [b, a];
  for (const x of s) if (l.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

// Count values into ordered buckets. buckets: [{label, test(v)}]
function bucketize(values, buckets) {
  const counts = buckets.map((b) => ({ label: b.label, n: 0 }));
  for (const v of values) { const i = buckets.findIndex((b) => b.test(v)); if (i >= 0) counts[i].n++; }
  return counts;
}
function tally(values, top = 12) {
  const m = new Map();
  for (const v of values) m.set(v, (m.get(v) || 0) + 1);
  const rows = [...m].sort((a, b) => b[1] - a[1]);
  const head = rows.slice(0, top).map(([label, n]) => ({ label, n }));
  const rest = rows.slice(top).reduce((s, r) => s + r[1], 0);
  if (rest) head.push({ label: `${rows.length - top} others`, n: rest });
  return head;
}

// ---------------------------------------------------------------- profile classifications

export function handleKind(h = '') {
  if (h === 'handle.invalid') return 'invalid handle';
  if (h.endsWith('.ap.brid.gy')) return 'bridged from the fediverse (ap.brid.gy)';
  if (h.endsWith('.brid.gy')) return 'bridged from the web (brid.gy)';
  if (h.endsWith('.bsky.social')) return 'bsky.social';
  return 'custom domain or other host';
}
export function handleSuffix(h = '') {
  const parts = h.split('.');
  if (h.endsWith('.ap.brid.gy') || h.endsWith('.web.brid.gy')) return parts.slice(-3).join('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : h;
}

const POSTS = [
  { label: '0', test: (v) => v === 0 }, { label: '1–9', test: (v) => v < 10 }, { label: '10–99', test: (v) => v < 100 },
  { label: '100–999', test: (v) => v < 1000 }, { label: '1k–9.9k', test: (v) => v < 10000 }, { label: '10k+', test: () => true },
];
const RATIO = [
  { label: 'follows nobody', test: (p) => !p.followsCount },
  { label: 'under 0.1', test: (p) => p.followersCount / p.followsCount < 0.1 },
  { label: '0.1–0.5', test: (p) => p.followersCount / p.followsCount < 0.5 },
  { label: '0.5–1', test: (p) => p.followersCount / p.followsCount < 1 },
  { label: '1–2', test: (p) => p.followersCount / p.followsCount < 2 },
  { label: '2–10', test: (p) => p.followersCount / p.followsCount < 10 },
  { label: '10 and up', test: () => true },
];

function describe(profs) {
  const ps = profs.filter(Boolean);
  const years = tally(ps.map((p) => (p.createdAt ? new Date(p.createdAt).getUTCFullYear() : 'unknown')), 50)
    .sort((a, b) => String(a.label).localeCompare(String(b.label)));
  return {
    n: ps.length,
    years,
    posts: bucketize(ps.map((p) => p.postsCount ?? 0), POSTS),
    ratio: bucketize(ps, RATIO),
    kinds: tally(ps.map((p) => handleKind(p.handle))),
    suffixes: tally(ps.map((p) => handleSuffix(p.handle)), 10),
    labels: tally(ps.flatMap((p) => p.labels.map((l) => (l.src === p.did ? `${l.val} (self)` : l.val))), 12),
    verified: ps.filter((p) => p.verified).length,
    verifiers: ps.filter((p) => p.verifier).length,
  };
}

// ---------------------------------------------------------------- shared fetches

async function ownLists(ctx, progress) {
  const { api, me, data } = ctx;
  if (!data.follows) { progress?.('reading follows'); data.follows = (await api.graph('follows', me.did)).dids; }
  if (!data.followers) { progress?.('reading followers'); data.followers = (await api.graph('followers', me.did)).dids; }
  return data;
}
async function ownListsCost(ctx) {
  const { api, me, data } = ctx;
  let n = 0;
  if (!data.follows && !(await api.graphCached('follows', me.did))) n += pagesFor(me.followsCount);
  if (!data.followers && !(await api.graphCached('followers', me.did))) n += pagesFor(me.followersCount);
  return n;
}
async function profilesOf(ctx, dids, progress) {
  const { api, data } = ctx;
  data.profiles ||= new Map();
  const need = dids.filter((d) => !data.profiles.has(d));
  if (need.length) {
    const m = await api.profiles(need, (d, t) => progress?.(`profiles ${d}/${t}`, d / t));
    for (const [k, v] of m) data.profiles.set(k, v);
  }
  return data.profiles;
}

// ---------------------------------------------------------------- tiers

export const TIERS = [];

// 1. follows, followers, mutuals, who doesn't follow back, and what kind of accounts they are
TIERS.push({
  id: 1, name: 'Follows and followers',
  blurb: 'Follows, followers, mutuals, and who doesn’t follow back either way; when those accounts were made, how much they post, their followers per follow, handle domains, labels, verification.',
  async estimate(ctx) {
    const { me, data } = ctx;
    const known = data.profiles?.size || 0;
    return (await ownListsCost(ctx)) + Math.ceil(Math.max(0, (me.followsCount || 0) + (me.followersCount || 0) - known) / 25);
  },
  async run(ctx, progress) {
    const d = await ownLists(ctx, progress);
    const F = new Set(d.follows), R = new Set(d.followers);
    const profs = await profilesOf(ctx, [...new Set([...F, ...R])], progress);
    const rows = (set) => [...set].map((x) => profs.get(x) || { did: x, handle: '(deleted or hidden)', labels: [] });
    const mutual = [...F].filter((x) => R.has(x));
    const notBack = [...F].filter((x) => !R.has(x));
    const fans = [...R].filter((x) => !F.has(x));
    return {
      counts: { follows: F.size, followers: R.size, mutuals: mutual.length, notBack: notBack.length, fans: fans.length,
        missingProfiles: [...new Set([...F, ...R])].filter((x) => !profs.has(x)).length },
      sets: {
        follows: rows(F), followers: rows(R), mutuals: rows(mutual),
        'not following back': rows(notBack), 'followers you don’t follow': rows(fans),
      },
      follows: describe([...F].map((x) => profs.get(x))),
      followers: describe([...R].map((x) => profs.get(x))),
    };
  },
});

// 2. follow records from the account's own repo: when each follow happened, and follows the AppView hides
TIERS.push({
  id: 2, name: 'Follow timeline',
  blurb: 'The account’s own follow records, read from its PDS (the server that stores them): when each follow happened, and follows of accounts Bluesky no longer shows.',
  async estimate(ctx) {
    const { api, me } = ctx;
    const cached = await api.cache.get(`r:app.bsky.graph.follow:${me.did}`);
    if (cached?.complete) return 0;
    const pds = (await api.cache.get(`pds:${me.did}`)) ? 0 : 1;
    return pds + pagesFor((me.followsCount || 0) * 1.05) + (await ownListsCost({ ...ctx, data: { ...ctx.data, followers: [] } }));
  },
  async run(ctx, progress) {
    const { api, me, data } = ctx;
    progress?.('resolving your PDS');
    const pds = await api.pds(me.did);
    const recs = await api.listRecords(me.did, 'app.bsky.graph.follow', Infinity, (p, n) => progress?.(`${n} follow records`));
    if (!data.follows) data.follows = (await api.graph('follows', me.did)).dids;
    const shown = new Set(data.follows);
    const bySubject = new Map();
    for (const r of recs.records) {
      const s = r.value?.subject; if (!s) continue;
      if (!bySubject.has(s)) bySubject.set(s, []);
      bySubject.get(s).push(r.value.createdAt);
    }
    const months = new Map();
    for (const r of recs.records) {
      const t = r.value?.createdAt; if (!t) continue;
      const k = t.slice(0, 7);
      months.set(k, (months.get(k) || 0) + 1);
    }
    const keys = [...months.keys()].sort();
    const timeline = [];
    if (keys.length) {
      let [y, m] = keys[0].split('-').map(Number);
      const [y1, m1] = keys[keys.length - 1].split('-').map(Number);
      while (y < y1 || (y === y1 && m <= m1)) { const k = `${y}-${String(m).padStart(2, '0')}`; timeline.push({ label: k, n: months.get(k) || 0 }); if (++m > 12) { m = 1; y++; } }
    }
    const hidden = [...bySubject.keys()].filter((s) => !shown.has(s));
    const dup = [...bySubject].filter(([, v]) => v.length > 1).length;
    const recent = recs.records.filter((r) => r.value?.createdAt).sort((a, b) => b.value.createdAt.localeCompare(a.value.createdAt));
    return {
      pds, records: recs.records.length, subjects: bySubject.size, shown: shown.size, hidden: hidden.length, duplicates: dup,
      first: recent.length ? recent[recent.length - 1].value.createdAt : null, last: recent[0]?.value.createdAt || null,
      timeline,
      sets: {
        'follows the AppView doesn’t show': hidden.map((d) => ({ did: d, handle: '(deleted, deactivated or taken down)', followedAt: bySubject.get(d)[0], labels: [] })),
      },
      followedAt: Object.fromEntries([...bySubject].map(([k, v]) => [k, v.sort()[0]])),
    };
  },
});

// 3. one call per follow: last post (dormant accounts), languages, posting hours
// The middle of the quietest six hours, in UTC; when several six-hour windows tie (a long quiet night), the
// circular mean of their middles.
export function quietestHour(hist) {
  const sums = Array.from({ length: 24 }, (_, h) => { let s = 0; for (let k = 0; k < 6; k++) s += hist[(h + k) % 24]; return s; });
  const min = Math.min(...sums);
  let x = 0, y = 0;
  sums.forEach((s, h) => { if (s === min) { const a = ((h + 3) / 24) * 2 * Math.PI; x += Math.cos(a); y += Math.sin(a); } });
  return ((Math.atan2(y, x) / (2 * Math.PI)) * 24 + 24) % 24;
}
// People are quietest around 03:45 local, so that hour in UTC gives the offset.
export function utcOffsetFromHours(hist) {
  let off = Math.round(3.75 - quietestHour(hist));
  off = ((off % 24) + 24) % 24;
  if (off > 14) off -= 24;
  return off;
}

TIERS.push({
  id: 3, name: 'Recent posts of each follow',
  blurb: 'One call for each account followed: when it last posted (none in 90 days counts as dormant), the language it posts in, and the hours it posts, which hint at a timezone. The account’s own last 100 posts give its posting hours.',
  async estimate(ctx) {
    const { api, me, data } = ctx;
    const ids = data.follows || [];
    let n = data.follows ? 0 : await ownListsCost({ ...ctx, data: { ...data, followers: [] } });
    if (data.follows) { for (const d of ids) if (!(await api.cache.get(`f:10:${d}`))) n++; }
    else n += me.followsCount || 0;
    if (!(await api.cache.get(`f:100:${me.did}`))) n += 1;
    return n;
  },
  async run(ctx, progress) {
    const { api, me, data } = ctx;
    if (!data.follows) data.follows = (await api.graph('follows', me.did)).dids;
    progress?.('your own posts');
    const own = await api.authorFeed(me.did, 100);
    const ownHours = new Array(24).fill(0);
    for (const p of own.posts) ownHours[new Date(p.createdAt).getUTCHours()]++;
    const now = Date.now(), per = [];
    let done = 0;
    await Promise.all(data.follows.map(async (did) => {
      const f = await api.authorFeed(did, 10);
      per.push({ did, posts: f.posts });
      done++; if (done % 10 === 0 || done === data.follows.length) progress?.(`posts of ${done}/${data.follows.length} follows`, done / data.follows.length);
    }));
    data.posts = per;                                   // kept for the classifier (second phase)
    const netHours = new Array(24).fill(0);
    const langOf = [], ages = [], dormant = [];
    for (const { did, posts } of per) {
      for (const p of posts) netHours[new Date(p.createdAt).getUTCHours()]++;
      const langs = tally(posts.flatMap((p) => p.langs.length ? [p.langs[0]] : []), 1);
      langOf.push(langs[0]?.label || 'none given');
      const last = posts.reduce((m, p) => Math.max(m, Date.parse(p.createdAt) || 0), 0);
      ages.push(last ? (now - last) / DAY : Infinity);
      if (!last || now - last > 90 * DAY) dormant.push({ did, last });
    }
    const AGE = [
      { label: 'past week', test: (v) => v <= 7 }, { label: '8–30 days', test: (v) => v <= 30 },
      { label: '31–90 days', test: (v) => v <= 90 }, { label: '91 days – 1 year', test: (v) => v <= 365 },
      { label: 'over a year', test: (v) => Number.isFinite(v) }, { label: 'no posts', test: () => true },
    ];
    const profs = data.profiles || new Map();
    return {
      n: per.length,
      lastPost: bucketize(ages, AGE),
      langs: tally(langOf, 12),
      ownHours, ownPosts: own.posts.length, ownOffset: own.posts.length >= 20 ? utcOffsetFromHours(ownHours) : null,
      netHours, netOffset: utcOffsetFromHours(netHours),
      sets: {
        'dormant follows (no post in 90 days)': dormant.sort((a, b) => a.last - b.last).map(({ did, last }) => ({
          ...(profs.get(did) || { did, handle: did, labels: [] }), lastPost: last ? ymd(last) : 'never',
        })),
      },
    };
  },
});

// 4. Constellation backlinks: lists and starter packs that include the account (moderation lists left out)
TIERS.push({
  id: 4, name: 'Lists and starter packs',
  blurb: 'Curated lists and starter packs that include the account, found through Constellation, a community-run index of which records point at which. Moderation (block and mute) lists are left out.',
  async estimate(ctx) {
    const { api, me, data } = ctx;
    if (data.listitemCount === undefined) data.listitemCount = await api.linksCount(me.did, 'app.bsky.graph.listitem', '.subject');
    const n = data.listitemCount;
    // pages of backlinks, a getRecord and a getList per item, starter-pack lookups for a share of them
    return Math.ceil(n / 100) + 2 * n + Math.ceil(n / 4);
  },
  async run(ctx, progress) {
    const { api, me } = ctx;
    const items = [];
    let cursor;
    do {
      const res = await api.links(me.did, 'app.bsky.graph.listitem', '.subject', cursor);
      items.push(...(res.linking_records || []));
      cursor = res.cursor;
      progress?.(`${items.length} list entries`);
    } while (cursor);
    let done = 0;
    const listUris = new Map();             // list uri -> listitem createdAt
    await Promise.all(items.map(async (it) => {
      const r = await api.getRecord(it.did, it.collection, it.rkey);
      const u = r?.value?.list;
      if (u && !listUris.has(u)) listUris.set(u, r.value.createdAt);
      if (++done % 10 === 0) progress?.(`list entries read ${done}/${items.length}`, done / items.length / 2);
    }));
    const lists = [];
    done = 0;
    await Promise.all([...listUris].map(async ([uri, added]) => {
      const res = await api.orNull(api.xrpc('app.bsky.graph.getList', { list: uri, limit: 1 }));
      const l = res?.list;
      if (l) lists.push({ uri, name: l.name, purpose: (l.purpose || '').split('#')[1] || l.purpose, owner: l.creator?.handle || '', ownerDid: l.creator?.did, items: l.listItemCount ?? null, description: l.description || '', added });
      if (++done % 10 === 0) progress?.(`lists ${done}/${listUris.size}`, 0.5 + done / listUris.size / 2);
    }));
    const kept = lists.filter((l) => l.purpose !== 'modlist');
    const refs = kept.filter((l) => l.purpose === 'referencelist');
    const packUris = [];
    for (const l of refs) {
      const res = await api.links(l.uri, 'app.bsky.graph.starterpack', '.list');
      for (const r of res.linking_records || []) packUris.push(`at://${r.did}/${r.collection}/${r.rkey}`);
    }
    const packs = [];
    for (let i = 0; i < packUris.length; i += 25) {
      const res = await api.orNull(api.xrpc('app.bsky.graph.getStarterPacks', { uris: packUris.slice(i, i + 25) }));
      for (const p of res?.starterPacks || []) packs.push({ uri: p.uri, name: p.record?.name || '', owner: p.creator?.handle || '', joined: p.joinedAllTimeCount ?? null, items: p.listItemCount ?? null });
    }
    const curated = kept.filter((l) => l.purpose !== 'referencelist');
    return {
      entries: items.length, lists: curated.length, packs: packs.length, modlistsLeftOut: lists.length - kept.length,
      table: { lists: curated.sort((a, b) => (b.items || 0) - (a.items || 0)), packs },
      exports: { lists: curated, 'starter packs': packs },
    };
  },
});

// 5. echo-chamber sample
TIERS.push({
  id: 5, name: 'Echo-chamber sample',
  blurb: 'The follow lists of a random sample of the account’s follows: what share of its other follows each one follows too (density; higher means a tighter circle), and how alike their follows are to its own and to each other (Jaccard), with bootstrap 95% intervals.',
  params: { n: 100, pageCap: 10 },
  async estimate(ctx, p = this.params) {
    const { me, data } = ctx;
    if (!data.follows || !data.profiles) return (await ownListsCost(ctx)) + Math.ceil((me.followsCount || 0) / 25) + p.n * 3;
    const pool = data.follows.filter((d) => (data.profiles.get(d)?.followsCount ?? Infinity) <= p.pageCap * 100);
    const avg = pool.length ? pool.reduce((s, d) => s + pagesFor(data.profiles.get(d).followsCount), 0) / pool.length : 0;
    return Math.ceil(Math.min(p.n, pool.length) * avg);
  },
  async run(ctx, progress, p = this.params) {
    const { api, me, data } = ctx;
    if (!data.follows) data.follows = (await api.graph('follows', me.did)).dids;
    const profs = await profilesOf(ctx, data.follows, progress);
    const F = new Set(data.follows);
    const pool = data.follows.filter((d) => (profs.get(d)?.followsCount ?? Infinity) <= p.pageCap * 100);
    const picked = sample(pool, p.n, seeded(Date.now() % 1e9));
    let done = 0;
    const lists = await Promise.all(picked.map(async (d) => {
      const g = await api.graph('follows', d, p.pageCap);
      if (++done % 5 === 0) progress?.(`follow lists ${done}/${picked.length}`, done / picked.length);
      return new Set(g.dids);
    }));
    const n = picked.length;
    const dens = lists.map((s, i) => { let k = 0; for (const x of s) if (F.has(x) && x !== picked[i]) k++; return F.size > 1 ? k / (F.size - 1) : NaN; });
    const jMe = lists.map((s) => jaccard(s, F));
    const J = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) J[i][j] = J[j][i] = jaccard(lists[i], lists[j]);
    const pairMean = (idx) => {
      let s = 0, c = 0;
      for (let a = 0; a < idx.length; a++) for (let b = a + 1; b < idx.length; b++) {
        if (idx[a] === idx[b]) continue;
        const v = J[idx[a]][idx[b]]; if (Number.isFinite(v)) { s += v; c++; }
      }
      return c ? s / c : NaN;
    };
    const all = Array.from({ length: n }, (_, i) => i);
    const fin = (xs) => xs.filter(Number.isFinite);
    const ci = (xs) => bootstrap(n, (idx) => mean(fin(idx.map((i) => xs[i]))));
    const followsMe = picked.filter((d) => (data.followers || []).includes(d)).length;
    return {
      n, pool: pool.length, excluded: data.follows.length - pool.length, pageCap: p.pageCap,
      density: { mean: mean(fin(dens)), ...ci(dens) },
      jaccardMe: { mean: mean(fin(jMe)), ...ci(jMe) },
      jaccardPairs: { mean: pairMean(all), ...bootstrap(n, pairMean, 400) },
      followsMe: data.followers ? followsMe : null,
      sets: {
        'sampled follows': picked.map((d, i) => ({ ...(profs.get(d) || { did: d, handle: d, labels: [] }),
          followsOfYours: Math.round(dens[i] * (F.size - 1)), jaccardWithYou: +jMe[i].toFixed(4) })),
      },
    };
  },
});

// 6. full ego network: who among your follows follows whom; communities and bridges
TIERS.push({
  id: 6, name: 'Full ego network',
  blurb: 'The follow records of every account followed, read from each one’s own server, which spreads the requests over many hosts. Then communities (Louvain) and the accounts that bridge them (betweenness). Long; a stopped run resumes from the cache.',
  params: { maxPages: 50 },
  async estimate(ctx, p = this.params) {
    const { api, me, data } = ctx;
    if (!data.follows || !data.profiles) return (await ownListsCost(ctx)) + Math.ceil((me.followsCount || 0) / 25) + (me.followsCount || 0) * 10;
    let n = 0;
    for (const d of data.follows) {
      if ((await api.cache.get(`r:app.bsky.graph.follow:${d}`))) continue;
      const pr = data.profiles.get(d);
      if (!pr) continue;
      const pg = pagesFor((pr.followsCount || 0) * 1.05);
      if (pg > p.maxPages) continue;
      n += pg + ((await api.cache.get(`pds:${d}`)) ? 0 : 1);
    }
    return n;
  },
  async run(ctx, progress, p = this.params) {
    const { api, me, data } = ctx;
    if (!data.follows) data.follows = (await api.graph('follows', me.did)).dids;
    const profs = await profilesOf(ctx, data.follows, progress);
    const nodes = data.follows.filter((d) => profs.has(d));
    const idx = new Map(nodes.map((d, i) => [d, i]));
    const out = nodes.map(() => []);
    const skipped = [], failed = [];
    let done = 0, next = 0;
    const work = async () => {
      while (next < nodes.length) {
        const i = next++, d = nodes[i];
        const pg = pagesFor((profs.get(d).followsCount || 0) * 1.05);
        if (pg > p.maxPages) { skipped.push(d); }
        else {
          let subjects;
          try { subjects = (await api.listRecords(d, 'app.bsky.graph.follow', p.maxPages)).records.map((r) => r.value?.subject); }
          catch (e) {
            if (e?.name === 'CancelledError') throw e;
            try { subjects = (await api.graph('follows', d, p.maxPages)).dids; } catch (e2) { if (e2?.name === 'CancelledError') throw e2; failed.push(d); subjects = []; }
          }
          const s = new Set();
          for (const x of subjects) { const j = idx.get(x); if (j !== undefined && j !== i) s.add(j); }
          out[i] = [...s];
        }
        done++;
        progress?.(`follow lists ${done}/${nodes.length}`, done / nodes.length);
      }
    };
    await Promise.all(Array.from({ length: 24 }, work));
    progress?.('finding communities');
    const g = egoAnalysis(out);
    const label = (i) => profs.get(nodes[i]);
    const comms = g.communities.map((members, c) => ({
      id: c, size: members.length,
      top: members.slice().sort((a, b) => g.within[b] - g.within[a]).slice(0, 5).map((i) => label(i)?.handle),
      members: members.map((i) => nodes[i]),
    })).sort((a, b) => b.size - a.size);
    const order = new Map(comms.map((c, k) => [c.id, k]));
    const bridges = nodes.map((d, i) => ({ i, b: g.betweenness[i], pc: g.participation[i] }))
      .sort((a, b) => b.b - a.b).slice(0, 30)
      .map(({ i, b, pc }) => ({ ...label(i), betweenness: +b.toFixed(5), participation: +pc.toFixed(3), community: order.get(g.community[i]) + 1 }));
    return {
      n: nodes.length, edges: g.edges, mutualEdges: g.mutualEdges, density: g.density, modularity: g.modularity,
      skipped: skipped.length, failed: failed.length, maxPages: p.maxPages,
      communities: comms.map((c) => ({ ...c, rank: order.get(c.id) + 1 })),
      graph: { nodes, out, community: g.community.map((c) => order.get(c)) },
      exports: { communities: comms.map((c, k) => ({ rank: k + 1, size: c.size, mostConnected: c.top.join(' ') })) },
      sets: {
        'bridge accounts': bridges,
        ...Object.fromEntries(comms.slice(0, 8).map((c, k) => [`community ${k + 1} (${c.size})`, c.members.map((d) => ({ ...(profs.get(d) || { did: d, handle: d, labels: [] }), community: k + 1 }))])),
      },
    };
  },
});

// 7. two accounts compared
TIERS.push({
  id: 7, name: 'Two accounts compared',
  blurb: 'Shared follows and shared followers of this account and the second one typed below, with Jaccard overlap of each.',
  needsOther: true,
  async estimate(ctx) {
    const { api, me, other } = ctx;
    if (!other) return 0;
    let n = 0;
    for (const p of [me, other]) for (const k of ['follows', 'followers']) if (!(await api.graphCached(k, p.did))) n += pagesFor(p[k === 'follows' ? 'followsCount' : 'followersCount']);
    return n + Math.ceil(Math.min(me.followsCount + me.followersCount, other.followsCount + other.followersCount) / 25 / 4);
  },
  async run(ctx, progress) {
    const { api, me, other } = ctx;
    const [af, ar, bf, br] = await Promise.all([
      api.graph('follows', me.did), api.graph('followers', me.did), api.graph('follows', other.did), api.graph('followers', other.did)]);
    const A = { f: new Set(af.dids), r: new Set(ar.dids) }, B = { f: new Set(bf.dids), r: new Set(br.dids) };
    const sharedF = [...A.f].filter((d) => B.f.has(d)), sharedR = [...A.r].filter((d) => B.r.has(d));
    const profs = await api.profiles([...sharedF, ...sharedR], (d, t) => progress?.(`profiles ${d}/${t}`, d / t));
    const rows = (ds) => ds.map((d) => profs.get(d) || { did: d, handle: '(deleted or hidden)', labels: [] });
    return {
      a: me, b: other,
      aFollowsB: A.f.has(other.did), bFollowsA: B.f.has(me.did),
      follows: { a: A.f.size, b: B.f.size, shared: sharedF.length, jaccard: jaccard(A.f, B.f) },
      followers: { a: A.r.size, b: B.r.size, shared: sharedR.length, jaccard: jaccard(A.r, B.r) },
      sets: { 'shared follows': rows(sharedF), 'shared followers': rows(sharedR) },
    };
  },
});

// ---------------------------------------------------------------- graph analysis

// out[i] = indices i follows. Undirected view for communities and betweenness.
export function egoAnalysis(out) {
  const n = out.length;
  const nb = Array.from({ length: n }, () => new Set());
  let edges = 0, mutualEdges = 0;
  for (let i = 0; i < n; i++) for (const j of out[i]) { edges++; nb[i].add(j); nb[j].add(i); }
  const outSets = out.map((l) => new Set(l));
  for (let i = 0; i < n; i++) for (const j of out[i]) if (j > i && outSets[j].has(i)) mutualEdges++;
  const adj = nb.map((s) => [...s]);
  const { community, modularity } = louvain(adj);
  const groups = new Map();
  community.forEach((c, i) => { if (!groups.has(c)) groups.set(c, []); groups.get(c).push(i); });
  const within = adj.map((l, i) => l.filter((j) => community[j] === community[i]).length);
  const participation = adj.map((l, i) => {
    if (!l.length) return 0;
    const m = new Map(); for (const j of l) m.set(community[j], (m.get(community[j]) || 0) + 1);
    let s = 0; for (const v of m.values()) s += (v / l.length) ** 2;
    return 1 - s;
  });
  return {
    edges, mutualEdges, density: n > 1 ? edges / (n * (n - 1)) : 0,
    community, modularity, communities: [...groups.values()], within, participation,
    betweenness: betweenness(adj),
  };
}

// Louvain modularity optimisation on an unweighted undirected graph given as adjacency lists.
export function louvain(adj, rnd = seeded(7)) {
  const n0 = adj.length;
  // weighted graph: nodes with Map neighbour -> weight (self loops allowed)
  let g = adj.map((l) => { const m = new Map(); for (const j of l) m.set(j, (m.get(j) || 0) + 1); return m; });
  let member = Array.from({ length: n0 }, (_, i) => i);   // original node -> current super-node
  const m2 = g.reduce((s, m) => s + [...m.values()].reduce((a, b) => a + b, 0), 0);   // 2m
  if (!m2) return { community: member, modularity: 0 };
  for (let level = 0; level < 20; level++) {
    const n = g.length;
    const k = g.map((m) => { let s = 0; for (const [j, w] of m) s += j === undefined ? 0 : w; return s; });
    const comm = Array.from({ length: n }, (_, i) => i);
    const tot = k.slice();
    let moved = true, any = false, sweeps = 0;
    const order = sample(Array.from({ length: n }, (_, i) => i), n, rnd);
    while (moved && sweeps++ < 50) {
      moved = false;
      for (const i of order) {
        const ci = comm[i];
        const wTo = new Map();
        for (const [j, w] of g[i]) if (j !== i) wTo.set(comm[j], (wTo.get(comm[j]) || 0) + w);
        tot[ci] -= k[i];
        let best = ci, gain = (wTo.get(ci) || 0) - (tot[ci] * k[i]) / m2;
        for (const [c, w] of wTo) {
          const gn = w - (tot[c] * k[i]) / m2;
          if (gn > gain + 1e-12) { gain = gn; best = c; }
        }
        tot[best] += k[i];
        if (best !== ci) { comm[i] = best; moved = true; any = true; }
      }
    }
    if (!any) break;
    // renumber and aggregate
    const ids = new Map(); for (const c of comm) if (!ids.has(c)) ids.set(c, ids.size);
    member = member.map((s) => ids.get(comm[s]));
    const ng = Array.from({ length: ids.size }, () => new Map());
    for (let i = 0; i < n; i++) for (const [j, w] of g[i]) { const a = ids.get(comm[i]), b = ids.get(comm[j]); ng[a].set(b, (ng[a].get(b) || 0) + w); }
    g = ng;
  }
  // modularity of the final partition on the original graph
  const deg = adj.map((l) => l.length);
  const totC = new Map(); member.forEach((c, i) => totC.set(c, (totC.get(c) || 0) + deg[i]));
  let inW = 0; adj.forEach((l, i) => { for (const j of l) if (member[j] === member[i]) inW++; });
  let q = inW / m2; for (const t of totC.values()) q -= (t / m2) ** 2;
  return { community: member, modularity: q };
}

// Brandes betweenness, undirected, normalised to [0, 1].
export function betweenness(adj) {
  const n = adj.length, cb = new Float64Array(n);
  const S = new Int32Array(n), dist = new Int32Array(n), sigma = new Float64Array(n), delta = new Float64Array(n), Q = new Int32Array(n);
  for (let s = 0; s < n; s++) {
    dist.fill(-1); sigma.fill(0); delta.fill(0);
    dist[s] = 0; sigma[s] = 1;
    let qh = 0, qt = 0, sp = 0;
    Q[qt++] = s;
    while (qh < qt) {
      const v = Q[qh++]; S[sp++] = v;
      for (const w of adj[v]) {
        if (dist[w] < 0) { dist[w] = dist[v] + 1; Q[qt++] = w; }
        if (dist[w] === dist[v] + 1) sigma[w] += sigma[v];
      }
    }
    while (sp > 0) {
      const w = S[--sp];
      for (const v of adj[w]) if (dist[v] === dist[w] - 1) delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      if (w !== s) cb[w] += delta[w];
    }
  }
  const norm = n > 2 ? (n - 1) * (n - 2) : 1;           // undirected: each pair counted twice above
  return Array.from(cb, (v) => v / norm);
}
