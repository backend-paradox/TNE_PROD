const paymentService = require('../services/paymentService');

class PaymentController {
  async createOrder(req, res, next) {
    try {
      const { bookingId, amount, currency, notes, receipt, userId: bodyUserId } = req.body;
      const userId = req.user?.id || Number(bodyUserId);

      if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'userId is required',
        });
      }

      const result = await paymentService.createOrder({
        bookingId,
        userId,
        amount,
        currency,
        notes,
        receipt,
      });

      const { payment, razorpayOrder } = result;

      res.status(201).json({
        success: true,
        message: 'Payment order created successfully',
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          bookingId: payment.bookingId,
          amount: payment.amount,
          currency: payment.currency,
          razorpayOrderId: razorpayOrder.id,
          razorpayOrderAmount: razorpayOrder.amount,
          razorpayOrderCurrency: razorpayOrder.currency,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          payment,
          razorpayOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const payment = await paymentService.verifyPayment({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          bookingId: payment.bookingId,
          status: payment.status,
          amount: payment.amount,
          paidAt: payment.paidAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async handlePaymentFailure(req, res, next) {
    try {
      const { razorpayOrderId, errorCode, errorDescription } = req.body;

      const payment = await paymentService.handlePaymentFailure({
        razorpayOrderId,
        errorCode,
        errorDescription,
      });

      res.status(200).json({
        success: true,
        message: 'Payment failure recorded',
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          status: payment.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const paymentId = parseInt(req.params.id, 10);

      const payment = await paymentService.getPaymentById(paymentId);

      // Check if user owns this payment (unless admin)
      if (req.user.role !== 'ADMIN' && payment.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this payment',
        });
      }

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentByOrderId(req, res, next) {
    try {
      const { orderId } = req.params;

      const payment = await paymentService.getPaymentByOrderId(orderId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      // Check if user owns this payment (unless admin)
      if (req.user.role !== 'ADMIN' && payment.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this payment',
        });
      }

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsByBookingId(req, res, next) {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);

      const payments = await paymentService.getPaymentsByBookingId(bookingId);

      // Check if user owns these payments (unless admin)
      if (req.user.role !== 'ADMIN' && payments.length > 0 && payments[0].userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access these payments',
        });
      }

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyPayments(req, res, next) {
    try {
      const userId = req.user.id;
      const { page, limit } = req.query;

      const result = await paymentService.getPaymentsByUserId(userId, {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      });

      res.status(200).json({
        success: true,
        data: result.payments,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async initiateRefund(req, res, next) {
    try {
      const paymentId = parseInt(req.params.id, 10);
      const { amount, reason, notes } = req.body;

      // Get payment to check ownership
      const payment = await paymentService.getPaymentById(paymentId);

      // Only admin or payment owner can initiate refund
      if (req.user.role !== 'ADMIN' && payment.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to refund this payment',
        });
      }

      const refund = await paymentService.initiateRefund({
        paymentId,
        amount,
        reason,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Refund initiated successfully',
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRefundsByPaymentId(req, res, next) {
    try {
      const paymentId = parseInt(req.params.id, 10);

      // Get payment to check ownership
      const payment = await paymentService.getPaymentById(paymentId);

      // Check if user owns this payment (unless admin)
      if (req.user.role !== 'ADMIN' && payment.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access these refunds',
        });
      }

      const refunds = await paymentService.getRefundsByPaymentId(paymentId);

      res.status(200).json({
        success: true,
        data: refunds,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
