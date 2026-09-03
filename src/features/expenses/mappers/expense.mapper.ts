import { ExpenseFormValues } from "../schemas/expense.schema";
import { Expense } from "../types";
import { ExpenseAPIResponseSchema } from "../schemas/expense.schema";
import {
  parseDateInput,
  parseCalendarDate,
  formatCalendarDateForApi,
  toFormCalendarDate,
} from "@/lib/date-helpers";
import { capitalize } from "@/lib/utils";
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
      // The backend stores this lowercase now (its own matching/
      // grouping needs the normalized form) - capitalize it here, once,
      // for every consumer of the domain model, rather than at each
      // render site.
      name: capitalize(apiExpense.name),
      amount: apiExpense.amount,
      date: parseCalendarDate(apiExpense.date),
      description: apiExpense.description ?? undefined,
      createdAt: parseDateInput(apiExpense.createdAt),
      updatedAt: parseDateInput(apiExpense.updatedAt),
    };
  },

  /**
   * Domain -> Form defaults (Outbound, edit flow)
   * `expense.date` is UTC-anchored (see parseCalendarDate) - correct for
   * display anywhere, wrong for the Calendar widget, which reads a
   * Date's LOCAL getters to know what's selected. toFormCalendarDate
   * bridges the two, always running client-side (this is only ever
   * called from a "use client" dialog opening the edit form), so this
   * lives here rather than in each dialog that needs it - same reasoning
   * as toApiRequest/fromApi owning every other UI<->API/form shape
   * change instead of leaving it to call sites.
   */
  toFormValues: (
    expense: Expense,
  ): Pick<ExpenseFormValues, "name" | "amount" | "description" | "date"> => ({
    name: expense.name,
    amount: expense.amount,
    description: expense.description ?? "",
    date: toFormCalendarDate(expense.date),
  }),
};
