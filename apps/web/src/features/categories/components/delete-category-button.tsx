"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { CardActionButton } from "@/shared/components/common/card-action-button";

/** Triggers CategoriesSection's shared delete dialog (row-scoped dialogs lose their success toast on unmount). */
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
