'use client';
import { startTransition, useActionState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Budget } from '../../types';
import { useDialogStore } from '../../store/dialog.store';
import { useActionWithToast } from '../../hooks/useActionWithToast';
import { BudgetForm } from './BudgetForm';
import { BudgetFormValues } from '../../schemas/budget.schema';

import { createUpdateBudgetAction } from '@/budgets/actions/budgets/create-update-budget.action';

const budgetData = {
  name: '',
  amount: '',
  description: '',
} as unknown as Budget;

export const CreateBudgetDialog = () => {
  const budgetDialogState = useDialogStore((state) => state.budget);
  const toggleDialog = useDialogStore((state) => state.toggleDialog);
  const closeDialog = useDialogStore((state) => state.closeDialog);

  const isOpen = budgetDialogState === 'create';

  const [state, dispatch, isPending] = useActionState(
    createUpdateBudgetAction,
    {
      errors: [],
      success: '',
    }
  );

  useActionWithToast(state, {
    onSuccess: () => closeDialog('budget'),
  });

  const handleCreate = async (budgetFormValues: BudgetFormValues) => {
    startTransition(() => dispatch(budgetFormValues));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleDialog('budget', 'create')}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <Plus className="h-5 w-5" />
          Nuevo Presupuesto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear</DialogTitle>
          <DialogDescription>
            Aquí puedes crear un presupuesto
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          budget={budgetData}
          isLoading={isPending}
          onSubmit={handleCreate}
          onCloseDialog={() => closeDialog('budget')}
        />
      </DialogContent>
    </Dialog>
  );
};
