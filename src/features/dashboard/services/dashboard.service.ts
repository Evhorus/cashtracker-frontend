import { fetchApi } from "@/lib/api-client";
import {
  DashboardCategoryBreakdownAPIResponseSchema,
  DashboardEnvelopeBreakdownAPIResponseSchema,
  DashboardNameBreakdownAPIResponseSchema,
  DashboardBreakdownTotalAPIResponseSchema,
  DashboardSummaryAPIResponseSchema,
  DashboardRecentExpensesAPIResponseSchema,
  type DashboardSummary,
  type DashboardRecentExpenseApi,
  type DashboardCategoryBreakdownRow,
  type DashboardEnvelopeBreakdownRow,
  type DashboardNameBreakdownRow,
  type DashboardBreakdownTotal,
  type DashboardBreakdownFilters,
} from "../schemas/dashboard.schema";
import { DashboardMapper } from "../mappers/dashboard.mapper";
import type { DashboardRecentExpense } from "../types";

/** Shared by the four breakdown fetchers below - turns the filters
 * object into the query string every one of them sends. */
const breakdownQueryString = ({
  currency,
  year,
  startDate,
  endDate,
}: DashboardBreakdownFilters) => {
  const params = new URLSearchParams({ currency });
  // An exact range wins over `year` when both are somehow set - see
  // DashboardBreakdownFilters' own doc comment.
  if (startDate && endDate) {
    params.set("startDate", startDate);
    params.set("endDate", endDate);
  } else if (year) {
    params.set("year", String(year));
  }
  return params.toString();
};

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
   * Spending grouped by category for one currency/period, aggregated by
   * the backend from each matching expense's own date. Replaced
   * fetching every envelope (capped at 100) and reducing client-side,
   * which silently dropped categories past that cap. Its own tag so an
   * expense mutation can invalidate it without touching the summary.
   */
  getCategoryBreakdown: (
    filters: DashboardBreakdownFilters,
  ): Promise<DashboardCategoryBreakdownRow[]> =>
    fetchApi<DashboardCategoryBreakdownRow[]>(
      `/dashboard/category-breakdown?${breakdownQueryString(filters)}`,
      { next: { tags: ["dashboard-category-breakdown"], revalidate: 60 } },
      DashboardCategoryBreakdownAPIResponseSchema,
    ),

  /** Same aggregation as getCategoryBreakdown, grouped by envelope. */
  getEnvelopeBreakdown: (
    filters: DashboardBreakdownFilters,
  ): Promise<DashboardEnvelopeBreakdownRow[]> =>
    fetchApi<DashboardEnvelopeBreakdownRow[]>(
      `/dashboard/envelope-breakdown?${breakdownQueryString(filters)}`,
      { next: { tags: ["dashboard-envelope-breakdown"], revalidate: 60 } },
      DashboardEnvelopeBreakdownAPIResponseSchema,
    ),

  /** Same aggregation, grouped by the expense's own name - surfaces
   * recurring expenses (e.g. "Arriendo") as a single total. */
  getNameBreakdown: (
    filters: DashboardBreakdownFilters,
  ): Promise<DashboardNameBreakdownRow[]> =>
    fetchApi<DashboardNameBreakdownRow[]>(
      `/dashboard/name-breakdown?${breakdownQueryString(filters)}`,
      { next: { tags: ["dashboard-name-breakdown"], revalidate: 60 } },
      DashboardNameBreakdownAPIResponseSchema,
    ),

  /** The grand total across the same set of expenses the three
   * breakdowns above each group differently. */
  getBreakdownTotal: (
    filters: DashboardBreakdownFilters,
  ): Promise<DashboardBreakdownTotal> =>
    fetchApi<DashboardBreakdownTotal>(
      `/dashboard/breakdown-total?${breakdownQueryString(filters)}`,
      { next: { tags: ["dashboard-breakdown-total"], revalidate: 60 } },
      DashboardBreakdownTotalAPIResponseSchema,
    ),

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
