const { query } = require('../config/database');

// @desc    Get reviews for a hotel
// @route   GET /api/users/hotels/:hotelId/reviews
// @access  Public
exports.getHotelReviews = async (req, res, next) => {
  try {
    const hotelId = req.params.hotelId;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const offset = (page - 1) * limit;

    // Check if hotel exists
    const hotelResult = await query('SELECT id FROM hotels WHERE id = $1', [hotelId]);
    
    if (hotelResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*)::int AS count FROM reviews WHERE hotel_id = $1',
      [hotelId]
    );
    const total = countResult.rows[0].count;

    // Get reviews with user info
    const reviewsResult = await query(
      `SELECT 
        r.review_id,
        r.user_id,
        r.hotel_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.email as user_email
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.hotel_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [hotelId, limit, offset]
    );

    // Calculate average rating
    const avgResult = await query(
      'SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*)::int as total_reviews FROM reviews WHERE hotel_id = $1',
      [hotelId]
    );

    res.status(200).json({
      success: true,
      data: {
        reviews: reviewsResult.rows,
        averageRating: parseFloat(avgResult.rows[0].avg_rating) || 0,
        totalReviews: avgResult.rows[0].total_reviews || 0,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get hotel reviews error:', error);
    next(error);
  }
};

// @desc    Create review for a hotel
// @route   POST /api/users/hotels/:hotelId/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const hotelId = req.params.hotelId;
    const { rating, comment, booking_id } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
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

    // Check if user already reviewed this hotel
    const existingReview = await query(
      'SELECT review_id FROM reviews WHERE user_id = $1 AND hotel_id = $2',
      [userId, hotelId]
    );

    if (existingReview.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this hotel'
      });
    }

    // Create review
    const result = await query(
      `INSERT INTO reviews (user_id, hotel_id, rating, comment, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [userId, hotelId, rating, comment || null]
    );

    // Update hotel rating
    const avgResult = await query(
      `UPDATE hotels 
       SET rating = (
         SELECT AVG(rating)::numeric(3,2) 
         FROM reviews 
         WHERE hotel_id = $1
       ),
       updated_at = NOW()
       WHERE hotel_id = $1
       RETURNING rating`,
      [hotelId]
    );

    res.status(201).json({
      success: true,
      data: {
        review: result.rows[0],
        hotelRating: parseFloat(avgResult.rows[0].rating) || 0
      },
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Create review error:', error);
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/users/reviews/:reviewId
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const reviewId = req.params.reviewId;
    const { rating, comment } = req.body;

    // Get review
    const reviewResult = await query(
      'SELECT * FROM reviews WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (reviewResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to update it'
      });
    }

    const review = reviewResult.rows[0];

    // Update review
    const result = await query(
      `UPDATE reviews 
       SET rating = $1, comment = $2, updated_at = NOW()
       WHERE review_id = $3 AND user_id = $4
       RETURNING *`,
      [rating || review.rating, comment || review.comment, reviewId, userId]
    );

    // Update hotel rating
    await query(
      `UPDATE hotels 
       SET rating = (
         SELECT AVG(rating)::numeric(3,2) 
         FROM reviews 
         WHERE hotel_id = $1
       ),
       updated_at = NOW()
       WHERE hotel_id = $1`,
      [review.hotel_id]
    );

    res.status(200).json({
      success: true,
      data: {
        review: result.rows[0]
      },
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/users/reviews/:reviewId
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const reviewId = req.params.reviewId;
    const isAdmin = req.user.role === 'admin';

    // Get review
    const reviewResult = await query(
      `SELECT * FROM reviews WHERE review_id = $1 ${isAdmin ? '' : 'AND user_id = $2'}`,
      isAdmin ? [reviewId] : [reviewId, userId]
    );

    if (reviewResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it'
      });
    }

    const review = reviewResult.rows[0];
    const hotelId = review.hotel_id;

    // Delete review
    await query('DELETE FROM reviews WHERE review_id = $1', [reviewId]);

    // Update hotel rating
    await query(
      `UPDATE hotels 
       SET rating = (
         SELECT COALESCE(AVG(rating)::numeric(3,2), 0) 
         FROM reviews 
         WHERE hotel_id = $1
       ),
       updated_at = NOW()
       WHERE hotel_id = $1`,
      [hotelId]
    );

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    next(error);
  }
};

// @desc    Get user's reviews
// @route   GET /api/users/reviews
// @access  Private
exports.getMyReviews = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*)::int AS count FROM reviews WHERE user_id = $1',
      [userId]
    );
    const total = countResult.rows[0].count;

    // Get reviews with hotel info
    const reviewsResult = await query(
      `SELECT 
        r.review_id,
        r.user_id,
        r.hotel_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        h.name as hotel_name,
        h.location as hotel_location
       FROM reviews r
       JOIN hotels h ON r.hotel_id = h.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.status(200).json({
      success: true,
      data: {
        reviews: reviewsResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    next(error);
  }
};

