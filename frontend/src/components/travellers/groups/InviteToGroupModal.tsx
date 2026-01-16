import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Check, Loader2 } from 'lucide-react';
import { groupsAPI } from '@/features/travellers/travellersAPI';
import type { Group } from '@/types/travellers';
import { normalizeDestination } from '@/utils/travellers';
import styles from './InviteToGroupModal.module.css';

interface InviteToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

export function InviteToGroupModal({ isOpen, onClose, userId, userName }: InviteToGroupModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch user's groups when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGroups = await groupsAPI.getGroups();
      const groupList = Array.isArray(fetchedGroups)
        ? fetchedGroups
        : (fetchedGroups as { groups?: Group[] })?.groups || [];
      // Filter to only show PLANNING and ON_TOUR groups
      const activeGroups = groupList.filter(
        (g) => {
          const status = g.calculatedStatus || g.status;
          return status === 'PLANNING' || status === 'ON_TOUR' || !status;
        }
      );
      setGroups(activeGroups);
    } catch (err) {
      setError('Failed to load your groups');
      console.error('Failed to fetch groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroupId) {
      setError('Please select a group');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await groupsAPI.inviteMemberByUserId(selectedGroupId, userId, message || undefined);
      setSuccess(true);

      // Auto-close after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation');
      console.error('Failed to send invitation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedGroupId('');
    setMessage('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const getStatusClass = (status: string | undefined) => {
    if (!status) return styles.statusDefault;
    switch (status) {
      case 'PLANNING':
        return styles.statusPlanning;
      case 'ON_TOUR':
        return styles.statusOnTour;
      default:
        return styles.statusDefault;
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        {/* Modal */}
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>

          {/* Success State */}
          {success ? (
            <div className={styles.successContent}>
              <motion.div
                className={styles.successIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Check size={36} />
              </motion.div>
              <h3 className={styles.successTitle}>Invitation Sent!</h3>
              <p className={styles.successSubtitle}>
                {userName} has been invited to join your group.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.iconWrapper}>
                  <Users size={28} />
                </div>
                <h2 className={styles.title}>Invite to Group</h2>
                <p className={styles.subtitle}>
                  Invite {userName} to join your trip
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Error Message */}
                {error && (
                  <div className={styles.errorBox}>
                    <p className={styles.errorText}>{error}</p>
                  </div>
                )}

                {/* Group Selection */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Select Group</label>

                  {isLoading ? (
                    <div className={styles.loadingState}>
                      <Loader2 size={28} className={styles.spinner} />
                    </div>
                  ) : groups.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyText}>You don't have any active groups</p>
                    </div>
                  ) : (
                    <div className={styles.groupList}>
                      {groups.map((group) => {
                        const isSelected = selectedGroupId === group.id;
                        const status = group.calculatedStatus || group.status;
                        return (
                          <label
                            key={group.id}
                            className={`${styles.groupOption} ${isSelected ? styles.groupOptionSelected : ''}`}
                          >
                            <input
                              type="radio"
                              name="group"
                              value={group.id}
                              checked={isSelected}
                              onChange={(e) => setSelectedGroupId(e.target.value)}
                              className={styles.radioInput}
                            />
                            <div className={styles.groupInfo}>
                              <p className={styles.groupName}>{group.name}</p>
                              {normalizeDestination(group.destination) && (
                                <p className={styles.groupDestination}>
                                  {normalizeDestination(group.destination)}
                                </p>
                              )}
                            </div>
                            {status && (
                              <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
                                {status.replace('_', ' ')}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Optional Message */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Message (Optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message to your invitation..."
                    rows={3}
                    className={styles.textarea}
                  />
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={handleClose}
                    className={styles.cancelBtn}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting || isLoading || groups.length === 0 || !selectedGroupId}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className={styles.btnSpinner} />
                        Sending...
                      </>
                    ) : (
                      'Send Invitation'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
