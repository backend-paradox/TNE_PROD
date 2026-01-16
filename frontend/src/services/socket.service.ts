import { io, Socket } from 'socket.io-client';

const CHAT_SERVICE_URL = (import.meta as any).env?.VITE_CHAT_SERVICE_URL || 'http://localhost:3008';

interface TypingEventData {
  conversationId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  isTyping: boolean;
}

interface NewMessageEventData {
  conversationId: string;
  message: any;
}

interface PresenceUpdateEventData {
  groupId: string;
  onlineUserIds: Array<string | number>;
  onlineCount: number;
}

class SocketService {
  private socket: Socket | null = null;
  private activeConversations: Set<string> = new Set();
  private activeGroups: Set<string> = new Set();

  /**
   * Connect to the chat service with JWT token
   */
  connect(token: string): Socket {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(CHAT_SERVICE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[Socket.IO] Connected to chat service');
      // Rejoin active conversations on reconnect
      this.activeConversations.forEach((conversationId) => {
        this.socket?.emit('join:conversation', conversationId);
      });
      // Rejoin active groups for presence
      this.activeGroups.forEach((groupId) => {
        this.socket?.emit('presence:join', groupId);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket.IO] Connection error:', error.message);
    });

    return this.socket;
  }

  /**
   * Disconnect from the chat service
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.activeConversations.clear();
      this.activeGroups.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.socket) {
      console.warn('[Socket.IO] Not connected, cannot join conversation');
      return;
    }
    this.socket.emit('join:conversation', conversationId);
    this.activeConversations.add(conversationId);
    console.log('[Socket.IO] Joined conversation:', conversationId);
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit('leave:conversation', conversationId);
    this.activeConversations.delete(conversationId);
    console.log('[Socket.IO] Left conversation:', conversationId);
  }

  /**
   * Join a group presence room
   */
  joinPresence(groupId: string): void {
    if (!this.socket) {
      console.warn('[Socket.IO] Not connected, cannot join presence');
      return;
    }
    this.socket.emit('presence:join', groupId);
    this.activeGroups.add(groupId);
    console.log('[Socket.IO] Joined presence for group:', groupId);
  }

  /**
   * Leave a group presence room
   */
  leavePresence(groupId: string): void {
    if (!this.socket) return;
    this.socket.emit('presence:leave', groupId);
    this.activeGroups.delete(groupId);
    console.log('[Socket.IO] Left presence for group:', groupId);
  }

  /**
   * Emit typing start event
   */
  emitTypingStart(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit('typing:start', conversationId);
  }

  /**
   * Emit typing stop event
   */
  emitTypingStop(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit('typing:stop', conversationId);
  }

  /**
   * Listen for user typing events
   */
  onUserTyping(callback: (data: TypingEventData) => void): void {
    if (!this.socket) return;
    this.socket.on('user:typing', callback);
  }

  /**
   * Remove user typing listener
   */
  offUserTyping(callback?: (data: TypingEventData) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('user:typing', callback);
    } else {
      this.socket.off('user:typing');
    }
  }

  /**
   * Listen for new message events
   */
  onNewMessage(callback: (data: NewMessageEventData) => void): void {
    if (!this.socket) return;
    this.socket.on('message:new', callback);
  }

  /**
   * Remove new message listener
   */
  offNewMessage(callback?: (data: NewMessageEventData) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('message:new', callback);
    } else {
      this.socket.off('message:new');
    }
  }

  /**
   * Listen for presence updates
   */
  onPresenceUpdate(callback: (data: PresenceUpdateEventData) => void): void {
    if (!this.socket) return;
    this.socket.on('presence:update', callback);
  }

  /**
   * Remove presence update listener
   */
  offPresenceUpdate(callback?: (data: PresenceUpdateEventData) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('presence:update', callback);
    } else {
      this.socket.off('presence:update');
    }
  }

  /**
   * Get the socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();
