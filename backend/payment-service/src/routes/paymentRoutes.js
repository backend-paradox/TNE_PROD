const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const {
  createOrderSchema,
  verifyPaymentSchema,
  paymentFailureSchema,
  initiateRefundSchema,
  paginationSchema,
} = require('../validators/payment.validator');

// Middleware
const { authenticate } = require('../../../shared/src/middleware/auth');

const ALLOWED_INTERNAL_SERVICES = ['booking-service'];

const authenticateOrInternal = (req, res, next) => {
  const internalService = req.headers['x-internal-service'];
  if (internalService && ALLOWED_INTERNAL_SERVICES.includes(internalService)) {
    return next();
  }
  return authenticate(req, res, next);
};

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors,
    });
  }
};

// Create order (requires authentication)
router.post(
  '/orders',
  authenticateOrInternal,
  validate(createOrderSchema),
  paymentController.createOrder
);

// Verify payment (requires authentication)
router.post(
  '/verify',
  authenticate,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

// Handle payment failure (requires authentication)
router.post(
  '/failure',
  authenticate,
  validate(paymentFailureSchema),
  paymentController.handlePaymentFailure
);

// Get payment by ID (requires authentication)
router.get(
  '/:id',
  authenticate,
  paymentController.getPaymentById
);

// Get payment by order ID (requires authentication)
router.get(
  '/order/:orderId',
  authenticate,
  paymentController.getPaymentByOrderId
);

// Get payments by booking ID (requires authentication)
router.get(
  '/booking/:bookingId',
  authenticate,
  paymentController.getPaymentsByBookingId
);

// Get my payments (requires authentication)
router.get(
  '/',
  authenticate,
  validate(paginationSchema),
  paymentController.getMyPayments
);

// Initiate refund (requires authentication)
router.post(
  '/:id/refund',
  authenticate,
  validate(initiateRefundSchema),
  paymentController.initiateRefund
);

// Get refunds by payment ID (requires authentication)
router.get(
  '/:id/refunds',
  authenticate,
  paymentController.getRefundsByPaymentId
);

module.exports = router;
