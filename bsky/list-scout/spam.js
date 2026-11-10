// Signs that an account is a feed of links, a repeater or a hashtag stuffer, read from its last posts and
// nothing else: no search terms and no topic model, so they hold for any list. List Scout hides accounts that
// trip one (scout.js); the person reviewing can show them again. No DOM here, so node can test it
// (tests/list-scout-spam.mjs).

const hasLink = (r) => r?.embed?.$type === 'app.bsky.embed.external'
  || (r?.facets || []).some((f) => (f.features || []).some((x) => x.$type === 'app.bsky.richtext.facet#link'))
  || /https?:\/\//.test(r?.text || '');
const tagCount = (r) => {
  const inFacets = (r?.facets || []).reduce((n, f) => n + (f.features || []).filter((x) => x.$type === 'app.bsky.richtext.facet#tag').length, 0);
  return Math.max(inFacets, ((r?.text || '').match(/(^|\s)#[\p{L}\p{N}_]+/gu) || []).length);
};
// What is left of a post once links, tags, digits and punctuation are gone: two posts with the same first 60
// characters of that say the same thing. Posts with under 20 such characters ("good morning!") are not compared.
const gist = (t) => (t || '').toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(/#[\p{L}\p{N}_]+/gu, ' ')
  .replace(/[^\p{L} ]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);

// records: the app.bsky.feed.post records of an account's own posts and replies (reposts left out).
// Returns { n, linkFrac, dupFrac, tagRate }: the share of posts carrying a link, the share whose text repeats
// another of the account's posts, and the mean number of hashtags per post.
export function spamSignals(records) {
  const n = records.length;
  if (!n) return { n: 0, linkFrac: 0, dupFrac: 0, tagRate: 0 };
  const seen = new Map();
  for (const r of records) { const g = gist(r.text); if (g.length >= 20) seen.set(g, (seen.get(g) || 0) + 1); }
  let links = 0, dups = 0, tags = 0;
  for (const r of records) {
    if (hasLink(r)) links++;
    if ((seen.get(gist(r.text)) || 0) > 1) dups++;
    tags += tagCount(r);
  }
  return { n, linkFrac: links / n, dupFrac: dups / n, tagRate: tags / n };
}

export const SPAM_LIMITS = { linkFrac: 0.8, linkMaxReplies: 0.3, dupFrac: 0.3, tagRate: 3, minPosts: 10 };

// The reasons, as short labels, that these signals look like spam; empty when none do. replyFrac is the share
// of the account's posts that are replies: an account that links in most posts but also talks to people (a
// blogger, an artist) is left alone.
export function spamReasons(sig, replyFrac, lim = SPAM_LIMITS) {
  const out = [];
  if (sig.n < lim.minPosts) return out;
  if (sig.linkFrac >= lim.linkFrac && replyFrac < lim.linkMaxReplies) out.push('mostly links');
  if (sig.dupFrac >= lim.dupFrac) out.push('repeats itself');
  if (sig.tagRate >= lim.tagRate) out.push('hashtag-heavy');
  return out;
}
