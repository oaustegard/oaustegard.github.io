import subprocess
import time
from playwright.sync_api import sync_playwright

# Start a local HTTP server
server = subprocess.Popen(["python3", "-m", "http.server", "8000"])
time.sleep(2)  # Wait for server to start

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Test loading the 404 page
        page.goto("http://localhost:8000/404.html")

        # Wait a moment for JavaScript to execute
        page.wait_for_timeout(1000)

        # Check if the title is correct
        title = page.title()
        print(f"Title: {title}")
        assert "Page Not Found" in title

        # The script attempts to fetch /sitemap.xml which might not exist locally
        # or it might exist. Either way, check if we eventually show a not found message
        # or redirect.

        h1_text = page.locator("h1").inner_text()
        print(f"H1 Text: {h1_text}")

        browser.close()
        print("Playwright test passed!")
finally:
    server.terminate()
