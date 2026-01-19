import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Booking, BookingContact, BookingPricing, Traveler, Trip } from '../../types';
import { getUserBookingsAPI, createPackageBookingAPI, confirmBookingAPI } from '../../features/booking/bookingAPI';
import type { RootState } from '../index';

// Booking creation payload for API
interface CreateBookingPayload {
  packageId: string;
  packageName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  travelDate: string;
  returnDate?: string;
  travellers: Traveler[];
  adultCount: number;
  childCount: number;
  infantCount: number;
  basePrice: number;
  discountAmount: number;
  specialRequests: string;
  destination: string;
  duration: string;
  inclusions: string[];
}

interface BookingState {
  currentBooking: {
    trip: Trip | null;
    travelDate: string;
    travelers: { adults: number; children: number; infants: number };
    travelerDetails: Traveler[];
    contact: BookingContact | null;
    pricing: BookingPricing | null;
    specialRequests: string;
    promoCode: string;
    step: number;
    pendingBookingId: number | null; // Store the booking ID after creation
  };
  bookingHistory: Booking[];
  isCreatingBooking: boolean;
  isConfirmingBooking: boolean;
}

const createInitialBooking = (): BookingState['currentBooking'] => ({
  trip: null,
  travelDate: '',
  travelers: { adults: 1, children: 0, infants: 0 },
  travelerDetails: [],
  contact: null,
  pricing: null,
  specialRequests: '',
  promoCode: '',
  step: 1,
  pendingBookingId: null,
});

const calculatePricingForBooking = (booking: BookingState['currentBooking']): BookingPricing | null => {
  const { trip, travelers, promoCode } = booking;
  if (!trip) return null;

  const perHeadPrice = trip.price.adult;
  const adultTotal = travelers.adults * perHeadPrice;
  const childTotal = travelers.children * perHeadPrice;
  const infantTotal = travelers.infants * perHeadPrice;
  const subtotal = adultTotal + childTotal + infantTotal;
  const taxes = Math.round(subtotal * 0.18);
  const serviceFee = 999;
  let discount = 0;

  // Promo code logic
  if (promoCode === 'WELCOME10') discount = Math.round(subtotal * 0.1);
  else if (promoCode === 'SUMMER20') discount = Math.round(subtotal * 0.2);
  else if (promoCode === 'NEW500') discount = 500;

  const total = subtotal + taxes + serviceFee - discount;
  return {
    basePrice: perHeadPrice,
    adultTotal,
    childTotal,
    infantTotal,
    subtotal,
    taxes,
    serviceFee,
    discount,
    promoCode: promoCode || undefined,
    total,
  };
};

const getDefaultTravelDate = (trip: Trip): string => {
  if (trip.startDates && trip.startDates.length > 0) {
    return trip.startDates[0];
  }
  return new Date().toISOString().slice(0, 10);
};

const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
};

const toBackendTraveller = (traveler: Traveler) => {
  const typeMap: Record<Traveler['type'], 'ADULT' | 'CHILD' | 'INFANT'> = {
    adult: 'ADULT',
    child: 'CHILD',
    infant: 'INFANT',
  };

  return {
    name: `${traveler.firstName} ${traveler.lastName}`.trim() || 'Traveller',
    age: calculateAge(traveler.dateOfBirth),
    type: typeMap[traveler.type] || 'ADULT',
  };
};

const initialState: BookingState = {
  currentBooking: createInitialBooking(),
  bookingHistory: [],
  isCreatingBooking: false,
  isConfirmingBooking: false,
};

// Create booking in database (status: PENDING)
export const createBooking = createAsyncThunk<any, void, { state: RootState }>(
  'booking/createBooking',
  async (_, { getState }) => {
    const { currentBooking } = getState().booking;
    const { trip, travelDate, travelers, travelerDetails, contact, pricing, specialRequests } = currentBooking;

    if (!trip || !contact || !pricing) {
      throw new Error('Incomplete booking data');
    }

    // Calculate return date based on duration
    const startDate = new Date(travelDate);
    const returnDate = new Date(startDate);
    returnDate.setDate(returnDate.getDate() + (trip.duration?.days || 7));

    // Prepare booking payload for backend
    const bookingPayload: CreateBookingPayload = {
      packageId: trip.id,
      packageName: trip.title,
      contactName: contact.name,
      contactEmail: contact.email,
      contactPhone: contact.phone,
      travelDate: startDate.toISOString(),
      returnDate: returnDate.toISOString(),
      travellers: travelerDetails.map(toBackendTraveller),
      adultCount: travelers.adults,
      childCount: travelers.children,
      infantCount: travelers.infants,
      basePrice: pricing.subtotal,
      discountAmount: pricing.discount,
      specialRequests: specialRequests || '',
      destination: trip.destination || '',
      duration: `${trip.duration?.days || 7} Days ${trip.duration?.nights || 6} Nights`,
      inclusions: [],
    };

    // Create booking in backend
    const booking = await createPackageBookingAPI(bookingPayload);
    return booking;
  }
);

// Confirm booking after payment (status: CONFIRMED)
export const confirmBooking = createAsyncThunk<Booking, { bookingId: number; paymentId?: string; transactionId?: string }, { state: RootState }>(
  'booking/confirmBooking',
  async ({ bookingId, paymentId, transactionId }, { getState }) => {
    const { currentBooking } = getState().booking;
    const { trip, travelDate, travelers, travelerDetails, contact, pricing, specialRequests } = currentBooking;

    if (!trip || !contact || !pricing) {
      throw new Error('Incomplete booking data');
    }

    // Call backend to confirm the booking
    const confirmedBooking = await confirmBookingAPI(bookingId, {
      paymentId: paymentId || `PAY-${Date.now()}`,
      transactionId: transactionId || `TXN-${Date.now()}`,
    });

    // Return booking with frontend data merged
    return {
      id: String(confirmedBooking.id),
      tripId: trip.id,
      trip,
      userId: String(confirmedBooking.userId),
      travelers: travelerDetails,
      contact,
      travelDate,
      totalTravelers: travelers,
      pricing,
      status: 'confirmed',
      paymentStatus: 'completed',
      transactionId: transactionId || `TXN-${Date.now()}`,
      createdAt: confirmedBooking.createdAt,
      updatedAt: confirmedBooking.updatedAt,
      specialRequests,
      bookingNumber: confirmedBooking.bookingNumber,
      confirmationCode: confirmedBooking.confirmationCode,
    };
  }
);

// Legacy confirm booking for demo/fallback (without backend)
export const confirmBookingLocal = createAsyncThunk<Booking, void, { state: RootState }>(
  'booking/confirmBookingLocal',
  async (_, { getState }) => {
    const { currentBooking } = getState().booking;
    const { trip, travelDate, travelers, travelerDetails, contact, pricing, specialRequests } = currentBooking;

    if (!trip || !contact || !pricing) {
      throw new Error('Incomplete booking data');
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const userId = getState().auth.user?.id || 'guest';

    return {
      id: `BK-${Date.now()}`,
      tripId: trip.id,
      trip,
      userId,
      travelers: travelerDetails,
      contact,
      travelDate,
      totalTravelers: travelers,
      pricing,
      status: 'confirmed',
      paymentStatus: 'completed',
      transactionId: `TXN-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      specialRequests,
    };
  }
);

export const loadBookingHistory = createAsyncThunk<Booking[]>('booking/loadBookingHistory', async () => {
  const response = await getUserBookingsAPI();
  if (Array.isArray(response)) return response as Booking[];
  if (response?.bookings && Array.isArray(response.bookings)) return response.bookings as Booking[];
  return [];
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setTrip: (state, action: PayloadAction<Trip>) => {
      const previousTripId = state.currentBooking.trip?.id;
      state.currentBooking.trip = action.payload;
      if (!state.currentBooking.travelDate || previousTripId !== action.payload.id) {
        state.currentBooking.travelDate = getDefaultTravelDate(action.payload);
      }
      state.currentBooking.pricing = calculatePricingForBooking(state.currentBooking);
    },
    setTravelDate: (state, action: PayloadAction<string>) => {
      state.currentBooking.travelDate = action.payload;
    },
    setTravelers: (
      state,
      action: PayloadAction<{ adults: number; children: number; infants: number }>
    ) => {
      state.currentBooking.travelers = action.payload;
      state.currentBooking.pricing = calculatePricingForBooking(state.currentBooking);
    },
    addTravelerDetail: (state, action: PayloadAction<Traveler>) => {
      state.currentBooking.travelerDetails.push(action.payload);
    },
    setTravelerDetails: (state, action: PayloadAction<Traveler[]>) => {
      state.currentBooking.travelerDetails = action.payload;
    },
    updateTravelerDetail: (
      state,
      action: PayloadAction<{ id: string; data: Partial<Traveler> }>
    ) => {
      state.currentBooking.travelerDetails = state.currentBooking.travelerDetails.map((traveler) =>
        traveler.id === action.payload.id
          ? { ...traveler, ...action.payload.data }
          : traveler
      );
    },
    setContact: (state, action: PayloadAction<BookingContact>) => {
      state.currentBooking.contact = action.payload;
    },
    calculatePricing: (state) => {
      state.currentBooking.pricing = calculatePricingForBooking(state.currentBooking);
    },
    setPromoCode: (state, action: PayloadAction<string>) => {
      state.currentBooking.promoCode = action.payload;
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentBooking.step = action.payload;
    },
    setSpecialRequests: (state, action: PayloadAction<string>) => {
      state.currentBooking.specialRequests = action.payload;
    },
    resetBooking: (state) => {
      state.currentBooking = createInitialBooking();
    },
    setPendingBookingId: (state, action: PayloadAction<number | null>) => {
      state.currentBooking.pendingBookingId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.isCreatingBooking = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isCreatingBooking = false;
        state.currentBooking.pendingBookingId = action.payload.id;
      })
      .addCase(createBooking.rejected, (state) => {
        state.isCreatingBooking = false;
      })
      // Confirm booking
      .addCase(confirmBooking.pending, (state) => {
        state.isConfirmingBooking = true;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.isConfirmingBooking = false;
        state.bookingHistory = [action.payload, ...state.bookingHistory];
        state.currentBooking = createInitialBooking();
      })
      .addCase(confirmBooking.rejected, (state) => {
        state.isConfirmingBooking = false;
      })
      // Local confirm booking (fallback)
      .addCase(confirmBookingLocal.fulfilled, (state, action) => {
        state.bookingHistory = [action.payload, ...state.bookingHistory];
        state.currentBooking = createInitialBooking();
      })
      // Load booking history
      .addCase(loadBookingHistory.fulfilled, (state, action) => {
        state.bookingHistory = action.payload;
      });
  },
});

export const {
  setTrip,
  setTravelDate,
  setTravelers,
  addTravelerDetail,
  setTravelerDetails,
  updateTravelerDetail,
  setContact,
  calculatePricing,
  setPromoCode,
  setStep,
  setSpecialRequests,
  resetBooking,
  setPendingBookingId,
} = bookingSlice.actions;

export const applyPromoCode = createAsyncThunk<boolean, { code: string }>(
  'booking/applyPromoCode',
  async ({ code }, { dispatch }) => {
    const normalized = code.toUpperCase();
    const validCodes = ['WELCOME10', 'SUMMER20', 'FIRST50', 'NEW500'];
    const isValid = validCodes.includes(normalized);

    if (isValid) {
      dispatch(setPromoCode(normalized));
      dispatch(calculatePricing());
    }

    return isValid;
  }
);

export default bookingSlice.reducer;
