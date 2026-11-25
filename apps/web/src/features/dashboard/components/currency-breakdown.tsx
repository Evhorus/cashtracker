import { useTranslations } from "next-intl";

import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";

interface CurrencyTotal {
  currency: CurrencyCode;
  /** Uncapped backend COUNT(*) grouped by currency (keeps count consistent with totals). */
  totalEnvelopes: number;
  totalAssigned: number;
  /** Spend across all envelopes (capped + unlimited); headline uses `totalSpentCapped`. */
  totalSpent: number;
  /** Spend within capped envelopes only (matches budgeted total). */
  totalSpentCapped: number;
}

interface CurrencyBreakdownProps {
  totals: CurrencyTotal[];
}

// Per-currency totals from a single backend aggregate; rendered only when multiple currencies exist.
export function CurrencyBreakdown({ totals }: CurrencyBreakdownProps) {
  const t = useTranslations("statistics");
  return (
    <div className="space-y-3">
      {totals.map((total) => {
        const config = CURRENCY_MAP[total.currency];
        const count = total.totalEnvelopes;
        // Uncapped spend is shown separately rather than folded into the budgeted headline figure.
        const unlimitedSpent = total.totalSpent - total.totalSpentCapped;
        return (
          <div
            key={total.currency}
            className="rounded-xl border border-border/60 bg-background/40 p-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
                {total.currency}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("envelopeCount", { count })}
              </span>
            </div>
            <p className="mt-2.5 font-mono text-lg font-semibold">
              {formatCurrency(total.totalSpentCapped, config)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("ofBudgeted", {
                amount: formatCurrency(total.totalAssigned, config),
              })}
            </p>
            {unlimitedSpent > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                +{" "}
                <b className="font-mono font-semibold text-foreground">
                  {formatCurrency(unlimitedSpent, config)}
                </b>{" "}
                {t("inUnlimited")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
