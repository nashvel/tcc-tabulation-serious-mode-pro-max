@echo off
REM Start all services for Tabulation System
REM This script opens 4 terminals for: Redis, Laravel, Echo Server, and Frontend

echo Starting Tabulation System Services...
echo.

REM Terminal 1: Redis Server
start "Redis Server" cmd /k "cd /d %~dp0server\redis && redis-server"

REM Wait a bit for Redis to start
timeout /t 2 /nobreak

REM Terminal 2: Laravel Backend
start "Laravel Backend" cmd /k "cd /d %~dp0backend && php artisan serve"

REM Wait a bit for Laravel to start
timeout /t 2 /nobreak

REM Terminal 3: Echo Server (Socket.IO)
start "Echo Server" cmd /k "cd /d %~dp0backend && laravel-echo-server start"

REM Wait a bit for Echo Server to start
timeout /t 2 /nobreak

REM Terminal 4: Frontend
start "Frontend Dev" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All services started! Check the 4 terminal windows.
echo.
pause
