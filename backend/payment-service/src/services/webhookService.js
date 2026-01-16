const prisma = require('../config/prisma');
const { verifyWebhookSignature } = require('../utils/signature');
const axios = require('axios');

class WebhookService {
  async handleWebhook(event, payload, signature) {
    // Log webhook
    const webhookLog = await prisma.webhookLog.create({
      data: {
        event,
        payload,
        razorpaySignature: signature,
        processed: false,
      },
    });

    try {
      // Verify signature if webhook secret is configured
      if (process.env.RAZORPAY_WEBHOOK_SECRET) {
        const isValid = verifyWebhookSignature(payload, signature);
        if (!isValid) {
          throw new Error('Invalid webhook signature');
        }
      }

      // Handle different event types
      switch (event) {
        case 'payment.authorized':
          await this.handlePaymentAuthorized(payload);
          break;

        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;

        case 'order.paid':
          await this.handleOrderPaid(payload);
          break;

        case 'refund.created':
          await this.handleRefundCreated(payload);
          break;

        case 'refund.processed':
          await this.handleRefundProcessed(payload);
          break;

        case 'refund.failed':
          await this.handleRefundFailed(payload);
          break;

        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      // Mark as processed
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: { processed: true },
      });

      return { success: true };
    } catch (error) {
      // Log error
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          processed: false,
          processingError: error.message,
        },
      });

      throw error;
    }
  }

  async handlePaymentAuthorized(payload) {
    const { payment } = payload;

    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayPaymentId: payment.entity.id },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'PROCESSING',
          metadata: {
            ...existingPayment.metadata,
            webhookPaymentAuthorized: payment.entity,
          },
        },
      });
    }
  }

  async handlePaymentCaptured(payload) {
    const { payment } = payload;

    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: payment.entity.order_id },
    });

    if (existingPayment && existingPayment.status !== 'SUCCESS') {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId: payment.entity.id,
          paidAt: new Date(payment.entity.created_at * 1000),
          metadata: {
            ...existingPayment.metadata,
            webhookPaymentCaptured: payment.entity,
          },
        },
      });

      // Notify booking service
      await this.notifyBookingService(existingPayment.bookingId, 'PAYMENT_SUCCESS', {
        paymentId: existingPayment.id,
        amount: existingPayment.amount,
      });
    }
  }

  async handlePaymentFailed(payload) {
    const { payment } = payload;

    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: payment.entity.order_id },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'FAILED',
          errorCode: payment.entity.error_code,
          errorDescription: payment.entity.error_description,
          failureReason: payment.entity.error_reason,
          metadata: {
            ...existingPayment.metadata,
            webhookPaymentFailed: payment.entity,
          },
        },
      });

      // Notify booking service
      await this.notifyBookingService(existingPayment.bookingId, 'PAYMENT_FAILED', {
        paymentId: existingPayment.id,
        reason: payment.entity.error_description,
      });
    }
  }

  async handleOrderPaid(payload) {
    const { order } = payload;

    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: order.entity.id },
    });

    if (existingPayment && existingPayment.status === 'PENDING') {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'SUCCESS',
          metadata: {
            ...existingPayment.metadata,
            webhookOrderPaid: order.entity,
          },
        },
      });
    }
  }

  async handleRefundCreated(payload) {
    const { refund } = payload;

    const existingRefund = await prisma.refund.findUnique({
      where: { razorpayRefundId: refund.entity.id },
    });

    if (existingRefund) {
      await prisma.refund.update({
        where: { id: existingRefund.id },
        data: {
          status: 'PROCESSING',
        },
      });
    }
  }

  async handleRefundProcessed(payload) {
    const { refund } = payload;

    const existingRefund = await prisma.refund.findUnique({
      where: { razorpayRefundId: refund.entity.id },
    });

    if (existingRefund) {
      await prisma.refund.update({
        where: { id: existingRefund.id },
        data: {
          status: 'SUCCESS',
          processedAt: new Date(),
          speedProcessed: refund.entity.speed_processed,
        },
      });

      // Get payment and notify booking service
      const payment = await prisma.payment.findUnique({
        where: { id: existingRefund.paymentId },
      });

      if (payment) {
        await this.notifyBookingService(payment.bookingId, 'REFUND_SUCCESS', {
          refundId: existingRefund.id,
          amount: existingRefund.amount,
        });
      }
    }
  }

  async handleRefundFailed(payload) {
    const { refund } = payload;

    const existingRefund = await prisma.refund.findUnique({
      where: { razorpayRefundId: refund.entity.id },
    });

    if (existingRefund) {
      await prisma.refund.update({
        where: { id: existingRefund.id },
        data: {
          status: 'FAILED',
          failureReason: refund.entity.error_description || 'Refund failed',
        },
      });
    }
  }

  async notifyBookingService(bookingId, event, data) {
    const bookingServiceUrl = process.env.BOOKING_SERVICE_URL;

    if (!bookingServiceUrl) {
      console.warn('BOOKING_SERVICE_URL not configured, skipping notification');
      return;
    }

    try {
      await axios.post(
        `${bookingServiceUrl}/api/v1/booking/webhooks/payment`,
        {
          bookingId,
          event,
          data,
        },
        {
          timeout: 5000,
        }
      );
    } catch (error) {
      console.error('Failed to notify booking service:', error.message);
    }
  }
}

module.exports = new WebhookService();
