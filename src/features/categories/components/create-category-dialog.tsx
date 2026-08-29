"use client";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveFormSheet } from "@/components/common/responsive-form-sheet";
import { useActionDialog } from "@/hooks/useActionDialog";
import { CategoryForm } from "./category-form";
import { CategoryFormValues } from "@/features/categories/schemas/category.schema";
import { createCategoryAction } from "@/features/categories/actions/create-category.action";

interface CreateCategoryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires once the category is actually saved, with the label just
   * created - e.g. so CategoryPicker can auto-select it. Separate from
   * onOpenChange, which just tracks the dialog's open state. */
  onCreated?: (label: string) => void;
  /** Omit when the dialog is fully controlled from outside, e.g. opened
   * from CategoryPicker's own footer button. */
  trigger?: React.ReactElement;
}

export const CreateCategoryDialog = ({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onCreated,
  trigger,
}: CreateCategoryDialogProps) => {
  const t = useTranslations("categories");
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  // useActionWithToast's onSuccess only gets the action's own state (just
  // {message}), not the payload that produced it - stash the label the
  // user submitted here so onCreated can hand it back.
  const lastLabelRef = useRef("");

  const { dispatch, isPending } = useActionDialog(
    createCategoryAction,
    { errors: [], success: "" },
    {
      setOpen,
      onSuccess: () => onCreated?.(lastLabelRef.current),
    },
  );

  const handleCreate = async (categoryFormValues: CategoryFormValues) => {
    lastLabelRef.current = categoryFormValues.label;
    dispatch(categoryFormValues);
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={setOpen}
      title={t("createDialog.title")}
      description={t("createDialog.description")}
      trigger={
        trigger ??
        (!isControlled ? (
          <Button variant="default" size="lg">
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">{t("new")}</span>
          </Button>
        ) : undefined)
      }
    >
      <CategoryForm
        isLoading={isPending}
        onSubmit={handleCreate}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};
