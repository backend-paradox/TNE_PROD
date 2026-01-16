import { useAppDispatch } from '@/store/hooks';
import { markNotificationRead } from '@/store/slices/travellerSlice';
import type { Notification } from '@/types/travellers';
import styles from './NotificationItem.module.css';

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

const typeColors = {
  info: 'var(--tc-info)',
  warning: 'var(--tc-warning)',
  success: 'var(--tc-success)',
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const { id, message, type, read } = notification;
  const dispatch = useAppDispatch();
  const dotColor = typeColors[type];

  const handleClick = () => {
    if (!read) {
      if (onRead) {
        onRead(id);
      } else {
        dispatch(markNotificationRead(id));
      }
    }
  };

  return (
    <div
      className={`${styles.item} ${read ? styles.read : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className={styles.dot} style={{ backgroundColor: dotColor }} />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
