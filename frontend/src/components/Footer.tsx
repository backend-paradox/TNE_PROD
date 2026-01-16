import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import "./Footer.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Destinations", href: "/destinations" },
    { name: "CineTrip Experiences", href: "/cinematrip-experiences" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
  ];

  const socialLinks = [
    { name: "Instagram", href: "https://www.instagram.com/tripandevent/", icon: Instagram },
    { name: "Facebook", href: "https://www.facebook.com/tripandevent", icon: Facebook },
    { name: "YouTube", href: "https://www.youtube.com/@tripandevent", icon: Youtube },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/trip-and-event/", icon: Linkedin },
    { name: "WhatsApp", href: "https://wa.me/919007000777", icon: MessageCircle },
  ];

  return (
    <footer className="site-footer">
      {/* Accent Line */}
      <div className="footer-accent-line" />

      {/* Main Footer */}
      <div className="footer-container">
        <div className="footer-grid">

          {/* Company Info */}
          <div className="footer-company">
            <h3 className="footer-brand">
              TRIP <span className="footer-brand-highlight">&</span> EVENT
            </h3>
            <p className="footer-tagline">
              World's First CineMatrip Brand
            </p>
            <p className="footer-description">
              Creating cinematic travel experiences that transform your journeys into unforgettable stories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-section-title">
              <span className="footer-title-line" />
              Quick Links
            </h4>
            <ul className="footer-links">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="footer-link">
                    <span className="footer-link-indicator" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-section-title">
              <span className="footer-title-line" />
              Contact Us
            </h4>
            <div className="footer-contact-list">
              <a href="tel:+919007000777" className="footer-contact-item">
                <span className="footer-contact-icon">
                  <Phone />
                </span>
                <span className="footer-contact-text">+91 900 700 0777</span>
              </a>
              <a href="mailto:hello@tripandevent.com" className="footer-contact-item">
                <span className="footer-contact-icon">
                  <Mail />
                </span>
                <span className="footer-contact-text">hello@tripandevent.com</span>
              </a>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">
                  <MapPin />
                </span>
                <span className="footer-contact-text">Kolkata, West Bengal, India</span>
              </div>
            </div>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="footer-section-title">
              <span className="footer-title-line" />
              Follow Us
            </h4>
            <p className="footer-social-description">
              Stay connected for travel inspiration
            </p>
            <div className="footer-social-links">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="footer-social-link"
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="footer-divider" />

        {/* Bottom Bar */}
        <div className="footer-bottom">
          {/* Copyright */}
          <p className="footer-copyright">
            © {currentYear} LUXURY TRIP AND GLOBAL EVENTS PLANNER PRIVATE LIMITED
          </p>

          {/* Links */}
          <div className="footer-bottom-links">
            <Link to="/privacy-policy" className="footer-bottom-link">
              Privacy Policy
            </Link>
            <span className="footer-bottom-separator">•</span>
            <Link to="/terms-and-conditions" className="footer-bottom-link">
              Terms & Conditions
            </Link>
            <span className="footer-bottom-separator">•</span>
            <Link to="/cancellation-policy" className="footer-bottom-link">
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
