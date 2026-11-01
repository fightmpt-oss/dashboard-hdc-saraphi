@echo off
chcp 65001 > nul
echo ======================================================================
echo   ระบบดึงข้อมูลกองทุนแพทย์แผนไทย สปสช. (MeData) - Manual Sync
echo   Dashboard HDC อำเภอสารภี จังหวัดเชียงใหม่
echo ======================================================================
echo.
echo [1/3] กำลังเชื่อมต่อไปยัง Tableau MeData สปสช. (https://medata.nhso.go.th)...
echo [กำลังประมวลผล] ดึงข้อมูลหัตถการ สมุนไพร 55/9/32 รายการ และ Error Code...
echo.

python scripts\sync_nhso_medata_realtime.py %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ----------------------------------------------------------------------
    echo [ข้อผิดพลาด] การดึงข้อมูลจาก MeData สปสช. ไม่สำเร็จ
    echo กรุณาตรวจสอบว่าอินเทอร์เน็ตใช้งานได้ตามปกติหรือไม่
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
git status --porcelain data/nhso data/verification_status.json index.html > nul 2>&1
git diff --quiet data/nhso data/verification_status.json index.html
if %ERRORLEVEL% NEQ 0 (
    echo พบข้อมูลใหม่ กำลัง Commit และ Push ไปยัง GitHub...
    git add data/nhso data/verification_status.json index.html
    git commit -m "feat(nhso): manual sync MeData figures"
    git push origin main
    echo.
    echo ======================================================================
    echo   [สำเร็จ 100%%] Push ข้อมูลขึ้น GitHub เรียบร้อยแล้ว!
    echo   Vercel กำลัง Build และ Deploy แดชบอร์ดให้อัตโนมัติ (ประมาณ 30 วินาที)
    echo   ตรวจสอบผลลัพธ์ได้ที่: https://dashboard-hdc-saraphi.vercel.app/
    echo ======================================================================
) else (
    echo ข้อมูล สปสช. ปัจจุบันเป็นข้อมูลล่าสุดอยู่แล้ว (ไม่มีการเปลี่ยนแปลง)
    echo ======================================================================
    echo   [เรียบร้อย] ข้อมูลบนระบบตรงกับต้นทาง สปสช. แล้ว
    echo ======================================================================
)

echo.
pause
