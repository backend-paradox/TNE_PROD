const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const axios = require('axios');
const config = require('../config/env');

/**
 * Get all members of a group
 */
const getGroupMembers = async (groupId, { page = 1, limit = 50 }) => {
  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId, leftAt: null },
      skip,
      take: limit,
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      // Note: User data is fetched from user-service separately (microservice architecture)
    }),
    prisma.groupMember.count({
      where: { groupId, leftAt: null },
    }),
  ]);

  const userIds = members.map((member) => member.userId);
  const profileMap = await _fetchUserProfiles(userIds);
  const enrichedMembers = members.map((member) => {
    const profile = profileMap[member.userId];
    const fallbackName = member.nickname || `Member ${member.userId}`;
    const name = profile?.name || fallbackName;
    const avatar = profile?.profilePicUrl || null;
    const gender = profile?.gender || null;
    return {
      ...member,
      name,
      avatar,
      gender,
      user: {
        name,
        gender,
        profilePicUrl: avatar,
      },
    };
  });

  return {
    members: enrichedMembers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Invite a member to the group
 */
const inviteMember = async (groupId, inviterId, data) => {
  const { userId, email, role = 'MEMBER', message } = data;

  if (!userId && !email) {
    throw new ApiError(400, 'Either userId or email is required');
  }

  const group = await prisma.group.findFirst({
    where: { id: groupId, isActive: true, deletedAt: null },
    include: { members: { where: { leftAt: null } } },
  });

  if (!group) throw new ApiError(404, 'Group not found');

  // Check if group is full
  if (group.members.length >= group.maxMembers) {
    throw new ApiError(400, 'Group is full');
  }

  // Check if user is already a member
  if (userId) {
    const isMember = group.members.some((m) => m.userId === userId);
    if (isMember) {
      throw new ApiError(400, 'User is already a member of this group');
    }
  }

  // Check for existing pending invitation
  const existingInvite = await prisma.groupInvitation.findFirst({
    where: {
      groupId,
      status: 'PENDING',
      OR: [
        ...(userId ? [{ invitedUserId: userId }] : []),
        ...(email ? [{ invitedEmail: email }] : []),
      ],
    },
  });

  if (existingInvite) {
    throw new ApiError(400, 'An invitation is already pending for this user');
  }

  // Set expiry to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.groupInvitation.create({
    data: {
      groupId,
      invitedUserId: userId || null,
      invitedEmail: email || null,
      invitedBy: inviterId,
      role,
      message,
      expiresAt,
    },
  });

  logger.info('Invitation created', { groupId, invitedUserId: userId, invitedEmail: email });
  return invitation;
};

/**
 * Get pending invitations for a group
 */
const getPendingInvitations = async (groupId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [invitations, total] = await Promise.all([
    prisma.groupInvitation.findMany({
      where: {
        groupId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.groupInvitation.count({
      where: {
        groupId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    }),
  ]);

  return {
    invitations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Get invitations for a user
 */
const getUserInvitations = async (userId, email, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const where = {
    status: 'PENDING',
    expiresAt: { gt: new Date() },
    OR: [
      { invitedUserId: userId },
      ...(email ? [{ invitedEmail: email }] : []),
    ],
  };

  const [invitations, total] = await Promise.all([
    prisma.groupInvitation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            destination: true,
            startDate: true,
            endDate: true,
            _count: { select: { members: { where: { leftAt: null } } } },
          },
        },
      },
    }),
    prisma.groupInvitation.count({ where }),
  ]);

  return {
    invitations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Cancel an invitation
 */
const cancelInvitation = async (invitationId, cancellerId) => {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { id: invitationId },
    include: {
      group: {
        include: { members: { where: { leftAt: null } } },
      },
    },
  });

  if (!invitation) throw new ApiError(404, 'Invitation not found');
  if (invitation.status !== 'PENDING') {
    throw new ApiError(400, 'Invitation is no longer pending');
  }

  // Check if canceller is admin
  const canceller = invitation.group.members.find((m) => m.userId === cancellerId);
  if (!canceller || !['OWNER', 'ADMIN'].includes(canceller.role)) {
    throw new ApiError(403, 'Not authorized to cancel this invitation');
  }

  await prisma.groupInvitation.update({
    where: { id: invitationId },
    data: { status: 'CANCELLED' },
  });

  logger.info('Invitation cancelled', { invitationId, cancelledBy: cancellerId });
  return { message: 'Invitation cancelled' };
};

/**
 * Accept an invitation by token
 */
const acceptInvitation = async (token, userId) => {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { token },
    include: {
      group: {
        include: { members: { where: { leftAt: null } } },
      },
    },
  });

  if (!invitation) throw new ApiError(404, 'Invitation not found');
  if (invitation.status !== 'PENDING') {
    throw new ApiError(400, 'Invitation is no longer valid');
  }
  if (invitation.expiresAt < new Date()) {
    await prisma.groupInvitation.update({
      where: { id: invitation.id },
      data: { status: 'EXPIRED' },
    });
    throw new ApiError(400, 'Invitation has expired');
  }

  // Check if group is full
  if (invitation.group.members.length >= invitation.group.maxMembers) {
    throw new ApiError(400, 'Group is full');
  }

  // Check if user is already a member
  const isMember = invitation.group.members.some((m) => m.userId === userId);
  if (isMember) {
    throw new ApiError(400, 'You are already a member of this group');
  }

  const existingMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: invitation.groupId,
        userId,
      },
    },
  });

  if (existingMember && !existingMember.leftAt) {
    throw new ApiError(400, 'You are already a member of this group');
  }

  await prisma.$transaction(async (tx) => {
    // Update invitation status
    await tx.groupInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
    });

    // Add or restore user as member
    if (existingMember && existingMember.leftAt) {
      await tx.groupMember.update({
        where: { id: existingMember.id },
        data: {
          leftAt: null,
          joinedAt: new Date(),
          role: invitation.role,
          rsvpStatus: 'PENDING',
          rsvpAt: null,
          isMuted: false,
        },
      });
    } else {
      await tx.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId,
          role: invitation.role,
          rsvpStatus: 'PENDING',
        },
      });
    }
  });

  logger.info('Invitation accepted', { invitationId: invitation.id, userId });
  return { message: 'You have joined the group', groupId: invitation.groupId };
};

/**
 * Accept invitation by ID (for logged-in users)
 */
const acceptInvitationById = async (invitationId, userId) => {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { id: invitationId },
    include: {
      group: {
        include: { members: { where: { leftAt: null } } },
      },
    },
  });

  if (!invitation) throw new ApiError(404, 'Invitation not found');

  // Verify invitation is for this user
  if (invitation.invitedUserId && invitation.invitedUserId !== userId) {
    throw new ApiError(403, 'This invitation is not for you');
  }

  if (invitation.status !== 'PENDING') {
    throw new ApiError(400, 'Invitation is no longer valid');
  }
  if (invitation.expiresAt < new Date()) {
    await prisma.groupInvitation.update({
      where: { id: invitation.id },
      data: { status: 'EXPIRED' },
    });
    throw new ApiError(400, 'Invitation has expired');
  }

  // Check if group is full
  if (invitation.group.members.length >= invitation.group.maxMembers) {
    throw new ApiError(400, 'Group is full');
  }

  // Check if user is already a member
  const isMember = invitation.group.members.some((m) => m.userId === userId);
  if (isMember) {
    throw new ApiError(400, 'You are already a member of this group');
  }

  const existingMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: invitation.groupId,
        userId,
      },
    },
  });

  if (existingMember && !existingMember.leftAt) {
    throw new ApiError(400, 'You are already a member of this group');
  }

  await prisma.$transaction(async (tx) => {
    await tx.groupInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
    });

    if (existingMember && existingMember.leftAt) {
      await tx.groupMember.update({
        where: { id: existingMember.id },
        data: {
          leftAt: null,
          joinedAt: new Date(),
          role: invitation.role,
          rsvpStatus: 'PENDING',
          rsvpAt: null,
          isMuted: false,
        },
      });
    } else {
      await tx.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId,
          role: invitation.role,
          rsvpStatus: 'PENDING',
        },
      });
    }
  });

  logger.info('Invitation accepted', { invitationId, userId });
  return { message: 'You have joined the group', groupId: invitation.groupId };
};

/**
 * Decline an invitation
 */
const declineInvitation = async (invitationId, userId) => {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) throw new ApiError(404, 'Invitation not found');

  // Verify invitation is for this user
  if (invitation.invitedUserId && invitation.invitedUserId !== userId) {
    throw new ApiError(403, 'This invitation is not for you');
  }

  if (invitation.status !== 'PENDING') {
    throw new ApiError(400, 'Invitation is no longer valid');
  }

  await prisma.groupInvitation.update({
    where: { id: invitationId },
    data: { status: 'DECLINED', respondedAt: new Date() },
  });

  logger.info('Invitation declined', { invitationId, userId });
  return { message: 'Invitation declined' };
};

/**
 * Update member role
 */
const updateMemberRole = async (groupId, targetUserId, newRole, updaterId) => {
  const parsedTargetUserId = Number(targetUserId);
  if (!Number.isFinite(parsedTargetUserId)) {
    throw new ApiError(400, 'Invalid member ID');
  }
  const group = await prisma.group.findFirst({
    where: { id: groupId, isActive: true, deletedAt: null },
    include: { members: { where: { leftAt: null } } },
  });

  if (!group) throw new ApiError(404, 'Group not found');

  const updater = group.members.find((m) => m.userId === updaterId);
  const target = group.members.find((m) => m.userId === parsedTargetUserId);

  if (!updater || !['OWNER', 'ADMIN'].includes(updater.role)) {
    throw new ApiError(403, 'Not authorized to update roles');
  }

  if (!target) throw new ApiError(404, 'Member not found');

  // Cannot change owner role
  if (target.role === 'OWNER') {
    throw new ApiError(400, 'Cannot change owner role. Transfer ownership instead.');
  }

  // Only owner can create admins
  if (newRole === 'ADMIN' && updater.role !== 'OWNER') {
    throw new ApiError(403, 'Only the owner can promote to admin');
  }

  // Cannot set role to owner (use transfer ownership)
  if (newRole === 'OWNER') {
    throw new ApiError(400, 'Use transfer ownership to change the owner');
  }

  const updated = await prisma.groupMember.update({
    where: { id: target.id },
    data: { role: newRole },
  });

  logger.info('Member role updated', { groupId, targetUserId, newRole, updatedBy: updaterId });
  return updated;
};

/**
 * Transfer ownership
 */
const transferOwnership = async (groupId, newOwnerId, currentOwnerId) => {
  const group = await prisma.group.findFirst({
    where: { id: groupId, isActive: true, deletedAt: null },
    include: { members: { where: { leftAt: null } } },
  });

  if (!group) throw new ApiError(404, 'Group not found');

  const currentOwner = group.members.find((m) => m.userId === currentOwnerId);
  const newOwner = group.members.find((m) => m.userId === newOwnerId);

  if (!currentOwner || currentOwner.role !== 'OWNER') {
    throw new ApiError(403, 'Only the current owner can transfer ownership');
  }

  if (!newOwner) throw new ApiError(404, 'New owner must be a member of the group');

  await prisma.$transaction(async (tx) => {
    // Make current owner an admin
    await tx.groupMember.update({
      where: { id: currentOwner.id },
      data: { role: 'ADMIN' },
    });

    // Make new owner the owner
    await tx.groupMember.update({
      where: { id: newOwner.id },
      data: { role: 'OWNER' },
    });

    // Update group createdBy
    await tx.group.update({
      where: { id: groupId },
      data: { createdBy: newOwnerId },
    });
  });

  logger.info('Ownership transferred', { groupId, from: currentOwnerId, to: newOwnerId });
  return { message: 'Ownership transferred successfully' };
};

/**
 * Remove a member from the group
 */
const removeMember = async (groupId, targetUserId, removerId) => {
  const parsedTargetUserId = Number(targetUserId);
  if (!Number.isFinite(parsedTargetUserId)) {
    throw new ApiError(400, 'Invalid member ID');
  }
  const group = await prisma.group.findFirst({
    where: { id: groupId, isActive: true, deletedAt: null },
    include: { members: { where: { leftAt: null } } },
  });

  if (!group) throw new ApiError(404, 'Group not found');

  const remover = group.members.find((m) => m.userId === removerId);
  const target = group.members.find((m) => m.userId === parsedTargetUserId);

  if (!remover || !['OWNER', 'ADMIN'].includes(remover.role)) {
    throw new ApiError(403, 'Not authorized to remove members');
  }

  if (!target) throw new ApiError(404, 'Member not found');

  // Cannot remove owner
  if (target.role === 'OWNER') {
    throw new ApiError(400, 'Cannot remove the group owner');
  }

  // Admins cannot remove other admins (only owner can)
  if (target.role === 'ADMIN' && remover.role !== 'OWNER') {
    throw new ApiError(403, 'Only the owner can remove admins');
  }

  await prisma.groupMember.update({
    where: { id: target.id },
    data: { leftAt: new Date() },
  });

  logger.info('Member removed', { groupId, targetUserId, removedBy: removerId });
  return { message: 'Member removed from group' };
};

/**
 * Leave a group
 */
const leaveGroup = async (groupId, userId) => {
  const member = await prisma.groupMember.findFirst({
    where: { groupId, userId, leftAt: null },
  });

  if (!member) throw new ApiError(404, 'You are not a member of this group');

  // Owner cannot leave without transferring ownership
  if (member.role === 'OWNER') {
    throw new ApiError(400, 'You must transfer ownership before leaving the group');
  }

  await prisma.groupMember.update({
    where: { id: member.id },
    data: { leftAt: new Date() },
  });

  logger.info('Member left group', { groupId, userId });
  return { message: 'You have left the group' };
};

/**
 * Update RSVP status
 */
const updateRSVP = async (groupId, userId, status) => {
  const validStatuses = ['GOING', 'MAYBE', 'NOT_GOING', 'PENDING'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid RSVP status');
  }

  const member = await prisma.groupMember.findFirst({
    where: { groupId, userId, leftAt: null },
  });

  if (!member) throw new ApiError(404, 'You are not a member of this group');

  const updated = await prisma.groupMember.update({
    where: { id: member.id },
    data: {
      rsvpStatus: status,
      rsvpAt: new Date(),
    },
  });

  logger.info('RSVP updated', { groupId, userId, status });
  return updated;
};

/**
 * Update member notification settings
 */
const updateNotificationSettings = async (groupId, userId, isMuted) => {
  const member = await prisma.groupMember.findFirst({
    where: { groupId, userId, leftAt: null },
  });

  if (!member) throw new ApiError(404, 'You are not a member of this group');

  const updated = await prisma.groupMember.update({
    where: { id: member.id },
    data: { isMuted },
  });

  return updated;
};

/**
 * Fetch user profiles from user-service (helper)
 */
const _fetchUserProfiles = async (userIds) => {
  if (!userIds || userIds.length === 0) {
    return {};
  }

  try {
    const response = await axios.post(
      `${config.apiGateway.url}/users/profiles/batch`,
      { userIds },
      {
        headers: {
          'X-Internal-Service': 'group-service',
          'Content-Type': 'application/json',
        },
      }
    );

    const profiles = response.data.data || response.data || [];

    return profiles.reduce((acc, profile) => {
      const key = profile.authId || profile.userId || profile.id;
      acc[key] = {
        name: profile.name || 'Member',
        profilePicUrl: profile.profilePicUrl,
        gender: profile.gender,
      };
      return acc;
    }, {});
  } catch (error) {
    logger.error('Failed to fetch user profiles:', error.message);
    return {};
  }
};

module.exports = {
  getGroupMembers,
  inviteMember,
  getPendingInvitations,
  getUserInvitations,
  cancelInvitation,
  acceptInvitation,
  acceptInvitationById,
  declineInvitation,
  updateMemberRole,
  transferOwnership,
  removeMember,
  leaveGroup,
  updateRSVP,
  updateNotificationSettings,
};
