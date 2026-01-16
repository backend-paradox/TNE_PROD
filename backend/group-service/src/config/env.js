/**
 * Group Service Environment Configuration
 *
 * This module imports the shared environment configuration and adds
 * group-service specific defaults and validations.
 */

// Import shared environment configuration (loads from backend/.env)
const { env: sharedEnv, getServiceConfig, getDatabaseUrl } = require('../../../shared/src/config/env');

// Get group-specific configuration
const serviceConfig = getServiceConfig('group');

// Group service specific environment (maintains backward compatibility with old config structure)
const config = {
  // Server
  nodeEnv: sharedEnv.NODE_ENV,
  port: serviceConfig.port || sharedEnv.GROUP_SERVICE_PORT,
  isProduction: sharedEnv.isProduction,
  isDevelopment: sharedEnv.isDevelopment,

  // Database
  databaseUrl: process.env.DATABASE_URL || getDatabaseUrl('group'),

  // JWT
  jwt: {
    secret: sharedEnv.JWT_SECRET,
    accessExpiry: sharedEnv.JWT_ACCESS_EXPIRATION,
    refreshExpiry: `${sharedEnv.JWT_REFRESH_EXPIRATION_DAYS}d`,
    issuer: 'tne-auth-service',
    audience: 'tne-api',
  },

  // Service URLs
  services: {
    auth: sharedEnv.AUTH_SERVICE_URL,
    user: sharedEnv.USER_SERVICE_URL,
    chat: sharedEnv.CHAT_SERVICE_URL,
    booking: sharedEnv.BOOKING_SERVICE_URL,
    notification: sharedEnv.NOTIFICATION_SERVICE_URL,
  },

  // API Gateway (for inter-service calls)
  apiGateway: {
    url: process.env.API_GATEWAY_URL || 'http://localhost:5000/api/v1',
  },

  // Group settings (can be customized per environment)
  group: {
    maxSize: parseInt(process.env.MAX_GROUP_SIZE, 10) || 50,
    defaultSize: parseInt(process.env.DEFAULT_GROUP_SIZE, 10) || 20,
    invitationExpiryDays: parseInt(process.env.INVITATION_EXPIRY_DAYS, 10) || 7,
  },

  // Logging
  logLevel: sharedEnv.LOG_LEVEL,
};

// Validate required fields
const requiredFields = ['databaseUrl', 'jwt.secret'];
const getValue = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
const missing = requiredFields.filter(field => !getValue(config, field));

if (missing.length > 0) {
  console.error(`[GROUP-SERVICE] FATAL: Missing required config: ${missing.join(', ')}`);
  if (config.isProduction) {
    process.exit(1);
  }
}

module.exports = config;
