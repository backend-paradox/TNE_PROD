import { motion } from 'framer-motion';
import { Clock, MapPin, IndianRupee, Trash2, Edit2, Plus, GripVertical, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ItineraryDay } from '@/types/travellers';
import { formatCurrency } from '@/utils/travellers';
import styles from './DayTimeline.module.css';

interface DayTimelineProps {
  day: ItineraryDay;
  categoryIcons: Record<string, React.ComponentType<{ size?: number }>>;
  categoryColors: Record<string, string>;
  onDeleteActivity: (id: string) => void;
  onAddActivity: () => void;
}

export function DayTimeline({
  day,
  categoryIcons,
  categoryColors,
  onDeleteActivity,
  onAddActivity,
}: DayTimelineProps) {
  if (!day) return null;

  const formatCategoryLabel = (category: string) =>
    category
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const formatDayDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const dayTotal = day.activities.reduce((sum, activity) => sum + activity.cost, 0);
  const dayCostLabel = formatCurrency(dayTotal, 'INR');

  return (
    <div className={styles.container}>
      <div className={styles.dayHeader}>
        <div className={styles.dayInfo}>
          <h2 className={styles.dayTitle}>Day {day.dayNumber}</h2>
          <span className={styles.dayDate}>{formatDayDate(day.date)}</span>
        </div>
        <div className={styles.daySummary}>
          <span>{day.activities.length} activities</span>
          <span>|</span>
          <span>{dayCostLabel} estimated</span>
        </div>
      </div>

      {day.activities.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Plus size={32} />
          </div>
          <h3>No activities planned</h3>
          <p>Start building your itinerary for this day</p>
          <Button className={styles.addFirstButton} onClick={onAddActivity}>
            <Plus size={18} />
            Add First Activity
          </Button>
        </div>
      ) : (
        <motion.div
          className={styles.timeline}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {day.activities.map((activity, index) => {
            const Icon = categoryIcons[activity.category] || MapPin;
            const color = categoryColors[activity.category] || '#6b7280';
            const timeMeta = [activity.time, activity.duration].filter(Boolean).join(' | ');

            return (
              <motion.div key={activity.id} className={styles.activityItem} variants={itemVariants}>
                {/* Timeline connector */}
                <div className={styles.timelineConnector}>
                  <div className={styles.timelineDot} style={{ background: color }} />
                  {index < day.activities.length - 1 && <div className={styles.timelineLine} />}
                </div>

                {/* Activity Card */}
                <div className={styles.activityCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.categoryBadge} style={{ background: `${color}20`, color }}>
                      <Icon size={16} />
                      <span>{formatCategoryLabel(activity.category)}</span>
                    </div>
                    <div className={styles.cardActions}>
                      <button className={styles.actionBtn} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Delete"
                        onClick={() => onDeleteActivity(activity.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className={styles.dragHandle} title="Drag to reorder">
                        <GripVertical size={16} />
                      </button>
                    </div>
                  </div>

                  {activity.image && (
                    <div className={styles.activityImage}>
                      <img src={activity.image} alt={activity.title} />
                    </div>
                  )}

                  <h3 className={styles.activityTitle}>{activity.title}</h3>

                  <div className={styles.activityMeta}>
                    <div className={styles.metaItem}>
                      <Clock size={14} />
                      <span>{timeMeta || 'Time TBD'}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <MapPin size={14} />
                      <span>{activity.location}</span>
                    </div>
                    {activity.cost > 0 && (
                      <div className={styles.metaItem}>
                        <IndianRupee size={14} />
                        <span>{formatCurrency(activity.cost, 'INR')}</span>
                      </div>
                    )}
                  </div>

                  {activity.notes && (
                    <div className={styles.activityNotes}>
                      <FileText size={14} />
                      <p>{activity.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Add more activities */}
          <div className={styles.addMore}>
            <button className={styles.addMoreButton} onClick={onAddActivity}>
              <Plus size={18} />
              <span>Add another activity</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
