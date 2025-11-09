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
    console.log('❌ Database connection error:', err.message);
    console.log('💡 Troubleshooting:');
    console.log('   1. Check if DATABASE_URL is set in Render Environment variables');
    console.log('   2. Verify PostgreSQL database exists and is running');
    console.log('   3. For Render free tier: Database may take 30-60 seconds to wake up');
    console.log('   4. Check database connection string format');
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

// Check Stripe configuration on startup
console.log('\n🔐 Payment Gateway Configuration:');
if (process.env.STRIPE_SECRET_KEY) {
  const keyPrefix = process.env.STRIPE_SECRET_KEY.substring(0, 10);
  
  // Check if user accidentally used publishable key
  if (process.env.STRIPE_SECRET_KEY.startsWith('pk_test_') || process.env.STRIPE_SECRET_KEY.startsWith('pk_live_')) {
    console.log('❌ ERROR: STRIPE_SECRET_KEY contains a PUBLISHABLE key!');
    console.log('   You set: pk_test_... or pk_live_...');
    console.log('   You need: sk_test_... or sk_live_...');
    console.log('   ⚠️  Payment will NOT work until you fix this!');
    console.log('   In Stripe Dashboard, copy the "Secret key" not the "Publishable key"');
  } else {
    const keyType = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'Test' : 
                    process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'Live' : 'Unknown';
    if (keyType === 'Unknown') {
      console.log(`⚠️  STRIPE_SECRET_KEY format looks invalid (${keyPrefix}...)`);
      console.log('   Should start with sk_test_ (test) or sk_live_ (live)');
    } else {
      console.log(`✅ STRIPE_SECRET_KEY found (${keyType} key: ${keyPrefix}...)`);
    }
  }
} else {
  console.log('⚠️  STRIPE_SECRET_KEY not set');
  console.log('   Payment functionality will not work until this is configured');
  console.log('   Set it in Render Dashboard > Environment Variables');
  console.log('   Make sure to use the SECRET key (sk_test_...) not the publishable key (pk_test_...)');
}

if (process.env.STRIPE_PUBLISHABLE_KEY) {
  const pubKeyPrefix = process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 10);
  console.log(`✅ STRIPE_PUBLISHABLE_KEY found (${pubKeyPrefix}...)`);
} else {
  console.log('⚠️  STRIPE_PUBLISHABLE_KEY not set (frontend may not work)');
}
console.log('');

// CORS Configuration
// Allow multiple origins for development and production
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log(`⚠️  CORS blocked origin: ${origin}`);
      console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Log CORS configuration on startup
console.log('🌐 CORS Configuration:');
console.log(`   Allowed origins: ${allowedOrigins.join(', ') || 'All origins'}`);

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

// Auth test endpoint (for debugging)
app.get('/api/auth/test', require('./middleware/auth').protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
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
