export interface Expense {
  id: string;
  title?: string;
  description: string;
  amount: number;
  category: string;
  paidBy: string; // User ID (string)
  paidById?: string; // Alias for paidBy (user ID)
  paidByName?: string;
  paidByAvatar?: string;
  splitWith?: string[];
  splits?: ExpenseSplit[];
  date: string;
  settled?: boolean;
}

export type ExpenseCategory =
  | 'ACCOMMODATION'
  | 'TRANSPORT'
  | 'FOOD'
  | 'ACTIVITIES'
  | 'SHOPPING'
  | 'TIPS'
  | 'OTHER'
  | 'Activities'
  | 'Attractions'
  | 'Food'
  | 'Lodging'
  | 'Transport'
  | 'Shopping'
  | 'Other';

export interface ExpenseSplit {
  id: string;
  userId: number;
  amount: number;
  isSettled: boolean;
}

// Unified ExpenseFormData - used by AddExpenseModal component
export interface ExpenseFormData {
  description: string;
  amount: number;
  paidBy: string; // User ID who paid
  category: string;
  splitType: 'equal' | 'custom';
  splits: { memberId: string; amount: number }[]; // memberId is userId string
  groupId: string;
  groupName: string;
}

// Simplified form data for API calls
export interface CreateExpenseData {
  description: string;
  amount: number;
  paidBy: string;
  category: string;
  splitType: 'equal' | 'custom';
}

export interface Balance {
  userId: string;
  userName: string;
  userAvatar: string;
  amount: number;
  owes: boolean;
}
