/**
 * @deprecated UNUSED - Replaced by components/Navbar.tsx
 * This header component is part of the legacy JSX architecture.
 * DO NOT MODIFY
 * Deprecated: 2026-01-09
 * Scheduled for removal: Q1 2026
 *
 * Current active navigation: components/Navbar.tsx
 */
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { getRefreshToken } from '../../utils/token';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();
    await dispatch(logout(refreshToken));
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">✈️</span>
            <span className="logo-text">TripAndEvent</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/search?type=hotels" className="nav-link">
              Hotels
            </Link>
            <Link to="/search?type=flights" className="nav-link">
              Flights
            </Link>
            <Link to="/search?type=buses" className="nav-link">
              Buses
            </Link>
            <Link to="/search?type=events" className="nav-link">
              Events
            </Link>
            <Link to="/travellers/dashboard" className="nav-link">
              Travellers
            </Link>
          </nav>

          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" className="nav-link">
                  My Bookings
                </Link>
                <div className="user-menu">
                  <button className="user-button">
                    <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
                    <span className="user-name">{user?.name}</span>
                  </button>
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      Profile
                    </Link>
                    {user?.role === 'VENDOR' && (
                      <Link to="/vendor/dashboard" className="dropdown-item">
                        Vendor Dashboard
                      </Link>
                    )}
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin/dashboard" className="dropdown-item">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-item">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
