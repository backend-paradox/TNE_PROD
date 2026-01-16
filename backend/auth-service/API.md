# Auth Service - API Endpoints Reference

Base URL: `http://localhost:3001`

All endpoints require `Authorization: Bearer <token>` header unless noted as public.

---

## Health Check

### GET /api/v1/health
**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "auth-service"
}
```

---

## Authentication

### POST /api/v1/auth/register
Register a new user. **Public**

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+919876543210",
  "role": "USER"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER",
      "isEmailVerified": false,
      "isPhoneVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

---

### POST /api/v1/auth/login
Login user. **Public**

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER",
      "isEmailVerified": true,
      "isPhoneVerified": false,
      "has2FAEnabled": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

---

### POST /api/v1/auth/logout
Logout user. **Public**

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /api/v1/auth/refresh
Refresh access token. **Public**

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

## Email Verification

### POST /api/v1/auth/verify-email
Verify email address. **Public**

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### POST /api/v1/auth/resend-verification
Resend verification email. **Public**

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

## Password Management

### POST /api/v1/auth/forgot-password
Request password reset. **Public**

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### POST /api/v1/auth/reset-password
Reset password with token. **Public**

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### POST /api/v1/auth/change-password
Change password (authenticated). **Requires Auth**

**Request Body:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Login History & Sessions

### GET /api/v1/auth/login-history
Get login history. **Requires Auth**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "location": "Mumbai, India",
      "createdAt": "2025-12-22T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### POST /api/v1/auth/revoke-all-tokens
Revoke all refresh tokens. **Requires Auth**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All tokens revoked successfully"
}
```

---

## Phone Verification

### POST /api/v1/auth/phone/send-otp
Send OTP to phone. **Requires Auth**

**Request Body:**
```json
{
  "phone": "+919876543210"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expiresIn": 300
  }
}
```

---

### POST /api/v1/auth/phone/verify-otp
Verify phone OTP. **Requires Auth**

**Request Body:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Phone verified successfully"
}
```

---

## Two-Factor Authentication (2FA)

### GET /api/v1/auth/2fa/status
Get 2FA status. **Requires Auth**

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isEnabled": false,
    "isPending": false,
    "backupCodesRemaining": 0
  }
}
```

---

### POST /api/v1/auth/2fa/enable
Enable 2FA (step 1 - get secret). **Requires Auth**

**Request Body:**
```json
{
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2FA setup initiated",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "backupCodesCount": 10
  }
}
```

---

### POST /api/v1/auth/2fa/confirm
Confirm 2FA setup (step 2). **Requires Auth**

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2FA enabled successfully",
  "data": {
    "backupCodes": [
      "ABCD-1234-EFGH",
      "IJKL-5678-MNOP"
    ]
  }
}
```

---

### POST /api/v1/auth/2fa/verify
Verify 2FA code. **Requires Auth**

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2FA code verified",
  "data": {
    "valid": true
  }
}
```

---

### POST /api/v1/auth/2fa/verify-backup
Verify using backup code. **Requires Auth**

**Request Body:**
```json
{
  "backupCode": "ABCD-1234-EFGH"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Backup code verified",
  "data": {
    "remainingBackupCodes": 9
  }
}
```

---

### POST /api/v1/auth/2fa/disable
Disable 2FA. **Requires Auth**

**Request Body:**
```json
{
  "password": "SecurePass123!",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

---

## OAuth Authentication

### POST /api/v1/auth/oauth/login
Login with OAuth provider. **Public**

**Request Body:**
```json
{
  "provider": "GOOGLE",
  "accessToken": "google-oauth-access-token",
  "idToken": "google-id-token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "isNewUser": false
  }
}
```

---

### GET /api/v1/auth/oauth/providers
Get linked OAuth providers. **Requires Auth**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "provider": "GOOGLE",
      "linkedAt": "2025-12-20T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/v1/auth/oauth/link
Link OAuth provider. **Requires Auth**

**Request Body:**
```json
{
  "provider": "GOOGLE",
  "accessToken": "google-oauth-access-token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Provider linked successfully",
  "data": {
    "provider": "GOOGLE"
  }
}
```

---

### DELETE /api/v1/auth/oauth/unlink/:provider
Unlink OAuth provider. **Requires Auth**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Provider unlinked successfully"
}
```

---

## Device Sessions

### GET /api/v1/auth/devices
Get all device sessions. **Requires Auth**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "device-uuid",
      "deviceName": "Chrome on Windows",
      "deviceType": "DESKTOP",
      "ipAddress": "192.168.1.1",
      "location": "Mumbai, India",
      "isTrusted": true,
      "lastActiveAt": "2025-12-22T10:00:00.000Z",
      "createdAt": "2025-12-20T08:00:00.000Z"
    }
  ]
}
```

---

### POST /api/v1/auth/devices
Register a new device. **Requires Auth**

**Request Body:**
```json
{
  "deviceName": "My iPhone",
  "deviceType": "MOBILE",
  "fcmToken": "firebase-cloud-messaging-token"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "id": "device-uuid",
    "deviceName": "My iPhone",
    "isTrusted": false
  }
}
```

---

### POST /api/v1/auth/devices/:deviceId/trust
Trust a device. **Requires Auth**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Device trusted successfully"
}
```

---

### DELETE /api/v1/auth/devices/:deviceId
Revoke a device session. **Requires Auth**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Device revoked successfully"
}
```

---

### DELETE /api/v1/auth/devices
Revoke all device sessions. **Requires Auth**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All devices revoked successfully",
  "data": {
    "revokedCount": 5
  }
}
```

---

## Security Events

### GET /api/v1/auth/security-events
Get security events. **Requires Auth**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `eventType` | string | - | Filter by event type |
| `severity` | string | - | Filter by severity |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "eventType": "LOGIN_SUCCESS",
      "severity": "INFO",
      "description": "Successful login from new device",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "metadata": {},
      "createdAt": "2025-12-22T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Email not verified"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many attempts. Please try again later",
  "retryAfter": 300
}
```

---

## Enums Reference

### Role
`USER`, `VENDOR`, `ADMIN`

### OAuthProvider
`GOOGLE`, `FACEBOOK`, `APPLE`

### DeviceType
`DESKTOP`, `MOBILE`, `TABLET`

### SecurityEventType
`LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `PASSWORD_CHANGE`, `PASSWORD_RESET`, `EMAIL_VERIFIED`, `PHONE_VERIFIED`, `2FA_ENABLED`, `2FA_DISABLED`, `DEVICE_TRUSTED`, `DEVICE_REVOKED`, `SUSPICIOUS_ACTIVITY`

### SecurityEventSeverity
`INFO`, `WARNING`, `CRITICAL`

---

*Last Updated: December 22, 2025*
