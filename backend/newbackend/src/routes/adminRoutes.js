const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', adminController.getDashboardStats);

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', adminController.getAllUsers);

// @route   GET /api/admin/hotels
// @desc    Get all hotels (Admin only)
// @access  Private/Admin
router.get('/hotels', adminController.getAllHotels);

// @route   POST /api/admin/hotels
// @desc    Create hotel (Admin only)
// @access  Private/Admin
router.post('/hotels', adminController.createHotel);

// @route   PUT /api/admin/hotels/:id
// @desc    Update hotel (Admin only)
// @access  Private/Admin
router.put('/hotels/:id', adminController.updateHotel);

// @route   DELETE /api/admin/hotels/:id
// @desc    Delete hotel (Admin only)
// @access  Private/Admin
router.delete('/hotels/:id', adminController.deleteHotel);

// @route   GET /api/admin/bookings
// @desc    Get all bookings (Admin only)
// @access  Private/Admin
router.get('/bookings', adminController.getAllBookings);

// @route   PUT /api/admin/bookings/:id/status
// @desc    Update booking status (Admin only)
// @access  Private/Admin
router.put('/bookings/:id/status', adminController.updateBookingStatus);

// @route   POST /api/admin/refunds/:bookingId
// @desc    Process refund (Admin only)
// @access  Private/Admin
router.post('/refunds/:bookingId', adminController.processRefund);

module.exports = router;

