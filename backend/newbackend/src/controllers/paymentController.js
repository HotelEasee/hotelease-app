// Initialize Stripe with error handling
let stripe;
let stripeInitialized = false;

// Function to initialize Stripe (can be called multiple times)
const initializeStripe = () => {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (stripeKey) {
      // Check if user accidentally used publishable key instead of secret key
      if (stripeKey.startsWith('pk_test_') || stripeKey.startsWith('pk_live_')) {
        console.error('❌ ERROR: STRIPE_SECRET_KEY contains a PUBLISHABLE key instead of a SECRET key!');
        console.error('   Publishable keys start with: pk_test_ or pk_live_');
        console.error('   Secret keys start with: sk_test_ or sk_live_');
        console.error('   You need to set the SECRET key (sk_test_...) in Render environment variables.');
        console.error('   The publishable key should be set as STRIPE_PUBLISHABLE_KEY (for frontend).');
        stripe = null;
        stripeInitialized = false;
        return;
      }
      
      // Check if key looks valid (starts with sk_test_ or sk_live_)
      if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_')) {
        console.warn('⚠️  STRIPE_SECRET_KEY format looks invalid (should start with sk_test_ or sk_live_)');
        console.warn(`   Current key starts with: ${stripeKey.substring(0, 10)}...`);
        console.warn('   Make sure you are using the SECRET key, not the publishable key!');
      }
      
      stripe = require('stripe')(stripeKey);
      stripeInitialized = true;
      console.log('✅ Stripe initialized successfully');
      console.log(`   Key type: ${stripeKey.startsWith('sk_test_') ? 'Test' : 'Live'}`);
    } else {
      console.warn('⚠️  STRIPE_SECRET_KEY not set in environment variables');
      console.warn('   Available STRIPE env vars:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
      stripe = null;
      stripeInitialized = false;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error.message);
    stripe = null;
    stripeInitialized = false;
  }
};

// Initialize on module load
initializeStripe();
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
    // Try to reinitialize if not already initialized (in case env var was added after server start)
    if (!stripeInitialized || !stripe) {
      initializeStripe();
    }
    
    // Check if user accidentally used publishable key
    if (process.env.STRIPE_SECRET_KEY && (process.env.STRIPE_SECRET_KEY.startsWith('pk_test_') || process.env.STRIPE_SECRET_KEY.startsWith('pk_live_'))) {
      console.error('❌ CRITICAL ERROR: STRIPE_SECRET_KEY contains a PUBLISHABLE key!');
      console.error('   You set a publishable key (pk_test_...) where a secret key (sk_test_...) is required.');
      
      return res.status(500).json({
        success: false,
        message: 'Invalid Stripe key type. STRIPE_SECRET_KEY must be a SECRET key (starts with sk_test_ or sk_live_), not a publishable key (pk_test_ or pk_live_). Please check your Render environment variables.',
        error: 'Publishable key used instead of secret key',
        hint: 'In Stripe Dashboard, copy the "Secret key" (sk_test_...) not the "Publishable key" (pk_test_...)'
      });
    }
    
    if (!process.env.STRIPE_SECRET_KEY || !stripe || !stripeInitialized) {
      console.error('❌ Stripe configuration check failed:');
      console.error(`   STRIPE_SECRET_KEY exists: ${!!process.env.STRIPE_SECRET_KEY}`);
      console.error(`   Stripe instance exists: ${!!stripe}`);
      console.error(`   Stripe initialized: ${stripeInitialized}`);
      console.error('   Available env vars with STRIPE:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
      
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please set STRIPE_SECRET_KEY in environment variables.',
        hint: 'Make sure you are using the SECRET key (sk_test_...) not the publishable key (pk_test_...)',
        debug: process.env.NODE_ENV === 'development' ? {
          hasKey: !!process.env.STRIPE_SECRET_KEY,
          keyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'not set',
          stripeInitialized: stripeInitialized
        } : undefined
      });
    }

    // Create Stripe Payment Intent
    // Convert ZAR to cents (ZAR uses 2 decimal places, same as USD)
    const amountInCents = Math.round(parseFloat(booking.total_price) * 100);
    
    if (amountInCents <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking amount. Total price must be greater than 0.'
      });
    }
    
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
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      },
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripePermissionError' || error.code === 'secret_key_required') {
      return res.status(500).json({
        success: false,
        message: 'Stripe configuration error: Invalid API key type. You are using a publishable key (pk_test_...) where a secret key (sk_test_...) is required.',
        error: 'Please set STRIPE_SECRET_KEY in Render with your SECRET key from Stripe Dashboard (starts with sk_test_ or sk_live_)',
        hint: 'In Stripe Dashboard > Developers > API keys, copy the "Secret key" not the "Publishable key"'
      });
    }
    
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

      // Create payment record (if payments table exists with these columns)
      try {
        // Try to insert with payment_method column
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
      } catch (paymentError) {
        // If payment_method column doesn't exist, try without it
        if (paymentError.code === '42703') {
          try {
            await query(
              `INSERT INTO payments (booking_id, amount, transaction_id, status)
               VALUES ($1, $2, $3, 'completed')
               RETURNING *`,
              [
                bookingId,
                booking.total_price,
                paymentIntentId
              ]
            );
          } catch (secondError) {
            // If payments table doesn't exist or has different structure, just log it
            console.log('Note: Could not create payment record. Payments table may not exist or have different structure.');
            console.log('Payment was still successful, but record was not saved to payments table.');
          }
        } else {
          // Re-throw if it's a different error
          throw paymentError;
        }
      }

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

