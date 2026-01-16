import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChatWindow } from '@/components/travellers/chat/ChatWindow';
import { chatAPI } from '@/features/travellers/travellersAPI';
import axiosInstance from '@/app/axios';
import { useAppSelector } from '@/store/hooks';
import type { ChatMessage, GroupMember } from '@/types/travellers';
import { socketService } from '@/services/socket.service';
import styles from './DirectMessagePage.module.css';

interface TargetProfile {
  name: string;
  profilePicUrl?: string;
}

interface LocationState {
  name?: string;
  avatar?: string;
  backgroundLocation?: unknown;
}

interface TypingUser {
  id: string;
  name: string;
  avatar: string;
}

const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return String(payload.id);
  } catch {
    return null;
  }
};

const formatTimestamp = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatDurationLabel = (seconds?: number) => {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const extractVoiceMeta = (message: any, attachments: any[]) => {
  let audioUrl: string | undefined;
  let durationSeconds: number | undefined;

  const audioAttachment = attachments.find((att) => {
    const type = String(att?.type || '').toUpperCase();
    const mime = String(att?.mimeType || '').toLowerCase();
    return type === 'AUDIO' || mime.startsWith('audio/');
  });

  if (audioAttachment) {
    audioUrl = audioAttachment.url;
    if (audioAttachment.duration !== undefined && audioAttachment.duration !== null) {
      const parsed = Number(audioAttachment.duration);
      if (Number.isFinite(parsed)) {
        durationSeconds = parsed;
      }
    }
  }

  if (typeof message.content === 'string' && message.content) {
    try {
      const parsed = JSON.parse(message.content);
      if (!audioUrl && (parsed.url || parsed.audioUrl)) {
        audioUrl = parsed.url || parsed.audioUrl;
      }
      if (durationSeconds === undefined && parsed.duration !== undefined) {
        const parsedDuration = Number(parsed.duration);
        if (Number.isFinite(parsedDuration)) {
          durationSeconds = parsedDuration;
        }
      }
    } catch {
      if (!audioUrl && message.content.startsWith('http')) {
        audioUrl = message.content;
      }
    }
  }

  return { audioUrl, durationSeconds };
};

const normalizeReactions = (
  reactions: Record<string, { count?: number; users?: number[] }> | undefined,
  currentUserId: string | null
) => {
  if (!reactions) return [];
  const currentUserNumber = currentUserId ? Number(currentUserId) : null;
  return Object.entries(reactions).map(([emoji, info]) => ({
    emoji,
    count: info.count ?? info.users?.length ?? 0,
    reacted: currentUserNumber ? Boolean(info.users?.includes(currentUserNumber)) : false,
  }));
};

const normalizeMessage = (
  message: any,
  members: GroupMember[],
  currentUserId: string | null
): ChatMessage => {
  if (message.sender && message.timestamp) {
    return {
      ...(message as ChatMessage),
      senderId: message.senderId ?? (typeof message.sender === 'number' ? message.sender : undefined),
    };
  }

  const senderId = message.senderId ?? message.sender;
  const member = members.find(
    (m) => String((m as any).userId ?? m.id) === String(senderId)
  );
  const senderName = member?.name || `User ${senderId ?? ''}`.trim();
  const senderAvatar =
    member?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderId ?? 'user'}`;

  const typeMap: Record<string, ChatMessage['type']> = {
    TEXT: 'text',
    IMAGE: 'image',
    AUDIO: 'voice',
    LOCATION: 'location',
    POLL: 'poll',
  };
  const normalizedType = typeMap[String(message.type || 'TEXT').toUpperCase()] || 'text';
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  const imageUrl = normalizedType === 'image' ? (attachments[0]?.url || message.content) : undefined;
  const voiceMeta =
    normalizedType === 'voice'
      ? extractVoiceMeta(message, attachments)
      : { audioUrl: undefined, durationSeconds: undefined };
  const rawCreatedAt = message.createdAt || message.created_at;
  const replyTo = message.replyTo
    ? {
        sender: members.find(
          (m) => String((m as any).userId ?? m.id) === String(message.replyTo.senderId)
        )?.name || `User ${message.replyTo.senderId}`,
        content: message.replyTo.content || '',
      }
    : undefined;

  return {
    id: message.id,
    senderId,
    sender: senderName,
    senderAvatar,
    content: message.content || '',
    type: normalizedType,
    timestamp: formatTimestamp(rawCreatedAt || message.timestamp),
    createdAt: rawCreatedAt,
    isOwn: currentUserId ? String(senderId) === String(currentUserId) : false,
    reactions: normalizeReactions(message.reactions, currentUserId),
    replyTo,
    imageUrl,
    audioUrl: voiceMeta.audioUrl,
    voiceDuration: voiceMeta.durationSeconds,
    voiceData: normalizedType === 'voice'
      ? {
          duration: formatDurationLabel(voiceMeta.durationSeconds),
          waveform: [],
        }
      : undefined,
  };
};

const notifyConversationRead = (conversationId: string, userId?: number) => {
  window.dispatchEvent(
    new CustomEvent('conversation:read', { detail: { conversationId, userId } })
  );
};

export function DirectMessagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams<{ userId: string }>();
  const targetUserId = Number(userId);
  const locationState = (location.state as LocationState) || {};

  const user = useAppSelector((state) => state.auth.user);
  const profile = useAppSelector((state) => state.profile.profile);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetProfile, setTargetProfile] = useState<TargetProfile | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const currentUserId = getCurrentUserId();
  const currentUserName = profile?.name || user?.name || 'You';
  const currentUserAvatar =
    profile?.profilePicUrl ||
    user?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserName}`;

  const targetName = targetProfile?.name || locationState.name || `User ${userId ?? ''}`;
  const targetAvatar =
    targetProfile?.profilePicUrl ||
    locationState.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId ?? 'traveller'}`;

  const headerName = targetName || 'Direct Message';

  const buildMembers = useMemo(
    () => [
      {
        id: currentUserId || 'me',
        userId: currentUserId ? Number(currentUserId) : undefined,
        name: currentUserName,
        avatar: currentUserAvatar,
        online: true,
        role: 'member',
      },
      {
        id: String(targetUserId),
        userId: Number.isFinite(targetUserId) ? targetUserId : undefined,
        name: targetName,
        avatar: targetAvatar,
        online: false,
        role: 'member',
      },
    ] as GroupMember[],
    [currentUserId, currentUserName, currentUserAvatar, targetUserId, targetName, targetAvatar]
  );

  useEffect(() => {
    setMembers(buildMembers);
  }, [buildMembers]);

  useEffect(() => {
    if (members.length === 0) return;
    setMessages((prev) =>
      prev.map((message) => {
        const senderKey = message.senderId ?? message.sender;
        if (!senderKey) return message;
        const match = members.find(
          (member) => String((member as any).userId ?? member.id) === String(senderKey)
        );
        if (!match) return message;
        const resolvedName = match.name || message.sender;
        const resolvedAvatar = match.avatar || message.senderAvatar;
        if (resolvedName === message.sender && resolvedAvatar === message.senderAvatar) {
          return message;
        }
        return {
          ...message,
          sender: resolvedName,
          senderAvatar: resolvedAvatar,
        };
      })
    );
  }, [members]);

  useEffect(() => {
    messageIdsRef.current = new Set();
  }, [targetUserId]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    socketService.connect(token);
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!Number.isFinite(targetUserId)) {
      setError('Invalid user');
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await axiosInstance.get(`/users/${targetUserId}/public-profile`);
        const data = response.data.data || response.data;
        setTargetProfile({
          name: data?.name || `User ${targetUserId}`,
          profilePicUrl: data?.profilePicUrl,
        });
      } catch (err) {
        console.warn('Failed to load public profile for DM:', err);
      }
    };

    loadProfile();
  }, [targetUserId]);

  useEffect(() => {
    if (!Number.isFinite(targetUserId)) return;

    const loadConversation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const conversation = await chatAPI.getOrCreateDirectConversation(targetUserId);
        setConversationId(conversation.id);

        const response = await chatAPI.getMessages(conversation.id);
        const normalized = response.messages.map((msg: any) =>
          normalizeMessage(msg, buildMembers, currentUserId)
        );
        messageIdsRef.current = new Set(
          normalized.map((message) => String(message.id))
        );
        setMessages(normalized);
      } catch (err) {
        console.error('Failed to load direct messages:', err);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [targetUserId, buildMembers, currentUserId]);

  useEffect(() => {
    if (!conversationId) return;

    socketService.joinConversation(conversationId);
    localStorage.setItem('activeConversationId', conversationId);
    chatAPI.markDirectConversationsAsRead(targetUserId).catch((err) => {
      console.warn('Failed to mark conversation as read:', err);
    });
    notifyConversationRead(conversationId, Number.isFinite(targetUserId) ? targetUserId : undefined);

    const handleNewMessage = (data: { conversationId: string; message: any }) => {
      if (data.conversationId !== conversationId) return;
      const incomingId = data.message?.id;
      if (incomingId && messageIdsRef.current.has(String(incomingId))) {
        return;
      }
      const normalized = normalizeMessage(data.message, buildMembers, currentUserId);
      if (incomingId) {
        messageIdsRef.current.add(String(incomingId));
      }
      setMessages((prev) => [...prev, normalized]);
      if (currentUserId && String(data.message?.senderId) !== String(currentUserId)) {
        chatAPI.markDirectConversationsAsRead(targetUserId).catch(() => {});
        notifyConversationRead(conversationId, Number.isFinite(targetUserId) ? targetUserId : undefined);
      }
    };

    const handleUserTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId !== conversationId) return;
      if (currentUserId && String(data.userId) === String(currentUserId)) return;

      setTypingUsers((prev) => {
        if (data.isTyping) {
          if (prev.find((u) => u.id === String(data.userId))) return prev;
          const member = buildMembers.find(
            (m) => String((m as any).userId ?? m.id) === String(data.userId)
          );
          return [
            ...prev,
            {
              id: String(data.userId),
              name: member?.name || `User ${data.userId}`,
              avatar:
                member?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.userId}`,
            },
          ];
        }
        return prev.filter((u) => u.id !== String(data.userId));
      });
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);

    return () => {
      if (isTypingRef.current) {
        socketService.emitTypingStop(conversationId);
        isTypingRef.current = false;
      }
      socketService.leaveConversation(conversationId);
      if (localStorage.getItem('activeConversationId') === conversationId) {
        localStorage.removeItem('activeConversationId');
      }
      socketService.offNewMessage(handleNewMessage);
      socketService.offUserTyping(handleUserTyping);
      setTypingUsers([]);
    };
  }, [conversationId, buildMembers, currentUserId]);

  const handleTyping = useCallback(
    (isTypingNow: boolean) => {
      if (!conversationId) return;

      if (isTypingNow) {
        if (!isTypingRef.current) {
          socketService.emitTypingStart(conversationId);
          isTypingRef.current = true;
        }

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          socketService.emitTypingStop(conversationId);
          isTypingRef.current = false;
        }, 3000);
      } else {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }

        if (isTypingRef.current) {
          socketService.emitTypingStop(conversationId);
          isTypingRef.current = false;
        }
      }
    },
    [conversationId]
  );

  const handleSendMessage = async (
    content: string,
    type: 'text' | 'image' | 'voice' | 'location',
    replyToId?: string
  ) => {
    if (!conversationId) return;
    try {
      const newMessage = await chatAPI.sendMessage(conversationId, { content, type, replyTo: replyToId });
      const normalized = normalizeMessage(newMessage, buildMembers, currentUserId);
      const normalizedId = normalized.id ? String(normalized.id) : '';
      if (normalizedId && messageIdsRef.current.has(normalizedId)) {
        return;
      }
      if (normalizedId) {
        messageIdsRef.current.add(normalizedId);
      }
      setMessages((prev) => {
        if (normalizedId && prev.some((msg) => String(msg.id) === normalizedId)) {
          return prev;
        }
        return [...prev, normalized];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    const target = messages.find((message) => String(message.id) === String(messageId));
    const existing = target?.reactions?.find((reaction) => reaction.emoji === emoji);
    const hasReacted = existing?.reacted ?? false;

    try {
      if (hasReacted) {
        await chatAPI.removeReaction(messageId, emoji);
      } else {
        await chatAPI.addReaction(messageId, emoji);
      }

      setMessages((prev) =>
        prev.map((message) => {
          if (String(message.id) !== String(messageId)) return message;
          const reactions = message.reactions || [];
          const current = reactions.find((reaction) => reaction.emoji === emoji);
          if (current) {
            const nextCount = Math.max(0, hasReacted ? current.count - 1 : current.count + 1);
            const nextReactions = reactions
              .map((reaction) =>
                reaction.emoji === emoji
                  ? { ...reaction, count: nextCount, reacted: !hasReacted }
                  : reaction
              )
              .filter((reaction) => reaction.count > 0);
            return { ...message, reactions: nextReactions };
          }
          return {
            ...message,
            reactions: [...reactions, { emoji, count: 1, reacted: true }],
          };
        })
      );
    } catch (err) {
      console.error('Failed to update reaction:', err);
      toast.error('Failed to update reaction. Please try again.');
    }
  };

  const handleSendImage = async (file: File) => {
    if (!conversationId) return;
    try {
      // Upload the image first
      const uploadResult = await chatAPI.uploadChatMedia(file);
      // Send a message with the image URL
      const newMessage = await chatAPI.sendMessage(conversationId, {
        content: uploadResult.url,
        type: 'image',
      });
      const normalized = normalizeMessage(newMessage, buildMembers, currentUserId);
      const normalizedId = normalized.id ? String(normalized.id) : '';
      if (normalizedId && messageIdsRef.current.has(normalizedId)) {
        return;
      }
      if (normalizedId) {
        messageIdsRef.current.add(normalizedId);
      }
      setMessages((prev) => {
        if (normalizedId && prev.some((msg) => String(msg.id) === normalizedId)) {
          return prev;
        }
        return [...prev, normalized];
      });
    } catch (err) {
      console.error('Failed to send image:', err);
      toast.error('Failed to send image. Please try again.');
    }
  };

  const handleSendVoice = async (file: File, durationSeconds: number) => {
    if (!conversationId) return;
    try {
      const uploadResult = await chatAPI.uploadChatMedia(file);
      const attachments = [
        {
          type: 'AUDIO',
          fileName: uploadResult.fileName || file.name,
          fileSize: uploadResult.size || file.size,
          mimeType: uploadResult.mimeType || file.type || 'audio/webm',
          url: uploadResult.url,
          duration: Math.round(durationSeconds),
        },
      ];
      const newMessage = await chatAPI.sendMessage(conversationId, {
        type: 'voice',
        attachments,
      });
      const normalized = normalizeMessage(newMessage, buildMembers, currentUserId);
      const normalizedId = normalized.id ? String(normalized.id) : '';
      if (normalizedId && messageIdsRef.current.has(normalizedId)) {
        return;
      }
      if (normalizedId) {
        messageIdsRef.current.add(normalizedId);
      }
      setMessages((prev) => {
        if (normalizedId && prev.some((msg) => String(msg.id) === normalizedId)) {
          return prev;
        }
        return [...prev, normalized];
      });
    } catch (err) {
      console.error('Failed to send voice message:', err);
      toast.error('Failed to send voice message. Please try again.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatAPI.deleteMessage(messageId);
      messageIdsRef.current.delete(String(messageId));
      setMessages((prev) => prev.filter((message) => String(message.id) !== String(messageId)));
      toast.success('Message deleted');
    } catch (err) {
      console.error('Failed to delete message:', err);
      toast.error('Failed to delete message. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ChatWindow
        groupName={headerName}
        groupImage={targetAvatar}
        members={members}
        messages={messages}
        typingUsers={typingUsers}
        showBackButton={false}
        variant="direct"
        onClose={() => navigate(-1)}
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
        onSendVoice={handleSendVoice}
        onTyping={handleTyping}
        onReact={handleReact}
        onDeleteMessage={handleDeleteMessage}
      />
    </div>
  );
}
