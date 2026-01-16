const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to check if user is a member of the group
 */
const isGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!member || member.leftAt) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    req.groupMember = member;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is an admin or owner of the group
 */
const isGroupAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!member || member.leftAt) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    if (!['OWNER', 'ADMIN'].includes(member.role)) {
      throw ApiError.forbidden('Admin privileges required');
    }

    req.groupMember = member;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is the owner of the group
 */
const isGroupOwner = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!member || member.leftAt) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    if (member.role !== 'OWNER') {
      throw ApiError.forbidden('Owner privileges required');
    }

    req.groupMember = member;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isGroupMember, isGroupAdmin, isGroupOwner };
