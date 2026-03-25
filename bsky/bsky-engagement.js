/**
 * bsky-engagement.js — Client-side Bluesky engagement widget
 * 
 * Drop-in widget that shows comments, likes, and reposts from a linked
 * Bluesky post. No auth required (uses public API). Progressive enhancement:
 * fails silently if API is unreachable.
 *
 * Usage:
 *   <div data-bsky-uri="https://bsky.app/profile/austegard.com/post/abc123"></div>
 *   <script src="/bsky/bsky-engagement.js" defer></script>
 *
 * Or with an AT URI directly:
 *   <div data-bsky-uri="at://did:plc:xxx/app.bsky.feed.post/abc123"></div>
 *
 * Configuration via data attributes:
 *   data-bsky-uri       — Required. bsky.app URL or AT URI
 *   data-bsky-max-depth — Max reply nesting depth (default: 3)
 *   data-bsky-sort      — Sort replies: "newest" | "oldest" | "likes" (default: "likes")
 *   data-bsky-show      — What to show: "all" | "comments" | "stats" (default: "all")
 *   data-bsky-theme     — "light" | "dark" | "auto" (default: "auto")
 *
 * Emits custom events on the container:
 *   bsky:loaded  — detail: { post, replies, likes }
 *   bsky:error   — detail: { error }
 *
 * @license MIT
 * @version 1.0.0
 */

const BSKY_PUBLIC_API = 'https://public.api.bsky.app/xrpc';

/* ── Styles ────────────────────────────────────────────────────────── */

const WIDGET_CSS = `
  .bsky-engagement {
    --bsky-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --bsky-text: #1a1a2e;
    --bsky-text-secondary: #64748b;
    --bsky-bg: transparent;
    --bsky-bg-hover: rgba(0, 0, 0, 0.04);
    --bsky-border: rgba(0, 0, 0, 0.12);
    --bsky-accent: #0085ff;
    --bsky-accent-subtle: rgba(0, 133, 255, 0.08);
    --bsky-heart: #ec4899;
    --bsky-repost: #22c55e;
    --bsky-reply: #0085ff;
    --bsky-radius: 8px;

    font-family: var(--bsky-font);
    color: var(--bsky-text);
    line-height: 1.5;
    max-width: 100%;
  }

  .bsky-engagement[data-theme="dark"],
  .bsky-engagement.bsky-dark {
    --bsky-text: #e2e8f0;
    --bsky-text-secondary: #94a3b8;
    --bsky-bg: transparent;
    --bsky-bg-hover: rgba(255, 255, 255, 0.06);
    --bsky-border: rgba(255, 255, 255, 0.12);
    --bsky-accent-subtle: rgba(0, 133, 255, 0.15);
  }

  @media (prefers-color-scheme: dark) {
    .bsky-engagement[data-theme="auto"] {
      --bsky-text: #e2e8f0;
      --bsky-text-secondary: #94a3b8;
      --bsky-bg: transparent;
      --bsky-bg-hover: rgba(255, 255, 255, 0.06);
      --bsky-border: rgba(255, 255, 255, 0.12);
      --bsky-accent-subtle: rgba(0, 133, 255, 0.15);
    }
  }

  /* ── Stats bar ── */
  .bsky-stats {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 0.75rem 0;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }

  .bsky-stat {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.875rem;
    color: var(--bsky-text-secondary);
    text-decoration: none;
  }

  .bsky-stat:hover { color: var(--bsky-text); }

  .bsky-stat svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .bsky-stat-count {
    font-weight: 600;
    color: var(--bsky-text);
  }

  /* ── Like avatars ── */
  .bsky-likers {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0;
    padding: 0.5rem 0;
    margin-bottom: 0.75rem;
  }

  .bsky-liker-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--bsky-avatar-ring, #fff);
    margin-left: -6px;
    object-fit: cover;
    transition: transform 0.15s ease;
  }

  .bsky-liker-avatar:first-child { margin-left: 0; }
  .bsky-liker-avatar:hover {
    transform: scale(1.2);
    z-index: 1;
    position: relative;
  }

  .bsky-likers-overflow {
    font-size: 0.8rem;
    color: var(--bsky-text-secondary);
    margin-left: 0.5rem;
  }

  /* ── CTA ── */
  .bsky-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
    color: var(--bsky-accent);
    text-decoration: none;
    padding: 0.4rem 0;
    margin-bottom: 0.5rem;
  }

  .bsky-cta:hover { text-decoration: underline; }

  .bsky-cta svg {
    width: 14px;
    height: 14px;
  }

  /* ── Quote posts ── */
  .bsky-quotes-list {
    list-style: none;
    padding: 0;
    margin: 0 0 0.75rem 0;
  }

  .bsky-quote {
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--bsky-border);
  }

  .bsky-quote:last-child { border-bottom: none; }

  .bsky-quotes-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--bsky-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  /* ── Comments ── */
  .bsky-comments-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .bsky-comment {
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--bsky-border);
  }

  .bsky-comment:last-child { border-bottom: none; }

  .bsky-comment-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .bsky-comment-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .bsky-comment-author {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--bsky-text);
    text-decoration: none;
  }

  .bsky-comment-author:hover { color: var(--bsky-accent); }

  .bsky-comment-handle {
    font-size: 0.8rem;
    color: var(--bsky-text-secondary);
  }

  .bsky-comment-time {
    font-size: 0.75rem;
    color: var(--bsky-text-secondary);
    margin-left: auto;
    text-decoration: none;
  }

  .bsky-comment-time:hover { color: var(--bsky-text); }

  .bsky-comment-body {
    font-size: 0.9rem;
    color: var(--bsky-text);
    margin: 0.2rem 0 0.2rem 2.25rem;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .bsky-comment-body a {
    color: var(--bsky-accent);
    text-decoration: none;
  }
  .bsky-comment-body a:hover { text-decoration: underline; }

  .bsky-comment-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: 2.25rem;
    margin-top: 0.15rem;
  }

  .bsky-comment-stat {
    font-size: 0.75rem;
    color: var(--bsky-text-secondary);
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }

  .bsky-comment-stat svg {
    width: 12px;
    height: 12px;
  }

  /* ── Nested replies ── */
  .bsky-replies {
    list-style: none;
    padding-left: 1.5rem;
    margin: 0;
    border-left: 2px solid var(--bsky-border);
    margin-left: 0.75rem;
  }

  /* ── Loading ── */
  .bsky-loading {
    text-align: center;
    padding: 1rem;
    color: var(--bsky-text-secondary);
    font-size: 0.875rem;
  }

  .bsky-loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid var(--bsky-border);
    border-top-color: var(--bsky-accent);
    border-radius: 50%;
    animation: bsky-spin 0.6s linear infinite;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  @keyframes bsky-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Empty state ── */
  .bsky-empty {
    text-align: center;
    padding: 1.5rem 1rem;
    color: var(--bsky-text-secondary);
    font-size: 0.875rem;
  }
`;

/* ── SVG Icons ─────────────────────────────────────────────────────── */

const ICONS = {
  heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  repost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>',
  reply: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  butterfly: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5c-2.49 0-4.5-2.01-4.5-4.5S8.51 8.5 11 8.5c.83 0 1-.5 1-1s-.17-1-1-1c-3.58 0-6.5 2.92-6.5 6.5s2.92 6.5 6.5 6.5c.83 0 1-.5 1-1s-.17-1-1-1zm2 0c-.83 0-1 .5-1 1s.17 1 1 1c3.58 0 6.5-2.92 6.5-6.5S16.58 6.5 13 6.5c-.83 0-1 .5-1 1s.17 1 1 1c2.49 0 4.5 2.01 4.5 4.5s-2.01 4.5-4.5 4.5z"/></svg>'
};

/* ── Utilities ─────────────────────────────────────────────────────── */

/**
 * Parse a bsky.app URL or AT URI into { handle/did, rkey }.
 * Accepts:
 *   https://bsky.app/profile/handle.tld/post/rkey
 *   at://did:plc:xxx/app.bsky.feed.post/rkey
 */
function parsePostUri(input) {
  input = input.trim();

  // AT URI
  const atMatch = input.match(/^at:\/\/(.+?)\/app\.bsky\.feed\.post\/(.+)$/);
  if (atMatch) return { actor: atMatch[1], rkey: atMatch[2] };

  // bsky.app URL
  const urlMatch = input.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/?#]+)/);
  if (urlMatch) return { actor: urlMatch[1], rkey: urlMatch[2] };

  return null;
}

/** Resolve a handle to a DID via the public API (if not already a DID). */
async function resolveActor(actor) {
  if (actor.startsWith('did:')) return actor;
  const resp = await fetch(`${BSKY_PUBLIC_API}/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(actor)}`);
  if (!resp.ok) throw new Error(`Failed to resolve handle: ${actor}`);
  const data = await resp.json();
  return data.did;
}

/** Build an AT URI from actor + rkey. */
function makeAtUri(did, rkey) {
  return `at://${did}/app.bsky.feed.post/${rkey}`;
}

/** Build a bsky.app permalink for a post. */
function makeBskyUrl(handle, rkey) {
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

/** Relative time string. */
function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

/**
 * Process Bluesky rich text facets into HTML.
 * Handles mentions, links, and hashtags.
 */
function renderRichText(text, facets) {
  if (!facets || facets.length === 0) return escapeHtml(text);

  // Bluesky facets use byte offsets (UTF-8), JS strings are UTF-16.
  // Convert text to UTF-8 byte array for correct slicing.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(text);

  // Sort facets by byte start
  const sorted = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart);

  let html = '';
  let lastByte = 0;

  for (const facet of sorted) {
    const start = facet.index.byteStart;
    const end = facet.index.byteEnd;

    // Text before this facet
    if (start > lastByte) {
      html += escapeHtml(decoder.decode(bytes.slice(lastByte, start)));
    }

    const facetText = decoder.decode(bytes.slice(start, end));
    const feature = facet.features?.[0];

    if (feature?.$type === 'app.bsky.richtext.facet#link') {
      html += `<a href="${escapeHtml(feature.uri)}" target="_blank" rel="noopener">${escapeHtml(facetText)}</a>`;
    } else if (feature?.$type === 'app.bsky.richtext.facet#mention') {
      html += `<a href="https://bsky.app/profile/${escapeHtml(feature.did)}" target="_blank" rel="noopener">${escapeHtml(facetText)}</a>`;
    } else if (feature?.$type === 'app.bsky.richtext.facet#tag') {
      html += `<a href="https://bsky.app/search?q=%23${encodeURIComponent(feature.tag)}" target="_blank" rel="noopener">${escapeHtml(facetText)}</a>`;
    } else {
      html += escapeHtml(facetText);
    }

    lastByte = end;
  }

  // Remaining text
  if (lastByte < bytes.length) {
    html += escapeHtml(decoder.decode(bytes.slice(lastByte)));
  }

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── API Calls ─────────────────────────────────────────────────────── */

async function fetchThread(atUri, depth = 6) {
  const resp = await fetch(
    `${BSKY_PUBLIC_API}/app.bsky.feed.getPostThread?uri=${encodeURIComponent(atUri)}&depth=${depth}`
  );
  if (!resp.ok) throw new Error(`Thread fetch failed: ${resp.status}`);
  return resp.json();
}

async function fetchLikes(atUri, limit = 50) {
  const resp = await fetch(
    `${BSKY_PUBLIC_API}/app.bsky.feed.getLikes?uri=${encodeURIComponent(atUri)}&limit=${limit}`
  );
  if (!resp.ok) throw new Error(`Likes fetch failed: ${resp.status}`);
  return resp.json();
}

async function fetchQuotes(atUri, limit = 25) {
  const resp = await fetch(
    `${BSKY_PUBLIC_API}/app.bsky.feed.getQuotes?uri=${encodeURIComponent(atUri)}&limit=${limit}`
  );
  if (!resp.ok) throw new Error(`Quotes fetch failed: ${resp.status}`);
  return resp.json();
}

/* ── Rendering ─────────────────────────────────────────────────────── */

function renderStats(post, bskyUrl) {
  const likes = post.likeCount || 0;
  const reposts = (post.repostCount || 0) + (post.quoteCount || 0);
  const replies = post.replyCount || 0;

  return `
    <div class="bsky-stats">
      <a href="${bskyUrl}" target="_blank" rel="noopener" class="bsky-stat" title="${likes} likes">
        <span style="color:var(--bsky-heart)">${ICONS.heart}</span>
        <span class="bsky-stat-count">${likes}</span>
        <span>like${likes !== 1 ? 's' : ''}</span>
      </a>
      <a href="${bskyUrl}" target="_blank" rel="noopener" class="bsky-stat" title="${reposts} reposts">
        <span style="color:var(--bsky-repost)">${ICONS.repost}</span>
        <span class="bsky-stat-count">${reposts}</span>
        <span>repost${reposts !== 1 ? 's' : ''}</span>
      </a>
      <a href="${bskyUrl}" target="_blank" rel="noopener" class="bsky-stat" title="${replies} replies">
        <span style="color:var(--bsky-reply)">${ICONS.reply}</span>
        <span class="bsky-stat-count">${replies}</span>
        <span>repl${replies !== 1 ? 'ies' : 'y'}</span>
      </a>
    </div>
  `;
}

function renderLikers(likes, maxShow = 20) {
  if (!likes || likes.length === 0) return '';

  const shown = likes.slice(0, maxShow);
  const overflow = likes.length - maxShow;

  let html = '<div class="bsky-likers">';
  for (const like of shown) {
    const actor = like.actor;
    const profileUrl = `https://bsky.app/profile/${actor.handle}`;
    if (actor.avatar) {
      html += `<a href="${profileUrl}" target="_blank" rel="noopener" title="${escapeHtml(actor.displayName || actor.handle)}">
        <img class="bsky-liker-avatar" src="${actor.avatar}" alt="${escapeHtml(actor.displayName || actor.handle)}" loading="lazy"/>
      </a>`;
    }
  }
  if (overflow > 0) {
    html += `<span class="bsky-likers-overflow">+${overflow} more</span>`;
  }
  html += '</div>';
  return html;
}

function renderQuotes(quotes) {
  if (!quotes || quotes.length === 0) return '';

  let html = '<div class="bsky-quotes-label">Quote posts</div>';
  html += '<ul class="bsky-quotes-list">';
  for (const post of quotes) {
    const author = post.author;
    const record = post.record || {};
    const rkey = post.uri?.split('/').pop();
    const postUrl = makeBskyUrl(author.handle, rkey);
    const profileUrl = `https://bsky.app/profile/${author.handle}`;

    html += `
      <li class="bsky-quote">
        <div class="bsky-comment-header">
          <a href="${profileUrl}" target="_blank" rel="noopener">
            ${author.avatar
              ? `<img class="bsky-comment-avatar" src="${author.avatar}" alt="" loading="lazy"/>`
              : `<span class="bsky-comment-avatar" style="background:var(--bsky-border);display:inline-block"></span>`
            }
          </a>
          <a href="${profileUrl}" target="_blank" rel="noopener" class="bsky-comment-author">
            ${escapeHtml(author.displayName || author.handle)}
          </a>
          <span class="bsky-comment-handle">@${escapeHtml(author.handle)}</span>
          <a href="${postUrl}" target="_blank" rel="noopener" class="bsky-comment-time" title="${new Date(record.createdAt).toLocaleString()}">
            ${timeAgo(record.createdAt)}
          </a>
        </div>
        <div class="bsky-comment-body">${renderRichText(record.text || '', record.facets)}</div>
        <div class="bsky-comment-meta">
          ${(post.likeCount || 0) > 0 ? `<span class="bsky-comment-stat"><span style="color:var(--bsky-heart)">${ICONS.heart}</span> ${post.likeCount}</span>` : ''}
          ${(post.repostCount || 0) > 0 ? `<span class="bsky-comment-stat"><span style="color:var(--bsky-repost)">${ICONS.repost}</span> ${post.repostCount}</span>` : ''}
        </div>
      </li>`;
  }
  html += '</ul>';
  return html;
}

function renderComment(reply, rootAuthorDid, maxDepth, currentDepth = 0) {
  if (!reply?.post) return '';

  const post = reply.post;
  const author = post.author;
  const record = post.record || {};
  const rkey = post.uri?.split('/').pop();
  const postUrl = makeBskyUrl(author.handle, rkey);
  const profileUrl = `https://bsky.app/profile/${author.handle}`;
  const isOP = author.did === rootAuthorDid;

  let html = `
    <li class="bsky-comment">
      <div class="bsky-comment-header">
        <a href="${profileUrl}" target="_blank" rel="noopener">
          ${author.avatar
            ? `<img class="bsky-comment-avatar" src="${author.avatar}" alt="" loading="lazy"/>`
            : `<span class="bsky-comment-avatar" style="background:var(--bsky-border);display:inline-block"></span>`
          }
        </a>
        <a href="${profileUrl}" target="_blank" rel="noopener" class="bsky-comment-author">
          ${escapeHtml(author.displayName || author.handle)}${isOP ? ' <small style="color:var(--bsky-accent)">(OP)</small>' : ''}
        </a>
        <span class="bsky-comment-handle">@${escapeHtml(author.handle)}</span>
        <a href="${postUrl}" target="_blank" rel="noopener" class="bsky-comment-time" title="${new Date(record.createdAt).toLocaleString()}">
          ${timeAgo(record.createdAt)}
        </a>
      </div>
      <div class="bsky-comment-body">${renderRichText(record.text || '', record.facets)}</div>
      <div class="bsky-comment-meta">
        ${(post.likeCount || 0) > 0 ? `<span class="bsky-comment-stat"><span style="color:var(--bsky-heart)">${ICONS.heart}</span> ${post.likeCount}</span>` : ''}
        ${(post.replyCount || 0) > 0 ? `<span class="bsky-comment-stat"><span style="color:var(--bsky-reply)">${ICONS.reply}</span> ${post.replyCount}</span>` : ''}
      </div>
  `;

  // Nested replies
  if (reply.replies?.length > 0 && currentDepth < maxDepth) {
    const sorted = sortReplies(reply.replies);
    html += '<ul class="bsky-replies">';
    for (const child of sorted) {
      html += renderComment(child, rootAuthorDid, maxDepth, currentDepth + 1);
    }
    html += '</ul>';
  }

  html += '</li>';
  return html;
}

function sortReplies(replies, mode = 'likes') {
  if (!replies) return [];
  const valid = replies.filter(r => r?.post?.record?.text);

  switch (mode) {
    case 'newest':
      return valid.sort((a, b) =>
        new Date(b.post.record.createdAt) - new Date(a.post.record.createdAt));
    case 'oldest':
      return valid.sort((a, b) =>
        new Date(a.post.record.createdAt) - new Date(b.post.record.createdAt));
    case 'likes':
    default:
      return valid.sort((a, b) =>
        (b.post.likeCount || 0) - (a.post.likeCount || 0));
  }
}

/* ── Main Widget ───────────────────────────────────────────────────── */

async function initWidget(container) {
  const uriInput = container.getAttribute('data-bsky-uri');
  if (!uriInput) return;

  const maxDepth = parseInt(container.getAttribute('data-bsky-max-depth') || '3', 10);
  const sortMode = container.getAttribute('data-bsky-sort') || 'likes';
  const showMode = container.getAttribute('data-bsky-show') || 'all';
  const theme = container.getAttribute('data-bsky-theme') || 'auto';

  container.classList.add('bsky-engagement');
  container.setAttribute('data-theme', theme);

  // Show loading
  container.innerHTML = '<div class="bsky-loading"><span class="bsky-loading-spinner"></span>Loading discussion…</div>';

  try {
    const parsed = parsePostUri(uriInput);
    if (!parsed) throw new Error(`Invalid Bluesky URI: ${uriInput}`);

    const did = await resolveActor(parsed.actor);
    const atUri = makeAtUri(did, parsed.rkey);
    const bskyUrl = makeBskyUrl(parsed.actor, parsed.rkey);

    // Fetch thread, likes, and quotes in parallel
    const [threadData, likesData, quotesData] = await Promise.all([
      fetchThread(atUri, maxDepth + 2),
      showMode !== 'comments' ? fetchLikes(atUri, 50).catch(() => ({ likes: [] })) : Promise.resolve({ likes: [] }),
      showMode !== 'comments' ? fetchQuotes(atUri, 25).catch(() => ({ posts: [] })) : Promise.resolve({ posts: [] })
    ]);

    const thread = threadData.thread;
    if (!thread?.post) throw new Error('No thread data');

    const post = thread.post;
    const rootAuthorDid = post.author.did;
    const replies = sortReplies(thread.replies || [], sortMode);

    // Build HTML
    let html = '';

    // Stats bar
    if (showMode === 'all' || showMode === 'stats') {
      html += renderStats(post, bskyUrl);
    }

    // Liker avatars
    if ((showMode === 'all' || showMode === 'stats') && likesData.likes?.length > 0) {
      html += renderLikers(likesData.likes);
    }

    // Quote posts
    if ((showMode === 'all' || showMode === 'stats') && quotesData.posts?.length > 0) {
      html += renderQuotes(quotesData.posts);
    }

    // CTA
    html += `<a href="${bskyUrl}" target="_blank" rel="noopener" class="bsky-cta">
      Join the conversation on Bluesky ${ICONS.external}
    </a>`;

    // Comments
    if (showMode === 'all' || showMode === 'comments') {
      if (replies.length > 0) {
        html += '<ul class="bsky-comments-list">';
        for (const reply of replies) {
          html += renderComment(reply, rootAuthorDid, maxDepth);
        }
        html += '</ul>';
      } else {
        html += '<div class="bsky-empty">No replies yet — be the first to respond on Bluesky.</div>';
      }
    }

    container.innerHTML = html;

    // Dispatch success event
    container.dispatchEvent(new CustomEvent('bsky:loaded', {
      detail: { post, replies, likes: likesData.likes, quotes: quotesData.posts }
    }));

  } catch (err) {
    console.warn('[bsky-engagement]', err.message);
    // Fail silently — progressive enhancement
    container.innerHTML = '';
    container.dispatchEvent(new CustomEvent('bsky:error', { detail: { error: err } }));
  }
}

/* ── Bootstrap ─────────────────────────────────────────────────────── */

function injectStyles() {
  if (document.getElementById('bsky-engagement-styles')) return;
  const style = document.createElement('style');
  style.id = 'bsky-engagement-styles';
  style.textContent = WIDGET_CSS;
  document.head.appendChild(style);
}

function boot() {
  injectStyles();
  const containers = document.querySelectorAll('[data-bsky-uri]');
  containers.forEach(initWidget);
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Also export for manual use
export { initWidget, parsePostUri, boot };
