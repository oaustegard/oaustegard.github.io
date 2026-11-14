// Service worker for Kokoro Voice. Two jobs:
//
// 1. Cross-origin isolation. GitHub Pages cannot send COOP/COEP headers, and without them onnxruntime-web runs one
//    wasm thread instead of four (2.8x slower). Every response this worker serves carries the headers. Every
//    cross-origin request the page makes (jsDelivr, the R2 model) uses CORS, which require-corp accepts.
// 2. A cache for the second visit. The model (88 MB on the wire, from R2) and onnxruntime-web (jsDelivr) have
//    versioned URLs, so they are served from cache once fetched. The page's own files are served from cache and
//    refreshed in the background; the page itself is fetched from the network first, so an update shows on the
//    next load, and from cache when offline.
//
// Bump VERSION to drop every cached file.
const VERSION = "kokoro-voice-v1";
const IMMUTABLE_HOSTS = new Set(["pub-38421218e82c4d4ba2bc53974c28b55d.r2.dev", "cdn.jsdelivr.net"]);
const SCOPE = new URL("./", self.location).pathname;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith("kokoro-voice-") && key !== VERSION) await caches.delete(key);
  await self.clients.claim();
})()));

// The isolation headers, and no Content-Encoding or Content-Length: a body read through fetch() is already decoded,
// so those headers would describe bytes that are not there (88 MB brotli against 102 MB served).
function withHeaders(res, body = res.body) {
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return new Response(body, { status: res.status, statusText: res.statusText, headers });
}

// Fetch, and store a copy while the page reads the other: the 88 MB model is never held twice. The cache write is
// added to `pending`, which the fetch event waits on.
async function fetchAndStore(cache, request, pending) {
  const res = await fetch(request);
  if (!res.ok || !(res.type === "basic" || res.type === "cors") || !res.body) return res.status === 0 ? res : withHeaders(res);
  const [forPage, forCache] = res.body.tee();
  pending.push(cache.put(request, withHeaders(res, forCache)).catch(() => {})); // quota: just not cached
  return withHeaders(res, forPage);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const immutable = IMMUTABLE_HOSTS.has(url.host);
  const local = url.origin === self.location.origin && url.pathname.startsWith(SCOPE);
  if (!immutable && !local) {
    event.respondWith(fetch(request).then((res) => (res.status === 0 ? res : withHeaders(res))));
    return;
  }
  // waitUntil must be called while the event is live, so one promise is registered now and settled once the
  // cache writes (and a background refresh) are done.
  const pending = [];
  let settle;
  event.waitUntil(new Promise((r) => (settle = r)));
  const finish = () => Promise.allSettled(pending).then(settle);
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      if (request.mode === "navigate") {
        try { return await fetchAndStore(cache, request, pending); }
        catch (e) { return (await cache.match(request, { ignoreSearch: true })) ?? Response.error(); }
      }
      const hit = await cache.match(request);
      if (hit && immutable) return hit;
      if (hit) {
        pending.push((async () => { // refresh for next time, waiting for its own cache write
          const own = [];
          await fetchAndStore(cache, request, own);
          await Promise.allSettled(own);
        })().catch(() => {}));
        return hit;
      }
      return await fetchAndStore(cache, request, pending);
    } finally {
      // let the refresh push its own cache write before settling
      queueMicrotask(() => setTimeout(finish, 0));
    }
  })());
});
