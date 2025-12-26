"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { Budget } from "../../types";
import { UpdateBudgetDialog } from "./UpdateBudgetDialog";
import { DeleteBudgetAlertDialog } from "./DeleteBudgetAlertDialog";

interface BudgetActionsMenuProps {
  budget: Budget;
}

export const BudgetActionsMenu = ({ budget }: BudgetActionsMenuProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
