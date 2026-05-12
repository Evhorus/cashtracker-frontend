'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { BudgetFormValues } from '../schemas/budget.schema';
import { BudgetsService } from '../services/budgets.service';
import { createSafeAction } from '@/shared/lib/safe-action';

export const updateBudgetAction = createSafeAction(
  async (formData: BudgetFormValues & { id: string }) => {
    const { id, ...data } = formData;
    const response = await BudgetsService.update(id, data as BudgetFormValues);
    
    revalidatePath('/dashboard');
    revalidateTag('all-budgets', 'max');
    revalidateTag('budget', 'max');
    
    return { successMessage: response.message };
  }
);
