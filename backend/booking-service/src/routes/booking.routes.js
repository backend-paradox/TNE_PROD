const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../../../shared/src/middleware/auth');
const { validate } = require('../../../shared/src/middleware/validate');
const {
  createHotelBookingSchema,
  createFlightBookingSchema,
  createPackageBookingSchema,
  cancelBookingSchema,
  updateBookingStatusSchema,
  getBookingsSchema,
} = require('../validators/booking.validator');

// ============ User Booking Routes ============

// POST /api/v1/bookings/hotels - Create hotel booking
router.post(
  '/hotels',
  authenticate,
  validate(createHotelBookingSchema),
  bookingController.createHotelBooking
);

// POST /api/v1/bookings/flights - Create flight booking
router.post(
  '/flights',
  authenticate,
  validate(createFlightBookingSchema),
  bookingController.createFlightBooking
);

// POST /api/v1/bookings/packages - Create package booking
router.post(
  '/packages',
  authenticate,
  validate(createPackageBookingSchema),
  bookingController.createPackageBooking
);

// GET /api/v1/bookings - Get user bookings
router.get(
  '/',
  authenticate,
  validate(getBookingsSchema),
  bookingController.getUserBookings
);

// GET /api/v1/bookings/test-pdf - Generate test PDF with mock data (for preview)
// NOTE: This must come BEFORE /:id route to avoid matching "test-pdf" as an ID
router.get('/test-pdf', bookingController.generateTestPDF);

// ============ Webhook Routes (Internal) ============

// POST /api/v1/bookings/webhooks/payment - Handle payment webhook from payment service
// NOTE: No authentication middleware - internal service-to-service call
// IMPORTANT: Must be BEFORE /:id routes to avoid matching "webhooks" as an ID
router.post('/webhooks/payment', bookingController.handlePaymentWebhook);

// GET /api/v1/bookings/number/:bookingNumber - Get booking by booking number
router.get('/number/:bookingNumber', authenticate, bookingController.getBookingByNumber);

// GET /api/v1/bookings/:id - Get booking by ID
router.get('/:id', authenticate, bookingController.getBookingById);

// GET /api/v1/bookings/:id/voucher - Get booking voucher/ticket
router.get('/:id/voucher', authenticate, bookingController.getBookingVoucher);

// GET /api/v1/bookings/:id/pdf - Download itinerary PDF
router.get('/:id/pdf', authenticate, bookingController.downloadBookingPDF);

// POST /api/v1/bookings/:id/payment - Initiate payment
router.post('/:id/payment', authenticate, bookingController.initiatePayment);

// POST /api/v1/bookings/:id/confirm - Confirm booking after payment
router.post('/:id/confirm', authenticate, bookingController.confirmBooking);

// POST /api/v1/bookings/:id/cancel - Cancel booking
router.post(
  '/:id/cancel',
  authenticate,
  validate(cancelBookingSchema),
  bookingController.cancelBooking
);

// ============ Admin Routes ============

// GET /api/v1/bookings/admin/all - Get all bookings (admin)
router.get(
  '/admin/all',
  authenticate,
  authorize(['ADMIN']),
  validate(getBookingsSchema),
  bookingController.getAllBookings
);

// PUT /api/v1/bookings/:id/status - Update booking status (admin)
router.put(
  '/:id/status',
  authenticate,
  authorize(['ADMIN']),
  validate(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

module.exports = router;
