import asyncio
import aiohttp
import time
import json

URL = 'https://opendata.moph.go.th/api/report_data'

async def fetch_table(session, table, year):
    payload = {
        'tableName': table,
        'year': year,
        'province': '50',
        'type': 'json',
        'offset': 0,
        'limit': 5000
    }
    try:
        async with session.post(URL, json=payload, timeout=aiohttp.ClientTimeout(total=30)) as res:
            if res.status in (200, 201):
                data = await res.json()
                rows = data.get('data', [])
                saraphi = [r for r in rows if str(r.get('areacode', '')).startswith('5019')]
                return table, year, len(saraphi), len(rows), None
            else:
                return table, year, 0, 0, f"HTTP {res.status}"
    except Exception as e:
        return table, year, 0, 0, str(e)

async def test_batch():
    test_tables = ['s_dm_screen', 's_ht_screen', 's_kpi_cvd_risk', 's_dm_ckd', 's_dm_foot', 's_dm_hba1c', 's_ht_control_new']
    years = ['2569', '2568', '2567']
    
    t0 = time.time()
    async with aiohttp.ClientSession() as session:
        tasks = []
        for tbl in test_tables:
            for yr in years:
                tasks.append(fetch_table(session, tbl, yr))
        results = await asyncio.gather(*tasks)
    
    dt = time.time() - t0
    print(f"Fetched {len(tasks)} requests in {dt:.2f} seconds ({len(tasks)/dt:.1f} req/s)")
    for tbl, yr, s_cnt, tot, err in results[:10]:
        print(f"  {tbl} ({yr}): {s_cnt} Saraphi rows (total prov: {tot}) err: {err}")

asyncio.run(test_batch())
