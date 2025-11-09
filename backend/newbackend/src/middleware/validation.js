const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation
exports.validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Hotel validation
exports.validateCreateHotel = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Hotel name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Hotel name must be between 2 and 255 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('price_per_night')
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),
  handleValidationErrors
];

exports.validateUpdateHotel = [
  param('id')
    .isInt()
    .withMessage('Invalid hotel ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Hotel name must be between 2 and 255 characters'),
  body('price_per_night')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),
  handleValidationErrors
];

// Booking validation
exports.validateCreateBooking = [
  body('hotel_id')
    .notEmpty()
    .withMessage('Valid hotel ID is required')
    .isUUID()
    .withMessage('Hotel ID must be a valid UUID'),
  body('check_in_date')
    .isISO8601()
    .toDate()
    .withMessage('Valid check-in date is required'),
  body('check_out_date')
    .isISO8601()
    .toDate()
    .withMessage('Valid check-out date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.check_in_date)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('number_of_guests')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of guests must be at least 1'),
  body('number_of_rooms')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of rooms must be at least 1'),
  handleValidationErrors
];

// Review validation
exports.validateCreateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
  handleValidationErrors
];

// Password validation
exports.validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors
];

// Profile validation
exports.validateUpdateProfile = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('First name must be less than 100 characters'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Last name must be less than 100 characters'),
  handleValidationErrors
];

