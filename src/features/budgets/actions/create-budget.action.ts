'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { BudgetFormValues } from '../schemas/budget.schema';
import { BudgetsService } from '../services/budgets.service';
import { createSafeAction } from '@/shared/lib/safe-action';

export const createBudgetAction = createSafeAction(
  async (formData: BudgetFormValues) => {
    const data = await BudgetsService.create(formData);
    
    revalidatePath('/dashboard');
    revalidateTag('all-budgets', 'max');
    
    return { successMessage: data.message };
  }
);
