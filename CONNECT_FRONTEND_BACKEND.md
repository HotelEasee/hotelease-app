# 🔗 Connect Frontend to Backend - Complete Guide

## ✅ What's Already Done

1. ✅ Backend is deployed and running at: `https://hotelease-backend-usuo.onrender.com`
2. ✅ Database is connected
3. ✅ Frontend code is configured to use `VITE_API_URL` environment variable

## 🚀 What You Need to Do

### Step 1: Create Frontend .env File

Create a `.env` file in the `frontend` directory:

**File:** `frontend/.env`
```env
VITE_API_URL=https://hotelease-backend-usuo.onrender.com/api
```

**Quick Command (PowerShell):**
```powershell
cd frontend
"VITE_API_URL=https://hotelease-backend-usuo.onrender.com/api" | Out-File -FilePath .env -Encoding utf8
```

**Quick Command (Bash/Mac):**
```bash
cd frontend
echo "VITE_API_URL=https://hotelease-backend-usuo.onrender.com/api" > .env
```

### Step 2: Update Backend CORS (If Needed)

If you get CORS errors, update your backend environment variables in Render:

1. Go to Render Dashboard → Your Backend Service → Environment
2. Update or add:
   - `CORS_ORIGIN` = `http://localhost:3000` (for local dev)
   - `FRONTEND_URL` = `http://localhost:3000` (for local dev)
3. Redeploy backend

**For production frontend:**
- `CORS_ORIGIN` = Your deployed frontend URL (e.g., `https://your-frontend.vercel.app`)
- `FRONTEND_URL` = Same as above

### Step 3: Restart Frontend Dev Server

```bash
cd frontend
npm run dev
```

## ✅ Verify Connection

1. **Open browser:** `http://localhost:3000`
2. **Open DevTools (F12)** → Network tab
3. **Try to load hotels or login**
4. **Check requests:**
   - Should see: `hotelease-backend-usuo.onrender.com/api/...`
   - Status should be 200 (not CORS errors)

## 🎯 Testing

### Test 1: Health Check
Open in browser:
```
https://hotelease-backend-usuo.onrender.com/api/health
```
Should return JSON with status "success"

### Test 2: Frontend API Call
1. Open frontend: `http://localhost:3000`
2. Open browser console
3. Try to load hotels
4. Check Network tab - should see successful API calls

## 📋 Complete Checklist

- [ ] Created `frontend/.env` file with `VITE_API_URL`
- [ ] Restarted frontend dev server
- [ ] Backend CORS configured (if needed)
- [ ] Tested health endpoint in browser
- [ ] Tested frontend → backend connection
- [ ] No CORS errors in console
- [ ] API calls return data successfully

## 🐛 Troubleshooting

### CORS Error
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Fix:**
1. Go to Render → Backend Service → Environment
2. Add/Update:
   - `CORS_ORIGIN` = `http://localhost:3000`
   - `FRONTEND_URL` = `http://localhost:3000`
3. Redeploy backend

### API Calls Still Going to Localhost
**Fix:**
- Make sure `.env` file is in `frontend` directory (not root)
- Restart dev server after creating `.env`
- Check variable name is exactly `VITE_API_URL` (Vite requires `VITE_` prefix)

### 404 Not Found
**Fix:**
- Verify backend URL: `https://hotelease-backend-usuo.onrender.com/api/health`
- Check backend is running in Render dashboard
- Check backend logs for errors

### Network Error
**Fix:**
- Check backend is deployed and running
- Verify backend URL is accessible
- Check backend environment variables are set correctly

## 🎉 Success!

Once connected:
- ✅ Frontend makes API calls to Render backend
- ✅ Authentication works
- ✅ Hotels, bookings, etc. load from backend
- ✅ All features work end-to-end

## 📚 Additional Resources

- See `frontend/QUICK_CONNECT.md` for quick reference
- See `frontend/FRONTEND_BACKEND_CONNECTION.md` for detailed guide

