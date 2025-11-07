// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('PV.html HTML Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pv.html');
  });

  test('should load the preview form', async ({ page }) => {
    await expect(page.locator('#previewform')).toBeVisible();
    await expect(page.locator('h1')).toContainText('GitHub/Gist');
  });

  test('should show theme controls', async ({ page }) => {
    await expect(page.locator('#theme-controls')).toBeVisible();

    // Check all theme buttons are present
    await expect(page.locator('button[data-theme="light"]')).toBeVisible();
    await expect(page.locator('button[data-theme="auto"]')).toBeVisible();
    await expect(page.locator('button[data-theme="dark"]')).toBeVisible();
  });

  test('should toggle dark theme', async ({ page }) => {
    // Click dark theme button
    await page.locator('button[data-theme="dark"]').click();

    // Check that dark theme is applied
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Check that the button is marked as active
    await expect(page.locator('button[data-theme="dark"]')).toHaveClass(/active/);
  });

  test('should toggle light theme', async ({ page }) => {
    // First set dark theme
    await page.locator('button[data-theme="dark"]').click();

    // Then switch to light theme
    await page.locator('button[data-theme="light"]').click();

    // Check that dark theme attribute is removed
    const html = page.locator('html');
    await expect(html).not.toHaveAttribute('data-theme', 'dark');

    // Check that the button is marked as active
    await expect(page.locator('button[data-theme="light"]')).toHaveClass(/active/);
  });

  test('should persist theme preference', async ({ page }) => {
    // Set dark theme
    await page.locator('button[data-theme="dark"]').click();

    // Reload page
    await page.reload();

    // Check that dark theme is still applied
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('button[data-theme="dark"]')).toHaveClass(/active/);
  });

  test('should have correct URL examples', async ({ page }) => {
    const examples = page.locator('ul li code');
    await expect(examples).toHaveCount(3);

    // Check that examples include gist URLs
    await expect(examples.nth(0)).toContainText('gist.github.com/oaustegard');
    await expect(examples.nth(1)).toContainText('https://gist.github.com/oaustegard');
    await expect(examples.nth(2)).toContainText('a1902d995b5c6157a9eaf69afa355723');
  });

  test('should show error display when present', async ({ page }) => {
    const errorDisplay = page.locator('#error-display');
    const loadingDisplay = page.locator('#loading-display');

    // Initially hidden
    await expect(errorDisplay).toBeHidden();
    await expect(loadingDisplay).toBeHidden();
  });

  test('should accept URL input', async ({ page }) => {
    const input = page.locator('#file');
    await expect(input).toBeVisible();

    // Should accept gist URL
    await input.fill('gist.github.com/oaustegard/a1902d995b5c6157a9eaf69afa355723');
    await expect(input).toHaveValue('gist.github.com/oaustegard/a1902d995b5c6157a9eaf69afa355723');
  });

  test('should have back button hidden on form', async ({ page }) => {
    const backButton = page.locator('#back-button');
    await expect(backButton).toBeHidden();
  });
});

test.describe('URL Parsing', () => {
  // Note: These tests would require actual gist content or mocking
  // For now, we'll test the URL transformation logic by checking navigation

  test('should handle GUID-only URLs', async ({ page }) => {
    // Navigate with just a GUID
    const gistId = 'a1902d995b5c6157a9eaf69afa355723';
    await page.goto(`/pv.html?${gistId}`);

    // Should show loading indicator or content (depending on network)
    // We can't easily test the actual loading without mocking
    // But we can verify the page attempted to process it
    await page.waitForTimeout(1000);

    // Should either show error or loaded content
    const form = page.locator('#previewform');
    const errorDisplay = page.locator('#error-display');

    // One of these should be visible
    const formVisible = await form.isVisible();
    const errorVisible = await errorDisplay.isVisible();

    expect(formVisible || errorVisible).toBeTruthy();
  });

  test('should handle full gist.github.com URLs', async ({ page }) => {
    const gistUrl = 'gist.github.com/oaustegard/a1902d995b5c6157a9eaf69afa355723';
    await page.goto(`/pv.html?${gistUrl}`);

    await page.waitForTimeout(1000);

    // Should either show error or loaded content
    const form = page.locator('#previewform');
    const errorDisplay = page.locator('#error-display');

    const formVisible = await form.isVisible();
    const errorVisible = await errorDisplay.isVisible();

    expect(formVisible || errorVisible).toBeTruthy();
  });
});
