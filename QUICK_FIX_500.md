# ⚡ Quick Fix: 500 Error on Registration

## Most Likely Cause: Missing JWT_SECRET

The backend needs `JWT_SECRET` to generate authentication tokens. If it's missing, registration will fail with a 500 error.

## ✅ Quick Fix (2 Steps)

### Step 1: Add JWT_SECRET to Render

1. **Go to Render Dashboard** → Your Backend Service → **Environment** tab
2. **Click "Add Environment Variable"**
3. **Add:**
   - **Key:** `JWT_SECRET`
   - **Value:** Any random string (e.g., `my-super-secret-jwt-key-12345` or generate one)
4. **Click "Save Changes"**

**Generate a secure JWT_SECRET:**
```powershell
# PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Step 2: Redeploy Backend

1. **Render Dashboard** → Your Backend Service → **Manual Deploy**
2. **Click "Deploy latest commit"**
3. **Wait for deployment** (2-3 minutes)

## ✅ Test Again

After redeploying, try registering again. The error should be fixed.

## 🔍 If Still Getting 500 Error

### Check Backend Logs

1. **Render Dashboard** → Your Backend Service → **Logs** tab
2. **Try to register** from frontend
3. **Look for error messages** - they will now show:
   - "JWT_SECRET is not set" → Add JWT_SECRET
   - "Database table does not exist" → Initialize database schema
   - Other specific errors

### Check Database

The `users` table must exist. If you see "table does not exist" error:

1. **Go to your PostgreSQL database** in Render
2. **Connect** using Render Shell or External Database URL
3. **Run the schema** from `backend/db_script/hotelease_database.sql`

## 📋 Required Environment Variables

Make sure these are all set:
- ✅ `DATABASE_URL` - Already set
- ✅ `JWT_SECRET` - **ADD THIS NOW** (most likely missing)
- ✅ `NODE_ENV` = `production`
- ✅ `CORS_ORIGIN` = `http://localhost:3000`
- ✅ `FRONTEND_URL` = `http://localhost:3000`

## 🎯 Expected Result

After adding JWT_SECRET and redeploying:
- ✅ Registration should work
- ✅ User account created
- ✅ JWT token generated
- ✅ Success response returned

