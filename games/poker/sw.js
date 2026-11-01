// Poker service worker: the page is network-first, other files cache-first with a background refresh.
// Every network fetch skips the HTTP cache (GitHub Pages sets max-age=600), so a new version is seen at once.
const VERSION = 'poker-v2';
const CORE = ['./', 'index.html', 'manifest.json', 'rules.js', 'ai.js', 'render.js', 'sound.js', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png',
  '/scripts/tabletop/net.js', '/scripts/tabletop/pairing.js', '/scripts/tabletop/seats.js',
  '/scripts/fd/signaling.js', '/scripts/fd/sdp-codec.js', '/scripts/vendor/qrcode-generator.js', '/scripts/vendor/jsqr.js'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('poker-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin && !FONT_HOSTS.includes(url.hostname)) return;
  if (req.mode === 'navigate') {
    e.respondWith(
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
