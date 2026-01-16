import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TravellerSidebar } from '@/components/travellers/layout';
import { useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/travellerSlice';
import { useNearbyInbox } from '@/hooks/travellers';
import { useMemo } from 'react';
import styles from './TravellersLayout.module.css';

interface TravellersLayoutProps {
  children?: React.ReactNode;
}

export function TravellersLayout({ children }: TravellersLayoutProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { conversations, stats } = useNearbyInbox();
  const unreadThreads =
    typeof stats.unread === 'number'
      ? stats.unread
      : conversations.filter((item) => (item.unreadCount || 0) > 0).length;
  const unreadConversations = useMemo(
    () => conversations.filter((item) => (item.unreadCount || 0) > 0),
    [conversations]
  );
  const latestUnread = unreadConversations[0];

  const handleOpenInbox = () => {
    if (latestUnread) {
      navigate(`/travellers/messages/${latestUnread.userId}`, {
        state: {
          name: latestUnread.name,
          avatar: latestUnread.profileImage || '',
          backgroundLocation: location,
        },
      });
      return;
    }

    navigate('/travellers/nearby', {
      state: { activeTab: 'inbox', backgroundLocation: location },
    });
  };

  return (
    <div className={styles.layout}>
      <TravellerSidebar />

      <main className={styles.mainContent}>
        {/* Mobile Menu Button */}
        <div className={styles.mobileHeader}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className={styles.menuButton}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </Button>
        </div>

        <div className={styles.content}>
          {children || <Outlet />}
        </div>
      </main>

      {unreadThreads > 0 && (
        <div className={styles.inboxBubble}>
          <button className={styles.inboxBubbleButton} onClick={handleOpenInbox}>
            <MessageCircle size={22} />
            <span className={styles.inboxBubbleBadge}>{unreadThreads}</span>
          </button>
        </div>
      )}
    </div>
  );
}
