import { ExpenseFormValues } from "../schemas/expense.schema";
import { Expense } from "../types";
import { ExpenseAPIResponseSchema } from "../schemas/expense.schema";
import {
  parseDateInput,
  parseCalendarDate,
  formatCalendarDateForApi,
} from "@/lib/date-helpers";
import { z } from "zod";

type ApiExpense = z.infer<typeof ExpenseAPIResponseSchema>;

export const ExpenseMapper = {
  /**
   * UI -> API (Outbound)
   * Handles Colombian currency formatting (removing dots) before converting to number.
   * `date` is a pure calendar date (no time-of-day) - sent as a plain
   * "yyyy-MM-dd" string built from local components so the selected day
   * survives the trip regardless of the device's timezone.
   */
  toApiRequest: (data: ExpenseFormValues) => ({
    name: data.name,
    amount: Number(data.amount),
    currency: data.currency,
    date: formatCalendarDateForApi(data.date),
    description: data.description,
  }),

  /**
   * API -> UI (Inbound)
   * Transforms raw API response into the domain model (Expense)
   */
  fromApi: (apiExpense: ApiExpense): Expense => {
    return {
      id: apiExpense.id,
      name: apiExpense.name,
      amount: apiExpense.amount,
      date: parseCalendarDate(apiExpense.date),
      description: apiExpense.description ?? undefined,
      createdAt: parseDateInput(apiExpense.createdAt),
      updatedAt: parseDateInput(apiExpense.updatedAt),
    };
  },
};
