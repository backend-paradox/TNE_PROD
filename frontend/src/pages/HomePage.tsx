import { HeroSection } from '../components/HeroSection';
import { QuickStats } from '../components/QuickStats';
import { TrendingSection } from '../components/TrendingSection';
import { VisaFreeDestinationsNew } from '../components/VisaFreeDestinationsNew';
import { DomesticDestinations } from '../components/DomesticDestinations';
import { InternationalDestinations } from '../components/InternationalDestinations';
import { PackageByDuration } from '../components/PackageByDuration';
import { CineTripPackages } from '../components/CineTripPackages';
import { Testimonials } from '../components/Testimonials';
import { WhyBookUs } from '../components/WhyBookUs';
import { IndustryPartners } from '../components/IndustryPartners';

export function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Quick Stats Banner */}
      <QuickStats />

      {/* 2. Trending Section */}
      <TrendingSection />

      {/* 3. Visa Free Destinations */}
      <VisaFreeDestinationsNew />

      {/* 7. Explore CinemaTrip Packages */}
      <CineTripPackages />

      {/* 4. Domestic Destinations */}
      <DomesticDestinations />

      {/* 5. International Destinations */}
      <InternationalDestinations />

      {/* 6. Package by Duration */}
      <PackageByDuration />

      {/* 8. User Reviews */}
      <Testimonials />

      {/* 9. Why You Should Book Our Packages */}
      <WhyBookUs />

      {/* 10. Partner with the Best Industry */}
      <IndustryPartners />
    </>
  );
}
