import React from 'react';
import { Edit3, MapPin, Plane, Star, CheckCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './ProfileHeader.module.css';

interface ProfileHeaderProps {
  userName: string;
  userEmail: string;
  profilePicUrl?: string;
  memberSince?: string;
  tripsCount?: number;
  countriesCount?: number;
  reviewsCount?: number;
  profileCompletion?: number;
  isEditing?: boolean;
  onEditClick?: () => void;
}

export function ProfileHeader({
  userName,
  userEmail,
  profilePicUrl,
  memberSince,
  tripsCount = 0,
  countriesCount = 0,
  reviewsCount,
  profileCompletion = 0,
  isEditing = false,
  onEditClick,
}: ProfileHeaderProps) {
  const stats = [
    { value: tripsCount, label: 'Trips', icon: Plane, color: '#ff6b6b' },
    { value: countriesCount, label: 'Countries', icon: MapPin, color: '#4ecdc4' },
    ...(Number.isFinite(reviewsCount)
      ? [{ value: reviewsCount, label: 'Reviews', icon: Star, color: '#f59e0b' }]
      : []),
    { value: `${profileCompletion}%`, label: 'Complete', icon: CheckCircle, color: '#10b981' },
  ];

  const formatMemberSince = (dateStr?: string) => {
    if (!dateStr) return 'Member';
    const date = new Date(dateStr);
    return `Member since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  return (
    <motion.div
      className={styles.header}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.headerContent}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {profilePicUrl ? (
              <img src={profilePicUrl} alt={userName} />
            ) : (
              <span>{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className={styles.userDetails}>
            <h1 className={styles.userName}>{userName || 'User'}</h1>
            <p className={styles.userEmail}>{userEmail || 'email@example.com'}</p>
            <div className={styles.memberBadge}>
              <Calendar size={14} />
              <span>{formatMemberSince(memberSince)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onEditClick}
          className={`${styles.editBtn} ${isEditing ? styles.editBtnActive : ''}`}
        >
          <Edit3 size={18} />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className={styles.statsRow}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}15` }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default ProfileHeader;
