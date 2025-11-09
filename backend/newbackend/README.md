# HotelEase Backend API

Express.js backend server for the HotelEase hotel booking application.

## Features

- ✅ Express.js server with CORS support
- ✅ Error handling middleware
- ✅ Route structure for authentication, hotels, bookings, users, and admin
- ✅ Environment variable configuration
- ✅ Health check endpoint

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hotelease
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development (with nodemon)
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`)

## API Endpoints

### Health Check
- `GET /api/health` - Check if the server is running

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user

### Hotels (`/api/hotels`)
- `GET /` - Get all hotels
- `GET /:id` - Get single hotel
- `POST /` - Create hotel (Admin only)
- `PUT /:id` - Update hotel (Admin only)
- `DELETE /:id` - Delete hotel (Admin only)

### Bookings (`/api/bookings`)
- `GET /` - Get all bookings for user
- `GET /:id` - Get single booking
- `POST /` - Create new booking
- `PUT /:id` - Update booking
- `DELETE /:id` - Cancel booking

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /password` - Update user password

### Admin (`/api/admin`)
- `GET /dashboard` - Get admin dashboard stats
- `GET /bookings` - Get all bookings (Admin only)
- `GET /users` - Get all users (Admin only)

## Project Structure

```
newbackend/
├── src/
│   ├── index.js                 # Main server file
│   ├── middleware/
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── notFound.js          # 404 handler
│   └── routes/
│       ├── authRoutes.js         # Authentication routes
│       ├── hotelRoutes.js        # Hotel routes
│       ├── bookingRoutes.js      # Booking routes
│       ├── userRoutes.js         # User routes
│       └── adminRoutes.js        # Admin routes
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
└── package.json                  # Dependencies and scripts

```

## Next Steps

1. Set up MongoDB connection
2. Create database models (User, Hotel, Booking)
3. Implement authentication middleware
4. Add validation for routes
5. Implement controller logic

## Dependencies

- express: Web framework
- cors: Cross-Origin Resource Sharing
- dotenv: Environment variable management
- mongoose: MongoDB object modeling
- bcryptjs: Password hashing
- jsonwebtoken: JWT authentication
- express-validator: Request validation
- body-parser: Request body parsing

## Dev Dependencies

- nodemon: Auto-restart server during development
