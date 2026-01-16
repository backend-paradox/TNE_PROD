import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, X, TrendingUp, Clock } from 'lucide-react';
import { useSearch, useClickOutside } from '../../hooks';
import { Trip } from '../../types';
import { formatCurrency, formatDuration } from '../../utils';

interface SearchBarProps {
  variant?: 'default' | 'hero' | 'compact';
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

const popularSearches = [
  'Kashmir', 'Goa', 'Kerala', 'Dubai', 'Thailand', 'Ladakh', 'Rajasthan', 'Andaman'
];

const recentSearches = [
  'Beach holidays', 'Honeymoon packages', 'Adventure trips'
];

export function SearchBar({ 
  variant = 'default', 
  placeholder = 'Search destinations, trips...', 
  onSearch,
  className = '' 
}: SearchBarProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { query, results, isSearching, handleSearch, clearSearch } = useSearch(300);

  useClickOutside(containerRef, () => setIsOpen(false));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
      setIsOpen(false);
    }
  };

  const handleResultClick = (trip: Trip) => {
    navigate(`/trip/${trip.slug}`);
    clearSearch();
    setIsOpen(false);
  };

  const handleQuickSearch = (term: string) => {
    handleSearch(term);
    if (onSearch) {
      onSearch(term);
    } else {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
    setIsOpen(false);
  };

  if (variant === 'hero') {
    return (
      <div ref={containerRef} className={`relative w-full max-w-3xl ${className}`}>
        <form onSubmit={handleSubmit}>
          <div className={`
            flex items-center gap-3 bg-white rounded-2xl shadow-2xl p-2 pl-6
            transition-all duration-300
            ${isFocused ? 'ring-2 ring-teal-500 shadow-teal-200' : ''}
          `}>
            <Search className="w-6 h-6 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => { setIsFocused(true); setIsOpen(true); }}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="flex-1 text-lg text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-300/50 transition-all"
            >
              Search
            </button>
          </div>
        </form>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-gray-500">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Matching Trips
                </div>
                {results.slice(0, 5).map(trip => (
                  <button
                    key={trip.id}
                    onClick={() => handleResultClick(trip)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-teal-50 transition-colors text-left"
                  >
                    <img
                      src={trip.thumbnail}
                      alt={trip.title}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{trip.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{trip.destination}</span>
                        <span>•</span>
                        <span>{formatDuration(trip.duration.days, trip.duration.nights)}</span>
                      </div>
                    </div>
                    <span className="text-teal-600 font-bold whitespace-nowrap">
                      {formatCurrency(trip.price.adult)}
                    </span>
                  </button>
                ))}
                {results.length > 5 && (
                  <button
                    onClick={handleSubmit}
                    className="w-full p-4 text-center text-teal-600 font-medium hover:bg-teal-50 transition-colors border-t border-gray-100"
                  >
                    View all {results.length} results →
                  </button>
                )}
              </div>
            ) : query ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No trips found for "{query}"</p>
                <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="py-4">
                {/* Popular Searches */}
                <div className="px-4 py-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    <TrendingUp className="w-4 h-4" />
                    Popular Destinations
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map(term => (
                      <button
                        key={term}
                        onClick={() => handleQuickSearch(term)}
                        className="px-4 py-2 bg-gray-100 hover:bg-teal-100 hover:text-teal-700 rounded-full text-sm text-gray-700 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                <div className="px-4 py-2 mt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map(term => (
                      <button
                        key={term}
                        onClick={() => handleQuickSearch(term)}
                        className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors text-left"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default/Compact variant
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className={`
          flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5
          transition-all duration-200
          ${isFocused ? 'border-teal-500 ring-2 ring-teal-100' : 'hover:border-gray-300'}
          ${variant === 'compact' ? 'py-2' : ''}
        `}>
          <Search className={`text-gray-400 flex-shrink-0 ${variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => { setIsFocused(true); setIsOpen(true); }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400 ${
              variant === 'compact' ? 'text-sm' : ''
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown for default variant */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {results.slice(0, 5).map(trip => (
            <button
              key={trip.id}
              onClick={() => handleResultClick(trip)}
              className="w-full flex items-center gap-3 p-3 hover:bg-teal-50 transition-colors text-left"
            >
              <img
                src={trip.thumbnail}
                alt={trip.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm truncate">{trip.title}</h4>
                <div className="text-xs text-gray-500">{trip.destination}</div>
              </div>
              <span className="text-teal-600 font-semibold text-sm">
                {formatCurrency(trip.price.adult)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
