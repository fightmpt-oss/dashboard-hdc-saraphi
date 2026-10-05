"""Canonical configuration shared by all Saraphi pipeline scripts.

Single source of truth for the 14 health-unit identities and the NHSO/สปสช.
pass thresholds. Every script must import from here instead of keeping its
own copy of SARAPHI_MAP — the old duplicated maps disagreed on unit names
(e.g. 06015 "บ้านปากกอง" vs "บ้านพญาชมภู") and subdistricts (13994).
"""

SARAPHI_UNITS = {
    '06014': {'name': 'รพ.สต.บ้านยางเนิ้ง', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านยางเนิ้ง', 'subdistrict': 'ยางเนิ้ง', 'type': 'รพ.สต.'},
    '06015': {'name': 'รพ.สต.บ้านพญาชมภู', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านพญาชมภู', 'subdistrict': 'ชมภู', 'type': 'รพ.สต.'},
    '06016': {'name': 'รพ.สต.บ้านศรีสองเมือง', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านศรีสองเมือง', 'subdistrict': 'ไชยสถาน', 'type': 'รพ.สต.'},
    '06017': {'name': 'รพ.สต.บ้านหัวดง', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหัวดง', 'subdistrict': 'ขัวมุง', 'type': 'รพ.สต.'},
    '06018': {'name': 'รพ.สต.บ้านหนองแฝก', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองแฝก', 'subdistrict': 'หนองแฝก', 'type': 'รพ.สต.'},
    '06020': {'name': 'รพ.สต.บ้านแคว (ท่ากว้าง)', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านแคว ตำบลท่ากว้าง', 'subdistrict': 'ท่ากว้าง', 'type': 'รพ.สต.'},
    '06021': {'name': 'รพ.สต.บ้านสันต้นกอก', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านสันต้นกอก', 'subdistrict': 'ดอนแก้ว', 'type': 'รพ.สต.'},
    '06022': {'name': 'รพ.สต.บ้านบวกครกเหนือ', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านบวกครกเหนือ', 'subdistrict': 'ท่าวังตาล', 'type': 'รพ.สต.'},
    '06023': {'name': 'รพ.สต.บ้านป่าสา', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านป่าสา', 'subdistrict': 'สันทราย', 'type': 'รพ.สต.'},
    '06024': {'name': 'รพ.สต.บ้านศรีคำชมภู', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านศรีคำชมภู', 'subdistrict': 'ป่าบง', 'type': 'รพ.สต.'},
    '11135': {'name': 'โรงพยาบาลสารภี', 'full_name': 'โรงพยาบาลสารภี (แม่ข่าย)', 'subdistrict': 'สารภี', 'type': 'รพช.'},
    '13994': {'name': 'รพ.สต.บ้านท่าต้นกวาว', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านท่าต้นกวาว', 'subdistrict': 'ชมภู', 'type': 'รพ.สต.'},
    '14461': {'name': 'รพ.สต.บ้านหนองผึ้ง', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองผึ้ง', 'subdistrict': 'หนองผึ้ง', 'type': 'รพ.สต.'},
    '99758': {'name': 'ศสม.สารภี', 'full_name': 'ศูนย์สุขภาพชุมชนตำบลสารภี', 'subdistrict': 'สารภี', 'type': 'ศสม.'}
}

SARAPHI_HOSPCODES = list(SARAPHI_UNITS.keys())

# Aliases used by the NHSO MeData scraper when matching Tableau row labels
# to hosp codes.
SARAPHI_ALIASES = {
    '06014': ['ยางเนิ้ง', 'บ้านยางเนิ้ง'],
    '06015': ['พญาชมภู', 'บ้านพญาชมภู', 'พญาชมพู', 'บ้านพญาชมพู'],
    '06016': ['ศรีสองเมือง', 'สองแคว', 'ไชยสถาน'],
    '06017': ['หัวดง', 'บ้านหัวดง', 'ขัวมุง'],
    '06018': ['หนองแฝก', 'บ้านหนองแฝก'],
    '06020': ['บ้านแคว', 'ท่ากว้าง', 'แคว'],
    '06021': ['สันต้นกอก', 'ดอนแก้ว'],
    '06022': ['บวกครกเหนือ', 'ท่าวังตาล'],
    '06023': ['ป่าเส้า', 'บ้านป่าเส้า', 'ป่าสา', 'บ้านป่าสา', 'สันทราย'],
    '06024': ['ศรีคำชมภู', 'ป่าบง'],
    '11135': ['รพ.สารภี', 'โรงพยาบาลสารภี', 'สารภี'],
    '13994': ['ท่าต้นกวาว', 'บ้านท่าต้นกวาว'],
    '14461': ['หนองผึ้ง', 'บ้านหนองผึ้ง'],
    '99758': ['ศสม', 'ศูนย์สุขภาพชุมชน'],
}

# สปสช./กระทรวงสาธารณสุข pass thresholds (%) — one definition for every view.
# DM control (HbA1c<7%/FBS เกณฑ์) ≥ 40, HT control (<140/90 mmHg) ≥ 50,
# HbA1c ตรวจปีละอย่างน้อย 1 ครั้ง ≥ 70.
KPI_TARGETS = {
    'pcc_dm_control': 40.0,
    'pcc_ht_control': 50.0,
    'pcc_dm_hba1c': 70.0,
    'ncd_dm_control': 40.0,
    'ncd_ht_control': 50.0,
}


def clean_num(v):
    """Convert an HDC field to float. None/''/invalid → 0.0.

    Note: unlike `v or default`, a legitimate 0 stays 0.
    """
    if v is None:
        return 0.0
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


# ------------------------------------------------------------------
# Shared OpenData MoPH fetcher — paginated with backoff on 429/5xx.
# ------------------------------------------------------------------
import json as _json
import time as _time
import urllib.error as _urlerror
import urllib.request as _urlrequest

OPENDATA_URL = "https://opendata.moph.go.th/api/report_data"


def fetch_opendata_rows(table, year, province="50", areacode_prefix="5019",
                        limit=1000, max_retries=5):
    """Fetch all rows of a table/year for a province, paginated (1000/page).

    Retries with exponential backoff on HTTP 429/5xx and network errors.
    Raises on the final failure so callers fail loudly instead of writing
    empty snapshots.
    """
    rows = []
    offset = 0
    while True:
        body = _json.dumps({
            "tableName": table,
            "year": str(year),
            "province": province,
            "type": "json",
            "offset": offset,
            "limit": limit,
        }).encode("utf-8")
        payload = None
        for attempt in range(1, max_retries + 1):
            try:
                req = _urlrequest.Request(
                    OPENDATA_URL,
                    data=body,
                    headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
                    method="POST",
                )
                with _urlrequest.urlopen(req, timeout=60) as resp:
                    payload = _json.loads(resp.read().decode("utf-8"))
                break
            except (_urlerror.HTTPError, _urlerror.URLError, TimeoutError) as e:
                if attempt >= max_retries:
                    raise
                wait = 5 * (2 ** (attempt - 1))
                print(f"    opendata {table}/{year} offset={offset} attempt {attempt} "
                      f"failed ({type(e).__name__}: {e}) — retry in {wait}s")
                _time.sleep(wait)
        if payload is None:
            raise RuntimeError(f"opendata {table}/{year}: no payload after retries")
        page = payload.get("data") or [] if isinstance(payload, dict) else (payload or [])
        rows.extend(r for r in page if str(r.get("areacode") or "").startswith(areacode_prefix))
        if len(page) < limit:
            return rows
        offset += limit


# รายงานมาตรฐาน HDC สสจ.เชียงใหม่ ที่ไม่มี opendata_id ใน moph_catalog.json หรือต้องการ override
STATIC_HDC_URLS = {
    "s_childdev_specialpp": "https://hdc.moph.go.th/cmi/public/standard-report-detail/2238b7879f442749bd1804032119e824?subcatalogId=1ed90bc32310b503b7ca9b32af425ae5",
    "s_childdev_specialpp48": "https://hdc.moph.go.th/cmi/public/standard-report-detail/8f756c2dbc5f525f853d898dfaef0c14",
}
