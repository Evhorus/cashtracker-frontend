"use client";
import { Button } from "@/components/common/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { useState } from "react";
import { BudgetForm } from "./BudgetForm";
import { useActionDialog } from "@/hooks/useActionDialog";
import { BudgetFormValues } from "@/features/budgets/schemas/budget.schema";
import { Budget } from "@/features/budgets/types";
import { updateBudgetAction } from "@/features/budgets/actions/update-budget.action";

interface UpdateBudgetDialogProps {
  budget: Budget;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const UpdateBudgetDialog = ({
  budget,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: UpdateBudgetDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const { dispatch, isPending } = useActionDialog(
    updateBudgetAction,
    {
      errors: [],
      success: "",
    },
    {
      setOpen,
    },
  );

  const handleUpdate = async (budgetFormValues: BudgetFormValues) => {
    dispatch({ ...budgetFormValues, id: budget.id });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar</DialogTitle>
          <DialogDescription>
            Aquí puedes editar el presupuesto
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          defaultValues={{
            name: budget.name,
            amount: budget.amount,
            category: budget.category || "",
          }}
          isLoading={isPending}
          onSubmit={handleUpdate}
          onCloseDialog={() => setOpen?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
