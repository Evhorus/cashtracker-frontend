'use client';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Edit } from 'lucide-react';
import { startTransition, useActionState } from 'react';
import { BudgetForm } from './BudgetForm';
import { useDialogStore } from '../../store/dialog.store';
import { useActionWithToast } from '../../hooks/useActionWithToast';
import { BudgetFormValues } from '../../schemas/budget.schema';
import { Budget } from '../../types';
import { createUpdateBudgetAction } from '@/budgets/actions/budgets/create-update-budget.action';

interface UpdateBudgetDialog {
  budget: Budget;
}

export const UpdateBudgetDialog = ({ budget }: UpdateBudgetDialog) => {
  const budgetDialogState = useDialogStore((state) => state.budget);
  const toggleDialog = useDialogStore((state) => state.toggleDialog);
  const closeDialog = useDialogStore((state) => state.closeDialog);

  const isOpen = budgetDialogState === 'edit';

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

  const handleUpdate = async (budgetFormValues: BudgetFormValues) => {
    startTransition(() => dispatch({ ...budgetFormValues, id: budget.id }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleDialog('budget', 'edit')}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar</DialogTitle>
          <DialogDescription>
            Aquí puedes editar el presupuesto
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          budget={budget}
          isLoading={isPending}
          onSubmit={handleUpdate}
          onCloseDialog={() => closeDialog('budget')}
        />
      </DialogContent>
    </Dialog>
  );
};
