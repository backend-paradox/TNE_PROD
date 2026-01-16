// backend/api-gateway/src/middleware/jwt.js
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const logger = require('../utils/logger');

// SECURITY: Require JWT_SECRET - no fallback allowed
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  logger.error('FATAL: JWT_SECRET environment variable is not set');
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * middleware: optional - will attempt to parse and validate token
 * If valid sets req.user = { id, email, role, ... }
 */
function optional(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return next();
  const token = auth.split(' ')[1];
  if (!token) return next();

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    logger.warn('Invalid JWT at gateway: ' + err.message);
    // don't block: allow upstream to handle auth if desired
    return next();
  }
}

/**
 * middleware: required - block if invalid or absent
 */
function required(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return next(createError(401, 'Authorization required'));
  const token = auth.split(' ')[1];
  if (!token) return next(createError(401, 'Authorization required'));
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return next(createError(401, 'Invalid token'));
  }
}

/**
 * middleware generator: requireRole('admin')
 */
function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return next(createError(401, 'Authorization required'));
    if (!req.user.role || req.user.role !== role) return next(createError(403, 'Forbidden'));
    return next();
  };
}

module.exports = { optional, required, requireRole };
