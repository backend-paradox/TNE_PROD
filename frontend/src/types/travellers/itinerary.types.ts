export type ItineraryCategory =
  | 'TRANSPORT'
  | 'ACCOMMODATION'
  | 'ACTIVITY'
  | 'FOOD'
  | 'SIGHTSEEING'
  | 'FREE_TIME'
  | 'OTHER';

export interface ItineraryActivity {
  id: string;
  title: string;
  location: string;
  time: string;
  duration: string;
  category: ItineraryCategory;
  cost: number;
  notes?: string;
  image?: string;
}

export interface ItineraryDay {
  date: string;
  dayNumber: number;
  activities: ItineraryActivity[];
}
