'use client';
import { deleteExpenseAction } from '@/budgets/actions/expenses/delete-expense.action';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Loader2, Trash2 } from 'lucide-react';
import { startTransition, useActionState, useEffect } from 'react';
import { toast } from 'sonner';

interface DeleteExpenseAlertDialogProps {
  budgetId: string;
  expenseId: string;
  className?: string;
}

export const DeleteExpenseAlertDialog = ({
  budgetId,
  expenseId,
  className = '',
}: DeleteExpenseAlertDialogProps) => {
  const [state, dispatch, isPending] = useActionState(deleteExpenseAction, {
    errors: [],
    success: '',
  });
  useEffect(() => {
    if (state.errors) {
      state.errors.forEach((err) => {
        toast.error(err);
      });
    }
  }, [state]);

  const handleDeleteBudget = async () => {
    startTransition(() => dispatch({ budgetId, expenseId }));
  };

  if (isPending)
    return (
      <div className="flex items-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className={cn(className)} variant="outline" size="icon">
          <Trash2 className="text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteBudget}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
