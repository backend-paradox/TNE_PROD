/**
 * Notification Service Environment Configuration
 *
 * This module imports the shared environment configuration and adds
 * notification-service specific defaults and validations.
 */

// Import shared environment configuration (loads from backend/.env)
const { env: sharedEnv, getServiceConfig, getDatabaseUrl } = require('../../../shared/src/config/env');

// Get notification-specific configuration
const serviceConfig = getServiceConfig('notification');

// Notification service specific environment (maintains backward compatibility with old config structure)
const config = {
  // Server
  port: serviceConfig.port || sharedEnv.NOTIFICATION_SERVICE_PORT,
  nodeEnv: sharedEnv.NODE_ENV,
  isDev: sharedEnv.isDevelopment,
  isProduction: sharedEnv.isProduction,

  // Database
  databaseUrl: process.env.DATABASE_URL || getDatabaseUrl('notification'),

  // JWT
  jwtSecret: sharedEnv.JWT_SECRET,

  // Redis
  redisUrl: process.env.REDIS_URL || `redis://${sharedEnv.REDIS_HOST}:${sharedEnv.REDIS_PORT}`,

  // Kafka (optional - for event-driven architecture)
  kafka: {
    enabled: process.env.KAFKA_ENABLED === 'true',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'notification-service',
    consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'notification-service-group',
  },

  // Email (SMTP) from shared config
  email: {
    host: sharedEnv.SMTP_HOST,
    port: sharedEnv.SMTP_PORT,
    secure: sharedEnv.SMTP_SECURE,
    user: sharedEnv.SMTP_USER,
    pass: sharedEnv.SMTP_PASS,
    from: sharedEnv.SMTP_FROM,
  },

  // SMS (Twilio) - service-specific
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
  },

  // Push Notifications (Firebase) - service-specific
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    enabled: !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL),
  },

  // Logging
  logLevel: sharedEnv.LOG_LEVEL,

  // CORS
  corsOrigin: sharedEnv.FRONTEND_URL,

  // Retry settings
  retry: {
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3', 10),
    initialDelay: parseInt(process.env.RETRY_INITIAL_DELAY || '1000', 10),
    maxDelay: parseInt(process.env.RETRY_MAX_DELAY || '30000', 10),
  },
};

// Validate required configurations
const requiredConfigs = ['databaseUrl', 'jwtSecret'];
for (const key of requiredConfigs) {
  if (!config[key]) {
    console.error(`[NOTIFICATION-SERVICE] Missing required config: ${key}`);
    if (config.isProduction) {
      process.exit(1);
    }
  }
}

module.exports = config;
