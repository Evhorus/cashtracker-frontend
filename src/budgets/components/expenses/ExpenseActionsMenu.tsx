"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Expense } from "../../types";
import { UpdateExpenseDialog } from "./UpdateExpenseDialog";
import { DeleteExpenseAlertDialog } from "./DeleteExpenseAlertDialog";
import { ActionsDrawer, ActionItem } from "@/shared/components/ActionsDrawer";

interface ExpenseActionsMenuProps {
  budgetId: string;
  expense: Expense;
}

export const ExpenseActionsMenu = ({
  budgetId,
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
        budgetId={budgetId}
        expense={expense}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <DeleteExpenseAlertDialog
        budgetId={budgetId}
        expenseId={expense.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};
