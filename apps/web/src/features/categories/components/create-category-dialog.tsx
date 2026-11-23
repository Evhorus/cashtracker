"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ResponsiveFormSheet } from "@/shared/components/common/responsive-form-sheet";
import { useActionDialog } from "@/shared/hooks/useActionDialog";
import { CategoryForm } from "./category-form";
import { CategoryFormValues } from "@/features/categories/schemas/category.schema";
import { createCategoryAction } from "@/features/categories/actions/create-category.action";

interface CreateCategoryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires once the category is actually saved, with the newly created
   * category id - e.g. so CategoryPicker can auto-select it. Separate from
   * onOpenChange, which just tracks the dialog's open state. */
  onCreated?: (categoryId: string) => void;
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
