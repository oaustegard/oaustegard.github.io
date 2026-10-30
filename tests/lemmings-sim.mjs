// Headless checks for Lemmings under SwiftShader: compiles every kernel, then plays each
// level's scripted solution and checks that enough lemmings get home.
//   node tests/lemmings-sim.mjs [levelIndex ...] [--shots DIR]
// Needs Playwright's Chromium. Serves the repo itself on a free port.
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { deflateSync } from "node:zlib";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const ROOT = resolve(new URL("..", import.meta.url).pathname);
const args = process.argv.slice(2);
const shotDir = args.includes("--shots") ? args[args.indexOf("--shots") + 1] : null;
const only = args.filter((a, i) => /^\d+$/.test(a) && args[i - 1] !== "--shots").map(Number);

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json" };
const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
    const body = await readFile(p.endsWith("/") ? join(p, "index.html") : p);
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

function png(w, h, rgba) {
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const t = Buffer.from(type), len = Buffer.alloc(4), c = Buffer.alloc(4);
    len.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, c]);
  };
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

const browser = await chromium.launch({ args: ["--enable-unsafe-webgpu", "--enable-features=Vulkan", "--use-angle=swiftshader", "--use-webgpu-adapter=swiftshader", "--disable-vulkan-surface"] });
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("page:", m.text()); });
await page.goto(base + "/games/lemmings/sprites.js");

// Each plan is a list of steps run in the page: { skill, pick, after, id, needs } assigns `skill` to
// the first lemming for which `pick` (a function source over a lemming record) is true, once `after`
// holds for the world and the step named `needs` is done. Steps fire in any order, one per tick.
const PLANS = {
  0: [{ skill: "digger", pick: "l => l.state === 1 && l.x > 300 && l.x < 420" }],
  1: [
    { id: "b", skill: "builder", pick: "l => l.state === 1 && l.x >= 326 && l.x <= 334 && l.dir > 0" },
    { id: "k", needs: "b", skill: "blocker", pick: "l => l.state === 1 && l.x >= 280 && l.x <= 310 && l.dir > 0" },
    { needs: "k", skill: "bomber", after: "w => w.tick > 900", pick: "l => l.state === 11" },
  ],
  2: [
    { skill: "basher", pick: "l => l.state === 1 && l.dir > 0 && l.x >= 250 && l.x <= 258" },
    { skill: "basher", pick: "l => l.state === 1 && l.dir > 0 && l.x >= 470 && l.x <= 478" },
    { skill: "basher", pick: "l => l.state === 1 && l.dir > 0 && l.x >= 690 && l.x <= 698" },
  ],
  3: [{ skill: "miner", pick: "l => l.state === 1 && l.dir > 0 && l.x >= 370 && l.x <= 380" }],
  4: Array.from({ length: 20 }, () => [
    { skill: "climber", pick: "l => l.state === 2 && !(l.flags & 1)" },
    { skill: "floater", pick: "l => l.state === 2 && !(l.flags & 2)" },
  ]).flat(),
  5: Array.from({ length: 12 }, () => ({ skill: "floater", pick: "l => l.state === 2 && !(l.flags & 2)" })),
  6: [
    { skill: "digger", pick: "l => l.state === 1 && l.x >= 180 && l.x <= 200" },
    { id: "b1", skill: "builder", pick: "l => l.state === 1 && l.x >= 553 && l.x <= 556 && l.dir > 0" },
    { needs: "b1", skill: "blocker", pick: "l => l.state === 1 && l.x >= 330 && l.x <= 548 && l.dir > 0" },
    { needs: "b1", skill: "builder", pick: "l => l.state === 7" },
    { skill: "basher", pick: "l => l.state === 1 && l.dir > 0 && l.x >= 788 && l.x <= 796" },
    { skill: "bomber", after: "w => w.tick > 1500", pick: "l => l.state === 11" },
  ],
  7: [
    { id: "b", skill: "builder", pick: "l => l.state === 1 && l.dir > 0 && l.x >= 1228 && l.x <= 1236" },
    { needs: "b", skill: "blocker", pick: "l => l.state === 1 && l.dir > 0 && l.x >= 1180 && l.x <= 1220" },
    { id: "w", skill: "basher", pick: "l => l.state === 1 && l.dir > 0 && l.x >= 1468 && l.x <= 1476" },
    { needs: "w", skill: "bomber", after: "w => w.tick > 700", pick: "l => l.state === 11" },
  ],
};

const setup = await page.evaluate(async () => {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  device.addEventListener("uncapturederror", (e) => console.error("GPU:", e.error.message));
  const { Game } = await import("./engine.js");
  const { LEVELS } = await import("./levels.js");
  const t0 = performance.now();
  window.game = await Game.create(device);
  window.LEVELS = LEVELS;
  return { ms: Math.round(performance.now() - t0), levels: LEVELS.map((l) => l.name), kernels: Object.keys(window.game.pipe).length };
});
console.log(`compiled ${setup.kernels} kernels in ${setup.ms} ms`);

// PREVIEW=1: render each whole level at tick 40 and write level<i>-full.png, without playing
if (process.env.PREVIEW) {
  for (const [li] of setup.levels.entries()) {
    if (only.length && !only.includes(li)) continue;
    const r = await page.evaluate(async (li) => {
      const g = window.game; g.loadLevel(window.LEVELS[li]); g.setView(0, g.W, 0, g.H);
      for (let k = 0; k < 5; k++) g.frame(8);
      return { px: Array.from(await g.readPixels()), vw: g.vw, rows: g.rows };
    }, li);
    await mkdir(shotDir, { recursive: true });
    await writeFile(join(shotDir, `level${li}-full.png`), png(r.vw, r.rows, new Uint8Array(r.px)));
  }
  await browser.close(); server.close(); process.exit(0);
}

// plays level li with the given plan in the page; plan [] is the idle run
function runLevel(li, plan) {
  return page.evaluate(async ({ li, plan, trace, shotAt }) => {
    const g = window.game, lvl = window.LEVELS[li], { SKILLS } = await import("./shaders.js");
    g.loadLevel(lvl);
    const steps = plan.map((s) => ({ ...s, pick: eval(s.pick), after: s.after ? eval(s.after) : () => true }));
    let w = await g.readWorld(), log = [];
    const limit = Math.round(lvl.minutes * 60 * 17) + 40;
    const t0 = performance.now();
    const doneIds = new Set();
    let mid = null;
    while (!w.done && w.tick < limit) {
      const ready = steps.filter((s) => (!s.needs || doneIds.has(s.needs)) && s.after(w));
      let step = null, lems = [];
      if (ready.length) {
        const all = await g.readLemmings(w.released);
        for (const s of ready) { lems = all.filter(s.pick); if (lems.length) { step = s; break; } }
      }
      {
        if (step) {
          const l = lems[0];
          g.input.skill = SKILLS.indexOf(step.skill); g.input.curX = l.x; g.input.curY = l.y - 5; g.input.click++;
          g.frame(1);
          const w2 = await g.readWorld();
          const ok = w2.skills[g.input.skill] < w.skills[g.input.skill];
          log.push(`t${w.tick} ${step.skill} -> #${l.i} at ${l.x},${l.y}${ok ? "" : " (refused)"}`);
          if (ok) { steps.splice(steps.indexOf(step), 1); if (step.id) doneIds.add(step.id); }
          g.input.curX = -9999;
          w = w2;
          continue;
        }
      }
      g.frame(steps.length || trace >= 0 ? 1 : 8);
      w = await g.readWorld();
      if (!mid && shotAt && w.tick >= shotAt[0]) {
        const keep = [g.camX, g.vw];
        g.setView(shotAt[1], 480, shotAt[2] ?? 0); g.frame(0);
        mid = { px: Array.from(await g.readPixels()), vw: g.vw };
        g.setView(...keep);
      }
      if (trace >= 0 && trace < w.released) {
        const [l] = (await g.readLemmings(trace + 1)).slice(trace);
        const key = `${l.state}`;
        if (key !== window.lastKey) log.push(`t${w.tick} #${trace} state ${l.state} at ${l.x},${l.y} dir ${l.dir} fall ${l.fall} flags ${l.flags}`);
        window.lastKey = key;
      }
    }
    const px = await g.readPixels();
    return { mid, w, log, ms: Math.round(performance.now() - t0), vw: g.vw, rows: g.rows, px: Array.from(px), need: Math.ceil(lvl.need * lvl.count / 100) };
  }, { li, plan, trace: Number(process.env.TRACE ?? -1), shotAt: process.env.SHOT ? process.env.SHOT.split(":").map(Number) : null });
}

let failed = 0;
for (const [li, name] of setup.levels.entries()) {
  if (only.length && !only.includes(li)) continue;
  const r = await runLevel(li, process.env.NOPLAN ? [] : PLANS[li] || []);
  const ok = r.w.saved >= r.need;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${li} ${name}: saved ${r.w.saved}/${setup.levels.length && r.need} needed, dead ${r.w.dead}, ${r.w.tick} ticks in ${r.ms} ms`);
  for (const l of r.log) console.log("     " + l);
  // no level may solve itself: with no skills given, too few lemmings may get home
  if (!process.env.NOPLAN && !process.env.TRACE) {
    const idle = await runLevel(li, []);
    const solves = idle.w.saved >= idle.need;
    if (solves) failed++;
    console.log(`${solves ? "FAIL" : "ok  "} ${li} ${name} left alone: saved ${idle.w.saved}/${idle.need}`);
  }
  if (shotDir) {
    await mkdir(shotDir, { recursive: true });
    await writeFile(join(shotDir, `level${li}.png`), png(r.vw, r.rows, new Uint8Array(r.px)));
    if (r.mid) await writeFile(join(shotDir, `level${li}-mid.png`), png(r.mid.vw, r.rows, new Uint8Array(r.mid.px)));
  }
}
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
