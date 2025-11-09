const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('⚠️  No token provided for protected route:', req.method, req.path);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to access this route. Please login again.',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Check if JWT_SECRET is set
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET not set in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error: JWT_SECRET is not set'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const userResult = await query('SELECT id, email, first_name, last_name, role FROM users WHERE id = $1', [decoded.user_id]);
      
      if (userResult.rowCount === 0) {
        console.log('⚠️  User not found for token:', decoded.user_id);
        return res.status(401).json({ 
          success: false,
          message: 'User not found. Please login again.',
          code: 'USER_NOT_FOUND'
        });
      }

      // Map to expected format (id as user_id for backward compatibility)
      req.user = {
        user_id: userResult.rows[0].id,
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        first_name: userResult.rows[0].first_name,
        last_name: userResult.rows[0].last_name,
        role: userResult.rows[0].role
      };
      next();
    } catch (err) {
      // Handle different JWT errors
      if (err.name === 'TokenExpiredError') {
        console.log('⚠️  Token expired for route:', req.method, req.path);
        return res.status(401).json({ 
          success: false,
          message: 'Your session has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (err.name === 'JsonWebTokenError') {
        console.log('⚠️  Invalid token for route:', req.method, req.path);
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token. Please login again.',
          code: 'INVALID_TOKEN'
        });
      } else {
        console.error('❌ Auth middleware error:', err.message);
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized to access this route',
          code: 'AUTH_ERROR'
        });
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error in auth middleware:', error);
    next(error);
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

