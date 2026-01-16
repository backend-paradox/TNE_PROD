const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

/**
 * Get group itinerary
 */
const getGroupItinerary = async (groupId, date = null) => {
  const where = { groupId };

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    where.date = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const items = await prisma.itineraryItem.findMany({
    where,
    include: {
      votes: true,
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' },
    ],
  });

  // Calculate vote counts
  return items.map(item => {
    const upVotes = item.votes.filter(v => v.vote === 'UP').length;
    const downVotes = item.votes.filter(v => v.vote === 'DOWN').length;
    return {
      ...item,
      upVotes,
      downVotes,
      votes: undefined, // Remove raw votes
    };
  });
};

/**
 * Create itinerary item
 */
const createItem = async (groupId, userId, data) => {
  const item = await prisma.itineraryItem.create({
    data: {
      groupId,
      createdBy: userId,
      title: data.title,
      description: data.description,
      location: data.location,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      category: data.category,
      bookingId: data.bookingId,
      estimatedCost: data.estimatedCost,
      actualCost: data.actualCost,
    },
    include: {
      votes: true,
    },
  });

  return {
    ...item,
    upVotes: 0,
    downVotes: 0,
  };
};

/**
 * Update itinerary item
 */
const updateItem = async (itemId, userId, data, isAdmin = false) => {
  // Check if item exists and user can update
  const item = await prisma.itineraryItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw ApiError.notFound('Itinerary item not found');
  }

  // Only creator or admin can update
  if (item.createdBy !== userId && !isAdmin) {
    throw ApiError.forbidden('You can only update your own items');
  }

  const updatedItem = await prisma.itineraryItem.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      date: data.date ? new Date(data.date) : undefined,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      category: data.category,
      bookingId: data.bookingId,
      estimatedCost: data.estimatedCost,
      actualCost: data.actualCost,
    },
    include: {
      votes: true,
    },
  });

  const upVotes = updatedItem.votes.filter(v => v.vote === 'UP').length;
  const downVotes = updatedItem.votes.filter(v => v.vote === 'DOWN').length;

  return {
    ...updatedItem,
    upVotes,
    downVotes,
    votes: undefined,
  };
};

/**
 * Delete itinerary item
 */
const deleteItem = async (itemId) => {
  const item = await prisma.itineraryItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw ApiError.notFound('Itinerary item not found');
  }

  await prisma.itineraryItem.delete({
    where: { id: itemId },
  });

  return { success: true };
};

/**
 * Vote on itinerary item
 */
const voteOnItem = async (itemId, userId, vote) => {
  // Validate vote type
  if (!['UP', 'DOWN'].includes(vote)) {
    throw ApiError.badRequest('Invalid vote type');
  }

  // Check if item exists
  const item = await prisma.itineraryItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw ApiError.notFound('Itinerary item not found');
  }

  // Upsert vote
  const voteRecord = await prisma.itineraryVote.upsert({
    where: {
      itineraryItemId_userId: {
        itineraryItemId: itemId,
        userId,
      },
    },
    update: {
      vote,
    },
    create: {
      itineraryItemId: itemId,
      userId,
      vote,
    },
  });

  // Get updated vote counts
  const votes = await prisma.itineraryVote.findMany({
    where: { itineraryItemId: itemId },
  });

  const upVotes = votes.filter(v => v.vote === 'UP').length;
  const downVotes = votes.filter(v => v.vote === 'DOWN').length;

  return {
    itemId,
    upVotes,
    downVotes,
    myVote: vote,
  };
};

/**
 * Remove vote from itinerary item
 */
const removeVote = async (itemId, userId) => {
  await prisma.itineraryVote.deleteMany({
    where: {
      itineraryItemId: itemId,
      userId,
    },
  });

  return { success: true };
};

/**
 * Confirm itinerary item
 */
const confirmItem = async (itemId) => {
  const item = await prisma.itineraryItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw ApiError.notFound('Itinerary item not found');
  }

  const updatedItem = await prisma.itineraryItem.update({
    where: { id: itemId },
    data: { isConfirmed: true },
  });

  return updatedItem;
};

/**
 * Get user's vote for an item
 */
const getUserVote = async (itemId, userId) => {
  const vote = await prisma.itineraryVote.findUnique({
    where: {
      itineraryItemId_userId: {
        itineraryItemId: itemId,
        userId,
      },
    },
  });

  return vote ? vote.vote : null;
};

module.exports = {
  getGroupItinerary,
  createItem,
  updateItem,
  deleteItem,
  voteOnItem,
  removeVote,
  confirmItem,
  getUserVote,
};
