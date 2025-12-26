"use client";
import { deleteBudgetAction } from "@/budgets/actions/budgets/delete-budget.action";
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
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import React, {
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { toast } from "sonner";

interface DeleteBudgetAlertDialogProps {
  id: string;
  name: string;
}

export const DeleteBudgetAlertDialog = ({
  id,
  name,
}: DeleteBudgetAlertDialogProps) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [inputValue, setInputValue] = useState("");
  const [state, dispatch, isPending] = useActionState(deleteBudgetAction, {
    errors: [],
    success: "",
  });

  useEffect(() => {
    if (state.errors) {
      state.errors.forEach((err) => {
        toast.error(err);
      });
    }
  }, [state]);

  const handleDeleteBudget = async () => {
    startTransition(() => dispatch(id));
  };

  const Content = (
    <div className="my-2 space-y-2">
      <p className="text-sm text-muted-foreground">
        Escribe <span className="font-bold text-foreground">{name}</span> para
        confirmar:
      </p>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Nombre del presupuesto"
        className="col-span-3"
        autoComplete="off"
      />
    </div>
  );

  if (isDesktop) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los gastos
              asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {Content}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteBudget();
              }}
              disabled={isPending || inputValue !== name}
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
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>¿Eliminar presupuesto?</DrawerTitle>
          <DrawerDescription>
            Esta acción no se puede deshacer. Se eliminarán todos los gastos
            asociados.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{Content}</div>
        <DrawerFooter className="pt-2">
          <Button
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full"
            onClick={handleDeleteBudget}
            disabled={isPending || inputValue !== name}
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
