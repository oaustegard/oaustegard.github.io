const CACHE_NAME = 'motion-player-v2';
const PRECACHE_URLS = [
  './',
  'index.html',
  'app.js',
  'motion.js',
  'gestures.js',
  'styles.css',
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
      // Try to add all URLs; don't fail install if some 404 (especially icons)
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

// Fetch: stale-while-revalidate for same-origin, scope-restricted
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests within scope
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return; // Let the browser handle it; don't respondWith
  }

  // Check if the URL is within the scope (./motion-player/)
  // self.registration.scope is the full path, e.g., https://austegard.com/motion-player/
  const scopePath = new URL(self.registration.scope).pathname;
  if (!url.pathname.startsWith(scopePath)) {
    return; // Outside scope; don't intercept
  }

  // Stale-while-revalidate strategy
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        // Fetch in the background and update the cache
        const fetchPromise = fetch(request).then((response) => {
          // Only cache successful responses
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        });
        // When serving from cache, the revalidation runs in the background —
        // swallow its rejection so an offline update isn't an unhandled error.
        fetchPromise.catch(() => {});

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    }).catch(() => {
      // Network error and nothing in cache: return cached response if available
      // (This is unlikely given the stale-while-revalidate logic above,
      // but it's a safe fallback.)
      return caches.match(request);
    })
  );
});
