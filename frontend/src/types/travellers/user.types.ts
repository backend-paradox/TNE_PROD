export interface TravellerProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currentLocation: string;
  currentTrip: {
    destination: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
  } | null;
  groupSize: number;
  totalSpent: number;
}

export interface SocialVibeScore {
  score: number;
  maxScore: number;
  badge: string;
  percentile: string;
  rank: string;
}

export interface Statistics {
  socialVibe: number;
  connections: number;
}

export interface TravelInsights {
  tripProgress: number;
  dailyBudget: string;
  socialScore: string;
}
