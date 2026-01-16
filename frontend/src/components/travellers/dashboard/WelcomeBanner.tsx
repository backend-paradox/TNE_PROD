import { MapPin, Calendar, Users, Wallet, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency, normalizeDestination } from '@/utils/travellers';
import styles from './WelcomeBanner.module.css';

export function WelcomeBanner() {
  const currentUser = useAppSelector((state) => state.traveller.currentUser);

  if (!currentUser) return null;

  const { currentLocation, currentTrip, groupSize, totalSpent } = currentUser;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Welcome back!</h1>
            <p className={styles.subtitle}>
              You're currently in <strong>{currentLocation}</strong>
              {currentTrip && (
                <> | <strong>{currentTrip.daysRemaining} days</strong> remaining</>
              )}
            </p>
          </div>
          <Button variant="secondary" className={styles.quickActions}>
            <Zap size={16} />
            Quick Actions
          </Button>
        </div>

        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <div className={styles.cardIcon}>
              <MapPin size={20} />
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Current Trip</p>
              <p className={styles.cardValue}>
                {normalizeDestination(currentTrip?.destination) || 'No active trip'}
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardIcon}>
              <Calendar size={20} />
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Days Left</p>
              <p className={styles.cardValue}>{currentTrip?.daysRemaining || 0}</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardIcon}>
              <Users size={20} />
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Group Size</p>
              <p className={styles.cardValue}>{groupSize}</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardIcon}>
              <Wallet size={20} />
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Total Spent</p>
              <p className={styles.cardValue}>{formatCurrency(totalSpent, 'INR')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
