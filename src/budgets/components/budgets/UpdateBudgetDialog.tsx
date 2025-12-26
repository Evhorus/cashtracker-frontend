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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { Edit } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { BudgetForm } from "./BudgetForm";
import { useActionWithToast } from "../../hooks/useActionWithToast";
import { BudgetFormValues } from "../../schemas/budget.schema";
import { Budget } from "../../types";
import { createUpdateBudgetAction } from "@/budgets/actions/budgets/create-update-budget.action";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

interface UpdateBudgetDialogProps {
  budget: Budget;
}

export const UpdateBudgetDialog = ({ budget }: UpdateBudgetDialogProps) => {
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

  const handleUpdate = async (budgetFormValues: BudgetFormValues) => {
    startTransition(() => dispatch({ ...budgetFormValues, id: budget.id }));
  };

  if (isDesktop) {
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
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Editar</DrawerTitle>
          <DrawerDescription>
            Aquí puedes editar el presupuesto
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <BudgetForm
            budget={budget}
            isLoading={isPending}
            onSubmit={handleUpdate}
            onCloseDialog={() => setOpen(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
