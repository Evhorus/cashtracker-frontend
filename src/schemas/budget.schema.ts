import { z } from 'zod';
import { ExpenseAPIResponseSchema } from './expense.schema';

export const BudgetAPIResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  amount: z.string(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expenses: z.array(ExpenseAPIResponseSchema),
});

export type Budget = z.infer<typeof BudgetAPIResponseSchema>;
export const BudgetsAPIResponseSchema = z.array(
  BudgetAPIResponseSchema.omit({ expenses: true }),
);

export const BudgetFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'El Nombre del presupuesto es obligatorio' }),
  amount: z.coerce
    .number({ message: 'Cantidad no válida' })
    .min(1, { message: 'Cantidad no válida' }),
});

export type BudgetFormInputs = z.infer<typeof BudgetFormSchema>;

// Password validation
export const PasswordValidationSchema = z.object({
  password: z.string().min(1, { message: 'Password no valido' }),
});

export type PasswordValidationFormInputs = z.infer<
  typeof PasswordValidationSchema
>;
