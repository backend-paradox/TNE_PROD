import { useState, useCallback, useEffect, useRef } from 'react';
import {
  groupsAPI,
  travellersAPI,
  type NearbyGroup,
  type NearbyGroupsStats,
} from '@/features/travellers/travellersAPI';
import { normalizeDestination } from '@/utils/travellers';

export function useNearbyGroups(startDate?: string, endDate?: string) {
  const [groups, setGroups] = useState<NearbyGroup[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [stats, setStats] = useState<NearbyGroupsStats>({ total: 0, destinations: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track pending requests to prevent duplicates
  const pendingRequests = useRef<Set<string>>(new Set());

  const fetchGroups = useCallback(async (destination?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const destinationParam = destination && destination !== 'all' ? destination : undefined;
      const feed = !destinationParam;
      const response = await travellersAPI.getNearbyGroups(destinationParam, startDate, endDate, feed);
      setGroups(response.groups || []);
      setStats(response.stats || { total: 0, destinations: [] });

      if (response.stats?.destinations?.length) {
        const cleaned = response.stats.destinations
          .map((dest) => normalizeDestination(dest))
          .filter(Boolean);
        setDestinations(cleaned);
      } else {
        setDestinations([]);
      }
    } catch (err) {
      setError('Failed to fetch nearby groups');
      console.error('fetchGroups error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  const requestToJoin = useCallback(
    async (groupId: string): Promise<boolean> => {
      // Prevent duplicate requests
      if (pendingRequests.current.has(groupId)) {
        return false;
      }

      pendingRequests.current.add(groupId);

      // Optimistic update - immediately show pending status
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, joinStatus: 'PENDING' as const } : g
        )
      );

      try {
        await groupsAPI.requestToJoin(groupId);
        // Success - the optimistic update is already in place
        return true;
      } catch (err: any) {
        // Rollback optimistic update on failure
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId ? { ...g, joinStatus: 'NONE' as const } : g
          )
        );

        console.error('requestToJoin error:', err);
        return false;
      } finally {
        pendingRequests.current.delete(groupId);
      }
    },
    []
  );

  useEffect(() => {
    fetchGroups(selectedDestination);
  }, [selectedDestination, fetchGroups]);

  return {
    groups,
    destinations,
    selectedDestination,
    setSelectedDestination,
    stats,
    isLoading,
    error,
    requestToJoin,
    fetchGroups,
    refetch: () => fetchGroups(selectedDestination),
  };
}
