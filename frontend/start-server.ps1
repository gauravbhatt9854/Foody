# PowerShell script to start Vite development server
Set-Location "C:\Users\MY PC\OneDrive\Desktop\f"

Write-Host "Starting Vite development server..." -ForegroundColor Green
Write-Host "Project directory: $(Get-Location)" -ForegroundColor Yellow

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "Dependencies found." -ForegroundColor Green
} else {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Clear any potential port conflicts
Write-Host "Checking for port conflicts..." -ForegroundColor Yellow
$processOnPort = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($processOnPort) {
    Write-Host "Port 5173 is in use. Attempting to free it..." -ForegroundColor Red
    $process = Get-Process -Id $processOnPort.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        $process | Stop-Process -Force
        Write-Host "Stopped process on port 5173" -ForegroundColor Green
    }
}

# Start the development server
Write-Host "Starting Vite development server on port 5173..." -ForegroundColor Green
npm run dev