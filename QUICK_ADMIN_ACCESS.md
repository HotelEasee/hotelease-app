# ⚡ Quick Guide: Access Admin Dashboard

## 🎯 Quick Steps

### 1. Register/Login
- Register at: `http://localhost:3000/register`
- Or login at: `http://localhost:3000/login`
- **Note your email address**

### 2. Set Admin Role

**Option A: Using Script (Recommended)**
```bash
cd backend/newbackend
node set-admin-role.js your-email@example.com
```

**Option B: Using SQL (If you have database access)**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 3. Logout & Login Again
- **Important:** Logout and login again for the role to take effect
- The JWT token needs to be refreshed with the new role

### 4. Access Admin Dashboard
- **URL:** `http://localhost:3000/admin/dashboard`
- Or navigate to `/admin` in your browser

## ✅ Success Indicators

- You can access `/admin/dashboard` without being redirected
- You see admin dashboard with stats, hotels, bookings, users tabs
- You can manage hotels and bookings

## ❌ If Redirected to `/hotels`

1. **Check database:**
   ```sql
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```
   Should show `role = 'admin'`

2. **Logout and login again** (JWT token needs refresh)

3. **Clear browser cache/localStorage:**
   ```javascript
   localStorage.clear()
   ```
   Then login again

## 🔗 Direct Access

Once you have admin role, you can access:
- **Dashboard:** `/admin/dashboard`
- **Hotels Management:** `/admin` (defaults to dashboard)
- **All Admin Routes:** `/admin/*`

## 📝 Example

```bash
# 1. Register with email: admin@test.com
# 2. Set admin role:
cd backend/newbackend
node set-admin-role.js admin@test.com

# 3. Logout and login again
# 4. Go to: http://localhost:3000/admin/dashboard
```

That's it! 🎉

