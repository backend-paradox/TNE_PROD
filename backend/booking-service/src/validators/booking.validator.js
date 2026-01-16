const { z } = require('zod');

// Guest schema for hotels
const guestSchema = z.object({
  name: z.string().min(2).max(120),
  age: z.number().int().min(0).max(120),
  type: z.enum(['ADULT', 'CHILD']),
});

// Passenger schema for flights
const passengerSchema = z.object({
  name: z.string().min(2).max(120),
  age: z.number().int().min(0).max(120),
  type: z.enum(['ADULT', 'CHILD', 'INFANT']),
  passportNumber: z.string().optional(),
  nationality: z.string().optional(),
});

// Traveler schema for packages
const travelerSchema = z.object({
  name: z.string().min(2).max(120),
  age: z.number().int().min(0).max(120),
  type: z.enum(['ADULT', 'CHILD', 'INFANT']),
});

// Hotel booking creation
const createHotelBookingSchema = z.object({
  body: z.object({
    hotelId: z.number().int().positive(),
    checkInDate: z.string().datetime(),
    checkOutDate: z.string().datetime(),
    roomType: z.string().min(1).max(100),
    numberOfRooms: z.number().int().min(1).max(10),
    numberOfGuests: z.number().int().min(1).max(20),
    guests: z.array(guestSchema).min(1),
    contactName: z.string().min(2).max(120),
    contactEmail: z.string().email(),
    contactPhone: z.string().regex(/^[6-9]\d{9}$/),
    basePrice: z.number().positive(),
    discountAmount: z.number().min(0).default(0),
    mealsIncluded: z.boolean().default(false),
    mealPlan: z.enum(['EP', 'CP', 'MAP', 'AP']).optional(),
    specialRequests: z.string().max(1000).optional(),
  }),
});

// Flight booking creation
const createFlightBookingSchema = z.object({
  body: z.object({
    flightId: z.number().int().positive(),
    flightNumber: z.string().min(1).max(20),
    airline: z.string().min(1).max(100),
    origin: z.string().min(1).max(100),
    destination: z.string().min(1).max(100),
    departureTime: z.string().datetime(),
    arrivalTime: z.string().datetime(),
    passengers: z.array(passengerSchema).min(1).max(9),
    adultCount: z.number().int().min(1).max(9),
    childCount: z.number().int().min(0).max(9),
    infantCount: z.number().int().min(0).max(9),
    cabinClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
    contactName: z.string().min(2).max(120),
    contactEmail: z.string().email(),
    contactPhone: z.string().regex(/^[6-9]\d{9}$/),
    basePrice: z.number().positive(),
    discountAmount: z.number().min(0).default(0),
    specialRequests: z.string().max(1000).optional(),
  }),
});

// Package booking creation
const createPackageBookingSchema = z.object({
  body: z.object({
    packageId: z.string().min(1),
    packageName: z.string().min(1).max(200),
    contactName: z.string().min(2).max(120),
    contactEmail: z.string().email(),
    contactPhone: z.string().regex(/^[6-9]\d{9}$/),
    travelDate: z.string().datetime(),
    returnDate: z.string().datetime().optional(),
    travellers: z.array(travelerSchema).optional(),
    adultCount: z.number().int().min(0).optional(),
    childCount: z.number().int().min(0).optional(),
    infantCount: z.number().int().min(0).optional(),
    basePrice: z.number().positive(),
    discountAmount: z.number().min(0).default(0),
    destination: z.string().max(200).optional(),
    duration: z.string().max(100).optional(),
    inclusions: z.array(z.string().max(200)).optional(),
    specialRequests: z.string().max(1000).optional(),
  }),
});

// Booking cancellation
const cancelBookingSchema = z.object({
  body: z.object({
    cancellationReason: z.string().min(10).max(1000),
  }),
});

// Update booking status (admin)
const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'PENDING',
      'PAYMENT_PENDING',
      'PAYMENT_FAILED',
      'CONFIRMED',
      'CANCELLED',
      'COMPLETED',
      'REFUNDED',
    ]),
  }),
});

// Pagination and filters
const getBookingsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z
      .enum([
        'PENDING',
        'PAYMENT_PENDING',
        'PAYMENT_FAILED',
        'CONFIRMED',
        'CANCELLED',
        'COMPLETED',
        'REFUNDED',
      ])
      .optional(),
    type: z.enum(['HOTEL', 'FLIGHT', 'BUS', 'EVENT', 'PACKAGE']).optional(),
    search: z.string().optional(),
  }),
});

// Quote request (preserved from original)
const createQuoteSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    message: z.string().max(2000).optional(),
  }),
});

module.exports = {
  createHotelBookingSchema,
  createFlightBookingSchema,
  createPackageBookingSchema,
  cancelBookingSchema,
  updateBookingStatusSchema,
  getBookingsSchema,
  createQuoteSchema,
};
