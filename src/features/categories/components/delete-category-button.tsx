"use client";

import { Trash2 } from "lucide-react";

import { CardActionButton } from "@/shared/components/common/card-action-button";
import { useTranslations } from "next-intl";

/**
 * Asks CategoriesSection to open its delete dialog.
 *
 * The dialog itself is deliberately NOT here - see
 * delete-category-alert-dialog.tsx for why a row-scoped one loses its
 * own success toast.
 */
export const DeleteCategoryButton = ({ onClick }: { onClick: () => void }) => {
  const t = useTranslations("categories");

  return (
    <CardActionButton
      icon={Trash2}
      label={t("deleteAria")}
      tone="destructive"
      onClick={onClick}
    />
  );
};
