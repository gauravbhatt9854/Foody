@echo off
echo Starting Foody Application...
echo.

echo Checking Node.js...
node --version
echo.

echo Checking npm...
npm --version
echo.

echo Current directory:
cd
echo.

echo Starting backend server on port 5000...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting frontend server on port 3000...
cd frontend
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo Both servers should be starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to continue...
pause > nul