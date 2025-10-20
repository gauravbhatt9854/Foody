# Vite Development Server Fix Script
# Run this script in PowerShell to automatically fix and start your Vite + React project

Write-Host "=== Vite + React Development Server Fix ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Navigate to project directory
Set-Location "C:\Users\MY PC\OneDrive\Desktop\f"
Write-Host "✓ Changed to project directory: $(Get-Location)" -ForegroundColor Green

# Step 2: Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Step 3: Check npm installation
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found. Please reinstall Node.js." -ForegroundColor Red
    exit 1
}

# Step 4: Clear npm cache and reinstall dependencies
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Removing node_modules and package-lock.json..." -ForegroundColor Yellow
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }

Write-Host "Installing fresh dependencies..." -ForegroundColor Yellow
npm install

# Step 5: Check for port conflicts
Write-Host "Checking for port conflicts on 5173..." -ForegroundColor Yellow
try {
    $connections = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "Found processes using port 5173. Attempting to stop them..." -ForegroundColor Yellow
        foreach ($conn in $connections) {
            try {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Stop-Process -Id $process.Id -Force
                    Write-Host "✓ Stopped process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Green
                }
            } catch {
                Write-Host "Could not stop process with PID: $($conn.OwningProcess)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "✓ Port 5173 is available" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not check port status, proceeding anyway..." -ForegroundColor Yellow
}

# Step 6: Clear Vite cache
Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") { Remove-Item -Recurse -Force "node_modules/.vite" }

# Step 7: Test build first
Write-Host "Testing project build..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed. Check for syntax errors:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    Write-Host "Please fix the build errors before starting the dev server." -ForegroundColor Yellow
    exit 1
}

# Step 8: Start development server
Write-Host "Starting Vite development server..." -ForegroundColor Green
Write-Host "The server will start on http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server with verbose output
npm run dev