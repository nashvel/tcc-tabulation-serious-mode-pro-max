# Start all services for Tabulation System
# Run with: powershell -ExecutionPolicy Bypass -File start-all.ps1

Write-Host "Starting Tabulation System Services..." -ForegroundColor Green
Write-Host ""

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Terminal 1: Redis Server
Write-Host "Starting Redis Server..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $projectPath\server\redis && redis-server" -WindowStyle Normal

Start-Sleep -Seconds 2

# Terminal 2: Laravel Backend
Write-Host "Starting Laravel Backend..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $projectPath\backend && php artisan serve" -WindowStyle Normal

Start-Sleep -Seconds 2

# Terminal 3: Echo Server (Socket.IO)
Write-Host "Starting Echo Server..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $projectPath\backend && laravel-echo-server start" -WindowStyle Normal

Start-Sleep -Seconds 2

# Terminal 4: Frontend
Write-Host "Starting Frontend Dev Server..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $projectPath\frontend && npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "All services started! Check the 4 terminal windows." -ForegroundColor Green
Write-Host ""
Write-Host "Services running on:" -ForegroundColor Yellow
Write-Host "  Redis: localhost:6379"
Write-Host "  Laravel: http://localhost:8000"
Write-Host "  Echo Server: localhost:6001"
Write-Host "  Frontend: http://localhost:5173"
Write-Host ""
