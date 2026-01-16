/**
 * @deprecated UNUSED - Replaced by components/Footer.tsx
 * This footer component is part of the legacy JSX architecture.
 * DO NOT MODIFY
 * Deprecated: 2026-01-09
 * Scheduled for removal: Q1 2026
 *
 * Current active footer: components/Footer.tsx
 */
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">TripAndEvent</h3>
            <p className="footer-description">
              Your one-stop platform for booking hotels, flights, buses, and events. Travel made
              easy and affordable.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/search?type=hotels">Hotels</Link>
              </li>
              <li>
                <Link to="/search?type=flights">Flights</Link>
              </li>
              <li>
                <Link to="/search?type=buses">Buses</Link>
              </li>
              <li>
                <Link to="/search?type=events">Events</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li>
                <Link to="/help">Help Center</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">For Partners</h4>
            <ul className="footer-links">
              <li>
                <Link to="/register?role=VENDOR">Become a Vendor</Link>
              </li>
              <li>
                <Link to="/vendor-guide">Vendor Guide</Link>
              </li>
              <li>
                <Link to="/advertise">Advertise with Us</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} TripAndEvent. All rights reserved.</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <span>📘</span>
            </a>
            <a href="#" aria-label="Twitter">
              <span>🐦</span>
            </a>
            <a href="#" aria-label="Instagram">
              <span>📷</span>
            </a>
            <a href="#" aria-label="LinkedIn">
              <span>💼</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
