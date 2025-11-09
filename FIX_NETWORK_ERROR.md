# 🔧 Fix Network Error on Registration

## The Problem
Getting "Network error" when trying to register. This is usually caused by:
1. **CORS issues** - Backend not allowing frontend origin
2. **Wrong API URL** - Frontend not pointing to correct backend
3. **Backend not accessible** - Backend down or unreachable

## ✅ Quick Fixes

### Fix 1: Update Backend CORS (Most Common Issue)

1. **Go to Render Dashboard** → Your Backend Service → **Environment** tab
2. **Add/Update these environment variables:**
   - `CORS_ORIGIN` = `http://localhost:3000,https://hotelease-backend-usuo.onrender.com`
   - `FRONTEND_URL` = `http://localhost:3000`
3. **Save and redeploy** the backend

**For production (when you deploy frontend):**
- `CORS_ORIGIN` = `http://localhost:3000,https://your-frontend-url.com`

### Fix 2: Verify Frontend .env File

Make sure `frontend/.env` exists and has:
```env
VITE_API_URL=https://hotelease-backend-usuo.onrender.com/api
```

**Check if it exists:**
```bash
cd frontend
cat .env
# or on Windows:
type .env
```

**If missing, create it:**
```bash
# Windows PowerShell:
cd frontend
"VITE_API_URL=https://hotelease-backend-usuo.onrender.com/api" | Out-File -FilePath .env -Encoding utf8

# Mac/Linux:
cd frontend
echo "VITE_API_URL=https://hotelease-backend-usuo.onrender.com/api" > .env
```

### Fix 3: Restart Frontend Dev Server

After creating/updating `.env`:
```bash
# Stop server (Ctrl+C)
cd frontend
npm run dev
```

### Fix 4: Check Browser Console

1. **Open browser DevTools (F12)**
2. **Go to Console tab**
3. **Try to register again**
4. **Look for error messages** - they will show:
   - CORS errors
   - Network errors
   - API URL being used

## 🔍 Debugging Steps

### Step 1: Check What URL Frontend is Using

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to register
4. Look for the failed request
5. Check the **Request URL** - should be: `https://hotelease-backend-usuo.onrender.com/api/auth/register`

**If it shows `localhost:5000` instead:**
- `.env` file is missing or wrong
- Restart dev server after creating `.env`

### Step 2: Test Backend Directly

Open in browser:
```
https://hotelease-backend-usuo.onrender.com/api/health
```

Should return:
```json
{
  "status": "success",
  "message": "HotelEase API is running",
  "timestamp": "..."
}
```

**If this doesn't work:**
- Backend is down
- Check Render dashboard for errors

### Step 3: Check CORS Error in Console

If you see in browser console:
```
Access to XMLHttpRequest at 'https://...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**This means:** Backend CORS is not allowing your frontend origin.

**Fix:** Update `CORS_ORIGIN` in Render backend environment variables (see Fix 1)

### Step 4: Check Network Tab

In browser DevTools → Network tab:
- **Red request** = Failed
- **Click on it** to see:
  - Status code (404, 500, CORS error, etc.)
  - Response message
  - Request URL

## 📋 Complete Checklist

- [ ] Backend `CORS_ORIGIN` includes `http://localhost:3000`
- [ ] Frontend `.env` file exists with correct `VITE_API_URL`
- [ ] Frontend dev server restarted after creating `.env`
- [ ] Backend is running (test `/api/health`)
- [ ] Browser console checked for specific errors
- [ ] Network tab checked for failed requests

## 🎯 After Fixes

1. **Update CORS in Render** (Fix 1)
2. **Redeploy backend**
3. **Verify frontend .env** (Fix 2)
4. **Restart frontend** (Fix 3)
5. **Try registering again**
6. **Check browser console** for any remaining errors

## 🆘 Still Not Working?

### Check Backend Logs in Render:
1. Go to Render Dashboard → Your Backend Service → **Logs** tab
2. Try to register from frontend
3. Look for errors in logs:
   - CORS errors
   - Database errors
   - Validation errors

### Common Error Messages:

**"Network error"** = Usually CORS or wrong URL
**"CORS policy"** = Backend not allowing frontend origin
**"404 Not Found"** = Wrong API URL or endpoint doesn't exist
**"500 Internal Server Error"** = Backend error (check logs)

## ✅ Success Indicators

After fixes, you should see:
- ✅ No CORS errors in console
- ✅ Network requests show status 200 or 201
- ✅ Registration succeeds
- ✅ User is logged in

