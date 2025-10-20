cd "C:\foody\backend"
Write-Host "Starting Foody Backend Server..."
Write-Host "Current directory: $(Get-Location)"
Write-Host "Environment variables:"
Write-Host "FRONTEND_URL: $env:FRONTEND_URL"
node src/server.js