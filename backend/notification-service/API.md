# Notification Service - API Endpoints Reference

Base URL: `http://localhost:3007`

All endpoints require `Authorization: Bearer <token>` header unless noted.

---

## Health Check

### GET /api/v1/health
**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "notification-service"
}
```

---

## Notifications

### GET /api/v1/notifications
Get user's notifications (paginated).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `channel` | string | IN_APP | Filter by channel |
| `type` | string | - | Filter by notification type |
| `unreadOnly` | boolean | false | Show only unread |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "BOOKING_CONFIRMED",
        "channel": "IN_APP",
        "title": "Booking Confirmed",
        "body": "Your hotel booking has been confirmed",
        "data": {
          "bookingId": 123,
          "hotelName": "Grand Hotel"
        },
        "actionUrl": "/bookings/123",
        "imageUrl": "https://...",
        "isRead": false,
        "readAt": null,
        "createdAt": "2025-12-22T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### GET /api/v1/notifications/unread-count
Get unread notification count.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `channel` | string | IN_APP | Channel to count |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### POST /api/v1/notifications/:id/read
Mark single notification as read.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### POST /api/v1/notifications/read-all
Mark all notifications as read.

**Request Body (Optional):**
```json
{
  "channel": "IN_APP"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "5 notifications marked as read",
  "data": {
    "count": 5
  }
}
```

---

## Notification Preferences

### GET /api/v1/notifications/preferences
Get user's notification preferences.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": 1,
    "emailEnabled": true,
    "smsEnabled": false,
    "pushEnabled": true,
    "inAppEnabled": true,
    "typePreferences": {
      "BOOKING_CONFIRMED": ["EMAIL", "PUSH", "IN_APP"],
      "PAYMENT_SUCCESS": ["EMAIL", "IN_APP"],
      "GROUP_INVITE": ["PUSH", "IN_APP"],
      "CHAT_MESSAGE": ["PUSH"]
    },
    "quietHoursEnabled": false,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "07:00",
    "timezone": "Asia/Kolkata",
    "digestEnabled": false,
    "digestFrequency": "DAILY",
    "updatedAt": "2025-12-22T10:00:00.000Z"
  }
}
```

---

### PUT /api/v1/notifications/preferences
Update notification preferences.

**Request Body:**
```json
{
  "emailEnabled": true,
  "smsEnabled": true,
  "pushEnabled": true,
  "inAppEnabled": true,
  "typePreferences": {
    "BOOKING_CONFIRMED": ["EMAIL", "PUSH", "IN_APP"],
    "PAYMENT_SUCCESS": ["EMAIL", "IN_APP"],
    "CHAT_MESSAGE": ["PUSH", "IN_APP"]
  },
  "quietHoursEnabled": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "07:00",
  "timezone": "Asia/Kolkata",
  "digestEnabled": true,
  "digestFrequency": "DAILY"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Preferences updated",
  "data": {
    "emailEnabled": true,
    "smsEnabled": true,
    "pushEnabled": true,
    "inAppEnabled": true,
    "quietHoursEnabled": true,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "07:00",
    "timezone": "Asia/Kolkata",
    "digestEnabled": true,
    "digestFrequency": "DAILY"
  }
}
```

---

## Push Tokens

### POST /api/v1/notifications/push-token
Register push notification token.

**Request Body:**
```json
{
  "token": "fcm-token-here",
  "platform": "ANDROID",
  "deviceId": "device-uuid",
  "deviceName": "Samsung Galaxy S21"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Push token registered",
  "data": {
    "id": "uuid",
    "userId": 1,
    "token": "fcm-token-here",
    "platform": "ANDROID",
    "deviceId": "device-uuid",
    "deviceName": "Samsung Galaxy S21",
    "isActive": true,
    "createdAt": "2025-12-22T10:00:00.000Z"
  }
}
```

---

### DELETE /api/v1/notifications/push-token
Remove push notification token.

**Request Body:**
```json
{
  "token": "fcm-token-here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Push token removed"
}
```

---

## Internal/Service Endpoints

### POST /api/v1/notifications/send
Send notification (service-to-service). **Requires Service Auth or Admin**

**Request Body:**
```json
{
  "userId": 1,
  "type": "BOOKING_CONFIRMED",
  "channels": ["EMAIL", "PUSH", "IN_APP"],
  "priority": "HIGH",
  "title": "Booking Confirmed",
  "body": "Your booking at Grand Hotel has been confirmed",
  "data": {
    "bookingId": 123,
    "hotelName": "Grand Hotel"
  },
  "actionUrl": "/bookings/123",
  "imageUrl": "https://example.com/hotel.jpg",
  "externalId": "booking-123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification sent",
  "data": {
    "EMAIL": { "success": true, "messageId": "msg-123" },
    "PUSH": { "success": true, "messageId": "push-456" },
    "IN_APP": { "success": true, "notificationId": "uuid" }
  }
}
```

---

### POST /api/v1/notifications/send-bulk
Send bulk notifications. **Requires Admin**

**Request Body:**
```json
{
  "userIds": [1, 2, 3, 4, 5],
  "type": "ANNOUNCEMENT",
  "channels": ["PUSH", "IN_APP"],
  "priority": "NORMAL",
  "title": "New Feature Available",
  "body": "Check out our new group travel planning feature!",
  "data": {},
  "actionUrl": "/features/groups"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bulk notifications sent",
  "data": {
    "totalSent": 5,
    "results": [
      { "userId": 1, "result": { "success": true } },
      { "userId": 2, "result": { "success": true } }
    ]
  }
}
```

---

## WebSocket Events

The notification service also supports real-time notifications via WebSocket.

**Connection:**
```
ws://localhost:3007?token=<access-token>
```

**Events (Server to Client):**
```json
{
  "event": "notification",
  "data": {
    "id": "uuid",
    "type": "BOOKING_CONFIRMED",
    "title": "Booking Confirmed",
    "body": "Your booking has been confirmed",
    "data": {},
    "createdAt": "2025-12-22T10:00:00.000Z"
  }
}
```

**Events (Client to Server):**
```json
{
  "event": "mark_read",
  "data": {
    "notificationId": "uuid"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Token and platform are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token is missing or invalid"
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
  "message": "Notification not found or already read"
}
```

---

## Enums Reference

### NotificationType
- `BOOKING_CONFIRMED` - Booking confirmation
- `BOOKING_CANCELLED` - Booking cancellation
- `BOOKING_REMINDER` - Upcoming booking reminder
- `PAYMENT_SUCCESS` - Payment successful
- `PAYMENT_FAILED` - Payment failed
- `PAYMENT_REFUNDED` - Refund processed
- `GROUP_INVITE` - Group invitation
- `GROUP_UPDATE` - Group details updated
- `GROUP_MESSAGE` - New group message
- `CHAT_MESSAGE` - New direct message
- `REVIEW_REQUEST` - Review request
- `REVIEW_RESPONSE` - Response to your review
- `ACCOUNT_SECURITY` - Security alert
- `ANNOUNCEMENT` - Platform announcement
- `PROMOTION` - Promotional notification

### NotificationChannel
- `EMAIL` - Email notification
- `SMS` - SMS notification
- `PUSH` - Push notification (FCM/APNs)
- `IN_APP` - In-app notification

### NotificationPriority
- `LOW` - Low priority
- `NORMAL` - Normal priority
- `HIGH` - High priority (bypasses quiet hours)
- `URGENT` - Urgent (always delivered immediately)

### Platform
- `WEB` - Web browser
- `IOS` - iOS app
- `ANDROID` - Android app

### DigestFrequency
- `HOURLY` - Every hour
- `DAILY` - Once a day
- `WEEKLY` - Once a week

---

## Kafka Events (Internal)

The notification service consumes events from Kafka for automated notifications:

| Topic | Event | Notification |
|-------|-------|--------------|
| `booking-events` | `booking.created` | Booking confirmation |
| `booking-events` | `booking.cancelled` | Cancellation notice |
| `payment-events` | `payment.success` | Payment confirmation |
| `payment-events` | `payment.failed` | Payment failure alert |
| `payment-events` | `payment.refunded` | Refund confirmation |
| `group-events` | `member.invited` | Group invitation |
| `group-events` | `group.updated` | Group update notice |
| `chat-events` | `message.new` | New message alert |

---

*Last Updated: December 22, 2025*
