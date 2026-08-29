import type { DashboardRecentExpenseApi } from "../schemas/dashboard.schema";
import type { DashboardRecentExpense } from "../types";
import type { CurrencyCode } from "@/lib/format-currency";
import { parseCalendarDate } from "@/lib/date-helpers";

export const DashboardMapper = {
  /**
   * API -> UI (Inbound)
   * Same reasoning as EnvelopeMapper.fromApi's currency cast - this is
   * the app's own backend, so the API's loose string is safe to narrow.
   */
  recentExpenseFromApi: (
    apiExpense: DashboardRecentExpenseApi,
  ): DashboardRecentExpense => ({
    id: apiExpense.id,
    name: apiExpense.name,
    amount: apiExpense.amount,
    currency: apiExpense.currency as CurrencyCode,
    date: parseCalendarDate(apiExpense.date),
    envelopeId: apiExpense.envelopeId,
    envelopeName: apiExpense.envelopeName,
  }),
};
