const prisma = require('../config/prisma');
const { getRazorpayInstance } = require('../config/razorpay');
const { verifyRazorpaySignature } = require('../utils/signature');

class PaymentService {
  async createOrder({ bookingId, userId, amount, currency = 'INR', notes = {}, receipt }) {
    const razorpay = getRazorpayInstance();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `booking_${bookingId}_${Date.now()}`,
      notes: {
        booking_id: bookingId.toString(),
        user_id: userId.toString(),
        ...notes,
      },
    });

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        orderId: `ORDER_${Date.now()}_${bookingId}`,
        bookingId,
        userId,
        amount,
        currency,
        status: 'PENDING',
        razorpayOrderId: razorpayOrder.id,
        receipt: razorpayOrder.receipt,
        notes: razorpayOrder.notes,
        metadata: {
          razorpayOrderCreatedAt: razorpayOrder.created_at,
          razorpayOrderStatus: razorpayOrder.status,
        },
      },
    });

    return {
      payment,
      razorpayOrder,
    };
  }

  async verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Find payment by Razorpay order ID
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Fetch payment details from Razorpay
    const razorpay = getRazorpayInstance();
    const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

    // Extract payment method details
    const paymentMethodDetails = this.extractPaymentMethodDetails(razorpayPayment);

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod: this.mapPaymentMethod(razorpayPayment.method),
        ...paymentMethodDetails,
        paidAt: new Date(razorpayPayment.created_at * 1000),
        metadata: {
          ...payment.metadata,
          razorpayPaymentDetails: razorpayPayment,
        },
      },
    });

    return updatedPayment;
  }

  async handlePaymentFailure({ razorpayOrderId, errorCode, errorDescription }) {
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        errorCode,
        errorDescription,
        failureReason: errorDescription,
      },
    });

    return updatedPayment;
  }

  async getPaymentById(id) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        refunds: true,
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  async getPaymentByOrderId(orderId) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        refunds: true,
      },
    });

    return payment;
  }

  async getPaymentsByBookingId(bookingId) {
    const payments = await prisma.payment.findMany({
      where: { bookingId },
      include: {
        refunds: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments;
  }

  async getPaymentsByUserId(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        include: {
          refunds: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.payment.count({
        where: { userId },
      }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async initiateRefund({ paymentId, amount, reason, notes = {} }) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'SUCCESS') {
      throw new Error('Cannot refund a payment that is not successful');
    }

    if (!payment.razorpayPaymentId) {
      throw new Error('Razorpay payment ID not found');
    }

    // Calculate refund amount
    const refundAmount = amount || payment.amount;

    if (parseFloat(refundAmount) > parseFloat(payment.amount)) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    // Check if already fully refunded
    const existingRefunds = await prisma.refund.findMany({
      where: {
        paymentId,
        status: 'SUCCESS',
      },
    });

    const totalRefunded = existingRefunds.reduce(
      (sum, refund) => sum + parseFloat(refund.amount),
      0
    );

    if (totalRefunded + parseFloat(refundAmount) > parseFloat(payment.amount)) {
      throw new Error('Total refund amount exceeds payment amount');
    }

    // Initiate refund with Razorpay
    const razorpay = getRazorpayInstance();
    const razorpayRefund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(parseFloat(refundAmount) * 100), // Convert to paise
      notes: {
        reason,
        ...notes,
      },
    });

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        paymentId,
        refundId: `REFUND_${Date.now()}_${paymentId}`,
        razorpayRefundId: razorpayRefund.id,
        amount: refundAmount,
        currency: payment.currency,
        status: 'PROCESSING',
        reason,
        notes,
        speedProcessed: razorpayRefund.speed_processed,
      },
    });

    // Update payment status if fully refunded
    if (totalRefunded + parseFloat(refundAmount) === parseFloat(payment.amount)) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'REFUNDED' },
      });
    }

    return refund;
  }

  async getRefundsByPaymentId(paymentId) {
    const refunds = await prisma.refund.findMany({
      where: { paymentId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return refunds;
  }

  // Helper methods
  extractPaymentMethodDetails(razorpayPayment) {
    const details = {};

    if (razorpayPayment.method === 'card') {
      details.cardLast4 = razorpayPayment.card?.last4;
      details.cardNetwork = razorpayPayment.card?.network;
    } else if (razorpayPayment.method === 'netbanking') {
      details.bankName = razorpayPayment.bank;
    } else if (razorpayPayment.method === 'upi') {
      details.upiId = razorpayPayment.vpa;
    } else if (razorpayPayment.method === 'wallet') {
      details.walletName = razorpayPayment.wallet;
    }

    return details;
  }

  mapPaymentMethod(razorpayMethod) {
    const methodMap = {
      card: 'CARD',
      netbanking: 'NETBANKING',
      upi: 'UPI',
      wallet: 'WALLET',
      emi: 'EMI',
    };

    return methodMap[razorpayMethod] || null;
  }
}

module.exports = new PaymentService();
