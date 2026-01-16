/**
 * API Gateway Environment Configuration
 *
 * This module imports the shared environment configuration and adds
 * gateway-specific defaults and validations.
 */

// Import shared environment configuration (loads from backend/.env)
const { env: sharedEnv, getServiceConfig, getDatabaseUrl } = require('../../../shared/src/config/env');

// Get gateway-specific configuration
const serviceConfig = getServiceConfig('gateway');

// API Gateway specific environment
const env = {
  // Core settings from shared
  NODE_ENV: sharedEnv.NODE_ENV,
  isProduction: sharedEnv.isProduction,
  isDevelopment: sharedEnv.isDevelopment,

  // Port (use service-specific or default)
  PORT: serviceConfig.port || sharedEnv.API_GATEWAY_PORT,

  // JWT (from shared - for token validation)
  JWT_SECRET: sharedEnv.JWT_SECRET,
  JWT_REFRESH_SECRET: sharedEnv.JWT_REFRESH_SECRET,

  // Service URLs (from shared)
  AUTH_SERVICE_URL: sharedEnv.AUTH_SERVICE_URL,
  USER_SERVICE_URL: sharedEnv.USER_SERVICE_URL,
  BOOKING_SERVICE_URL: sharedEnv.BOOKING_SERVICE_URL,
  PAYMENT_SERVICE_URL: sharedEnv.PAYMENT_SERVICE_URL,
  GROUP_SERVICE_URL: sharedEnv.GROUP_SERVICE_URL,
  NOTIFICATION_SERVICE_URL: sharedEnv.NOTIFICATION_SERVICE_URL,
  CHAT_SERVICE_URL: sharedEnv.CHAT_SERVICE_URL,
  CRMSYNC_SERVICE_URL: sharedEnv.CRMSYNC_SERVICE_URL,

  // Frontend URL (for CORS)
  FRONTEND_URL: sharedEnv.FRONTEND_URL,

  // Rate Limiting (from shared)
  RATE_LIMIT_WINDOW_MS: sharedEnv.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX: sharedEnv.RATE_LIMIT_MAX_REQUESTS,

  // Logging (from shared)
  LOG_LEVEL: sharedEnv.LOG_LEVEL,
};

// Validate required fields
const requiredFields = ['JWT_SECRET'];
const missing = requiredFields.filter(field => !env[field]);

if (missing.length > 0) {
  console.error(`[API-GATEWAY] FATAL: Missing required config: ${missing.join(', ')}`);
  if (env.isProduction) {
    process.exit(1);
  }
}

// Production warnings
if (env.isProduction) {
  if (!env.FRONTEND_URL) {
    console.error('[API-GATEWAY] FATAL: FRONTEND_URL must be set in production');
    process.exit(1);
  }
  if (env.JWT_SECRET.includes('dev_') || env.JWT_SECRET.length < 64) {
    console.warn('[API-GATEWAY] WARNING: JWT_SECRET appears to be a development secret.');
  }
}

module.exports = {
  env,
  sharedEnv,
  getServiceConfig,
  getDatabaseUrl,
};
