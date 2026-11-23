"use client";

import { useTranslations, useLocale } from "next-intl";
import { Expense } from "@/features/expenses/types";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatCalendarDateShort } from "@/shared/utils/date-helpers";
import { PaymentMethodBadge } from "@/features/payment-methods/components/payment-method-badge";
import { CURRENCY_MAP, formatCurrency } from "@/shared/utils/format-currency";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  ActionsDrawer,
  type ActionItem,
} from "@/shared/components/common/actions-drawer";
import type { CurrencyCode } from "@/shared/utils/format-currency";

interface ExpenseCardProps {
  expense: Expense;
  envelopeId: string;
  currency: CurrencyCode;
  onEdit: () => void;
  onDelete: () => void;
}

export const ExpenseCard = ({
  expense,
  envelopeId,
  currency,
  onEdit,
  onDelete,
}: ExpenseCardProps) => {
  const t = useTranslations("expenses");
  const locale = useLocale();

  const actions: ActionItem[] = [
    {
      label: t("editAria"),
      icon: Edit,
      onClick: onEdit,
    },
    {
      label: t("deleteAria"),
      icon: Trash2,
      onClick: onDelete,
      variant: "destructive",
    },
  ];

  return (
    <Card
      size="sm"
      className="relative overflow-hidden border-border/60 bg-card/50 shadow-sm transition-colors duration-200 hover:bg-card"
    >
      <CardContent className="flex flex-row items-center gap-3">
        {/* First-letter avatar instead of a generic receipt icon
            repeated identically on every row - lets a scanned list
            of expense names actually be scannable by more than just
            their text. */}
        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground sm:flex">
          <span className="font-mono text-sm font-semibold">
            {expense.name.trim().charAt(0).toUpperCase() || "?"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          {/* The name is the link to the detail page: a separate
              chevron took width a phone row needs for the name and
              its payment method. */}
          <Link
            href={`/dashboard/envelope/${envelopeId}/expenses/${expense.id}`}
            className="block truncate text-sm font-semibold hover:text-primary"
          >
            {expense.name}
          </Link>
          {/* Date and payment method on one line: the full weekday
              date used to fill it alone, and the card was only
              visible after opening the edit form. */}
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className="shrink-0 font-mono">
              {formatCalendarDateShort(expense.date, locale, true)}
            </span>
            {expense.paymentMethod && (
              <>
                <span aria-hidden>·</span>
                <PaymentMethodBadge method={expense.paymentMethod} />
              </>
            )}
          </div>
        </div>

        <span className="shrink-0 font-mono text-sm font-bold text-primary">
          {formatCurrency(+expense.amount, CURRENCY_MAP[currency])}
        </span>

        {/* Mobile Actions (Drawer) - edit/delete dialogs live once at
            ExpensesList level. */}
        <div className="shrink-0">
          <ActionsDrawer
            actions={actions}
            title={t("optionsMenu")}
            triggerClassName="-mr-2 h-8 w-7 text-muted-foreground"
          />
        </div>
      </CardContent>
    </Card>
  );
};
