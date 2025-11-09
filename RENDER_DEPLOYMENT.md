# Render Deployment Guide

## Problem
Render is looking for `package.json` in `/opt/render/project/src/package.json`, but your project structure has:
- Frontend: `frontend/package.json`
- Backend: `backend/newbackend/package.json`

## Solution Options

### Option 1: Deploy Backend Only (Recommended)
The backend can serve the frontend build. This is the simplest approach.

**In Render Dashboard:**
1. Go to your service settings
2. Set **Root Directory** to: `backend/newbackend`
3. Set **Build Command** to: 
   ```bash
   cd ../../frontend && npm install && npm run build && cd ../../backend/newbackend && npm install
   ```
4. Set **Start Command** to: `npm start`
5. Make sure **Environment** is set to `Node`

**Environment Variables needed:**
- `NODE_ENV=production`
- `PORT=5000` (or let Render assign it)
- `DATABASE_URL` (your PostgreSQL connection string)
- `JWT_SECRET` (your JWT secret)
- `CORS_ORIGIN` (your frontend URL)
- `FRONTEND_URL` (your frontend URL)
- `STRIPE_SECRET_KEY` (if using Stripe)

### Option 2: Deploy Frontend Only
If you only want to deploy the frontend separately.

**In Render Dashboard:**
1. Set **Root Directory** to: `frontend`
2. Set **Build Command** to: `npm install && npm run build`
3. Set **Start Command** to: `npm run preview`
4. Make sure **Environment** is set to `Node`

### Option 3: Use render.yaml (Advanced)
If you want to deploy both services separately, use the `render.yaml` file in the root directory.

1. In Render Dashboard, connect your repository
2. Render will automatically detect `render.yaml` and create services accordingly
3. Make sure to add all required environment variables in the Render dashboard

## Quick Fix for Current Error

If you're getting the error right now:

1. **Go to your Render service dashboard**
2. **Settings → Build & Deploy**
3. **Change Root Directory from `src` to:**
   - For backend: `backend/newbackend`
   - For frontend: `frontend`
4. **Update Build Command:**
   - For backend: `npm install` (or leave empty, Render will auto-detect)
   - For frontend: `npm install && npm run build`
5. **Update Start Command:**
   - For backend: `npm start`
   - For frontend: `npm run preview`
6. **Save and redeploy**

## Important Notes

- The backend expects the frontend build at `../../frontend/dist` relative to `backend/newbackend`
- If deploying backend only, make sure the build command builds the frontend first
- Environment variables must be set in Render dashboard under "Environment"
- Database must be created separately in Render (PostgreSQL)

