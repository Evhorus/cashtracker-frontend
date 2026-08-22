import { z } from "zod";

export const DashboardChartEntrySchema = z.object({
  label: z.string(),
  spent: z.number(),
  available: z.number(),
});

export const DashboardSummaryAPIResponseSchema = z.object({
  totalEnvelopes: z.number(),
  totalAssigned: z.number(),
  totalSpent: z.number(),
  totalAvailable: z.number(),
  chart: z.array(DashboardChartEntrySchema),
  availableYears: z.array(z.number()),
});

export type DashboardSummary = z.infer<
  typeof DashboardSummaryAPIResponseSchema
>;
