import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  Users,
  Calendar,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Shield,
  Award,
  Phone,
  MessageCircle,
  Loader2,
  ArrowRight,
  Sun,
  Moon,
  Utensils,
  Home,
} from 'lucide-react';
import { enrichedTripsData } from '../data/trips';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { calculatePricing, setTravelDate, setTravelers, setTrip } from '../store/slices/bookingSlice';
import { setLoginModalOpen } from '../store/slices/uiSlice';
import { useWishlist } from '../hooks';
import { formatCurrency, formatDuration, formatDate } from '../utils';
import { Trip } from '../types';
import toast from 'react-hot-toast';
import './TripDetailsPage.css';

export function TripDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { isSaved, toggleSave } = useWishlist();

  const [trip, setTripData] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [travelers, setTravelersLocal] = useState({ adults: 2, children: 0, infants: 0 });
  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const travelerRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const foundTrip = enrichedTripsData.find((t) => t.slug === slug);
    if (foundTrip) {
      setTripData(foundTrip);
      dispatch(setTrip(foundTrip));
      if (foundTrip.startDates.length > 0) {
        setSelectedDate(foundTrip.startDates[0]);
      }
    }
    setLoading(false);
  }, [dispatch, slug]);

  useEffect(() => {
    if (trip) {
      dispatch(setTravelers(travelers));
      dispatch(calculatePricing());
    }
  }, [dispatch, travelers, trip]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (travelerRef.current && !travelerRef.current.contains(event.target as Node)) {
        setShowTravelerDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      dispatch(setLoginModalOpen(true));
      return;
    }
    if (trip) {
      dispatch(setTrip(trip));
      dispatch(setTravelDate(selectedDate));
      dispatch(setTravelers(travelers));
      dispatch(calculatePricing());
      navigate('/booking', { state: { tripData: trip } });
    }
  };

  const updateTravelers = (type: 'adults' | 'children' | 'infants', delta: number) => {
    setTravelersLocal((prev) => ({
      ...prev,
      [type]: Math.max(type === 'adults' ? 1 : 0, prev[type] + delta),
    }));
  };

  const totalTravelers = travelers.adults + travelers.children + travelers.infants;
  const estimatedPrice =
    trip ?
      travelers.adults * trip.price.adult +
      travelers.children * trip.price.child +
      travelers.infants * trip.price.infant
    : 0;
  const hasRating = Number.isFinite(trip?.rating);
  const hasReviews = Number.isFinite(trip?.reviewCount);

  if (loading) {
    return (
      <div className="trip-details-loading">
        <Loader2 />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="trip-details-not-found">
        <h1>Trip not found</h1>
        <Link to="/destinations">
          Browse all destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="trip-details-page">
      {/* Image Gallery */}
      <div className="trip-gallery">
        <div className="trip-gallery-container">
          <div className="trip-gallery-main">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={trip.images[selectedImage]}
                alt={trip.title}
                className="trip-gallery-image"
              />
            </AnimatePresence>
            <div className="trip-gallery-overlay" />

            {/* Gallery Navigation */}
            {trip.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev === 0 ? trip.images.length - 1 : prev - 1))}
                  className="trip-gallery-nav prev"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev === trip.images.length - 1 ? 0 : prev + 1))}
                  className="trip-gallery-nav next"
                >
                  <ChevronRight />
                </button>
              </>
            )}

            {/* Thumbnail Navigation */}
            <div className="trip-gallery-thumbs">
              {trip.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`trip-gallery-thumb ${selectedImage === idx ? 'active' : ''}`}
                >
                  <img src={trip.images[idx]} alt="" />
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="trip-gallery-actions">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please login to save to wishlist', { icon: '🔒' });
                    navigate(`/auth?type=login&redirect=${encodeURIComponent(window.location.pathname)}`);
                    return;
                  }
                  toggleSave(trip.id);
                }}
                className={`trip-action-btn wishlist ${isSaved(trip.id) ? 'saved' : ''}`}
              >
                <Heart className={isSaved(trip.id) ? 'fill-current' : ''} />
              </button>
              <button className="trip-action-btn share">
                <Share2 />
              </button>
            </div>

            {/* Title Overlay */}
            <div className="trip-gallery-info">
              <div className="trip-gallery-info-inner">
                <div className="trip-location">
                  <MapPin />
                  <span>{trip.destination}, {trip.country}</span>
                </div>
                <h1 className="trip-title">{trip.title}</h1>
                <div className="trip-meta-badges">
                  {hasRating && (
                    <div className="trip-meta-badge rating">
                      <Star />
                      <span>{trip.rating}</span>
                      {hasReviews && (
                        <span className="reviews">({trip.reviewCount} reviews)</span>
                      )}
                    </div>
                  )}
                  <div className="trip-meta-badge duration">
                    <Clock />
                    <span>{formatDuration(trip.duration.days, trip.duration.nights)}</span>
                  </div>
                  <div className="trip-meta-badge group">
                    <Users />
                    <span>Max {trip.maxGroupSize}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="trip-content">
        <div className="trip-layout">
          {/* Left Content */}
          <div className="trip-main">
            {/* Overview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="trip-card"
            >
              <h2 className="trip-card-title">Overview</h2>
              <p className="trip-description">{trip.description}</p>

              {/* Trip Types */}
              <div className="trip-types">
                {trip.tripType.map((type) => (
                  <span key={type} className="trip-type-badge">
                    {type}
                  </span>
                ))}
              </div>
            </motion.section>

            {/* Highlights */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="trip-card"
            >
              <h2 className="trip-card-title">Highlights</h2>
              <div className="trip-highlights-grid">
                {trip.highlights.map((highlight, idx) => (
                  <div key={idx} className="trip-highlight-item">
                    <div className="trip-highlight-icon">
                      <Check />
                    </div>
                    <span className="trip-highlight-text">{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Itinerary */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="trip-card"
            >
              <h2 className="trip-card-title">Day by Day Itinerary</h2>
              <div className="trip-itinerary-list">
                {trip.itinerary.map((day, idx) => (
                  <div key={idx} className="trip-itinerary-day">
                    <button
                      onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                      className="trip-itinerary-header"
                    >
                      <div className="trip-itinerary-header-left">
                        <div className="trip-itinerary-day-badge">
                          <span>D{day.day}</span>
                        </div>
                        <div className="trip-itinerary-day-info">
                          <h3 className="trip-itinerary-day-title">{day.title}</h3>
                          <p className="trip-itinerary-day-preview">{day.description}</p>
                        </div>
                      </div>
                      {expandedDay === idx ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    <AnimatePresence>
                      {expandedDay === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="trip-itinerary-content"
                        >
                          <p className="trip-itinerary-description">{day.description}</p>

                          {/* Activities */}
                          <div className="trip-itinerary-activities">
                            <h4>Activities</h4>
                            <div className="trip-itinerary-activities-list">
                              {day.activities.map((activity, aIdx) => (
                                <span key={aIdx} className="trip-activity-badge">
                                  {activity}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Meals & Accommodation */}
                          <div className="trip-itinerary-meta">
                            {day.meals && day.meals.length > 0 && (
                              <div className="trip-itinerary-meta-item">
                                <Utensils />
                                <span>{day.meals.join(', ')}</span>
                              </div>
                            )}
                            {day.accommodation && (
                              <div className="trip-itinerary-meta-item">
                                <Home />
                                <span>{day.accommodation}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Inclusions & Exclusions */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="trip-inclusions-grid"
            >
              {/* Inclusions */}
              <div className="trip-card">
                <h2 className="trip-card-title with-icon">
                  <Check className="green" />
                  Inclusions
                </h2>
                <ul className="trip-inclusion-list">
                  {trip.inclusions.map((item, idx) => (
                    <li key={idx} className="trip-inclusion-item">
                      <Check className="green" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="trip-card">
                <h2 className="trip-card-title with-icon">
                  <X className="red" />
                  Exclusions
                </h2>
                <ul className="trip-inclusion-list">
                  {trip.exclusions.map((item, idx) => (
                    <li key={idx} className="trip-inclusion-item">
                      <X className="red" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* Additional Info */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="trip-card"
            >
              <h2 className="trip-card-title">Good to Know</h2>
              <div className="trip-info-grid">
                <div className="trip-info-item">
                  <h3>Best Season</h3>
                  <p>{trip.bestSeason}</p>
                </div>
                <div className="trip-info-item">
                  <h3>Difficulty Level</h3>
                  <p>{trip.difficulty}</p>
                </div>
                <div className="trip-info-item full-width">
                  <h3>Cancellation Policy</h3>
                  <p>{trip.cancellationPolicy}</p>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Booking Widget - Sticky Sidebar */}
          <div className="trip-sidebar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="trip-booking-card"
            >
              {/* Price */}
              <div className="trip-price-section">
                <div className="trip-price-row">
                  {trip.price.originalPrice && (
                    <span className="trip-original-price">
                      {formatCurrency(trip.price.originalPrice)}
                    </span>
                  )}
                  <span className="trip-current-price">
                    {formatCurrency(trip.price.adult)}
                  </span>
                  <span className="trip-price-per">/person</span>
                </div>
                {trip.price.discount && (
                  <span className="trip-discount-badge">
                    Save {trip.price.discount}%
                  </span>
                )}
              </div>

              {/* Date Selection */}
              <div className="trip-selector" ref={dateRef}>
                <label className="trip-selector-label">
                  Select Travel Date
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className="trip-selector-btn"
                  >
                    <div className="trip-selector-btn-left">
                      <Calendar />
                      <span className={selectedDate ? '' : 'placeholder'}>
                        {selectedDate ? formatDate(selectedDate) : 'Select date'}
                      </span>
                    </div>
                    <ChevronDown className={showDateDropdown ? 'open' : ''} />
                  </button>

                  <AnimatePresence>
                    {showDateDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="trip-dropdown"
                      >
                        {trip.startDates.map((date) => (
                          <button
                            key={date}
                            onClick={() => {
                              setSelectedDate(date);
                              setShowDateDropdown(false);
                            }}
                            className={`trip-dropdown-option ${selectedDate === date ? 'selected' : ''}`}
                          >
                            <span>{formatDate(date)}</span>
                            {selectedDate === date && <Check />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Traveler Selection */}
              <div className="trip-selector" ref={travelerRef}>
                <label className="trip-selector-label">
                  Travelers
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowTravelerDropdown(!showTravelerDropdown)}
                    className="trip-selector-btn"
                  >
                    <div className="trip-selector-btn-left">
                      <Users />
                      <span>
                        {totalTravelers} Traveler{totalTravelers !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <ChevronDown className={showTravelerDropdown ? 'open' : ''} />
                  </button>

                  <AnimatePresence>
                    {showTravelerDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="trip-traveler-dropdown"
                      >
                        {/* Adults */}
                        <div className="trip-traveler-row">
                          <div className="trip-traveler-info">
                            <p>Adults</p>
                            <p>Age 12+</p>
                          </div>
                          <div className="trip-traveler-controls">
                            <button
                              onClick={() => updateTravelers('adults', -1)}
                              disabled={travelers.adults <= 1}
                              className="trip-traveler-btn"
                            >
                              <Minus />
                            </button>
                            <span className="trip-traveler-count">{travelers.adults}</span>
                            <button
                              onClick={() => updateTravelers('adults', 1)}
                              className="trip-traveler-btn"
                            >
                              <Plus />
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="trip-traveler-row">
                          <div className="trip-traveler-info">
                            <p>Children</p>
                            <p>Age 2-11</p>
                          </div>
                          <div className="trip-traveler-controls">
                            <button
                              onClick={() => updateTravelers('children', -1)}
                              disabled={travelers.children <= 0}
                              className="trip-traveler-btn"
                            >
                              <Minus />
                            </button>
                            <span className="trip-traveler-count">{travelers.children}</span>
                            <button
                              onClick={() => updateTravelers('children', 1)}
                              className="trip-traveler-btn"
                            >
                              <Plus />
                            </button>
                          </div>
                        </div>

                        {/* Infants */}
                        <div className="trip-traveler-row">
                          <div className="trip-traveler-info">
                            <p>Infants</p>
                            <p>Under 2</p>
                          </div>
                          <div className="trip-traveler-controls">
                            <button
                              onClick={() => updateTravelers('infants', -1)}
                              disabled={travelers.infants <= 0}
                              className="trip-traveler-btn"
                            >
                              <Minus />
                            </button>
                            <span className="trip-traveler-count">{travelers.infants}</span>
                            <button
                              onClick={() => updateTravelers('infants', 1)}
                              className="trip-traveler-btn"
                            >
                              <Plus />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="trip-price-breakdown">
                <div className="trip-price-breakdown-rows">
                  {travelers.adults > 0 && (
                    <div className="trip-price-breakdown-row">
                      <span>Adults × {travelers.adults}</span>
                      <span>{formatCurrency(travelers.adults * trip.price.adult)}</span>
                    </div>
                  )}
                  {travelers.children > 0 && (
                    <div className="trip-price-breakdown-row">
                      <span>Children × {travelers.children}</span>
                      <span>{formatCurrency(travelers.children * trip.price.child)}</span>
                    </div>
                  )}
                  {travelers.infants > 0 && (
                    <div className="trip-price-breakdown-row">
                      <span>Infants × {travelers.infants}</span>
                      <span>{formatCurrency(travelers.infants * trip.price.infant)}</span>
                    </div>
                  )}
                </div>
                <div className="trip-price-total">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(estimatedPrice)}</span>
                </div>
                <p className="trip-price-note">*Taxes and fees will be calculated at checkout</p>
              </div>

              {/* Trust Badges */}
              <div className="trip-trust-section">
                <div className="trip-trust-item">
                  <Shield className="green" />
                  <span>Secure booking with instant confirmation</span>
                </div>
                <div className="trip-trust-item">
                  <Award className="blue" />
                  <span>Best price guarantee</span>
                </div>
                <div className="trip-trust-item">
                  <Phone className="purple" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripDetailsPage;
