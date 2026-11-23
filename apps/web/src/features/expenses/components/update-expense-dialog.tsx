"use client";
import { useState } from "react";
import { Edit } from "lucide-react";
import { useTranslations } from "next-intl";

import { updateExpenseAction } from "@/features/expenses/actions/update-expense.action";
import { ExpenseMapper } from "@/features/expenses/mappers/expense.mapper";
import { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";
import { Expense } from "@/features/expenses/types";
import { CardActionButton } from "@/shared/components/common/card-action-button";
import { ResponsiveFormSheet } from "@/shared/components/common/responsive-form-sheet";
import { useActionDialog } from "@/shared/hooks/use-action-dialog";
import { formatCalendarDateForApi } from "@/shared/utils/date-helpers";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import { ExpenseForm } from "./expense-form";

interface UpdateExpenseDialogProps {
  envelopeId: string;
  currency: CurrencyCode;
  expense: Expense;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Overrides the trigger's accessible label. */
  label?: string;
  showLabelOnDesktop?: boolean;
}

export const UpdateExpenseDialog = ({
  envelopeId,
  currency,
  expense,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  label,
  showLabelOnDesktop,
}: UpdateExpenseDialogProps) => {
  const t = useTranslations("expenses");
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const { dispatch, isPending } = useActionDialog(
    updateExpenseAction,
    {
      errors: [],
      success: "",
    },
    {
      setOpen,
    },
  );

  const handleUpdate = async (expenseFormValues: ExpenseFormValues) => {
    dispatch({
      ...expenseFormValues,
      // Format on the client using the visitor's local calendar components so
      // UTC+ timezones never lose a day when the Date crosses to a UTC server.
      date: formatCalendarDateForApi(expenseFormValues.date),
      envelopeId,
      expenseId: expense.id,
    });
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={setOpen}
      title={t("updateDialog.title")}
      description={t("updateDialog.description")}
      dialogClassName="sm:max-w-125"
      trigger={
        isControlled ? undefined : (
          <CardActionButton
            icon={Edit}
            label={label ?? t("editAria")}
            showLabelOnDesktop={showLabelOnDesktop}
          />
        )
      }
    >
      <ExpenseForm
        key={expense.id}
        currency={currency}
        defaultValues={ExpenseMapper.toFormValues(expense)}
        onSubmit={handleUpdate}
        isLoading={isPending}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};
