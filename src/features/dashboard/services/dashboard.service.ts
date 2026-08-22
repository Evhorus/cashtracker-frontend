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
  getSummary: (year?: number): Promise<DashboardSummary> => {
    const qs = year ? `?year=${year}` : "";

    return fetchApi<DashboardSummary>(
      `/dashboard/summary${qs}`,
      { next: { tags: ["dashboard-summary"], revalidate: 60 } },
      DashboardSummaryAPIResponseSchema,
    );
  },
};
