# 🔧 Fix: 500 Error When Logging In

## Most Likely Cause: Missing JWT_SECRET

The 500 error is almost certainly because `JWT_SECRET` is not set in your backend environment variables.

## ✅ Quick Fix

### Step 1: Add JWT_SECRET to Render

1. **Go to Render Dashboard** → Your Backend Service → **Environment** tab
2. **Click "Add Environment Variable"**
3. **Add:**
   - **Key:** `JWT_SECRET`
   - **Value:** Any random string (e.g., `my-super-secret-jwt-key-change-this`)
4. **Click "Save Changes"**

**Generate a secure JWT_SECRET:**
```powershell
# PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use any random string generator.

### Step 2: Redeploy Backend

1. **Render Dashboard** → Your Backend Service → **Manual Deploy**
2. **Click "Deploy latest commit"**
3. **Wait for deployment** (2-3 minutes)

### Step 3: Try Login Again

After redeploying, try logging in again. The error should be fixed.

## 🔍 Verify the Fix

### Check Backend Logs

After redeploying, when you try to login, check the logs:

1. **Render Dashboard** → Backend Service → **Logs** tab
2. **Try to login**
3. **Look for:**
   - ✅ `✅ Database connected` = Good
   - ✅ No JWT_SECRET errors = Good
   - ❌ `JWT_SECRET is not set` = Still missing, check environment variables

### Check Error Message

The improved error handling will now show:
- **"Server configuration error: JWT_SECRET is not set"** → Add JWT_SECRET
- **"Database table does not exist"** → Initialize database schema
- **"Database connection error"** → Check DATABASE_URL

## Other Possible Causes

### 1. Database Table Doesn't Exist
**Error:** "Database table does not exist"

**Fix:**
- Run database schema initialization script
- Or create users table manually

### 2. Database Connection Error
**Error:** "Database connection error"

**Fix:**
- Check `DATABASE_URL` is set correctly
- Verify database is running in Render
- Check database logs

### 3. Missing Database Schema
**Error:** Column errors or table errors

**Fix:**
- Initialize database schema from `backend/db_script/hotelease_database.sql`

## Required Environment Variables

Make sure these are ALL set in Render backend:

- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - **MUST BE SET** (this is likely missing)
- ✅ `NODE_ENV` = `production`
- ✅ `CORS_ORIGIN` = `http://localhost:3000`
- ✅ `FRONTEND_URL` = `http://localhost:3000`

## After Adding JWT_SECRET

1. **Save environment variable** in Render
2. **Redeploy backend** (required for env vars to take effect)
3. **Wait for deployment** to complete
4. **Try login again**

## Expected Result

After fixing:
- ✅ Login should work
- ✅ You'll receive a JWT token
- ✅ You'll be redirected to `/hotels` or `/admin/dashboard`
- ✅ No 500 errors

## Still Getting 500 Error?

1. **Check backend logs** - They now show detailed error information
2. **Verify JWT_SECRET** is set and backend was redeployed
3. **Check error message** - It will tell you exactly what's wrong
4. **Verify database** - Make sure DATABASE_URL is correct

The improved error handling will show you exactly what's causing the 500 error!

