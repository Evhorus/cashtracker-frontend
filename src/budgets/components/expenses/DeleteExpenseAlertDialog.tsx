"use client";
import { deleteExpenseAction } from "@/budgets/actions/expenses/delete-expense.action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Loader2, Trash2 } from "lucide-react";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { toast } from "sonner";

interface DeleteExpenseAlertDialogProps {
  budgetId: string;
  expenseId: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DeleteExpenseAlertDialog = ({
  budgetId,
  expenseId,
  className = "",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DeleteExpenseAlertDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [state, dispatch, isPending] = useActionState(deleteExpenseAction, {
    errors: [],
    success: "",
  });

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  useEffect(() => {
    if (state.errors) {
      state.errors.forEach((err) => {
        toast.error(err);
      });
    }
  }, [state]);

  const handleDeleteBudget = async () => {
    startTransition(() => dispatch({ budgetId, expenseId }));
  };

  if (isDesktop) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        {!isControlled && (
          <AlertDialogTrigger asChild>
            <Button className={cn(className)} variant="outline" size="icon">
              <Trash2 className="text-destructive" />
            </Button>
          </AlertDialogTrigger>
        )}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteBudget();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DrawerTrigger asChild>
          <Button className={cn(className)} variant="outline" size="icon">
            <Trash2 className="text-destructive" />
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>¿Eliminar gasto?</DrawerTitle>
          <DrawerDescription>
            Esta acción no se puede deshacer.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <Button
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full"
            onClick={handleDeleteBudget}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
