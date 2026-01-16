const { z } = require('zod');

const createOrderSchema = z.object({
  body: z.object({
    bookingId: z.number().int().positive(),
    amount: z.number().positive(),
    currency: z.string().length(3).default('INR'),
    notes: z.record(z.any()).optional(),
    receipt: z.string().optional(),
  }),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  }),
});

const paymentFailureSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string(),
    errorCode: z.string().optional(),
    errorDescription: z.string().optional(),
  }),
});

const initiateRefundSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
    reason: z.string().min(1),
    notes: z.record(z.any()).optional(),
  }),
});

const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

module.exports = {
  createOrderSchema,
  verifyPaymentSchema,
  paymentFailureSchema,
  initiateRefundSchema,
  paginationSchema,
};
