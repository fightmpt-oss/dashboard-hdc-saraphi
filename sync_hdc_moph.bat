@echo off
chcp 65001 > nul
echo ======================================================================
echo   ระบบดึงข้อมูล HDC OpenData กระทรวงสาธารณสุข - Manual Sync
echo   Dashboard HDC อำเภอสารภี จังหวัดเชียงใหม่
echo ======================================================================
echo.
echo [1/3] กำลังเชื่อมต่อไปยัง OpenData MoPH (https://opendata.moph.go.th)...
echo [กำลังประมวลผล] ดึงข้อมูลตัวชี้วัดทุกกลุ่ม (PCC, PPB, NCD, ผู้สูงอายุ, แม่และเด็ก)...
echo.

python scripts\run_pipeline.py %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ----------------------------------------------------------------------
    echo [ข้อผิดพลาด] การดึงข้อมูลจาก OpenData MoPH ไม่สำเร็จ
    echo กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือรอสักครู่แล้วลองใหม่อีกครั้ง
    echo ----------------------------------------------------------------------
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] ตรวจสอบความสมบูรณ์ของข้อมูล (Data Integrity Check)...
python scripts\verify_integrity.py

echo.
echo [3/3] ตรวจสอบการเปลี่ยนแปลงและ Push ขึ้น GitHub / Vercel...
git status --porcelain data > nul 2>&1
git diff --quiet data
if %ERRORLEVEL% NEQ 0 (
    echo พบข้อมูลใหม่ กำลัง Commit และ Push ไปยัง GitHub...
    git add data
    git commit -m "data: manual refresh HDC OpenData snapshots"
    git push origin main
    echo.
    echo ======================================================================
    echo   [สำเร็จ 100%%] Push ข้อมูลขึ้น GitHub เรียบร้อยแล้ว!
    echo   Vercel กำลัง Build และ Deploy แดชบอร์ดให้อัตโนมัติ (ประมาณ 30 วินาที)
    echo   ตรวจสอบผลลัพธ์ได้ที่: https://dashboard-hdc-saraphi.vercel.app/
    echo ======================================================================
) else (
    echo ข้อมูล HDC ปัจจุบันเป็นข้อมูลล่าสุดอยู่แล้ว (ไม่มีการเปลี่ยนแปลง)
    echo ======================================================================
    echo   [เรียบร้อย] ข้อมูลบนระบบตรงกับต้นทาง HDC OpenData แล้ว
    echo ======================================================================
)

echo.
pause
