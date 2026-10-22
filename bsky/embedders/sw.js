// Offline support for the demo: serve from the Cache API that demo.js fills ("Make available offline"),
// cache first, so the page, models, indexes and post texts load with the network off.
// A request carrying ?net=... (a cold launch from the network) always goes to the network.
const CACHE = "ettin-demo-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.searchParams.has("net")) return; // straight to the network
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    // the page itself is cached once; ?q=... and other page parameters must still find it
    const hit = await c.match(req, { ignoreVary: true, ignoreSearch: req.mode === "navigate" });
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (err) {
      // offline and not cached: the page shows the error
      return new Response(`offline and not cached: ${url.pathname}`, { status: 503, statusText: "offline" });
    }
  })());
});
