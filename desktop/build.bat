@echo off
setlocal enabledelayedexpansion

REM Clear electron-builder cache
for /d %%i in ("%APPDATA%\electron-builder\Cache\*") do rmdir /s /q "%%i" 2>nul

REM Build React app
call npm run react-build

REM Build with electron-builder without code signing
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_KEY_PASSWORD=
call npx electron-builder --win portable --publish never

echo.
echo Build complete! Check the dist folder for your .exe file.
pause
