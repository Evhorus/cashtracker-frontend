import "server-only";

import { DashboardService } from "@/features/dashboard/services/dashboard.service";
import type { DashboardBreakdownFilters } from "@/features/dashboard/schemas/dashboard.schema";

/**
 * Spending grouped by envelope for one currency/period - see
 * envelopes/data/get-envelopes.ts for why this is a plain server-only
 * function rather than a Server Action.
 */
export const getEnvelopeBreakdown = (filters: DashboardBreakdownFilters) =>
  DashboardService.getEnvelopeBreakdown(filters);
