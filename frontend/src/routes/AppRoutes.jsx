/**
 * @deprecated UNUSED - Active routing is in App.tsx (TSX stack)
 * This file is part of the legacy JSX routing architecture using MainLayout.
 * DO NOT MODIFY
 * Deprecated: 2026-01-09
 * Scheduled for removal: Q1 2026
 *
 * Current active routing: App.tsx with direct route definitions
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Auth pages
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import { AuthPage } from '../pages/AuthPage';
import EmailVerificationPage from '../pages/EmailVerificationPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// Public pages
import Home from '../pages/Home';
import SearchResults from '../pages/SearchResults';
import HotelDetails from '../pages/HotelDetails';
import FlightDetails from '../pages/FlightDetails';
import TermsAndPolicyPage from '../pages/TermsAndPolicyPage';
import { CineTripExperiencesPage } from '../pages/CineTripExperiencesPage';

// Protected pages
import Booking from '../pages/Booking';
import Payment from '../pages/Payment';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFailure from '../pages/PaymentFailure';
import ProfilePage from '../pages/ProfilePage';
import MyBookings from '../pages/MyBookings';
import BookingDetails from '../pages/BookingDetails';

// Vendor pages
import VendorDashboard from '../features/vendor/VendorDashboard';

// Admin pages
import AdminDashboard from '../features/admin/AdminDashboard';

// TravelConnect
import { TravellersLayout } from '../components/travellers/layout/TravellersLayout';
import { TravellersDashboardPage } from '../pages/TravellersDashboardPage';
import { TravellersNearbyPage } from '../pages/TravellersNearbyPage';
import { MyTripsPage } from '../pages/MyTripsPage';
import { GroupDetailPage } from '../pages/GroupDetailPage';
import { GroupPlanningPage } from '../pages/GroupPlanningPage';
import { DirectMessagePage } from '../pages/DirectMessagePage';
import { ExpensesPage } from '../pages/ExpensesPage';
import { InvitationsPage } from '../pages/InvitationsPage';
import { TravellerProfilePage } from '../pages/TravellerProfilePage';
import { PublicProfilePage } from '../pages/PublicProfilePage';

// 404
import NotFound from '../pages/NotFound';

// Layout
import MainLayout from '../components/layout/MainLayout';

export default function AppRoutes() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Auth routes - redirect to home if already authenticated */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />
      {/* New unified auth page */}
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
      />
      {/* Email verification - accessible even when authenticated */}
      <Route path="/auth/verify" element={<EmailVerificationPage />} />
      {/* Password reset - accessible even when authenticated */}
      <Route path="/auth/reset" element={<ResetPasswordPage />} />

      {/* TravelConnect Routes */}
      <Route
        path="/travellers"
        element={
          <ProtectedRoute>
            <TravellersLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TravellersDashboardPage />} />
        <Route path="group-planning" element={<GroupPlanningPage />} />
        <Route path="group/:groupId" element={<GroupDetailPage />} />
        <Route path="trips" element={<MyTripsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="profile" element={<TravellerProfilePage />} />
        <Route path="profile/:userId" element={<PublicProfilePage />} />
        <Route path="nearby" element={<TravellersNearbyPage />} />
        <Route path="messages/:userId" element={<DirectMessagePage />} />
        <Route path="invitations" element={<InvitationsPage />} />
      </Route>

      {/* Public routes with layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/terms-and-policy" element={<TermsAndPolicyPage />} />
        <Route path="/cinematrip-experiences" element={<CineTripExperiencesPage />} />

        {/* TravelConnect - Testing route inside MainLayout */}
        <Route path="/test" element={<div style={{padding: '2rem', background: 'red', color: 'white', fontSize: '2rem'}}>TEST ROUTE WORKS!</div>} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/flights/:id" element={<FlightDetails />} />

        {/* Protected routes */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-failure"
          element={
            <ProtectedRoute>
              <PaymentFailure />
            </ProtectedRoute>
          }
        />
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
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          }
        />

        {/* Vendor routes */}
        <Route
          path="/vendor/dashboard"
          element={
            <RoleRoute allowedRoles={['VENDOR']}>
              <VendorDashboard />
            </RoleRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
