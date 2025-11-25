@echo off
REM Start all services for Tabulation System
REM This script opens 2 terminals for: Laravel Backend and Frontend
REM Real-time broadcasting is handled by Pusher (cloud-based)

echo Starting Tabulation System Services...
echo.

REM Terminal 1: Laravel Backend
start "Laravel Backend" cmd /k "cd /d %~dp0..\backend && php artisan serve"

REM Wait a bit for Laravel to start
timeout /t 2 /nobreak

REM Terminal 2: Frontend
start "Frontend Dev" cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo.
echo All services started! Check the 2 terminal windows.
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Make sure to set PUSHER credentials in backend/.env
echo.
pause
