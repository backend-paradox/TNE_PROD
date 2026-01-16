const { z } = require('zod');

// ==================== Common Schemas ====================

// Strong password validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Phone validation (Indian format)
const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number format');

// OTP validation
const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

// ==================== Auth Schemas ====================

const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(120, 'Name must not exceed 120 characters')
      .trim(),
    email: z
      .string()
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    password: passwordSchema,
    phone: phoneSchema.optional(),
    role: z.enum(['USER', 'VENDOR', 'ADMIN']).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    twoFactorCode: z.string().length(6).optional(), // For 2FA
    deviceId: z.string().max(255).optional(), // For device tracking
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required to logout and invalidate your session'),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
});

// ==================== Phone Verification Schemas ====================

const sendPhoneOtpSchema = z.object({
  body: z.object({
    phone: phoneSchema,
  }),
});

const verifyPhoneOtpSchema = z.object({
  body: z.object({
    phone: phoneSchema,
    otp: otpSchema,
  }),
});

// ==================== Two-Factor Auth Schemas ====================

const enable2FASchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Password is required to enable 2FA'),
  }),
});

const verify2FASchema = z.object({
  body: z.object({
    code: z.string().length(6, 'Code must be 6 digits'),
  }),
});

const disable2FASchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Password is required to disable 2FA'),
    code: z.string().length(6, 'Code must be 6 digits'),
  }),
});

const verify2FABackupSchema = z.object({
  body: z.object({
    backupCode: z.string().min(8, 'Backup code is required'),
  }),
});

// ==================== OAuth Schemas ====================

const oauthLoginSchema = z.object({
  body: z.object({
    provider: z.enum(['GOOGLE', 'FACEBOOK', 'APPLE', 'TWITTER']),
    accessToken: z.string().min(1, 'Access token is required'),
    idToken: z.string().optional(), // For some providers like Google
  }),
});

const linkOAuthSchema = z.object({
  body: z.object({
    provider: z.enum(['GOOGLE', 'FACEBOOK', 'APPLE', 'TWITTER']),
    accessToken: z.string().min(1, 'Access token is required'),
  }),
});

const unlinkOAuthSchema = z.object({
  params: z.object({
    provider: z.enum(['GOOGLE', 'FACEBOOK', 'APPLE', 'TWITTER']),
  }),
});

// ==================== Device Session Schemas ====================

const registerDeviceSchema = z.object({
  body: z.object({
    deviceId: z.string().min(1).max(255),
    deviceName: z.string().max(100).optional(),
    deviceType: z.enum(['MOBILE', 'TABLET', 'DESKTOP', 'WEB', 'UNKNOWN']).optional(),
    platform: z.string().max(50).optional(),
    browser: z.string().max(50).optional(),
    browserVersion: z.string().max(20).optional(),
    pushToken: z.string().optional(),
  }),
});

const trustDeviceSchema = z.object({
  params: z.object({
    deviceId: z.string().min(1),
  }),
});

const revokeDeviceSchema = z.object({
  params: z.object({
    deviceId: z.string().min(1),
  }),
});

// ==================== Security Schemas ====================

const securityEventsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    eventType: z.enum([
      'PASSWORD_CHANGE',
      'EMAIL_CHANGE',
      'PHONE_CHANGE',
      'TWO_FACTOR_ENABLED',
      'TWO_FACTOR_DISABLED',
      'SUSPICIOUS_LOGIN',
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',
      'PASSWORD_RESET_REQUEST',
      'PASSWORD_RESET_SUCCESS',
      'LOGIN_NEW_DEVICE',
      'OAUTH_LINKED',
      'OAUTH_UNLINKED',
    ]).optional(),
    severity: z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
  }),
});

module.exports = {
  // Auth
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
  // Security
  securityEventsQuerySchema,
};
