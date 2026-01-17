import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Menu,
  X,
  ChevronDown,
  Film,
  MapPin,
  Globe,
  MessageSquare,
  Heart,
  LogOut,
  Briefcase,
  Users,
  ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { useWishlist } from '../hooks';
import { Logo } from './Logo';
import './Navbar.css';

const navLinks = [
  { name: 'Home', href: '/', icon: Globe },
  { name: 'Destinations', href: '/destinations', icon: MapPin },
  { name: 'CinemaTrip', href: '/cinematrip-experiences', icon: Film },
  { name: 'TravelConnect', href: '/travellers', icon: Users },
  { name: 'Contact', href: '/contact', icon: MessageSquare },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { totalItems: cartItemCount } = useAppSelector((state) => state.cart);
  const { wishlist } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const initials = (name?: string) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation - Pill Container */}
          <nav className="nav-pill">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="actions">

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="user-menu" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <div className="avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user?.name || 'User'} />
                    ) : (
                      initials(user?.name)
                    )}
                  </div>
                  <ChevronDown className={userMenuOpen ? 'rotate' : ''} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="dropdown"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    >
                      <div className="dropdown-head">
                        <div className="dropdown-avatar">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user?.name || 'User'} />
                          ) : (
                            <span>{initials(user?.name)}</span>
                          )}
                        </div>
                        <div className="dropdown-user-info">
                          <p>{user?.name}</p>
                          <small>{user?.email}</small>
                        </div>
                      </div>

                      <Link to="/profile">
                        <User /> My Profile
                      </Link>
                      <Link to="/my-bookings">
                        <Briefcase /> My Bookings
                      </Link>
                      <Link to="/cart" className="dropdown-cart-link">
                        <ShoppingCart /> Cart
                        {cartItemCount > 0 && (
                          <span className="dropdown-cart-badge">{cartItemCount}</span>
                        )}
                      </Link>
                      <Link to="/wishlist">
                        <Heart /> Wishlist
                        {wishlist.length > 0 && (
                          <span className="dropdown-wishlist-badge">{wishlist.length}</span>
                        )}
                      </Link>

                      <button
                        className="logout"
                        onClick={async () => {
                          await dispatch(logout()).unwrap();
                          navigate('/');
                        }}
                      >
                        <LogOut /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth?type=login" className="signin-link">
                Sign In
              </Link>
            )}

            {/* Mobile Toggle */}
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop overlay */}
              <motion.div
                className="mobile-menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                className="mobile-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  transition: {
                    height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                    opacity: { duration: 0.2, delay: 0.1 }
                  }
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.25, ease: [0.4, 0, 1, 1] },
                    opacity: { duration: 0.15 }
                  }
                }}
              >
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link key={link.name} to={link.href}>
                  <link.icon /> {link.name}
                </Link>
              ))}

              {/* Auth Section Divider */}
              <div className="mobile-menu-divider" />

              {/* Auth Section */}
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="mobile-user-info">
                    <div className="mobile-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user?.name || 'User'} />
                      ) : (
                        <span>{initials(user?.name)}</span>
                      )}
                    </div>
                    <div className="mobile-user-details">
                      <p className="mobile-user-name">{user?.name}</p>
                      <p className="mobile-user-email">{user?.email}</p>
                    </div>
                  </div>

                  {/* Account Links */}
                  <Link to="/profile">
                    <User /> My Profile
                  </Link>
                  <Link to="/my-bookings">
                    <Briefcase /> My Bookings
                  </Link>
                  <Link to="/cart">
                    <ShoppingCart /> Cart
                    {cartItemCount > 0 && (
                      <span className="mobile-badge">{cartItemCount}</span>
                    )}
                  </Link>
                  <Link to="/wishlist">
                    <Heart /> Wishlist
                    {wishlist.length > 0 && (
                      <span className="mobile-badge">{wishlist.length}</span>
                    )}
                  </Link>

                  {/* Logout Button */}
                  <button
                    className="mobile-logout"
                    onClick={async () => {
                      await dispatch(logout()).unwrap();
                      navigate('/');
                      setMenuOpen(false);
                    }}
                  >
                    <LogOut /> Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Login & Sign Up Buttons */}
                  <Link to="/auth?type=login" className="mobile-login-btn">
                    <User /> Sign In
                  </Link>
                  <Link to="/auth?type=signup" className="mobile-signup-btn">
                    Sign Up
                  </Link>
                </>
              )}
            </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
