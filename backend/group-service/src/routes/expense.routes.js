const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth');
const { isGroupMember, isGroupAdmin } = require('../middleware/groupAuth');
const { validate } = require('../middleware/validate');
const { createExpenseSchema, updateExpenseSchema, settleExpenseSchema } = require('../validators/expense.validator');

// All routes require authentication
router.use(authenticate);

// Get all expenses for a group
router.get('/:groupId/expenses', isGroupMember, expenseController.getExpenses);

// Get expense summary/balance
router.get('/:groupId/expenses/summary', isGroupMember, expenseController.getExpenseSummary);

// Add expense
router.post('/:groupId/expenses', isGroupMember, validate(createExpenseSchema), expenseController.createExpense);

// Update expense
router.put('/:groupId/expenses/:expenseId', isGroupMember, validate(updateExpenseSchema), expenseController.updateExpense);

// Delete expense
router.delete('/:groupId/expenses/:expenseId', isGroupMember, expenseController.deleteExpense);

// Settle expense (mark as paid)
router.post('/:groupId/expenses/:expenseId/settle', isGroupMember, validate(settleExpenseSchema), expenseController.settleExpense);

// Get settlement suggestions
router.get('/:groupId/expenses/settlements', isGroupMember, expenseController.getSettlementSuggestions);

// ============ Per-Split Settlement Routes ============

// Get my pending splits (across all groups or specific group)
router.get('/splits/pending', expenseController.getMyPendingSplits);

// Settle a single split
router.put('/splits/:splitId/settle', expenseController.settleSplit);

// Batch settle multiple splits
router.post('/splits/settle/batch', expenseController.batchSettleSplits);

// Get settlement summary for a group
router.get('/:groupId/settlement-summary', isGroupMember, expenseController.getSettlementSummary);

module.exports = router;
