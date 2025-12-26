"use client";
import { startTransition, useActionState, useState } from "react";
import { Plus } from "lucide-react";
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

interface CreateExpenseDialogProps {
  budgetId: string;
}

const expense = {
  name: "",
  amount: "",
  date: "",
} as unknown as Expense;

export const CreateExpenseDialog = ({ budgetId }: CreateExpenseDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
      setOpen(false);
    },
  });

  const handleCreate = async (expenseFormValues: ExpenseFormValues) => {
    startTransition(() => dispatch({ ...expenseFormValues, budgetId }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <Plus />
          <span className="hidden sm:inline-block">Agregar Gasto</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Gasto</DialogTitle>
          <DialogDescription>
            Completa el formulario para registrar un nuevo gasto en este
            presupuesto
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          expense={expense}
          onSubmit={handleCreate}
          isLoading={isPending}
          onCloseDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
