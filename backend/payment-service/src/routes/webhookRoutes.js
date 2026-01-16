const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Razorpay webhook endpoint (no authentication required)
router.post('/razorpay', webhookController.handleRazorpayWebhook);

module.exports = router;
