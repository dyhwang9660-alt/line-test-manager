@echo off
rem Custom Calculator - remove shortcuts
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" -Uninstall
echo.
pause
