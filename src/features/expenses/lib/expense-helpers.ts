import type { Expense } from '../types';

export const ExpenseHelpers = {
  /**
   * Get expense amount as number for calculations
   */
  getAmount: (expense: Expense): number => Number(expense.amount),

  /**
   * Calculate total from array of expenses
   */
  getTotalAmount: (expenses: Expense[]): number => {
    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  },
};
