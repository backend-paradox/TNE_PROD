# User Service

Comprehensive user profile management microservice for TNE platform with profiles, addresses, KYC verification, travel preferences, documents, emergency contacts, badges, and social features.

## Overview

- **Port:** 3002
- **Status:** Production-Ready
- **Database:** PostgreSQL (tne_userdb)

## Features

### Profile Management
- Complete user profile with extended fields
- Profile picture upload (local/S3)
- Bio, languages, nationality, occupation
- Social links (Instagram, LinkedIn, Twitter)
- Travel style preferences
- Soft delete with recovery

### Avatar Upload
- Image upload with auto-processing (resize to 600x600, WebP conversion)
- Local storage for development
- AWS S3 storage for production
- Automatic old file cleanup

### Travel Features
- Travel personalities (Content Creator, Food Explorer, etc.)
- Visited cities tracking
- Social vibe score for matching
- Current location tracking
- Nearby travellers discovery (Haversine formula)
- Interests and travel style

### Address Management
- Multiple addresses per user
- Address types: HOME, WORK, OTHER
- Geolocation support
- Default address setting

### KYC Verification
- Document types: Aadhaar, PAN, Passport, Driving License, Voter ID
- Document upload with front/back images
- Admin verification workflow
- Status tracking: PENDING, SUBMITTED, VERIFIED, REJECTED

### Travel Preferences
- Preferred/avoided destinations
- Dietary restrictions (Vegetarian, Vegan, Halal, Kosher, etc.)
- Accommodation types (Hotel, Hostel, Airbnb, etc.)
- Budget range with currency
- Smoking preferences
- Group size and age preferences

### Travel Documents
- Passport, Visa, Travel Insurance, Vaccination
- Expiry date tracking
- Expiry reminder system
- Visa-specific fields (type, country, entry type)

### Emergency Contacts
- Multiple emergency contacts
- Primary contact designation
- Relationship and contact details

### Badges & Achievements
- Badge types: FIRST_TRIP, EXPLORER, GLOBETROTTER, VERIFIED, etc.
- Admin badge awarding
- Achievement tracking

### Block Management
- Block/unblock users
- Block status checking
- Blocked users filtering in searches

## Database Schema

| Table | Description |
|-------|-------------|
| `user_profiles` | Extended user profile data |
| `addresses` | User addresses (home, work, other) |
| `kyc_documents` | KYC verification documents |
| `travel_preferences` | Travel style, budget, interests |
| `travel_documents` | Passports, visas, IDs |
| `emergency_contacts` | Emergency contact information |
| `user_badges` | Achievement badges |
| `user_blocks` | Blocked users list |

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
PORT=3002
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tne_userdb

# JWT (must match auth-service)
JWT_SECRET=<same-as-auth-service>
JWT_REFRESH_SECRET=<same-as-auth-service>

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# S3 (production only)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=
```

## Storage Configuration

### Development (Local Storage)
- Files stored in `uploads/avatars/` directory
- Served via `/uploads` static route
- Auto-creates directory if missing

### Production (S3 Storage)
- Files stored in AWS S3
- Automatic image optimization (WebP, 600x600)
- Old files auto-deleted on update

## API Endpoints

### Profile Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/profile` | Create profile (internal) |
| GET | `/api/v1/users/profile` | Get own profile |
| PUT | `/api/v1/users/profile` | Update profile |
| PUT | `/api/v1/users/profile/avatar` | Upload avatar |
| DELETE | `/api/v1/users/profile/avatar` | Delete avatar |
| DELETE | `/api/v1/users/profile` | Delete profile (soft) |
| GET | `/api/v1/users/search` | Search users |

### Location & Nearby
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/v1/users/location` | Update location |
| GET | `/api/v1/users/nearby` | Get nearby travellers |

### Address Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/addresses` | Get all addresses |
| POST | `/api/v1/users/addresses` | Add address |
| PUT | `/api/v1/users/addresses/:id` | Update address |
| DELETE | `/api/v1/users/addresses/:id` | Delete address |

### KYC Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/kyc` | Get KYC status |
| GET | `/api/v1/users/kyc/documents` | Get KYC documents |
| GET | `/api/v1/users/kyc/documents/:id` | Get specific document |
| POST | `/api/v1/users/kyc/documents` | Submit KYC document |

### Travel Preferences
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/travel-preferences` | Get preferences |
| PUT | `/api/v1/users/travel-preferences` | Update preferences |
| DELETE | `/api/v1/users/travel-preferences` | Delete preferences |

### Travel Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/travel-documents` | Get all documents |
| GET | `/api/v1/users/travel-documents/expiring` | Get expiring docs |
| POST | `/api/v1/users/travel-documents` | Add document |
| PUT | `/api/v1/users/travel-documents/:id` | Update document |
| DELETE | `/api/v1/users/travel-documents/:id` | Delete document |

### Emergency Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/emergency-contacts` | Get contacts |
| POST | `/api/v1/users/emergency-contacts` | Add contact |
| PUT | `/api/v1/users/emergency-contacts/:id` | Update contact |
| DELETE | `/api/v1/users/emergency-contacts/:id` | Delete contact |

### Badges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/badges` | Get my badges |
| POST | `/api/v1/users/badges` | Add badge (self) |

### Block Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/blocked` | Get blocked users |
| POST | `/api/v1/users/block` | Block user |
| DELETE | `/api/v1/users/block/:userId` | Unblock user |
| GET | `/api/v1/users/block/:userId/status` | Check block status |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | Get all users |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users/:id/verify` | Verify user |
| POST | `/api/v1/users/:id/unverify` | Unverify user |
| PUT | `/api/v1/users/:id/stats` | Update user stats |
| PUT | `/api/v1/users/:id/vibe-score` | Update vibe score |
| GET | `/api/v1/users/kyc/admin/documents` | Get all KYC docs |
| PUT | `/api/v1/users/kyc/admin/documents/:id/verify` | Verify/Reject KYC |
| POST | `/api/v1/users/:userId/badges` | Award badge |

## Integration with Auth Service

When a user registers in Auth Service:
1. Auth Service creates user in auth database
2. Auth Service calls `POST /api/v1/users/profile`
3. User profile created in user database
4. Both linked via `authId`

## Testing

```bash
# Health check
curl http://localhost:3002/api/v1/health

# Get profile (with token)
curl http://localhost:3002/api/v1/users/profile \
  -H "Authorization: Bearer {token}"

# Update profile
curl -X PUT http://localhost:3002/api/v1/users/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Travel enthusiast","interests":["adventure","photography"]}'

# Upload avatar
curl -X PUT http://localhost:3002/api/v1/users/profile/avatar \
  -H "Authorization: Bearer {token}" \
  -F "avatar=@photo.jpg"

# Update location
curl -X PUT http://localhost:3002/api/v1/users/location \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"latitude":19.076,"longitude":72.8777,"locationName":"Mumbai, India"}'

# Get nearby travellers
curl "http://localhost:3002/api/v1/users/nearby?radius=50" \
  -H "Authorization: Bearer {token}"

# Update travel preferences
curl -X PUT http://localhost:3002/api/v1/users/travel-preferences \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"travelPace":"MODERATE","dietaryRestrictions":["VEGETARIAN"]}'

# Add emergency contact
curl -X POST http://localhost:3002/api/v1/users/emergency-contacts \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","relationship":"Spouse","phone":"9876543211"}'
```

## Security Features

- JWT authentication
- Role-based access control (USER/ADMIN)
- Zod validation
- Rate limiting
- Helmet security headers
- CORS protection
- SQL injection prevention (Prisma)
- Soft delete for data retention

---

*Last Updated: December 22, 2025*
