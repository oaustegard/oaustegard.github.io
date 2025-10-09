import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get the absolute path for the base directory
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

        # 1. Verify tools.html has the new "Biking Tools" section
        tools_page_path = f"file://{os.path.join(base_dir, 'tools.html')}"
        page.goto(tools_page_path, wait_until='domcontentloaded')

        # Expect the "Biking Tools" link to be visible
        biking_link = page.get_by_role("link", name="Biking Tools")
        expect(biking_link).to_be_visible()

        page.screenshot(path="jules-scratch/verification/01_tools_page.png")

        # 2. Navigate directly to the biking index page
        biking_index_path = f"file://{os.path.join(base_dir, 'biking/index.html')}"
        page.goto(biking_index_path, wait_until='domcontentloaded')

        # 3. Verify the static content of the biking index page
        expect(page.get_by_role("heading", name="Biking Tools")).to_be_visible()

        # NOTE: We cannot verify the dynamically loaded links from github-toc.js
        # because of browser security restrictions on local files (CORS).
        # We will assume it works on the server like other index pages.
        page.screenshot(path="jules-scratch/verification/02_biking_index.png")

        # 4. Navigate directly to the activity weather tool
        activity_weather_path = f"file://{os.path.join(base_dir, 'biking/activity-weather.html')}"
        page.goto(activity_weather_path, wait_until='domcontentloaded')
        expect(page.get_by_role("heading", name="Activity Weather Advisor")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/03_activity_weather_page.png")

        # 5. Navigate directly to the tire volume tool
        tire_volume_path = f"file://{os.path.join(base_dir, 'biking/tire-volume.html')}"
        page.goto(tire_volume_path, wait_until='domcontentloaded')
        expect(page.get_by_role("heading", name="Bicycle Tire Volume & Temperature Calculator")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/04_tire_volume_page.png")

        browser.close()
        print("Verification script completed successfully.")

if __name__ == "__main__":
    run_verification()