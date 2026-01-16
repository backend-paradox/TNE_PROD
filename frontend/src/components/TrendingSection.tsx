import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { DestinationCard } from './shared';
import { useTrendingPackages } from '@/hooks/usePackages';
import { TourPackage } from '@/services/packageService';
import './TrendingSection.css';

/* -------------------- HELPERS -------------------- */

const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

const mapPackageToCard = (pkg: TourPackage) => ({
  id: pkg.id,
  name: pkg.name,
  image: pkg.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
  state: pkg.state,
  tagline: pkg.tagline || pkg.shortDescription?.slice(0, 50) + '...',
  packages: pkg.duration,
  price: formatPrice(Number(pkg.startingPrice)),
  category: pkg.category,
  popular: pkg.popular,
  bestSeason: pkg.bestSeason || '',
  tripTypes: pkg.tags?.slice(0, 3) || [],
  slug: pkg.slug,
});

/* -------------------- COMPONENT -------------------- */

export function TrendingSection() {
  const { data: packages, loading, error } = useTrendingPackages(4);

  // Map API data to card format
  const trendingDestinations = packages.map(mapPackageToCard);

  return (
    <section className="trending-section">
      <div className="trending-container">
        {/* Header */}
        <div className="section-header">
          <div className="section-icon-box">
            <TrendingUp />
          </div>
          <h2 className="section-title section-title--italic">Trending Now</h2>
          <p className="section-subtitle">Discover what's trending – loved by travelers worldwide</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <p>Loading destinations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container">
            <p>Unable to load destinations. Please try again later.</p>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && (
          <div className="destination-grid">
            {trendingDestinations.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                id={destination.id}
                name={destination.name}
                image={destination.image}
                state={destination.state}
                tagline={destination.tagline}
                packages={destination.packages}
                price={destination.price}
                category={destination.category}
                popular={destination.popular}
                bestSeason={destination.bestSeason}
                tripTypes={destination.tripTypes}
                linkTo={`/package/${destination.slug}`}
                animationDelay={index * 0.05}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="trending-cta">
          <Link to="/destinations">
            View All Destinations <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
