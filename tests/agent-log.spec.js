// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Agent Log: the recorder (web-utilities/agent-log.js) and its docs page. The bookmarklet and the
// strict-CSP paste load the script from austegard.com; the route below serves the local file there,
// so these tests run what is about to ship.

const PAGE = '/web-utilities/agent-log.html';
const SRC = fs.readFileSync(path.join(__dirname, '..', 'web-utilities', 'agent-log.js'), 'utf8');
const records = (doc) => doc.resourceLogs.flatMap((r) => r.scopeLogs[0].logRecords);
const attr = (list, key) => { const a = list.find((x) => x.key === key); return a && a.value; };

test.beforeEach(async ({ context }) => {
  await context.route('https://austegard.com/web-utilities/agent-log.js*', (r) => r.fulfill({ body: SRC, contentType: 'application/javascript' }));
});

test('?logging=true records console objects as OTLP attributes', async ({ page }) => {
  await page.goto(PAGE + '?logging=true');
  await expect.poll(() => page.evaluate(() => window.AgentLog.on)).toBe(true);
  await page.click('#tTick');
  await page.click('#tWarn');
  const doc = await page.evaluate(() => window.AgentLog.export());
  expect(doc.resourceLogs).toHaveLength(1);
  expect(doc.resourceLogs[0].scopeLogs[0].scope.name).toBe('agent-log');
  expect(attr(doc.resourceLogs[0].resource.attributes, 'agentlog.started_by')).toEqual({ stringValue: 'query' });
  const tick = records(doc).find((r) => r.eventName === 'console.log');
  expect(tick.body.stringValue).toBe('bot tick');
  expect(tick.severityText).toBe('INFO');
  expect(tick.attributes.map((a) => a.key)).toEqual(['tic', 'pos', 'sector', 'target', 'action']);
  expect(attr(tick.attributes, 'tic')).toEqual({ intValue: '35' });
  expect(attr(tick.attributes, 'pos').kvlistValue.values[0].key).toBe('x');
  expect(records(doc).find((r) => r.eventName === 'console.warn').severityNumber).toBe(13);
});

test('logging stays on across reloads until ?logging=false', async ({ page }) => {
  await page.goto(PAGE + '?logging=true');
  await page.goto(PAGE);
  expect(await page.evaluate(() => window.AgentLog.on)).toBe(true);
  await page.goto(PAGE + '?logging=false');
  expect(await page.evaluate(() => window.AgentLog.on)).toBe(false);
  expect(await page.locator('agent-log-ui').count()).toBe(0);
  await page.goto(PAGE);
  expect(await page.evaluate(() => window.AgentLog.on)).toBe(false);
});

test('errors, failed requests and redacted URLs', async ({ page }) => {
  await page.goto(PAGE + '?logging=true');
  await page.evaluate(async () => {
    window.AgentLog.clear();
    await fetch('/web-utilities/no-such-file.json?token=SECRET123&q=ok');
    setTimeout(() => { throw new Error('boom'); });
    Promise.reject(new TypeError('nope'));
    await new Promise((r) => setTimeout(r, 300));
  });
  const doc = await page.evaluate(() => window.AgentLog.export());
  const byEvent = Object.fromEntries(records(doc).map((r) => [r.eventName, r]));
  expect(byEvent['http.fetch'].severityText).toBe('WARN');
  expect(attr(byEvent['http.fetch'].attributes, 'http.response.status_code')).toEqual({ intValue: '404' });
  expect(byEvent['error.uncaught'].body.stringValue).toContain('boom');
  expect(attr(byEvent['error.rejection'].attributes, 'exception.type')).toEqual({ stringValue: 'TypeError' });
  expect(JSON.stringify(doc)).not.toContain('SECRET123');
});

test('records logged just before a navigation survive it', async ({ page }) => {
  await page.goto(PAGE + '?logging=true');
  await page.evaluate(() => { window.AgentLog.clear(); console.log('last words', { n: 1 }); });
  await page.goto(PAGE);
  const doc = await page.evaluate(() => window.AgentLog.export());
  expect(records(doc).some((r) => r.body.stringValue === 'last words')).toBe(true);
});

test('the bookmarklet starts logging once and reopens the panel', async ({ page }) => {
  await page.goto(PAGE);
  const bm = decodeURIComponent((await page.getAttribute('#bm', 'href')).replace(/^javascript:/, ''));
  await page.goto('/web-utilities/');
  await page.evaluate(bm);
  await expect.poll(() => page.evaluate(() => !!(window.AgentLog && window.AgentLog.on))).toBe(true);
  await page.evaluate(bm);
  await expect.poll(() => page.evaluate(() => !document.querySelector('agent-log-ui').shadowRoot.querySelector('.panel').hidden)).toBe(true);
  expect(await page.locator('agent-log-ui').count()).toBe(1);
});

test('strict CSP with Trusted Types: the bookmarklet explains, the full-script paste works', async ({ page, context }) => {
  await context.route('**/csp-test.html', (r) => r.fulfill({
    contentType: 'text/html',
    headers: { 'content-security-policy': "script-src 'self'; style-src 'self'; require-trusted-types-for 'script'" },
    body: '<!doctype html><title>csp</title><p>strict page</p>',
  }));
  await page.goto(PAGE);
  const bm = decodeURIComponent((await page.getAttribute('#bm', 'href')).replace(/^javascript:/, ''));
  const dialogs = [];
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss(); });
  await page.goto('/csp-test.html');
  await page.evaluate(bm);
  await expect.poll(() => dialogs.length).toBeGreaterThan(0);
  expect(dialogs[0]).toContain('Content Security Policy');
  await page.evaluate('window.AGENT_LOG_START = "console-paste";\n' + SRC);
  await page.evaluate(() => console.log('under csp', { n: 1 }));
  await page.locator('agent-log-ui .pill').click();
  await expect(page.locator('agent-log-ui .row').first()).toBeVisible();
  const doc = await page.evaluate(() => window.AgentLog.export());
  expect(attr(doc.resourceLogs[0].resource.attributes, 'agentlog.started_by')).toEqual({ stringValue: 'console-paste' });
  expect(records(doc).some((r) => r.body.stringValue === 'under csp')).toBe(true);
});

test('requests through a fetch reference taken before the script loaded are recorded once', async ({ page }) => {
  await page.goto('/web-utilities/');
  await page.evaluate(() => { window.earlyFetch = window.fetch; return fetch('/web-utilities/index.html?before=1'); });
  await page.addScriptTag({ url: '/web-utilities/agent-log.js?start=test' });
  await page.evaluate(async () => {
    await window.earlyFetch('/web-utilities/index.html?early=1').then((r) => r.text());
    await fetch('/web-utilities/index.html?wrapped=1').then((r) => r.text());
    await new Promise((r) => setTimeout(r, 500));
  });
  const doc = await page.evaluate(() => window.AgentLog.export());
  const http = records(doc).filter((r) => r.eventName === 'http.fetch');
  const url = (r) => attr(r.attributes, 'url.full').stringValue;
  const early = http.filter((r) => url(r).endsWith('early=1'));
  expect(early).toHaveLength(1);
  expect(attr(early[0].attributes, 'agentlog.source')).toEqual({ stringValue: 'resource-timing' });
  expect(attr(early[0].attributes, 'http.response.status_code')).toEqual({ intValue: '200' });
  expect(http.filter((r) => url(r).endsWith('wrapped=1'))).toHaveLength(1);
  const before = http.filter((r) => url(r).endsWith('before=1'));
  expect(before).toHaveLength(1);
  expect(attr(before[0].attributes, 'agentlog.before_start')).toEqual({ boolValue: true });
});

test.describe('watched elements', () => {
  const ui = (page, sel) => page.locator('agent-log-ui ' + sel);
  const domRecords = async (page) => records(await page.evaluate(() => window.AgentLog.export())).filter((r) => r.eventName.startsWith('dom.'));

  test('records clicks, typing, keys and changes on watched elements; hides passwords', async ({ page }) => {
    await page.goto(PAGE + '?logging=true');
    await page.click('#tWatch');
    await page.click('#demoCount');
    await page.click('#demoCount');
    await page.fill('#demoText', 'hello');
    await page.press('#demoText', 'Enter');
    await page.fill('#demoPass', 'hunter2');
    await page.waitForTimeout(700);
    const recs = await domRecords(page);
    const ev = recs.map((r) => r.eventName);
    expect(ev.filter((e) => e === 'dom.click')).toHaveLength(2);
    const click = recs.find((r) => r.eventName === 'dom.click');
    expect(attr(click.attributes, 'watch.label')).toEqual({ stringValue: 'counter' });
    expect(attr(click.attributes, 'dom.text')).toEqual({ stringValue: 'Count: 0' });
    const mut = recs.filter((r) => r.eventName === 'dom.mutation');
    expect(mut.length).toBeGreaterThan(0);
    expect(mut.some((r) => r.body.stringValue.includes('class'))).toBe(true);
    const inputs = recs.filter((r) => r.eventName === 'dom.input');
    expect(inputs.map((r) => attr(r.attributes, 'dom.value').stringValue).sort()).toEqual(['[hidden]', 'hello']);
    const keys = recs.filter((r) => r.eventName === 'dom.keydown').map((r) => attr(r.attributes, 'key').stringValue);
    expect(keys).toEqual(['Enter']);
    expect(JSON.stringify(recs)).not.toContain('hunter2');
    await expect(ui(page, '.chip')).toHaveCount(2);
  });

  test('the picker highlights, walks to the parent, cancels, and picks without clicking the page', async ({ page }) => {
    await page.goto(PAGE + '?logging=true');
    await ui(page, '.pill').click();
    await ui(page, 'button[data-a="pick"]').click();
    await expect(ui(page, '.toast')).toBeVisible();
    await page.hover('#demoCount');
    await expect(ui(page, '.tip')).toContainText('#demoCount');
    await page.keyboard.press('ArrowUp');
    await expect(ui(page, '.tip')).toContainText('#demo');
    await page.keyboard.press('Escape');
    await expect(ui(page, '.toast')).toBeHidden();
    expect(await page.evaluate(() => window.AgentLog.watches())).toEqual([]);
    await ui(page, 'button[data-a="pick"]').click();
    await page.hover('#demoCount');
    await page.click('#demoCount');
    await expect(page.locator('#demoCount')).toHaveText('Count: 0');
    const w = await page.evaluate(() => window.AgentLog.watches());
    expect(w.map((x) => x.selector)).toEqual(['#demoCount']);
    await page.click('#demoCount');
    await expect.poll(async () => (await domRecords(page)).filter((r) => r.eventName === 'dom.click').length).toBe(1);
    await ui(page, '.chip button').click();
    expect(await page.evaluate(() => window.AgentLog.watches())).toEqual([]);
  });

  test('?watch= adds a watch that survives reloads and re-rendered elements', async ({ page }) => {
    await page.goto(PAGE + '?logging=true&watch=%23demoCount');
    await page.goto(PAGE);
    expect((await page.evaluate(() => window.AgentLog.watches())).map((x) => x.selector)).toEqual(['#demoCount']);
    await page.evaluate(() => {
      const old = document.getElementById('demoCount');
      const fresh = old.cloneNode(true); fresh.textContent = 'redrawn';
      old.replaceWith(fresh);
    });
    await page.click('#demoCount');
    await page.waitForTimeout(1300);
    await page.evaluate(() => { document.getElementById('demoCount').textContent = 'changed'; });
    await page.waitForTimeout(300);
    const recs = await domRecords(page);
    expect(recs.some((r) => r.eventName === 'dom.watch' && r.body.stringValue.startsWith('watching #demoCount'))).toBe(true);
    expect(recs.some((r) => r.eventName === 'dom.click' && attr(r.attributes, 'dom.text').stringValue === 'redrawn')).toBe(true);
    expect(recs.some((r) => r.eventName === 'dom.mutation' && attr(r.attributes, 'dom.text').stringValue === 'changed')).toBe(true);
  });

  test('selectorFor prefers ids and test attributes, else a unique path', async ({ page }) => {
    await page.goto(PAGE);
    const sels = await page.evaluate(() => {
      const box = document.createElement('div');
      box.innerHTML = '<ul><li>a</li><li><span data-testid="x">b</span></li><li><b>c</b></li></ul><p id=":r1:">gen</p>';
      document.querySelector('main').appendChild(box);
      const f = window.AgentLog.selectorFor;
      return [f(document.getElementById('demoCount')), f(box.querySelector('[data-testid]')), f(box.querySelector('b')), f(box.querySelector('p'))]
        .map((s, i) => [s, document.querySelectorAll(s).length, document.querySelector(s) === [document.getElementById('demoCount'), box.querySelector('[data-testid]'), box.querySelector('b'), box.querySelector('p')][i]]);
    });
    expect(sels[0][0]).toBe('#demoCount');
    expect(sels[1][0]).toBe('span[data-testid="x"]');
    for (const [s, n, same] of sels) { expect(n, s).toBe(1); expect(same, s).toBe(true); }
    expect(sels[3][0]).not.toContain(':r1:');
  });
});
