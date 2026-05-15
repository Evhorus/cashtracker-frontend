import type { Budget } from '../types';

/**
 * Helper functions to work with Budget amounts as numbers
 * Keeps the original string types but provides easy conversion for calculations
 */

export const BudgetHelpers = {
  /**
   * Get budget amount as number for calculations
   */
  getAmount: (budget: Budget): number => Number(budget.amount),

  /**
   * Get budget spent as number for calculations
   */
  getSpent: (budget: Budget): number => Number(budget.spent),

  /**
   * Calculate remaining amount
   */
  getRemaining: (budget: Budget): number => {
    return Number(budget.amount) - Number(budget.spent);
  },

  /**
   * Calculate percentage spent
   */
  getPercentage: (budget: Budget): number => {
    return (Number(budget.spent) / Number(budget.amount)) * 100;
  },

  /**
   * Check if budget is over limit
   */
  isOverBudget: (budget: Budget): boolean => {
    return Number(budget.spent) > Number(budget.amount);
  },

  /**
   * Check if budget is low (less than 20% remaining)
   */
  isLowBudget: (budget: Budget): boolean => {
    const remaining = BudgetHelpers.getRemaining(budget);
    return remaining < Number(budget.amount) * 0.2 && remaining > 0;
  },
};
