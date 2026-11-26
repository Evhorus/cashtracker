"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Expense } from "@/features/expenses/types";
import type { ActionItem } from "@/shared/components/common/actions-drawer";
import { ActionsDrawer } from "@/shared/components/common/actions-drawer";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import { DeleteExpenseAlertDialog } from "./delete-expense-alert-dialog";
import { UpdateExpenseDialog } from "./update-expense-dialog";

interface ExpenseActionsMenuProps {
  envelopeId: string;
  currency: CurrencyCode;
  expense: Expense;
  triggerClassName?: string;
}

export const ExpenseActionsMenu = ({
  envelopeId,
  currency,
  expense,
  triggerClassName,
}: ExpenseActionsMenuProps) => {
  const t = useTranslations("expenses");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const actions: ActionItem[] = [
    {
      label: t("editAria"),
      icon: Edit,
      onClick: () => setShowEditDialog(true),
    },
    {
      label: t("deleteAria"),
      icon: Trash2,
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive",
    },
  ];

  return (
    <>
      <ActionsDrawer
        actions={actions}
        title={t("optionsMenu")}
        triggerClassName={triggerClassName}
      />

      <UpdateExpenseDialog
        envelopeId={envelopeId}
        currency={currency}
        expense={expense}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <DeleteExpenseAlertDialog
        envelopeId={envelopeId}
        expenseId={expense.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};
