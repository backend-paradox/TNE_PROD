const crypto = require('crypto');

const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error('Razorpay key secret is not configured');
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

const verifyWebhookSignature = (payload, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('Razorpay webhook secret is not configured');
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return generatedSignature === signature;
};

module.exports = {
  verifyRazorpaySignature,
  verifyWebhookSignature,
};
