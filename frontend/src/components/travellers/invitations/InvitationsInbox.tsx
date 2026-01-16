import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  MessageSquare,
  CheckCircle,
  X,
  Mail,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { invitationsAPI, type GroupInvitation } from '@/features/travellers/travellersAPI';
import { applyAvatarFallback, fallbackAvatarDataUrl, normalizeDestination } from '@/utils/travellers';
import { InvitationCardSkeleton } from './InvitationCardSkeleton';
import styles from './InvitationsInbox.module.css';

interface InvitationsInboxProps {
  className?: string;
}

export const InvitationsInbox: React.FC<InvitationsInboxProps> = ({ className }) => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('travellers:invitation-count', { detail: invitations.length })
    );
  }, [invitations.length]);

  const fetchInvitations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await invitationsAPI.getMyInvitations();
      setInvitations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch invitations');
      console.error('Error fetching invitations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (invitationId: string, groupName: string) => {
    setProcessingId(invitationId);
    try {
      const result = await invitationsAPI.acceptInvitation(invitationId);
      window.dispatchEvent(
        new CustomEvent('travellers:invitation-count', {
          detail: Math.max(0, invitations.length - 1),
        })
      );
      toast.success(`You've joined "${groupName}"! Redirecting...`);
      navigate(`/travellers/group/${result.groupId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
      console.error('Error accepting invitation:', err);
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId: string, groupName: string) => {
    setProcessingId(invitationId);
    try {
      await invitationsAPI.declineInvitation(invitationId);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      toast.success(`Invitation to "${groupName}" declined`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to decline invitation');
      console.error('Error declining invitation:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const formatExpiryDate = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `Expires in ${daysLeft} days`;
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h2>Pending Invitations</h2>
          </div>
        </div>
        <InvitationCardSkeleton count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.error}>
          <AlertCircle size={48} className={styles.errorIcon} />
          <p>{error}</p>
          <button onClick={fetchInvitations} className={styles.retryButton}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.empty}>
          <div className={styles.emptyIconWrapper}>
            <Mail size={48} />
          </div>
          <h3>No Pending Invitations</h3>
          <p>You don't have any group invitations at the moment. When someone invites you to join their trip, it will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>Pending Invitations</h2>
          <span className={styles.count}>{invitations.length}</span>
        </div>
      </div>

      <AnimatePresence>
        {invitations.map((invitation) => {
          const isExpiringSoon = new Date(invitation.expiresAt).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000;
          const isProcessing = processingId === invitation.id;
          const destination = normalizeDestination(invitation.group.destination);
          const dateRange = formatDateRange(invitation.group.startDate, invitation.group.endDate);

          return (
            <motion.div
              key={invitation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className={`${styles.invitationCard} ${isExpiringSoon ? styles.expiringSoon : ''}`}
            >
              {/* Group Image */}
              <div className={styles.groupImage}>
                {invitation.group.imageUrl ? (
                  <img src={invitation.group.imageUrl} alt={invitation.group.name} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <MapPin size={32} />
                  </div>
                )}
                {isExpiringSoon && (
                  <div className={styles.urgentBadge}>
                    <Clock size={12} />
                    Expiring Soon
                  </div>
                )}
              </div>

              <div className={styles.content}>
                {/* Group Info */}
                <div className={styles.groupInfo}>
                  <h3>{invitation.group.name}</h3>
                  {destination && (
                    <div className={styles.destination}>
                      <MapPin size={14} />
                      <span>{destination}</span>
                    </div>
                  )}
                  {invitation.group.description && (
                    <p className={styles.description}>{invitation.group.description}</p>
                  )}
                </div>

                {/* Metadata */}
                <div className={styles.metadata}>
                  {/* Inviter */}
                  {invitation.inviter && (
                    <div className={styles.inviterBadge}>
                      <img
                        src={invitation.inviter.profilePicUrl || fallbackAvatarDataUrl}
                        alt={invitation.inviter.name}
                        onError={applyAvatarFallback}
                      />
                      <span>Invited by <strong>{invitation.inviter.name}</strong></span>
                    </div>
                  )}

                  {/* Details Row */}
                  <div className={styles.detailsRow}>
                    {dateRange && (
                      <div className={styles.detailItem}>
                        <Calendar size={14} />
                        <span>{dateRange}</span>
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <Users size={14} />
                      <span>{invitation.group.memberCount} member{invitation.group.memberCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className={`${styles.detailItem} ${styles.expiryItem} ${isExpiringSoon ? styles.urgent : ''}`}>
                      <Clock size={14} />
                      <span>{formatExpiryDate(invitation.expiresAt)}</span>
                    </div>
                  </div>

                  {/* Personal Message */}
                  {invitation.message && (
                    <div className={styles.messageBox}>
                      <MessageSquare size={14} />
                      <p>"{invitation.message}"</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                  <button
                    onClick={() => handleAccept(invitation.id, invitation.group.name)}
                    disabled={isProcessing}
                    className={`${styles.acceptButton} ${isProcessing ? styles.processing : ''}`}
                  >
                    <CheckCircle size={16} />
                    {isProcessing ? 'Joining...' : 'Accept & Join'}
                  </button>
                  <button
                    onClick={() => handleDecline(invitation.id, invitation.group.name)}
                    disabled={isProcessing}
                    className={`${styles.declineButton} ${isProcessing ? styles.processing : ''}`}
                  >
                    <X size={16} />
                    Decline
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
