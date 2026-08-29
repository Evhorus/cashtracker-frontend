"use client";
import { useTranslations } from "next-intl";
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
import { CardActionButton } from "@/components/common/card-action-button";
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
  /** Override the default trigger's a11y label - the expense detail
   * page's desktop header passes the shorter common.delete since
   * there's only one delete button on that page, no ambiguity to
   * resolve. Only applies to the desktop (AlertDialog) trigger below -
   * the mobile Drawer trigger is unaffected. */
  label?: string;
  /** See CardActionButton - only the expense detail page's header turns
   * this on. Desktop-only trigger, same reasoning as `label`. */
  showLabelOnDesktop?: boolean;
}

export const DeleteExpenseAlertDialog = ({
  envelopeId,
  expenseId,
  className = "",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  label,
  showLabelOnDesktop,
}: DeleteExpenseAlertDialogProps) => {
  const t = useTranslations("expenses");
  const tCommon = useTranslations("common");
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
              <CardActionButton
                icon={Trash2}
                label={label ?? t("deleteAria")}
                tone="destructive"
                showLabelOnDesktop={showLabelOnDesktop}
                className={className}
              />
            }
          />
        )}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
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
          <DrawerTitle>{t("deleteDialog.title")}</DrawerTitle>
          <DrawerDescription>{t("deleteDialog.description")}</DrawerDescription>
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
