# CRM Sync Service - API Endpoints Reference

Base URL: `http://localhost:3011`

**All endpoints require Admin role.** `Authorization: Bearer <admin-token>` header required.

---

## Health Check

### GET /api/v1/health
**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "crmsync-service"
}
```

---

## Dashboard

### GET /api/v1/crmsync/dashboard
Get real-time dashboard statistics.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved",
  "data": {
    "users": {
      "total": 15420,
      "new": 234,
      "active": 8750
    },
    "bookings": {
      "total": 45230,
      "pending": 156,
      "confirmed": 42890,
      "cancelled": 2184
    },
    "revenue": {
      "total": 15678900.50,
      "today": 125430.00,
      "thisMonth": 2345670.00,
      "refunded": 45670.00
    },
    "vendors": {
      "total": 342,
      "active": 298,
      "pending": 12
    },
    "reviews": {
      "total": 23450,
      "averageRating": 4.3
    },
    "recentActivity": [
      {
        "action": "CREATE",
        "resource": "BOOKING",
        "timestamp": "2025-01-16T10:30:00Z"
      }
    ]
  }
}
```

---

## Analytics

### GET /api/v1/crmsync/analytics
Get analytics data for date range.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | Yes | Start date (YYYY-MM-DD) |
| `endDate` | string | Yes | End date (YYYY-MM-DD) |
| `groupBy` | string | No | Grouping: `day`, `week`, `month` (default: `day`) |

**Example Request:**
```
GET /api/v1/crmsync/analytics?startDate=2025-01-01&endDate=2025-01-31&groupBy=day
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Analytics data retrieved",
  "data": {
    "period": {
      "start": "2025-01-01",
      "end": "2025-01-31",
      "groupBy": "day"
    },
    "snapshots": [
      {
        "date": "2025-01-01",
        "totalUsers": 15000,
        "newUsers": 45,
        "activeUsers": 8500,
        "totalBookings": 44500,
        "newBookings": 120,
        "cancelledBookings": 8,
        "confirmedBookings": 112,
        "totalRevenue": 15200000.00,
        "bookingRevenue": 156000.00,
        "refundAmount": 2500.00,
        "totalVendors": 340,
        "activeVendors": 295,
        "pendingVendors": 10,
        "totalReviews": 23200,
        "newReviews": 35,
        "averageRating": 4.28
      },
      {
        "date": "2025-01-02",
        "totalUsers": 15045,
        "newUsers": 52,
        "activeUsers": 8600
      }
    ],
    "summary": {
      "totalNewUsers": 420,
      "totalNewBookings": 730,
      "totalRevenue": 2345670.00,
      "averageRating": 4.3
    }
  }
}
```

---

### POST /api/v1/crmsync/analytics/snapshot
Generate analytics snapshot for a specific date.

**Request Body:**
```json
{
  "date": "2025-01-16"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Analytics snapshot generated",
  "data": {
    "id": 156,
    "date": "2025-01-16",
    "totalUsers": 15420,
    "newUsers": 52,
    "activeUsers": 8750,
    "totalBookings": 45230,
    "newBookings": 145,
    "cancelledBookings": 12,
    "confirmedBookings": 133,
    "totalRevenue": 15678900.50,
    "bookingRevenue": 175430.00,
    "refundAmount": 3200.00,
    "totalVendors": 342,
    "activeVendors": 298,
    "pendingVendors": 12,
    "totalReviews": 23450,
    "newReviews": 42,
    "averageRating": 4.3,
    "createdAt": "2025-01-16T23:59:59Z"
  }
}
```

---

## Activity Logs

### GET /api/v1/crmsync/logs
Get admin activity logs.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 50 | Items per page |
| `adminId` | number | - | Filter by admin ID |
| `action` | string | - | Filter by action type |
| `resource` | string | - | Filter by resource type |
| `startDate` | string | - | Filter from date |
| `endDate` | string | - | Filter to date |

**Example Request:**
```
GET /api/v1/crmsync/logs?resource=USER&action=UPDATE&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Activity logs retrieved",
  "data": {
    "logs": [
      {
        "id": 12345,
        "adminId": 1,
        "action": "UPDATE",
        "resource": "USER",
        "resourceId": 567,
        "details": {
          "field": "role",
          "oldValue": "USER",
          "newValue": "VENDOR"
        },
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "createdAt": "2025-01-16T10:30:00Z"
      },
      {
        "id": 12344,
        "adminId": 1,
        "action": "APPROVE",
        "resource": "VENDOR",
        "resourceId": 89,
        "details": {
          "vendorName": "Travel Adventures Ltd"
        },
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2025-01-16T10:25:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1250,
      "totalPages": 63
    }
  }
}
```

---

## System Settings

### GET /api/v1/crmsync/settings
Get all system settings.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "System settings retrieved",
  "data": {
    "settings": [
      {
        "id": 1,
        "key": "maintenance_mode",
        "value": false,
        "description": "Enable/disable maintenance mode",
        "updatedBy": 1,
        "updatedAt": "2025-01-15T08:00:00Z"
      },
      {
        "id": 2,
        "key": "max_booking_per_user",
        "value": 10,
        "description": "Maximum bookings per user per day",
        "updatedBy": 1,
        "updatedAt": "2025-01-10T12:00:00Z"
      },
      {
        "id": 3,
        "key": "commission_rates",
        "value": {
          "hotel": 12,
          "flight": 8,
          "event": 15
        },
        "description": "Commission rates by booking type (%)",
        "updatedBy": 1,
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### GET /api/v1/crmsync/settings/:key
Get single setting by key.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Setting retrieved",
  "data": {
    "id": 3,
    "key": "commission_rates",
    "value": {
      "hotel": 12,
      "flight": 8,
      "event": 15
    },
    "description": "Commission rates by booking type (%)",
    "updatedBy": 1,
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### PUT /api/v1/crmsync/settings/:key
Create or update system setting.

**Request Body:**
```json
{
  "value": {
    "hotel": 15,
    "flight": 10,
    "event": 18
  },
  "description": "Updated commission rates by booking type (%)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "data": {
    "id": 3,
    "key": "commission_rates",
    "value": {
      "hotel": 15,
      "flight": 10,
      "event": 18
    },
    "description": "Updated commission rates by booking type (%)",
    "updatedBy": 1,
    "updatedAt": "2025-01-16T11:00:00Z"
  }
}
```

---

### DELETE /api/v1/crmsync/settings/:key
Delete system setting.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Setting deleted successfully"
}
```

---

## Platform Notifications

### GET /api/v1/crmsync/notifications
Get platform notifications.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `isRead` | boolean | - | Filter by read status |
| `severity` | string | - | Filter by severity |
| `type` | string | - | Filter by type |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": {
    "notifications": [
      {
        "id": 45,
        "type": "ALERT",
        "title": "High Server Load",
        "message": "Server CPU usage exceeded 90% for the past hour. Consider scaling resources.",
        "severity": "HIGH",
        "isRead": false,
        "readBy": null,
        "readAt": null,
        "createdAt": "2025-01-16T10:45:00Z"
      },
      {
        "id": 44,
        "type": "INFO",
        "title": "Daily Backup Complete",
        "message": "Database backup completed successfully at 03:00 AM.",
        "severity": "LOW",
        "isRead": true,
        "readBy": 1,
        "readAt": "2025-01-16T09:00:00Z",
        "createdAt": "2025-01-16T03:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "unreadCount": 5
  }
}
```

---

### POST /api/v1/crmsync/notifications
Create platform notification.

**Request Body:**
```json
{
  "type": "WARNING",
  "title": "Scheduled Maintenance",
  "message": "System maintenance scheduled for Sunday 2AM-4AM IST. Some services may be unavailable.",
  "severity": "MEDIUM"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Notification created",
  "data": {
    "id": 46,
    "type": "WARNING",
    "title": "Scheduled Maintenance",
    "message": "System maintenance scheduled for Sunday 2AM-4AM IST. Some services may be unavailable.",
    "severity": "MEDIUM",
    "isRead": false,
    "createdAt": "2025-01-16T11:00:00Z"
  }
}
```

---

### PUT /api/v1/crmsync/notifications/:id/read
Mark notification as read.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": 45,
    "isRead": true,
    "readBy": 1,
    "readAt": "2025-01-16T11:05:00Z"
  }
}
```

---

## System Health

### GET /api/v1/crmsync/health/system
Check health of all platform services.

**Response (200 OK - All Healthy):**
```json
{
  "success": true,
  "message": "System health check completed",
  "data": {
    "overall": "HEALTHY",
    "services": [
      {
        "name": "api-gateway",
        "status": "UP",
        "responseTime": 45,
        "lastCheck": "2025-01-16T11:00:00Z"
      },
      {
        "name": "auth-service",
        "status": "UP",
        "responseTime": 32,
        "lastCheck": "2025-01-16T11:00:00Z"
      },
      {
        "name": "user-service",
        "status": "UP",
        "responseTime": 28,
        "lastCheck": "2025-01-16T11:00:00Z"
      },
      {
        "name": "booking-service",
        "status": "UP",
        "responseTime": 56,
        "lastCheck": "2025-01-16T11:00:00Z"
      },
      {
        "name": "payment-service",
        "status": "UP",
        "responseTime": 41,
        "lastCheck": "2025-01-16T11:00:00Z"
      },
      {
        "name": "chat-service",
        "status": "UP",
        "responseTime": 38,
        "lastCheck": "2025-01-16T11:00:00Z"
      }
    ]
  }
}
```

**Response (503 - Degraded):**
```json
{
  "success": true,
  "message": "System health check completed",
  "data": {
    "overall": "DEGRADED",
    "services": [
      {
        "name": "payment-service",
        "status": "DOWN",
        "error": "Connection refused",
        "lastCheck": "2025-01-16T11:00:00Z"
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "startDate and endDate are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Setting not found"
}
```

---

## Enums Reference

### Action Types
- `CREATE` - Resource created
- `UPDATE` - Resource updated
- `DELETE` - Resource deleted
- `APPROVE` - Resource approved
- `REJECT` - Resource rejected
- `SUSPEND` - Resource suspended
- `ACTIVATE` - Resource activated

### Resource Types
- `USER` - User accounts
- `VENDOR` - Vendor profiles
- `BOOKING` - Bookings
- `PAYMENT` - Payments
- `REVIEW` - Reviews
- `SETTING` - System settings
- `NOTIFICATION` - Notifications

### Notification Types
- `ALERT` - Critical alerts
- `WARNING` - Warnings
- `INFO` - Informational
- `SUCCESS` - Success notifications

### Severity Levels
- `HIGH` - Critical, immediate attention
- `MEDIUM` - Important but not urgent
- `LOW` - Informational

### Service Status
- `UP` - Service is healthy
- `DOWN` - Service is unavailable
- `DEGRADED` - Service has issues

---

*Last Updated: December 22, 2025*
