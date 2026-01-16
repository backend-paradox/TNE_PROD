const { env } = require('../config/env');
const { AppError, ValidationError } = require('../utils/errors');
const { ZodError } = require('zod');

// Global Error Handler
exports.errorHandler = (err, req, res, next) => {
  // Log error (but don't expose stack trace in production)
  if (env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  } else {
    console.error('Error:', {
      message: err.message,
      code: err.code || 'INTERNAL_ERROR',
      ...(err.isOperational
        ? { type: 'Operational' }
        : { type: 'Programming' }),
    });
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // Custom Validation Error
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.errors,
      },
    });
  }

  // Custom App Errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.constructor.name.replace('Error', '').toUpperCase(),
        message: err.message,
      },
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired',
      },
    });
  }

  // Prisma Errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'A record with this value already exists',
        field: err.meta?.target?.[0] || 'unknown',
      },
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested record was not found',
      },
    });
  }

  // Default Error Response
  const statusCode = err.statusCode || err.status || 500;
  const message =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred'
      : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};
