import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ChevronRight,
  ShoppingBag,
  Clock,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  removeFromCartAsync,
  updateQuantityAsync,
  clearCartAsync,
} from '../store/slices/cartSlice';
import { setTrip } from '../store/slices/bookingSlice';
import { getMediaUrl } from '../utils';
import toast from 'react-hot-toast';
import './CartPage.css';

const FALLBACK_IMAGE = '/assets/images/fallback/fallback_travel_02.jpeg';

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = getMediaUrl(FALLBACK_IMAGE);
};

export function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { items, totalItems, totalPrice, synced: isCartSynced } = useAppSelector((state) => state.cart);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  // Note: Cart is stored locally in localStorage
  // Backend cart sync can be added later when cart API is implemented

  // Calculate pricing
  const subtotal = totalPrice;
  const taxes = Math.round(subtotal * 0.18); // 18% GST
  const serviceFee = 999;
  const discount = appliedPromo ? Math.round(subtotal * appliedPromo.discount) : 0;
  const total = subtotal + taxes + serviceFee - discount;

  const handleQuantityChange = (id: string | number, type: 'tour' | 'cinetrip', quantity: number) => {
    if (isAuthenticated && isCartSynced) {
      dispatch(updateQuantityAsync({ id, quantity }) as any);
    } else {
      dispatch(updateQuantity({ id, type, quantity }));
    }
  };

  const handleRemoveItem = (id: string | number, type: 'tour' | 'cinetrip', name: string) => {
    if (isAuthenticated && isCartSynced) {
      dispatch(removeFromCartAsync(id) as any);
    } else {
      dispatch(removeFromCart({ id, type }));
    }
    toast.success(`${name} removed from cart`, { icon: '🗑️' });
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      if (isAuthenticated && isCartSynced) {
        dispatch(clearCartAsync() as any);
      } else {
        dispatch(clearCart());
      }
      toast.success('Cart cleared successfully', { icon: '🧹' });
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      toast.error('Please enter a promo code');
      return;
    }

    // Mock promo codes
    const promoCodes: Record<string, number> = {
      'WELCOME10': 0.1,
      'SUMMER20': 0.2,
      'FESTIVAL15': 0.15,
    };

    if (promoCodes[code]) {
      setAppliedPromo({ code, discount: promoCodes[code] });
      toast.success(`Promo code "${code}" applied! You save ₹${Math.round(subtotal * promoCodes[code])}`, {
        icon: '🎉',
        duration: 3000,
      });
      setPromoCode('');
    } else {
      toast.error('Invalid promo code', { icon: '❌' });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.success('Promo code removed', { icon: '🗑️' });
  };

  // Handle booking a specific item from cart
  const handleBookItem = (item: typeof items[0]) => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout', { icon: '🔒' });
      navigate('/auth?type=login&redirect=/cart');
      return;
    }

    // Parse duration string (e.g., "7 Days 6 Nights" or "7 Days")
    const durationMatch = item.duration?.match(/(\d+)\s*Day/i);
    const nightsMatch = item.duration?.match(/(\d+)\s*Night/i);
    const days = durationMatch ? parseInt(durationMatch[1]) : 7;
    const nights = nightsMatch ? parseInt(nightsMatch[1]) : Math.max(days - 1, 1);

    // Transform cart item to Trip format with all required fields
    const tripData = {
      id: String(item.id),
      title: item.name,
      slug: item.slug || String(item.id),
      destination: item.destination || 'Multiple Destinations',
      country: 'India',
      images: [item.image],
      thumbnail: item.image,
      duration: {
        days,
        nights,
      },
      price: {
        adult: item.price,
        child: Math.round(item.price * 0.7),
        infant: Math.round(item.price * 0.3),
      },
      rating: 4.5,
      reviewCount: 0,
      category: item.type === 'tour' ? 'cultural' : 'adventure',
      tripType: [item.type === 'tour' ? 'Cultural' : 'Adventure'] as ('Cultural' | 'Adventure')[],
      highlights: [],
      description: item.name,
      shortDescription: item.name,
      overview: item.name,
      inclusions: [],
      exclusions: [],
      itinerary: [],
      startDates: [],
      maxGroupSize: 20,
      difficulty: 'Easy' as const,
      bestSeason: 'All year',
      cancellationPolicy: 'Free cancellation up to 7 days before the trip',
      featured: false,
      popular: true,
      isPopular: true,
      newArrival: false,
      tags: [item.type],
    };

    dispatch(setTrip(tripData as any));
    toast.success(`Proceeding to book "${item.name}"...`, { icon: '✈️' });
    navigate('/booking', { state: { tripData } });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout', { icon: '🔒' });
      navigate('/auth?type=login&redirect=/cart');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // If multiple items, show info message
    if (items.length > 1) {
      toast('You have multiple items. Please click "Book Now" on each item to book separately.', {
        icon: 'ℹ️',
        duration: 4000,
      });
      return;
    }

    // Single item - proceed to checkout
    const firstItem = items[0];

    // Parse duration string (e.g., "7 Days 6 Nights" or "7 Days")
    const durationMatch = firstItem.duration?.match(/(\d+)\s*Day/i);
    const nightsMatch = firstItem.duration?.match(/(\d+)\s*Night/i);
    const days = durationMatch ? parseInt(durationMatch[1]) : 7;
    const nights = nightsMatch ? parseInt(nightsMatch[1]) : Math.max(days - 1, 1);

    // Transform cart item to Trip format with all required fields
    const tripData = {
      id: String(firstItem.id),
      title: firstItem.name,
      slug: firstItem.slug || String(firstItem.id),
      destination: firstItem.destination || 'Multiple Destinations',
      country: 'India',
      images: [firstItem.image],
      thumbnail: firstItem.image,
      duration: {
        days,
        nights,
      },
      price: {
        adult: firstItem.price,
        child: Math.round(firstItem.price * 0.7),
        infant: Math.round(firstItem.price * 0.3),
      },
      rating: 4.5,
      reviewCount: 0,
      category: firstItem.type === 'tour' ? 'cultural' : 'adventure',
      tripType: [firstItem.type === 'tour' ? 'Cultural' : 'Adventure'] as ('Cultural' | 'Adventure')[],
      highlights: [],
      description: `Cart booking for ${items.length} item(s)`,
      shortDescription: `Cart booking for ${items.map(i => i.name).join(', ')}`,
      overview: `Cart booking for ${items.length} item(s)`,
      inclusions: [],
      exclusions: [],
      itinerary: [],
      startDates: [],
      maxGroupSize: 20,
      difficulty: 'Easy' as const,
      bestSeason: 'All year',
      cancellationPolicy: 'Free cancellation up to 7 days before the trip',
      featured: false,
      popular: true,
      isPopular: true,
      newArrival: false,
      tags: [firstItem.type],
    };

    dispatch(setTrip(tripData as any));
    toast.success('Proceeding to checkout...', { icon: '🛒' });
    navigate('/booking', { state: { tripData } });
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cart-empty-content"
          >
            <div className="cart-empty-icon">
              <ShoppingBag size={80} strokeWidth={1} />
            </div>
            <h2 className="cart-empty-title">Your Cart is Empty</h2>
            <p className="cart-empty-subtitle">
              Looks like you haven't added any packages to your cart yet.
            </p>
            <Link to="/trips" className="cart-empty-btn">
              <ShoppingCart size={18} />
              Browse Packages
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cart-header"
        >
          <div className="cart-header-left">
            <ShoppingCart className="cart-header-icon" />
            <div>
              <h1 className="cart-title">Shopping Cart</h1>
              <p className="cart-subtitle">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          <button
            onClick={handleClearCart}
            className="cart-clear-btn"
          >
            <Trash2 size={18} />
            Clear Cart
          </button>
        </motion.div>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="cart-item"
                >
                  {/* Quick Remove Button (X) */}
                  <button
                    onClick={() => handleRemoveItem(item.id, item.type, item.name)}
                    className="cart-item-close-btn"
                    title="Remove item"
                  >
                    <X size={16} />
                  </button>

                  {/* Item Image */}
                  <Link
                    to={`/${item.type === 'tour' ? 'package' : 'cinetrip'}/${item.slug}`}
                    className="cart-item-image-link"
                  >
                    <img
                      src={getMediaUrl(item.image)}
                      alt={item.name}
                      onError={handleImageError}
                      className="cart-item-image"
                    />
                  </Link>

                  {/* Item Details */}
                  <div className="cart-item-details">
                    <Link
                      to={`/${item.type === 'tour' ? 'package' : 'cinetrip'}/${item.slug}`}
                      className="cart-item-name"
                    >
                      {item.name}
                    </Link>

                    <div className="cart-item-meta">
                      <span className="cart-item-type">
                        {item.type === 'tour' ? '🌍 Tour Package' : '🎬 CineTrip'}
                      </span>
                      {item.duration && (
                        <>
                          <span className="cart-item-separator">•</span>
                          <span className="cart-item-duration">
                            <Clock size={14} />
                            {item.duration}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="cart-item-price-mobile">
                      ₹{item.price.toLocaleString()}
                    </div>

                    {/* Quantity Controls */}
                    <div className="cart-item-actions">
                      <div className="cart-item-quantity">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.type, item.quantity - 1)
                          }
                          className="cart-quantity-btn"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="cart-quantity-value">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.type, item.quantity + 1)
                          }
                          className="cart-quantity-btn"
                          disabled={item.quantity >= 10}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id, item.type, item.name)}
                        className="cart-remove-btn"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>

                      <button
                        onClick={() => handleBookItem(item)}
                        className="cart-book-btn"
                      >
                        <ArrowRight size={16} />
                        Book Now
                      </button>
                    </div>
                  </div>

                  {/* Item Price (Desktop) */}
                  <div className="cart-item-price-desktop">
                    <div className="cart-item-unit-price">
                      ₹{item.price.toLocaleString()}
                    </div>
                    <div className="cart-item-total-price">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Link to="/trips" className="cart-continue-shopping">
              <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="cart-summary-section">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cart-summary"
            >
              <h3 className="cart-summary-title">Order Summary</h3>

              {/* Promo Code */}
              <div className="cart-promo">
                <label className="cart-promo-label">
                  <Tag size={16} />
                  Have a promo code?
                </label>
                <div className="cart-promo-input-group">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                    className="cart-promo-input"
                    disabled={!!appliedPromo}
                  />
                  {appliedPromo ? (
                    <button
                      onClick={handleRemovePromo}
                      className="cart-promo-btn remove"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyPromo}
                      className="cart-promo-btn"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {appliedPromo && (
                  <div className="cart-promo-applied">
                    ✓ Code "{appliedPromo.code}" applied
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="cart-summary-divider"></div>

              <div className="cart-summary-breakdown">
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Taxes & Fees (18%)</span>
                  <span>₹{taxes.toLocaleString()}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Service Fee</span>
                  <span>₹{serviceFee.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="cart-summary-row discount">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-total">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="cart-checkout-btn"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </motion.button>

              {/* Trust Badges */}
              <div className="cart-trust-badges">
                <div className="cart-trust-badge">
                  ✓ Secure Payment
                </div>
                <div className="cart-trust-badge">
                  ✓ 24/7 Support
                </div>
                <div className="cart-trust-badge">
                  ✓ Best Price Guarantee
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
