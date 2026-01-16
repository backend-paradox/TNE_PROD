import type { Expense, Balance } from '@/types/travellers';

/**
 * Calculate expense split amounts
 */
export function calculateExpenseSplit(
  amount: number,
  splitWith: string[],
  splitType: 'equal' | 'exact' | 'percentage' = 'equal'
): number {
  if (splitType === 'equal') {
    return amount / (splitWith.length + 1);
  }
  return amount;
}

/**
 * Calculate total expenses for a trip
 */
export function calculateTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Calculate expenses by category
 */
export function calculateExpensesByCategory(
  expenses: Expense[]
): Record<string, number> {
  return expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Calculate balances between group members
 */
export function calculateGroupBalances(
  expenses: Expense[],
  members: { id: string; name: string; avatar: string }[]
): Balance[] {
  const balances: Record<string, number> = {};

  // Initialize all members with 0 balance
  members.forEach((member) => {
    balances[member.id] = 0;
  });

  // Calculate what each person paid vs their share
  expenses.forEach((expense) => {
    if (!expense.settled) {
      const splitAmount = expense.amount / (expense.splitWith.length + 1);

      // Person who paid gets credit
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount - splitAmount;

      // People who owe subtract their share
      expense.splitWith.forEach((memberId) => {
        balances[memberId] = (balances[memberId] || 0) - splitAmount;
      });
    }
  });

  // Convert to Balance array
  return members.map((member) => ({
    userId: member.id,
    userName: member.name,
    userAvatar: member.avatar,
    amount: Math.abs(balances[member.id] || 0),
    owes: (balances[member.id] || 0) < 0,
  }));
}

/**
 * Calculate trip budget progress
 */
export function calculateBudgetProgress(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.min((spent / budget) * 100, 100);
}

/**
 * Calculate days remaining in trip
 */
export function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculate percentage of activities completed
 */
export function calculateItineraryProgress(
  totalActivities: number,
  completedActivities: number
): number {
  if (totalActivities === 0) return 0;
  return Math.round((completedActivities / totalActivities) * 100);
}
