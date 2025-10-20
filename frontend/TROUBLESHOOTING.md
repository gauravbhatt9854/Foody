# Vite + React Development Server Fix Guide

## Problem
The development server is not running, causing browser errors like:
- `GET http://localhost:5173/src/services/api.js net::ERR_INTERNET_DISCONNECTED`
- `GET http://localhost:5173/vite.svg net::ERR_INTERNET_DISCONNECTED`

## Automated Solution

### Option 1: PowerShell Script (Recommended)
1. Open PowerShell as Administrator
2. Navigate to your project folder: `cd "C:\Users\MY PC\OneDrive\Desktop\f"`
3. Run: `powershell -ExecutionPolicy Bypass -File fix-and-start.ps1`

### Option 2: Batch File (Alternative)
1. Open Command Prompt as Administrator
2. Navigate to your project folder: `cd /d "C:\Users\MY PC\OneDrive\Desktop\f"`
3. Run: `fix-and-start.bat`

## Manual Steps (If scripts don't work)

### Step 1: Verify Node.js Installation
```cmd
node --version
npm --version
```
If either command fails, install Node.js from https://nodejs.org/

### Step 2: Clear and Reinstall Dependencies
```cmd
cd /d "C:\Users\MY PC\OneDrive\Desktop\f"
npm cache clean --force
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Step 3: Clear Vite Cache
```cmd
rmdir /s /q node_modules\.vite
```

### Step 4: Check for Port Conflicts
```cmd
netstat -ano | findstr :5173
```
If any processes are using port 5173, kill them:
```cmd
taskkill /PID <process_id> /F
```

### Step 5: Test Build
```cmd
npm run build
```
Fix any syntax errors that appear.

### Step 6: Start Development Server
```cmd
npm run dev
```

## Configuration Updates Made

### 1. Updated vite.config.js
Added server configuration for better stability:
```javascript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    open: false,
    cors: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
})
```

### 2. Updated package.json scripts
Added additional scripts for better server management:
```json
{
  "scripts": {
    "dev": "vite --port 5173 --host",
    "start": "vite --port 5173 --host",
    "clean": "rm -rf dist node_modules/.vite"
  }
}
```

## Expected Result
After running the fix script or manual steps:
1. Dependencies will be freshly installed
2. Port conflicts will be resolved
3. Vite cache will be cleared
4. Development server will start on http://localhost:5173
5. Your React application will be accessible in the browser

## Troubleshooting

### If server still won't start:
1. Check Windows Firewall settings
2. Try a different port: `npm run dev -- --port 3000`
3. Run as Administrator
4. Disable antivirus temporarily
5. Check for proxy/VPN interference

### If build fails:
1. Check for syntax errors in React components
2. Verify all import statements use correct file extensions (.jsx)
3. Check ESLint configuration

### If browser shows connection errors:
1. Verify server is actually running (should show "Local: http://localhost:5173")
2. Try accessing via IP address instead of localhost
3. Clear browser cache
4. Try incognito/private browsing mode

## Files Created for Automation
- `fix-and-start.ps1` - PowerShell automation script
- `fix-and-start.bat` - Windows batch automation script
- `start-server.ps1` - Alternative PowerShell script
- `start-dev-server.bat` - Alternative batch script

Run any of these scripts to automatically fix and start your development server.