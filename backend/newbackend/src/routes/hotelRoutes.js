const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// @route   GET /api/hotels
// @desc    Get all hotels
// @access  Public
router.get('/', hotelController.listHotels);

// @route   GET /api/hotels/:id
// @desc    Get single hotel
// @access  Public
router.get('/:id', hotelController.getHotel);

// @route   POST /api/hotels
// @desc    Create hotel (Admin only)
// @access  Private/Admin
router.post('/', hotelController.createHotel);

// @route   PUT /api/hotels/:id
// @desc    Update hotel (Admin only)
// @access  Private/Admin
router.put('/:id', hotelController.updateHotel);

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel (Admin only)
// @access  Private/Admin
router.delete('/:id', hotelController.deleteHotel);

module.exports = router;
