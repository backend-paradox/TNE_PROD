import { Clock, Calendar } from "lucide-react";
import { useState, useCallback, KeyboardEvent, useEffect } from "react";
import { DestinationCard } from "./shared";
import { usePackagesByDuration } from "@/hooks/usePackages";
import { TourPackage } from "@/services/packageService";
import "./PackageByDuration.css";

type DurationKey = "3-5days" | "6-9days" | "10+days";

const durationRanges: Record<DurationKey, { min: number; max: number }> = {
  "3-5days": { min: 3, max: 5 },
  "6-9days": { min: 6, max: 9 },
  "10+days": { min: 10, max: 99 },
};

export function PackageByDuration() {
  const [selectedDuration, setSelectedDuration] = useState<DurationKey>("6-9days");
  const [packagesData, setPackagesData] = useState<Record<DurationKey, TourPackage[]>>({
    "3-5days": [],
    "6-9days": [],
    "10+days": [],
  });

  // Fetch all duration ranges
  const shortTrips = usePackagesByDuration(3, 5, 4);
  const weekLong = usePackagesByDuration(6, 9, 4);
  const extended = usePackagesByDuration(10, 99, 4);

  // Update packages data when fetched
  useEffect(() => {
    setPackagesData({
      "3-5days": shortTrips.data,
      "6-9days": weekLong.data,
      "10+days": extended.data,
    });
  }, [shortTrips.data, weekLong.data, extended.data]);

  const loading = shortTrips.loading || weekLong.loading || extended.loading;

  const durations: Array<{ key: DurationKey; label: string; days: string }> = [
    { key: "3-5days", label: "Short Trips", days: "3-5 Days" },
    { key: "6-9days", label: "Week Long", days: "6-9 Days" },
    { key: "10+days", label: "Extended Tours", days: "10+ Days" },
  ];

  // Format price for display
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const keys: DurationKey[] = ["3-5days", "6-9days", "10+days"];

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % keys.length;
      setSelectedDuration(keys[nextIndex]);
      (document.getElementById(`tab-${keys[nextIndex]}`) as HTMLButtonElement)?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + keys.length) % keys.length;
      setSelectedDuration(keys[prevIndex]);
      (document.getElementById(`tab-${keys[prevIndex]}`) as HTMLButtonElement)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setSelectedDuration(keys[0]);
      (document.getElementById(`tab-${keys[0]}`) as HTMLButtonElement)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setSelectedDuration(keys[keys.length - 1]);
      (document.getElementById(`tab-${keys[keys.length - 1]}`) as HTMLButtonElement)?.focus();
    }
  }, []);

  const currentPackages = packagesData[selectedDuration];

  return (
    <section className="package-by-duration">
      <div className="duration-container">
        <div className="section-header duration-fade-in">
          <div className="section-icon-box">
            <Calendar />
          </div>
          <h2 className="section-title section-title--italic">Packages By Duration</h2>
          <p className="section-subtitle">
            Find the perfect package that fits your schedule
          </p>
        </div>

        {/* Duration Tabs */}
        <div className="duration-tabs-container duration-fade-in" style={{ animationDelay: '0.2s' }}>
          <div
            className="duration-tabs"
            role="tablist"
            aria-label="Package duration options"
          >
            {durations.map((duration, index) => (
              <button
                key={duration.key}
                id={`tab-${duration.key}`}
                role="tab"
                aria-selected={selectedDuration === duration.key}
                aria-controls={`tabpanel-${duration.key}`}
                tabIndex={selectedDuration === duration.key ? 0 : -1}
                onClick={() => setSelectedDuration(duration.key)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`duration-tab-btn ${selectedDuration === duration.key ? 'active' : ''}`}
              >
                <div className="duration-tab-content">
                  <Clock aria-hidden="true" />
                  <div className="duration-tab-text">
                    <div className="duration-tab-label">{duration.label}</div>
                    <div className="duration-tab-days">{duration.days}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div
          id={`tabpanel-${selectedDuration}`}
          role="tabpanel"
          aria-labelledby={`tab-${selectedDuration}`}
          className="destination-grid"
        >
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="destination-card-skeleton" />
            ))
          ) : currentPackages.length > 0 ? (
            currentPackages.map((pkg, index) => (
              <DestinationCard
                key={pkg.id}
                id={index + 1}
                name={pkg.name}
                image={pkg.imageUrl}
                state={pkg.state || pkg.country}
                tagline={pkg.tagline}
                packages={pkg.duration}
                price={formatPrice(Number(pkg.startingPrice))}
                category={selectedDuration === "3-5days" ? "Short Trip" : selectedDuration === "6-9days" ? "Week Long" : "Extended"}
                popular={pkg.popular}
                bestSeason={pkg.bestSeason || "Year Round"}
                tripTypes={pkg.tags.slice(0, 3)}
                linkTo={`/package/${pkg.slug}`}
                animationDelay={index * 0.05}
              />
            ))
          ) : (
            <div className="no-packages-message">
              No packages available for this duration.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
