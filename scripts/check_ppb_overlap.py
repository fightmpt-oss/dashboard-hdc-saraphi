import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/saraphi_complete_master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

inds = master.get('indicators', {})
print(f'Total indicators in masterData: {len(inds)}')

ppb_tables = {
    's_childdev_specialpp',
    's_kpi_height614',
    's_kpi_dental63',
    's_kpi_dental64',
    's_2q_adl_test'
}

matches = []
for ind_id, ind in inds.items():
    tbl = ind.get('table')
    if tbl in ppb_tables:
        matches.append((ind_id, ind.get('code'), ind.get('name'), tbl, ind.get('domain'), ind.get('domain_label')))

print(f'\nIndicators using PPB tables ({len(matches)} found):')
for m in matches:
    print(f'  ID: {m[0]:25s} | Code: {str(m[1]):6s} | Table: {m[3]:22s} | Domain: {m[4]:10s} | Name: {m[2]}')

if 'ppb_child_develop' in inds and 'mch_childdev' in inds:
    p = inds['ppb_child_develop']
    m = inds['mch_childdev']
    print("\n--- Comparing ppb_child_develop vs mch_childdev ---")
    for yr in ['2567', '2568', '2569']:
        py = p['years'].get(yr, {})
        my = m['years'].get(yr, {})
        p_rate = py.get('rate')
        m_rate = my.get('rate')
        p_num = py.get('num')
        m_num = my.get('num')
        p_den = py.get('den')
        m_den = my.get('den')
        match = (p_rate == m_rate and p_num == m_num and p_den == m_den)
        print(f"  Year {yr}: PPB rate={p_rate}% ({p_num}/{p_den}) | MCH rate={m_rate}% ({m_num}/{m_den}) | MATCH={match}")

# Check overview_master.json
with open('data/overview_master.json', 'r', encoding='utf-8') as f:
    overview = json.load(f)

ov_inds = overview.get('indicators', [])
print(f'\nTotal indicators in overview_master: {len(ov_inds)}')
ov_matches = [i for i in ov_inds if i.get('table') in ppb_tables or 'ppb' in str(i.get('key', '')) or 'ppb' in str(i.get('id', ''))]
for om in ov_matches:
    k = str(om.get('key') or om.get('id') or '')
    g = str(om.get('group') or om.get('domain') or '')
    print(f'  Overview: Key={k:25s} | Group={g:20s} | Table={om.get("table")} | Target={om.get("target")} | Rate={om.get("rate")}%')

