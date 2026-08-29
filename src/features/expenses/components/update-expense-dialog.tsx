"use client";
import { useState } from "react";
import { parseCalendarDate } from "@/lib/date-helpers";
import { Edit } from "lucide-react";
import { ResponsiveFormSheet } from "@/components/common/responsive-form-sheet";
import { Button } from "@/components/ui/button";
import { useActionDialog } from "@/hooks/useActionDialog";
import { ExpenseForm } from "./expense-form";
import { Expense } from "@/features/expenses/types";
import { updateExpenseAction } from "@/features/expenses/actions/update-expense.action";
import { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";
import type { CurrencyCode } from "@/lib/format-currency";

interface UpdateExpenseDialogProps {
  envelopeId: string;
  currency: CurrencyCode;
  expense: Expense;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const UpdateExpenseDialog = ({
  envelopeId,
  currency,
  expense,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: UpdateExpenseDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

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
    dispatch({ ...expenseFormValues, envelopeId, expenseId: expense.id });
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={setOpen}
      title="Editar Gasto"
      description="Modifica los datos del gasto seleccionado"
      dialogClassName="sm:max-w-125"
      trigger={
        isControlled ? undefined : (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
          </Button>
        )
      }
    >
      <ExpenseForm
        currency={currency}
        defaultValues={{
          name: expense.name,
          amount: expense.amount,
          description: expense.description || "",
          date: parseCalendarDate(expense.date),
        }}
        onSubmit={handleCreate}
        isLoading={isPending}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};
