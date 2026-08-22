"use client";
import { useState } from "react";
import { parseDateInput } from "@/lib/date-helpers";
import { Edit } from "lucide-react";
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
import { Expense } from "@/features/expenses/types";
import { updateExpenseAction } from "@/features/expenses/actions/update-expense.action";
import { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";

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
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const { dispatch, isPending } = useActionDialog(
    updateExpenseAction,
    {
      errors: [],
      success: "",
    },
    {
      setOpen,
    },
  );

  const handleCreate = async (expenseFormValues: ExpenseFormValues) => {
    dispatch({ ...expenseFormValues, budgetId, expenseId: expense.id });
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
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
          <DialogDescription>
            Modifica los datos del gasto seleccionado
          </DialogDescription>
        </DialogHeader>

        <ExpenseForm
          defaultValues={{
            name: expense.name,
            amount: expense.amount,
            description: expense.description || "",
            date: parseDateInput(expense.date),
          }}
          onSubmit={handleCreate}
          isLoading={isPending}
          onCloseDialog={() => setOpen?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
