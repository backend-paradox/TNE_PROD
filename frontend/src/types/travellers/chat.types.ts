export interface ChatMessage {
  id: string;
  senderId?: string | number;
  sender: string;
  senderAvatar: string;
  content?: string;
  type: 'text' | 'image' | 'voice' | 'location' | 'poll';
  timestamp: string;
  createdAt?: string; // Raw ISO date for date grouping
  isOwn?: boolean;
  reactions?: MessageReaction[];
  replyTo?: {
    sender: string;
    content: string;
  };
  status?: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  audioUrl?: string;
  voiceDuration?: number;
  voiceData?: {
    duration: string;
    waveform: number[];
  };
  locationData?: {
    name: string;
    address: string;
    mapPreview?: string;
  };
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface GroupMember {
  id: string;
  userId?: number;
  name: string;
  avatar: string;
  online: boolean;
  gender?: string;
  isAdmin?: boolean;
  role?: string;
  lastSeen?: string;
}
