# HotelEase Backend API

Express.js backend server for the HotelEase hotel booking application with PostgreSQL database.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your database credentials.

3. **Create PostgreSQL database**
   ```bash
   # Via psql command line
   psql -U postgres
   CREATE DATABASE hotelease;
   \q
   
   # Or via pgAdmin
   ```

4. **Initialize database schema**
   ```bash
   # Connect to your database and run:
   psql -U postgres -d hotelease -f src/utils/dbInit.sql
   
   # Or using psql:
   psql -U postgres
   \c hotelease
   \i src/utils/dbInit.sql
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
newbackend/
├── src/
│   ├── index.js                 # Main server file
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── middleware/
│   │   ├── errorHandler.js      # Error handling
│   │   └── notFound.js          # 404 handler
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── hotelRoutes.js       # Hotel routes
│   │   ├── bookingRoutes.js     # Booking routes
│   │   ├── userRoutes.js        # User routes
│   │   └── adminRoutes.js       # Admin routes
│   └── utils/
│       └── dbInit.sql           # Database schema
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🔌 Database Connection

The backend is configured to connect to PostgreSQL using:
- Connection pooling for better performance
- Environment variables for configuration
- Automatic connection testing on startup

### Connection Parameters (in `.env`):
- `DB_USER` - PostgreSQL username (default: postgres)
- `DB_HOST` - Database host (default: localhost)
- `DB_NAME` - Database name (default: hotelease)
- `DB_PASSWORD` - Database password
- `DB_PORT` - Database port (default: 5432)

## 📊 Database Schema

### Tables:
- **users** - User accounts (email, password, name, role)
- **hotels** - Hotel information (name, location, price, amenities)
- **bookings** - Hotel bookings (check-in, check-out, guests, price)
- **favorites** - User favorite hotels
- **payments** - Payment transaction records

## 🛣️ API Endpoints

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

## 📦 Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client for Node.js
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Request validation
- **body-parser** - Request body parsing

## 🔧 Dev Dependencies

- **nodemon** - Auto-restart server during development

## 📝 Next Steps

1. Implement database models using Sequelize ORM or raw SQL
2. Add authentication middleware with JWT
3. Create controllers for each route
4. Add request validation
5. Implement business logic

