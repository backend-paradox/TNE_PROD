/**
 * Payment Service Environment Configuration
 *
 * This module imports the shared environment configuration and adds
 * payment-service specific defaults and validations.
 */

// Import shared environment configuration (loads from backend/.env)
const { env: sharedEnv, getServiceConfig, getDatabaseUrl } = require('../../../shared/src/config/env');

// Get payment-specific configuration
const serviceConfig = getServiceConfig('payment');

// Payment service specific environment
const config = {
  // Server
  nodeEnv: sharedEnv.NODE_ENV,
  port: serviceConfig.port || sharedEnv.PAYMENT_SERVICE_PORT,
  isProduction: sharedEnv.isProduction,
  isDevelopment: sharedEnv.isDevelopment,
  serviceName: 'payment-service',

  // Database
  databaseUrl: process.env.DATABASE_URL || getDatabaseUrl('payment'),

  // JWT
  jwt: {
    secret: sharedEnv.JWT_SECRET,
    accessExpiry: sharedEnv.JWT_ACCESS_EXPIRATION,
  },

  // Razorpay (from shared config)
  razorpay: {
    keyId: sharedEnv.RAZORPAY_KEY_ID,
    keySecret: sharedEnv.RAZORPAY_KEY_SECRET,
  },

  // Service URLs
  services: {
    auth: sharedEnv.AUTH_SERVICE_URL,
    user: sharedEnv.USER_SERVICE_URL,
    booking: sharedEnv.BOOKING_SERVICE_URL,
    notification: sharedEnv.NOTIFICATION_SERVICE_URL,
  },

  // Logging
  logLevel: sharedEnv.LOG_LEVEL,

  // CORS
  corsOrigin: sharedEnv.FRONTEND_URL,
};

// Validate required fields
const requiredFields = ['databaseUrl', 'jwt.secret'];
const getValue = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
const missing = requiredFields.filter(field => !getValue(config, field));

if (missing.length > 0) {
  console.error(`[PAYMENT-SERVICE] FATAL: Missing required config: ${missing.join(', ')}`);
  if (config.isProduction) {
    process.exit(1);
  }
}

// Production warning for Razorpay
if (config.isProduction && !config.razorpay.keyId) {
  console.warn('[PAYMENT-SERVICE] WARNING: Razorpay is not configured. Payment features will not work.');
}

module.exports = config;
