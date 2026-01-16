/**
 * User Service Environment Configuration
 *
 * This module imports the shared environment configuration and adds
 * user-service specific defaults and validations.
 */

// Import shared environment configuration (loads from backend/.env)
const { env: sharedEnv, getServiceConfig, getDatabaseUrl } = require('../../../shared/src/config/env');

// Get user-specific configuration
const serviceConfig = getServiceConfig('user');

// User service specific environment
const env = {
  // Core settings from shared
  NODE_ENV: sharedEnv.NODE_ENV,
  isProduction: sharedEnv.isProduction,
  isDevelopment: sharedEnv.isDevelopment,

  // Port (use service-specific or default)
  PORT: serviceConfig.port || sharedEnv.USER_SERVICE_PORT,

  // Database URL (constructed from shared config)
  DATABASE_URL: process.env.DATABASE_URL || getDatabaseUrl('user'),

  // JWT (from shared - for token validation)
  JWT_SECRET: sharedEnv.JWT_SECRET,
  JWT_REFRESH_SECRET: sharedEnv.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRATION: sharedEnv.JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_EXPIRATION_DAYS: sharedEnv.JWT_REFRESH_EXPIRATION_DAYS,

  // Service URLs (from shared)
  AUTH_SERVICE_URL: sharedEnv.AUTH_SERVICE_URL,
  FRONTEND_URL: sharedEnv.FRONTEND_URL,

  // File uploads
  UPLOAD_PROVIDER: sharedEnv.UPLOAD_PROVIDER,
  AWS_ACCESS_KEY_ID: sharedEnv.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: sharedEnv.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: sharedEnv.AWS_REGION,
  AWS_S3_BUCKET: sharedEnv.AWS_S3_BUCKET,

  // Logging (from shared)
  LOG_LEVEL: sharedEnv.LOG_LEVEL,
};

// Validate required fields
const requiredFields = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredFields.filter(field => !env[field]);

if (missing.length > 0) {
  console.error(`[USER-SERVICE] FATAL: Missing required config: ${missing.join(', ')}`);
  if (env.isProduction) {
    process.exit(1);
  }
}

// Production warnings
if (env.isProduction) {
  if (env.JWT_SECRET.includes('dev_') || env.JWT_SECRET.length < 64) {
    console.warn('[USER-SERVICE] WARNING: JWT_SECRET appears to be a development secret.');
  }
}

module.exports = {
  env,
  // Maintain backward compatibility with old validateEnv pattern
  validateEnv: () => env,
  sharedEnv,
  getServiceConfig,
  getDatabaseUrl,
};
