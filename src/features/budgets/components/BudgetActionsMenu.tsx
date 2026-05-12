"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Budget } from '@/features/budgets/types';
import { UpdateBudgetDialog } from "./UpdateBudgetDialog";
import { DeleteBudgetAlertDialog } from "./DeleteBudgetAlertDialog";
import { ActionsDrawer, ActionItem } from "@/shared/components/ActionsDrawer";

interface BudgetActionsMenuProps {
  budget: Budget;
}

export const BudgetActionsMenu = ({ budget }: BudgetActionsMenuProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const actions: ActionItem[] = [
    {
      label: "Editar Presupuesto",
      icon: Edit,
      onClick: () => setShowEditDialog(true),
    },
    {
      label: "Eliminar Presupuesto",
      icon: Trash2,
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive",
    },
  ];

  return (
    <>
      <ActionsDrawer actions={actions} />

      <UpdateBudgetDialog
        budget={budget}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <DeleteBudgetAlertDialog
        id={budget.id}
        name={budget.name}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};
