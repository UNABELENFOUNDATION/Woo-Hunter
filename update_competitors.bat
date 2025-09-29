@echo off
REM Competitor Update Batch Script
REM Run this weekly with Windows Task Scheduler

echo Updating competitor data...
cd /d "c:\Users\solar\Desktop\woo win"
python update_competitors.py

echo.
echo Press any key to exit...
pause > nul