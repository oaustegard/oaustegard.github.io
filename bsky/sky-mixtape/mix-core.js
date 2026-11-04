// Sky Mixtape core: pure functions shared by the page and the Node tests.
// Posts -> tag profile -> ranked tracks, with ratings folded back in.

/** Decode the int8 tag vectors shipped in catalog.json into Float32Arrays. */
export function decodeTagVectors(catalog) {
  return catalog.tagVec.map(({ s, b }) => {
    const bin = typeof atob === 'function'
      ? Uint8Array.from(atob(b), c => c.charCodeAt(0))
      : Uint8Array.from(Buffer.from(b, 'base64'));
    const i8 = new Int8Array(bin.buffer, bin.byteOffset, bin.byteLength);
    const v = new Float32Array(i8.length);
    let n = 0;
    for (let k = 0; k < i8.length; k++) { v[k] = i8[k] * s; n += v[k] * v[k]; }
    n = Math.sqrt(n) || 1;
    for (let k = 0; k < v.length; k++) v[k] /= n;
    return v;
  });
}

function dot(a, b) { let s = 0; for (let k = 0; k < a.length; k++) s += a[k] * b[k]; return s; }

/** Text a post contributes: body, image alt text, link card title and description. */
export function postText(post) {
  const r = post.record || {};
  const parts = [r.text || ''];
  const e = r.embed || {};
  const imgs = e.images || e.media?.images || [];
  for (const im of imgs) if (im.alt) parts.push(im.alt);
  const ext = e.external || e.media?.external;
  if (ext) parts.push([ext.title, ext.description].filter(Boolean).join('. '));
  return parts.join('\n').replace(/https?:\/\/\S+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Map post embeddings onto the tag vocabulary.
 * Each similarity is z-scored against that tag's mean and spread over a
 * sample of ordinary Bluesky posts, so a tag only counts when these posts sit
 * closer to it than posts usually do. Each post spreads one unit of weight
 * over its strongest tags (softmax over the top `perPost`).
 * Returns { weights: Float64Array, evidence: [[postIndex, z], ...] per tag }.
 */
export function tagProfile(postVecs, tagVecs, stats, { perPost = 4, zMin = 1.0, temp = 0.6 } = {}) {
  const nT = tagVecs.length;
  const weights = new Float64Array(nT);
  const evidence = Array.from({ length: nT }, () => []);
  postVecs.forEach((p, i) => {
    const z = tagVecs.map((t, j) => (dot(p, t) - stats[j][0]) / (stats[j][1] || 1));
    const top = z.map((v, j) => [v, j]).filter(([v]) => v >= zMin)
      .sort((a, b) => b[0] - a[0]).slice(0, perPost);
    if (!top.length) return;
    const ex = top.map(([v]) => Math.exp((v - top[0][0]) / temp));
    const sum = ex.reduce((a, b) => a + b, 0);
    top.forEach(([v, j], k) => { weights[j] += ex[k] / sum; evidence[j].push([i, v]); });
  });
  for (const ev of evidence) ev.sort((a, b) => b[1] - a[1]);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  for (let j = 0; j < nT; j++) weights[j] /= total;
  return { weights, evidence };
}

/** Normalized key for a song, used for rating record keys and dedupe. */
export function songKey(artist, title) {
  const n = s => (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  return `${n(artist)}|${n(title)}`;
}

/**
 * Fold ratings into the profile. Each rating moves the tags of its song by
 * rating / (number of tags), scaled to the profile's own size, and disliked
 * songs and artists are remembered so selection can skip or damp them.
 * ratings: [{ key, artistKey, rating: 1|-1, tags: [tagId] }]
 */
export function applyFeedback(weights, ratings, tagIndex, { strength = 0.6 } = {}) {
  const w = Float64Array.from(weights);
  const adj = new Float64Array(w.length);
  const liked = new Set(), disliked = new Set(), artistScore = new Map();
  for (const r of ratings) {
    const idx = (r.tags || []).map(t => tagIndex.get(t)).filter(j => j !== undefined);
    for (const j of idx) adj[j] += r.rating / idx.length;
    (r.rating > 0 ? liked : disliked).add(r.key);
    artistScore.set(r.artistKey, (artistScore.get(r.artistKey) || 0) + r.rating);
  }
  const mean = 1 / w.length;
  const nRated = Math.max(1, ratings.length);
  for (let j = 0; j < w.length; j++) {
    // a tag nobody's posts touched can still be pulled in by liked songs
    w[j] = Math.max(0, w[j] + strength * adj[j] / nRated * (w[j] + 4 * mean));
  }
  const total = w.reduce((a, b) => a + b, 0) || 1;
  for (let j = 0; j < w.length; j++) w[j] /= total;
  return { weights: w, liked, disliked, artistScore };
}

/** Seeded PRNG so a mix can be regenerated exactly (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick `n` tracks. Score = sum of profile weight over the track's tags, plus a
 * popularity term, plus Gumbel noise scaled by `adventure` (0 = safest picks,
 * 1 = loosest). After each pick the weights of its tags decay, so the mix moves
 * across the profile instead of filling up from the single strongest tag.
 * Disliked songs are skipped; artists with net dislikes are damped; liked songs
 * get a lift so a retune keeps some of what worked.
 */
export function selectTracks(catalog, weights, {
  n = 25, adventure = 0.35, seed = 1, feedback = null, perArtist = 1, decay = 0.55,
} = {}) {
  const rand = rng(seed);
  const w = Float64Array.from(weights);
  const tracks = catalog.tracks;
  const maxLogRank = Math.log1p(catalog.maxRank || 1e6);
  const noise = tracks.map(() => -Math.log(-Math.log(rand() + 1e-12) + 1e-12));
  const artistCount = new Map();
  const picked = [];
  const used = new Set();
  const fb = feedback || { liked: new Set(), disliked: new Set(), artistScore: new Map() };
  const meanW = 1 / w.length;
  for (let step = 0; step < n; step++) {
    let best = -Infinity, bestI = -1, bestTag = -1;
    for (let i = 0; i < tracks.length; i++) {
      if (used.has(i)) continue;
      const tr = tracks[i];
      if (fb.disliked.has(tr.key)) continue;
      if ((artistCount.get(tr.ak) || 0) >= perArtist) continue;
      let s = 0, topTag = -1, topV = 0;
      for (const j of tr.t) { s += w[j]; if (w[j] > topV) { topV = w[j]; topTag = j; } }
      if (topV <= 0) continue;
      s /= meanW; // in units of an average tag's weight
      const pop = Math.log1p(tr.r || 0) / maxLogRank; // 0..1
      s *= 0.6 + 0.8 * pop * (1 - 0.7 * adventure);
      const as = fb.artistScore.get(tr.ak) || 0;
      if (as < 0) s *= Math.pow(0.5, -as);
      if (fb.liked.has(tr.key)) s *= 1.5;
      s = Math.log(s + 1e-9) + adventure * 1.2 * noise[i];
      if (s > best) { best = s; bestI = i; bestTag = topTag; }
    }
    if (bestI < 0) break;
    used.add(bestI);
    const tr = tracks[bestI];
    artistCount.set(tr.ak, (artistCount.get(tr.ak) || 0) + 1);
    picked.push({ index: bestI, why: bestTag });
    for (const j of tr.t) w[j] *= decay;
  }
  return picked;
}

/** Top tags of a profile as [{ j, w }], strongest first. */
export function topTags(weights, k = 12) {
  return Array.from(weights, (w, j) => ({ j, w })).filter(x => x.w > 0)
    .sort((a, b) => b.w - a.w).slice(0, k);
}
