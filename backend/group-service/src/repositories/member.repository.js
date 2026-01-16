/**
 * Group Member Repository
 *
 * Handles all database operations for group members and join requests.
 */

const BaseRepository = require('../../../shared/src/repositories/BaseRepository');
const prisma = require('../config/prisma');

// ==================== Group Member Repository ====================

class GroupMemberRepository extends BaseRepository {
  constructor() {
    super(prisma, 'groupMember');
  }

  /**
   * Find user's group memberships with pagination
   */
  async findUserMemberships(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const where = {
      userId,
      leftAt: null,
      group: { isActive: true, deletedAt: null },
    };

    const [memberships, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
        include: {
          group: {
            include: {
              _count: {
                select: {
                  members: { where: { leftAt: null } },
                  itinerary: true,
                  expenses: true,
                  polls: { where: { isClosed: false } },
                },
              },
            },
          },
        },
      }),
      this.model.count({ where }),
    ]);

    return {
      data: memberships,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find member in group
   */
  async findMember(groupId, userId) {
    return this.findFirst({
      groupId,
      userId,
      leftAt: null,
    });
  }

  /**
   * Check if user is member
   */
  async isMember(groupId, userId) {
    return this.exists({
      groupId,
      userId,
      leftAt: null,
    });
  }

  /**
   * Check if user has role in group
   */
  async hasRole(groupId, userId, roles) {
    const member = await this.findMember(groupId, userId);
    return member && roles.includes(member.role);
  }

  /**
   * Add member to group
   */
  async addMember(groupId, userId, data = {}) {
    return this.create({
      groupId,
      userId,
      role: data.role || 'MEMBER',
      rsvpStatus: data.rsvpStatus || 'PENDING',
      rsvpAt: data.rsvpStatus ? new Date() : null,
    });
  }

  /**
   * Update member role
   */
  async updateRole(groupId, userId, role) {
    return this.update(
      { groupId_userId: { groupId, userId } },
      { role }
    );
  }

  /**
   * Update RSVP status
   */
  async updateRsvp(groupId, userId, status) {
    return this.update(
      { groupId_userId: { groupId, userId } },
      { rsvpStatus: status, rsvpAt: new Date() }
    );
  }

  /**
   * Leave group (soft delete)
   */
  async leave(groupId, userId) {
    return this.update(
      { groupId_userId: { groupId, userId } },
      { leftAt: new Date() }
    );
  }

  /**
   * Get active members of group
   */
  async getActiveMembers(groupId) {
    return this.findAll(
      { groupId, leftAt: null },
      { orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }] }
    );
  }

  /**
   * Count active members
   */
  async countActiveMembers(groupId) {
    return this.count({ groupId, leftAt: null });
  }

  /**
   * Toggle mute for member
   */
  async toggleMute(groupId, userId, muted) {
    return this.update(
      { groupId_userId: { groupId, userId } },
      { isMuted: muted }
    );
  }
}

// ==================== Join Request Repository ====================

class JoinRequestRepository extends BaseRepository {
  constructor() {
    super(prisma, 'joinRequest');
  }

  /**
   * Find existing request
   */
  async findExisting(groupId, userId) {
    return this.findOne({ groupId_userId: { groupId, userId } });
  }

  /**
   * Create join request
   */
  async createRequest(groupId, userId, message) {
    return this.create({
      groupId,
      userId,
      message,
    });
  }

  /**
   * Update existing request to pending
   */
  async resubmitRequest(requestId, message) {
    return this.updateById(requestId, {
      message,
      status: 'PENDING',
      respondedBy: null,
      respondedAt: null,
      createdAt: new Date(),
    });
  }

  /**
   * Get pending requests for group
   */
  async getPendingRequests(groupId, { page = 1, limit = 20 } = {}) {
    return this.findWithPagination({
      where: { groupId, status: 'PENDING' },
      page,
      limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find request with group details
   */
  async findWithGroup(requestId) {
    return this.model.findUnique({
      where: { id: requestId },
      include: {
        group: {
          include: { members: { where: { leftAt: null } } },
        },
      },
    });
  }

  /**
   * Approve request
   */
  async approve(requestId, adminId) {
    return this.updateById(requestId, {
      status: 'APPROVED',
      respondedBy: adminId,
      respondedAt: new Date(),
    });
  }

  /**
   * Reject request
   */
  async reject(requestId, adminId) {
    return this.updateById(requestId, {
      status: 'REJECTED',
      respondedBy: adminId,
      respondedAt: new Date(),
    });
  }
}

module.exports = {
  groupMemberRepository: new GroupMemberRepository(),
  joinRequestRepository: new JoinRequestRepository(),
};
