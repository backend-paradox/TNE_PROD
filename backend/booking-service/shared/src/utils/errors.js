/**
 * Domain-specific Error Classes
 *
 * These errors extend ApiError and provide semantic meaning for different error types.
 * Use these throughout all services for consistent error handling.
 *
 * Usage:
 *   throw new ValidationError('Email is required');
 *   throw new NotFoundError('User');
 *   throw new ConflictError('Email already registered');
 */

const ApiError = require('./ApiError');

/**
 * Validation Error - 400
 * Use when request data fails validation
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errors = []) {
    super(400, message, true);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  static fromJoi(joiError) {
    const errors = joiError.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return new ValidationError('Validation failed', errors);
  }

  static fromZod(zodError) {
    const errors = zodError.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return new ValidationError('Validation failed', errors);
  }
}

/**
 * Authentication Error - 401
 * Use when user is not authenticated or credentials are invalid
 */
class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(401, message, true);
    this.name = 'AuthenticationError';
  }

  static invalidCredentials() {
    return new AuthenticationError('Invalid credentials');
  }

  static tokenExpired() {
    return new AuthenticationError('Token has expired');
  }

  static tokenInvalid() {
    return new AuthenticationError('Invalid token');
  }

  static sessionExpired() {
    return new AuthenticationError('Session has expired');
  }
}

/**
 * Authorization Error - 403
 * Use when user is authenticated but lacks permission
 */
class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(403, message, true);
    this.name = 'AuthorizationError';
  }

  static insufficientPermissions() {
    return new AuthorizationError('Insufficient permissions');
  }

  static resourceForbidden() {
    return new AuthorizationError('Access to this resource is forbidden');
  }
}

/**
 * Not Found Error - 404
 * Use when a requested resource doesn't exist
 */
class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`, true);
    this.name = 'NotFoundError';
    this.resource = resource;
  }

  static user() {
    return new NotFoundError('User');
  }

  static booking() {
    return new NotFoundError('Booking');
  }

  static group() {
    return new NotFoundError('Group');
  }

  static payment() {
    return new NotFoundError('Payment');
  }

  static conversation() {
    return new NotFoundError('Conversation');
  }

  static message() {
    return new NotFoundError('Message');
  }
}

/**
 * Conflict Error - 409
 * Use when operation conflicts with current state (e.g., duplicate entry)
 */
class ConflictError extends ApiError {
  constructor(message = 'Resource already exists') {
    super(409, message, true);
    this.name = 'ConflictError';
  }

  static duplicate(resource) {
    return new ConflictError(`${resource} already exists`);
  }

  static emailTaken() {
    return new ConflictError('Email is already registered');
  }
}

/**
 * Rate Limit Error - 429
 * Use when user has exceeded rate limits
 */
class RateLimitError extends ApiError {
  constructor(message = 'Too many requests', retryAfter = 60) {
    super(429, message, true);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Unprocessable Entity Error - 422
 * Use when request is syntactically correct but semantically invalid
 */
class UnprocessableError extends ApiError {
  constructor(message = 'Unprocessable entity') {
    super(422, message, true);
    this.name = 'UnprocessableError';
  }
}

/**
 * Service Unavailable Error - 503
 * Use when a downstream service is unavailable
 */
class ServiceUnavailableError extends ApiError {
  constructor(service = 'Service') {
    super(503, `${service} is temporarily unavailable`, false);
    this.name = 'ServiceUnavailableError';
    this.service = service;
  }
}

/**
 * Bad Gateway Error - 502
 * Use when receiving invalid response from upstream service
 */
class BadGatewayError extends ApiError {
  constructor(message = 'Bad gateway') {
    super(502, message, false);
    this.name = 'BadGatewayError';
  }
}

/**
 * Internal Error - 500
 * Use for unexpected server errors
 */
class InternalError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message, false);
    this.name = 'InternalError';
  }
}

module.exports = {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  UnprocessableError,
  ServiceUnavailableError,
  BadGatewayError,
  InternalError,
};
