const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

// Track typing status per socket for cleanup on disconnect
// Map<socketId, Map<conversationId, boolean>>
const socketTypingStatus = new Map();

// Track presence per group
// Map<groupId, Map<userId, Set<socketId>>>
const groupPresence = new Map();
// Map<socketId, Set<groupId>>
const socketPresenceGroups = new Map();

const normalizeId = (value) => String(value ?? '');

const getOnlineUserIds = (groupId) => {
  const groupMap = groupPresence.get(groupId);
  if (!groupMap) return [];
  return Array.from(groupMap.keys());
};

const emitPresenceUpdate = (io, groupId) => {
  const onlineUserIds = getOnlineUserIds(groupId);
  io.to(`group:${groupId}`).emit('presence:update', {
    groupId,
    onlineUserIds,
    onlineCount: onlineUserIds.length,
  });
};

/**
 * Socket.IO event handlers setup
 */
const setupSocketHandlers = (io) => {
  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.info(`User connected: ${userId}`);

    // Initialize typing status tracking for this socket
    socketTypingStatus.set(socket.id, new Map());
    socketPresenceGroups.set(socket.id, new Set());

    // Join user's personal room for private notifications
    socket.join(`user:${userId}`);

    // Handle joining conversation rooms
    socket.on('join:conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      logger.debug(`User ${userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);

      // Clear typing status when leaving conversation
      const typingMap = socketTypingStatus.get(socket.id);
      if (typingMap && typingMap.get(conversationId)) {
        typingMap.delete(conversationId);
        socket.to(`conversation:${conversationId}`).emit('user:typing', {
          conversationId,
          userId,
          isTyping: false,
        });
      }

      logger.debug(`User ${userId} left conversation ${conversationId}`);
    });

    // Handle typing indicator - start
    socket.on('typing:start', (conversationId) => {
      // Track that this user is typing in this conversation
      const typingMap = socketTypingStatus.get(socket.id);
      if (typingMap) {
        typingMap.set(conversationId, true);
      }

      // Broadcast to other users in the conversation
      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        conversationId,
        userId,
        isTyping: true,
      });

      logger.debug(`User ${userId} started typing in ${conversationId}`);
    });

    // Handle typing indicator - stop
    socket.on('typing:stop', (conversationId) => {
      // Clear typing status for this conversation
      const typingMap = socketTypingStatus.get(socket.id);
      if (typingMap) {
        typingMap.delete(conversationId);
      }

      // Broadcast to other users in the conversation
      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        conversationId,
        userId,
        isTyping: false,
      });

      logger.debug(`User ${userId} stopped typing in ${conversationId}`);
    });

    // Presence: join group room
    socket.on('presence:join', (groupId) => {
      const groupKey = normalizeId(groupId);
      if (!groupKey) return;

      socket.join(`group:${groupKey}`);

      if (!groupPresence.has(groupKey)) {
        groupPresence.set(groupKey, new Map());
      }

      const groupMap = groupPresence.get(groupKey);
      if (!groupMap.has(userId)) {
        groupMap.set(userId, new Set());
      }
      groupMap.get(userId).add(socket.id);

      const socketGroups = socketPresenceGroups.get(socket.id);
      if (socketGroups) {
        socketGroups.add(groupKey);
      }

      emitPresenceUpdate(io, groupKey);
      logger.debug(`User ${userId} joined presence for group ${groupKey}`);
    });

    // Presence: leave group room
    socket.on('presence:leave', (groupId) => {
      const groupKey = normalizeId(groupId);
      if (!groupKey) return;

      socket.leave(`group:${groupKey}`);

      const groupMap = groupPresence.get(groupKey);
      if (groupMap && groupMap.has(userId)) {
        const sockets = groupMap.get(userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          groupMap.delete(userId);
        }
        if (groupMap.size === 0) {
          groupPresence.delete(groupKey);
        }
      }

      const socketGroups = socketPresenceGroups.get(socket.id);
      if (socketGroups) {
        socketGroups.delete(groupKey);
      }

      emitPresenceUpdate(io, groupKey);
      logger.debug(`User ${userId} left presence for group ${groupKey}`);
    });

    // Handle message read acknowledgment
    socket.on('message:read', async ({ conversationId, messageId }) => {
      socket.to(`conversation:${conversationId}`).emit('message:read', {
        conversationId,
        messageId,
        userId,
        readAt: new Date().toISOString(),
      });
    });

    // Handle disconnect - cleanup typing indicators
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);

      // Emit typing:stop for all conversations user was typing in
      const typingMap = socketTypingStatus.get(socket.id);
      if (typingMap) {
        typingMap.forEach((isTyping, conversationId) => {
          if (isTyping) {
            io.to(`conversation:${conversationId}`).emit('user:typing', {
              conversationId,
              userId,
              isTyping: false,
            });
            logger.debug(`Cleared typing status for user ${userId} in ${conversationId} on disconnect`);
          }
        });
        socketTypingStatus.delete(socket.id);
      }

      // Cleanup presence for this socket
      const socketGroups = socketPresenceGroups.get(socket.id);
      if (socketGroups) {
        socketGroups.forEach((groupKey) => {
          const groupMap = groupPresence.get(groupKey);
          if (groupMap && groupMap.has(userId)) {
            const sockets = groupMap.get(userId);
            sockets.delete(socket.id);
            if (sockets.size === 0) {
              groupMap.delete(userId);
            }
            if (groupMap.size === 0) {
              groupPresence.delete(groupKey);
            }
          }
          emitPresenceUpdate(io, groupKey);
        });
        socketPresenceGroups.delete(socket.id);
      }
    });
  });
};

/**
 * Emit event to a specific conversation
 */
const emitToConversation = (io, conversationId, event, data) => {
  io.to(`conversation:${conversationId}`).emit(event, data);
};

/**
 * Emit event to a specific user
 */
const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Socket events that can be emitted from services:
 *
 * message:new - New message in conversation
 * message:updated - Message was edited
 * message:deleted - Message was deleted
 * message:reaction - Reaction added/removed
 * message:read - Message read receipt
 *
 * conversation:updated - Conversation settings changed
 * conversation:participant:added - New participant joined
 * conversation:participant:removed - Participant left/removed
 *
 * user:typing - User typing indicator
 * user:online - User came online
 * user:offline - User went offline
 *
 * presence:update - Group presence update
 */

module.exports = {
  setupSocketHandlers,
  emitToConversation,
  emitToUser,
};
