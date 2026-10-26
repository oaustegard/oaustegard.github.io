// Plumb service worker: precache the app shell, serve it cache-first, refresh in the background.
const VERSION = 'plumb-v4';
const CORE = ['./', 'index.html', 'manifest.json', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
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
      fetch(req)
        .then(res => { if (res.ok) caches.open(VERSION).then(c => c.put('index.html', res.clone())); return res; })
        .catch(() => caches.open(VERSION).then(c => c.match('index.html')))
    );
    return;
  }
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: url.origin === location.origin });
      const fresh = fetch(req)
        .then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; })
        .catch(() => null);
      if (hit) { e.waitUntil(fresh); return hit; }
      const res = await fresh;
      return res || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
    })
  );
});
