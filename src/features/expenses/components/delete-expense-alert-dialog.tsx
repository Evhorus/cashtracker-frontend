"use client";
import { deleteExpenseAction } from "@/features/expenses/actions/delete-expense.action";
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
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useActionDialog } from "@/hooks/useActionDialog";

interface DeleteExpenseAlertDialogProps {
  envelopeId: string;
  expenseId: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DeleteExpenseAlertDialog = ({
  envelopeId,
  expenseId,
  className = "",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DeleteExpenseAlertDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { dispatch, isPending } = useActionDialog(
    deleteExpenseAction,
    {
      errors: [],
      success: "",
    },
    {
      setOpen: (open) => {
        if (controlledOpen === undefined) {
          setInternalOpen(open);
        } else {
          setControlledOpen?.(open);
        }
      },
    },
  );

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const handleDeleteExpense = async () => {
    dispatch({ envelopeId, expenseId });
  };

  if (isDesktop) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        {!isControlled && (
          <AlertDialogTrigger
            render={
              <Button className={cn(className)} variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
              </Button>
            }
          />
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
                handleDeleteExpense();
              }}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
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
        <DrawerTrigger
          render={
            <Button className={cn(className)} variant="ghost" size="icon">
              <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
            </Button>
          }
        />
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
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDeleteExpense}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </Button>
          <DrawerClose
            render={
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            }
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
