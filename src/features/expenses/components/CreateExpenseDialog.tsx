"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/common/button";
import { useActionDialog } from "@/hooks/useActionDialog";
import { ExpenseForm } from "./ExpenseForm";
import { createExpenseAction } from "@/features/expenses/actions/create-expense.action";
import { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";

interface CreateExpenseDialogProps {
  budgetId: string;
}

export const CreateExpenseDialog = ({ budgetId }: CreateExpenseDialogProps) => {
  const [open, setOpen] = useState(false);

  const { dispatch, isPending } = useActionDialog(
    createExpenseAction,
    {
      errors: [],
      success: "",
    },
    {
      setOpen,
    },
  );

  const handleCreate = async (expenseFormValues: ExpenseFormValues) => {
    dispatch({ ...expenseFormValues, budgetId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <Plus />
          <span className="hidden sm:inline-block">Agregar Gasto</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Gasto</DialogTitle>
          <DialogDescription>
            Completa el formulario para registrar un nuevo gasto en este
            presupuesto
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          onSubmit={handleCreate}
          isLoading={isPending}
          onCloseDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
