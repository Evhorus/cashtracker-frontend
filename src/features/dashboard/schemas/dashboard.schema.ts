import { z } from "zod";

export const DashboardChartEntrySchema = z.object({
  label: z.string(),
  spent: z.number(),
  available: z.number(),
});

// Loose z.string() for currency, not the strict CurrencyCode enum -
// same convention as EnvelopeAPIResponseSchema (envelope.schema.ts):
// this is the network-boundary shape, the domain side narrows it. See
// stats-cards.tsx's CurrencyTotals for where that cast happens.
export const DashboardCurrencyTotalsSchema = z.object({
  currency: z.string(),
  totalEnvelopes: z.number(),
  totalAssigned: z.number(),
  totalSpent: z.number(),
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
  availableYears: z.array(z.number()),
});

export type DashboardSummary = z.infer<
  typeof DashboardSummaryAPIResponseSchema
>;
