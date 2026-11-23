import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Expense } from "@/features/expenses/types";
import { PaymentMethodBadge } from "@/features/payment-methods/components/payment-method-badge";
import { CardActionButton } from "@/shared/components/common/card-action-button";
import { CardHoverActions } from "@/shared/components/common/card-hover-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatCalendarDateShort } from "@/shared/utils/date-helpers";
import { CURRENCY_MAP, formatCurrency } from "@/shared/utils/format-currency";
import type { CurrencyCode } from "@/shared/utils/format-currency";

interface ExpensesTableProps {
  expenses: Expense[];
  envelopeId: string;
  currency: CurrencyCode;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

// Desktop-only table; mobile renders ExpenseCard in expenses-list.tsx.
export function ExpensesTable({
  expenses,
  envelopeId,
  currency,
  onEdit,
  onDelete,
}: ExpensesTableProps) {
  const t = useTranslations("expenses.table");
  const tExpenses = useTranslations("expenses");
  const locale = useLocale();
  const currencyConfig = CURRENCY_MAP[currency];

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card/30 md:block">
      <Table className="min-w-max text-sm">
        <TableHeader>
          <TableRow className="border-border/60 bg-card/60 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:bg-card/60">
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              {t("expense")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              {t("date")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-right font-semibold text-inherit">
              {t("amount")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} className="group border-border/60">
              <TableCell className="px-5 py-3.5">
                {/* Only name+avatar links to detail so date and amount stay selectable text. */}
                <Link
                  href={`/dashboard/envelope/${envelopeId}/expenses/${expense.id}`}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <span className="font-mono text-sm font-semibold">
                      {expense.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <span className="min-w-0">
                    <span className="block truncate font-medium hover:text-primary">
                      {expense.name}
                    </span>
                    {expense.paymentMethod && (
                      <PaymentMethodBadge
                        method={expense.paymentMethod}
                        className="text-xs text-muted-foreground"
                      />
                    )}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                {formatCalendarDateShort(expense.date, locale, true)}
              </TableCell>

              <TableCell className="px-5 py-3.5 text-right font-mono font-semibold text-primary">
                {formatCurrency(+expense.amount, currencyConfig)}
              </TableCell>
              <TableCell className="px-5 py-3.5">
                <CardHoverActions className="justify-end" alwaysVisible>
                  <CardActionButton
                    icon={Edit}
                    label={tExpenses("editAria")}
                    onClick={() => onEdit(expense)}
                  />
                  <CardActionButton
                    icon={Trash2}
                    label={tExpenses("deleteAria")}
                    tone="destructive"
                    onClick={() => onDelete(expense)}
                  />
                </CardHoverActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
