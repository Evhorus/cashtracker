"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { resolveIcon } from "@/features/categories/lib/icon-registry";
import { withAlpha } from "@/features/categories/lib/with-alpha";
import type { EnvelopeCategory } from "@/features/envelopes/types";
import { createExpenseAction } from "@/features/expenses/actions/create-expense.action";
import { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";
import { ResponsiveFormSheet } from "@/shared/components/common/responsive-form-sheet";
import { Button } from "@/shared/components/ui/button";
import { useActionDialog } from "@/shared/hooks/use-action-dialog";
import { formatCalendarDateForApi } from "@/shared/utils/date-helpers";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import { ExpenseForm } from "./expense-form";

interface CreateExpenseDialogProps {
  envelopeId: string;
  currency: CurrencyCode;
  envelopeName?: string;
  envelopePeriod?: string;
  envelopeCategory?: EnvelopeCategory | null;
}

function ExpenseDialogSubtitle({
  envelopeName,
  envelopePeriod,
  envelopeCategory,
}: {
  envelopeName: string;
  envelopePeriod?: string;
  envelopeCategory?: EnvelopeCategory | null;
}) {
  const t = useTranslations("expenses.createDialog");
  // On an object, not a capitalized local - see category-badge.tsx.
  const def = envelopeCategory
    ? { ...envelopeCategory, Icon: resolveIcon(envelopeCategory.icon) }
    : null;
  return (
    <span className="flex items-start gap-1.5">
      {def && (
        <span
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md"
          style={{ background: withAlpha(def.color, 0.18), color: def.color }}
        >
          <def.Icon className="h-2.5 w-2.5" />
        </span>
      )}
      {/* Wrapper span keeps t.rich nodes inline instead of separate flex columns. */}
      <span className="min-w-0">
        {t.rich("forEnvelope", {
          name: () => <b className="font-semibold">{envelopeName}</b>,
        })}
        {envelopePeriod && (
          <span className="text-muted-foreground"> · {envelopePeriod}</span>
        )}
      </span>
    </span>
  );
}

export const CreateExpenseDialog = ({
  envelopeId,
  currency,
  envelopeName,
  envelopePeriod,
  envelopeCategory,
}: CreateExpenseDialogProps) => {
  const t = useTranslations("expenses");
  const [open, setOpen] = useState(false);

  const { dispatch, isPending } = useActionDialog(
    createExpenseAction,
    { errors: [], success: "" },
    { setOpen },
  );

  const handleCreate = async (expenseFormValues: ExpenseFormValues) => {
    dispatch({
      ...expenseFormValues,
      // Format on the client using the visitor's local calendar components so
      // UTC+ timezones never lose a day when the Date crosses to a UTC server.
      date: formatCalendarDateForApi(expenseFormValues.date),
      envelopeId,
    });
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={setOpen}
      title={t("createDialog.title")}
      description={
        envelopeName ? (
          <ExpenseDialogSubtitle
            envelopeName={envelopeName}
            envelopePeriod={envelopePeriod}
            envelopeCategory={envelopeCategory}
          />
        ) : (
          t("createDialog.fallbackDescription")
        )
      }
      dialogClassName="sm:max-w-125"
      trigger={
        // Explicit aria-label because text label is hidden below sm.
        <Button variant="default" size="lg" aria-label={t("add")}>
          <Plus />
          <span className="hidden sm:inline-block">{t("add")}</span>
        </Button>
      }
    >
      <ExpenseForm
        currency={currency}
        onSubmit={handleCreate}
        isLoading={isPending}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};
