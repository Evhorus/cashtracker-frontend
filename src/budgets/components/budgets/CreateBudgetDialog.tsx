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
import { useDialog } from '../../hooks/useDialog';
import { useActionWithToast } from '../../hooks/useActionWithToast';
import { BudgetForm } from './BudgetForm';
import { BudgetFormValues } from '../../schemas/budget.schema';

import { createUpdateBudgetAction } from '@/budgets/actions/budgets/create-update-budget.action';

const budget = {
  name: '',
  amount: '',
  description: '',
} as unknown as Budget;

export const CreateBudgetDialog = () => {
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

  const handleCreate = async (budgetFormValues: BudgetFormValues) => {
    startTransition(() => dispatch(budgetFormValues));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleDialog('create')}>
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
          budget={budget}
          isLoading={isPending}
          onSubmit={handleCreate}
          onCloseDialog={toggleDialog}
        />
      </DialogContent>
    </Dialog>
  );
};
