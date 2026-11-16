import { fetchApi } from "@/shared/lib/api-client";
import { toApiQuery, type ReportFilters } from "../lib/report-filters";
import {
  ExpensesReportAPISchema,
  fromReportApi,
  type ExpensesReportApi,
} from "../schemas/expenses-report.schema";
import type { ExpensesReport } from "../types";

export const ExpensesReportService = {
  get: async (filters: ReportFilters): Promise<ExpensesReport> => {
    const report = await fetchApi<ExpensesReportApi>(
      `/expenses/report?${toApiQuery(filters)}`,
      // Never cached: it must show an expense the moment it is saved,
      // and every filter combination is its own request anyway.
      { next: { revalidate: 0 } },
      ExpensesReportAPISchema,
    );
    return fromReportApi(report);
  },
};
