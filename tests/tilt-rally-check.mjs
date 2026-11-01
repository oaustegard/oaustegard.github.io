// Tilt Rally headless checks on SwiftShader WebGPU (correctness only; real-GPU timing goes through the GPU Bridge):
//   node tests/tilt-rally-check.mjs math    orientation -> wheel/pedal on known poses
//   node tests/tilt-rally-check.mjs demo    autopilot race: no WebGPU errors, every car moving and on the road
//   node tests/tilt-rally-check.mjs tilt    synthetic deviceorientation events: tilt away accelerates, clockwise steers right, tilt back brakes
//   node tests/tilt-rally-check.mjs cars    close-up stills of the cars (front three-quarter, rear, side) into OUT
//   node tests/tilt-rally-check.mjs grip    a full-gas driver with perfect aim stays on the road (pass a JSON list of tunings to compare)
//   node tests/tilt-rally-check.mjs backseat the back-seat driver shouts before the corner a full-gas driver leaves, and urges a crawler on
//   node tests/tilt-rally-check.mjs permission  the iOS motion prompt comes on the start screen, before the race
//   node tests/tilt-rally-check.mjs controls  touch pedals and manual gears through the on-screen controls
//   node tests/tilt-rally-check.mjs multi     three players on a local rally-lobby (wrangler dev): direct and relayed links, synced start, positions agree
//   node tests/tilt-rally-check.mjs pedals    thumb position on a touch pedal sets its strength, in both layouts
//   node tests/tilt-rally-check.mjs circuit   the Nürburgring GP (tracks/nurburgring-gp.json) loads, is credited, and the autopilot races it
//   node tests/tilt-rally-check.mjs intro   the start screen fits one portrait phone screen, buttons included
//   node tests/tilt-rally-check.mjs rotated a portrait phone: the landscape stage turned a quarter turn counter-clockwise fills the screen
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT || "/tmp/tilt-rally";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); r.end(fs.readFileSync(p));
});
await new Promise((ok) => srv.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${srv.address().port}/games/tilt-rally/`;
const b = await chromium.launch({ args: ["--enable-unsafe-webgpu", "--enable-features=Vulkan", "--use-vulkan=swiftshader", "--use-angle=swiftshader", "--use-webgpu-adapter=swiftshader", "--disable-features=WebRtcHideLocalIpsWithMdns",
  // several pages race at once in "multi": without these, every page but one is throttled to about a frame a second
  "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"] });
const what = process.argv[2] || "math";
let failed = false;
const check = (name, ok, detail = "") => { console.log((ok ? "ok   " : "FAIL ") + name + (detail ? "  " + detail : "")); if (!ok) failed = true; };
async function open(url, viewport = { width: 844, height: 390 }) {
  const page = await b.newPage({ viewport }), errors = [];
  page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + url); return { page, errors };
}
const waitFor = (page, fn, ms = 120000) => page.waitForFunction(fn, null, { timeout: ms, polling: 250 });
fs.mkdirSync(OUT, { recursive: true });
const you = (page) => page.evaluate(() => window.__game().cars.find((c) => c.name === "You"));
const raceT = (page) => page.evaluate(() => window.__game().raceT);

if (what === "math") {
  const { page } = await open("index.html");
  await waitFor(page, () => window.__tilt);
  const r = await page.evaluate(() => {
    const { upFromOrientation: up, wheelFrom: w } = window.__tilt, deg = (x) => x * 180 / Math.PI;
    const N = up(0, -75);                                   // landscape, screen tilted back 15 degrees
    return {
      flat: up(0, 0), portrait: up(90, 0), landscape: up(0, -90),
      right20: deg(w(up(20, -75), N).wheel),                // the wheel turned clockwise: beta rises in this pose
      left20: deg(w(up(-20, -75), N).wheel),
      away15: deg(w(up(0, -60), N).pitch),                  // screen faces more of the sky
      toward14: deg(w(up(0, -89), N).pitch),
      seam: deg(w(up(180, 89), up(0, -89)).pitch),          // past vertical: beta flips to 180, gamma to +89; up.z goes 0.017 -> -0.017
      otherLandscape: deg(w(up(-20, 75), up(0, 75)).wheel), // the phone the other way round: clockwise lowers beta here
    };
  });
  const near = (a, b, e = 1.0) => Math.abs(a - b) < e;
  check("flat on a table: up = +z", near(r.flat[2], 1, 1e-6), JSON.stringify(r.flat));
  check("upright portrait: up = +y", near(r.portrait[1], 1, 1e-6));
  check("landscape upright: up = +x", near(r.landscape[0], 1, 1e-6));
  check("clockwise 20 degrees steers right +20", near(r.right20, 20), r.right20.toFixed(2));
  check("counter-clockwise 20 degrees steers left -20", near(r.left20, -20), r.left20.toFixed(2));
  check("top tilted away 15 degrees is +15 pedal", near(r.away15, 15), r.away15.toFixed(2));
  check("tilted toward you 14 degrees is -14 pedal", near(r.toward14, -14), r.toward14.toFixed(2));
  check("continuous through the beta/gamma seam", near(r.seam, -2, 0.2), r.seam.toFixed(2));
  check("other landscape: clockwise is still right", near(r.otherLandscape, 20), r.otherLandscape.toFixed(2));
}

if (what === "demo") {
  const { page, errors } = await open("index.html?demo&seed=" + (process.argv[3] || 7));
  await waitFor(page, () => window.__game?.()?.state === "race");
  await page.screenshot({ path: path.join(OUT, "demo-start.png") });
  await waitFor(page, () => window.__game().raceT > 25, 600000);
  await page.screenshot({ path: path.join(OUT, "demo-25s.png") });
  const s = await page.evaluate(() => window.__game());
  console.log(JSON.stringify(s.stats), "frames", s.frames);
  for (const c of s.cars) console.log("  ", c.name, "lap", c.lap, "idx", c.idx, "v", (c.speed * 3.6).toFixed(0), "km/h lat", c.lat.toFixed(1), "surf", c.surf);
  check("no page or WebGPU errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  check("every car moving and on the road", s.cars.every((c) => c.speed > 8 && Math.abs(c.lat) < 9));
  check("track has no corner tighter than 25 m", s.stats.minR > 25, s.stats.minR.toFixed(1) + " m");
}

if (what === "tilt") {
  const { page, errors } = await open("index.html");
  await waitFor(page, () => document.getElementById("status").textContent === "Ready.");
  const send = (beta, gamma) => page.evaluate(([b, g]) => window.dispatchEvent(Object.assign(new Event("deviceorientation"), { alpha: 0, beta: b, gamma: g })), [beta, gamma]);
  const hold = async (pose, secs) => { const t = await raceT(page); while ((await raceT(page)) < t + secs) { await send(...pose); await page.waitForTimeout(50); } };
  await page.click("#start");
  for (let k = 0; k < 20; k++) { await send(0, -75); await page.waitForTimeout(100); }
  await waitFor(page, () => window.__game().state === "race");
  await hold([0, -60], 3);
  const s1 = await you(page);
  check("tilting the top away accelerates", s1.speed > 10, (s1.speed * 3.6).toFixed(0) + " km/h");
  await hold([30, -60], 1.2);
  const s2 = await you(page);
  check("turning the phone clockwise moves the car right", s2.lat > s1.lat + 1, s1.lat.toFixed(1) + " -> " + s2.lat.toFixed(1));
  await hold([0, -89], 1.5);
  const s3 = await you(page);
  check("tilting toward you brakes", s3.speed < s2.speed - 5, (s2.speed * 3.6).toFixed(0) + " -> " + (s3.speed * 3.6).toFixed(0) + " km/h");
  await page.screenshot({ path: path.join(OUT, "tilt.png") });
  check("no page or WebGPU errors", errors.length === 0, errors.slice(0, 3).join(" | "));
}

if (what === "cars") {
  const { page, errors } = await open("index.html?demo", { width: 960, height: 540 });
  await waitFor(page, () => window.__game?.()?.state === "race");
  await waitFor(page, () => window.__game().raceT > 6, 300000);
  // freeze the race and frame the leading cars from fixed points around the player
  const shots = { front34: [4.2, 1.4, 5.4], rear34: [-3.6, 1.6, -5.6], side: [6.2, 1.0, 0.2], top: [2.5, 4.5, -5.5] };
  for (const [name, off] of Object.entries(shots)) {
    await page.evaluate((off) => { window.__hold = true; const G = window.__engine, P = G.player, f = [Math.sin(P.h), Math.cos(P.h)], r = [-Math.cos(P.h), Math.sin(P.h)];
      const eye = [P.x + r[0] * off[0] + f[0] * off[2], P.y + off[1], P.z + r[1] * off[0] + f[1] * off[2]];
      const cv = document.getElementById("view"); const ctx = cv.getContext("webgpu");
      G.render(ctx.getCurrentTexture().createView(), cv.width, cv.height, 0, { eye, look: [P.x, P.y + 0.6, P.z] }); }, off);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, "car-" + name + ".png") });
  }
  check("no page or WebGPU errors", errors.length === 0, errors.slice(0, 3).join(" | "));
}

if (what === "rotated") {
  const page = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }), errors = [];
  page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + "index.html?demo");
  await waitFor(page, () => window.__game?.()?.state === "race");
  const g = await page.evaluate(() => { const st = document.getElementById("stage"), r = st.getBoundingClientRect(), cv = document.getElementById("view");
    const sp = document.getElementById("speed").getBoundingClientRect();
    return { rot: document.documentElement.classList.contains("rot"), box: [r.left, r.top, r.width, r.height], canvas: [cv.width, cv.height, cv.clientWidth, cv.clientHeight], speed: [sp.left, sp.top] }; });
  console.log(JSON.stringify(g));
  check("portrait touch screen turns the stage", g.rot);
  check("turned stage covers the screen exactly", Math.abs(g.box[0]) < 1 && Math.abs(g.box[1]) < 1 && Math.abs(g.box[2] - 390) < 1 && Math.abs(g.box[3] - 844) < 1, g.box.join(","));
  check("canvas is laid out landscape", g.canvas[2] === 844 && g.canvas[3] === 390, g.canvas.join(","));
  // the speedometer sits bottom-right of the stage, which a quarter turn counter-clockwise puts at the screen's top right
  check("speedometer lands top right of the portrait screen", g.speed[0] > 195 && g.speed[1] < 200, g.speed.map(Math.round).join(","));
  await page.screenshot({ path: path.join(OUT, "rotated.png") });
  // Chrome on iPhone: innerHeight includes the bottom toolbar, the visual viewport does not. The stage must use the latter.
  const p2 = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p2.addInitScript(() => { const vv = { width: 390, height: 784, addEventListener() {}, removeEventListener() {} };
    Object.defineProperty(window, "visualViewport", { get: () => vv }); });
  await p2.goto(base + "index.html");
  await p2.waitForFunction(() => document.getElementById("stage"), null, { timeout: 60000 });
  const g2 = await p2.evaluate(() => { const r = document.getElementById("stage").getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  check("with a toolbar over the bottom 60 px, the turned stage stops above it", Math.abs(g2[3] - 784) < 1 && Math.abs(g2[1]) < 1, g2.map(Math.round).join(","));
  await p2.close();
  check("no page or WebGPU errors", errors.length === 0, errors.slice(0, 3).join(" | "));
}

if (what === "intro") {
  // iPhone sizes with the browser's bars taken off: the start screen must fit without scrolling, buttons on screen
  for (const [w, h] of [[393, 660], [375, 560], [430, 800]]) {
    const page = await b.newPage({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    await page.goto(base + "index.html");
    await waitFor(page, () => document.getElementById("status").textContent === "Ready.");
    const r = await page.evaluate(() => { const o = document.getElementById("intro"), box = (id) => { const q = document.getElementById(id).getBoundingClientRect(); return [q.left, q.top, q.right, q.bottom]; };
      return { overflow: o.scrollHeight - o.clientHeight, motion: box("motion"), start: box("start"), h1: box("intro").length && document.querySelector("#intro h1").getBoundingClientRect().toJSON() }; });
    const inside = (q) => q[0] >= 0 && q[1] >= 0 && q[2] <= w && q[3] <= h;
    check(`${w}x${h}: start screen fits without scrolling`, r.overflow <= 0, "overflow " + r.overflow + " px");
    check(`${w}x${h}: Allow motion and Start engine are on screen`, inside(r.motion) && inside(r.start), JSON.stringify([r.motion, r.start].map((q) => q.map(Math.round))));
    await page.screenshot({ path: path.join(OUT, `intro-${w}x${h}.png`) });
    await page.close();
  }
}

if (what === "grip") {
  // A heavy-footed driver: perfect steering toward the road ahead (the AI's aim, clamped to the wheel), full gas always.
  // Seconds spent off the tarmac over 70 s of racing, for each tuning.
  const { page } = await open("index.html?demo");
  await waitFor(page, () => window.__game?.()?.state === "race");
  const tunes = JSON.parse(process.argv[3] || "[{}]"), defaults = await page.evaluate(() => JSON.parse(JSON.stringify(window.__engine.tune)));
  for (const tune of tunes) {
    const r = await page.evaluate(([tune, defaults]) => { window.__hold = true; const E = window.__engine; E.tune = { ...defaults, ...tune };
      E.newRace(); for (let i = 0; i < 120 * 4; i++) E.tick(1 / 120);
      const P = E.player, T = E.T, ais = E.cars.filter((c) => c.ai), p0 = P.prog, a0 = ais.map((c) => c.prog); let off = 0, gravel = 0, vmax = 0;
      for (let i = 0; i < 120 * 70; i++) {
        const sp = Math.max(0, P.speed), look = Math.round((9 + sp * 0.55) / T.ds), k = (P.idx + look) % T.x.length;
        const fx = Math.sin(P.h), fz = Math.cos(P.h), dx = T.x[k] - P.x, dz = T.z[k] - P.z, err = Math.atan2(fx * dz - fz * dx, fx * dx + fz * dz);
        E.input.steer = Math.max(-1, Math.min(1, err * 2.6)); E.input.thr = 1;
        E.tick(1 / 120);
        if (P.surf === 2) { if (!P.__off) { P.__off = 1; (P.__ev ||= []).push([P.idx, Math.round(P.speed * 3.6), Math.round(1 / Math.abs(T.kap[P.idx])), Math.sign(T.kap[P.idx]) > 0 ? 'R' : 'L', +E.input.steer.toFixed(2)]); } off += 1 / 120; } else { P.__off = 0; if (P.surf === 1) gravel += 1 / 120; }
        vmax = Math.max(vmax, P.speed);
      }
      return { ev: P.__ev, off, gravel, vmax: vmax * 3.6, km: (P.prog - p0) * T.ds / 1000, ai: Math.max(...ais.map((c, i) => (c.prog - a0[i]) * T.ds / 1000)) }; }, [tune, defaults]);
    console.log("   episodes [idx, km/h, radius m, turn, steer]:", JSON.stringify(r.ev)); console.log(JSON.stringify(tune), "off-road", r.off.toFixed(1), "s, kerb/gravel", r.gravel.toFixed(1), "s, top", r.vmax.toFixed(0), "km/h, covered", r.km.toFixed(2), "km (fastest AI", r.ai.toFixed(2) + ")");
    if (!process.argv[3]) { const sweeping = (r.ev || []).filter((e) => e[2] > 40);
      check("full gas never leaves the road on a bend wider than 40 m", sweeping.length === 0, JSON.stringify(sweeping));
      check("full gas: under 5 s off the road in 70 s (the 30 m hairpin wants the brake)", r.off < 5, r.off.toFixed(1) + " s");
      check("full gas keeps within 15% of the fastest computer car", r.km > r.ai * 0.85, r.km.toFixed(2) + " vs " + r.ai.toFixed(2) + " km"); }
  }
}

if (what === "backseat") {
  // The full-gas driver from "grip" with the back-seat driver listening: it should shout before the hairpin, not after,
  // and a driver crawling on a quarter throttle should be told to get going.
  const { page, errors } = await open("index.html?demo");
  await waitFor(page, () => window.__game?.()?.state === "race");
  const run = (thr) => page.evaluate((thr) => { window.__hold = true; const E = window.__engine, B = window.__backseat; B.log.length = 0;
    E.newRace(); for (let i = 0; i < 120 * 4; i++) { E.tick(1 / 120); B.step(1 / 120); }
    const P = E.player, T = E.T, offs = [];
    for (let i = 0; i < 120 * 70; i++) {
      const sp = Math.max(0, P.speed), look = Math.round((9 + sp * 0.55) / T.ds), k = (P.idx + look) % T.x.length;
      const fx = Math.sin(P.h), fz = Math.cos(P.h), dx = T.x[k] - P.x, dz = T.z[k] - P.z, err = Math.atan2(fx * dz - fz * dx, fx * dx + fz * dz);
      E.input.steer = Math.max(-1, Math.min(1, err * 2.6)); E.input.thr = thr; const was = P.surf;
      E.tick(1 / 120); B.step(1 / 120);
      if (P.surf === 2 && was !== 2) offs.push({ t: +(i / 120 + 4).toFixed(2), idx: P.idx });
    }
    return { log: B.log.map((x) => ({ ...x })), offs }; }, thr);
  const fast = await run(1);
  console.log("full gas:", fast.log.map((x) => `${x.t}s ${x.kind} @${x.idx} ${x.kmh}km/h`).join(" | "));
  console.log("  went off at", JSON.stringify(fast.offs));
  // both on the back-seat driver's own clock: its "off" shouts mark the exits
  const exits = fast.log.filter((y) => y.kind === "off");
  check("the back-seat driver noticed every exit", exits.length === fast.offs.length, exits.length + "/" + fast.offs.length);
  const warned = exits.filter((o) => fast.log.some((y) => (y.kind === "brake" || y.kind === "slow") && y.t < o.t && y.t > o.t - 6));
  check("every exit at full gas was preceded by a slow-down or brake shout within 6 s", warned.length === exits.length, warned.length + "/" + exits.length);
  check("a full-gas driver is warned to slow down or brake", fast.log.some((y) => y.kind === "brake" || y.kind === "slow"));
  check("the shouts do not run on: under 20 in 70 s", fast.log.length < 20, String(fast.log.length));
  const crawl = await run(0.25);
  console.log("quarter throttle:", crawl.log.map((x) => `${x.t}s ${x.kind}`).join(" | "));
  check("a crawling driver hears 'go'", crawl.log.some((y) => y.kind === "go"));
  check("no page or WebGPU errors", errors.length === 0, errors.slice(0, 3).join(" | "));
}

if (what === "permission") {
  // iOS's prompt, stood in for: requestPermission records each call and settles only when the test answers.
  const page = await b.newPage({ viewport: { width: 393, height: 660 }, isMobile: true, hasTouch: true }), errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => { window.__asks = 0; let answer;
    window.DeviceOrientationEvent.requestPermission = () => { window.__asks++; return new Promise((ok) => { answer = ok; }); };
    window.__answer = (r) => answer(r); });
  await page.goto(base + "index.html");
  await waitFor(page, () => document.getElementById("status").textContent === "Ready.");
  const st = () => page.evaluate(() => ({ asks: window.__asks, intro: !document.getElementById("intro").hidden, state: window.__game().state, start: document.getElementById("start").textContent }));
  check("nothing is asked before a tap", (await st()).asks === 0);
  await page.mouse.click(30, 30);                       // a tap on the start screen's background
  check("a tap anywhere on the start screen asks for motion", (await st()).asks === 1);
  await page.click("#start");
  await page.waitForTimeout(500);
  let s1 = await st();
  check("Start engine waits on the start screen while the prompt is open", s1.intro && s1.state === "idle" && s1.asks === 1, JSON.stringify(s1));
  await page.evaluate(() => { window.__answer("granted"); window.dispatchEvent(Object.assign(new Event("deviceorientation"), { alpha: 0, beta: 0, gamma: -75 })); });
  await waitFor(page, () => window.__game().state === "countdown" || window.__game().state === "race", 10000);
  const s2 = await st();
  check("the race starts once motion is allowed", !s2.intro, JSON.stringify(s2));
  check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
}

if (what === "controls") {
  // Touch pedals and manual gears, driven through the real on-screen controls with a mouse standing in for a thumb.
  const { page, errors } = await open("index.html");
  await waitFor(page, () => document.getElementById("status").textContent === "Ready.");
  await page.evaluate(() => { for (const id of ["pedals", "manual"]) document.getElementById(id).checked = true; });
  await page.click("#start");
  await page.evaluate(() => window.dispatchEvent(Object.assign(new Event("deviceorientation"), { alpha: 0, beta: 0, gamma: -75 })));
  await waitFor(page, () => window.__game().state === "race");
  const vis = await page.evaluate(() => ["gasP", "brkP", "shift"].map((id) => !document.getElementById(id).hidden));
  check("pedals and paddles are on screen", vis.every(Boolean), JSON.stringify(vis));
  const center = async (id) => { const r = await page.locator("#" + id).boundingBox(); return [r.x + r.width / 2, r.y + r.height / 2]; };
  // steer like the computer cars do, through the phone: their aim, sent as a wheel turn (about 31 degrees is full lock)
  const steer = () => page.evaluate(() => { const E = window.__engine, P = E.player, T = E.T, sp = Math.max(0, P.speed), k = (P.idx + Math.round((9 + sp * 0.55) / T.ds)) % T.x.length;
    const fx = Math.sin(P.h), fz = Math.cos(P.h), dx = T.x[k] - P.x, dz = T.z[k] - P.z, s = Math.max(-1, Math.min(1, Math.atan2(fx * dz - fz * dx, fx * dx + fz * dz) * 2.6));
    window.dispatchEvent(Object.assign(new Event("deviceorientation"), { alpha: 0, beta: s * 31, gamma: -75 })); });
  const drive = async (secs) => { const t = await raceT(page); while ((await raceT(page)) < t + secs) { await steer(); await page.waitForTimeout(40); } };
  const press = async (id, secs) => { const [x, y] = await center(id); await page.mouse.move(x, y); await page.mouse.down(); await drive(secs); await page.mouse.up(); };
  const tap = async (id) => { const [x, y] = await center(id); await page.mouse.click(x, y); await page.waitForTimeout(80); };
  await press("gasP", 4);
  const a = await you(page);
  check("gas pedal in first gear runs to the limiter and stays in first, even downhill", a.gear === 1 && a.rpm >= 0.95 && a.rpm < 1.08, (a.speed * 3.6).toFixed(0) + " km/h, gear " + a.gear + ", revs " + a.rpm.toFixed(2));
  await tap("up");
  check("the up paddle shifts", (await you(page)).gear === 2);
  // hold the gas with the mouse and shift with the keyboard (E up, Q down): one mouse cannot be two thumbs
  const [gx, gy] = await center("gasP"); await page.mouse.move(gx, gy); await page.mouse.down();
  for (let k = 0; k < 2; k++) { await page.keyboard.press("e"); await page.waitForTimeout(80); }
  await drive(6);
  const b2 = await you(page);
  check("shifting up lets the car run past 100 km/h", b2.gear === 4 && b2.speed * 3.6 > 100, (b2.speed * 3.6).toFixed(0) + " km/h, gear " + b2.gear);
  for (let k = 0; k < 3; k++) { await page.keyboard.press("q"); await page.waitForTimeout(80); }
  await page.mouse.up();
  const c3 = await you(page);
  check("a downshift that would over-rev is refused (third tops out at 130 km/h)", c3.gear === 4 && c3.speed * 3.6 > 132, "gear " + c3.gear + " at " + (c3.speed * 3.6).toFixed(0) + " km/h");
  await tap("dn");
  check("the down paddle refuses it too", (await you(page)).gear === 4);
  await press("brkP", 2);
  const d = await you(page);
  check("brake pedal slows the car", d.speed < b2.speed - 10, (b2.speed * 3.6).toFixed(0) + " -> " + (d.speed * 3.6).toFixed(0) + " km/h");
  await page.screenshot({ path: path.join(OUT, "controls.png") });
  check("no page or WebGPU errors", errors.length === 0, errors.slice(0, 3).join(" | "));
}

if (what === "multi") {
  // Three phones in one room on a local copy of the matchmaking Worker (workers/rally-lobby under wrangler dev):
  // A hosts, B joins over WebRTC, C has no WebRTC at all and must race through the room relay.
  const { spawn } = await import("node:child_process");
  const wrangler = (process.env.WRANGLER || "npx --yes wrangler@4.20.0").split(" ");
  const dev = spawn(wrangler[0], [...wrangler.slice(1), "dev", "--port", "8787", "--ip", "127.0.0.1"], { cwd: path.join(ROOT, "workers", "rally-lobby"), stdio: "ignore" });
  try {
    for (let i = 0; i < 60; i++) { try { const r = await fetch("http://127.0.0.1:8787/"); if (r.ok) break; } catch (e) {} await new Promise((r) => setTimeout(r, 1000)); }
    const lobby = "lobby=ws://127.0.0.1:8787";
    const join = async (q, { noRtc = false } = {}) => {
      const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }), page = await ctx.newPage(), errors = [];
      page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      if (noRtc) await page.addInitScript(() => { delete window.RTCPeerConnection; });
      await page.goto(base + "index.html?" + q + "&" + lobby);
      await waitFor(page, () => document.getElementById("status").textContent === "Ready.");
      await page.click("#friends");
      await waitFor(page, () => document.querySelectorAll("#lbPlayers li").length > 0, 20000);
      return { page, errors };
    };
    const A = await join("x=1");
    const code = await A.page.evaluate(() => document.getElementById("lbCode").textContent);
    const B = await join("room=" + code), C = await join("room=" + code, { noRtc: true });
    await waitFor(A.page, () => { const t = [...document.querySelectorAll("#lbPlayers .tag")].map((e) => e.textContent); return t.length === 3 && !t.includes("connecting"); }, 20000);
    const tags = await A.page.evaluate(() => [...document.querySelectorAll("#lbPlayers li")].map((li) => li.textContent));
    console.log("host's lobby:", JSON.stringify(tags));
    check("three players in the room, host first", tags.length === 3 && /host/.test(tags[0]));
    check("B joined over a direct WebRTC link", /direct/.test(tags[1]), tags[1]);
    check("C, with no WebRTC, races through the room", /via server/.test(tags[2]), tags[2]);
    check("only the host gets a Start button", (await A.page.isVisible("#lbStart")) && !(await B.page.isVisible("#lbStart")) && !(await C.page.isVisible("#lbStart")));
    await A.page.click("#lbStart");
    for (const P of [A, B, C]) await waitFor(P.page, () => window.__game().state === "race", 30000);
    const goTimes = await Promise.all([A, B, C].map((P) => P.page.evaluate(() => window.__game().raceT)));
    check("the lights went out together (race clocks within 0.3 s)", Math.max(...goTimes) - Math.min(...goTimes) < 0.3, goTimes.map((t) => t.toFixed(2)).join(", "));
    for (const P of [A, B, C]) await P.page.keyboard.down("ArrowUp");
    await A.page.waitForTimeout(6000);
    const views = await Promise.all([A, B, C].map((P) => P.page.evaluate(() => window.__game().cars)));
    for (const P of [A, B, C]) await P.page.keyboard.up("ArrowUp");
    const own = (v) => v.find((c) => c.local), seen = (v, slot) => v.find((c) => c.slot === slot);
    const gap = (p, q) => Math.hypot(p.x - q.x, p.z - q.z);
    const [va, vb, vc] = views;
    console.log("slots: A", own(va).slot, "B", own(vb).slot, "C", own(vc).slot, "| speeds", views.map((v) => (own(v).speed * 3.6).toFixed(0)).join(","), "km/h");
    check("everyone is moving (software rendering runs slow, so any real speed)", views.every((v) => own(v).speed > 3));
    check("A sees B's car where B has it (within 8 m)", gap(seen(va, own(vb).slot), own(vb)) < 8, gap(seen(va, own(vb).slot), own(vb)).toFixed(1) + " m");
    check("B sees A's car where A has it", gap(seen(vb, own(va).slot), own(va)) < 8, gap(seen(vb, own(va).slot), own(va)).toFixed(1) + " m");
    check("A sees C's car (relayed) where C has it", gap(seen(va, own(vc).slot), own(vc)) < 8, gap(seen(va, own(vc).slot), own(vc)).toFixed(1) + " m");
    check("C sees the host's computer car where the host has it", gap(seen(vc, 3), seen(va, 3)) < 8, gap(seen(vc, 3), seen(va, 3)).toFixed(1) + " m");
    await B.page.close();
    await waitFor(A.page, () => window.__game().cars.length === 3, 20000).catch(() => {});
    check("when B leaves, its car leaves the host's race", (await A.page.evaluate(() => window.__game().cars.length)) === 3);
    await A.page.screenshot({ path: path.join(OUT, "multi-host.png") });
    for (const P of [A, B, C]) check("no page errors", P.errors.length === 0, P.errors.slice(0, 3).join(" | "));
  } finally { dev.kill(); }
}

if (what === "pedals") {
  // Position sets strength: near the top of a pad is full, near the bottom light. Checked in both layouts, since on a
  // portrait phone the stage is turned and "up the pad" is the screen's left.
  for (const [label, vp] of [["landscape", { viewport: { width: 844, height: 390 } }], ["portrait, turned", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
    const page = await b.newPage(vp), errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem("tilt-rally-options", JSON.stringify({ pedals: true, backseat: false, sound: false })));
    await page.goto(base + "index.html?demo");
    await waitFor(page, () => window.__game?.()?.state);
    await waitFor(page, () => !document.getElementById("brkP").hidden, 60000);
    const rot = await page.evaluate(() => document.documentElement.classList.contains("rot"));
    // a point on the pad at fraction `up` from its bottom edge, in screen coordinates
    const at = async (id, up) => { const r = await page.locator("#" + id).boundingBox();
      return rot ? [r.x + r.width * (1 - up), r.y + r.height / 2] : [r.x + r.width / 2, r.y + r.height * (1 - up)]; };
    const thr = () => page.evaluate(() => window.__game().input.thr);
    // hold for `ms` of game time: software rendering runs a few frames a second, so wall time would undercount the ramp
    const gameT = () => page.evaluate(() => window.__game().raceT);
    const hold = async (id, up, ms) => { const [x, y] = await at(id, up); await page.mouse.move(x, y); await page.mouse.down();
      const t0 = await gameT(); while ((await gameT()) < t0 + ms / 1000) await page.waitForTimeout(30);
      const v = await thr(); await page.mouse.up(); await page.waitForTimeout(300); return v; };
    const brakeTop = await hold("brkP", 0.95, 1500), brakeLow = await hold("brkP", 0.05, 1500), brakeEarly = await hold("brkP", 0.95, 120);
    const gasTop = await hold("gasP", 0.95, 1200), gasLow = await hold("gasP", 0.05, 1200);
    // the glow outside the pad follows the level while the thumb is down
    const [gx, gy] = await at("brkP", 0.95); await page.mouse.move(gx, gy); await page.mouse.down();
    { const t0 = await gameT(); while ((await gameT()) < t0 + 1) await page.waitForTimeout(30); }
    const glow = await page.evaluate(() => ({ lvl: +getComputedStyle(document.getElementById("brkP")).getPropertyValue("--lvl"), shadow: getComputedStyle(document.getElementById("brkP")).boxShadow }));
    await page.mouse.up();
    check(`${label}: braking makes the pad glow beyond its edges`, glow.lvl > 0.9 && /rgba?\(255, 90, 78/.test(glow.shadow), JSON.stringify(glow).slice(0, 120));
    console.log(label, JSON.stringify({ rot, brakeTop, brakeLow, brakeEarly, gasTop, gasLow }));
    check(`${label}: top of the brake is full braking`, brakeTop < -0.9, brakeTop.toFixed(2));
    check(`${label}: bottom of the brake is light`, brakeLow > -0.35 && brakeLow < -0.1, brakeLow.toFixed(2));
    check(`${label}: braking builds instead of slamming on`, brakeEarly > -0.6, brakeEarly.toFixed(2) + " after 0.12 s");
    check(`${label}: gas follows the same layout`, gasTop > 0.9 && gasLow < 0.5 && gasLow > 0.2, gasTop.toFixed(2) + " / " + gasLow.toFixed(2));
    check(`${label}: no page errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
    await page.close();
  }
}

if (what === "circuit") {
  // Real circuits from tracks/*.json, raced by the autopilot: the Nürburgring GP (open, 7 m half-width) and Monaco
  // (street circuit, 5 m half-width, barriers).
  for (const [track, length, hw] of [["nurburgring-gp", 5100, 7], ["monaco", 3307, 5]]) {
    const { page, errors } = await open("index.html?demo&track=" + track);
    await waitFor(page, () => window.__game?.()?.state === "race", 120000);
    const st = await page.evaluate(() => ({ attr: document.getElementById("attr").textContent, stats: window.__game().stats, pick: document.getElementById("track").value }));
    check(`${track}: loaded and credited to OpenStreetMap`, /OpenStreetMap/.test(st.attr) && st.pick === track, st.attr);
    check(`${track}: lap length about ${length} m`, Math.abs(st.stats.L - length) < 60, st.stats.L.toFixed(0) + " m");
    await waitFor(page, () => window.__game().raceT > 25, 600000);
    await page.screenshot({ path: path.join(OUT, `circuit-${track}.png`) });
    const s2 = await page.evaluate(() => window.__game());
    for (const c of s2.cars) console.log("  ", track, c.name, "idx", c.idx, "v", (c.speed * 3.6).toFixed(0), "km/h lat", c.lat.toFixed(1), "surf", c.surf);
    check(`${track}: every car moving and inside the road edges after 25 s`, s2.cars.every((c) => c.speed > 5 && Math.abs(c.lat) < hw + 0.6));
    check(`${track}: no page or WebGPU errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
    await page.close();
  }
}

await b.close(); srv.close();
process.exit(failed ? 1 : 0);
