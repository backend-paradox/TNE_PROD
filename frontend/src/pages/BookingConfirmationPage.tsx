import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Download,
  Share2,
  MapPin,
  Clock,
  Calendar,
  Users,
  Phone,
  Mail,
  Printer,
  ArrowRight,
  Home,
  FileText,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { formatCurrency, formatDuration, formatDate } from '../utils';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import './BookingConfirmationPage.css';

export function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const bookingHistory = useAppSelector((state) => state.booking.bookingHistory);
  const [showConfetti, setShowConfetti] = useState(false); // Start as false, trigger after confirmation
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'confirmed' | 'failed' | 'timeout'>('pending');
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxPollingAttempts = 30; // Poll for 30 seconds (30 attempts * 1 second)

  const booking = bookingHistory.find((b) => b.id === bookingId);

  // Poll booking status from backend (to check for webhook updates)
  useEffect(() => {
    if (!bookingId) return;

    // Function to check booking status
    const checkBookingStatus = async () => {
      try {
        // In production, this would call: GET /api/v1/bookings/:id
        // For now, simulate checking the Redux store

        if (booking && booking.status === 'confirmed' && booking.paymentStatus === 'completed') {
          // Booking is confirmed!
          setBookingStatus('confirmed');
          setShowConfetti(true);

          // Clear polling interval
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          toast.success('Booking confirmed successfully!', { icon: '✅', duration: 4000 });
          return;
        }

        // Increment polling attempts
        setPollingAttempts((prev) => prev + 1);

        // Check if we've exceeded max attempts
        if (pollingAttempts >= maxPollingAttempts) {
          setBookingStatus('timeout');

          // Clear polling interval
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          toast.error('Booking confirmation is taking longer than expected. Please check your email or contact support.', {
            duration: 6000,
          });
        }
      } catch (error) {
        console.error('Error checking booking status:', error);
        setBookingStatus('failed');

        // Clear polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    // Check immediately on mount
    checkBookingStatus();

    // Set up polling interval (every 1 second)
    pollingIntervalRef.current = setInterval(checkBookingStatus, 1000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [bookingId, booking, pollingAttempts, maxPollingAttempts]);

  useEffect(() => {
    if (showConfetti) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#f97316', '#ec4899', '#8b5cf6', '#10b981'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#f97316', '#ec4899', '#8b5cf6', '#10b981'],
        });
      }, 250);

      setShowConfetti(false);

      return () => clearInterval(interval);
    }
  }, [showConfetti]);

  // Show pending state while confirming booking
  if (bookingStatus === 'pending') {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="confirmation-pending"
          >
            <Loader2 className="confirmation-pending-spinner" />
            <h1>Confirming Your Booking...</h1>
            <p>Please wait while we process your payment confirmation.</p>
            <p className="confirmation-pending-note">This usually takes just a few seconds.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show timeout state if confirmation takes too long
  if (bookingStatus === 'timeout') {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="confirmation-timeout"
          >
            <AlertCircle className="confirmation-timeout-icon" />
            <h1>Booking Confirmation Delayed</h1>
            <p>Your payment was successful, but confirmation is taking longer than expected.</p>
            <p>Please check your email for confirmation or contact our support team.</p>
            <div className="confirmation-timeout-actions">
              <Link to="/my-bookings" className="confirmation-timeout-btn">
                <FileText />
                View My Bookings
              </Link>
              <Link to="/" className="confirmation-timeout-btn-secondary">
                <Home />
                Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show failed state if confirmation fails
  if (bookingStatus === 'failed') {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="confirmation-failed"
          >
            <AlertCircle className="confirmation-failed-icon" />
            <h1>Booking Confirmation Failed</h1>
            <p>There was an error confirming your booking. Please contact our support team.</p>
            <p>Booking ID: {bookingId}</p>
            <div className="confirmation-failed-actions">
              <Link to="/" className="confirmation-failed-btn">
                <Home />
                Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="confirmation-not-found">
        <div className="confirmation-not-found-content">
          <h1>Booking not found</h1>
          <p>The booking you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="confirmation-home-btn">
            <Home />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const trip = booking.trip;

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="confirmation-header"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="confirmation-success-icon"
          >
            <CheckCircle2 />
          </motion.div>
          <h1>Booking Confirmed!</h1>
          <p>
            Your trip to {trip?.destination} has been successfully booked
          </p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="confirmation-card"
        >
          {/* Booking ID Header */}
          <div className="confirmation-card-header">
            <div className="confirmation-card-header-inner">
              <div>
                <p className="confirmation-booking-ref-label">Booking Reference</p>
                <p className="confirmation-booking-ref-value">{booking.id}</p>
              </div>
              <div className="confirmation-status-badges">
                <span className="confirmation-status-badge">
                  {booking.status}
                </span>
                <span className="confirmation-payment-badge">
                  Payment Complete
                </span>
              </div>
            </div>
          </div>

          {/* Trip Info */}
          {trip && (
            <div className="confirmation-trip-section">
              <div className="confirmation-trip-inner">
                <img
                  src={trip.thumbnail}
                  alt={trip.title}
                  className="confirmation-trip-image"
                />
                <div className="confirmation-trip-info">
                  <h2 className="confirmation-trip-title">{trip.title}</h2>
                  <div className="confirmation-trip-details">
                    <div className="confirmation-trip-detail">
                      <MapPin />
                      <span>{trip.destination}, {trip.country}</span>
                    </div>
                    <div className="confirmation-trip-detail">
                      <Clock />
                      <span>{formatDuration(trip.duration.days, trip.duration.nights)}</span>
                    </div>
                    <div className="confirmation-trip-detail">
                      <Calendar />
                      <span>{formatDate(booking.travelDate)}</span>
                    </div>
                    <div className="confirmation-trip-detail">
                      <Users />
                      <span>
                        {booking.totalTravelers.adults} Adult
                        {booking.totalTravelers.adults !== 1 ? 's' : ''}
                        {booking.totalTravelers.children > 0 &&
                          `, ${booking.totalTravelers.children} Child${booking.totalTravelers.children !== 1 ? 'ren' : ''}`}
                        {booking.totalTravelers.infants > 0 &&
                          `, ${booking.totalTravelers.infants} Infant${booking.totalTravelers.infants !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="confirmation-contact-section">
            <h3 className="confirmation-section-title">Contact Information</h3>
            <div className="confirmation-contact-grid">
              <div className="confirmation-contact-item">
                <div className="confirmation-contact-icon blue">
                  <Users />
                </div>
                <div>
                  <p className="confirmation-contact-label">Name</p>
                  <p className="confirmation-contact-value">{booking.contact.name}</p>
                </div>
              </div>
              <div className="confirmation-contact-item">
                <div className="confirmation-contact-icon green">
                  <Mail />
                </div>
                <div>
                  <p className="confirmation-contact-label">Email</p>
                  <p className="confirmation-contact-value">{booking.contact.email}</p>
                </div>
              </div>
              <div className="confirmation-contact-item">
                <div className="confirmation-contact-icon purple">
                  <Phone />
                </div>
                <div>
                  <p className="confirmation-contact-label">Phone</p>
                  <p className="confirmation-contact-value">{booking.contact.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Travelers */}
          <div className="confirmation-travelers-section">
            <h3 className="confirmation-section-title">Travelers</h3>
            <div className="confirmation-travelers-list">
              {booking.travelers.map((traveler, index) => (
                <div
                  key={traveler.id}
                  className="confirmation-traveler-row"
                >
                  <div className="confirmation-traveler-info">
                    <span className={`confirmation-traveler-number ${traveler.type}`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="confirmation-traveler-name">
                        {traveler.firstName} {traveler.lastName}
                      </p>
                      <p className="confirmation-traveler-type">
                        {traveler.type} • {traveler.gender}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="confirmation-payment-section">
            <h3 className="confirmation-section-title">Payment Summary</h3>
            <div className="confirmation-payment-rows">
              <div className="confirmation-payment-row">
                <span className="confirmation-payment-row-label">Subtotal</span>
                <span className="confirmation-payment-row-value">{formatCurrency(booking.pricing.subtotal)}</span>
              </div>
              <div className="confirmation-payment-row">
                <span className="confirmation-payment-row-label">Taxes & Fees</span>
                <span className="confirmation-payment-row-value">{formatCurrency(booking.pricing.taxes)}</span>
              </div>
              <div className="confirmation-payment-row">
                <span className="confirmation-payment-row-label">Service Fee</span>
                <span className="confirmation-payment-row-value">{formatCurrency(booking.pricing.serviceFee)}</span>
              </div>
              {booking.pricing.discount > 0 && (
                <div className="confirmation-payment-row discount">
                  <span className="confirmation-payment-row-label">Promo Discount</span>
                  <span className="confirmation-payment-row-value">-{formatCurrency(booking.pricing.discount)}</span>
                </div>
              )}
              <div className="confirmation-payment-total">
                <span className="confirmation-payment-total-label">Total Paid</span>
                <span className="confirmation-payment-total-value">
                  {formatCurrency(booking.pricing.total)}
                </span>
              </div>
              <div className="confirmation-transaction-row">
                <span>Transaction ID</span>
                <span className="confirmation-transaction-id">{booking.transactionId}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="confirmation-actions"
        >
          <button className="confirmation-action-btn">
            <Download className="orange" />
            <span>Download PDF</span>
          </button>
          <button className="confirmation-action-btn">
            <Printer className="blue" />
            <span>Print</span>
          </button>
          <button className="confirmation-action-btn">
            <Share2 className="green" />
            <span>Share</span>
          </button>
          <button className="confirmation-action-btn">
            <MessageCircle className="purple" />
            <span>Support</span>
          </button>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="confirmation-whats-next"
        >
          <h3>What's Next?</h3>
          <div className="confirmation-steps">
            <div className="confirmation-step">
              <div className="confirmation-step-number">
                <span>1</span>
              </div>
              <div className="confirmation-step-content">
                <p>Confirmation Email Sent</p>
                <p>
                  We've sent a confirmation email to {booking.contact.email} with all the details.
                </p>
              </div>
            </div>
            <div className="confirmation-step">
              <div className="confirmation-step-number">
                <span>2</span>
              </div>
              <div className="confirmation-step-content">
                <p>Prepare Documents</p>
                <p>
                  Make sure all travelers have valid ID proofs and travel documents ready.
                </p>
              </div>
            </div>
            <div className="confirmation-step">
              <div className="confirmation-step-number">
                <span>3</span>
              </div>
              <div className="confirmation-step-content">
                <p>Get Ready for Your Trip</p>
                <p>
                  We'll contact you 2 days before departure with final itinerary details.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="confirmation-cta"
        >
          <Link to="/my-bookings" className="confirmation-cta-secondary">
            <FileText />
            View My Bookings
          </Link>
          <Link to="/destinations" className="confirmation-cta-primary">
            Explore More Destinations
            <ArrowRight />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default BookingConfirmationPage;
