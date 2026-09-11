import json
import os

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "nhso")

SARAPHI_MAP = {
    "06014": {"name": "รพ.สต.บ้านยางเนิ้ง", "aliases": ["ยางเนิ้ง", "บ้านยางเนิ้ง"]},
    "06015": {"name": "รพ.สต.บ้านพญาชมภู", "aliases": ["พญาชมภู", "บ้านพญาชมภู", "พญาชมพู", "บ้านพญาชมพู"]},
    "06016": {"name": "รพ.สต.บ้านศรีสองเมือง", "aliases": ["ศรีสองเมือง", "สองแคว", "ไชยสถาน"]},
    "06017": {"name": "รพ.สต.บ้านหัวดง", "aliases": ["หัวดง", "บ้านหัวดง", "ขัวมุง"]},
    "06018": {"name": "รพ.สต.บ้านหนองแฝก", "aliases": ["หนองแฝก", "บ้านหนองแฝก"]},
    "06020": {"name": "รพ.สต.บ้านแคว (ท่ากว้าง)", "aliases": ["บ้านแคว", "ท่ากว้าง"]},
    "06021": {"name": "รพ.สต.บ้านสันต้นกอก", "aliases": ["สันต้นกอก", "ดอนแก้ว"]},
    "06022": {"name": "รพ.สต.บ้านบวกครกเหนือ", "aliases": ["บวกครกเหนือ", "ท่าวังตาล"]},
    "06023": {"name": "รพ.สต.บ้านป่าเส้า", "aliases": ["ป่าเส้า", "บ้านป่าเส้า", "ป่าสา", "บ้านป่าสา", "สันทราย"]},
    "06024": {"name": "รพ.สต.บ้านศรีคำชมภู", "aliases": ["ศรีคำชมภู", "ป่าบง"]},
    "11135": {"name": "รพ.สารภี", "aliases": ["รพ.สารภี", "โรงพยาบาลสารภี"]},
    "13994": {"name": "รพ.สต.บ้านท่าต้นกวาว", "aliases": ["ท่าต้นกวาว", "บ้านท่าต้นกวาว"]},
    "14461": {"name": "รพ.สต.บ้านหนองผึ้ง", "aliases": ["หนองผึ้ง", "บ้านหนองผึ้ง"]},
    "99758": {"name": "ศสม.สารภี", "aliases": ["ศสม", "ศูนย์สุขภาพชุมชน"]}
}

def match_hospcode(raw_name):
    clean = raw_name.replace("ตำบล", " ").replace("ต.", " ")
    for code, info in SARAPHI_MAP.items():
        if info["name"] in clean:
            return code
        for alias in info["aliases"]:
            if alias in clean:
                return code
    return None

def reprocess():
    master_path = os.path.join(BASE_DIR, "nhso_saraphi_master.json")
    with open(master_path, "r", encoding="utf-8") as f:
        master = json.load(f)

    unit_summary = {}
    for code, info in SARAPHI_MAP.items():
        unit_summary[code] = {
            "hospcode": code,
            "name": info["name"],
            "sheet3_service_point": 0,
            "sheet3_service_bath": 0,
            "sheet4_herb55_point": 0,
            "sheet4_herb55_bath": 0,
            "sheet5_herb9_count": 0,
            "sheet5_herb9_bath": 0,
            "sheet6_herb32_count": 0,
            "sheet6_herb32_bath": 0,
            "total_bath": 0,
            "total_point": 0
        }

    # Populate Sheet 3
    for p in master["sheets"]["sheet3_service"].get("unitPoints", []):
        c = match_hospcode(p["unit"])
        if c:
            unit_summary[c]["sheet3_service_point"] = p["point"]
    for b in master["sheets"]["sheet3_service"].get("unitBaths", []):
        c = match_hospcode(b["unit"])
        if c:
            unit_summary[c]["sheet3_service_bath"] = b["bath"]

    # Populate Sheet 4
    for p in master["sheets"]["sheet4_herb55"].get("unitPoints", []):
        c = match_hospcode(p["unit"])
        if c:
            unit_summary[c]["sheet4_herb55_point"] = p["point"]
            # in point system 1 point = 1 baht
            unit_summary[c]["sheet4_herb55_bath"] = p["point"]

    # Populate Sheet 5
    for p in master["sheets"]["sheet5_herb9"].get("unitCounts", []):
        c = match_hospcode(p["unit"])
        if c:
            unit_summary[c]["sheet5_herb9_count"] = p["count"]
            # Fee schedule for 9 herbs is ~50-80 baht/prescription avg ~60 baht
            unit_summary[c]["sheet5_herb9_bath"] = p["count"] * 60

    # Populate Sheet 6
    for p in master["sheets"]["sheet6_herb32"].get("unitCounts", []):
        c = match_hospcode(p["unit"])
        if c:
            unit_summary[c]["sheet6_herb32_count"] = p["count"]
            # 32 herbs cost avg ~55 baht/prescription
            unit_summary[c]["sheet6_herb32_bath"] = p["count"] * 55

    district_total = {
        "sheet3_service_point": 0,
        "sheet3_service_bath": 0,
        "sheet4_herb55_point": 0,
        "sheet4_herb55_bath": 0,
        "sheet5_herb9_count": 0,
        "sheet5_herb9_bath": 0,
        "sheet6_herb32_count": 0,
        "sheet6_herb32_bath": 0,
        "total_bath": 0,
        "total_point": 0
    }

    for code, u in unit_summary.items():
        u["total_point"] = u["sheet3_service_point"] + u["sheet4_herb55_point"]
        u["total_bath"] = (
            u["sheet3_service_bath"] +
            u["sheet4_herb55_bath"] +
            u["sheet5_herb9_bath"] +
            u["sheet6_herb32_bath"]
        )
        for k in district_total:
            district_total[k] += u[k]

    master["aggregated"] = {
        "district_total": district_total,
        "units": unit_summary
    }

    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(master, f, ensure_ascii=False, indent=2)

    print("Reprocessing completed!")
    print(f"District Total Compensation: {district_total['total_bath']:,.2f} บาท")
    print(f"District Total Point: {district_total['total_point']:,.0f} Point")
    for code, u in unit_summary.items():
        print(f"  {code} {u['name']}: {u['total_bath']:,.2f} บาท ({u['total_point']:,} pts)")

if __name__ == "__main__":
    reprocess()
