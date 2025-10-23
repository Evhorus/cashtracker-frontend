'use client';
import { startTransition, useActionState } from 'react';
import { Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useDialogStore } from '@/budgets/store/dialog.store';
import { useActionWithToast } from '@/budgets/hooks/useActionWithToast';
import { ExpenseForm } from './ExpenseForm';
import { Expense } from '@/budgets/types';
import { createUpdateExpenseAction } from '@/budgets/actions/expenses/create-update-expense.action';
import { ExpenseFormValues } from '@/budgets/schemas/expense.schema';

interface UpdateExpenseDialogProps {
  budgetId: string;
  expense: Expense;
}

export const UpdateExpenseDialog = ({
  budgetId,
  expense,
}: UpdateExpenseDialogProps) => {
  const expenseDialogState = useDialogStore((state) => state.expense);
  const toggleDialog = useDialogStore((state) => state.toggleDialog);
  const closeDialog = useDialogStore((state) => state.closeDialog);

  const isOpen = expenseDialogState === 'edit';

  const [state, dispatch, isPending] = useActionState(
    createUpdateExpenseAction,
    {
      errors: [],
      success: '',
    }
  );

  useActionWithToast(state, {
    onSuccess: () => closeDialog('expense'),
  });

  const handleCreate = async (expenseFormValues: ExpenseFormValues) => {
    startTransition(() =>
      dispatch({ ...expenseFormValues, budgetId, expenseId: expense.id })
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleDialog('expense', 'edit')}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
        </DialogHeader>

        <ExpenseForm
          expense={expense}
          onSubmit={handleCreate}
          isLoading={isPending}
          onCloseDialog={() => closeDialog('expense')}
        />
      </DialogContent>
    </Dialog>
  );
};
