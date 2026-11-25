"use client";

import { useTranslations } from "next-intl";

import { deleteCategoryAction } from "@/features/categories/actions/delete-category.action";
import { ConfirmDeleteDialog } from "@/shared/components/common/confirm-delete-dialog";
import { useActionDialog } from "@/shared/hooks/use-action-dialog";

export interface CategoryToDelete {
  id: string;
  label: string;
}

interface DeleteCategoryAlertDialogProps {
  category: CategoryToDelete | null;
  onOpenChange: (open: boolean) => void;
}

/** Mounted once at list level so the component survives row removal and fires the success toast. */
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
    <ConfirmDeleteDialog
      open={category !== null}
      onOpenChange={onOpenChange}
      title={t("deleteDialog.title")}
      description={t.rich("deleteDialog.description", {
        name: () => (
          <span className="font-medium text-foreground">{category?.label}</span>
        ),
      })}
      confirmLabel={tCommon("delete")}
      cancelLabel={tCommon("cancel")}
      isPending={isPending}
      onConfirm={() => {
        if (category) dispatch(category.id);
      }}
    />
  );
};
