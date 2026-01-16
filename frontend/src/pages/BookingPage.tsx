import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  CreditCard,
  Shield,
  Tag,
  Loader2,
  AlertCircle,
  X,
  Gift,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addTravelerDetail,
  applyPromoCode,
  calculatePricing,
  createBooking,
  confirmBooking,
  confirmBookingLocal,
  setContact,
  setStep,
  setTrip,
  updateTravelerDetail,
} from '../store/slices/bookingSlice';
import { formatCurrency, formatDuration, formatDate, generateId } from '../utils';
import { Traveler, TravelerType } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import { useRazorpay } from '../hooks/useRazorpay';
import './BookingPage.css';

const steps = [
  { id: 1, title: 'Traveler Details', icon: User },
  { id: 2, title: 'Review', icon: Check },
  { id: 3, title: 'Payment', icon: CreditCard },
];

export function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);
  const isCreatingBooking = useAppSelector((state) => state.booking.isCreatingBooking);
  const isConfirmingBooking = useAppSelector((state) => state.booking.isConfirmingBooking);
  const { isLoaded: isRazorpayLoaded, openRazorpay } = useRazorpay();

  // Get trip from Redux or router state
  const tripFromRouter = location.state?.tripData;
  const { trip, travelDate, travelers, travelerDetails, contact, pricing, step, promoCode } = currentBooking;

  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoError, setPromoError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form state
  const [contactForm, setContactForm] = useState({
    name: contact?.name || user?.name || '',
    email: contact?.email || user?.email || '',
    phone: contact?.phone || user?.phone || '',
    alternatePhone: contact?.alternatePhone || '',
  });

  useEffect(() => {
    // If trip is null in Redux but available in router state, set it in Redux
    if (!trip && tripFromRouter) {
      dispatch(setTrip(tripFromRouter));
      return;
    }

    // If no trip data at all, redirect to destinations
    if (!trip && !tripFromRouter) {
      console.log('No trip data found, redirecting to destinations');
      navigate('/destinations');
      return;
    }

    // Calculate pricing if trip exists
    if (trip) {
      dispatch(calculatePricing());
    }
  }, [dispatch, trip, tripFromRouter, navigate]);

  useEffect(() => {
    // Initialize traveler details if empty
    if (travelerDetails.length === 0 && trip) {
      const initialTravelers: Traveler[] = [];

      for (let i = 0; i < travelers.adults; i++) {
        initialTravelers.push({
          id: generateId(),
          type: 'adult',
          firstName: i === 0 && user?.name ? user.name.split(' ')[0] : '',
          lastName: i === 0 && user?.name ? user.name.split(' ').slice(1).join(' ') : '',
          email: i === 0 ? user?.email || '' : '',
          phone: i === 0 ? user?.phone || '' : '',
          dateOfBirth: '',
          gender: '',
          nationality: 'Indian',
        });
      }

      for (let i = 0; i < travelers.children; i++) {
        initialTravelers.push({
          id: generateId(),
          type: 'child',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          nationality: 'Indian',
        });
      }

      for (let i = 0; i < travelers.infants; i++) {
        initialTravelers.push({
          id: generateId(),
          type: 'infant',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          nationality: 'Indian',
        });
      }

      initialTravelers.forEach((t) => dispatch(addTravelerDetail(t)));
    }
  }, []);

  const updateTraveler = (id: string, field: string, value: string) => {
    dispatch(updateTravelerDetail({ id, data: { [field]: value } }));
  };

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    try {
      const success = await dispatch(applyPromoCode({ code: promoInput })).unwrap();
      if (success) {
        toast.success(`Promo code ${promoInput.toUpperCase()} applied!`);
        setPromoError('');
      } else {
        setPromoError('Invalid promo code');
        toast.error('Invalid promo code');
      }
    } catch (error) {
      setPromoError('Failed to apply promo code');
      toast.error('Failed to apply promo code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const validateStep1 = () => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Phone validation regex (Indian format: 10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;

    // Validate contact info
    if (!contactForm.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }

    if (!contactForm.email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }

    if (!emailRegex.test(contactForm.email.trim())) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!contactForm.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }

    // Remove spaces and special characters from phone for validation
    const cleanPhone = contactForm.phone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return false;
    }

    // Validate alternate phone if provided
    if (contactForm.alternatePhone.trim()) {
      const cleanAltPhone = contactForm.alternatePhone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanAltPhone)) {
        toast.error('Please enter a valid alternate phone number');
        return false;
      }
    }

    // Validate traveler details
    for (let i = 0; i < travelerDetails.length; i++) {
      const traveler = travelerDetails[i];
      const travelerNum = travelerDetails.filter((t, idx) => t.type === traveler.type && idx <= i).length;
      const travelerLabel = `${traveler.type.charAt(0).toUpperCase() + traveler.type.slice(1)} ${travelerNum}`;

      if (!traveler.firstName.trim()) {
        toast.error(`Please enter first name for ${travelerLabel}`);
        return false;
      }

      if (!traveler.lastName.trim()) {
        toast.error(`Please enter last name for ${travelerLabel}`);
        return false;
      }

      if (!traveler.gender) {
        toast.error(`Please select gender for ${travelerLabel}`);
        return false;
      }

      if (!traveler.dateOfBirth) {
        toast.error(`Please enter date of birth for ${travelerLabel}`);
        return false;
      }

      // Validate age based on traveler type
      const birthDate = new Date(traveler.dateOfBirth);
      const today = new Date();
      const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      if (traveler.type === 'adult' && age < 12) {
        toast.error(`${travelerLabel} must be at least 12 years old`);
        return false;
      }

      if (traveler.type === 'child' && (age < 2 || age >= 12)) {
        toast.error(`${travelerLabel} must be between 2-11 years old`);
        return false;
      }

      if (traveler.type === 'infant' && age >= 2) {
        toast.error(`${travelerLabel} must be under 2 years old`);
        return false;
      }

      // Validate email for adult travelers (first adult already validated in contact)
      if (traveler.type === 'adult' && traveler.email && !emailRegex.test(traveler.email.trim())) {
        toast.error(`Please enter a valid email for ${travelerLabel}`);
        return false;
      }

      // Validate phone for adult travelers
      if (traveler.type === 'adult' && traveler.phone) {
        const cleanTravelerPhone = traveler.phone.replace(/[\s\-\(\)]/g, '');
        if (!phoneRegex.test(cleanTravelerPhone)) {
          toast.error(`Please enter a valid phone number for ${travelerLabel}`);
          return false;
        }
      }

      // Check if international trip requires passport
      if (trip?.country && trip.country.toLowerCase() !== 'india') {
        if (traveler.type === 'adult' && !traveler.passportNumber?.trim()) {
          toast.error(`Passport number required for ${travelerLabel} (International trip)`);
          return false;
        }
      }
    }

    // Save contact info
    dispatch(setContact({
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone.trim(),
      alternatePhone: contactForm.alternatePhone.trim(),
    }));

    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    dispatch(setStep(Math.min(step + 1, 3)));
  };

  const handleBack = () => {
    dispatch(setStep(Math.max(step - 1, 1)));
  };

  const handlePaymentClick = () => {
    if (!pricing || !contact) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept the Terms & Conditions to proceed');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);

    try {
      // Step 1: Create booking in database (PENDING status)
      toast.loading('Creating your booking...', { id: 'booking-create' });

      const bookingResult = await dispatch(createBooking()).unwrap();
      const bookingId = bookingResult.id;

      toast.dismiss('booking-create');
      toast.success('Booking created! Processing payment...', { duration: 2000 });

      // Step 2: Check if Razorpay is available for real payment
      const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
      const USE_DUMMY_PAYMENT = !RAZORPAY_KEY || RAZORPAY_KEY === 'rzp_test_demo_key' || !isRazorpayLoaded;

      if (USE_DUMMY_PAYMENT) {
        // Dummy payment flow for development/demo
        toast.loading('Processing dummy payment...', { id: 'payment-process' });

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate dummy payment details
        const dummyPaymentId = `pay_dummy_${Date.now()}`;
        const dummyTransactionId = `txn_dummy_${Date.now()}`;

        toast.dismiss('payment-process');

        // Step 3: Confirm booking with dummy payment details
        toast.loading('Confirming booking...', { id: 'booking-confirm' });

        const confirmedBooking = await dispatch(confirmBooking({
          bookingId,
          paymentId: dummyPaymentId,
          transactionId: dummyTransactionId,
        })).unwrap();

        toast.dismiss('booking-confirm');
        toast.success('Booking confirmed successfully!', { icon: '✅', duration: 3000 });

        // Navigate to confirmation page
        setTimeout(() => {
          navigate(`/booking/confirmation/${confirmedBooking.id}`);
        }, 1000);
      } else {
        // Real Razorpay payment flow
        // Map payment method to Razorpay method
        const razorpayMethod = paymentMethod === 'card' ? 'card' : paymentMethod === 'upi' ? 'upi' : 'netbanking';

        const options = {
          key: RAZORPAY_KEY,
          amount: pricing.total * 100, // Amount in paise
          currency: 'INR',
          name: 'Trip & Event',
          description: `Booking for ${trip?.title || 'Tour Package'}`,
          image: '/logo.png',
          method: razorpayMethod, // Pre-select payment method
          prefill: {
            name: contact.name,
            email: contact.email,
            contact: contact.phone,
          },
          notes: {
            bookingId: String(bookingId),
            tripId: trip?.id || '',
            tripTitle: trip?.title || '',
            travelers: `${travelers.adults} adults, ${travelers.children} children`,
          },
          theme: {
            color: '#3b82f6',
          },
          handler: async (response: any) => {
            // Payment successful
            console.log('Payment Success:', response);

            try {
              toast.loading('Confirming booking...', { id: 'booking-confirm' });

              // Confirm booking with real payment details
              const confirmedBooking = await dispatch(confirmBooking({
                bookingId,
                paymentId: response.razorpay_payment_id,
                transactionId: response.razorpay_order_id || `TXN-${Date.now()}`,
              })).unwrap();

              toast.dismiss('booking-confirm');
              toast.success('Payment successful! Booking confirmed.', {
                icon: '✅',
                duration: 4000,
              });

              // Navigate to confirmation page
              setTimeout(() => {
                navigate(`/booking/confirmation/${confirmedBooking.id}`);
              }, 1500);
            } catch (error: any) {
              console.error('Booking confirmation error:', error);
              const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';

              if (error?.response?.status === 404) {
                toast.error('Booking not found. Please contact support with your payment ID.', { duration: 5000 });
              } else if (error?.response?.status === 400) {
                toast.error(`Confirmation failed: ${errorMessage}. Please contact support.`, { duration: 5000 });
              } else if (error?.message?.includes('network') || error?.code === 'ERR_NETWORK') {
                toast.error('Network error. Payment received but confirmation pending. Please check your bookings.', { duration: 5000 });
              } else {
                toast.error('Payment received but booking confirmation failed. Please contact support.', { duration: 5000 });
              }
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              toast.error('Payment cancelled. Your booking is saved and can be completed later.', { icon: '❌' });
            },
          },
        };

        // Open Razorpay checkout
        openRazorpay(options);
      }
    } catch (error: any) {
      console.error('Booking/Payment error:', error);
      toast.dismiss();

      // Provide specific error messages based on error type
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred';
      const statusCode = error?.response?.status;

      if (statusCode === 400) {
        // Bad request - validation errors
        toast.error(`Invalid booking data: ${errorMessage}`, { duration: 5000 });
      } else if (statusCode === 401 || statusCode === 403) {
        // Authentication/Authorization errors
        toast.error('Please log in to continue with your booking.', { duration: 4000 });
        setTimeout(() => navigate('/auth'), 2000);
      } else if (statusCode === 404) {
        // Package not found
        toast.error('Package not found. Please try selecting a different package.', { duration: 4000 });
        setTimeout(() => navigate('/destinations'), 2000);
      } else if (statusCode === 409) {
        // Conflict - e.g., package not available for selected dates
        toast.error(`Booking conflict: ${errorMessage}`, { duration: 5000 });
      } else if (statusCode === 500 || statusCode === 503) {
        // Server errors
        toast.error('Our servers are experiencing issues. Please try again in a few minutes.', { duration: 5000 });
      } else if (error?.code === 'ERR_NETWORK' || error?.message?.toLowerCase().includes('network')) {
        // Network errors
        toast.error('Network connection lost. Please check your internet and try again.', { duration: 5000 });
      } else if (error?.message?.toLowerCase().includes('timeout')) {
        // Timeout errors
        toast.error('Request timed out. Please check your connection and try again.', { duration: 5000 });
      } else {
        // Generic error
        toast.error(`Booking failed: ${errorMessage}. Please try again or contact support.`, { duration: 5000 });
      }

      setIsProcessing(false);
    }
  };

  if (!trip) {
    return (
      <div className="booking-loading">
        <Loader2 />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="booking-header">
        <div className="booking-header-container">
          {/* Progress Steps */}
          <div className="booking-progress">
            {steps.map((s, index) => (
              <React.Fragment key={s.id}>
                <div className="booking-step">
                  <div className={`booking-step-icon ${step >= s.id ? 'active' : ''}`}>
                    {step > s.id ? <Check /> : <s.icon />}
                  </div>
                  <span className={`booking-step-title ${step >= s.id ? 'active' : ''}`}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`booking-step-line ${step > s.id ? 'completed' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="booking-content">
        <div className="booking-layout">
          {/* Main Content */}
          <div className="booking-main">
            <AnimatePresence mode="wait">
              {/* Step 1: Traveler Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Contact Information */}
                  <div className="booking-card">
                    <h2 className="booking-card-title">
                      <Phone />
                      Contact Information
                    </h2>
                    <p className="booking-card-subtitle">
                      Booking confirmation will be sent to this contact
                    </p>
                    <div className="booking-form-grid">
                      <div className="booking-form-group">
                        <label className="booking-form-label">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="booking-form-input"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="booking-form-group">
                        <label className="booking-form-label">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="booking-form-input"
                          placeholder="Enter email"
                        />
                      </div>
                      <div className="booking-form-group">
                        <label className="booking-form-label">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="booking-form-input"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div className="booking-form-group">
                        <label className="booking-form-label">
                          Alternate Phone
                        </label>
                        <input
                          type="tel"
                          value={contactForm.alternatePhone}
                          onChange={(e) => setContactForm({ ...contactForm, alternatePhone: e.target.value })}
                          className="booking-form-input"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Traveler Details */}
                  <div className="booking-card">
                    <h2 className="booking-card-title">
                      <Users />
                      Traveler Details
                    </h2>

                    <div className="booking-travelers-list">
                      {travelerDetails.map((traveler, index) => (
                        <div key={traveler.id} className="booking-traveler-card">
                          <div className="booking-traveler-header">
                            <span className={`booking-traveler-badge ${traveler.type}`}>
                              {traveler.type.charAt(0).toUpperCase() + traveler.type.slice(1)} {
                                travelerDetails.filter((t) => t.type === traveler.type).indexOf(traveler) + 1
                              }
                            </span>
                            <span className="booking-traveler-age">
                              {traveler.type === 'adult' ? '(12+ years)' : traveler.type === 'child' ? '(2-11 years)' : '(Under 2)'}
                            </span>
                          </div>

                          <div className="booking-form-grid">
                            <div className="booking-form-group">
                              <label className="booking-form-label">
                                First Name *
                              </label>
                              <input
                                type="text"
                                value={traveler.firstName}
                                onChange={(e) => updateTraveler(traveler.id, 'firstName', e.target.value)}
                                className="booking-form-input"
                                placeholder="Enter first name"
                              />
                            </div>
                            <div className="booking-form-group">
                              <label className="booking-form-label">
                                Last Name *
                              </label>
                              <input
                                type="text"
                                value={traveler.lastName}
                                onChange={(e) => updateTraveler(traveler.id, 'lastName', e.target.value)}
                                className="booking-form-input"
                                placeholder="Enter last name"
                              />
                            </div>
                            <div className="booking-form-group">
                              <label className="booking-form-label">
                                Gender *
                              </label>
                              <select
                                value={traveler.gender}
                                onChange={(e) => updateTraveler(traveler.id, 'gender', e.target.value)}
                                className="booking-form-select"
                              >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div className="booking-form-group">
                              <label className="booking-form-label">
                                Date of Birth
                              </label>
                              <input
                                type="date"
                                value={traveler.dateOfBirth}
                                onChange={(e) => updateTraveler(traveler.id, 'dateOfBirth', e.target.value)}
                                className="booking-form-input"
                              />
                            </div>
                            <div className="booking-form-group">
                              <label className="booking-form-label">
                                Nationality
                              </label>
                              <input
                                type="text"
                                value={traveler.nationality}
                                onChange={(e) => updateTraveler(traveler.id, 'nationality', e.target.value)}
                                className="booking-form-input"
                                placeholder="Enter nationality"
                              />
                            </div>
                            {traveler.type === 'adult' && (
                              <div className="booking-form-group">
                                <label className="booking-form-label">
                                  Passport Number
                                </label>
                                <input
                                  type="text"
                                  value={traveler.passportNumber || ''}
                                  onChange={(e) => updateTraveler(traveler.id, 'passportNumber', e.target.value)}
                                  className="booking-form-input"
                                  placeholder="For international trips"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="booking-card">
                    <h2 className="booking-card-title">Review Your Booking</h2>

                    {/* Trip Summary */}
                    <div className="booking-review-trip">
                      <img
                        src={trip.thumbnail}
                        alt={trip.title}
                        className="booking-review-trip-image"
                      />
                      <div>
                        <h3 className="booking-review-trip-title">{trip.title}</h3>
                        <div className="booking-review-trip-location">
                          <MapPin />
                          {trip.destination}, {trip.country}
                        </div>
                        <div className="booking-review-trip-details">
                          <span>
                            <Clock />
                            {formatDuration(trip.duration.days, trip.duration.nights)}
                          </span>
                          <span>
                            <Calendar />
                            {formatDate(travelDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Summary */}
                    <div className="booking-contact-summary">
                      <h3>Contact Information</h3>
                      <div className="booking-contact-grid">
                        <div>
                          <span>Name:</span>
                          <span>{contactForm.name}</span>
                        </div>
                        <div>
                          <span>Email:</span>
                          <span>{contactForm.email}</span>
                        </div>
                        <div>
                          <span>Phone:</span>
                          <span>{contactForm.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Travelers Summary */}
                    <div className="booking-travelers-summary">
                      <h3>Travelers</h3>
                      <div className="booking-travelers-summary-list">
                        {travelerDetails.map((traveler, index) => (
                          <div
                            key={traveler.id}
                            className="booking-traveler-summary-row"
                          >
                            <div className="booking-traveler-summary-info">
                              <span className={`booking-traveler-summary-number ${traveler.type}`}>
                                {index + 1}
                              </span>
                              <div>
                                <p className="booking-traveler-summary-name">
                                  {traveler.firstName} {traveler.lastName}
                                </p>
                                <p className="booking-traveler-summary-type">
                                  {traveler.type} • {traveler.gender}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="booking-promo">
                    <h3 className="booking-promo-title">
                      <Gift />
                      Have a Promo Code?
                    </h3>
                    <div className="booking-promo-form">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="booking-promo-input"
                        disabled={isApplyingPromo}
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo}
                        className="booking-promo-btn"
                      >
                        {isApplyingPromo ? (
                          <>
                            <Loader2 className="spinning" />
                            Applying...
                          </>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {promoError && (
                      <p className="booking-promo-error">
                        <AlertCircle />
                        {promoError}
                      </p>
                    )}
                    {pricing?.promoCode && !promoError && (
                      <p className="booking-promo-success">
                        <Check />
                        Code {pricing.promoCode} applied - You save {formatCurrency(pricing.discount)}!
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="booking-card">
                    <h2 className="booking-card-title">Payment Method</h2>

                    <div className="booking-payment-methods">
                      {/* Card Payment */}
                      <label className={`booking-payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                        />
                        <CreditCard className="booking-payment-icon" />
                        <div>
                          <p className="booking-payment-label">Credit / Debit Card</p>
                          <p className="booking-payment-desc">Visa, Mastercard, RuPay</p>
                        </div>
                      </label>

                      {/* UPI Payment */}
                      <label className={`booking-payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                        />
                        <div className="booking-payment-icon-box">
                          UPI
                        </div>
                        <div>
                          <p className="booking-payment-label">UPI</p>
                          <p className="booking-payment-desc">Google Pay, PhonePe, Paytm</p>
                        </div>
                      </label>

                      {/* Net Banking */}
                      <label className={`booking-payment-option ${paymentMethod === 'netbanking' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="netbanking"
                          checked={paymentMethod === 'netbanking'}
                          onChange={() => setPaymentMethod('netbanking')}
                        />
                        <div className="booking-payment-icon-box">
                          🏦
                        </div>
                        <div>
                          <p className="booking-payment-label">Net Banking</p>
                          <p className="booking-payment-desc">All major banks supported</p>
                        </div>
                      </label>
                    </div>

                    {/* Dummy Card Form */}
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="booking-card-form"
                      >
                        <div className="booking-card-form-grid">
                          <div className="booking-card-form-full">
                            <label className="booking-form-label">
                              Card Number
                            </label>
                            <input
                              type="text"
                              placeholder="4111 1111 1111 1111"
                              className="booking-form-input"
                            />
                          </div>
                          <div className="booking-form-group">
                            <label className="booking-form-label">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="booking-form-input"
                            />
                          </div>
                          <div className="booking-form-group">
                            <label className="booking-form-label">
                              CVV
                            </label>
                            <input
                              type="text"
                              placeholder="123"
                              className="booking-form-input"
                            />
                          </div>
                          <div className="booking-card-form-full">
                            <label className="booking-form-label">
                              Card Holder Name
                            </label>
                            <input
                              type="text"
                              placeholder="Name on card"
                              className="booking-form-input"
                            />
                          </div>
                        </div>
                        <p className="booking-card-form-note">
                          <Shield />
                          This is a demo. No real payment will be processed.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="booking-terms">
                    <label className="booking-terms-label">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                      />
                      <span className="booking-terms-text">
                        I agree to the{' '}
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          Terms & Conditions
                        </a>{' '}
                        and{' '}
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          Cancellation Policy
                        </a>
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="booking-nav">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="booking-back-btn"
                >
                  <ChevronLeft />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="booking-next-btn"
                >
                  Continue
                  <ChevronRight />
                </button>
              ) : (
                <button
                  onClick={handlePaymentClick}
                  disabled={isProcessing || isCreatingBooking || isConfirmingBooking}
                  className="booking-pay-btn"
                >
                  {isProcessing || isCreatingBooking || isConfirmingBooking ? (
                    <>
                      <Loader2 className="spinning" />
                      {isCreatingBooking ? 'Creating Booking...' : isConfirmingBooking ? 'Confirming...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      Pay {formatCurrency(pricing?.total || 0)}
                      <Shield />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div className="booking-sidebar">
            <div className="booking-price-card">
              <h3 className="booking-price-title">Price Summary</h3>

              {/* Trip Mini Card */}
              <div className="booking-trip-mini">
                <img
                  src={trip.thumbnail}
                  alt={trip.title}
                  className="booking-trip-mini-image"
                />
                <div className="booking-trip-mini-info">
                  <h4 className="booking-trip-mini-title">{trip.title}</h4>
                  <p className="booking-trip-mini-duration">
                    {formatDuration(trip.duration.days, trip.duration.nights)}
                  </p>
                </div>
              </div>

              {/* Date & Travelers */}
              <div className="booking-price-meta">
                <div className="booking-price-meta-row">
                  <span className="booking-price-meta-label">
                    <Calendar />
                    Travel Date
                  </span>
                  <span className="booking-price-meta-value">{formatDate(travelDate)}</span>
                </div>
                <div className="booking-price-meta-row">
                  <span className="booking-price-meta-label">
                    <Users />
                    Travelers
                  </span>
                  <span className="booking-price-meta-value">
                    {travelers.adults + travelers.children + travelers.infants}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              {pricing && (
                <div className="booking-price-breakdown">
                  {travelers.adults > 0 && (
                    <div className="booking-price-row">
                      <span className="booking-price-row-label">Adults × {travelers.adults}</span>
                      <span className="booking-price-row-value">{formatCurrency(pricing.adultTotal)}</span>
                    </div>
                  )}
                  {travelers.children > 0 && (
                    <div className="booking-price-row">
                      <span className="booking-price-row-label">Children × {travelers.children}</span>
                      <span className="booking-price-row-value">{formatCurrency(pricing.childTotal)}</span>
                    </div>
                  )}
                  {travelers.infants > 0 && (
                    <div className="booking-price-row">
                      <span className="booking-price-row-label">Infants × {travelers.infants}</span>
                      <span className="booking-price-row-value">{formatCurrency(pricing.infantTotal)}</span>
                    </div>
                  )}
                  <div className="booking-price-row booking-price-subtotal">
                    <span className="booking-price-row-label">Subtotal</span>
                    <span className="booking-price-row-value">{formatCurrency(pricing.subtotal)}</span>
                  </div>
                  <div className="booking-price-row">
                    <span className="booking-price-row-label">Taxes & Fees (18%)</span>
                    <span className="booking-price-row-value">{formatCurrency(pricing.taxes)}</span>
                  </div>
                  <div className="booking-price-row">
                    <span className="booking-price-row-label">Service Fee</span>
                    <span className="booking-price-row-value">{formatCurrency(pricing.serviceFee)}</span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="booking-price-row discount">
                      <span className="booking-price-row-label">
                        <Tag />
                        Promo Discount
                      </span>
                      <span className="booking-price-row-value">-{formatCurrency(pricing.discount)}</span>
                    </div>
                  )}
                  <div className="booking-price-total">
                    <span className="booking-price-total-label">Total Amount</span>
                    <span className="booking-price-total-value">
                      {formatCurrency(pricing.total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="booking-trust">
                <div className="booking-trust-item">
                  <Shield className="green" />
                  <span>Secure payment</span>
                </div>
                <div className="booking-trust-item">
                  <Check className="blue" />
                  <span>Instant confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="booking-modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="booking-modal-backdrop"
              onClick={() => setShowConfirmModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="booking-modal"
            >
              <div className="booking-modal-header">
                <h3>Confirm Payment</h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="booking-modal-close"
                >
                  <X />
                </button>
              </div>
              <div className="booking-modal-body">
                <p className="booking-modal-text">
                  You are about to make a payment of <strong>{formatCurrency(pricing?.total || 0)}</strong> for:
                </p>
                <div className="booking-modal-trip">
                  <img
                    src={trip?.thumbnail}
                    alt={trip?.title}
                    className="booking-modal-trip-image"
                  />
                  <div>
                    <h4>{trip?.title}</h4>
                    <p>
                      {travelers.adults} Adult{travelers.adults > 1 ? 's' : ''}
                      {travelers.children > 0 && `, ${travelers.children} Child${travelers.children > 1 ? 'ren' : ''}`}
                      {travelers.infants > 0 && `, ${travelers.infants} Infant${travelers.infants > 1 ? 's' : ''}`}
                    </p>
                    <p>Travel Date: {formatDate(travelDate)}</p>
                  </div>
                </div>
                {pricing && pricing.discount > 0 && (
                  <div className="booking-modal-promo">
                    <Tag />
                    <span>Promo code {pricing.promoCode} applied - You save {formatCurrency(pricing.discount)}</span>
                  </div>
                )}
                <p className="booking-modal-note">
                  <Shield />
                  Your payment will be processed securely. Click "Proceed to Payment" to continue.
                </p>
              </div>
              <div className="booking-modal-footer">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="booking-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="booking-modal-confirm"
                >
                  <CreditCard />
                  Proceed to Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BookingPage;
