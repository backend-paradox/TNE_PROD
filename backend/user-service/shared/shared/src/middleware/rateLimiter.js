const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');
const { securityAudit } = require('../utils/securityAudit');

/**
 * Create a rate limiter with security audit integration
 * SECURITY: Rate limiting prevents brute force and DoS attacks
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
      // Log rate limit exceeded to security audit
      const identifier = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
      securityAudit.rateLimitExceeded(identifier, req.originalUrl, {
        method: req.method,
        userAgent: req.get('user-agent'),
      });
      throw ApiError.tooManyRequests(options.message);
    },
  };

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * Key generator that uses user ID for authenticated requests, IP for anonymous
 * SECURITY: Prevents single user from consuming all rate limit quota via different IPs
 */
const userOrIpKeyGenerator = (req) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  return `ip:${req.ip}`;
};

/**
 * Auth limiter - strict limits for authentication endpoints
 * SECURITY: Prevents brute force password attacks
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 min (strict for auth)
  message: 'Too many authentication attempts, please try again after 15 minutes',
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => `auth:${req.ip}`, // Always use IP for auth (user not yet known)
});

/**
 * API limiter - general rate limiting for API endpoints
 */
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyGenerator: userOrIpKeyGenerator,
});

/**
 * Strict limiter - very limited requests for sensitive operations
 */
const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many requests, please try again after an hour',
  keyGenerator: userOrIpKeyGenerator,
});

/**
 * Booking operation limiter - prevents excessive booking creation
 * SECURITY: Prevents inventory manipulation and fraud
 */
const bookingLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 bookings per hour
  message: 'Too many booking requests, please try again later',
  keyGenerator: (req) => {
    // MUST use user ID for booking operations
    if (!req.user?.id) {
      throw ApiError.unauthorized('Authentication required for booking');
    }
    return `booking:${req.user.id}`;
  },
});

/**
 * Payment limiter - very strict limits for payment operations
 * SECURITY: Prevents payment fraud and excessive payment attempts
 */
const paymentLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: 'Too many payment attempts, please try again later',
  keyGenerator: (req) => {
    // MUST use user ID for payment operations
    if (!req.user?.id) {
      throw ApiError.unauthorized('Authentication required for payment');
    }
    return `payment:${req.user.id}`;
  },
});

/**
 * Password reset limiter - prevents email bombing
 * SECURITY: Prevents abuse of password reset to spam users
 */
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour per IP
  message: 'Too many password reset requests, please try again later',
  keyGenerator: (req) => `reset:${req.ip}`,
});

/**
 * OTP limiter - prevents OTP spam
 * SECURITY: Prevents SMS/email bombing via OTP requests
 */
const otpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 OTP requests per 15 min
  message: 'Too many OTP requests, please try again later',
  keyGenerator: (req) => `otp:${req.ip}`,
});

module.exports = {
  rateLimiter: apiLimiter, // Default rate limiter for general API use
  createRateLimiter,
  authLimiter,
  apiLimiter,
  strictLimiter,
  bookingLimiter,
  paymentLimiter,
  passwordResetLimiter,
  otpLimiter,
  userOrIpKeyGenerator,
};
