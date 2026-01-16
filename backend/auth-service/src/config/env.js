/**
 * Auth Service Environment Configuration
 *
 * This module imports the shared environment configuration and adds
 * auth-specific defaults and validations.
 */

// Import shared environment configuration (loads from backend/.env)
const { env: sharedEnv, getServiceConfig, getDatabaseUrl } = require('../../../shared/src/config/env');

// Get auth-specific configuration
const serviceConfig = getServiceConfig('auth');

// Auth service specific environment
const env = {
  // Core settings from shared
  NODE_ENV: sharedEnv.NODE_ENV,
  isProduction: sharedEnv.isProduction,
  isDevelopment: sharedEnv.isDevelopment,

  // Port (use service-specific or default)
  PORT: serviceConfig.port || sharedEnv.AUTH_SERVICE_PORT,

  // Database URL (constructed from shared config)
  DATABASE_URL: process.env.DATABASE_URL || getDatabaseUrl('auth'),

  // JWT (from shared)
  JWT_SECRET: sharedEnv.JWT_SECRET,
  JWT_REFRESH_SECRET: sharedEnv.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRATION: sharedEnv.JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_EXPIRATION_DAYS: sharedEnv.JWT_REFRESH_EXPIRATION_DAYS,

  // Security (from shared)
  SALT_ROUNDS: sharedEnv.SALT_ROUNDS,
  MAX_LOGIN_ATTEMPTS: sharedEnv.MAX_LOGIN_ATTEMPTS,
  LOCK_TIME_MINUTES: sharedEnv.LOCK_TIME_MINUTES,

  // Email (from shared)
  SMTP_HOST: sharedEnv.SMTP_HOST,
  SMTP_PORT: sharedEnv.SMTP_PORT,
  SMTP_SECURE: sharedEnv.SMTP_SECURE,
  SMTP_USER: sharedEnv.SMTP_USER,
  SMTP_PASS: sharedEnv.SMTP_PASS,
  SMTP_FROM: sharedEnv.SMTP_FROM,

  // OAuth (from shared - backend only)
  GOOGLE_CLIENT_ID: sharedEnv.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: sharedEnv.GOOGLE_CLIENT_SECRET,
  FACEBOOK_APP_ID: sharedEnv.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: sharedEnv.FACEBOOK_APP_SECRET,
  APPLE_CLIENT_ID: sharedEnv.APPLE_CLIENT_ID,
  APPLE_CLIENT_SECRET: sharedEnv.APPLE_CLIENT_SECRET,

  // Service URLs (from shared)
  USER_SERVICE_URL: sharedEnv.USER_SERVICE_URL,
  FRONTEND_URL: sharedEnv.FRONTEND_URL,

  // Rate Limiting (from shared)
  RATE_LIMIT_WINDOW_MS: sharedEnv.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX: sharedEnv.RATE_LIMIT_MAX_REQUESTS,

  // Logging (from shared)
  LOG_LEVEL: sharedEnv.LOG_LEVEL,
};

// Validate required fields in production
if (env.isProduction) {
  if (env.JWT_SECRET.includes('dev_') || env.JWT_SECRET.length < 64) {
    console.warn('[AUTH] WARNING: JWT_SECRET appears to be a development secret. Use a strong secret in production.');
  }
  if (!env.SMTP_HOST) {
    console.warn('[AUTH] WARNING: SMTP_HOST is not configured. Email features will not work.');
  }
}

module.exports = {
  env,
  sharedEnv,
  getServiceConfig,
  getDatabaseUrl,
};
