/**
 * Booking Service Environment Configuration
 *
 * This module imports the shared environment configuration and adds
 * booking-service specific defaults and validations.
 */

// Import shared environment configuration (loads from backend/.env)
const { env: sharedEnv, getServiceConfig, getDatabaseUrl } = require('../../../shared/src/config/env');

// Get booking-specific configuration
const serviceConfig = getServiceConfig('booking');

// Booking service specific environment
const config = {
  // Server
  nodeEnv: sharedEnv.NODE_ENV,
  port: serviceConfig.port || sharedEnv.BOOKING_SERVICE_PORT,
  isProduction: sharedEnv.isProduction,
  isDevelopment: sharedEnv.isDevelopment,

  // Database
  databaseUrl: process.env.DATABASE_URL || getDatabaseUrl('booking'),

  // JWT
  jwt: {
    secret: sharedEnv.JWT_SECRET,
    accessExpiry: sharedEnv.JWT_ACCESS_EXPIRATION,
    refreshExpiry: `${sharedEnv.JWT_REFRESH_EXPIRATION_DAYS}d`,
  },

  // Service URLs
  services: {
    auth: sharedEnv.AUTH_SERVICE_URL,
    user: sharedEnv.USER_SERVICE_URL,
    payment: sharedEnv.PAYMENT_SERVICE_URL,
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
  console.error(`[BOOKING-SERVICE] FATAL: Missing required config: ${missing.join(', ')}`);
  if (config.isProduction) {
    process.exit(1);
  }
}

module.exports = config;
