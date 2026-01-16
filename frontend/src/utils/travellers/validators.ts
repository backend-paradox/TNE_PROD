/**
 * Validate trip form data
 */
export function validateTripForm(data: {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = 'Trip name is required';
  } else if (data.name.length < 3) {
    errors.name = 'Trip name must be at least 3 characters';
  }

  if (!data.destination.trim()) {
    errors.destination = 'Destination is required';
  }

  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (!data.endDate) {
    errors.endDate = 'End date is required';
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end < start) {
      errors.endDate = 'End date must be after start date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate expense form data
 */
export function validateExpenseForm(data: {
  description: string;
  amount: number;
  category: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.description.trim()) {
    errors.description = 'Description is required';
  }

  if (data.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate invite code format
 */
export function isValidInviteCode(code: string): boolean {
  // Invite codes are typically 6-10 alphanumeric characters
  return /^[A-Z0-9]{6,10}$/i.test(code);
}
