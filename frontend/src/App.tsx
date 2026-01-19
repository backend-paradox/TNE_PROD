import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DestinationsPage } from './pages/DestinationsPage';
import { CineTripExperiencesPage } from './pages/CineTripExperiencesPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { TripDetailsPage } from './pages/TripDetailsPage';
import { PackageDetailPage } from './pages/PackageDetailPage';
import { CineTripDetailPage } from './pages/CineTripDetailPage';
import { BookingPage } from './pages/BookingPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { CartPage } from './pages/CartPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { WishlistPage } from './pages/WishlistPage';
import { AuthPage } from './pages/AuthPage';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { clearAuth, getCurrentUser } from './store/slices/authSlice';
import { syncCartToBackend } from './store/slices/cartSlice';
import { TravellersLayout } from './components/travellers/layout/TravellersLayout';
import { TravellersLandingPage } from './pages/TravellersLandingPage';
import { TravellersDashboardPage } from './pages/TravellersDashboardPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { TravellerProfilePage } from './pages/TravellerProfilePage';
import { GroupPlanningPage } from './pages/GroupPlanningPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { TravellersNearbyPage } from './pages/TravellersNearbyPage';
import { DirectMessagePage } from './pages/DirectMessagePage';
import { InvitationsPage } from './pages/InvitationsPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CancellationPolicyPage from './pages/CancellationPolicyPage';
import CareersPage from './pages/CareersPage';
import { ChatbotWidget } from './features/chatbot';
import './styles/travellers-layout.css';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth?type=login" replace />;
  }

  return <>{children}</>;
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

// App content with route-aware layout
function AppContent() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;
  const dispatch = useAppDispatch();
  const { hasHydrated, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isTravellersRoute = location.pathname.startsWith('/travellers');
  const isTravellersDashboard = location.pathname.startsWith('/travellers/'); // Dashboard pages have sub-paths like /travellers/dashboard
  const isAuthRoute = location.pathname === '/auth';
  const avatarFetchRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!accessToken && !refreshToken) {
      dispatch(clearAuth());
    }
  }, [dispatch, hasHydrated, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      avatarFetchRef.current = null;
      return;
    }

    if (!user.avatar && avatarFetchRef.current !== user.id) {
      avatarFetchRef.current = user.id;
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, user?.id, user?.avatar]);

  // Sync cart with backend when user becomes authenticated
  const prevAuthRef = useRef(isAuthenticated);
  useEffect(() => {
    // Only sync when transitioning from not authenticated to authenticated
    const accessToken = localStorage.getItem('accessToken');
    if (isAuthenticated && accessToken && !prevAuthRef.current) {
      dispatch(syncCartToBackend() as any);
    }
    prevAuthRef.current = isAuthenticated;
  }, [dispatch, isAuthenticated]);

  // Show loading while auth state is hydrating from localStorage
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth page has its own layout (no navbar/footer)
  if (isAuthRoute) {
    return (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '12px',
            },
          }}
        />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </>
    );
  }

  return (
    <div className={`min-h-screen bg-white flex flex-col ${isTravellersRoute ? 'travellers-active' : ''} ${isTravellersDashboard ? 'travellers-dashboard-active' : ''}`}>
        {/* Scroll to top on route change */}
        <ScrollToTop />

        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Navbar />
        <main className="flex-grow">
          <Routes location={backgroundLocation || location}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/cinetrip-experiences" element={<CineTripExperiencesPage />} />
            <Route path="/cinematrip-experiences" element={<CineTripExperiencesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Trip Details Route */}
            <Route path="/trip/:slug" element={<TripDetailsPage />} />

            {/* Package Details Route */}
            <Route path="/package/:slug" element={<PackageDetailPage />} />

            {/* CineTrip Details Route */}
            <Route path="/cinetrip/:slug" element={<CineTripDetailPage />} />

            {/* Cart Route - Protected */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            {/* Booking Routes - Protected */}
            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/confirmation/:bookingId"
              element={
                <ProtectedRoute>
                  <BookingConfirmationPage />
                </ProtectedRoute>
              }
            />
            
            {/* User Routes - Protected */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            
            {/* Nearby Travellers */}
            <Route path="/nearby-travellers" element={<Navigate to="/travellers/nearby" replace />} />

            {/* TravelConnect Landing Page - Public */}
            <Route path="/travellers" element={<TravellersLandingPage />} />

            {/* Legal Pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />

            {/* Careers Page */}
            <Route path="/careers" element={<CareersPage />} />

            {/* TravelConnect Dashboard */}
            <Route path="/travellers/dashboard" element={<ProtectedRoute><TravellersLayout><TravellersDashboardPage /></TravellersLayout></ProtectedRoute>} />
            <Route path="/travellers/nearby" element={<ProtectedRoute><TravellersLayout><TravellersNearbyPage /></TravellersLayout></ProtectedRoute>} />
            <Route path="/travellers/trips" element={<ProtectedRoute><TravellersLayout><MyTripsPage /></TravellersLayout></ProtectedRoute>} />
            <Route path="/travellers/group-planning" element={<ProtectedRoute><TravellersLayout><GroupPlanningPage /></TravellersLayout></ProtectedRoute>} />
            <Route path="/travellers/group/:groupId" element={<ProtectedRoute><TravellersLayout><GroupDetailPage /></TravellersLayout></ProtectedRoute>} />
            <Route path="/travellers/expenses" element={<ProtectedRoute><TravellersLayout><ExpensesPage /></TravellersLayout></ProtectedRoute>} />
            <Route path="/travellers/profile" element={<ProtectedRoute><TravellersLayout><TravellerProfilePage /></TravellersLayout></ProtectedRoute>} />
            <Route path="/travellers/profile/:userId" element={<ProtectedRoute><TravellersLayout><PublicProfilePage /></TravellersLayout></ProtectedRoute>} />
            <Route path="/travellers/messages/:userId" element={<ProtectedRoute><TravellersLayout><DirectMessagePage /></TravellersLayout></ProtectedRoute>} />
            <Route path="/travellers/invitations" element={<ProtectedRoute><TravellersLayout><InvitationsPage /></TravellersLayout></ProtectedRoute>} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {backgroundLocation && (
          <Routes>
            <Route path="/travellers/messages/:userId" element={<ProtectedRoute><DirectMessagePage /></ProtectedRoute>} />
          </Routes>
        )}
        <Footer />

        {/* Chatbot Widget - appears on all pages except auth */}
        <ChatbotWidget />
      </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
