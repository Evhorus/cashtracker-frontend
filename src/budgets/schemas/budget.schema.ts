import { z } from 'zod';
import { ExpenseAPIResponseSchema } from './expense.schema';

export const BudgetAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.coerce.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  spent: z.string(),
  expenses: z.array(ExpenseAPIResponseSchema),
});

export type Budget = z.infer<typeof BudgetAPIResponseSchema>;

export const BudgetsAPIResponseSchema = z.object({
  count: z.number(),
  data: z.array(BudgetAPIResponseSchema),
});

/*
 * Budget Form
 */

export const budgetFormSchema = z.object({
  name: z
    .string({ message: 'El nombre es obligatorio' })
    .min(1, { message: 'El nombre del presupuesto es obligatorio' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),
  amount: z
    .string({ message: 'El monto es obligatorio' })
    .min(1, { message: 'El monto no puede estar vacío' }),
  category: z.string().max(50).optional(),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

// Password validation
export const PasswordValidationSchema = z.object({
  password: z.string().min(1, { message: 'Contraseña no válida' }),
});

export type PasswordValidationFormInputs = z.infer<
  typeof PasswordValidationSchema
>;
