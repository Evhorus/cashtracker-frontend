"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Acciones</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setDrawerOpen(false);
                setShowEditDialog(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Presupuesto
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                setDrawerOpen(false);
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Presupuesto
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

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
