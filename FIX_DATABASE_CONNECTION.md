# 🚨 Quick Fix: Database Connection Error

## ❌ The Error
```
❌ Database connection error: AggregateError [ECONNREFUSED]
```

## ✅ The Fix (3 Steps)

### 1. Create PostgreSQL Database in Render
- Dashboard → **New +** → **PostgreSQL**
- Name it (e.g., `hotelease-db`)
- Wait for it to be created

### 2. Add DATABASE_URL to Your Web Service
- Go to your **web service** (hotelease-backend)
- **Environment** tab → **Add Environment Variable**
- **Key:** `DATABASE_URL`
- **Value:** Copy the **Internal Database URL** from your database's Connections tab
- **Save**

### 3. Redeploy
- **Manual Deploy** → **Deploy latest commit**
- Wait for deployment
- Check logs for: `✅ Connected to PostgreSQL database`

## 📝 What I Fixed

✅ Updated `backend/newbackend/src/config/database.js` to support `DATABASE_URL` (which Render provides automatically)

✅ The code now:
- Uses `DATABASE_URL` if available (Render)
- Falls back to individual DB_* variables (local dev)
- Has increased timeout for Render's sleeping databases (30 seconds)

## ⚠️ Important

- **pgAdmin is NOT needed** - it's just a GUI tool
- **Use Internal Database URL** (not External) for Render services
- **Free tier databases may take 30-60 seconds** to wake up on first connection
- **You still need to initialize the database schema** (run your SQL file)

## 📚 Full Guide

See `RENDER_DATABASE_SETUP.md` for detailed instructions.

