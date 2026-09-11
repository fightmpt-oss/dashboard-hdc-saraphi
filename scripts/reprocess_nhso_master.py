import json
import os

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "nhso")

SARAPHI_MAP = {
    "06014": {"name": "รพ.สต.บ้านยางเนิ้ง", "aliases": ["ยางเนิ้ง", "บ้านยางเนิ้ง"]},
    "06015": {"name": "รพ.สต.บ้านพญาชมภู", "aliases": ["พญาชมภู", "บ้านพญาชมภู", "พญาชมพู", "บ้านพญาชมพู"]},
    "06016": {"name": "รพ.สต.บ้านศรีสองเมือง", "aliases": ["ศรีสองเมือง", "สองแคว", "ไชยสถาน"]},
    "06017": {"name": "รพ.สต.บ้านหัวดง", "aliases": ["หัวดง", "บ้านหัวดง", "ขัวมุง"]},
    "06018": {"name": "รพ.สต.บ้านหนองแฝก", "aliases": ["หนองแฝก", "บ้านหนองแฝก"]},
    "06020": {"name": "รพ.สต.บ้านแคว (ท่ากว้าง)", "aliases": ["บ้านแคว", "ท่ากว้าง", "แคว"]},
    "06021": {"name": "รพ.สต.บ้านสันต้นกอก", "aliases": ["สันต้นกอก", "ดอนแก้ว"]},
    "06022": {"name": "รพ.สต.บ้านบวกครกเหนือ", "aliases": ["บวกครกเหนือ", "ท่าวังตาล"]},
    "06023": {"name": "รพ.สต.บ้านป่าสา", "aliases": ["ป่าเส้า", "บ้านป่าเส้า", "ป่าสา", "บ้านป่าสา", "สันทราย"]},
    "06024": {"name": "รพ.สต.บ้านศรีคำชมภู", "aliases": ["ศรีคำชมภู", "ป่าบง"]},
    "11135": {"name": "รพ.สารภี", "aliases": ["รพ.สารภี", "โรงพยาบาลสารภี", "สารภี"]},
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

def parse_num(val):
    if val is None:
        return 0
    if isinstance(val, (int, float)):
        return val
    cleaned = str(val).replace(",", "").strip()
    try:
        return float(cleaned) if "." in cleaned else int(cleaned)
    except:
        return 0

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
            unit_summary[c]["sheet4_herb55_bath"] = p["point"]

    # Populate Sheet 5
    for p in master["sheets"]["sheet5_herb9"].get("unitCounts", []):
        c = match_hospcode(p["unit"])
        if c:
            unit_summary[c]["sheet5_herb9_count"] = p["count"]
            unit_summary[c]["sheet5_herb9_bath"] = p["count"] * 60

    # Populate Sheet 6
    for p in master["sheets"]["sheet6_herb32"].get("unitCounts", []):
        c = match_hospcode(p["unit"])
        if c:
            unit_summary[c]["sheet6_herb32_count"] = p["count"]
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

    # ----------------------------------------------------
    # Process Menu 9: Error Codes
    # ----------------------------------------------------
    err_path = os.path.join(BASE_DIR, "nhso_error_codes.json")
    if os.path.exists(err_path):
        with open(err_path, "r", encoding="utf-8") as f:
            err_data = json.load(f)

        error_processed = {
            "catalog": err_data.get("errorCatalog", {}),
            "summary": {}
        }

        for act in ["ยาสมุนไพร", "หัตถการ"]:
            error_processed["summary"][act] = {}
            for yr in ["2567", "2568", "2569"]:
                # Initialize per-unit errors
                units_err = {}
                for c, info in SARAPHI_MAP.items():
                    units_err[c] = {
                        "hospcode": c,
                        "name": info["name"],
                        "errors": {},
                        "totalErrors": 0
                    }

                district_err_counts = {}
                total_district_errors = 0

                records = err_data.get("records", {}).get(act, {}).get(yr, {}).get("rows", [])
                for r in records:
                    if len(r) >= 7:
                        unit_name = r[3]
                        err_code = r[4].strip()
                        count = parse_num(r[6])
                        c = match_hospcode(unit_name)
                        if c:
                            units_err[c]["errors"][err_code] = units_err[c]["errors"].get(err_code, 0) + count
                            units_err[c]["totalErrors"] += count

                        district_err_counts[err_code] = district_err_counts.get(err_code, 0) + count
                        total_district_errors += count

                error_processed["summary"][act][yr] = {
                    "units": units_err,
                    "districtErrors": district_err_counts,
                    "totalErrors": total_district_errors
                }

        master["error_codes"] = error_processed
        print(f"Error codes integrated: {len(error_processed['catalog'])} catalog codes")

    # ----------------------------------------------------
    # Process Multi-Year (Sheets 3, 4, 5, 6)
    # ----------------------------------------------------
    my_path = os.path.join(BASE_DIR, "nhso_multiyear.json")
    if os.path.exists(my_path):
        with open(my_path, "r", encoding="utf-8") as f:
            my_data = json.load(f)

        multiyear_processed = {
            "sheet3_service": {},
            "sheet4_herb55": {},
            "sheet5_herb9": {},
            "sheet6_herb32": {}
        }

        # Process Sheet 3
        for yr, rows in my_data.get("sheet3", {}).items():
            if isinstance(rows, list):
                unit_map = {c: 0 for c in SARAPHI_MAP}
                dist_sum = 0
                for r in rows:
                    c = match_hospcode(r["unit"])
                    if c:
                        unit_map[c] = r["point"]
                        dist_sum += r["point"]
                multiyear_processed["sheet3_service"][yr] = {
                    "units": unit_map,
                    "district_total": dist_sum
                }

        # Process Sheet 4
        for yr, rows in my_data.get("sheet4", {}).items():
            if isinstance(rows, list):
                unit_map = {c: 0 for c in SARAPHI_MAP}
                dist_sum = 0
                for r in rows:
                    c = match_hospcode(r["unit"])
                    if c:
                        unit_map[c] = r["point"]
                        dist_sum += r["point"]
                multiyear_processed["sheet4_herb55"][yr] = {
                    "units": unit_map,
                    "district_total": dist_sum
                }

        # Process Sheet 5
        for yr, rows in my_data.get("sheet5", {}).items():
            if isinstance(rows, list):
                unit_map = {c: 0 for c in SARAPHI_MAP}
                dist_sum = 0
                for r in rows:
                    c = match_hospcode(r["unit"])
                    if c:
                        unit_map[c] = r["val"]
                        dist_sum += r["val"]
                multiyear_processed["sheet5_herb9"][yr] = {
                    "units": unit_map,
                    "district_total": dist_sum
                }

        # Process Sheet 6
        for yr, rows in my_data.get("sheet6", {}).items():
            if isinstance(rows, list):
                unit_map = {c: 0 for c in SARAPHI_MAP}
                dist_sum = 0
                for r in rows:
                    c = match_hospcode(r["unit"])
                    if c:
                        unit_map[c] = r["val"]
                        dist_sum += r["val"]
                multiyear_processed["sheet6_herb32"][yr] = {
                    "units": unit_map,
                    "district_total": dist_sum
                }

        master["multiyear"] = multiyear_processed
        print("Multi-year data integrated successfully!")

    # ----------------------------------------------------
    # Process Procedure Types (Sheet 3: 6 Services x 3 Years)
    # ----------------------------------------------------
    proc_path = os.path.join(BASE_DIR, "nhso_procedure_types.json")
    if os.path.exists(proc_path):
        with open(proc_path, "r", encoding="utf-8") as f:
            proc_data = json.load(f)
        master["procedure_types"] = proc_data.get("data", {})
        print("Procedure types data (6 services x 3 years) integrated successfully!")

    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(master, f, ensure_ascii=False, indent=2)

    print(f"\nFinal reprocessed master JSON saved to {master_path}!")

if __name__ == "__main__":
    reprocess()
