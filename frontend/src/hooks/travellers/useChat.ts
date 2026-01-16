import { useState, useCallback, useRef, useEffect } from 'react';
import { chatAPI } from '@/features/travellers/travellersAPI';
import { socketService } from '@/services/socket.service';
import type { ChatMessage, GroupMember } from '@/types/travellers';

// Typing user with display info
interface TypingUser {
  id: string;
  name: string;
  avatar: string;
}

/**
 * Hook for managing chat functionality
 * @param groupId - The group ID to get/create a conversation for
 * @param groupName - The group name (used when creating a new conversation)
 */
export function useChat(groupId?: string, groupName?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Refs for typing debounce
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const getCurrentUserId = () => {
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

  const resolveMember = (userId?: string | number) => {
    if (!userId) return null;
    const match = members.find(
      (m) => String((m as any).userId ?? m.id) === String(userId)
    );
    return match || null;
  };

  const normalizeReactions = (reactions: Record<string, { count?: number; users?: number[] }> | undefined) => {
    if (!reactions) return [];
    const currentUserId = getCurrentUserId();
    return Object.entries(reactions).map(([emoji, info]) => ({
      emoji,
      count: info.count ?? info.users?.length ?? 0,
      reacted: currentUserId ? Boolean(info.users?.includes(Number(currentUserId))) : false,
    }));
  };

  const normalizeMessage = (message: any): ChatMessage => {
    const currentUserId = getCurrentUserId();
    const rawSenderId = message.senderId ?? message.userId ?? message.sender_id;
    const senderId = rawSenderId ?? (typeof message.sender === 'number' ? message.sender : undefined);
    const member = resolveMember(senderId);
    const senderName =
      member?.name ||
      (member as any)?.user?.name ||
      (member as any)?.nickname ||
      (typeof message.sender === 'string' ? message.sender : `User ${senderId ?? ''}`.trim());
    const senderAvatar =
      member?.avatar ||
      (member as any)?.user?.avatar ||
      (member as any)?.user?.profilePicUrl ||
      message.senderAvatar ||
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
    // For image messages, check attachments first, then fallback to content (which contains URL when sending)
    const imageUrl = normalizedType === 'image' ? (attachments[0]?.url || message.content) : undefined;
    const voiceMeta =
      normalizedType === 'voice'
        ? extractVoiceMeta(message, attachments)
        : { audioUrl: undefined, durationSeconds: undefined };

    const replyTo = message.replyTo
      ? {
          sender: resolveMember(message.replyTo.senderId)?.name || `User ${message.replyTo.senderId}`,
          content: message.replyTo.content || '',
        }
      : undefined;

    // Handle various timestamp field names from backend (camelCase vs snake_case)
    const rawCreatedAt = message.createdAt || (message as any).created_at || message.timestamp;

    return {
      id: message.id,
      senderId,
      sender: senderName,
      senderAvatar,
      content: message.content || '',
      type: normalizedType,
      timestamp: formatTimestamp(rawCreatedAt),
      createdAt: rawCreatedAt,
      isOwn: currentUserId ? String(senderId) === String(currentUserId) : false,
      reactions: normalizeReactions(message.reactions),
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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (members.length === 0) return;
    setMessages((prev) =>
      prev.map((msg) => (msg.senderId ? normalizeMessage(msg) : msg))
    );
  }, [members]);

  useEffect(() => {
    messageIdsRef.current = new Set();
  }, [groupId]);

  // Connect to Socket.IO when component mounts
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Connect to chat service
    socketService.connect(token);

    // Cleanup on unmount
    return () => {
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Don't disconnect socket service - it's a singleton that may be used elsewhere
    };
  }, []);

  // Join conversation room and listen for typing events
  useEffect(() => {
    if (!conversationId) return;

    // Join the conversation room
    socketService.joinConversation(conversationId);

    // Listen for typing events
    const handleUserTyping = (data: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      // Only handle events for the current conversation
      if (data.conversationId !== conversationId) return;

      setTypingUsers((prev) => {
        if (data.isTyping) {
          // Add user if not already in list
          if (!prev.find((u) => u.id === String(data.userId))) {
            // Find user info from members list
            const member = members.find(
              (m) => String(m.userId || m.id) === String(data.userId)
            );
            const userName = member?.name || member?.user?.name || 'User';
            const userAvatar =
              member?.avatar ||
              member?.user?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.userId}`;

            return [
              ...prev,
              {
                id: String(data.userId),
                name: userName,
                avatar: userAvatar,
              },
            ];
          }
          return prev;
        } else {
          // Remove user from list
          return prev.filter((u) => u.id !== String(data.userId));
        }
      });
    };

    socketService.onUserTyping(handleUserTyping);

    // Cleanup
    return () => {
      // Stop typing if we were typing
      if (isTypingRef.current) {
        socketService.emitTypingStop(conversationId);
        isTypingRef.current = false;
      }

      // Leave conversation room
      socketService.leaveConversation(conversationId);

      // Remove listener
      socketService.offUserTyping(handleUserTyping);

      // Clear typing users
      setTypingUsers([]);
    };
  }, [conversationId, members]);

  // Listen for new messages from other users via Socket.IO
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (data: {
      conversationId: string;
      message: any;
    }) => {
      // Only handle events for the current conversation
      if (data.conversationId !== conversationId) return;

      // Add message to state, avoiding duplicates
      setMessages((prev) => {
        const incomingId = data.message?.id;
        if (incomingId && prev.some((msg) => msg.id === incomingId)) {
          return prev;
        }
        if (incomingId) {
          messageIdsRef.current.add(incomingId);
        }
        return [...prev, normalizeMessage(data.message)];
      });
    };

    socketService.onNewMessage(handleNewMessage);

    // Cleanup
    return () => {
      socketService.offNewMessage(handleNewMessage);
    };
  }, [conversationId]);

  // Initialize conversation for the group
  const initializeConversation = useCallback(async () => {
    if (!groupId) return null;
    try {
      setError(null);
      const conversation = await chatAPI.getOrCreateGroupConversation(groupId, groupName || 'Group Chat');
      setConversationId(conversation.id);
      return conversation.id;
    } catch (err) {
      console.error('Failed to initialize conversation:', err);
      setError('Failed to initialize chat');
      return null;
    }
  }, [groupId, groupName]);

  const fetchMessages = useCallback(async (page = 1) => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Get or create conversation first
      let convId = conversationId;
      if (!convId) {
        convId = await initializeConversation();
        if (!convId) return;
      }

      const response = await chatAPI.getMessages(convId, page);
      const normalized = response.messages.map((msg: any) => normalizeMessage(msg));
      if (page === 1) {
        messageIdsRef.current = new Set(normalized.map((msg) => msg.id));
        setMessages(normalized);
      } else {
        normalized.forEach((msg) => messageIdsRef.current.add(msg.id));
        setMessages((prev) => [...normalized, ...prev]);
      }
      setHasMore(response.hasMore);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('fetchMessages error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [groupId, conversationId, initializeConversation]);

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;
    try {
      const data = await chatAPI.getGroupMembers(groupId);
      // Handle both array and wrapped response { members: [...], pagination: {...} }
      const membersArray = Array.isArray(data) ? data : (data?.members || []);
      setMembers(membersArray);
    } catch (err) {
      console.error('fetchMembers error:', err);
    }
  }, [groupId]);

  const sendMessage = useCallback(async (content: string, type: ChatMessage['type'] = 'text', replyTo?: string) => {
    if (!conversationId) {
      setError('Chat not initialized');
      throw new Error('Chat not initialized');
    }
    setIsLoading(true);
    setError(null);
    try {
      const newMessage = await chatAPI.sendMessage(conversationId, { content, type, replyTo });
      const normalized = normalizeMessage(newMessage);
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === normalized.id)) {
          return prev;
        }
        messageIdsRef.current.add(normalized.id);
        return [...prev, normalized];
      });
      return normalized;
    } catch (err) {
      setError('Failed to send message');
      console.error('sendMessage error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await chatAPI.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      setError('Failed to delete message');
      console.error('deleteMessage error:', err);
      throw err;
    }
  }, []);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    const target = messages.find((msg) => msg.id === messageId);
    const existingReaction = target?.reactions?.find((reaction) => reaction.emoji === emoji);
    const hasReacted = existingReaction?.reacted ?? false;

    try {
      if (hasReacted) {
        await chatAPI.removeReaction(messageId, emoji);
      } else {
        await chatAPI.addReaction(messageId, emoji);
      }
      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const current = msg.reactions?.find((reaction) => reaction.emoji === emoji);
            if (current) {
              const nextCount = Math.max(0, hasReacted ? current.count - 1 : current.count + 1);
              return {
                ...msg,
                reactions: msg.reactions
                  ?.map((reaction) =>
                    reaction.emoji === emoji
                      ? { ...reaction, count: nextCount, reacted: !hasReacted }
                      : reaction
                  )
                  .filter((reaction) => reaction.count > 0),
              };
            }
            return {
              ...msg,
              reactions: [...(msg.reactions || []), { emoji, count: 1, reacted: true }],
            };
          }
          return msg;
        })
      );
    } catch (err) {
      setError('Failed to update reaction');
      console.error('addReaction error:', err);
    }
  }, [messages]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await chatAPI.removeReaction(messageId, emoji);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              reactions: msg.reactions
                ?.map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r))
                .filter((r) => r.count > 0),
            };
          }
          return msg;
        })
      );
    } catch (err) {
      setError('Failed to remove reaction');
      console.error('removeReaction error:', err);
    }
  }, []);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await chatAPI.markAsRead(messageId);
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  }, []);

  const sendImageMessage = useCallback(async (file: File) => {
    if (!conversationId) {
      setError('Chat not initialized');
      throw new Error('Chat not initialized');
    }
    setIsLoading(true);
    setError(null);
    try {
      // Upload the image first
      const uploadResult = await chatAPI.uploadChatMedia(file);
      // Send a message with the image URL
      const newMessage = await chatAPI.sendMessage(conversationId, {
        content: uploadResult.url,
        type: 'image',
      });
      const normalized = normalizeMessage(newMessage);
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === normalized.id)) {
          return prev;
        }
        messageIdsRef.current.add(normalized.id);
        return [...prev, normalized];
      });
      return normalized;
    } catch (err) {
      setError('Failed to send image');
      console.error('sendImageMessage error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const sendVoiceMessage = useCallback(
    async (file: File, durationSeconds: number, replyTo?: string) => {
      if (!conversationId) {
        setError('Chat not initialized');
        throw new Error('Chat not initialized');
      }
      setIsLoading(true);
      setError(null);
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
          replyTo,
          attachments,
        });
        const normalized = normalizeMessage(newMessage);
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === normalized.id)) {
            return prev;
          }
          messageIdsRef.current.add(normalized.id);
          return [...prev, normalized];
        });
        return normalized;
      } catch (err) {
        setError('Failed to send voice message');
        console.error('sendVoiceMessage error:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  // Set typing status with debouncing
  const setTypingStatus = useCallback(
    (isTypingNow: boolean) => {
      if (!conversationId) return;

      if (isTypingNow) {
        // User started typing
        if (!isTypingRef.current) {
          socketService.emitTypingStart(conversationId);
          isTypingRef.current = true;
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to automatically stop typing after 3 seconds of no activity
        typingTimeoutRef.current = setTimeout(() => {
          if (conversationId) {
            socketService.emitTypingStop(conversationId);
          }
          isTypingRef.current = false;
        }, 3000);
      } else {
        // User explicitly stopped typing (e.g., sent message or cleared input)
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

  return {
    messages,
    members,
    conversationId,
    typingUsers,
    isLoading,
    error,
    hasMore,
    messagesEndRef,
    initializeConversation,
    fetchMessages,
    fetchMembers,
    sendMessage,
    sendImageMessage,
    sendVoiceMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    markAsRead,
    setTypingStatus,
    scrollToBottom,
  };
}
