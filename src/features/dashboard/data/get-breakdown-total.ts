import "server-only";

import { DashboardService } from "@/features/dashboard/services/dashboard.service";
import type { DashboardBreakdownFilters } from "@/features/dashboard/schemas/dashboard.schema";

/**
 * The grand total across the same set of expenses the three other
 * breakdowns group differently. See envelopes/data/get-envelopes.ts for
 * why this is a plain server-only function rather than a Server Action.
 */
export const getBreakdownTotal = (filters: DashboardBreakdownFilters) =>
  DashboardService.getBreakdownTotal(filters);
