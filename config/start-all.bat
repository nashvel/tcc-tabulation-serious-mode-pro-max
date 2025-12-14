@echo off
REM Start all services for Tabulation System
REM This script opens 2 terminals for: Laravel Backend and Frontend
REM Real-time broadcasting is handled by Pusher (cloud-based)

echo Starting Tabulation System Services...
echo.

REM Terminal 1: Laravel Backend
start "Laravel Backend" cmd /k "cd /d %~dp0..\backend && php artisan serve --host 0.0.0.0"

REM Wait a bit for Laravel to start
timeout /t 2 /nobreak

REM Terminal 2: Laravel Backend
start "Laravel Backend" cmd /k "cd /d %~dp0..\backend && php artisan serve"

REM Terminal 3: Laravel Backend
start "Laravel Backend" cmd /k "cd /d %~dp0..\backend && npm run dev"
pause
