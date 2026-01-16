import { useState } from "react";
import {
  Award,
  Users,
  Globe,
  Heart,
  Target,
  Star,
  Shield,
  Sparkles,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import "./AboutPage.css";

const stats = [
  { number: "50+", label: "Destinations", icon: Globe },
  { number: "500+", label: "Happy Travelers", icon: Users },
  { number: "24/7", label: "Customer Support", icon: Star },
  { number: "100%", label: "Commitment", icon: Award },
];

const values = [
  {
    title: "Customer First",
    description: "Every decision we make starts with how it benefits our travelers. Your satisfaction is our success.",
    icon: Heart,
  },
  {
    title: "Authenticity",
    description: "We create genuine travel experiences that connect you with local cultures and hidden gems.",
    icon: Target,
  },
  {
    title: "Safety & Trust",
    description: "Your safety is paramount. We partner with trusted local operators and maintain highest standards.",
    icon: Shield,
  },
  {
    title: "Innovation",
    description: "We're constantly evolving to bring you new destinations, experiences, and technologies.",
    icon: Sparkles,
  },
];

const whyChooseUs = [
  { title: "Romantic Getaways", description: "Perfect honeymoons & couple retreats" },
  { title: "Family Vacations", description: "Memorable trips for all ages" },
  { title: "Destination Weddings", description: "Dream celebrations worldwide" },
  { title: "Group Tours", description: "Exotic adventures together" },
];

export function AboutPage() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <iframe
          className={`about-hero-video ${videoLoaded ? 'loaded' : ''}`}
          src="https://www.youtube.com/embed/jAeqZ5aOrL4?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=jAeqZ5aOrL4&modestbranding=1&playsinline=1&disablekb=1"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="About Trip & Event"
          onLoad={() => setTimeout(() => setVideoLoaded(true), 1500)}
        />
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <div className="about-hero-container">
            <div className="about-hero-text">
              <span className="about-hero-badge">
                World's First CinemaTrip Brand
              </span>
              <h1 className="about-hero-title">
                About <span className="about-hero-title-highlight">Trip & Event</span>
              </h1>
              <p className="about-hero-description">
                Where every journey becomes a story worth reliving. We don't just plan holidays — we turn them into cinematic experiences you'll treasure forever.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="about-stats">
        <div className="about-stats-container">
          <div className="about-stats-grid">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="about-stat-item">
                  <Icon className="about-stat-icon" />
                  <div className="about-stat-number">{stat.number}</div>
                  <div className="about-stat-label">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="about-story">
        <div className="about-story-container">
          <div className="about-story-grid">
            <div>
              <h2 className="about-story-title">
                About Us
              </h2>
              <div className="about-story-text">
                <p>
                  Welcome to Trip & Event — the World's First CineMatrip Brand. We don't just plan holidays — we turn them into cinematic experiences you'll treasure forever.
                </p>
                <p>
                  We blend professional travel planning with high-quality cinematic storytelling, capturing your memories in real-time. Our team handles everything — from logistics and bookings to creative filming and editing — ensuring a seamless, unforgettable journey.
                </p>
                <p>
                  Whether it's a romantic getaway, family vacation, destination wedding, or group tour — Trip & Event gives you the freedom to explore while we bring your moments to life.
                </p>
              </div>
            </div>
            <div className="about-story-image-wrapper">
              <ImageWithFallback
                src="/assets/images/logo/logo-main.svg"
                alt="Trip & Event Logo"
                className="about-story-image about-story-logo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="about-mission">
        <div className="about-mission-container">
          <div className="about-mission-grid">
            <div className="about-mission-card">
              <div className="about-mission-icon mission">
                <Target />
              </div>
              <h3 className="about-mission-card-title">Our Mission</h3>
              <p className="about-mission-card-text">
                To serve global travellers with personalized service, meticulous attention to detail, and round-the-clock support — transforming every journey into a cinematic story worth reliving.
              </p>
            </div>
            <div className="about-mission-card vision">
              <div className="about-mission-icon vision">
                <Sparkles />
              </div>
              <h3 className="about-mission-card-title">Our Vision</h3>
              <p className="about-mission-card-text">
                To be the world's most loved cinematic travel brand — giving you the freedom to explore while we bring your moments to life through stunning visuals and unforgettable experiences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Founder Message */}
      <div className="about-founder">
        <div className="about-founder-container">
          <div className="about-founder-grid">
            <div className="about-founder-image-wrapper">
              <ImageWithFallback
                src="/assets/images/team/founder_samim.jpeg"
                alt="Samim Ahmed - Founder & Global CEO"
                className="about-founder-image"
              />
              <div className="about-founder-badge">
                <div className="about-founder-badge-text">Founder & Global CEO</div>
              </div>
            </div>
            <div className="about-founder-content">
              <h2 className="about-founder-title">
                Message from the Founder
              </h2>
              <div className="about-founder-text">
                <p>
                  Travel should be experienced, felt, and remembered forever. That belief led to Trip & Event — the World's First CineMatrip Brand.
                </p>
                <p>
                  We design luxury, personalized journeys that combine bespoke travel planning with cinematic storytelling. Every trip is crafted with creativity and care to deliver seamless, unforgettable experiences.
                </p>
                <p>
                  No one-size-fits-all travel here — just personalized luxury, authentic experiences, and world-class service.
                </p>
                <div className="about-founder-signature">
                  <span className="about-founder-name">Samim Ahmed</span>
                  <span className="about-founder-role">Founder & CEO, Trip & Event</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="about-values">
        <div className="about-values-container">
          <div className="about-values-header">
            <h2 className="about-values-title">
              Our Core Values
            </h2>
            <p className="about-values-subtitle">
              These principles guide everything we do, from planning trips to delivering experiences.
            </p>
          </div>

          <div className="about-values-grid">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="about-value-card">
                  <div className="about-value-icon">
                    <Icon />
                  </div>
                  <h3 className="about-value-title">{value.title}</h3>
                  <p className="about-value-description">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="about-awards">
        <div className="about-awards-container">
          <div className="about-awards-header">
            <h2 className="about-awards-title">
              Trips We Specialize In
            </h2>
            <p className="about-awards-subtitle">
              From intimate escapes to grand celebrations — we craft them all.
            </p>
          </div>

          <div className="about-awards-grid">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="about-award-card">
                <Award className="about-award-icon" />
                <h3 className="about-award-title">{item.title}</h3>
                <p className="about-award-org">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="about-cta">
        <div className="about-cta-container">
          <h2 className="about-cta-title">
            Ready to Start Your Journey?
          </h2>
          <p className="about-cta-description">
            Whether it's a romantic getaway, family vacation, destination wedding, or exotic group tour — Trip & Event gives you the freedom to explore while we bring your moments to life.
          </p>
          <div className="about-cta-buttons">
            <a href="/destinations" className="about-cta-btn about-cta-btn-primary">
              <MapPin />
              <span>Explore Destinations</span>
            </a>
            <a href="/contact" className="about-cta-btn about-cta-btn-secondary">
              <span>Contact Us</span>
              <ArrowRight />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
