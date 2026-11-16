import "server-only";

import { ExpensesReportService } from "../services/expenses-report.service";
import type { ReportFilters } from "../lib/report-filters";

/** Read path for the report - a plain server-only function rather than
 * a Server Action (see envelopes/data/get-envelopes.ts). Errors
 * propagate to dashboard/error.tsx. */
export const getExpensesReport = (filters: ReportFilters) =>
  ExpensesReportService.get(filters);
