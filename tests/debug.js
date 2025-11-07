const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Listen for page errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
    console.log('Stack:', error.stack);
  });

  // Listen for crashed pages
  page.on('crash', () => console.log('PAGE CRASHED'));

  try {
    await page.goto('http://localhost:8080/pv.html', { waitUntil: 'load', timeout: 10000 });
    console.log('Page loaded successfully!');

    // Take a screenshot
    await page.screenshot({ path: '/home/user/oaustegard.github.io/tests/screenshot.png' });
  } catch (error) {
    console.log('Error loading page:', error.message);
  }

  await browser.close();
})();
