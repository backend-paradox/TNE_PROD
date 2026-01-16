import { MapPin, TrendingUp, ArrowRight, Award, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DestinationCard } from "./shared";
import { useDomesticPackages } from "@/hooks/usePackages";
import { TourPackage } from "@/services/packageService";
import "./DomesticDestinations.css";

/* -------------------- HELPERS -------------------- */

const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

const mapPackageToDestination = (pkg: TourPackage) => ({
  id: pkg.id,
  name: pkg.name,
  slug: pkg.slug,
  image: pkg.imageUrl || '/assets/images/destinations/default.jpeg',
  state: pkg.state,
  packages: pkg.duration,
  price: formatPrice(Number(pkg.startingPrice)),
  tagline: pkg.tagline || pkg.shortDescription?.slice(0, 40) + '...',
  category: pkg.category,
  popular: pkg.popular,
  bestSeason: pkg.bestSeason || 'Year Round',
  tripTypes: pkg.tags?.slice(0, 3) || [],
});

export function DomesticDestinations() {
  const { data: packages, loading, error } = useDomesticPackages(8);

  // Map API data to destination format
  const domesticDestinations = packages.map(mapPackageToDestination);
  return (
    <section className="domestic-destinations">
      {/* Background Pattern */}
      <div className="domestic-bg-pattern">
        <div className="domestic-bg-circle top-left"></div>
        <div className="domestic-bg-circle bottom-right"></div>
      </div>

      <div className="domestic-container">
        <div className="section-header domestic-fade-in">
          <div className="section-icon-box">
            <MapPin />
          </div>
          <h2 className="section-title section-title--italic">Explore Incredible India</h2>
          <p className="section-subtitle">
            Discover the rich diversity, culture, and natural beauty of India's most stunning destinations
          </p>
          <Link to="/destinations" className="section-action-btn">
            <span>View All Destinations</span>
            <ArrowRight />
          </Link>
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

        {/* Grid Layout */}
        {!loading && !error && (
        <div className="destination-grid">
          {domesticDestinations.map((destination, index) => (
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
              slug={destination.slug}
            />
          ))}
        </div>
        )}

        {/* Mobile View All Button */}
        <div className="domestic-mobile-cta domestic-fade-in">
          <Link to="/destinations" className="domestic-mobile-btn">
            <span>View All Destinations</span>
            <ArrowRight />
          </Link>
        </div>

        {/* Stats Banner */}
        <div className="domestic-stats domestic-fade-in">
          {[
            { Icon: Award, value: '28', label: 'States & UTs' },
            { Icon: MapPin, value: '500+', label: 'Destinations' },
            { Icon: TrendingUp, value: '1200+', label: 'Packages' }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="domestic-stat-card domestic-stat-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.Icon className="domestic-stat-icon" />
              <div className="domestic-stat-value">{stat.value}</div>
              <p className="domestic-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
