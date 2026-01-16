import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MapPin,
  Star,
  Clock,
  Trash2,
  ArrowLeft,
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  HeartOff,
  Compass,
} from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { useWishlist, WishlistItem } from '../hooks';
import { getMediaUrl } from '../utils';
import toast from 'react-hot-toast';
import './WishlistPage.css';

export function WishlistPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Filter and sort wishlist
  const filteredWishlist = wishlistItems
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.destination?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          // Sort by most recent (createdAt)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleRemove = async (item: WishlistItem) => {
    try {
      await removeFromWishlist(item.packageId, item.type);
      toast.success(`${item.name} removed from wishlist`, { icon: '💔' });
    } catch (error: any) {
      console.error('Failed to remove item:', error);

      // Only show error toast if it's not a network error (optimistic update handles network errors)
      if (error?.code !== 'ERR_NETWORK' && !error?.message?.toLowerCase().includes('network')) {
        if (error?.response?.status === 404) {
          toast.error('Item not found in wishlist');
        } else if (error?.response?.status === 401 || error?.response?.status === 403) {
          toast.error('Please log in to manage your wishlist');
        } else {
          toast.error('Failed to remove item. Please try again.');
        }
      }
    }
  };

  const handleClearAll = async () => {
    setShowClearConfirm(false);
    try {
      await clearWishlist();
      toast.success('Wishlist cleared successfully', { icon: '🗑️' });
    } catch (error: any) {
      console.error('Failed to clear wishlist:', error);

      // Only show error toast if it's not a network error
      if (error?.code !== 'ERR_NETWORK' && !error?.message?.toLowerCase().includes('network')) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          toast.error('Please log in to manage your wishlist');
        } else {
          toast.error('Failed to clear wishlist. Please try again.');
        }
      }
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="wishlist-page">
      {/* Hero Section */}
      <div className="wishlist-hero">
        <div className="wishlist-hero-overlay" />
        <div className="wishlist-hero-container">
          <button
            onClick={() => navigate(-1)}
            className="wishlist-back-btn"
          >
            <ArrowLeft />
            <span>Back</span>
          </button>

          <div className="wishlist-header">
            <div>
              <h1 className="wishlist-title">
                <Heart />
                My Wishlist
              </h1>
              <p className="wishlist-subtitle">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'trip' : 'trips'} saved for later
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="wishlist-clear-btn"
              >
                <Trash2 />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="wishlist-content">
        {wishlistItems.length > 0 ? (
          <>
            {/* Filters Bar */}
            <div className="wishlist-filters">
              <div className="wishlist-filters-inner">
                {/* Search */}
                <div className="wishlist-search">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search your wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Sort */}
                <div className="wishlist-sort">
                  <div className="wishlist-sort-inner">
                    <SlidersHorizontal />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="recent">Recently Added</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>

                  {/* View Toggle */}
                  <div className="wishlist-view-toggle">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`wishlist-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    >
                      <Grid />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`wishlist-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    >
                      <List />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            {filteredWishlist.length > 0 ? (
              <motion.div
                layout
                className={viewMode === 'grid' ? 'wishlist-grid' : 'wishlist-list'}
              >
                <AnimatePresence mode="popLayout">
                  {filteredWishlist.map((item, index) => {
                    const packageRoute = item.type === 'cinetrip' ? `/cinetrip/${item.slug}` : `/package/${item.slug}`;
                    return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className={`wishlist-card ${viewMode === 'list' ? 'list-view' : ''}`}
                    >
                      {/* Image */}
                      <div className="wishlist-card-image">
                        <img
                          src={item.image || '/placeholder-image.jpg'}
                          alt={item.name}
                        />
                        <div className="wishlist-card-image-overlay" />

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(item)}
                          className="wishlist-remove-btn"
                        >
                          <Heart />
                        </button>

                        {/* Category Badge */}
                        <span className="wishlist-card-badge">
                          {item.type === 'cinetrip' ? 'Cinema Trip' : 'Tour Package'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="wishlist-card-content">
                        <div className="wishlist-card-header">
                          <div className="wishlist-card-header-info">
                            <Link
                              to={packageRoute}
                              className="wishlist-card-title"
                            >
                              {item.name}
                            </Link>
                            {item.destination && (
                              <div className="wishlist-card-location">
                                <MapPin />
                                {item.destination}
                              </div>
                            )}
                          </div>
                        </div>

                        {item.duration && (
                          <div className="wishlist-card-meta">
                            <div className="wishlist-card-meta-item">
                              <Clock />
                              <span>{item.duration}</span>
                            </div>
                          </div>
                        )}

                        <div className="wishlist-card-footer">
                          <div className="wishlist-card-pricing">
                            <span className="wishlist-price">
                              ₹{item.price.toLocaleString()}
                              <span className="wishlist-price-suffix"> / person</span>
                            </span>
                          </div>
                          <Link
                            to={packageRoute}
                            className="wishlist-view-details"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="wishlist-no-results">
                <Search />
                <h3>No matches found</h3>
                <p>
                  Try adjusting your search to find what you're looking for.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="wishlist-empty"
          >
            <div className="wishlist-empty-icon">
              <HeartOff />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>
              Start exploring our amazing trips and save your favorites to your wishlist for easy access later.
            </p>
            <Link
              to="/destinations"
              className="wishlist-explore-btn"
            >
              <Compass />
              Explore Destinations
            </Link>
          </motion.div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="wishlist-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="wishlist-modal-overlay"
              onClick={() => setShowClearConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="wishlist-modal-content"
            >
              <div className="wishlist-modal-icon">
                <Trash2 />
              </div>
              <h3>Clear Wishlist?</h3>
              <p>
                Are you sure you want to remove all {wishlistItems.length} trips from your wishlist? This action cannot be undone.
              </p>
              <div className="wishlist-modal-actions">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="wishlist-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="wishlist-modal-confirm"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
