const bookingService = require('../services/bookingService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

// PDF generation timeout (30 seconds)
const PDF_GENERATION_TIMEOUT = 30000;

/**
 * Wrap a promise with a timeout
 * @param {Promise} promise - The promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @param {string} errorMessage - Error message if timeout occurs
 * @returns {Promise} - The original promise or rejection on timeout
 */
const withTimeout = (promise, ms, errorMessage) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  return Promise.race([promise, timeout]);
};

/**
 * @desc    Create hotel booking
 * @route   POST /api/v1/bookings/hotels
 * @access  Private
 */
const createHotelBooking = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const bookingData = {
    userId,
    ...req.body,
  };

  const booking = await bookingService.createHotelBooking(bookingData);

  res.status(201).json(
    ApiResponse.success(booking, 'Hotel booking created successfully')
  );
});

/**
 * @desc    Create flight booking
 * @route   POST /api/v1/bookings/flights
 * @access  Private
 */
const createFlightBooking = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const bookingData = {
    userId,
    ...req.body,
  };

  const booking = await bookingService.createFlightBooking(bookingData);

  res.status(201).json(
    ApiResponse.success(booking, 'Flight booking created successfully')
  );
});

/**
 * @desc    Get user bookings
 * @route   GET /api/v1/bookings
 * @access  Private
 */
const getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page, limit, status, type } = req.query;

  const result = await bookingService.getUserBookings(userId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    status,
    type,
  });

  res.status(200).json(
    ApiResponse.success(result, 'Bookings retrieved successfully')
  );
});

/**
 * @desc    Get booking by ID
 * @route   GET /api/v1/bookings/:id
 * @access  Private
 */
const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const booking = await bookingService.getBookingById(parseInt(id));

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check ownership (unless admin)
  if (booking.userId !== userId && req.user.role !== 'ADMIN') {
    throw ApiError.forbidden('Access denied');
  }

  res.status(200).json(
    ApiResponse.success(booking, 'Booking retrieved successfully')
  );
});

/**
 * @desc    Get booking by booking number
 * @route   GET /api/v1/bookings/number/:bookingNumber
 * @access  Private
 */
const getBookingByNumber = asyncHandler(async (req, res) => {
  const { bookingNumber } = req.params;
  const userId = req.user.id;

  const booking = await bookingService.getBookingByNumber(bookingNumber);

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check ownership (unless admin)
  if (booking.userId !== userId && req.user.role !== 'ADMIN') {
    throw ApiError.forbidden('Access denied');
  }

  res.status(200).json(
    ApiResponse.success(booking, 'Booking retrieved successfully')
  );
});

/**
 * @desc    Initiate payment for booking
 * @route   POST /api/v1/bookings/:id/payment
 * @access  Private
 */
const initiatePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Verify ownership
  const booking = await bookingService.getBookingById(parseInt(id));
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  const paymentData = await bookingService.initiatePayment(parseInt(id));

  res.status(200).json(
    ApiResponse.success(paymentData, 'Payment initiated successfully')
  );
});

/**
 * @desc    Confirm booking after payment
 * @route   POST /api/v1/bookings/:id/confirm
 * @access  Private
 */
const confirmBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const paymentDetails = req.body;

  // Verify ownership
  const existingBooking = await bookingService.getBookingById(parseInt(id));
  if (!existingBooking) {
    throw ApiError.notFound('Booking not found');
  }

  if (existingBooking.userId !== userId && req.user.role !== 'ADMIN') {
    throw ApiError.forbidden('Access denied');
  }

  const booking = await bookingService.confirmBooking(parseInt(id), paymentDetails);

  res.status(200).json(
    ApiResponse.success(booking, 'Booking confirmed successfully')
  );
});

/**
 * @desc    Cancel booking
 * @route   POST /api/v1/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { cancellationReason } = req.body;

  const booking = await bookingService.cancelBooking(
    parseInt(id),
    userId,
    cancellationReason
  );

  res.status(200).json(
    ApiResponse.success(booking, 'Booking cancelled successfully')
  );
});

/**
 * @desc    Get all bookings (admin)
 * @route   GET /api/v1/bookings/admin/all
 * @access  Private/Admin
 */
const getAllBookings = asyncHandler(async (req, res) => {
  const { page, limit, status, type, search } = req.query;

  const result = await bookingService.getAllBookings({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    status,
    type,
    search,
  });

  res.status(200).json(
    ApiResponse.success(result, 'Bookings retrieved successfully')
  );
});

/**
 * @desc    Update booking status (admin)
 * @route   PUT /api/v1/bookings/:id/status
 * @access  Private/Admin
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const booking = await bookingService.updateBookingStatus(parseInt(id), status);

  res.status(200).json(
    ApiResponse.success(booking, 'Booking status updated successfully')
  );
});

/**
 * @desc    Create package booking
 * @route   POST /api/v1/bookings/packages
 * @access  Private
 */
const createPackageBooking = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const bookingData = {
    userId,
    ...req.body,
  };

  const booking = await bookingService.createPackageBooking(bookingData);

  res.status(201).json(
    ApiResponse.success(booking, 'Package booking created successfully')
  );
});

/**
 * @desc    Get booking voucher
 * @route   GET /api/v1/bookings/:id/voucher
 * @access  Private
 */
const getBookingVoucher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const voucher = await bookingService.generateVoucher(parseInt(id), userId);

  res.status(200).json(
    ApiResponse.success(voucher, 'Voucher generated successfully')
  );
});

/**
 * @desc    Generate test PDF with mock data (for preview)
 * @route   GET /api/v1/bookings/test-pdf
 * @access  Public
 */
const generateTestPDF = asyncHandler(async (req, res) => {
  const { mockBooking, mockPackage, mockUser } = require('../services/mockData');

  // Generate PDF with mock data (with 30-second timeout)
  const PDFGenerator = require('../services/pdf/pdfGenerator');
  const pdfGenerator = new PDFGenerator();

  let pdfBuffer;
  try {
    pdfBuffer = await withTimeout(
      pdfGenerator.generateItinerary({
        booking: mockBooking,
        package: mockPackage,
        user: mockUser
      }),
      PDF_GENERATION_TIMEOUT,
      'PDF generation timed out after 30 seconds'
    );
  } catch (error) {
    if (error.message.includes('timed out')) {
      throw ApiError.internal('PDF generation is taking too long. Please try again later.');
    }
    throw error;
  }

  // Set response headers for PDF download
  const filename = `TNE-${mockBooking.bookingNumber}-PREVIEW.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', pdfBuffer.length);

  // Send PDF buffer
  res.send(pdfBuffer);
});

/**
 * @desc    Download itinerary PDF
 * @route   GET /api/v1/bookings/:id/pdf
 * @access  Private
 */
const downloadBookingPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const booking = await bookingService.getBookingById(parseInt(id));

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check ownership (unless admin)
  if (booking.userId !== userId && req.user.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to access this booking');
  }

  // Only generate PDF for confirmed or completed bookings
  if (!['CONFIRMED', 'COMPLETED'].includes(booking.status)) {
    throw ApiError.badRequest('PDF is only available for confirmed bookings');
  }

  // Generate PDF with 30-second timeout
  let pdfBuffer;
  try {
    pdfBuffer = await withTimeout(
      bookingService.generateItineraryPDF(parseInt(id)),
      PDF_GENERATION_TIMEOUT,
      'PDF generation timed out after 30 seconds'
    );
  } catch (error) {
    if (error.message.includes('timed out')) {
      throw ApiError.internal('PDF generation is taking too long. Please try again later.');
    }
    throw error;
  }

  // Set response headers for PDF download
  const filename = `TNE-${booking.bookingNumber}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', pdfBuffer.length);

  // Send PDF buffer
  res.send(pdfBuffer);
});

/**
 * @desc    Handle payment webhook from payment service
 * @route   POST /api/v1/bookings/webhooks/payment
 * @access  Internal (from payment service)
 */
const handlePaymentWebhook = asyncHandler(async (req, res) => {
  const { bookingId, event, data } = req.body;

  if (!bookingId || !event) {
    throw ApiError.badRequest('Missing required webhook data');
  }

  // Optional: Verify internal service secret
  const serviceSecret = req.headers['x-service-secret'];
  if (serviceSecret !== process.env.SERVICE_SECRET) {
    console.warn('Invalid service secret in webhook');
    // Still process but log the warning for monitoring
  }

  let result;
  switch (event) {
    case 'PAYMENT_SUCCESS':
      result = await bookingService.confirmBooking(bookingId, data);
      break;

    case 'PAYMENT_FAILED':
      result = await bookingService.handlePaymentFailure(bookingId, data.reason || 'Payment failed');
      break;

    case 'REFUND_SUCCESS':
      result = await bookingService.handleRefundSuccess(bookingId, data);
      break;

    default:
      console.log(`Unhandled webhook event: ${event}`);
      result = { message: 'Event received but not processed' };
  }

  res.status(200).json(
    ApiResponse.success(result, `Webhook ${event} processed successfully`)
  );
});

module.exports = {
  createHotelBooking,
  createFlightBooking,
  createPackageBooking,
  getUserBookings,
  getBookingById,
  getBookingByNumber,
  getBookingVoucher,
  generateTestPDF,
  downloadBookingPDF,
  initiatePayment,
  confirmBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  handlePaymentWebhook,
};
