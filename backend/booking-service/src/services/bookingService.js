const prisma = require('../config/prisma');
const axios = require('axios');

class BookingService {
  /**
   * Generate unique booking number
   */
  generateBookingNumber(type) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TNE-${type.toUpperCase()}-${timestamp}${random}`;
  }

  /**
   * Generate confirmation code
   */
  generateConfirmationCode() {
    return Math.random().toString(36).substring(2, 11).toUpperCase();
  }

  /**
   * Calculate tax (18% GST)
   */
  calculateTax(basePrice) {
    return parseFloat((basePrice * 0.18).toFixed(2));
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    const {
      userId,
      type,
      itemId, // hotelId, flightId, eventId, etc.
      contactName,
      contactEmail,
      contactPhone,
      basePrice,
      discountAmount = 0,
      ...additionalData
    } = bookingData;

    // Calculate pricing
    const taxAmount = this.calculateTax(basePrice);
    const totalAmount = parseFloat((basePrice + taxAmount - discountAmount).toFixed(2));

    // Generate booking number
    const bookingNumber = this.generateBookingNumber(type);

    // Map itemId to correct field based on type
    const typeFieldMap = {
      HOTEL: 'hotelId',
      FLIGHT: 'flightId',
      BUS: 'busId',
      EVENT: 'eventId',
      PACKAGE: 'packageId',
    };

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        userId,
        type,
        [typeFieldMap[type]]: itemId,
        contactName,
        contactEmail,
        contactPhone,
        basePrice,
        taxAmount,
        discountAmount,
        totalAmount,
        currency: 'INR',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        ...additionalData,
      },
    });

    return booking;
  }

  /**
   * Create hotel booking with details
   */
  async createHotelBooking(bookingData) {
    const {
      userId,
      hotelId,
      contactName,
      contactEmail,
      contactPhone,
      checkInDate,
      checkOutDate,
      roomType,
      numberOfRooms,
      numberOfGuests,
      guests,
      basePrice,
      discountAmount,
      mealsIncluded,
      mealPlan,
      specialRequests,
    } = bookingData;

    // Calculate number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Create booking with hotel details
    const booking = await this.createBooking({
      userId,
      type: 'HOTEL',
      itemId: hotelId,
      contactName,
      contactEmail,
      contactPhone,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      basePrice,
      discountAmount,
      guests,
      specialRequests,
    });

    // Create hotel-specific details
    const hotelBooking = await prisma.hotelBooking.create({
      data: {
        bookingId: booking.id,
        hotelId,
        roomType,
        numberOfRooms,
        numberOfGuests,
        numberOfNights,
        mealsIncluded: mealsIncluded || false,
        mealPlan,
      },
    });

    return {
      ...booking,
      hotelBooking,
    };
  }

  /**
   * Create flight booking with details
   */
  async createFlightBooking(bookingData) {
    const {
      userId,
      flightId,
      flightNumber,
      airline,
      origin,
      destination,
      departureTime,
      arrivalTime,
      contactName,
      contactEmail,
      contactPhone,
      passengers,
      adultCount,
      childCount,
      infantCount,
      cabinClass,
      basePrice,
      discountAmount,
      specialRequests,
    } = bookingData;

    const numberOfPassengers = adultCount + childCount + infantCount;

    // Create booking
    const booking = await this.createBooking({
      userId,
      type: 'FLIGHT',
      itemId: flightId,
      contactName,
      contactEmail,
      contactPhone,
      travelDate: new Date(departureTime),
      basePrice,
      discountAmount,
      passengers,
      specialRequests,
    });

    // Create flight-specific details
    const flightBooking = await prisma.flightBooking.create({
      data: {
        bookingId: booking.id,
        flightId,
        flightNumber,
        airline,
        origin,
        destination,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        numberOfPassengers,
        adultCount,
        childCount,
        infantCount,
        cabinClass,
        baggageAllowance: '15 KG',
      },
    });

    return {
      ...booking,
      flightBooking,
    };
  }

  /**
   * Get booking by ID with all relations
   */
  async getBookingById(bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        hotelBooking: true,
        flightBooking: true,
        reviews: true,
      },
    });

    return booking;
  }

  /**
   * Get booking by booking number
   */
  async getBookingByNumber(bookingNumber) {
    const booking = await prisma.booking.findUnique({
      where: { bookingNumber },
      include: {
        hotelBooking: true,
        flightBooking: true,
        reviews: true,
      },
    });

    return booking;
  }

  /**
   * Get user bookings
   */
  async getUserBookings(userId, { page = 1, limit = 20, status, type }) {
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status && { status }),
      ...(type && { type }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          hotelBooking: true,
          flightBooking: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Initiate payment for booking
   */
  async initiatePayment(bookingId) {
    const booking = await this.getBookingById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new Error('Booking is not in PENDING status');
    }

    // Call payment service to create order
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005';

    try {
      const response = await axios.post(
        `${paymentServiceUrl}/api/v1/payments/orders`,
        {
          bookingId: booking.id,
          userId: booking.userId,
          amount: parseFloat(booking.totalAmount),
          currency: booking.currency,
          notes: {
            booking_number: booking.bookingNumber,
            booking_type: booking.type,
            user_id: booking.userId,
          },
          receipt: `booking_${booking.id}_${Date.now()}`,
        },
        {
          timeout: 10000,
          headers: {
            'X-Internal-Service': 'booking-service',
          },
        }
      );

      const responseData = response.data?.data || {};
      const payment = responseData.payment || {};
      const razorpayOrder = responseData.razorpayOrder || {};
      const paymentId = payment.id || responseData.paymentId;
      const razorpayOrderId = razorpayOrder.id || responseData.razorpayOrderId;

      if (!paymentId) {
        throw new Error('Payment service did not return payment ID');
      }

      // Update booking with payment ID
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentId: paymentId,
          status: 'PAYMENT_PENDING',
          paymentStatus: 'PENDING',
        },
      });

      return {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        paymentId: paymentId,
        razorpayOrderId: razorpayOrderId,
        amount: booking.totalAmount,
        amountInPaise: razorpayOrder.amount || responseData.razorpayOrderAmount || Math.round(parseFloat(booking.totalAmount) * 100),
        currency: booking.currency,
        razorpayKeyId: responseData.razorpayKeyId,
      };
    } catch (error) {
      console.error('Payment initiation failed:', error.message);
      throw new Error('Failed to initiate payment: ' + error.message);
    }
  }

  /**
   * Confirm booking after successful payment
   * IDEMPOTENT: Can be called multiple times safely
   */
  async confirmBooking(bookingId, paymentDetails) {
    const booking = await this.getBookingById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Idempotency: If already confirmed, return existing booking
    if (booking.status === 'CONFIRMED' && booking.paymentStatus === 'COMPLETED') {
      console.log(`Booking ${bookingId} already confirmed, skipping`);
      return booking;
    }

    // Only allow confirmation from PAYMENT_PENDING status
    if (booking.status !== 'PAYMENT_PENDING' && booking.status !== 'PENDING') {
      throw new Error(`Cannot confirm booking with status: ${booking.status}`);
    }

    const confirmationCode = this.generateConfirmationCode();

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        confirmedAt: new Date(),
        confirmationCode,
      },
      include: {
        hotelBooking: true,
        flightBooking: true,
      },
    });

    // TODO: Send confirmation email (skip for now as per requirements)
    // TODO: Generate ticket/voucher (already implemented via generateVoucher)

    console.log(`Booking ${bookingId} confirmed successfully with code ${confirmationCode}`);

    return updatedBooking;
  }

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(bookingId, reason) {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'PAYMENT_FAILED',
        paymentStatus: 'FAILED',
        notes: reason,
      },
    });

    return booking;
  }

  /**
   * Handle refund success from payment service
   */
  async handleRefundSuccess(bookingId, refundData) {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        refundStatus: 'COMPLETED',
        refundAmount: refundData.amount,
        refundedAt: new Date(),
      },
    });

    console.log(`Booking ${bookingId} refunded successfully with amount ${refundData.amount}`);

    return booking;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId, cancellationReason) {
    const booking = await this.getBookingById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized to cancel this booking');
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      throw new Error(`Cannot cancel booking with status: ${booking.status}`);
    }

    // Update booking
    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason,
      },
    });

    // If payment was made, initiate refund
    if (booking.paymentStatus === 'COMPLETED' && booking.paymentId) {
      // TODO: Call payment service to initiate refund
      // For now, mark as pending refund
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          refundStatus: 'PENDING',
          refundAmount: booking.totalAmount,
        },
      });
    }

    return cancelledBooking;
  }

  /**
   * Get all bookings (admin)
   */
  async getAllBookings({ page = 1, limit = 20, status, type, search }) {
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { bookingNumber: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } },
          { contactPhone: { contains: search } },
        ],
      }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          hotelBooking: true,
          flightBooking: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update booking status (admin)
   */
  async updateBookingStatus(bookingId, status) {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return booking;
  }

  /**
   * Create package booking
   */
  async createPackageBooking(bookingData) {
    const {
      userId,
      packageId,
      packageName,
      contactName,
      contactEmail,
      contactPhone,
      travelDate,
      returnDate,
      travellers,
      adultCount = 0,
      childCount = 0,
      infantCount = 0,
      basePrice,
      discountAmount = 0,
      specialRequests,
      destination,
      duration,
      inclusions,
    } = bookingData;

    const totalTravellers = adultCount + childCount + infantCount;

    // Server-side price validation
    try {
      const packageServiceUrl = process.env.PACKAGE_SERVICE_URL || 'http://localhost:3012';
      const response = await axios.get(
        `${packageServiceUrl}/api/v1/tour-packages/by-id/${packageId}`
      );
      const packageData = response.data.data;

      if (!packageData) {
        throw new Error('Package not found');
      }

      // Calculate expected price based on package pricing
      // Note: Currently using startingPrice as per-person rate
      // This should be enhanced based on actual pricing model
      const expectedPrice = packageData.startingPrice * totalTravellers;

      // Allow 1% variance for rounding differences
      const priceVariance = Math.abs(expectedPrice - basePrice);
      const maxAllowedVariance = expectedPrice * 0.01;

      if (priceVariance > maxAllowedVariance) {
        throw new Error(
          `Price mismatch detected. Expected: ₹${expectedPrice.toFixed(2)}, Received: ₹${basePrice}. ` +
          `Please refresh the package details and try again.`
        );
      }
    } catch (error) {
      if (error.message.includes('Price mismatch') || error.message.includes('Package not found')) {
        throw error;
      }
      console.warn('Price validation failed, proceeding with caution:', error.message);
      // Continue with booking if service is unavailable but log the warning
    }

    // Create booking
    const booking = await this.createBooking({
      userId,
      type: 'PACKAGE',
      itemId: packageId,
      contactName,
      contactEmail,
      contactPhone,
      travelDate: new Date(travelDate),
      returnDate: returnDate ? new Date(returnDate) : null,
      basePrice,
      discountAmount,
      guests: travellers,
      specialRequests,
    });

    // Store package details in notes as JSON
    const packageDetails = {
      packageId,
      packageName,
      destination,
      duration,
      adultCount,
      childCount,
      infantCount,
      totalTravellers,
      inclusions,
    };

    // Update booking with package details
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        notes: JSON.stringify(packageDetails),
      },
    });

    return {
      ...updatedBooking,
      packageDetails,
    };
  }

  /**
   * Generate booking voucher data
   */
  async generateVoucher(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        hotelBooking: true,
        flightBooking: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized access to booking');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error('Voucher is only available for confirmed bookings');
    }

    // Build voucher data
    const voucher = {
      voucherId: `VCH-${booking.bookingNumber}`,
      bookingNumber: booking.bookingNumber,
      confirmationCode: booking.confirmationCode,
      type: booking.type,
      status: booking.status,

      // Contact Information
      contact: {
        name: booking.contactName,
        email: booking.contactEmail,
        phone: booking.contactPhone,
      },

      // Pricing
      pricing: {
        basePrice: parseFloat(booking.basePrice),
        taxAmount: parseFloat(booking.taxAmount),
        discountAmount: parseFloat(booking.discountAmount),
        totalAmount: parseFloat(booking.totalAmount),
        currency: booking.currency,
      },

      // Booking dates
      bookingDate: booking.bookingDate,
      confirmedAt: booking.confirmedAt,

      // Traveller/Guest information
      guests: booking.guests,
      passengers: booking.passengers,
      attendees: booking.attendees,

      // Special requests
      specialRequests: booking.specialRequests,

      // Generated timestamp
      generatedAt: new Date().toISOString(),
    };

    // Add type-specific details
    if (booking.type === 'HOTEL' && booking.hotelBooking) {
      voucher.hotelDetails = {
        hotelId: booking.hotelBooking.hotelId,
        checkIn: booking.checkInDate,
        checkOut: booking.checkOutDate,
        roomType: booking.hotelBooking.roomType,
        numberOfRooms: booking.hotelBooking.numberOfRooms,
        numberOfGuests: booking.hotelBooking.numberOfGuests,
        numberOfNights: booking.hotelBooking.numberOfNights,
        mealsIncluded: booking.hotelBooking.mealsIncluded,
        mealPlan: booking.hotelBooking.mealPlan,
      };
    }

    if (booking.type === 'FLIGHT' && booking.flightBooking) {
      voucher.flightDetails = {
        flightNumber: booking.flightBooking.flightNumber,
        airline: booking.flightBooking.airline,
        origin: booking.flightBooking.origin,
        destination: booking.flightBooking.destination,
        departureTime: booking.flightBooking.departureTime,
        arrivalTime: booking.flightBooking.arrivalTime,
        cabinClass: booking.flightBooking.cabinClass,
        pnr: booking.flightBooking.pnr,
        numberOfPassengers: booking.flightBooking.numberOfPassengers,
        baggageAllowance: booking.flightBooking.baggageAllowance,
      };
    }

    if (booking.type === 'PACKAGE' && booking.notes) {
      try {
        voucher.packageDetails = JSON.parse(booking.notes);
        voucher.travelDates = {
          departure: booking.travelDate,
          return: booking.returnDate,
        };
      } catch (e) {
        voucher.packageDetails = { rawNotes: booking.notes };
      }
    }

    return voucher;
  }

  /**
   * Generate itinerary PDF for booking
   */
  async generateItineraryPDF(bookingId) {
    // Get booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        travelers: true,
        payments: true,
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Fetch package data if it's a package booking
    let packageData = null;
    if (booking.type === 'PACKAGE' && booking.packageId) {
      try {
        // Try to fetch from package service (if available)
        const packageServiceUrl = process.env.PACKAGE_SERVICE_URL || 'http://localhost:3012';
        const response = await axios.get(
          `${packageServiceUrl}/api/v1/tour-packages/by-id/${booking.packageId}`
        );
        packageData = response.data.data;
      } catch (error) {
        console.warn('Failed to fetch package data from package service:', error.message);

        // Fallback: try to parse from booking notes if available
        if (booking.notes) {
          try {
            packageData = JSON.parse(booking.notes);
          } catch (e) {
            console.warn('Could not parse package data from booking notes');
          }
        }
      }
    }

    // Fetch user data (optional)
    let userData = null;
    if (booking.userId) {
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
        const response = await axios.get(
          `${userServiceUrl}/api/v1/users/${booking.userId}`,
          {
            headers: {
              'X-Service-Secret': process.env.SERVICE_SECRET || 'service-secret'
            }
          }
        );
        userData = response.data.data;
      } catch (error) {
        console.warn('Failed to fetch user data:', error.message);
      }
    }

    // Generate PDF using PDFGenerator
    const PDFGenerator = require('./pdf/pdfGenerator');
    const pdfGenerator = new PDFGenerator();

    const pdfBuffer = await pdfGenerator.generateItinerary({
      booking,
      package: packageData,
      user: userData
    });

    return pdfBuffer;
  }
}

module.exports = new BookingService();
