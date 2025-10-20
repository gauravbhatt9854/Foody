@echo off
echo ============================================
echo         EMERGENCY FOODY STARTUP
echo ============================================
echo.

echo Killing any existing Node.js processes...
taskkill /F /IM node.exe 2>nul
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo.

echo Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found! Please install npm first.
    pause
    exit /b 1
)
echo.

echo Navigating to backend directory...
cd /d "c:\foody\backend"
if %errorlevel% neq 0 (
    echo ERROR: Backend directory not found!
    pause
    exit /b 1
)

echo Starting Backend Server (Port 5000)...
start "Foody Backend - Port 5000" cmd /k "echo Starting backend server... && node src/server.js"
echo.

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo Navigating to frontend directory...
cd /d "c:\foody\frontend"
if %errorlevel% neq 0 (
    echo ERROR: Frontend directory not found!
    pause
    exit /b 1
)

echo Starting Frontend Server (Port 3000)...
start "Foody Frontend - Port 3000" cmd /k "echo Starting frontend server... && npm start"
echo.

echo ============================================
echo              SERVERS STARTING
echo ============================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend App:   http://localhost:3000
echo.
echo Check the opened terminal windows for any errors.
echo The frontend should automatically open in your browser.
echo.
echo If you see "Compiled successfully!" in the frontend window,
echo your app is ready at http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul