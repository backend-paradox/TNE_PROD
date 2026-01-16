import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  MapPin,
  Plus,
  MessageCircle,
  UsersRound,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateTripModal, JoinTripModal } from '@/components/travellers/trips';
import { EmptyState } from '@/components/travellers/common';
import { useGroups } from '@/hooks/travellers';
import { groupsAPI } from '@/features/travellers/travellersAPI';
import { normalizeDestination } from '@/utils/travellers';
import styles from './GroupPlanningPage.module.css';

// Default image for groups without an image
const DEFAULT_GROUP_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop';

export function GroupPlanningPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code');
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isJoinTripOpen, setIsJoinTripOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const { groups, isLoading, error, fetchGroups, createGroup } = useGroups();

  // Fetch groups on mount and when filter changes
  useEffect(() => {
    fetchGroups('PLANNING');
  }, [fetchGroups]);

  useEffect(() => {
    if (codeParam) {
      setJoinCode(codeParam);
      setIsJoinTripOpen(true);
    }
  }, [codeParam]);

  const handleSelectGroup = (groupId: string) => {
    navigate(`/travellers/group/${groupId}`);
  };

  const handleCreateTrip = async (tripData: { name: string; destination?: string; description?: string; startDate?: string; endDate?: string; imageUrl?: string }) => {
    // Build group data, only including optional fields if they have values
    // Note: empty strings fail Joi validation, so we omit them
    const groupData: Record<string, unknown> = {
      name: tripData.name,
    };
    if (tripData.description) {
      groupData.description = tripData.description;
    }
    if (tripData.destination) {
      groupData.destination = tripData.destination;
    }
    if (tripData.startDate) {
      groupData.startDate = new Date(tripData.startDate);
    }
    if (tripData.endDate) {
      groupData.endDate = new Date(tripData.endDate);
    }
    if (tripData.imageUrl) {
      groupData.imageUrl = tripData.imageUrl;
    }

    const newGroup = await createGroup(groupData as Parameters<typeof createGroup>[0]);
    // Return the group so the modal can show success with the ID
    return newGroup;
  };

  const handleTripCreated = () => {
    // Close modal and refresh groups
    setIsCreateTripOpen(false);
    fetchGroups('PLANNING');
  };

  const handleJoinTrip = async (code: string) => {
    try {
      const result = await groupsAPI.joinGroup(code);
      setIsJoinTripOpen(false);
      setJoinCode('');
      // Refresh groups list
      fetchGroups('PLANNING');
      // Navigate to the joined group if we have the ID
      if (result?.groupId) {
        navigate(`/travellers/group/${result.groupId}`);
      }
    } catch (err) {
      console.error('Failed to join group:', err);
      throw err;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Helper to get member count from group data
  const getMemberCount = (group: typeof groups[0]): number => {
    return group._count?.members ?? group.memberCount ?? 0;
  };

  // Helper to get group status - use backend calculated status
  const getGroupStatus = (group: typeof groups[0]): 'active' | 'planning' | 'completed' => {
    if (group.calculatedStatus) {
      const statusMap: Record<string, 'active' | 'planning' | 'completed'> = {
        PLANNING: 'planning',
        ON_TOUR: 'active',
        COMPLETED: 'completed',
      };
      return statusMap[group.calculatedStatus] || 'planning';
    }
    // Fallback to client-side calculation for backwards compatibility
    if (!group.isActive) return 'completed';
    if (group.startDate && new Date(group.startDate) > new Date()) return 'planning';
    return 'active';
  };

  const renderGroupList = () => (
    <>
      <motion.div className={styles.header} variants={itemVariants}>
        <div>
          <h1 className={styles.title}>Group Planning</h1>
          <p className={styles.subtitle}>Collaborate, Vote & Chat Together</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" className={styles.joinGroupBtn} onClick={() => setIsJoinTripOpen(true)}>
            <Plus size={20} />
            Join Group
          </Button>
          <Button className={styles.createGroupBtn} onClick={() => setIsCreateTripOpen(true)}>
            <Plus size={20} />
            Create Group
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonCardImage} />
              <div className={styles.skeletonCardContent}>
                <div className={styles.skeletonCardTitle} />
                <div className={styles.skeletonCardMeta}>
                  <div className={styles.skeletonCardMetaItem} />
                  <div className={styles.skeletonCardMetaItem} />
                </div>
                <div className={styles.skeletonCardMembers}>
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className={styles.skeletonMemberAvatar} />
                  ))}
                </div>
                <div className={styles.skeletonCardFooter}>
                  <div className={styles.skeletonCardBtn} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <p>{error}</p>
          <Button onClick={() => fetchGroups('PLANNING')}>Try Again</Button>
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No trip groups yet"
          description="Create or join a trip to start planning with your travel companions. Collaborate on destinations, vote on activities, and chat together!"
          actionLabel="Create First Trip"
          onAction={() => setIsCreateTripOpen(true)}
          secondaryActionLabel="Join with Code"
          onSecondaryAction={() => setIsJoinTripOpen(true)}
        />
      ) : (
        <motion.div className={styles.groupsGrid} variants={containerVariants}>
          {groups.map((group) => {
            const status = getGroupStatus(group);
            const memberCount = getMemberCount(group);
            return (
              <motion.div
                key={group.id}
                className={styles.groupCard}
                variants={itemVariants}
                onClick={() => handleSelectGroup(group.id)}
              >
                <div className={styles.groupCardImage}>
                  <img src={group.imageUrl || DEFAULT_GROUP_IMAGE} alt={group.name} />
                  <div className={styles.groupCardOverlay} />
                </div>
                <div className={styles.groupCardContent}>
                  <div className={styles.groupCardHeader}>
                    <div>
                      <h3 className={styles.groupCardName}>{group.name}</h3>
                      <p className={styles.groupCardDestination}>
                        <MapPin size={14} />
                        {normalizeDestination(group.destination) || 'Destination TBD'}
                      </p>
                    </div>
                  </div>
                  <div className={styles.groupCardMeta}>
                    <div className={styles.groupCardMembers}>
                      <Users size={14} />
                      {memberCount} member{memberCount !== 1 ? 's' : ''}
                    </div>
                    <Badge
                      variant={status === 'active' ? 'default' : status === 'completed' ? 'outline' : 'secondary'}
                      className={
                        status === 'active' ? styles.activeBadge :
                        status === 'completed' ? styles.completedBadge :
                        styles.planningBadge
                      }
                    >
                      {status}
                    </Badge>
                  </div>
                  <div className={styles.groupCardFooter}>
                    <MessageCircle size={14} />
                    <span className={styles.lastMessage}>
                      {group.description || 'No description yet'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </>
  );

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {renderGroupList()}

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        onCreateTrip={handleCreateTrip}
        onTripCreated={handleTripCreated}
      />

      {/* Join Trip Modal */}
      <JoinTripModal
        isOpen={isJoinTripOpen}
        onClose={() => {
          setIsJoinTripOpen(false);
          setJoinCode('');
        }}
        onJoinTrip={handleJoinTrip}
        initialCode={joinCode}
      />
    </motion.div>
  );
}
