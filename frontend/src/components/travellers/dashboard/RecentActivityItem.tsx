import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ActivityFeedItem } from '@/types/travellers';
import styles from './RecentActivityItem.module.css';

interface RecentActivityItemProps {
  activity: ActivityFeedItem;
}

export function RecentActivityItem({ activity }: RecentActivityItemProps) {
  const { userName, userAvatar, action, relativeTime } = activity;

  return (
    <div className={styles.item}>
      <Avatar className={styles.avatar}>
        <AvatarImage src={userAvatar} alt={userName} />
        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className={styles.content}>
        <p className={styles.action}>
          <strong>{userName}</strong> {action}
        </p>
        <span className={styles.time}>{relativeTime}</span>
      </div>
    </div>
  );
}
