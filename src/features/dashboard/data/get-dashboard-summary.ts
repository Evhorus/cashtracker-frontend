import "server-only";

import { DashboardService } from "@/features/dashboard/services/dashboard.service";

/**
 * Precomputed dashboard aggregates - see
 * envelopes/data/get-envelopes.ts for why this is a plain server-only
 * function rather than a Server Action.
 */
export const getDashboardSummary = (year?: number, currency?: string) =>
  DashboardService.getSummary(year, currency);
