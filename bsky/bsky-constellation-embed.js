/**
 * bsky-constellation-embed.js — Auto-embed post constellation graph on blog posts
 *
 * Checks if the linked Bluesky post has more than 1 reply. If so, injects
 * an interactive constellation graph iframe below the engagement widget.
 *
 * Usage (after bsky-engagement.js):
 *   <script type="module" src="/bsky/bsky-constellation-embed.js" defer></script>
 *
 * Requires a [data-bsky-uri] element on the page.
 *
 * @license MIT
 * @version 1.0.0
 */

const BSKY_API = 'https://public.api.bsky.app/xrpc';
const MIN_REPLIES = 2; // minimum reply count to show constellation

function parseUri(input) {
  if (input.startsWith('at://')) {
    const m = input.match(/^at:\/\/(did:[^/]+)\/app\.bsky\.feed\.post\/([^/?#]+)/);
    return m ? { did: m[1], rkey: m[2] } : null;
  }
  const m = input.match(/bsky\.app\/profile\/([^/?#\s]+)\/post\/([^/?#\s]+)/);
  return m ? { actor: m[1], rkey: m[2] } : null;
}

async function resolveDid(actor) {
  if (actor.startsWith('did:')) return actor;
  const r = await fetch(`${BSKY_API}/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(actor)}`);
  if (!r.ok) throw new Error('Could not resolve handle');
  return (await r.json()).did;
}

function makeBskyUrl(did, rkey) {
  return `https://bsky.app/profile/${did}/post/${rkey}`;
}

const EMBED_CSS = `
  .constellation-section {
    /* Break out of the 70ch blog column */
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    margin-top: 2em;
    padding: 0 1em;
    box-sizing: border-box;
  }
  .constellation-section h3 {
    text-align: center;
    font-size: 0.95em;
    color: #666;
    margin: 0 0 0.5em 0;
    font-weight: 500;
  }
  @media (prefers-color-scheme: dark) {
    .constellation-section h3 { color: #94a3b8; }
  }
  .constellation-iframe {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: block;
    height: 600px;
    border: none;
    border-radius: 8px;
    background: #f3f4f6;
  }
  @media (prefers-color-scheme: dark) {
    .constellation-iframe { background: #1e293b; }
  }
  @media (max-width: 768px) {
    .constellation-section { padding: 0 0.25em; }
    .constellation-iframe { height: 450px; border-radius: 4px; }
  }
`;

async function init() {
  const container = document.querySelector('[data-bsky-uri]');
  if (!container) return;

  const uriInput = container.getAttribute('data-bsky-uri');
  if (!uriInput) return;

  try {
    const parsed = parseUri(uriInput);
    if (!parsed) return;

    const did = parsed.did || await resolveDid(parsed.actor);
    const atUri = `at://${did}/app.bsky.feed.post/${parsed.rkey}`;

    // Fetch thread at depth 0 just to get reply count
    const r = await fetch(
      `${BSKY_API}/app.bsky.feed.getPostThread?uri=${encodeURIComponent(atUri)}&depth=0&parentHeight=0`
    );
    if (!r.ok) return;

    const data = await r.json();
    const post = data.thread?.post;
    if (!post) return;

    const replyCount = post.replyCount || 0;
    if (replyCount < MIN_REPLIES) return;

    // Build the bsky.app URL for the constellation graph
    const bskyUrl = makeBskyUrl(did, parsed.rkey);
    const iframeSrc = `/bsky/post-constellation-graph.html?url=${encodeURIComponent(bskyUrl)}&embed=1&torch=0`;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = EMBED_CSS;
    document.head.appendChild(style);

    // Find insertion point — after .bsky-section or after article
    const bskySection = container.closest('.bsky-section') || container;
    const insertAfter = bskySection.parentElement === document.querySelector('article')
      ? bskySection
      : document.querySelector('article') || document.body;

    const section = document.createElement('section');
    section.className = 'constellation-section';
    section.innerHTML = `
      <h3>Conversation Graph · ${replyCount} replies</h3>
      <iframe
        class="constellation-iframe"
        src="${iframeSrc}"
        loading="lazy"
        title="Post constellation graph showing replies and quotes"
        sandbox="allow-scripts allow-same-origin allow-popups"
      ></iframe>
    `;

    insertAfter.after(section);

  } catch (err) {
    // Fail silently — progressive enhancement
    console.warn('[bsky-constellation-embed]', err.message);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
