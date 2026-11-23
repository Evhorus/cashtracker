import Link from "next/link";
import {
  ArrowRight,
  Edit,
  Infinity as InfinityIcon,
  Trash2,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import {
  CategoryIcon,
  CategoryLabel,
} from "@/features/categories/components/category-badge";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import { Envelope } from "@/features/envelopes/types";
import {
  ActionsDrawer,
  type ActionItem,
} from "@/shared/components/common/actions-drawer";
import { Text } from "@/shared/components/common/typography";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { CURRENCY_MAP, formatCurrency } from "@/shared/utils/format-currency";

interface EnvelopeCardProps {
  envelope: Envelope;
  onEdit: () => void;
  onDelete: () => void;
}

export const EnvelopeCard = ({
  envelope,
  onEdit,
  onDelete,
}: EnvelopeCardProps) => {
  const t = useTranslations("envelopes");
  const locale = useLocale();
  const envelopeId = envelope.id;
  const currencyConfig = CURRENCY_MAP[envelope.currency];

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

  const status = envelope.status;
  const calculations = {
    remaining: EnvelopeHelpers.getRemaining(envelope),
    percentage: EnvelopeHelpers.getPercentage(envelope),
    status,
    isExceeded: status === "exceeded",
    isUnlimited: status === "unlimited",
  };

  const progressColorClass = EnvelopeHelpers.getStatusProgressBarColorClass(
    calculations.status,
  );
  const amountTextColorClass = EnvelopeHelpers.getStatusTextColorClass(
    calculations.status,
  );

  return (
    <Card
      size="sm"
      className="group relative h-full overflow-hidden border-border/60 bg-card/50 shadow-sm transition-all duration-300 hover:bg-card hover:shadow-lg"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative z-10 flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CategoryIcon
            category={envelope.category}
            className="h-9 w-9 rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-110"
          />

          <div className="min-w-0 space-y-0.5">
            {/* min-w-0 here and on ancestors lets truncate fill whatever width the right-side actions leave. */}
            <CardTitle className="text-sm leading-none font-bold tracking-tight transition-colors duration-200 group-hover:text-primary">
              <span className="block truncate">{envelope.name}</span>
            </CardTitle>
            {/* Expense date span (falling back to creation month) disambiguates reused envelope names. */}
            <Text className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
              <span>{EnvelopeHelpers.formatPeriod(envelope, locale)}</span>
              {envelope.category && (
                <>
                  <span aria-hidden="true">·</span>
                  <CategoryLabel category={envelope.category} />
                </>
              )}
              {/* Always show currency code (including COP) so multi-currency amounts stay unambiguous. */}
              <span className="rounded-sm bg-secondary px-1 py-0.5 font-mono text-[10px] text-secondary-foreground">
                {envelope.currency}
              </span>
            </Text>
          </div>
        </div>

        {!calculations.isUnlimited && (
          <span
            className={`shrink-0 font-mono text-sm font-bold ${amountTextColorClass}`}
          >
            {/* Uncapped percentage (the bar below caps at 100%, but the numeral shows true overspend). */}
            {(calculations.percentage ?? 0).toFixed(0)}%
          </span>
        )}

        {/* Dialogs live once at EnvelopesGrid level. */}
        <div className="flex shrink-0 items-center" data-no-nav>
          <ActionsDrawer actions={actions} title={t("optionsMenu")} />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-2.5">
        {!calculations.isUnlimited && (
          <Progress
            value={Math.min(calculations.percentage ?? 0, 100)}
            className={`h-1.5 rounded-full bg-secondary/50 ${progressColorClass}`}
          />
        )}

        <div className="flex items-center justify-between font-mono text-xs">
          <span className={calculations.isUnlimited ? "font-bold" : ""}>
            <span
              className={
                calculations.isUnlimited ? amountTextColorClass : undefined
              }
            >
              {formatCurrency(+envelope.spent, currencyConfig)}
            </span>{" "}
            <span className="text-muted-foreground">
              {calculations.isUnlimited ? t("card.noLimit") : t("card.spent")}
            </span>
          </span>
          {calculations.isUnlimited ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <InfinityIcon className="h-3 w-3" />
            </span>
          ) : (
            <span
              className={
                (calculations.remaining ?? 0) < 0
                  ? "font-semibold text-destructive"
                  : "font-semibold text-success"
              }
            >
              {t("card.available", {
                amount: formatCurrency(
                  calculations.remaining ?? 0,
                  currencyConfig,
                ),
              })}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          nativeButton={false}
          className="group/btn h-auto w-full justify-end gap-1 px-0 py-0 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-primary"
          render={
            <Link href={`/dashboard/envelope/${envelopeId}`}>
              {t("seeDetails")}
              <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          }
        />
      </CardContent>

      {calculations.isExceeded && (
        <div className="absolute right-0 bottom-0 left-0 h-1 bg-destructive/50" />
      )}
    </Card>
  );
};
