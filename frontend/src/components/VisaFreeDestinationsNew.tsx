import { Plane, CheckCircle } from "lucide-react";
import { DestinationCard } from "./shared";
import { useVisaFreePackages } from "@/hooks/usePackages";
import "./VisaFreeDestinationsNew.css";

export function VisaFreeDestinationsNew() {
  const { data: packages, loading, error } = useVisaFreePackages(8);

  // Format price for display
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <section className="visa-free-destinations">
        <div className="visa-container">
          <div className="section-header">
            <div className="section-icon-box">
              <Plane />
            </div>
            <h2 className="section-title section-title--italic">Visa-Free Destinations</h2>
          </div>
          <div className="destination-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="destination-card-skeleton" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || packages.length === 0) {
    return null;
  }

  return (
    <section className="visa-free-destinations">
      {/* Background Decoration */}
      <div className="visa-bg-decorations">
        <div className="visa-bg-circle top-right"></div>
        <div className="visa-bg-circle bottom-left"></div>
      </div>

      <div className="visa-container">
        <div className="section-header visa-fade-in">
          <div className="section-icon-box">
            <Plane />
          </div>
          <h2 className="section-title section-title--italic">Visa-Free Destinations</h2>
          <p className="section-subtitle">
            Pack your bags and go! No visa hassles for Indian passport holders. Instant travel to these amazing destinations.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="destination-grid">
          {packages.map((pkg, index) => (
            <DestinationCard
              key={pkg.id}
              id={index + 1}
              name={pkg.name}
              image={pkg.imageUrl}
              state={pkg.state || pkg.country}
              tagline={pkg.tagline}
              packages={`${pkg.duration}`}
              price={formatPrice(Number(pkg.startingPrice))}
              category="Visa-Free"
              popular={pkg.popular}
              bestSeason={pkg.bestSeason || "Year Round"}
              tripTypes={pkg.tags.slice(0, 4)}
              linkTo={`/package/${pkg.slug}`}
              animationDelay={index * 0.05}
            />
          ))}
        </div>

        {/* Info Banner */}
        <div className="visa-info-banner">
          <div className="visa-banner-content">
            <CheckCircle />
            <p className="visa-banner-text">
              <strong>No Visa Required!</strong> Just book your tickets and explore these amazing destinations hassle-free.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
