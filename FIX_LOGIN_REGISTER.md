# 🔧 Fix: Can't Sign In or Register

## Most Common Causes

### 1. Backend is Down or Not Accessible ⚠️ (Most Likely)

**Check:**
1. Go to: `https://hotelease-backend-usuo.onrender.com/api/health`
2. Should return JSON with "status": "success"
3. If it doesn't load → Backend is down

**Fix:**
1. Go to Render Dashboard
2. Check backend service status
3. If paused/stopped, restart it
4. Check logs for errors

### 2. Missing JWT_SECRET (Causes 500 Errors)

**Symptoms:** "Request failed with status code 500"

**Fix:**
1. Render Dashboard → Backend Service → Environment
2. Add: `JWT_SECRET` = `any-random-secret-string`
3. Save and redeploy backend

### 3. CORS Not Configured

**Symptoms:** "CORS policy" error in console

**Fix:**
1. Render Dashboard → Backend Service → Environment
2. Add/Update:
   - `CORS_ORIGIN` = `http://localhost:3000`
   - `FRONTEND_URL` = `http://localhost:3000`
3. Save and redeploy backend

### 4. Wrong API URL

**Check:**
1. Verify `frontend/.env` file exists
2. Should have: `VITE_API_URL=https://hotelease-backend-usuo.onrender.com/api`
3. Restart frontend dev server after creating/updating .env

## Quick Diagnostic Steps

### Step 1: Check Browser Console
1. Open DevTools (F12) → Console tab
2. Try to register/login
3. **Copy the exact error message**

### Step 2: Check Network Tab
1. DevTools → Network tab
2. Try to register/login
3. Find the request to `/api/auth/register` or `/api/auth/login`
4. Click on it → Check:
   - **Status code** (200, 400, 500, etc.)
   - **Response** tab (error message)
   - **Headers** tab (check URL)

### Step 3: Test Backend Directly
Open in browser:
```
https://hotelease-backend-usuo.onrender.com/api/health
```

**Expected:** JSON response
**If fails:** Backend is down

### Step 4: Check Backend Logs
1. Render Dashboard → Backend Service → Logs
2. Try to register/login
3. Look for errors in logs

## Specific Error Fixes

### Error: "Network error"
**Cause:** Backend not reachable
**Fix:**
- Check backend is running in Render
- Verify backend URL is correct
- Check internet connection

### Error: "CORS policy"
**Cause:** Backend not allowing frontend origin
**Fix:**
- Add `CORS_ORIGIN=http://localhost:3000` to backend env vars
- Redeploy backend

### Error: "500 Internal Server Error"
**Cause:** Server error (usually missing JWT_SECRET)
**Fix:**
- Add `JWT_SECRET` to backend environment variables
- Redeploy backend

### Error: "400 Bad Request"
**Cause:** Validation error
**Fix:**
- Check error message - it tells you what's wrong
- Make sure email is valid
- Make sure password is at least 6 characters

### Error: "User already exists"
**Cause:** Email already registered
**Fix:**
- Use different email
- Or try to login instead

## Complete Checklist

- [ ] Backend is running (test `/api/health`)
- [ ] Backend has `JWT_SECRET` environment variable
- [ ] Backend has `CORS_ORIGIN` set to `http://localhost:3000`
- [ ] Frontend `.env` file exists with correct `VITE_API_URL`
- [ ] Frontend dev server restarted after creating .env
- [ ] Browser console checked for specific errors
- [ ] Network tab checked for failed requests
- [ ] Backend logs checked for errors

## Test Registration Manually

Open browser console (F12) and run:
```javascript
fetch('https://hotelease-backend-usuo.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    first_name: 'Test',
    last_name: 'User'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Success:', data);
})
.catch(err => {
  console.error('❌ Error:', err);
});
```

This will show you the exact error.

## Most Likely Issue

Based on the connection test failing, **your backend might be down or sleeping** (Render free tier).

**Quick Fix:**
1. Go to Render Dashboard
2. Check if backend service is "Available"
3. If "Paused" or "Error", restart it
4. Free tier services sleep after inactivity - first request may take 30-60 seconds

## Next Steps

1. **Check backend status** in Render dashboard
2. **Test backend health** endpoint in browser
3. **Check browser console** for specific errors
4. **Share the error message** you see for more specific help

