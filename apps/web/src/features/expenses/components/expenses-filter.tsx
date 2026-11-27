"use client";

import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  EXPENSES_DEFAULT_PAGE_SIZE,
  EXPENSES_MAX_PAGE_SIZE,
  EXPENSES_PAGE_SIZE_OPTIONS,
} from "@/features/expenses/lib/expense-helpers";
import {
  EXPENSE_ORDERS,
  parseExpenseOrder,
  writeExpenseOrder,
  type ExpenseOrder,
} from "@/features/expenses/lib/expense-order";
import {
  parseMethodFilter,
  toggleMethod,
  type MethodOption,
} from "@/features/payment-methods/lib/method-filter";
import { useFilterPending } from "@/shared/components/common/filter-pending";
import { SearchInput } from "@/shared/components/common/search-input";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useDebouncedSearchParam } from "@/shared/hooks/use-debounced-search-param";

interface ExpensesFilterProps {
  /** Payment methods used in this envelope (from `methodOptionsFor`); empty hides the section. */
  methodOptions: MethodOption[];
}

interface FilterState {
  methods: string[];
  order: ExpenseOrder;
  pageSize: number;
}

function readState(searchParams: URLSearchParams): FilterState {
  const limit = Number(searchParams.get("limit"));
  return {
    methods: parseMethodFilter(searchParams.get("methods") ?? undefined)
      .selected,
    order: parseExpenseOrder(
      searchParams.get("sort"),
      searchParams.get("sortBy"),
    ),
    pageSize: EXPENSES_PAGE_SIZE_OPTIONS.some((option) => option === limit)
      ? limit
      : EXPENSES_DEFAULT_PAGE_SIZE,
  };
}

function writeState(params: URLSearchParams, state: FilterState) {
  const set = (key: string, value: string, isDefault: boolean) =>
    isDefault ? params.delete(key) : params.set(key, value);
  set("methods", state.methods.join(","), state.methods.length === 0);
  writeExpenseOrder(params, state.order);
  set(
    "limit",
    String(state.pageSize),
    state.pageSize === EXPENSES_DEFAULT_PAGE_SIZE,
  );
}

/** Optimistic filter state keeps rapid multi-select ticks from clobbering each other before the URL catches up. */
export const ExpensesFilter = ({ methodOptions }: ExpensesFilterProps) => {
  const t = useTranslations("expenses");
  const tMethods = useTranslations("paymentMethods.filter");
  const { effectiveSearchParams, updateParams, flush } = useFilterPending();
  const state = readState(effectiveSearchParams);

  // `applyTo` carries an in-flight debounced search into filter navigations instead of dropping it.
  const {
    value: search,
    onChange: handleSearchChange,
    applyTo: applyPendingSearch,
  } = useDebouncedSearchParam();

  const update = (changes: Partial<FilterState>) => {
    updateParams((params) => {
      applyPendingSearch(params);
      const current = readState(params);
      writeState(params, { ...current, ...changes });
    });
  };

  // Batch rapid checkbox ticks into one navigation, flushing immediately if the menu closes.
  const togglePaymentMethod = (id: string) => {
    updateParams(
      (params) => {
        applyPendingSearch(params);
        const current = readState(params);
        writeState(params, {
          ...current,
          methods: toggleMethod(current.methods, id),
        });
      },
      { debounceMs: 250 },
    );
  };

  const activeCount =
    (state.methods.length > 0 ? 1 : 0) + (state.order !== "newest" ? 1 : 0);

  // Largest page-size option represents "all" rather than a literal count.
  const pageSizeLabel = (size: number) =>
    size === EXPENSES_MAX_PAGE_SIZE ? t("pageSizeAll") : String(size);

  return (
    <div className="mb-6 flex gap-2">
      <SearchInput
        value={search}
        onChange={handleSearchChange}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchAria")}
        className="min-w-0 flex-1"
      />

      <Select
        value={String(state.pageSize)}
        onValueChange={(value) => value && update({ pageSize: Number(value) })}
      >
        <SelectTrigger className="w-24 shrink-0" aria-label={t("perPage")}>
          <SelectValue>
            {(value: string) =>
              t("perPageValue", { size: pageSizeLabel(Number(value)) })
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {EXPENSES_PAGE_SIZE_OPTIONS.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {pageSizeLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) flush();
        }}
      >
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="shrink-0 gap-2"
              aria-label={`${t("filters")}, ${t("filtersActive", { count: activeCount })}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">{t("filters")}</span>
              {activeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-64">
          {methodOptions.length > 0 && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel>{tMethods("label")}</DropdownMenuLabel>
                {methodOptions.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.id}
                    checked={state.methods.includes(option.id)}
                    onCheckedChange={() => togglePaymentMethod(option.id)}
                  >
                    <span
                      aria-hidden
                      className={
                        option.color
                          ? "h-2.5 w-2.5 shrink-0 rounded-full"
                          : "h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground"
                      }
                      style={
                        option.color ? { background: option.color } : undefined
                      }
                    />
                    {option.name ?? tMethods("none")}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("sortLabel")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={state.order}
              onValueChange={(value) =>
                update({ order: value as ExpenseOrder })
              }
            >
              {EXPENSE_ORDERS.map((order) => (
                <DropdownMenuRadioItem key={order} value={order}>
                  {t(`orders.${order}`)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>

          {activeCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => update({ methods: [], order: "newest" })}
              >
                {t("clearFilters")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
