"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Expense } from "@/features/expenses/types";
import { UpdateExpenseDialog } from "./UpdateExpenseDialog";
import { DeleteExpenseAlertDialog } from "./DeleteExpenseAlertDialog";
import { ActionsDrawer, ActionItem } from "@/components/common/ActionsDrawer";
import type { CurrencyCode } from "@/lib/format-currency";

interface ExpenseActionsMenuProps {
  envelopeId: string;
  currency: CurrencyCode;
  expense: Expense;
}

export const ExpenseActionsMenu = ({
  envelopeId,
  currency,
  expense,
}: ExpenseActionsMenuProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const actions: ActionItem[] = [
    {
      label: "Editar Gasto",
      icon: Edit,
      onClick: () => setShowEditDialog(true),
    },
    {
      label: "Eliminar Gasto",
      icon: Trash2,
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive",
    },
  ];

  return (
    <>
      <ActionsDrawer actions={actions} />

      <UpdateExpenseDialog
        envelopeId={envelopeId}
        currency={currency}
        expense={expense}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <DeleteExpenseAlertDialog
        envelopeId={envelopeId}
        expenseId={expense.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};
