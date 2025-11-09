// Initialize Stripe with error handling
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } else {
    console.warn('⚠️  STRIPE_SECRET_KEY not set in environment variables');
    stripe = null;
  }
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error.message);
  stripe = null;
}
const { query } = require('../config/database');
const notificationController = require('./notificationController');

// Create Stripe Payment Intent
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.user_id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Get booking details
    const bookingResult = await query(
      `SELECT b.*, h.name as hotel_name 
       FROM bookings b
       JOIN hotels h ON b.hotel_id = h.id
       WHERE b.id = $1 AND b.user_id = $2`,
      [bookingId, userId]
    );

    if (bookingResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    // Check if payment already exists
    if (booking.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking already paid'
      });
    }

    // Validate Stripe is configured and initialized
    if (!process.env.STRIPE_SECRET_KEY || !stripe) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      });
    }

    // Create Stripe Payment Intent
    // Convert ZAR to cents (ZAR uses 2 decimal places, same as USD)
    const amountInCents = Math.round(parseFloat(booking.total_price) * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'zar', // Using ZAR for South African Rand
      metadata: {
        booking_id: bookingId,
        user_id: userId,
        hotel_name: booking.hotel_name,
        hotel_id: booking.hotel_id
      },
      description: `Booking payment for ${booking.hotel_name}`,
      receipt_email: req.user.email || undefined // Add receipt email if available
    });

    // Store payment intent ID in database (optional, for tracking)
    // Note: If payment_intent_id column doesn't exist, this will fail silently
    // You can add it with: ALTER TABLE bookings ADD COLUMN payment_intent_id VARCHAR(255);
    try {
      await query(
        `UPDATE bookings 
         SET payment_intent_id = $1, updated_at = NOW()
         WHERE id = $2`,
        [paymentIntent.id, bookingId]
      );
    } catch (err) {
      // Column might not exist, that's okay - payment will still work
      console.log('Note: payment_intent_id column may not exist in bookings table');
    }

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    next(error);
  }
};

// Confirm Payment
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, bookingId } = req.body;
    const userId = req.user.user_id;

    if (!paymentIntentId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID and Booking ID are required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify booking ownership
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

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Update booking payment status
      await query(
        `UPDATE bookings 
         SET payment_status = 'paid', status = 'confirmed', updated_at = NOW()
         WHERE id = $1`,
        [bookingId]
      );

      // Create payment record
      await query(
        `INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status)
         VALUES ($1, $2, $3, $4, 'completed')
         RETURNING *`,
        [
          bookingId,
          booking.total_price,
          paymentIntent.payment_method_types[0] || 'card',
          paymentIntentId
        ]
      );

      // Create notification for successful payment
      await notificationController.createNotification(
        userId,
        'Payment Successful',
        `Your payment of R${booking.total_price} has been processed successfully. Your booking is confirmed!`,
        'success'
      );

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        booking: {
          id: booking.id,
          payment_status: 'paid',
          status: 'confirmed'
        }
      });
    } else {
      // Payment failed or pending
      await query(
        `UPDATE bookings 
         SET payment_status = 'pending', updated_at = NOW()
         WHERE id = $1`,
        [bookingId]
      );

      return res.status(400).json({
        success: false,
        message: `Payment status: ${paymentIntent.status}`,
        paymentStatus: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    next(error);
  }
};

// Webhook handler for Stripe events (optional, for production)
exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update booking payment status
      await query(
        `UPDATE bookings 
         SET payment_status = 'paid', status = 'confirmed', updated_at = NOW()
         WHERE payment_intent_id = $1`,
        [paymentIntent.id]
      );
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await query(
        `UPDATE bookings 
         SET payment_status = 'pending', updated_at = NOW()
         WHERE payment_intent_id = $1`,
        [failedPayment.id]
      );
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

