# 🔌 Render Database Connection Setup

## The Problem
You're seeing this error:
```
❌ Database connection error: AggregateError [ECONNREFUSED]
```

**This is NOT because of pgAdmin.** pgAdmin is just a GUI tool - it has nothing to do with your application's database connection.

## The Solution

### Step 1: Create a PostgreSQL Database in Render

1. Go to your **Render Dashboard**
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - **Name:** `hotelease-db` (or any name you prefer)
   - **Database:** `hotelease` (or your preferred database name)
   - **User:** Will be auto-generated
   - **Region:** Choose closest to your web service
   - **Plan:** Free (or paid if you need it)
4. Click **Create Database**
5. **Wait for it to be created** (takes 1-2 minutes)

### Step 2: Get Your Database Connection String

1. Once created, click on your database
2. Go to **Connections** tab
3. You'll see **Internal Database URL** and **External Database URL**
4. **Copy the Internal Database URL** (it looks like):
   ```
   postgresql://user:password@hostname:5432/database_name
   ```

### Step 3: Add Environment Variable to Your Web Service

1. Go to your **Web Service** (hotelease-backend)
2. Go to **Environment** tab
3. Click **Add Environment Variable**
4. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the Internal Database URL you copied
5. Click **Save Changes**

### Step 4: Add Other Required Environment Variables

While you're in the Environment tab, also add these:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Or let Render auto-assign |
| `JWT_SECRET` | `your-secret-key-here` | Generate a random string |
| `JWT_EXPIRE` | `7d` | Optional |
| `CORS_ORIGIN` | `https://hotelease-backend-usuo.onrender.com` | Your service URL |
| `FRONTEND_URL` | `https://hotelease-backend-usuo.onrender.com` | Same as above |
| `STRIPE_SECRET_KEY` | `sk_test_...` | If using Stripe |

### Step 5: Initialize Your Database Schema

After the database is connected, you need to initialize the schema:

1. **Option A: Using Render's Shell** (Recommended)
   - Go to your database → **Connect** tab
   - Use **psql** connection string
   - Or use **Render Shell** to connect
   - Run your SQL schema file: `backend/db_script/hotelease_database.sql`

2. **Option B: Using pgAdmin** (If you prefer GUI)
   - Connect to your Render database using the External Database URL
   - Run the SQL schema file

3. **Option C: Using a migration script**
   - Create a script that runs on first deploy
   - Or manually run SQL commands

### Step 6: Redeploy Your Service

1. After adding environment variables, go to **Manual Deploy**
2. Click **Deploy latest commit**
3. Wait for deployment to complete
4. Check the logs - you should see: `✅ Connected to PostgreSQL database`

## ⚠️ Important Notes

### Render Free Tier Database Sleep
- **Free tier databases spin down after 90 days of inactivity**
- **First connection after sleep can take 30-60 seconds**
- The code now has a 30-second timeout to handle this
- If you see connection errors, wait a minute and try again

### Internal vs External Database URL
- **Use Internal Database URL** for web services on Render (faster, free)
- **Use External Database URL** only for local development or external tools
- Internal URL format: `postgresql://user:password@dpg-xxxxx-a/hotelease`
- External URL format: `postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/hotelease`

### SSL Connection
- Render databases **require SSL**
- The code is already configured to use SSL with `rejectUnauthorized: false`
- This is safe for Render's managed databases

## 🔍 Troubleshooting

### Still Getting Connection Errors?

1. **Check Environment Variables:**
   - Go to your service → Environment tab
   - Verify `DATABASE_URL` is set correctly
   - Make sure there are no extra spaces or quotes

2. **Check Database Status:**
   - Go to your database dashboard
   - Make sure it shows "Available" (not "Paused" or "Error")

3. **Check Service Logs:**
   - Go to your service → Logs tab
   - Look for connection error messages
   - First connection after sleep may take 30-60 seconds

4. **Verify Database Schema:**
   - Make sure you've run the SQL schema file
   - Check that tables exist in your database

5. **Test Connection:**
   - Use Render Shell to test connection
   - Or use the External Database URL in pgAdmin

## ✅ Success Indicators

You'll know it's working when you see in the logs:
```
✅ Connected to PostgreSQL database
✅ Database connected at: [timestamp]
🚀 Server is running on port 10000
```

And when you visit: `https://hotelease-backend-usuo.onrender.com/api/health`
You should get a successful response (not a database error).

