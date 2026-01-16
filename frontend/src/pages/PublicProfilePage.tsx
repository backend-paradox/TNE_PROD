import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, CheckCircle, Compass, Globe, Heart, Languages, MapPin, MessageCircle, Sparkles, UserCheck, UserPlus, UserX, Users } from 'lucide-react';
import axiosInstance from '@/app/axios';
import { connectionsAPI } from '@/features/travellers/travellersAPI';
import { useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';
import styles from './PublicProfilePage.module.css';

interface PublicProfileData {
  id: number;
  authId?: number;
  name?: string;
  profilePicUrl?: string | null;
  bio?: string | null;
  nationality?: string | null;
  travelStyle?: string | null;
  interests?: string[] | null;
  visitedCities?: string[] | null;
  isVerified?: boolean;
  rating?: number | null;
  totalTrips?: number | null;
  totalReviews?: number | null;
  socialVibeScore?: number | null;
  currentLocationName?: string | null;
  languages?: string[] | null;
  occupation?: string | null;
  socialLinks?: Record<string, string> | null;
  createdAt?: string;
  connectionStatus?: string | null;
  connectionId?: number | null;
  mutualConnectionsCount?: number | null;
  mutualConnectionsPreview?: Array<{
    id: number;
    name?: string | null;
    profilePicUrl?: string | null;
  }> | null;
}

const formatJoinedDate = (value?: string) => {
  if (!value) return 'Member';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Member';
  return `Member since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
};

const getConnectionLabel = (status?: string | null) => {
  switch (status) {
    case 'CONNECTED':
      return 'Connected';
    case 'PENDING_SENT':
      return 'Request Sent';
    case 'PENDING_RECEIVED':
      return 'Request Received';
    case 'BLOCKED':
      return 'Blocked';
    case 'REJECTED':
      return 'Declined';
    case 'NONE':
    default:
      return 'Not Connected';
  }
};

const formatEnumLabel = (value?: string | null) => {
  if (!value) return '';
  const normalized = value.replace(/_/g, ' ').toLowerCase();
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

export function PublicProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setError('Invalid user');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/users/${userId}/public-profile`);
      const data = response.data.data || response.data;
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const displayName = profile?.name || 'Traveller';
  const avatar =
    profile?.profilePicUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || displayName}`;
  const connectionStatus = profile?.connectionStatus || 'NONE';
  const connectionLabel = getConnectionLabel(connectionStatus);
  const joinedLabel = formatJoinedDate(profile?.createdAt);
  const travelStyleLabel = formatEnumLabel(profile?.travelStyle) || 'Not shared yet';
  const interests = profile?.interests || [];
  const languages = profile?.languages || [];
  const visitedCities = profile?.visitedCities || [];
  const socialLinks = profile?.socialLinks || {};
  const mutualConnectionsCount = profile?.mutualConnectionsCount || 0;
  const mutualConnectionsPreview = profile?.mutualConnectionsPreview || [];
  const currentAuthId = currentUser?.id ? Number(currentUser.id) : null;
  const isOwnProfile = Number.isFinite(currentAuthId) && profile?.authId
    ? Number(profile.authId) === currentAuthId
    : false;
  const targetUserId = profile?.authId ?? (userId && Number.isFinite(Number(userId)) ? Number(userId) : null);
  const hasBio = Boolean(profile?.bio && profile.bio.trim());

  const stats = useMemo(
    () => [
      {
        label: 'Trips',
        value: profile?.totalTrips ?? 0,
        icon: MapPin,
      },
      {
        label: 'Connections',
        value: mutualConnectionsCount,
        icon: Users,
      },
      {
        label: 'Vibe Score',
        value: profile?.socialVibeScore ?? 0,
        icon: Sparkles,
      },
    ],
    [profile, mutualConnectionsCount]
  );

  const getConnectionBadgeClass = () => {
    if (connectionStatus === 'CONNECTED') return styles.badgeConnected;
    if (connectionStatus === 'PENDING_SENT' || connectionStatus === 'PENDING_RECEIVED') return styles.badgePending;
    if (connectionStatus === 'BLOCKED') return styles.badgeBlocked;
    return styles.badgeDefault;
  };

  const handleMessage = () => {
    if (!targetUserId) return;
    navigate(`/travellers/messages/${targetUserId}`, {
      state: { name: displayName, avatar },
    });
  };

  const handleConnect = async () => {
    if (!targetUserId) return;
    setIsActionLoading(true);
    try {
      await connectionsAPI.sendConnectionRequest(targetUserId);
      toast.success('Connection request sent');
      await fetchProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!profile?.connectionId) return;
    setIsActionLoading(true);
    try {
      await connectionsAPI.cancelConnectionRequest(String(profile.connectionId));
      toast.success('Request cancelled');
      await fetchProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to cancel request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!profile?.connectionId) return;
    setIsActionLoading(true);
    try {
      await connectionsAPI.acceptConnection(String(profile.connectionId));
      toast.success('Connection accepted');
      await fetchProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to accept request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!profile?.connectionId) return;
    setIsActionLoading(true);
    try {
      await connectionsAPI.rejectConnection(String(profile.connectionId));
      toast.success('Request declined');
      await fetchProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to decline request');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        {/* Skeleton Back Button */}
        <div className={`${styles.skeleton} ${styles.skeletonBackButton}`} />

        {/* Skeleton Card */}
        <div className={styles.skeletonCard}>
          {/* Skeleton Cover */}
          <div className={styles.skeletonCover} />

          {/* Skeleton Avatar Section */}
          <div className={styles.skeletonAvatarSection}>
            <div className={`${styles.skeleton} ${styles.skeletonAvatar}`} />
          </div>

          {/* Skeleton Card Content */}
          <div className={styles.skeletonCardContent}>
            {/* Skeleton Header */}
            <div className={styles.skeletonHeader}>
              <div className={styles.skeletonNameRow}>
                <div className={`${styles.skeleton} ${styles.skeletonName}`} />
                <div className={`${styles.skeleton} ${styles.skeletonBadge}`} />
              </div>
              <div className={`${styles.skeleton} ${styles.skeletonJoined}`} />
              <div className={styles.skeletonMetaRow}>
                <div className={`${styles.skeleton} ${styles.skeletonMeta}`} />
                <div className={`${styles.skeleton} ${styles.skeletonMeta}`} />
              </div>
            </div>

            {/* Skeleton Bio */}
            <div className={`${styles.skeleton} ${styles.skeletonBio}`} />

            {/* Skeleton Stats Grid */}
            <div className={styles.skeletonStatsGrid}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonStatCard} />
              ))}
            </div>

            {/* Skeleton Sections */}
            <div className={styles.skeletonSectionGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`${styles.skeleton} ${styles.skeletonSection}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error || 'Profile not available'}</p>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.button
        className={styles.backButton}
        onClick={() => navigate(-1)}
        variants={itemVariants}
      >
        <ArrowLeft size={18} />
        Back
      </motion.button>

      <motion.div className={styles.card} variants={itemVariants}>
        {/* Cover Section */}
        <div className={styles.coverSection}>
          <div className={styles.coverPattern} />
        </div>

        {/* Avatar Section with overlap */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <img src={avatar} alt={displayName} className={styles.avatar} />
            {profile.isVerified && (
              <div className={styles.verifiedOverlay}>
                <CheckCircle size={16} />
              </div>
            )}
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{displayName}</h1>
              <span className={`${styles.connectionBadge} ${getConnectionBadgeClass()}`}>
                {connectionLabel}
              </span>
            </div>
            <p className={styles.joined}>{joinedLabel}</p>
          </div>
          {!isOwnProfile && (
            <div className={styles.headerActions}>
              {connectionStatus === 'CONNECTED' && (
                <button
                  className={`${styles.actionButton} ${styles.actionSecondary}`}
                  onClick={handleMessage}
                  disabled={isActionLoading}
                >
                  <MessageCircle size={16} />
                  Message
                </button>
              )}
              {connectionStatus === 'NONE' && (
                <button
                  className={`${styles.actionButton} ${styles.actionPrimary}`}
                  onClick={handleConnect}
                  disabled={isActionLoading}
                >
                  <UserPlus size={16} />
                  Connect
                </button>
              )}
              {connectionStatus === 'PENDING_SENT' && (
                <button
                  className={`${styles.actionButton} ${styles.actionSecondary}`}
                  onClick={handleCancelRequest}
                  disabled={isActionLoading}
                >
                  <UserX size={16} />
                  Cancel Request
                </button>
              )}
              {connectionStatus === 'PENDING_RECEIVED' && (
                <>
                  <button
                    className={`${styles.actionButton} ${styles.actionPrimary}`}
                    onClick={handleAcceptRequest}
                    disabled={isActionLoading}
                  >
                    <UserCheck size={16} />
                    Accept
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.actionSecondary}`}
                    onClick={handleDeclineRequest}
                    disabled={isActionLoading}
                  >
                    <UserX size={16} />
                    Decline
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className={styles.cardContent}>
        <div className={styles.header}>
            <div className={styles.metaRow}>
              {profile.currentLocationName && (
                <span className={styles.metaItem}>
                  <MapPin size={14} />
                  {profile.currentLocationName}
                </span>
              )}
              {profile.nationality && (
                <span className={styles.metaItem}>
                  <Globe size={14} />
                  {profile.nationality}
                </span>
              )}
              {profile.occupation && (
                <span className={styles.metaItem}>
                  <Briefcase size={14} />
                  {profile.occupation}
                </span>
              )}
            </div>
            {mutualConnectionsCount > 0 && (
              <div className={styles.mutualRow}>
                <div className={styles.mutualAvatars}>
                  {mutualConnectionsPreview.slice(0, 3).map((mutual) => (
                    <img
                      key={mutual.id}
                      src={mutual.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mutual.id}`}
                      alt={mutual.name || 'Mutual connection'}
                      className={styles.mutualAvatar}
                    />
                  ))}
                </div>
                <span className={styles.mutualText}>
                  {mutualConnectionsCount} mutual connection{mutualConnectionsCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
        </div>

        <p className={`${styles.bio} ${!hasBio ? styles.bioMuted : ''}`}>
          {hasBio ? profile?.bio : 'No bio shared yet.'}
        </p>

        <motion.div className={styles.statsGrid} variants={containerVariants}>
          {stats.map((stat) => (
            <motion.div key={stat.label} className={styles.statCard} variants={itemVariants}>
              <div className={styles.statIcon}>
                <stat.icon size={20} />
              </div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className={styles.sectionGrid} variants={containerVariants}>
          <motion.div className={styles.section} variants={itemVariants}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Compass size={16} />
              </div>
              <h3>Travel Style</h3>
            </div>
            <p>{travelStyleLabel}</p>
          </motion.div>
          <motion.div className={styles.section} variants={itemVariants}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Languages size={16} />
              </div>
              <h3>Languages</h3>
            </div>
            {languages.length > 0 ? (
              <div className={styles.tagRow}>
                {languages.map((lang) => (
                  <span key={lang} className={styles.tag}>
                    {lang}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.sectionEmpty}>Not shared yet.</p>
            )}
          </motion.div>
          <motion.div className={styles.section} variants={itemVariants}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Heart size={16} />
              </div>
              <h3>Interests</h3>
            </div>
            {interests.length > 0 ? (
              <div className={styles.tagRow}>
                {interests.map((interest) => (
                  <span key={interest} className={styles.tag}>
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.sectionEmpty}>No interests added.</p>
            )}
          </motion.div>
          <motion.div className={styles.section} variants={itemVariants}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <MapPin size={16} />
              </div>
              <h3>Visited Cities</h3>
            </div>
            {visitedCities.length > 0 ? (
              <div className={styles.tagRow}>
                {visitedCities.map((city) => (
                  <span key={city} className={styles.tag}>
                    {city}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.sectionEmpty}>No cities listed yet.</p>
            )}
          </motion.div>
        </motion.div>

        {Object.keys(socialLinks).length > 0 && (
          <motion.div className={styles.section} variants={itemVariants}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Globe size={16} />
              </div>
              <h3>Social Links</h3>
            </div>
            <div className={styles.links}>
              {Object.entries(socialLinks).map(([label, url]) => (
                <a key={label} href={url} target="_blank" rel="noreferrer" className={styles.link}>
                  {label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
        </div>
      </motion.div>
    </motion.div>
  );
}
