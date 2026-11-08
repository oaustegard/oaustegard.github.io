// @ts-check
// Comet Keeper: the flick detector, fed scripted orientation and gyroscope streams, and the keyboard path.
const { test, expect } = require('@playwright/test');

// Replays a pitch (beta) schedule at 60 Hz as deviceorientation events with ±0.3° of noise, plus devicemotion
// rotationRate scaled by __sim.rr (0 = no gyroscope, 1 = degrees per second, 1/57.3 = radians per second).
const SIM = `window.__sim = { beta: 60, gamma: 0, seg: null, queue: [], rr: 0, lastBeta: 60, lastT: performance.now() };
setInterval(() => {
  const s = __sim, t = performance.now();
  if (!s.seg && s.queue.length) { const [d, b] = s.queue.shift(); s.seg = { t0: t, d, b0: s.beta, b1: b }; }
  if (s.seg) { const u = Math.min(1, (t - s.seg.t0) / s.seg.d); s.beta = s.seg.b0 + (s.seg.b1 - s.seg.b0) * u; if (u >= 1) s.seg = null; }
  const dt = (t - s.lastT) / 1000, rate = dt > 0 ? (s.beta - s.lastBeta) / dt : 0; s.lastT = t; s.lastBeta = s.beta;
  if (s.rr) dispatchEvent(new DeviceMotionEvent('devicemotion', { rotationRate: { alpha: 0, beta: rate * s.rr, gamma: 0 }, interval: 16 }));
  dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: s.beta + (Math.random() - 0.5) * 0.6, gamma: s.gamma }));
}, 16);`;

async function startWithSensors(page, context, rr) {
  await context.grantPermissions(['accelerometer', 'gyroscope', 'magnetometer']);
  await page.addInitScript(SIM);
  await page.goto('/games/comet-keeper/');
  await page.evaluate(v => { window.__sim.rr = v; }, rr);
  await page.locator('#trainBtn').click();
  await expect(page.locator('#calib')).toBeVisible();
  await page.locator('#readyBtn').click();
  await page.evaluate(() => { window.CK.log = []; });
}
const flicks = page => page.evaluate(() => window.CK.log.splice(0).filter(e => e[0] === 's').map(e => e[1]));
const queue = (page, segs) => page.evaluate(a => window.__sim.queue.push(...a), segs);

for (const [label, rr] of [['tilt angle only', 0], ['gyroscope in rad/s', 1 / 57.3]]) {
  test(`flick detector, ${label}`, async ({ page, context }) => {
    test.setTimeout(30000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await startWithSensors(page, context, rr);

    await page.waitForTimeout(1500);
    expect(await flicks(page)).toEqual([]);                      // holding still with sensor noise: nothing

    await queue(page, [[70, 38], [120, 62], [200, 60]]);         // forward flick, sharp swing back
    await page.waitForTimeout(1200);
    expect(await flicks(page)).toEqual([1]);                     // the swing back is not a catch
    await expect.poll(() => page.evaluate(() => window.CK.game.train.step)).toBe(1);   // the throw hit the target

    await queue(page, [[100, 82], [200, 82], [90, 44], [250, 60]]);   // cradle back, then whip forward
    await page.waitForTimeout(1200);
    expect(await flicks(page)).toEqual([-1, 1]);

    if (rr) {
      // a few more flicks give the gyroscope fit its samples; it should settle on radians
      for (let i = 0; i < 3; i++) { await queue(page, [[70, 36], [250, 60], [200, 60]]); await page.waitForTimeout(700); }
      const m = await page.evaluate(() => ({ trust: window.CK.motion.trustRR, k: window.CK.motion.k }));
      expect(m.trust).toBe(true);
      expect(m.k).toBeCloseTo(180 / Math.PI, 3);
    }
    expect(errors).toEqual([]);
  });
}

test('keyboard: training throws, then a catch', async ({ page }) => {
  test.setTimeout(30000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/games/comet-keeper/');
  await page.locator('#trainBtn').click();
  await expect.poll(() => page.evaluate(() => window.CK.game.mode)).toBe('train');
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(80); await page.keyboard.up('ArrowUp');
  await expect.poll(() => page.evaluate(() => window.CK.game.train.step)).toBe(1);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(260); await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(500); await page.keyboard.up('ArrowUp');
  await expect.poll(() => page.evaluate(() => window.CK.game.train.step), { timeout: 5000 }).toBe(2);
  // catch drill: press ↓ when the comet is about to land
  await page.waitForFunction(() => { const o = window.CK.game.incoming[0]; return o && o.T - o.t < 0.1; }, null, { timeout: 8000, polling: 'raf' });
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => page.evaluate(() => window.CK.game.held && window.CK.game.held.kind)).toBe('wisp');
  expect(errors).toEqual([]);
});
