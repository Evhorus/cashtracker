"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Edit } from "lucide-react";
import { ResponsiveFormSheet } from "@/shared/components/common/responsive-form-sheet";
import { CardActionButton } from "@/shared/components/common/card-action-button";
import { useActionDialog } from "@/shared/hooks/useActionDialog";
import { ExpenseForm } from "./expense-form";
import { Expense } from "@/features/expenses/types";
import { updateExpenseAction } from "@/features/expenses/actions/update-expense.action";
import { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";
import { ExpenseMapper } from "@/features/expenses/mappers/expense.mapper";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import { formatCalendarDateForApi } from "@/shared/utils/date-helpers";

interface UpdateExpenseDialogProps {
  envelopeId: string;
  currency: CurrencyCode;
  expense: Expense;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Override the default trigger's a11y label - the expense detail page
   * passes the shorter common.edit since there's only one edit button
   * on that page, no ambiguity to resolve. */
  label?: string;
  /** See CardActionButton - only the expense detail page's header turns
   * this on. */
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
