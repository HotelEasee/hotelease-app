const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const result = await query(
      'SELECT user_id, email, name, role, created_at, updated_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];
    
    // Split name
    const nameParts = user.name ? user.name.split(' ') : [user.email.split('@')[0]];
    
    const userResponse = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      first_name: nameParts[0] || null,
      last_name: nameParts.slice(1).join(' ') || null,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.status(200).json({
      success: true,
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { first_name, last_name, phone } = req.body;

    // Get current user
    const currentResult = await query(
      'SELECT name FROM users WHERE user_id = $1',
      [userId]
    );

    if (currentResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update name if provided
    let name = currentResult.rows[0].name;
    if (first_name || last_name) {
      name = [first_name, last_name].filter(Boolean).join(' ') || name;
    }

    const result = await query(
      `UPDATE users 
       SET name = $1, updated_at = NOW()
       WHERE user_id = $2
       RETURNING user_id, email, name, role, created_at, updated_at`,
      [name, userId]
    );

    const user = result.rows[0];
    
    // Split name
    const nameParts = user.name ? user.name.split(' ') : [user.email.split('@')[0]];
    
    const userResponse = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      first_name: nameParts[0] || null,
      last_name: nameParts.slice(1).join(' ') || null,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.status(200).json({
      success: true,
      data: {
        user: userResponse
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user password
    const result = await query(
      'SELECT password FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Password not set for this account'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE user_id = $2',
      [hashedPassword, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    next(error);
  }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*)::int AS count FROM favorites WHERE user_id = $1',
      [userId]
    );
    const total = countResult.rows[0].count;

    // Get favorites with hotel details
    const favoritesResult = await query(
      `SELECT 
        f.favorite_id,
        f.created_at,
        h.id as hotel_id,
        h.name,
        h.location,
        h.address,
        h.description,
        h.price_per_night,
        h.rating,
        h.images
       FROM favorites f
       JOIN hotels h ON f.hotel_id = h.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.status(200).json({
      success: true,
      data: {
        favorites: favoritesResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    next(error);
  }
};

// @desc    Add hotel to favorites
// @route   POST /api/users/favorites
// @access  Private
exports.addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { hotelId } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID is required'
      });
    }

    // Check if hotel exists
    const hotelResult = await query('SELECT id FROM hotels WHERE id = $1', [hotelId]);
    
    if (hotelResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check if already favorited
    const existingResult = await query(
      'SELECT favorite_id FROM favorites WHERE user_id = $1 AND hotel_id = $2',
      [userId, hotelId]
    );

    if (existingResult.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Hotel already in favorites'
      });
    }

    // Add to favorites
    const result = await query(
      'INSERT INTO favorites (user_id, hotel_id, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [userId, hotelId]
    );

    res.status(201).json({
      success: true,
      data: {
        favorite: result.rows[0]
      },
      message: 'Hotel added to favorites'
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    next(error);
  }
};

// @desc    Remove hotel from favorites
// @route   DELETE /api/users/favorites/:hotelId
// @access  Private
exports.removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const hotelId = req.params.hotelId;

    const result = await query(
      'DELETE FROM favorites WHERE user_id = $1 AND hotel_id = $2',
      [userId, hotelId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hotel removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    next(error);
  }
};

// @desc    Check if hotel is favorited
// @route   GET /api/users/favorites/check/:hotelId
// @access  Private
exports.checkFavorite = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const hotelId = req.params.hotelId;

    const result = await query(
      'SELECT favorite_id FROM favorites WHERE user_id = $1 AND hotel_id = $2',
      [userId, hotelId]
    );

    res.status(200).json({
      success: true,
      data: {
        isFavorite: result.rowCount > 0
      }
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    next(error);
  }
};

