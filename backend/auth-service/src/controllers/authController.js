/**
 * Auth Controller
 *
 * Handles HTTP requests and responses for authentication endpoints.
 * Delegates business logic to authService.
 *
 * Architecture:
 *   Route -> Controller -> Service -> Repository
 */

const authService = require('../services/authService');
const ApiResponse = require('../../../shared/src/utils/ApiResponse');
const {
  UserResponseDTO,
  AuthResponseDTO,
  TokenResponseDTO,
  TwoFactorRequiredDTO,
  TwoFactorSetupDTO,
  TwoFactorEnabledDTO,
  TwoFactorStatusDTO,
  DeviceSessionDTO,
  OAuthProviderDTO,
  SecurityEventDTO,
  LoginHistoryDTO,
  PaginatedResponseDTO,
} = require('../dto/auth.dto');

class AuthController {
  // ==================== Core Authentication ====================

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      ApiResponse.success(UserResponseDTO.from(user)).send(res);
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const { name, email, password, phone, role } = req.body;
      const result = await authService.register({ name, email, password, phone, role });

      ApiResponse.created(
        AuthResponseDTO.from(result),
        'Registration successful. Please check your email to verify your account.'
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password, twoFactorCode, deviceId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login({
        email,
        password,
        ipAddress,
        userAgent,
        twoFactorCode,
        deviceId,
      });

      // Handle 2FA required response
      if (result.requiresTwoFactor) {
        return ApiResponse.success(
          TwoFactorRequiredDTO.from(result),
          'Two-factor authentication required'
        ).send(res);
      }

      ApiResponse.success(
        AuthResponseDTO.from(result),
        'Login successful'
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.logout(refreshToken);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const tokens = await authService.refreshAccessToken(refreshToken, ipAddress, userAgent);
      ApiResponse.success(
        TokenResponseDTO.from(tokens),
        'Token refreshed successfully'
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  // ==================== Email Verification ====================

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail(token);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.resendVerificationEmail(email);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  // ==================== Password Management ====================

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await authService.forgotPassword(email, ipAddress);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await authService.resetPassword(token, newPassword, ipAddress);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await authService.changePassword(userId, currentPassword, newPassword, ipAddress);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  // ==================== Login History ====================

  async getLoginHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await authService.getLoginHistory(userId, { page, limit });
      ApiResponse.success(
        PaginatedResponseDTO.from(result, LoginHistoryDTO),
        'Login history retrieved'
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async revokeAllTokens(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await authService.revokeAllTokens(userId);
      ApiResponse.success(
        { revokedCount: result.revokedCount },
        result.message
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async revokeSession(req, res, next) {
    try {
      const userId = req.user.id;
      const sessionId = parseInt(req.params.sessionId, 10);

      if (isNaN(sessionId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid session ID',
        });
      }

      const result = await authService.revokeSession(userId, sessionId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== Phone Verification ====================

  async sendPhoneOtp(req, res, next) {
    try {
      const userId = req.user.id;
      const { phone } = req.body;

      const result = await authService.sendPhoneOtp(userId, phone);
      ApiResponse.success(
        { expiresIn: result.expiresIn },
        result.message
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async verifyPhoneOtp(req, res, next) {
    try {
      const userId = req.user.id;
      const { phone, otp } = req.body;

      const result = await authService.verifyPhoneOtp(userId, phone, otp);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  // ==================== Two-Factor Authentication ====================

  async enable2FA(req, res, next) {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      const result = await authService.enable2FA(userId, password);
      ApiResponse.success(
        TwoFactorSetupDTO.from(result),
        result.message
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async confirm2FA(req, res, next) {
    try {
      const userId = req.user.id;
      const { code } = req.body;

      const result = await authService.confirm2FA(userId, code);
      ApiResponse.success(
        TwoFactorEnabledDTO.from(result),
        result.message
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async disable2FA(req, res, next) {
    try {
      const userId = req.user.id;
      const { password, code } = req.body;

      const result = await authService.disable2FA(userId, password, code);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  async verify2FACode(req, res, next) {
    try {
      const userId = req.user.id;
      const { code } = req.body;

      const result = await authService.verify2FACode(userId, code);
      ApiResponse.success({ valid: result.valid }, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  async verify2FABackup(req, res, next) {
    try {
      const userId = req.user.id;
      const { backupCode } = req.body;

      const result = await authService.verify2FABackupCode(userId, backupCode);
      ApiResponse.success(
        { remainingBackupCodes: result.remainingBackupCodes },
        result.message
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async get2FAStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await authService.get2FAStatus(userId);
      ApiResponse.success(TwoFactorStatusDTO.from(result)).send(res);
    } catch (error) {
      next(error);
    }
  }

  // ==================== OAuth ====================

  async oauthLogin(req, res, next) {
    try {
      const { provider, providerId, email, name, avatarUrl } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.oauthLogin({
        provider,
        providerId,
        email,
        name,
        avatarUrl,
        ipAddress,
        userAgent,
      });

      ApiResponse.success(
        AuthResponseDTO.from(result),
        result.isNewUser ? 'Account created and logged in' : 'Login successful'
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async linkOAuth(req, res, next) {
    try {
      const userId = req.user.id;
      const { provider, providerId, email, name, avatarUrl } = req.body;

      const result = await authService.linkOAuth(userId, {
        provider,
        providerId,
        email,
        name,
        avatarUrl,
      });

      ApiResponse.success(
        { provider: result.provider },
        result.message
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async unlinkOAuth(req, res, next) {
    try {
      const userId = req.user.id;
      const { provider } = req.params;

      const result = await authService.unlinkOAuth(userId, provider);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getLinkedOAuthProviders(req, res, next) {
    try {
      const userId = req.user.id;
      const providers = await authService.getLinkedOAuthProviders(userId);
      ApiResponse.success(OAuthProviderDTO.fromMany(providers)).send(res);
    } catch (error) {
      next(error);
    }
  }

  // ==================== Device Sessions ====================

  async getDeviceSessions(req, res, next) {
    try {
      const userId = req.user.id;
      const sessions = await authService.getDeviceSessions(userId);
      ApiResponse.success(DeviceSessionDTO.fromMany(sessions)).send(res);
    } catch (error) {
      next(error);
    }
  }

  async registerDevice(req, res, next) {
    try {
      const userId = req.user.id;
      const deviceData = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const session = await authService.registerDevice(userId, deviceData, ipAddress);
      ApiResponse.created(
        DeviceSessionDTO.from(session),
        'Device registered successfully'
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async trustDevice(req, res, next) {
    try {
      const userId = req.user.id;
      const { deviceId } = req.params;

      const result = await authService.trustDevice(userId, deviceId);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  async revokeDevice(req, res, next) {
    try {
      const userId = req.user.id;
      const { deviceId } = req.params;

      const result = await authService.revokeDevice(userId, deviceId);
      ApiResponse.success(null, result.message).send(res);
    } catch (error) {
      next(error);
    }
  }

  async revokeAllDevices(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await authService.revokeAllDevices(userId);

      ApiResponse.success(
        { revokedCount: result.revokedCount },
        result.message
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  // ==================== Security Events ====================

  async getSecurityEvents(req, res, next) {
    try {
      const userId = req.user.id;
      const { page, limit, eventType, severity } = req.query;

      const result = await authService.getSecurityEvents(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        eventType,
        severity,
      });

      ApiResponse.success(
        PaginatedResponseDTO.from(result, SecurityEventDTO)
      ).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
