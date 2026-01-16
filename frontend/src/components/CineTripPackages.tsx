import { Film, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CineTripCard } from "./CineTripCard";
import { useFeaturedCineTripPackages } from "@/hooks/usePackages";
import { CineTripPackage } from "@/services/packageService";
import "./CineTripPackages.css";

/* -------------------- HELPERS -------------------- */

const mapCineTripToCard = (pkg: CineTripPackage) => ({
  id: pkg.id,
  slug: pkg.slug,
  name: pkg.name,
  image: pkg.image,
  tagline: pkg.shortDescription,
  popular: pkg.popular,
  tripTypes: pkg.features?.slice(0, 3) || [],
});

export function CineTripPackages() {
  const { data: packages, loading, error } = useFeaturedCineTripPackages(8);

  // Map API data to card format
  const cinetripServices = packages.map(mapCineTripToCard);

  return (
    <section className="cinetrip">
      <div className="cinetrip-container">
        {/* Header */}
        <div className="section-header cinetrip-fade-in">
          <div className="section-icon-box">
            <Film />
          </div>
          <h2 className="section-title">CinemaTrip Packages</h2>
          <p className="section-subtitle">
            Transform your special moments into cinematic masterpieces.
            Professional videography and photography services for every occasion.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <p>Loading packages...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container">
            <p>Unable to load packages. Please try again later.</p>
          </div>
        )}

        {/* Cards Grid - Royal Cinema Style */}
        {!loading && !error && (
          <div className="cinetrip-cards-grid">
            {cinetripServices.map((service, index) => (
              <CineTripCard
                key={service.id}
                id={service.id}
                name={service.name}
                image={service.image}
                tagline={service.tagline}
                popular={service.popular}
                tripTypes={service.tripTypes}
                linkTo={`/cinetrip/${service.slug}`}
                animationDelay={index * 0.05}
              />
            ))}
          </div>
        )}

        {/* View All CTA */}
        <div className="cinetrip-cta-container cinetrip-fade-in">
          <Link to="/cinematrip-experiences" className="cinetrip-view-all-btn">
            <span>Explore All Experiences</span>
            <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
