import { z } from "zod";
import { ExpensePaymentMethodAPISchema } from "@/features/payment-methods/schemas/payment-method.schema";
import { capitalize } from "@/shared/lib/utils";
import { parseCalendarDate } from "@/shared/utils/date-helpers";
import type { ExpensesReport } from "../types";

const ReportExpenseAPISchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  currency: z.string(),
  date: z.string(),
  description: z.string().nullable().optional(),
  envelope: z.object({ id: z.string(), name: z.string() }),
  paymentMethod: ExpensePaymentMethodAPISchema.nullable(),
});

/** `z.coerce.number()`: like every money aggregate in this API, a sum
 * may arrive as a string. */
const CurrencyTotalAPISchema = z.object({
  currency: z.string(),
  total: z.coerce.number(),
});

export const ExpensesReportAPISchema = z.object({
  scopes: z.array(
    z.object({
      paymentMethodId: z.string().nullable(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  ),
  expenses: z.array(ReportExpenseAPISchema),
  totalsByCurrency: z.array(CurrencyTotalAPISchema),
  totalsByPaymentMethod: z.array(
    CurrencyTotalAPISchema.extend({
      paymentMethodId: z.string().nullable(),
      count: z.coerce.number(),
    }),
  ),
});

export type ExpensesReportApi = z.infer<typeof ExpensesReportAPISchema>;

/** API -> domain: calendar dates parsed, names capitalised as in the
 * rest of the app (the backend stores them lowercase). */
export function fromReportApi(report: ExpensesReportApi): ExpensesReport {
  return {
    ...report,
    expenses: report.expenses.map((expense) => ({
      ...expense,
      name: capitalize(expense.name),
      date: parseCalendarDate(expense.date),
      description: expense.description ?? undefined,
    })),
  };
}
