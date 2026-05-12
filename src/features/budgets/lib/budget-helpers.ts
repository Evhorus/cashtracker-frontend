import type { Budget, Expense } from '../types';

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

/**
 * Aggregate calculations for dashboard
 */
export const DashboardHelpers = {
  /**
   * Calculate total budget across all budgets
   */
  getTotalBudget: (budgets: Budget[]): number => {
    return budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  },

  /**
   * Calculate total spent across all budgets
   */
  getTotalSpent: (budgets: Budget[]): number => {
    return budgets.reduce((sum, b) => sum + Number(b.spent), 0);
  },

  /**
   * Calculate total remaining across all budgets
   */
  getTotalRemaining: (budgets: Budget[]): number => {
    const total = DashboardHelpers.getTotalBudget(budgets);
    const spent = DashboardHelpers.getTotalSpent(budgets);
    return total - spent;
  },

  /**
   * Prepare chart data from budgets (top 5)
   */
  getChartData: (budgets: Budget[], limit = 5) => {
    return budgets.slice(0, limit).map((b) => ({
      name: b.name.length > 15 ? b.name.substring(0, 15) + '...' : b.name,
      Gastado: Number(b.spent),
      Total: Number(b.amount),
    }));
  },
};
