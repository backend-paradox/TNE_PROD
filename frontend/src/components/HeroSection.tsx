import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, MicOff, Play, MapPin, ChevronDown, Globe, Home, Film, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMediaUrl } from '@/utils';
import { useLiveSearch, SearchCategory, SearchResult } from '@/hooks';
import './HeroSection.css';

// Category-specific popular suggestions
const popularDestinationsByCategory: Record<SearchCategory, string[]> = {
  all: ['Kashmir', 'Kerala', 'Goa', 'Bali', 'Thailand', 'Maldives'],
  domestic: ['Kashmir', 'Kerala', 'Goa', 'Rajasthan', 'Manali', 'Ladakh'],
  international: ['Bali', 'Thailand', 'Maldives', 'Dubai', 'Singapore', 'Vietnam'],
  cinetrip: ['Pre-Wedding', 'Honeymoon', 'Family Trip', 'Anniversary', 'Solo Travel', 'Babymoon'],
};

const categoryOptions: { value: SearchCategory; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Trips', shortLabel: 'All', icon: <Globe size={16} /> },
  { value: 'domestic', label: 'Domestic', shortLabel: 'India', icon: <Home size={16} /> },
  { value: 'international', label: 'International', shortLabel: 'World', icon: <Globe size={16} /> },
  { value: 'cinetrip', label: 'CineTrip', shortLabel: 'Cine', icon: <Film size={16} /> },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Live search hook
  const {
    query,
    category,
    results,
    isSearching,
    error,
    handleSearch,
    handleCategoryChange,
    clearSearch,
  } = useLiveSearch(300);

  // Lazy load video using Intersection Observer
  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadVideo) {
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before hero is visible
        threshold: 0.1,
      }
    );

    observer.observe(heroRef.current);

    return () => observer.disconnect();
  }, [shouldLoadVideo]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setVoiceSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (e: any) => {
        setDestination(e.results[0][0].transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        clearSearch();
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearSearch]);

  // Sync destination with live search query
  useEffect(() => {
    if (destination !== query) {
      handleSearch(destination);
    }
  }, [destination]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedResultIndex(-1);
  }, [results]);

  const toggleVoice = () => {
    if (!voiceSupported) {
      alert('Voice search is not supported in your browser. Please try Chrome, Edge, or Safari.');
      return;
    }
    isListening
      ? recognitionRef.current?.stop()
      : recognitionRef.current?.start();
    setIsListening(!isListening);
  };

  const handleFormSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // If a result is selected, navigate to it
    if (selectedResultIndex >= 0 && results[selectedResultIndex]) {
      navigateToResult(results[selectedResultIndex]);
      return;
    }
    // Otherwise navigate to trips page with search params
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (category !== 'all') params.set('category', category);
    navigate(`/trips${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const navigateToResult = (result: SearchResult) => {
    clearSearch();
    setDestination('');
    setShowSuggestions(false);
    if (result.type === 'cinetrip') {
      navigate(`/cinetrip/${result.slug}`);
    } else {
      navigate(`/package/${result.slug}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResultIndex(prev =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResultIndex(prev =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        if (selectedResultIndex >= 0 && results[selectedResultIndex]) {
          e.preventDefault();
          navigateToResult(results[selectedResultIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        clearSearch();
        break;
    }
  };

  const handleCategorySelect = (value: SearchCategory) => {
    handleCategoryChange(value);
    setShowCategoryDropdown(false);
    // Trigger new search with updated category
    if (destination) {
      handleSearch(destination);
    }
  };

  const selectedCategory = categoryOptions.find(opt => opt.value === category) || categoryOptions[0];

  return (
    <section className="hero" ref={heroRef}>
      {/* Video/Image Background */}
      <div className="hero__bg">
        {!videoError && shouldLoadVideo ? (
          <iframe
            className={`hero__video ${videoLoaded ? 'loaded' : ''}`}
            src="https://www.youtube.com/embed/-FpmQjNjL1Y?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=-FpmQjNjL1Y&modestbranding=1&playsinline=1&disablekb=1"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Trip & Event - World's First CineMatrip Travel Experiences"
            onLoad={() => setTimeout(() => setVideoLoaded(true), 1500)}
          />
        ) : (
          <img
            className="hero__image"
            src={getMediaUrl("/assets/images/hero/homepage_hero_beach.jpeg")}
            alt="Scenic travel destination background"
            loading="eager"
          />
        )}
        <div className="hero__overlay" />
      </div>

      {/* Main Content */}
      <div className="hero__container">
        <div className="hero__content">
          {/* Brand Badge */}
          <motion.div
            className="hero__badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Play size={14} />
            <span>WORLD FIRST CINEMATRIP BRAND</span>
          </motion.div>

          {/* Main Heading */}

          <motion.h2
            className="hero__subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Seamless journeys <br/> <span className="hero__highlight">Unforgettable</span> experiences{' '}
            
          </motion.h2>

          {/* Search Box */}
          <motion.div
            className="hero__search"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            ref={searchContainerRef}
          >
            <form onSubmit={handleFormSearch} className="hero__search-form">
              {/* Category Dropdown */}
              <div className="hero__category-dropdown" ref={categoryDropdownRef}>
                <button
                  type="button"
                  className="hero__category-btn"
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowSuggestions(false); // Close suggestions when opening category
                  }}
                  aria-expanded={showCategoryDropdown}
                  aria-haspopup="listbox"
                >
                  <span className="hero__category-icon">{selectedCategory.icon}</span>
                  <span className="hero__category-label">{selectedCategory.label}</span>
                  <span className="hero__category-short">{selectedCategory.shortLabel}</span>
                  <ChevronDown size={16} className={`hero__category-chevron ${showCategoryDropdown ? 'open' : ''}`} />
                </button>
                <AnimatePresence>
                  {showCategoryDropdown && (
                    <motion.div
                      className="hero__category-options"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      role="listbox"
                    >
                      {categoryOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`hero__category-option ${category === opt.value ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategorySelect(opt.value);
                          }}
                          role="option"
                          aria-selected={category === opt.value}
                        >
                          {opt.icon}
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hero__search-divider" />

              <div className="hero__search-field">
                <MapPin size={20} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onFocus={() => {
                    setShowSuggestions(true);
                    setShowCategoryDropdown(false); // Close category when focusing input
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Where do you want to go?"
                  aria-autocomplete="list"
                  aria-controls="search-results"
                  aria-expanded={showSuggestions && (results.length > 0 || isSearching)}
                />
                {isSearching && (
                  <Loader2 size={18} className="hero__search-loading" />
                )}
              </div>

              <button
                type="button"
                className={`hero__mic-btn ${isListening ? 'active' : ''}`}
                onClick={toggleVoice}
                aria-label={isListening ? "Stop voice search" : "Voice search for destinations"}
                aria-pressed={isListening}
                title={voiceSupported ? "Search destinations by voice" : "Voice search not supported"}
                disabled={!voiceSupported}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button type="submit" className="hero__search-btn" aria-label="Search destinations">
                <Search size={20} />
                <span>Search</span>
              </button>
            </form>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  className="hero__suggestions"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  id="search-results"
                  role="listbox"
                >
                  {/* Live Search Results */}
                  {results.length > 0 ? (
                    <>
                      <p className="hero__suggestions-title">Search Results</p>
                      <div className="hero__search-results">
                        {results.map((result, index) => (
                          <button
                            key={`${result.type}-${result.id}`}
                            type="button"
                            className={`hero__search-result ${selectedResultIndex === index ? 'selected' : ''}`}
                            onClick={() => navigateToResult(result)}
                            onMouseEnter={() => setSelectedResultIndex(index)}
                            role="option"
                            aria-selected={selectedResultIndex === index}
                          >
                            <img
                              src={result.image}
                              alt={result.name}
                              className="hero__search-result-image"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/placeholder.jpg';
                              }}
                            />
                            <div className="hero__search-result-info">
                              <span className="hero__search-result-name">{result.name}</span>
                              <span className="hero__search-result-location">
                                <MapPin size={12} />
                                {result.destination || result.state || result.category || 'Experience'}
                                {result.country && result.country !== 'India' && `, ${result.country}`}
                              </span>
                            </div>
                            <div className="hero__search-result-meta">
                              {result.type !== 'cinetrip' && (
                                <span className="hero__search-result-price">
                                  {result.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                                </span>
                              )}
                              <span className="hero__search-result-duration">{result.duration}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : isSearching ? (
                    <div className="hero__search-loading-state">
                      <Loader2 size={24} className="hero__search-loading" />
                      <p>Searching packages...</p>
                    </div>
                  ) : destination.length > 0 && !isSearching ? (
                    <div className="hero__search-empty">
                      <p>No packages found for "{destination}"</p>
                      <span>Try searching for "Kashmir", "Bali", or "Thailand"</span>
                    </div>
                  ) : (
                    <>
                      <p className="hero__suggestions-title">
                        {category === 'domestic' ? 'Popular in India' :
                         category === 'international' ? 'Popular International' :
                         category === 'cinetrip' ? 'Popular CineTrips' :
                         'Popular Destinations'}
                      </p>
                      <div className="hero__suggestions-list">
                        {popularDestinationsByCategory[category].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              setDestination(d);
                            }}
                          >
                            <MapPin size={16} />
                            {d}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>

      {/* Voice Modal */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="hero__voice-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleVoice}
            role="dialog"
            aria-modal="true"
            aria-label="Voice search active"
          >
            <motion.div
              className="hero__voice-card"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero__voice-icon hero__voice-icon--search" aria-hidden="true">
                <Mic size={32} />
              </div>
              <h3>Listening for destination...</h3>
              <p aria-live="polite">Say a destination name like "Bali", "Maldives", or "Kashmir"</p>
              <button onClick={toggleVoice} aria-label="Cancel voice search">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
