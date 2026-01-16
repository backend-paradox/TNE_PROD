# Auth Service

Secure authentication microservice for TNE platform with JWT tokens, 2FA, OAuth, phone verification, and device management.

## Overview

- **Port:** 3001
- **Status:** Production-Ready
- **Database:** PostgreSQL (tne_authdb)

## Features

### Core Authentication
- User registration with email verification
- Login with JWT access + refresh tokens
- Password reset via email
- Account lockout (5 failed attempts = 15min lock)
- Login history tracking
- Token refresh and rotation
- Session management (revoke all tokens)

### Phone Verification
- OTP-based phone verification
- Rate limiting on OTP requests
- 10-minute OTP expiry

### Two-Factor Authentication (2FA)
- TOTP-based 2FA
- Backup codes (10 codes)
- Enable/disable 2FA with password confirmation

### OAuth / Social Login
- Google, Facebook, Apple, Twitter support
- Link/unlink OAuth providers to existing account
- Auto-create account on first OAuth login

### Device Sessions
- Register and track devices
- Trust/revoke devices
- Push notification token storage
- Device type tracking (Mobile, Desktop, Web, etc.)

### Security Events
- Audit log of security-related events
- Event types: password change, 2FA changes, suspicious login, etc.
- Severity levels: INFO, WARNING, CRITICAL

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | Core auth data, email/phone verification, 2FA |
| `refresh_tokens` | JWT refresh tokens |
| `login_history` | Login audit trail |
| `oauth_providers` | Linked social accounts |
| `device_sessions` | Registered devices |
| `security_events` | Security audit log |

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Setup database
npx prisma db push

# Start service
npm start
```

## Environment Variables

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tne_authdb

# JWT (use strong 128-char secrets)
JWT_SECRET=<generate-with-crypto.randomBytes(64).toString('hex')>
JWT_REFRESH_SECRET=<different-secret>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION_DAYS=7

# User Service Integration
USER_SERVICE_URL=http://localhost:3002

# Email (optional for development)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## API Endpoints

### Core Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/verify-email` | Verify email |
| POST | `/api/v1/auth/resend-verification` | Resend verification |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| POST | `/api/v1/auth/change-password` | Change password (protected) |

### Phone Verification (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/phone/send-otp` | Send OTP to phone |
| POST | `/api/v1/auth/phone/verify-otp` | Verify phone OTP |

### Two-Factor Authentication (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/2fa/status` | Get 2FA status |
| POST | `/api/v1/auth/2fa/enable` | Enable 2FA |
| POST | `/api/v1/auth/2fa/confirm` | Confirm 2FA setup |
| POST | `/api/v1/auth/2fa/disable` | Disable 2FA |
| POST | `/api/v1/auth/2fa/verify` | Verify 2FA code |
| POST | `/api/v1/auth/2fa/verify-backup` | Verify backup code |

### OAuth (Protected except login)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/oauth/login` | OAuth login/register |
| GET | `/api/v1/auth/oauth/providers` | Get linked providers |
| POST | `/api/v1/auth/oauth/link` | Link OAuth provider |
| DELETE | `/api/v1/auth/oauth/unlink/:provider` | Unlink provider |

### Device Sessions (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/devices` | Get all devices |
| POST | `/api/v1/auth/devices` | Register device |
| POST | `/api/v1/auth/devices/:id/trust` | Trust device |
| DELETE | `/api/v1/auth/devices/:id` | Revoke device |
| DELETE | `/api/v1/auth/devices` | Revoke all devices |

### Security & Audit (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/login-history` | Login history |
| GET | `/api/v1/auth/security-events` | Security events |
| POST | `/api/v1/auth/revoke-all-tokens` | Logout all devices |

## Integration with User Service

When a user registers:
1. User created in auth database
2. Auth service calls User Service (`POST /api/v1/users/profile`)
3. User profile created in user database
4. Both linked via `authId`

## Security Features

- Bcrypt password hashing (12 rounds)
- SHA-256 for reset tokens (O(1) lookup)
- JWT with issuer/audience claims
- Account lockout protection
- Rate limiting (10 req/min on auth endpoints)
- Strong password validation (8+ chars, uppercase, lowercase, number, special)
- Environment validation on startup
- TOTP-based 2FA with backup codes
- Device session management
- Security event audit logging

## Testing

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"9876543210","password":"Test@1234"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@1234"}'

# Send Phone OTP (with token)
curl -X POST http://localhost:3001/api/v1/auth/phone/send-otp \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# Enable 2FA (with token)
curl -X POST http://localhost:3001/api/v1/auth/2fa/enable \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"password":"Test@1234"}'
```

---

*Last Updated: December 22, 2025*
