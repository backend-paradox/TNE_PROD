# Group Service

Travel group management microservice for TNE platform with trip planning, itinerary, expense splitting, polls, and member management.

## Overview

- **Port:** 3008
- **Status:** Production-Ready
- **Database:** PostgreSQL (tne_groupdb)

## Features

### Group Management
- Create/update/delete travel groups
- Group types: PUBLIC, PRIVATE, SECRET
- Group cover images
- Trip details (destination, dates, budget)
- Maximum member limits
- Soft delete support

### Member Management
- Role-based access: OWNER, ADMIN, MODERATOR, MEMBER
- Member invitations via email or userId
- Join requests for public groups
- RSVP status tracking (GOING, MAYBE, NOT_GOING)
- Mute notifications per member
- Leave group functionality

### Invitations
- Invite by email or user ID
- Token-based email invitations
- Expiry date on invitations
- Personal messages with invites
- Accept/decline workflow

### Itinerary Planning
- Add trip activities with dates/times
- Categories: TRANSPORT, ACCOMMODATION, ACTIVITY, FOOD, SIGHTSEEING
- Location with coordinates
- Estimated vs actual costs
- Booking references
- Vote on proposed activities
- Admin confirmation of items

### Expense Splitting
- Track group expenses
- Categories: ACCOMMODATION, TRANSPORT, FOOD, ACTIVITIES, etc.
- Split types: EQUAL, EXACT, PERCENTAGE, SHARES
- Receipt image upload
- Balance tracking per member
- Settlement suggestions
- Mark expenses as settled

### Polls & Voting
- Poll types: SINGLE_CHOICE, MULTIPLE_CHOICE, DATE_POLL
- Anonymous voting option
- Poll expiry dates
- Close polls manually
- View results with vote counts

### Announcements
- Priority levels: LOW, NORMAL, HIGH, URGENT
- Pin important announcements
- Group-wide notifications

## Database Schema

| Table | Description |
|-------|-------------|
| `groups` | Main group/trip data |
| `group_members` | Member records with roles |
| `group_invitations` | Pending invitations |
| `join_requests` | Public group join requests |
| `itinerary_items` | Trip activities |
| `itinerary_votes` | Votes on activities |
| `expenses` | Group expenses |
| `expense_splits` | Individual shares |
| `polls` | Group polls |
| `poll_options` | Poll choices |
| `poll_votes` | Member votes |
| `announcements` | Group announcements |

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
PORT=3006
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tne_groupdb

# JWT (must match auth-service)
JWT_SECRET=<same-as-auth-service>

# CORS
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Groups
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/groups` | Get my groups | Member |
| GET | `/groups/search` | Search public groups | User |
| POST | `/groups` | Create group | User |
| GET | `/groups/:id` | Get group details | Member |
| PUT | `/groups/:id` | Update group | Admin |
| DELETE | `/groups/:id` | Delete group | Owner |
| POST | `/groups/:id/join` | Request to join | User |
| GET | `/groups/:id/join-requests` | Get join requests | Admin |
| PUT | `/groups/:id/join-requests/:id` | Handle request | Admin |

### Members
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/groups/:id/members` | Get members | Member |
| POST | `/groups/:id/invitations` | Invite member | Admin |
| GET | `/groups/:id/invitations` | Get invitations | Admin |
| DELETE | `/groups/:id/invitations/:id` | Cancel invitation | Admin |
| POST | `/invitations/:token/accept` | Accept invite | Token |
| POST | `/invitations/:token/decline` | Decline invite | Token |
| PUT | `/groups/:id/members/:id` | Update role | Owner |
| DELETE | `/groups/:id/members/:id` | Remove member | Admin |
| POST | `/groups/:id/leave` | Leave group | Member |
| PUT | `/groups/:id/rsvp` | Update RSVP | Member |

### Itinerary
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/groups/:id/itinerary` | Get itinerary | Member |
| POST | `/groups/:id/itinerary` | Add item | Member |
| PUT | `/groups/:id/itinerary/:id` | Update item | Member |
| DELETE | `/groups/:id/itinerary/:id` | Delete item | Admin |
| POST | `/groups/:id/itinerary/:id/vote` | Vote on item | Member |
| PUT | `/groups/:id/itinerary/:id/confirm` | Confirm item | Admin |

### Expenses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/groups/:id/expenses` | Get expenses | Member |
| GET | `/groups/:id/expenses/summary` | Get balances | Member |
| POST | `/groups/:id/expenses` | Add expense | Member |
| PUT | `/groups/:id/expenses/:id` | Update expense | Member |
| DELETE | `/groups/:id/expenses/:id` | Delete expense | Member |
| POST | `/groups/:id/expenses/:id/settle` | Settle expense | Member |
| GET | `/groups/:id/expenses/settlements` | Get suggestions | Member |

### Polls
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/groups/:id/polls` | Get polls | Member |
| GET | `/groups/:id/polls/:id` | Get poll | Member |
| POST | `/groups/:id/polls` | Create poll | Member |
| POST | `/groups/:id/polls/:id/vote` | Vote | Member |
| PUT | `/groups/:id/polls/:id/close` | Close poll | Creator/Admin |
| DELETE | `/groups/:id/polls/:id` | Delete poll | Admin |

## Testing

```bash
# Health check
curl http://localhost:3008/api/v1/health

# Get my groups (with token)
curl http://localhost:3008/api/v1/groups \
  -H "Authorization: Bearer {token}"

# Create group
curl -X POST http://localhost:3008/api/v1/groups \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Goa Trip 2025","destination":"Goa","startDate":"2025-03-01","endDate":"2025-03-05"}'

# Add expense
curl -X POST http://localhost:3008/api/v1/groups/{groupId}/expenses \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hotel Booking","amount":15000,"category":"ACCOMMODATION","splitType":"EQUAL"}'
```

## Security Features

- JWT authentication
- Role-based access control (Owner > Admin > Moderator > Member)
- Group membership validation middleware
- Token-based invitation system
- Soft delete for data retention

---

*Last Updated: December 22, 2025*
