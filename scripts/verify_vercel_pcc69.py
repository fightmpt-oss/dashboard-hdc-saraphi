import time
from playwright.sync_api import sync_playwright

def verify_vercel_pcc69():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        print("Navigating to https://dashboard-hdc-saraphi.vercel.app/ ...")
        
        for attempt in range(1, 6):
            try:
                page.goto("https://dashboard-hdc-saraphi.vercel.app/", wait_until="load", timeout=20000)
                time.sleep(2)

                page.locator("#sidebar-parent-pcc").click()
                time.sleep(1)

                pcc69_btn = page.locator('button[data-domain="pcc_2569"]')
                pcc69_btn.click()
                time.sleep(2)

                total_pay = page.locator("#pcc69-card-total-pay").inner_text().strip()
                if "98,029.85" in total_pay:
                    print(f"Attempt {attempt}: Vercel deployment LIVE with Total Pay: {total_pay}!")
                    break
                else:
                    print(f"Attempt {attempt}: Total Pay is '{total_pay}', waiting for deployment...")
                    time.sleep(6)
            except Exception as e:
                print(f"Attempt {attempt} error: {e}")
                time.sleep(5)

        total_pay = page.locator("#pcc69-card-total-pay").inner_text().strip()
        print(f"Live Total Budget Card: '{total_pay}'")
        assert "98,029.85" in total_pay, f"Expected 98,029.85 บ., got {total_pay}"

        table_rows = page.locator("#pcc69-matrix-table tbody tr").count()
        print(f"Live Matrix Table Rows: {table_rows}")
        assert table_rows >= 14, f"Expected >= 14 rows, got {table_rows}"

        page.screenshot(path="C:/Users/Acer/.gemini/antigravity/brain/1d1dc2c1-0794-4595-82b5-1b0becaf4b50/vercel_live_pcc2569_fixed.png", full_page=False)
        print("Live screenshot saved as vercel_live_pcc2569_fixed.png")

        print("Live Console Errors:", [e for e in console_errors if "404" not in e])
        browser.close()
        print("\nVERCEL LIVE VERIFICATION PASSED 100%!")

if __name__ == "__main__":
    verify_vercel_pcc69()
