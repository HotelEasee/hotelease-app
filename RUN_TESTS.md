# 🧪 Run Application Tests

## Current Status Check

The application setup has been verified. Here's what to do next:

## Step-by-Step Testing

### 1. Start Backend Server

Open **Terminal 1** (PowerShell or Command Prompt):

```powershell
cd backend/newbackend
npm run dev
```

**⚠️ IMPORTANT**: Make sure PostgreSQL database is:
- ✅ Running
- ✅ Database `HotelEase` exists
- ✅ Tables created (run `dbInit.sql`)

**Expected Output:**
```
✅ Database connected at: [timestamp]
🚀 Server is running on port 5000
📍 Health check: http://localhost:5000/api/health
```

### 2. Start Frontend Server

Open **Terminal 2** (PowerShell or Command Prompt):

```powershell
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 3. Quick Backend Test

Open **Terminal 3** and run:

```powershell
powershell -ExecutionPolicy Bypass -File QUICK_TEST.ps1
```

Or manually test:
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Test hotels endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/hotels"
```

### 4. Manual Browser Testing

1. **Open Browser**: Navigate to `http://localhost:5173`

2. **Test Registration**:
   - Click "Register"
   - Fill form and submit
   - Should redirect to hotels page

3. **Test Login**:
   - Click "Login"
   - Enter credentials
   - Should see user profile in header

4. **Test Hotel Features**:
   - Browse hotels
   - Search/filter hotels
   - Click hotel to view details
   - Add to favorites
   - Write review
   - Share hotel

5. **Test Booking Flow**:
   - Select hotel
   - Choose dates
   - Fill booking form
   - Complete payment (use test card: 4242 4242 4242 4242)
   - View confirmation

6. **Test Profile**:
   - Click profile icon
   - View all tabs (Profile, Bookings, Reviews, Favorites)
   - Edit profile
   - Change password

7. **Test Admin** (if you have admin user):
   - Login as admin
   - Access admin dashboard
   - Create/edit hotels
   - Manage bookings

## Test Results Checklist

Use this checklist to track your testing:

- [ ] Backend server starts successfully
- [ ] Frontend server starts successfully
- [ ] Database connection successful
- [ ] Health endpoint responds
- [ ] Hotels API works
- [ ] User registration works
- [ ] User login works
- [ ] Hotel search works
- [ ] Hotel details display
- [ ] Booking creation works
- [ ] Payment integration works
- [ ] Profile page works
- [ ] Favorites functionality works
- [ ] Reviews functionality works
- [ ] Share functionality works
- [ ] Notifications work
- [ ] Admin panel works (if applicable)

## Common Issues

### Backend Won't Start

**Check:**
1. PostgreSQL is running
2. Database `HotelEase` exists
3. `.env` file has correct database credentials
4. Run `npm install` in `backend/newbackend`

### Database Connection Error

**Solution:**
```sql
-- Create database
CREATE DATABASE HotelEase;

-- Then run initialization
-- Copy SQL from: backend/newbackend/src/utils/dbInit.sql
```

Or using psql:
```bash
psql -U postgres -d HotelEase -f backend/newbackend/src/utils/dbInit.sql
```

### Frontend Won't Load

**Check:**
1. Backend is running on port 5000
2. `VITE_API_URL` in frontend `.env` is correct
3. No CORS errors in browser console
4. Run `npm install` in `frontend`

### API Calls Fail

**Check:**
1. Backend server is running
2. Check browser Network tab for errors
3. Verify API URL in frontend `.env`
4. Check backend console for errors

## Full Testing Documentation

For comprehensive testing guide, see:
- `TESTING_GUIDE.md` - Detailed API testing
- `START_APPLICATION.md` - Complete setup and testing instructions

---

**Ready to test!** Start both servers and follow the checklist above. 🚀

