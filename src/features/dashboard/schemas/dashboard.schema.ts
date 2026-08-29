import { z } from "zod";

export const DashboardChartEntrySchema = z.object({
  label: z.string(),
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

// GET /dashboard/category-breakdown - spending grouped by category for
// one currency, aggregated in SQL. `category` is the envelope's free-text
// value as stored (null when unset), so the client still resolves it to
// an icon/colour and merges spellings that resolve to the same category -
// see category-breakdown.tsx.
export const DashboardCategoryBreakdownRowSchema = z.object({
  category: z.string().nullable(),
  spent: z.number(),
  envelopeCount: z.number(),
});

export const DashboardCategoryBreakdownAPIResponseSchema = z.array(
  DashboardCategoryBreakdownRowSchema,
);

export type DashboardCategoryBreakdownRow = z.infer<
  typeof DashboardCategoryBreakdownRowSchema
>;
