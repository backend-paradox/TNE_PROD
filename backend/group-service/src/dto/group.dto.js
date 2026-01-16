/**
 * Group Service DTOs (Data Transfer Objects)
 *
 * Transform data between layers for consistent API responses.
 */

// ==================== Group DTOs ====================

/**
 * Group summary for lists
 */
class GroupSummaryDTO {
  constructor(group) {
    this.id = group.id;
    this.name = group.name;
    this.description = group.description;
    this.imageUrl = group.imageUrl;
    this.destination = group.destination;
    this.startDate = group.startDate;
    this.endDate = group.endDate;
    this.type = group.type;
    this.memberCount = group._count?.members || group.memberCount || 0;
    this.maxMembers = group.maxMembers;
    this.spotsLeft = this.maxMembers - this.memberCount;
    this.createdAt = group.createdAt;
  }

  static from(group) {
    if (!group) return null;
    return new GroupSummaryDTO(group);
  }

  static fromMany(groups) {
    return groups.map(g => new GroupSummaryDTO(g));
  }
}

/**
 * User's group with membership info
 */
class UserGroupDTO {
  constructor(membership) {
    const group = membership.group;
    this.id = group.id;
    this.name = group.name;
    this.description = group.description;
    this.imageUrl = group.imageUrl;
    this.destination = group.destination;
    this.startDate = group.startDate;
    this.endDate = group.endDate;
    this.type = group.type;
    this.currency = group.currency;
    this.memberCount = group._count?.members || 0;
    this.itineraryCount = group._count?.itinerary || 0;
    this.expenseCount = group._count?.expenses || 0;
    this.activePollCount = group._count?.polls || 0;
    this.maxMembers = group.maxMembers;

    // Membership info
    this.myRole = membership.role;
    this.rsvpStatus = membership.rsvpStatus;
    this.joinedAt = membership.joinedAt;
    this.isMuted = membership.isMuted;
  }

  static from(membership) {
    if (!membership) return null;
    return new UserGroupDTO(membership);
  }

  static fromMany(memberships) {
    return memberships.map(m => new UserGroupDTO(m));
  }
}

/**
 * Full group details
 */
class GroupDetailDTO {
  constructor(group, userId) {
    this.id = group.id;
    this.name = group.name;
    this.description = group.description;
    this.imageUrl = group.imageUrl;
    this.destination = group.destination;
    this.startDate = group.startDate;
    this.endDate = group.endDate;
    this.budget = group.budget;
    this.budgetPerPerson = group.budgetPerPerson;
    this.currency = group.currency;
    this.type = group.type;
    this.maxMembers = group.maxMembers;
    this.isActive = group.isActive;
    this.createdBy = group.createdBy;
    this.createdAt = group.createdAt;
    this.updatedAt = group.updatedAt;

    // Counts
    this.memberCount = group._count?.members || group.members?.length || 0;
    this.itineraryCount = group._count?.itinerary || 0;
    this.expenseCount = group._count?.expenses || 0;
    this.pollCount = group._count?.polls || 0;

    // Related data
    this.members = group.members ? MemberDTO.fromMany(group.members) : [];
    this.itinerary = group.itinerary || [];
    this.polls = group.polls || [];
    this.announcements = group.announcements || [];

    // User's membership
    const membership = group.members?.find(m => m.userId === userId);
    this.myRole = membership?.role || null;
    this.rsvpStatus = membership?.rsvpStatus || null;
    this.isMember = !!membership;
  }

  static from(group, userId) {
    if (!group) return null;
    return new GroupDetailDTO(group, userId);
  }
}

// ==================== Member DTOs ====================

/**
 * Group member info
 */
class MemberDTO {
  constructor(member) {
    this.userId = member.userId;
    this.role = member.role;
    this.rsvpStatus = member.rsvpStatus;
    this.joinedAt = member.joinedAt;
    this.isMuted = member.isMuted;
  }

  static from(member) {
    if (!member) return null;
    return new MemberDTO(member);
  }

  static fromMany(members) {
    return members.map(m => new MemberDTO(m));
  }
}

// ==================== Join Request DTOs ====================

/**
 * Join request info
 */
class JoinRequestDTO {
  constructor(request) {
    this.id = request.id;
    this.groupId = request.groupId;
    this.userId = request.userId;
    this.message = request.message;
    this.status = request.status;
    this.createdAt = request.createdAt;
    this.respondedAt = request.respondedAt;
    this.respondedBy = request.respondedBy;
  }

  static from(request) {
    if (!request) return null;
    return new JoinRequestDTO(request);
  }

  static fromMany(requests) {
    return requests.map(r => new JoinRequestDTO(r));
  }
}

// ==================== Stats DTOs ====================

/**
 * Group statistics
 */
class GroupStatsDTO {
  constructor(stats) {
    this.memberCount = stats.memberCount;
    this.itineraryCount = stats.itineraryCount;
    this.expenseCount = stats.expenseCount;
    this.pollCount = stats.pollCount;
    this.totalExpenses = stats.totalExpenses;
    this.currency = stats.currency;
    this.rsvpBreakdown = stats.rsvpBreakdown;
    this.daysUntilTrip = stats.daysUntilTrip;
    this.tripDuration = stats.tripDuration;
  }

  static from(stats) {
    return new GroupStatsDTO(stats);
  }
}

/**
 * Expense summary
 */
class ExpenseSummaryDTO {
  constructor(summary) {
    this.balances = summary.balances;
    this.totalExpenses = summary.totalExpenses;
    this.currency = summary.currency;
  }

  static from(summary) {
    return new ExpenseSummaryDTO(summary);
  }
}

// ==================== Pagination DTO ====================

/**
 * Paginated response wrapper
 */
class PaginatedDTO {
  constructor(data, pagination, DTOClass = null) {
    this.data = DTOClass ? DTOClass.fromMany(data) : data;
    this.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
    };
  }

  static from(result, DTOClass = null) {
    return new PaginatedDTO(result.data, result.pagination, DTOClass);
  }
}

module.exports = {
  GroupSummaryDTO,
  UserGroupDTO,
  GroupDetailDTO,
  MemberDTO,
  JoinRequestDTO,
  GroupStatsDTO,
  ExpenseSummaryDTO,
  PaginatedDTO,
};
