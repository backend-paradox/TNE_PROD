/**
 * Auth Service DTOs (Data Transfer Objects)
 *
 * These classes standardize request/response shapes and provide
 * data transformation between layers.
 */

// ==================== User DTOs ====================

/**
 * Safe user data for API responses (excludes sensitive fields)
 */
class UserResponseDTO {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone || null;
    this.role = user.role;
    this.status = user.status;
    this.isEmailVerified = user.isEmailVerified;
    this.isPhoneVerified = user.isPhoneVerified;
    this.twoFactorEnabled = user.twoFactorEnabled;
    this.lastLogin = user.lastLogin;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static from(user) {
    if (!user) return null;
    return new UserResponseDTO(user);
  }

  static fromMany(users) {
    return users.map(user => new UserResponseDTO(user));
  }
}

/**
 * Minimal user data (for lists, references)
 */
class UserMinimalDTO {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
  }

  static from(user) {
    if (!user) return null;
    return new UserMinimalDTO(user);
  }
}

// ==================== Auth Response DTOs ====================

/**
 * Login/Register response
 */
class AuthResponseDTO {
  constructor({ user, tokens }) {
    this.user = UserResponseDTO.from(user);
    this.tokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn || '15m',
    };
  }

  static from(data) {
    return new AuthResponseDTO(data);
  }
}

/**
 * Token refresh response
 */
class TokenResponseDTO {
  constructor(tokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.expiresIn = tokens.expiresIn || '15m';
  }

  static from(tokens) {
    return new TokenResponseDTO(tokens);
  }
}

/**
 * 2FA requires response (partial login)
 */
class TwoFactorRequiredDTO {
  constructor(data) {
    this.requiresTwoFactor = true;
    this.userId = data.userId;
    this.message = 'Two-factor authentication required';
  }

  static from(data) {
    return new TwoFactorRequiredDTO(data);
  }
}

// ==================== 2FA DTOs ====================

/**
 * 2FA setup response
 */
class TwoFactorSetupDTO {
  constructor(data) {
    this.secret = data.secret;
    this.qrCodeUrl = data.qrCodeUrl || null;
    this.backupCodesCount = data.backupCodesCount;
  }

  static from(data) {
    return new TwoFactorSetupDTO(data);
  }
}

/**
 * 2FA enable confirmation response
 */
class TwoFactorEnabledDTO {
  constructor(data) {
    this.enabled = true;
    this.backupCodes = data.backupCodes;
    this.warning = 'Save these backup codes securely. They will not be shown again.';
  }

  static from(data) {
    return new TwoFactorEnabledDTO(data);
  }
}

/**
 * 2FA status response
 */
class TwoFactorStatusDTO {
  constructor(data) {
    this.enabled = data.enabled;
    this.hasBackupCodes = data.hasBackupCodes;
    this.backupCodesRemaining = data.backupCodesRemaining;
  }

  static from(data) {
    return new TwoFactorStatusDTO(data);
  }
}

// ==================== Device Session DTOs ====================

/**
 * Device session response
 */
class DeviceSessionDTO {
  constructor(session) {
    this.id = session.id;
    this.deviceId = session.deviceId;
    this.deviceName = session.deviceName;
    this.deviceType = session.deviceType;
    this.platform = session.platform;
    this.browser = session.browser;
    this.browserVersion = session.browserVersion;
    this.ipAddress = this._maskIp(session.ipAddress);
    this.isTrusted = session.isTrusted;
    this.isActive = session.isActive;
    this.lastActive = session.lastActive;
    this.createdAt = session.createdAt;
  }

  _maskIp(ip) {
    if (!ip) return null;
    // Mask last octet for privacy
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '***';
      return parts.join('.');
    }
    return ip;
  }

  static from(session) {
    if (!session) return null;
    return new DeviceSessionDTO(session);
  }

  static fromMany(sessions) {
    return sessions.map(s => new DeviceSessionDTO(s));
  }
}

// ==================== OAuth DTOs ====================

/**
 * OAuth provider response
 */
class OAuthProviderDTO {
  constructor(provider) {
    this.provider = provider.provider;
    this.email = provider.email;
    this.name = provider.name;
    this.linkedAt = provider.createdAt;
  }

  static from(provider) {
    if (!provider) return null;
    return new OAuthProviderDTO(provider);
  }

  static fromMany(providers) {
    return providers.map(p => new OAuthProviderDTO(p));
  }
}

// ==================== Security Event DTOs ====================

/**
 * Security event response
 */
class SecurityEventDTO {
  constructor(event) {
    this.id = event.id;
    this.eventType = event.eventType;
    this.severity = event.severity;
    this.ipAddress = this._maskIp(event.ipAddress);
    this.timestamp = event.createdAt;
    // Exclude raw metadata for security
    this.details = this._sanitizeMetadata(event.metadata);
  }

  _maskIp(ip) {
    if (!ip) return null;
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '***';
      return parts.join('.');
    }
    return ip;
  }

  _sanitizeMetadata(metadata) {
    if (!metadata) return {};
    // Remove sensitive fields from metadata
    const { password, token, secret, ...safe } = metadata;
    return safe;
  }

  static from(event) {
    if (!event) return null;
    return new SecurityEventDTO(event);
  }

  static fromMany(events) {
    return events.map(e => new SecurityEventDTO(e));
  }
}

// ==================== Login History DTOs ====================

/**
 * Login history entry response
 */
class LoginHistoryDTO {
  constructor(entry) {
    this.id = entry.id;
    this.status = entry.loginStatus;
    this.ipAddress = this._maskIp(entry.ipAddress);
    this.userAgent = entry.userAgent;
    this.failureReason = entry.failureReason;
    this.timestamp = entry.createdAt;
  }

  _maskIp(ip) {
    if (!ip) return null;
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '***';
      return parts.join('.');
    }
    return ip;
  }

  static from(entry) {
    if (!entry) return null;
    return new LoginHistoryDTO(entry);
  }

  static fromMany(entries) {
    return entries.map(e => new LoginHistoryDTO(e));
  }
}

// ==================== Pagination DTOs ====================

/**
 * Paginated response wrapper
 */
class PaginatedResponseDTO {
  constructor(data, pagination, DTOClass = null) {
    this.data = DTOClass ? DTOClass.fromMany(data) : data;
    this.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrev,
    };
  }

  static from(result, DTOClass = null) {
    return new PaginatedResponseDTO(result.data, result.pagination, DTOClass);
  }
}

module.exports = {
  // User DTOs
  UserResponseDTO,
  UserMinimalDTO,

  // Auth DTOs
  AuthResponseDTO,
  TokenResponseDTO,
  TwoFactorRequiredDTO,

  // 2FA DTOs
  TwoFactorSetupDTO,
  TwoFactorEnabledDTO,
  TwoFactorStatusDTO,

  // Device/Session DTOs
  DeviceSessionDTO,

  // OAuth DTOs
  OAuthProviderDTO,

  // Security DTOs
  SecurityEventDTO,
  LoginHistoryDTO,

  // Pagination
  PaginatedResponseDTO,
};
