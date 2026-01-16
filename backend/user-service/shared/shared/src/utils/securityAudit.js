/**
 * Security Audit Logging Utility
 *
 * SECURITY: Provides structured logging for security-critical events.
 * All security events should be logged through this utility for:
 * - Centralized audit trail
 * - Consistent formatting
 * - Automatic sensitive data masking
 * - Severity-based routing
 */

const logger = require('./logger');

/**
 * Security Event Types
 * Use these constants to ensure consistent event naming
 */
const SecurityEventTypes = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',

  // Registration & Verification
  REGISTRATION_SUCCESS: 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILURE: 'REGISTRATION_FAILURE',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  PHONE_VERIFIED: 'PHONE_VERIFIED',
  TWO_FACTOR_ENABLED: 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED: 'TWO_FACTOR_DISABLED',

  // Authorization events
  ACCESS_DENIED: 'ACCESS_DENIED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ADMIN_ACTION: 'ADMIN_ACTION',
  ROLE_CHANGED: 'ROLE_CHANGED',

  // Payment events
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILURE: 'PAYMENT_FAILURE',
  REFUND_INITIATED: 'REFUND_INITIATED',
  REFUND_SUCCESS: 'REFUND_SUCCESS',
  REFUND_FAILURE: 'REFUND_FAILURE',

  // Data access events
  SENSITIVE_DATA_ACCESS: 'SENSITIVE_DATA_ACCESS',
  DATA_EXPORT: 'DATA_EXPORT',
  BULK_OPERATION: 'BULK_OPERATION',

  // External service events
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  EXTERNAL_SERVICE_TIMEOUT: 'EXTERNAL_SERVICE_TIMEOUT',

  // Webhook events
  WEBHOOK_RECEIVED: 'WEBHOOK_RECEIVED',
  WEBHOOK_INVALID: 'WEBHOOK_INVALID',
  WEBHOOK_PROCESSED: 'WEBHOOK_PROCESSED',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Suspicious activity
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  MULTIPLE_FAILED_ATTEMPTS: 'MULTIPLE_FAILED_ATTEMPTS',
};

/**
 * Severity Levels for security events
 */
const Severity = {
  INFO: 'INFO',         // Normal security events (successful login, etc.)
  WARNING: 'WARNING',   // Potential security issues (failed login, rate limit)
  CRITICAL: 'CRITICAL', // Active security threats (multiple failures, breaches)
};

/**
 * SecurityAudit class for structured security logging
 */
class SecurityAudit {
  constructor() {
    this.serviceName = process.env.SERVICE_NAME || 'unknown-service';
  }

  /**
   * Log a security event
   *
   * @param {string} eventType - One of SecurityEventTypes
   * @param {object} data - Event data (will be sanitized)
   * @param {string} severity - One of Severity levels
   */
  log(eventType, data = {}, severity = Severity.INFO) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      eventType,
      severity,
      ...this.sanitizeData(data),
    };

    // Route to appropriate logger based on severity
    switch (severity) {
      case Severity.CRITICAL:
        logger.error('[SECURITY AUDIT]', auditEntry);
        break;
      case Severity.WARNING:
        logger.warn('[SECURITY AUDIT]', auditEntry);
        break;
      default:
        logger.info('[SECURITY AUDIT]', auditEntry);
    }

    return auditEntry;
  }

  /**
   * Sanitize data to mask sensitive fields
   */
  sanitizeData(data) {
    const sanitized = { ...data };

    // Mask email addresses
    if (sanitized.email) {
      sanitized.email = this.maskEmail(sanitized.email);
    }

    // Completely redact tokens and secrets
    const redactFields = ['token', 'accessToken', 'refreshToken', 'password', 'secret', 'apiKey'];
    for (const field of redactFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Mask IP addresses in production (keep last octet for debugging)
    if (sanitized.ipAddress && process.env.NODE_ENV === 'production') {
      sanitized.ipAddress = this.maskIp(sanitized.ipAddress);
    }

    // Mask phone numbers
    if (sanitized.phone) {
      sanitized.phone = this.maskPhone(sanitized.phone);
    }

    return sanitized;
  }

  /**
   * Mask email address (show first char + domain)
   */
  maskEmail(email) {
    if (!email || typeof email !== 'string') return '';
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    const maskedLocal = local.length > 1
      ? `${local.charAt(0)}${'*'.repeat(Math.min(local.length - 1, 5))}`
      : '*';
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Mask IP address (keep last segment)
   */
  maskIp(ip) {
    if (!ip || typeof ip !== 'string') return '';
    const parts = ip.split('.');
    if (parts.length !== 4) return ip; // Not IPv4, return as-is
    return `***.***.***.${parts[3]}`;
  }

  /**
   * Mask phone number (show last 4 digits)
   */
  maskPhone(phone) {
    if (!phone || typeof phone !== 'string') return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '****';
    return `****${digits.slice(-4)}`;
  }

  // ==================== Convenience Methods ====================

  /**
   * Log successful login
   */
  loginSuccess(userId, data = {}) {
    return this.log(SecurityEventTypes.LOGIN_SUCCESS, {
      userId,
      ...data,
    }, Severity.INFO);
  }

  /**
   * Log failed login attempt
   */
  loginFailure(data = {}) {
    return this.log(SecurityEventTypes.LOGIN_FAILURE, data, Severity.WARNING);
  }

  /**
   * Log account lockout
   */
  accountLocked(userId, data = {}) {
    return this.log(SecurityEventTypes.ACCOUNT_LOCKED, {
      userId,
      ...data,
    }, Severity.WARNING);
  }

  /**
   * Log password change
   */
  passwordChanged(userId, data = {}) {
    return this.log(SecurityEventTypes.PASSWORD_CHANGE, {
      userId,
      ...data,
    }, Severity.INFO);
  }

  /**
   * Log payment success
   */
  paymentSuccess(userId, orderId, amount, data = {}) {
    return this.log(SecurityEventTypes.PAYMENT_SUCCESS, {
      userId,
      orderId,
      amount,
      ...data,
    }, Severity.INFO);
  }

  /**
   * Log payment failure
   */
  paymentFailure(userId, orderId, reason, data = {}) {
    return this.log(SecurityEventTypes.PAYMENT_FAILURE, {
      userId,
      orderId,
      reason,
      ...data,
    }, Severity.WARNING);
  }

  /**
   * Log external service error
   */
  externalServiceError(serviceName, operation, error, data = {}) {
    return this.log(SecurityEventTypes.EXTERNAL_SERVICE_ERROR, {
      externalService: serviceName,
      operation,
      error: error.message || String(error),
      ...data,
    }, Severity.WARNING);
  }

  /**
   * Log access denied
   */
  accessDenied(userId, resource, data = {}) {
    return this.log(SecurityEventTypes.ACCESS_DENIED, {
      userId,
      resource,
      ...data,
    }, Severity.WARNING);
  }

  /**
   * Log suspicious activity
   */
  suspiciousActivity(description, data = {}) {
    return this.log(SecurityEventTypes.SUSPICIOUS_ACTIVITY, {
      description,
      ...data,
    }, Severity.CRITICAL);
  }

  /**
   * Log rate limit exceeded
   */
  rateLimitExceeded(identifier, endpoint, data = {}) {
    return this.log(SecurityEventTypes.RATE_LIMIT_EXCEEDED, {
      identifier,
      endpoint,
      ...data,
    }, Severity.WARNING);
  }
}

// Export singleton instance and types
const securityAudit = new SecurityAudit();

module.exports = {
  securityAudit,
  SecurityAudit,
  SecurityEventTypes,
  Severity,
};
