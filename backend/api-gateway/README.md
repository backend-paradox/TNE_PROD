# TNE API Gateway

Central entry point for TNE microservices with routing, circuit breaker, retry logic, and JWT validation.

## Overview

- **Port:** 5000
- **Status:** Production Ready

## Active Service Routes

| Route | Service | Port | Endpoints | Status |
|-------|---------|------|-----------|--------|
| `/api/v1/auth/*` | Auth Service | 3001 | 32 | Active |
| `/api/v1/users/*` | User Service | 3002 | 37 | Active |
| `/api/v1/bookings/*` | Booking Service | 3004 | - | In Development |
| `/api/v1/payments/*` | Payment Service | 3005 | - | In Development |
| `/api/v1/notifications/*` | Notification Service | 3007 | - | In Development |
| `/api/v1/crmsync/*` | CRMSync Service | 3011 | - | In Development |

### Auth Service Features (via Gateway)
- Core authentication (register, login, logout, refresh)
- Email verification, password reset/change
- Phone verification with OTP
- Two-Factor Authentication (2FA)
- OAuth / Social Login (Google, Facebook, Apple, Twitter)
- Device session management
- Security event logging

### User Service Features (via Gateway)
- Profile management with extended fields
- Address management
- KYC document verification
- Travel preferences
- Travel documents with expiry tracking
- Emergency contacts
- Badges & achievements
- Block management

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start gateway
npm start
```

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Frontend (CORS)
FRONTEND_URL=http://localhost:5173

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
BOOKING_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3007
CRMSYNC_SERVICE_URL=http://localhost:3011

# Gateway Config
UPSTREAM_TIMEOUT_MS=15000
UPSTREAM_RETRY=2
CIRCUIT_ERROR_THRESHOLD=50
CIRCUIT_RESET_TIMEOUT_MS=30000

# JWT (must match all services)
JWT_SECRET=<your-128-char-secret>
```

## Features

### Circuit Breaker (Opossum)
- Opens at 50% error threshold
- Resets after 30 seconds
- Prevents cascade failures

### Retry Logic
- 2 retries on failure
- Exponential backoff (100ms, 200ms, 300ms)

### JWT Validation
- Optional auth on all routes
- Required auth on protected routes
- Admin role validation

### Rate Limiting
- Per-IP rate limiting
- Configurable window and max requests

## Health Check

```bash
curl http://localhost:5000/health
```

## Example Requests

```bash
# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"9876543210","password":"Test@1234"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@1234"}'

# Get profile (with token)
curl http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer {token}"
```

## Error Responses

| Code | Description |
|------|-------------|
| 502 | Upstream unreachable |
| 503 | Circuit breaker open |
| 504 | Upstream timeout |
| 429 | Rate limit exceeded |

## Architecture

```
Frontend (5173) → API Gateway (5000)
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
   Auth (3001)    User (3002)    Other Services
```

## Logging

- Winston logger with daily rotation
- Log files in `logs/` directory
- Levels: error, warn, info, debug

## Monitoring

```bash
# Health check
curl http://localhost:5000/health

# Readiness check
curl http://localhost:5000/ready

# Prometheus metrics
curl http://localhost:5000/metrics
```

---

*Last Updated: December 20, 2025*
