# 🔧 Fix 500 Error on Registration

## The Problem
Getting "Request failed with status code 500" when registering. This is a server-side error.

## Most Common Causes

### 1. Missing JWT_SECRET (Most Likely)
The backend needs `JWT_SECRET` to generate authentication tokens.

**Fix:**
1. Go to Render Dashboard → Your Backend Service → **Environment** tab
2. Add environment variable:
   - **Key:** `JWT_SECRET`
   - **Value:** Generate a random secret (see below)
3. **Save and redeploy** backend

**Generate JWT_SECRET:**
```bash
# In PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use any random string generator
# Or use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Database Table Doesn't Exist
The `users` table might not be initialized.

**Fix:**
1. Go to your PostgreSQL database in Render
2. Connect using Render Shell or External Database URL
3. Run the SQL schema from: `backend/db_script/hotelease_database.sql`
4. Or at minimum, create the users table:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Check Backend Logs
The improved error handling will show specific errors:

1. Go to Render Dashboard → Your Backend Service → **Logs** tab
2. Try to register again
3. Look for error messages like:
   - "JWT_SECRET is not set"
   - "Database table does not exist"
   - "relation 'users' does not exist"
   - SQL error details

## Quick Fix Checklist

- [ ] **JWT_SECRET** is set in Render environment variables
- [ ] **Database schema is initialized** (users table exists)
- [ ] **Backend is redeployed** after adding JWT_SECRET
- [ ] **Backend logs checked** for specific error messages

## Step-by-Step Fix

### Step 1: Add JWT_SECRET
1. Render Dashboard → Backend Service → Environment
2. Add: `JWT_SECRET` = `your-random-secret-here`
3. Save

### Step 2: Initialize Database
1. Render Dashboard → Your PostgreSQL Database
2. Go to **Connect** tab
3. Use **Render Shell** or **External Database URL**
4. Connect and run: `backend/db_script/hotelease_database.sql`

### Step 3: Redeploy Backend
1. Render Dashboard → Backend Service → Manual Deploy
2. Deploy latest commit
3. Wait for deployment

### Step 4: Test Again
1. Try registering from frontend
2. Check backend logs for any errors
3. Check browser console for detailed error messages

## Expected Backend Logs

After fixes, when registering successfully, you should see:
```
Register error: (none - success)
✅ User registered successfully
```

If there's still an error, logs will show:
```
Register error: [specific error message]
Error details: { message, code, detail, constraint }
```

## 🆘 Still Getting 500 Error?

1. **Check backend logs** - They now show detailed error information
2. **Verify JWT_SECRET** is set and backend was redeployed
3. **Verify database** - Connect and check if `users` table exists
4. **Test database connection** - Backend should show "✅ Database connected"
5. **Check database schema** - Make sure it matches the code expectations

## Required Environment Variables

Make sure these are set in Render:
- ✅ `DATABASE_URL` - Already set
- ✅ `JWT_SECRET` - **MUST BE SET** (this is likely the issue)
- ✅ `NODE_ENV` = `production`
- ✅ `CORS_ORIGIN` = `http://localhost:3000`
- ✅ `FRONTEND_URL` = `http://localhost:3000`

