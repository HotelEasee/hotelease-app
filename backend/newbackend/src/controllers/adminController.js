const { query } = require('../config/database');
const notificationController = require('./notificationController');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get total users
    const usersResult = await query('SELECT COUNT(*)::int AS count FROM users');
    const totalUsers = usersResult.rows[0].count;

    // Get total hotels
    const hotelsResult = await query('SELECT COUNT(*)::int AS count FROM hotels');
    const totalHotels = hotelsResult.rows[0].count;

    // Get total bookings
    const bookingsResult = await query('SELECT COUNT(*)::int AS count FROM bookings');
    const totalBookings = bookingsResult.rows[0].count;

    // Get total revenue
    const revenueResult = await query(
      `SELECT COALESCE(SUM(total_price)::numeric(10,2), 0) AS revenue 
       FROM bookings 
       WHERE payment_status = 'paid'`
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].revenue) || 0;

    // Get pending bookings
    const pendingResult = await query(
      "SELECT COUNT(*)::int AS count FROM bookings WHERE status = 'pending'"
    );
    const pendingBookings = pendingResult.rows[0].count;

    // Get active hotels (you can define what active means)
    const activeHotelsResult = await query('SELECT COUNT(*)::int AS count FROM hotels');
    const activeHotels = activeHotelsResult.rows[0].count;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalHotels,
        totalBookings,
        totalRevenue,
        pendingBookings,
        activeHotels
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query('SELECT COUNT(*)::int AS count FROM users');
    const total = countResult.rows[0].count;

    // Get users
    const usersResult = await query(
      `SELECT user_id, email, name, role, created_at, updated_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    next(error);
  }
};

// @desc    Get all hotels (admin)
// @route   GET /api/admin/hotels
// @access  Private/Admin
exports.getAllHotels = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query('SELECT COUNT(*)::int AS count FROM hotels');
    const total = countResult.rows[0].count;

    // Get hotels
    const hotelsResult = await query(
      `SELECT * FROM hotels
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      data: {
        hotels: hotelsResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all hotels error:', error);
    next(error);
  }
};

// @desc    Create hotel (admin)
// @route   POST /api/admin/hotels
// @access  Private/Admin
exports.createHotel = async (req, res, next) => {
  try {
    const {
      name,
      location,
      address,
      description,
      price_per_night,
      rating = 0
    } = req.body;

    if (!name || !location || !price_per_night) {
      return res.status(400).json({
        success: false,
        message: 'name, location and price_per_night are required'
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    const result = await query(
      `INSERT INTO hotels(name, slug, location, address, city, province, country, description, price_per_night, rating, currency, created_at, updated_at)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [
        name,
        slug,
        location,
        address || location,
        location.split(',')[0] || location, // Use location as city if no city provided
        'Western Cape', // Default province
        'South Africa',
        description || null,
        Number(price_per_night),
        Number(rating) || 0,
        'ZAR'
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        hotel: result.rows[0]
      },
      message: 'Hotel created successfully'
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    next(error);
  }
};

// @desc    Update hotel (admin)
// @route   PUT /api/admin/hotels/:id
// @access  Private/Admin
exports.updateHotel = async (req, res, next) => {
  try {
    const hotelId = req.params.id;
    const existing = await query('SELECT * FROM hotels WHERE id = $1', [hotelId]);
    
    if (existing.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    const current = existing.rows[0];
    const {
      name = current.name,
      location = current.location,
      address = current.address,
      description = current.description,
      price_per_night = current.price_per_night,
      rating = current.rating
    } = req.body;

    const result = await query(
      `UPDATE hotels 
       SET name=$1, location=$2, address=$3, description=$4, price_per_night=$5, 
           rating=$6, updated_at=NOW()
       WHERE id=$7 
       RETURNING *`,
      [
        name,
        location,
        address,
        description,
        Number(price_per_night),
        Number(rating),
        hotelId
      ]
    );

    res.status(200).json({
      success: true,
      data: {
        hotel: result.rows[0]
      },
      message: 'Hotel updated successfully'
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    next(error);
  }
};

// @desc    Delete hotel (admin)
// @route   DELETE /api/admin/hotels/:id
// @access  Private/Admin
exports.deleteHotel = async (req, res, next) => {
  try {
    const hotelId = req.params.id;
    const result = await query('DELETE FROM hotels WHERE id = $1', [hotelId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    next(error);
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const offset = (page - 1) * limit;
    
    const { status, hotel_id, user_id } = req.query;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      params.push(status);
      conditions.push(`b.status = $${paramIndex}`);
      paramIndex++;
    }

    if (hotel_id) {
      params.push(hotel_id);
      conditions.push(`b.hotel_id = $${paramIndex}`);
      paramIndex++;
    }

    if (user_id) {
      params.push(user_id);
      conditions.push(`b.user_id = $${paramIndex}`);
      paramIndex++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*)::int AS count FROM bookings b ${whereClause}`,
      params
    );
    const total = countResult.rows[0].count;

    params.push(limit, offset);

    // Get bookings with hotel and user details
    const bookingsResult = await query(
      `SELECT 
        b.*,
        h.name as hotel_name,
        h.location as hotel_location,
        u.email as user_email,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
       FROM bookings b
       JOIN hotels h ON b.hotel_id = h.id
       JOIN users u ON b.user_id = u.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.status(200).json({
      success: true,
      data: {
        bookings: bookingsResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    next(error);
  }
};

// @desc    Update booking status (admin)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { status, cancellation_reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Get booking
    const bookingResult = await query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    // Update booking
    const result = await query(
      `UPDATE bookings 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, bookingId]
    );

    // Create notification for user
    const statusMessages = {
      'confirmed': 'Your booking has been confirmed!',
      'cancelled': 'Your booking has been cancelled.',
      'completed': 'Your booking has been completed.'
    };

    if (statusMessages[status]) {
      await notificationController.createNotification(
        booking.user_id,
        'Booking Status Updated',
        statusMessages[status],
        status === 'confirmed' ? 'success' : 'info'
      );
    }

    res.status(200).json({
      success: true,
      data: {
        booking: result.rows[0]
      },
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    next(error);
  }
};

// @desc    Process refund (admin)
// @route   POST /api/admin/refunds/:bookingId
// @access  Private/Admin
exports.processRefund = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const { amount, reason } = req.body;

    // Get booking
    const bookingResult = await query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    // Update booking payment status
    await query(
      `UPDATE bookings 
       SET payment_status = 'refunded', updated_at = NOW()
       WHERE id = $1`,
      [bookingId]
    );

    // Create refund payment record (if payments table exists)
    try {
      await query(
        `INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status)
         VALUES ($1, $2, 'refund', $3, 'completed')
         RETURNING *`,
        [bookingId, amount || booking.total_price, `REFUND-${Date.now()}`]
      );
    } catch (err) {
      // Payments table might have different structure, skip if error
      console.log('Note: Could not create refund record:', err.message);
    }

    // Create notification
    await notificationController.createNotification(
      booking.user_id,
      'Refund Processed',
      `Your refund of R${amount || booking.total_price} has been processed. ${reason || ''}`,
      'success'
    );

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Process refund error:', error);
    next(error);
  }
};

