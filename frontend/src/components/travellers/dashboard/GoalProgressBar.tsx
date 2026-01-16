import { Progress } from '@/components/ui/progress';
import type { Goal } from '@/types/travellers';
import styles from './GoalProgressBar.module.css';

interface GoalProgressBarProps {
  goal: Goal;
}

export function GoalProgressBar({ goal }: GoalProgressBarProps) {
  const { title, progress, target, color } = goal;
  const percentage = Math.round((progress / target) * 100);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.fraction}>
          {progress}/{target}
        </span>
      </div>
      <div className={styles.progressWrapper}>
        <Progress
          value={percentage}
          className={styles.progress}
          style={
            {
              '--progress-color': color,
            } as React.CSSProperties
          }
        />
        <span className={styles.percentage}>{percentage}%</span>
      </div>
    </div>
  );
}
