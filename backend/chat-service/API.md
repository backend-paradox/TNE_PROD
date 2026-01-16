# Chat Service - API Endpoints Reference

Base URL: `http://localhost:3009`

All endpoints require `Authorization: Bearer <token>` header.

---

## Health Check

### GET /api/v1/health
**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "chat-service"
}
```

---

## Conversations

### GET /api/v1/chat/conversations
Get user's conversations.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `type` | string | - | Filter by type (DIRECT, GROUP, SUPPORT) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid-here",
        "type": "DIRECT",
        "name": null,
        "imageUrl": null,
        "groupId": null,
        "lastMessageAt": "2025-01-15T10:30:00Z",
        "participants": [
          {
            "userId": 1,
            "role": "MEMBER",
            "nickname": null
          },
          {
            "userId": 2,
            "role": "MEMBER",
            "nickname": null
          }
        ],
        "lastMessage": {
          "id": "msg-uuid",
          "type": "TEXT",
          "content": "Hello!",
          "senderId": 2,
          "createdAt": "2025-01-15T10:30:00Z"
        },
        "unreadCount": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

### POST /api/v1/chat/conversations
Create a new conversation.

**Request Body (Direct Chat):**
```json
{
  "type": "DIRECT",
  "participantIds": [2]
}
```

**Request Body (Group Chat):**
```json
{
  "type": "GROUP",
  "name": "Trip to Goa 2025",
  "description": "Planning our annual trip",
  "imageUrl": "https://example.com/group-image.jpg",
  "groupId": "group-uuid-here",
  "participantIds": [2, 3, 4, 5]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Conversation created successfully",
  "data": {
    "id": "conv-uuid",
    "type": "GROUP",
    "name": "Trip to Goa 2025",
    "description": "Planning our annual trip",
    "imageUrl": "https://example.com/group-image.jpg",
    "groupId": "group-uuid-here",
    "createdBy": 1,
    "createdAt": "2025-01-15T10:00:00Z",
    "participants": [
      {"userId": 1, "role": "ADMIN"},
      {"userId": 2, "role": "MEMBER"},
      {"userId": 3, "role": "MEMBER"}
    ]
  }
}
```

---

### GET /api/v1/chat/conversations/:id
Get conversation details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "conv-uuid",
    "type": "GROUP",
    "name": "Trip to Goa 2025",
    "description": "Planning our annual trip",
    "imageUrl": "https://example.com/group-image.jpg",
    "groupId": "group-uuid-here",
    "createdBy": 1,
    "createdAt": "2025-01-15T10:00:00Z",
    "lastMessageAt": "2025-01-16T08:30:00Z",
    "participants": [
      {
        "userId": 1,
        "role": "ADMIN",
        "nickname": null,
        "joinedAt": "2025-01-15T10:00:00Z",
        "isMuted": false,
        "lastReadAt": "2025-01-16T08:30:00Z"
      }
    ]
  }
}
```

---

### PUT /api/v1/chat/conversations/:id
Update conversation (name, description, image).

**Request Body:**
```json
{
  "name": "Updated Trip Name",
  "description": "New description",
  "imageUrl": "https://example.com/new-image.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversation updated successfully",
  "data": {
    "id": "conv-uuid",
    "name": "Updated Trip Name",
    "description": "New description",
    "imageUrl": "https://example.com/new-image.jpg"
  }
}
```

---

### DELETE /api/v1/chat/conversations/:id
Delete conversation (soft delete).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

---

## Participants

### POST /api/v1/chat/conversations/:id/participants
Add participant to conversation.

**Request Body:**
```json
{
  "userId": 5,
  "role": "MEMBER"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Participant added successfully",
  "data": {
    "userId": 5,
    "role": "MEMBER",
    "joinedAt": "2025-01-16T10:00:00Z"
  }
}
```

---

### DELETE /api/v1/chat/conversations/:id/participants/:userId
Remove participant from conversation.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Participant removed successfully"
}
```

---

### PUT /api/v1/chat/conversations/:id/participants/:userId/role
Update participant role.

**Request Body:**
```json
{
  "role": "MODERATOR"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Participant role updated",
  "data": {
    "userId": 5,
    "role": "MODERATOR"
  }
}
```

---

## Messages

### GET /api/v1/chat/conversations/:id/messages
Get messages in conversation (paginated).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 50 | Messages per page |
| `before` | string | - | Get messages before this message ID |
| `after` | string | - | Get messages after this message ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-uuid-1",
        "conversationId": "conv-uuid",
        "senderId": 1,
        "type": "TEXT",
        "content": "Hello everyone!",
        "replyToId": null,
        "isEdited": false,
        "isDeleted": false,
        "createdAt": "2025-01-16T08:00:00Z",
        "attachments": [],
        "reactions": [
          {"emoji": "👍", "count": 2, "userReacted": true}
        ],
        "readBy": [1, 2, 3]
      },
      {
        "id": "msg-uuid-2",
        "conversationId": "conv-uuid",
        "senderId": 2,
        "type": "IMAGE",
        "content": "Check this out!",
        "attachments": [
          {
            "id": "att-uuid",
            "type": "IMAGE",
            "fileName": "photo.jpg",
            "fileSize": 245678,
            "mimeType": "image/jpeg",
            "url": "https://storage.example.com/photo.jpg",
            "thumbnailUrl": "https://storage.example.com/photo-thumb.jpg",
            "width": 1920,
            "height": 1080
          }
        ],
        "createdAt": "2025-01-16T08:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "hasMore": true
    }
  }
}
```

---

### POST /api/v1/chat/conversations/:id/messages
Send a message.

**Request Body (Text Message):**
```json
{
  "type": "TEXT",
  "content": "Hello everyone!"
}
```

**Request Body (Reply):**
```json
{
  "type": "TEXT",
  "content": "I agree!",
  "replyToId": "msg-uuid-to-reply"
}
```

**Request Body (Location):**
```json
{
  "type": "LOCATION",
  "content": "{\"latitude\": 18.5204, \"longitude\": 73.8567, \"name\": \"Pune, India\"}"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": "msg-uuid",
    "conversationId": "conv-uuid",
    "senderId": 1,
    "type": "TEXT",
    "content": "Hello everyone!",
    "createdAt": "2025-01-16T10:00:00Z"
  }
}
```

---

### POST /api/v1/chat/conversations/:id/messages/attachment
Send message with attachment.

**Request (multipart/form-data):**
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | The file to upload |
| `content` | string | Optional text content |
| `replyToId` | string | Optional message ID to reply to |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message with attachment sent",
  "data": {
    "id": "msg-uuid",
    "type": "IMAGE",
    "content": "Check this photo!",
    "attachments": [
      {
        "id": "att-uuid",
        "type": "IMAGE",
        "fileName": "vacation.jpg",
        "fileSize": 567890,
        "mimeType": "image/jpeg",
        "url": "https://storage.example.com/vacation.jpg",
        "thumbnailUrl": "https://storage.example.com/vacation-thumb.jpg"
      }
    ],
    "createdAt": "2025-01-16T10:05:00Z"
  }
}
```

---

### PUT /api/v1/chat/messages/:id
Edit a message.

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message updated",
  "data": {
    "id": "msg-uuid",
    "content": "Updated message content",
    "isEdited": true,
    "editedAt": "2025-01-16T10:10:00Z"
  }
}
```

---

### DELETE /api/v1/chat/messages/:id
Delete a message (soft delete).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message deleted"
}
```

---

## Reactions

### POST /api/v1/chat/messages/:id/reactions
Add reaction to message.

**Request Body:**
```json
{
  "emoji": "👍"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Reaction added",
  "data": {
    "messageId": "msg-uuid",
    "userId": 1,
    "emoji": "👍",
    "createdAt": "2025-01-16T10:15:00Z"
  }
}
```

---

### DELETE /api/v1/chat/messages/:id/reactions/:emoji
Remove reaction from message.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reaction removed"
}
```

---

## Read Receipts

### POST /api/v1/chat/conversations/:id/read
Mark conversation as read.

**Request Body (Optional):**
```json
{
  "messageId": "msg-uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversation marked as read",
  "data": {
    "lastReadAt": "2025-01-16T10:20:00Z",
    "lastReadMessageId": "msg-uuid"
  }
}
```

---

### POST /api/v1/chat/conversations/:id/typing
Update typing status.

**Request Body:**
```json
{
  "isTyping": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Typing status updated"
}
```

---

## Push Tokens

### POST /api/v1/chat/push-tokens
Register push notification token.

**Request Body:**
```json
{
  "token": "fcm-token-here",
  "platform": "ANDROID",
  "deviceId": "device-uuid"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Push token registered",
  "data": {
    "id": "token-uuid",
    "userId": 1,
    "token": "fcm-token-here",
    "platform": "ANDROID",
    "isActive": true
  }
}
```

---

### DELETE /api/v1/chat/push-tokens/:token
Remove push notification token.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Push token removed"
}
```

---

## User Blocking

### GET /api/v1/chat/blocked
Get blocked users list.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "blockedUsers": [
      {
        "id": "block-uuid",
        "blockedId": 5,
        "reason": "Spam messages",
        "createdAt": "2025-01-10T12:00:00Z"
      }
    ]
  }
}
```

---

### POST /api/v1/chat/block/:userId
Block a user.

**Request Body (Optional):**
```json
{
  "reason": "Sending spam messages"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "id": "block-uuid",
    "blockerId": 1,
    "blockedId": 5,
    "reason": "Sending spam messages",
    "createdAt": "2025-01-16T10:30:00Z"
  }
}
```

---

### DELETE /api/v1/chat/block/:userId
Unblock a user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User unblocked successfully"
}
```

---

## Mute Conversation

### PUT /api/v1/chat/conversations/:id/mute
Mute conversation notifications.

**Request Body:**
```json
{
  "isMuted": true,
  "muteUntil": "2025-01-20T00:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversation muted",
  "data": {
    "isMuted": true,
    "muteUntil": "2025-01-20T00:00:00Z"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid message content"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You are not a participant of this conversation"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Conversation not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Direct conversation with this user already exists"
}
```

---

## Enums Reference

### ConversationType
- `DIRECT` - 1:1 chat between two users
- `GROUP` - Group chat linked to a travel group
- `SUPPORT` - Customer support chat

### ParticipantRole
- `ADMIN` - Can manage participants and settings
- `MODERATOR` - Can delete messages and mute users
- `MEMBER` - Regular participant

### MessageType
- `TEXT` - Plain text message
- `IMAGE` - Image attachment
- `FILE` - File attachment
- `AUDIO` - Audio message
- `VIDEO` - Video attachment
- `LOCATION` - Location share
- `SYSTEM` - System-generated message

### AttachmentType
- `IMAGE` - jpeg, png, gif, webp
- `FILE` - pdf, doc, etc.
- `AUDIO` - mp3, wav, etc.
- `VIDEO` - mp4, mov, etc.

### Platform
- `WEB` - Web browser
- `IOS` - iOS app
- `ANDROID` - Android app

---

*Last Updated: December 22, 2025*
