import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Home,
  Users,
  Map,
  UsersRound,
  Wallet,
  Inbox,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/travellerSlice';
import { invitationsAPI } from '@/features/travellers/travellersAPI';
import styles from './TravellerSidebar.module.css';

// Main navigation items
const mainNavItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/travellers/dashboard',
    description: 'Overview & stats'
  },
  {
    id: 'nearby',
    label: 'TravelConnect Nearby',
    icon: Users,
    path: '/travellers/nearby',
    description: 'Find travel buddies'
  },
];

// Trip management items
const tripNavItems = [
  {
    id: 'trips',
    label: 'My Trips',
    icon: Map,
    path: '/travellers/trips',
    description: 'Active & past trips'
  },
  {
    id: 'group',
    label: 'Group Planning',
    icon: UsersRound,
    path: '/travellers/group-planning',
    description: 'Plan with friends'
  },
];

// Activity items
const activityNavItems = [
  {
    id: 'invitations',
    label: 'Invitations',
    icon: Inbox,
    path: '/travellers/invitations',
    description: 'Trip invites'
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: Wallet,
    path: '/travellers/expenses',
    description: 'Split & track'
  },
];

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  path: string;
  description?: string;
  badge?: string;
}

export function TravellerSidebar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.traveller.isSidebarOpen);
  const user = useAppSelector((state) => state.auth.user);
  const [pendingInvitations, setPendingInvitations] = useState(0);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    let isMounted = true;
    const fetchPendingInvitations = async () => {
      try {
        const data = await invitationsAPI.getMyInvitations();
        if (isMounted) setPendingInvitations(data.length);
      } catch (error) {
        // Ignore sidebar badge errors
      }
    };

    fetchPendingInvitations();

    const handleInvitationCount = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      if (typeof detail === 'number') {
        setPendingInvitations(detail);
      }
    };

    window.addEventListener('travellers:invitation-count', handleInvitationCount);

    return () => {
      isMounted = false;
      window.removeEventListener('travellers:invitation-count', handleInvitationCount);
    };
  }, [location.pathname]);

  const handleNavClick = () => {
    if (isSidebarOpen) dispatch(toggleSidebar());
  };

  const renderNavItem = (item: NavItem, showDescription = false) => {
    const Icon = item.icon;
    const isItemActive = isActive(item.path);

    return (
      <Link
        key={item.id}
        to={item.path}
        className={`${styles.navItem} ${isItemActive ? styles.active : ''}`}
        onClick={handleNavClick}
      >
        <div className={styles.navItemIcon}>
          <Icon size={18} />
        </div>
        <div className={styles.navItemContent}>
          <span className={styles.navItemLabel}>{item.label}</span>
          {showDescription && item.description && (
            <span className={styles.navItemMeta}>{item.description}</span>
          )}
        </div>
        {item.id === 'invitations' && pendingInvitations > 0 && (
          <Badge variant="destructive" className={`${styles.badge} ${styles.badgeCount}`}>
            {pendingInvitations}
          </Badge>
        )}
        {item.badge && item.id !== 'invitations' && (
          <Badge variant="destructive" className={`${styles.badge} ${styles.badgeNew}`}>
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Navigation */}
      <nav className={styles.nav}>
        {/* Main Section */}
        <div className={styles.navSection}>
          <p className={styles.navSectionLabel}>Main</p>
          {mainNavItems.map((item) => renderNavItem(item, true))}
        </div>

        {/* Trips Section */}
        <div className={styles.navDivider} />
        <div className={styles.navSection}>
          <p className={styles.navSectionLabel}>Trips</p>
          {tripNavItems.map((item) => renderNavItem(item, true))}
        </div>

        {/* Activity Section */}
        <div className={styles.navDivider} />
        <div className={styles.navSection}>
          <p className={styles.navSectionLabel}>Activity</p>
          {activityNavItems.map((item) => renderNavItem(item, true))}
        </div>

        {/* Account Section */}
        <div className={styles.navDivider} />
        <div className={styles.navSection}>
          <p className={styles.navSectionLabel}>Account</p>
          <Link
            to="/travellers/profile"
            className={`${styles.navItem} ${isActive('/travellers/profile') ? styles.active : ''}`}
            onClick={handleNavClick}
          >
            <div className={styles.navItemIcon}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'Profile'}
                  className={styles.profileAvatar}
                />
              ) : (
                <span className={styles.profileInitial}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className={styles.navItemContent}>
              <span className={styles.navItemLabel}>{user?.name || 'My Profile'}</span>
              <span className={styles.navItemMeta}>Edit your profile</span>
            </div>
          </Link>
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isSidebarOpen} onOpenChange={() => dispatch(toggleSidebar())}>
        <SheetContent side="left" className={styles.sheetContent}>
          <SheetHeader>
            <SheetTitle>TravelConnect</SheetTitle>
          </SheetHeader>
          <div className={styles.mobileContent}>
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
