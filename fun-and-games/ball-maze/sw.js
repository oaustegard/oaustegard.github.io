const CACHE_NAME = 'ball-maze-v9';
const PRECACHE_URLS = [
  './',
  'index.html',
  'game.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png'
];

// Install: cache the precache list
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Try to add all URLs; don't fail install if some 404
      return Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(url))
      );
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate: clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch: stale-while-revalidate for same-origin requests within scope
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return; // Let the browser handle it
  }

  const scopePath = new URL(self.registration.scope).pathname;
  if (!url.pathname.startsWith(scopePath)) {
    return; // Outside scope; don't intercept
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        });
        // When serving from cache, the revalidation runs in the background —
        // swallow its rejection so an offline update isn't an unhandled error.
        fetchPromise.catch(() => {});
        return cachedResponse || fetchPromise;
      });
    }).catch(() => {
      return caches.match(request);
    })
  );
});
