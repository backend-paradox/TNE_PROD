# User Service - API Endpoints Reference

Base URL: `http://localhost:3002`

---

## Health Check

### GET /api/v1/health
Health check endpoint.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "user-service"
}
```

---

## Profile Management

### POST /api/v1/users/profile
Create user profile (internal service call from auth-service).

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `X-Internal-Service` | Yes (prod) | `auth-service` |
| `Content-Type` | Yes | `application/json` |

**Request Body:**
```json
{
  "authId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "id": 1,
    "authId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "createdAt": "2025-12-21T10:00:00.000Z"
  }
}
```

---

### GET /api/v1/users/profile
Get own profile.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "authId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "gender": "MALE",
    "maritalStatus": "SINGLE",
    "dateOfBirth": "1990-01-15",
    "profilePicUrl": "https://s3.../avatar.webp",
    "bio": "Travel enthusiast",
    "languages": ["English", "Hindi"],
    "nationality": "Indian",
    "travelStyle": "BACKPACKER",
    "interests": ["adventure", "photography"],
    "occupation": "Software Engineer",
    "socialLinks": {
      "instagram": "john_travels",
      "linkedin": "johndoe"
    },
    "travelPersonalities": ["Content Creator", "Adventure Seeker"],
    "visitedCities": ["Paris", "Tokyo", "Mumbai"],
    "socialVibeScore": 85.5,
    "achievements": ["First International Trip", "100 Days Traveled"],
    "currentLocationLat": 19.076,
    "currentLocationLng": 72.8777,
    "currentLocationName": "Mumbai, India",
    "isVerified": true,
    "rating": 4.5,
    "totalTrips": 15,
    "totalReviews": 10,
    "createdAt": "2025-12-21T10:00:00.000Z",
    "addresses": [],
    "badges": [],
    "travelPreferences": null
  }
}
```

---

### PUT /api/v1/users/profile
Update own profile.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |
| `Content-Type` | Yes | `application/json` |

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Adventure traveler and photographer",
  "gender": "MALE",
  "maritalStatus": "SINGLE",
  "dateOfBirth": "1990-01-15",
  "languages": ["English", "Hindi", "Spanish"],
  "nationality": "Indian",
  "travelStyle": "BACKPACKER",
  "interests": ["adventure", "photography", "food"],
  "occupation": "Travel Blogger",
  "socialLinks": {
    "instagram": "john_adventures",
    "linkedin": "johndoe",
    "twitter": "john_travels"
  },
  "travelPersonalities": ["Content Creator", "Food Explorer"],
  "visitedCities": ["Paris", "Tokyo", "Mumbai", "New York"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated profile object */ }
}
```

---

### PUT /api/v1/users/profile/avatar
Upload or update profile avatar.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |
| `Content-Type` | Yes | `multipart/form-data` |

**Request Body (form-data):**
| Field | Type | Description |
|-------|------|-------------|
| `avatar` | File | Image file (JPEG, PNG, WebP, max 5MB) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "profilePicUrl": "https://s3.../avatar_123_1703156400000.webp",
    "upload": {
      "fileName": "avatar_123_1703156400000.webp",
      "size": 45678,
      "storage": "s3"
    }
  }
}
```

---

### DELETE /api/v1/users/profile/avatar
Delete profile avatar.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Avatar deleted successfully",
  "data": null
}
```

---

### DELETE /api/v1/users/profile
Soft delete own profile.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile deleted successfully",
  "data": null
}
```

---

### GET /api/v1/users/search
Search users.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | - | Search by name or email |
| `travelStyle` | string | - | Filter by travel style |
| `verified` | boolean | - | Filter by verification status |
| `minRating` | number | - | Minimum rating (0-5) |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users search results retrieved successfully",
  "data": {
    "users": [
      {
        "id": 2,
        "name": "Jane Smith",
        "profilePicUrl": "...",
        "travelStyle": "LUXURY",
        "isVerified": true,
        "rating": 4.8
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

## Location & Nearby Travellers

### PUT /api/v1/users/location
Update current location.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |
| `Content-Type` | Yes | `application/json` |

**Request Body:**
```json
{
  "latitude": 19.076,
  "longitude": 72.8777,
  "locationName": "Mumbai, India"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "currentLocationLat": 19.076,
    "currentLocationLng": 72.8777,
    "currentLocationName": "Mumbai, India",
    "locationUpdatedAt": "2025-12-21T10:00:00.000Z"
  }
}
```

---

### GET /api/v1/users/nearby
Get nearby travellers.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `radius` | number | 50 | Radius in km (1-500) |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Nearby travellers retrieved successfully",
  "data": {
    "travellers": [
      {
        "id": 3,
        "name": "Alex Johnson",
        "profilePicUrl": "...",
        "currentLocationName": "Mumbai, India",
        "distance": 2.5,
        "travelStyle": "BACKPACKER",
        "socialVibeScore": 78.5
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

## Address Management

### GET /api/v1/users/addresses
Get all addresses.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Addresses retrieved successfully",
  "data": [
    {
      "id": 1,
      "type": "HOME",
      "label": "My Home",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "pincode": "400001",
      "latitude": 19.076,
      "longitude": 72.8777,
      "isDefault": true
    }
  ]
}
```

---

### POST /api/v1/users/addresses
Add new address.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |
| `Content-Type` | Yes | `application/json` |

**Request Body:**
```json
{
  "type": "HOME",
  "label": "My Home",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "pincode": "400001",
  "latitude": 19.076,
  "longitude": 72.8777,
  "isDefault": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": { /* address object */ }
}
```

---

### PUT /api/v1/users/addresses/:addressId
Update address.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |
| `Content-Type` | Yes | `application/json` |

**Request Body:** Same as POST (all fields optional)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": { /* updated address object */ }
}
```

---

### DELETE /api/v1/users/addresses/:addressId
Delete address.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Address deleted successfully",
  "data": null
}
```

---

## KYC Management

### GET /api/v1/users/kyc
Get KYC status summary.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "KYC status retrieved successfully",
  "data": {
    "overallStatus": "VERIFIED",
    "documents": {
      "AADHAAR": "VERIFIED",
      "PAN": "VERIFIED",
      "PASSPORT": "PENDING"
    }
  }
}
```

---

### GET /api/v1/users/kyc/documents
Get all KYC documents.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "KYC documents retrieved successfully",
  "data": [
    {
      "id": 1,
      "documentType": "AADHAAR",
      "documentNumber": "XXXX-XXXX-1234",
      "status": "VERIFIED",
      "frontImageUrl": "...",
      "backImageUrl": "...",
      "submittedAt": "2025-12-20T10:00:00.000Z",
      "verifiedAt": "2025-12-21T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/v1/users/kyc/documents
Submit new KYC document.

**Request Body:**
```json
{
  "documentType": "AADHAAR",
  "documentNumber": "123456789012",
  "documentName": "Aadhaar Card",
  "frontImageUrl": "https://...",
  "backImageUrl": "https://...",
  "expiryDate": "2030-12-31"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "KYC document submitted successfully",
  "data": { /* document object */ }
}
```

---

## Travel Preferences

### GET /api/v1/users/travel-preferences
Get travel preferences.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Travel preferences retrieved successfully",
  "data": {
    "id": 1,
    "preferredDestinations": ["Paris", "Tokyo", "Bali"],
    "avoidDestinations": ["Crowded cities"],
    "dietaryRestrictions": ["VEGETARIAN"],
    "accommodationTypes": ["HOTEL", "AIRBNB"],
    "travelPace": "MODERATE",
    "budgetPerDayMin": 50,
    "budgetPerDayMax": 200,
    "budgetCurrency": "USD",
    "smokingPreference": "NON_SMOKER",
    "petFriendly": false,
    "preferredGroupSize": 4,
    "preferredAgeRangeMin": 25,
    "preferredAgeRangeMax": 40
  }
}
```

---

### PUT /api/v1/users/travel-preferences
Create or update travel preferences.

**Request Body:**
```json
{
  "preferredDestinations": ["Paris", "Tokyo", "Bali"],
  "dietaryRestrictions": ["VEGETARIAN"],
  "accommodationTypes": ["HOTEL", "AIRBNB"],
  "travelPace": "MODERATE",
  "budgetPerDayMin": 50,
  "budgetPerDayMax": 200,
  "budgetCurrency": "USD",
  "smokingPreference": "NON_SMOKER",
  "petFriendly": false,
  "preferredGroupSize": 4
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Travel preferences updated successfully",
  "data": { /* preferences object */ }
}
```

---

## Travel Documents

### GET /api/v1/users/travel-documents
Get all travel documents.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "PASSPORT",
      "documentNumber": "AB1234567",
      "issuingCountry": "India",
      "issueDate": "2020-01-15",
      "expiryDate": "2030-01-14"
    },
    {
      "id": 2,
      "type": "VISA",
      "documentNumber": "V123456",
      "visaType": "Tourist",
      "visaCountry": "United States",
      "visaEntryType": "Multiple",
      "expiryDate": "2026-06-30"
    }
  ]
}
```

---

### GET /api/v1/users/travel-documents/expiring
Get documents expiring within 90 days.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "type": "VISA",
      "expiryDate": "2025-03-15",
      "daysUntilExpiry": 84
    }
  ]
}
```

---

### POST /api/v1/users/travel-documents
Add travel document.

**Request Body:**
```json
{
  "type": "PASSPORT",
  "documentNumber": "AB1234567",
  "issuingCountry": "India",
  "issueDate": "2020-01-15",
  "expiryDate": "2030-01-14",
  "documentUrl": "https://..."
}
```

---

## Emergency Contacts

### GET /api/v1/users/emergency-contacts
Get all emergency contacts.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "9876543210",
      "email": "jane@example.com",
      "countryCode": "+91",
      "isPrimary": true
    }
  ]
}
```

---

### POST /api/v1/users/emergency-contacts
Add emergency contact.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "relationship": "Spouse",
  "phone": "9876543210",
  "email": "jane@example.com",
  "countryCode": "+91",
  "isPrimary": true
}
```

---

## Badges

### GET /api/v1/users/badges
Get all badges.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "badgeType": "FIRST_TRIP",
      "earnedAt": "2025-01-15T10:00:00.000Z",
      "metadata": { "tripId": 123 }
    },
    {
      "id": 2,
      "badgeType": "EXPLORER",
      "earnedAt": "2025-06-20T10:00:00.000Z"
    }
  ]
}
```

**Badge Types:**
- `FIRST_TRIP` - First trip completed
- `EXPLORER` - 5 trips completed
- `GLOBETROTTER` - 20 trips completed
- `VERIFIED` - Profile verified
- `TOP_RATED` - Rating 4.5+
- `SUPER_HOST` - Exceptional host
- `EARLY_ADOPTER` - Early platform user
- `SOCIAL_BUTTERFLY` - Active community member
- `ADVENTURE_SEEKER` - Adventure trips
- `CULTURE_ENTHUSIAST` - Cultural trips

---

## Block Management

### GET /api/v1/users/blocked
Get blocked users.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "blockedUserId": 5,
      "blockedUser": {
        "id": 5,
        "name": "Blocked User"
      },
      "reason": "Spam messages",
      "createdAt": "2025-12-20T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/v1/users/block
Block a user.

**Request Body:**
```json
{
  "userId": 5,
  "reason": "Inappropriate behavior"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": { /* block object */ }
}
```

---

### DELETE /api/v1/users/block/:userId
Unblock a user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User unblocked successfully",
  "data": null
}
```

---

### GET /api/v1/users/block/:userId/status
Check block status with a user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isBlocked": true,
    "isBlockedBy": false,
    "blockedAt": "2025-12-20T10:00:00.000Z"
  }
}
```

---

## Wishlist

### GET /api/v1/users/wishlist
Get user's wishlist.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | - | Filter by item type (PACKAGE, HOTEL, ACTIVITY, etc.) |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "itemType": "PACKAGE",
      "itemId": "pkg_123",
      "itemName": "Goa Beach Paradise",
      "itemImage": "https://...",
      "itemPrice": 25000,
      "itemCurrency": "INR",
      "itemDestination": "Goa, India",
      "notes": "For summer vacation",
      "priority": 1,
      "createdAt": "2025-12-21T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### POST /api/v1/users/wishlist
Add item to wishlist.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |
| `Content-Type` | Yes | `application/json` |

**Request Body:**
```json
{
  "itemType": "PACKAGE",
  "itemId": "pkg_123",
  "itemName": "Goa Beach Paradise",
  "itemImage": "https://...",
  "itemPrice": 25000,
  "itemCurrency": "INR",
  "itemDestination": "Goa, India",
  "notes": "For summer vacation",
  "priority": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Added to wishlist",
  "data": { /* wishlist item object */ }
}
```

---

### PUT /api/v1/users/wishlist/:itemId
Update wishlist item.

**Request Body:**
```json
{
  "notes": "Updated notes",
  "priority": 2
}
```

---

### DELETE /api/v1/users/wishlist/:itemId
Remove item from wishlist.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Removed from wishlist"
}
```

---

### GET /api/v1/users/wishlist/check
Check if item is in wishlist.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemType` | string | Yes | Item type |
| `itemId` | string | Yes | Item ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "inWishlist": true,
    "wishlistItem": { /* item details */ }
  }
}
```

---

### DELETE /api/v1/users/wishlist
Clear entire wishlist.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Wishlist cleared",
  "data": { "deletedCount": 5 }
}
```

---

## Reviews

### GET /api/v1/users/reviews
Get user's own reviews.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | - | Filter by review type (PACKAGE, HOTEL, etc.) |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reviewType": "PACKAGE",
      "targetId": "pkg_123",
      "targetName": "Goa Beach Paradise",
      "rating": 5,
      "title": "Amazing Experience!",
      "content": "Had a wonderful time...",
      "isVerified": true,
      "helpfulCount": 12,
      "createdAt": "2025-12-21T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### POST /api/v1/users/reviews
Submit a new review.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |
| `Content-Type` | Yes | `application/json` |

**Request Body:**
```json
{
  "reviewType": "PACKAGE",
  "targetId": "pkg_123",
  "bookingId": "booking_456",
  "rating": 5,
  "title": "Amazing Experience!",
  "content": "Had a wonderful time exploring Goa...",
  "targetName": "Goa Beach Paradise",
  "targetImage": "https://...",
  "images": ["https://img1...", "https://img2..."],
  "aspectRatings": {
    "value": 5,
    "service": 4,
    "location": 5
  },
  "pros": ["Great beaches", "Friendly staff"],
  "cons": ["Crowded during peak hours"],
  "tripDate": "2025-12-15",
  "travelType": "Family"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": { /* review object */ }
}
```

---

### PUT /api/v1/users/reviews/:reviewId
Update a review.

**Request Body:**
```json
{
  "rating": 4,
  "title": "Updated title",
  "content": "Updated content...",
  "pros": ["Updated pros"],
  "cons": ["Updated cons"]
}
```

---

### DELETE /api/v1/users/reviews/:reviewId
Delete a review.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review deleted"
}
```

---

### GET /api/v1/users/reviews/:type/:targetId
Get reviews for a specific item (package, hotel, etc.).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Review type (PACKAGE, HOTEL, etc.) |
| `targetId` | string | Target item ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort` | string | recent | Sort by: recent, helpful, rating_high, rating_low |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "title": "Amazing!",
        "content": "...",
        "userProfile": {
          "id": 1,
          "name": "John Doe",
          "profilePicUrl": "...",
          "isVerified": true
        },
        "helpfulCount": 12,
        "isVerified": true,
        "createdAt": "2025-12-21T10:00:00.000Z"
      }
    ],
    "stats": {
      "averageRating": 4.5,
      "totalReviews": 25,
      "ratingDistribution": {
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 8,
        "5": 11
      }
    }
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

---

### POST /api/v1/users/reviews/:reviewId/helpful
Mark review as helpful (toggle).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Marked as helpful",
  "data": { "isHelpful": true }
}
```

---

### POST /api/v1/users/reviews/:reviewId/report
Report a review.

**Request Body:**
```json
{
  "reason": "Inappropriate content"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review reported. Our team will review it."
}
```

---

## Admin Routes

### GET /api/v1/users
Get all user profiles (Admin only).

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <admin_token>` |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `search` | string | - | Search query |

---

### GET /api/v1/users/:id
Get user profile by ID (Admin only).

---

### POST /api/v1/users/:id/verify
Verify a user (Admin only).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User verified successfully",
  "data": { /* user with isVerified: true */ }
}
```

---

### POST /api/v1/users/:id/unverify
Unverify a user (Admin only).

---

### PUT /api/v1/users/:id/stats
Update user stats (Admin only).

**Request Body:**
```json
{
  "totalTrips": 10,
  "rating": 4.5,
  "totalReviews": 8
}
```

---

### PUT /api/v1/users/:id/vibe-score
Update social vibe score (Admin only).

**Request Body:**
```json
{
  "score": 85.5
}
```

---

### PUT /api/v1/users/kyc/admin/documents/:documentId/verify
Verify or reject KYC document (Admin only).

**Request Body:**
```json
{
  "status": "VERIFIED",
  "rejectionReason": null
}
```

---

### POST /api/v1/users/:userId/badges
Award badge to user (Admin only).

**Request Body:**
```json
{
  "badgeType": "TOP_RATED",
  "metadata": { "reason": "Exceptional reviews" }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
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
  "message": "Access denied. Admin role required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Profile not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Enums Reference

### Gender
`MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`

### MaritalStatus
`SINGLE`, `MARRIED`, `DIVORCED`, `WIDOWED`, `PREFER_NOT_TO_SAY`

### TravelStyle
`BUDGET`, `MID_RANGE`, `LUXURY`, `BACKPACKER`

### AddressType
`HOME`, `WORK`, `OTHER`

### KYCDocumentType
`AADHAAR`, `PAN`, `PASSPORT`, `DRIVING_LICENSE`, `VOTER_ID`

### KYCStatus
`PENDING`, `SUBMITTED`, `VERIFIED`, `REJECTED`

### TravelDocumentType
`PASSPORT`, `VISA`, `TRAVEL_INSURANCE`, `VACCINATION`

### DietaryRestriction
`VEGETARIAN`, `VEGAN`, `HALAL`, `KOSHER`, `GLUTEN_FREE`, `NUT_FREE`, `LACTOSE_FREE`, `NONE`

### AccommodationType
`HOTEL`, `HOSTEL`, `AIRBNB`, `CAMPING`, `RESORT`, `HOMESTAY`, `COUCHSURFING`

### TravelPace
`SLOW`, `MODERATE`, `FAST`

### SmokingPreference
`SMOKER`, `NON_SMOKER`, `NO_PREFERENCE`

### WishlistItemType
`PACKAGE`, `HOTEL`, `ACTIVITY`, `DESTINATION`, `FLIGHT`

### ReviewType
`PACKAGE`, `HOTEL`, `ACTIVITY`, `DESTINATION`, `VENDOR`, `GROUP_TRIP`

---

*Last Updated: December 22, 2025*
