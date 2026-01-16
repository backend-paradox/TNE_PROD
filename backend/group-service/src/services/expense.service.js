const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

/**
 * Get all expenses for a group
 */
const getGroupExpenses = async (groupId, options = {}) => {
  const { category, page = 1, limit = 20 } = options;

  const where = { groupId };
  if (category) {
    where.category = category;
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        splits: true,
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    expenses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get expense summary and balances
 */
const getExpenseSummary = async (groupId, userId) => {
  // Get all expenses with splits
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      splits: true,
    },
  });

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Get all group members
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  // Calculate balances for each member
  const balances = {};
  members.forEach(m => {
    balances[m.userId] = { paid: 0, owes: 0, balance: 0 };
  });

  // Process each expense
  expenses.forEach(expense => {
    // Add to payer's paid amount
    if (balances[expense.paidBy]) {
      balances[expense.paidBy].paid += expense.amount;
    }

    // Add to each split member's owes amount
    expense.splits.forEach(split => {
      if (balances[split.userId]) {
        balances[split.userId].owes += split.amount;
      }
    });
  });

  // Calculate net balance (positive = owed money, negative = owes money)
  Object.keys(balances).forEach(uid => {
    balances[uid].balance = balances[uid].paid - balances[uid].owes;
  });

  // Current user's balance
  const myBalance = balances[userId] || { paid: 0, owes: 0, balance: 0 };

  return {
    totalExpenses,
    expenseCount: expenses.length,
    myBalance,
    memberBalances: balances,
  };
};

/**
 * Create expense
 */
const createExpense = async (groupId, userId, data) => {
  const { title, description, amount, category, date, splitType, splits, receiptUrl, paidBy } = data;
  const paidByUserId = paidBy || userId;

  const payerMembership = await prisma.groupMember.findFirst({
    where: { groupId, userId: paidByUserId, leftAt: null },
  });
  if (!payerMembership) {
    throw ApiError.badRequest('Payer must be a current group member');
  }

  // Calculate splits based on splitType
  let calculatedSplits = [];

  if (splitType === 'EQUAL') {
    // Get all group members
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    const splitAmount = amount / members.length;
    calculatedSplits = members.map(m => ({
      userId: m.userId,
      amount: splitAmount,
      isSettled: m.userId === paidByUserId, // Payer's share is already settled
    }));
  } else if (splitType === 'EXACT' && splits) {
    // Validate that splits add up to total
    const splitTotal = splits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(splitTotal - amount) > 0.01) {
      throw ApiError.badRequest('Split amounts must equal total expense amount');
    }
    calculatedSplits = splits.map(s => ({
      userId: s.userId,
      amount: s.amount,
      isSettled: s.userId === paidByUserId,
    }));
  } else if (splitType === 'PERCENTAGE' && splits) {
    // Validate percentages add up to 100
    const percentTotal = splits.reduce((sum, s) => sum + s.percentage, 0);
    if (Math.abs(percentTotal - 100) > 0.01) {
      throw ApiError.badRequest('Percentages must add up to 100');
    }
    calculatedSplits = splits.map(s => ({
      userId: s.userId,
      amount: (amount * s.percentage) / 100,
      isSettled: s.userId === paidByUserId,
    }));
  } else if (splitType === 'SHARES' && splits) {
    const totalShares = splits.reduce((sum, s) => sum + s.shares, 0);
    calculatedSplits = splits.map(s => ({
      userId: s.userId,
      amount: (amount * s.shares) / totalShares,
      isSettled: s.userId === paidByUserId,
    }));
  } else {
    throw ApiError.badRequest('Invalid split type or missing split data');
  }

  // Create expense with splits
  const expense = await prisma.expense.create({
    data: {
      groupId,
      paidBy: paidByUserId,
      createdBy: userId,
      title,
      description,
      amount,
      category: category || 'OTHER',
      date: date ? new Date(date) : new Date(),
      splitType,
      receiptUrl,
      splits: {
        create: calculatedSplits,
      },
    },
    include: {
      splits: true,
    },
  });

  return expense;
};

/**
 * Update expense
 */
const updateExpense = async (expenseId, userId, data, isAdmin = false) => {
  // Check if expense exists and user can update
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense) {
    throw ApiError.notFound('Expense not found');
  }

  // Only creator or admin can update
  if (expense.paidBy !== userId && !isAdmin) {
    throw ApiError.forbidden('You can only update your own expenses');
  }

  const { title, description, amount, category, date, receiptUrl } = data;

  const updatedExpense = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      title,
      description,
      amount,
      category,
      date: date ? new Date(date) : undefined,
      receiptUrl,
    },
    include: {
      splits: true,
    },
  });

  // If amount changed, recalculate splits for EQUAL type
  if (amount && amount !== expense.amount && expense.splitType === 'EQUAL') {
    const splits = await prisma.expenseSplit.findMany({
      where: { expenseId },
    });

    const newSplitAmount = amount / splits.length;
    await Promise.all(
      splits.map(split =>
        prisma.expenseSplit.update({
          where: { id: split.id },
          data: { amount: newSplitAmount },
        })
      )
    );
  }

  return updatedExpense;
};

/**
 * Delete expense
 */
const deleteExpense = async (expenseId, userId, isAdmin = false) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense) {
    throw ApiError.notFound('Expense not found');
  }

  // Only creator or admin can delete
  if (expense.paidBy !== userId && !isAdmin) {
    throw ApiError.forbidden('You can only delete your own expenses');
  }

  // Delete splits first (cascade), then expense
  await prisma.expenseSplit.deleteMany({
    where: { expenseId },
  });

  await prisma.expense.delete({
    where: { id: expenseId },
  });

  return { success: true };
};

/**
 * Settle expense (mark split as paid) - LEGACY METHOD
 * Use settleSplit instead
 */
const settleExpense = async (expenseId, data) => {
  const { userId, settledBy } = data;

  const split = await prisma.expenseSplit.findFirst({
    where: {
      expenseId,
      userId,
    },
  });

  if (!split) {
    throw ApiError.notFound('Expense split not found');
  }

  if (split.isSettled) {
    throw ApiError.badRequest('This split is already settled');
  }

  const updatedSplit = await prisma.expenseSplit.update({
    where: { id: split.id },
    data: {
      isSettled: true,
      settledAt: new Date(),
    },
  });

  return updatedSplit;
};

/**
 * Get settlement suggestions
 * Uses a simplified debt simplification algorithm
 */
const getSettlementSuggestions = async (groupId) => {
  // Get expense summary for all members
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      splits: true,
    },
  });

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  // Calculate net balance for each member
  const balances = {};
  members.forEach(m => {
    balances[m.userId] = 0;
  });

  expenses.forEach(expense => {
    // Payer gets credit
    if (balances[expense.paidBy] !== undefined) {
      balances[expense.paidBy] += expense.amount;
    }

    // Each split participant owes
    expense.splits.forEach(split => {
      if (!split.isSettled && balances[split.userId] !== undefined) {
        balances[split.userId] -= split.amount;
      }
    });
  });

  // Separate debtors and creditors
  const debtors = []; // negative balance - owes money
  const creditors = []; // positive balance - owed money

  Object.entries(balances).forEach(([userId, balance]) => {
    if (balance < -0.01) {
      debtors.push({ userId: parseInt(userId), amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ userId: parseInt(userId), amount: balance });
    }
  });

  // Sort by amount (descending)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // Generate settlement suggestions (greedy algorithm)
  const settlements = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return {
    settlements,
    settlementCount: settlements.length,
  };
};

/**
 * Get pending splits for current user (per-split settlement)
 */
const getMyPendingSplits = async (userId, groupId = null) => {
  const where = {
    userId,
    isSettled: false,
  };

  if (groupId) {
    where.expense = {
      groupId,
    };
  }

  const splits = await prisma.expenseSplit.findMany({
    where,
    include: {
      expense: {
        select: {
          id: true,
          title: true,
          groupId: true,
          paidBy: true,
          currency: true,
        },
      },
    },
    orderBy: {
      expense: {
        date: 'desc',
      },
    },
  });

  // Fetch group names and payer details
  const groupIds = [...new Set(splits.map(s => s.expense.groupId))];
  const payerIds = [...new Set(splits.map(s => s.expense.paidBy))];

  const [groups, payerProfiles] = await Promise.all([
    prisma.group.findMany({
      where: { id: { in: groupIds } },
      select: { id: true, name: true },
    }),
    _fetchUserProfiles(payerIds),
  ]);

  const groupMap = {};
  groups.forEach(g => {
    groupMap[g.id] = g.name;
  });

  // Enrich splits with additional data
  const enrichedSplits = splits.map(split => ({
    id: split.id,
    expenseId: split.expense.id,
    expenseTitle: split.expense.title,
    amount: split.amount,
    currency: split.expense.currency,
    groupName: groupMap[split.expense.groupId],
    payerName: payerProfiles[split.expense.paidBy]?.name || 'Unknown',
    payerAvatar: payerProfiles[split.expense.paidBy]?.profilePicUrl,
    isSettled: split.isSettled,
  }));

  return enrichedSplits;
};

/**
 * Settle a single split
 */
const settleSplit = async (splitId, userId, settlementData) => {
  const { method, note } = settlementData || {};

  // Find split and verify ownership
  const split = await prisma.expenseSplit.findUnique({
    where: { id: splitId },
  });

  if (!split) {
    throw ApiError.notFound('Expense split not found');
  }

  if (split.userId !== userId) {
    throw ApiError.forbidden('You can only settle your own splits');
  }

  if (split.isSettled) {
    throw ApiError.badRequest('This split is already settled');
  }

  const updatedSplit = await prisma.expenseSplit.update({
    where: { id: splitId },
    data: {
      isSettled: true,
      settledAt: new Date(),
      settlementMethod: method,
      settlementNote: note,
    },
  });

  return updatedSplit;
};

/**
 * Batch settle multiple splits
 */
const batchSettleSplits = async (userId, splitIds, settlementData) => {
  const { method, note } = settlementData || {};

  // Verify all splits belong to the user
  const splits = await prisma.expenseSplit.findMany({
    where: {
      id: { in: splitIds },
    },
  });

  const invalidSplits = splits.filter(s => s.userId !== userId);
  if (invalidSplits.length > 0) {
    throw ApiError.forbidden('You can only settle your own splits');
  }

  const alreadySettled = splits.filter(s => s.isSettled);
  if (alreadySettled.length > 0) {
    throw ApiError.badRequest(
      `${alreadySettled.length} split(s) are already settled`
    );
  }

  // Batch update all splits
  const result = await prisma.expenseSplit.updateMany({
    where: {
      id: { in: splitIds },
      userId, // Extra safety check
    },
    data: {
      isSettled: true,
      settledAt: new Date(),
      settlementMethod: method,
      settlementNote: note,
    },
  });

  return {
    settledCount: result.count,
    splits: splits.map(s => s.id),
  };
};

/**
 * Get settlement summary for a group/user
 */
const getSettlementSummary = async (groupId, userId) => {
  const splits = await prisma.expenseSplit.findMany({
    where: {
      userId,
      expense: {
        groupId,
      },
    },
    include: {
      expense: {
        select: {
          currency: true,
        },
      },
    },
  });

  const totalOwed = splits
    .filter(s => !s.isSettled)
    .reduce((sum, s) => sum + parseFloat(s.amount), 0);

  const totalSettled = splits
    .filter(s => s.isSettled)
    .reduce((sum, s) => sum + parseFloat(s.amount), 0);

  const pendingCount = splits.filter(s => !s.isSettled).length;
  const settledCount = splits.filter(s => s.isSettled).length;

  const currency = splits[0]?.expense.currency || 'INR';

  return {
    totalOwed,
    totalSettled,
    pendingCount,
    settledCount,
    currency,
  };
};

/**
 * Fetch user profiles from user-service (helper)
 */
const _fetchUserProfiles = async (userIds) => {
  if (!userIds || userIds.length === 0) {
    return {};
  }

  const axios = require('axios');
  const config = require('../config/env');

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
      profileMap[profile.authId] = {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
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
  getGroupExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
  settleExpense,
  getSettlementSuggestions,
  getMyPendingSplits,
  settleSplit,
  batchSettleSplits,
  getSettlementSummary,
};
