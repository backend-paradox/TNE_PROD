/**
 * Token Repository
 *
 * Handles all database operations for refresh tokens, OAuth providers,
 * device sessions, login history, and security events.
 */

const BaseRepository = require('../../../shared/src/repositories/BaseRepository');
const prisma = require('../config/prisma');

// ==================== Refresh Token Repository ====================

class RefreshTokenRepository extends BaseRepository {
  constructor() {
    super(prisma, 'refreshToken');
  }

  /**
   * Find refresh token by token string
   */
  async findByToken(token) {
    return this.model.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Create new refresh token
   */
  async createToken(data) {
    return this.create(data);
  }

  /**
   * Revoke a specific token
   */
  async revokeToken(token) {
    return this.model.updateMany({
      where: { token, isRevoked: false },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  }

  /**
   * Revoke token by ID
   */
  async revokeById(id) {
    return this.updateById(id, {
      isRevoked: true,
      revokedAt: new Date(),
    });
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllForUser(userId) {
    return this.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );
  }

  /**
   * Get active tokens count for user
   */
  async getActiveTokenCount(userId) {
    return this.count({
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    });
  }

  /**
   * Clean up expired tokens
   */
  async deleteExpired() {
    return this.deleteMany({
      OR: [
        { expiresAt: { lt: new Date() } },
        { isRevoked: true, revokedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      ],
    });
  }
}

// ==================== OAuth Provider Repository ====================

class OAuthProviderRepository extends BaseRepository {
  constructor() {
    super(prisma, 'oAuthProvider');
  }

  /**
   * Find OAuth provider by provider and ID
   */
  async findByProviderAndId(provider, providerId) {
    return this.model.findUnique({
      where: { provider_providerId: { provider, providerId } },
      include: { user: true },
    });
  }

  /**
   * Find OAuth provider for user
   */
  async findByUserAndProvider(userId, provider) {
    return this.model.findUnique({
      where: { userId_provider: { userId, provider } },
    });
  }

  /**
   * Get all OAuth providers for user
   */
  async findAllForUser(userId) {
    return this.findAll({ userId }, {
      select: {
        provider: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  /**
   * Link OAuth provider to user
   */
  async linkProvider(userId, data) {
    return this.create({
      userId,
      ...data,
    });
  }

  /**
   * Unlink OAuth provider from user
   */
  async unlinkProvider(userId, provider) {
    return this.delete({
      userId_provider: { userId, provider },
    });
  }
}

// ==================== Device Session Repository ====================

class DeviceSessionRepository extends BaseRepository {
  constructor() {
    super(prisma, 'deviceSession');
  }

  /**
   * Find active sessions for user
   */
  async findActiveForUser(userId) {
    return this.findAll(
      { userId, isActive: true },
      { orderBy: { lastActive: 'desc' } }
    );
  }

  /**
   * Find or create device session
   */
  async upsertSession(userId, deviceId, data) {
    return this.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      create: { userId, deviceId, ...data },
      update: { ...data, lastActive: new Date(), isActive: true },
    });
  }

  /**
   * Update device session activity
   */
  async updateActivity(userId, deviceId, data) {
    return this.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      create: { userId, deviceId, deviceType: 'UNKNOWN', ...data },
      update: { lastActive: new Date(), ...data },
    });
  }

  /**
   * Trust a device
   */
  async trustDevice(userId, deviceId) {
    return this.update(
      { userId_deviceId: { userId, deviceId } },
      { isTrusted: true }
    );
  }

  /**
   * Revoke device session
   */
  async revokeDevice(userId, deviceId) {
    return this.update(
      { userId_deviceId: { userId, deviceId } },
      { isActive: false }
    );
  }

  /**
   * Revoke all device sessions for user
   */
  async revokeAllForUser(userId, exceptDeviceId = null) {
    const where = { userId, isActive: true };
    if (exceptDeviceId) {
      where.deviceId = { not: exceptDeviceId };
    }
    return this.updateMany(where, { isActive: false });
  }
}

// ==================== Login History Repository ====================

class LoginHistoryRepository extends BaseRepository {
  constructor() {
    super(prisma, 'loginHistory');
  }

  /**
   * Log login attempt
   */
  async logAttempt(data) {
    return this.create({
      userId: data.userId,
      ipAddress: data.ipAddress || 'unknown',
      userAgent: data.userAgent || 'unknown',
      loginStatus: data.status,
      failureReason: data.reason,
    });
  }

  /**
   * Get login history for user with pagination
   */
  async getHistoryForUser(userId, { page = 1, limit = 20 } = {}) {
    return this.findWithPagination({
      where: { userId },
      page,
      limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get recent failed logins
   */
  async getRecentFailedLogins(userId, since) {
    return this.count({
      userId,
      loginStatus: 'FAILED',
      createdAt: { gte: since },
    });
  }
}

// ==================== Security Event Repository ====================

class SecurityEventRepository extends BaseRepository {
  constructor() {
    super(prisma, 'securityEvent');
  }

  /**
   * Log security event
   */
  async logEvent(userId, eventType, metadata = {}, severity = 'INFO') {
    return this.create({
      userId,
      eventType,
      metadata,
      severity,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });
  }

  /**
   * Get security events for user with filters
   */
  async getEventsForUser(userId, { page = 1, limit = 20, eventType, severity } = {}) {
    const where = { userId };
    if (eventType) where.eventType = eventType;
    if (severity) where.severity = severity;

    return this.findWithPagination({
      where,
      page,
      limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get events by type for user
   */
  async getEventsByType(userId, eventType, limit = 10) {
    return this.findAll(
      { userId, eventType },
      {
        orderBy: { createdAt: 'desc' },
        take: limit,
      }
    );
  }
}

// Export singleton instances
module.exports = {
  refreshTokenRepository: new RefreshTokenRepository(),
  oAuthProviderRepository: new OAuthProviderRepository(),
  deviceSessionRepository: new DeviceSessionRepository(),
  loginHistoryRepository: new LoginHistoryRepository(),
  securityEventRepository: new SecurityEventRepository(),
};
