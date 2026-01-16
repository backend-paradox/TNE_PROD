import { Globe, Compass, ArrowRight, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { DestinationCard } from "./shared";
import { useInternationalPackages } from "@/hooks/usePackages";
import { TourPackage } from "@/services/packageService";
import "./InternationalDestinations.css";

/* -------------------- HELPERS -------------------- */

const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

// Mapping countries to continents for filtering
const countryToContinent: Record<string, string> = {
  'France': 'Europe',
  'Switzerland': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Germany': 'Europe',
  'UK': 'Europe',
  'Greece': 'Europe',
  'UAE': 'Asia',
  'Singapore': 'Asia',
  'Indonesia': 'Asia',
  'Thailand': 'Asia',
  'Malaysia': 'Asia',
  'Japan': 'Asia',
  'Maldives': 'Asia',
  'Vietnam': 'Asia',
  'Sri Lanka': 'Asia',
  'Nepal': 'Asia',
  'Australia': 'Oceania',
  'New Zealand': 'Oceania',
  'USA': 'Americas',
  'Canada': 'Americas',
  'Egypt': 'Africa',
  'South Africa': 'Africa',
  'Kenya': 'Africa',
};

const mapPackageToDestination = (pkg: TourPackage) => {
  const continent = countryToContinent[pkg.country] || 'Other';
  return {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    country: pkg.country,
    image: pkg.imageUrl || '/assets/images/destinations/default.jpeg',
    continent,
    packages: pkg.duration,
    price: formatPrice(Number(pkg.startingPrice)),
    tagline: pkg.tagline || pkg.shortDescription?.slice(0, 40) + '...',
    popular: pkg.popular,
    bestSeason: pkg.bestSeason || 'Year Round',
    tripTypes: pkg.tags?.slice(0, 3) || [],
  };
};

export function InternationalDestinations() {
  const [selectedContinent, setSelectedContinent] = useState("All");
  const { data: packages, loading, error } = useInternationalPackages(8);

  // Map API data to destination format
  const internationalDestinations = useMemo(
    () => packages.map(mapPackageToDestination),
    [packages]
  );

  // Get unique continents from data
  const continents = useMemo(() => {
    const uniqueContinents = new Set(internationalDestinations.map(d => d.continent));
    return ["All", ...Array.from(uniqueContinents).sort()];
  }, [internationalDestinations]);

  const filteredDestinations = selectedContinent === "All"
    ? internationalDestinations
    : internationalDestinations.filter(dest => dest.continent === selectedContinent);

  return (
    <section className="international-destinations">
      {/* Background Decorations - CSS animations */}
      <div className="intl-bg-decorations">
        <div className="intl-bg-circle top-left" />
        <div className="intl-bg-circle bottom-right" />
        <div className="intl-bg-glow top-right" />
        <div className="intl-bg-glow bottom-left" />
      </div>

      <div className="intl-container">
        {/* Section Header */}
        <div className="section-header intl-fade-in">
          <div className="section-icon-box">
            <Globe />
          </div>
          <h2 className="section-title section-title--italic">International Destinations</h2>
          <p className="section-subtitle">
            Explore the world's most iconic destinations. From historic landmarks to modern marvels.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="intl-filter-container intl-fade-in">
          <div className="intl-filter-pills">
            {continents.map((continent) => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={`intl-filter-btn ${selectedContinent === continent ? 'active' : ''}`}
              >
                {continent === "All" ? "All Destinations" : continent}
              </button>
            ))}
          </div>
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

        {/* Destinations Grid - 6 Cards */}
        {!loading && !error && (
        <div className="destination-grid">
          {filteredDestinations.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              id={destination.id}
              name={destination.name}
              image={destination.image}
              state={destination.country}
              tagline={destination.tagline}
              packages={destination.packages}
              price={destination.price}
              category={destination.continent}
              popular={destination.popular}
              bestSeason={destination.bestSeason}
              tripTypes={destination.tripTypes}
              linkTo={`/package/${destination.slug}`}
              animationDelay={index * 0.05}
            />
          ))}
        </div>
        )}

        {/* Empty State */}
        {filteredDestinations.length === 0 && (
          <div className="intl-empty-state intl-fade-in">
            <Globe className="intl-empty-icon" />
            <p className="intl-empty-text">No destinations found in {selectedContinent}</p>
            <button
              onClick={() => setSelectedContinent("All")}
              className="intl-empty-btn"
            >
              View all destinations
            </button>
          </div>
        )}

        {/* View All CTA */}
        <div className="intl-cta-container intl-fade-in">
          <Link to="/destinations" className="intl-cta-btn">
            <span>Explore All Destinations</span>
            <div className="intl-arrow-icon">
              <ArrowRight />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
