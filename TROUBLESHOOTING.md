# 🔧 Troubleshooting Guide - Foody App

## Current Issue: "Can't reach this page" on localhost:3000

This means the frontend server isn't running. Here are multiple ways to fix this:

## Method 1: Manual Terminal Approach (Recommended)

### Step 1: Open Command Prompt or PowerShell as Administrator
- Press `Win + X` and select "Windows PowerShell (Admin)" or "Command Prompt (Admin)"

### Step 2: Start Backend Server
```bash
cd c:\foody\backend
npm start
```
**Expected output:** 
```
Server running on port 5000
Connected to MongoDB
```

### Step 3: Open Another Terminal for Frontend
```bash
cd c:\foody\frontend
npm start
```
**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

## Method 2: Using VS Code Terminal

### Option A: Split Terminal
1. Open VS Code terminal (`Ctrl + ``)
2. Click the "+" to create new terminal
3. In Terminal 1: `cd backend && npm start`
4. In Terminal 2: `cd frontend && npm start`

### Option B: Background Process
1. `cd backend && start npm start`
2. `cd frontend && npm start`

## Method 3: Using npm scripts from root

```bash
cd c:\foody
npm run dev
```

## Method 4: Double-click batch files
Navigate to `c:\foody` folder and double-click:
- `start-app.bat` or 
- `start-debug.bat`

## Common Issues & Solutions

### Issue 1: Port Already in Use
```bash
# Kill processes on ports
npx kill-port 3000
npx kill-port 5000
```

### Issue 2: Dependencies Missing
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend  
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Environment Variables
Check if `backend\.env` file exists and contains:
```
PORT=5000
MONGODB_URI=mongodb+srv://rounak_db:Rounak%4012@cluster0.ql0t2zt.mongodb.net/food?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=foody_jwt_secret_key_2025_strong_password_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Issue 4: Windows Firewall
- Allow Node.js through Windows Firewall
- Or temporarily disable firewall for testing

### Issue 5: Antivirus Blocking
- Add `c:\foody` folder to antivirus exclusions
- Or temporarily disable real-time protection

## Quick Verification Steps

### 1. Check Node.js Installation
```bash
node --version
npm --version
```

### 2. Check if servers are running
- Backend: Open http://localhost:5000 in browser
- Frontend: Open http://localhost:3000 in browser

### 3. Check processes
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

## Manual Start Guide (If all else fails)

### Backend Server:
1. Open Command Prompt
2. `cd c:\foody\backend`
3. `node src/server.js`
4. Should see: "Server running on port 5000"

### Frontend Server:
1. Open another Command Prompt
2. `cd c:\foody\frontend`
3. `npm start`
4. Should automatically open http://localhost:3000

## Success Indicators

### Backend Started Successfully:
```
✅ Server running on port 5000
✅ Connected to MongoDB Atlas successfully
✅ Socket.IO server initialized
```

### Frontend Started Successfully:
```
✅ Compiled successfully!
✅ Local: http://localhost:3000
✅ On Your Network: http://192.168.x.x:3000
```

## Emergency Script

If nothing works, create this file as `emergency-start.bat`:

```batch
@echo off
echo Starting Emergency Foody Server...

echo Killing existing processes...
taskkill /F /IM node.exe 2>nul

echo Starting Backend...
cd /d "c:\foody\backend"
start "Foody Backend" cmd /k "node src/server.js"

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo Starting Frontend...
cd /d "c:\foody\frontend"
start "Foody Frontend" cmd /k "npm start"

echo Servers starting... Check the opened windows!
pause
```

## Contact for Help
If you're still having issues:
1. Check the opened terminal windows for error messages
2. Try running each command manually
3. Ensure Windows Defender/Antivirus isn't blocking Node.js
4. Try running VS Code as Administrator

The app should work once both servers are running! 🚀