import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  searchHotelsAPI,
  searchFlightsAPI,
  searchBusesAPI,
  searchEventsAPI,
  universalSearchAPI,
  getHotelByIdAPI,
  getFlightByIdAPI,
  getBusByIdAPI,
  getEventByIdAPI,
  getPricingAPI,
} from './catalogAPI';

const initialState = {
  searchResults: [],
  searchType: null,
  searchParams: null,
  selectedItem: null,
  pricing: null,
  loading: false,
  error: null,
};

// Async thunks
export const searchHotels = createAsyncThunk(
  'catalog/searchHotels',
  async (params, { rejectWithValue }) => {
    try {
      const data = await searchHotelsAPI(params);
      return { data, type: 'hotels', params };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const searchFlights = createAsyncThunk(
  'catalog/searchFlights',
  async (params, { rejectWithValue }) => {
    try {
      const data = await searchFlightsAPI(params);
      return { data, type: 'flights', params };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const searchBuses = createAsyncThunk(
  'catalog/searchBuses',
  async (params, { rejectWithValue }) => {
    try {
      const data = await searchBusesAPI(params);
      return { data, type: 'buses', params };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const searchEvents = createAsyncThunk(
  'catalog/searchEvents',
  async (params, { rejectWithValue }) => {
    try {
      const data = await searchEventsAPI(params);
      return { data, type: 'events', params };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const universalSearch = createAsyncThunk(
  'catalog/universalSearch',
  async (query, { rejectWithValue }) => {
    try {
      const data = await universalSearchAPI(query);
      return { data, type: 'all', params: { query } };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const getHotelById = createAsyncThunk(
  'catalog/getHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await getHotelByIdAPI(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hotel');
    }
  }
);

export const getFlightById = createAsyncThunk(
  'catalog/getFlightById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await getFlightByIdAPI(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch flight');
    }
  }
);

export const getBusById = createAsyncThunk(
  'catalog/getBusById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await getBusByIdAPI(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bus');
    }
  }
);

export const getEventById = createAsyncThunk(
  'catalog/getEventById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await getEventByIdAPI(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event');
    }
  }
);

export const getPricing = createAsyncThunk(
  'catalog/getPricing',
  async ({ resourceType, resourceId, date, quantity }, { rejectWithValue }) => {
    try {
      const data = await getPricingAPI(resourceType, resourceId, date, quantity);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pricing');
    }
  }
);

// Catalog slice
const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchType = null;
      state.searchParams = null;
      state.error = null;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
      state.pricing = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Hotels
      .addCase(searchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data.results || action.payload.data;
        state.searchType = action.payload.type;
        state.searchParams = action.payload.params;
      })
      .addCase(searchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Flights
      .addCase(searchFlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data.results || action.payload.data;
        state.searchType = action.payload.type;
        state.searchParams = action.payload.params;
      })
      .addCase(searchFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Buses
      .addCase(searchBuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBuses.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data.results || action.payload.data;
        state.searchType = action.payload.type;
        state.searchParams = action.payload.params;
      })
      .addCase(searchBuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Events
      .addCase(searchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data.results || action.payload.data;
        state.searchType = action.payload.type;
        state.searchParams = action.payload.params;
      })
      .addCase(searchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Universal Search
      .addCase(universalSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(universalSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data;
        state.searchType = action.payload.type;
        state.searchParams = action.payload.params;
      })
      .addCase(universalSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Hotel By ID
      .addCase(getHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(getHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Flight By ID
      .addCase(getFlightById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFlightById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(getFlightById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Bus By ID
      .addCase(getBusById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBusById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(getBusById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Event By ID
      .addCase(getEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(getEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Pricing
      .addCase(getPricing.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPricing.fulfilled, (state, action) => {
        state.loading = false;
        state.pricing = action.payload;
      })
      .addCase(getPricing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearchResults, clearSelectedItem, clearError } = catalogSlice.actions;
export default catalogSlice.reducer;
