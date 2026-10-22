// Offline support for the demo: serve from the Cache API that demo.js fills ("Make available offline").
// Code (the page, .js, .html) is stale-while-revalidate: answered from the cache, refreshed from the
// network in the background when online, so the next load picks up updates. Everything else (models,
// indexes, texts, libraries) is cache first. Either way the page loads with the network off.
// A request carrying ?net=... (a cold launch from the network, or a re-cache) always goes to the network.
const CACHE = "ettin-demo-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

const isCode = (url, req) => req.mode === "navigate" || /\.(js|html)$/.test(url.pathname) || url.pathname.endsWith("/");

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.searchParams.has("net")) return; // straight to the network
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    // the page itself is cached once; ?q=... and other page parameters must still find it
    const key = req.mode === "navigate" ? url.origin + url.pathname : req;
    const hit = await c.match(key, { ignoreVary: true, ignoreSearch: req.mode === "navigate" });
    if (hit && isCode(url, req) && url.origin === location.origin) {
      e.waitUntil(fetch(url.origin + url.pathname, { cache: "no-store" })
        .then((r) => r.ok ? c.put(key, r) : null).catch(() => {}));
    }
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (err) {
      return new Response(`offline and not cached: ${url.pathname}`, { status: 503, statusText: "offline" });
    }
  })());
});
