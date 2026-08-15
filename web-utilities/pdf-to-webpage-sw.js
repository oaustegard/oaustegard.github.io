/* pdf2page service worker.
 *
 * Exists for one reason: to receive Web Share Target POSTs. When the
 * installed app is picked in the share sheet, the OS POSTs the shared file
 * (or link) to the share action URL; no static host can answer a POST, so
 * this worker intercepts it, stashes the file in the Cache API, and
 * redirects to the app, which picks the file up via ?share-target=file.
 * Everything else passes through to the network untouched.
 */

const SHARE_CACHE = 'pdf2page-share';
const SHARE_ACTION = 'pdf-to-webpage-share';
const APP_PAGE = 'pdf-to-webpage.html'; // page to land on after a share is stashed

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname.endsWith('/' + SHARE_ACTION)) {
    event.respondWith(handleShare(event.request));
  }
});

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
