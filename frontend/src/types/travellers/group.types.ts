export interface Group {
  id: string;
  name: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  manualStartDate?: string;
  manualEndDate?: string;
  status?: 'PLANNING' | 'ON_TOUR' | 'COMPLETED';
  calculatedStatus?: 'PLANNING' | 'ON_TOUR' | 'COMPLETED';
  memberCount: number;
  coverImage?: string;
  imageUrl?: string;
  inviteCode: string;
  createdBy: string;
  // Additional fields from backend
  budget?: number;
  currency?: string;
  maxMembers?: number;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  myRole?: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  rsvpStatus?: string;
  joinedAt?: string;
  isMember?: boolean;
  _count?: {
    members?: number;
  };
}

export interface InviteMember {
  id: string;
  userId?: number;
  name?: string;
  email?: string;
  avatar?: string;
  profilePicUrl?: string;
  gender?: string;
  role?: string;
  joinedAt?: string;
  status?: 'pending' | 'accepted' | 'declined';
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  type: 'destination' | 'activity' | 'date' | 'other';
  createdBy: string;
  createdByName: string;
  createdByAvatar: string;
  votes: {
    yes: string[];
    no: string[];
  };
  status: 'open' | 'approved' | 'rejected';
  deadline?: string;
}

export interface ProposalFormData {
  title: string;
  description: string;
  type: 'destination' | 'activity' | 'date' | 'other';
  deadline?: string;
}

// Poll types (matching backend)
export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
  hasVoted?: boolean;
}

export interface Poll {
  id: string;
  groupId: string;
  question: string;
  description?: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'DATE_POLL';
  isAnonymous: boolean;
  endsAt?: string;
  isClosed: boolean;
  createdBy: number;
  options: PollOption[];
  totalVotes: number;
  myVotes?: string[];
  isExpired?: boolean;
}

export interface CreatePollData {
  question: string;
  type?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'DATE_POLL';
  options: string[];
  isAnonymous?: boolean;
  endsAt?: string;
}
