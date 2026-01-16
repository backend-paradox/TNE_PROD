import { Skeleton } from '@/components/ui/skeleton';
import styles from './GroupCardSkeleton.module.css';

export function GroupCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Skeleton className={styles.image} />
        <div className={styles.info}>
          <Skeleton className={styles.name} />
          <div className={styles.metaRow}>
            <Skeleton className={styles.metaItem} />
            <Skeleton className={styles.metaItem} />
          </div>
          <Skeleton className={styles.stats} />
        </div>
      </div>
      <div className={styles.actions}>
        <Skeleton className={styles.button} />
      </div>
    </div>
  );
}
