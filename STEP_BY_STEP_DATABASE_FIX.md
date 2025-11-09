# 🚨 STEP-BY-STEP: Fix Database Connection on Render

## Current Problem
Your logs show: `❌ Database connection error: AggregateError [ECONNREFUSED]`

This means **DATABASE_URL is not set** in your Render environment variables.

---

## ✅ SOLUTION: Follow These Exact Steps

### STEP 1: Create PostgreSQL Database in Render

1. **Go to Render Dashboard:** https://dashboard.render.com
2. Click the **"New +"** button (top right)
3. Select **"PostgreSQL"**
4. Fill in the form:
   - **Name:** `hotelease-db` (or any name)
   - **Database:** `hotelease` (or any name)
   - **User:** Leave default (auto-generated)
   - **Region:** Choose closest to your web service
   - **PostgreSQL Version:** Latest (14 or 15)
   - **Plan:** Free (or paid if needed)
5. Click **"Create Database"**
6. **Wait 1-2 minutes** for it to be created

---

### STEP 2: Copy the Database Connection String

1. Once created, **click on your database** name
2. Go to the **"Connections"** tab
3. You'll see two URLs:
   - **Internal Database URL** ← **USE THIS ONE**
   - External Database URL (ignore this)
4. **Copy the Internal Database URL**
   - It looks like: `postgresql://user:password@dpg-xxxxx-a/hotelease`
   - Or: `postgres://user:password@dpg-xxxxx-a/hotelease`

---

### STEP 3: Add DATABASE_URL to Your Web Service

1. **Go back to your web service** (hotelease-backend)
2. Click on **"Environment"** tab (in the left sidebar)
3. Scroll down to see existing environment variables
4. Click **"Add Environment Variable"** button
5. Fill in:
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the Internal Database URL you copied in Step 2
   - **Important:** Make sure there are NO spaces or quotes around the value
6. Click **"Save Changes"**

---

### STEP 4: Add Other Required Environment Variables

While you're in the Environment tab, also add these (if not already present):

| Key | Value | Required? |
|-----|-------|-----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `JWT_SECRET` | `your-random-secret-key-here` | ✅ Yes (generate a random string) |
| `CORS_ORIGIN` | `https://hotelease-backend-usuo.onrender.com` | ✅ Yes |
| `FRONTEND_URL` | `https://hotelease-backend-usuo.onrender.com` | ✅ Yes |
| `STRIPE_SECRET_KEY` | `sk_test_...` | ⚠️ Only if using Stripe |

**To generate JWT_SECRET:**
- Use any random string generator
- Or run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

### STEP 5: Redeploy Your Service

1. Go to **"Manual Deploy"** tab (in left sidebar)
2. Click **"Deploy latest commit"**
3. **Wait for deployment to complete** (2-5 minutes)
4. Go to **"Logs"** tab
5. Look for these messages:
   - ✅ `🔌 Using DATABASE_URL for database connection`
   - ✅ `✅ Database connected at: [timestamp]`
   - ✅ `🚀 Server is running on port 10000`

---

### STEP 6: Initialize Database Schema

After the connection works, you need to create your database tables:

1. **Option A: Using Render Shell** (Easiest)
   - Go to your database → **"Connect"** tab
   - Copy the **psql** command
   - Or use **Render Shell** (if available)
   - Connect and run your SQL file:
     ```sql
     \i /path/to/backend/db_script/hotelease_database.sql
     ```
   - Or copy-paste the SQL from `backend/db_script/hotelease_database.sql`

2. **Option B: Using pgAdmin** (If you prefer GUI)
   - Use the **External Database URL** from Step 2
   - Connect in pgAdmin
   - Run the SQL file

---

## 🔍 How to Verify It's Working

### Check 1: Look at Logs
After redeploy, your logs should show:
```
🔌 Using DATABASE_URL for database connection
✅ Database connected at: 2024-11-07T...
🚀 Server is running on port 10000
```

**NOT:**
```
⚠️  DATABASE_URL not found, using individual DB_* variables
❌ Database connection error
```

### Check 2: Test the API
Visit: `https://hotelease-backend-usuo.onrender.com/api/health`

You should get:
```json
{
  "status": "success",
  "message": "HotelEase API is running",
  "timestamp": "..."
}
```

**NOT:** A database error.

---

## ❌ Common Mistakes

1. **Using External Database URL instead of Internal**
   - ✅ Use: Internal Database URL
   - ❌ Don't use: External Database URL

2. **Adding quotes around DATABASE_URL value**
   - ✅ Correct: `postgresql://user:pass@host/db`
   - ❌ Wrong: `"postgresql://user:pass@host/db"`

3. **Not saving changes before redeploying**
   - Make sure to click "Save Changes" after adding environment variables

4. **Forgetting to redeploy**
   - Environment variables only take effect after redeploy

5. **Database not created yet**
   - Make sure the database shows "Available" status (not "Creating" or "Error")

---

## 🆘 Still Not Working?

### Check Your Logs
After redeploy, check the logs. You should see:
- `🔌 Using DATABASE_URL` = Good! DATABASE_URL is set
- `⚠️  DATABASE_URL not found` = DATABASE_URL is NOT set (go back to Step 3)

### Verify Environment Variables
1. Go to your service → Environment tab
2. Scroll down and verify `DATABASE_URL` is listed
3. Click on it to see the value (it should start with `postgresql://` or `postgres://`)

### Test Database Connection
1. Go to your database dashboard
2. Check status is "Available"
3. Try connecting using the External URL in pgAdmin to verify the database works

### Wait for Database to Wake Up
- Render free tier databases sleep after inactivity
- First connection may take 30-60 seconds
- Be patient and check logs again after 1 minute

---

## ✅ Success Checklist

- [ ] PostgreSQL database created in Render
- [ ] Internal Database URL copied
- [ ] DATABASE_URL added to web service environment variables
- [ ] Other required env vars added (NODE_ENV, JWT_SECRET, etc.)
- [ ] Changes saved
- [ ] Service redeployed
- [ ] Logs show "🔌 Using DATABASE_URL"
- [ ] Logs show "✅ Database connected"
- [ ] `/api/health` endpoint works
- [ ] Database schema initialized

Once all checked, your database connection should be working! 🎉

