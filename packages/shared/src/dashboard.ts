import { z } from "zod";

import { EnvelopeCategoryApiSchema } from "./categories.js";

export const DashboardChartEntrySchema = z.object({
  /** `"YYYY-MM"` key formatted client-side. */
  month: z.string(),
  spent: z.number(),
});
export type DashboardChartEntry = z.infer<typeof DashboardChartEntrySchema>;

/** Loose currency string at the network boundary; narrowed to `CurrencyCode` in domain mapping. */
export const DashboardCurrencyTotalsSchema = z.object({
  currency: z.string(),
  totalEnvelopes: z.number(),
  totalAssigned: z.number(),
  totalSpent: z.number(),
  totalSpentCapped: z.number(),
  totalAvailable: z.number(),
  totalExceeded: z.number(),
});
export type DashboardCurrencyTotals = z.infer<
  typeof DashboardCurrencyTotalsSchema
>;

export const DashboardSummaryApiSchema = z.object({
  totalEnvelopes: z.number(),
  totals: z.array(DashboardCurrencyTotalsSchema),
  chart: z.array(DashboardChartEntrySchema),
  chartCurrency: z.string().nullable(),
  availableYears: z.array(z.number()),
});
export type DashboardSummary = z.infer<typeof DashboardSummaryApiSchema>;

export const DashboardRecentExpenseApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  envelopeId: z.string(),
  envelopeName: z.string(),
});
export type DashboardRecentExpenseApi = z.infer<
  typeof DashboardRecentExpenseApiSchema
>;

export const DashboardRecentExpensesApiSchema = z.array(
  DashboardRecentExpenseApiSchema,
);

export const DashboardCategoryBreakdownRowSchema = z.object({
  category: EnvelopeCategoryApiSchema.nullable(),
  spent: z.number(),
  expenseCount: z.number(),
});
export type DashboardCategoryBreakdownRow = z.infer<
  typeof DashboardCategoryBreakdownRowSchema
>;

export const DashboardCategoryBreakdownApiSchema = z.array(
  DashboardCategoryBreakdownRowSchema,
);

export const DashboardEnvelopeBreakdownRowSchema = z.object({
  envelopeId: z.string(),
  envelopeName: z.string(),
  spent: z.number(),
  expenseCount: z.number(),
  firstExpenseDate: z.string().optional(),
  lastExpenseDate: z.string().optional(),
});
export type DashboardEnvelopeBreakdownRow = z.infer<
  typeof DashboardEnvelopeBreakdownRowSchema
>;

export const DashboardEnvelopeBreakdownApiSchema = z.array(
  DashboardEnvelopeBreakdownRowSchema,
);

export const DashboardNameBreakdownRowSchema = z.object({
  name: z.string(),
  spent: z.number(),
  expenseCount: z.number(),
});
export type DashboardNameBreakdownRow = z.infer<
  typeof DashboardNameBreakdownRowSchema
>;

export const DashboardNameBreakdownApiSchema = z.array(
  DashboardNameBreakdownRowSchema,
);

export const DashboardBreakdownTotalApiSchema = z.object({
  spent: z.number(),
  expenseCount: z.number(),
});
export type DashboardBreakdownTotal = z.infer<
  typeof DashboardBreakdownTotalApiSchema
>;
