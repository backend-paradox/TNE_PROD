# Group Service - API Endpoints Reference

Base URL: `http://localhost:3008`

All endpoints require `Authorization: Bearer <token>` header unless noted.

---

## Health Check

### GET /api/v1/health
**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "group-service"
}
```

---

## Group Management

### GET /api/v1/groups
Get all groups for current user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Goa Trip 2025",
      "description": "Annual friends trip",
      "imageUrl": "https://...",
      "destination": "Goa, India",
      "startDate": "2025-03-01",
      "endDate": "2025-03-05",
      "budget": 50000,
      "budgetPerPerson": 10000,
      "currency": "INR",
      "type": "PRIVATE",
      "maxMembers": 10,
      "memberCount": 5,
      "myRole": "OWNER"
    }
  ]
}
```

---

### GET /api/v1/groups/search
Search public groups.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query |
| `destination` | string | Filter by destination |
| `startDate` | date | Min start date |
| `endDate` | date | Max end date |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "groups": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

---

### POST /api/v1/groups
Create new group.

**Request Body:**
```json
{
  "name": "Goa Trip 2025",
  "description": "Annual friends trip to Goa",
  "destination": "Goa, India",
  "startDate": "2025-03-01",
  "endDate": "2025-03-05",
  "budget": 50000,
  "currency": "INR",
  "type": "PRIVATE",
  "maxMembers": 10
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": { /* group object */ }
}
```

---

### GET /api/v1/groups/:groupId
Get group details. **Requires: Group Member**

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Goa Trip 2025",
    "description": "Annual friends trip",
    "destination": "Goa, India",
    "startDate": "2025-03-01",
    "endDate": "2025-03-05",
    "budget": 50000,
    "budgetPerPerson": 10000,
    "currency": "INR",
    "type": "PRIVATE",
    "maxMembers": 10,
    "isActive": true,
    "createdBy": 1,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "members": [...],
    "myRole": "OWNER"
  }
}
```

---

### PUT /api/v1/groups/:groupId
Update group. **Requires: Group Admin**

**Request Body:**
```json
{
  "name": "Goa Beach Trip 2025",
  "description": "Updated description",
  "budget": 60000
}
```

---

### DELETE /api/v1/groups/:groupId
Delete group (soft delete). **Requires: Group Owner**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Group deleted successfully"
}
```

---

### POST /api/v1/groups/:groupId/join
Request to join public group.

**Request Body:**
```json
{
  "message": "I'd love to join your trip!"
}
```

---

### GET /api/v1/groups/:groupId/join-requests
Get pending join requests. **Requires: Group Admin**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": 5,
      "userName": "John Doe",
      "message": "I'd love to join!",
      "status": "PENDING",
      "createdAt": "2025-01-20T10:00:00.000Z"
    }
  ]
}
```

---

### PUT /api/v1/groups/:groupId/join-requests/:requestId
Approve or reject join request. **Requires: Group Admin**

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

---

## Member Management

### GET /api/v1/groups/:groupId/members
Get group members. **Requires: Group Member**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": 1,
      "userName": "John Doe",
      "profilePicUrl": "...",
      "role": "OWNER",
      "nickname": "Johnny",
      "rsvpStatus": "GOING",
      "joinedAt": "2025-01-15T10:00:00.000Z",
      "isMuted": false
    }
  ]
}
```

---

### POST /api/v1/groups/:groupId/invitations
Invite member. **Requires: Group Admin**

**Request Body:**
```json
{
  "userId": 5,
  "email": "friend@example.com",
  "role": "MEMBER",
  "message": "Join our trip!"
}
```

---

### GET /api/v1/groups/:groupId/invitations
Get pending invitations. **Requires: Group Admin**

---

### DELETE /api/v1/groups/:groupId/invitations/:invitationId
Cancel invitation. **Requires: Group Admin**

---

### POST /api/v1/invitations/:token/accept
Accept invitation via email token. **No Auth Required**

---

### POST /api/v1/invitations/:token/decline
Decline invitation via email token. **No Auth Required**

---

### PUT /api/v1/groups/:groupId/members/:memberId
Update member role. **Requires: Group Owner**

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

---

### DELETE /api/v1/groups/:groupId/members/:memberId
Remove member. **Requires: Group Admin**

---

### POST /api/v1/groups/:groupId/leave
Leave group. **Requires: Group Member**

---

### PUT /api/v1/groups/:groupId/rsvp
Update RSVP status. **Requires: Group Member**

**Request Body:**
```json
{
  "status": "GOING"
}
```

---

## Itinerary

### GET /api/v1/groups/:groupId/itinerary
Get itinerary items. **Requires: Group Member**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Beach Day",
      "description": "Visit Calangute Beach",
      "location": "Calangute Beach",
      "address": "Calangute, Goa",
      "latitude": 15.5449,
      "longitude": 73.7538,
      "date": "2025-03-02",
      "startTime": "10:00",
      "endTime": "14:00",
      "duration": 240,
      "category": "ACTIVITY",
      "estimatedCost": 500,
      "isConfirmed": true,
      "upVotes": 4,
      "downVotes": 1,
      "myVote": "UP"
    }
  ]
}
```

---

### POST /api/v1/groups/:groupId/itinerary
Add itinerary item. **Requires: Group Member**

**Request Body:**
```json
{
  "title": "Beach Day",
  "description": "Visit Calangute Beach",
  "location": "Calangute Beach",
  "address": "Calangute, Goa",
  "latitude": 15.5449,
  "longitude": 73.7538,
  "date": "2025-03-02",
  "startTime": "10:00",
  "endTime": "14:00",
  "category": "ACTIVITY",
  "estimatedCost": 500
}
```

---

### PUT /api/v1/groups/:groupId/itinerary/:itemId
Update itinerary item. **Requires: Group Member**

---

### DELETE /api/v1/groups/:groupId/itinerary/:itemId
Delete itinerary item. **Requires: Group Admin**

---

### POST /api/v1/groups/:groupId/itinerary/:itemId/vote
Vote on itinerary item. **Requires: Group Member**

**Request Body:**
```json
{
  "vote": "UP"
}
```

---

### PUT /api/v1/groups/:groupId/itinerary/:itemId/confirm
Confirm itinerary item. **Requires: Group Admin**

---

## Expenses

### GET /api/v1/groups/:groupId/expenses
Get all expenses. **Requires: Group Member**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Hotel Booking",
      "description": "3 nights at Beach Resort",
      "category": "ACCOMMODATION",
      "amount": 15000,
      "currency": "INR",
      "date": "2025-03-01",
      "paidBy": 1,
      "paidByName": "John Doe",
      "receiptUrl": "https://...",
      "splitType": "EQUAL",
      "splits": [
        { "userId": 1, "amount": 3000, "isPaid": true },
        { "userId": 2, "amount": 3000, "isPaid": false }
      ]
    }
  ]
}
```

---

### GET /api/v1/groups/:groupId/expenses/summary
Get expense balances. **Requires: Group Member**

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalExpenses": 50000,
    "perPersonAverage": 10000,
    "balances": [
      { "userId": 1, "name": "John", "paid": 20000, "owes": 10000, "balance": 10000 },
      { "userId": 2, "name": "Jane", "paid": 5000, "owes": 10000, "balance": -5000 }
    ]
  }
}
```

---

### POST /api/v1/groups/:groupId/expenses
Add expense. **Requires: Group Member**

**Request Body:**
```json
{
  "title": "Hotel Booking",
  "description": "3 nights at Beach Resort",
  "category": "ACCOMMODATION",
  "amount": 15000,
  "currency": "INR",
  "date": "2025-03-01",
  "paidBy": 1,
  "splitType": "EQUAL",
  "splits": [
    { "userId": 1, "amount": 3000 },
    { "userId": 2, "amount": 3000 }
  ]
}
```

---

### PUT /api/v1/groups/:groupId/expenses/:expenseId
Update expense. **Requires: Group Member**

---

### DELETE /api/v1/groups/:groupId/expenses/:expenseId
Delete expense. **Requires: Group Member**

---

### POST /api/v1/groups/:groupId/expenses/:expenseId/settle
Mark expense as settled. **Requires: Group Member**

**Request Body:**
```json
{
  "userId": 2
}
```

---

### GET /api/v1/groups/:groupId/expenses/settlements
Get settlement suggestions. **Requires: Group Member**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "from": { "userId": 2, "name": "Jane" },
      "to": { "userId": 1, "name": "John" },
      "amount": 5000
    }
  ]
}
```

---

## Polls

### GET /api/v1/groups/:groupId/polls
Get all polls. **Requires: Group Member**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "question": "Which beach should we visit?",
      "description": "Vote for your favorite",
      "type": "SINGLE_CHOICE",
      "isAnonymous": false,
      "endsAt": "2025-02-15T18:00:00.000Z",
      "isClosed": false,
      "totalVotes": 5,
      "createdBy": 1,
      "options": [
        { "id": "uuid", "text": "Calangute Beach", "votes": 3 },
        { "id": "uuid", "text": "Baga Beach", "votes": 2 }
      ],
      "myVotes": ["option-uuid"]
    }
  ]
}
```

---

### GET /api/v1/groups/:groupId/polls/:pollId
Get single poll with results. **Requires: Group Member**

---

### POST /api/v1/groups/:groupId/polls
Create poll. **Requires: Group Member**

**Request Body:**
```json
{
  "question": "Which beach should we visit?",
  "description": "Vote for your favorite beach",
  "type": "SINGLE_CHOICE",
  "isAnonymous": false,
  "endsAt": "2025-02-15T18:00:00.000Z",
  "options": [
    { "text": "Calangute Beach" },
    { "text": "Baga Beach" },
    { "text": "Anjuna Beach" }
  ]
}
```

---

### POST /api/v1/groups/:groupId/polls/:pollId/vote
Vote on poll. **Requires: Group Member**

**Request Body:**
```json
{
  "optionIds": ["option-uuid"]
}
```

---

### PUT /api/v1/groups/:groupId/polls/:pollId/close
Close poll. **Requires: Creator or Admin**

---

### DELETE /api/v1/groups/:groupId/polls/:pollId
Delete poll. **Requires: Group Admin**

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [...]
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
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Group not found"
}
```

---

## Enums Reference

### GroupType
`PUBLIC`, `PRIVATE`, `SECRET`

### MemberRole
`OWNER`, `ADMIN`, `MODERATOR`, `MEMBER`

### RSVPStatus
`PENDING`, `GOING`, `MAYBE`, `NOT_GOING`

### InvitationStatus
`PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `CANCELLED`

### ItineraryCategory
`TRANSPORT`, `ACCOMMODATION`, `ACTIVITY`, `FOOD`, `SIGHTSEEING`, `FREE_TIME`, `OTHER`

### VoteType
`UP`, `DOWN`

### ExpenseCategory
`ACCOMMODATION`, `TRANSPORT`, `FOOD`, `ACTIVITIES`, `SHOPPING`, `TIPS`, `OTHER`

### SplitType
`EQUAL`, `EXACT`, `PERCENTAGE`, `SHARES`

### PollType
`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `DATE_POLL`

### JoinRequestStatus
`PENDING`, `APPROVED`, `REJECTED`

---

*Last Updated: December 22, 2025*
