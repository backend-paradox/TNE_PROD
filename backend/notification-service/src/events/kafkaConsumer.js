// ==============================================================================
// Kafka Event Consumer
// ==============================================================================

const { Kafka } = require('kafkajs');
const config = require('../config/env');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

class KafkaConsumer {
  constructor() {
    this.kafka = null;
    this.consumer = null;
    this.isConnected = false;
  }

  /**
   * Initialize Kafka consumer
   */
  async initialize() {
    if (!config.kafka.enabled) {
      logger.info('Kafka disabled - skipping consumer initialization');
      return;
    }

    try {
      this.kafka = new Kafka({
        clientId: config.kafka.clientId,
        brokers: config.kafka.brokers,
        retry: {
          initialRetryTime: 100,
          retries: 8,
        },
      });

      this.consumer = this.kafka.consumer({
        groupId: config.kafka.consumerGroup,
      });

      await this.consumer.connect();
      this.isConnected = true;
      logger.info('Kafka consumer connected');

      // Subscribe to topics
      await this.subscribeToTopics();

      // Start consuming
      await this.startConsuming();
    } catch (error) {
      logger.error('Failed to initialize Kafka consumer:', error);
      throw error;
    }
  }

  /**
   * Subscribe to notification-related topics
   */
  async subscribeToTopics() {
    const topics = [
      'user.events',
      'booking.events',
      'payment.events',
      'group.events',
      'chat.events',
    ];

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
      logger.info(`Subscribed to topic: ${topic}`);
    }
  }

  /**
   * Start consuming messages
   */
  async startConsuming() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          logger.debug(`Received event from ${topic}:`, { eventType: event.type });

          await this.handleEvent(topic, event);
        } catch (error) {
          logger.error(`Error processing Kafka message:`, error);
        }
      },
    });
  }

  /**
   * Handle incoming events
   */
  async handleEvent(topic, event) {
    const { type, data, userId, metadata } = event;

    const handlers = {
      // User Events
      'user.events': {
        'user.registered': () => this.handleUserRegistered(data),
        'user.email_verified': () => this.handleEmailVerified(data),
        'user.password_reset_requested': () => this.handlePasswordReset(data),
        'user.login_from_new_device': () => this.handleNewDeviceLogin(data),
      },

      // Booking Events
      'booking.events': {
        'booking.created': () => this.handleBookingCreated(data),
        'booking.confirmed': () => this.handleBookingConfirmed(data),
        'booking.cancelled': () => this.handleBookingCancelled(data),
        'booking.reminder': () => this.handleBookingReminder(data),
      },

      // Payment Events
      'payment.events': {
        'payment.success': () => this.handlePaymentSuccess(data),
        'payment.failed': () => this.handlePaymentFailed(data),
        'refund.processed': () => this.handleRefundProcessed(data),
      },

      // Group Events
      'group.events': {
        'group.created': () => this.handleGroupCreated(data),
        'group.invitation_sent': () => this.handleGroupInvitation(data),
        'group.member_joined': () => this.handleMemberJoined(data),
        'group.member_left': () => this.handleMemberLeft(data),
        'group.itinerary_updated': () => this.handleItineraryUpdated(data),
        'group.expense_added': () => this.handleExpenseAdded(data),
        'group.poll_created': () => this.handlePollCreated(data),
        'group.poll_ended': () => this.handlePollEnded(data),
      },

      // Chat Events
      'chat.events': {
        'chat.new_message': () => this.handleNewMessage(data),
        'chat.mention': () => this.handleMention(data),
      },
    };

    const topicHandlers = handlers[topic];
    if (topicHandlers && topicHandlers[type]) {
      await topicHandlers[type]();
    } else {
      logger.debug(`No handler for event ${type} on topic ${topic}`);
    }
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  async handleUserRegistered(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'WELCOME',
      channels: ['EMAIL', 'IN_APP'],
      title: 'Welcome to Trip & Event!',
      body: 'Start exploring amazing destinations.',
      data: {
        name: data.name,
        email: data.email,
        appUrl: config.corsOrigin,
      },
    });
  }

  async handleEmailVerified(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'SYSTEM_ANNOUNCEMENT',
      channels: ['IN_APP'],
      title: 'Email Verified',
      body: 'Your email has been verified successfully!',
      data,
    });
  }

  async handlePasswordReset(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'PASSWORD_RESET',
      channels: ['EMAIL'],
      title: 'Reset Your Password',
      body: 'Click the link to reset your password.',
      data: {
        name: data.name,
        email: data.email,
        resetUrl: data.resetUrl,
      },
    });
  }

  async handleNewDeviceLogin(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'LOGIN_ALERT',
      channels: ['EMAIL', 'PUSH'],
      title: 'New Login Detected',
      body: `New login from ${data.deviceName || 'unknown device'}`,
      data,
    });
  }

  async handleBookingCreated(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'BOOKING_CONFIRMED',
      channels: ['EMAIL', 'PUSH', 'IN_APP'],
      priority: 'HIGH',
      title: 'Booking Created',
      body: `Your booking ${data.bookingNumber} has been created.`,
      data,
      externalId: data.bookingId,
    });
  }

  async handleBookingConfirmed(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'BOOKING_CONFIRMED',
      channels: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'],
      priority: 'HIGH',
      title: 'Booking Confirmed!',
      body: `Your booking ${data.bookingNumber} is confirmed.`,
      data,
      externalId: data.bookingId,
    });
  }

  async handleBookingCancelled(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'BOOKING_CANCELLED',
      channels: ['EMAIL', 'PUSH', 'IN_APP'],
      title: 'Booking Cancelled',
      body: `Your booking ${data.bookingNumber} has been cancelled.`,
      data,
      externalId: data.bookingId,
    });
  }

  async handleBookingReminder(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'BOOKING_REMINDER',
      channels: ['EMAIL', 'PUSH', 'IN_APP'],
      title: 'Trip Reminder',
      body: `Your trip to ${data.destination} is coming up!`,
      data,
    });
  }

  async handlePaymentSuccess(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'PAYMENT_SUCCESS',
      channels: ['EMAIL', 'PUSH', 'IN_APP'],
      priority: 'HIGH',
      title: 'Payment Successful',
      body: `Payment of ${data.amount} received.`,
      data,
    });
  }

  async handlePaymentFailed(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'PAYMENT_FAILED',
      channels: ['EMAIL', 'PUSH', 'IN_APP'],
      priority: 'URGENT',
      title: 'Payment Failed',
      body: `Your payment of ${data.amount} could not be processed.`,
      data,
    });
  }

  async handleRefundProcessed(data) {
    await notificationService.send({
      userId: data.userId,
      type: 'REFUND_PROCESSED',
      channels: ['EMAIL', 'PUSH', 'IN_APP'],
      title: 'Refund Processed',
      body: `Your refund of ${data.amount} has been processed.`,
      data,
    });
  }

  async handleGroupCreated(data) {
    await notificationService.send({
      userId: data.creatorId,
      type: 'SYSTEM_ANNOUNCEMENT',
      channels: ['IN_APP'],
      title: 'Trip Created',
      body: `Your trip "${data.groupName}" has been created!`,
      data,
    });
  }

  async handleGroupInvitation(data) {
    await notificationService.send({
      userId: data.invitedUserId,
      type: 'GROUP_INVITATION',
      channels: ['EMAIL', 'PUSH', 'IN_APP'],
      title: 'Trip Invitation',
      body: `${data.inviterName} invited you to join "${data.groupName}"`,
      data,
      actionUrl: `/travellers/invites/${data.invitationId}`,
    });
  }

  async handleMemberJoined(data) {
    // Notify all existing members
    for (const memberId of data.memberIds) {
      if (memberId !== data.joinedUserId) {
        await notificationService.send({
          userId: memberId,
          type: 'MEMBER_JOINED',
          channels: ['PUSH', 'IN_APP'],
          title: 'New Member',
          body: `${data.joinedUserName} joined "${data.groupName}"`,
          data,
        });
      }
    }
  }

  async handleMemberLeft(data) {
    // Notify all remaining members
    for (const memberId of data.memberIds) {
      await notificationService.send({
        userId: memberId,
        type: 'MEMBER_LEFT',
        channels: ['IN_APP'],
        title: 'Member Left',
        body: `${data.leftUserName} left "${data.groupName}"`,
        data,
      });
    }
  }

  async handleItineraryUpdated(data) {
    for (const memberId of data.memberIds) {
      await notificationService.send({
        userId: memberId,
        type: 'ITINERARY_UPDATED',
        channels: ['PUSH', 'IN_APP'],
        title: 'Itinerary Updated',
        body: `${data.updaterName} updated the itinerary for "${data.groupName}"`,
        data,
      });
    }
  }

  async handleExpenseAdded(data) {
    for (const memberId of data.memberIds) {
      if (memberId !== data.addedBy) {
        await notificationService.send({
          userId: memberId,
          type: 'EXPENSE_ADDED',
          channels: ['PUSH', 'IN_APP'],
          title: 'New Expense',
          body: `${data.adderName} added "${data.expenseTitle}" (${data.amount})`,
          data,
        });
      }
    }
  }

  async handlePollCreated(data) {
    for (const memberId of data.memberIds) {
      if (memberId !== data.creatorId) {
        await notificationService.send({
          userId: memberId,
          type: 'POLL_CREATED',
          channels: ['PUSH', 'IN_APP'],
          title: 'New Poll',
          body: `${data.creatorName} created a poll: "${data.question}"`,
          data,
          actionUrl: `/travellers/group/${data.groupId}/polls/${data.pollId}`,
        });
      }
    }
  }

  async handlePollEnded(data) {
    for (const memberId of data.memberIds) {
      await notificationService.send({
        userId: memberId,
        type: 'POLL_ENDED',
        channels: ['IN_APP'],
        title: 'Poll Ended',
        body: `Poll "${data.question}" has ended. Winner: ${data.winningOption}`,
        data,
      });
    }
  }

  async handleNewMessage(data) {
    // Don't notify sender
    const recipients = data.memberIds.filter(id => id !== data.senderId);

    for (const memberId of recipients) {
      await notificationService.send({
        userId: memberId,
        type: 'NEW_MESSAGE',
        channels: ['PUSH'],
        title: data.groupName || data.senderName,
        body: `${data.senderName}: ${data.messagePreview}`,
        data,
      });
    }
  }

  async handleMention(data) {
    await notificationService.send({
      userId: data.mentionedUserId,
      type: 'MESSAGE_MENTION',
      channels: ['PUSH', 'IN_APP'],
      title: 'You were mentioned',
      body: `${data.senderName} mentioned you in ${data.groupName}`,
      data,
    });
  }

  /**
   * Disconnect consumer
   */
  async disconnect() {
    if (this.consumer && this.isConnected) {
      await this.consumer.disconnect();
      this.isConnected = false;
      logger.info('Kafka consumer disconnected');
    }
  }
}

module.exports = new KafkaConsumer();
