@echo off
echo ========================================
echo   FAST FOODY INSTALL & START
echo ========================================
echo.

echo Setting up fast npm registry...
npm config set registry https://registry.npmmirror.com/
npm config set prefer-offline true
npm config set audit false
npm config set fund false

echo.
echo Checking if dependencies are already installed...

cd /d "c:\foody\frontend"
if exist "node_modules" (
    echo Frontend dependencies found! Trying to start...
    echo.
    start "Foody Frontend" cmd /k "echo Starting frontend server... && npm start"
    goto check_backend
)

echo Frontend dependencies missing. Installing quickly...
echo This should take 2-5 minutes with fast registry...
npm install --no-audit --no-fund --prefer-offline

if %errorlevel% neq 0 (
    echo.
    echo Installation failed! Trying with yarn...
    npm install -g yarn
    yarn install
)

echo Starting frontend server...
start "Foody Frontend" cmd /k "npm start"

:check_backend
cd /d "c:\foody\backend"
if exist "node_modules" (
    echo Backend dependencies found! Starting...
    start "Foody Backend" cmd /k "echo Starting backend server... && npm start"
    goto finish
)

echo Backend dependencies missing. Installing...
npm install --no-audit --no-fund --prefer-offline
start "Foody Backend" cmd /k "npm start"

:finish
echo.
echo ========================================
echo   SERVERS STARTING...
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Wait for "Compiled successfully!" in frontend window
echo Then open: http://localhost:3000
echo.
pause