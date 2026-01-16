const webhookService = require('../services/webhookService');

class WebhookController {
  async handleRazorpayWebhook(req, res, next) {
    try {
      const event = req.body.event;
      const payload = req.body;
      const signature = req.headers['x-razorpay-signature'];

      await webhookService.handleWebhook(event, payload, signature);

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
      });
    } catch (error) {
      console.error('Webhook processing error:', error);

      // Always return 200 to Razorpay to prevent retries
      // Log the error internally for investigation
      res.status(200).json({
        success: false,
        message: 'Webhook received but processing failed',
      });
    }
  }
}

module.exports = new WebhookController();
