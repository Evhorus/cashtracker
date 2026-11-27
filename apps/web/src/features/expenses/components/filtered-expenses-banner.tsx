"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  parseMethodFilter,
  type MethodOption,
} from "@/features/payment-methods/lib/method-filter";
import { useFilterPending } from "@/shared/components/common/filter-pending";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface FilteredExpensesBannerProps {
  methodOptions: MethodOption[];
  countSlot: ReactNode;
}

export function FilteredExpensesBanner({
  methodOptions,
  countSlot,
}: FilteredExpensesBannerProps) {
  const t = useTranslations("expenses.filteredBanner");
  const tMethods = useTranslations("paymentMethods.filter");
  const { isPending, effectiveSearchParams, updateParams } = useFilterPending();

  const methodsParam = effectiveSearchParams.get("methods") ?? undefined;
  const search = effectiveSearchParams.get("search") ?? undefined;
  const hasDateRange = Boolean(
    effectiveSearchParams.get("startDate") ||
    effectiveSearchParams.get("endDate"),
  );
  const selected = parseMethodFilter(methodsParam).selected;

  if (selected.length === 0 && !search && !hasDateRange) {
    return null;
  }

  const removeMethod = (id: string) => {
    updateParams(
      (params) => {
        const next = parseMethodFilter(
          params.get("methods") ?? undefined,
        ).selected.filter((current) => current !== id);
        if (next.length > 0) params.set("methods", next.join(","));
        else params.delete("methods");
      },
      { debounceMs: 250 },
    );
  };

  const removeSearch = () => {
    updateParams((params) => {
      params.delete("search");
    });
  };

  const handleClear = () => {
    updateParams((params) => {
      params.delete("methods");
      params.delete("search");
      params.delete("startDate");
      params.delete("endDate");
    });
  };

  const methodChips = methodOptions
    .filter((option) => selected.includes(option.id))
    .map((option) => ({
      key: option.id,
      label: option.name ?? tMethods("none"),
      color: option.color,
      onRemove: () => removeMethod(option.id),
    }));

  const searchChip = search
    ? [
        {
          key: "search",
          label: t("search", { term: search }),
          color: undefined,
          onRemove: removeSearch,
        },
      ]
    : [];

  const chips = [...methodChips, ...searchChip];

  return (
    <section
      aria-label={t("label")}
      className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2 sm:px-4 sm:py-3"
    >
      {/* Chips scroll horizontally on mobile to avoid multi-row wrapping. */}
      <div className="flex min-w-0 items-center justify-between gap-2">
        {isPending ? (
          <Skeleton className="h-4 w-36 sm:h-5 sm:w-44" />
        ) : (
          countSlot
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 max-sm:size-7 max-sm:p-0"
          aria-label={t("clear")}
          onClick={handleClear}
        >
          <X />
          <span className="hidden sm:inline">{t("clear")}</span>
        </Button>
      </div>
      {chips.length > 0 && (
        <ul className="-mx-3 mt-1.5 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-3 pb-0.5 sm:mx-0 sm:mt-2 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {chips.map((chip) => (
            <li key={chip.key} className="shrink-0">
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={t("remove", { filter: chip.label })}
                className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border/60 bg-background/60 py-0.5 pr-1 pl-2 text-xs whitespace-nowrap transition-colors hover:border-destructive/50 sm:py-1 sm:pr-1.5 sm:pl-2.5 sm:text-sm"
              >
                {chip.color !== undefined && (
                  <span
                    aria-hidden
                    className={
                      chip.color
                        ? "h-2 w-2 shrink-0 rounded-full"
                        : "h-2 w-2 shrink-0 rounded-full border border-dashed border-muted-foreground"
                    }
                    style={chip.color ? { background: chip.color } : undefined}
                  />
                )}
                {chip.label}
                <X className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
