# Booking Service

Complete booking management service with integrated payment processing for TripAndEvent platform.

## Features

### Booking Management
- ✅ Hotel bookings with room details, meals, guest information
- ✅ Flight bookings with passenger details, seats, PNR
- ✅ Multi-type support (HOTEL, FLIGHT, BUS, EVENT, PACKAGE)
- ✅ Unique booking number generation (TNE-HOTEL-12345678ABCD)
- ✅ Confirmation code generation
- ✅ Booking status workflow (PENDING → PAYMENT_PENDING → CONFIRMED → COMPLETED)

### Payment Integration
- ✅ Integrated with Payment Service (Razorpay)
- ✅ Automatic payment initiation
- ✅ Payment confirmation handling
- ✅ Payment failure handling
- ✅ Tax calculation (18% GST)
- ✅ Discount support

### Cancellation & Refunds
- ✅ User-initiated cancellation
- ✅ Cancellation reason tracking
- ✅ Automatic refund initiation for paid bookings
- ✅ Refund status tracking

### Admin Features
- ✅ View all bookings with filters
- ✅ Search by booking number, email, phone
- ✅ Update booking status
- ✅ Pagination and filtering

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** PostgreSQL 15 with Prisma ORM
- **Validation:** Zod schemas
- **Authentication:** JWT (shared with auth-service)
- **HTTP Client:** Axios (for payment service integration)
- **Logging:** Winston with daily rotation
- **Security:** Helmet, CORS, rate limiting

## Database Schema

### Main Models

**Booking** - Core booking information
```prisma
model Booking {
  id             Int           @id
  bookingNumber  String        @unique
  userId         Int
  type           BookingType   // HOTEL, FLIGHT, BUS, EVENT, PACKAGE
  status         BookingStatus // PENDING, PAYMENT_PENDING, CONFIRMED, etc.

  // Polymorphic references
  hotelId        Int?
  flightId       Int?

  // Pricing
  basePrice      Decimal
  taxAmount      Decimal
  discountAmount Decimal
  totalAmount    Decimal

  // Payment
  paymentId      Int?
  paymentStatus  String?

  // Contact
  contactName    String
  contactEmail   String
  contactPhone   String

  // Confirmation
  confirmationCode String?
  confirmedAt    DateTime?

  // Relations
  hotelBooking   HotelBooking?
  flightBooking  FlightBooking?
  reviews        BookingReview[]
}
```

**HotelBooking** - Hotel-specific details
```prisma
model HotelBooking {
  id             Int
  bookingId      Int      @unique
  hotelId        Int
  roomType       String
  numberOfRooms  Int
  numberOfGuests Int
  numberOfNights Int
  mealsIncluded  Boolean
  mealPlan       String?  // EP, CP, MAP, AP
  extraBeds      Int
}
```

**FlightBooking** - Flight-specific details
```prisma
model FlightBooking {
  id                 Int
  bookingId          Int      @unique
  flightId           Int
  flightNumber       String
  airline            String
  origin             String
  destination        String
  departureTime      DateTime
  arrivalTime        DateTime
  numberOfPassengers Int
  cabinClass         String
  pnr                String?
}
```

## API Endpoints

### Booking Creation

**Create Hotel Booking**
```http
POST /api/v1/bookings/hotels
Authorization: Bearer <token>
Content-Type: application/json

{
  "hotelId": 1,
  "checkInDate": "2025-01-15T14:00:00Z",
  "checkOutDate": "2025-01-17T11:00:00Z",
  "roomType": "Deluxe Room",
  "numberOfRooms": 1,
  "numberOfGuests": 2,
  "guests": [
    {"name": "John Doe", "age": 30, "type": "ADULT"},
    {"name": "Jane Doe", "age": 28, "type": "ADULT"}
  ],
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "9876543210",
  "basePrice": 5000,
  "discountAmount": 500,
  "mealsIncluded": true,
  "mealPlan": "CP",
  "specialRequests": "Late check-in required"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hotel booking created successfully",
  "data": {
    "id": 1,
    "bookingNumber": "TNE-HOTEL-12345678ABCD",
    "userId": 1,
    "type": "HOTEL",
    "status": "PENDING",
    "totalAmount": 4900,
    "hotelBooking": {
      "roomType": "Deluxe Room",
      "numberOfNights": 2
    }
  }
}
```

**Create Flight Booking**
```http
POST /api/v1/bookings/flights
Authorization: Bearer <token>
Content-Type: application/json

{
  "flightId": 1,
  "flightNumber": "AI202",
  "airline": "Air India",
  "origin": "Mumbai",
  "destination": "Delhi",
  "departureTime": "2025-01-15T06:00:00Z",
  "arrivalTime": "2025-01-15T08:30:00Z",
  "passengers": [
    {
      "name": "John Doe",
      "age": 30,
      "type": "ADULT",
      "passportNumber": "A12345678",
      "nationality": "Indian"
    }
  ],
  "adultCount": 1,
  "childCount": 0,
  "infantCount": 0,
  "cabinClass": "ECONOMY",
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "9876543210",
  "basePrice": 3000,
  "discountAmount": 0
}
```

### Booking Retrieval

**Get User Bookings**
```http
GET /api/v1/bookings?page=1&limit=20&status=CONFIRMED&type=HOTEL
Authorization: Bearer <token>
```

**Get Booking by ID**
```http
GET /api/v1/bookings/123
Authorization: Bearer <token>
```

**Get Booking by Number**
```http
GET /api/v1/bookings/number/TNE-HOTEL-12345678ABCD
Authorization: Bearer <token>
```

### Payment Workflow

**1. Initiate Payment**
```http
POST /api/v1/bookings/123/payment
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": 123,
    "bookingNumber": "TNE-HOTEL-12345678ABCD",
    "paymentId": 456,
    "razorpayOrderId": "order_abc123",
    "amount": 4900,
    "currency": "INR"
  }
}
```

**2. Confirm Booking (after payment)**
```http
POST /api/v1/bookings/123/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpayPaymentId": "pay_xyz789",
  "razorpaySignature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "bookingNumber": "TNE-HOTEL-12345678ABCD",
    "status": "CONFIRMED",
    "confirmationCode": "ABC123XYZ",
    "confirmedAt": "2025-01-10T10:30:00Z"
  }
}
```

### Cancellation

**Cancel Booking**
```http
POST /api/v1/bookings/123/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancellationReason": "Change of travel plans due to emergency"
}
```

### Admin Endpoints

**Get All Bookings**
```http
GET /api/v1/bookings/admin/all?page=1&limit=20&status=CONFIRMED&search=john
Authorization: Bearer <admin-token>
```

**Update Booking Status**
```http
PUT /api/v1/bookings/123/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

## Setup & Installation

### Prerequisites
- Node.js >= 20
- PostgreSQL >= 15
- Shared utilities package installed
- Payment service running

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:deploy

# Start service
npm start

# Development mode with hot reload
npm run dev
```

### Environment Variables

```env
NODE_ENV=production
PORT=3004
DATABASE_URL=postgresql://user:password@localhost:5432/tne_website
JWT_SECRET=your-jwt-secret-must-match-auth-service
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info

# Service URLs
PAYMENT_SERVICE_URL=http://payment-service:3005
CATALOG_SERVICE_URL=http://catalog-service:4001
NOTIFICATION_SERVICE_URL=http://notification-service:3007
```

## Docker Deployment

### Build Image
```bash
# From backend/ directory
docker build -f booking-service/Dockerfile -t tne-booking-service .
```

### Run Container
```bash
docker run -d \
  --name tne-booking \
  -p 3004:3004 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  -e PAYMENT_SERVICE_URL=http://payment-service:3005 \
  tne-booking-service
```

### Health Check
```bash
curl http://localhost:3004/health
```

## Booking Workflow

### Complete Booking Flow

1. **User Creates Booking**
   ```
   POST /api/v1/bookings/hotels
   Status: PENDING
   ```

2. **User Initiates Payment**
   ```
   POST /api/v1/bookings/:id/payment
   → Calls Payment Service
   → Creates Razorpay order
   Status: PAYMENT_PENDING
   ```

3. **User Completes Payment** (Razorpay checkout)
   ```
   → Razorpay handles payment UI
   → Payment captured
   ```

4. **Confirm Booking**
   ```
   POST /api/v1/bookings/:id/confirm
   → Verify payment with Payment Service
   → Generate confirmation code
   Status: CONFIRMED
   ```

5. **After Travel**
   ```
   Admin: PUT /api/v1/bookings/:id/status
   Status: COMPLETED
   ```

### Cancellation Flow

1. **User Cancels Booking**
   ```
   POST /api/v1/bookings/:id/cancel
   Status: CANCELLED
   ```

2. **If Payment Made**
   ```
   → Automatically initiates refund
   → Calls Payment Service refund API
   RefundStatus: PENDING
   ```

3. **Refund Processed** (via webhook)
   ```
   RefundStatus: COMPLETED
   Status: REFUNDED
   ```

## Integration with Other Services

### Payment Service Integration

The booking service integrates tightly with the payment service:

```javascript
// Initiate payment
const paymentData = await axios.post(
  `${PAYMENT_SERVICE_URL}/api/v1/payments/orders`,
  {
    bookingId: booking.id,
    amount: booking.totalAmount,
    currency: 'INR',
    notes: { booking_number: booking.bookingNumber }
  }
);

// Update booking with payment ID
await prisma.booking.update({
  where: { id: bookingId },
  data: {
    paymentId: paymentData.payment.id,
    status: 'PAYMENT_PENDING'
  }
});
```

### Catalog Service Integration

Booking service references catalog items:
- `hotelId` → Catalog Service hotels
- `flightId` → Catalog Service flights
- `busId` → Catalog Service buses
- `eventId` → Catalog Service events

### Notification Service Integration

Trigger notifications on booking events:
- Booking confirmation → Send confirmation email
- Booking cancellation → Send cancellation email
- Payment reminder → Send reminder SMS

## Business Rules

### Tax Calculation
- **GST:** 18% on base price
- **Formula:** `totalAmount = basePrice + (basePrice * 0.18) - discountAmount`

### Booking Status Transitions
```
PENDING
  → PAYMENT_PENDING (payment initiated)
  → PAYMENT_FAILED (payment failed)
  → CONFIRMED (payment successful)
  → CANCELLED (user cancelled)
  → COMPLETED (after travel/event)
  → REFUNDED (refund processed)
```

### Cancellation Rules
- Can cancel: PENDING, PAYMENT_PENDING, CONFIRMED
- Cannot cancel: COMPLETED, CANCELLED, REFUNDED
- Refund initiated automatically if payment was made

## Security Features

- ✅ JWT authentication for all protected routes
- ✅ Role-based access control (USER/ADMIN)
- ✅ Request validation with Zod schemas
- ✅ Rate limiting to prevent abuse
- ✅ Ownership verification (users can only access own bookings)
- ✅ SQL injection prevention via Prisma ORM
- ✅ Helmet security headers
- ✅ CORS protection

## Error Handling

All errors follow standardized format:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

Common error scenarios:
- Booking not found (404)
- Unauthorized access (403)
- Invalid booking status for operation (400)
- Payment service unavailable (503)

## Testing

### Manual Testing
```bash
# Test hotel booking creation
curl -X POST http://localhost:3004/api/v1/bookings/hotels \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...booking_data}'

# Test payment initiation
curl -X POST http://localhost:3004/api/v1/bookings/1/payment \
  -H "Authorization: Bearer <token>"

# Test booking retrieval
curl http://localhost:3004/api/v1/bookings \
  -H "Authorization: Bearer <token>"
```

## Production Checklist

- [ ] Set strong JWT_SECRET (match auth-service)
- [ ] Configure DATABASE_URL for production database
- [ ] Set correct PAYMENT_SERVICE_URL
- [ ] Enable HTTPS
- [ ] Set appropriate CORS_ORIGIN
- [ ] Configure rate limiting
- [ ] Setup log aggregation
- [ ] Enable monitoring and health checks
- [ ] Run database migrations
- [ ] Test complete booking flow end-to-end
- [ ] Test payment integration
- [ ] Test cancellation and refunds
- [ ] Configure notification service URLs

## Status

**Version:** 2.0.0
**Status:** ✅ Production Ready (Refactored)
**Last Updated:** December 20, 2025

### Features Complete:
- ✅ Complete refactor with Prisma ORM
- ✅ Payment service integration
- ✅ Hotel and flight bookings
- ✅ Booking workflow management
- ✅ Cancellation and refunds
- ✅ Admin capabilities
- ✅ Comprehensive validation
- ✅ Docker support
- ✅ Health checks
- ✅ Graceful shutdown
- ✅ Production logging

### Improvements from v1.0:
- Migrated from raw SQL to Prisma ORM
- Added payment service integration
- Implemented proper booking workflow
- Added support for multiple booking types
- Enhanced error handling
- Added comprehensive validation
- Improved security
- Better code organization (service/controller/route pattern)

## Support

For issues or questions:
1. Check the logs: `docker logs tne-booking`
2. Verify database connection
3. Ensure JWT_SECRET matches auth-service
4. Check payment service connectivity
5. Review health endpoint: `/health`

---

**Built with precision. Ready for production.** 🚀
