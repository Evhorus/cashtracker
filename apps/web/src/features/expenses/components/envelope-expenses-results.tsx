import { ExpensesList } from "@/features/expenses/components/expenses-list";
import { FilteredExpensesBanner } from "@/features/expenses/components/filtered-expenses-banner";
import {
  buildFilterBanner,
  getFilteredExpenses,
  type ExpensesListParams,
  type FilteredExpensesQuery,
} from "@/features/expenses/lib/build-filter-banner";
import { EXPENSES_DEFAULT_PAGE_SIZE } from "@/features/expenses/lib/expense-helpers";
import type { MethodOption } from "@/features/payment-methods/lib/method-filter";
import { PaginationControls } from "@/shared/components/common/pagination-controls";
import type { CurrencyCode } from "@/shared/utils/format-currency";

interface EnvelopeExpensesResultsProps extends FilteredExpensesQuery {
  currency: CurrencyCode;
  filterBanner?: {
    envelopeExpenseCount: number;
    methodOptions: MethodOption[];
  };
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
  filterBanner,
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

  const banner = filterBanner
    ? await buildFilterBanner({
        envelopeId,
        methodOptions: filterBanner.methodOptions,
        params: sharedParams,
      })
    : null;

  return (
    <>
      {filterBanner && (
        <FilteredExpensesBanner
          shown={expensesResult.meta.total}
          total={filterBanner.envelopeExpenseCount}
          chips={banner?.chips ?? []}
          clearHref={banner?.clearHref ?? `/dashboard/envelope/${envelopeId}`}
        />
      )}
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
