// ==============================================================================
// Global Error Handler Middleware
// ==============================================================================

const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log the error
  logger.error(`Error: ${message}`, {
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
    userId: req.user?.id,
  });

  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference';
        break;
    }
  }

  // Handle validation errors
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: 'Validation Error',
      errors: err.array(),
    });
  }

  // Don't expose internal error details in production
  if (!config.isDev && statusCode === 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.isDev && { stack: err.stack }),
  });
};

// Handle 404 - Not Found
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
