const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const axios = require('axios');
const config = require('../config/env');
const { v4: uuidv4 } = require('uuid');

/**
 * Invite a user by userId (for connections)
 */
const inviteByUserId = async (groupId, inviterId, targetUserId, message = null) => {
  // Verify inviter is an active member
  const inviterMember = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId: inviterId,
      leftAt: null,
    },
  });

  if (!inviterMember) {
    throw ApiError.forbidden('Only group members can invite members');
  }

  // Check if user is already a member
  const existingMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: targetUserId,
      },
    },
  });

  if (existingMember && !existingMember.leftAt) {
    throw ApiError.badRequest('User is already a member of this group');
  }

  // Check if there's already a pending invitation
  const existingInvitation = await prisma.groupInvitation.findFirst({
    where: {
      groupId,
      invitedUserId: targetUserId,
      status: 'PENDING',
    },
  });

  if (existingInvitation) {
    throw ApiError.badRequest('User already has a pending invitation to this group');
  }

  // Check group capacity
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        where: { leftAt: null },
      },
    },
  });

  if (!group) {
    throw ApiError.notFound('Group not found');
  }

  if (group.members.length >= group.maxMembers) {
    throw ApiError.badRequest('Group is at full capacity');
  }

  // Create invitation
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.group.invitationExpiryDays);

  const invitation = await prisma.groupInvitation.create({
    data: {
      groupId,
      invitedUserId: targetUserId,
      invitedBy: inviterId,
      message,
      token: uuidv4(),
      expiresAt,
      status: 'PENDING',
      role: 'MEMBER',
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          destination: true,
          imageUrl: true,
        },
      },
    },
  });

  return invitation;
};

/**
 * Invite a user by email
 */
const inviteByEmail = async (groupId, inviterId, email, message = null) => {
  // Check if user exists via user-service
  try {
    const response = await axios.get(
      `${config.apiGateway.url}/users/by-email/${encodeURIComponent(email)}`,
      {
        headers: {
          'X-Internal-Service': 'group-service',
        },
      }
    );

    const user = response.data.data || response.data;

    // If user exists, redirect to inviteByUserId
    if (user && user.authId) {
      return await inviteByUserId(groupId, inviterId, user.authId, message);
    }
  } catch (error) {
    // User doesn't exist, continue with email invitation
    if (error.response?.status !== 404) {
      console.error('Error checking user by email:', error.message);
    }
  }

  // Verify inviter has permissions
  const inviterMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: inviterId,
      },
    },
  });

  if (!inviterMember || !['OWNER', 'ADMIN', 'MODERATOR'].includes(inviterMember.role)) {
    throw ApiError.forbidden('Only group admins and moderators can invite members');
  }

  // Check if there's already a pending invitation for this email
  const existingInvitation = await prisma.groupInvitation.findFirst({
    where: {
      groupId,
      invitedEmail: email,
      status: 'PENDING',
    },
  });

  if (existingInvitation) {
    throw ApiError.badRequest('An invitation has already been sent to this email');
  }

  // Check group capacity
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        where: { leftAt: null },
      },
    },
  });

  if (!group) {
    throw ApiError.notFound('Group not found');
  }

  if (group.members.length >= group.maxMembers) {
    throw ApiError.badRequest('Group is at full capacity');
  }

  // Create invitation
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.group.invitationExpiryDays);

  const invitation = await prisma.groupInvitation.create({
    data: {
      groupId,
      invitedEmail: email,
      invitedBy: inviterId,
      message,
      token: uuidv4(),
      expiresAt,
      status: 'PENDING',
      role: 'MEMBER',
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          destination: true,
          imageUrl: true,
        },
      },
    },
  });

  // TODO: Send email notification to the invited email

  return invitation;
};

/**
 * Get all invitations for a group (Admin view)
 */
const getGroupInvitations = async (groupId, userId) => {
  // Verify user is admin of the group
  const member = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
    throw ApiError.forbidden('Only group admins can view invitations');
  }

  const invitations = await prisma.groupInvitation.findMany({
    where: {
      groupId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return invitations;
};

/**
 * Get user's received invitations
 */
const getUserInvitations = async (userId) => {
  const invitations = await prisma.groupInvitation.findMany({
    where: {
      invitedUserId: userId,
      status: 'PENDING',
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          description: true,
          destination: true,
          imageUrl: true,
          startDate: true,
          endDate: true,
          members: {
            where: { leftAt: null },
            select: { id: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch inviter details
  const inviterIds = [...new Set(invitations.map(inv => inv.invitedBy))];
  const inviterProfiles = await _fetchUserProfiles(inviterIds);

  // Enrich invitations with inviter and group data
  const enrichedInvitations = invitations.map(inv => ({
    id: inv.id,
    groupId: inv.group.id,
    status: inv.status,
    message: inv.message,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
    group: {
      name: inv.group.name,
      description: inv.group.description,
      destination: inv.group.destination,
      imageUrl: inv.group.imageUrl,
      startDate: inv.group.startDate,
      endDate: inv.group.endDate,
      memberCount: inv.group.members.length,
    },
    inviter: inviterProfiles[inv.invitedBy] || {
      name: 'Unknown',
      profilePicUrl: null,
    },
  }));

  return enrichedInvitations;
};

/**
 * Accept invitation
 */
const acceptInvitation = async (invitationId, userId) => {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { id: invitationId },
    include: {
      group: {
        include: {
          members: {
            where: { leftAt: null },
          },
        },
      },
    },
  });

  if (!invitation) {
    throw ApiError.notFound('Invitation not found');
  }

  // Verify ownership
  if (invitation.invitedUserId !== userId) {
    throw ApiError.forbidden('This invitation is not for you');
  }

  // Check if invitation is still valid
  if (invitation.status !== 'PENDING') {
    throw ApiError.badRequest(`Invitation is ${invitation.status.toLowerCase()}`);
  }

  if (new Date() > invitation.expiresAt) {
    // Mark as expired
    await prisma.groupInvitation.update({
      where: { id: invitationId },
      data: { status: 'EXPIRED' },
    });
    throw ApiError.badRequest('Invitation has expired');
  }

  // Check if user is already a member
  const existingMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: invitation.groupId,
        userId,
      },
    },
  });

  if (existingMember && !existingMember.leftAt) {
    throw ApiError.badRequest('You are already a member of this group');
  }

  // Check group capacity
  if (invitation.group.members.length >= invitation.group.maxMembers) {
    throw ApiError.badRequest('Group is at full capacity');
  }

  // Accept invitation and add member in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update invitation status
    await tx.groupInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    // Add or restore member
    const member = existingMember && existingMember.leftAt
      ? await tx.groupMember.update({
          where: { id: existingMember.id },
          data: {
            leftAt: null,
            joinedAt: new Date(),
            role: invitation.role || 'MEMBER',
            rsvpStatus: 'PENDING',
            rsvpAt: null,
            isMuted: false,
          },
        })
      : await tx.groupMember.create({
          data: {
            groupId: invitation.groupId,
            userId,
            role: invitation.role || 'MEMBER',
            rsvpStatus: 'PENDING',
          },
        });

    return member;
  });

  return {
    success: true,
    groupId: invitation.groupId,
    member: result,
  };
};

/**
 * Decline invitation
 */
const declineInvitation = async (invitationId, userId) => {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw ApiError.notFound('Invitation not found');
  }

  // Verify ownership
  if (invitation.invitedUserId !== userId) {
    throw ApiError.forbidden('This invitation is not for you');
  }

  // Check if invitation is still pending
  if (invitation.status !== 'PENDING') {
    throw ApiError.badRequest(`Invitation is already ${invitation.status.toLowerCase()}`);
  }

  // Update invitation status
  await prisma.groupInvitation.update({
    where: { id: invitationId },
    data: {
      status: 'DECLINED',
      respondedAt: new Date(),
    },
  });

  return {
    success: true,
    message: 'Invitation declined',
  };
};

/**
 * Cancel invitation (by inviter or admin)
 */
const cancelInvitation = async (invitationId, userId) => {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw ApiError.notFound('Invitation not found');
  }

  // Verify user is inviter or group admin
  const member = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: invitation.groupId,
        userId,
      },
    },
  });

  const isInviter = invitation.invitedBy === userId;
  const isAdmin = member && ['OWNER', 'ADMIN'].includes(member.role);

  if (!isInviter && !isAdmin) {
    throw ApiError.forbidden('Only the inviter or group admins can cancel this invitation');
  }

  // Check if invitation can be cancelled
  if (invitation.status !== 'PENDING') {
    throw ApiError.badRequest(`Cannot cancel ${invitation.status.toLowerCase()} invitation`);
  }

  // Update invitation status
  await prisma.groupInvitation.update({
    where: { id: invitationId },
    data: {
      status: 'CANCELLED',
      respondedAt: new Date(),
    },
  });

  return {
    success: true,
    message: 'Invitation cancelled',
  };
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
        },
      }
    );

    const profiles = response.data.data || response.data;

    // Convert to map: userId -> profile
    const profileMap = {};
    profiles.forEach(profile => {
      const fullName = [profile.firstName, profile.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      profileMap[profile.authId] = {
        name: fullName || profile.username || profile.email?.split('@')[0] || 'Unknown User',
        profilePicUrl: profile.profilePicUrl,
      };
    });

    return profileMap;
  } catch (error) {
    console.error('Failed to fetch user profiles:', error.message);
    return {};
  }
};

module.exports = {
  inviteByUserId,
  inviteByEmail,
  getGroupInvitations,
  getUserInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
};
