"use client";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useActionDialog } from "@/shared/hooks/useActionDialog";
import { deleteCategoryAction } from "@/features/categories/actions/delete-category.action";

export interface CategoryToDelete {
  id: string;
  label: string;
}

interface DeleteCategoryAlertDialogProps {
  /** The category awaiting confirmation, or null when nothing is. */
  category: CategoryToDelete | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Controlled, and rendered ONCE by CategoriesSection rather than per
 * row - which is a correctness requirement, not a tidiness one.
 *
 * It used to render inside each row, owning its own trigger and open
 * state. Deleting then produced no success toast at all: the row
 * unmounts when the list re-renders, and useActionState delivers its
 * result to a component that is no longer there, so the effect in
 * useActionWithToast never ran with the success state. Instrumented, it
 * only ever saw {"errors":[],"success":""} - never an error either, so
 * nothing looked broken. The delete worked; it just never said so.
 *
 * CategoriesSection stays mounted across the refresh, so the toast
 * survives. The rows now only ask for the dialog to open.
 */
export const DeleteCategoryAlertDialog = ({
  category,
  onOpenChange,
}: DeleteCategoryAlertDialogProps) => {
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");

  const { dispatch, isPending } = useActionDialog(
    deleteCategoryAction,
    { errors: [], success: "" },
    { setOpen: onOpenChange },
  );

  return (
    <AlertDialog open={category !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.rich("deleteDialog.description", {
              name: () => (
                <span className="font-medium text-foreground">
                  {category?.label}
                </span>
              ),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            onClick={(e) => {
              e.preventDefault();
              if (category) dispatch(category.id);
            }}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
