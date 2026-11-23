"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { deleteExpenseAction } from "@/features/expenses/actions/delete-expense.action";
import { CardActionButton } from "@/shared/components/common/card-action-button";
import { ConfirmDeleteDialog } from "@/shared/components/common/confirm-delete-dialog";
import { useActionDialog } from "@/shared/hooks/use-action-dialog";

interface DeleteExpenseAlertDialogProps {
  envelopeId: string;
  expenseId: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  label?: string;
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

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (nextOpen: boolean) => {
    if (isControlled) {
      setControlledOpen?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  };

  const { dispatch, isPending } = useActionDialog(
    deleteExpenseAction,
    { errors: [], success: "" },
    { setOpen },
  );

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={setOpen}
      title={t("deleteDialog.title")}
      description={t("deleteDialog.description")}
      confirmLabel={tCommon("delete")}
      cancelLabel={tCommon("cancel")}
      isPending={isPending}
      onConfirm={() => dispatch({ envelopeId, expenseId })}
      trigger={
        isControlled ? undefined : (
          <CardActionButton
            icon={Trash2}
            label={label ?? t("deleteAria")}
            tone="destructive"
            showLabelOnDesktop={showLabelOnDesktop}
            className={className}
          />
        )
      }
    />
  );
};
