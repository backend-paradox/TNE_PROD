import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getHotelById, getPricing } from '../features/catalog/catalogSlice';
import { formatCurrency } from '../utils/helpers';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './HotelDetails.css';

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedItem: hotel, pricing, loading, error } = useSelector((state) => state.catalog);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getHotelById(id));
    dispatch(getPricing({ resourceType: 'HOTEL', resourceId: id, date: new Date().toISOString(), quantity: 1 }));
  }, [id, dispatch]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { item: hotel, type: 'hotel', pricing } });
  };

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message={error} />;
  if (!hotel) return null;

  return (
    <div className="hotel-details-page">
      <div className="details-hero">
        <div className="hero-gallery">
          {hotel.images && hotel.images.length > 0 ? (
            hotel.images.map((img, idx) => (
              <img key={idx} src={img} alt={`${hotel.name} view ${idx + 1}`} />
            ))
          ) : (
            <img src="https://via.placeholder.com/800x400" alt={hotel.name} />
          )}
        </div>
      </div>

      <div className="container">
        <div className="details-content">
          <main className="details-main">
            <div className="details-header">
              <div>
                <h1>{hotel.name}</h1>
                <p className="location">📍 {hotel.location}</p>
                {hotel.rating && (
                  <div className="rating-display">
                    {hotel.rating}⭐ ({hotel.reviewCount || 0} reviews)
                  </div>
                )}
              </div>
            </div>

            <div className="details-section">
              <h2>About this property</h2>
              <p>{hotel.description || 'A wonderful place to stay during your visit.'}</p>
            </div>

            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="details-section">
                <h2>Amenities</h2>
                <div className="amenities-grid">
                  {hotel.amenities.map((amenity, idx) => (
                    <div key={idx} className="amenity-item">
                      ✓ {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="details-section">
              <h2>Property Rules</h2>
              <ul className="rules-list">
                <li>Check-in: 2:00 PM</li>
                <li>Check-out: 11:00 AM</li>
                <li>No smoking in rooms</li>
                <li>Pets allowed with prior approval</li>
              </ul>
            </div>
          </main>

          <aside className="details-sidebar">
            <div className="booking-card">
              <div className="booking-price">
                <span className="price-label">Starting from</span>
                <span className="price-amount">
                  {formatCurrency(pricing?.finalPrice || hotel.basePrice)}
                </span>
                <span className="price-unit">per night</span>
              </div>

              <div className="booking-features">
                <div className="feature-item">✓ Free cancellation</div>
                <div className="feature-item">✓ No prepayment needed</div>
                <div className="feature-item">✓ Instant confirmation</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
