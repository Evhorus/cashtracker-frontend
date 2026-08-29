"use client";
import { useState } from "react";
import { Edit } from "lucide-react";
import { ResponsiveFormSheet } from "@/components/common/responsive-form-sheet";
import { CardActionButton } from "@/components/common/card-action-button";
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
  /** Override the default trigger's a11y label - the expense detail page
   * passes the shorter, i18n "Editar" since there's only one edit button
   * on that page, no ambiguity to resolve. */
  label?: string;
  /** See CardActionButton - only the expense detail page's header turns
   * this on. */
  showLabelOnDesktop?: boolean;
}

export const UpdateExpenseDialog = ({
  envelopeId,
  currency,
  expense,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  label,
  showLabelOnDesktop,
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
          <CardActionButton
            icon={Edit}
            label={label ?? "Editar gasto"}
            showLabelOnDesktop={showLabelOnDesktop}
          />
        )
      }
    >
      <ExpenseForm
        currency={currency}
        defaultValues={{
          name: expense.name,
          amount: expense.amount,
          description: expense.description || "",
          date: expense.date,
        }}
        onSubmit={handleCreate}
        isLoading={isPending}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};
