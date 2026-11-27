import { getTranslations } from "next-intl/server";

import { ExpensesList } from "@/features/expenses/components/expenses-list";
import {
  getFilteredExpenses,
  type ExpensesListParams,
  type FilteredExpensesQuery,
} from "@/features/expenses/lib/build-filter-banner";
import { EXPENSES_DEFAULT_PAGE_SIZE } from "@/features/expenses/lib/expense-helpers";
import { PaginationControls } from "@/shared/components/common/pagination-controls";
import type { CurrencyCode } from "@/shared/utils/format-currency";

export async function FilteredExpensesCount({
  total,
  ...query
}: FilteredExpensesQuery & { total: number }) {
  const t = await getTranslations("expenses.filteredBanner");
  const { meta } = await getFilteredExpenses(query);

  return (
    <p className="shrink-0 text-xs font-medium sm:text-sm">
      {t("showing", { shown: meta.total, total })}
    </p>
  );
}

interface EnvelopeExpensesResultsProps extends FilteredExpensesQuery {
  currency: CurrencyCode;
}

export async function EnvelopeExpensesResults({
  envelopeId,
  currency,
  startDate,
  endDate,
  search,
  methods,
  order,
  page,
  limit,
}: EnvelopeExpensesResultsProps) {
  const expensesResult = await getFilteredExpenses({
    envelopeId,
    startDate,
    endDate,
    search,
    methods,
    order,
    page,
    limit,
  });

  const sharedParams: ExpensesListParams = {
    startDate,
    endDate,
    search,
    methods,
    sort: order.sort === "DESC" ? undefined : order.sort,
    sortBy: order.sortBy === "date" ? undefined : order.sortBy,
    limit: limit === EXPENSES_DEFAULT_PAGE_SIZE ? undefined : String(limit),
  };

  return (
    <>
      <ExpensesList expenses={expensesResult.data} currency={currency} />
      <PaginationControls
        page={expensesResult.meta.page}
        totalPages={expensesResult.meta.totalPages}
        hasNextPage={expensesResult.meta.hasNextPage}
        hasPreviousPage={expensesResult.meta.hasPreviousPage}
        basePath={`/dashboard/envelope/${envelopeId}`}
        searchParams={sharedParams}
      />
    </>
  );
}
