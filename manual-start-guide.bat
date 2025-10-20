@echo off
echo ========================================
echo   SIMPLE FOODY STARTER (No Terminal)
echo ========================================
echo.

echo Method 1: Using Windows Explorer
echo 1. Open Windows File Explorer
echo 2. Navigate to: c:\foody\frontend
echo 3. In the address bar, type: cmd
echo 4. Press Enter (opens command prompt in that folder)
echo 5. Type: npm start
echo 6. Press Enter
echo.

echo Method 2: Using Windows Run Dialog
echo 1. Press Windows Key + R
echo 2. Type: cmd /k "cd /d c:\foody\frontend && npm start"
echo 3. Press Enter
echo.

echo Method 3: Using PowerShell Direct
echo 1. Press Windows Key + X
echo 2. Select "Windows PowerShell"
echo 3. Type: cd c:\foody\frontend
echo 4. Type: npm start
echo.

echo Method 4: Create Desktop Shortcut
echo 1. Right-click on Desktop
echo 2. New > Shortcut
echo 3. Location: cmd /k "cd /d c:\foody\frontend && npm start"
echo 4. Name: "Start Foody Frontend"
echo.

echo ========================================
echo   WHAT TO EXPECT
echo ========================================
echo.
echo When frontend starts successfully you'll see:
echo - "Starting the development server..."
echo - "Compiled successfully!"
echo - "Local: http://localhost:3000"
echo.
echo Then open your browser to: http://localhost:3000
echo.
echo If you see errors, write them down and share them!
echo.
pause