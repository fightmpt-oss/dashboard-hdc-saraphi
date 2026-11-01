import os
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
os.chdir(ROOT_DIR)

def print_box(title):
    print("=" * 70)
    print(f"  {title}")
    print("=" * 70)

def run_cmd(cmd_list, description):
    print(f"\n>> {description}...")
    res = subprocess.run(cmd_list)
    return res.returncode == 0

def sync_nhso():
    print_box("ระบบดึงข้อมูลกองทุนแพทย์แผนไทย สปสช. (MeData) - Manual Sync")
    print("\n[1/3] กำลังเชื่อมต่อไปยัง Tableau MeData สปสช. (https://medata.nhso.go.th)...")
    print("กำลังสกัดข้อมูลหัตถการ สมุนไพร 55/9/32 รายการ และ Error Code...")
    
    # Run sync script (fast mode: current year 2569 + skip granular per-drug)
    ok = run_cmd([sys.executable, "scripts/sync_nhso_medata_realtime.py", "--years", "2569", "--skip-granular"], "ดึงข้อมูลจาก MeData สปสช.")
    if not ok:
        print("\n[ข้อผิดพลาด] การดึงข้อมูลจาก MeData สปสช. ไม่สำเร็จ")
        print("กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองใหม่อีกครั้ง")
        return False

    print("\n[2/3] ตรวจสอบความสมบูรณ์ของข้อมูล (Data Integrity Check)...")
    ok = run_cmd([sys.executable, "scripts/verify_integrity.py"], "ตรวจสอบ Data Integrity")
    if not ok:
        print("\n[ข้อผิดพลาด] ตรวจสอบข้อมูลไม่ผ่าน")
        return False

    print("\n[3/3] ตรวจสอบการเปลี่ยนแปลงและ Push ขึ้น GitHub / Vercel...")
    subprocess.run(["git", "add", "data/nhso", "data/verification_status.json", "index.html"])
    diff = subprocess.run(["git", "diff", "--cached", "--quiet"])
    
    if diff.returncode != 0:
        print("พบข้อมูลใหม่ กำลัง Commit และ Push ไปยัง GitHub...")
        subprocess.run(["git", "commit", "-m", "feat(nhso): manual sync MeData figures"])
        push_res = subprocess.run(["git", "push", "origin", "main"])
        if push_res.returncode == 0:
            print("\n" + "=" * 70)
            print("  [สำเร็จ 100%] Push ข้อมูลขึ้น GitHub เรียบร้อยแล้ว!")
            print("  Vercel กำลัง Deploy แดชบอร์ดให้อัตโนมัติ (ประมาณ 30 วินาที)")
            print("  ตรวจสอบผลลัพธ์ได้ที่: https://dashboard-hdc-saraphi.vercel.app/")
            print("=" * 70)
        else:
            print("\n[คำเตือน] บันทึกข้อมูลลงเครื่องสำเร็จแล้ว แต่ push ขึ้น GitHub ไม่สำเร็จ")
    else:
        print("\n" + "=" * 70)
        print("  [เรียบร้อย] ข้อมูล สปสช. บนระบบเป็นข้อมูลล่าสุดอยู่แล้ว (ไม่มีการเปลี่ยนแปลง)")
        print("  ตรวจสอบแดชบอร์ดได้ที่: https://dashboard-hdc-saraphi.vercel.app/")
        print("=" * 70)
    return True

def sync_hdc():
    print_box("ระบบดึงข้อมูล HDC OpenData กระทรวงสาธารณสุข - Manual Sync")
    print("\n[1/3] กำลังเชื่อมต่อไปยัง OpenData MoPH (https://opendata.moph.go.th)...")
    print("กำลังสกัดข้อมูลตัวชี้วัดทุกกลุ่ม (PCC, PPB, NCD, ผู้สูงอายุ, แม่และเด็ก)...")

    ok = run_cmd([sys.executable, "scripts/run_pipeline.py"], "ดึงข้อมูลจาก OpenData MoPH")
    if not ok:
        print("\n[ข้อผิดพลาด] การดึงข้อมูลจาก OpenData MoPH ไม่สำเร็จ")
        print("กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองใหม่อีกครั้ง")
        return False

    print("\n[2/3] ตรวจสอบความสมบูรณ์ของข้อมูล (Data Integrity Check)...")
    ok = run_cmd([sys.executable, "scripts/verify_integrity.py"], "ตรวจสอบ Data Integrity")
    if not ok:
        print("\n[ข้อผิดพลาด] ตรวจสอบข้อมูลไม่ผ่าน")
        return False

    print("\n[3/3] ตรวจสอบการเปลี่ยนแปลงและ Push ขึ้น GitHub / Vercel...")
    subprocess.run(["git", "add", "data"])
    diff = subprocess.run(["git", "diff", "--cached", "--quiet"])
    
    if diff.returncode != 0:
        print("พบข้อมูลใหม่ กำลัง Commit และ Push ไปยัง GitHub...")
        subprocess.run(["git", "commit", "-m", "data: manual refresh HDC OpenData snapshots"])
        push_res = subprocess.run(["git", "push", "origin", "main"])
        if push_res.returncode == 0:
            print("\n" + "=" * 70)
            print("  [สำเร็จ 100%] Push ข้อมูลขึ้น GitHub เรียบร้อยแล้ว!")
            print("  Vercel กำลัง Deploy แดชบอร์ดให้อัตโนมัติ (ประมาณ 30 วินาที)")
            print("  ตรวจสอบผลลัพธ์ได้ที่: https://dashboard-hdc-saraphi.vercel.app/")
            print("=" * 70)
        else:
            print("\n[คำเตือน] บันทึกข้อมูลลงเครื่องสำเร็จแล้ว แต่ push ขึ้น GitHub ไม่สำเร็จ")
    else:
        print("\n" + "=" * 70)
        print("  [เรียบร้อย] ข้อมูล HDC บนระบบเป็นข้อมูลล่าสุดอยู่แล้ว (ไม่มีการเปลี่ยนแปลง)")
        print("  ตรวจสอบแดชบอร์ดได้ที่: https://dashboard-hdc-saraphi.vercel.app/")
        print("=" * 70)
    return True

if __name__ == "__main__":
    mode = "nhso"
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if "--hdc" in sys.argv or arg == "hdc":
            mode = "hdc"
        elif "--all" in sys.argv or arg == "all":
            mode = "all"

    if mode == "nhso":
        sync_nhso()
    elif mode == "hdc":
        sync_hdc()
    elif mode == "all":
        sync_hdc()
        sync_nhso()
