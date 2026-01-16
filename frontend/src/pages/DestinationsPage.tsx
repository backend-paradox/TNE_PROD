import { useState } from 'react';
import { getMediaUrl } from '@/utils';
import {
  MapPin,
  Globe,
  Mountain,
  Palmtree,
  Building2,
  Heart,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DestinationCard } from '../components/shared/DestinationCard';
import { useDomesticPackages, useInternationalPackages } from '@/hooks/usePackages';
import './DestinationsPage.css';

const categories = [
  { id: 'all', name: 'All', icon: Globe },
  { id: 'mountains', name: 'Mountains', icon: Mountain },
  { id: 'beach', name: 'Beach', icon: Palmtree },
  { id: 'heritage', name: 'Heritage', icon: Building2 },
  { id: 'spiritual', name: 'Spiritual', icon: Heart },
  { id: 'nature', name: 'Nature', icon: Palmtree },
];

const continents = [
  { id: 'all', name: 'All Destinations' },
  { id: 'europe', name: 'Europe' },
  { id: 'asia', name: 'Asia' },
  { id: 'oceania', name: 'Oceania' },
  { id: 'middle-east', name: 'Middle East' },
  { id: 'africa', name: 'Africa' },
];

export function DestinationsPage() {
  const [activeTab, setActiveTab] = useState<'domestic' | 'international'>(
    'domestic'
  );
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch packages from API (replacing destinations)
  const { data: domesticPackages, loading: domesticLoading, error: domesticError } = useDomesticPackages();
  const { data: internationalPackages, loading: internationalLoading, error: internationalError } = useInternationalPackages();

  // Format price for display
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const filteredDomestic = domesticPackages.filter((pkg) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      pkg.category.toLowerCase() === selectedCategory;
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.state?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredInternational = internationalPackages.filter((pkg) => {
    const matchesContinent =
      selectedContinent === 'all' ||
      (pkg.continent?.toLowerCase() || '').includes(selectedContinent.toLowerCase().replace('-', ' '));
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesContinent && matchesSearch;
  });

  return (
    <div className="destinations-page">
      {/* Hero Section */}
      <div className="destinations-hero">
        <img
          src={getMediaUrl("/assets/images/hero/contact_page_hero.webp")}
          alt="Travel Destinations"
          className="destinations-hero-image"
        />
        <div className="destinations-hero-overlay" />

        {/* Hero Content */}
        <div className="destinations-hero-content">
          <div className="destinations-hero-inner">
            {/* Location Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="destinations-hero-icon"
            >
              <div className="destinations-hero-icon-circle">
                <MapPin strokeWidth={2.5} />
              </div>
            </motion.div>

            <motion.h1
              className="hero__title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Explore handpicked destinations across
            </motion.h1>
            <motion.h2
              className="hero__subtitle"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <span className="hero__highlight">India and around the world</span>
            </motion.h2>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="destinations-tabs">
        <div className="destinations-tabs-container">
          <div className="destinations-tabs-inner">
            <div className="destinations-tabs-group">
              <button
                onClick={() => setActiveTab('domestic')}
                className={`destinations-tab ${activeTab === 'domestic' ? 'active' : ''}`}
              >
                <MapPin />
                <span>Domestic</span>
              </button>
              <button
                onClick={() => setActiveTab('international')}
                className={`destinations-tab ${activeTab === 'international' ? 'active' : ''}`}
              >
                <Globe />
                <span>International</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Domestic Section */}
      {activeTab === 'domestic' && (
        <motion.div
          key="domestic"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="destinations-section"
        >
          <div className="destinations-section-container">
            {/* Section Header */}
            <div className="destinations-section-header">
              <div className="destinations-section-title-row">
                <div className="destinations-section-icon">
                  <MapPin />
                </div>
                <h2 className="destinations-section-title">
                  Explore Incredible India
                </h2>
              </div>
              <p className="destinations-section-description">
                From the snow-capped Himalayas to the tropical beaches of
                Kerala, discover the diverse beauty of India
              </p>
            </div>

            {/* Category Filter */}
            <div className="destinations-filter">
              <div className="destinations-filter-container">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`destinations-filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                    >
                      <Icon />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destinations Grid */}
            {domesticLoading ? (
              <div className="destinations-loading">
                <Loader2 className="destinations-loading-icon" />
                <p>Loading destinations...</p>
              </div>
            ) : domesticError ? (
              <div className="destinations-error">
                <p>Failed to load destinations. Please try again later.</p>
              </div>
            ) : (
            <div className="destination-grid">
              <AnimatePresence mode="wait">
                {filteredDomestic.map((pkg, index) => (
                  <DestinationCard
                    key={pkg.id}
                    id={pkg.id}
                    name={pkg.name}
                    image={pkg.imageUrl}
                    state={pkg.state}
                    packages={pkg.duration}
                    price={formatPrice(Number(pkg.startingPrice))}
                    tagline={pkg.shortDescription || ''}
                    category={pkg.category}
                    popular={pkg.popular}
                    bestSeason={pkg.bestSeason || 'Year Round'}
                    tripTypes={pkg.tags?.slice(0, 3) || []}
                    linkTo={`/package/${pkg.slug}`}
                    animationDelay={index * 0.025}
                    slug={pkg.slug}
                    type="tour"
                  />
                ))}
              </AnimatePresence>
            </div>
            )}

            {!domesticLoading && !domesticError && filteredDomestic.length === 0 && (
              <div className="destinations-empty">
                <Globe />
                <h3 className="destinations-empty-title">
                  No destinations found
                </h3>
                <p className="destinations-empty-text">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* International Section */}
      {activeTab === 'international' && (
        <motion.div
          key="international"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="destinations-section"
        >
          <div className="destinations-section-container">
            {/* Section Header */}
            <div className="destinations-section-header">
              <div className="destinations-section-title-row">
                <div className="destinations-section-icon accent">
                  <Globe />
                </div>
                <h2 className="destinations-section-title">
                  International Destinations
                </h2>
              </div>
              <p className="destinations-section-description">
                Explore the world's most iconic destinations. From historic
                landmarks to modern marvels, your dream vacation awaits.
              </p>
            </div>

            {/* Continent Filter */}
            <div className="destinations-filter">
              <div className="destinations-filter-container">
                {continents.map((continent) => (
                  <button
                    key={continent.id}
                    onClick={() => setSelectedContinent(continent.id)}
                    className={`destinations-filter-btn ${selectedContinent === continent.id ? 'active' : ''}`}
                  >
                    {continent.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Destinations Grid */}
            {internationalLoading ? (
              <div className="destinations-loading">
                <Loader2 className="destinations-loading-icon" />
                <p>Loading destinations...</p>
              </div>
            ) : internationalError ? (
              <div className="destinations-error">
                <p>Failed to load destinations. Please try again later.</p>
              </div>
            ) : (
            <div className="destination-grid">
              <AnimatePresence mode="wait">
                {filteredInternational.map((pkg, index) => (
                  <DestinationCard
                    key={pkg.id}
                    id={pkg.id}
                    name={pkg.name}
                    image={pkg.imageUrl}
                    state={pkg.country}
                    packages={pkg.duration}
                    price={formatPrice(Number(pkg.startingPrice))}
                    tagline={pkg.shortDescription || ''}
                    category={pkg.continent || 'International'}
                    popular={!pkg.visaRequired}
                    bestSeason={pkg.bestSeason || 'Year Round'}
                    tripTypes={pkg.highlights?.slice(0, 3) || []}
                    linkTo={`/package/${pkg.slug}`}
                    animationDelay={index * 0.025}
                    slug={pkg.slug}
                    type="tour"
                  />
                ))}
              </AnimatePresence>
            </div>
            )}

            {!internationalLoading && !internationalError && filteredInternational.length === 0 && (
              <div className="destinations-empty">
                <Globe />
                <h3 className="destinations-empty-title">
                  No destinations found
                </h3>
                <p className="destinations-empty-text">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Bottom CTA Section */}
      <div className="destinations-cta">
        <div className="destinations-cta-container">
          <h2 className="destinations-cta-title">
            Can't find what you're looking for?
          </h2>
          <p className="destinations-cta-text">
            Let our travel experts create a customized itinerary just for you.
            We'll plan every detail of your dream vacation.
          </p>
          <button className="destinations-cta-btn">
            Plan My Trip
          </button>
        </div>
      </div>
    </div>
  );
}
