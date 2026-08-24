import { fetchApi } from "@/lib/api-client";
import {
  DashboardSummaryAPIResponseSchema,
  type DashboardSummary,
} from "../schemas/dashboard.schema";

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
};
