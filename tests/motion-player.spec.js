// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Motion Player', () => {
  test('landing screen loads with zero pageerrors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));

    await page.goto('/motion-player/');

    await expect(page.locator('#landing')).toBeVisible();
    await expect(page.locator('#url-input')).toBeVisible();
    await expect(page.locator('#play-btn')).toBeVisible();
    await expect(page.locator('h1.brand')).toContainText('Motion Player');

    expect(errors).toEqual([]);
  });

  test('pasting a YouTube URL and clicking Play switches to player mode', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));

    await page.goto('/motion-player/');

    await page.locator('#url-input').fill('https://youtu.be/dQw4w9WgXcQ');
    await page.locator('#play-btn').click();

    await expect(page.locator('#player')).toBeVisible();
    await expect(page.locator('#yt-host')).toBeVisible();
    await expect(page).toHaveURL(/[?&]v=dQw4w9WgXcQ(&|$)/);

    expect(errors).toEqual([]);
  });

  test('direct ?v= link boots straight into player mode without YouTube reachable', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));

    await page.goto('/motion-player/?v=dQw4w9WgXcQ');

    await expect(page.locator('#player')).toBeVisible();
    await expect(page.locator('#yt-host')).toBeVisible();

    // Let the YT iframe_api script.onerror / 6s timeout path resolve without
    // throwing — the shell must stay up regardless of network reachability.
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });

  test('dynamic zoom floor (containScale) replaces the old hardcoded ZOOM_MIN in portrait', async ({ page }) => {
    // Force a portrait-ish viewport so the dynamic contain scale is well
    // below the old hardcoded ZOOM_MIN=0.5 (bug: "cannot zoom out far enough
    // to see the full video width in portrait"). window.__motionPlayerDebug
    // is a test-only read-only snapshot hook exposed by app.js.
    await page.setViewportSize({ width: 375, height: 812 });

    const errors = [];
    page.on('pageerror', (err) => errors.push(err));

    await page.goto('/motion-player/?v=dQw4w9WgXcQ');
    await expect(page.locator('#player')).toBeVisible();

    const debugState = await page.evaluate(() => window.__motionPlayerDebug());
    expect(debugState.containScale).toBeGreaterThan(0);
    expect(debugState.containScale).toBeLessThan(0.5);
    // Default zoom (1, "Fill") must never be clamped below the new floor.
    expect(debugState.zoom).toBeGreaterThanOrEqual(debugState.containScale);

    expect(errors).toEqual([]);
  });

  test('share-target ?text= param with an embedded YouTube link boots the player', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));

    const shared = encodeURIComponent('Check this out https://youtu.be/dQw4w9WgXcQ via YouTube');
    await page.goto(`/motion-player/?text=${shared}`);

    await expect(page.locator('#player')).toBeVisible();
    await expect(page.locator('#yt-host')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('motion.js twirl-invariance test vector holds in the browser', async ({ page }) => {
    await page.goto('/motion-player/');

    const results = await page.evaluate(async () => {
      const mod = await import('./motion.js');
      const { eulerToMatrix, screenRollDeg, matMul, rotZ } = mod;
      const R0 = eulerToMatrix(0, 90, 0);
      return [10, 45, 90, 170].map((t) => {
        const R = matMul(R0, rotZ(t));
        return { t, phi: screenRollDeg(R) };
      });
    });

    for (const { t, phi } of results) {
      expect(Math.abs(phi - t)).toBeLessThan(2);
    }
  });
});
