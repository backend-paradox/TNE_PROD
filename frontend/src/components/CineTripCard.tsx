import { Link } from 'react-router-dom';
import { Heart, Compass, Flag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getMediaUrl } from '@/utils';
import './CineTripCard.css';

export interface CineTripCardProps {
  id: number;
  name: string;
  image: string;
  tagline: string;
  popular: boolean;
  tripTypes: string[];
  linkTo?: string;
  animationDelay?: number;
  category?: string;
  duration?: string;
  price?: string;
  isSaved?: boolean;
  onWishlistClick?: (e: React.MouseEvent) => void;
}

export function CineTripCard({
  name,
  image,
  tagline,
  popular,
  tripTypes,
  linkTo = '#',
  animationDelay = 0,
  category,
  duration = 'Varies',
  price = 'Contact for pricing',
  isSaved = false,
  onWishlistClick
}: CineTripCardProps) {
  // Use first trip type as category if category not provided
  const displayCategory = category || (tripTypes.length > 0 ? tripTypes[0] : 'Experience');

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.35,
        delay: animationDelay * 0.025,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="destination-card destination-card-international"
    >
      {/* Section 1: Image with overlays and info */}
      <div className="destination-card-image">
        <ImageWithFallback
          src={getMediaUrl(image)}
          alt={name}
        />
        <div className="destination-card-image-overlay" />

        {/* Wishlist Button */}
        {onWishlistClick && (
          <button
            className={`destination-wishlist-btn ${isSaved ? 'active' : ''}`}
            onClick={onWishlistClick}
            aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={isSaved ? 'filled' : ''} />
          </button>
        )}

        {/* Category Badge */}
        <div className="destination-card-continent">
          <Compass />
          <span>{displayCategory}</span>
        </div>

        {/* Featured Badge */}
        {popular && (
          <div className="destination-card-visa">
            Featured
          </div>
        )}

        {/* Info overlay at bottom of image */}
        <div className="destination-card-info">
          <div className="destination-card-country">
            <Flag />
            <span>Cinema Experience</span>
          </div>
          <h3 className="destination-card-name">
            {name}
          </h3>
        </div>
      </div>

      {/* Section 2: Content */}
      <div className="destination-card-content">
        <p className="destination-card-description">
          {tagline}
        </p>

        {/* Travel info boxes */}
        <div className="destination-card-travel-info">
          <div className="destination-card-travel-item primary">
            <p className="destination-card-travel-label">
              Duration
            </p>
            <p className="destination-card-travel-value primary">
              {duration}
            </p>
          </div>
          <div className="destination-card-travel-item secondary">
            <p className="destination-card-travel-label">
              Category
            </p>
            <p className="destination-card-travel-value secondary">
              {displayCategory}
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="destination-card-highlights">
          <p className="destination-card-highlights-label">
            Highlights
          </p>
          <div className="destination-card-highlights-list">
            {tripTypes.slice(0, 4).map((type, idx) => (
              <span key={idx} className="destination-card-highlight">
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Section 3: Footer */}
        <div className="destination-card-footer">
          <div>
            <p className="destination-card-price-label">
              Starting from
            </p>
            <p className="destination-card-price-gradient">
              {price}
            </p>
          </div>
          <span className="destination-card-btn destination-card-btn-international">
            <span>Explore</span>
            <ArrowRight />
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (linkTo && linkTo !== '#') {
    return (
      <Link to={linkTo} className="destination-card-link">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
