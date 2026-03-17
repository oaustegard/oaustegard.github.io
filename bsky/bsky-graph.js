/**
 * bsky-graph.js - Shared Bluesky graph exploration utilities
 *
 * Fetches and assembles post constellation data (threads, quote chains,
 * quote webs) using the public Bluesky API.  Used by the constellation
 * graph and thread-reader visualizations.
 */

const API = 'https://public.api.bsky.app/xrpc/';

// ── URL / identity helpers ──────────────────────────────────────────────────

export function parseBskyUrl(url) {
  const m = url.match(/bsky\.app\/profile\/([^/?# \t]+)\/post\/([^/?# \t]+)/);
  return m ? { actor: m[1], rkey: m[2] } : null;
}

export async function resolveToAtUri(input) {
  input = input.trim();
  if (input.startsWith('at://')) return input;
  const parsed = parseBskyUrl(input);
  if (!parsed) throw new Error('Paste a bsky.app post URL or an at:// URI');
  let did = parsed.actor;
  if (!did.startsWith('did:')) {
    const r = await fetch(API + 'com.atproto.identity.resolveHandle?handle=' + encodeURIComponent(did));
    if (!r.ok) throw new Error('Could not resolve handle: ' + did);
    did = (await r.json()).did;
  }
  return 'at://' + did + '/app.bsky.feed.post/' + parsed.rkey;
}

// ── Post / thread fetching ──────────────────────────────────────────────────

export async function fetchThreadDown(atUri, depth = 1000) {
  const r = await fetch(API + 'app.bsky.feed.getPostThread?uri=' + encodeURIComponent(atUri) + '&depth=' + depth + '&parentHeight=0');
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.message || 'API error ' + r.status); }
  return (await r.json()).thread;
}

export async function fetchThreadUp(atUri) {
  const r = await fetch(API + 'app.bsky.feed.getPostThread?uri=' + encodeURIComponent(atUri) + '&depth=0&parentHeight=1000');
  if (!r.ok) return null;
  return (await r.json()).thread;
}

export async function fetchPost(uri) {
  const r = await fetch(API + 'app.bsky.feed.getPostThread?uri=' + encodeURIComponent(uri) + '&depth=0&parentHeight=0');
  if (!r.ok) return null;
  const data = await r.json();
  if (data.thread?.$type !== 'app.bsky.feed.defs#threadViewPost') return null;
  return data.thread.post;
}

// ── Quote fetching ──────────────────────────────────────────────────────────

/** Fetch all posts that quote a given URI (paginated). */
export async function fetchAllQuotePosts(atUri) {
  const allPosts = [];
  let cursor = null;
  do {
    let url = API + 'app.bsky.feed.getQuotes?uri=' + encodeURIComponent(atUri) + '&limit=100';
    if (cursor) url += '&cursor=' + encodeURIComponent(cursor);
    const r = await fetch(url);
    if (!r.ok) break;
    const data = await r.json();
    allPosts.push(...(data.posts || []));
    cursor = data.cursor || null;
  } while (cursor);
  return allPosts;
}

/**
 * Recursively explore the "quote web" — priority-driven BFS outward from
 * one or more seed URIs, fetching who quoted each post.
 *
 * Uses a priority queue ordered by quoteCount (descending) so the most
 * active branches are explored first.  This naturally follows the "spine"
 * of a viral quote chain deeply while also filling in side branches.
 *
 * @param {string|string[]} seedUris   - Starting AT URI(s)
 * @param {Object} [opts]
 * @param {number} [opts.maxTotal=2000]     - Stop after collecting this many posts
 * @param {number} [opts.maxAPICalls=200]   - Stop after this many getQuotes calls
 * @param {Function} [opts.onProgress]      - Called with { fetched, apiCalls }
 * @returns {Promise<{ quoteMap: Map, allQuotePosts: Object[] }>}
 */
export async function fetchQuoteWeb(seedUris, opts = {}) {
  const { maxTotal = 2000, maxAPICalls = 200, onProgress } = opts;
  const quoteMap = new Map();   // parentUri -> [quotePosts]
  const allPosts = [];          // flat array of all discovered quote posts
  const seen = new Set();       // URIs already queued/fetched
  let apiCalls = 0;

  // Accept single URI or array
  const seeds = Array.isArray(seedUris) ? seedUris : [seedUris];
  for (const s of seeds) seen.add(s);

  // Priority queue: explore highest-quoteCount posts first.
  // Each entry: { uri, quoteCount }
  // Simple sorted insert — fine for the expected sizes.
  const queue = seeds.map(s => ({ uri: s, quoteCount: Infinity }));

  const CONCURRENCY = 5;

  while (queue.length > 0 && allPosts.length < maxTotal && apiCalls < maxAPICalls) {
    // Take up to CONCURRENCY items from the front of the queue (highest priority)
    const batch = queue.splice(0, CONCURRENCY);
    apiCalls += batch.length;

    if (onProgress) onProgress({ fetched: allPosts.length, apiCalls });

    const results = await Promise.allSettled(
      batch.map(item => fetchAllQuotePosts(item.uri))
    );

    for (let j = 0; j < batch.length; j++) {
      const parentUri = batch[j].uri;
      const posts = results[j].status === 'fulfilled' ? results[j].value : [];
      if (posts.length) {
        quoteMap.set(parentUri, posts);
        for (const qp of posts) {
          if (!seen.has(qp.uri)) {
            seen.add(qp.uri);
            allPosts.push({ ...qp, _quotedUri: parentUri });
            // Enqueue if this post was also quoted
            if ((qp.quoteCount || 0) > 0) {
              // Insert in sorted order (descending by quoteCount)
              const entry = { uri: qp.uri, quoteCount: qp.quoteCount };
              let idx = queue.findIndex(q => q.quoteCount < entry.quoteCount);
              if (idx === -1) idx = queue.length;
              queue.splice(idx, 0, entry);
            }
          }
          if (allPosts.length >= maxTotal) break;
        }
      }
    }
  }

  return { quoteMap, allQuotePosts: allPosts };
}

// ── Quote-chain helpers (what a post quotes, going deeper) ──────────────────

export function viewRecordToPost(vr) {
  let embed = null;
  if (vr.embeds?.length) {
    if (vr.embeds.length === 1) {
      embed = vr.embeds[0];
    } else {
      const recEmbed = vr.embeds.find(e =>
        e.$type === 'app.bsky.embed.record#view' || e.$type === 'app.bsky.embed.recordWithMedia#view');
      const mediaEmbed = vr.embeds.find(e =>
        e.$type === 'app.bsky.embed.images#view' || e.$type === 'app.bsky.embed.video#view' || e.$type === 'app.bsky.embed.external#view');
      if (recEmbed && mediaEmbed) {
        embed = { $type: 'app.bsky.embed.recordWithMedia#view', media: mediaEmbed, record: recEmbed };
      } else { embed = recEmbed || mediaEmbed; }
    }
  }
  return {
    uri: vr.uri, cid: vr.cid, author: vr.author,
    record: vr.value || {}, embed,
    likeCount: vr.likeCount, repostCount: vr.repostCount, replyCount: vr.replyCount,
    quoteCount: vr.quoteCount, indexedAt: vr.indexedAt
  };
}

/** Extract the inline quote stack from view-level embeds (limited by API depth). */
export function extractQuoteStack(post) {
  const stack = [post];
  let embed = post.embed;
  const seen = new Set([post.uri]);
  while (embed) {
    let vr = null;
    if (embed.$type === 'app.bsky.embed.record#view' && embed.record?.$type === 'app.bsky.embed.record#viewRecord')
      vr = embed.record;
    else if (embed.$type === 'app.bsky.embed.recordWithMedia#view' && embed.record?.record?.$type === 'app.bsky.embed.record#viewRecord')
      vr = embed.record.record;
    if (!vr || seen.has(vr.uri)) break;
    seen.add(vr.uri);
    const fp = viewRecordToPost(vr);
    stack.push(fp);
    embed = fp.embed;
  }
  return stack;
}

/** Get the AT URI of the post that a given post quotes (from record-level embed). */
export function getQuotedUri(post) {
  const rec = post.record || post;
  const emb = rec.embed;
  if (!emb) return null;
  const t = emb.$type;
  if (t === 'app.bsky.embed.record' && emb.record?.uri) return emb.record.uri;
  if (t === 'app.bsky.embed.recordWithMedia' && emb.record?.record?.uri) return emb.record.record.uri;
  return null;
}

/** Follow a quote chain deeper by fetching posts individually past the API inline limit. */
export async function deepenQuoteChain(stack) {
  const seen = new Set(stack.map(p => p.uri));
  let last = stack[stack.length - 1];
  const extra = [];
  for (let i = 0; i < 50; i++) {
    const quotedUri = getQuotedUri(last);
    if (!quotedUri || seen.has(quotedUri)) break;
    const post = await fetchPost(quotedUri);
    if (!post) break;
    seen.add(post.uri);
    extra.push(post);
    last = post;
  }
  return extra;
}

// ── Thread helpers ──────────────────────────────────────────────────────────

export function validReplies(node) {
  return (node.replies || []).filter(r => r.$type === 'app.bsky.feed.defs#threadViewPost');
}

// ── Display helpers ─────────────────────────────────────────────────────────

export function postUrl(p) {
  return 'https://bsky.app/profile/' + p.author.did + '/post/' + p.uri.split('/').pop();
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return 'now';
  if (h < 1) return m + 'm';
  if (d < 1) return h + 'h';
  if (d < 30) return d + 'd';
  return new Date(iso).toLocaleDateString();
}

export function avatarHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}
