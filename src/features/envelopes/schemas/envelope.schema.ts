import { z } from "zod";
import { ExpenseAPIResponseSchema } from "@/features/expenses/schemas/expense.schema";
import { CURRENCY_CODES } from "@/lib/format-currency";
import { paginatedSchema } from "@/lib/pagination";

export const EnvelopeAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  // null = unlimited envelope (no spending cap, no progress bar)
  amount: z.string().nullable(),
  currency: z.string().default("COP"),
  spent: z.string(),
  // The API sends explicit `null` (not just an absent key) when these are
  // unset, so `.optional()` alone rejects them - needs `.nullable()` too.
  category: z.string().nullable().optional(),
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

export const envelopeFormSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "El nombre del sobre es obligatorio" })
      .refine((val) => val.trim().length > 0, "No puede ser solo espacios")
      .transform((val) => val.trim()),
    // UI-only toggle - never persisted. When false, `amount` is sent as
    // null (unlimited envelope / running counter with no spending cap).
    hasLimit: z.boolean(),
    amount: z.string().optional(),
    currency: z.enum(CURRENCY_CODES),
    category: z.string().trim().max(50).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasLimit && !data.amount?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "El monto no puede estar vacío",
        path: ["amount"],
      });
    }
  });

export type EnvelopeFormValues = z.infer<typeof envelopeFormSchema>;

// Password validation
export const PasswordValidationSchema = z.object({
  password: z.string().min(1, { message: "Contraseña no válida" }),
});

export type PasswordValidationFormInputs = z.infer<
  typeof PasswordValidationSchema
>;
