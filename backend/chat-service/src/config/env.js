/**
 * Chat Service Environment Configuration
 *
 * This module imports the shared environment configuration and adds
 * chat-service specific defaults and validations.
 */

// Import shared environment configuration (loads from backend/.env)
const { env: sharedEnv, getServiceConfig, getDatabaseUrl } = require('../../../shared/src/config/env');

// Get chat-specific configuration
const serviceConfig = getServiceConfig('chat');

// Chat service specific environment (maintains backward compatibility with old config structure)
const config = {
  // Server
  nodeEnv: sharedEnv.NODE_ENV,
  port: serviceConfig.port || sharedEnv.CHAT_SERVICE_PORT,
  isProduction: sharedEnv.isProduction,
  isDevelopment: sharedEnv.isDevelopment,

  // Database
  databaseUrl: process.env.DATABASE_URL || getDatabaseUrl('chat'),

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
    group: sharedEnv.GROUP_SERVICE_URL,
  },

  // Socket.IO
  socket: {
    corsOrigin: sharedEnv.FRONTEND_URL,
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT, 10) || 20000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL, 10) || 25000,
  },

  // Redis
  redis: {
    host: sharedEnv.REDIS_HOST,
    port: sharedEnv.REDIS_PORT,
    password: sharedEnv.REDIS_PASSWORD || undefined,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
  },

  // Logging
  logLevel: sharedEnv.LOG_LEVEL,
};

// Validate required fields
const requiredFields = ['databaseUrl', 'jwt.secret'];
const getValue = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
const missing = requiredFields.filter(field => !getValue(config, field));

if (missing.length > 0) {
  console.error(`[CHAT-SERVICE] FATAL: Missing required config: ${missing.join(', ')}`);
  if (config.isProduction) {
    process.exit(1);
  }
}

module.exports = config;
