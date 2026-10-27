// Lantern Eel service worker: the page is network-first, other files cache-first with a background refresh.
// Every network fetch skips the HTTP cache (GitHub Pages sets max-age=600), so a new version is seen at once.
const VERSION = 'lantern-eel-v2';
const CORE = ['./', 'index.html', 'manifest.json', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin && !FONT_HOSTS.includes(url.hostname)) return;
  // The page itself goes network-first, so an update shows on the next load; the cache is the offline copy.
  if (req.mode === 'navigate') {
    e.respondWith(
      // A navigate-mode Request cannot be re-initialised, so fetch its URL to bypass the HTTP cache.
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then(res => { if (res.ok) caches.open(VERSION).then(c => c.put('index.html', res.clone())); return res; })
        .catch(() => caches.open(VERSION).then(c => c.match('index.html')))
    );
    return;
  }
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: url.origin === location.origin });
      const fresh = fetch(req, url.origin === location.origin ? { cache: 'no-cache' } : {})
        .then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; })
        .catch(() => null);
      if (hit) { e.waitUntil(fresh); return hit; }
      const res = await fresh;
      return res || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
    })
  );
});
