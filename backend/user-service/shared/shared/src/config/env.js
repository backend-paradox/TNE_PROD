/**
 * Centralized Environment Configuration Loader
 *
 * This module loads environment variables from the shared backend/.env file
 * and provides typed, validated configuration for all services.
 *
 * Usage in any service:
 *   const { env, getServiceConfig } = require('@tne/shared').env;
 *   const config = getServiceConfig('auth');
 */

const path = require('path');
const fs = require('fs');

// Load dotenv only in development - in production, use real env vars
const loadEnvFile = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (nodeEnv === 'production') {
    // In production, environment variables should be set by the deployment platform
    console.log('[ENV] Production mode - using system environment variables');
    return;
  }

  // Priority 1: Look for local .env in the service's directory (cwd)
  const localEnvPath = path.resolve(process.cwd(), '.env');

  // Priority 2: Shared backend/.env file (works from any service directory)
  const sharedPaths = [
    path.resolve(process.cwd(), '..', '.env'),              // Parent (backend/)
    path.resolve(__dirname, '..', '..', '..', '.env'),      // From shared/src/config
  ];

  // First, try to load local .env (service-specific)
  if (fs.existsSync(localEnvPath)) {
    require('dotenv').config({ path: localEnvPath });
    console.log(`[ENV] Loaded service-specific environment from: ${localEnvPath}`);
    return;
  }

  // Fallback to shared backend/.env
  let sharedEnvPath = null;
  for (const p of sharedPaths) {
    if (fs.existsSync(p)) {
      sharedEnvPath = p;
      break;
    }
  }

  if (sharedEnvPath) {
    require('dotenv').config({ path: sharedEnvPath });
    console.log(`[ENV] Loaded shared environment from: ${sharedEnvPath}`);
  } else {
    console.warn('[ENV] No .env file found. Using system environment variables.');
  }
};

// Load environment file
loadEnvFile();

/**
 * Validate production secrets are not using development defaults
 * SECURITY: Prevents deployment with weak/placeholder secrets
 */
const validateProductionSecrets = () => {
  if (process.env.NODE_ENV !== 'production') {
    return; // Only validate in production
  }

  const FORBIDDEN_PATTERNS = ['dev_', 'test_', 'change_in_production', 'your-', 'xxxxx', 'placeholder'];
  const MIN_SECRET_LENGTH = 64;

  // Secrets that must be strong in production
  const secretsToValidate = [
    { key: 'JWT_SECRET', minLength: MIN_SECRET_LENGTH },
    { key: 'JWT_REFRESH_SECRET', minLength: MIN_SECRET_LENGTH },
  ];

  for (const { key, minLength } of secretsToValidate) {
    const value = process.env[key];

    if (!value) {
      throw new Error(`[SECURITY] ${key} is required in production`);
    }

    if (value.length < minLength) {
      throw new Error(`[SECURITY] ${key} must be at least ${minLength} characters in production (got ${value.length})`);
    }

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (value.toLowerCase().includes(pattern)) {
        throw new Error(`[SECURITY] ${key} contains forbidden development pattern: "${pattern}". Use a strong, unique secret in production.`);
      }
    }
  }

  // Validate Razorpay is not using test keys in production
  const razorpayKey = process.env.RAZORPAY_KEY_ID;
  if (razorpayKey && razorpayKey.startsWith('rzp_test_')) {
    throw new Error('[SECURITY] Production cannot use Razorpay test keys (rzp_test_*). Use live keys.');
  }

  console.log('[ENV] Production secrets validation passed');
};

// Run production secrets validation
validateProductionSecrets();

/**
 * Parse boolean from environment variable
 */
const parseBool = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return value === 'true' || value === '1';
};

/**
 * Parse integer from environment variable
 */
const parseInt = (value, defaultValue) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Require an environment variable (throws if missing in production)
 */
const requireEnv = (key, defaultValue = undefined) => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    if (process.env.NODE_ENV === 'production' && defaultValue === undefined) {
      throw new Error(`[ENV] Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  return value;
};

/**
 * Validate and return a URL
 * SECURITY: Ensures service URLs are valid and use safe protocols
 */
const validateUrl = (value, key, defaultValue = null) => {
  // If no value, use default
  if (!value && defaultValue) {
    return defaultValue;
  }
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    // SECURITY: Only allow http/https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(`Invalid protocol: ${url.protocol}. Only http/https allowed.`);
    }

    return value;
  } catch (error) {
    // In production, fail fast on invalid URLs
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[ENV] Invalid URL for ${key}: ${error.message}`);
    }
    // In development, warn but continue with default
    console.warn(`[ENV] Invalid URL for ${key}: ${value} (${error.message}). Using default.`);
    return defaultValue;
  }
};

/**
 * Main environment configuration object
 * All values are validated and typed
 */
const env = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 5432),
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',

  // Database names
  AUTH_DB_NAME: process.env.AUTH_DB_NAME || 'tne_authdb',
  USER_DB_NAME: process.env.USER_DB_NAME || 'tne_userdb',
  BOOKING_DB_NAME: process.env.BOOKING_DB_NAME || 'tne_bookingdb',
  PAYMENT_DB_NAME: process.env.PAYMENT_DB_NAME || 'tne_paymentdb',
  GROUP_DB_NAME: process.env.GROUP_DB_NAME || 'tne_groupdb',
  CHAT_DB_NAME: process.env.CHAT_DB_NAME || 'tne_chatdb',
  NOTIFICATION_DB_NAME: process.env.NOTIFICATION_DB_NAME || 'tne_notificationdb',
  PACKAGE_DB_NAME: process.env.PACKAGE_DB_NAME || 'tne_packagedb',

  // JWT
  JWT_SECRET: requireEnv('JWT_SECRET', 'dev_jwt_secret_change_in_production'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production'),
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRATION_DAYS: parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS, 7),

  // Service Ports
  API_GATEWAY_PORT: parseInt(process.env.API_GATEWAY_PORT, 5000),
  AUTH_SERVICE_PORT: parseInt(process.env.AUTH_SERVICE_PORT, 3001),
  USER_SERVICE_PORT: parseInt(process.env.USER_SERVICE_PORT, 3002),
  BOOKING_SERVICE_PORT: parseInt(process.env.BOOKING_SERVICE_PORT, 3004),
  PAYMENT_SERVICE_PORT: parseInt(process.env.PAYMENT_SERVICE_PORT, 3005),
  GROUP_SERVICE_PORT: parseInt(process.env.GROUP_SERVICE_PORT, 3006),
  NOTIFICATION_SERVICE_PORT: parseInt(process.env.NOTIFICATION_SERVICE_PORT, 3007),
  CHAT_SERVICE_PORT: parseInt(process.env.CHAT_SERVICE_PORT, 3008),
  CRMSYNC_SERVICE_PORT: parseInt(process.env.CRMSYNC_SERVICE_PORT, 3011),
  PACKAGE_SERVICE_PORT: parseInt(process.env.PACKAGE_SERVICE_PORT, 3012),

  // Service URLs (validated for protocol safety)
  API_GATEWAY_URL: validateUrl(process.env.API_GATEWAY_URL, 'API_GATEWAY_URL', 'http://localhost:5000'),
  AUTH_SERVICE_URL: validateUrl(process.env.AUTH_SERVICE_URL, 'AUTH_SERVICE_URL', 'http://localhost:3001'),
  USER_SERVICE_URL: validateUrl(process.env.USER_SERVICE_URL, 'USER_SERVICE_URL', 'http://localhost:3002'),
  BOOKING_SERVICE_URL: validateUrl(process.env.BOOKING_SERVICE_URL, 'BOOKING_SERVICE_URL', 'http://localhost:3004'),
  PAYMENT_SERVICE_URL: validateUrl(process.env.PAYMENT_SERVICE_URL, 'PAYMENT_SERVICE_URL', 'http://localhost:3005'),
  GROUP_SERVICE_URL: validateUrl(process.env.GROUP_SERVICE_URL, 'GROUP_SERVICE_URL', 'http://localhost:3006'),
  NOTIFICATION_SERVICE_URL: validateUrl(process.env.NOTIFICATION_SERVICE_URL, 'NOTIFICATION_SERVICE_URL', 'http://localhost:3007'),
  CHAT_SERVICE_URL: validateUrl(process.env.CHAT_SERVICE_URL, 'CHAT_SERVICE_URL', 'http://localhost:3008'),
  CRMSYNC_SERVICE_URL: validateUrl(process.env.CRMSYNC_SERVICE_URL, 'CRMSYNC_SERVICE_URL', 'http://localhost:3011'),
  PACKAGE_SERVICE_URL: validateUrl(process.env.PACKAGE_SERVICE_URL, 'PACKAGE_SERVICE_URL', 'http://localhost:3012'),

  // Frontend URL (validated)
  FRONTEND_URL: validateUrl(process.env.FRONTEND_URL, 'FRONTEND_URL', 'http://localhost:5173'),

  // Email
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 587),
  SMTP_SECURE: parseBool(process.env.SMTP_SECURE, false),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@tripandevent.com',

  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || '',
  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID || '',
  APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET || '',

  // Payments
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 6379),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',

  // Security
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS, 12),
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 5),
  LOCK_TIME_MINUTES: parseInt(process.env.LOCK_TIME_MINUTES, 15),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 100),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // File Uploads
  UPLOAD_PROVIDER: process.env.UPLOAD_PROVIDER || 'local',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',
};

/**
 * Get database URL for a specific service
 */
const getDatabaseUrl = (service) => {
  const dbNames = {
    auth: env.AUTH_DB_NAME,
    user: env.USER_DB_NAME,
    booking: env.BOOKING_DB_NAME,
    payment: env.PAYMENT_DB_NAME,
    group: env.GROUP_DB_NAME,
    chat: env.CHAT_DB_NAME,
    notification: env.NOTIFICATION_DB_NAME,
    package: env.PACKAGE_DB_NAME,
  };

  const dbName = dbNames[service];
  if (!dbName) {
    throw new Error(`[ENV] Unknown service: ${service}`);
  }

  return `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${dbName}`;
};

/**
 * Get service-specific configuration
 */
const getServiceConfig = (service) => {
  const configs = {
    'api-gateway': {
      port: env.API_GATEWAY_PORT,
      services: {
        auth: env.AUTH_SERVICE_URL,
        user: env.USER_SERVICE_URL,
        booking: env.BOOKING_SERVICE_URL,
        payment: env.PAYMENT_SERVICE_URL,
        group: env.GROUP_SERVICE_URL,
        notification: env.NOTIFICATION_SERVICE_URL,
        chat: env.CHAT_SERVICE_URL,
        crmsync: env.CRMSYNC_SERVICE_URL,
        package: env.PACKAGE_SERVICE_URL,
      },
    },
    auth: {
      port: env.AUTH_SERVICE_PORT,
      databaseUrl: getDatabaseUrl('auth'),
      userServiceUrl: env.USER_SERVICE_URL,
    },
    user: {
      port: env.USER_SERVICE_PORT,
      databaseUrl: getDatabaseUrl('user'),
      authServiceUrl: env.AUTH_SERVICE_URL,
    },
    booking: {
      port: env.BOOKING_SERVICE_PORT,
      databaseUrl: getDatabaseUrl('booking'),
    },
    payment: {
      port: env.PAYMENT_SERVICE_PORT,
      databaseUrl: getDatabaseUrl('payment'),
      razorpay: {
        keyId: env.RAZORPAY_KEY_ID,
        keySecret: env.RAZORPAY_KEY_SECRET,
      },
    },
    group: {
      port: env.GROUP_SERVICE_PORT,
      databaseUrl: getDatabaseUrl('group'),
    },
    chat: {
      port: env.CHAT_SERVICE_PORT,
      databaseUrl: getDatabaseUrl('chat'),
    },
    notification: {
      port: env.NOTIFICATION_SERVICE_PORT,
      databaseUrl: getDatabaseUrl('notification'),
      smtp: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        from: env.SMTP_FROM,
      },
    },
    package: {
      port: env.PACKAGE_SERVICE_PORT,
      databaseUrl: getDatabaseUrl('package'),
    },
  };

  return configs[service] || {};
};

module.exports = {
  env,
  getDatabaseUrl,
  getServiceConfig,
  requireEnv,
  parseBool,
  parseInt,
};
