import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchHotels, searchFlights, searchBuses, searchEvents } from '../features/catalog/catalogSlice';
import { formatCurrency } from '../utils/helpers';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './SearchResults.css';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { searchResults, loading, error, searchType } = useSelector((state) => state.catalog);

  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    rating: 0,
    sortBy: 'price-asc',
  });

  useEffect(() => {
    const type = searchParams.get('type');
    const params = {};

    // Build params object from search params
    searchParams.forEach((value, key) => {
      if (key !== 'type') {
        params[key] = value;
      }
    });

    // Dispatch appropriate search action
    if (type === 'hotels') {
      dispatch(searchHotels(params));
    } else if (type === 'flights') {
      dispatch(searchFlights(params));
    } else if (type === 'buses') {
      dispatch(searchBuses(params));
    } else if (type === 'events') {
      dispatch(searchEvents(params));
    }
  }, [searchParams, dispatch]);

  const handleItemClick = (item) => {
    const type = searchParams.get('type');
    navigate(`/${type}/${item.id}`);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const getFilteredAndSortedResults = () => {
    let results = [...searchResults];

    // Apply price filter
    results = results.filter(
      (item) => item.basePrice >= filters.priceRange[0] && item.basePrice <= filters.priceRange[1]
    );

    // Apply rating filter
    if (filters.rating > 0) {
      results = results.filter((item) => (item.rating || 0) >= filters.rating);
    }

    // Apply sorting
    if (filters.sortBy === 'price-asc') {
      results.sort((a, b) => a.basePrice - b.basePrice);
    } else if (filters.sortBy === 'price-desc') {
      results.sort((a, b) => b.basePrice - a.basePrice);
    } else if (filters.sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return results;
  };

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={handleRetry} />;

  const filteredResults = getFilteredAndSortedResults();
  const type = searchParams.get('type');

  return (
    <div className="search-results-page">
      <div className="container">
        <div className="search-header">
          <h1>
            {searchResults.length} {type} found
          </h1>
          <div className="sort-controls">
            <label>Sort by:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        <div className="search-content">
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3>Filters</h3>

              <div className="filter-group">
                <label>Price Range</label>
                <div className="price-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange: [Number(e.target.value), filters.priceRange[1]],
                      })
                    }
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange: [filters.priceRange[0], Number(e.target.value)],
                      })
                    }
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Minimum Rating</label>
                <div className="rating-filter">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      className={`rating-btn ${filters.rating === rating ? 'active' : ''}`}
                      onClick={() => setFilters({ ...filters, rating })}
                    >
                      {rating}⭐ & up
                    </button>
                  ))}
                  <button
                    className={`rating-btn ${filters.rating === 0 ? 'active' : ''}`}
                    onClick={() => setFilters({ ...filters, rating: 0 })}
                  >
                    All
                  </button>
                </div>
              </div>

              <button
                className="btn btn-outline btn-block"
                onClick={() => setFilters({ priceRange: [0, 50000], rating: 0, sortBy: 'price-asc' })}
              >
                Clear Filters
              </button>
            </div>
          </aside>

          <main className="results-main">
            {filteredResults.length === 0 ? (
              <div className="no-results">
                <h2>No results found</h2>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="results-grid">
                {filteredResults.map((item) => (
                  <div
                    key={item.id}
                    className="result-card"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="result-image">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/300x200'}
                        alt={item.name}
                      />
                      {item.rating && (
                        <div className="rating-badge">{item.rating}⭐</div>
                      )}
                    </div>
                    <div className="result-content">
                      <h3>{item.name}</h3>
                      <p className="location">📍 {item.location || item.origin}</p>

                      {type === 'hotels' && (
                        <div className="amenities">
                          {item.amenities?.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="amenity-tag">{amenity}</span>
                          ))}
                        </div>
                      )}

                      {type === 'flights' && (
                        <div className="flight-info">
                          <span>{item.origin} → {item.destination}</span>
                          <span>{item.airline}</span>
                        </div>
                      )}

                      <div className="result-footer">
                        <div className="price">
                          <span className="price-label">From</span>
                          <span className="price-amount">{formatCurrency(item.basePrice)}</span>
                        </div>
                        <button className="btn btn-primary btn-sm">View Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
