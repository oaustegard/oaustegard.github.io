// Order control on district pages and /tools.html (scripts/sort-list.js).
const { test, expect } = require('@playwright/test');

const names = (page, list) => page.$$eval(list + ' > li .nm', l => l.map(x => x.textContent));
const dates = (page, list) => page.$$eval(list + ' > li', l => l.map(x => x.getAttribute('data-added') || '9999'));

for (const district of ['fun-and-games', 'bsky']) {
  test(`${district}: Newest and A-Z reorder the rows and the choice persists`, async ({ page }) => {
    await page.goto(`/${district}/`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const list = '#tools-list';
    const featured = await names(page, list);
    await expect(page.getByRole('button', { name: 'Featured' })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Newest' }).click();
    await expect(page.getByRole('button', { name: 'Newest' })).toHaveAttribute('aria-pressed', 'true');
    const d = await dates(page, list);
    expect(d).toEqual([...d].sort().reverse());
    expect(await names(page, list)).not.toEqual(featured);

    await page.getByRole('button', { name: 'A–Z' }).click();
    const az = await names(page, list);
    const key = s => s.replace(/^[^0-9A-Za-z]+/, '');
    expect(az).toEqual([...az].sort((a, b) => key(a).localeCompare(key(b), 'en', { sensitivity: 'base', numeric: true })));

    await page.reload();
    expect(await names(page, list)).toEqual(az);
    await page.getByRole('button', { name: 'Featured' }).click();
    expect(await names(page, list)).toEqual(featured);
  });
}

test('tools.html: one control orders every district list', async ({ page }) => {
  await page.goto('/tools.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Newest' }).click();
  for (const id of ['#list-bsky', '#list-ai-tools']) {
    const d = await dates(page, id);
    expect(d).toEqual([...d].sort().reverse());
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the control stays hidden and the generated order stands', async ({ page }) => {
    await page.goto('/bsky/');
    await expect(page.locator('.sort-ctl')).toBeHidden();
    expect((await names(page, '#tools-list')).length).toBeGreaterThan(5);
  });
});
