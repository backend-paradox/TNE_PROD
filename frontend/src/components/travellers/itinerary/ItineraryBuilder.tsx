import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  IndianRupee,
  Utensils,
  Camera,
  Car,
  Bed,
  ShoppingBag,
  Landmark,
  PartyPopper,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useItinerary } from '@/hooks/travellers';
import type { ItineraryActivity } from '@/types/travellers';
import { formatCurrency, normalizeDestination } from '@/utils/travellers';
import { DayTimeline } from '../DayTimeline';
import { AddActivityModal } from '../AddActivityModal';
import styles from './ItineraryBuilder.module.css';

interface ItineraryBuilderProps {
  tripName?: string;
  tripDates?: string;
  tripId?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  onClose?: () => void;
}

const categoryIcons = {
  FOOD: Utensils,
  SIGHTSEEING: Camera,
  TRANSPORT: Car,
  ACCOMMODATION: Bed,
  SHOPPING: ShoppingBag,
  ACTIVITY: Landmark,
  FREE_TIME: PartyPopper,
  OTHER: MoreHorizontal,
};

const categoryColors = {
  FOOD: '#f97316',
  SIGHTSEEING: '#8b5cf6',
  TRANSPORT: '#3b82f6',
  ACCOMMODATION: '#ec4899',
  SHOPPING: '#10b981',
  ACTIVITY: '#f59e0b',
  FREE_TIME: '#ef4444',
  OTHER: '#6b7280',
};

const formatCategoryLabel = (category: string) =>
  category
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export function ItineraryBuilder({
  tripName,
  tripDates,
  tripId,
  destination,
  startDate,
  endDate,
}: ItineraryBuilderProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    days,
    currentDay,
    selectedDay,
    totalActivities,
    totalCost,
    isLoading,
    error,
    setSelectedDay,
    fetchItinerary,
    addActivity,
    deleteActivity,
    goToNextDay,
    goToPreviousDay,
  } = useItinerary(tripId, startDate, endDate);

  const totalDays = days.length;
  const hasDays = totalDays > 0;
  const activeDay = currentDay || days[0] || null;

  useEffect(() => {
    fetchItinerary();
  }, [fetchItinerary]);

  const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return '';
    const format = (value?: string) => {
      if (!value) return 'TBD';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    return `${format(start)} - ${format(end)}`;
  };

  const formatShortDate = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatLongDate = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const displayDestination = normalizeDestination(destination) || tripName || 'Destination TBD';
  const displayDates = tripDates || formatDateRange(startDate, endDate) || 'Dates TBD';
  const formattedTotalCost = formatCurrency(totalCost, 'INR');
  const canAddActivity = Boolean(tripId && hasDays);

  const handlePrevDay = () => {
    if (!hasDays) return;
    goToPreviousDay();
  };

  const handleNextDay = () => {
    if (!hasDays) return;
    goToNextDay();
  };

  const handleAddActivity = async (activity: Omit<ItineraryActivity, 'id'>) => {
    await addActivity(selectedDay, activity);
    setShowAddModal(false);
  };

  const handleDeleteActivity = async (activityId: string) => {
    await deleteActivity(selectedDay, activityId);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Trip Itinerary</h1>
          <p className={styles.subtitle}>
            <MapPin size={16} />
            {displayDestination} | {displayDates}
          </p>
        </div>
        <Button
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
          disabled={!canAddActivity}
        >
          <Plus size={18} />
          Add Activity
        </Button>
      </div>

      {/* Day Navigation */}
      <div className={styles.dayNav}>
        <button
          className={styles.navArrow}
          onClick={handlePrevDay}
          disabled={!hasDays || selectedDay === 0}
        >
          <ChevronLeft size={20} />
        </button>

        <div className={styles.dayTabs}>
          {hasDays ? (
            days.map((day, index) => (
              <button
                key={day.dayNumber}
                className={`${styles.dayTab} ${selectedDay === index ? styles.active : ''}`}
                onClick={() => setSelectedDay(index)}
              >
                <span className={styles.dayNumber}>Day {day.dayNumber}</span>
                <span className={styles.dayDate}>{formatShortDate(day.date)}</span>
                {day.activities.length > 0 && (
                  <Badge className={styles.activityCount}>{day.activities.length}</Badge>
                )}
              </button>
            ))
          ) : (
            <div className={styles.emptyDays}>No itinerary dates yet</div>
          )}
        </div>

        <button
          className={styles.navArrow}
          onClick={handleNextDay}
          disabled={!hasDays || selectedDay === totalDays - 1}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Timeline */}
        <div className={styles.timeline}>
          {isLoading && !hasDays ? (
            <div className={styles.stateCard}>Loading itinerary...</div>
          ) : error && !hasDays ? (
            <div className={styles.stateCard}>
              <p>{error}</p>
              <Button variant="outline" onClick={() => fetchItinerary()}>
                Try Again
              </Button>
            </div>
          ) : !hasDays ? (
            <div className={styles.stateCard}>
              <p>No itinerary dates yet.</p>
              <p>Add trip dates to start building your plan.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeDay && (
                  <DayTimeline
                    day={activeDay}
                    categoryIcons={categoryIcons}
                    categoryColors={categoryColors}
                    onDeleteActivity={handleDeleteActivity}
                    onAddActivity={() => setShowAddModal(true)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Trip Summary</h3>

            <div className={styles.summaryStats}>
              <div className={styles.statItem}>
                <Calendar size={20} />
                <div>
                  <span className={styles.statValue}>{totalDays}</span>
                  <span className={styles.statLabel}>Days</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <Clock size={20} />
                <div>
                  <span className={styles.statValue}>{totalActivities}</span>
                  <span className={styles.statLabel}>Activities</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <IndianRupee size={20} />
                <div>
                  <span className={styles.statValue}>{formattedTotalCost}</span>
                  <span className={styles.statLabel}>Est. Cost</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.quickNav}>
            <h3 className={styles.quickNavTitle}>Quick Navigation</h3>
            {hasDays ? (
              days.map((day, index) => (
                <button
                  key={day.dayNumber}
                  className={`${styles.quickNavItem} ${selectedDay === index ? styles.activeNav : ''}`}
                  onClick={() => setSelectedDay(index)}
                >
                  <span>Day {day.dayNumber}</span>
                  <span className={styles.quickNavActivities}>
                    {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
                  </span>
                </button>
              ))
            ) : (
              <div className={styles.emptyQuickNav}>No days to navigate</div>
            )}
          </div>

          <div className={styles.categoryLegend}>
            <h3 className={styles.legendTitle}>Categories</h3>
            {Object.entries(categoryColors).map(([category, color]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <div key={category} className={styles.legendItem}>
                  <div className={styles.legendIcon} style={{ background: color }}>
                    <Icon size={14} />
                  </div>
                  <span>{formatCategoryLabel(category)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddActivity}
        dayNumber={activeDay?.dayNumber || selectedDay + 1}
        date={formatLongDate(activeDay?.date || startDate || '')}
      />
    </div>
  );
}
