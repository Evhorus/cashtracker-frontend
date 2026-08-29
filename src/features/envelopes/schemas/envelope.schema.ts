import { z } from "zod";
import { ExpenseAPIResponseSchema } from "@/features/expenses/schemas/expense.schema";
import { CURRENCY_CODES } from "@/lib/format-currency";
import { paginatedSchema } from "@/lib/pagination";
import type { ValidationTranslator } from "@/lib/validation";

export const EnvelopeAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  // null = unlimited envelope (no spending cap, no progress bar)
  amount: z.string().nullable(),
  currency: z.string().default("COP"),
  spent: z.string(),
  // Derived by the backend from amount/spent, not stored. Validated as a
  // strict enum, unlike `currency` above: this one is the API's own
  // vocabulary rather than a value the app's form wrote, so an unknown
  // value means the contract moved and should fail loudly here.
  status: z.enum(["unlimited", "normal", "warning", "exceeded"]),
  // The whole category, not a label. It used to be free text each client
  // resolved against its own copy of the category list, which is what let
  // a renamed category silently detach from its envelopes - see
  // cashtracker-backend's 1787950000000-envelope_category_fk migration.
  category: z
    .object({
      id: z.string(),
      label: z.string(),
      /** oklch() string from the backend's own whitelist. */
      color: z.string(),
      /** Icon key - resolved to a component via resolveIcon(). */
      icon: z.string(),
    })
    .nullable(),
  description: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Only present on the single-envelope detail endpoint
  // (EnvelopeWithExpensesResponseDto) - the paginated list endpoint
  // (EnvelopeResponseDto) never includes it.
  expenses: z.array(ExpenseAPIResponseSchema).optional(),
});

export type EnvelopeApi = z.infer<typeof EnvelopeAPIResponseSchema>;

export const EnvelopesAPIResponseSchema = paginatedSchema(
  EnvelopeAPIResponseSchema,
);

export type EnvelopesResponseApi = z.infer<typeof EnvelopesAPIResponseSchema>;

/*
 * Envelope Form
 */

export const buildEnvelopeFormSchema = (t: ValidationTranslator) =>
  z
    .object({
      name: z
        .string()
        .min(1, { message: t("envelopeNameRequired") })
        .refine((val) => val.trim().length > 0, t("notOnlySpaces"))
        .transform((val) => val.trim()),
      // UI-only toggle - never persisted. When false, `amount` is sent
      // as null (unlimited envelope / running counter with no cap).
      hasLimit: z.boolean(),
      amount: z.string().optional(),
      currency: z.enum(CURRENCY_CODES),
      // The picked category's id, or "" for none - envelopes reference
      // categories by id now, so the form carries an id too.
      categoryId: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.hasLimit && !data.amount?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: t("amountEmpty"),
          path: ["amount"],
        });
      }
    });

export type EnvelopeFormValues = z.infer<
  ReturnType<typeof buildEnvelopeFormSchema>
>;
