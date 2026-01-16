/**
 * @deprecated UNUSED - Replaced by direct Navbar/Footer usage in App.tsx
 * This layout component is part of the legacy JSX architecture.
 * DO NOT MODIFY
 * Deprecated: 2026-01-09
 * Scheduled for removal: Q1 2026
 *
 * Current active layout: App.tsx renders Navbar.tsx and Footer.tsx directly
 */
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
