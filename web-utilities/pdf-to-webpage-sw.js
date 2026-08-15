/* pdf2page service worker.
 *
 * Two jobs:
 *
 * 1. Web Share Target: when the installed app is picked in the share sheet,
 *    the OS POSTs the shared file (or link) to the share action URL; no
 *    static host can answer a POST, so this worker intercepts it, stashes
 *    the file in the Cache API, and redirects to the app, which picks it up
 *    via ?share-target=file.
 *
 * 2. Offline shell: the app's files are precached and served
 *    stale-while-revalidate, so the home-screen install keeps working with
 *    no network — a local copy of the app in every way that matters.
 *    Requests outside the precache list (e.g. the /fetch URL proxy) pass
 *    through to the network untouched.
 */

const SHARE_CACHE = 'pdf2page-share';
const SHARE_ACTION = 'pdf-to-webpage-share';
const APP_PAGE = 'pdf-to-webpage.html'; // page to land on after a share is stashed

const SHELL_CACHE = 'pdf2page-shell-716aeb7964';
const PRECACHE = [
  'pdf-to-webpage.html',
  'pdf-to-webpage.webmanifest',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.min.mjs',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs',
];

// Absolute URL set for fetch-time lookup (query strings ignored).
const precacheUrls = new Set(PRECACHE.map((p) => new URL(p, self.location.href).href));

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== SHARE_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname.endsWith('/' + SHARE_ACTION)) {
    event.respondWith(handleShare(event.request));
    return;
  }
  if (event.request.method !== 'GET') return;
  url.search = '';
  url.hash = '';
  // navigations resolve to the app page regardless of query params
  const key = event.request.mode === 'navigate'
    ? new URL(APP_PAGE, self.location.href).href
    : url.href;
  if (precacheUrls.has(key)) {
    event.respondWith(staleWhileRevalidate(key, event));
  }
});

async function staleWhileRevalidate(key, event) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(key);
  const refresh = fetch(key)
    .then((resp) => {
      if (resp && resp.ok) cache.put(key, resp.clone());
      return resp;
    })
    .catch(() => null);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  const fresh = await refresh;
  return fresh || Response.error();
}

async function handleShare(request) {
  const appUrl = new URL(APP_PAGE, request.url).pathname;
  try {
    const form = await request.formData();
    const file = form.get('pdf');
    if (file && typeof file !== 'string' && file.size > 0) {
      const cache = await caches.open(SHARE_CACHE);
      await cache.put(
        'shared-pdf',
        new Response(file, {
          headers: {
            'Content-Type': 'application/pdf',
            'X-File-Name': encodeURIComponent(file.name || 'shared.pdf'),
          },
        })
      );
      return Response.redirect(appUrl + '?share-target=file', 303);
    }
    // link/text share: find a URL and hand it to the app's ?url= path
    const shared = [form.get('url'), form.get('text'), form.get('title')]
      .filter((v) => typeof v === 'string')
      .join(' ');
    const match = shared.match(/https?:\/\/\S+/);
    if (match) return Response.redirect(appUrl + '?url=' + encodeURIComponent(match[0]), 303);
  } catch (err) {
    // fall through to a bare redirect; the app shows its normal empty state
  }
  return Response.redirect(appUrl, 303);
}
