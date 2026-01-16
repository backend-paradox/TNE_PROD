import { useState, useCallback, useMemo } from 'react';
import { expensesAPI } from '@/features/travellers/travellersAPI';
import type { Expense, ExpenseFormData } from '@/types/travellers';
import { calculateTotalExpenses, calculateExpensesByCategory } from '@/utils/travellers';

/**
 * Hook for managing expenses
 * @param groupId - The group ID to manage expenses for
 */
export function useExpenses(groupId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalExpenses = useMemo(() => calculateTotalExpenses(expenses), [expenses]);
  const expensesByCategory = useMemo(() => calculateExpensesByCategory(expenses), [expenses]);

  const fetchExpenses = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await expensesAPI.getExpenses(groupId);
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error('fetchExpenses error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const addExpense = useCallback(async (expenseData: ExpenseFormData) => {
    if (!groupId) throw new Error('Group ID is required');
    setIsLoading(true);
    setError(null);
    try {
      const newExpense = await expensesAPI.addExpense(groupId, expenseData);
      setExpenses((prev) => [...prev, newExpense]);
      return newExpense;
    } catch (err) {
      setError('Failed to add expense');
      console.error('addExpense error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const updateExpense = useCallback(async (expenseId: string, expenseData: Partial<ExpenseFormData>) => {
    if (!groupId) throw new Error('Group ID is required');
    setIsLoading(true);
    setError(null);
    try {
      const updated = await expensesAPI.updateExpense(groupId, expenseId, expenseData);
      setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)));
      return updated;
    } catch (err) {
      setError('Failed to update expense');
      console.error('updateExpense error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const settleExpense = useCallback(async (expenseId: string, settlement: { userId: number; amount: number }) => {
    if (!groupId) throw new Error('Group ID is required');
    setIsLoading(true);
    setError(null);
    try {
      const updated = await expensesAPI.settleExpense(groupId, expenseId, settlement);
      setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)));
      return updated;
    } catch (err) {
      setError('Failed to settle expense');
      console.error('settleExpense error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const deleteExpense = useCallback(async (expenseId: string) => {
    if (!groupId) throw new Error('Group ID is required');
    setIsLoading(true);
    setError(null);
    try {
      await expensesAPI.deleteExpense(groupId, expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (err) {
      setError('Failed to delete expense');
      console.error('deleteExpense error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const fetchExpenseSummary = useCallback(async () => {
    if (!groupId) return null;
    try {
      return await expensesAPI.getExpenseSummary(groupId);
    } catch (err) {
      console.error('fetchExpenseSummary error:', err);
      return null;
    }
  }, [groupId]);

  const fetchSettlementSuggestions = useCallback(async () => {
    if (!groupId) return null;
    try {
      return await expensesAPI.getSettlementSuggestions(groupId);
    } catch (err) {
      console.error('fetchSettlementSuggestions error:', err);
      return null;
    }
  }, [groupId]);

  return {
    expenses,
    totalExpenses,
    expensesByCategory,
    isLoading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    settleExpense,
    deleteExpense,
    fetchExpenseSummary,
    fetchSettlementSuggestions,
  };
}
