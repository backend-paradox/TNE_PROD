import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, MoreHorizontal, Smile, Check, CheckCheck, MapPin, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './MessageBubble.module.css';
import { applyAvatarFallback, fallbackAvatarDataUrl } from '@/utils/travellers';

export interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface ChatMessage {
  id: string;
  senderId?: string | number;
  sender: string;
  senderAvatar: string;
  content?: string;
  type: 'text' | 'image' | 'voice' | 'location' | 'poll';
  timestamp: string;
  createdAt?: string;
  isOwn?: boolean;
  reactions?: MessageReaction[];
  replyTo?: {
    sender: string;
    content: string;
  };
  status?: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  audioUrl?: string;
  voiceDuration?: number;
  voiceData?: {
    duration: string;
    waveform: number[];
  };
  locationData?: {
    name: string;
    address: string;
    mapPreview?: string;
  };
}

interface MessageBubbleProps {
  message: ChatMessage;
  onReply?: (message: ChatMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  showAvatar?: boolean;
  isGrouped?: boolean;
}

const quickReactions = [
  '\uD83D\uDC4D',
  '\u2764\uFE0F',
  '\uD83D\uDE02',
  '\uD83D\uDE2E',
  '\uD83D\uDE22',
  '\uD83C\uDF89',
];

export function MessageBubble({
  message,
  onReply,
  onReact,
  showAvatar = true,
  isGrouped = false,
}: MessageBubbleProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!showActions && !showMenu && !showReactionPicker) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (messageRef.current && !messageRef.current.contains(target)) {
        setShowActions(false);
        setShowMenu(false);
        setShowReactionPicker(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showActions, showMenu, showReactionPicker]);

  // Parse location data from message content if it's a location type
  const locationData = useMemo(() => {
    if (message.type !== 'location' || !message.content) return null;
    try {
      const parsed = JSON.parse(message.content);
      if (parsed.latitude && parsed.longitude) {
        return {
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          mapUrl: parsed.mapUrl || `https://www.openstreetmap.org/?mlat=${parsed.latitude}&mlon=${parsed.longitude}&zoom=15`,
          staticMapUrl: `https://staticmap.openstreetmap.de/staticmap.php?center=${parsed.latitude},${parsed.longitude}&zoom=15&size=300x200&markers=${parsed.latitude},${parsed.longitude},red`,
        };
      }
    } catch {
      // Not valid JSON, might be old format or invalid
    }
    return null;
  }, [message.type, message.content]);

  const handleReact = (emoji: string) => {
    onReact?.(message.id, emoji);
    setShowReactionPicker(false);
    setShowMenu(false);
    setShowActions(false);
  };

  const handleCopy = async () => {
    const copyValue =
      message.type === 'location'
        ? locationData?.mapUrl || ''
        : message.type === 'image'
        ? message.imageUrl || message.content || ''
        : message.content || '';
    if (!copyValue) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      toast.success('Message copied');
      setShowMenu(false);
      setShowActions(false);
    } catch (err) {
      toast.error('Failed to copy message');
    }
  };

  const handleDelete = () => {
    onDelete?.(message.id);
    setShowMenu(false);
    setShowActions(false);
  };

  const renderMessageStatus = () => {
    if (!message.isOwn) return null;

    switch (message.status) {
      case 'sent':
        return <Check size={14} className={styles.statusIcon} />;
      case 'delivered':
        return <CheckCheck size={14} className={styles.statusIcon} />;
      case 'read':
        return <CheckCheck size={14} className={`${styles.statusIcon} ${styles.read}`} />;
      default:
        return null;
    }
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    return (
      <div className={styles.reactionsContainer}>
        {message.reactions.map((reaction, index) => (
          <button
            key={index}
            className={`${styles.reactionBadge} ${reaction.reacted ? styles.reacted : ''}`}
            onClick={() => handleReact(reaction.emoji)}
          >
            <span className={styles.reactionEmoji}>{reaction.emoji}</span>
            <span className={styles.reactionCount}>{reaction.count}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={messageRef}
      className={`${styles.messageWrapper} ${message.isOwn ? styles.own : ''} ${isGrouped ? styles.grouped : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        if (showMenu || showReactionPicker) return;
        setShowActions(false);
        setShowReactionPicker(false);
        setShowMenu(false);
      }}
    >
      {/* Avatar */}
      {!message.isOwn && (
        showAvatar ? (
          <img
            src={message.senderAvatar || fallbackAvatarDataUrl}
            alt={message.sender}
            className={styles.avatar}
            onError={applyAvatarFallback}
          />
        ) : (
          <div className={styles.avatarPlaceholder} />
        )
      )}

      {/* Message Content */}
      <div className={styles.messageContainer}>
        {/* Sender Name (for group chats) */}
        {!message.isOwn && !isGrouped && (
          <span className={styles.senderName}>{message.sender}</span>
        )}

        {/* Reply Preview */}
        {message.replyTo && (
          <div className={styles.replyPreview}>
            <div className={styles.replyBar} />
            <div className={styles.replyContent}>
              <span className={styles.replyAuthor}>{message.replyTo.sender}</span>
              <span className={styles.replyText}>{message.replyTo.content}</span>
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div className={styles.bubbleWrapper}>
          <div className={`${styles.bubble} ${message.isOwn ? styles.ownBubble : ''} ${locationData ? styles.locationBubble : ''}`}>
            {/* Location Message */}
            {locationData ? (
              <a
                href={locationData.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.locationMessage}
              >
                <div className={styles.locationMapContainer}>
                  <img
                    src={locationData.staticMapUrl}
                    alt="Location map"
                    className={styles.locationMap}
                    onError={(e) => {
                      // Fallback to placeholder if static map fails
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className={styles.locationOverlay}>
                    <MapPin size={24} className={styles.locationPin} />
                  </div>
                </div>
                <div className={styles.locationInfo}>
                  <div className={styles.locationLabel}>
                    <MapPin size={16} />
                    <span>Shared Location</span>
                  </div>
                  <div className={styles.locationLink}>
                    <span>Open in Maps</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </a>
            ) : message.content && (
              <p className={styles.messageText}>{message.content}</p>
            )}

            <div className={styles.messageFooter}>
              <span className={styles.timestamp}>{message.timestamp}</span>
              {renderMessageStatus()}
            </div>
          </div>

          <AnimatePresence>
            {showReactionPicker && (
              <motion.div
                className={styles.reactionPicker}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
              >
                {quickReactions.map((emoji) => (
                  <button
                    key={emoji}
                    className={styles.reactionOption}
                    onClick={() => handleReact(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reactions */}
        {renderReactions()}

        {/* Action Buttons */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              className={`${styles.actionButtons} ${message.isOwn ? styles.ownActions : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <button
                className={styles.actionBtn}
                onClick={() => {
                  setShowReactionPicker(!showReactionPicker);
                  setShowMenu(false);
                }}
                title="React"
              >
                <Smile size={16} />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => {
                  onReply?.(message);
                  setShowMenu(false);
                }}
                title="Reply"
              >
                <Reply size={16} />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setShowMenu(!showMenu)}
                title="More"
              >
                <MoreHorizontal size={16} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    className={`${styles.actionMenu} ${message.isOwn ? styles.ownMenu : ''}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button className={styles.menuItem} onClick={handleCopy}>
                      Copy
                    </button>
                    {message.isOwn && (
                      <>
                        <div className={styles.menuDivider} />
                        <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleDelete}>
                          Delete
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Own Avatar */}
      {message.isOwn && showAvatar && !isGrouped && (
        <img
          src={message.senderAvatar || fallbackAvatarDataUrl}
          alt="You"
          className={styles.avatar}
          onError={applyAvatarFallback}
        />
      )}
    </div>
  );
}
