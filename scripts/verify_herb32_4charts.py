"""
Verify herb32 4-charts dashboard renders correctly.
Navigates to the nhso_herb32 indicator and takes screenshots.
"""
import asyncio
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        print("[1] Loading page...")
        await page.goto("http://127.0.0.1:8095/", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(3000)
        
        # Switch to nhso_ttm domain and nhso_herb32 indicator via JS
        print("[2] Switching to nhso_herb32...")
        await page.evaluate("""() => {
            // Find and click the nhso_ttm sidebar item
            const items = document.querySelectorAll('.sidebar-item');
            for (const item of items) {
                if (item.dataset.domain === 'nhso_ttm') {
                    item.click();
                    break;
                }
            }
        }""")
        await page.wait_for_timeout(1500)
        
        # Now set the indicator to nhso_herb32
        await page.evaluate("""() => {
            const select = document.getElementById('indicator-select');
            if (select) {
                select.value = 'nhso_herb32';
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(2000)
        
        # Verify panel is visible
        panel_visible = await page.evaluate("""() => {
            const panel = document.getElementById('nhso-herb32-panel');
            return panel && !panel.classList.contains('hidden');
        }""")
        print(f"[3] Panel visible: {panel_visible}")
        
        if not panel_visible:
            print("ERROR: Panel not visible! Trying direct approach...")
            await page.evaluate("""() => {
                currentDomain = 'nhso_ttm';
                currentIndicatorId = 'nhso_herb32';
                updateDashboardView();
            }""")
            await page.wait_for_timeout(2000)
            panel_visible = await page.evaluate("""() => {
                const panel = document.getElementById('nhso-herb32-panel');
                return panel && !panel.classList.contains('hidden');
            }""")
            print(f"    Panel visible after direct: {panel_visible}")
        
        # Check 4 charts exist
        charts_info = await page.evaluate("""() => {
            const ids = [
                'herb32-unit-count-chart',
                'herb32-unit-pay-chart', 
                'herb32-herb-count-chart',
                'herb32-herb-pay-chart'
            ];
            return ids.map(id => {
                const el = document.getElementById(id);
                return {
                    id,
                    exists: !!el,
                    visible: el ? (el.offsetHeight > 0) : false,
                    width: el ? el.width : 0,
                    height: el ? el.height : 0
                };
            });
        }""")
        print("[4] Charts status:")
        for c in charts_info:
            status = "OK" if c['exists'] and c['visible'] else "MISSING/HIDDEN"
            print(f"    {c['id']}: {status} ({c['width']}x{c['height']})")
        
        # Check KPI cards
        kpi_info = await page.evaluate("""() => {
            const cards = document.querySelectorAll('#nhso-herb32-panel .grid .bg-white, #nhso-herb32-panel .grid .bg-gradient-to-br');
            const results = [];
            cards.forEach(card => {
                const valueEl = card.querySelector('.text-2xl, .text-3xl, .font-extrabold');
                const labelEl = card.querySelector('.text-xs, .text-sm');
                results.push({
                    value: valueEl ? valueEl.textContent.trim() : '',
                    label: labelEl ? labelEl.textContent.trim() : ''
                });
            });
            return results;
        }""")
        print("[5] KPI Cards:")
        for k in kpi_info:
            print(f"    {k['label']}: {k['value']}")
        
        # Get section titles
        section_titles = await page.evaluate("""() => {
            const panel = document.getElementById('nhso-herb32-panel');
            if (!panel) return [];
            const titles = panel.querySelectorAll('h3, .font-bold.text-lg, .text-base.font-bold');
            return Array.from(titles).map(t => t.textContent.trim()).filter(t => t.length > 0);
        }""")
        print(f"[6] Section titles: {section_titles}")
        
        # Take screenshot of the whole panel - top area with KPI
        print("[7] Taking screenshots...")
        await page.evaluate("() => window.scrollTo(0, 0)")
        await page.wait_for_timeout(500)
        
        # Find the panel and scroll to it
        await page.evaluate("""() => {
            const panel = document.getElementById('nhso-herb32-panel');
            if (panel) panel.scrollIntoView({ behavior: 'instant' });
        }""")
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/herb32_verify_top.png", full_page=False)
        
        # Scroll down to section 1 charts
        await page.evaluate("""() => {
            const el = document.getElementById('herb32-unit-count-chart');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }""")
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/herb32_verify_charts_section1.png", full_page=False)
        
        # Scroll to section 2 charts
        await page.evaluate("""() => {
            const el = document.getElementById('herb32-herb-count-chart');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }""")
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/herb32_verify_charts_section2.png", full_page=False)
        
        # Scroll to table
        await page.evaluate("""() => {
            const el = document.getElementById('herb32-detail-table');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }""")
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/herb32_verify_table.png", full_page=False)
        
        # Verify specific data values for 06020
        data_check = await page.evaluate("""() => {
            const table = document.getElementById('herb32-detail-table');
            if (!table) return { error: 'table not found' };
            const rows = table.querySelectorAll('tbody tr');
            for (const row of rows) {
                const cells = row.querySelectorAll('td');
                const text = Array.from(cells).map(c => c.textContent.trim());
                if (text.some(t => t.includes('06020') || t.includes('บ้านแคว'))) {
                    return { found: true, cells: text };
                }
            }
            return { found: false, totalRows: rows.length };
        }""")
        print(f"[8] Unit 06020 data: {data_check}")
        
        # Drilldown to 06020
        print("[9] Testing drilldown to 06020...")
        await page.evaluate("""() => {
            const select = document.getElementById('herb32-unit-select');
            if (select) {
                select.value = '06020';
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(1500)
        
        # Scroll to charts for drilldown view
        await page.evaluate("""() => {
            const el = document.getElementById('herb32-unit-count-chart');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }""")
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/herb32_verify_06020_charts.png", full_page=False)
        
        # Check KPI after drilldown
        kpi_drilldown = await page.evaluate("""() => {
            const panel = document.getElementById('nhso-herb32-panel');
            const values = panel.querySelectorAll('.text-2xl, .text-3xl');
            return Array.from(values).map(v => v.textContent.trim());
        }""")
        print(f"[10] KPI values after 06020 drilldown: {kpi_drilldown}")
        
        await browser.close()
        print("\n[DONE] Verification complete!")

asyncio.run(main())
