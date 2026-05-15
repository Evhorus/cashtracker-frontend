import { z } from 'zod';
import { ExpenseAPIResponseSchema } from '@/features/expenses/schemas/expense.schema';

export const BudgetAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  currency: z.string().default('COP'),
  spent: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expenses: z.array(ExpenseAPIResponseSchema),
});

export type BudgetApi = z.infer<typeof BudgetAPIResponseSchema>;

export const BudgetsAPIResponseSchema = z.object({
  count: z.number(),
  data: z.array(BudgetAPIResponseSchema),
});

export type BudgetsResponseApi = z.infer<typeof BudgetsAPIResponseSchema>;

/*
 * Budget Form
 */

export const budgetFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'El nombre del presupuesto es obligatorio' })
    .refine((val) => val.trim().length > 0, 'No puede ser solo espacios')
    .transform((val) => val.trim()),
  amount: z.string().min(1, { message: 'El monto no puede estar vacío' }),
  currency: z.enum(['COP', 'USD', 'EUR']),
  category: z.string().trim().max(50).optional(),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

// Password validation
export const PasswordValidationSchema = z.object({
  password: z.string().min(1, { message: 'Contraseña no válida' }),
});

export type PasswordValidationFormInputs = z.infer<
  typeof PasswordValidationSchema
>;
