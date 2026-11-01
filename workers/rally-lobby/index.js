// rally-lobby: the meeting place for Tilt Rally races. A phone opens wss://…/room/<CODE>?name=<name>; everyone in the
// same room hears everyone else. The room relays small JSON messages: the WebRTC handshake (offer, answer, ICE
// candidates, addressed with `to`) and, for a pair whose direct connection never comes up, the race traffic itself.
// It stores nothing: a room exists while someone is connected to it.

const ORIGINS = /^(https:\/\/(austegard\.com|oaustegard\.github\.io)|http:\/\/(127\.0\.0\.1|localhost)(:\d+)?)$/;
const MAX_PEERS = 8, MAX_MESSAGE = 16384;

export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get("Origin") || "";
    if (url.pathname === "/") return new Response("rally-lobby: open a WebSocket to /room/<code>\n", { headers: { "content-type": "text/plain" } });
    const m = url.pathname.match(/^\/room\/([A-Z0-9]{4,8})$/);
    if (!m) return new Response("not found", { status: 404 });
    if (!ORIGINS.test(origin)) return new Response("forbidden origin", { status: 403 });
    if (req.headers.get("Upgrade") !== "websocket") return new Response("expected a WebSocket", { status: 426 });
    return env.ROOMS.get(env.ROOMS.idFromName(m[1])).fetch(req);
  },
};

export class Room {
  constructor(state) {
    this.state = state;
    // keep-alives are answered without waking the object
    state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"t":"ping"}', '{"t":"pong"}'));
  }
  peers(except) { return this.state.getWebSockets().filter((w) => w !== except && w.readyState === 1); }
  async fetch(req) {
    const url = new URL(req.url), [client, server] = Object.values(new WebSocketPair());
    const others = this.peers();
    if (others.length >= MAX_PEERS) {
      server.accept(); server.send(JSON.stringify({ t: "full" })); server.close(4000, "room full");
      return new Response(null, { status: 101, webSocket: client });
    }
    const me = { id: crypto.randomUUID().slice(0, 8), name: (url.searchParams.get("name") || "Driver").slice(0, 16), joined: Date.now() };
    this.state.acceptWebSocket(server);
    server.serializeAttachment(me);
    server.send(JSON.stringify({ t: "hello", id: me.id, now: Date.now(), peers: others.map((w) => w.deserializeAttachment()) }));
    for (const w of others) w.send(JSON.stringify({ t: "join", peer: me }));
    return new Response(null, { status: 101, webSocket: client });
  }
  webSocketMessage(ws, data) {
    if (typeof data !== "string" || data.length > MAX_MESSAGE) return;
    let m; try { m = JSON.parse(data); } catch { return; }
    if (!m || typeof m !== "object") return;
    const me = ws.deserializeAttachment();
    if (m.t === "time") { ws.send(JSON.stringify({ t: "time", c: m.c, s: Date.now() })); return; }   // clock sync
    if (m.t === "name" && typeof m.name === "string") { me.name = m.name.slice(0, 16); ws.serializeAttachment(me); }
    m.from = me.id;
    const out = JSON.stringify(m);
    for (const w of this.peers(ws)) { if (m.to && w.deserializeAttachment().id !== m.to) continue; try { w.send(out); } catch {} }
  }
  webSocketClose(ws) { this.left(ws); }
  webSocketError(ws) { this.left(ws); }
  left(ws) {
    const me = ws.deserializeAttachment(); if (!me) return;
    for (const w of this.peers(ws)) { try { w.send(JSON.stringify({ t: "leave", id: me.id })); } catch {} }
  }
}
