import asyncio
import json
from playwright.async_api import async_playwright

SARAPHI_MAP = {
    '11135': 'รพ.สารภี',
    '06014': 'รพ.สต.บ้านยางเนิ้ง',
    '06015': 'รพ.สต.บ้านปากกอง',
    '06016': 'รพ.สต.บ้านศรีสองเมือง',
    '06017': 'รพ.สต.บ้านหัวดง',
    '06018': 'รพ.สต.บ้านหนองแฝก',
    '06020': 'รพ.สต.บ้านแคว (ท่ากว้าง)',
    '06021': 'รพ.สต.บ้านสันต้นกอก',
    '06022': 'รพ.สต.บ้านบวกครกเหนือ',
    '06023': 'รพ.สต.บ้านป่าสา',
    '06024': 'รพ.สต.บ้านศรีคำชมภู',
    '13994': 'รพ.สต.บ้านท่าต้นกวาว',
    '14461': 'รพ.สต.บ้านหนองผึ้ง',
    '99758': 'ศสม.สารภี'
}

async def main():
    with open('data/nhso/nhso_herb32_monthly.json', encoding='utf-8') as f:
        h32_2569 = json.load(f)['data']['2569']['units']

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        await page.goto("http://127.0.0.1:8095/", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2000)
        
        # Switch to nhso_ttm and nhso_herb32
        await page.evaluate("""() => {
            const items = document.querySelectorAll('.sidebar-item');
            for (const item of items) {
                if (item.dataset.domain === 'nhso_ttm') {
                    item.click();
                    break;
                }
            }
            const select = document.getElementById('indicator-select');
            if (select) {
                select.value = 'nhso_herb32';
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(2000)
        
        print("\n" + "="*85)
        print("  ทดสอบการแสดงผลหน้าแดชบอร์ดจริงครบทั้ง 14 หน่วยบริการ (ปีงบ 2569)")
        print("="*85)
        print(f"{'รหัส':<6} {'ชื่อหน่วยบริการ':<24} {'Expected ครั้ง/บาท':>24} {'Rendered ครั้ง/บาท':>24} {'สถานะ':>8}")
        print("-"*85)
        
        all_passed = True
        
        for code, name in SARAPHI_MAP.items():
            expected_cnt = h32_2569.get(code, {}).get('totalCount', 0)
            expected_bath_float = h32_2569.get(code, {}).get('totalBath', 0)
            
            # Switch unit in UI
            rendered = await page.evaluate(f"""(unitCode) => {{
                const select = document.getElementById('herb32-unit-select');
                if (select) {{
                    select.value = unitCode;
                    select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
                
                // Get KPI Card values
                const cards = document.querySelectorAll('#herb32-kpi-cards .glass-card');
                if (!cards || cards.length === 0) return {{ count: -1, bath: -1 }};
                
                const card1 = cards[0];
                const countText = card1.querySelector('.text-2xl')?.textContent || '';
                const bathText = card1.querySelector('.font-bold.text-emerald-700')?.textContent || '';
                
                // Clean numbers
                const countMatch = countText.replace(/[^0-9]/g, '');
                const bathMatch = bathText.replace(/[^0-9]/g, '');
                
                return {{
                    count: parseInt(countMatch || '0', 10),
                    bath: parseInt(bathMatch || '0', 10),
                    rawBath: bathText.trim()
                }};
            }}""", code)
            
            await page.wait_for_timeout(300)
            
            r_cnt = rendered.get('count', 0)
            r_bath = rendered.get('bath', 0)
            
            match = (r_cnt == expected_cnt and abs(r_bath - expected_bath_float) <= 0.6)
            if not match:
                all_passed = False
            status = "MATCH [OK]" if match else "MISMATCH!"
            
            print(f"{code:<6} {name:<24} {expected_cnt:>8,d} / {expected_bath_float:>10,.2f} B. {r_cnt:>8,d} / {r_bath:>9,d} B. {status:>12}")

        print("="*85)
        print(f"ผลสรุป: {'ทุกหน่วยบริการ 100% ถูกต้องตรงกันทั้งหมด!' if all_passed else 'พบข้อผิดพลาด!'}")
        
        await browser.close()

asyncio.run(main())
