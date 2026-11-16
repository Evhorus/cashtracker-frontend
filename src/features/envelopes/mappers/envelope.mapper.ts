import { EnvelopeFormValues } from "../schemas/envelope.schema";
import { Envelope } from "../types";
import { EnvelopeApi } from "../schemas/envelope.schema";
import { ExpenseMapper } from "@/features/expenses/mappers/expense.mapper";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import { parseCalendarDate } from "@/shared/utils/date-helpers";
import type { Expense } from "@/features/expenses/types";

/**
 * The list endpoint reports the range; the detail endpoint embeds the
 * expenses instead, so there it is derived from them.
 */
function expenseDateRange(
  apiEnvelope: EnvelopeApi,
  expenses: Expense[],
): Envelope["expenseDateRange"] {
  if (apiEnvelope.firstExpenseDate && apiEnvelope.lastExpenseDate) {
    return {
      first: parseCalendarDate(apiEnvelope.firstExpenseDate),
      last: parseCalendarDate(apiEnvelope.lastExpenseDate),
    };
  }
  if (expenses.length === 0) return null;
  const times = expenses.map((expense) => expense.date.getTime());
  return {
    first: new Date(Math.min(...times)),
    last: new Date(Math.max(...times)),
  };
}

export const EnvelopeMapper = {
  /**
   * UI -> API (Outbound)
   * Handles Colombian currency formatting (removing dots) before converting to number
   */
  toApiRequest: (data: EnvelopeFormValues) => ({
    name: data.name,
    amount: data.hasLimit ? Number(data.amount) : null,
    currency: data.currency,
    // An id, not a label - "" from the picker's cleared state means "no
    // category", which the API expects as null.
    categoryId: data.categoryId || null,
  }),

  /**
   * API -> UI (Inbound)
   * Transforms raw API response into the domain model (Envelope)
   */
  fromApi: (apiEnvelope: EnvelopeApi): Envelope => {
    // Absent on the paginated list endpoint - only the detail endpoint
    // embeds expenses.
    const expenses = apiEnvelope.expenses?.map(ExpenseMapper.fromApi) ?? [];
    return {
      id: apiEnvelope.id,
      // Exactly as the user typed it.
      name: apiEnvelope.name,
      amount: apiEnvelope.amount,
      // The API schema types this as a loose string (z.string().default);
      // the domain model narrows it to the known currency codes, since
      // it's the app's own form that ever writes this value.
      currency: apiEnvelope.currency as CurrencyCode,
      spent: apiEnvelope.spent,
      status: apiEnvelope.status,
      category: apiEnvelope.category,
      description: apiEnvelope.description ?? undefined,
      createdAt: new Date(apiEnvelope.createdAt),
      updatedAt: new Date(apiEnvelope.updatedAt),
      expenses,
      expenseDateRange: expenseDateRange(apiEnvelope, expenses),
    };
  },
};
