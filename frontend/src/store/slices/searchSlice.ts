import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SearchFilters, Trip } from '../../types';
import type { RootState } from '../index';

interface SearchState {
  filters: SearchFilters;
  searchResults: Trip[];
  isSearching: boolean;
}

const defaultFilters: SearchFilters = {
  destination: '',
  startDate: null,
  endDate: null,
  travelers: { adults: 1, children: 0, infants: 0 },
  priceRange: [0, 200000],
  duration: [1, 15],
  categories: [],
  tripTypes: [],
  rating: null,
  sortBy: 'recommended',
};

const initialState: SearchState = {
  filters: defaultFilters,
  searchResults: [],
  isSearching: false,
};

export const search = createAsyncThunk<Trip[], void, { state: RootState }>(
  'search/search',
  async (_, { getState }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { enrichedTripsData } = await import('../../data/trips');
    const { filters } = getState().search;

    let results = [...enrichedTripsData];

    if (filters.destination) {
      const query = filters.destination.toLowerCase();
      results = results.filter(
        (trip) =>
          trip.destination.toLowerCase().includes(query) ||
          trip.country.toLowerCase().includes(query) ||
          trip.title.toLowerCase().includes(query)
      );
    }

    results = results.filter(
      (trip) => trip.price.adult >= filters.priceRange[0] && trip.price.adult <= filters.priceRange[1]
    );
    results = results.filter(
      (trip) => trip.duration.days >= filters.duration[0] && trip.duration.days <= filters.duration[1]
    );

    if (filters.categories.length > 0) {
      results = results.filter((trip) => filters.categories.includes(trip.category));
    }
    if (filters.tripTypes.length > 0) {
      results = results.filter((trip) => trip.tripType.some((type) => filters.tripTypes.includes(type)));
    }
    if (filters.rating) {
      results = results.filter((trip) => (trip.rating ?? 0) >= filters.rating);
    }

    switch (filters.sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price.adult - b.price.adult);
        break;
      case 'price-high':
        results.sort((a, b) => b.price.adult - a.price.adult);
        break;
      case 'rating':
        results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'duration-short':
        results.sort((a, b) => a.duration.days - b.duration.days);
        break;
      case 'duration-long':
        results.sort((a, b) => b.duration.days - a.duration.days);
        break;
      default:
        results.sort((a, b) => {
          if (a.featured !== b.featured) return b.featured ? 1 : -1;
          return (b.rating ?? 0) - (a.rating ?? 0);
        });
    }

    return results;
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = defaultFilters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(search.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(search.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.isSearching = false;
      })
      .addCase(search.rejected, (state) => {
        state.isSearching = false;
      });
  },
});

export const { setFilters, resetFilters } = searchSlice.actions;
export default searchSlice.reducer;
