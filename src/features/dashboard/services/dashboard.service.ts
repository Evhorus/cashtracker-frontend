import { fetchApi } from "@/lib/api-client";
import {
  DashboardSummaryAPIResponseSchema,
  DashboardRecentExpensesAPIResponseSchema,
  type DashboardSummary,
  type DashboardRecentExpenseApi,
} from "../schemas/dashboard.schema";
import { DashboardMapper } from "../mappers/dashboard.mapper";
import type { DashboardRecentExpense } from "../types";

export const DashboardService = {
  /**
   * Precomputed dashboard aggregates (envelope count, totals, top-5
   * chart, available years) - the backend does the math so the
   * frontend never has to reduce over a raw envelope list.
   */
  getSummary: (year?: number, currency?: string): Promise<DashboardSummary> => {
    const params = new URLSearchParams();
    if (year) params.set("year", String(year));
    if (currency) params.set("currency", currency);
    const qs = params.size > 0 ? `?${params.toString()}` : "";

    return fetchApi<DashboardSummary>(
      `/dashboard/summary${qs}`,
      { next: { tags: ["dashboard-summary"], revalidate: 60 } },
      DashboardSummaryAPIResponseSchema,
    );
  },

  /**
   * The most recent expenses across every envelope - the "Actividad
   * reciente" widget on Resumen. Same 60s revalidate window as
   * getSummary, and its own cache tag ("all-expenses" is already used
   * per-envelope in expenses.service.ts, so this needs a distinct tag)
   * invalidated by expense create/update/delete actions.
   */
  getRecentExpenses: async (
    limit?: number,
  ): Promise<DashboardRecentExpense[]> => {
    const qs = limit ? `?limit=${limit}` : "";
    const expenses = await fetchApi<DashboardRecentExpenseApi[]>(
      `/dashboard/recent-expenses${qs}`,
      { next: { tags: ["dashboard-recent-expenses"], revalidate: 60 } },
      DashboardRecentExpensesAPIResponseSchema,
    );

    return expenses.map(DashboardMapper.recentExpenseFromApi);
  },
};
