// Tilt Rally headless checks on SwiftShader WebGPU (correctness only; real-GPU timing goes through the GPU Bridge):
//   node tests/tilt-rally-check.mjs math    orientation -> wheel/pedal on known poses
//   node tests/tilt-rally-check.mjs demo    autopilot race: no WebGPU errors, every car moving and on the road
//   node tests/tilt-rally-check.mjs tilt    synthetic deviceorientation events: tilt away accelerates, clockwise steers right, tilt back brakes
//   node tests/tilt-rally-check.mjs cars    close-up stills of the cars (front three-quarter, rear, side) into OUT
//   node tests/tilt-rally-check.mjs grip    a full-gas driver with perfect aim stays on the road (pass a JSON list of tunings to compare)
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
const b = await chromium.launch({ args: ["--enable-unsafe-webgpu", "--enable-features=Vulkan", "--use-vulkan=swiftshader", "--use-angle=swiftshader", "--use-webgpu-adapter=swiftshader"] });
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

await b.close(); srv.close();
process.exit(failed ? 1 : 0);
