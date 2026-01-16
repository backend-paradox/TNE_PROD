import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Calendar, Copy, Mail, MessageCircle, Loader2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { invitationsAPI } from '@/features/travellers/travellersAPI';
import styles from './InviteModal.module.css';

export interface InviteMember {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  tripName: string;
  memberCount: number;
  duration: string;
  inviteLink: string;
  inviteCode?: string;
  members?: InviteMember[];
}

export function InviteModal({
  isOpen,
  onClose,
  groupId,
  tripName,
  memberCount,
  duration,
  inviteLink,
  inviteCode = '',
  members = [],
}: InviteModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode || '');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Join my trip "${tripName}"! Click here: ${inviteLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareSMS = () => {
    const message = `Join my trip "${tripName}"! Click here: ${inviteLink}`;
    const url = `sms:?body=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  const handleShareEmail = () => {
    const subject = `Invitation to join ${tripName}`;
    const body = `Hi!\n\nI'd like to invite you to join our trip "${tripName}".\n\nTrip Details:\n- Duration: ${duration}\n- Members: ${memberCount}\n\nClick here to join: ${inviteLink}\n\nOr use invite code: ${inviteCode}\n\nSee you there!`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleSendInvite = async () => {
    const trimmedEmail = email.trim();
    setSendError('');
    setSendSuccess('');

    if (!groupId) {
      setSendError('Group is not ready yet.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setSendError('Enter a valid email address.');
      return;
    }

    setIsSending(true);
    try {
      await invitationsAPI.inviteByEmail(groupId, trimmedEmail, message.trim() || undefined);
      setSendSuccess('Invitation sent.');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setSendError(err?.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>Invite to {tripName}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            Share your group with friends via WhatsApp, SMS, Email, or copy the code/link
          </p>

          {/* Trip Info Card */}
          <div className={styles.tripCard}>
            <div className={styles.tripIcon}>
              <Users size={28} />
            </div>
            <div className={styles.tripInfo}>
              <h3 className={styles.tripName}>{tripName}</h3>
              <div className={styles.tripMeta}>
                <span className={styles.metaItem}>
                  <Users size={14} />
                  {memberCount} members
                </span>
                <span className={styles.metaDivider}>|</span>
                <span className={styles.metaItem}>
                  <Calendar size={14} />
                  {duration}
                </span>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className={styles.shareSection}>
            <h3 className={styles.sectionTitle}>Share via</h3>
            <div className={styles.shareButtons}>
              <button className={`${styles.shareButton} ${styles.whatsapp}`} onClick={handleShareWhatsApp}>
                <FaWhatsapp size={24} />
                <div className={styles.shareButtonText}>
                  <span className={styles.shareButtonTitle}>WhatsApp</span>
                  <span className={styles.shareButtonSubtitle}>Share via WhatsApp messenger</span>
                </div>
              </button>

              <button className={`${styles.shareButton} ${styles.sms}`} onClick={handleShareSMS}>
                <MessageCircle size={24} />
                <div className={styles.shareButtonText}>
                  <span className={styles.shareButtonTitle}>Text Message (SMS)</span>
                  <span className={styles.shareButtonSubtitle}>Send invitation via SMS</span>
                </div>
              </button>

              <button className={`${styles.shareButton} ${styles.email}`} onClick={handleShareEmail}>
                <Mail size={24} />
                <div className={styles.shareButtonText}>
                  <span className={styles.shareButtonTitle}>Email</span>
                  <span className={styles.shareButtonSubtitle}>Send invitation via email</span>
                </div>
              </button>
            </div>
          </div>

          {/* Invite by Email */}
          <div className={styles.emailSection}>
            <h3 className={styles.sectionTitle}>Invite by email</h3>
            <div className={styles.emailForm}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSendError('');
                  setSendSuccess('');
                }}
                placeholder="name@example.com"
                className={styles.emailInput}
                disabled={isSending}
              />
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setSendError('');
                  setSendSuccess('');
                }}
                placeholder="Add a message (optional)"
                className={styles.emailMessage}
                rows={2}
                disabled={isSending}
              />
              <div className={styles.emailActions}>
                <Button
                  className={styles.emailButton}
                  onClick={handleSendInvite}
                  disabled={isSending || !email.trim()}
                >
                  {isSending ? (
                    <>
                      <Loader2 size={16} className={styles.spinner} />
                      Sending...
                    </>
                  ) : (
                    'Send Invite'
                  )}
                </Button>
              </div>
              {sendError && <p className={styles.emailError}>{sendError}</p>}
              {sendSuccess && <p className={styles.emailSuccess}>{sendSuccess}</p>}
            </div>
          </div>

          {/* Copy Code Section */}
          <div className={styles.linkSection}>
            <h3 className={styles.sectionTitle}>Or copy code</h3>
            <div className={styles.linkContainer}>
              <div className={styles.linkBox}>
                <Copy size={18} className={styles.linkIcon} />
                <span className={styles.linkText}>{inviteCode}</span>
              </div>
              <Button
                className={copiedCode ? styles.copiedButton : styles.copyButton}
                onClick={handleCopyCode}
              >
                {copiedCode ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Copy Link Section */}
          <div className={styles.linkSection}>
            <h3 className={styles.sectionTitle}>Or copy link</h3>
            <div className={styles.linkContainer}>
              <div className={styles.linkBox}>
                <Copy size={18} className={styles.linkIcon} />
                <span className={styles.linkText}>{inviteLink}</span>
              </div>
              <Button
                className={copiedLink ? styles.copiedButton : styles.copyButton}
                onClick={handleCopyLink}
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Current Members */}
          {members.length > 0 && (
            <div className={styles.membersSection}>
              <h3 className={styles.sectionTitle}>Current Members ({members.length})</h3>
              <div className={styles.membersList}>
                {members.map((member) => (
                  <div key={member.id} className={styles.memberAvatar}>
                    <img src={member.avatar} alt={member.name} />
                    {member.online && <div className={styles.onlineIndicator} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
