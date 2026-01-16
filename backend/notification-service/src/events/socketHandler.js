// ==============================================================================
// WebSocket Handler for Real-time In-App Notifications
// ==============================================================================

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

class SocketHandler {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> Set of socket IDs
  }

  /**
   * Initialize Socket.io with the HTTP server
   */
  initialize(server) {
    const { Server } = require('socket.io');

    this.io = new Server(server, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        socket.userId = decoded.id;
        socket.user = decoded;
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error.message);
        next(new Error('Invalid token'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket) => this.handleConnection(socket));

    logger.info('WebSocket server initialized');
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    const userId = socket.userId;

    logger.info(`User ${userId} connected via WebSocket`, { socketId: socket.id });

    // Add socket to user's set
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Send initial unread count
    this.sendUnreadCount(userId);

    // Handle events
    socket.on('notification:read', (data) => this.handleNotificationRead(socket, data));
    socket.on('notification:readAll', () => this.handleReadAll(socket));
    socket.on('notification:subscribe', (data) => this.handleSubscribe(socket, data));
    socket.on('notification:unsubscribe', (data) => this.handleUnsubscribe(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  /**
   * Handle socket disconnection
   */
  handleDisconnect(socket) {
    const userId = socket.userId;

    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(socket.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }

    logger.debug(`User ${userId} disconnected`, { socketId: socket.id });
  }

  /**
   * Handle notification read event
   */
  async handleNotificationRead(socket, data) {
    try {
      const { notificationId } = data;
      await notificationService.markAsRead(notificationId, socket.userId);
      await this.sendUnreadCount(socket.userId);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  }

  /**
   * Handle mark all as read
   */
  async handleReadAll(socket) {
    try {
      await notificationService.markAllAsRead(socket.userId);
      await this.sendUnreadCount(socket.userId);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Handle topic subscription (e.g., group notifications)
   */
  handleSubscribe(socket, data) {
    const { topic } = data;
    if (topic) {
      socket.join(topic);
      logger.debug(`User ${socket.userId} subscribed to ${topic}`);
    }
  }

  /**
   * Handle topic unsubscription
   */
  handleUnsubscribe(socket, data) {
    const { topic } = data;
    if (topic) {
      socket.leave(topic);
      logger.debug(`User ${socket.userId} unsubscribed from ${topic}`);
    }
  }

  /**
   * Send unread notification count to user
   */
  async sendUnreadCount(userId) {
    try {
      const count = await notificationService.getUnreadCount(userId);
      this.emitToUser(userId, 'notification:unreadCount', { count });
    } catch (error) {
      logger.error('Error sending unread count:', error);
    }
  }

  /**
   * Emit event to a specific user (all their connected devices)
   */
  emitToUser(userId, event, data) {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emit event to multiple users
   */
  emitToUsers(userIds, event, data) {
    for (const userId of userIds) {
      this.emitToUser(userId, event, data);
    }
  }

  /**
   * Emit event to a topic/room
   */
  emitToTopic(topic, event, data) {
    this.io?.to(topic).emit(event, data);
  }

  /**
   * Send a real-time notification to a user
   */
  async sendNotification(notification) {
    if (!this.io) return;

    const { userId, title, body, type, actionUrl, data } = notification;

    // Emit to user's room
    this.emitToUser(userId, 'notification:new', {
      id: notification.id,
      title,
      body,
      type,
      actionUrl,
      data,
      createdAt: notification.createdAt || new Date(),
    });

    // Update unread count
    await this.sendUnreadCount(userId);
  }

  /**
   * Broadcast a notification to multiple users
   */
  async broadcastNotification(userIds, notification) {
    for (const userId of userIds) {
      await this.sendNotification({ ...notification, userId });
    }
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId) {
    return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
  }

  /**
   * Get online user IDs
   */
  getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Get connection count for a user
   */
  getUserConnectionCount(userId) {
    return this.userSockets.get(userId)?.size || 0;
  }
}

module.exports = new SocketHandler();
