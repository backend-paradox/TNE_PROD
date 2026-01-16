// ==============================================================================
// Authentication Middleware
// ==============================================================================

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Required authentication middleware
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token has expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token'));
    }
    next(error);
  }
};

/**
 * Optional authentication middleware
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Token invalid, but it's optional so continue
    logger.debug('Optional auth failed:', error.message);
    next();
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Internal service authentication (for service-to-service calls)
 */
const serviceAuth = (req, res, next) => {
  const serviceKey = req.headers['x-service-key'];
  const expectedKey = process.env.INTERNAL_SERVICE_KEY;

  if (!expectedKey) {
    logger.warn('INTERNAL_SERVICE_KEY not configured');
    return next();
  }

  if (serviceKey === expectedKey) {
    req.isServiceCall = true;
    // Extract user from body if provided by calling service
    if (req.body?.userId) {
      req.user = { id: req.body.userId };
    }
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  serviceAuth,
};
