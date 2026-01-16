import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Plane, Copy, Check, Users, Vote, Loader2, Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InviteModal } from '@/components/travellers/groups';
import styles from './CreateTripModal.module.css';

const COVER_IMAGE_OPTIONS = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519817650390-64a93db511aa?w=800&auto=format&fit=crop',
];

const MAX_COVER_BYTES = 2 * 1024 * 1024;

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip?: (tripData: TripFormData) => Promise<{ id: string; inviteCode?: string } | undefined>;
}

export interface TripFormData {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  decideLocationLater: boolean;
  imageUrl?: string;
}

export function CreateTripModal({ isOpen, onClose, onCreateTrip }: CreateTripModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [copied, setCopied] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [decideLocationLater, setDecideLocationLater] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
  });

  const inviteCode = createdInviteCode || '';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = inviteCode ? `${baseUrl}/travellers/group-planning?code=${inviteCode}` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = formData.name && formData.startDate && formData.endDate &&
                    (decideLocationLater || formData.destination);

    if (isValid && onCreateTrip) {
      setIsLoading(true);
      setError(null);
      try {
        const result = await onCreateTrip({
          ...formData,
          decideLocationLater,
          destination: decideLocationLater ? '' : formData.destination,
          imageUrl: coverImageUrl || undefined,
        });
        if (result?.id) {
          setCreatedGroupId(result.id);
          setCreatedInviteCode(result.inviteCode || null);
          setStep('success');
        }
      } catch (err) {
        setError('Failed to create group. Please try again.');
        console.error('Create trip error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCoverError(null);
    if (!file.type.startsWith('image/')) {
      setCoverError('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_COVER_BYTES) {
      setCoverError('Image must be 2MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setCoverImageUrl(result);
        setShowCoverPicker(false);
      } else {
        setCoverError('Failed to read image file.');
      }
    };
    reader.onerror = () => {
      setCoverError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCoverSelect = (url: string) => {
    setCoverImageUrl(url);
    setShowCoverPicker(false);
    setCoverError(null);
  };

  const handleCoverRemove = () => {
    setCoverImageUrl('');
    setCoverError(null);
  };

  const handleClose = () => {
    setStep('form');
    setFormData({ name: '', destination: '', startDate: '', endDate: '' });
    setDecideLocationLater(false);
    setCoverImageUrl('');
    setShowCoverPicker(false);
    setCoverError(null);
    setIsInviteModalOpen(false);
    setError(null);
    setCreatedGroupId(null);
    setCreatedInviteCode(null);
    onClose();
  };

  const getDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return `${days} Day${days > 1 ? 's' : ''}`;
    }
    return '5 Days';
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

            {step === 'form' ? (
              <>
                {/* Header */}
                <div className={styles.header}>
                  <div className={styles.iconWrapper}>
                    <Plane size={28} />
                  </div>
                  <h2 className={styles.title}>Create New Trip</h2>
                  <p className={styles.subtitle}>
                    Plan your next adventure and invite friends to join
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                  {error && (
                    <div className={styles.errorMessage}>
                      {error}
                    </div>
                  )}

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Trip Name</label>
                    <div className={styles.inputWrapper}>
                      <Plane size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        placeholder="e.g., Dubai Adventure 2024"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={styles.input}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Destination</label>

                    {/* Toggle for decide later */}
                    <button
                      type="button"
                      className={`${styles.voteToggle} ${decideLocationLater ? styles.active : ''}`}
                      onClick={() => {
                        setDecideLocationLater(!decideLocationLater);
                        if (!decideLocationLater) {
                          setFormData({ ...formData, destination: '' });
                        }
                      }}
                      disabled={isLoading}
                    >
                      <Vote size={16} />
                      <span>Decide later via group vote</span>
                      <div className={styles.toggleSwitch}>
                        <div className={styles.toggleKnob} />
                      </div>
                    </button>

                    {/* Destination input - shown only when not deciding later */}
                    {!decideLocationLater ? (
                      <div className={styles.inputWrapper}>
                        <MapPin size={18} className={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder="e.g., Dubai, UAE"
                          value={formData.destination}
                          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                          className={styles.input}
                          required={!decideLocationLater}
                          disabled={isLoading}
                        />
                      </div>
                    ) : (
                      <div className={styles.voteInfoBox}>
                        <Vote size={20} />
                        <div>
                          <p className={styles.voteInfoTitle}>Location will be decided by voting</p>
                          <p className={styles.voteInfoText}>
                            Members can propose destinations and vote in Group Planning
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Cover Image (Optional)</label>
                    <div className={styles.coverSection}>
                      {coverError && <p className={styles.coverError}>{coverError}</p>}
                      {coverImageUrl ? (
                        <div className={styles.coverPreview}>
                          <img src={coverImageUrl} alt="Cover preview" />
                          <button
                            type="button"
                            className={styles.coverRemove}
                            onClick={handleCoverRemove}
                            disabled={isLoading}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className={styles.coverActions}>
                          <label className={styles.coverUpload}>
                            <Upload size={16} />
                            Upload image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              disabled={isLoading}
                              className={styles.coverInput}
                            />
                          </label>
                          <button
                            type="button"
                            className={styles.coverChoose}
                            onClick={() => setShowCoverPicker(!showCoverPicker)}
                            disabled={isLoading}
                          >
                            <Image size={16} />
                            Choose cover
                          </button>
                        </div>
                      )}
                      <p className={styles.coverNote}>PNG or JPG up to 2MB.</p>
                      {showCoverPicker && !coverImageUrl && (
                        <div className={styles.coverGrid}>
                          {COVER_IMAGE_OPTIONS.map((url) => (
                            <button
                              key={url}
                              type="button"
                              className={styles.coverOption}
                              onClick={() => handleCoverSelect(url)}
                              disabled={isLoading}
                            >
                              <img src={url} alt="Cover option" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.dateRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Start Date</label>
                      <div className={styles.inputWrapper}>
                        <Calendar size={18} className={styles.inputIcon} />
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className={styles.input}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>End Date</label>
                      <div className={styles.inputWrapper}>
                        <Calendar size={18} className={styles.inputIcon} />
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className={styles.input}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className={styles.submitBtn} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className={styles.spinner} />
                        Creating...
                      </>
                    ) : (
                      'Create Trip'
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className={styles.successHeader}>
                  <div className={styles.successIcon}>
                    <Check size={32} />
                  </div>
                  <h2 className={styles.title}>Trip Created!</h2>
                  <p className={styles.subtitle}>
                    Your trip "{formData.name}" has been created.
                    {decideLocationLater && ' Members can now vote on the destination in Group Planning.'}
                    {' '}Share the invite code with your friends!
                  </p>
                </div>

                <div className={styles.inviteSection}>
                  {/* Invite Code */}
                  <div className={styles.codeBox}>
                    <span className={styles.codeLabel}>Invite Code</span>
                    <div className={styles.codeValue}>
                      <span>{inviteCode || 'Unavailable'}</span>
                      <button
                        className={styles.copyBtn}
                        onClick={handleCopyCode}
                        title="Copy code"
                        disabled={!inviteCode}
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Invite Link */}
                  <div className={styles.linkBox}>
                    <span className={styles.linkLabel}>Or share this link</span>
                    <div className={styles.linkValue}>
                      <span className={styles.linkText}>{inviteLink || 'Unavailable'}</span>
                      <button
                        className={styles.copyBtn}
                        onClick={handleCopyLink}
                        title="Copy link"
                        disabled={!inviteLink}
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Invite Friends Button */}
                  <Button className={styles.inviteBtn} onClick={() => setIsInviteModalOpen(true)}>
                    <Users size={18} />
                    Invite Friends
                  </Button>

                  <Button variant="outline" className={styles.doneBtn} onClick={handleClose}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </motion.div>

          {/* Invite Modal */}
          <InviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            groupId={createdGroupId || ''}
            tripName={formData.name}
            memberCount={1}
            duration={getDuration()}
            inviteLink={inviteLink}
            inviteCode={inviteCode}
          />
        </>
      )}
    </AnimatePresence>
  );
}
