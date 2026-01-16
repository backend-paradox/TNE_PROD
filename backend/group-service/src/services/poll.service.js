const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const isDestinationPoll = (poll) => {
  const question = (poll?.question || '').toLowerCase();
  return question.includes('destination') || question.includes('where');
};

const updateGroupDestinationFromPoll = async (poll) => {
  if (!poll || !isDestinationPoll(poll)) return;
  const options = poll.options || [];
  if (!options.length) return;
  const maxVotes = Math.max(...options.map((opt) => opt.voteCount || 0));
  if (maxVotes <= 0) return;
  const winners = options.filter((opt) => (opt.voteCount || 0) === maxVotes);
  if (winners.length !== 1) return;
  const winner = (winners[0].text || '').trim();
  if (!winner) return;

  await prisma.group.update({
    where: { id: poll.groupId },
    data: { destination: winner },
  });
};

/**
 * Get all polls for a group
 */
const getGroupPolls = async (groupId, activeOnly = false) => {
  const where = { groupId };

  if (activeOnly) {
    where.isClosed = false;
    where.OR = [
      { endsAt: null },
      { endsAt: { gt: new Date() } },
    ];
  }

  const polls = await prisma.poll.findMany({
    where,
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Format response
  return polls.map(poll => ({
    ...poll,
    options: poll.options.map(opt => ({
      id: opt.id,
      text: opt.text,
      voteCount: opt._count.votes,
    })),
    isExpired: poll.endsAt && new Date(poll.endsAt) < new Date(),
  }));
};

/**
 * Get poll by ID with results
 */
const getPollById = async (pollId, userId) => {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        include: {
          votes: !userId ? false : {
            where: { userId },
          },
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  });

  if (!poll) {
    throw ApiError.notFound('Poll not found');
  }

  // Get total votes
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt._count.votes, 0);

  // Format options with vote counts and user's vote
  const options = poll.options.map(opt => {
    const result = {
      id: opt.id,
      text: opt.text,
      voteCount: opt._count.votes,
      percentage: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0,
    };

    // Include user's vote if not anonymous
    if (!poll.isAnonymous && opt.votes) {
      result.hasVoted = opt.votes.length > 0;
    }

    return result;
  });

  // Get user's votes if not anonymous
  let myVotes = [];
  if (!poll.isAnonymous && userId) {
    // Get option IDs for this poll
    const pollOptionIds = poll.options.map(opt => opt.id);
    const userVotes = await prisma.pollVote.findMany({
      where: {
        userId,
        optionId: { in: pollOptionIds },
      },
      select: { optionId: true },
    });
    myVotes = userVotes.map(v => v.optionId);
  }

  return {
    ...poll,
    options,
    totalVotes,
    myVotes: poll.isAnonymous ? undefined : myVotes,
    isExpired: poll.endsAt && new Date(poll.endsAt) < new Date(),
  };
};

/**
 * Create poll
 */
const createPoll = async (groupId, userId, data) => {
  const { question, type, options, endsAt, expiresAt, isAnonymous } = data;
  const effectiveEndsAt = endsAt || expiresAt;

  if (!options || options.length < 2) {
    throw ApiError.badRequest('Poll must have at least 2 options');
  }

  if (options.length > 10) {
    throw ApiError.badRequest('Poll cannot have more than 10 options');
  }

  // Extract text from options if they are objects
  const optionTexts = options.map(opt => typeof opt === 'string' ? opt : opt.text);

  const poll = await prisma.poll.create({
    data: {
      groupId,
      createdBy: userId,
      question,
      type: type || 'SINGLE_CHOICE',
      isAnonymous: isAnonymous || false,
      endsAt: effectiveEndsAt ? new Date(effectiveEndsAt) : null,
      options: {
        create: optionTexts.map(text => ({ text })),
      },
    },
    include: {
      options: true,
    },
  });

  return {
    ...poll,
    options: poll.options.map(opt => ({
      id: opt.id,
      text: opt.text,
      voteCount: 0,
    })),
    totalVotes: 0,
  };
};

/**
 * Vote on poll
 */
const vote = async (pollId, userId, optionIds) => {
  // Get poll with options
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: true,
    },
  });

  if (!poll) {
    throw ApiError.notFound('Poll not found');
  }

  // Fix: Verify user is a member of the group before allowing vote
  const isMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: poll.groupId,
        userId,
      },
    },
  });

  if (!isMember) {
    throw ApiError.forbidden('You must be a group member to vote on this poll');
  }

  // Check if poll is closed
  if (poll.isClosed) {
    throw ApiError.badRequest('This poll is closed');
  }

  // Check if poll is expired
  if (poll.endsAt && new Date(poll.endsAt) < new Date()) {
    throw ApiError.badRequest('This poll has expired');
  }

  // Validate option IDs
  const validOptionIds = poll.options.map(opt => opt.id);
  const invalidOptions = optionIds.filter(id => !validOptionIds.includes(id));
  if (invalidOptions.length > 0) {
    throw ApiError.badRequest('Invalid option IDs provided');
  }

  // Validate single/multiple choice
  if (poll.type === 'SINGLE_CHOICE' && optionIds.length > 1) {
    throw ApiError.badRequest('This poll only allows single choice');
  }

  // Remove existing votes for this user on this poll
  // Step 1: Get all option IDs for this poll
  const pollOptionIds = poll.options.map(opt => opt.id);

  // Step 2: Delete votes for those options
  await prisma.pollVote.deleteMany({
    where: {
      userId,
      optionId: { in: pollOptionIds },
    },
  });

  // Create new votes
  await prisma.pollVote.createMany({
    data: optionIds.map(optionId => ({
      optionId,
      userId,
    })),
  });

  // Return updated poll
  const updatedPoll = await getPollById(pollId, userId);
  await updateGroupDestinationFromPoll(updatedPoll);
  return updatedPoll;
};

/**
 * Close poll
 */
const closePoll = async (pollId, userId, isAdmin = false) => {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
  });

  if (!poll) {
    throw ApiError.notFound('Poll not found');
  }

  // Only creator or admin can close
  if (poll.createdBy !== userId && !isAdmin) {
    throw ApiError.forbidden('Only the poll creator or admin can close this poll');
  }

  if (poll.isClosed) {
    throw ApiError.badRequest('Poll is already closed');
  }

  await prisma.poll.update({
    where: { id: pollId },
    data: { isClosed: true },
  });

  const pollWithVotes = await getPollById(pollId, userId);
  await updateGroupDestinationFromPoll(pollWithVotes);
  return pollWithVotes;
};

/**
 * Delete poll
 */
const deletePoll = async (pollId, userId, isAdmin = false) => {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
  });

  if (!poll) {
    throw ApiError.notFound('Poll not found');
  }

  // Only creator or admin can delete
  if (poll.createdBy !== userId && !isAdmin) {
    throw ApiError.forbidden('Only the poll creator or admin can delete this poll');
  }

  // Delete votes first
  await prisma.pollVote.deleteMany({
    where: {
      option: {
        pollId,
      },
    },
  });

  // Delete options
  await prisma.pollOption.deleteMany({
    where: { pollId },
  });

  // Delete poll
  await prisma.poll.delete({
    where: { id: pollId },
  });

  return { success: true };
};

/**
 * Add option to a poll (group members)
 */
const addOption = async (pollId, userId, text) => {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    throw ApiError.badRequest('Option text is required');
  }

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true },
  });

  if (!poll) {
    throw ApiError.notFound('Poll not found');
  }

  // Verify group membership
  const isMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: poll.groupId,
        userId,
      },
    },
  });

  if (!isMember) {
    throw ApiError.forbidden('You must be a group member to add options');
  }

  if (poll.isClosed) {
    throw ApiError.badRequest('This poll is closed');
  }

  if (poll.endsAt && new Date(poll.endsAt) < new Date()) {
    throw ApiError.badRequest('This poll has expired');
  }

  if (poll.options.length >= 10) {
    throw ApiError.badRequest('Poll cannot have more than 10 options');
  }

  const duplicate = poll.options.some(
    (opt) => opt.text.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) {
    throw ApiError.badRequest('This option already exists');
  }

  await prisma.pollOption.create({
    data: {
      pollId,
      text: trimmed,
    },
  });

  const pollWithVotes = await getPollById(pollId, userId);
  await updateGroupDestinationFromPoll(pollWithVotes);
  return pollWithVotes;
};

/**
 * Remove option from a poll (group members)
 */
const removeOption = async (pollId, optionId, userId) => {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        include: {
          _count: { select: { votes: true } },
        },
      },
    },
  });

  if (!poll) {
    throw ApiError.notFound('Poll not found');
  }

  // Verify group membership
  const isMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: poll.groupId,
        userId,
      },
    },
  });

  if (!isMember) {
    throw ApiError.forbidden('You must be a group member to remove options');
  }

  if (poll.isClosed) {
    throw ApiError.badRequest('This poll is closed');
  }

  if (poll.endsAt && new Date(poll.endsAt) < new Date()) {
    throw ApiError.badRequest('This poll has expired');
  }

  const option = poll.options.find((opt) => opt.id === optionId);
  if (!option) {
    throw ApiError.notFound('Option not found');
  }

  if (option._count?.votes > 0) {
    throw ApiError.badRequest('Cannot remove an option that already has votes');
  }

  if (poll.options.length <= 2) {
    throw ApiError.badRequest('Poll must have at least 2 options');
  }

  // Verify option exists in DB before deleting
  const optionInDb = await prisma.pollOption.findFirst({
    where: {
      id: optionId,
      pollId: pollId,
    },
  });

  if (!optionInDb) {
    throw ApiError.notFound('Option no longer exists. Please refresh and try again.');
  }

  await prisma.pollOption.delete({
    where: { id: optionInDb.id },
  });

  const updatedPoll = await getPollById(pollId, userId);
  await updateGroupDestinationFromPoll(updatedPoll);
  return updatedPoll;
};

module.exports = {
  getGroupPolls,
  getPollById,
  createPoll,
  vote,
  closePoll,
  deletePoll,
  addOption,
  removeOption,
};
