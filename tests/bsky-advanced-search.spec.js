// @ts-check
const { test, expect } = require('@playwright/test');

const PAGE = '/bsky/advanced-search.html';

/** Reads the built URL out of the sticky output panel. */
async function builtUrl(page) {
  return (await page.locator('#url-out').textContent()) || '';
}

/** Parses the built URL into a {pathname, params} shape for assertions. */
async function builtParams(page) {
  const url = new URL(await builtUrl(page));
  return Object.fromEntries(url.searchParams.entries());
}

async function setRow(page, index, { mode, field, value }) {
  const row = page.locator('.filter-row').nth(index);
  if (mode) await row.locator('select').nth(0).selectOption(mode);
  if (field) await row.locator('select').nth(1).selectOption(field);
  if (value !== undefined) await row.locator('input').fill(value);
}

test.describe('Bluesky advanced search builder', () => {
  /*
   * The page is entirely local, but the shared stylesheet @imports Google
   * Fonts — a render-blocking third-party request that lands in the load
   * event. Sandboxed CI has no egress to it and stalls ~12s per navigation.
   * Cutting off every non-local request keeps these tests hermetic and fast;
   * nothing under test depends on the network.
   */
  test.beforeEach(async ({ page }) => {
    await page.route('**/*', route => {
      const host = new URL(route.request().url()).hostname;
      return (host === 'localhost' || host === '127.0.0.1')
        ? route.continue()
        : route.abort();
    });
  });

  test('starts empty and offers no URL', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('#url-out')).toHaveClass(/empty/);
    await expect(page.locator('.filter-row')).toHaveCount(1);
  });

  test('builds free-text q with phrase and negation', async ({ page }) => {
    await page.goto(PAGE);
    await page.fill('#f-query', 'atproto firehose');
    await page.fill('#f-exact', 'machine learning');
    await page.fill('#f-none', 'crypto nft');

    const params = await builtParams(page);
    expect(params.q).toBe('atproto firehose "machine learning" -crypto -nft');
  });

  test('emits structured sibling params for filter rows', async ({ page }) => {
    await page.goto(PAGE);
    await page.fill('#f-query', 'claude');
    await setRow(page, 0, { field: 'authors', value: '@austegard.com' });
    await page.click('#add-filter');
    await setRow(page, 1, { mode: 'exclude', field: 'domains', value: 'example.com' });
    await page.click('#add-filter');
    await setRow(page, 2, { field: 'tags', value: '#atproto #bsky' });

    const params = await builtParams(page);
    expect(params.q).toBe('claude');
    expect(params.author).toBe('austegard.com');   // leading @ stripped
    expect(params.excludeDomain).toBe('example.com');
    expect(params.tag).toBe('atproto bsky');       // leading # stripped, space-joined
  });

  test('merges duplicate rows of the same field and mode', async ({ page }) => {
    await page.goto(PAGE);
    await setRow(page, 0, { field: 'authors', value: 'alice.test alice.test' });
    await page.click('#add-filter');
    await setRow(page, 1, { field: 'authors', value: 'bob.test' });

    const params = await builtParams(page);
    expect(params.author).toBe('alice.test bob.test');
  });

  test('emits attribute params for replies, media, language and dates', async ({ page }) => {
    await page.goto(PAGE);
    await page.fill('#f-query', 'cats');
    await page.selectOption('#f-replies', 'none');
    await page.selectOption('#f-media', 'video');
    await page.selectOption('#f-lang', 'no');
    await page.fill('#f-since', '2026-01-01');
    await page.fill('#f-until', '2026-02-01');

    const params = await builtParams(page);
    expect(params).toMatchObject({
      q: 'cats',
      replies: 'none',
      video: 'true',
      lang: 'no',
      since: '2026-01-01',
      until: '2026-02-01',
    });
    expect(params.media).toBeUndefined();
  });

  test('maps the author dropdown to from=me and following=true', async ({ page }) => {
    await page.goto(PAGE);
    await page.fill('#f-query', 'cats');

    await page.selectOption('#f-from', 'me');
    expect(await builtParams(page)).toMatchObject({ from: 'me' });

    await page.selectOption('#f-from', 'following');
    const params = await builtParams(page);
    expect(params.following).toBe('true');
    expect(params.from).toBeUndefined();
  });

  test('promotes a typed from:me out of the query text', async ({ page }) => {
    await page.goto(PAGE);
    await page.fill('#f-query', 'cats from:me');

    const params = await builtParams(page);
    expect(params.q).toBe('cats');
    expect(params.from).toBe('me');
  });

  test('classic mode packs filters into q and warns about the rest', async ({ page }) => {
    await page.goto(PAGE);
    await page.fill('#f-query', 'cats');
    await setRow(page, 0, { field: 'authors', value: 'austegard.com' });
    await page.click('#add-filter');
    await setRow(page, 1, { mode: 'exclude', field: 'tags', value: 'spam' });
    await page.selectOption('#f-lang', 'en');
    await page.selectOption('#f-media', 'media');

    await page.check('input[name="urlstyle"][value="operators"]');

    const params = await builtParams(page);
    expect(Object.keys(params)).toEqual(['q']);
    expect(params.q).toBe('cats from:austegard.com lang:en');

    const warnings = await page.locator('#warnings').textContent();
    expect(warnings).toContain('exclude hashtag');
    expect(warnings).toContain('has media');
  });

  test('round-trips a shared bsky.app URL back into the form', async ({ page }) => {
    await page.goto(PAGE);
    await page.locator('details', { hasText: 'Load an existing search' }).first()
      .locator('summary').click();
    await page.fill('#f-import',
      'https://bsky.app/search?q=%22hello+world%22+-spam&author=austegard.com&excludeDomain=example.com&tag=atproto&lang=en&since=2026-03-01&replies=only&video=true');
    await page.click('#import-go');

    await expect(page.locator('#f-exact')).toHaveValue('hello world');
    await expect(page.locator('#f-none')).toHaveValue('spam');
    await expect(page.locator('#f-lang')).toHaveValue('en');
    await expect(page.locator('#f-since')).toHaveValue('2026-03-01');
    await expect(page.locator('#f-replies')).toHaveValue('only');
    await expect(page.locator('#f-media')).toHaveValue('video');

    const params = await builtParams(page);
    expect(params).toMatchObject({
      author: 'austegard.com',
      excludeDomain: 'example.com',
      tag: 'atproto',
      replies: 'only',
      video: 'true',
    });
  });

  test('lifts classic operators out of an imported raw query', async ({ page }) => {
    await page.goto(PAGE);
    await page.locator('details', { hasText: 'Load an existing search' }).first()
      .locator('summary').click();
    await page.fill('#f-import', 'cats from:@alice.test domain:npr.org #caturday lang:ja since:2026-05-05');
    await page.click('#import-go');

    await expect(page.locator('#f-query')).toHaveValue('cats');
    await expect(page.locator('#f-lang')).toHaveValue('ja');
    await expect(page.locator('#f-since')).toHaveValue('2026-05-05');

    const params = await builtParams(page);
    expect(params).toMatchObject({
      author: 'alice.test',
      domain: 'npr.org',
      tag: 'caturday',
      lang: 'ja',
      since: '2026-05-05',
    });
  });

  test('keeps quoted phrases and OR groups verbatim in q', async ({ page }) => {
    await page.goto(PAGE);
    await page.fill('#f-query', '(cats OR dogs) "not an operator: really"');

    const params = await builtParams(page);
    expect(params.q).toBe('(cats OR dogs) "not an operator: really"');
  });

  test('mirrors the built search into the page URL as a permalink', async ({ page }) => {
    await page.goto(PAGE);
    await page.fill('#f-query', 'cats');
    await page.selectOption('#f-lang', 'en');

    await expect(page).toHaveURL(/[?&]q=cats/);
    await expect(page).toHaveURL(/[?&]lang=en/);

    // Reloading that permalink restores the form.
    await page.reload();
    await expect(page.locator('#f-query')).toHaveValue('cats');
    await expect(page.locator('#f-lang')).toHaveValue('en');
  });

  test('never issues a network request to Bluesky', async ({ page }) => {
    const external = [];
    page.on('request', req => {
      const host = new URL(req.url()).host;
      if (host && !host.startsWith('localhost')) external.push(req.url());
    });

    await page.goto(PAGE);
    await page.fill('#f-query', 'cats');
    await setRow(page, 0, { field: 'authors', value: 'austegard.com' });
    await page.waitForTimeout(250);

    const bluesky = external.filter(u => /bsky|bluesky/i.test(u));
    expect(bluesky).toEqual([]);
  });
});
