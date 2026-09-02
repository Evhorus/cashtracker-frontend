import { z } from "zod";

export const DashboardChartEntrySchema = z.object({
  /** "YYYY-MM". The API used to send a formatted Spanish month name
   * here; formatting it is the client's job now - see
   * statistics/page.tsx. */
  month: z.string(),
  spent: z.number(),
  available: z.number(),
});

// Loose z.string() for currency, not the strict CurrencyCode enum -
// same convention as EnvelopeAPIResponseSchema (envelope.schema.ts):
// this is the network-boundary shape, the domain side narrows it (see
// dashboard/page.tsx and statistics/page.tsx, which cast to
// CurrencyCode when mapping `totals`).
export const DashboardCurrencyTotalsSchema = z.object({
  currency: z.string(),
  totalEnvelopes: z.number(),
  totalAssigned: z.number(),
  // Every envelope in this currency, capped or not - not the number to
  // compare against totalAssigned/totalAvailable (see totalSpentCapped).
  totalSpent: z.number(),
  // The portion of totalSpent that actually counts against
  // totalAssigned (capped envelopes only) - totalAvailable is derived
  // from this, not totalSpent. Use this alongside totalAssigned/
  // totalAvailable; totalSpent - totalSpentCapped is what an unlimited
  // envelope spent, shown separately since it's not part of any budget.
  totalSpentCapped: z.number(),
  totalAvailable: z.number(),
});

export const DashboardSummaryAPIResponseSchema = z.object({
  totalEnvelopes: z.number(),
  // One entry per currency the user has envelopes in - money in
  // different currencies is never one unit, so the backend no longer
  // flattens totalAssigned/totalSpent/totalAvailable into a single
  // number the way it used to.
  totals: z.array(DashboardCurrencyTotalsSchema),
  chart: z.array(DashboardChartEntrySchema),
  // Which currency `chart` is actually scoped to - null only when the
  // user has no envelopes at all. Loose z.string() for the same reason
  // as DashboardCurrencyTotalsSchema's currency above.
  chartCurrency: z.string().nullable(),
  availableYears: z.array(z.number()),
});

export type DashboardSummary = z.infer<
  typeof DashboardSummaryAPIResponseSchema
>;

// The "Actividad reciente" widget on Resumen - most recent expenses
// across every envelope, not scoped to one. Separate from
// ExpenseAPIResponseSchema (expenses.schema.ts): this is a
// cross-envelope reporting shape (envelopeId/envelopeName instead of a
// route param), amount already a number (the backend's own aggregate,
// not a pass-through of the decimal column's string form).
export const DashboardRecentExpenseAPISchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  envelopeId: z.string(),
  envelopeName: z.string(),
});

export const DashboardRecentExpensesAPIResponseSchema = z.array(
  DashboardRecentExpenseAPISchema,
);

export type DashboardRecentExpenseApi = z.infer<
  typeof DashboardRecentExpenseAPISchema
>;

// The filters shared by all four "breakdown" endpoints below - a period
// (an exact startDate/endDate range, or a whole `year`, or neither for
// all-time) plus the currency they're scoped to. Picking a range clears
// `year` and vice versa (see date-range-filter.tsx/year-filter-select.tsx),
// so the two are never both set from this app's own UI, but the shape
// allows either.
export interface DashboardBreakdownFilters {
  currency: string;
  year?: number;
  startDate?: string;
  endDate?: string;
}

// GET /dashboard/category-breakdown - spending grouped by category for
// one currency/period, aggregated in SQL from each matching expense's
// own date (not the envelope's creation date - see the backend's
// DashboardRepository.withUserCurrencyAndDateRange). Grouped by the
// category itself now that envelopes reference it by id, so one
// category is one row and the client has nothing left to merge.
export const DashboardCategoryBreakdownRowSchema = z.object({
  category: z
    .object({
      id: z.string(),
      label: z.string(),
      color: z.string(),
      icon: z.string(),
    })
    .nullable(),
  spent: z.number(),
  expenseCount: z.number(),
});

export const DashboardCategoryBreakdownAPIResponseSchema = z.array(
  DashboardCategoryBreakdownRowSchema,
);

export type DashboardCategoryBreakdownRow = z.infer<
  typeof DashboardCategoryBreakdownRowSchema
>;

// GET /dashboard/envelope-breakdown - same aggregation, grouped by
// envelope instead of category.
export const DashboardEnvelopeBreakdownRowSchema = z.object({
  envelopeId: z.string(),
  envelopeName: z.string(),
  spent: z.number(),
  expenseCount: z.number(),
});

export const DashboardEnvelopeBreakdownAPIResponseSchema = z.array(
  DashboardEnvelopeBreakdownRowSchema,
);

export type DashboardEnvelopeBreakdownRow = z.infer<
  typeof DashboardEnvelopeBreakdownRowSchema
>;

// GET /dashboard/name-breakdown - same aggregation, grouped by the
// expense's own (already-normalized) name - surfaces recurring expenses
// like "Arriendo" as a single total instead of one row per month.
export const DashboardNameBreakdownRowSchema = z.object({
  name: z.string(),
  spent: z.number(),
  expenseCount: z.number(),
});

export const DashboardNameBreakdownAPIResponseSchema = z.array(
  DashboardNameBreakdownRowSchema,
);

export type DashboardNameBreakdownRow = z.infer<
  typeof DashboardNameBreakdownRowSchema
>;

// GET /dashboard/breakdown-total - the same set of expenses the three
// breakdowns above group differently, collapsed to one number.
export const DashboardBreakdownTotalAPIResponseSchema = z.object({
  spent: z.number(),
  expenseCount: z.number(),
});

export type DashboardBreakdownTotal = z.infer<
  typeof DashboardBreakdownTotalAPIResponseSchema
>;
