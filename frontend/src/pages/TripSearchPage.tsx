import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  ChevronDown,
  Grid3X3,
  List,
  Star,
  Loader2,
  ArrowUpDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetFilters, search, setFilters } from '../store/slices/searchSlice';
import { TripCard } from '../components/booking/TripCard';
import { TripCategory, TripType } from '../types';
import { formatCurrency } from '../utils';
import './TripSearchPage.css';

const categories: { value: TripCategory; label: string }[] = [
  { value: 'Domestic', label: 'Domestic' },
  { value: 'International', label: 'International' },
];

const tripTypes: { value: TripType; label: string }[] = [
  { value: 'Beach', label: 'Beach' },
  { value: 'Mountain', label: 'Mountain' },
  { value: 'Adventure', label: 'Adventure' },
  { value: 'Cultural', label: 'Cultural' },
  { value: 'Romantic', label: 'Romantic' },
  { value: 'Wildlife', label: 'Wildlife' },
  { value: 'Wellness', label: 'Wellness' },
];

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'duration-short', label: 'Duration: Shortest' },
  { value: 'duration-long', label: 'Duration: Longest' },
];

export function TripSearchPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { filters, searchResults, isSearching } = useAppSelector((state) => state.search);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);
  const [localDuration, setLocalDuration] = useState(filters.duration);

  // Initialize from URL params
  useEffect(() => {
    const destination = searchParams.get('destination') || '';
    const category = searchParams.get('category') as TripCategory | null;
    const type = searchParams.get('type') as TripType | null;

    const newFilters: Partial<typeof filters> = {};
    if (destination) newFilters.destination = destination;
    if (category) newFilters.categories = [category];
    if (type) newFilters.tripTypes = [type];

    if (Object.keys(newFilters).length > 0) {
      dispatch(setFilters(newFilters));
    }
    dispatch(search());
  }, [dispatch, searchParams]);

  // Update search when filters change
  useEffect(() => {
    dispatch(search());
  }, [dispatch, filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(search());
  };

  const applyPriceRange = () => {
    dispatch(setFilters({ priceRange: localPriceRange }));
  };

  const applyDuration = () => {
    dispatch(setFilters({ duration: localDuration }));
  };

  const toggleCategory = (cat: TripCategory) => {
    const current = filters.categories;
    if (current.includes(cat)) {
      dispatch(setFilters({ categories: current.filter(c => c !== cat) }));
    } else {
      dispatch(setFilters({ categories: [...current, cat] }));
    }
  };

  const toggleTripType = (type: TripType) => {
    const current = filters.tripTypes;
    if (current.includes(type)) {
      dispatch(setFilters({ tripTypes: current.filter(t => t !== type) }));
    } else {
      dispatch(setFilters({ tripTypes: [...current, type] }));
    }
  };

  const clearAllFilters = () => {
    dispatch(resetFilters());
    setLocalPriceRange([0, 200000]);
    setLocalDuration([1, 15]);
  };

  const activeFilterCount = [
    filters.destination,
    filters.categories.length > 0,
    filters.tripTypes.length > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 200000,
    filters.duration[0] > 1 || filters.duration[1] < 15,
    filters.rating,
  ].filter(Boolean).length;

  return (
    <div className="trip-search-page">
      {/* Search Header */}
      <div className="search-header">
        <div className="search-header-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="search-header-content"
          >
            <h1 className="search-header-title">
              Find Your Perfect Trip
            </h1>
            <p className="search-header-subtitle">
              Discover amazing destinations and create unforgettable memories
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearchSubmit}
            className="search-form"
          >
            <div className="search-bar">
              <div className="search-input-wrapper">
                <MapPin className="search-input-icon" />
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={filters.destination}
                  onChange={(e) => dispatch(setFilters({ destination: e.target.value }))}
                  className="search-input"
                />
              </div>
              <button
                type="submit"
                className="search-submit-btn"
              >
                <Search />
                <span>Search</span>
              </button>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Main Content */}
      <div className="search-main">
        <div className="search-layout">
          {/* Filters Sidebar - Desktop */}
          <div className="filters-sidebar">
            <div className="filters-card">
              <div className="filters-header">
                <h2 className="filters-title">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="filters-clear-btn"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <h3 className="filter-section-title">Price Range</h3>
                <div className="filter-price-inputs">
                  <div className="filter-price-field">
                    <label className="filter-price-label">Min</label>
                    <input
                      type="number"
                      value={localPriceRange[0]}
                      onChange={(e) => setLocalPriceRange([Number(e.target.value), localPriceRange[1]])}
                      className="filter-price-input"
                    />
                  </div>
                  <div className="filter-price-field">
                    <label className="filter-price-label">Max</label>
                    <input
                      type="number"
                      value={localPriceRange[1]}
                      onChange={(e) => setLocalPriceRange([localPriceRange[0], Number(e.target.value)])}
                      className="filter-price-input"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={localPriceRange[1]}
                  onChange={(e) => setLocalPriceRange([localPriceRange[0], Number(e.target.value)])}
                  className="filter-range"
                />
                <button
                  onClick={applyPriceRange}
                  className="filter-apply-btn"
                >
                  Apply Price Filter
                </button>
              </div>

              {/* Duration */}
              <div className="filter-section">
                <h3 className="filter-section-title">Duration (Days)</h3>
                <div className="filter-price-inputs">
                  <div className="filter-price-field">
                    <label className="filter-price-label">Min</label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={localDuration[0]}
                      onChange={(e) => setLocalDuration([Number(e.target.value), localDuration[1]])}
                      className="filter-price-input"
                    />
                  </div>
                  <div className="filter-price-field">
                    <label className="filter-price-label">Max</label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={localDuration[1]}
                      onChange={(e) => setLocalDuration([localDuration[0], Number(e.target.value)])}
                      className="filter-price-input"
                    />
                  </div>
                </div>
                <button
                  onClick={applyDuration}
                  className="filter-apply-btn"
                >
                  Apply Duration Filter
                </button>
              </div>

              {/* Category */}
              <div className="filter-section">
                <h3 className="filter-section-title">Category</h3>
                <div className="filter-checkbox-list">
                  {categories.map((cat) => (
                    <label key={cat.value} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(cat.value)}
                        onChange={() => toggleCategory(cat.value)}
                        className="filter-checkbox"
                      />
                      <span className="filter-checkbox-label">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Trip Types */}
              <div className="filter-section">
                <h3 className="filter-section-title">Trip Type</h3>
                <div className="filter-checkbox-list">
                  {tripTypes.map((type) => (
                    <label key={type.value} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.tripTypes.includes(type.value)}
                        onChange={() => toggleTripType(type.value)}
                        className="filter-checkbox"
                      />
                      <span className="filter-checkbox-label">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="filter-section">
                <h3 className="filter-section-title">Minimum Rating</h3>
                <div className="filter-radio-list">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <label key={rating} className="filter-radio-item">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => dispatch(setFilters({ rating }))}
                        className="filter-radio"
                      />
                      <span className="filter-radio-label">
                        <Star className="filter-star-icon" />
                        {rating}+
                      </span>
                    </label>
                  ))}
                  {filters.rating && (
                    <button
                      onClick={() => dispatch(setFilters({ rating: null }))}
                      className="filter-clear-rating"
                    >
                      Clear rating filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="results-area">
            {/* Results Header */}
            <div className="results-header">
              <div className="results-header-row">
                <div className="results-header-left">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="mobile-filter-btn"
                  >
                    <SlidersHorizontal />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="mobile-filter-count">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <p className="results-count">
                    <span className="results-count-number">{searchResults.length}</span> trips found
                  </p>
                </div>

                <div className="results-header-right">
                  {/* Sort Dropdown */}
                  <div className="sort-dropdown-wrapper">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => dispatch(setFilters({ sortBy: e.target.value as any }))}
                      className="sort-dropdown"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ArrowUpDown className="sort-dropdown-icon" />
                  </div>

                  {/* View Toggle */}
                  <div className="view-toggle">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    >
                      <Grid3X3 />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    >
                      <List />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Tags */}
              {activeFilterCount > 0 && (
                <div className="active-filters">
                  {filters.destination && (
                    <span className="filter-tag destination">
                      {filters.destination}
                      <button className="filter-tag-remove" onClick={() => dispatch(setFilters({ destination: '' }))}>
                        <X />
                      </button>
                    </span>
                  )}
                  {filters.categories.map((cat) => (
                    <span key={cat} className="filter-tag category">
                      {cat}
                      <button className="filter-tag-remove" onClick={() => toggleCategory(cat)}>
                        <X />
                      </button>
                    </span>
                  ))}
                  {filters.tripTypes.map((type) => (
                    <span key={type} className="filter-tag trip-type">
                      {type}
                      <button className="filter-tag-remove" onClick={() => toggleTripType(type)}>
                        <X />
                      </button>
                    </span>
                  ))}
                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < 200000) && (
                    <span className="filter-tag price">
                      {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
                      <button className="filter-tag-remove" onClick={() => { dispatch(setFilters({ priceRange: [0, 200000] })); setLocalPriceRange([0, 200000]); }}>
                        <X />
                      </button>
                    </span>
                  )}
                  {filters.rating && (
                    <span className="filter-tag rating">
                      {filters.rating}+ Stars
                      <button className="filter-tag-remove" onClick={() => dispatch(setFilters({ rating: null }))}>
                        <X />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results Grid/List */}
            {isSearching ? (
              <div className="loading-state">
                <Loader2 className="loading-spinner" />
                <p className="loading-text">Searching for trips...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon-wrapper">
                  <Search className="empty-state-icon" />
                </div>
                <h3 className="empty-state-title">No trips found</h3>
                <p className="empty-state-text">
                  Try adjusting your filters or search for a different destination
                </p>
                <button
                  onClick={clearAllFilters}
                  className="empty-state-btn"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className={viewMode === 'grid' ? 'results-grid' : 'results-list'}
              >
                <AnimatePresence mode="popLayout">
                  {searchResults.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TripCard
                        trip={trip}
                        variant={viewMode === 'list' ? 'horizontal' : 'default'}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-filters-overlay"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="mobile-filters-panel"
            >
              <div className="mobile-filters-header">
                <h2 className="mobile-filters-title">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="mobile-filters-close"
                >
                  <X />
                </button>
              </div>

              <div className="mobile-filters-content">
                {/* Price Range - Mobile */}
                <div>
                  <h3 className="filter-section-title">Price Range</h3>
                  <div className="filter-price-inputs">
                    <div className="filter-price-field">
                      <label className="filter-price-label">Min</label>
                      <input
                        type="number"
                        value={localPriceRange[0]}
                        onChange={(e) => setLocalPriceRange([Number(e.target.value), localPriceRange[1]])}
                        className="filter-price-input"
                      />
                    </div>
                    <div className="filter-price-field">
                      <label className="filter-price-label">Max</label>
                      <input
                        type="number"
                        value={localPriceRange[1]}
                        onChange={(e) => setLocalPriceRange([localPriceRange[0], Number(e.target.value)])}
                        className="filter-price-input"
                      />
                    </div>
                  </div>
                  <button
                    onClick={applyPriceRange}
                    className="filter-apply-btn"
                  >
                    Apply
                  </button>
                </div>

                {/* Duration - Mobile */}
                <div>
                  <h3 className="filter-section-title">Duration (Days)</h3>
                  <div className="filter-price-inputs">
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={localDuration[0]}
                      onChange={(e) => setLocalDuration([Number(e.target.value), localDuration[1]])}
                      className="filter-price-input"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={localDuration[1]}
                      onChange={(e) => setLocalDuration([localDuration[0], Number(e.target.value)])}
                      className="filter-price-input"
                      placeholder="Max"
                    />
                  </div>
                  <button
                    onClick={applyDuration}
                    className="filter-apply-btn"
                  >
                    Apply
                  </button>
                </div>

                {/* Category - Mobile */}
                <div>
                  <h3 className="filter-section-title">Category</h3>
                  <div className="filter-checkbox-list">
                    {categories.map((cat) => (
                      <label key={cat.value} className="filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(cat.value)}
                          onChange={() => toggleCategory(cat.value)}
                          className="filter-checkbox"
                        />
                        <span className="filter-checkbox-label">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Trip Type - Mobile */}
                <div>
                  <h3 className="filter-section-title">Trip Type</h3>
                  <div className="filter-checkbox-list">
                    {tripTypes.map((type) => (
                      <label key={type.value} className="filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={filters.tripTypes.includes(type.value)}
                          onChange={() => toggleTripType(type.value)}
                          className="filter-checkbox"
                        />
                        <span className="filter-checkbox-label">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating - Mobile */}
                <div>
                  <h3 className="filter-section-title">Minimum Rating</h3>
                  <div className="filter-radio-list">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <label key={rating} className="filter-radio-item">
                        <input
                          type="radio"
                          name="rating-mobile"
                          checked={filters.rating === rating}
                          onChange={() => dispatch(setFilters({ rating }))}
                          className="filter-radio"
                        />
                        <span className="filter-radio-label">
                          <Star className="filter-star-icon" />
                          {rating}+
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Filter Actions */}
              <div className="mobile-filters-actions">
                <button
                  onClick={clearAllFilters}
                  className="mobile-clear-btn"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="mobile-apply-btn"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TripSearchPage;
