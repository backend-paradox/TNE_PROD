import { useState, useMemo, useCallback } from "react";
import {
  Camera,
  Heart,
  Sparkles,
  Star,
  Users,
  Play,
  Video,
  Gift,
  Calendar,
  Phone,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { CineTripCard } from "../components/CineTripCard";
import { getMediaUrl } from "../utils";
import { useCineTripPackages } from "@/hooks/usePackages";
import { CineTripPackage } from "@/services/packageService";
import "../components/HeroSection.css";
import "./CineTripExperiencesPage.css";

/* -------------------- HELPERS -------------------- */

const mapCineTripToService = (pkg: CineTripPackage) => ({
  id: pkg.id,
  slug: pkg.slug,
  title: pkg.name,
  description: pkg.shortDescription,
  image: pkg.image,
  price: pkg.priceDisplay,
  duration: pkg.duration,
  category: pkg.category,
  features: pkg.features || [],
  popular: pkg.popular,
  deliveryTime: pkg.deliveryTime || '7-10 Days',
});

const categories = [
  { id: "all", name: "All Services", icon: Sparkles },
  { id: "travel", name: "Travel", icon: Camera },
  { id: "wedding", name: "Wedding", icon: Heart },
  { id: "celebration", name: "Celebration", icon: Gift },
  { id: "luxury", name: "Luxury", icon: Star },
  { id: "corporate", name: "Corporate", icon: Users },
  { id: "events", name: "Events", icon: Calendar },
];

const processSteps = [
  {
    step: 1,
    title: "Consultation",
    description: "Share your vision with our creative team. We understand your story and plan the perfect shoot.",
    icon: Phone,
  },
  {
    step: 2,
    title: "Planning",
    description: "We handle all logistics including location scouting, permits, and scheduling.",
    icon: Calendar,
  },
  {
    step: 3,
    title: "Shooting",
    description: "Our professional crew captures every moment with state-of-the-art equipment.",
    icon: Video,
  },
  {
    step: 4,
    title: "Delivery",
    description: "Receive your professionally edited cinematic masterpiece.",
    icon: Gift,
  },
];

export function CineTripExperiencesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { data: packages, loading, error } = useCineTripPackages();

  // Map API data to service format
  const cinematripServices = useMemo(
    () => packages.map(mapCineTripToService),
    [packages]
  );

  const filteredServices = cinematripServices.filter((service) => {
    return selectedCategory === "all" || service.category.toLowerCase() === selectedCategory;
  });

  return (
    <div className="cinetrip-page">
      {/* Hero Section with Video */}
      <section className="hero cinetrip-hero" style={{ height: '80vh', minHeight: '600px', maxHeight: '900px' }}>
        {/* Video Background - No overlay for clear video */}
        <div className="hero__bg">
          <iframe
            className={`hero__video ${videoLoaded ? 'loaded' : ''}`}
            src="https://www.youtube.com/embed/xpKGBD4egXU?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=xpKGBD4egXU&modestbranding=1&playsinline=1&disablekb=1"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="CineTrip Experiences"
            onLoad={() => setTimeout(() => setVideoLoaded(true), 1500)}
          />
          <div className="hero__overlay--minimal" />
        </div>

        {/* Main Content */}
        <div className="hero__container">
          <div className="hero__content">
            {/* Brand Badge */}
            <motion.div
              className="hero__badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Play size={14} />
              <span>WORLD FIRST CINEMATRIP BRAND</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="hero__title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              We don't just design packages,
            </motion.h1>

            <motion.h2
              className="hero__subtitle"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              We turn your holiday into{' '}
              <span className="hero__highlight">real time movies.</span>
            </motion.h2>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <div className="cinetrip-services">
        <div className="cinetrip-services-container">
          {/* Section Header */}
          <div className="cinetrip-section-header">
            <h2 className="cinetrip-section-title">
              Our Featured Experiences
            </h2>
            <p className="cinetrip-section-desc">
              Choose from our range of professional cinematic services designed to capture your most precious moments.
            </p>
          </div>

          {/* Category Filter */}
          <div className="cinetrip-filter">
            <div className="cinetrip-filter-inner">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`cinetrip-filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  >
                    <Icon />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <Loader2 className="loading-spinner" />
              <p>Loading experiences...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-container">
              <p>Unable to load experiences. Please try again later.</p>
            </div>
          )}

          {/* Services Grid - Using Homepage CineTripCard Style */}
          {!loading && !error && (
          <div className="cinetrip-services-grid">
            {filteredServices.map((service, index) => (
              <CineTripCard
                key={service.id}
                id={service.id}
                name={service.title}
                image={service.image}
                tagline={service.description}
                popular={service.popular}
                tripTypes={service.features}
                animationDelay={index * 0.1}
                linkTo={`/cinetrip/${service.slug}`}
              />
            ))}
          </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="cinetrip-process">
        <div className="cinetrip-process-container">
          <div className="cinetrip-section-header">
            <h2 className="cinetrip-section-title">
              How It Works
            </h2>
            <p className="cinetrip-section-desc">
              From consultation to delivery, we make the process smooth and enjoyable.
            </p>
          </div>

          <div className="cinetrip-process-grid">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="cinetrip-step-wrapper">
                  {index < processSteps.length - 1 && (
                    <div className="cinetrip-step-line" />
                  )}
                  <div className="cinetrip-step-card">
                    <div className="cinetrip-step-number">
                      {step.step}
                    </div>
                    <div className="cinetrip-step-icon">
                      <Icon />
                    </div>
                    <h3 className="cinetrip-step-title">{step.title}</h3>
                    <p className="cinetrip-step-desc">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="cinetrip-testimonials">
        <div className="cinetrip-testimonials-container">
          <div className="cinetrip-section-header">
            <h2 className="cinetrip-section-title">
              What Our Clients Say
            </h2>
            <p className="cinetrip-section-desc">
              Don't just take our word for it - hear from couples who trusted us with their memories.
            </p>
          </div>

          <div className="cinetrip-testimonials-grid">
            {[
              {
                name: "Priya & Rahul",
                service: "Pre Wedding Shoot",
                quote: "The team captured our love story beautifully. Every frame feels like a movie scene. Absolutely magical!",
                location: "Goa",
              },
              {
                name: "Anjali & Vikram",
                service: "Honeymoon Movie",
                quote: "Our honeymoon video is something we watch every anniversary. It brings back all those beautiful memories.",
                location: "Maldives",
              },
              {
                name: "The Sharma Family",
                service: "Anniversary Celebration",
                quote: "They documented our 25th anniversary trip so beautifully. Our children loved the final video!",
                location: "Switzerland",
              },
            ].map((testimonial, index) => (
              <div key={index} className="cinetrip-testimonial-card">
                <p className="cinetrip-testimonial-quote">"{testimonial.quote}"</p>
                <div className="cinetrip-testimonial-footer">
                  <div>
                    <p className="cinetrip-testimonial-name">{testimonial.name}</p>
                    <p className="cinetrip-testimonial-service">{testimonial.service}</p>
                  </div>
                  <span className="cinetrip-testimonial-location">{testimonial.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cinetrip-cta">
        <div className="cinetrip-cta-bg" />
        <div className="cinetrip-cta-overlay" />

        {/* Decorative Glows */}
        <div className="cinetrip-cta-decorations">
          <div className="cinetrip-cta-glow top-left" />
          <div className="cinetrip-cta-glow bottom-right" />
        </div>

        <div className="cinetrip-cta-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="cinetrip-cta-content"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="cinetrip-cta-icon"
            >
              <Video />
            </motion.div>

            <h2>
              Ready to Create Your <span className="cinetrip-cta-highlight">Cinematic Story?</span>
            </h2>
            <p>
              Contact us today for a free consultation. Let's turn your special moments into timeless memories.
            </p>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="cinetrip-cta-buttons"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="cinetrip-cta-btn primary"
              >
                <Phone />
                <span>Book Free Consultation</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="cinetrip-cta-btn secondary"
              >
                <Play />
                <span>View Portfolio</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
