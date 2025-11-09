# 🔐 How to Access Admin Dashboard

## Requirements

1. ✅ **Be logged in** (have an account)
2. ✅ **Have admin role** in the database
3. ✅ **Access URL:** `/admin/dashboard` or `/admin`

## Step-by-Step Guide

### Step 1: Register/Login as a User

1. **Register a new account:**
   - Go to: `http://localhost:3000/register`
   - Fill in the registration form
   - Note your email address

2. **Or login if you already have an account:**
   - Go to: `http://localhost:3000/login`
   - Login with your credentials

### Step 2: Set Your User Role to Admin

You need to update your user's role in the database to `'admin'`.

#### Option A: Using the Script (Easiest)

1. **Go to backend directory:**
   ```bash
   cd backend/newbackend
   ```

2. **Run the set-admin-role script:**
   ```bash
   node set-admin-role.js your-email@example.com
   ```
   
   Replace `your-email@example.com` with the email you used to register.

3. **You should see:**
   ```
   ✅ Admin role set for your-email@example.com
      Role: admin
   ```

#### Option B: Using Render Database (If deployed)

1. **Go to Render Dashboard** → Your PostgreSQL Database
2. **Connect** using Render Shell or External Database URL
3. **Run SQL:**
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

#### Option C: Using pgAdmin (If you have it)

1. **Connect to your database**
2. **Run SQL:**
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### Step 3: Logout and Login Again

**Important:** You need to logout and login again for the role change to take effect (the JWT token contains the role).

1. **Logout** from the frontend
2. **Login again** with the same credentials
3. **Check your profile** - you should see `role: 'admin'` (if profile page shows it)

### Step 4: Access Admin Dashboard

1. **Go to:** `http://localhost:3000/admin/dashboard`
   
   Or click on any admin link if available in the UI.

2. **If you're redirected to `/hotels`:**
   - Your role wasn't updated correctly
   - Try logging out and logging in again
   - Check the database to verify role is 'admin'

## Quick Test

### Check if you have admin role:

1. **Open browser console (F12)**
2. **Check localStorage:**
   ```javascript
   JSON.parse(localStorage.getItem('token'))
   ```
   (This won't show the role directly, but you can check Redux state)

3. **Or check Redux state:**
   - Open React DevTools
   - Check `state.auth.user.role` - should be `'admin'`

## Admin Dashboard Features

Once you access the admin dashboard, you can:
- ✅ View dashboard statistics
- ✅ Manage hotels (create, update, delete)
- ✅ View all bookings
- ✅ Manage users
- ✅ View and manage reviews
- ✅ Process refunds

## Troubleshooting

### Problem: Redirected to `/hotels` when accessing `/admin`

**Solution:**
1. Verify role in database: `SELECT email, role FROM users WHERE email = 'your-email@example.com';`
2. Make sure role is exactly `'admin'` (not `'Admin'` or `'ADMIN'`)
3. Logout and login again
4. Clear browser cache/localStorage if needed

### Problem: "Access Denied" or 403 Error

**Solution:**
- Your JWT token might have the old role cached
- Logout completely
- Clear localStorage: `localStorage.clear()`
- Login again

### Problem: Script doesn't work

**Solution:**
- Make sure you're in `backend/newbackend` directory
- Check database connection in `.env` file
- Verify the email exists in the database
- Try the SQL command directly

## Quick Command Reference

### Set Admin Role (Local):
```bash
cd backend/newbackend
node set-admin-role.js your-email@example.com
```

### Set Admin Role (SQL):
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Verify Admin Role:
```sql
SELECT email, role, first_name, last_name FROM users WHERE email = 'your-email@example.com';
```

## Admin Dashboard URL

- **Local:** `http://localhost:3000/admin/dashboard`
- **Production:** `https://your-frontend-url.com/admin/dashboard`

## Security Note

⚠️ **Important:** Only set admin role for trusted users. Admin users have full access to:
- All user data
- All bookings
- Hotel management
- Payment processing

Make sure to secure admin accounts with strong passwords!

