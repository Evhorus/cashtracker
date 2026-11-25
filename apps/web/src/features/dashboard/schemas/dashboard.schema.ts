import {
  DashboardBreakdownTotalApiSchema,
  DashboardCategoryBreakdownApiSchema,
  DashboardEnvelopeBreakdownApiSchema,
  DashboardNameBreakdownApiSchema,
  DashboardRecentExpensesApiSchema,
  DashboardSummaryApiSchema,
  type DashboardBreakdownTotal,
  type DashboardCategoryBreakdownRow,
  type DashboardEnvelopeBreakdownRow,
  type DashboardNameBreakdownRow,
  type DashboardRecentExpenseApi,
  type DashboardSummary,
} from "@cashtracker/shared";

export {
  DashboardBreakdownTotalApiSchema as DashboardBreakdownTotalAPIResponseSchema,
  DashboardCategoryBreakdownApiSchema as DashboardCategoryBreakdownAPIResponseSchema,
  DashboardEnvelopeBreakdownApiSchema as DashboardEnvelopeBreakdownAPIResponseSchema,
  DashboardNameBreakdownApiSchema as DashboardNameBreakdownAPIResponseSchema,
  DashboardRecentExpensesApiSchema as DashboardRecentExpensesAPIResponseSchema,
  DashboardSummaryApiSchema as DashboardSummaryAPIResponseSchema,
  type DashboardBreakdownTotal,
  type DashboardCategoryBreakdownRow,
  type DashboardEnvelopeBreakdownRow,
  type DashboardNameBreakdownRow,
  type DashboardRecentExpenseApi,
  type DashboardSummary,
};

// Shared breakdown filters; UI keeps startDate/endDate and year mutually exclusive.
export interface DashboardBreakdownFilters {
  currency: string;
  year?: number;
  startDate?: string;
  endDate?: string;
}
