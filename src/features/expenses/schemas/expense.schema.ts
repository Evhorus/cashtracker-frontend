import { z } from "zod";
import type { CurrencyCode } from "@/lib/format-currency";
import { PaginationMetaSchema } from "@/lib/pagination";
import type { ValidationTranslator } from "@/lib/validation";

export const ExpenseAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  currency: z.string().default("COP"),
  date: z.string(),
  // The API can send explicit `null` (not just an absent key) - needs
  // `.nullable()` alongside `.optional()`, same as EnvelopeAPIResponseSchema.
  description: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ExpenseApi = z.infer<typeof ExpenseAPIResponseSchema>;

/**
 * Expenses-only `meta` block: adds `totalAmount`, the SUM(amount) over
 * the full filtered set (same search/startDate/endDate as the list),
 * computed server-side before pagination - not the page in hand, not
 * the envelope's global `spent`. Kept off the shared
 * `PaginationMetaSchema` (mirrors the backend's own
 * ExpensesPaginationMetaDto) since no other paginated list has an
 * amount to sum. `z.coerce.number()` because, like every other money
 * field in this API, a numeric aggregate can come back as a string.
 */
const ExpensesPaginationMetaSchema = PaginationMetaSchema.extend({
  totalAmount: z.coerce.number(),
});

export const ExpensesAPIResponseSchema = z.object({
  data: z.array(ExpenseAPIResponseSchema),
  meta: ExpensesPaginationMetaSchema,
});
export type ExpensesResponseApi = z.infer<typeof ExpensesAPIResponseSchema>;
export type ExpensesPaginationMeta = z.infer<
  typeof ExpensesPaginationMetaSchema
>;

/**
 * Expense form schema, built per-envelope. The currency is never chosen
 * freely by the user - it's always locked to the currency of the envelope
 * the expense belongs to (`z.literal(currency)`), so it's structurally
 * impossible to submit an expense whose currency doesn't match its
 * envelope.
 */
export const buildExpenseSchema = (
  currency: CurrencyCode,
  t: ValidationTranslator,
) =>
  z.object({
    name: z.string().min(1, { message: t("expenseNameRequired") }),
    amount: z
      .string({ message: t("amountRequired") })
      .min(1, { message: t("amountEmpty") }),
    currency: z.literal(currency),
    date: z.coerce.date<Date>({ message: t("dateRequired") }),

    description: z
      .string()
      .max(500, { message: t("descriptionTooLong") })
      .optional(),
  });

export type ExpenseFormValues = z.infer<ReturnType<typeof buildExpenseSchema>>;
