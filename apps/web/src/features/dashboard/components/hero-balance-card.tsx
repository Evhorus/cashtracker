import { useTranslations } from "next-intl";

import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";

interface HeroBalanceCardProps {
  currency: CurrencyCode;
  totalAssigned: number;
  /** Spend across all envelopes (capped + unlimited); budget progress uses `totalSpentCapped`. */
  totalSpent: number;
  /** Spend within capped envelopes only, compared against `totalAssigned`. */
  totalSpentCapped: number;
  /** Remaining balance in under-limit envelopes (never negative, not month-filtered). */
  totalAvailable: number;
  /** Overspend above limits, shown separately rather than netted against `totalAvailable`. */
  totalExceeded: number;
  className?: string;
}

export function HeroBalanceCard({
  currency,
  totalAssigned,
  totalSpent,
  totalSpentCapped,
  totalAvailable,
  totalExceeded,
  className,
}: HeroBalanceCardProps) {
  const t = useTranslations("dashboard");
  const tStats = useTranslations("statistics");
  const config = CURRENCY_MAP[currency];
  const percentage =
    totalAssigned > 0
      ? Math.min((totalSpentCapped / totalAssigned) * 100, 100)
      : 0;
  // Uncapped spend is shown on its own line so budget progress stays consistent with totalAvailable.
  const unlimitedSpent = totalSpent - totalSpentCapped;
  const isOverBudget = totalSpentCapped > totalAssigned;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm",
        className,
      )}
    >
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {/* Always tag currency (even with one currency) to keep amounts unambiguous. */}
        {t("available")} · {currency}
      </span>

      <p className="mt-1.5 font-serif text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        {formatCurrency(totalAvailable, config)}
      </p>

      {totalExceeded > 0 && (
        <p className="mt-1 text-sm text-destructive">
          <b className="font-mono font-semibold">
            {formatCurrency(totalExceeded, config)}
          </b>{" "}
          {t("exceededInEnvelopes")}
        </p>
      )}

      {totalAssigned > 0 && (
        <>
          {/* Show red when aggregate capped spend exceeds totalAssigned. */}
          <Progress
            value={percentage}
            className={cn(
              "mt-4 h-1.5 rounded-full",
              isOverBudget
                ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                : "[&_[data-slot=progress-indicator]]:bg-primary",
            )}
          />
          <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("spent")}{" "}
              <b className="font-mono font-semibold text-foreground">
                {formatCurrency(totalSpentCapped, config)}
              </b>
            </span>
            <span>
              {percentage.toFixed(0)}
              {t("percentOfBudget")}
            </span>
          </div>
        </>
      )}

      {unlimitedSpent > 0 && (
        <p
          className={cn(
            "text-xs text-muted-foreground",
            totalAssigned > 0 ? "mt-1.5" : "mt-4",
          )}
        >
          +{" "}
          <b className="font-mono font-semibold text-foreground">
            {formatCurrency(unlimitedSpent, config)}
          </b>{" "}
          {tStats("inUnlimited")}
        </p>
      )}
    </div>
  );
}
