import { fetchApi } from "@/shared/lib/api-client";
import { DashboardMapper } from "../mappers/dashboard.mapper";
import {
  DashboardBreakdownTotalAPIResponseSchema,
  DashboardCategoryBreakdownAPIResponseSchema,
  DashboardEnvelopeBreakdownAPIResponseSchema,
  DashboardNameBreakdownAPIResponseSchema,
  DashboardRecentExpensesAPIResponseSchema,
  DashboardSummaryAPIResponseSchema,
  type DashboardBreakdownFilters,
  type DashboardBreakdownTotal,
  type DashboardCategoryBreakdownRow,
  type DashboardEnvelopeBreakdownRow,
  type DashboardNameBreakdownRow,
  type DashboardRecentExpenseApi,
  type DashboardSummary,
} from "../schemas/dashboard.schema";
import type { DashboardRecentExpense } from "../types";

const breakdownQueryString = ({
  currency,
  year,
  startDate,
  endDate,
}: DashboardBreakdownFilters) => {
  const params = new URLSearchParams({ currency });
  if (startDate && endDate) {
    params.set("startDate", startDate);
    params.set("endDate", endDate);
  } else if (year) {
    params.set("year", String(year));
  }
  return params.toString();
};

export const DashboardService = {
  getSummary: (year?: number, currency?: string): Promise<DashboardSummary> => {
    const params = new URLSearchParams();
    if (year) params.set("year", String(year));
    if (currency) params.set("currency", currency);
    const qs = params.size > 0 ? `?${params.toString()}` : "";

    return fetchApi<DashboardSummary>(
      `/dashboard/summary${qs}`,
      undefined,
      DashboardSummaryAPIResponseSchema,
    );
  },

  getCategoryBreakdown: (
    filters: DashboardBreakdownFilters,
  ): Promise<DashboardCategoryBreakdownRow[]> =>
    fetchApi<DashboardCategoryBreakdownRow[]>(
      `/dashboard/category-breakdown?${breakdownQueryString(filters)}`,
      undefined,
      DashboardCategoryBreakdownAPIResponseSchema,
    ),

  getEnvelopeBreakdown: (
    filters: DashboardBreakdownFilters,
  ): Promise<DashboardEnvelopeBreakdownRow[]> =>
    fetchApi<DashboardEnvelopeBreakdownRow[]>(
      `/dashboard/envelope-breakdown?${breakdownQueryString(filters)}`,
      undefined,
      DashboardEnvelopeBreakdownAPIResponseSchema,
    ),

  getNameBreakdown: (
    filters: DashboardBreakdownFilters,
  ): Promise<DashboardNameBreakdownRow[]> =>
    fetchApi<DashboardNameBreakdownRow[]>(
      `/dashboard/name-breakdown?${breakdownQueryString(filters)}`,
      undefined,
      DashboardNameBreakdownAPIResponseSchema,
    ),

  getBreakdownTotal: (
    filters: DashboardBreakdownFilters,
  ): Promise<DashboardBreakdownTotal> =>
    fetchApi<DashboardBreakdownTotal>(
      `/dashboard/breakdown-total?${breakdownQueryString(filters)}`,
      undefined,
      DashboardBreakdownTotalAPIResponseSchema,
    ),

  getRecentExpenses: async (
    limit?: number,
  ): Promise<DashboardRecentExpense[]> => {
    const qs = limit ? `?limit=${limit}` : "";
    const expenses = await fetchApi<DashboardRecentExpenseApi[]>(
      `/dashboard/recent-expenses${qs}`,
      undefined,
      DashboardRecentExpensesAPIResponseSchema,
    );

    return expenses.map(DashboardMapper.recentExpenseFromApi);
  },
};
