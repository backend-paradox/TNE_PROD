import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Users, ArrowLeft, X, Minus, Maximize2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { VoiceMessage } from './VoiceMessage';
import { ImageMessage } from './ImageMessage';
import type { GroupMember } from './MemberPanel';
import styles from './ChatWindow.module.css';
import { applyAvatarFallback, fallbackAvatarDataUrl } from '@/utils/travellers';

interface DateDivider {
  type: 'divider';
  date: string;
}

type ChatItem = ChatMessage | DateDivider;

interface TypingUser {
  id: string;
  name: string;
  avatar: string;
}

interface ChatWindowProps {
  groupName: string;
  groupImage?: string;
  groupDescription?: string;
  members: GroupMember[];
  messages: ChatMessage[];
  typingUsers?: TypingUser[];
  showBackButton?: boolean;
  variant?: 'group' | 'direct';
  isMinimized?: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onSendMessage: (content: string, type: 'text' | 'image' | 'voice' | 'location', replyToId?: string) => void;
  onSendImage?: (file: File) => Promise<void>;
  onSendVoice?: (file: File, durationSeconds: number, replyToId?: string) => Promise<void> | void;
  onTyping?: (isTyping: boolean) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export function ChatWindow({
  groupName,
  groupImage,
  groupDescription,
  members,
  messages,
  typingUsers = [],
  showBackButton = true,
  variant = 'group',
  isMinimized = false,
  onClose,
  onMinimize,
  onSendMessage,
  onSendImage,
  onSendVoice,
  onTyping,
  onReact,
  onDeleteMessage,
}: ChatWindowProps) {
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDirect = variant === 'direct';

  const onlineCount = members.filter((m) => m.online).length;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content: string, type: 'text' | 'image' | 'voice' | 'location' = 'text') => {
    onSendMessage(content, type, replyingTo?.id);
    setReplyingTo(null);
  };

  const handleSendVoice = async (file: File, durationSeconds: number) => {
    if (!onSendVoice) return;
    await onSendVoice(file, durationSeconds, replyingTo?.id);
    setReplyingTo(null);
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
  };

  const handleReact = (messageId: string, emoji: string) => {
    onReact?.(messageId, emoji);
  };

  const resolveDisplayMessage = (message: ChatMessage) => {
    const senderId = message.senderId;
    if (!senderId) return message;

    const match = members.find((member) => {
      const candidate = (member as any).userId ?? (member as any).oddjobId ?? member.id;
      return String(candidate) === String(senderId);
    });

    if (!match) return message;

    const resolvedName =
      match.name ||
      (match as any).user?.name ||
      message.sender;
    const resolvedAvatar =
      match.avatar ||
      (match as any).user?.profilePicUrl ||
      message.senderAvatar;

    if (resolvedName === message.sender && resolvedAvatar === message.senderAvatar) {
      return message;
    }

    return {
      ...message,
      sender: resolvedName,
      senderAvatar: resolvedAvatar,
    };
  };

  const getSenderKey = (message: ChatMessage) =>
    message.senderId ? String(message.senderId) : message.sender;

  const formatDurationLabel = (seconds?: number) => {
    if (!seconds || !Number.isFinite(seconds)) return '0:00';
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Format date for display
  const formatDateLabel = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDay.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDay.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      // Format as "Mon, Jan 15" or similar
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (items: ChatMessage[]): ChatItem[] => {
    const result: ChatItem[] = [];
    let currentDate = '';

    items.forEach((message) => {
      // Parse the createdAt field to get the actual date
      let messageDate = 'Today';
      if (message.createdAt) {
        const date = new Date(message.createdAt);
        if (!isNaN(date.getTime())) {
          messageDate = formatDateLabel(date);
        }
      }

      if (messageDate !== currentDate) {
        currentDate = messageDate;
        result.push({ type: 'divider', date: messageDate });
      }

      result.push(message);
    });

    return result;
  };

  const renderMessage = (message: ChatMessage, index: number, messageList: ChatMessage[]) => {
    const resolvedMessage = resolveDisplayMessage(message);
    // Check if this message is grouped with the previous one
    const prevMessage = messageList[index - 1];
    const isGrouped =
      prevMessage &&
      getSenderKey(prevMessage) === getSenderKey(message) &&
      !message.replyTo;

    // Render voice or image message types
    if (resolvedMessage.type === 'voice') {
      const durationLabel =
        resolvedMessage.voiceData?.duration ||
        formatDurationLabel(resolvedMessage.voiceDuration);
      return (
        <div
          key={resolvedMessage.id}
          className={`${styles.messageRow} ${resolvedMessage.isOwn ? styles.own : ''}`}
        >
          {!resolvedMessage.isOwn && !isGrouped && (
            <img
              src={resolvedMessage.senderAvatar || fallbackAvatarDataUrl}
              alt={resolvedMessage.sender}
              className={styles.avatar}
              onError={applyAvatarFallback}
            />
          )}
          {!resolvedMessage.isOwn && isGrouped && <div className={styles.avatarPlaceholder} />}
          <div className={styles.messageContent}>
            {!resolvedMessage.isOwn && !isGrouped && (
              <span className={styles.senderName}>{resolvedMessage.sender}</span>
            )}
            <VoiceMessage
              duration={durationLabel}
              waveform={resolvedMessage.voiceData?.waveform}
              timestamp={resolvedMessage.timestamp}
              isOwn={resolvedMessage.isOwn}
              audioUrl={resolvedMessage.audioUrl}
            />
          </div>
          {resolvedMessage.isOwn && !isGrouped && (
            <img
              src={resolvedMessage.senderAvatar || fallbackAvatarDataUrl}
              alt="You"
              className={styles.avatar}
              onError={applyAvatarFallback}
            />
          )}
        </div>
      );
    }

    if (resolvedMessage.type === 'image') {
      // Use imageUrl if set, fallback to content (which contains URL when sent via upload)
      const imgUrl = resolvedMessage.imageUrl || resolvedMessage.content;
      // Only render as image if we have a valid URL
      if (imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('/'))) {
        return (
          <div
            key={resolvedMessage.id}
            className={`${styles.messageRow} ${resolvedMessage.isOwn ? styles.own : ''}`}
          >
            {!resolvedMessage.isOwn && !isGrouped && (
              <img
                src={resolvedMessage.senderAvatar || fallbackAvatarDataUrl}
                alt={resolvedMessage.sender}
                className={styles.avatar}
                onError={applyAvatarFallback}
              />
            )}
            {!resolvedMessage.isOwn && isGrouped && <div className={styles.avatarPlaceholder} />}
            <div className={styles.messageContent}>
              {!resolvedMessage.isOwn && !isGrouped && (
                <span className={styles.senderName}>{resolvedMessage.sender}</span>
              )}
              <ImageMessage
                imageUrl={imgUrl}
                caption=""
                timestamp={resolvedMessage.timestamp}
                isOwn={resolvedMessage.isOwn}
              />
            </div>
            {resolvedMessage.isOwn && !isGrouped && (
              <img
                src={resolvedMessage.senderAvatar || fallbackAvatarDataUrl}
                alt="You"
                className={styles.avatar}
                onError={applyAvatarFallback}
              />
            )}
          </div>
        );
      }
    }

    // Default text message
    return (
      <MessageBubble
        key={resolvedMessage.id}
        message={resolvedMessage}
        onReply={handleReply}
        onReact={handleReact}
        onDelete={onDeleteMessage}
        showAvatar={!isGrouped}
        isGrouped={isGrouped}
      />
    );
  };

  return (
    <div className={`${styles.container} ${isDirect ? styles.directContainer : ''}`}>
      {/* Header */}
      <div className={`${styles.header} ${isDirect ? styles.directHeader : ''}`}>
        {!isDirect && showBackButton && (
          <button className={styles.backBtn} onClick={onClose}>
            <ArrowLeft size={20} />
          </button>
        )}

        <div className={styles.headerInfo}>
          {groupImage ? (
            <img src={groupImage} alt={groupName} className={styles.groupImage} />
          ) : (
            <div className={styles.groupIcon}>
              <Users size={20} />
            </div>
          )}
          <div className={styles.groupDetails}>
            <h3 className={styles.groupName}>{groupName}</h3>
            {!isDirect && (
              <div className={styles.onlineStatus}>
                <div className={styles.onlineAvatars}>
                  {members
                    .filter((m) => m.online)
                    .slice(0, 3)
                    .map((member, idx) => (
                      <img
                        key={member.id}
                        src={member.avatar || fallbackAvatarDataUrl}
                        alt={member.name}
                        className={styles.onlineAvatarSmall}
                        style={{ zIndex: 3 - idx }}
                        onError={applyAvatarFallback}
                      />
                    ))}
                  {onlineCount > 3 && (
                    <span className={styles.moreOnline}>+{onlineCount - 3}</span>
                  )}
                </div>
                <span className={styles.groupStatus}>{onlineCount} online</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.headerActions}>
          {onMinimize && (
            <button
              className={styles.headerBtn}
              title={isMinimized ? 'Maximize' : 'Minimize'}
              onClick={onMinimize}
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minus size={18} />}
            </button>
          )}
          <button className={styles.headerBtn} title="Close chat" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area - Hidden when minimized */}
      {!isMinimized && (
        <>
          <div className={styles.messagesArea}>
            <div className={styles.messagesContainer}>
              {groupMessagesByDate(messages).map((item, index) => {
                if ('type' in item && item.type === 'divider') {
                  return (
                    <div key={`divider-${index}`} className={styles.dateDivider}>
                      <span>{item.date}</span>
                    </div>
                  );
                }

                const message = item as ChatMessage;
                const messageIndex = messages.findIndex((m) => m.id === message.id);
                return renderMessage(message, messageIndex, messages);
              })}

              {/* Typing Indicator */}
              <AnimatePresence>
                {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <ChatInput
            onSend={handleSend}
            onSendImage={onSendImage}
            onSendVoice={handleSendVoice}
            onTyping={onTyping}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            placeholder="Type a message..."
          />
        </>
      )}
    </div>
  );
}
