import type { Expense } from "../types";

// Backend's hard cap on `limit` (PaginationQueryDto, shared by every
// paginated list endpoint) - the ceiling "Todo" can actually ask for.
// A single envelope's own expense list realistically never gets near
// this (envelopes are period-scoped, see envelopes-repository's own
// "one account for one month" reasoning) so it reads as "everything" in
// practice, same tradeoff the app already makes for "all envelopes"
// (ALL_ENVELOPES_LIMIT) and "all envelopes for a chart" elsewhere.
export const EXPENSES_MAX_PAGE_SIZE = 100;

export const EXPENSES_DEFAULT_PAGE_SIZE = 10;

export const EXPENSES_PAGE_SIZE_OPTIONS: { value: number; label: string }[] = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: EXPENSES_MAX_PAGE_SIZE, label: "Todo" },
];

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
