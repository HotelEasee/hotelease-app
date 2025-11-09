const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (user_id) => {
  return jwt.sign({ user_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = async (req, res, next) => {
  try {
    // This will be populated by passport strategy
    const { email, name, googleId, picture } = req.user || req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google authentication data'
      });
    }

    // Check if user exists
    let userResult = await query(
      'SELECT * FROM users WHERE email = $1 OR (oauth_provider = $2 AND oauth_provider_id = $3)',
      [email, 'google', googleId]
    );

    let user;

    if (userResult.rowCount === 0) {
      // Create new user
      const result = await query(
        `INSERT INTO users (email, name, oauth_provider, oauth_provider_id, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [email, name || email.split('@')[0], 'google', googleId, 'user']
      );
      user = result.rows[0];
    } else {
      // Update existing user if needed
      user = userResult.rows[0];
      if (!user.oauth_provider_id) {
        await query(
          'UPDATE users SET oauth_provider = $1, oauth_provider_id = $2, updated_at = NOW() WHERE user_id = $3',
          ['google', googleId, user.user_id]
        );
      }
    }

    // Generate token
    const token = generateToken(user.user_id);

    // Split name for response
    const nameParts = user.name ? user.name.split(' ') : [user.email.split('@')[0]];
    
    const userResponse = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      first_name: nameParts[0] || null,
      last_name: nameParts.slice(1).join(' ') || null,
      role: user.role,
      created_at: user.created_at
    };

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Google authentication successful'
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    next(error);
  }
};

// @desc    Facebook OAuth callback
// @route   GET /api/auth/facebook/callback
// @access  Public
exports.facebookCallback = async (req, res, next) => {
  try {
    // This will be populated by passport strategy
    const { email, name, facebookId, picture } = req.user || req.body;

    if (!facebookId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Facebook authentication data'
      });
    }

    // Use email or generate from ID
    const userEmail = email || `facebook_${facebookId}@oauth.local`;

    // Check if user exists
    let userResult = await query(
      'SELECT * FROM users WHERE (oauth_provider = $1 AND oauth_provider_id = $2) OR email = $3',
      ['facebook', facebookId, userEmail]
    );

    let user;

    if (userResult.rowCount === 0) {
      // Create new user
      const result = await query(
        `INSERT INTO users (email, name, oauth_provider, oauth_provider_id, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [userEmail, name || `User ${facebookId}`, 'facebook', facebookId, 'user']
      );
      user = result.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Generate token
    const token = generateToken(user.user_id);

    // Split name for response
    const nameParts = user.name ? user.name.split(' ') : [user.email.split('@')[0]];
    
    const userResponse = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      first_name: nameParts[0] || null,
      last_name: nameParts.slice(1).join(' ') || null,
      role: user.role,
      created_at: user.created_at
    };

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Facebook authentication successful'
    });
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    next(error);
  }
};

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
exports.googleAuth = (req, res) => {
  // This would redirect to Google OAuth
  // For now, return a message indicating OAuth setup needed
  res.status(200).json({
    success: false,
    message: 'Google OAuth not configured. Please set up Google OAuth credentials.'
  });
  
  // When passport is configured:
  // passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
};

// @desc    Initiate Facebook OAuth
// @route   GET /api/auth/facebook
// @access  Public
exports.facebookAuth = (req, res) => {
  // This would redirect to Facebook OAuth
  res.status(200).json({
    success: false,
    message: 'Facebook OAuth not configured. Please set up Facebook OAuth credentials.'
  });

  // When passport is configured:
  // passport.authenticate('facebook', { scope: ['email'] })(req, res);
};

