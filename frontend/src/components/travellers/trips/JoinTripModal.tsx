import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Users, MapPin, Calendar, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { groupsAPI } from '@/features/travellers/travellersAPI';
import { normalizeDestination } from '@/utils/travellers';
import styles from './JoinTripModal.module.css';

interface JoinTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinTrip?: (code: string) => Promise<void> | void;
  initialCode?: string;
}

interface GroupPreview {
  id: string;
  name: string;
  description?: string;
  destination?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  memberCount: number;
  spotsLeft: number;
  type: string;
}

export function JoinTripModal({ isOpen, onClose, onJoinTrip, initialCode }: JoinTripModalProps) {
  const [step, setStep] = useState<'input' | 'preview' | 'success' | 'error'>('input');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupPreview, setGroupPreview] = useState<GroupPreview | null>(null);

  useEffect(() => {
    if (isOpen && initialCode) {
      setCode(initialCode.trim().toUpperCase());
    }
  }, [initialCode, isOpen]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Fetch group preview from API
      const preview = await groupsAPI.previewGroupByCode(code.trim());
      setGroupPreview(preview);
      setStep('preview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid invite code. Please check and try again.');
      console.error('Preview group error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTrip = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onJoinTrip?.(code);
      setStep('success');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to join the trip. Please try again.');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('input');
    setCode('');
    setError('');
    setGroupPreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close Button */}
            <button className={styles.closeBtn} onClick={handleClose}>
              <X size={20} />
            </button>

            {step === 'input' && (
              <>
                {/* Header */}
                <div className={styles.header}>
                  <div className={styles.iconWrapper}>
                    <Link2 size={28} />
                  </div>
                  <h2 className={styles.title}>Join a Trip</h2>
                  <p className={styles.subtitle}>
                    Enter the invite code shared by your friend to join their trip
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleCodeSubmit} className={styles.form}>
                  <div className={styles.codeInputWrapper}>
                    <input
                      type="text"
                      placeholder="Enter invite code"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      className={`${styles.codeInput} ${error ? styles.inputError : ''}`}
                      maxLength={12}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className={styles.errorMessage}>
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Checking...' : 'Continue'}
                    {!isLoading && <ArrowRight size={18} />}
                  </Button>
                </form>

                <p className={styles.helpText}>
                  Don't have a code? Ask the trip organizer to share one with you.
                </p>
              </>
            )}

            {step === 'preview' && groupPreview && (
              <>
                {/* Trip Preview */}
                <div className={styles.previewHeader}>
                  <h2 className={styles.title}>Trip Found!</h2>
                  <p className={styles.subtitle}>
                    You're about to join this trip
                  </p>
                </div>

                <div className={styles.tripPreview}>
                  <div className={styles.tripImage}>
                    <img
                      src={groupPreview.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&auto=format&fit=crop'}
                      alt={groupPreview.name}
                    />
                  </div>
                  <div className={styles.tripDetails}>
                    <h3 className={styles.tripName}>{groupPreview.name}</h3>
                    <div className={styles.tripMeta}>
                      {normalizeDestination(groupPreview.destination) && (
                        <span>
                          <MapPin size={14} />
                          {normalizeDestination(groupPreview.destination)}
                        </span>
                      )}
                      {groupPreview.startDate && groupPreview.endDate && (
                        <span>
                          <Calendar size={14} />
                          {groupPreview.startDate} - {groupPreview.endDate}
                        </span>
                      )}
                    </div>
                    <div className={styles.tripMembers}>
                      <span className={styles.memberCount}>
                        <Users size={14} />
                        {groupPreview.memberCount} {groupPreview.memberCount === 1 ? 'member' : 'members'}
                        {groupPreview.spotsLeft > 0 && ` | ${groupPreview.spotsLeft} spots left`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.previewActions}>
                  <Button
                    className={styles.joinBtn}
                    onClick={handleJoinTrip}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Joining...' : 'Join Trip'}
                  </Button>
                  <Button
                    variant="outline"
                    className={styles.backBtn}
                    onClick={() => {
                      setError('');
                      setStep('input');
                    }}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                </div>
                {error && (
                  <div className={styles.errorMessage}>
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
              </>
            )}

            {step === 'success' && (
              <>
                {/* Success State */}
                <div className={styles.successHeader}>
                  <div className={styles.successIcon}>
                    <Check size={32} />
                  </div>
                  <h2 className={styles.title}>You're In!</h2>
                  <p className={styles.subtitle}>
                    You've successfully joined "{groupPreview?.name || 'the trip'}"
                  </p>
                </div>

                <div className={styles.successInfo}>
                  <p>You can now:</p>
                  <ul className={styles.successList}>
                    <li>View and edit the trip itinerary</li>
                    <li>Chat with other group members</li>
                    <li>Vote on trip proposals</li>
                    <li>Track and split expenses</li>
                  </ul>
                </div>

                <Button className={styles.viewTripBtn} onClick={handleClose}>
                  Go to Trip
                  <ArrowRight size={18} />
                </Button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
