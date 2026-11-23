import {
  Calendar,
  FileText,
  Infinity as InfinityIcon,
  Receipt,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EnvelopeStatusBadge } from "@/features/envelopes/components/envelope-status-badge";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import type { Envelope } from "@/features/envelopes/types";
import { ExpenseHelpers } from "@/features/expenses/lib/expense-helpers";
import type { Expense } from "@/features/expenses/types";
import { PaymentMethodBadge } from "@/features/payment-methods/components/payment-method-badge";
import { LocalDate } from "@/shared/components/common/local-date";
import { Text } from "@/shared/components/common/typography";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { SupportedLocale } from "@/shared/config/i18n/config";
import { formatCalendarDate } from "@/shared/utils/date-helpers";
import { CURRENCY_MAP, formatCurrency } from "@/shared/utils/format-currency";

export async function ExpenseHighlightCard({
  expense,
  currency,
  locale,
}: {
  expense: Expense;
  currency: Envelope["currency"];
  locale: SupportedLocale;
}) {
  const t = await getTranslations("expenses");
  const expenseAmount = ExpenseHelpers.getAmount(expense);
  const currencyConfig = CURRENCY_MAP[currency];

  return (
    <Card className="overflow-hidden border-0 bg-card/50 shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
              <Receipt className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {expense.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex w-fit items-center gap-2 rounded-full bg-background/50 px-2.5 py-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium sm:text-sm">
                    {formatCalendarDate(expense.date, locale)}
                  </span>
                </div>
                {expense.paymentMethod && (
                  <PaymentMethodBadge
                    method={expense.paymentMethod}
                    variant="pill"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="pl-18 text-left sm:pl-0 md:text-right">
            <Text className="mb-0.5 text-xs font-medium sm:text-sm">
              {t("detail.totalAmount")}
            </Text>
            <p className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              {formatCurrency(expenseAmount, currencyConfig)}
            </p>
          </div>
        </div>

        {expense.description && (
          <div className="mt-8 border-t border-border/50 pt-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" />
              {t("detail.description")}
            </h3>
            <p className="max-w-2xl text-base leading-relaxed text-foreground/80">
              {expense.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export async function ExpenseSystemInfoCard({
  expense,
}: {
  expense: Expense;
  locale?: SupportedLocale;
}) {
  const t = await getTranslations("expenses");

  return (
    <Card className="border-0 bg-card/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t("detail.systemInfo")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <Text>{t("detail.createdAt")}</Text>
          <p className="font-medium">
            <LocalDate value={expense.createdAt} />
          </p>
        </div>
        <div className="space-y-1">
          <Text>{t("detail.updatedAt")}</Text>
          <p className="font-medium">
            <LocalDate value={expense.updatedAt} />
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export async function ExpenseImpactCard({
  expense,
  envelope,
}: {
  expense: Expense;
  envelope: Envelope;
}) {
  const t = await getTranslations("expenses");
  const isUnlimited = envelope.amount === null;
  const envelopeAmount = EnvelopeHelpers.getAmount(envelope);
  const envelopeSpent = EnvelopeHelpers.getSpent(envelope);
  const currencyConfig = CURRENCY_MAP[envelope.currency];
  const impactPercentage = ExpenseHelpers.getImpactPercentage(
    expense,
    envelope,
  );

  return (
    <Card className="overflow-hidden border-0 bg-card/50 shadow-sm">
      <CardHeader className="pt-6 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {t("detail.envelopeImpact")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {isUnlimited ? (
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <InfinityIcon className="h-6 w-6 text-muted-foreground" />
            <Text>{t("detail.noLimitEnvelope")}</Text>
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-end justify-between">
              <span className="w-full text-sm font-medium text-muted-foreground">
                {t("detail.represents")}
              </span>
              <span className="text-2xl font-bold text-primary">
                {(impactPercentage ?? 0).toFixed(1)}%
              </span>
            </div>
            <div
              aria-hidden="true"
              className="h-3 w-full overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(impactPercentage ?? 0, 100)}%`,
                }}
              />
            </div>
            <Text className="mt-2 text-right text-xs">
              {t("detail.ofAssigned", {
                amount: formatCurrency(envelopeAmount ?? 0, currencyConfig),
              })}
            </Text>
          </div>
        )}

        <div className="space-y-3 border-t border-border/50 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t("detail.envelopeStatus")}
            </span>
            <EnvelopeStatusBadge status={envelope.status} variant="text" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("detail.totalSpent")}
              </span>
              <span className="font-semibold">
                {formatCurrency(envelopeSpent, currencyConfig)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
