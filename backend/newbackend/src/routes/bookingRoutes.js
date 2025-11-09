const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');
const paymentController = require('../controllers/paymentController');
const { validateCreateBooking } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// @route   GET /api/bookings/my-bookings
// @desc    Get all bookings for current user
// @access  Private
router.get('/my-bookings', bookingController.getMyBookings);

// @route   GET /api/bookings
// @desc    Get all bookings for user (alias)
// @access  Private
router.get('/', bookingController.getMyBookings);

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', bookingController.getBookingById);

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', validateCreateBooking, bookingController.createBooking);

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', bookingController.cancelBooking);

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking (alternative endpoint)
// @access  Private
router.delete('/:id', bookingController.cancelBooking);

// Payment routes
// @route   POST /api/bookings/payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/payment-intent', paymentController.createPaymentIntent);

// @route   POST /api/bookings/confirm-payment
// @desc    Confirm payment after Stripe payment
// @access  Private
router.post('/confirm-payment', paymentController.confirmPayment);

module.exports = router;
