import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid3X3,
  List,
  MapPin,
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  Check,
  TrendingUp
} from 'lucide-react';
import { TripCard } from '../components/booking/TripCard';
import { useAppDispatch } from '../store/hooks';
import { search, setFilters } from '../store/slices/searchSlice';
import { enrichedTripsData } from '../data/trips';
import { formatCurrency } from '../utils';
import { TripCategory, SortOption } from '../types';
import './SearchPage.css';

const categories: { value: TripCategory; label: string; icon: string }[] = [
  { value: 'beach', label: 'Beach', icon: '🏖️' },
  { value: 'mountain', label: 'Mountain', icon: '🏔️' },
  { value: 'adventure', label: 'Adventure', icon: '🧗' },
  { value: 'cultural', label: 'Cultural', icon: '🏛️' },
  { value: 'honeymoon', label: 'Honeymoon', icon: '💑' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'luxury', label: 'Luxury', icon: '✨' },
  { value: 'budget', label: 'Budget', icon: '💰' }
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'duration-short', label: 'Duration: Shortest' },
  { value: 'duration-long', label: 'Duration: Longest' }
];

const priceRanges = [
  { min: 0, max: 20000, label: 'Under ₹20,000' },
  { min: 20000, max: 40000, label: '₹20,000 - ₹40,000' },
  { min: 40000, max: 60000, label: '₹40,000 - ₹60,000' },
  { min: 60000, max: 100000, label: '₹60,000 - ₹1,00,000' },
  { min: 100000, max: 500000, label: 'Above ₹1,00,000' }
];

const durationRanges = [
  { min: 1, max: 3, label: '1-3 Days' },
  { min: 4, max: 6, label: '4-6 Days' },
  { min: 7, max: 10, label: '7-10 Days' },
  { min: 11, max: 30, label: '10+ Days' }
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: '' as TripCategory | '',
    priceRange: null as { min: number; max: number } | null,
    duration: null as { min: number; max: number } | null,
    rating: null as number | null,
    sortBy: 'popularity' as SortOption,
    tripType: '' as 'Domestic' | 'International' | ''
  });

  // Apply filters and search
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      dispatch(setFilters({ destination: q }));
    }
    dispatch(search());
  }, [dispatch, searchParams]);

  // Local filtering logic
  const filteredTrips = React.useMemo(() => {
    let results = searchQuery 
      ? enrichedTripsData.filter(trip =>
          trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.country.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : enrichedTripsData;

    // Apply category filter
    if (localFilters.category) {
      results = results.filter(trip => 
        trip.category.toLowerCase() === localFilters.category.toLowerCase() ||
        trip.tripType.some(t => t.toLowerCase() === localFilters.category.toLowerCase())
      );
    }

    // Apply trip type filter (Domestic/International)
    if (localFilters.tripType) {
      results = results.filter(trip => trip.category === localFilters.tripType);
    }

    // Apply price filter
    if (localFilters.priceRange) {
      results = results.filter(trip => 
        trip.price.adult >= localFilters.priceRange!.min && 
        trip.price.adult <= localFilters.priceRange!.max
      );
    }

    // Apply duration filter
    if (localFilters.duration) {
      results = results.filter(trip => 
        trip.duration.days >= localFilters.duration!.min && 
        trip.duration.days <= localFilters.duration!.max
      );
    }

    // Apply rating filter
    if (localFilters.rating) {
      results = results.filter(trip => (trip.rating ?? 0) >= localFilters.rating!);
    }

    // Apply sorting
    switch (localFilters.sortBy) {
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
  }, [searchQuery, localFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };

  const handleClearFilters = () => {
    setLocalFilters({
      category: '',
      priceRange: null,
      duration: null,
      rating: null,
      sortBy: 'popularity',
      tripType: ''
    });
    setSearchQuery('');
    setSearchParams({});
  };

  const activeFiltersCount = [
    localFilters.category,
    localFilters.priceRange,
    localFilters.duration,
    localFilters.rating,
    localFilters.tripType
  ].filter(Boolean).length;

  // Filter Sidebar Component
  const FilterSidebar = ({ isMobile = false }) => (
    <div className={isMobile ? '' : 'search-filters'}>
      {/* Sort By */}
      <div className="search-filter-section">
        <label className="search-filter-label">Sort By</label>
        <select
          value={localFilters.sortBy}
          onChange={(e) => setLocalFilters(prev => ({ ...prev, sortBy: e.target.value as SortOption }))}
          className="search-filter-select"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Trip Type */}
      <div className="search-filter-section">
        <h3 className="search-filter-title">Trip Type</h3>
        <div className="search-trip-types">
          {['Domestic', 'International'].map(type => (
            <button
              key={type}
              onClick={() => setLocalFilters(prev => ({
                ...prev,
                tripType: prev.tripType === type ? '' : type as any
              }))}
              className={`search-trip-type-btn ${localFilters.tripType === type ? 'active' : ''}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="search-filter-section">
        <h3 className="search-filter-title">Categories</h3>
        <div className="search-category-grid">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setLocalFilters(prev => ({
                ...prev,
                category: prev.category === cat.value ? '' : cat.value
              }))}
              className={`search-category-btn ${localFilters.category === cat.value ? 'active' : ''}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="search-filter-section">
        <h3 className="search-filter-title">Price Range</h3>
        <div className="search-checkbox-list">
          {priceRanges.map((range, idx) => (
            <label key={idx} className="search-checkbox-item">
              <div className={`search-checkbox ${
                localFilters.priceRange?.min === range.min && localFilters.priceRange?.max === range.max ? 'checked' : ''
              }`}>
                {localFilters.priceRange?.min === range.min && localFilters.priceRange?.max === range.max && (
                  <Check />
                )}
              </div>
              <button
                onClick={() => setLocalFilters(prev => ({
                  ...prev,
                  priceRange: prev.priceRange?.min === range.min ? null : { min: range.min, max: range.max }
                }))}
                className="search-checkbox-label"
              >
                {range.label}
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="search-filter-section">
        <h3 className="search-filter-title">Duration</h3>
        <div className="search-checkbox-list">
          {durationRanges.map((range, idx) => (
            <label key={idx} className="search-checkbox-item">
              <div className={`search-checkbox ${
                localFilters.duration?.min === range.min && localFilters.duration?.max === range.max ? 'checked' : ''
              }`}>
                {localFilters.duration?.min === range.min && localFilters.duration?.max === range.max && (
                  <Check />
                )}
              </div>
              <button
                onClick={() => setLocalFilters(prev => ({
                  ...prev,
                  duration: prev.duration?.min === range.min ? null : { min: range.min, max: range.max }
                }))}
                className="search-checkbox-label"
              >
                {range.label}
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="search-filter-section">
        <h3 className="search-filter-title">Rating</h3>
        <div className="search-checkbox-list">
          {[4.5, 4, 3.5, 3].map(rating => (
            <label key={rating} className="search-checkbox-item">
              <div className={`search-checkbox ${localFilters.rating === rating ? 'checked' : ''}`}>
                {localFilters.rating === rating && (
                  <Check />
                )}
              </div>
              <button
                onClick={() => setLocalFilters(prev => ({
                  ...prev,
                  rating: prev.rating === rating ? null : rating
                }))}
                className="search-checkbox-label search-rating-item"
              >
                <Star />
                <span>{rating}+ & above</span>
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <button
          onClick={handleClearFilters}
          className="search-clear-filters"
        >
          Clear All Filters ({activeFiltersCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="search-page">
      {/* Hero Search Section */}
      <div className="search-hero">
        <div className="search-hero-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="search-hero-header"
          >
            <h1 className="search-hero-title">Find Your Perfect Trip</h1>
            <p className="search-hero-subtitle">Explore {enrichedTripsData.length}+ handcrafted tour packages</p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch}
            className="search-bar-form"
          >
            <div className="search-bar-container">
              <div className="search-bar-input-wrapper">
                <Search />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations, trips, countries..."
                  className="search-bar-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="search-bar-clear"
                  >
                    <X />
                  </button>
                )}
              </div>
              <button type="submit" className="search-bar-submit">
                Search
              </button>
            </div>
          </motion.form>

          {/* Quick Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="search-quick-filters"
          >
            {['Beach', 'Mountain', 'Adventure', 'Honeymoon', 'Family'].map(tag => (
              <button
                key={tag}
                onClick={() => setLocalFilters(prev => ({
                  ...prev,
                  category: prev.category === tag.toLowerCase() ? '' : tag.toLowerCase() as TripCategory
                }))}
                className={`search-quick-filter ${localFilters.category === tag.toLowerCase() ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="search-content">
        {/* Results Header */}
        <div className="search-results-header">
          <div>
            <h2 className="search-results-title">
              {filteredTrips.length} Trips Found
              {searchQuery && <span className="search-results-query"> for "{searchQuery}"</span>}
            </h2>
            {activeFiltersCount > 0 && (
              <p className="search-filters-count">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
              </p>
            )}
          </div>

          <div className="search-controls">
            {/* View Mode Toggle */}
            <div className="search-view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`search-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              >
                <Grid3X3 />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`search-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              >
                <List />
              </button>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="search-mobile-filter-btn"
            >
              <SlidersHorizontal />
              Filters
              {activeFiltersCount > 0 && (
                <span className="search-filter-badge">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="search-layout">
          {/* Desktop Filters Sidebar */}
          <div className="search-sidebar">
            <FilterSidebar />
          </div>

          {/* Trip Results */}
          <div className="search-results">
            <AnimatePresence mode="wait">
              {filteredTrips.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={viewMode === 'grid' ? 'search-results-grid' : 'search-results-list'}
                >
                  {filteredTrips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TripCard
                        trip={trip}
                        variant={viewMode === 'list' ? 'horizontal' : 'default'}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="search-empty"
                >
                  <div className="search-empty-icon">
                    <MapPin />
                  </div>
                  <h3 className="search-empty-title">No trips found</h3>
                  <p className="search-empty-text">
                    Try adjusting your filters or search for something else
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="search-empty-btn"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="search-mobile-overlay"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="search-mobile-panel"
            >
              <div className="search-mobile-header">
                <h2 className="search-mobile-title">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="search-mobile-close"
                >
                  <X />
                </button>
              </div>
              <div className="search-mobile-content">
                <FilterSidebar isMobile />
              </div>
              <div className="search-mobile-footer">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="search-mobile-show-btn"
                >
                  Show {filteredTrips.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchPage;
