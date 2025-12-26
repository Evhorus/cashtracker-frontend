"use client";
import { startTransition, useActionState, useState } from "react";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useActionWithToast } from "@/budgets/hooks/useActionWithToast";
import { ExpenseForm } from "./ExpenseForm";
import { Expense } from "@/budgets/types";
import { createUpdateExpenseAction } from "@/budgets/actions/expenses/create-update-expense.action";
import { ExpenseFormValues } from "@/budgets/schemas/expense.schema";

interface UpdateExpenseDialogProps {
  budgetId: string;
  expense: Expense;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const UpdateExpenseDialog = ({
  budgetId,
  expense,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: UpdateExpenseDialogProps) => {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const [state, dispatch, isPending] = useActionState(
    createUpdateExpenseAction,
    {
      errors: [],
      success: "",
    }
  );

  useActionWithToast(state, {
    onSuccess: () => {
      router.refresh();
      setOpen?.(false);
    },
  });

  const handleCreate = async (expenseFormValues: ExpenseFormValues) => {
    startTransition(() =>
      dispatch({ ...expenseFormValues, budgetId, expenseId: expense.id })
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
          <DialogDescription>
            Modifica los datos del gasto seleccionado
          </DialogDescription>
        </DialogHeader>

        <ExpenseForm
          expense={expense}
          onSubmit={handleCreate}
          isLoading={isPending}
          onCloseDialog={() => setOpen?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
