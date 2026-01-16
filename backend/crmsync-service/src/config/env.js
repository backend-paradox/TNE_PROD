/**
 * CRM Sync (Admin) Service Environment Configuration
 *
 * This module imports the shared environment configuration and adds
 * crmsync-service specific defaults and validations.
 */

// Import shared environment configuration (loads from backend/.env)
const { env: sharedEnv, getServiceConfig, getDatabaseUrl } = require('../../../shared/src/config/env');

// Get crmsync-specific configuration
const serviceConfig = getServiceConfig('crmsync');

// CRM Sync service specific environment
const config = {
  // Server
  nodeEnv: sharedEnv.NODE_ENV,
  port: serviceConfig.port || sharedEnv.CRMSYNC_SERVICE_PORT || 3011,
  isProduction: sharedEnv.isProduction,
  isDevelopment: sharedEnv.isDevelopment,

  // Database (using auth database for admin operations by default)
  databaseUrl: process.env.DATABASE_URL || getDatabaseUrl('auth'),

  // JWT
  jwt: {
    secret: sharedEnv.JWT_SECRET,
  },

  // Service URLs
  services: {
    auth: sharedEnv.AUTH_SERVICE_URL,
    user: sharedEnv.USER_SERVICE_URL,
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
  console.error(`[CRMSYNC-SERVICE] FATAL: Missing required config: ${missing.join(', ')}`);
  if (config.isProduction) {
    process.exit(1);
  }
}

module.exports = config;
