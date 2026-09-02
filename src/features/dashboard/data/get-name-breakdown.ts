import "server-only";

import { DashboardService } from "@/features/dashboard/services/dashboard.service";
import type { DashboardBreakdownFilters } from "@/features/dashboard/schemas/dashboard.schema";

/**
 * Spending grouped by the expense's own name for one currency/period -
 * surfaces recurring expenses (e.g. "Arriendo") as a single total. See
 * envelopes/data/get-envelopes.ts for why this is a plain server-only
 * function rather than a Server Action.
 */
export const getNameBreakdown = (filters: DashboardBreakdownFilters) =>
  DashboardService.getNameBreakdown(filters);
