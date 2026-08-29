import "server-only";

import { DashboardService } from "@/features/dashboard/services/dashboard.service";

/**
 * The most recent expenses across every envelope - the "Actividad
 * reciente" widget on Resumen. Plain server-only function, see
 * envelopes/data/get-envelopes.ts.
 */
export const getRecentExpenses = (limit?: number) =>
  DashboardService.getRecentExpenses(limit);
