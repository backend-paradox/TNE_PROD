import { useState, useCallback, useEffect, useRef } from 'react';
import axiosInstance from '@/app/axios';
import { chatAPI, travellersAPI, type NearbyInboxItem, type NearbyInboxStats } from '@/features/travellers/travellersAPI';
import { normalizeDestination } from '@/utils/travellers';
import { socketService } from '@/services/socket.service';

export function useNearbyInbox(startDate?: string, endDate?: string) {
  const [conversations, setConversations] = useState<NearbyInboxItem[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [stats, setStats] = useState<NearbyInboxStats>({
    total: 0,
    unread: 0,
    destinations: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refetchPendingRef = useRef(false);
  const profileCacheRef = useRef(new Map<string, { name?: string; profilePicUrl?: string }>());

  const getCurrentUserId = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return String(payload.id);
    } catch {
      return null;
    }
  }, []);

  const fetchPublicProfile = useCallback(async (userId: number | string) => {
    const key = String(userId);
    if (profileCacheRef.current.has(key)) {
      return profileCacheRef.current.get(key);
    }
    try {
      const response = await axiosInstance.get(`/users/${key}/public-profile`);
      const data = response.data.data || response.data || {};
      const profile = {
        name: data?.name,
        profilePicUrl: data?.profilePicUrl,
      };
      profileCacheRef.current.set(key, profile);
      return profile;
    } catch (err) {
      profileCacheRef.current.set(key, {});
      return {};
    }
  }, []);

  const buildStats = useCallback((items: NearbyInboxItem[]): NearbyInboxStats => {
    const destinations = [...new Set(items.map((item) => item.destination).filter(Boolean))];
    return {
      total: items.length,
      unread: items.filter((item) => (item.unreadCount || 0) > 0).length,
      destinations,
    };
  }, []);

  const buildFallbackConversations = useCallback(async (): Promise<NearbyInboxItem[]> => {
    const currentUserId = getCurrentUserId();
    const conversations = await chatAPI.getConversations();
    const directConversations = conversations.filter(
      (conversation) => String(conversation.type || '').toUpperCase() === 'DIRECT'
    );

    const items = await Promise.all(
      directConversations.map(async (conversation) => {
        const participants = Array.isArray(conversation.participants) ? conversation.participants : [];
        const otherParticipant = participants.find(
          (participant) => String(participant.userId) !== String(currentUserId)
        );
        if (!otherParticipant) return null;

        const profile = await fetchPublicProfile(otherParticipant.userId);
        const lastMessage = conversation.lastMessage || null;
        const lastMessageAt = conversation.lastMessageAt || lastMessage?.createdAt || null;

        return {
          conversationId: conversation.id,
          userId: Number(otherParticipant.userId),
          name: profile?.name || `User ${otherParticipant.userId}`,
          profileImage: profile?.profilePicUrl || null,
          destination: null,
          travelDates: null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                type: lastMessage.type,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount: conversation.unreadCount || 0,
          lastMessageAt,
        };
      })
    );

    return items
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a?.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b?.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      }) as NearbyInboxItem[];
  }, [fetchPublicProfile, getCurrentUserId]);

  const fetchInbox = useCallback(async (destination?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const destinationParam = destination && destination !== 'all' ? destination : undefined;
      const response = await travellersAPI.getNearbyInbox(destinationParam, startDate, endDate);
      const primary = response.conversations || [];
      if (primary.length > 0 || destinationParam) {
        setConversations(primary);
      } else {
        const fallback = await buildFallbackConversations();
        setConversations(fallback.length > 0 ? fallback : primary);
      }
    } catch (err) {
      setError('Failed to fetch nearby inbox');
      console.error('fetchInbox error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, buildFallbackConversations]);

  useEffect(() => {
    fetchInbox(selectedDestination);
  }, [selectedDestination, fetchInbox]);

  useEffect(() => {
    const nextStats = buildStats(conversations);
    setStats(nextStats);
    const cleaned = nextStats.destinations
      .map((dest) => normalizeDestination(dest))
      .filter(Boolean);
    setDestinations(cleaned);
  }, [conversations, buildStats]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      socketService.connect(token);
    }

    const handleNewMessage = (data: { conversationId: string; message: any }) => {
      const currentUserId = getCurrentUserId();
      const activeConversationId = localStorage.getItem('activeConversationId');

      setConversations((prev) => {
        const index = prev.findIndex(
          (item) => item.conversationId === data.conversationId
        );
        if (index === -1) {
          if (!refetchPendingRef.current) {
            refetchPendingRef.current = true;
            setTimeout(() => {
              refetchPendingRef.current = false;
              fetchInbox(selectedDestination);
            }, 400);
          }
          return prev;
        }

        const existing = prev[index];
        const senderId = data.message?.senderId;
        const isOwn = currentUserId && String(senderId) === String(currentUserId);
        const isActive = activeConversationId === data.conversationId;
        const unreadCount = isOwn || isActive ? 0 : 1;

        const updated = {
          ...existing,
          lastMessage: {
            id: data.message?.id,
            content: data.message?.content,
            type: data.message?.type,
            createdAt: data.message?.createdAt,
          },
          lastMessageAt: data.message?.createdAt || existing.lastMessageAt || null,
          unreadCount,
        };

        const next = [updated, ...prev.filter((_, idx) => idx !== index)];
        return next;
      });
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewMessage(handleNewMessage);
    };
  }, [fetchInbox, getCurrentUserId, selectedDestination]);

  useEffect(() => {
    const handleConversationRead = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId?: string; userId?: number | string }>;
      const conversationId = customEvent.detail?.conversationId;
      const userId = customEvent.detail?.userId;
      if (!conversationId && !userId) return;
      setConversations((prev) =>
        prev.map((item) =>
          (conversationId && item.conversationId === conversationId) ||
          (userId && String(item.userId) === String(userId))
            ? { ...item, unreadCount: 0 }
            : item
        )
      );
    };

    window.addEventListener('conversation:read', handleConversationRead as EventListener);
    return () => {
      window.removeEventListener('conversation:read', handleConversationRead as EventListener);
    };
  }, []);

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((item) =>
        item.conversationId === conversationId
          ? { ...item, unreadCount: 0 }
          : item
      )
    );
  }, []);

  return {
    conversations,
    destinations,
    selectedDestination,
    setSelectedDestination,
    stats,
    isLoading,
    error,
    fetchInbox,
    refetch: () => fetchInbox(selectedDestination),
    markConversationRead,
  };
}
