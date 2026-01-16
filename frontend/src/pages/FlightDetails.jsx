import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFlightById, getPricing } from '../features/catalog/catalogSlice';
import { formatCurrency } from '../utils/helpers';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './HotelDetails.css';

export default function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedItem: flight, pricing, loading, error } = useSelector((state) => state.catalog);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getFlightById(id));
    dispatch(getPricing({ resourceType: 'FLIGHT', resourceId: id, date: new Date().toISOString(), quantity: 1 }));
  }, [id, dispatch]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { item: flight, type: 'flight', pricing } });
  };

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message={error} />;
  if (!flight) return null;

  return (
    <div className="hotel-details-page">
      <div className="details-hero">
        <div className="hero-gallery">
          <img src={flight.images?.[0] || 'https://via.placeholder.com/800x400'} alt={flight.airline} />
        </div>
      </div>

      <div className="container">
        <div className="details-content">
          <main className="details-main">
            <div className="details-header">
              <div>
                <h1>{flight.airline} - {flight.flightNumber}</h1>
                <p className="location">📍 {flight.origin} → {flight.destination}</p>
                {flight.rating && (
                  <div className="rating-display">
                    {flight.rating}⭐ ({flight.reviewCount || 0} reviews)
                  </div>
                )}
              </div>
            </div>

            <div className="details-section">
              <h2>Flight Information</h2>
              <div className="amenities-grid">
                <div className="amenity-item">🛫 Departure: {flight.departureTime}</div>
                <div className="amenity-item">🛬 Arrival: {flight.arrivalTime}</div>
                <div className="amenity-item">⏱️ Duration: {flight.duration || 'N/A'}</div>
                <div className="amenity-item">💺 Class: {flight.class || 'Economy'}</div>
              </div>
            </div>

            <div className="details-section">
              <h2>Baggage Allowance</h2>
              <ul className="rules-list">
                <li>Cabin: 7 kg</li>
                <li>Check-in: 15 kg</li>
                <li>Extra baggage available at additional cost</li>
              </ul>
            </div>

            <div className="details-section">
              <h2>Cancellation Policy</h2>
              <p>Free cancellation up to 24 hours before departure. Partial refund available for cancellations made within 24 hours.</p>
            </div>
          </main>

          <aside className="details-sidebar">
            <div className="booking-card">
              <div className="booking-price">
                <span className="price-label">Price per passenger</span>
                <span className="price-amount">
                  {formatCurrency(pricing?.finalPrice || flight.basePrice)}
                </span>
              </div>

              <div className="booking-features">
                <div className="feature-item">✓ Instant confirmation</div>
                <div className="feature-item">✓ E-ticket delivery</div>
                <div className="feature-item">✓ 24/7 support</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
