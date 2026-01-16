# Chat Service

Real-time messaging microservice for TNE platform with conversations, messages, attachments, reactions, and read receipts.

## Overview

- **Port:** 3009
- **Status:** Production-Ready
- **Database:** PostgreSQL (tne_chatdb)

## Features

### Conversations
- Direct (1:1) messaging
- Group chat linked to travel groups
- Support chat channel
- Participant management
- Last message tracking

### Messages
- Text, image, file, audio, video, location
- Reply/thread support
- Edit and delete messages
- Soft delete with audit trail
- System messages (user joined, left)

### Attachments
- Image upload with thumbnails
- File sharing with metadata
- Audio/video with duration tracking
- File size and MIME type validation

### Reactions
- Emoji reactions on messages
- Multiple reactions per message
- Remove reactions

### Read Receipts
- Message read tracking
- Last read position per user
- Typing indicators

### Notifications
- Push notification tokens
- Multi-platform support (Web, iOS, Android)
- Mute conversation option

### User Blocking
- Block/unblock users
- Blocked users cannot message

## Database Schema

| Table | Description |
|-------|-------------|
| `conversations` | Chat threads (direct/group) |
| `conversation_participants` | Participants with roles |
| `messages` | Message content |
| `message_attachments` | Files and media |
| `message_reactions` | Emoji reactions |
| `message_read_receipts` | Read tracking |
| `user_blocks` | Block relationships |
| `push_tokens` | Push notification tokens |

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
PORT=3008
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tne_chatdb

# JWT (must match auth-service)
JWT_SECRET=<same-as-auth-service>

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Push Notifications (optional)
FIREBASE_CREDENTIALS=
```

## API Endpoints

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | Get user's conversations |
| POST | `/conversations` | Create conversation |
| GET | `/conversations/:id` | Get conversation details |
| PUT | `/conversations/:id` | Update conversation |
| DELETE | `/conversations/:id` | Delete conversation |
| POST | `/conversations/:id/participants` | Add participant |
| DELETE | `/conversations/:id/participants/:userId` | Remove participant |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations/:id/messages` | Get messages |
| POST | `/conversations/:id/messages` | Send message |
| PUT | `/messages/:id` | Edit message |
| DELETE | `/messages/:id` | Delete message |
| POST | `/messages/:id/reactions` | Add reaction |
| DELETE | `/messages/:id/reactions/:emoji` | Remove reaction |

### Read Receipts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/conversations/:id/read` | Mark as read |
| POST | `/conversations/:id/typing` | Update typing status |

### Push Tokens
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/push-tokens` | Register token |
| DELETE | `/push-tokens/:token` | Remove token |

### User Blocking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/blocked` | Get blocked users |
| POST | `/block/:userId` | Block user |
| DELETE | `/block/:userId` | Unblock user |

## Testing

```bash
# Health check
curl http://localhost:3009/api/v1/health

# Get conversations
curl http://localhost:3009/api/v1/chat/conversations \
  -H "Authorization: Bearer {token}"

# Send message
curl -X POST http://localhost:3009/api/v1/chat/conversations/{id}/messages \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"type":"TEXT","content":"Hello!"}'
```

## Security Features

- JWT authentication
- Participant validation
- User blocking enforcement
- File type validation
- Rate limiting
- Message ownership validation

---

*Last Updated: December 22, 2025*
