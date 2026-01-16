import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  User,
  Heart,
  ChevronDown,
  LogOut,
  MapPin,
  Calendar,
  Phone,
  Plane
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useScrollPosition, useClickOutside } from '../../hooks';
import './Header.css';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { isScrolled } = useScrollPosition();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(userMenuRef, () => setIsUserMenuOpen(false));

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;

  const navLinks = [
    { path: '/search', label: 'Explore Trips', icon: <Plane /> },
    { path: '/destinations', label: 'Destinations', icon: <MapPin /> },
    { path: '/contact', label: 'Contact', icon: <Phone /> }
  ];

  const handleLogout = async () => {
    await dispatch(logout()).unwrap();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const nameParts = (user?.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim();

  const headerClass = `site-header ${isTransparent ? 'transparent' : 'solid'}`;

  return (
    <header className={headerClass}>
      <div className="header-container">
        <div className="header-inner">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <div className="header-logo-icon">
              <Plane />
            </div>
            <div className="header-logo-text">
              <span className="header-brand-name">
                Travel<span className="header-brand-highlight">Connect</span>
              </span>
              <span className="header-tagline">
                Your Journey Begins Here
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`header-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="header-actions">
            {/* Search Button */}
            <button
              onClick={() => navigate('/search')}
              className="header-search-btn"
            >
              <Search />
              <span>Search trips...</span>
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="header-wishlist-btn">
              <Heart />
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div ref={userMenuRef} className="header-user-menu">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="header-user-btn"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'User'}
                      className="header-user-avatar"
                    />
                  ) : (
                    <div className="header-user-initials">
                      {initials || 'U'}
                    </div>
                  )}
                  <span className="header-user-name">
                    {firstName || user?.name}
                  </span>
                  <ChevronDown className="header-user-chevron" />
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className="header-user-dropdown">
                    <div className="header-dropdown-header">
                      <p className="header-dropdown-name">{user?.name}</p>
                      <p className="header-dropdown-email">{user?.email}</p>
                    </div>
                    <div className="header-dropdown-menu">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="header-dropdown-link"
                      >
                        <User />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/profile/bookings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="header-dropdown-link"
                      >
                        <Calendar />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="header-dropdown-link"
                      >
                        <Heart />
                        <span>Saved Trips</span>
                      </Link>
                    </div>
                    <div className="header-dropdown-divider">
                      <button
                        onClick={handleLogout}
                        className="header-logout-btn"
                      >
                        <LogOut />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="header-auth-buttons">
                <Link to="/login" className="header-login-btn">
                  Login
                </Link>
                <Link to="/signup" className="header-signup-btn">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="header-mobile-toggle"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="header-mobile-menu">
          <div className="header-mobile-content">
            {/* Search Bar */}
            <button
              onClick={() => {
                navigate('/search');
                setIsMobileMenuOpen(false);
              }}
              className="header-mobile-search"
            >
              <Search />
              <span>Search destinations...</span>
            </button>

            {/* Nav Links */}
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`header-mobile-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Auth Links */}
            {!isAuthenticated && (
              <div className="header-mobile-auth">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="header-mobile-login"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="header-mobile-signup"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
