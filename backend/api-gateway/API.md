# API Gateway - Endpoints Reference

Base URL: `http://localhost:5000`

## Health & Monitoring

### Health Check
```
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "api-gateway"
}
```

### Readiness Check
```
GET /ready
```

**Response (200 OK):**
```json
{
  "status": "ready"
}
```

### Prometheus Metrics
```
GET /metrics
```

**Response (200 OK):**
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/health",status="200"} 15
...
```

---

## Proxied Routes

All routes below are proxied to their respective microservices.

### Authentication Routes → Auth Service (3001)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/logout` | Logout user | Yes |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/verify-email` | Verify email | No |
| POST | `/api/v1/auth/resend-verification` | Resend verification email | No |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| POST | `/api/v1/auth/reset-password` | Reset password | No |
| POST | `/api/v1/auth/change-password` | Change password | Yes |
| POST | `/api/v1/auth/phone/send-otp` | Send phone OTP | Yes |
| POST | `/api/v1/auth/phone/verify-otp` | Verify phone OTP | Yes |
| GET | `/api/v1/auth/2fa/status` | Get 2FA status | Yes |
| POST | `/api/v1/auth/2fa/enable` | Enable 2FA | Yes |
| POST | `/api/v1/auth/2fa/disable` | Disable 2FA | Yes |
| POST | `/api/v1/auth/2fa/verify` | Verify 2FA code | Yes |

### User Routes → User Service (3002)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users/profile` | Get own profile | Yes |
| PUT | `/api/v1/users/profile` | Update own profile | Yes |
| PUT | `/api/v1/users/profile/avatar` | Upload avatar | Yes |
| DELETE | `/api/v1/users/profile/avatar` | Delete avatar | Yes |
| DELETE | `/api/v1/users/profile` | Delete account | Yes |
| GET | `/api/v1/users/search` | Search users | Yes |
| PUT | `/api/v1/users/location` | Update location | Yes |
| GET | `/api/v1/users/nearby` | Get nearby travellers | Yes |
| GET | `/api/v1/users/addresses` | Get addresses | Yes |
| POST | `/api/v1/users/addresses` | Add address | Yes |
| PUT | `/api/v1/users/addresses/:id` | Update address | Yes |
| DELETE | `/api/v1/users/addresses/:id` | Delete address | Yes |

### User Wishlist & Reviews Routes → User Service (3002)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users/wishlist` | Get wishlist | Yes |
| POST | `/api/v1/users/wishlist` | Add to wishlist | Yes |
| DELETE | `/api/v1/users/wishlist/:id` | Remove from wishlist | Yes |
| GET | `/api/v1/users/reviews` | Get my reviews | Yes |
| POST | `/api/v1/users/reviews` | Submit review | Yes |
| GET | `/api/v1/users/reviews/:type/:targetId` | Get item reviews | No |

### Booking Routes → Booking Service (3004)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/bookings` | List bookings | Yes |
| POST | `/api/v1/bookings/hotels` | Create hotel booking | Yes |
| POST | `/api/v1/bookings/flights` | Create flight booking | Yes |
| POST | `/api/v1/bookings/packages` | Create package booking | Yes |
| GET | `/api/v1/bookings/:id` | Get booking | Yes |
| GET | `/api/v1/bookings/:id/voucher` | Get booking voucher | Yes |
| POST | `/api/v1/bookings/:id/cancel` | Cancel booking | Yes |

### Payment Routes → Payment Service (3005)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/payments/orders` | Create payment order | Yes |
| POST | `/api/v1/payments/verify` | Verify payment | Yes |
| GET | `/api/v1/payments` | Payment history | Yes |
| POST | `/api/v1/payments/:id/refund` | Request refund | Yes |

### Notification Routes → Notification Service (3007)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/notifications` | Get notifications | Yes |
| GET | `/api/v1/notifications/unread-count` | Get unread count | Yes |
| POST | `/api/v1/notifications/read-all` | Mark all as read | Yes |
| GET | `/api/v1/notifications/preferences` | Get preferences | Yes |
| PUT | `/api/v1/notifications/preferences` | Update preferences | Yes |

### Group Routes → Group Service (3008)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/groups` | List groups | Yes |
| POST | `/api/v1/groups` | Create group | Yes |
| GET | `/api/v1/groups/:id` | Get group details | Yes |
| PUT | `/api/v1/groups/:id` | Update group | Yes |
| DELETE | `/api/v1/groups/:id` | Delete group | Yes |
| POST | `/api/v1/groups/:id/join` | Request to join | Yes |
| POST | `/api/v1/groups/:id/leave` | Leave group | Yes |
| GET | `/api/v1/groups/:id/expenses` | Get expenses | Yes |
| POST | `/api/v1/groups/:id/expenses` | Add expense | Yes |
| GET | `/api/v1/groups/:id/polls` | Get polls | Yes |
| POST | `/api/v1/groups/:id/polls` | Create poll | Yes |
| GET | `/api/v1/groups/:id/itinerary` | Get itinerary | Yes |

### Chat Routes → Chat Service (3009)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/chat/conversations` | List conversations | Yes |
| POST | `/api/v1/chat/conversations` | Create conversation | Yes |
| GET | `/api/v1/chat/conversations/:id/messages` | Get messages | Yes |
| POST | `/api/v1/chat/conversations/:id/messages` | Send message | Yes |
| POST | `/api/v1/chat/conversations/:id/read` | Mark as read | Yes |

### CRMSync Routes → CRMSync Service (3011) - Admin Only

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/crmsync/dashboard` | Get dashboard stats | Admin |
| GET | `/api/v1/crmsync/analytics` | Get analytics | Admin |
| GET | `/api/v1/crmsync/settings` | Get settings | Admin |
| PUT | `/api/v1/crmsync/settings/:key` | Update setting | Admin |
| GET | `/api/v1/crmsync/logs` | Get activity logs | Admin |

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Token is missing or invalid"
}
```

### 429 Rate Limit Exceeded
```json
{
  "error": "Too many requests",
  "message": "Please try again later",
  "retryAfter": 60
}
```

### 502 Bad Gateway
```json
{
  "error": "Service error",
  "message": "An error occurred while processing your request",
  "traceId": "abc123-def456"
}
```

### 503 Service Unavailable
```json
{
  "error": "Service unavailable",
  "message": "Circuit breaker is open",
  "traceId": "abc123-def456"
}
```

### 504 Gateway Timeout
```json
{
  "error": "Gateway timeout",
  "message": "Upstream service did not respond in time",
  "traceId": "abc123-def456"
}
```

---

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | For protected routes | `Bearer <access_token>` |
| `Content-Type` | For POST/PUT | `application/json` |
| `X-Request-ID` | Optional | Custom request ID for tracing |

---

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General | 200 requests | 1 minute |
| Auth endpoints | 10 requests | 1 minute |

---

*Last Updated: December 22, 2025*
