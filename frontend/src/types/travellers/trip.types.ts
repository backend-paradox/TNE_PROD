export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  memberCount: number;
  coverImage?: string;
  inviteCode?: string;
}

export interface TripFormData {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
}
