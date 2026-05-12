'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { ExpenseFormValues } from '../schemas/expense.schema';
import { ExpensesService } from '../services/expenses.service';
import { createSafeAction } from '@/shared/lib/safe-action';

export const updateExpenseAction = createSafeAction(
  async (formData: ExpenseFormValues & { budgetId: string; expenseId: string }) => {
    const { budgetId, expenseId, ...data } = formData;
    const response = await ExpensesService.update(budgetId, expenseId, data as ExpenseFormValues);
    
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/budget/${budgetId}`);
    revalidateTag('all-budgets', 'max');
    revalidateTag('expense', 'max');
    
    return { successMessage: response.message };
  }
);
