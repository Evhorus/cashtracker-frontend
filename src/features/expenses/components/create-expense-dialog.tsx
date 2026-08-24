"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { ResponsiveFormSheet } from "@/components/common/responsive-form-sheet";
import { Button } from "@/components/ui/button";
import { useActionDialog } from "@/hooks/useActionDialog";
import { ExpenseForm } from "./expense-form";
import { createExpenseAction } from "@/features/expenses/actions/create-expense.action";
import { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";
import type { CurrencyCode } from "@/lib/format-currency";

interface CreateExpenseDialogProps {
  envelopeId: string;
  currency: CurrencyCode;
}

export const CreateExpenseDialog = ({
  envelopeId,
  currency,
}: CreateExpenseDialogProps) => {
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
    dispatch({ ...expenseFormValues, envelopeId });
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={setOpen}
      title="Agregar Nuevo Gasto"
      description="Completa el formulario para registrar un nuevo gasto en este sobre"
      dialogClassName="sm:max-w-125"
      trigger={
        <Button variant="default" size="lg">
          <Plus />
          <span className="hidden sm:inline-block">Agregar Gasto</span>
        </Button>
      }
    >
      <ExpenseForm
        currency={currency}
        onSubmit={handleCreate}
        isLoading={isPending}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};
