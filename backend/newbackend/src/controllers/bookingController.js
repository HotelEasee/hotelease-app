const { query } = require('../config/database');
const notificationController = require('./notificationController');

// Create a new booking
exports.createBooking = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const {
      hotel_id,
      check_in_date,
      check_out_date,
      number_of_guests = 1,
      number_of_rooms = 1,
      guest_details
    } = req.body;

    // Validation
    if (!hotel_id || !check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'hotel_id, check_in_date, and check_out_date are required'
      });
    }

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Get hotel details
    const hotelResult = await query('SELECT * FROM hotels WHERE id = $1', [hotel_id]);
    if (hotelResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    const hotel = hotelResult.rows[0];

    // Calculate nights
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    // Calculate total price
    const basePrice = hotel.price_per_night * nights * number_of_rooms;
    const taxes = basePrice * 0.15; // 15% VAT
    const fees = 0; // Can be calculated separately if needed
    const discounts = 0; // Can be calculated separately if needed
    const totalPrice = basePrice + taxes + fees - discounts;

    // Generate booking reference
    const bookingRef = `BK${Date.now().toString().slice(-8)}`;

    // Create booking
    const bookingResult = await query(
      `INSERT INTO bookings (
        booking_reference, user_id, hotel_id, check_in_date, check_out_date, nights, 
        adults, children, rooms, base_price, taxes, fees, discounts, total_price, 
        status, payment_status, currency
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        bookingRef,
        userId,
        hotel_id,
        check_in_date,
        check_out_date,
        nights,
        number_of_guests || 1,
        0, // children
        number_of_rooms || 1,
        basePrice,
        taxes,
        fees,
        discounts,
        totalPrice,
        'pending',
        'pending',
        'ZAR'
      ]
    );

    const booking = bookingResult.rows[0];

    // Create notification for user
    await notificationController.createNotification(
      userId,
      'Booking Created',
      `Your booking has been created successfully. Total: R${totalPrice.toFixed(2)}`,
      'success'
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        hotel_id: booking.hotel_id,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        nights: booking.nights,
        total_price: booking.total_price,
        status: booking.status,
        payment_status: booking.payment_status,
        created_at: booking.created_at
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    next(error);
  }
};

// Get all bookings for current user
exports.getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { status, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const conditions = ['b.user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      params.push(status);
      conditions.push(`b.status = $${paramIndex}`);
      paramIndex++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*)::int AS count FROM bookings b ${whereClause}`,
      params
    );
    const total = countResult.rows[0].count;

    // Get bookings with hotel details
    params.push(limit, offset);
    const bookingsResult = await query(
      `SELECT 
        b.*, 
        h.name as hotel_name, 
        h.location, 
        h.address
       FROM bookings b
       JOIN hotels h ON b.hotel_id = h.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.status(200).json({
      success: true,
      bookings: bookingsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    next(error);
  }
};

// Get single booking
exports.getBookingById = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const bookingId = req.params.id;

    const result = await query(
      `SELECT 
        b.*, 
        h.name as hotel_name, 
        h.location, 
        h.address,
        h.description
       FROM bookings b
       JOIN hotels h ON b.hotel_id = h.id
       WHERE b.id = $1 AND b.user_id = $2`,
      [bookingId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Get booking error:', error);
    next(error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const bookingId = req.params.id;
    const { reason } = req.body;

    // Get booking
    const bookingResult = await query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (bookingResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Update booking status
    await query(
      `UPDATE bookings 
       SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [bookingId]
    );

    // If payment was made, initiate refund (this would need Stripe refund logic)
    if (booking.payment_status === 'paid') {
      // TODO: Implement refund logic with Stripe
      await query(
        `UPDATE bookings 
         SET payment_status = 'refunded', updated_at = NOW()
         WHERE id = $1`,
        [bookingId]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    next(error);
  }
};

