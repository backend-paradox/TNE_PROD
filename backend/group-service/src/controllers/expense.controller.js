const expenseService = require('../services/expense.service');
const ApiResponse = require('../utils/ApiResponse');

const getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, category } = req.query;
    const result = await expenseService.getGroupExpenses(
      req.params.groupId,
      { page: parseInt(page), limit: parseInt(limit), category }
    );
    return ApiResponse.paginated(res, result.expenses, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getExpenseSummary = async (req, res, next) => {
  try {
    const summary = await expenseService.getExpenseSummary(
      req.params.groupId,
      req.user.id
    );
    return ApiResponse.success(res, summary);
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(
      req.params.groupId,
      req.user.id,
      req.body
    );
    return ApiResponse.created(res, expense);
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(
      req.params.expenseId,
      req.user.id,
      req.body
    );
    return ApiResponse.success(res, expense, 'Expense updated');
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.params.expenseId, req.user.id);
    return ApiResponse.success(res, null, 'Expense deleted');
  } catch (error) {
    next(error);
  }
};

const settleExpense = async (req, res, next) => {
  try {
    const result = await expenseService.settleExpense(
      req.params.expenseId,
      req.body
    );
    return ApiResponse.success(res, result, 'Expense settled');
  } catch (error) {
    next(error);
  }
};

const getSettlementSuggestions = async (req, res, next) => {
  try {
    const suggestions = await expenseService.getSettlementSuggestions(
      req.params.groupId
    );
    return ApiResponse.success(res, suggestions);
  } catch (error) {
    next(error);
  }
};

const getMyPendingSplits = async (req, res, next) => {
  try {
    const { groupId } = req.query;
    const splits = await expenseService.getMyPendingSplits(
      req.user.id,
      groupId
    );
    return ApiResponse.success(res, splits);
  } catch (error) {
    next(error);
  }
};

const settleSplit = async (req, res, next) => {
  try {
    const { method, note } = req.body;
    const result = await expenseService.settleSplit(
      req.params.splitId,
      req.user.id,
      { method, note }
    );
    return ApiResponse.success(res, result, 'Split settled');
  } catch (error) {
    next(error);
  }
};

const batchSettleSplits = async (req, res, next) => {
  try {
    const { splitIds, method, note } = req.body;
    const result = await expenseService.batchSettleSplits(
      req.user.id,
      splitIds,
      { method, note }
    );
    return ApiResponse.success(res, result, `${result.settledCount} splits settled`);
  } catch (error) {
    next(error);
  }
};

const getSettlementSummary = async (req, res, next) => {
  try {
    const summary = await expenseService.getSettlementSummary(
      req.params.groupId,
      req.user.id
    );
    return ApiResponse.success(res, summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
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
