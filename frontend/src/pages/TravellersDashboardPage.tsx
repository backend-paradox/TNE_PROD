import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  AlertTriangle,
  Bell,
  Plus,
  Search,
  Mail,
  Mountain,
  Palmtree,
  Waves,
  TreePine,
  UserPlus,
  Shield,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  Globe,
  Plane,
  Star,
  ArrowRight,
  Heart,
  Compass,
  CheckCircle2,
  MessageSquare,
  Vote,
  FileText,
  DollarSign,
  Activity,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/app/axios';
import {
  expensesAPI,
  groupsAPI,
  invitationsAPI,
  type GroupInvitation,
  type PendingSplit,
} from '@/features/travellers/travellersAPI';
import type { ActivityFeedItem, Group, Poll } from '@/types/travellers';
import { useAppSelector } from '@/store/hooks';
import styles from './TravellersDashboardPage.module.css';

type UserStats = {
  connectionCount?: number;
  totalTrips?: number;
  visitedCitiesCount?: number;
};

type ActivityFeedResponse = {
  activities: Array<{
    id: string;
    type: string;
    title?: string;
    description?: string;
    createdAt: string;
    userProfile?: {
      name?: string;
      profilePicUrl?: string;
    };
  }>;
};

const getRelativeTime = (timestamp?: string) => {
  if (!timestamp) return 'Just now';
  const diffMs = Date.now() - new Date(timestamp).getTime();
  if (Number.isNaN(diffMs)) return 'Just now';
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return 'Just now';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
};

const getOpenPollCount = async (groups: Group[]) => {
  if (!groups.length) return 0;
  const pollGroups = groups.slice(0, 3);
  const responses = await Promise.all(
    pollGroups.map((group) => groupsAPI.getPolls(group.id).catch(() => []))
  );
  const now = new Date();
  return responses
    .flat()
    .filter((poll: Poll) => {
      if (poll.isClosed) return false;
      if (!poll.endsAt) return true;
      const end = new Date(poll.endsAt);
      return !Number.isNaN(end.getTime()) && end >= now;
    }).length;
};

// Get icon for activity type
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'trip_created':
    case 'trip_joined':
      return Plane;
    case 'expense_added':
    case 'expense_settled':
      return DollarSign;
    case 'poll_created':
    case 'poll_voted':
      return Vote;
    case 'message':
      return MessageSquare;
    case 'connection':
      return UserPlus;
    case 'itinerary':
      return Calendar;
    default:
      return Activity;
  }
};

// Featured Groups data for dashboard
const featuredGroups = [
  {
    id: 1,
    name: 'Ladakh Adventure',
    destination: 'Leh-Ladakh',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    icon: Mountain,
    members: 8,
    maxMembers: 12,
    startDate: 'Jan 25, 2026',
    duration: '7 days',
    spotsLeft: 4,
    organizer: { name: 'Arjun K.', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
    memberAvatars: [
      'https://randomuser.me/api/portraits/women/21.jpg',
      'https://randomuser.me/api/portraits/men/23.jpg',
      'https://randomuser.me/api/portraits/women/24.jpg',
    ],
  },
  {
    id: 2,
    name: 'Goa Beach Vibes',
    destination: 'North Goa',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop',
    icon: Palmtree,
    members: 6,
    maxMembers: 10,
    startDate: 'Feb 10, 2026',
    duration: '5 days',
    spotsLeft: 4,
    organizer: { name: 'Sneha M.', avatar: 'https://randomuser.me/api/portraits/women/42.jpg' },
    memberAvatars: [
      'https://randomuser.me/api/portraits/men/26.jpg',
      'https://randomuser.me/api/portraits/women/27.jpg',
      'https://randomuser.me/api/portraits/men/28.jpg',
    ],
  },
  {
    id: 3,
    name: 'Kerala Backwaters',
    destination: 'Alleppey',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop',
    icon: Waves,
    members: 5,
    maxMembers: 8,
    startDate: 'Feb 20, 2026',
    duration: '4 days',
    spotsLeft: 3,
    organizer: { name: 'Ravi P.', avatar: 'https://randomuser.me/api/portraits/men/51.jpg' },
    memberAvatars: [
      'https://randomuser.me/api/portraits/women/31.jpg',
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/women/34.jpg',
    ],
  },
  {
    id: 4,
    name: 'Manali Snow Trek',
    destination: 'Himachal',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop',
    icon: TreePine,
    members: 10,
    maxMembers: 15,
    startDate: 'Mar 5, 2026',
    duration: '6 days',
    spotsLeft: 5,
    organizer: { name: 'Kavya S.', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    memberAvatars: [
      'https://randomuser.me/api/portraits/men/37.jpg',
      'https://randomuser.me/api/portraits/women/38.jpg',
      'https://randomuser.me/api/portraits/men/39.jpg',
    ],
  },
];

// Active Travelers data for dashboard
const activeTravelers = [
  {
    id: 1,
    name: 'Aditya Sharma',
    location: 'Mumbai',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    interests: ['Mountains', 'Photography'],
    tripsCompleted: 4,
    lookingFor: 'Ladakh trip buddy',
    verified: true,
  },
  {
    id: 2,
    name: 'Meera Reddy',
    location: 'Hyderabad',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    interests: ['Beaches', 'Food'],
    tripsCompleted: 3,
    lookingFor: 'Beach vacation group',
    verified: true,
  },
  {
    id: 3,
    name: 'Karthik Nair',
    location: 'Chennai',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    interests: ['Backpacking', 'Culture'],
    tripsCompleted: 5,
    lookingFor: 'Southeast Asia trip',
    verified: true,
  },
  {
    id: 4,
    name: 'Ishita Gupta',
    location: 'Delhi',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    interests: ['Adventure', 'Trekking'],
    tripsCompleted: 2,
    lookingFor: 'Himalayan trek group',
    verified: true,
  },
  {
    id: 5,
    name: 'Rohan Joshi',
    location: 'Pune',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    interests: ['Road trips', 'Wildlife'],
    tripsCompleted: 4,
    lookingFor: 'Wildlife safari buddy',
    verified: true,
  },
  {
    id: 6,
    name: 'Ananya Das',
    location: 'Kolkata',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    interests: ['Heritage', 'Art'],
    tripsCompleted: 3,
    lookingFor: 'Rajasthan heritage tour',
    verified: true,
  },
];

// Live Activity Feed data
const liveActivityFeed = [
  {
    id: 1,
    type: 'join',
    user: 'Priya S.',
    avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
    action: 'joined',
    target: 'Ladakh Adventure group',
    time: '2 min ago',
  },
  {
    id: 2,
    type: 'create',
    user: 'Rahul V.',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    action: 'created',
    target: 'Goa New Year Trip',
    time: '5 min ago',
  },
  {
    id: 3,
    type: 'connect',
    user: 'Neha K.',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    action: 'connected with',
    target: 'Amit P.',
    time: '8 min ago',
  },
  {
    id: 4,
    type: 'trip',
    user: 'Kerala Backwaters group',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    action: 'completed their trip',
    target: '',
    time: '15 min ago',
  },
  {
    id: 5,
    type: 'join',
    user: 'Vikram M.',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    action: 'joined',
    target: 'Manali Snow Trek',
    time: '20 min ago',
  },
  {
    id: 6,
    type: 'create',
    user: 'Anjali R.',
    avatar: 'https://randomuser.me/api/portraits/women/47.jpg',
    action: 'is looking for',
    target: 'travel buddies to Rishikesh',
    time: '25 min ago',
  },
];

export function TravellersDashboardPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const travelersScrollRef = useRef<HTMLDivElement>(null);

  // Activity feed rotation state
  const [activityStartIndex, setActivityStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const [activeTrips, setActiveTrips] = useState<Group[]>([]);
  const [planningTrips, setPlanningTrips] = useState<Group[]>([]);
  const [pendingSplits, setPendingSplits] = useState<PendingSplit[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [openPollsCount, setOpenPollsCount] = useState(0);
  const [stats, setStats] = useState<UserStats>({});
  const [recentActivity, setRecentActivity] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [active, planning, splits, invites, statsResponse, activityResponse] = await Promise.all([
          groupsAPI.getGroups('ON_TOUR'),
          groupsAPI.getGroups('PLANNING'),
          expensesAPI.getMyPendingSplits(),
          invitationsAPI.getMyInvitations(),
          axiosInstance.get('/users/stats'),
          axiosInstance.get('/users/activity-feed', { params: { limit: 5 } }),
        ]);

        if (!isMounted) return;

        const activityPayload: ActivityFeedResponse =
          (activityResponse.data?.data || activityResponse.data || {}) as ActivityFeedResponse;
        const activityItems: ActivityFeedItem[] = (activityPayload.activities || []).map((activity) => ({
          id: activity.id,
          userId: activity.id,
          userName: activity.userProfile?.name || 'Traveller',
          userAvatar: activity.userProfile?.profilePicUrl || '',
          action: activity.title || activity.description || 'Activity update',
          actionType: 'posted',
          timestamp: activity.createdAt,
          relativeTime: getRelativeTime(activity.createdAt),
        }));

        setActiveTrips(Array.isArray(active) ? active : []);
        setPlanningTrips(Array.isArray(planning) ? planning : []);
        setPendingSplits(Array.isArray(splits) ? splits : []);
        setInvitations(Array.isArray(invites) ? invites : []);
        setStats(statsResponse.data?.data || statsResponse.data || {});
        setRecentActivity(activityItems);

        const tripsForActions = [...(Array.isArray(active) ? active : []), ...(Array.isArray(planning) ? planning : [])];
        const pollCount = await getOpenPollCount(tripsForActions);

        if (!isMounted) return;
        setOpenPollsCount(pollCount);
      } catch (err) {
        console.error('Dashboard load error:', err);
        if (isMounted) {
          setError('Failed to load dashboard data.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  // Get visible activities (3 items) for live feed
  const getVisibleActivities = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (activityStartIndex + i) % liveActivityFeed.length;
      visible.push({ ...liveActivityFeed[index], displayIndex: i });
    }
    return visible;
  };

  // Rotate activity feed
  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActivityStartIndex((prev) => (prev + 1) % liveActivityFeed.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(rotateInterval);
  }, []);

  // Scroll travelers horizontally
  const scrollTravelers = (direction: 'left' | 'right') => {
    const container = travelersScrollRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const pendingActions = useMemo(() => {
    return [
      {
        id: 'splits',
        title: 'Settle expenses',
        meta: `${pendingSplits.length} pending split${pendingSplits.length === 1 ? '' : 's'}`,
        icon: Wallet,
        onClick: () => navigate('/travellers/expenses'),
      },
      {
        id: 'polls',
        title: 'Vote on polls',
        meta: `${openPollsCount} open poll${openPollsCount === 1 ? '' : 's'}`,
        icon: AlertTriangle,
        onClick: () => navigate('/travellers/trips'),
      },
      {
        id: 'invites',
        title: 'Respond to invitations',
        meta: `${invitations.length} invite${invitations.length === 1 ? '' : 's'}`,
        icon: Mail,
        onClick: () => navigate('/travellers/invitations'),
      },
    ];
  }, [pendingSplits.length, openPollsCount, invitations.length, navigate]);

  const greetingName = user?.name || 'Traveller';

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        {/* Skeleton Loading State */}
        <div className={styles.heroSkeleton}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonSubtitle} />
          </div>
        </div>
        <div className={styles.statsGridSkeleton}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.statCardSkeleton} />
          ))}
        </div>
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <div className={styles.sectionSkeleton} />
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.sectionSkeleton} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.section} style={{ textAlign: 'center' }}>
          <p>{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Hero Welcome Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.heroAvatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt={greetingName} />
              ) : (
                <div className={styles.heroAvatarPlaceholder}>
                  {greetingName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={styles.heroAvatarBadge}>
                <Star size={10} />
              </div>
            </div>
            <div className={styles.heroText}>
              <span className={styles.heroGreeting}>{getGreeting()}</span>
              <h1 className={styles.heroName}>{greetingName}</h1>
              <p className={styles.heroSubtext}>
                <Compass size={14} />
                Ready for your next adventure?
              </p>
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroQuickStats}>
              <div className={styles.heroQuickStat}>
                <Globe size={18} />
                <div>
                  <span className={styles.heroQuickStatValue}>{stats.visitedCitiesCount || 0}</span>
                  <span className={styles.heroQuickStatLabel}>Cities</span>
                </div>
              </div>
              <div className={styles.heroQuickStat}>
                <Plane size={18} />
                <div>
                  <span className={styles.heroQuickStatValue}>{stats.totalTrips || activeTrips.length + planningTrips.length}</span>
                  <span className={styles.heroQuickStatLabel}>Trips</span>
                </div>
              </div>
              <div className={styles.heroQuickStat}>
                <Heart size={18} />
                <div>
                  <span className={styles.heroQuickStatValue}>{stats.connectionCount || 0}</span>
                  <span className={styles.heroQuickStatLabel}>Friends</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.heroActions}>
          <button className="btn btn-white" onClick={() => navigate('/travellers/group-planning')}>
            <Plus size={18} />
            Create Trip
          </button>
          <button className="btn btn-glass" onClick={() => navigate('/travellers/nearby')}>
            <Search size={18} />
            Find Travellers
          </button>
          <button className={`btn btn-glass ${styles.heroInviteBtn}`} onClick={() => navigate('/travellers/invitations')}>
            <Mail size={18} />
            Invitations
            {invitations.length > 0 && (
              <span className={styles.heroBadge}>{invitations.length}</span>
            )}
          </button>
        </div>
        {/* Decorative elements */}
        <div className={styles.heroDecor1} />
        <div className={styles.heroDecor2} />
      </div>

      {/* Enhanced Pending Actions & Recent Activity Grid */}
      <div className={styles.actionsGrid}>
        {/* Enhanced Pending Actions */}
        <div className={styles.enhancedSection}>
          <div className={styles.enhancedSectionHeader}>
            <div className={styles.enhancedSectionLeft}>
              <div className={styles.enhancedSectionIcon}>
                <Zap size={22} />
              </div>
              <div>
                <h3 className={styles.enhancedSectionTitle}>Pending Actions</h3>
                <p className={styles.enhancedSectionSubtitle}>
                  {pendingSplits.length + openPollsCount + invitations.length} items need attention
                </p>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/travellers/trips')}>
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          <div className={styles.enhancedPendingList}>
            {/* Expense Splits */}
            <div
              className={`${styles.enhancedPendingCard} ${styles.expenseCard}`}
              onClick={() => navigate('/travellers/expenses')}
              role="button"
              tabIndex={0}
            >
              <div className={styles.pendingCardIcon}>
                <Wallet size={22} />
              </div>
              <div className={styles.pendingCardContent}>
                <div className={styles.pendingCardHeader}>
                  <h4 className={styles.pendingCardTitle}>Expense Settlements</h4>
                  {pendingSplits.length > 0 && (
                    <span className={styles.pendingCardBadge}>{pendingSplits.length}</span>
                  )}
                </div>
                <p className={styles.pendingCardDesc}>
                  {pendingSplits.length === 0
                    ? 'All expenses settled'
                    : `${pendingSplits.length} pending split${pendingSplits.length === 1 ? '' : 's'} to settle`}
                </p>
                {pendingSplits.length > 0 && (
                  <div className={styles.pendingCardAction}>
                    <span>Settle now</span>
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
              {pendingSplits.length === 0 && (
                <div className={styles.pendingCardCheck}>
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>

            {/* Poll Votes */}
            <div
              className={`${styles.enhancedPendingCard} ${styles.pollCard}`}
              onClick={() => navigate('/travellers/trips')}
              role="button"
              tabIndex={0}
            >
              <div className={styles.pendingCardIcon}>
                <Vote size={22} />
              </div>
              <div className={styles.pendingCardContent}>
                <div className={styles.pendingCardHeader}>
                  <h4 className={styles.pendingCardTitle}>Poll Votes</h4>
                  {openPollsCount > 0 && (
                    <span className={styles.pendingCardBadge}>{openPollsCount}</span>
                  )}
                </div>
                <p className={styles.pendingCardDesc}>
                  {openPollsCount === 0
                    ? 'All polls voted'
                    : `${openPollsCount} open poll${openPollsCount === 1 ? '' : 's'} waiting for your vote`}
                </p>
                {openPollsCount > 0 && (
                  <div className={styles.pendingCardAction}>
                    <span>Vote now</span>
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
              {openPollsCount === 0 && (
                <div className={styles.pendingCardCheck}>
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>

            {/* Invitations */}
            <div
              className={`${styles.enhancedPendingCard} ${styles.inviteCard}`}
              onClick={() => navigate('/travellers/invitations')}
              role="button"
              tabIndex={0}
            >
              <div className={styles.pendingCardIcon}>
                <Mail size={22} />
              </div>
              <div className={styles.pendingCardContent}>
                <div className={styles.pendingCardHeader}>
                  <h4 className={styles.pendingCardTitle}>Trip Invitations</h4>
                  {invitations.length > 0 && (
                    <span className={styles.pendingCardBadge}>{invitations.length}</span>
                  )}
                </div>
                <p className={styles.pendingCardDesc}>
                  {invitations.length === 0
                    ? 'No pending invitations'
                    : `${invitations.length} trip invite${invitations.length === 1 ? '' : 's'} awaiting response`}
                </p>
                {invitations.length > 0 && (
                  <div className={styles.pendingCardAction}>
                    <span>Respond</span>
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
              {invitations.length === 0 && (
                <div className={styles.pendingCardCheck}>
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className={styles.enhancedSection}>
          <div className={styles.enhancedSectionHeader}>
            <div className={styles.enhancedSectionLeft}>
              <div className={`${styles.enhancedSectionIcon} ${styles.activityIcon}`}>
                <Activity size={22} />
              </div>
              <div>
                <h3 className={styles.enhancedSectionTitle}>Recent Activity</h3>
                <p className={styles.enhancedSectionSubtitle}>Your latest updates</p>
              </div>
            </div>
          </div>

          <div className={styles.enhancedActivityList}>
            {recentActivity.length === 0 ? (
              <div className={styles.activityEmptyState}>
                <div className={styles.activityEmptyIcon}>
                  <Bell size={32} />
                </div>
                <h4>No recent activity</h4>
                <p>Your activity feed will appear here once you start planning trips</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/travellers/group-planning')}
                >
                  <Plus size={16} />
                  Create Your First Trip
                </button>
              </div>
            ) : (
              <>
                {recentActivity.slice(0, 5).map((activity) => {
                  const IconComponent = getActivityIcon(activity.actionType || 'default');
                  return (
                    <div key={activity.id} className={styles.enhancedActivityItem}>
                      <div className={styles.activityItemIcon}>
                        {activity.userAvatar ? (
                          <img src={activity.userAvatar} alt={activity.userName} />
                        ) : (
                          <IconComponent size={18} />
                        )}
                      </div>
                      <div className={styles.activityItemContent}>
                        <p className={styles.activityItemText}>
                          <strong>{activity.userName}</strong> {activity.action}
                        </p>
                        <span className={styles.activityItemTime}>
                          <Clock size={12} />
                          {activity.relativeTime || getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {recentActivity.length > 5 && (
                  <button
                    className={`btn btn-ghost btn-sm btn-block ${styles.showMoreBtn}`}
                    onClick={() => navigate('/travellers/activity')}
                  >
                    View all activity
                    <ArrowRight size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Trip Stats Cards */}
      <div className={styles.tripStatsGrid}>
        {/* Active Trips Card */}
        <div
          className={`${styles.tripStatCard} ${styles.activeTripsCard}`}
          onClick={() => navigate('/travellers/trips?status=ON_TOUR')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.tripStatCardBg}>
            <div className={styles.tripStatCardPattern} />
          </div>
          <div className={styles.tripStatCardContent}>
            <div className={styles.tripStatCardHeader}>
              <div className={styles.tripStatCardIcon}>
                <MapPin size={24} />
              </div>
              <div className={styles.tripStatCardBadge}>
                {activeTrips.length > 0 ? (
                  <span className={styles.liveBadge}>
                    <span className={styles.liveDotSmall} />
                    Live
                  </span>
                ) : (
                  <span className={styles.emptyBadge}>No active</span>
                )}
              </div>
            </div>
            <div className={styles.tripStatCardBody}>
              <span className={styles.tripStatValue}>{activeTrips.length}</span>
              <span className={styles.tripStatLabel}>Active Trips</span>
              <p className={styles.tripStatDesc}>
                {activeTrips.length === 0
                  ? 'Start your adventure today'
                  : activeTrips.length === 1
                  ? 'Currently on tour'
                  : `${activeTrips.length} trips in progress`}
              </p>
            </div>
            <div className={styles.tripStatCardFooter}>
              <button className={styles.tripStatBtn}>
                {activeTrips.length === 0 ? (
                  <>
                    <Plus size={16} />
                    Plan a Trip
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    View Trips
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Planning Trips Card */}
        <div
          className={`${styles.tripStatCard} ${styles.planningTripsCard}`}
          onClick={() => navigate('/travellers/trips?status=PLANNING')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.tripStatCardBg}>
            <div className={styles.tripStatCardPattern} />
          </div>
          <div className={styles.tripStatCardContent}>
            <div className={styles.tripStatCardHeader}>
              <div className={styles.tripStatCardIcon}>
                <Calendar size={24} />
              </div>
              <div className={styles.tripStatCardBadge}>
                {planningTrips.length > 0 ? (
                  <span className={styles.planningBadgeLabel}>
                    <Sparkles size={12} />
                    {planningTrips.length} draft{planningTrips.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className={styles.emptyBadge}>No plans yet</span>
                )}
              </div>
            </div>
            <div className={styles.tripStatCardBody}>
              <span className={styles.tripStatValue}>{planningTrips.length}</span>
              <span className={styles.tripStatLabel}>Planning</span>
              <p className={styles.tripStatDesc}>
                {planningTrips.length === 0
                  ? 'Dream up your next trip'
                  : planningTrips.length === 1
                  ? 'Trip in the works'
                  : `${planningTrips.length} trips being planned`}
              </p>
            </div>
            <div className={styles.tripStatCardFooter}>
              <button className={styles.tripStatBtn}>
                {planningTrips.length === 0 ? (
                  <>
                    <Plus size={16} />
                    Start Planning
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    Continue Planning
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Travel Groups Section */}
      <div className={styles.section} style={{ marginTop: '2rem' }}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionIcon}>
              <TrendingUp size={20} />
            </div>
            <h3 className={styles.sectionTitle}>Trending Travel Groups</h3>
          </div>
          <Button variant="ghost" onClick={() => navigate('/travellers/discover')}>
            Explore all
          </Button>
        </div>
        <div className={styles.featuredGroupsGrid}>
          {featuredGroups.map((group) => {
            const IconComponent = group.icon;
            return (
              <div key={group.id} className={styles.featuredGroupCard}>
                <div className={styles.featuredGroupImage}>
                  <img src={group.image} alt={group.name} />
                  <div className={styles.featuredGroupOverlay}>
                    <div className={styles.featuredGroupIcon}>
                      <IconComponent size={18} />
                    </div>
                  </div>
                  <div className={styles.spotsLeftBadge}>
                    <Sparkles size={12} />
                    {group.spotsLeft} spots left
                  </div>
                </div>
                <div className={styles.featuredGroupInfo}>
                  <h4 className={styles.featuredGroupName}>{group.name}</h4>
                  <p className={styles.featuredGroupDestination}>
                    <MapPin size={14} />
                    {group.destination}
                  </p>
                  <div className={styles.featuredGroupMeta}>
                    <span>
                      <Calendar size={14} />
                      {group.startDate}
                    </span>
                    <span>
                      <Clock size={14} />
                      {group.duration}
                    </span>
                  </div>
                  <div className={styles.featuredGroupFooter}>
                    <div className={styles.memberAvatars}>
                      {group.memberAvatars.map((avatar, idx) => (
                        <img
                          key={idx}
                          src={avatar}
                          alt="Member"
                          className={styles.memberAvatar}
                          style={{ zIndex: 3 - idx }}
                        />
                      ))}
                      {group.members > 3 && (
                        <div className={styles.memberCount}>+{group.members - 3}</div>
                      )}
                    </div>
                    <button className="btn btn-primary btn-sm">
                      <UserPlus size={14} />
                      Join
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meet Active Travelers Section */}
      <div className={styles.section} style={{ marginTop: '1.5rem' }}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionIcon}>
              <Users size={20} />
            </div>
            <h3 className={styles.sectionTitle}>Meet Active Travelers</h3>
          </div>
          <div className={styles.scrollButtons}>
            <button
              className={`btn btn-icon btn-sm ${styles.scrollBtn}`}
              onClick={() => scrollTravelers('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className={`btn btn-icon btn-sm ${styles.scrollBtn}`}
              onClick={() => scrollTravelers('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className={styles.travelersScrollContainer} ref={travelersScrollRef}>
          {activeTravelers.map((traveler) => (
            <div key={traveler.id} className={styles.travelerCard}>
              <div className={styles.travelerAvatarWrapper}>
                <img
                  src={traveler.avatar}
                  alt={traveler.name}
                  className={styles.travelerAvatar}
                />
                {traveler.verified && (
                  <div className={styles.verifiedBadge}>
                    <Shield size={10} />
                  </div>
                )}
              </div>
              <div className={styles.travelerContentWrapper}>
                <h4 className={styles.travelerName}>{traveler.name}</h4>
                <p className={styles.travelerLocation}>
                  <MapPin size={12} />
                  {traveler.location}
                </p>
                <div className={styles.travelerInterests}>
                  {traveler.interests.slice(0, 2).map((interest, idx) => (
                    <span key={idx} className={styles.interestTag}>
                      {interest}
                    </span>
                  ))}
                </div>
                <p className={styles.travelerLookingFor}>{traveler.lookingFor}</p>
                <div className={styles.travelerStats}>
                  <span>{traveler.tripsCompleted} trips</span>
                </div>
              </div>
              <button className={`btn btn-outline-light btn-sm btn-block ${styles.connectBtn}`}>
                <UserPlus size={14} />
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Community Activity Section */}
      <div className={styles.section} style={{ marginTop: '1.5rem' }}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionIcon}>
              <Sparkles size={20} />
            </div>
            <h3 className={styles.sectionTitle}>Community Activity</h3>
          </div>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            Live
          </div>
        </div>
        <div className={`${styles.liveActivityFeed} ${isAnimating ? styles.animating : ''}`}>
          {getVisibleActivities().map((activity) => (
            <div
              key={`${activity.id}-${activity.displayIndex}`}
              className={styles.liveActivityItem}
            >
              <img
                src={activity.avatar}
                alt={activity.user}
                className={styles.liveActivityAvatar}
              />
              <div className={styles.liveActivityContent}>
                <p className={styles.liveActivityText}>
                  <strong>{activity.user}</strong> {activity.action}{' '}
                  {activity.target && <span className={styles.activityTarget}>{activity.target}</span>}
                </p>
                <span className={styles.liveActivityTime}>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
