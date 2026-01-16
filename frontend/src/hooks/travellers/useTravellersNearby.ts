import { useState, useCallback, useEffect } from 'react';
import { travellersAPI, type NearbyTraveller, type TravellersNearbyStats } from '@/features/travellers/travellersAPI';
import { normalizeDestination } from '@/utils/travellers';

export function useTravellersNearby(manualSearch = false, startDate?: string, endDate?: string) {
  const [travellers, setTravellers] = useState<NearbyTraveller[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [stats, setStats] = useState<TravellersNearbyStats>({
    total: 0,
    destinations: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch travelers nearby (with optional destination filter)
  const fetchTravellers = useCallback(async (destination?: string, manual?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const destinationParam = destination && destination !== 'all' ? destination : undefined;
      const feed = !destinationParam && !manual;
      const response = await travellersAPI.getTravellersNearby(
        destinationParam,
        manual,
        startDate,
        endDate,
        feed
      );

      setTravellers(response.travellers);
      setStats(response.stats);

      // Extract unique destinations from the response stats
      if (response.stats.destinations && response.stats.destinations.length > 0) {
        const cleaned = response.stats.destinations
          .map((dest) => normalizeDestination(dest))
          .filter(Boolean);
        setDestinations(cleaned);
      }
    } catch (err) {
      setError('Failed to fetch nearby travellers');
      console.error('fetchTravellers error:', err);
      // Don't clear travellers on error - keep showing previous data
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // Send connection request
  const sendConnection = useCallback(async (userId: number): Promise<boolean> => {
    try {
      const response = await travellersAPI.sendConnectionRequest(userId);
      const connectionId = response?.id ?? null;
      // Optimistic update - no need to refetch
      setTravellers((prev) =>
        prev.map((traveller) =>
          traveller.userId === userId
            ? { ...traveller, connectionStatus: 'PENDING' as const, connectionId }
            : traveller
        )
      );
      return true;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        // Already connected - update state to reflect this
        setTravellers((prev) =>
          prev.map((traveller) =>
            traveller.userId === userId
              ? { ...traveller, connectionStatus: 'PENDING' as const }
              : traveller
          )
        );
        return true;
      }
      console.error('Failed to send connection:', err);
      return false;
    }
  }, []);

  const cancelConnection = useCallback(async (userId: number, connectionId?: number | string | null): Promise<boolean> => {
    if (!connectionId) {
      return false;
    }

    try {
      await travellersAPI.cancelConnectionRequest(String(connectionId));
      // Optimistic update - no need to refetch
      setTravellers((prev) =>
        prev.map((traveller) =>
          traveller.userId === userId
            ? { ...traveller, connectionStatus: 'NONE' as const, connectionId: null }
            : traveller
        )
      );
      return true;
    } catch (err) {
      console.error('Failed to cancel connection request:', err);
      return false;
    }
  }, []);

  // Fetch travelers when destination changes (and on mount)
  useEffect(() => {
    fetchTravellers(selectedDestination, manualSearch);
  }, [selectedDestination, manualSearch, fetchTravellers]);

  return {
    travellers,
    destinations,
    selectedDestination,
    setSelectedDestination,
    stats,
    isLoading,
    error,
    fetchTravellers,
    sendConnection,
    cancelConnection,
    refetch: () => fetchTravellers(selectedDestination, manualSearch),
  };
}
