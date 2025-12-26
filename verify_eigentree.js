const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
        await page.goto('http://localhost:8001/fun-and-games/eigentree.html');
        // Wait for loading to vanish
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 15000 });
        console.log('Loading finished.');
        // Wait for animation
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'verification_screenshot.png' });
        console.log('Screenshot taken.');
    } catch(e) {
        console.error('Error:', e);
        process.exit(1);
    }
    await browser.close();
})();
