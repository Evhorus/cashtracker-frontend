"use client";
import { startTransition, useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Budget } from '@/features/budgets/types';
import { useActionWithToast } from '@/shared/hooks/useActionWithToast';
import { BudgetForm } from "./BudgetForm";
import { BudgetFormValues } from '@/features/budgets/schemas/budget.schema';

import { createBudgetAction } from "@/features/budgets/actions/create-budget.action";

export const CreateBudgetDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [state, dispatch, isPending] = useActionState(
    createBudgetAction,
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

  const handleCreate = async (budgetFormValues: BudgetFormValues) => {
    startTransition(() => dispatch(budgetFormValues));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <Plus className="h-5 w-5" />
          <span className="hidden md:inline">Nuevo Presupuesto</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear</DialogTitle>
          <DialogDescription>
            Aquí puedes crear un presupuesto
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          isLoading={isPending}
          onSubmit={handleCreate}
          onCloseDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
