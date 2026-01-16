# CRM Sync Service

Admin dashboard and analytics microservice for TNE platform with system settings, activity logs, analytics snapshots, and platform notifications.

## Overview

- **Port:** 3011
- **Status:** Production-Ready
- **Database:** PostgreSQL (tne_crmsyncdb)

## Features

### Dashboard & Analytics
- Real-time dashboard statistics
- Daily analytics snapshots
- User metrics (total, new, active)
- Booking metrics (total, confirmed, cancelled)
- Revenue metrics (total, booking, refunds)
- Vendor metrics (total, active, pending)
- Review metrics (total, new, average rating)
- Custom date range analytics
- Grouping by day/week/month

### Activity Logs
- Admin action audit trail
- Resource tracking (USER, VENDOR, BOOKING, etc.)
- IP address and user agent logging
- Filterable logs by admin, resource, action
- Time-based filtering

### System Settings
- Key-value configuration store
- JSON value support
- Update tracking with admin ID
- Description for each setting

### Platform Notifications
- System alerts and warnings
- Severity levels (HIGH, MEDIUM, LOW)
- Read status tracking
- Admin notification dashboard

### System Health
- Service health monitoring
- Multi-service status check
- Degraded state detection

## Database Schema

| Table | Description |
|-------|-------------|
| `admin_actions` | Admin activity audit logs |
| `system_settings` | Platform configuration |
| `analytics_snapshots` | Daily metrics aggregates |
| `platform_notifications` | System alerts |

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Setup database
npx prisma db push

# Start service
npm start
```

## Environment Variables

```env
NODE_ENV=development
PORT=3011
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tne_crmsyncdb

# JWT (must match auth-service)
JWT_SECRET=<same-as-auth-service>

# CORS
CORS_ORIGIN=http://localhost:5173

# Connected Services
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
BOOKING_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
```

## API Endpoints

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crmsync/dashboard` | Get dashboard statistics |
| GET | `/crmsync/analytics` | Get analytics data |
| POST | `/crmsync/analytics/snapshot` | Generate analytics snapshot |

### Activity Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crmsync/logs` | Get activity logs |

### System Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crmsync/settings` | Get all settings |
| GET | `/crmsync/settings/:key` | Get single setting |
| PUT | `/crmsync/settings/:key` | Update setting |
| DELETE | `/crmsync/settings/:key` | Delete setting |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crmsync/notifications` | Get platform notifications |
| POST | `/crmsync/notifications` | Create notification |
| PUT | `/crmsync/notifications/:id/read` | Mark as read |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crmsync/health/system` | System health check |

## Testing

```bash
# Health check
curl http://localhost:3011/api/v1/health

# Get dashboard (Admin only)
curl http://localhost:3011/api/v1/crmsync/dashboard \
  -H "Authorization: Bearer {admin-token}"

# Get analytics
curl "http://localhost:3011/api/v1/crmsync/analytics?startDate=2025-01-01&endDate=2025-01-31&groupBy=day" \
  -H "Authorization: Bearer {admin-token}"

# Create notification
curl -X POST http://localhost:3011/api/v1/crmsync/notifications \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{"type":"ALERT","title":"System Update","message":"Scheduled maintenance","severity":"HIGH"}'
```

## Security Features

- Admin-only access (ADMIN role required)
- JWT authentication
- Action audit logging
- IP address tracking
- Request user agent logging

---

*Last Updated: December 22, 2025*
