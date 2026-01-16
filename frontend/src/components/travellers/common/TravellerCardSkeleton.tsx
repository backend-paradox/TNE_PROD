import { Skeleton } from '@/components/ui/skeleton';
import styles from './TravellerCardSkeleton.module.css';

export function TravellerCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Skeleton className={styles.avatar} />
        <div className={styles.info}>
          <Skeleton className={styles.name} />
          <Skeleton className={styles.location} />
          <Skeleton className={styles.locationSub} />
        </div>
      </div>
      <div className={styles.whyConnect}>
        <Skeleton className={styles.whyConnectHeader} />
        <div className={styles.reasons}>
          <Skeleton className={styles.reason} />
          <Skeleton className={styles.reason} />
        </div>
      </div>
      <div className={styles.tags}>
        <Skeleton className={styles.tag} />
        <Skeleton className={styles.tag} />
        <Skeleton className={styles.tag} />
      </div>
      <div className={styles.languages}>
        <Skeleton className={styles.language} />
        <Skeleton className={styles.language} />
      </div>
      <div className={styles.footer}>
        <div className={styles.dateInfo}>
          <Skeleton className={styles.dates} />
        </div>
        <div className={styles.actions}>
          <Skeleton className={styles.button} />
        </div>
      </div>
    </div>
  );
}
