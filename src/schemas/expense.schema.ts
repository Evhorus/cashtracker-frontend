import { z } from 'zod';

export const ExpenseAPIResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  amount: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  budgetId: z.number(),
});

export type Expense = z.infer<typeof ExpenseAPIResponseSchema>;
export const ExpensesAPIResponseSchema = z.array(ExpenseAPIResponseSchema);

export const ExpenseFormSchema = z.object({
  name: z.string().min(1, { message: 'El Nombre del gasto es obligatorio' }),
  amount: z.coerce
    .number({ message: 'Cantidad no válida' })
    .min(1, { message: 'Cantidad no válida' }),
});

export type ExpenseFormInputs = z.infer<typeof ExpenseFormSchema>;
