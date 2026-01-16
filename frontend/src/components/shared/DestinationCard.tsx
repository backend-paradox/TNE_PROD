import { Link } from 'react-router-dom';
import { TrendingUp, MapPin, Heart } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { getMediaUrl } from '@/utils';
import { useWishlist } from '@/hooks';
import toast from 'react-hot-toast';
import './DestinationCard.css';

export interface DestinationCardProps {
  id: number;
  name: string;
  image: string;
  state: string;
  packages: string;
  price: string;
  tagline: string;
  category: string;
  popular: boolean;
  bestSeason: string;
  tripTypes: string[];
  linkTo?: string;
  animationDelay?: number;
  slug?: string;
  type?: 'tour' | 'cinetrip';
}

export function DestinationCard({
  name,
  image,
  state,
  packages,
  price,
  tagline,
  category,
  popular,
  bestSeason,
  tripTypes,
  linkTo = '#',
  animationDelay = 0,
  slug,
  type = 'tour'
}: DestinationCardProps) {
  // Extract slug from linkTo if not provided
  const packageSlug = slug || (linkTo !== '#' ? linkTo.split('/').pop() : '');

  const { isSaved, toggleSave } = useWishlist();
  const isInWishlist = packageSlug ? isSaved(packageSlug) : false;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!packageSlug) return;

    toggleSave(packageSlug, {
      type,
      name,
      slug: packageSlug,
      image,
      price: parseFloat(price.replace(/[₹,]/g, '')) || 0,
      duration: packages,
      destination: state,
    });

    if (isInWishlist) {
      toast.success(`${name} removed from wishlist`, { icon: '💔' });
    } else {
      toast.success(`${name} added to wishlist`, { icon: '❤️' });
    }
  };

  const cardContent = (
    <div
      className="domestic-card domestic-card-fade-in"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className="domestic-card-image">
        <ImageWithFallback
          src={getMediaUrl(image)}
          alt={name}
        />

        {/* Gradient Overlay */}
        <div className="domestic-card-overlay"></div>

        {/* Wishlist Heart Button */}
        <button
          className={`domestic-wishlist-btn ${isInWishlist ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={isInWishlist ? 'filled' : ''} />
        </button>

        {/* Popular Badge */}
        {popular && (
          <div className="domestic-trending-badge">
            <TrendingUp />
            <span>Trending</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="domestic-category-badge">
          {category}
        </div>

        {/* Content */}
        <div className="domestic-card-image-content">
          <h4 className="domestic-card-name">{name}</h4>
          <div className="domestic-card-location">
            <MapPin />
            <span>{state}</span>
          </div>
        </div>
      </div>

      <div className="domestic-card-body">
        {/* Best Season */}
        <div className="domestic-best-season">
          <span className="domestic-best-season-label">Best Season:</span> {bestSeason}
        </div>

        {/* Trip Types */}
        <div className="domestic-trip-types">
          <div className="domestic-trip-types-list">
            {tripTypes.map((type, idx) => (
              <span key={idx} className="domestic-trip-type-tag">
                {type}
              </span>
            ))}
          </div>
        </div>

        <p className="domestic-packages-count">{packages}</p>

        <div className="domestic-card-footer">
          <div>
            <p className="domestic-price-label">Starting from</p>
            <p className="domestic-price">{price}</p>
          </div>
          <button className="domestic-explore-btn">
            Explore
          </button>
        </div>
      </div>
    </div>
  );

  // If linkTo is provided and not '#', wrap in Link
  if (linkTo && linkTo !== '#') {
    return (
      <Link to={linkTo} className="destination-card-link">
        {cardContent}
      </Link>
    );
  }

  // Otherwise, return just the card
  return cardContent;
}
