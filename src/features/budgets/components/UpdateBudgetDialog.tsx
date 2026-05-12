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
import { useActionWithToast } from '@/shared/hooks/useActionWithToast';
import { BudgetFormValues } from '@/features/budgets/schemas/budget.schema';
import { Budget } from '@/features/budgets/types';
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
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const [state, dispatch, isPending] = useActionState(
    updateBudgetAction,
    {
      errors: [],
      success: "",
    }
  );

  useActionWithToast(state, {
    onSuccess: () => {
      router.refresh();
      setOpen?.(false);
    },
  });

  const handleUpdate = async (budgetFormValues: BudgetFormValues) => {
    startTransition(() => dispatch({ ...budgetFormValues, id: budget.id }));
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
