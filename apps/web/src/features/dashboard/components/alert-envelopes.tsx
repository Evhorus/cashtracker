import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { CategoryIcon } from "@/features/categories/components/category-badge";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import { Heading } from "@/shared/components/common/typography";
import { cn } from "@/shared/lib/utils";
import { CURRENCY_MAP, formatCurrency } from "@/shared/utils/format-currency";
import type { AlertEnvelope } from "../lib/dashboard-summary";

interface AlertEnvelopesProps {
  /** Already filtered and sorted worst-first - see getAlertEnvelopes. */
  entries: AlertEnvelope[];
  className?: string;
}

const MAX_ROWS = 3;

export async function AlertEnvelopes({
  entries,
  className,
}: AlertEnvelopesProps) {
  const t = await getTranslations("dashboard");
  const tEnv = await getTranslations("envelopes");
  const locale = await getLocale();

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Heading size="sm">{t("alertsTitle")}</Heading>
        <Link
          href="/dashboard/envelopes?status=alert"
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("seeAll")}
        </Link>
      </div>
      <div className="mt-3 space-y-3">
        {entries.slice(0, MAX_ROWS).map(({ envelope, status, percentage }) => {
          const config = CURRENCY_MAP[envelope.currency];
          const remaining = EnvelopeHelpers.getRemaining(envelope) ?? 0;
          const barColorClass = EnvelopeHelpers.getStatusBarColorClass(status);

          return (
            <Link
              key={envelope.id}
              href={`/dashboard/envelope/${envelope.id}`}
              className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-muted"
            >
              <CategoryIcon
                category={envelope.category}
                className="h-8 w-8 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{envelope.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {" · "}
                      {EnvelopeHelpers.formatPeriod(envelope, locale)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "ml-2 shrink-0 font-mono text-xs font-semibold",
                      EnvelopeHelpers.getStatusTextColorClass(status),
                    )}
                  >
                    {formatCurrency(remaining, config)}
                  </span>
                </div>
                {/* Real progressbar (not decorative): only remaining amount is shown as text, not percentage. */}
                <div
                  role="progressbar"
                  aria-valuenow={Math.round(Math.min(percentage, 100))}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${envelope.name}: ${tEnv("detail.percentOfLimit", { percent: Math.round(percentage) })}`}
                  className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary/60"
                >
                  <div
                    className={cn("h-full rounded-full", barColorClass)}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
