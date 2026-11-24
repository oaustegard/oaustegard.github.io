// @ts-check
const { test, expect } = require('@playwright/test');

// Settings in the address bar and the two-model word diff. Neither needs a model: the diff
// is exposed as window.A2T.diff, and the settings are read straight from the controls.

const PAGE = '/web-utilities/anything-to-text.html';

test.describe('Anything to Text: settings in the address bar', () => {
  test('a mode link opens one engine with its settings', async ({ page }) => {
    await page.goto(PAGE + '?mode=ocr&ocr=tesseract&ocr2=small&dpi=300');
    await expect(page.locator('#ocr-section')).toBeVisible();
    await expect(page.locator('#tr-section')).toBeHidden();
    await expect(page.locator('#tier')).toHaveValue('tesseract');
    await expect(page.locator('#ocr-vs')).toHaveValue('small');
    await expect(page.locator('#dpi')).toHaveValue('300');
    await expect(page.locator('#drop .big')).toHaveText('Drop images or a PDF');
    await expect(page.locator('#mode-bar')).toBeVisible();
  });

  test('a changed setting rewrites the query, keeping keys the page does not own', async ({ page }) => {
    await page.goto(PAGE + '?mode=ocr&ocr=tesseract&ocr2=small&log=1');
    await page.selectOption('#columns', '2');
    expect(new URL(page.url()).searchParams.get('cols')).toBe('2');
    expect(new URL(page.url()).searchParams.get('log')).toBe('1');
    // the compare model cannot be the primary one: choosing it as primary turns compare off
    await page.selectOption('#tier', 'small');
    await expect(page.locator('#ocr-vs')).toHaveValue('');
    const q = new URL(page.url()).searchParams;
    expect(q.get('ocr')).toBe('small');
    expect(q.has('ocr2')).toBe(false);
  });

  test('Use all modes leaves a mode link', async ({ page }) => {
    await page.goto(PAGE + '?mode=ocr&ocr=small&log=1');
    await page.click('#mode-exit');
    await expect(page.locator('#ocr-section')).toBeHidden();
    await expect(page.locator('#mode-bar')).toBeHidden();
    await expect(page.locator('#drop .big')).toContainText('Drop anything');
    expect(new URL(page.url()).search).toBe('?log=1');
  });

  test('transcription settings load from short model names', async ({ page }) => {
    await page.goto(PAGE + '?mode=transcribe&asr=onnx-small&asr2=onnx-tiny&lang=de&task=translate&tab=edit');
    await expect(page.locator('#tr-section')).toBeVisible();
    await expect(page.locator('#ocr-section')).toBeHidden();
    await expect(page.locator('#model')).toHaveValue('onnx-community/whisper-small');
    await expect(page.locator('#asr-vs')).toHaveValue('onnx-community/whisper-tiny');
    await expect(page.locator('#lang')).toHaveValue('de');
    await expect(page.locator('input[name=task][value=translate]')).toBeChecked();
    await expect(page.locator('#panel-edit')).toBeVisible();
  });
});

test.describe('Anything to Text: two-model diff', () => {
  test('marks only the words the models disagree on, ignoring Markdown and line breaks', async ({ page }) => {
    await page.goto(PAGE);
    const d = await page.evaluate(() => window.A2T.diff(
      '# Heading\n\nThe quick brown fox jumps over the lazy dog.',
      'Heading\nThe quick brown f0x jumps over lazy dog.'));
    expect(d.a).toBe('# Heading\n\nThe quick brown <mark class="d">fox</mark> jumps over <mark class="d">the</mark> lazy dog.');
    expect(d.b).toBe('Heading\nThe quick brown <mark class="d">f0x</mark> jumps over lazy dog.');
    expect(d.hunks).toBe(2);
  });

  test('identical readings agree, and text is escaped', async ({ page }) => {
    await page.goto(PAGE);
    const d = await page.evaluate(() => window.A2T.diff('a <b> & c', 'a  <b>\n& c'));
    expect(d.hunks).toBe(0);
    expect(d.agree).toBe(1);
    expect(d.a).toBe('a &lt;b&gt; &amp; c');
  });

  test('adjacent differing words share one mark', async ({ page }) => {
    await page.goto(PAGE);
    const d = await page.evaluate(() => window.A2T.diff('one two three four', 'one tvvo thr3e four'));
    expect(d.a).toBe('one <mark class="d">two three</mark> four');
    expect(d.hunks).toBe(1);
  });
});
