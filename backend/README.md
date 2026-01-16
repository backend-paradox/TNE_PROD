# TNE Backend - Microservices Architecture

Complete backend system for Trip & Event (TNE) platform with microservices architecture, PostgreSQL databases, and JWT authentication.

## Architecture Overview

This backend consists of **9 active microservices**:

| Service | Port | Database | Description | Status |
|---------|------|----------|-------------|--------|
| **API Gateway** | 5000 | - | Single entry point, routing, circuit breaker | Active |
| **Auth Service** | 3001 | tne_authdb | Authentication, 2FA, OAuth, Device Sessions | Production-Ready |
| **User Service** | 3002 | tne_userdb | User profiles, preferences, wishlist, reviews | Production-Ready |
| **Booking Service** | 3004 | tne_bookingdb | Hotel, flight, package bookings & vouchers | Production-Ready |
| **Payment Service** | 3005 | tne_paymentdb | Razorpay integration | Active |
| **Notification Service** | 3007 | tne_notificationdb | Email/SMS/Push notifications | Active |
| **Group Service** | 3008 | tne_groupdb | Group trips, expenses, polls, itineraries | Production-Ready |
| **Chat Service** | 3009 | tne_chatdb | Real-time messaging, Socket.IO | Active |
| **CRMSync Service** | 3011 | tne_crmsyncdb | CRM synchronization (Admin) | Active |

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
# Shared utilities (required first)
cd shared && npm install && cd ..

# Install for each service
cd auth-service && npm install && cd ..
cd user-service && npm install && cd ..
cd api-gateway && npm install && cd ..
# ... repeat for other services
```

### 2. Setup Databases

```bash
# Create databases
psql -U postgres -c "CREATE DATABASE tne_authdb;"
psql -U postgres -c "CREATE DATABASE tne_userdb;"
psql -U postgres -c "CREATE DATABASE tne_bookingdb;"
psql -U postgres -c "CREATE DATABASE tne_paymentdb;"
psql -U postgres -c "CREATE DATABASE tne_notificationdb;"
psql -U postgres -c "CREATE DATABASE tne_groupdb;"
psql -U postgres -c "CREATE DATABASE tne_chatdb;"
psql -U postgres -c "CREATE DATABASE tne_crmsyncdb;"
```

### 3. Configure Environment

Each service has its own `.env` file. Copy from `.env.example`:

```bash
cp auth-service/.env.example auth-service/.env
cp user-service/.env.example user-service/.env
cp api-gateway/.env.example api-gateway/.env
```

**Important:** All services must use the same JWT_SECRET for token validation.

### 4. Run Migrations

```bash
cd auth-service && npx prisma db push && cd ..
cd user-service && npx prisma db push && cd ..
```

### 5. Start Services

```bash
# Terminal 1 - Auth Service
cd auth-service && npm start

# Terminal 2 - User Service
cd user-service && npm start

# Terminal 3 - API Gateway
cd api-gateway && npm start
```

## API Routes

### Via API Gateway (Port 5000)

| Route | Service | Description |
|-------|---------|-------------|
| `/api/v1/auth/*` | Auth Service | Authentication, 2FA, OAuth, devices |
| `/api/v1/users/*` | User Service | Profiles, wishlist, reviews, preferences |
| `/api/v1/bookings/*` | Booking Service | Hotel, flight, package bookings, vouchers |
| `/api/v1/payments/*` | Payment Service | Payment orders, Razorpay integration |
| `/api/v1/notifications/*` | Notification Service | Notification management |
| `/api/v1/groups/*` | Group Service | Group trips, expenses, polls, itineraries |
| `/api/v1/chat/*` | Chat Service | Conversations, messages, real-time chat |
| `/api/v1/crmsync/*` | CRMSync Service | Admin CRM sync endpoints |

### Direct Service Access

- Auth Service: `http://localhost:3001/api/v1/auth/*`
- User Service: `http://localhost:3002/api/v1/users/*`

## Database Schema

### Auth Service (tne_authdb)

| Table | Description |
|-------|-------------|
| `users` | Core auth data, email/phone verification, 2FA |
| `refresh_tokens` | JWT refresh tokens |
| `login_history` | Login audit trail |
| `oauth_providers` | Linked social accounts (Google, Facebook, etc.) |
| `device_sessions` | Registered devices |
| `security_events` | Security audit log |

### User Service (tne_userdb)

| Table | Description |
|-------|-------------|
| `user_profiles` | Extended user profile data |
| `addresses` | User addresses (home, work, other) |
| `kyc_documents` | KYC verification documents |
| `travel_preferences` | Travel style, budget, activities |
| `travel_documents` | Passports, visas, IDs |
| `emergency_contacts` | Emergency contact information |
| `user_badges` | Achievement badges |
| `user_blocks` | Blocked users list |
| `wishlist_items` | User's wishlist (packages, hotels, etc.) |
| `reviews` | User reviews for packages, hotels, etc. |
| `review_helpful` | Helpful votes on reviews |

### Booking Service (tne_bookingdb)

| Table | Description |
|-------|-------------|
| `bookings` | Main booking records |
| `hotel_bookings` | Hotel-specific booking details |
| `flight_bookings` | Flight-specific booking details |
| `booking_reviews` | Post-booking reviews |
| `quotes` | Quote requests |

### Group Service (tne_groupdb)

| Table | Description |
|-------|-------------|
| `groups` | Travel groups |
| `group_members` | Group membership |
| `invitations` | Group invitations |
| `join_requests` | Group join requests |
| `itinerary_items` | Trip itineraries |
| `expenses` | Shared expenses |
| `expense_splits` | Expense splits per member |
| `polls` | Group polls |
| `poll_votes` | Poll votes |

## Service Integration

### Auth → User Integration

When a user registers via Auth Service:
1. User created in `tne_authdb.users`
2. Auth Service calls User Service (`POST /api/v1/users/profile`)
3. User profile created in `tne_userdb.user_profiles`
4. Both linked via `authId`

## Environment Variables

### Shared Across Services

```env
JWT_SECRET=<128-char-secret>  # MUST be same across all services
JWT_REFRESH_SECRET=<128-char-secret>
NODE_ENV=development
```

### Service-Specific

See each service's `.env.example` for complete configuration.

## Security Features

- JWT authentication (access + refresh tokens)
- Two-Factor Authentication (TOTP)
- OAuth integration (Google, Facebook, Apple, Twitter)
- Phone verification via OTP
- Device session management
- Security event logging
- Password hashing (bcrypt, 12 rounds)
- Account lockout (5 failed attempts = 15min lock)
- Strong password validation
- Environment validation on startup
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation (Zod)

## Project Structure

```
backend/
├── api-gateway/          # Port 5000 - Request routing, circuit breaker
├── auth-service/         # Port 3001 - Authentication, 2FA, OAuth
│   ├── prisma/           # Database schema
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── services/     # Business logic
│       ├── routes/       # API routes
│       └── validators/   # Input validation
├── user-service/         # Port 3002 - Profiles, wishlist, reviews
│   ├── prisma/           # Database schema
│   ├── API.md            # Service API documentation
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── services/     # Business logic
│       ├── routes/       # API routes
│       └── validators/   # Input validation
├── booking-service/      # Port 3004 - Bookings, vouchers
│   ├── prisma/           # Database schema
│   ├── API.md            # Service API documentation
│   └── src/
├── payment-service/      # Port 3005 - Razorpay payments
├── notification-service/ # Port 3007 - Notifications
├── group-service/        # Port 3008 - Group trips, expenses, polls
│   └── prisma/           # Database schema
├── chat-service/         # Port 3009 - Real-time messaging
│   └── prisma/           # Database schema
├── crmsync-service/      # Port 3011 - CRM sync (Admin)
├── shared/               # Shared utilities
│   └── src/
│       ├── middleware/   # Auth, validation, error handling
│       └── utils/        # Common utilities
└── API_ENDPOINTS.md      # Complete API documentation
```

## Documentation

- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Complete API documentation
- [auth-service/README.md](./auth-service/README.md) - Auth service docs
- [user-service/README.md](./user-service/README.md) - User service docs
- [api-gateway/README.md](./api-gateway/README.md) - Gateway docs

## Testing

```bash
# Health checks
curl http://localhost:3001/api/v1/health  # Auth
curl http://localhost:3002/health         # User
curl http://localhost:5000/health         # Gateway

# Test registration
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"9876543210","password":"Test@1234"}'
```

## Support

For issues, contact: admin@tripandevent.com

---

## API Endpoint Summary

### Total Endpoints: 200+

| Service | Endpoints | Key Features |
|---------|-----------|--------------|
| Auth | 28 | Register, Login, 2FA, OAuth, Devices, Sessions |
| User | 75 | Profile, Addresses, KYC, Travel Docs, Wishlist, Reviews |
| Group | 40 | Groups, Members, Invitations, Expenses, Polls, Itinerary |
| Booking | 12 | Hotel, Flight, Package bookings, Vouchers |
| Payment | 10 | Orders, Verification, Refunds |
| Chat | 18 | Conversations, Messages, Real-time |
| Notification | 10 | Push, Email, SMS preferences |
| CRMSync | 12 | Admin dashboard, Analytics |

---

*Last Updated: December 22, 2025*
