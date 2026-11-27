import Link from "next/link";
import { Edit, Infinity as InfinityIcon, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  CategoryIcon,
  CategoryLabel,
} from "@/features/categories/components/category-badge";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import type { Envelope } from "@/features/envelopes/types";
import { CardActionButton } from "@/shared/components/common/card-action-button";
import { CardHoverActions } from "@/shared/components/common/card-hover-actions";
import { LinkPendingIndicator } from "@/shared/components/common/link-pending-indicator";
import { LocalDate } from "@/shared/components/common/local-date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";
import { CURRENCY_MAP, formatCurrency } from "@/shared/utils/format-currency";
import { EnvelopeStatusBadge } from "./envelope-status-badge";

interface EnvelopesTableProps {
  envelopes: Envelope[];
  onEdit: (envelope: Envelope) => void;
  onDelete: (envelope: Envelope) => void;
}

// Desktop-only table; mobile renders EnvelopeCard in envelopes-grid.tsx.
export function EnvelopesTable({
  envelopes,
  onEdit,
  onDelete,
}: EnvelopesTableProps) {
  const t = useTranslations("envelopes.table");
  const tEnvelopes = useTranslations("envelopes");
  const locale = useLocale();

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card/30 md:block">
      <Table className="min-w-max text-sm">
        <TableHeader>
          <TableRow className="border-border/60 bg-card/60 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:bg-card/60">
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              {t("envelope")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              {t("category")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              {t("progress")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-right font-semibold text-inherit">
              {t("spent")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-right font-semibold text-inherit">
              {t("available")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-right font-semibold text-inherit">
              {t("status")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {envelopes.map((envelope) => {
            const status = envelope.status;
            const percentage = EnvelopeHelpers.getPercentage(envelope);
            const remaining = EnvelopeHelpers.getRemaining(envelope);
            const currencyConfig = CURRENCY_MAP[envelope.currency];
            const barColorClass =
              EnvelopeHelpers.getStatusBarColorClass(status);

            return (
              <TableRow key={envelope.id} className="group border-border/60">
                <TableCell className="px-5 py-3.5">
                  <Link
                    href={`/dashboard/envelope/${envelope.id}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <CategoryIcon
                      category={envelope.category}
                      className="h-9 w-9 rounded-lg"
                    />
                    {/* Show period under name since recurring envelopes can share names. */}
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-medium hover:text-primary">
                        <span className="truncate">{envelope.name}</span>
                        <LinkPendingIndicator />
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {envelope.expenseDateRange ? (
                          EnvelopeHelpers.formatPeriod(envelope, locale)
                        ) : (
                          <LocalDate
                            value={envelope.createdAt}
                            variant="monthYear"
                          />
                        )}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  {envelope.category ? (
                    <CategoryLabel
                      category={envelope.category}
                      className="text-xs"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  {status === "unlimited" ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <InfinityIcon className="h-3.5 w-3.5" />
                      {t("noLimit")}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      {/* Decorative bar; adjacent percentage text avoids duplicate screen-reader announcements. */}
                      <div
                        aria-hidden="true"
                        className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-secondary/60"
                      >
                        <div
                          className={cn("h-full rounded-full", barColorClass)}
                          style={{
                            width: `${Math.min(percentage ?? 0, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {(percentage ?? 0).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right font-mono">
                  {formatCurrency(+envelope.spent, currencyConfig)}
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right font-mono font-semibold">
                  {status === "unlimited" ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span
                      className={cn(
                        (remaining ?? 0) < 0
                          ? "text-destructive"
                          : "text-success",
                      )}
                    >
                      {formatCurrency(remaining ?? 0, currencyConfig)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right">
                  <EnvelopeStatusBadge status={status} />
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <CardHoverActions className="justify-end" alwaysVisible>
                    <CardActionButton
                      icon={Edit}
                      label={tEnvelopes("editAria")}
                      onClick={() => onEdit(envelope)}
                    />
                    <CardActionButton
                      icon={Trash2}
                      label={tEnvelopes("deleteAria")}
                      tone="destructive"
                      onClick={() => onDelete(envelope)}
                    />
                  </CardHoverActions>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
