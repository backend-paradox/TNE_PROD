import {
  Palette,
  Award,
  Video,
  Shield,
  HeadphonesIcon,
  CreditCard,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import './WhyBookUs.css';

const features = [
  {
    icon: Palette,
    title: 'Complete Customisation',
    description:
      'Every journey is unique. We tailor each package to your preferences, budget, and dreams.',
    color: 'orange',
    highlights: [
      'Personalized itineraries',
      'Flexible scheduling',
      'Budget-friendly options',
      'Special requests accommodated'
    ]
  },
  {
    icon: Award,
    title: 'Unmatched Expertise',
    description:
      'With over 15 years in the travel industry, our expert team knows every destination inside out.',
    color: 'blue',
    highlights: [
      '15+ years of experience',
      'Local destination experts',
      '50,000+ happy travelers',
      'Award-winning service'
    ]
  },
  {
    icon: Video,
    title: 'Premium Services',
    description:
      'We go beyond just travel planning with professional photography, videography, and cinematic memories.',
    color: 'purple',
    highlights: [
      'Professional photography',
      '4K video production',
      'Drone cinematography',
      'Social media content'
    ]
  }
];

const trustBadges = [
  { icon: Shield, label: 'Secure Booking', description: 'Your data is protected' },
  { icon: HeadphonesIcon, label: '24/7 Support', description: 'Always here to help' },
  { icon: CreditCard, label: 'Easy Payments', description: 'Multiple payment options' }
];

export function WhyBookUs() {
  return (
    <section className="why">
      <div className="why-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="why-header"
        >
          <h2>Why Book With Us</h2>
          <p>
            Experience the difference with our personalized service and
            professional expertise
          </p>
        </motion.div>

        {/* Features */}
        <div className="feature-grid why-features">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`feature-card ${feature.color}`}
              >
                <div className="feature-icon">
                  <Icon />
                </div>

                <h3>{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>

                <div className="feature-highlights">
                  <ul>
                    {feature.highlights.map((h) => (
                      <li key={h}>
                        <span className="check">
                          <Check />
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="trust-bar"
        >
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="trust-item"
              >
                <div className="trust-icon">
                  <Icon />
                </div>
                <div>
                  <h4>{badge.label}</h4>
                  <p>{badge.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
