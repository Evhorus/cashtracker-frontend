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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { Budget } from "../../types";
import { useActionWithToast } from "../../hooks/useActionWithToast";
import { BudgetForm } from "./BudgetForm";
import { BudgetFormValues } from "../../schemas/budget.schema";

import { createUpdateBudgetAction } from "@/budgets/actions/budgets/create-update-budget.action";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

const budgetData = {
  name: "",
  amount: "",
  description: "",
} as unknown as Budget;

export const CreateBudgetDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  const handleCreate = async (budgetFormValues: BudgetFormValues) => {
    startTransition(() => dispatch(budgetFormValues));
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="lg">
            <Plus className="h-5 w-5" />
            Nuevo Presupuesto
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
            budget={budgetData}
            isLoading={isPending}
            onSubmit={handleCreate}
            onCloseDialog={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="default" size="lg">
          <Plus className="h-5 w-5" />
          Nuevo Presupuesto
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Crear</DrawerTitle>
          <DrawerDescription>
            Aquí puedes crear un presupuesto
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <BudgetForm
            budget={budgetData}
            isLoading={isPending}
            onSubmit={handleCreate}
            onCloseDialog={() => setOpen(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
