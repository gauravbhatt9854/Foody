# 🚀 Quick Start Guide for Foody

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Internet connection (for MongoDB Atlas)

## Option 1: Using Startup Scripts (Recommended)

### Windows Command Prompt
```cmd
start-app.bat
```

### Windows PowerShell
```powershell
.\start-app.ps1
```

## Option 2: Manual Start

### Step 1: Install Dependencies
```bash
# Install root dependencies
npm install

# Or install all dependencies at once
npm run install-all
```

### Step 2: Start Backend Server
Open a terminal and run:
```bash
cd backend
npm run dev
```
Backend will start at: http://localhost:5000

### Step 3: Start Frontend Server
Open another terminal and run:
```bash
cd frontend
npm start
```
Frontend will start at: http://localhost:3000

## Option 3: Using Root Scripts
```bash
# Install all dependencies
npm run install-all

# Start both servers concurrently
npm run dev
```

## Option 4: Using Concurrently (If installed)
```bash
# Install concurrently
npm install -g concurrently

# Start both servers
npm start
```

## Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Default Login Credentials
Create an account through the registration page or use these test credentials if available:
- **Student**: 
  - Email: student@college.edu
  - Password: password123
- **Staff**: 
  - Email: staff@college.edu
  - Password: password123
- **Admin**: 
  - Email: admin@college.edu
  - Password: password123

## Troubleshooting

### Common Issues:

1. **Port already in use**
   - Kill process on port 3000: `npx kill-port 3000`
   - Kill process on port 5000: `npx kill-port 5000`

2. **MongoDB connection issues**
   - Check internet connection
   - Verify MongoDB Atlas credentials in `backend/.env`

3. **Dependencies issues**
   - Delete `node_modules` folders and `package-lock.json`
   - Run `npm install` in both frontend and backend directories

4. **Environment variables**
   - Ensure `backend/.env` file exists with correct MongoDB URI
   - Check if all required environment variables are set

### Force Clean Install
```bash
# Clean backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Clean frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

## Features Available
- ✅ User Authentication (Register/Login)
- ✅ Zomato-like Modern UI
- ✅ Menu Browsing with Filters
- ✅ Shopping Cart
- ✅ Order Placement
- ✅ Order Tracking
- ✅ Admin Dashboard
- ✅ Staff Management
- ✅ Real-time Updates
- ✅ Mobile Responsive Design

## Need Help?
If you encounter any issues:
1. Check the terminal outputs for error messages
2. Ensure all dependencies are installed
3. Verify MongoDB Atlas connection
4. Check if ports 3000 and 5000 are available

Happy coding! 🍕✨