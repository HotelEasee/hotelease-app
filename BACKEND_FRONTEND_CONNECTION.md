# 🔗 Backend-Frontend Connection Guide

## ✅ Connection Status

The backend and frontend are configured to communicate with each other. Here's what's set up:

### Backend Configuration

**CORS Settings** (`backend/newbackend/src/index.js`):
- ✅ CORS enabled
- ✅ Allowed origin: `http://localhost:5173` (frontend)
- ✅ Credentials enabled
- ✅ All HTTP methods allowed
- ✅ Authorization header allowed

### Frontend Configuration

**API Base URL** (`frontend/src/services/api.ts`):
- ✅ Base URL: `http://localhost:5000/api` (from `.env` or default)
- ✅ Authorization header automatically added
- ✅ Token stored in localStorage

**Frontend `.env` file**:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Testing the Connection

### Step 1: Start Backend

```powershell
cd backend/newbackend
npm run dev
```

**Expected Output:**
```
✅ Database connected at: [timestamp]
🚀 Server is running on port 5000
📍 Health check: http://localhost:5000/api/health
```

### Step 2: Start Frontend

```powershell
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v4.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### Step 3: Test Connection in Browser

1. Open browser: `http://localhost:5173`
2. Open Developer Tools (F12)
3. Go to Network tab
4. Try to:
   - Load hotels
   - Register/Login
   - View hotel details

5. Check Console tab for errors:
   - ✅ Should see successful API calls
   - ❌ If CORS errors, check backend CORS config

## 🔍 Verification Checklist

### Backend Side
- [ ] Backend running on port 5000
- [ ] CORS configured for `http://localhost:5173`
- [ ] Health endpoint accessible: `http://localhost:5000/api/health`
- [ ] Database connected

### Frontend Side
- [ ] Frontend running on port 5173
- [ ] `.env` file has `VITE_API_URL=http://localhost:5000/api`
- [ ] No CORS errors in browser console
- [ ] API calls visible in Network tab

### Connection Test
```powershell
# Test backend health
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Test from browser console (open DevTools on frontend page)
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)
```

## 🐛 Troubleshooting Connection Issues

### Issue 1: CORS Errors in Browser

**Error**: `Access-Control-Allow-Origin` header missing

**Solution**:
1. Check `backend/newbackend/src/index.js` has CORS configured
2. Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
3. Restart backend server

### Issue 2: Frontend Can't Reach Backend

**Error**: `Failed to fetch` or `Network Error`

**Solutions**:
1. Verify backend is running: `http://localhost:5000/api/health`
2. Check `VITE_API_URL` in frontend `.env`
3. Check firewall isn't blocking port 5000
4. Try accessing backend directly in browser

### Issue 3: 401 Unauthorized Errors

**Error**: Authentication required

**Solution**:
1. Make sure user is logged in
2. Check token is in localStorage
3. Verify token is being sent in Authorization header

### Issue 4: Backend Not Starting

**Common Causes**:
- Database not connected (check `.env` DB credentials)
- Port 5000 already in use
- Missing dependencies (`npm install`)

## 📊 Connection Test Results

Run this in browser console (on frontend page):

```javascript
// Test 1: Health Check
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Health Check:', data))
  .catch(err => console.error('❌ Health Check Failed:', err));

// Test 2: Get Hotels (no auth required)
fetch('http://localhost:5000/api/hotels')
  .then(r => r.json())
  .then(data => console.log('✅ Hotels API:', data))
  .catch(err => console.error('❌ Hotels API Failed:', err));

// Test 3: CORS Preflight
fetch('http://localhost:5000/api/health', {
  method: 'OPTIONS',
  headers: { 'Origin': 'http://localhost:5173' }
})
  .then(r => console.log('✅ CORS Preflight:', r.headers.get('access-control-allow-origin')))
  .catch(err => console.error('❌ CORS Failed:', err));
```

## ✅ Success Criteria

Connection is working if:
- ✅ Backend health endpoint responds
- ✅ Frontend loads without CORS errors
- ✅ API calls succeed in Network tab
- ✅ Data appears on frontend pages
- ✅ Authentication flow works
- ✅ No console errors related to API

## 🔧 Quick Fixes

### If Backend CORS Not Working:
```javascript
// In backend/newbackend/src/index.js
// Make sure CORS includes:
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
```

### If Frontend API URL Wrong:
```env
# In frontend/.env
VITE_API_URL=http://localhost:5000/api
```

Then restart frontend server.

---

**The connection should work automatically when both servers are running!** 🚀

