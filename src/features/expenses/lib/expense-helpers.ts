import type { Expense } from "../types";
import type { Envelope } from "@/features/envelopes/types";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";

// Backend's hard cap on `limit` (PaginationQueryDto, shared by every
// paginated list endpoint) - the ceiling the "all" option can ask for.
// A single envelope's own expense list realistically never gets near
// this (envelopes are period-scoped, see envelopes-repository's own
// "one account for one month" reasoning) so it reads as "everything" in
// practice, same tradeoff the app already makes for "all envelopes"
// (ALL_ENVELOPES_LIMIT) and "all envelopes for a chart" elsewhere.
export const EXPENSES_MAX_PAGE_SIZE = 100;

export const EXPENSES_DEFAULT_PAGE_SIZE = 10;

/**
 * Page sizes offered by the expense list. Numbers only: two of the
 * three render as themselves, and the largest renders as the word for
 * "all" (`expenses.pageSizeAll`), which is a translation rather than
 * data and so can't live here.
 */
export const EXPENSES_PAGE_SIZE_OPTIONS = [
  10,
  20,
  EXPENSES_MAX_PAGE_SIZE,
] as const;

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

  /**
   * What percentage of its envelope's limit this one expense represents -
   * the expense detail page's "Impacto en el Sobre" figure. Returns null
   * for an unlimited envelope, same as EnvelopeHelpers.getPercentage
   * (there's no limit to be a percentage of).
   */
  getImpactPercentage: (
    expense: Expense,
    envelope: Envelope,
  ): number | null => {
    const envelopeAmount = EnvelopeHelpers.getAmount(envelope);
    if (envelopeAmount === null) return null;
    return (ExpenseHelpers.getAmount(expense) / envelopeAmount) * 100;
  },
};
