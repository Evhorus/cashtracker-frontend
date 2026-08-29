import "server-only";

import { DashboardService } from "@/features/dashboard/services/dashboard.service";

/**
 * Spending grouped by category for one currency - see
 * envelopes/data/get-envelopes.ts for why this is a plain server-only
 * function rather than a Server Action.
 */
export const getCategoryBreakdown = (currency: string, year?: number) =>
  DashboardService.getCategoryBreakdown(currency, year);
