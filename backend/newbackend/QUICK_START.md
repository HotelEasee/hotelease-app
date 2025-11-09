# 🚀 Quick Start Guide

## Starting the Server

**Important:** Always run commands from the `backend/newbackend` directory!

### Correct Directory Structure:
```
HotelEase/
└── backend/
    └── newbackend/     ← YOU NEED TO BE HERE!
        ├── package.json
        ├── src/
        └── .env
```

### Commands to Start Server:

**Option 1: Development Mode (with auto-reload)**
```powershell
cd backend\newbackend
npm run dev
```

**Option 2: Production Mode**
```powershell
cd backend\newbackend
npm start
```

### After Starting, Test the API:

**In a new terminal/PowerShell window:**
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Get all hotels
Invoke-RestMethod -Uri "http://localhost:5000/api/hotels"

# Or use the test script
.\test-api.ps1
```

### Quick Test in Browser:
- Open: `http://localhost:5000/api/health`
- Open: `http://localhost:5000/api/hotels`

---

## ✅ Expected Output When Server Starts:

```
✅ Connected to PostgreSQL database
🚀 Server is running on port 5000
📍 Health check: http://localhost:5000/api/health
```

---

## ❌ Common Errors:

**Error: "Could not read package.json"**
- **Solution:** Make sure you're in `backend/newbackend` directory, not just `backend`

**Error: "Port 5000 already in use"**
- **Solution:** Another process is using port 5000. Either:
  - Stop that process
  - Change PORT in `.env` file

**Error: "Database connection error"**
- **Solution:** Check your `.env` file has correct Render database credentials

---

## 📝 Current Working Directory Should Be:
```
C:\Users\PHATHUTSHED20\Documents\mlab\HotelEase\backend\newbackend
```

Check your current directory:
```powershell
pwd  # or Get-Location
```

If you're in the wrong directory, navigate:
```powershell
cd C:\Users\PHATHUTSHED20\Documents\mlab\HotelEase\backend\newbackend
```

