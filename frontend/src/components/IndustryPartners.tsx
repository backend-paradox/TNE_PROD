import { Handshake, Building2, Plane, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import './IndustryPartners.css';

const partners = [
  { name: 'TAAI', type: 'Association', image: 'https://www.tnhglobal.com/wp-content/uploads/2021/10/Untitled-1.jpg' },
  { name: 'Marriott Hotels', type: 'Hotels', icon: '🏨' },
  { name: 'Emirates Airlines', type: 'Airlines', icon: '✈️' },
  { name: 'Hilton Worldwide', type: 'Hotels', icon: '🏨' },
  { name: 'Singapore Airlines', type: 'Airlines', icon: '✈️' },
  { name: 'Taj Hotels', type: 'Hotels', icon: '🏨' },
  { name: 'Qatar Airways', type: 'Airlines', icon: '✈️' },
  { name: 'Oberoi Hotels', type: 'Hotels', icon: '🏨' },
  { name: 'Air India', type: 'Airlines', icon: '✈️' },
  { name: 'Hyatt Hotels', type: 'Hotels', icon: '🏨' },
  { name: 'Etihad Airways', type: 'Airlines', icon: '✈️' },
  { name: 'ITC Hotels', type: 'Hotels', icon: '🏨' },
  { name: 'British Airways', type: 'Airlines', icon: '✈️' }
];

const stats = [
  { value: '500+', label: 'Hotel Partners', icon: Building2, color: 'orange' },
  { value: '150+', label: 'Airline Partners', icon: Plane, color: 'blue' },
  { value: '1000+', label: 'Local Vendors', icon: Users, color: 'green' },
  { value: '200+', label: 'Destinations', icon: MapPin, color: 'purple' }
];

export function IndustryPartners() {
  return (
    <section className="industry">
      <div className="industry-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="industry-header"
        >
          <div className="industry-badge">
            <Handshake />
            <span>Our Partners</span>
          </div>
          <h2>Partnered With The Best</h2>
          <p>
            We collaborate with world-class hotels, airlines, and service
            providers to deliver unforgettable travel experiences.
          </p>
        </motion.div>

        {/* PARTNERS → RIGHT */}
        <div
          className="marquee-wrapper"
          role="region"
          aria-label="Our partner companies - hover to pause scrolling"
        >
          <div className="partners-marquee" aria-hidden="true">
            {[...partners, ...partners].map((partner, i) => (
              <div key={i} className="partner-card">
                <div className="partner-icon">
                  {partner.image ? (
                    <img src={partner.image} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    partner.icon
                  )}
                </div>
                <h5>{partner.name}</h5>
                <span>{partner.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STATS → LEFT */}
        <div
          className="marquee-wrapper stats-wrapper"
          role="region"
          aria-label="Partnership statistics - hover to pause scrolling"
        >
          <div className="stats-marquee" aria-hidden="true">
            {[...stats, ...stats].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`stat-card ${stat.color}`}>
                  <div className="partner-stat-icon">
                    <Icon />
                  </div>
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
