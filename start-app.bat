@echo off
echo Starting Foody Application...
echo.

echo Starting Backend Server...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul