const axios = require('axios');
const prisma = require('../config/prisma');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Get all conversations for a user with pagination
 */
const getUserConversations = async (userId, page = 1, limit = 20) => {
  // Fetch conversations where user is a participant
  const participations = await prisma.conversationParticipant.findMany({
    where: {
      userId,
      leftAt: null, // Only active participations
    },
    include: {
      conversation: {
        include: {
          participants: {
            where: { leftAt: null },
          },
          messages: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      conversation: {
        lastMessageAt: 'desc',
      },
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Calculate unread count for each conversation
  const conversations = await Promise.all(
    participations.map(async (p) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: p.conversationId,
          createdAt: {
            gt: p.lastReadAt || new Date(0),
          },
          senderId: { not: userId },
          isDeleted: false,
        },
      });

      return {
        ...p.conversation,
        lastMessage: p.conversation.messages[0] || null,
        unreadCount,
        myRole: p.role,
        isMuted: p.isMuted,
        lastReadAt: p.lastReadAt,
      };
    })
  );

  // Get total count
  const total = await prisma.conversationParticipant.count({
    where: {
      userId,
      leftAt: null,
    },
  });

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single conversation by ID
 */
const getConversationById = async (conversationId, userId) => {
  // Verify user is a participant
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

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        where: { leftAt: null },
      },
      messages: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          attachments: true,
          reactions: true,
          replyTo: true,
        },
      },
    },
  });

  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  return {
    ...conversation,
    messages: conversation.messages.reverse(), // Return in chronological order
    myRole: participant.role,
    isMuted: participant.isMuted,
    lastReadAt: participant.lastReadAt,
  };
};

const fetchProfileIdForAuthId = async (authId) => {
  if (!authId) return null;

  const response = await axios.post(
    `${config.services.user}/api/v1/users/profiles/batch`,
    { userIds: [authId] },
    {
      headers: {
        'X-Internal-Service': 'chat-service',
        'Content-Type': 'application/json',
      },
    }
  );

  const profiles = response.data?.data || response.data || [];
  const profile = profiles.find((item) => Number(item.authId) === Number(authId));
  return profile?.id || null;
};

const ensureDirectConnection = async (otherUserId, authHeader) => {
  if (!authHeader) {
    throw ApiError.unauthorized('Authorization header required to start a direct conversation');
  }

  const targetProfileId = await fetchProfileIdForAuthId(otherUserId);
  if (!targetProfileId) {
    throw ApiError.notFound('User not found');
  }

  let status = null;
  try {
    const response = await axios.get(
      `${config.services.user}/api/v1/users/connections/${targetProfileId}/status`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      }
    );
    const payload = response.data?.data || response.data || {};
    status = payload.status;
  } catch (error) {
    throw ApiError.internal('Failed to verify connection status');
  }

  if (status !== 'CONNECTED') {
    throw ApiError.forbidden('Connection required to start a direct conversation');
  }
};

/**
 * Create a new conversation
 */
const createConversation = async (creatorId, data, authHeader = null) => {
  const { type, name, description, imageUrl, groupId, participantIds } = data;
  const resolvedType = type || 'DIRECT';

  // For GROUP type, return existing conversation for the same group
  if (resolvedType === 'GROUP' && groupId) {
    const existingGroupConversation = await prisma.conversation.findFirst({
      where: {
        type: 'GROUP',
        groupId,
        deletedAt: null,
      },
      include: {
        participants: {
          where: { leftAt: null },
        },
      },
    });

    if (existingGroupConversation) {
      // Ensure any new participants are added (best-effort)
      const existingIds = new Set(existingGroupConversation.participants.map((p) => p.userId));
      const incomingIds = Array.isArray(participantIds) ? participantIds : [];
      const ensuredIds = Array.from(new Set([creatorId, ...incomingIds]));
      const missingIds = ensuredIds.filter((id) => !existingIds.has(id));

      if (missingIds.length > 0) {
        await prisma.conversationParticipant.createMany({
          data: missingIds.map((uid) => ({
            conversationId: existingGroupConversation.id,
            userId: uid,
            role: uid === creatorId ? 'ADMIN' : 'MEMBER',
          })),
          skipDuplicates: true,
        });
      }

      return existingGroupConversation;
    }
  }

  // For DIRECT type, check if connection exists and if conversation already exists
  if (resolvedType === 'DIRECT') {
    if (!participantIds || participantIds.length !== 1) {
      throw ApiError.badRequest('Direct conversations require exactly one participant');
    }
    const otherUserId = participantIds[0];

    await ensureDirectConnection(otherUserId, authHeader);

    // Check for existing direct conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        participants: {
          every: {
            userId: { in: [creatorId, otherUserId] },
            leftAt: null,
          },
        },
      },
      include: {
        participants: {
          where: { leftAt: null },
        },
      },
    });

    if (existingConversation && existingConversation.participants.length === 2) {
      return existingConversation;
    }
  }

  // Create conversation with participants
  const allParticipantIds = [creatorId, ...(participantIds || [])];
  const uniqueParticipantIds = [...new Set(allParticipantIds)];

  const conversation = await prisma.conversation.create({
    data: {
      type: resolvedType,
      name,
      description,
      imageUrl,
      groupId,
      createdBy: creatorId,
      participants: {
        create: uniqueParticipantIds.map((uid, index) => ({
          userId: uid,
          role: uid === creatorId ? 'ADMIN' : 'MEMBER',
        })),
      },
    },
    include: {
      participants: true,
    },
  });

  return conversation;
};

/**
 * Update a conversation
 */
const updateConversation = async (conversationId, userId, data) => {
  // Verify user has permission (ADMIN role)
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

  if (participant.role !== 'ADMIN') {
    throw ApiError.forbidden('Only admins can update conversation settings');
  }

  const { name, description, imageUrl } = data;

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      name,
      description,
      imageUrl,
    },
    include: {
      participants: {
        where: { leftAt: null },
      },
    },
  });

  return updatedConversation;
};

/**
 * Leave a conversation
 */
const leaveConversation = async (conversationId, userId) => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!participant || participant.leftAt) {
    throw ApiError.badRequest('You are not a member of this conversation');
  }

  // Check if user is the only admin
  if (participant.role === 'ADMIN') {
    const otherAdmins = await prisma.conversationParticipant.count({
      where: {
        conversationId,
        role: 'ADMIN',
        userId: { not: userId },
        leftAt: null,
      },
    });

    // If no other admins, promote someone else
    if (otherAdmins === 0) {
      const nextMember = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: { not: userId },
          leftAt: null,
        },
        orderBy: { joinedAt: 'asc' },
      });

      if (nextMember) {
        await prisma.conversationParticipant.update({
          where: { id: nextMember.id },
          data: { role: 'ADMIN' },
        });
      }
    }
  }

  // Mark participant as left
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    data: { leftAt: new Date() },
  });

  // Check if conversation is now empty
  const remainingParticipants = await prisma.conversationParticipant.count({
    where: {
      conversationId,
      leftAt: null,
    },
  });

  // Soft delete conversation if no participants left
  if (remainingParticipants === 0) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { deletedAt: new Date() },
    });
  }

  return { success: true };
};

/**
 * Add a participant to a conversation
 */
const addParticipant = async (conversationId, requesterId, userIdToAdd, role = 'MEMBER') => {
  // Verify requester has permission
  const requester = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: requesterId,
      },
    },
  });

  if (!requester || requester.leftAt) {
    throw ApiError.forbidden('You are not a member of this conversation');
  }

  if (!['ADMIN', 'MODERATOR'].includes(requester.role)) {
    throw ApiError.forbidden('Only admins and moderators can add participants');
  }

  // Check if user is already a participant
  const existingParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: userIdToAdd,
      },
    },
  });

  if (existingParticipant && !existingParticipant.leftAt) {
    throw ApiError.badRequest('User is already a participant');
  }

  // If user was previously in the conversation, rejoin them
  if (existingParticipant) {
    const updatedParticipant = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: userIdToAdd,
        },
      },
      data: {
        leftAt: null,
        role,
        joinedAt: new Date(),
      },
    });
    return updatedParticipant;
  }

  // Add new participant
  const participant = await prisma.conversationParticipant.create({
    data: {
      conversationId,
      userId: userIdToAdd,
      role,
    },
  });

  return participant;
};

/**
 * Remove a participant from a conversation
 */
const removeParticipant = async (conversationId, requesterId, userIdToRemove) => {
  // Cannot remove self (use leaveConversation instead)
  if (requesterId === userIdToRemove) {
    throw ApiError.badRequest('Use leaveConversation to remove yourself');
  }

  // Verify requester has permission
  const requester = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: requesterId,
      },
    },
  });

  if (!requester || requester.leftAt) {
    throw ApiError.forbidden('You are not a member of this conversation');
  }

  if (!['ADMIN', 'MODERATOR'].includes(requester.role)) {
    throw ApiError.forbidden('Only admins and moderators can remove participants');
  }

  // Check target participant
  const targetParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: userIdToRemove,
      },
    },
  });

  if (!targetParticipant || targetParticipant.leftAt) {
    throw ApiError.notFound('User is not a participant');
  }

  // Moderators cannot remove admins
  if (requester.role === 'MODERATOR' && targetParticipant.role === 'ADMIN') {
    throw ApiError.forbidden('Moderators cannot remove admins');
  }

  // Remove participant
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: userIdToRemove,
      },
    },
    data: { leftAt: new Date() },
  });

  return { success: true };
};

/**
 * Mark conversation as read
 */
const markConversationAsRead = async (conversationId, userId) => {
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

  // Get the latest message
  const latestMessage = await prisma.message.findFirst({
    where: {
      conversationId,
      isDeleted: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Update participant's last read
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    data: {
      lastReadAt: new Date(),
      lastReadMessageId: latestMessage?.id,
    },
  });

  // Create read receipts for all unread messages
  if (latestMessage) {
    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId,
        createdAt: { gt: participant.lastReadAt || new Date(0) },
        senderId: { not: userId },
        isDeleted: false,
      },
      select: { id: true },
    });

    if (unreadMessages.length > 0) {
      await prisma.messageReadReceipt.createMany({
        data: unreadMessages.map(msg => ({
          messageId: msg.id,
          userId,
        })),
        skipDuplicates: true,
      });
    }
  }

  return { success: true };
};

/**
 * Mark all direct conversations with a specific user as read
 */
const markDirectConversationsAsRead = async (userId, otherUserId) => {
  if (!otherUserId) {
    throw ApiError.badRequest('Other user ID is required');
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      type: 'DIRECT',
      deletedAt: null,
      participants: {
        some: { userId, leftAt: null },
        some: { userId: otherUserId, leftAt: null },
      },
    },
    select: { id: true },
  });

  if (!conversations.length) {
    return { success: true };
  }

  for (const conversation of conversations) {
    await markConversationAsRead(conversation.id, userId);
  }

  return { success: true };
};

/**
 * Mute a conversation
 */
const muteConversation = async (conversationId, userId, until = null) => {
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

  const updated = await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    data: {
      isMuted: true,
      muteUntil: until ? new Date(until) : null,
    },
  });

  return { isMuted: true, muteUntil: updated.muteUntil };
};

/**
 * Unmute a conversation
 */
const unmuteConversation = async (conversationId, userId) => {
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

  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    data: {
      isMuted: false,
      muteUntil: null,
    },
  });

  return { isMuted: false };
};

module.exports = {
  getUserConversations,
  getConversationById,
  createConversation,
  updateConversation,
  leaveConversation,
  addParticipant,
  removeParticipant,
  markConversationAsRead,
  markDirectConversationsAsRead,
  muteConversation,
  unmuteConversation,
};
