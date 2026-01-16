const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { getIO } = require('../config/socket');

/**
 * Verify user is a participant of the conversation
 */
const verifyParticipant = async (conversationId, userId) => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!participant || participant.leftAt) {
    throw ApiError.forbidden('You are not a member of this conversation');
  }

  return participant;
};

/**
 * Get messages for a conversation
 */
const getMessages = async (conversationId, userId, options = {}) => {
  // Verify user is a participant
  await verifyParticipant(conversationId, userId);

  const { before, after, limit = 50, page = 1 } = options;

  const where = {
    conversationId,
    isDeleted: false,
  };

  // Cursor-based pagination (preferred for real-time chat)
  if (before) {
    where.createdAt = { lt: new Date(before) };
  } else if (after) {
    where.createdAt = { gt: new Date(after) };
  }

  // Calculate skip for offset-based pagination (when no cursor is provided)
  const skip = !before && !after ? (page - 1) * limit : undefined;

  const messages = await prisma.message.findMany({
    where,
    include: {
      attachments: true,
      reactions: true,
      replyTo: {
        select: {
          id: true,
          content: true,
          senderId: true,
          type: true,
        },
      },
      readReceipts: {
        select: {
          userId: true,
          readAt: true,
        },
      },
    },
    orderBy: { createdAt: before ? 'desc' : 'asc' },
    skip,
    take: limit,
  });

  // If paginating backwards (before), reverse the results
  if (before) {
    messages.reverse();
  }

  // Format messages with reaction counts
  const formattedMessages = messages.map(msg => {
    // Group reactions by emoji
    const reactionCounts = {};
    msg.reactions.forEach(r => {
      if (!reactionCounts[r.emoji]) {
        reactionCounts[r.emoji] = { count: 0, users: [] };
      }
      reactionCounts[r.emoji].count++;
      reactionCounts[r.emoji].users.push(r.userId);
    });

    return {
      ...msg,
      // Ensure createdAt is serialized as ISO string for frontend
      createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt,
      reactions: reactionCounts,
      readBy: msg.readReceipts.map(r => r.userId),
    };
  });

  // Check for more messages
  const hasMore = messages.length === limit;

  return {
    messages: formattedMessages,
    pagination: {
      page,
      limit,
      hasMore,
    },
  };
};

/**
 * Send a new message
 */
const sendMessage = async (senderId, data) => {
  const { conversationId, content, type = 'TEXT', replyToId, attachments } = data;

  // Verify sender is a participant
  await verifyParticipant(conversationId, senderId);

  // Validate reply target exists
  if (replyToId) {
    const replyTarget = await prisma.message.findUnique({
      where: { id: replyToId },
    });
    if (!replyTarget || replyTarget.conversationId !== conversationId) {
      throw ApiError.badRequest('Invalid reply target');
    }
  }

  // Create message with attachments
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      type,
      content,
      replyToId,
      attachments: attachments ? {
        create: attachments.map(att => ({
          type: att.type,
          fileName: att.fileName,
          fileSize: att.fileSize,
          mimeType: att.mimeType,
          url: att.url,
          thumbnailUrl: att.thumbnailUrl,
          width: att.width,
          height: att.height,
          duration: att.duration,
        })),
      } : undefined,
    },
    include: {
      attachments: true,
      replyTo: {
        select: {
          id: true,
          content: true,
          senderId: true,
          type: true,
        },
      },
    },
  });

  // Update conversation lastMessageAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageId: message.id,
      lastMessageAt: new Date(),
    },
  });

  // Mark sender's own message as read
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: senderId,
      },
    },
    data: {
      lastReadAt: new Date(),
      lastReadMessageId: message.id,
    },
  });

  // Prepare formatted message for return and broadcast
  const formattedMessage = {
    ...message,
    // Ensure createdAt is serialized as ISO string for frontend
    createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt,
    reactions: {},
    readBy: [senderId],
  };

  // Emit message to all participants via Socket.IO
  try {
    const io = getIO();
    io.to(`conversation:${conversationId}`).emit('message:new', {
      conversationId,
      message: formattedMessage,
    });

    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId, leftAt: null },
      select: { userId: true },
    });
    participants.forEach((participant) => {
      io.to(`user:${participant.userId}`).emit('message:new', {
        conversationId,
        message: formattedMessage,
      });
    });
  } catch (err) {
    // Socket not initialized, skip emit (happens in tests)
  }

  return formattedMessage;
};

/**
 * Update a message
 */
const updateMessage = async (messageId, userId, content) => {
  // Get the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw ApiError.notFound('Message not found');
  }

  // Verify user is the sender
  if (String(message.senderId) !== String(userId)) {
    throw ApiError.forbidden('You can only edit your own messages');
  }

  if (message.isDeleted) {
    throw ApiError.badRequest('Cannot edit a deleted message');
  }

  // Update content and set isEdited
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: {
      content,
      isEdited: true,
      editedAt: new Date(),
    },
    include: {
      attachments: true,
      reactions: true,
      replyTo: {
        select: {
          id: true,
          content: true,
          senderId: true,
          type: true,
        },
      },
    },
  });

  // Format reactions
  const reactionCounts = {};
  updatedMessage.reactions.forEach(r => {
    if (!reactionCounts[r.emoji]) {
      reactionCounts[r.emoji] = { count: 0, users: [] };
    }
    reactionCounts[r.emoji].count++;
    reactionCounts[r.emoji].users.push(r.userId);
  });

  return {
    ...updatedMessage,
    reactions: reactionCounts,
  };
};

/**
 * Delete a message
 */
const deleteMessage = async (messageId, userId) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        include: {
          participants: {
            where: {
              userId,
              leftAt: null,
            },
          },
        },
      },
    },
  });

  if (!message) {
    throw ApiError.notFound('Message not found');
  }

  // Verify user is sender or conversation admin
  // Fix: Check if CURRENT USER is an admin, not if ANY participant is admin
  const isAdmin = message.conversation.participants.some(
    (p) => String(p.userId) === String(userId) && p.role === 'ADMIN'
  );
  if (String(message.senderId) !== String(userId) && !isAdmin) {
    throw ApiError.forbidden('You can only delete your own messages');
  }

  if (message.isDeleted) {
    throw ApiError.badRequest('Message is already deleted');
  }

  // Soft delete message
  const deletedMessage = await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      content: null, // Clear content
    },
  });

  return { success: true, messageId };
};

/**
 * Add reaction to a message
 */
const addReaction = async (messageId, userId, emoji) => {
  // Get the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw ApiError.notFound('Message not found');
  }

  if (message.isDeleted) {
    throw ApiError.badRequest('Cannot react to a deleted message');
  }

  // Verify user is a participant
  await verifyParticipant(message.conversationId, userId);

  // Add reaction (upsert)
  await prisma.messageReaction.upsert({
    where: {
      messageId_userId_emoji: {
        messageId,
        userId,
        emoji,
      },
    },
    update: {},
    create: {
      messageId,
      userId,
      emoji,
    },
  });

  // Get all reactions for this message
  const reactions = await prisma.messageReaction.findMany({
    where: { messageId },
  });

  // Group by emoji
  const reactionCounts = {};
  reactions.forEach(r => {
    if (!reactionCounts[r.emoji]) {
      reactionCounts[r.emoji] = { count: 0, users: [] };
    }
    reactionCounts[r.emoji].count++;
    reactionCounts[r.emoji].users.push(r.userId);
  });

  return {
    messageId,
    reactions: reactionCounts,
  };
};

/**
 * Remove reaction from a message
 */
const removeReaction = async (messageId, userId, emoji) => {
  // Delete reaction
  await prisma.messageReaction.deleteMany({
    where: {
      messageId,
      userId,
      emoji,
    },
  });

  // Get remaining reactions
  const reactions = await prisma.messageReaction.findMany({
    where: { messageId },
  });

  // Group by emoji
  const reactionCounts = {};
  reactions.forEach(r => {
    if (!reactionCounts[r.emoji]) {
      reactionCounts[r.emoji] = { count: 0, users: [] };
    }
    reactionCounts[r.emoji].count++;
    reactionCounts[r.emoji].users.push(r.userId);
  });

  return {
    messageId,
    reactions: reactionCounts,
  };
};

/**
 * Mark message as read
 */
const markAsRead = async (messageId, userId) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw ApiError.notFound('Message not found');
  }

  // Verify user is a participant
  await verifyParticipant(message.conversationId, userId);

  // Create read receipt
  await prisma.messageReadReceipt.upsert({
    where: {
      messageId_userId: {
        messageId,
        userId,
      },
    },
    update: {
      readAt: new Date(),
    },
    create: {
      messageId,
      userId,
    },
  });

  // Update participant lastReadMessageId
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId: message.conversationId,
        userId,
      },
    },
    data: {
      lastReadAt: new Date(),
      lastReadMessageId: messageId,
    },
  });

  return { success: true };
};

/**
 * Search messages
 */
const searchMessages = async (userId, options = {}) => {
  const { query, conversationId, limit = 20, page = 1 } = options;

  if (!query || query.trim().length < 2) {
    throw ApiError.badRequest('Search query must be at least 2 characters');
  }

  // Get conversations user is part of
  const participations = await prisma.conversationParticipant.findMany({
    where: {
      userId,
      leftAt: null,
    },
    select: { conversationId: true },
  });

  const conversationIds = participations.map(p => p.conversationId);

  // Build search filter
  const where = {
    conversationId: conversationId
      ? { equals: conversationId, in: conversationIds }
      : { in: conversationIds },
    isDeleted: false,
    content: {
      contains: query,
      mode: 'insensitive',
    },
  };

  // If specific conversation requested, verify access
  if (conversationId && !conversationIds.includes(conversationId)) {
    throw ApiError.forbidden('You are not a member of this conversation');
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: {
        conversation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.message.count({ where }),
  ]);

  return {
    messages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  markAsRead,
  searchMessages,
};
