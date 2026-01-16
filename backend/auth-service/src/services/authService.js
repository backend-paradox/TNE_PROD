/**
 * Auth Service
 *
 * Business logic layer for authentication operations.
 * Uses repository layer for all database operations.
 *
 * Architecture:
 *   Controller -> Service -> Repository -> Database
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const axios = require('axios');

// Repositories
const {
  userRepository,
  refreshTokenRepository,
  oAuthProviderRepository,
  deviceSessionRepository,
  loginHistoryRepository,
  securityEventRepository,
} = require('../repositories');

// Utils
const { generateAuthTokens } = require('../utils/jwt');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../config/email');
const { env } = require('../config/env');

// Shared error classes
const {
  AuthenticationError,
  NotFoundError,
  ConflictError,
  ValidationError,
} = require('../../../shared/src/utils/errors');

// ==================== Configuration ====================

const SALT_ROUNDS = env.SALT_ROUNDS;
const MAX_LOGIN_ATTEMPTS = env.MAX_LOGIN_ATTEMPTS;
const LOCK_TIME = env.LOCK_TIME_MINUTES * 60 * 1000;
const EMAIL_VERIFICATION_EXPIRES = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRES = 60 * 60 * 1000;
const PHONE_OTP_EXPIRES = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 3;

// Password validation
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Logger
const log = {
  info: (msg, meta = {}) => console.log(`[AUTH-SERVICE] INFO: ${msg}`, JSON.stringify(meta)),
  warn: (msg, meta = {}) => console.warn(`[AUTH-SERVICE] WARN: ${msg}`, JSON.stringify(meta)),
  error: (msg, meta = {}) => console.error(`[AUTH-SERVICE] ERROR: ${msg}`, JSON.stringify(meta)),
};

// ==================== Helper Functions ====================

const safeParseInt = (value, defaultValue, min = 1, max = 100) => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < min) return defaultValue;
  if (parsed > max) return max;
  return parsed;
};

// ==================== Auth Service Class ====================

class AuthService {
  // ==================== Password Validation ====================

  validatePassword(password) {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }
    if (!PASSWORD_REGEX.test(password)) {
      throw new ValidationError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    }
    return true;
  }

  // ==================== Core Authentication ====================

  async getCurrentUser(userId) {
    const user = await userRepository.findByIdSafe(userId);
    if (!user) {
      throw NotFoundError.user();
    }
    return user;
  }

  async register({ name, email, password, phone, role = 'USER' }) {
    this.validatePassword(password);

    const exists = await userRepository.emailExists(email);
    if (exists) {
      throw ConflictError.emailTaken();
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES);

    const user = await userRepository.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Send verification email (non-blocking)
    if (process.env.SMTP_HOST) {
      sendVerificationEmail(email, name, emailVerificationToken).catch((error) => {
        log.error('Failed to send verification email', { userId: user.id, error: error.message });
      });
    }

    // Create user profile in user-service (non-blocking)
    this._createUserProfile(user).catch((error) => {
      log.error('Failed to create user profile', { userId: user.id, error: error.message });
    });

    const tokens = await this._generateTokens(user);
    return { user, tokens };
  }

  async login({ email, password, ipAddress, userAgent, twoFactorCode, deviceId }) {
    const user = await userRepository.findByEmailForAuth(email);

    if (!user) {
      await this._logLoginAttempt({ email, ipAddress, userAgent, status: 'FAILED', reason: 'User not found' });
      throw AuthenticationError.invalidCredentials();
    }

    // Check account lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil - new Date()) / 60000);
      throw new AuthenticationError(`Account locked. Try again in ${remainingTime} minutes`);
    }

    // Check account status
    if (user.status !== 'ACTIVE') {
      throw new AuthenticationError('Account is not active');
    }

    // OAuth-only users
    if (!user.password) {
      throw new AuthenticationError('Please login using your social account');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this._handleFailedLogin(user, ipAddress, userAgent);
      throw AuthenticationError.invalidCredentials();
    }

    // 2FA check
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return { requiresTwoFactor: true, userId: user.id };
      }
      const result = await this.verify2FACode(user.id, twoFactorCode);
      if (!result.valid) {
        throw new AuthenticationError('Invalid two-factor code');
      }
    }

    // Update device session
    if (deviceId) {
      await deviceSessionRepository.updateActivity(user.id, deviceId, { ipAddress, userAgent });
    }

    // Reset failed attempts and update last login
    await userRepository.resetFailedAttempts(user.id);
    await this._logLoginAttempt({ userId: user.id, ipAddress, userAgent, status: 'SUCCESS' });

    const tokens = await this._generateTokens(user, { ipAddress, userAgent });
    const { password: _, twoFactorSecret: __, twoFactorBackupCodes: ___, ...safeUser } = user;

    return { user: safeUser, tokens };
  }

  async logout(refreshToken) {
    await refreshTokenRepository.revokeToken(refreshToken);
    return { message: 'Logged out successfully' };
  }

  async refreshAccessToken(refreshToken, ipAddress, userAgent) {
    const tokenRecord = await refreshTokenRepository.findByToken(refreshToken);

    if (!tokenRecord) throw AuthenticationError.tokenInvalid();
    if (tokenRecord.isRevoked) throw new AuthenticationError('Refresh token has been revoked');
    if (tokenRecord.expiresAt < new Date()) throw AuthenticationError.tokenExpired();
    if (tokenRecord.user.status !== 'ACTIVE') throw new AuthenticationError('Account is not active');

    await refreshTokenRepository.revokeById(tokenRecord.id);
    return await this._generateTokens(tokenRecord.user, { ipAddress, userAgent, replacedToken: refreshToken });
  }

  // ==================== Email Verification ====================

  async verifyEmail(token) {
    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      throw new AuthenticationError('Invalid or expired verification token');
    }

    await userRepository.markEmailVerified(user.id);

    if (process.env.SMTP_HOST) {
      sendWelcomeEmail(user.email, user.name).catch((err) => {
        log.error('Failed to send welcome email', { userId: user.id, error: err.message });
      });
    }

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AuthenticationError('User not found');
    if (user.isEmailVerified) throw new AuthenticationError('Email is already verified');

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES);

    await userRepository.setVerificationToken(user.id, emailVerificationToken, emailVerificationExpires);

    if (process.env.SMTP_HOST) {
      await sendVerificationEmail(user.email, user.name, emailVerificationToken);
    }

    return { message: 'Verification email sent' };
  }

  // ==================== Password Management ====================

  async forgotPassword(email, ipAddress) {
    const user = await userRepository.findByEmail(email);
    // Always return same message to prevent email enumeration
    if (!user) return { message: 'If the email exists, a password reset link has been sent' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRES);

    await userRepository.setResetToken(user.id, hashedToken, resetTokenExpires);
    await this._logSecurityEvent(user.id, 'PASSWORD_RESET_REQUEST', { ipAddress });

    if (env.SMTP_HOST) {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } else if (process.env.NODE_ENV === 'development') {
      log.info('Password reset requested (dev mode)', { userId: user.id });
    }

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(token, newPassword, ipAddress) {
    this.validatePassword(newPassword);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) throw new AuthenticationError('Invalid or expired reset token');

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(user.id, hashedPassword);

    // Revoke all tokens and sessions
    await refreshTokenRepository.revokeAllForUser(user.id);
    await deviceSessionRepository.revokeAllForUser(user.id);

    await this._logSecurityEvent(user.id, 'PASSWORD_RESET_SUCCESS', { ipAddress });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId, currentPassword, newPassword, ipAddress) {
    this.validatePassword(newPassword);

    const user = await userRepository.findById(userId);
    if (!user) throw NotFoundError.user();

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) throw new AuthenticationError('Current password is incorrect');

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new AuthenticationError('New password must be different from current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updateUser(userId, {
      password: hashedPassword,
      lastPasswordChange: new Date(),
    });

    await refreshTokenRepository.revokeAllForUser(userId);
    await this._logSecurityEvent(userId, 'PASSWORD_CHANGE', { ipAddress });

    return { message: 'Password changed successfully' };
  }

  // ==================== Phone Verification ====================

  async sendPhoneOtp(userId, phone) {
    const user = await userRepository.findById(userId);
    if (!user) throw NotFoundError.user();

    const otpBytes = crypto.randomBytes(3);
    const otp = (parseInt(otpBytes.toString('hex'), 16) % 900000 + 100000).toString();
    const expires = new Date(Date.now() + PHONE_OTP_EXPIRES);

    await userRepository.setPhoneOtp(userId, phone, otp, expires);

    if (process.env.NODE_ENV === 'development') {
      log.info('Phone OTP generated (dev mode)', { userId, phoneLastDigits: phone.slice(-4) });
    }

    // TODO: Integrate with SMS provider
    return { message: 'OTP sent to your phone', expiresIn: '10 minutes' };
  }

  async verifyPhoneOtp(userId, phone, otp) {
    const user = await userRepository.findById(userId);
    if (!user) throw NotFoundError.user();

    if (user.phoneVerificationAttempts >= MAX_OTP_ATTEMPTS) {
      throw new AuthenticationError('Too many failed attempts. Please request a new OTP');
    }

    if (!user.phoneVerificationOtp || user.phoneVerificationExpires < new Date()) {
      throw new AuthenticationError('OTP has expired. Please request a new one');
    }

    if (user.phone !== phone) {
      throw new AuthenticationError('Phone number does not match');
    }

    // Timing-safe comparison
    const otpBuffer = Buffer.from(otp);
    const storedOtpBuffer = Buffer.from(user.phoneVerificationOtp);

    if (otpBuffer.length !== storedOtpBuffer.length || !crypto.timingSafeEqual(otpBuffer, storedOtpBuffer)) {
      await userRepository.incrementPhoneOtpAttempts(userId);
      throw new AuthenticationError('Invalid OTP');
    }

    await userRepository.markPhoneVerified(userId);
    await this._logSecurityEvent(userId, 'PHONE_VERIFIED', { phoneLastDigits: phone.slice(-4) });

    return { message: 'Phone verified successfully' };
  }

  // ==================== Two-Factor Authentication ====================

  async enable2FA(userId, password) {
    const user = await userRepository.findById(userId);
    if (!user) throw NotFoundError.user();

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw AuthenticationError.invalidCredentials();

    if (user.twoFactorEnabled) {
      throw new ConflictError('Two-factor authentication is already enabled');
    }

    const secret = crypto.randomBytes(20).toString('base32');
    const plainBackupCodes = [];
    const hashedBackupCodes = [];

    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      plainBackupCodes.push(code);
      hashedBackupCodes.push(await bcrypt.hash(code, 10));
    }

    await userRepository.set2FASecret(userId, secret, hashedBackupCodes);

    return {
      secret,
      message: 'Scan this secret with your authenticator app, then verify with a code',
      backupCodesCount: 10,
    };
  }

  async confirm2FA(userId, code) {
    const result = await this.verify2FACode(userId, code);
    if (!result.valid) throw new AuthenticationError('Invalid verification code');

    // Generate new backup codes
    const backupCodes = [];
    const hashedCodes = [];
    for (let i = 0; i < 10; i++) {
      const backupCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      backupCodes.push(backupCode);
      hashedCodes.push(await bcrypt.hash(backupCode, 10));
    }

    await userRepository.enable2FA(userId, hashedCodes);
    await this._logSecurityEvent(userId, 'TWO_FACTOR_ENABLED', {});

    return {
      message: 'Two-factor authentication enabled successfully',
      backupCodes,
      warning: 'Save these backup codes securely. They will not be shown again.',
    };
  }

  async disable2FA(userId, password, code) {
    const user = await userRepository.findById(userId);
    if (!user) throw NotFoundError.user();

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw AuthenticationError.invalidCredentials();

    const codeResult = await this.verify2FACode(userId, code);
    if (!codeResult.valid) throw new AuthenticationError('Invalid verification code');

    await userRepository.disable2FA(userId);
    await this._logSecurityEvent(userId, 'TWO_FACTOR_DISABLED', {});

    return { message: 'Two-factor authentication disabled successfully' };
  }

  async verify2FACode(userId, code) {
    const user = await userRepository.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return { valid: false, message: 'Two-factor authentication not set up' };
    }

    const timeStep = Math.floor(Date.now() / 30000);

    for (let i = -1; i <= 1; i++) {
      const expectedCode = crypto
        .createHmac('sha1', user.twoFactorSecret)
        .update((timeStep + i).toString())
        .digest('hex')
        .substring(0, 6);

      if (code === expectedCode) {
        return { valid: true, message: 'Code verified successfully' };
      }
    }

    return { valid: false, message: 'Invalid verification code' };
  }

  async verify2FABackupCode(userId, backupCode) {
    const user = await userRepository.findById(userId);
    if (!user || !user.twoFactorBackupCodes) {
      throw new AuthenticationError('No backup codes available');
    }

    const codes = [...user.twoFactorBackupCodes];
    let validIndex = -1;

    for (let i = 0; i < codes.length; i++) {
      if (await bcrypt.compare(backupCode, codes[i])) {
        validIndex = i;
        break;
      }
    }

    if (validIndex === -1) {
      throw new AuthenticationError('Invalid backup code');
    }

    codes.splice(validIndex, 1);
    await userRepository.updateBackupCodes(userId, codes);
    await this._logSecurityEvent(userId, 'BACKUP_CODE_USED', { remainingCodes: codes.length });

    return { message: 'Backup code verified', remainingBackupCodes: codes.length };
  }

  async get2FAStatus(userId) {
    const status = await userRepository.get2FAStatus(userId);
    if (!status) throw NotFoundError.user();

    return {
      enabled: status.twoFactorEnabled,
      hasBackupCodes: status.twoFactorBackupCodes && status.twoFactorBackupCodes.length > 0,
      backupCodesRemaining: status.twoFactorBackupCodes ? status.twoFactorBackupCodes.length : 0,
    };
  }

  // ==================== Device Sessions ====================

  async getDeviceSessions(userId) {
    return deviceSessionRepository.findActiveForUser(userId);
  }

  async registerDevice(userId, deviceData, ipAddress) {
    const { deviceId, deviceName, deviceType, platform, browser, browserVersion, pushToken } = deviceData;

    return deviceSessionRepository.upsertSession(userId, deviceId, {
      deviceName,
      deviceType: deviceType || 'UNKNOWN',
      platform,
      browser,
      browserVersion,
      ipAddress,
      pushToken,
    });
  }

  async trustDevice(userId, deviceId) {
    await deviceSessionRepository.trustDevice(userId, deviceId);
    return { message: 'Device trusted successfully' };
  }

  async revokeDevice(userId, deviceId) {
    await deviceSessionRepository.revokeDevice(userId, deviceId);
    await refreshTokenRepository.revokeAllForUser(userId);
    return { message: 'Device session revoked' };
  }

  async revokeAllDevices(userId, exceptDeviceId = null) {
    const result = await deviceSessionRepository.revokeAllForUser(userId, exceptDeviceId);
    await refreshTokenRepository.revokeAllForUser(userId);
    return { message: 'All device sessions revoked', revokedCount: result.count };
  }

  // ==================== OAuth ====================

  async oauthLogin({ provider, providerId, email, name, avatarUrl, ipAddress, userAgent }) {
    let oauthProvider = await oAuthProviderRepository.findByProviderAndId(provider, providerId);

    if (oauthProvider) {
      const user = oauthProvider.user;
      if (user.status !== 'ACTIVE') throw new AuthenticationError('Account is not active');

      await userRepository.updateUser(user.id, { lastLogin: new Date() });
      await this._logLoginAttempt({ userId: user.id, ipAddress, userAgent, status: 'SUCCESS' });

      const tokens = await this._generateTokens(user, { ipAddress, userAgent });
      const { password: _, twoFactorSecret: __, twoFactorBackupCodes: ___, ...safeUser } = user;

      return { user: safeUser, tokens, isNewUser: false };
    }

    let user = await userRepository.findByEmail(email);

    if (user) {
      await oAuthProviderRepository.linkProvider(user.id, { provider, providerId, email, name, avatarUrl });
      await this._logSecurityEvent(user.id, 'OAUTH_LINKED', { provider, ipAddress });
    } else {
      user = await userRepository.create({
        email,
        name,
        isEmailVerified: true,
      });

      await oAuthProviderRepository.linkProvider(user.id, { provider, providerId, email, name, avatarUrl });

      this._createUserProfile(user).catch((error) => {
        log.error('Failed to create OAuth user profile', { userId: user.id, error: error.message });
      });
    }

    await userRepository.updateUser(user.id, { lastLogin: new Date() });
    await this._logLoginAttempt({ userId: user.id, ipAddress, userAgent, status: 'SUCCESS' });

    const tokens = await this._generateTokens(user, { ipAddress, userAgent });
    const { password: _, twoFactorSecret: __, twoFactorBackupCodes: ___, ...safeUser } = user;

    return { user: safeUser, tokens, isNewUser: !oauthProvider };
  }

  async linkOAuth(userId, { provider, providerId, email, name, avatarUrl }) {
    const existing = await oAuthProviderRepository.findByUserAndProvider(userId, provider);
    if (existing) throw new ConflictError(`${provider} account already linked`);

    await oAuthProviderRepository.linkProvider(userId, { provider, providerId, email, name, avatarUrl });
    await this._logSecurityEvent(userId, 'OAUTH_LINKED', { provider });

    return { message: `${provider} account linked successfully`, provider };
  }

  async unlinkOAuth(userId, provider) {
    const user = await userRepository.findWithOAuthProviders(userId);
    if (!user) throw NotFoundError.user();

    if (!user.password && user.oauthProviders.length <= 1) {
      throw new AuthenticationError('Cannot unlink the only login method. Set a password first.');
    }

    await oAuthProviderRepository.unlinkProvider(userId, provider);
    await this._logSecurityEvent(userId, 'OAUTH_UNLINKED', { provider });

    return { message: `${provider} account unlinked successfully` };
  }

  async getLinkedOAuthProviders(userId) {
    return oAuthProviderRepository.findAllForUser(userId);
  }

  // ==================== Security Events & History ====================

  async getSecurityEvents(userId, options = {}) {
    return securityEventRepository.getEventsForUser(userId, options);
  }

  async revokeAllTokens(userId) {
    const result = await refreshTokenRepository.revokeAllForUser(userId);
    return { message: 'All tokens revoked successfully', revokedCount: result.count };
  }

  async getLoginHistory(userId, options = {}) {
    return loginHistoryRepository.getHistoryForUser(userId, options);
  }

  // ==================== Private Helper Methods ====================

  async _generateTokens(user, { ipAddress, userAgent, replacedToken } = {}) {
    const payload = { id: user.id, email: user.email, role: user.role };
    const tokens = generateAuthTokens(payload);

    const refreshDays = safeParseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS, 7, 1, 30);
    const expiresAt = new Date(Date.now() + (refreshDays * 24 * 60 * 60 * 1000));

    try {
      await refreshTokenRepository.createToken({
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt,
        ipAddress,
        userAgent,
        replacedByToken: replacedToken || null,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation - regenerate token
        const newTokens = generateAuthTokens(payload);
        await refreshTokenRepository.createToken({
          userId: user.id,
          token: newTokens.refreshToken,
          expiresAt,
          ipAddress,
          userAgent,
          replacedByToken: replacedToken || null,
        });
        return newTokens;
      }
      throw error;
    }

    return tokens;
  }

  async _handleFailedLogin(user, ipAddress, userAgent) {
    const failedAttempts = user.failedAttempts + 1;
    let lockUntil = null;

    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      lockUntil = new Date(Date.now() + LOCK_TIME);
      await this._logSecurityEvent(user.id, 'ACCOUNT_LOCKED', { ipAddress, userAgent }, 'WARNING');
    }

    await userRepository.incrementFailedAttempts(user.id, lockUntil);
    await this._logLoginAttempt({ userId: user.id, ipAddress, userAgent, status: 'FAILED', reason: 'Invalid password' });
  }

  async _logLoginAttempt(data) {
    try {
      if (data.userId) {
        await loginHistoryRepository.logAttempt(data);
      }
    } catch (error) {
      log.error('Failed to log login attempt', { userId: data.userId, status: data.status, error: error.message });
    }
  }

  async _logSecurityEvent(userId, eventType, metadata = {}, severity = 'INFO') {
    try {
      await securityEventRepository.logEvent(userId, eventType, metadata, severity);
    } catch (error) {
      log.error('Failed to log security event', { userId, eventType, error: error.message });
    }
  }

  async _createUserProfile(user) {
    if (!process.env.USER_SERVICE_URL) {
      log.warn('USER_SERVICE_URL not configured, skipping profile creation');
      return;
    }

    try {
      await axios.post(
        `${process.env.USER_SERVICE_URL}/api/v1/users/profile`,
        {
          authId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Service': 'auth-service',
          },
        }
      );
      log.info('User profile created successfully', { userId: user.id });
    } catch (error) {
      log.error('User profile creation failed', {
        userId: user.id,
        status: error.response?.status,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthService();
