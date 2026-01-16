import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hotels');
  const [searchParams, setSearchParams] = useState({
    hotels: { location: '', checkIn: '', checkOut: '', guests: 1 },
    flights: { origin: '', destination: '', date: '', passengers: 1 },
    buses: { origin: '', destination: '', date: '', passengers: 1 },
    events: { location: '', date: '', category: '' },
  });

  const handleInputChange = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      type: activeTab,
      ...searchParams[activeTab],
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Your Journey Begins Here</h1>
            <p className="hero-subtitle">
              Discover amazing hotels, flights, buses, and events at the best prices
            </p>

            <div className="search-card">
              <div className="search-tabs">
                <button
                  className={`tab ${activeTab === 'hotels' ? 'active' : ''}`}
                  onClick={() => setActiveTab('hotels')}
                >
                  🏨 Hotels
                </button>
                <button
                  className={`tab ${activeTab === 'flights' ? 'active' : ''}`}
                  onClick={() => setActiveTab('flights')}
                >
                  ✈️ Flights
                </button>
                <button
                  className={`tab ${activeTab === 'buses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('buses')}
                >
                  🚌 Buses
                </button>
                <button
                  className={`tab ${activeTab === 'events' ? 'active' : ''}`}
                  onClick={() => setActiveTab('events')}
                >
                  🎉 Events
                </button>
              </div>

              <form onSubmit={handleSearch} className="search-form">
                {activeTab === 'hotels' && (
                  <div className="form-row">
                    <div className="form-field">
                      <label>Location</label>
                      <input
                        type="text"
                        placeholder="Where are you going?"
                        value={searchParams.hotels.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Check In</label>
                      <input
                        type="date"
                        value={searchParams.hotels.checkIn}
                        onChange={(e) => handleInputChange('checkIn', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Check Out</label>
                      <input
                        type="date"
                        value={searchParams.hotels.checkOut}
                        onChange={(e) => handleInputChange('checkOut', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Guests</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={searchParams.hotels.guests}
                        onChange={(e) => handleInputChange('guests', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'flights' && (
                  <div className="form-row">
                    <div className="form-field">
                      <label>From</label>
                      <input
                        type="text"
                        placeholder="Origin city"
                        value={searchParams.flights.origin}
                        onChange={(e) => handleInputChange('origin', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>To</label>
                      <input
                        type="text"
                        placeholder="Destination city"
                        value={searchParams.flights.destination}
                        onChange={(e) => handleInputChange('destination', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Date</label>
                      <input
                        type="date"
                        value={searchParams.flights.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Passengers</label>
                      <input
                        type="number"
                        min="1"
                        max="9"
                        value={searchParams.flights.passengers}
                        onChange={(e) => handleInputChange('passengers', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'buses' && (
                  <div className="form-row">
                    <div className="form-field">
                      <label>From</label>
                      <input
                        type="text"
                        placeholder="Origin city"
                        value={searchParams.buses.origin}
                        onChange={(e) => handleInputChange('origin', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>To</label>
                      <input
                        type="text"
                        placeholder="Destination city"
                        value={searchParams.buses.destination}
                        onChange={(e) => handleInputChange('destination', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Date</label>
                      <input
                        type="date"
                        value={searchParams.buses.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Passengers</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={searchParams.buses.passengers}
                        onChange={(e) => handleInputChange('passengers', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'events' && (
                  <div className="form-row">
                    <div className="form-field">
                      <label>Location</label>
                      <input
                        type="text"
                        placeholder="City or venue"
                        value={searchParams.events.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Date</label>
                      <input
                        type="date"
                        value={searchParams.events.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Category</label>
                      <select
                        value={searchParams.events.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      >
                        <option value="">All Categories</option>
                        <option value="music">Music</option>
                        <option value="sports">Sports</option>
                        <option value="theater">Theater</option>
                        <option value="conference">Conference</option>
                      </select>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg search-button">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose TripAndEvent?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Get the best deals on hotels, flights, and more with our dynamic pricing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Booking</h3>
              <p>Your payments are safe with our encrypted payment gateway</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Confirmation</h3>
              <p>Get instant booking confirmation via email and SMS</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h3>Exclusive Deals</h3>
              <p>Access member-only discounts and special offers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
