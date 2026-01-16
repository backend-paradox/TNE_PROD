// Utilities
const { createLogger } = require('./utils/logger');
const ApiError = require('./utils/ApiError');
const ApiResponse = require('./utils/ApiResponse');
const asyncHandler = require('./utils/asyncHandler');
const constants = require('./utils/constants');
const errors = require('./utils/errors');

// Repositories
const BaseRepository = require('./repositories/BaseRepository');

// Middleware
const { errorConverter, errorHandler } = require('./middleware/errorHandler');
const { authenticate, authorize, optionalAuth, USER_ROLES } = require('./middleware/auth');
const { validateJoi, validateZod } = require('./middleware/validate');
const requestId = require('./middleware/requestId');
const { createRateLimiter, authLimiter, apiLimiter, strictLimiter } = require('./middleware/rateLimiter');

// Configuration
const database = require('./config/database');
const jwt = require('./config/jwt');
const envConfig = require('./config/env');

// Validators
const commonValidators = require('./validators/common');

module.exports = {
  // Utils
  createLogger,
  ApiError,
  ApiResponse,
  asyncHandler,
  constants,

  // Error Classes (domain-specific)
  ...errors,
  errors,

  // Repository Base Class
  BaseRepository,

  // Middleware
  errorConverter,
  errorHandler,
  authenticate,
  authorize,
  optionalAuth,
  USER_ROLES,
  validateJoi,
  validateZod,
  requestId,
  createRateLimiter,
  authLimiter,
  apiLimiter,
  strictLimiter,

  // Config
  database,
  jwt,
  env: envConfig.env,
  envConfig,
  getServiceConfig: envConfig.getServiceConfig,
  getDatabaseUrl: envConfig.getDatabaseUrl,

  // Validators
  commonValidators,
};
