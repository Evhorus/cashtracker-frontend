'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { ExpenseFormValues } from '../schemas/expense.schema';
import { ExpensesService } from '../services/expenses.service';
import { createSafeAction } from '@/shared/lib/safe-action';

export const createExpenseAction = createSafeAction(
  async (formData: ExpenseFormValues & { budgetId: string }) => {
    const { budgetId, ...data } = formData;
    const response = await ExpensesService.create(budgetId, data as ExpenseFormValues);
    
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/budget/${budgetId}`);
    revalidateTag('all-budgets', 'max');
    
    return { successMessage: response.message };
  }
);
