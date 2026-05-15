import type { Budget } from '@/features/budgets/types';

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
