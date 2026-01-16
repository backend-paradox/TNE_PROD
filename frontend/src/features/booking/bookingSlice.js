import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createHotelBookingAPI,
  createFlightBookingAPI,
  createBusBookingAPI,
  createEventBookingAPI,
  getUserBookingsAPI,
  getBookingByIdAPI,
  cancelBookingAPI,
  confirmBookingAPI,
} from './bookingAPI';

const initialState = {
  bookings: [],
  currentBooking: null,
  selectedBooking: null,
  loading: false,
  error: null,
};

// Async thunks
export const createHotelBooking = createAsyncThunk(
  'booking/createHotelBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const data = await createHotelBookingAPI(bookingData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Booking failed');
    }
  }
);

export const createFlightBooking = createAsyncThunk(
  'booking/createFlightBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const data = await createFlightBookingAPI(bookingData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Booking failed');
    }
  }
);

export const createBusBooking = createAsyncThunk(
  'booking/createBusBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const data = await createBusBookingAPI(bookingData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Booking failed');
    }
  }
);

export const createEventBooking = createAsyncThunk(
  'booking/createEventBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const data = await createEventBookingAPI(bookingData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Booking failed');
    }
  }
);

export const getUserBookings = createAsyncThunk(
  'booking/getUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUserBookingsAPI();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const getBookingById = createAsyncThunk(
  'booking/getBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await getBookingByIdAPI(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (id, { rejectWithValue }) => {
    try {
      const data = await cancelBookingAPI(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

export const confirmBooking = createAsyncThunk(
  'booking/confirmBooking',
  async (id, { rejectWithValue }) => {
    try {
      const data = await confirmBookingAPI(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm booking');
    }
  }
);

// Booking slice
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
      state.error = null;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Hotel Booking
      .addCase(createHotelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHotelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(createHotelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Flight Booking
      .addCase(createFlightBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFlightBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(createFlightBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Bus Booking
      .addCase(createBusBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBusBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(createBusBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Event Booking
      .addCase(createEventBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEventBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(createEventBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get User Bookings
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Booking By ID
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
        // Update in bookings list
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm Booking
      .addCase(confirmBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentBooking, clearSelectedBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
