// Offline support for the demo, from the Cache API that demo.js fills ("Make available offline").
// Code (the page, .js, .html) is network first: online you always get the current version (and the
// cached copy is refreshed), offline the cached copy answers. Everything else (models, indexes,
// texts, libraries) is cache first. Either way the page loads with the network off.
// A request carrying ?net=... (a cold launch from the network, or a re-cache) always goes to the network.
const CACHE = "ettin-demo-v1";
const CODE_TIMEOUT_MS = 4000; // a hanging network (captive portal, one bar) falls back to the cache

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

const isCode = (url, req) => req.mode === "navigate" || /\.(js|html)$/.test(url.pathname) || url.pathname.endsWith("/");

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.searchParams.has("net")) return; // straight to the network
  e.respondWith((async () => {
    if (!(await caches.has(CACHE))) return fetch(req); // offline copy removed: a plain online page
    const c = await caches.open(CACHE);
    // the page itself is cached once; ?q=... and other page parameters must still find it
    const nav = req.mode === "navigate";
    const key = nav ? url.origin + url.pathname : req;
    const cached = () => c.match(key, { ignoreVary: true, ignoreSearch: nav });
    if (isCode(url, req) && url.origin === location.origin) {
      try {
        const r = await Promise.race([fetch(nav ? url.origin + url.pathname : req, { cache: "no-store" }),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), CODE_TIMEOUT_MS))]);
        if (r.ok) {
          if (await cached()) e.waitUntil(c.put(key, r.clone())); // keep the offline copy current
          return r;
        }
      } catch (err) { /* offline or slow: use the cache */ }
      const hit = await cached();
      return hit ?? new Response(`offline and not cached: ${url.pathname}`, { status: 503, statusText: "offline" });
    }
    const hit = await cached();
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (err) {
      return new Response(`offline and not cached: ${url.pathname}`, { status: 503, statusText: "offline" });
    }
  })());
});
