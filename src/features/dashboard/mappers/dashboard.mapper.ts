import type {
  DashboardRecentExpenseApi,
  DashboardEnvelopeBreakdownRow,
  DashboardNameBreakdownRow,
} from "../schemas/dashboard.schema";
import type { DashboardRecentExpense } from "../types";
import type { CurrencyCode } from "@/lib/format-currency";
import { parseCalendarDate } from "@/lib/date-helpers";
import { capitalize } from "@/lib/utils";

export const DashboardMapper = {
  /**
   * API -> UI (Inbound)
   * Same reasoning as EnvelopeMapper.fromApi's currency cast - this is
   * the app's own backend, so the API's loose string is safe to narrow.
   * `name`/`envelopeName` get the same fromApi capitalization as
   * EnvelopeMapper/ExpenseMapper - this is a separate reporting shape
   * (cross-envelope, backend-aggregated) that doesn't route through
   * either of them, so it needs its own.
   */
  recentExpenseFromApi: (
    apiExpense: DashboardRecentExpenseApi,
  ): DashboardRecentExpense => ({
    id: apiExpense.id,
    name: capitalize(apiExpense.name),
    amount: apiExpense.amount,
    currency: apiExpense.currency as CurrencyCode,
    date: parseCalendarDate(apiExpense.date),
    envelopeId: apiExpense.envelopeId,
    envelopeName: capitalize(apiExpense.envelopeName),
  }),

  /** Same reasoning, for the "Ver por sobre" statistics breakdown. */
  envelopeBreakdownRowFromApi: (
    row: DashboardEnvelopeBreakdownRow,
  ): DashboardEnvelopeBreakdownRow => ({
    ...row,
    envelopeName: capitalize(row.envelopeName),
  }),

  /** Same reasoning, for the "Ver por nombre" statistics breakdown. */
  nameBreakdownRowFromApi: (
    row: DashboardNameBreakdownRow,
  ): DashboardNameBreakdownRow => ({
    ...row,
    name: capitalize(row.name),
  }),
};
