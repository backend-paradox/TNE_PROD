import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Shield,
  CreditCard,
  Clock,
  Award
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'TravelConnect', path: '/travellers' },
      { label: 'Careers', path: '/careers' },
      { label: 'Press', path: '/press' },
      { label: 'Blog', path: '/blog' }
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'FAQs', path: '/faqs' },
      { label: 'Cancellation Policy', path: '/cancellation' }
    ],
    destinations: [
      { label: 'Kashmir', path: '/search?destination=kashmir' },
      { label: 'Kerala', path: '/search?destination=kerala' },
      { label: 'Goa', path: '/search?destination=goa' },
      { label: 'Rajasthan', path: '/search?destination=rajasthan' },
      { label: 'Dubai', path: '/search?destination=dubai' },
      { label: 'Thailand', path: '/search?destination=thailand' }
    ],
    tripTypes: [
      { label: 'Honeymoon', path: '/search?category=honeymoon' },
      { label: 'Adventure', path: '/search?category=adventure' },
      { label: 'Family', path: '/search?category=family' },
      { label: 'Beach', path: '/search?category=beach' },
      { label: 'Luxury', path: '/search?category=luxury' }
    ]
  };

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, url: 'https://www.facebook.com/tripandevent', label: 'Facebook' },
    { icon: <Twitter className="w-5 h-5" />, url: 'https://twitter.com/tripandevent', label: 'Twitter' },
    { icon: <Instagram className="w-5 h-5" />, url: 'https://www.instagram.com/tripandevent/', label: 'Instagram' },
    { icon: <Youtube className="w-5 h-5" />, url: 'https://www.youtube.com/@tripandevent', label: 'YouTube' }
  ];

  const trustBadges = [
    { icon: <Shield className="w-6 h-6" />, text: 'Secure Payments' },
    { icon: <Clock className="w-6 h-6" />, text: '24/7 Support' },
    { icon: <Award className="w-6 h-6" />, text: 'Best Price Guarantee' },
    { icon: <CreditCard className="w-6 h-6" />, text: 'Easy Refunds' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Trust Badges */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  {badge.icon}
                </div>
                <span className="font-medium text-white">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Travel<span className="text-orange-500">Connect</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted partner for unforgettable travel experiences. Discover curated tours, 
              seamless bookings, and exceptional service worldwide.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:+919007000777" className="flex items-center gap-3 hover:text-orange-500 transition-colors">
                <Phone className="w-5 h-5 text-orange-500" />
                <span>+91 900 700 0777</span>
              </a>
              <a href="mailto:hello@tripandevent.com" className="flex items-center gap-3 hover:text-orange-500 transition-colors">
                <Mail className="w-5 h-5 text-orange-500" />
                <span>hello@tripandevent.com</span>
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-orange-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-orange-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-white font-semibold mb-4">Top Destinations</h3>
            <ul className="space-y-3">
              {footerLinks.destinations.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-orange-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trip Types */}
          <div>
            <h3 className="text-white font-semibold mb-4">Trip Types</h3>
            <ul className="space-y-3">
              {footerLinks.tripTypes.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-orange-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">Subscribe to our newsletter</h3>
              <p className="text-gray-400">Get exclusive deals and travel inspiration delivered to your inbox.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} TravelConnect. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="hover:text-orange-500 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-orange-500 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-orange-500 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
