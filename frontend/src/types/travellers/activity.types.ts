export interface Activity {
  id: string;
  type: 'Meetup' | 'Activity' | 'Vote';
  title: string;
  time: string;
  date: string;
  peopleCount: number;
  details: string;
  participants: { id: string; name: string; avatar: string }[];
  location?: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  actionType: 'joined' | 'posted' | 'liked' | 'commented' | 'connection';
  timestamp: string;
  relativeTime: string;
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
  unit: string;
  color: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}
