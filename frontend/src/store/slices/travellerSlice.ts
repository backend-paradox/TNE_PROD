import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  TravellerProfile,
  SocialVibeScore,
  Activity,
  ActivityFeedItem,
  Goal,
  Statistics,
  Notification,
  TravelInsights,
} from '@/types/travellers';

interface TravellerState {
  currentUser: TravellerProfile | null;
  socialVibeScore: SocialVibeScore;
  upcomingActivities: Activity[];
  recentActivityFeed: ActivityFeedItem[];
  weeklyGoals: Goal[];
  statistics: Statistics;
  notifications: Notification[];
  travelInsights: TravelInsights;
  isSidebarOpen: boolean;
}

const emptySocialVibe: SocialVibeScore = {
  score: 0,
  maxScore: 0,
  badge: '',
  percentile: '',
  rank: '',
};

const emptyStats: Statistics = {
  socialVibe: 0,
  connections: 0,
};

const emptyInsights: TravelInsights = {
  tripProgress: 0,
  dailyBudget: '',
  socialScore: '',
};

const initialState: TravellerState = {
  currentUser: null,
  socialVibeScore: emptySocialVibe,
  upcomingActivities: [],
  recentActivityFeed: [],
  weeklyGoals: [],
  statistics: emptyStats,
  notifications: [],
  travelInsights: emptyInsights,
  isSidebarOpen: false,
};

const travellerSlice = createSlice({
  name: 'traveller',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.map((notification) =>
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
    },
  },
});

export const { toggleSidebar, markNotificationRead } = travellerSlice.actions;
export default travellerSlice.reducer;
