/**
 * User Repository
 *
 * Handles all database operations for users in the auth context.
 * Extends BaseRepository for common CRUD operations.
 */

const BaseRepository = require('../../../shared/src/repositories/BaseRepository');
const prisma = require('../config/prisma');

// Default select fields to exclude sensitive data
const DEFAULT_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  twoFactorEnabled: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
};

// Full user select (for internal auth operations)
const FULL_USER_SELECT = {
  ...DEFAULT_USER_SELECT,
  password: true,
  twoFactorSecret: true,
  twoFactorBackupCodes: true,
  failedAttempts: true,
  lockedUntil: true,
  emailVerificationToken: true,
  emailVerificationExpires: true,
  resetToken: true,
  resetTokenExpires: true,
  phoneVerificationOtp: true,
  phoneVerificationExpires: true,
  phoneVerificationAttempts: true,
  lastPasswordChange: true,
};

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma, 'user');
    this.defaultSelect = DEFAULT_USER_SELECT;
    this.fullSelect = FULL_USER_SELECT;
  }

  /**
   * Find user by email (for login/auth operations)
   */
  async findByEmail(email, options = {}) {
    return this.findOne({ email }, options);
  }

  /**
   * Find user by email with full auth data
   */
  async findByEmailForAuth(email) {
    return this.model.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID with safe fields only
   */
  async findByIdSafe(id) {
    return this.model.findUnique({
      where: { id },
      select: this.defaultSelect,
    });
  }

  /**
   * Find user by email verification token
   */
  async findByVerificationToken(token) {
    return this.model.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gte: new Date() },
      },
    });
  }

  /**
   * Find user by password reset token
   */
  async findByResetToken(hashedToken) {
    return this.model.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: { gte: new Date() },
      },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email) {
    return this.exists({ email });
  }

  /**
   * Create new user with safe return
   */
  async createUser(data) {
    return this.create(data, {
      select: this.defaultSelect,
    });
  }

  /**
   * Update user by ID
   */
  async updateUser(id, data) {
    return this.updateById(id, data, {
      select: this.defaultSelect,
    });
  }

  /**
   * Update failed login attempts
   */
  async incrementFailedAttempts(id, lockUntil = null) {
    const data = {
      failedAttempts: { increment: 1 },
    };
    if (lockUntil) {
      data.lockedUntil = lockUntil;
    }
    return this.updateById(id, data);
  }

  /**
   * Reset failed login attempts on successful login
   */
  async resetFailedAttempts(id) {
    return this.updateById(id, {
      failedAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    });
  }

  /**
   * Set email verification token
   */
  async setVerificationToken(id, token, expires) {
    return this.updateById(id, {
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    });
  }

  /**
   * Mark email as verified
   */
  async markEmailVerified(id) {
    return this.updateById(id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });
  }

  /**
   * Set password reset token
   */
  async setResetToken(id, hashedToken, expires) {
    return this.updateById(id, {
      resetToken: hashedToken,
      resetTokenExpires: expires,
    });
  }

  /**
   * Update password and clear reset token
   */
  async updatePassword(id, hashedPassword) {
    return this.updateById(id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
      lastPasswordChange: new Date(),
      failedAttempts: 0,
      lockedUntil: null,
    });
  }

  /**
   * Set phone OTP
   */
  async setPhoneOtp(id, phone, otp, expires) {
    return this.updateById(id, {
      phone,
      phoneVerificationOtp: otp,
      phoneVerificationExpires: expires,
      phoneVerificationAttempts: 0,
    });
  }

  /**
   * Increment phone OTP attempts
   */
  async incrementPhoneOtpAttempts(id) {
    return this.updateById(id, {
      phoneVerificationAttempts: { increment: 1 },
    });
  }

  /**
   * Mark phone as verified
   */
  async markPhoneVerified(id) {
    return this.updateById(id, {
      isPhoneVerified: true,
      phoneVerificationOtp: null,
      phoneVerificationExpires: null,
      phoneVerificationAttempts: 0,
    });
  }

  /**
   * Set 2FA secret and backup codes
   */
  async set2FASecret(id, secret, backupCodes) {
    return this.updateById(id, {
      twoFactorSecret: secret,
      twoFactorBackupCodes: backupCodes,
    });
  }

  /**
   * Enable 2FA
   */
  async enable2FA(id, backupCodes) {
    return this.updateById(id, {
      twoFactorEnabled: true,
      twoFactorBackupCodes: backupCodes,
    });
  }

  /**
   * Disable 2FA
   */
  async disable2FA(id) {
    return this.updateById(id, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    });
  }

  /**
   * Update 2FA backup codes
   */
  async updateBackupCodes(id, codes) {
    return this.updateById(id, {
      twoFactorBackupCodes: codes,
    });
  }

  /**
   * Get 2FA status
   */
  async get2FAStatus(id) {
    return this.model.findUnique({
      where: { id },
      select: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: true,
      },
    });
  }

  /**
   * Get user with OAuth providers
   */
  async findWithOAuthProviders(id) {
    return this.model.findUnique({
      where: { id },
      include: { oauthProviders: true },
    });
  }
}

// Export singleton instance
module.exports = new UserRepository();
