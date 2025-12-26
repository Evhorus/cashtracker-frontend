"use client";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Edit } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { BudgetForm } from "./BudgetForm";
import { useActionWithToast } from "../../hooks/useActionWithToast";
import { BudgetFormValues } from "../../schemas/budget.schema";
import { Budget } from "../../types";
import { createUpdateBudgetAction } from "@/budgets/actions/budgets/create-update-budget.action";

interface UpdateBudgetDialogProps {
  budget: Budget;
}

export const UpdateBudgetDialog = ({ budget }: UpdateBudgetDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [state, dispatch, isPending] = useActionState(
    createUpdateBudgetAction,
    {
      errors: [],
      success: "",
    }
  );

  useActionWithToast(state, {
    onSuccess: () => {
      router.refresh();
      setOpen(false);
    },
  });

  const handleUpdate = async (budgetFormValues: BudgetFormValues) => {
    startTransition(() => dispatch({ ...budgetFormValues, id: budget.id }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar</DialogTitle>
          <DialogDescription>
            Aquí puedes editar el presupuesto
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          budget={budget}
          isLoading={isPending}
          onSubmit={handleUpdate}
          onCloseDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
