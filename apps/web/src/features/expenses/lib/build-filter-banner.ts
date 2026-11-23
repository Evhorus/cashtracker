import { getTranslations } from "next-intl/server";

import { ExpensesService } from "@/features/expenses/services/expenses.service";
import {
  parseMethodFilter,
  type MethodOption,
} from "@/features/payment-methods/lib/method-filter";

export type ExpensesListParams = Record<
  "startDate" | "endDate" | "search" | "methods" | "sort" | "sortBy" | "limit",
  string | undefined
>;

export interface FilteredExpensesQuery {
  envelopeId: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  methods?: string;
  order: { sort: "ASC" | "DESC"; sortBy: "date" | "amount" };
  page: number;
  limit: number;
}

/** Shared by ExpensesResults and FilteredSummary so Next dedupes both requests into one. */
export function getFilteredExpenses({
  envelopeId,
  methods,
  order,
  ...rest
}: FilteredExpensesQuery) {
  const { paymentMethodIds, includeUnassigned } = parseMethodFilter(methods);
  return ExpensesService.getAll(envelopeId, {
    ...rest,
    paymentMethodIds,
    includeUnassigned,
    sort: order.sort,
    sortBy: order.sortBy,
  });
}

export async function buildFilterBanner({
  envelopeId,
  methodOptions,
  params,
}: {
  envelopeId: string;
  methodOptions: MethodOption[];
  params: ExpensesListParams;
}) {
  const t = await getTranslations("expenses.filteredBanner");
  const tMethods = await getTranslations("paymentMethods.filter");

  const href = (changes: Partial<ExpensesListParams>) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...params, ...changes })) {
      if (value) query.set(key, value);
    }
    const qs = query.toString();
    return `/dashboard/envelope/${envelopeId}${qs ? `?${qs}` : ""}`;
  };

  const selected = parseMethodFilter(params.methods).selected;
  const methodChips = methodOptions
    .filter((option) => selected.includes(option.id))
    .map((option) => ({
      key: option.id,
      label: option.name ?? tMethods("none"),
      color: option.color,
      removeHref: href({
        methods:
          selected.filter((id) => id !== option.id).join(",") || undefined,
      }),
    }));
  const searchChip = params.search
    ? [
        {
          key: "search",
          label: t("search", { term: params.search }),
          removeHref: href({ search: undefined }),
        },
      ]
    : [];

  return {
    chips: [...methodChips, ...searchChip],
    clearHref: href({
      methods: undefined,
      search: undefined,
      startDate: undefined,
      endDate: undefined,
    }),
  };
}
