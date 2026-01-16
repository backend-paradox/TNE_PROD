# Booking Service - API Endpoints Reference

Base URL: `http://localhost:3004`

---

## Health Check

### GET /api/v1/health
Health check endpoint.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "booking-service"
}
```

---

## Hotel Booking

### POST /api/v1/bookings/hotels
Create a hotel booking.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |
| `Content-Type` | Yes | `application/json` |

**Request Body:**
```json
{
  "hotelId": 123,
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "9876543210",
  "checkInDate": "2025-03-01",
  "checkOutDate": "2025-03-05",
  "roomType": "Deluxe",
  "numberOfRooms": 1,
  "numberOfGuests": 2,
  "guests": [
    { "name": "John Doe", "age": 30, "type": "ADULT" },
    { "name": "Jane Doe", "age": 28, "type": "ADULT" }
  ],
  "basePrice": 15000,
  "discountAmount": 1000,
  "mealsIncluded": true,
  "mealPlan": "MAP",
  "specialRequests": "Late check-in requested"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Hotel booking created successfully",
  "data": {
    "id": 1,
    "bookingNumber": "TNE-HOTEL-12345678ABCD",
    "type": "HOTEL",
    "status": "PENDING",
    "totalAmount": 16520,
    "hotelBooking": {
      "roomType": "Deluxe",
      "numberOfRooms": 1,
      "numberOfNights": 4
    }
  }
}
```

---

## Flight Booking

### POST /api/v1/bookings/flights
Create a flight booking.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |
| `Content-Type` | Yes | `application/json` |

**Request Body:**
```json
{
  "flightId": 456,
  "flightNumber": "AI302",
  "airline": "Air India",
  "origin": "Mumbai",
  "destination": "Delhi",
  "departureTime": "2025-03-01T10:00:00Z",
  "arrivalTime": "2025-03-01T12:00:00Z",
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "9876543210",
  "passengers": [
    { "name": "John Doe", "age": 30, "type": "ADULT" }
  ],
  "adultCount": 1,
  "childCount": 0,
  "infantCount": 0,
  "cabinClass": "ECONOMY",
  "basePrice": 5000,
  "specialRequests": "Window seat preferred"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Flight booking created successfully",
  "data": {
    "id": 2,
    "bookingNumber": "TNE-FLIGHT-12345678ABCD",
    "type": "FLIGHT",
    "status": "PENDING",
    "totalAmount": 5900,
    "flightBooking": {
      "flightNumber": "AI302",
      "airline": "Air India",
      "cabinClass": "ECONOMY"
    }
  }
}
```

---

## Package Booking

### POST /api/v1/bookings/packages
Create a package booking.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |
| `Content-Type` | Yes | `application/json` |

**Request Body:**
```json
{
  "packageId": 789,
  "packageName": "Goa Beach Paradise",
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "9876543210",
  "travelDate": "2025-03-01",
  "returnDate": "2025-03-05",
  "travellers": [
    { "name": "John Doe", "age": 30, "type": "ADULT" },
    { "name": "Jane Doe", "age": 28, "type": "ADULT" }
  ],
  "adultCount": 2,
  "childCount": 0,
  "infantCount": 0,
  "basePrice": 25000,
  "discountAmount": 2000,
  "destination": "Goa, India",
  "duration": "5 Days / 4 Nights",
  "inclusions": ["Flights", "Hotels", "Sightseeing", "Meals"],
  "specialRequests": "Honeymoon couple - special arrangements"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Package booking created successfully",
  "data": {
    "id": 3,
    "bookingNumber": "TNE-PACKAGE-12345678ABCD",
    "type": "PACKAGE",
    "status": "PENDING",
    "totalAmount": 27140,
    "packageDetails": {
      "packageId": 789,
      "packageName": "Goa Beach Paradise",
      "destination": "Goa, India",
      "duration": "5 Days / 4 Nights",
      "totalTravellers": 2
    }
  }
}
```

---

## Get Bookings

### GET /api/v1/bookings
Get user's bookings.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | string | - | Filter by status (PENDING, CONFIRMED, etc.) |
| `type` | string | - | Filter by type (HOTEL, FLIGHT, PACKAGE, etc.) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "bookings": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### GET /api/v1/bookings/:id
Get booking by ID.

---

### GET /api/v1/bookings/number/:bookingNumber
Get booking by booking number.

---

## Booking Voucher

### GET /api/v1/bookings/:id/voucher
Get booking voucher/ticket for confirmed bookings.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Voucher generated successfully",
  "data": {
    "voucherId": "VCH-TNE-HOTEL-12345678ABCD",
    "bookingNumber": "TNE-HOTEL-12345678ABCD",
    "confirmationCode": "ABC123XYZ",
    "type": "HOTEL",
    "status": "CONFIRMED",
    "contact": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    },
    "pricing": {
      "basePrice": 15000,
      "taxAmount": 2520,
      "discountAmount": 1000,
      "totalAmount": 16520,
      "currency": "INR"
    },
    "hotelDetails": { ... },
    "generatedAt": "2025-12-22T10:00:00.000Z"
  }
}
```

---

## Payment & Confirmation

### POST /api/v1/bookings/:id/payment
Initiate payment for booking.

### POST /api/v1/bookings/:id/confirm
Confirm booking after successful payment.

### POST /api/v1/bookings/:id/cancel
Cancel a booking.

---

## Admin Routes

### GET /api/v1/bookings/admin/all
Get all bookings (Admin only).

### PUT /api/v1/bookings/:id/status
Update booking status (Admin only).

---

## Enums Reference

### BookingType
`HOTEL`, `FLIGHT`, `BUS`, `EVENT`, `PACKAGE`

### BookingStatus
`PENDING`, `PAYMENT_PENDING`, `PAYMENT_FAILED`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `REFUNDED`

---

*Last Updated: December 22, 2025*
