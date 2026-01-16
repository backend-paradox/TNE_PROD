import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  FileText,
  Eye,
  Download,
  MessageCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadBookingHistory } from '../store/slices/bookingSlice';
import { formatCurrency, formatDuration, formatDate } from '../utils';
import { Booking, BookingStatus } from '../types';
import './MyBookingsPage.css';

const statusConfig: Record<BookingStatus, { label: string; className: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', className: 'pending', icon: Clock3 },
  confirmed: { label: 'Confirmed', className: 'confirmed', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', className: 'cancelled', icon: XCircle },
  completed: { label: 'Completed', className: 'completed', icon: CheckCircle2 },
};

export function MyBookingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const bookingHistory = useAppSelector((state) => state.booking.bookingHistory);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'price'>('date-desc');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    dispatch(loadBookingHistory());
  }, [dispatch, isAuthenticated, navigate]);

  // Filter and sort bookings
  const filteredBookings = bookingHistory
    .filter((booking) => {
      const matchesSearch =
        booking.trip?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.trip?.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price':
          return b.pricing.total - a.pricing.total;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const upcomingCount = bookingHistory.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookingHistory.filter((b) => b.status === 'completed').length;
  const cancelledCount = bookingHistory.filter((b) => b.status === 'cancelled').length;

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-bookings-header"
        >
          <h1 className="my-bookings-title">My Bookings</h1>
          <p className="my-bookings-subtitle">View and manage all your trip bookings</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="my-bookings-stats"
        >
          <div className="stats-card">
            <div className="stats-card-content">
              <div className="stats-card-icon orange">
                <FileText />
              </div>
              <div>
                <p className="stats-card-number">{bookingHistory.length}</p>
                <p className="stats-card-label">Total Bookings</p>
              </div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-card-content">
              <div className="stats-card-icon green">
                <CheckCircle2 />
              </div>
              <div>
                <p className="stats-card-number">{upcomingCount}</p>
                <p className="stats-card-label">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-card-content">
              <div className="stats-card-icon blue">
                <CheckCircle2 />
              </div>
              <div>
                <p className="stats-card-number">{completedCount}</p>
                <p className="stats-card-label">Completed</p>
              </div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-card-content">
              <div className="stats-card-icon red">
                <XCircle />
              </div>
              <div>
                <p className="stats-card-number">{cancelledCount}</p>
                <p className="stats-card-label">Cancelled</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="my-bookings-filters"
        >
          <div className="my-bookings-filters-inner">
            {/* Search */}
            <div className="my-bookings-search">
              <Search />
              <input
                type="text"
                placeholder="Search by booking ID, destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="my-bookings-filter-selects">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="price">Highest Price</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="my-bookings-empty"
          >
            <div className="my-bookings-empty-icon">
              <FileText />
            </div>
            <h3>No bookings found</h3>
            <p>
              {bookingHistory.length === 0
                ? "You haven't made any bookings yet. Start exploring amazing trips!"
                : 'No bookings match your search criteria.'}
            </p>
            {bookingHistory.length === 0 && (
              <Link to="/destinations" className="my-bookings-explore-btn">
                Explore Destinations
                <ArrowRight />
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="my-bookings-list">
            <AnimatePresence>
              {filteredBookings.map((booking, index) => (
                <BookingCard key={booking.id} booking={booking} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const trip = booking.trip;
  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      toast.error('PDF is only available for confirmed bookings');
      return;
    }

    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/bookings/${booking.id}/pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TNE-${booking.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Itinerary downloaded successfully!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download itinerary');
    } finally {
      setIsDownloading(false);
    }
  };

  const isDownloadEnabled = booking.status === 'confirmed' || booking.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="booking-card"
    >
      <div className="booking-card-inner">
        {/* Image */}
        {trip && (
          <div className="booking-card-image">
            <img
              src={trip.thumbnail}
              alt={trip.title}
            />
          </div>
        )}

        {/* Content */}
        <div className="booking-card-content">
          <div className="booking-card-header">
            <div>
              {/* Status Badge */}
              <div className={`booking-status-badge ${status.className}`}>
                <StatusIcon />
                {status.label}
              </div>
              {trip && (
                <>
                  <h3 className="booking-card-title">{trip.title}</h3>
                  <div className="booking-card-location">
                    <MapPin />
                    {trip.destination}, {trip.country}
                  </div>
                </>
              )}
            </div>

            <div className="booking-card-id">
              <p className="booking-card-id-label">Booking ID</p>
              <p className="booking-card-id-value">{booking.id}</p>
            </div>
          </div>

          {/* Details */}
          <div className="booking-card-meta">
            {trip && (
              <div className="booking-card-meta-item">
                <Clock />
                {formatDuration(trip.duration.days, trip.duration.nights)}
              </div>
            )}
            <div className="booking-card-meta-item">
              <Calendar />
              {formatDate(booking.travelDate)}
            </div>
            <div className="booking-card-meta-item">
              <Users />
              {booking.totalTravelers.adults + booking.totalTravelers.children + booking.totalTravelers.infants} Travelers
            </div>
          </div>

          {/* Footer */}
          <div className="booking-card-footer">
            <div>
              <p className="booking-card-total-label">Total Amount</p>
              <p className="booking-card-total-amount">{formatCurrency(booking.pricing.total)}</p>
            </div>

            <div className="booking-card-actions">
              <Link
                to={`/booking/confirmation/${booking.id}`}
                className="booking-view-btn"
              >
                <Eye />
                View Details
              </Link>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading || !isDownloadEnabled}
                className={`booking-download-btn ${isDownloadEnabled && !isDownloading ? 'active' : 'disabled'}`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="spinning" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MyBookingsPage;
