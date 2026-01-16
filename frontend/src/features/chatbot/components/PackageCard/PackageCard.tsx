import { MapPin, Star, Clock, Users } from 'lucide-react';
import type { Package } from '../../types/chatbot.types';
import styles from './PackageCard.module.css';

interface PackageCardProps {
  package: Package;
  onSelect?: (packageId: string) => void;
  compact?: boolean;
}

export function PackageCard({ package: pkg, onSelect, compact = false }: PackageCardProps) {
  const hasDiscount = pkg.discount_price && pkg.discount_price < pkg.price;
  const displayPrice = hasDiscount ? pkg.discount_price : pkg.price;
  const savings = hasDiscount ? Math.round(((pkg.price - pkg.discount_price!) / pkg.price) * 100) : 0;

  const handleClick = () => {
    if (onSelect) {
      onSelect(pkg.package_id);
    }
  };

  if (compact) {
    return (
      <div className={styles.compactCard} onClick={handleClick}>
        <div className={styles.compactInfo}>
          <h4 className={styles.compactTitle}>{pkg.title}</h4>
          <div className={styles.compactMeta}>
            <span className={styles.duration}>
              <Clock size={12} />
              {pkg.duration}
            </span>
            <span className={styles.rating}>
              <Star size={12} fill="currentColor" />
              {pkg.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <div className={styles.compactPrice}>
          <span className={styles.priceValue}>₹{displayPrice?.toLocaleString()}</span>
          <span className={styles.perPerson}>/person</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card} onClick={handleClick}>
      {pkg.image_url && (
        <div className={styles.imageContainer}>
          <img
            src={pkg.image_url}
            alt={pkg.title}
            className={styles.image}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400';
            }}
          />
          {pkg.featured && <span className={styles.featuredBadge}>Featured</span>}
          {savings > 0 && <span className={styles.discountBadge}>{savings}% OFF</span>}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{pkg.title}</h4>
          <div className={styles.rating}>
            <Star size={14} fill="#FFB800" color="#FFB800" />
            <span>{pkg.rating.toFixed(1)}</span>
            <span className={styles.reviewCount}>({pkg.review_count})</span>
          </div>
        </div>

        <div className={styles.meta}>
          {pkg.destination && (
            <span className={styles.metaItem}>
              <MapPin size={14} />
              {pkg.destination}
            </span>
          )}
          <span className={styles.metaItem}>
            <Clock size={14} />
            {pkg.duration}
          </span>
        </div>

        {pkg.highlights && pkg.highlights.length > 0 && (
          <div className={styles.highlights}>
            {pkg.highlights.slice(0, 3).map((highlight, idx) => (
              <span key={idx} className={styles.highlight}>
                {highlight}
              </span>
            ))}
            {pkg.highlights.length > 3 && (
              <span className={styles.moreHighlights}>+{pkg.highlights.length - 3} more</span>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.pricing}>
            {hasDiscount && (
              <span className={styles.originalPrice}>₹{pkg.price.toLocaleString()}</span>
            )}
            <span className={styles.price}>₹{displayPrice?.toLocaleString()}</span>
            <span className={styles.perPerson}>/person</span>
          </div>
          <button className={styles.selectBtn} onClick={handleClick}>
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

export default PackageCard;
