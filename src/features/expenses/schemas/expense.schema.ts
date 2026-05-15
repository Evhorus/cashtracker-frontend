import { z } from 'zod';

export const ExpenseAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  date: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ExpenseApi = z.infer<typeof ExpenseAPIResponseSchema>;
export const ExpensesAPIResponseSchema = z.array(ExpenseAPIResponseSchema);
export type ExpensesResponseApi = z.infer<typeof ExpensesAPIResponseSchema>;

export const expenseSchema = z.object({
  name: z.string().min(1, { message: 'El Nombre del gasto es obligatorio' }),
  amount: z
    .string({ message: 'El monto es obligatorio' })
    .min(1, { message: 'El monto no puede estar vacío' }),
  date: z.coerce.date<Date>({ message: 'La fecha es obligatoria' }),

  description: z
    .string()
    .max(500, { message: 'La descripción es muy larga' })
    .optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
