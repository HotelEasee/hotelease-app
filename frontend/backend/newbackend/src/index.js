const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { pool } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'HotelEase API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from frontend build directory (if it exists)
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
const frontendExists = require('fs').existsSync(frontendBuildPath);

if (frontendExists) {
  // Serve static files from frontend dist
  app.use(express.static(frontendBuildPath));
  
  // Handle React Router - serve index.html for all non-API routes
  // This must come before notFound middleware
  app.get('*', (req, res, next) => {
    // Don't serve index.html for API routes - let them fall through to notFound
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Serve frontend for all other routes
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
} else {
  // If frontend build doesn't exist, provide a helpful root route
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'HotelEase API Server',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        hotels: '/api/hotels',
        bookings: '/api/bookings',
        users: '/api/users',
        admin: '/api/admin'
      },
      note: 'Frontend build not found. Build the frontend with "npm run build" in the frontend directory.'
    });
  });
}

// 404 handler for unmatched API routes (must come after frontend catch-all)
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
