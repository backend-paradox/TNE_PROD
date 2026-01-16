import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ItineraryDay, ItineraryActivity } from '@/types/travellers';
import { itineraryAPI, type ItineraryItem, type ItineraryFormData } from '@/features/travellers/travellersAPI';

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeDateKey = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return formatDateKey(parsed);
};

const buildDateRange = (start?: string, end?: string) => {
  if (!start || !end) return [] as string[];
  const startParsed = new Date(start);
  const endParsed = new Date(end);
  if (Number.isNaN(startParsed.getTime()) || Number.isNaN(endParsed.getTime())) {
    return [];
  }

  const cursor = new Date(startParsed.getFullYear(), startParsed.getMonth(), startParsed.getDate());
  const endCursor = new Date(endParsed.getFullYear(), endParsed.getMonth(), endParsed.getDate());
  const range: string[] = [];
  const maxDays = 366;

  while (cursor <= endCursor && range.length < maxDays) {
    range.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return range;
};

const formatTimeForDisplay = (timeValue?: string) => {
  if (!timeValue) return '';
  if (/am|pm/i.test(timeValue)) return timeValue;
  const match = timeValue.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeValue;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${period}`;
};

const formatDurationLabel = (durationValue?: number) => {
  if (!durationValue || durationValue <= 0) return '';
  const hours = Math.floor(durationValue / 60);
  const minutes = durationValue % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours} hour${hours === 1 ? '' : 's'}`;
  return `${minutes} min${minutes === 1 ? '' : 's'}`;
};

const to24HourTime = (timeValue?: string) => {
  if (!timeValue) return undefined;
  // Already in HH:mm format
  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)) {
    return timeValue;
  }
  const match = timeValue.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return undefined;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const toMinutes = (durationValue?: string | number) => {
  if (durationValue === undefined || durationValue === null) return undefined;
  if (typeof durationValue === 'number') return durationValue;
  const lower = durationValue.toLowerCase();
  if (lower.includes('full')) return 480; // Default full day to 8 hours
  const hourMatch = lower.match(/(\d+(\.\d+)?)\s*hour/);
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 60);
  }
  const minMatch = lower.match(/(\d+)\s*min/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }
  return undefined;
};

/**
 * Hook for managing itinerary
 */
export function useItinerary(tripId?: string, startDate?: string, endDate?: string) {
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDay = useMemo(() => days[selectedDay] || null, [days, selectedDay]);

  const totalActivities = useMemo(
    () => days.reduce((sum, day) => sum + day.activities.length, 0),
    [days]
  );

  const totalCost = useMemo(
    () => days.reduce((sum, day) => sum + day.activities.reduce((daySum, act) => daySum + act.cost, 0), 0),
    [days]
  );

  const fetchItinerary = useCallback(async () => {
    if (!tripId) return;
    setIsLoading(true);
    setError(null);
    try {
      const items = await itineraryAPI.getItinerary(tripId);
      // Transform itinerary items into days structure
      // Group by date and organize into ItineraryDay format
      const dayMap = new Map<string, ItineraryItem[]>();
      items.forEach(item => {
        const dateKey = normalizeDateKey(item.date);
        if (!dayMap.has(dateKey)) {
          dayMap.set(dateKey, []);
        }
        dayMap.get(dateKey)!.push(item);
      });

      const baseDays = buildDateRange(startDate, endDate);
      let dayEntries: Array<[string, ItineraryItem[]]>;
      if (baseDays.length > 0) {
        const baseSet = new Set(baseDays);
        const extraDays = Array.from(dayMap.keys())
          .filter((key) => !baseSet.has(key))
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        dayEntries = [...baseDays, ...extraDays].map((date) => [date, dayMap.get(date) || []]);
      } else {
        dayEntries = Array.from(dayMap.entries()).sort(
          ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
        );
      }

      const transformedDays: ItineraryDay[] = dayEntries.map(([date, dayItems], index) => ({
        dayNumber: index + 1,
        date,
        activities: dayItems
          .slice()
          .sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || '')))
          .map(item => ({
            id: item.id,
            title: item.title,
            time: formatTimeForDisplay(item.startTime),
            duration: formatDurationLabel(item.duration),
            location: item.location || item.address || '',
            notes: item.description || '',
            cost: item.estimatedCost || item.actualCost || 0,
            category: item.category,
          })),
      }));

      setDays(transformedDays);
    } catch (err) {
      setError('Failed to fetch itinerary');
      console.error('fetchItinerary error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tripId, startDate, endDate]);

  useEffect(() => {
    if (days.length > 0) return;
    const baseDays = buildDateRange(startDate, endDate);
    if (baseDays.length === 0) return;
    setDays(
      baseDays.map((date, index) => ({
        dayNumber: index + 1,
        date,
        activities: [],
      }))
    );
  }, [days.length, startDate, endDate]);

  useEffect(() => {
    if (selectedDay >= days.length && days.length > 0) {
      setSelectedDay(0);
    }
  }, [days.length, selectedDay]);

  const addActivity = useCallback(async (dayIndex: number, activity: Omit<ItineraryActivity, 'id'>) => {
    if (!tripId) return;

    setIsLoading(true);
    try {
      const currentDayData = days[dayIndex];
      if (!currentDayData) {
        setError('Invalid day selection');
        return;
      }
      const formData: ItineraryFormData = {
        title: activity.title,
        description: activity.notes,
        location: activity.location,
        date: currentDayData.date,
        startTime: to24HourTime(activity.time),
        duration: toMinutes(activity.duration),
        category: activity.category as any,
        estimatedCost: activity.cost,
      };

      const newItem = await itineraryAPI.createItineraryItem(tripId, formData);

      // Update local state
      const newActivity: ItineraryActivity = {
        id: newItem.id,
        title: newItem.title,
        time: formatTimeForDisplay(newItem.startTime),
        duration: formatDurationLabel(newItem.duration),
        location: newItem.location || newItem.address || '',
        notes: newItem.description || '',
        cost: newItem.estimatedCost || 0,
        category: newItem.category,
      };

      setDays((prev) => {
        const updated = [...prev];
        updated[dayIndex] = {
          ...updated[dayIndex],
          activities: [...updated[dayIndex].activities, newActivity],
        };
        return updated;
      });
    } catch (err) {
      setError('Failed to add activity');
      console.error('addActivity error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tripId, days]);

  const updateActivity = useCallback(
    async (dayIndex: number, activityId: string, updates: Partial<ItineraryActivity>) => {
      if (!tripId) return;

      setIsLoading(true);
      try {
        if (!days[dayIndex]) {
          setError('Invalid day selection');
          return;
        }
        const formData: Partial<ItineraryFormData> = {
          ...(updates.title && { title: updates.title }),
          ...(updates.notes && { description: updates.notes }),
          ...(updates.location && { location: updates.location }),
          ...(updates.time && { startTime: to24HourTime(updates.time) }),
          ...(updates.duration !== undefined && { duration: toMinutes(updates.duration) }),
          ...(updates.category && { category: updates.category as any }),
          ...(updates.cost !== undefined && { estimatedCost: updates.cost }),
        };

        await itineraryAPI.updateItineraryItem(tripId, activityId, formData);

        // Update local state
        setDays((prev) => {
          const updated = [...prev];
          updated[dayIndex] = {
            ...updated[dayIndex],
            activities: updated[dayIndex].activities.map((act) =>
              act.id === activityId ? { ...act, ...updates } : act
            ),
          };
          return updated;
        });
      } catch (err) {
        setError('Failed to update activity');
        console.error('updateActivity error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [tripId]
  );

  const deleteActivity = useCallback(async (dayIndex: number, activityId: string) => {
    if (!tripId) return;

    setIsLoading(true);
    try {
      await itineraryAPI.deleteItineraryItem(tripId, activityId);

      // Update local state
      setDays((prev) => {
        if (!prev[dayIndex]) return prev;
        const updated = [...prev];
        updated[dayIndex] = {
          ...updated[dayIndex],
          activities: updated[dayIndex].activities.filter((a) => a.id !== activityId),
        };
        return updated;
      });
    } catch (err) {
      setError('Failed to delete activity');
      console.error('deleteActivity error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  const reorderActivities = useCallback(
    (dayIndex: number, startIndex: number, endIndex: number) => {
      setDays((prev) => {
        if (!prev[dayIndex]) return prev;
        const updated = [...prev];
        const activities = [...updated[dayIndex].activities];
        const [removed] = activities.splice(startIndex, 1);
        activities.splice(endIndex, 0, removed);
        updated[dayIndex] = {
          ...updated[dayIndex],
          activities,
        };
        return updated;
      });
    },
    []
  );

  const goToNextDay = useCallback(() => {
    setSelectedDay((prev) => Math.min(prev + 1, days.length - 1));
  }, [days.length]);

  const goToPreviousDay = useCallback(() => {
    setSelectedDay((prev) => Math.max(prev - 1, 0));
  }, []);

  return {
    days,
    currentDay,
    selectedDay,
    totalActivities,
    totalCost,
    isLoading,
    error,
    setSelectedDay,
    fetchItinerary,
    addActivity,
    updateActivity,
    deleteActivity,
    reorderActivities,
    goToNextDay,
    goToPreviousDay,
  };
}
