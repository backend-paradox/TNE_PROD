import {
  Utensils,
  Camera,
  Car,
  Bed,
  ShoppingBag,
  Landmark,
  PartyPopper,
  CreditCard,
  Plane,
} from 'lucide-react';

export const EXPENSE_CATEGORIES = {
  food: { label: 'Food & Dining', icon: Utensils, color: '#f97316' },
  transport: { label: 'Transport', icon: Car, color: '#3b82f6' },
  accommodation: { label: 'Accommodation', icon: Bed, color: '#ec4899' },
  activities: { label: 'Activities', icon: Landmark, color: '#f59e0b' },
  shopping: { label: 'Shopping', icon: ShoppingBag, color: '#10b981' },
  other: { label: 'Other', icon: CreditCard, color: '#6b7280' },
} as const;

export const ITINERARY_CATEGORIES = {
  FOOD: { label: 'Food', icon: Utensils, color: '#f97316' },
  SIGHTSEEING: { label: 'Sightseeing', icon: Camera, color: '#8b5cf6' },
  TRANSPORT: { label: 'Transport', icon: Car, color: '#3b82f6' },
  ACCOMMODATION: { label: 'Accommodation', icon: Bed, color: '#ec4899' },
  SHOPPING: { label: 'Shopping', icon: ShoppingBag, color: '#10b981' },
  ACTIVITY: { label: 'Activity', icon: Landmark, color: '#f59e0b' },
  FREE_TIME: { label: 'Free Time', icon: PartyPopper, color: '#ef4444' },
  OTHER: { label: 'Other', icon: CreditCard, color: '#6b7280' },
} as const;

export const ACTIVITY_TYPES = {
  Meetup: { label: 'Meetup', color: '#8b5cf6' },
  Activity: { label: 'Activity', color: '#f59e0b' },
  Vote: { label: 'Vote', color: '#3b82f6' },
} as const;
