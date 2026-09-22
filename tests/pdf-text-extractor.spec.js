// @ts-check
const { test, expect } = require('@playwright/test');

// The cleanup passes are pure functions exposed on window.__pdfTextExtractor so they can be
// exercised without a PDF fixture. The UI tests cover the checkbox group and URL flags.

const PAGE = '/web-utilities/pdf-text-extractor.html';

test.describe('PDF Text Extractor cleanup', () => {
  test('cleanup checkboxes render with the documented defaults', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('#cleanup-dehyphenate')).toBeChecked();
    await expect(page.locator('#cleanup-unspace')).toBeChecked();
    await expect(page.locator('#cleanup-unwrap')).not.toBeChecked();
  });

  test('URL flags override the checkbox defaults without a PDF URL', async ({ page }) => {
    await page.goto(PAGE + '?dehyphenate=0&unspace=false&unwrap=1');
    await expect(page.locator('#cleanup-dehyphenate')).not.toBeChecked();
    await expect(page.locator('#cleanup-unspace')).not.toBeChecked();
    await expect(page.locator('#cleanup-unwrap')).toBeChecked();
    const opts = await page.evaluate(() => window.__pdfTextExtractor.readCleanupOptions());
    expect(opts).toEqual({ dehyphenate: false, unspace: false, unwrap: true });
  });

  test('rejoins hyphenated line breaks only before a lowercase continuation', async ({ page }) => {
    await page.goto(PAGE);
    const out = await page.evaluate(() => window.__pdfTextExtractor.dehyphenateLines(
      'less apoca-\nlyptic, and generos-\nity, but U.S.-\nBased and a soft­\nhyphen\n- item one\n- item two'
    ));
    expect(out).toBe('less apocalyptic, and generosity, but U.S.-\nBased and a softhyphen\n- item one\n- item two');
  });

  test('collapses letter-spaced display type at the string level', async ({ page }) => {
    await page.goto(PAGE);
    const r = await page.evaluate(() => {
      const x = window.__pdfTextExtractor;
      return {
        heading: x.cleanupPageText('H E A LT H C A R E ’ S O P P E N H E I M E R M O M E N T', { unspace: true }),
        words: x.cleanupPageText('F R O M  T H E  A U T H O R', { unspace: true }),
        prose: x.isLetterSpaced('Why Oppenheimer, Why Healthcare, Why Now'),
        digits: x.isLetterSpaced('1 2 3 4 5 6 7 8'),
        off: x.cleanupPageText('F R O M  T H E  A U T H O R', { unspace: false }),
      };
    });
    expect(r.heading).toBe('HEALTHCARE’SOPPENHEIMERMOMENT');
    expect(r.words).toBe('FROM THE AUTHOR');
    expect(r.prose).toBe(false);
    expect(r.digits).toBe(false);
    expect(r.off).toBe('F R O M  T H E  A U T H O R');
  });

  test('recovers word gaps from run geometry when glyphs arrive one per run', async ({ page }) => {
    await page.goto(PAGE + '?unspace=1');
    const out = await page.evaluate(() => {
      const mk = (word, x0) => { let x = x0; return [...word].map(ch => { const r = { text: ch, box: { x, y: 0, width: 10, height: 14 } }; x += 12; return r; }); };
      const a = mk('HEALTH', 0);
      const b = mk('NOW', a[a.length - 1].box.x + 10 + 8);
      return window.__pdfTextExtractor.joinLine(a.concat(b));
    });
    // joinLine reads the live option snapshot, which defaults unspace to true.
    expect(out).toBe('HEALTH NOW');
  });

  test('unwraps only full-width mid-sentence lines and leaves tables alone', async ({ page }) => {
    await page.goto(PAGE);
    const para = [
      'I offer the following essay— Healthcare’s Oppenheimer Moment: The Industrialization of',
      'Intelligence and the Future of U.S. Healthcare —for your consideration. It is the successor to my',
      '2025 essay, The GenAI Juggernaut: U.S. Healthcare Is Not Prepared, and the third publication from',
      'the TowerBrook Healthcare Institute. What follows is a draft distillation of my learnings, observations,',
      'conversations, anxieties, enthusiasms, and still-forming hypotheses over the past several months on',
      'the stunning trajectory of AI progress and its impending impacts and reverberations across the U.S.',
      'healthcare industry.',
      'It is incomplete and imperfect in a thousand ways. It desperately needs editing and refinement, but',
      'in the interest of a timely June 2026 dissemination rather than an endless editorial polish, I am',
      'sending this out more or less as-is: run-on sentences, unresolved provocations, overly exuberant',
      'metaphors, and the occasional incoherent idea included. Consider it a field report from the middle of',
      'the storm rather than a final act of doctrine.',
      'Item        Value      Note',
      'alpha       1          short',
      'beta        2          also',
      '© 2026 TowerBrook 2',
    ].join('\n');
    const out = await page.evaluate((t) => window.__pdfTextExtractor.unwrapParagraphs(t), para);
    // A capitalized continuation is deliberately not joined: the guard cannot tell it from a new paragraph.
    expect(out).toContain('The Industrialization of\nIntelligence and the Future');
    expect(out).toContain('across the U.S. healthcare industry.\nIt is incomplete');
    expect(out).toContain('observations, conversations, anxieties');
    expect(out).toContain('final act of doctrine.\nItem        Value      Note\nalpha       1          short\nbeta');
    const few = await page.evaluate(() => window.__pdfTextExtractor.unwrapParagraphs('short\nlines\nonly'));
    expect(few).toBe('short\nlines\nonly');
  });
});
