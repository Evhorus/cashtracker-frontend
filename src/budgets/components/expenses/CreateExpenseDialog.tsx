'use client';
import { startTransition, useActionState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useDialog } from '@/budgets/hooks/useDialog';
import { useActionWithToast } from '@/budgets/hooks/useActionWithToast';
import { ExpenseForm } from './ExpenseForm';
import { Expense } from '@/budgets/types';
import { createUpdateExpenseAction } from '@/budgets/actions/expenses/create-update-expense.action';
import { ExpenseFormValues } from '@/budgets/schemas/expense.schema';

interface CreateExpenseDialogProps {
  budgetId: string;
}

const expense = {
  name: '',
  amount: '',
  date: '',
} as unknown as Expense;

export const CreateExpenseDialog = ({ budgetId }: CreateExpenseDialogProps) => {
  const { isOpen, toggleDialog } = useDialog('expense');

  const [state, dispatch, isPending] = useActionState(
    createUpdateExpenseAction,
    {
      errors: [],
      success: '',
    }
  );

  useActionWithToast(state, {
    onSuccess: () => toggleDialog(),
  });

  const handleCreate = async (expenseFormValues: ExpenseFormValues) => {
    startTransition(() => dispatch({ ...expenseFormValues, budgetId }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleDialog('create')}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <Plus />
          Agregar Gasto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Gasto</DialogTitle>
        </DialogHeader>

        <ExpenseForm
          expense={expense}
          onSubmit={handleCreate}
          isLoading={isPending}
          onCloseDialog={toggleDialog}
        />
      </DialogContent>
    </Dialog>
  );
};
