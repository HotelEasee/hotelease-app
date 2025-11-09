# 🧪 HotelEase Application Testing Guide

## Prerequisites Check

### 1. Backend Setup

**Location**: `backend/newbackend/`

**Requirements**:
- ✅ Node.js (v14+)
- ✅ PostgreSQL database running
- ✅ `.env` file configured

**Check dependencies**:
```bash
cd backend/newbackend
npm install
```

**Required Environment Variables** (create `.env` from `env.example`):
```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=HotelEase
DB_PASSWORD=your-database-password
DB_PORT=5432

# JWT Secret
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51SK4EeKfsjeetxhkeVWJuFhyvVbNIrfNNU81DLTNnjCWxd2mqed6OdWcSE2eiwJwgXmlkKVykyisXzyMA8IvAXw700Qpr4t7B2
STRIPE_PUBLISHABLE_KEY=pk_test_51SK4EeKfsjeetxhkHtYVFBzhUtFiyf4o03PVURBPyUuJH6EJlFXArNq2Cg64kuSDrAJ1JDHJoWpl29hO82hlUjXz00ldCqwN5Y
```

**Start Backend**:
```bash
cd backend/newbackend
npm run dev
```

Backend should start on: `http://localhost:5000`

### 2. Frontend Setup

**Location**: `frontend/`

**Required Environment Variables** (create `.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SK4EeKfsjeetxhkHtYVFBzhUtFiyf4o03PVURBPyUuJH6EJlFXArNq2Cg64kuSDrAJ1JDHJoWpl29hO82hlUjXz00ldCqwN5Y
```

**Check dependencies**:
```bash
cd frontend
npm install
```

**Start Frontend**:
```bash
cd frontend
npm run dev
```

Frontend should start on: `http://localhost:5173`

## Testing Checklist

### ✅ Backend API Testing

#### 1. Health Check
- [ ] GET `http://localhost:5000/api/health`
- Expected: `{ status: 'success', message: 'HotelEase API is running' }`

#### 2. Authentication
- [ ] POST `/api/auth/register` - Register new user
- [ ] POST `/api/auth/login` - Login user
- [ ] GET `/api/auth/me` - Get current user (with token)
- [ ] POST `/api/auth/logout` - Logout

#### 3. Hotels
- [ ] GET `/api/hotels` - Get all hotels
- [ ] GET `/api/hotels/:id` - Get single hotel
- [ ] GET `/api/hotels?location=Durban` - Search hotels

#### 4. Bookings (Requires Auth)
- [ ] GET `/api/bookings` - Get user bookings
- [ ] POST `/api/bookings` - Create booking
- [ ] GET `/api/bookings/:id` - Get single booking

#### 5. Payments (Requires Auth)
- [ ] POST `/api/bookings/payment-intent` - Create payment intent
- [ ] POST `/api/bookings/confirm-payment` - Confirm payment

#### 6. User Profile (Requires Auth)
- [ ] GET `/api/users/profile` - Get profile
- [ ] PUT `/api/users/profile` - Update profile
- [ ] PUT `/api/users/password` - Change password
- [ ] GET `/api/users/favorites` - Get favorites
- [ ] POST `/api/users/favorites` - Add favorite
- [ ] DELETE `/api/users/favorites/:id` - Remove favorite

#### 7. Reviews
- [ ] GET `/api/users/hotels/:id/reviews` - Get hotel reviews
- [ ] POST `/api/users/hotels/:id/reviews` - Create review (auth required)

#### 8. Notifications (Requires Auth)
- [ ] GET `/api/users/notifications` - Get notifications
- [ ] GET `/api/users/notifications/unread-count` - Get unread count
- [ ] PUT `/api/users/notifications/:id/read` - Mark as read

#### 9. Admin (Requires Admin Role)
- [ ] GET `/api/admin/dashboard` - Dashboard stats
- [ ] GET `/api/admin/hotels` - All hotels
- [ ] POST `/api/admin/hotels` - Create hotel
- [ ] PUT `/api/admin/hotels/:id` - Update hotel
- [ ] DELETE `/api/admin/hotels/:id` - Delete hotel
- [ ] GET `/api/admin/bookings` - All bookings
- [ ] GET `/api/admin/users` - All users

### ✅ Frontend Testing

#### 1. Navigation
- [ ] Homepage loads
- [ ] Hotels page accessible
- [ ] Login page accessible
- [ ] Register page accessible
- [ ] Profile page accessible (after login)
- [ ] Admin dashboard accessible (admin only)

#### 2. Authentication Flow
- [ ] Register new user
- [ ] Login with credentials
- [ ] Logout functionality
- [ ] Protected routes redirect to login

#### 3. Hotel Features
- [ ] Search hotels
- [ ] Filter by location, price, rating
- [ ] View hotel details
- [ ] Add/remove favorites
- [ ] Share hotel (ShareModal)
- [ ] View reviews
- [ ] Submit review

#### 4. Booking Flow
- [ ] Select hotel and dates
- [ ] Create booking
- [ ] Navigate to payment
- [ ] Complete payment with Stripe
- [ ] View booking confirmation

#### 5. User Profile
- [ ] View profile information
- [ ] Edit profile
- [ ] Change password
- [ ] View bookings history
- [ ] View reviews history
- [ ] View favorites

#### 6. Notifications
- [ ] Notification bell shows unread count
- [ ] Click bell opens dropdown
- [ ] Mark notification as read
- [ ] Notifications auto-refresh

#### 7. Admin Features (Admin Role Required)
- [ ] Access admin dashboard
- [ ] View dashboard statistics
- [ ] Create new hotel
- [ ] Edit hotel
- [ ] Delete hotel
- [ ] Manage bookings
- [ ] View all users

## Quick Test Commands

### Test Backend API (using curl or Postman)

```bash
# Health Check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Hotels (use token from login)
curl http://localhost:5000/api/hotels \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Database Setup

Make sure PostgreSQL is running and execute:

```bash
psql -U postgres -d HotelEase -f backend/newbackend/src/utils/dbInit.sql
```

Or manually create database:
```sql
CREATE DATABASE HotelEase;
```

Then run the SQL file to create tables.

## Common Issues & Solutions

### Backend Issues

**Issue**: Database connection error
- **Solution**: Check PostgreSQL is running, verify credentials in `.env`

**Issue**: Port 5000 already in use
- **Solution**: Change PORT in `.env` or kill process using port 5000

**Issue**: Module not found errors
- **Solution**: Run `npm install` in `backend/newbackend`

### Frontend Issues

**Issue**: API calls fail
- **Solution**: Verify backend is running and `VITE_API_URL` is correct

**Issue**: CORS errors
- **Solution**: Check `CORS_ORIGIN` in backend `.env` matches frontend URL

**Issue**: Stripe errors
- **Solution**: Verify Stripe keys in both `.env` files

## Testing Workflow

1. **Start Backend**: `cd backend/newbackend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:5173`
4. **Test Features**: Follow checklist above
5. **Check Console**: Monitor for errors in browser console and terminal

## Expected Results

- ✅ Backend API responds on port 5000
- ✅ Frontend loads on port 5173
- ✅ Database connection successful
- ✅ All API endpoints return correct responses
- ✅ Frontend displays data correctly
- ✅ Authentication flow works
- ✅ Payment integration functional
- ✅ No console errors

---

**Note**: For full OAuth testing, configure Google/Facebook OAuth apps first.

