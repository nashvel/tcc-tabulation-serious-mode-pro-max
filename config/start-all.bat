@echo off
REM ============================================
REM Start all services for Tabulation System
REM For LAN access, use your computer's IP address
REM ============================================

echo.
echo ============================================
echo    TABULATION SYSTEM - LAN STARTUP
echo ============================================
echo.

REM Get the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found
    )
)
:found

echo Your Local IP Address: %LOCAL_IP%
echo.
echo ============================================
echo    ACCESS URLS (for other devices on LAN):
echo ============================================
echo    Admin Panel:  http://%LOCAL_IP%:8000/admin
echo    Judge Screen: http://%LOCAL_IP%:8000/judge
echo    Setup Page:   http://%LOCAL_IP%:8000/setup
echo ============================================
echo.

REM Write the hot file with correct IP for Vite
echo Writing Vite hot file with IP: %LOCAL_IP%
echo http://%LOCAL_IP%:5173 > "%~dp0..\backend\public\hot"

echo Starting services...
echo.

REM Terminal 1: Laravel Backend (API Server)
echo [1/3] Starting Laravel Backend on 0.0.0.0:8000...
start "Laravel Backend - API" cmd /k "cd /d %~dp0..\backend && php artisan serve --host=0.0.0.0 --port=8000"

REM Wait for Laravel to start
timeout /t 3 /nobreak > nul

REM Terminal 2: Laravel Reverb (WebSocket Server for real-time)
echo [2/3] Starting Reverb WebSocket Server...
start "Laravel Reverb - WebSocket" cmd /k "cd /d %~dp0..\backend && php artisan reverb:start --host=0.0.0.0 --port=8080"

REM Wait a bit
timeout /t 2 /nobreak > nul

REM Terminal 3: Vite Dev Server (Frontend hot reload)
echo [3/3] Starting Vite Dev Server on 0.0.0.0:5173...
start "Vite Dev Server - Frontend" cmd /k "cd /d %~dp0..\backend && npm run dev -- --host 0.0.0.0"

echo.
echo ============================================
echo    ALL SERVICES STARTED!
echo ============================================
echo.
echo Press any key to close this window...
echo (The service windows will keep running)
pause > nul
