const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../../../shared/src/middleware/validate');
const { authenticate } = require('../../../shared/src/middleware/auth');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  // Phone verification
  sendPhoneOtpSchema,
  verifyPhoneOtpSchema,
  // 2FA
  enable2FASchema,
  verify2FASchema,
  disable2FASchema,
  verify2FABackupSchema,
  // OAuth
  oauthLoginSchema,
  linkOAuthSchema,
  unlinkOAuthSchema,
  // Device sessions
  registerDeviceSchema,
  trustDeviceSchema,
  revokeDeviceSchema,
  // Security events
  securityEventsQuerySchema,
} = require('../validators/auth.validator');
// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', validate(logoutSchema), authController.logout);
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken
);
router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail
);
router.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  authController.resendVerification
);
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);
router.get('/login-history', authenticate, authController.getLoginHistory);
router.post('/revoke-all-tokens', authenticate, authController.revokeAllTokens);
router.delete('/revoke-session/:sessionId', authenticate, authController.revokeSession);

// ==================== Phone Verification Routes ====================
router.post(
  '/phone/send-otp',
  authenticate,
  validate(sendPhoneOtpSchema),
  authController.sendPhoneOtp
);
router.post(
  '/phone/verify-otp',
  authenticate,
  validate(verifyPhoneOtpSchema),
  authController.verifyPhoneOtp
);

// ==================== Two-Factor Authentication Routes ====================
router.get('/2fa/status', authenticate, authController.get2FAStatus);
router.post(
  '/2fa/enable',
  authenticate,
  validate(enable2FASchema),
  authController.enable2FA
);
router.post(
  '/2fa/confirm',
  authenticate,
  validate(verify2FASchema),
  authController.confirm2FA
);
router.post(
  '/2fa/disable',
  authenticate,
  validate(disable2FASchema),
  authController.disable2FA
);
router.post(
  '/2fa/verify',
  authenticate,
  validate(verify2FASchema),
  authController.verify2FACode
);
router.post(
  '/2fa/verify-backup',
  authenticate,
  validate(verify2FABackupSchema),
  authController.verify2FABackup
);

// ==================== OAuth Routes ====================
router.post('/oauth/login', validate(oauthLoginSchema), authController.oauthLogin);
router.get('/oauth/providers', authenticate, authController.getLinkedOAuthProviders);
router.post(
  '/oauth/link',
  authenticate,
  validate(linkOAuthSchema),
  authController.linkOAuth
);
router.delete(
  '/oauth/unlink/:provider',
  authenticate,
  validate(unlinkOAuthSchema),
  authController.unlinkOAuth
);

// ==================== Device Session Routes ====================
router.get('/devices', authenticate, authController.getDeviceSessions);
router.post(
  '/devices',
  authenticate,
  validate(registerDeviceSchema),
  authController.registerDevice
);
router.post(
  '/devices/:deviceId/trust',
  authenticate,
  validate(trustDeviceSchema),
  authController.trustDevice
);
router.delete(
  '/devices/:deviceId',
  authenticate,
  validate(revokeDeviceSchema),
  authController.revokeDevice
);
router.delete('/devices', authenticate, authController.revokeAllDevices);

// ==================== Security Events Routes ====================
router.get(
  '/security-events',
  authenticate,
  validate(securityEventsQuerySchema),
  authController.getSecurityEvents
);

module.exports = router;
