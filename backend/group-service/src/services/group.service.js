/**
 * Group Service
 *
 * Business logic layer for group operations.
 * Uses repository layer for all database operations.
 */

const axios = require('axios');
const prisma = require('../config/prisma');
const config = require('../config/env');
const {
  groupRepository,
  groupMemberRepository,
  joinRequestRepository,
} = require('../repositories');
const { NotFoundError, ConflictError, AuthorizationError } = require('../../../shared/src/utils/errors');
const logger = require('../utils/logger');
const { generateInviteCode } = require('../utils/inviteCode');

const normalizeDestinationValue = (value) => (value || '').trim().toLowerCase();
const normalizePollQuestion = (value) => (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
const isDestinationPollQuestion = (question = '') => {
  const normalized = normalizePollQuestion(question);
  return (
    normalized === 'where should we go?' ||
    normalized === 'where should we go' ||
    normalized.startsWith('destination poll')
  );
};

class GroupService {
  // ==================== Group Queries ====================

  /**
   * Get all groups for a user
   */
  async getUserGroups(userId, page = 1, limit = 20, statusFilter = null) {
    const result = await groupMemberRepository.findUserMemberships(userId, { page, limit });

    const groups = result.data.map((m) => ({
      ...m.group,
      myRole: m.role,
      rsvpStatus: m.rsvpStatus,
      joinedAt: m.joinedAt,
      isMuted: m.isMuted,
      calculatedStatus: this._calculateGroupStatus(m.group),
    }));

    // Apply status filter if provided
    const filteredGroups = statusFilter
      ? groups.filter((g) => g.calculatedStatus === statusFilter)
      : groups;

    return {
      groups: filteredGroups,
      pagination: result.pagination,
    };
  }

  /**
   * Search public groups
   */
  async searchPublicGroups(query, { page = 1, limit = 20, destination, startDate, endDate }) {
    const result = await groupRepository.searchPublic({
      query,
      destination,
      startDate,
      endDate,
      page,
      limit,
    });

    const groups = result.data.map((g) => ({
      ...g,
      memberCount: g._count.members,
      spotsLeft: g.maxMembers - g._count.members,
    }));

    return {
      groups,
      pagination: result.pagination,
    };
  }

  /**
   * Get group by ID
   */
  async getGroupById(groupId, userId) {
    const group = await groupRepository.findWithDetails(groupId);

    if (!group) {
      throw NotFoundError.group();
    }

    const membership = group.members.find((m) => m.userId === userId);

    return {
      ...group,
      myRole: membership?.role || null,
      rsvpStatus: membership?.rsvpStatus || null,
      isMember: !!membership,
    };
  }

  // ==================== Group Management ====================

  /**
   * Create a new group
   */
  async createGroup(creatorId, data) {
    const {
      name,
      description,
      imageUrl,
      destination,
      startDate,
      endDate,
      budget,
      budgetPerPerson,
      currency,
      type,
      maxMembers,
    } = data;

    const group = await prisma.$transaction(async (tx) => {
      // Generate unique invite code with retry limit
      const MAX_INVITE_CODE_ATTEMPTS = 10;
      let inviteCode;
      let codeExists = true;
      let attempts = 0;

      while (codeExists) {
        if (attempts >= MAX_INVITE_CODE_ATTEMPTS) {
          throw new Error('Failed to generate unique invite code after maximum attempts');
        }
        inviteCode = generateInviteCode();
        const existing = await tx.group.findUnique({ where: { inviteCode } });
        codeExists = !!existing;
        attempts++;
      }

      // Create the group
      const newGroup = await tx.group.create({
        data: {
          name,
          description,
          imageUrl,
          destination,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          budget: budget || null,
          budgetPerPerson: budgetPerPerson || null,
          currency: currency || 'INR',
          type: type || 'PRIVATE',
          maxMembers: maxMembers || 20,
          createdBy: creatorId,
          inviteCode,
        },
      });

      // Add creator as OWNER
      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: creatorId,
          role: 'OWNER',
          rsvpStatus: 'GOING',
          rsvpAt: new Date(),
        },
      });

      return newGroup;
    });

    logger.info('Group created', { groupId: group.id, createdBy: creatorId });
    return group;
  }

  /**
   * Update group
   */
  async updateGroup(groupId, userId, data) {
    const group = await groupRepository.findWithMemberCheck(groupId, userId);

    if (!group) {
      throw NotFoundError.group();
    }

    const member = group.members[0];
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw AuthorizationError.insufficientPermissions();
    }

    const {
      name,
      description,
      imageUrl,
      destination,
      startDate,
      endDate,
      manualStartDate,
      manualEndDate,
      status,
      budget,
      budgetPerPerson,
      currency,
      type,
      maxMembers,
    } = data;

    const destinationChanged = destination !== undefined &&
      normalizeDestinationValue(destination) !== normalizeDestinationValue(group.destination);

    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(destination !== undefined && { destination }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(manualStartDate !== undefined && { manualStartDate: manualStartDate ? new Date(manualStartDate) : null }),
      ...(manualEndDate !== undefined && { manualEndDate: manualEndDate ? new Date(manualEndDate) : null }),
      ...(status !== undefined && { status }),
      ...(budget !== undefined && { budget }),
      ...(budgetPerPerson !== undefined && { budgetPerPerson }),
      ...(currency && { currency }),
      ...(type && { type }),
      ...(maxMembers && { maxMembers }),
    };

    const updated = await prisma.$transaction(async (tx) => {
      if (destinationChanged) {
        const polls = await tx.poll.findMany({
          where: { groupId },
          select: { id: true, question: true },
        });
        const destinationPollIds = polls
          .filter((poll) => isDestinationPollQuestion(poll.question))
          .map((poll) => poll.id);

        if (destinationPollIds.length > 0) {
          await tx.pollVote.deleteMany({
            where: {
              option: {
                pollId: { in: destinationPollIds },
              },
            },
          });
          await tx.pollOption.deleteMany({
            where: { pollId: { in: destinationPollIds } },
          });
          await tx.poll.deleteMany({
            where: { id: { in: destinationPollIds } },
          });
        }
      }

      return tx.group.update({
        where: { id: groupId },
        data: updateData,
      });
    });

    logger.info('Group updated', { groupId, updatedBy: userId });
    return {
      ...updated,
      calculatedStatus: this._calculateGroupStatus(updated),
    };
  }

  /**
   * Delete group (soft delete)
   */
  async deleteGroup(groupId, userId) {
    const group = await groupRepository.findWithMemberCheck(groupId, userId);

    if (!group) {
      throw NotFoundError.group();
    }

    const member = group.members[0];
    if (!member || member.role !== 'OWNER') {
      throw new AuthorizationError('Only the group owner can delete the group');
    }

    await groupRepository.softDelete(groupId);

    logger.info('Group deleted', { groupId, deletedBy: userId });
    return { message: 'Group deleted successfully' };
  }

  // ==================== Join Requests ====================

  /**
   * Request to join a public group
   */
  async requestToJoin(groupId, userId, message) {
    const group = await groupRepository.findActiveById(groupId, {
      members: { where: { leftAt: null } },
    });

    if (!group) {
      throw NotFoundError.group();
    }

    if (group.type !== 'PUBLIC') {
      throw new ConflictError('This group is not accepting join requests');
    }

    const isMember = group.members.some((m) => m.userId === userId);
    if (isMember) {
      throw new ConflictError('You are already a member of this group');
    }

    if (group.members.length >= group.maxMembers) {
      throw new ConflictError('This group is full');
    }

    const existingRequest = await joinRequestRepository.findExisting(groupId, userId);

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        throw new ConflictError('You already have a pending request');
      }
      if (existingRequest.status === 'REJECTED') {
        const updated = await joinRequestRepository.resubmitRequest(existingRequest.id, message);
        return updated;
      }
      if (existingRequest.status === 'APPROVED') {
        const existingMember = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId,
            },
          },
        });

        if (existingMember && existingMember.leftAt) {
          await prisma.groupMember.update({
            where: { id: existingMember.id },
            data: {
              leftAt: null,
              joinedAt: new Date(),
              role: 'MEMBER',
              rsvpStatus: 'GOING',
              rsvpAt: new Date(),
              isMuted: false,
            },
          });
        } else if (!existingMember) {
          await prisma.groupMember.create({
            data: {
              groupId,
              userId,
              role: 'MEMBER',
              rsvpStatus: 'GOING',
            },
          });
        }

        return { message: 'Successfully rejoined the group', rejoined: true };
      }
    }

    const joinRequest = await joinRequestRepository.createRequest(groupId, userId, message);

    logger.info('Join request created', { groupId, userId });
    return joinRequest;
  }

  /**
   * Get pending join requests
   */
    async getJoinRequests(groupId, { page = 1, limit = 20 }) {
      const result = await joinRequestRepository.getPendingRequests(groupId, { page, limit });
      const userIds = result.data.map((request) => request.userId);
      const profiles = await this._fetchUserProfiles(userIds);
      const requests = result.data.map((request) => {
        const profile = profiles[request.userId] || {};
        const name = profile.name || `User ${request.userId}`;
        const avatar = profile.profilePicUrl || null;
        return {
          ...request,
          user: {
            name,
            profilePicUrl: avatar,
          },
        };
      });

      return {
        requests,
        pagination: result.pagination,
      };
    }

  /**
   * Handle join request (approve/reject)
   */
  async handleJoinRequest(requestId, adminId, action, reason = null) {
    const request = await joinRequestRepository.findWithGroup(requestId);

    if (!request) {
      throw new NotFoundError('Join request');
    }

    if (request.status !== 'PENDING') {
      throw new ConflictError('This request has already been handled');
    }

    if (action === 'approve' && request.group.members.length >= request.group.maxMembers) {
      throw new ConflictError('Group is full');
    }

    if (action === 'approve') {
      const existingMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: request.groupId,
            userId: request.userId,
          },
        },
      });

      if (existingMember && !existingMember.leftAt) {
        throw new ConflictError('User is already a member of this group');
      }

      await prisma.$transaction(async (tx) => {
        await tx.joinRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            respondedBy: adminId,
            respondedAt: new Date(),
          },
        });

        if (existingMember && existingMember.leftAt) {
          await tx.groupMember.update({
            where: { id: existingMember.id },
            data: {
              leftAt: null,
              joinedAt: new Date(),
              role: 'MEMBER',
              rsvpStatus: 'GOING',
              rsvpAt: new Date(),
              isMuted: false,
            },
          });
        } else {
          await tx.groupMember.create({
            data: {
              groupId: request.groupId,
              userId: request.userId,
              role: 'MEMBER',
              rsvpStatus: 'GOING',
            },
          });
        }
      });

      logger.info('Join request approved', { requestId, approvedBy: adminId });
      return { message: 'Join request approved' };
    } else {
      await joinRequestRepository.reject(requestId, adminId);

      logger.info('Join request rejected', { requestId, rejectedBy: adminId });
      return { message: 'Join request rejected' };
    }
  }

  // ==================== Statistics ====================

  /**
   * Get group statistics
   */
  async getGroupStats(groupId) {
    const group = await groupRepository.findForStats(groupId);

    if (!group) {
      throw NotFoundError.group();
    }

    const totalExpenses = group.expenses.reduce(
      (sum, e) => sum + parseFloat(e.amount),
      0
    );

    const rsvpBreakdown = {
      going: group.members.filter((m) => m.rsvpStatus === 'GOING').length,
      maybe: group.members.filter((m) => m.rsvpStatus === 'MAYBE').length,
      notGoing: group.members.filter((m) => m.rsvpStatus === 'NOT_GOING').length,
      pending: group.members.filter((m) => m.rsvpStatus === 'PENDING').length,
    };

    return {
      memberCount: group._count.members,
      itineraryCount: group._count.itinerary,
      expenseCount: group._count.expenses,
      pollCount: group._count.polls,
      totalExpenses,
      currency: group.currency,
      rsvpBreakdown,
      daysUntilTrip: group.startDate
        ? Math.ceil((new Date(group.startDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null,
      tripDuration: group.startDate && group.endDate
        ? Math.ceil((new Date(group.endDate) - new Date(group.startDate)) / (1000 * 60 * 60 * 24))
        : null,
    };
  }

  /**
   * Get expense summary for a group
   */
  async getExpenseSummary(groupId) {
    const group = await groupRepository.findWithExpenses(groupId);

    if (!group) {
      throw NotFoundError.group();
    }

    const memberIds = group.members.map((m) => m.userId);

    const balances = {};
    memberIds.forEach((id) => {
      balances[id] = { paid: 0, owes: 0, balance: 0 };
    });

    group.expenses.forEach((expense) => {
      if (balances[expense.paidBy]) {
        balances[expense.paidBy].paid += parseFloat(expense.amount);
      }

      expense.splits.forEach((split) => {
        if (balances[split.userId] && !split.isSettled) {
          balances[split.userId].owes += parseFloat(split.amount);
        }
      });
    });

    Object.keys(balances).forEach((id) => {
      balances[id].balance = balances[id].paid - balances[id].owes;
    });

    return {
      balances,
      totalExpenses: Object.values(balances).reduce((sum, b) => sum + b.paid, 0),
      currency: group.currency,
    };
  }

  // ==================== Invite Code Functions ====================

  /**
   * Preview group by invite code (before joining)
   */
  async previewGroupByCode(inviteCode) {
    const group = await prisma.group.findUnique({
      where: { inviteCode },
      include: {
        _count: {
          select: {
            members: { where: { leftAt: null } },
          },
        },
      },
    });

    if (!group || !group.isActive) {
      throw new NotFoundError('Invalid invite code');
    }

    // Calculate available spots
    const memberCount = group._count.members;
    const spotsLeft = group.maxMembers - memberCount;

    // Format dates for frontend
    const formatDate = (date) => {
      if (!date) return null;
      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      destination: group.destination,
      imageUrl: group.imageUrl,
      startDate: formatDate(group.startDate),
      endDate: formatDate(group.endDate),
      memberCount,
      spotsLeft,
      type: group.type,
    };
  }

  /**
   * Join group using invite code
   */
  async joinGroupByCode(inviteCode, userId) {
    const group = await prisma.group.findUnique({
      where: { inviteCode },
      include: {
        members: {
          where: { leftAt: null },
        },
      },
    });

    if (!group || !group.isActive) {
      throw new NotFoundError('Invalid invite code');
    }

    // Check if already a member
    const isMember = group.members.some((m) => m.userId === userId);
    if (isMember) {
      throw new ConflictError('You are already a member of this group');
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId,
        },
      },
    });

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      throw new ConflictError('This group is full');
    }

    if (existingMember && existingMember.leftAt) {
      await prisma.groupMember.update({
        where: { id: existingMember.id },
        data: {
          leftAt: null,
          joinedAt: new Date(),
          role: 'MEMBER',
          rsvpStatus: 'GOING',
          rsvpAt: new Date(),
          isMuted: false,
        },
      });

      logger.info('User rejoined group via invite code', { groupId: group.id, userId, inviteCode });

      return {
        groupId: group.id,
        message: 'Successfully rejoined the group',
      };
    }

    // Add user to group with RSVP status for data consistency
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'MEMBER',
        rsvpStatus: 'GOING', // Fix: Add rsvpStatus for consistency with other member creation
      },
    });

    logger.info('User joined group via invite code', { groupId: group.id, userId, inviteCode });

    return {
      groupId: group.id,
      message: 'Successfully joined the group',
    };
  }

  /**
   * Get travellers nearby (same destination with status filtering and date overlap)
   * @param {number} currentUserId - Current user ID to exclude from results
   * @param {string} destination - Optional specific destination to filter by
   * @param {string|string[]} statusFilter - Status filter (ignored; ON_TOUR only)
   */
  async getTravellersNearby(
      currentUserId,
      destination = null,
      statusFilter = null,
      manualSearch = false,
      startDate = null,
      endDate = null,
      feed = false
    ) {
      try {
        const rawStatuses = Array.isArray(statusFilter)
          ? statusFilter
          : typeof statusFilter === 'string'
          ? statusFilter.split(',')
          : [];
        const normalizedStatuses = rawStatuses
          .map((status) => String(status || '').trim().toUpperCase())
          .filter(Boolean);
        const allowedStatuses = ['ON_TOUR', 'PLANNING', 'COMPLETED'];
        const filteredStatuses = normalizedStatuses.filter((status) => allowedStatuses.includes(status));
        const hasExplicitStatusFilter = filteredStatuses.length > 0;
        const isManualSearch = manualSearch === true || manualSearch === 'true';
        // For manual search, include both PLANNING and ON_TOUR statuses by default
        const defaultStatuses = isManualSearch ? ['ON_TOUR', 'PLANNING'] : ['ON_TOUR'];
        const resolvedStatuses = hasExplicitStatusFilter ? filteredStatuses : defaultStatuses;
        let statusSet = new Set(resolvedStatuses);
        let rangeStart = startDate ? new Date(startDate) : null;
        let rangeEnd = endDate ? new Date(endDate) : null;
        if (rangeStart && Number.isNaN(rangeStart.getTime())) rangeStart = null;
        if (rangeEnd && Number.isNaN(rangeEnd.getTime())) rangeEnd = null;
        if (!rangeStart && rangeEnd) rangeStart = rangeEnd;
        if (!rangeEnd && rangeStart) rangeEnd = rangeStart;
        const hasDateFilter = Boolean(rangeStart && rangeEnd);
        let usePublicFeed = feed === true || feed === 'true';
        let requireOverlap = false;

      // Build query - either for specific destination or all destinations from user's groups
      const whereClause = {
        isActive: true,
        deletedAt: null,
      };

      let userDestinations = [];
      if (destination) {
        whereClause.destination = {
          contains: destination,
          mode: 'insensitive',
        };
      } else if (!usePublicFeed) {
        // Get user's groups to find their destinations
        const userGroups = await prisma.groupMember.findMany({
          where: {
            userId: currentUserId,
            leftAt: null,
          },
          include: {
            group: {
              select: {
                destination: true,
                startDate: true,
                endDate: true,
                manualStartDate: true,
                manualEndDate: true,
                status: true,
              },
            },
          },
        });

        const activeDestinations = userGroups
          .map((ug) => ug.group)
          .filter((group) => statusSet.has(this._calculateGroupStatus(group)))
          .map((group) => this._normalizeDestination(group.destination))
          .filter(Boolean);

        const seenDestinations = new Set();
        userDestinations = activeDestinations.filter((dest) => {
          const key = dest.toLowerCase();
          if (seenDestinations.has(key)) return false;
          seenDestinations.add(key);
          return true;
        });
        if (userDestinations.length === 0) {
          usePublicFeed = true;
        } else {
          whereClause.OR = userDestinations.map((dest) => ({
            destination: { equals: dest, mode: 'insensitive' },
          }));
        }
      }

      if (usePublicFeed) {
        whereClause.type = 'PUBLIC';
        if (!hasExplicitStatusFilter) {
          statusSet = new Set(['ON_TOUR', 'PLANNING']);
        }
      }
      requireOverlap = !usePublicFeed && !isManualSearch && !hasDateFilter && statusSet.size === 1 && statusSet.has('ON_TOUR');

      // Find all groups matching the destination(s) and status
      const groups = await prisma.group.findMany({
        where: whereClause,
        include: {
          members: {
            where: {
              leftAt: null,
              userId: { not: currentUserId }, // Exclude current user
            },
            select: {
              userId: true,
              role: true,
              joinedAt: true,
            },
          },
        },
      });

      // Get user's trip dates for overlap checking
      let userTripDates = [];
      if (requireOverlap) {
        userTripDates = await this._getUserTripDates(currentUserId);
        if (userTripDates.length === 0) {
          return { travellers: [], stats: { total: 0, destinations: userDestinations } };
        }
      }

      // Collect unique user IDs with trip data
      const userMap = new Map();
      for (const group of groups) {
        const groupStatus = this._calculateGroupStatus(group);
        if (!statusSet.has(groupStatus)) {
          continue;
        }
        const resolvedDestination = this._normalizeDestination(group.destination);
        if (!resolvedDestination) {
          continue;
        }
        const effectiveStart = group.manualStartDate || group.startDate;
        const effectiveEnd = group.manualEndDate || group.endDate;

        if (hasDateFilter) {
          if (!effectiveStart || !effectiveEnd) {
            continue;
          }
          const groupStartTime = new Date(effectiveStart).getTime();
          const groupEndTime = new Date(effectiveEnd).getTime();
          if (Number.isNaN(groupStartTime) || Number.isNaN(groupEndTime)) {
            continue;
          }
          const filterStartTime = rangeStart.getTime();
          const filterEndTime = rangeEnd.getTime();
          if (groupStartTime > filterEndTime || groupEndTime < filterStartTime) {
            continue;
          }
        }

        const groupType = String(group.type || 'PRIVATE').toUpperCase();
        const groupVisibility = groupType === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE';
        const isPublicGroup = groupVisibility === 'PUBLIC';

        for (const member of group.members) {
          // Check date overlap if dates are available
          const hasOverlap = requireOverlap && effectiveStart && effectiveEnd
            ? this._checkDateOverlap(userTripDates, effectiveStart, effectiveEnd, resolvedDestination)
            : true; // Include if no dates set or overlap not required

          if (!hasOverlap) {
            continue;
          }

          const nextTripData = {
              userId: member.userId,
              groupName: group.name,
              groupId: group.id,
              destination: resolvedDestination,
              startDate: effectiveStart,
              endDate: effectiveEnd,
              travelDates: effectiveStart && effectiveEnd
                ? this._formatDateRange(effectiveStart, effectiveEnd)
                : 'Dates TBD',
              joinedAt: member.joinedAt,
              status: groupStatus,
              groupType: groupVisibility,
            };

          const existingTripData = userMap.get(member.userId);
          if (!existingTripData) {
            userMap.set(member.userId, nextTripData);
            continue;
          }

          if (existingTripData.groupType !== 'PUBLIC' && isPublicGroup) {
            userMap.set(member.userId, nextTripData);
          }
        }
      }

      if (userMap.size === 0) {
        return { travellers: [], stats: { total: 0, destinations: userDestinations } };
      }

      // Fetch user profiles from user-service
      const userIds = Array.from(userMap.keys());
      const userProfiles = await this._fetchUserProfiles(userIds);

      // Fetch connection statuses from user-service
      const connectionStatuses = await this._fetchConnectionStatuses(currentUserId, userIds);

      // Transform to traveller format with enriched data
      const travellers = Array.from(userMap.values()).map((tripData) => {
        const profile = userProfiles[tripData.userId] || {};
        const connectionEntry = connectionStatuses[tripData.userId];
        const rawStatus = typeof connectionEntry === 'string'
          ? connectionEntry
          : connectionEntry?.status;
        const connectionId = typeof connectionEntry === 'object'
          ? connectionEntry?.connectionId
          : null;
        const resolvedStatus = rawStatus || 'NONE';
        // Keep BLOCKED as distinct status so frontend can hide these users
        const connectionStatus = resolvedStatus;

        const isPublicGroup = tripData.groupType === 'PUBLIC';

        return {
          id: `traveller-${tripData.userId}`,
          userId: tripData.userId,
          name: profile.name || `User ${tripData.userId}`,
          age: profile.dateOfBirth ? this._calculateAge(profile.dateOfBirth) : null,
          profileImage: profile.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tripData.userId}`,
          isNew: Date.now() - new Date(tripData.joinedAt).getTime() < 7 * 24 * 60 * 60 * 1000,
          currentLocation: profile.currentLocationName
            || (profile.city && profile.country ? `${profile.city}, ${profile.country}` : 'Location not shared'),
          destination: tripData.destination,
          whyConnect: this._generateWhyConnect(tripData, profile),
          interests: profile.interests || [],
          languages: profile.languages || [],
          travelDates: tripData.travelDates,
          groupName: isPublicGroup ? tripData.groupName : '',
          groupId: tripData.groupId,
          status: tripData.status,
          connectionStatus, // NONE, PENDING, ACCEPTED, REJECTED
          connectionId,
        };
      });

      if (usePublicFeed && travellers.length > 1) {
        for (let i = travellers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [travellers[i], travellers[j]] = [travellers[j], travellers[i]];
        }
      }

      // Generate stats
      const stats = {
        total: travellers.length,
        destinations: [...new Set(travellers.map(t => t.destination))],
      };

        return { travellers, stats };
      } catch (error) {
        logger.error('getTravellersNearby error:', error);
        throw error;
      }
    }

    /**
     * Get distinct destinations from public active groups
     */
    async getGroupDestinations() {
      try {
        const groups = await prisma.group.findMany({
          where: {
            isActive: true,
            deletedAt: null,
            type: 'PUBLIC',
            destination: { not: null },
          },
          select: { destination: true },
        });

        const unique = new Set();
        for (const group of groups) {
          const normalized = this._normalizeDestination(group.destination);
          if (normalized) unique.add(normalized);
        }

        const destinations = Array.from(unique).sort((a, b) => a.localeCompare(b));
        return { destinations };
      } catch (error) {
        logger.error('getGroupDestinations error:', error);
        throw error;
      }
    }

    /**
     * Get nearby planning groups (public only) with optional destination/date filter
     * @param {number} currentUserId
     * @param {string|null} destination
     * @param {string|null} startDate
     * @param {string|null} endDate
     */
  async getNearbyGroups(currentUserId, destination = null, startDate = null, endDate = null, feed = false) {
    try {
      const whereClause = {
          isActive: true,
          deletedAt: null,
          type: 'PUBLIC',
          members: {
            none: {
              userId: currentUserId,
              leftAt: null,
            },
          },
        };

        let usePublicFeed = feed === true || feed === 'true';
        let userDestinations = [];
        if (destination) {
          whereClause.destination = {
            contains: destination,
            mode: 'insensitive',
          };
        } else if (!usePublicFeed) {
          const userGroups = await prisma.groupMember.findMany({
            where: {
              userId: currentUserId,
              leftAt: null,
            },
            include: {
              group: {
                select: {
                  destination: true,
                  startDate: true,
                  endDate: true,
                  manualStartDate: true,
                  manualEndDate: true,
                  status: true,
                },
              },
            },
          });

          const activeDestinations = userGroups
            .map((ug) => ug.group)
            .filter((group) => {
              const status = this._calculateGroupStatus(group);
              return status === 'ON_TOUR' || status === 'PLANNING';
            })
            .map((group) => this._normalizeDestination(group.destination))
            .filter(Boolean);

          const seenDestinations = new Set();
          userDestinations = activeDestinations.filter((dest) => {
            const key = dest.toLowerCase();
            if (seenDestinations.has(key)) return false;
            seenDestinations.add(key);
            return true;
          });
          if (userDestinations.length === 0) {
            usePublicFeed = true;
          } else {
            whereClause.OR = userDestinations.map((dest) => ({
              destination: { equals: dest, mode: 'insensitive' },
            }));
          }
        }

        const groups = await prisma.group.findMany({
          where: whereClause,
          include: {
            _count: { select: { members: { where: { leftAt: null } } } },
          },
          orderBy: { createdAt: 'desc' },
        });

        let queryStart = startDate ? new Date(startDate) : null;
        let queryEnd = endDate ? new Date(endDate) : null;
        if (queryStart && Number.isNaN(queryStart.getTime())) queryStart = null;
        if (queryEnd && Number.isNaN(queryEnd.getTime())) queryEnd = null;
        if (!queryStart && queryEnd) queryStart = queryEnd;
        if (!queryEnd && queryStart) queryEnd = queryStart;
        const hasDateFilter = Boolean(queryStart && queryEnd);

        const planningGroups = groups
          .filter((group) => this._calculateGroupStatus(group) === 'PLANNING')
          .filter((group) => {
            const normalizedDestination = this._normalizeDestination(group.destination);
            if (!normalizedDestination) return false;

            if (!hasDateFilter) return true;

            const effectiveStart = group.manualStartDate || group.startDate;
            const effectiveEnd = group.manualEndDate || group.endDate;

            if (!effectiveStart || !effectiveEnd) return false;

            const startTime = new Date(effectiveStart).getTime();
            const endTime = new Date(effectiveEnd).getTime();
            if (Number.isNaN(startTime) || Number.isNaN(endTime)) return false;

            const filterStart = queryStart.getTime();
            const filterEnd = queryEnd.getTime();

            return startTime <= filterEnd && endTime >= filterStart;
          });

        if (planningGroups.length === 0) {
          return { groups: [], stats: { total: 0, destinations: userDestinations } };
        }

        const joinRequests = await prisma.joinRequest.findMany({
          where: {
            userId: currentUserId,
            groupId: { in: planningGroups.map((group) => group.id) },
          },
        });
        const joinRequestMap = new Map(joinRequests.map((request) => [request.groupId, request.status]));

        const responseGroups = planningGroups.map((group) => {
          const memberCount = group._count?.members ?? 0;
          const spotsLeft = Math.max(group.maxMembers - memberCount, 0);
          const effectiveStart = group.manualStartDate || group.startDate;
          const effectiveEnd = group.manualEndDate || group.endDate;

          return {
            id: group.id,
            name: group.name,
            imageUrl: group.imageUrl,
            destination: this._normalizeDestination(group.destination),
            startDate: effectiveStart,
            endDate: effectiveEnd,
            travelDates: effectiveStart && effectiveEnd
              ? this._formatDateRange(effectiveStart, effectiveEnd)
              : 'Dates TBD',
            memberCount,
            maxMembers: group.maxMembers,
            spotsLeft,
            status: 'PLANNING',
            joinStatus: joinRequestMap.get(group.id) || 'NONE',
          };
        });

        if (usePublicFeed && responseGroups.length > 1) {
          for (let i = responseGroups.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [responseGroups[i], responseGroups[j]] = [responseGroups[j], responseGroups[i]];
          }
        }

        const stats = {
          total: responseGroups.length,
          destinations: [...new Set(responseGroups.map((group) => group.destination).filter(Boolean))],
        };

        return { groups: responseGroups, stats };
      } catch (error) {
        logger.error('getNearbyGroups error:', error);
        throw error;
      }
    }

    /**
     * Get nearby inbox conversations (direct chats with nearby travellers)
     * @param {number} currentUserId
     * @param {string} authHeader
     * @param {string|null} destination
     */
    async getNearbyInbox(currentUserId, authHeader, destination = null, startDate = null, endDate = null) {
      try {
        if (!authHeader) {
          throw new AuthorizationError('Authorization header required');
        }

        const nearbyResult = await this.getTravellersNearby(
          currentUserId,
          destination,
          ['ON_TOUR', 'PLANNING'],
          false,
          startDate,
          endDate
        );
        const travellers = nearbyResult.travellers || [];
        const travellerMap = new Map(
          travellers.map((traveller) => [String(traveller.userId), traveller])
        );
        const hasDestinationFilter = Boolean(destination);

        const conversations = await this._fetchUserConversations(authHeader);
        const directConversations = conversations.filter(
          (conversation) => conversation.type === 'DIRECT'
        );
        const otherUserIds = directConversations
          .map((conversation) => {
            const participants = Array.isArray(conversation.participants)
              ? conversation.participants
              : [];
            const otherParticipant = participants.find(
              (participant) => String(participant.userId) !== String(currentUserId)
            );
            return otherParticipant ? Number(otherParticipant.userId) : null;
          })
          .filter((id) => Number.isFinite(id));
        const uniqueOtherUserIds = Array.from(new Set(otherUserIds));
        const userProfiles = await this._fetchUserProfiles(uniqueOtherUserIds);

        const inboxItems = directConversations
          .map((conversation) => {
            const participants = Array.isArray(conversation.participants)
              ? conversation.participants
              : [];
            const otherParticipant = participants.find(
              (participant) => String(participant.userId) !== String(currentUserId)
            );
            if (!otherParticipant) return null;

            const otherUserId = String(otherParticipant.userId);
            const traveller = travellerMap.get(otherUserId);
            if (hasDestinationFilter && !traveller) return null;

            const profile = userProfiles[otherUserId] || {};
            const lastMessage = conversation.lastMessage || null;
            const lastMessageAt = lastMessage?.createdAt || conversation.lastMessageAt || null;

            return {
              conversationId: conversation.id,
              userId: Number(otherUserId),
              name: traveller?.name || profile.name || `User ${otherUserId}`,
              profileImage: traveller?.profileImage || profile.profilePicUrl || null,
              destination: traveller?.destination || null,
              travelDates: traveller?.travelDates || null,
              lastMessage: lastMessage
                ? {
                    id: lastMessage.id,
                    content: lastMessage.content,
                    type: lastMessage.type,
                    createdAt: lastMessage.createdAt,
                  }
                : null,
              unreadCount: conversation.unreadCount || 0,
              lastMessageAt,
            };
          })
          .filter(Boolean);

        const consolidatedMap = new Map();
        inboxItems.forEach((item) => {
          const key = String(item.userId);
          const existing = consolidatedMap.get(key);
          if (!existing) {
            consolidatedMap.set(key, {
              ...item,
              unreadCount: item.unreadCount > 0 ? 1 : 0,
            });
            return;
          }

          const existingTime = existing.lastMessageAt ? new Date(existing.lastMessageAt).getTime() : 0;
          const itemTime = item.lastMessageAt ? new Date(item.lastMessageAt).getTime() : 0;
          const hasUnread = (existing.unreadCount || 0) > 0 || (item.unreadCount || 0) > 0;

          if (itemTime > existingTime) {
            consolidatedMap.set(key, {
              ...existing,
              ...item,
              unreadCount: hasUnread ? 1 : 0,
            });
          } else {
            consolidatedMap.set(key, {
              ...existing,
              unreadCount: hasUnread ? 1 : 0,
              destination: existing.destination || item.destination,
              travelDates: existing.travelDates || item.travelDates,
              profileImage: existing.profileImage || item.profileImage,
              name: existing.name || item.name,
            });
          }
        });

        const consolidatedItems = Array.from(consolidatedMap.values()).sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        });

        const stats = {
          total: consolidatedItems.length,
          unread: consolidatedItems.filter((item) => (item.unreadCount || 0) > 0).length,
          destinations: [...new Set(consolidatedItems.map((item) => item.destination).filter(Boolean))],
        };

        return { conversations: consolidatedItems, stats };
      } catch (error) {
        logger.error('getNearbyInbox error:', error);
        throw error;
      }
    }

  // ==================== Helper Methods for Travellers Nearby ====================

  /**
   * Get user's trip dates from all their groups
   */
  async _getUserTripDates(userId) {
    const userGroups = await prisma.groupMember.findMany({
      where: {
        userId,
        leftAt: null,
      },
      include: {
        group: {
          select: {
            destination: true,
            startDate: true,
            endDate: true,
            manualStartDate: true,
            manualEndDate: true,
            status: true,
          },
        },
      },
    });

    return userGroups
      .map((ug) => ug.group)
      .filter((group) => this._calculateGroupStatus(group) === 'ON_TOUR')
      .map((group) => ({
        destination: this._normalizeDestination(group.destination),
        startDate: group.manualStartDate || group.startDate,
        endDate: group.manualEndDate || group.endDate,
      }))
      .filter((trip) => Boolean(trip.destination));
  }

  _normalizeDestination(destination) {
    const value = (destination || '').trim();
    if (!value) return '';
    const lowered = value.toLowerCase();
    if (lowered.includes('to be decided') || lowered.includes('decided by vote')) {
      return '';
    }
    if (lowered === 'tbd' || lowered === 'destination tbd') {
      return '';
    }
    return value;
  }

  /**
   * Check if there's date overlap between user's trips and other user's trip
   */
  _checkDateOverlap(userTrips, otherStart, otherEnd, destination) {
    if (!otherStart || !otherEnd) return true; // Include if no dates

    const otherStartTime = new Date(otherStart).getTime();
    const otherEndTime = new Date(otherEnd).getTime();

    // Check if any of user's trips to the same destination overlap
    return userTrips.some(trip => {
      if (trip.destination !== destination) return false;
      if (!trip.startDate || !trip.endDate) return true; // Include if user's trip has no dates

      const tripStartTime = new Date(trip.startDate).getTime();
      const tripEndTime = new Date(trip.endDate).getTime();

      // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
      return tripStartTime <= otherEndTime && tripEndTime >= otherStartTime;
    });
  }

  /**
   * Format date range for display
   */
  _formatDateRange(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const formatOptions = { month: 'short', day: 'numeric' };

    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
  }

  /**
   * Fetch user profiles in batch from user-service
   */
  async _fetchUserProfiles(userIds) {
    try {
      if (!userIds || userIds.length === 0) return {};

      const response = await axios.post(
        `${config.services.user}/api/v1/users/profiles/batch`,
        { userIds },
        {
          headers: {
            'X-Internal-Service': 'group-service',
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      // Transform array response to map by userId
      const profiles = response.data.data || response.data || [];
      return profiles.reduce((acc, profile) => {
        acc[profile.authId || profile.userId || profile.id] = profile;
        return acc;
      }, {});
    } catch (error) {
      logger.error('_fetchUserProfiles error:', error.message);
      return {}; // Return empty object on error, don't fail the whole request
    }
  }

  /**
   * Fetch connection statuses in batch from user-service
   */
  async _fetchConnectionStatuses(currentUserId, targetUserIds) {
    try {
      if (!targetUserIds || targetUserIds.length === 0) return {};

      const response = await axios.post(
        `${config.services.user}/api/v1/users/connections/status/batch`,
        { targetUserIds },
        {
          headers: {
            'X-Internal-Service': 'group-service',
            'X-User-Auth-Id': String(currentUserId),
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      return response.data.data || response.data || {};
    } catch (error) {
      logger.error('_fetchConnectionStatuses error:', error.message);
      return {}; // Return empty object on error
    }
  }

  /**
   * Fetch user conversations from chat-service
   */
  async _fetchUserConversations(authHeader) {
    const fetchFrom = async (baseUrl, useGateway = false) => {
      const url = useGateway
        ? `${baseUrl}/chat/conversations`
        : `${baseUrl}/api/v1/chat/conversations`;

      const response = await axios.get(url, {
        headers: {
          Authorization: authHeader,
          'X-Internal-Service': 'group-service',
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 second timeout for chat service
      });

      const payload = response.data?.data || response.data || [];
      if (Array.isArray(payload)) {
        return payload;
      }
      if (Array.isArray(payload?.conversations)) {
        return payload.conversations;
      }
      return [];
    };

    try {
      return await fetchFrom(config.services.chat);
    } catch (error) {
      logger.error('_fetchUserConversations error:', error.message);
      try {
        return await fetchFrom(config.apiGateway.url, true);
      } catch (fallbackError) {
        logger.error('_fetchUserConversations gateway fallback error:', fallbackError.message);
        return [];
      }
    }
  }

  /**
   * Generate "why connect" reasons based on trip data and profile
   */
  _generateWhyConnect(tripData, profile) {
    const reasons = [];

    // Reason 1: Destination and dates
    if (tripData.destination) {
      const dateInfo = tripData.travelDates !== 'Dates TBD' ? ` (${tripData.travelDates})` : '';
      reasons.push(`Traveling to ${tripData.destination}${dateInfo}`);
    }

    // Reason 2: Shared interests
    if (profile.interests && profile.interests.length > 0) {
      const interestsList = profile.interests.slice(0, 3).join(', ');
      reasons.push(`Interests: ${interestsList}`);
    }

    // Reason 3: Languages or other profile info
    if (profile.languages && profile.languages.length > 0) {
      reasons.push(`Speaks ${profile.languages.join(', ')}`);
    } else if (profile.city && profile.country) {
      reasons.push(`From ${profile.city}, ${profile.country}`);
    } else if (tripData.groupName && tripData.groupType === 'PUBLIC') {
      reasons.push(`Member of ${tripData.groupName}`);
    }

    // Ensure we have at least 3 reasons (pad with generic if needed)
    while (reasons.length < 3) {
      reasons.push('Potential travel companion');
    }

    return reasons.slice(0, 3);
  }

  /**
   * Calculate age from date of birth
   */
  _calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // ==================== Status Management ====================

  /**
   * Calculate effective group status based on manual overrides and dates
   * @private
   */
  _calculateGroupStatus(group) {
    const now = new Date();
    const effectiveStart = group.manualStartDate || group.startDate;
    const effectiveEnd = group.manualEndDate || group.endDate;

    // If group has explicit status field and manual dates support it, use it
    if (group.status) {
      if (group.status === 'ON_TOUR') {
        // Verify ON_TOUR is valid (within date range if dates exist)
        if (effectiveStart && effectiveEnd) {
          if (now >= effectiveStart && now <= effectiveEnd) return 'ON_TOUR';
          if (now > effectiveEnd) return 'COMPLETED';
          return 'PLANNING';
        }
        return 'ON_TOUR'; // Trust manual status if no dates
      }
      if (group.status === 'COMPLETED') return 'COMPLETED';
    }

    // Auto-calculate from dates
    if (!effectiveStart || !effectiveEnd) return 'PLANNING';
    if (now < effectiveStart) return 'PLANNING';
    if (now >= effectiveStart && now <= effectiveEnd) return 'ON_TOUR';
    if (now > effectiveEnd) return 'COMPLETED';

    return 'PLANNING';
  }

  /**
   * Update group status manually (Start Early / End Early)
   */
  async updateGroupStatus(groupId, userId, action, payload = {}) {
    const group = await groupRepository.findWithMemberCheck(groupId, userId);

    if (!group) {
      throw NotFoundError.group();
    }

    const member = group.members[0];
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw new AuthorizationError('Only group owners and admins can update status');
    }

    const now = new Date();
    let updateData = {};

    switch (action) {
      case 'START_EARLY':
        updateData = {
          manualStartDate: now,
          status: 'ON_TOUR',
        };
        logger.info('Group started early', { groupId, userId });
        break;

      case 'END_EARLY':
        updateData = {
          manualEndDate: now,
          status: 'COMPLETED',
        };
        logger.info('Group ended early', { groupId, userId });
        break;

      case 'RESET_DATES':
        updateData = {
          manualStartDate: null,
          manualEndDate: null,
          status: 'PLANNING',
        };
        logger.info('Group dates reset', { groupId, userId });
        break;

      case 'EXTEND_TRIP': {
        const currentStatus = this._calculateGroupStatus(group);
        if (currentStatus !== 'ON_TOUR') {
          throw new ConflictError('Can only extend a trip that is currently ON_TOUR');
        }

        const extendByDays = Number(payload.extendByDays);
        const newEndDateInput = payload.newEndDate;
        let newEndDate = null;

        if (newEndDateInput) {
          newEndDate = new Date(newEndDateInput);
          if (Number.isNaN(newEndDate.getTime())) {
            throw new ConflictError('Invalid newEndDate provided');
          }
        } else if (Number.isFinite(extendByDays) && extendByDays > 0) {
          const baseDate = group.manualEndDate || group.endDate || now;
          newEndDate = new Date(baseDate);
          newEndDate.setDate(newEndDate.getDate() + extendByDays);
        } else {
          throw new ConflictError('extendByDays or newEndDate is required to extend trip');
        }

        updateData = {
          manualEndDate: newEndDate,
          status: 'ON_TOUR',
        };
        logger.info('Group trip extended', { groupId, userId, newEndDate });
        break;
      }

      default:
        throw new ConflictError('Invalid action. Use START_EARLY, END_EARLY, RESET_DATES, or EXTEND_TRIP');
    }

    const updated = await groupRepository.updateById(groupId, updateData);

    return {
      ...updated,
      calculatedStatus: this._calculateGroupStatus(updated),
    };
  }
}

module.exports = new GroupService();
