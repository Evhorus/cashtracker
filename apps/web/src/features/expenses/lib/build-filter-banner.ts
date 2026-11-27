import "server-only";

import { cache } from "react";

import { ExpensesService } from "@/features/expenses/services/expenses.service";
import { parseMethodFilter } from "@/features/payment-methods/lib/method-filter";

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

// Key React.cache by primitive values so results, count, and summary share one API call per render.
const fetchCachedFilteredExpenses = cache(
  (
    envelopeId: string,
    startDate: string | undefined,
    endDate: string | undefined,
    search: string | undefined,
    methods: string | undefined,
    sort: "ASC" | "DESC",
    sortBy: "date" | "amount",
    page: number,
    limit: number,
  ) => {
    const { paymentMethodIds, includeUnassigned } = parseMethodFilter(methods);
    return ExpensesService.getAll(envelopeId, {
      startDate,
      endDate,
      search,
      paymentMethodIds,
      includeUnassigned,
      sort,
      sortBy,
      page,
      limit,
    });
  },
);

/** Shared by results, count, and summary so Next dedupes all three reads into one request. */
export function getFilteredExpenses({
  envelopeId,
  startDate,
  endDate,
  search,
  methods,
  order,
  page,
  limit,
}: FilteredExpensesQuery) {
  return fetchCachedFilteredExpenses(
    envelopeId,
    startDate,
    endDate,
    search,
    methods,
    order.sort,
    order.sortBy,
    page,
    limit,
  );
}
