# Foody Application Startup Script

Write-Host "Starting Foody Application..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Set-Location (Join-Path $scriptDir "backend")
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host "Waiting for backend to initialize..." -ForegroundColor Blue
Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Set-Location (Join-Path $scriptDir "frontend")
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")