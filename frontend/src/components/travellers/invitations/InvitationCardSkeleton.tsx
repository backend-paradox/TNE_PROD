import styles from './InvitationCardSkeleton.module.css';

interface InvitationCardSkeletonProps {
  count?: number;
}

export function InvitationCardSkeleton({ count = 3 }: InvitationCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.image} />
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.title} />
              <div className={styles.destination} />
              <div className={styles.description} />
            </div>
            <div className={styles.metadata}>
              <div className={styles.inviterBadge} />
              <div className={styles.detailsRow}>
                <div className={styles.detailItem} />
                <div className={styles.detailItem} />
                <div className={styles.detailItem} />
              </div>
            </div>
            <div className={styles.actions}>
              <div className={styles.button} />
              <div className={styles.buttonSecondary} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
