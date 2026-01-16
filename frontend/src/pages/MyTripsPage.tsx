import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ArrowRight, MapPin, Compass, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/travellers/common';
import { useGroups } from '@/hooks/travellers';
import { groupsAPI } from '@/features/travellers/travellersAPI';
import type { Group } from '@/types/travellers';
import styles from './MyTripsPage.module.css';
import { useNavigate } from 'react-router-dom';
import { normalizeDestination } from '@/utils/travellers';

interface Trip {
  id: string;
  destination: string;
  country: string;
  status: 'active' | 'completed';
  image: string;
  startDate: string;
  endDate: string;
  travelers: number;
  progress: number;
}

const buildTripFallbackImage = (label: string) => {
  const safeLabel = label && label.trim() ? label.trim() : 'Trip';
  const seed = safeLabel.toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  }
  const hue = hash;
  const hue2 = (hue + 28) % 360;
  const color1 = `hsl(${hue}, 62%, 42%)`;
  const color2 = `hsl(${hue2}, 70%, 78%)`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" role="img" aria-label="${safeLabel}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
        <pattern id="p" width="64" height="64" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="2.2" fill="rgba(255,255,255,0.25)" />
          <circle cx="40" cy="28" r="2.6" fill="rgba(255,255,255,0.18)" />
          <circle cx="24" cy="52" r="1.8" fill="rgba(255,255,255,0.2)" />
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#g)" />
      <rect width="800" height="600" fill="url(#p)" />
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Helper function to convert Group to Trip
const groupToTrip = (group: Group): Trip => {
  // Use backend calculatedStatus if available, fallback to client-side calculation
  let status: 'active' | 'completed' = 'completed';

  if (group.calculatedStatus) {
    // Map backend status (uppercase) to frontend status (lowercase)
    const statusMap = {
      'ON_TOUR': 'active' as const,
      'COMPLETED': 'completed' as const,
    };
    status = statusMap[group.calculatedStatus] || 'completed';
  } else {
    // Fallback to client-side calculation for backwards compatibility
    const now = new Date();
    const start = group.startDate ? new Date(group.startDate) : null;
    const end = group.endDate ? new Date(group.endDate) : null;

    if (start && end && now >= start && now <= end) {
      status = 'active';
    }
  }

  // Calculate progress (simple estimation based on dates)
  const now = new Date();
  const start = group.startDate ? new Date(group.startDate) : null;
  const end = group.endDate ? new Date(group.endDate) : null;
  const total = start && end ? end.getTime() - start.getTime() : 0;
  const elapsed = start ? now.getTime() - start.getTime() : 0;
  const progress =
    status === 'completed'
      ? 100
      : status === 'active' && total > 0
        ? Math.min(Math.max((elapsed / total) * 100, 0), 100)
        : 0;

  // Format dates
  const formatDate = (date?: string | null) => {
    if (!date) return 'TBD';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const destination = normalizeDestination(group.destination);

  return {
    id: group.id,
    destination: destination || group.name,
    country: '', // Group model doesn't have country, could parse from destination
    status,
    image: group.imageUrl || group.coverImage || buildTripFallbackImage(destination || group.name),
    startDate: formatDate(group.startDate),
    endDate: formatDate(group.endDate),
    travelers: group.memberCount || group._count?.members || 0,
    progress: Math.round(progress),
  };
};

export function MyTripsPage() {
  const { groups, isLoading, error, fetchGroups } = useGroups();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [counts, setCounts] = useState({ onTour: 0, completed: 0 });

  // Fetch counts for all statuses on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [onTourGroups, completedGroups] = await Promise.all([
          groupsAPI.getGroups('ON_TOUR'),
          groupsAPI.getGroups('COMPLETED'),
        ]);
        setCounts({
          onTour: onTourGroups.length,
          completed: completedGroups.length,
        });
      } catch (err) {
        console.error('Failed to fetch trip counts:', err);
      }
    };
    fetchCounts();
  }, []);

  // Fetch groups for the active tab
  useEffect(() => {
    fetchGroups(activeTab === 'active' ? 'ON_TOUR' : 'COMPLETED');
  }, [fetchGroups, activeTab]);

  // Convert groups to trips
  const trips = useMemo(() => groups.map(groupToTrip), [groups]);

  const filteredTrips = trips;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div>
          <h1 className={styles.title}>My Trips</h1>
          <p className={styles.subtitle}>Plan, manage, and track your adventures</p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div className={styles.filterTabs} variants={itemVariants}>
        <button
          className={`${styles.filterTab} ${activeTab === 'active' ? styles.filterTabActive : ''}`}
          onClick={() => setActiveTab('active')}
        >
          On Tour
          <span className={styles.filterCount}>{counts.onTour}</span>
        </button>
        <button
          className={`${styles.filterTab} ${activeTab === 'completed' ? styles.filterTabActive : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
          <span className={styles.filterCount}>{counts.completed}</span>
        </button>
      </motion.div>

      {/* Trips Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className={styles.skeletonGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonHeader}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonBadge} />
                  </div>
                  <div className={styles.skeletonInfo}>
                    <div className={styles.skeletonInfoItem} />
                    <div className={styles.skeletonInfoItem} />
                  </div>
                  <div className={styles.skeletonProgress} />
                  <div className={styles.skeletonActions}>
                    <div className={styles.skeletonButton} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={MapPin}
            title="Failed to load trips"
            description={error}
            actionLabel="Try Again"
            onAction={fetchGroups}
          />
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            icon={activeTab === 'active' ? Compass : MapPin}
            title={activeTab === 'active' ? 'No active trips' : 'No completed trips'}
            description={
              activeTab === 'active'
                ? "You don't have any trips currently on tour."
                : "You don't have any completed trips yet."
            }
          />
        ) : (
        <motion.div className={styles.tripsGrid} variants={containerVariants}>
          {filteredTrips.map((trip) => (
            <motion.div key={trip.id} className={styles.tripCard} variants={itemVariants}>
              {/* Trip Image */}
              <div className={styles.tripImage}>
                <img src={trip.image} alt={`${trip.destination}, ${trip.country}`} />
                <div className={styles.imageOverlay} />
              </div>

              {/* Trip Content */}
              <div className={styles.tripContent}>
                {/* Destination & Status */}
                <div className={styles.tripHeader}>
                  <h2 className={styles.destination}>
                    {trip.destination}, {trip.country}
                  </h2>
                  {trip.status === 'active' && (
                    <Badge className={styles.activeBadge}>Active</Badge>
                  )}
                  {trip.status === 'completed' && (
                    <Badge variant="secondary" className={styles.planningBadge}>
                      Completed
                    </Badge>
                  )}
                </div>

                {/* Trip Info */}
                <div className={styles.tripInfo}>
                  <div className={styles.infoItem}>
                    <Calendar size={16} />
                    <span>
                      {trip.startDate} - {trip.endDate}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <Users size={16} />
                    <span>{trip.travelers} travelers</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Trip Progress</span>
                    <span className={styles.progressValue}>{trip.progress}%</span>
                  </div>
                  <Progress value={trip.progress} className={styles.progressBar} />
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                  <Button
                    className={styles.viewDetailsBtn}
                    onClick={() => navigate(`/travellers/group/${trip.id}`)}
                  >
                    View Details
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
