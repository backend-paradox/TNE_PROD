import { Mail } from 'lucide-react';
import { InvitationsInbox } from '@/components/travellers/invitations';
import styles from './InvitationsPage.module.css';

export function InvitationsPage() {
  return (
    <div className={styles.container}>
      {/* Page Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <Mail size={28} />
          </div>
          <div className={styles.headerText}>
            <h1>Group Invitations</h1>
            <p>Review and respond to your pending trip invitations</p>
          </div>
        </div>
      </div>

      <InvitationsInbox />
    </div>
  );
}
