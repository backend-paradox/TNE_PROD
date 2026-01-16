import { useState, useCallback } from 'react';
import type { Trip, TripFormData } from '@/types/travellers';

/**
 * Hook for managing trips
 */
export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await tripsApi.getTrips();
      // setTrips(response.data);
    } catch (err) {
      setError('Failed to fetch trips');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTrip = useCallback(async (tripData: TripFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await tripsApi.createTrip(tripData);
      // setTrips((prev) => [...prev, response.data]);
      // return response.data;
    } catch (err) {
      setError('Failed to create trip');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTrip = useCallback(async (tripId: string, tripData: Partial<TripFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await tripsApi.updateTrip(tripId, tripData);
      // setTrips((prev) => prev.map((t) => (t.id === tripId ? response.data : t)));
    } catch (err) {
      setError('Failed to update trip');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTrip = useCallback(async (tripId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // await tripsApi.deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err) {
      setError('Failed to delete trip');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    trips,
    isLoading,
    error,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
  };
}
