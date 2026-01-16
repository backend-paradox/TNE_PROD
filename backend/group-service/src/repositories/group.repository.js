/**
 * Group Repository
 *
 * Handles all database operations for groups.
 */

const BaseRepository = require('../../../shared/src/repositories/BaseRepository');
const prisma = require('../config/prisma');

class GroupRepository extends BaseRepository {
  constructor() {
    super(prisma, 'group');
  }

  /**
   * Find active group by ID
   */
  async findActiveById(id, include = {}) {
    return this.model.findFirst({
      where: { id, isActive: true, deletedAt: null },
      include,
    });
  }

  /**
   * Find group with full details
   */
  async findWithDetails(groupId) {
    return this.model.findFirst({
      where: { id: groupId, isActive: true, deletedAt: null },
      include: {
        members: {
          where: { leftAt: null },
          orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
          // Note: User data is fetched from user-service separately (microservice architecture)
        },
        itinerary: {
          orderBy: { date: 'asc' },
          take: 10,
          include: {
            _count: { select: { votes: true } },
          },
        },
        polls: {
          where: { isClosed: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            options: {
              include: {
                _count: { select: { votes: true } },
              },
            },
          },
        },
        announcements: {
          where: { isPinned: true },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
        _count: {
          select: {
            members: { where: { leftAt: null } },
            itinerary: true,
            expenses: true,
            polls: true,
          },
        },
      },
    });
  }

  /**
   * Search public groups with filters
   */
  async searchPublic({ query, destination, startDate, endDate, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const where = {
      type: 'PUBLIC',
      isActive: true,
      deletedAt: null,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { destination: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(destination && { destination: { contains: destination, mode: 'insensitive' } }),
      ...(startDate && { startDate: { gte: new Date(startDate) } }),
      ...(endDate && { endDate: { lte: new Date(endDate) } }),
    };

    const [groups, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: { members: { where: { leftAt: null } } },
          },
        },
      }),
      this.model.count({ where }),
    ]);

    return {
      data: groups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get group with member check
   */
  async findWithMemberCheck(groupId, userId) {
    return this.model.findFirst({
      where: { id: groupId, isActive: true, deletedAt: null },
      include: { members: { where: { userId, leftAt: null } } },
    });
  }

  /**
   * Get group with expenses for summary
   */
  async findWithExpenses(groupId) {
    return this.model.findFirst({
      where: { id: groupId, deletedAt: null },
      include: {
        expenses: {
          include: { splits: true },
        },
        members: {
          where: { leftAt: null },
          select: { userId: true },
        },
      },
    });
  }

  /**
   * Get group stats data
   */
  async findForStats(groupId) {
    return this.model.findFirst({
      where: { id: groupId, deletedAt: null },
      include: {
        _count: {
          select: {
            members: { where: { leftAt: null } },
            itinerary: true,
            expenses: true,
            polls: true,
          },
        },
        expenses: {
          select: { amount: true, currency: true },
        },
        members: {
          where: { leftAt: null },
          select: { rsvpStatus: true },
        },
      },
    });
  }

  /**
   * Soft delete group
   */
  async softDelete(groupId) {
    return this.updateById(groupId, {
      isActive: false,
      deletedAt: new Date(),
    });
  }
}

module.exports = new GroupRepository();
