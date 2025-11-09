# 🚀 How to Start & Test HotelEase Application

## Quick Start Guide

### Step 1: Database Setup

**Make sure PostgreSQL is running!**

1. Open PostgreSQL (pgAdmin or psql)
2. Create database:
```sql
CREATE DATABASE HotelEase;
```

3. Run the initialization script:
```bash
# Using psql
psql -U postgres -d HotelEase -f backend/newbackend/src/utils/dbInit.sql

# Or copy and paste the SQL from: backend/newbackend/src/utils/dbInit.sql
```

### Step 2: Configure Backend

1. Navigate to backend:
```bash
cd backend/newbackend
```

2. Create `.env` file (if not exists):
```bash
# Copy from env.example
copy env.example .env
```

3. Edit `.env` and update database password:
```env
DB_PASSWORD=your_actual_postgres_password
JWT_SECRET=change-this-to-a-random-secret-key
```

### Step 3: Start Backend Server

```bash
cd backend/newbackend
npm run dev
```

**Expected Output:**
```
✅ Database connected at: [timestamp]
🚀 Server is running on port 5000
📍 Health check: http://localhost:5000/api/health
```

### Step 4: Configure Frontend

1. Navigate to frontend:
```bash
cd frontend
```

2. Create `.env` file (should already exist after setup):
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SK4EeKfsjeetxhkHtYVFBzhUtFiyf4o03PVURBPyUuJH6EJlFXArNq2Cg64kuSDrAJ1JDHJoWpl29hO82hlUjXz00ldCqwN5Y
```

### Step 5: Start Frontend Server

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🧪 Testing Checklist

### Backend API Tests

#### 1. Health Check ✅
**Test**: Open browser or use curl
```
http://localhost:5000/api/health
```
**Expected**: `{ "status": "success", "message": "HotelEase API is running" }`

#### 2. Test Registration ✅
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "first_name": "Test",
  "last_name": "User"
}
```

#### 3. Test Login ✅
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 4. Get Hotels ✅
```bash
GET http://localhost:5000/api/hotels
```

### Frontend Tests

#### 1. Open Application ✅
- Navigate to: `http://localhost:5173`
- Should see homepage

#### 2. Test Navigation ✅
- Click "Hotels" - should show hotels page
- Click "Login" - should show login page
- Click "Register" - should show registration page

#### 3. Test Registration Flow ✅
1. Go to Register page
2. Fill form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Submit
4. Should redirect to hotels page
5. Should see success toast

#### 4. Test Login Flow ✅
1. Go to Login page
2. Enter credentials
3. Submit
4. Should redirect and show user in header

#### 5. Test Hotel Search ✅
1. Go to Hotels page
2. Enter search query (e.g., "Durban")
3. Click Search
4. Should filter hotels

#### 6. Test Hotel Details ✅
1. Click on a hotel card
2. Should show hotel details page
3. Should see:
   - Images
   - Description
   - Amenities
   - Booking form
   - Reviews section
   - Share button

#### 7. Test Create Booking ✅
1. On hotel details page
2. Select check-in and check-out dates
3. Select guests and rooms
4. Click "Book Now"
5. Fill guest details
6. Submit booking
7. Should navigate to payment page

#### 8. Test Payment Flow ✅
1. On payment page
2. Fill payment details (use Stripe test card: 4242 4242 4242 4242)
3. Submit payment
4. Should show success
5. Should navigate to confirmation page

#### 9. Test Profile ✅
1. Click profile icon in header
2. Should show profile page with tabs:
   - Profile: View/edit personal info
   - Bookings: View booking history
   - Reviews: View review history
   - Favorites: View favorite hotels

#### 10. Test Favorites ✅
1. Go to Hotels page
2. Click heart icon on a hotel
3. Should add to favorites
4. Go to Profile > Favorites tab
5. Should see favorited hotel

#### 11. Test Reviews ✅
1. Go to hotel details page
2. Scroll to Reviews section
3. Click "Write a Review"
4. Select rating (stars)
5. Write comment
6. Submit
7. Should see review appear

#### 12. Test Share ✅
1. On hotel details page
2. Click "Share" button
3. Should open share modal
4. Test share buttons:
   - Facebook
   - Twitter
   - WhatsApp
   - Email
   - Copy Link

#### 13. Test Notifications ✅
1. Complete a booking
2. Click notification bell in header
3. Should show notification about booking
4. Click notification to mark as read

#### 14. Test Admin (if admin user) ✅
1. Login as admin user (role: 'admin' in database)
2. Click "Admin" in navigation
3. Should show admin dashboard
4. Test tabs:
   - Dashboard: View statistics
   - Hotels: CRUD operations
   - Bookings: View all bookings
   - Users: View all users

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error:**
```
❌ Database connection error
```
**Solution:**
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database `HotelEase` exists
4. Run `dbInit.sql` to create tables

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Module Not Found:**
```
Cannot find module 'xxx'
```
**Solution:**
```bash
cd backend/newbackend
npm install
```

### Frontend Issues

**API Calls Fail:**
```
Failed to fetch
```
**Solution:**
1. Verify backend is running on port 5000
2. Check `VITE_API_URL` in frontend `.env`
3. Check CORS settings in backend

**Blank Page:**
```
Error in console
```
**Solution:**
1. Check browser console for errors
2. Verify all dependencies installed: `npm install`
3. Clear browser cache

### Database Issues

**Tables Don't Exist:**
```
relation "users" does not exist
```
**Solution:**
```bash
# Run initialization script
psql -U postgres -d HotelEase -f backend/newbackend/src/utils/dbInit.sql
```

## ✅ Success Criteria

When everything works, you should:
- ✅ Backend API responds on port 5000
- ✅ Frontend loads on port 5173
- ✅ Can register and login
- ✅ Can view hotels
- ✅ Can create bookings
- ✅ Can complete payments
- ✅ Can view profile
- ✅ Can manage favorites
- ✅ Can write reviews
- ✅ Can share hotels
- ✅ Notifications work
- ✅ Admin panel accessible (if admin)

## 📝 Test Results Template

```
Backend Health Check: [ ] Pass [ ] Fail
Registration: [ ] Pass [ ] Fail
Login: [ ] Pass [ ] Fail
Hotel Search: [ ] Pass [ ] Fail
Booking Creation: [ ] Pass [ ] Fail
Payment: [ ] Pass [ ] Fail
Profile: [ ] Pass [ ] Fail
Favorites: [ ] Pass [ ] Fail
Reviews: [ ] Pass [ ] Fail
Share: [ ] Pass [ ] Fail
Notifications: [ ] Pass [ ] Fail
Admin Panel: [ ] Pass [ ] Fail (if applicable)
```

---

**Need Help?** Check `TESTING_GUIDE.md` for detailed API testing instructions.

