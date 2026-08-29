import { z } from "zod";
import type { CurrencyCode } from "@/lib/format-currency";
import { paginatedSchema } from "@/lib/pagination";
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
export const ExpensesAPIResponseSchema = paginatedSchema(
  ExpenseAPIResponseSchema,
);
export type ExpensesResponseApi = z.infer<typeof ExpensesAPIResponseSchema>;

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
