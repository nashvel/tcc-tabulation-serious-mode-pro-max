@echo off
REM Test Echo Server startup
echo Testing Echo Server startup...
echo.
echo Make sure Redis is running first!
echo.

cd /d "%~dp0..\backend"

echo Starting Echo Server with detailed output...
laravel-echo-server start

pause
