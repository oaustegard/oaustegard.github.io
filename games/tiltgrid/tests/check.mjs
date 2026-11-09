// Headless check of tiltgrid/web on SwiftShader WebGPU: shader compiles, frames render, the marble rolls,
// tilt events steer it, every course is reachable start-to-goal for the physics, and deaths fire.
//   NODE_PATH=$(npm root -g) node games/tiltgrid/tests/check.mjs [outdir]
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFileSync, existsSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || '/tmp/tiltgrid-check';
mkdirSync(OUT, {recursive: true});
const server = createServer((q, r) => {
  const p = join(WEB, q.url.split('?')[0] === '/' ? 'index.html' : q.url.split('?')[0]);
  if (!existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); r.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({args: ['--enable-unsafe-webgpu', '--use-angle=swiftshader', '--use-webgpu-adapter=swiftshader',
  '--use-vulkan=swiftshader', '--enable-features=Vulkan', '--autoplay-policy=no-user-gesture-required']});
const page = await browser.newPage({viewport: {width: 1100, height: 700}, deviceScaleFactor: 1});
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto(url);
await page.waitForFunction(() => window.TILTGRID && window.TILTGRID.Game.state !== 'boot', null, {timeout: 60000});
const gpu = await page.evaluate(() => window.TILTGRID.GFX.ok);
const fps = await page.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); }; requestAnimationFrame(f); }));
console.log('fps on this renderer:', fps);
console.log('webgpu ok:', gpu);
await page.waitForTimeout(2500);
await page.screenshot({path: join(OUT, 'title.png')});
const results = {gpu, fps, checks: {}};
const ok = (name, cond, detail) => { results.checks[name] = {pass: !!cond, detail}; console.log((cond ? 'PASS ' : 'FAIL ') + name, detail ?? ''); };

// Start and roll with the keyboard (screen-down = +x+z on the floor)
await page.click('#startBtn');
await page.waitForFunction(() => window.TILTGRID.Game.state === 'play', null, {timeout: 10000});
const p0 = await page.evaluate(() => window.TILTGRID.Game.player.p.slice());
await page.keyboard.down('ArrowDown'); await page.waitForTimeout(1200); await page.keyboard.up('ArrowDown');
const p1 = await page.evaluate(() => window.TILTGRID.Game.player.p.slice());
ok('keys move the marble toward screen-bottom (+x+z)', p1[2] - p0[2] > 0.5, {p0, p1});
await page.screenshot({path: join(OUT, 'play.png')});

// Tilt: synthetic deviceorientation. Baseline is the first event; then tilt right edge down (gamma +).
const tilt = await page.evaluate(() => {
  const T = window.TILTGRID, fire = (beta, gamma) => window.dispatchEvent(Object.assign(new Event('deviceorientation'), {beta, gamma}));
  fire(30, 0); T.Input.tilt.base = T.Input.tilt.raw.slice();
  fire(30, 15); const right = window.__tv = null;
  return {on: T.Input.tilt.on, raw: T.Input.tilt.raw, base: T.Input.tilt.base};
});
ok('deviceorientation turns tilt on', tilt.on, tilt);

// Pure-physics reachability: script an autopilot along each course's waypoints in page context.
const runs = await page.evaluate(() => {
  const T = window.TILTGRID, out = [];
  // waypoint routes (cell centres) through each course, start to goal
  const ROUTES = [
    [[4.5, 2.5], [4.5, 7], [4.5, 11], [9, 12], [9, 16], [9, 20], [7, 24], [5.9, 26.5], [5.9, 30], [5.9, 34.6]],
    [[3, 2.5], [8, 2.5], [14, 3], [14, 9], [14, 12.5], [9.9, 14.5], [9.9, 19], [9.9, 22.6], [7, 23], [5, 26], [5, 30], [6, 32.5], [9.5, 33.5], [13, 33.5], [15.5, 35], [15.5, 40.5]],
    [[10.5, 1.5], [10.5, 8], [10.5, 14], [5.5, 16.5], [5.5, 25], [6, 27.5], [10, 28.6], [10, 31.5], [10, 34], [10, 38.5], [12, 42], [12, 44.5], [11, 48.6]],
    [[3.5, 2.5], [10, 2.5], [16.6, 3.5], [16.6, 10], [16.6, 14.5], [15.5, 17], [15.5, 21], [15.5, 26.5], [9, 29.5], [8.9, 33], [8.9, 38.5], [8.5, 41], [10, 44.5], [10, 50], [10, 54.5]],
  ];
  for (let ci = 0; ci < T.COURSES.length; ci++) {
    const L = T.buildCourse(ci), b = {p: [L.start[0], T.surf(L, L.start[0], L.start[1]), L.start[1]], v: [0, 0, 0], r: 0.32, grounded: true, airY: 0, R: [1, 0, 0, 0, 1, 0, 0, 0, 1], maxv: 4.5};
    let wi = 0, t = 0, maxDrop = 0, fate = 'timeout';
    const route = ROUTES[ci];
    while (t < 90) {
      const w = route[Math.min(wi, route.length - 1)], dx = w[0] - b.p[0], dz = w[1] - b.p[2], d = Math.hypot(dx, dz);
      if (d < 0.45 && wi < route.length - 1) wi++;
      // steer: desired velocity toward waypoint, P-controller on velocity
      const want = Math.min(3.2, d * 2.5), vx = dx / (d || 1) * want, vz = dz / (d || 1) * want;
      let ix = (vx - b.v[0]) * 0.9, iz = (vz - b.v[2]) * 0.9; const l = Math.hypot(ix, iz); if (l > 1) { ix /= l; iz /= l; }
      const ev = {}; T.stepBody(L, b, ix, iz, 1 / 240, 1, ev); t += 1 / 240;
      if (ev.land != null) maxDrop = Math.max(maxDrop, ev.land);
      if (ev.land > 2.4) { fate = 'shatter'; break; }
      if (b.p[1] < L.minH - 5) { fate = 'fall'; break; }
      const c = L.cells[Math.floor(b.p[2]) * L.w + Math.floor(b.p[0])];
      if (b.grounded && c && c.mat === 2) { fate = 'acid'; break; }
      if (b.grounded && c && c.mat === 3) { fate = 'goal'; break; }
    }
    out.push({course: L.name, fate, t: +t.toFixed(1), waypoint: wi, of: route.length, pos: b.p.map((x) => +x.toFixed(2)), maxDrop: +maxDrop.toFixed(2), budget: L.time});
  }
  return out;
});
for (const r of runs) ok(`course "${r.course}" reachable by autopilot`, r.fate === 'goal', r);

// Deaths: drop the live marble off the start platform edge of course 1 into the void, and onto a tall ledge
const deaths = await page.evaluate(async () => {
  const T = window.TILTGRID, G = T.Game, P = G.player, wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const res = {};
  // void: push west off the start platform (x < 2)
  P.p = [2.2, P.p[1], 2.5]; P.v = [-6, 0, 0]; P.grounded = true; P.hidden = false; G.invuln = 0;
  if (G.state !== 'play') { G.state = 'play'; }
  for (let i = 0; i < 600 && G.state === 'play'; i++) await wait(50);
  res.voidState = G.state; res.voidMsg = document.querySelector('#bTitle').textContent;
  for (let i = 0; i < 600 && G.state !== 'play'; i++) await wait(50);
  res.respawned = G.state;
  // shatter: lift the marble 4 units above the floor
  P.p = [4.5, P.p[1] + 4, 3.5]; P.v = [0, 0, 0]; P.grounded = false; P.airY = P.p[1];
  for (let i = 0; i < 600 && G.state === 'play'; i++) await wait(50);
  res.shatterMsg = document.querySelector('#bTitle').textContent; res.shards = G.shards.length;
  return res;
});
ok('falling off the grid kills', deaths.voidState === 'dead' && /void/i.test(deaths.voidMsg), deaths);
ok('dead marble respawns', deaths.respawned === 'play', deaths);
ok('a 4-unit fall shatters', /shatter/i.test(deaths.shatterMsg) && deaths.shards > 0, deaths);
await page.waitForTimeout(300);
await page.screenshot({path: join(OUT, 'shatter.png')});

// Render every course once for a visual check
for (let i = 1; i < 4; i++) {
  await page.evaluate((i) => { const T = window.TILTGRID; T.Game.state = 'ready'; T.Game.stateT = 0; }, i);
  await page.evaluate((i) => { const T = window.TILTGRID; const G = T.Game; G.li = i - 1; G.state = 'goal'; G.stateT = 0; }, i);
  await page.waitForFunction((i) => window.TILTGRID.Game.li === i, i, {timeout: 5000});
  await page.waitForFunction(() => window.TILTGRID.Game.state === 'play', null, {timeout: 60000});
  await page.screenshot({path: join(OUT, `course${i + 1}.png`)});
}
const audio = await page.evaluate(() => ({state: window.TILTGRID.Chip.ctx && window.TILTGRID.Chip.ctx.state, step: window.TILTGRID.Chip.step}));
ok('music sequencer is advancing', audio.step > 16, audio);
ok('no console errors', errors.length === 0, errors.slice(0, 10));
await browser.close(); server.close();
const {writeFileSync} = await import('node:fs');
writeFileSync(join(OUT, 'check.json'), JSON.stringify(results, null, 1));
const failed = Object.entries(results.checks).filter(([, v]) => !v.pass).map(([k]) => k);
console.log(failed.length ? 'FAILED: ' + failed.join('; ') : 'all checks passed');
process.exit(failed.length ? 1 : 0);
