"use client";
import { useTranslations } from "next-intl";
import { Edit } from "lucide-react";
import { useState } from "react";
import { CardActionButton } from "@/components/common/card-action-button";
import { ResponsiveFormSheet } from "@/components/common/responsive-form-sheet";
import { useActionDialog } from "@/hooks/useActionDialog";
import { CategoryForm } from "./category-form";
import { CategoryFormValues } from "@/features/categories/schemas/category.schema";
import type { Category } from "@/features/categories/types";
import { updateCategoryAction } from "@/features/categories/actions/update-category.action";

interface UpdateCategoryDialogProps {
  category: Category;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const UpdateCategoryDialog = ({
  category,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: UpdateCategoryDialogProps) => {
  const t = useTranslations("categories");
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const { dispatch, isPending } = useActionDialog(
    updateCategoryAction,
    { errors: [], success: "" },
    { setOpen },
  );

  const handleUpdate = async (categoryFormValues: CategoryFormValues) => {
    dispatch({ ...categoryFormValues, id: category.id });
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={setOpen}
      title={t("updateDialog.title")}
      description={t("updateDialog.description")}
      trigger={
        isControlled ? undefined : (
          <CardActionButton icon={Edit} label={t("editAria")} />
        )
      }
    >
      <CategoryForm
        defaultValues={{
          label: category.label,
          color: category.color as CategoryFormValues["color"],
          icon: category.icon as CategoryFormValues["icon"],
        }}
        isLoading={isPending}
        onSubmit={handleUpdate}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};
