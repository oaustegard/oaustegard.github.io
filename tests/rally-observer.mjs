// Watch a Tilt Rally room from outside: join as "observer:claude" (never races, never hosts) and log what the phones
// report about their links every 3 s: path (direct / via server), the ICE candidate types and transport the link
// settled on, round trips, car updates per second and the longest gap between them, frame rate.
//
//   node tests/rally-observer.mjs ROOM [minutes=20] [out=rally-observer.jsonl] [lobby=wss://rally-lobby.austegard.workers.dev]
//
// The WebSocket runs inside headless Chromium so it can use this machine's HTTPS proxy (a cloud session has no direct
// egress); the phones need nothing beyond being in the room.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import http from "node:http"; import fs from "node:fs";

const [code, minutes = "20", out = "rally-observer.jsonl", lobby = "wss://rally-lobby.austegard.workers.dev"] = process.argv.slice(2);
if (!code) { console.error("usage: node tests/rally-observer.mjs ROOM [minutes] [out.jsonl] [lobby]"); process.exit(2); }
const srv = http.createServer((q, r) => { r.writeHead(200, { "content-type": "text/html" }); r.end("<!doctype html><title>observer</title>"); });
await new Promise((ok) => srv.listen(0, "127.0.0.1", ok));           // an allowed origin for the room server
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const b = await chromium.launch({ ...(proxy && lobby.startsWith("wss:") ? { proxy: { server: proxy, bypass: "127.0.0.1,localhost" } } : {}), args: ["--ignore-certificate-errors"] });
const page = await b.newPage({ ignoreHTTPSErrors: true });
const sink = fs.createWriteStream(out, { flags: "a" }), latest = new Map();
const stamp = () => new Date().toISOString().slice(11, 19);
await page.exposeFunction("report", (line) => {
  sink.write(line + "\n");
  const m = JSON.parse(line);
  if (m.kind === "tele") {
    latest.set(m.from, m.d);
    for (const p of m.d.peers) console.log(`${stamp()} ${m.d.name} (${m.d.dev}, ${m.d.browser}${m.d.conn?.type ? ", " + m.d.conn.type : ""}) -> ${p.name}: ${p.path}`
      + (p.local ? ` ice ${p.local}/${p.remote} ${p.proto}${p.relayProto ? "/" + p.relayProto : ""}` : "") + (p.rttMs != null ? ` rtt ${p.rttMs}ms` : "")
      + (p.pingMs != null ? ` ping ${p.pingMs}ms` : "") + ` cars ${p.carsPerSec}/s gap ${p.gapMaxMs}ms` + (p.connectMs ? ` (direct in ${p.connectMs}ms)` : "")
      + ` | ${m.d.state} fps ${m.d.fps} server ${m.d.serverRttMs}ms`);
  } else console.log(`${stamp()} ${m.kind} ${JSON.stringify(m.d)}`);
});
await page.goto(`http://127.0.0.1:${srv.address().port}/`);
await page.evaluate(([url]) => new Promise((ok) => {
  const ws = new WebSocket(url), log = (kind, d, from) => window.report(JSON.stringify({ at: Date.now(), kind, from, d }));
  ws.onopen = () => { log("open", url); ok(); setInterval(() => ws.send('{"t":"ping"}'), 20000); };
  ws.onclose = (e) => log("closed", { code: e.code, reason: e.reason });
  ws.onmessage = (e) => { const m = JSON.parse(e.data);
    if (m.t === "hello") log("room", { me: m.id, peers: m.peers });
    else if (m.t === "join" || m.t === "leave" || m.t === "name") log(m.t, m.peer || { id: m.id || m.from, name: m.name });
    else if (m.t === "app" && m.d?.k === "tele") log("tele", m.d, m.from);
    else if (m.t === "app" && m.d?.k === "start") log("start", { seed: m.d.seed, roster: m.d.roster }, m.from); };
}), [`${lobby}/room/${code.toUpperCase()}?name=observer:claude`]);
console.log(`${stamp()} watching room ${code.toUpperCase()} for ${minutes} min, logging to ${out}`);
await new Promise((r) => setTimeout(r, Number(minutes) * 60000));
console.log("\nlast report from each device:");
for (const d of latest.values()) console.log(JSON.stringify(d));
sink.end(); await b.close(); srv.close();
