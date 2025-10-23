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
import { useDialog } from '../../hooks/useDialog';
import { useActionWithToast } from '../../hooks/useActionWithToast';
import { BudgetFormValues } from '../../schemas/budget.schema';
import { Budget } from '../../types';
import { createUpdateBudgetAction } from '@/budgets/actions/budgets/create-update-budget.action';

interface UpdateBudgetDialog {
  budget: Budget;
}

export const UpdateBudgetDialog = ({ budget }: UpdateBudgetDialog) => {
  const { isOpen, toggleDialog } = useDialog('budget');

  const [state, dispatch, isPending] = useActionState(
    createUpdateBudgetAction,
    {
      errors: [],
      success: '',
    }
  );

  useActionWithToast(state, {
    onSuccess: () => toggleDialog(),
  });

  const handleUpdate = async (budgetFormValues: BudgetFormValues) => {
    startTransition(() => dispatch({ ...budgetFormValues, id: budget.id }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleDialog('edit')}>
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
          onCloseDialog={toggleDialog}
        />
      </DialogContent>
    </Dialog>
  );
};
