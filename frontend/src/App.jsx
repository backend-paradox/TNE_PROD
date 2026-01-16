/**
 * @deprecated UNUSED - Active application entry point is App.tsx (TSX stack)
 * This file is part of the legacy JSX routing architecture.
 * DO NOT MODIFY
 * Deprecated: 2026-01-09
 * Scheduled for removal: Q1 2026
 *
 * Current active entry point: App.tsx with Navbar.tsx and Footer.tsx
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserFromStorage } from './features/auth/authSlice';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore user from localStorage on app load
    dispatch(setUserFromStorage());
  }, [dispatch]);

  return (
    <div className="app">
      <AppRoutes />
    </div>
  );
}

export default App;
