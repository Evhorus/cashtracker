"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { createCategoryAction } from "@/features/categories/actions/create-category.action";
import type { CategoryFormValues } from "@/features/categories/schemas/category.schema";
import { ResponsiveFormSheet } from "@/shared/components/common/responsive-form-sheet";
import { Button } from "@/shared/components/ui/button";
import { useActionDialog } from "@/shared/hooks/use-action-dialog";
import { CategoryForm } from "./category-form";

interface CreateCategoryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated?: (categoryId: string) => void;
  /** Omit when controlled externally without a trigger button. */
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

  const { dispatch, isPending } = useActionDialog(
    createCategoryAction,
    { errors: [], success: "" },
    {
      setOpen,
      onSuccess: (state) => {
        if (state.data?.id) onCreated?.(state.data.id);
      },
    },
  );

  const handleCreate = async (categoryFormValues: CategoryFormValues) => {
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
          <Button variant="default" size="lg" aria-label={t("new")}>
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
