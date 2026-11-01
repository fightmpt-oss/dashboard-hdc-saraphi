@echo off
cd /d "%~dp0"
python scripts\run_manual_sync.py nhso %*
pause
