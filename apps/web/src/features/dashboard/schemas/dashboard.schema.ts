import { z } from "zod";

const DashboardChartEntrySchema = z.object({
  /** "YYYY-MM" key formatted client-side. */
  month: z.string(),
  spent: z.number(),
});

// Loose currency string at the network boundary; narrowed to CurrencyCode in domain mapping.
const DashboardCurrencyTotalsSchema = z.object({
  currency: z.string(),
  totalEnvelopes: z.number(),
  totalAssigned: z.number(),
  // Includes both capped and uncapped envelopes; compare budgets against totalSpentCapped.
  totalSpent: z.number(),
  // Spend within capped envelopes only (basis for totalAvailable).
  totalSpentCapped: z.number(),
  // Remaining balance in under-limit capped envelopes (never negative; overspend is in totalExceeded).
  totalAvailable: z.number(),
  totalExceeded: z.number(),
});

export const DashboardSummaryAPIResponseSchema = z.object({
  totalEnvelopes: z.number(),
  // Per-currency totals; amounts in different currencies are never summed together.
  totals: z.array(DashboardCurrencyTotalsSchema),
  chart: z.array(DashboardChartEntrySchema),
  // Null only when the user has no envelopes.
  chartCurrency: z.string().nullable(),
  availableYears: z.array(z.number()),
});

export type DashboardSummary = z.infer<
  typeof DashboardSummaryAPIResponseSchema
>;

// Cross-envelope recent expenses aggregate (amount is numeric, unlike raw ExpenseAPIResponseSchema).
const DashboardRecentExpenseAPISchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  envelopeId: z.string(),
  envelopeName: z.string(),
});

export const DashboardRecentExpensesAPIResponseSchema = z.array(
  DashboardRecentExpenseAPISchema,
);

export type DashboardRecentExpenseApi = z.infer<
  typeof DashboardRecentExpenseAPISchema
>;

// Shared breakdown filters; UI keeps startDate/endDate and year mutually exclusive.
export interface DashboardBreakdownFilters {
  currency: string;
  year?: number;
  startDate?: string;
  endDate?: string;
}

// GET /dashboard/category-breakdown (grouped by category id and expense date).
const DashboardCategoryBreakdownRowSchema = z.object({
  category: z
    .object({
      id: z.string(),
      label: z.string(),
      color: z.string(),
      icon: z.string(),
    })
    .nullable(),
  spent: z.number(),
  expenseCount: z.number(),
});

export const DashboardCategoryBreakdownAPIResponseSchema = z.array(
  DashboardCategoryBreakdownRowSchema,
);

export type DashboardCategoryBreakdownRow = z.infer<
  typeof DashboardCategoryBreakdownRowSchema
>;

// GET /dashboard/envelope-breakdown
const DashboardEnvelopeBreakdownRowSchema = z.object({
  envelopeId: z.string(),
  envelopeName: z.string(),
  spent: z.number(),
  expenseCount: z.number(),
  // Expense date span ("YYYY-MM-DD") to disambiguate envelopes sharing a name.
  firstExpenseDate: z.string().optional(),
  lastExpenseDate: z.string().optional(),
});

export const DashboardEnvelopeBreakdownAPIResponseSchema = z.array(
  DashboardEnvelopeBreakdownRowSchema,
);

export type DashboardEnvelopeBreakdownRow = z.infer<
  typeof DashboardEnvelopeBreakdownRowSchema
>;

// GET /dashboard/name-breakdown (grouped by normalized expense name).
const DashboardNameBreakdownRowSchema = z.object({
  name: z.string(),
  spent: z.number(),
  expenseCount: z.number(),
});

export const DashboardNameBreakdownAPIResponseSchema = z.array(
  DashboardNameBreakdownRowSchema,
);

export type DashboardNameBreakdownRow = z.infer<
  typeof DashboardNameBreakdownRowSchema
>;

// GET /dashboard/breakdown-total
export const DashboardBreakdownTotalAPIResponseSchema = z.object({
  spent: z.number(),
  expenseCount: z.number(),
});

export type DashboardBreakdownTotal = z.infer<
  typeof DashboardBreakdownTotalAPIResponseSchema
>;
