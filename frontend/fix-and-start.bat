@echo off
title Vite Development Server Fix
color 0A

echo ====================================
echo   Vite + React Development Server Fix
echo ====================================
echo.

cd /d "C:\Users\MY PC\OneDrive\Desktop\f"
echo Changed to project directory: %CD%
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found: 
node --version
echo.

echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found. Please reinstall Node.js.
    pause
    exit /b 1
)
echo npm found:
npm --version
echo.

echo Clearing npm cache...
npm cache clean --force
echo.

echo Removing old dependencies...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"
echo.

echo Installing fresh dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Clearing Vite cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
echo.

echo Testing project build...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed. Please check for syntax errors.
    pause
    exit /b 1
)
echo Build successful!
echo.

echo Starting Vite development server...
echo Server will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.
npm run dev

pause