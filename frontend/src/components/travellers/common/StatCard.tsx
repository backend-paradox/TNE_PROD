import { Card } from '@/components/ui/card';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconColor: string;
  gradient: string;
}

export function StatCard({ icon, label, value, iconColor, gradient }: StatCardProps) {
  return (
    <Card className={styles.card}>
      <div className={styles.iconWrapper} style={{ background: gradient }}>
        <div className={styles.icon} style={{ color: iconColor }}>
          {icon}
        </div>
      </div>
      <div className={styles.content}>
        <p className={styles.value}>{value.toLocaleString()}</p>
        <p className={styles.label}>{label}</p>
      </div>
    </Card>
  );
}
