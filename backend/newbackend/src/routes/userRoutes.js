const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');
const { validateUpdateProfile, validateUpdatePassword } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', validateUpdateProfile, userController.updateProfile);

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', validateUpdatePassword, userController.updatePassword);

// Favorites routes
// @route   GET /api/users/favorites
// @desc    Get user favorites
// @access  Private
router.get('/favorites', userController.getFavorites);

// @route   POST /api/users/favorites
// @desc    Add hotel to favorites
// @access  Private
router.post('/favorites', userController.addFavorite);

// @route   DELETE /api/users/favorites/:hotelId
// @desc    Remove hotel from favorites
// @access  Private
router.delete('/favorites/:hotelId', userController.removeFavorite);

// @route   GET /api/users/favorites/check/:hotelId
// @desc    Check if hotel is favorited
// @access  Private
router.get('/favorites/check/:hotelId', userController.checkFavorite);

// Reviews routes
const reviewController = require('../controllers/reviewController');

// @route   GET /api/users/hotels/:hotelId/reviews
// @desc    Get reviews for a hotel
// @access  Public (removed protect for public access to reviews)
router.get('/hotels/:hotelId/reviews', reviewController.getHotelReviews);

// @route   POST /api/users/hotels/:hotelId/reviews
// @desc    Create review for a hotel
// @access  Private
router.post('/hotels/:hotelId/reviews', protect, reviewController.createReview);

// @route   GET /api/users/reviews
// @desc    Get user's reviews
// @access  Private
router.get('/reviews', reviewController.getMyReviews);

// @route   PUT /api/users/reviews/:reviewId
// @desc    Update review
// @access  Private
router.put('/reviews/:reviewId', reviewController.updateReview);

// @route   DELETE /api/users/reviews/:reviewId
// @desc    Delete review
// @access  Private
router.delete('/reviews/:reviewId', reviewController.deleteReview);

// Notifications routes
const notificationController = require('../controllers/notificationController');

// @route   GET /api/users/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', notificationController.getNotifications);

// @route   GET /api/users/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/notifications/unread-count', notificationController.getUnreadCount);

// @route   PUT /api/users/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id/read', notificationController.markNotificationRead);

// @route   PUT /api/users/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/notifications/read-all', notificationController.markAllRead);

// @route   DELETE /api/users/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/notifications/:id', notificationController.deleteNotification);

module.exports = router;
