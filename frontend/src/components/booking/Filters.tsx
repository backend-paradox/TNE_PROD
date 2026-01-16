import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Star,
  Check
} from 'lucide-react';
import { SearchFilters, TripCategory, SortOption } from '../../types';

interface FiltersProps {
  filters: Partial<SearchFilters>;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
  totalResults: number;
  className?: string;
}

const categories: { value: TripCategory; label: string; icon: string }[] = [
  { value: 'beach', label: 'Beach', icon: '🏖️' },
  { value: 'mountain', label: 'Mountain', icon: '🏔️' },
  { value: 'adventure', label: 'Adventure', icon: '🧗' },
  { value: 'cultural', label: 'Cultural', icon: '🏛️' },
  { value: 'wildlife', label: 'Wildlife', icon: '🦁' },
  { value: 'pilgrimage', label: 'Pilgrimage', icon: '🙏' },
  { value: 'honeymoon', label: 'Honeymoon', icon: '💑' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'luxury', label: 'Luxury', icon: '✨' },
  { value: 'budget', label: 'Budget', icon: '💰' }
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'duration_short', label: 'Duration: Short to Long' },
  { value: 'duration_long', label: 'Duration: Long to Short' }
];

const priceRanges = [
  { min: 0, max: 15000, label: 'Under ₹15,000' },
  { min: 15000, max: 30000, label: '₹15,000 - ₹30,000' },
  { min: 30000, max: 50000, label: '₹30,000 - ₹50,000' },
  { min: 50000, max: 100000, label: '₹50,000 - ₹1,00,000' },
  { min: 100000, max: 999999, label: 'Above ₹1,00,000' }
];

const durationRanges = [
  { min: 1, max: 3, label: '1-3 Days' },
  { min: 4, max: 6, label: '4-6 Days' },
  { min: 7, max: 10, label: '7-10 Days' },
  { min: 11, max: 30, label: '10+ Days' }
];

export function Filters({ filters, onFilterChange, onReset, totalResults, className = '' }: FiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'price', 'duration', 'rating']);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort By */}
      <div className="pb-4 border-b border-gray-200">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Sort By</label>
        <select
          value={filters.sortBy || 'popularity'}
          onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className="pb-4 border-b border-gray-200">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-semibold text-gray-900">Categories</span>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.includes('category') ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.includes('category') && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => onFilterChange({ 
                  category: filters.category === cat.value ? '' : cat.value 
                })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  filters.category === cat.value
                    ? 'bg-teal-100 text-teal-700 border-2 border-teal-500'
                    : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="pb-4 border-b border-gray-200">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-semibold text-gray-900">Price Range</span>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.includes('price') ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.includes('price') && (
          <div className="mt-3 space-y-2">
            {priceRanges.map((range, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  filters.priceRange?.min === range.min && filters.priceRange?.max === range.max
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-gray-300 group-hover:border-teal-400'
                }`}>
                  {filters.priceRange?.min === range.min && filters.priceRange?.max === range.max && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <button
                  onClick={() => onFilterChange({ 
                    priceRange: filters.priceRange?.min === range.min ? undefined : { min: range.min, max: range.max }
                  })}
                  className="text-sm text-gray-700 group-hover:text-teal-600"
                >
                  {range.label}
                </button>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="pb-4 border-b border-gray-200">
        <button
          onClick={() => toggleSection('duration')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-semibold text-gray-900">Duration</span>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.includes('duration') ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.includes('duration') && (
          <div className="mt-3 space-y-2">
            {durationRanges.map((range, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  filters.duration?.min === range.min && filters.duration?.max === range.max
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-gray-300 group-hover:border-teal-400'
                }`}>
                  {filters.duration?.min === range.min && filters.duration?.max === range.max && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <button
                  onClick={() => onFilterChange({ 
                    duration: filters.duration?.min === range.min ? undefined : { min: range.min, max: range.max }
                  })}
                  className="text-sm text-gray-700 group-hover:text-teal-600"
                >
                  {range.label}
                </button>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-semibold text-gray-900">Rating</span>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.includes('rating') ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.includes('rating') && (
          <div className="mt-3 space-y-2">
            {[4.5, 4, 3.5, 3].map(rating => (
              <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  filters.rating === rating
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-gray-300 group-hover:border-teal-400'
                }`}>
                  {filters.rating === rating && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <button
                  onClick={() => onFilterChange({ 
                    rating: filters.rating === rating ? undefined : rating 
                  })}
                  className="flex items-center gap-1 text-sm text-gray-700 group-hover:text-teal-600"
                >
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{rating}+ & above</span>
                </button>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      {activeFiltersCount > 0 && (
        <button
          onClick={onReset}
          className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className={`hidden lg:block ${className}`}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </h2>
            <span className="text-sm text-gray-500">{totalResults} trips</span>
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full shadow-xl hover:bg-gray-800 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-6 h-6 bg-teal-500 rounded-full text-sm flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">Filters</h2>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <FilterContent />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-full py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors"
              >
                Show {totalResults} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Filters;
