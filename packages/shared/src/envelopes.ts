import { z } from "zod";

import { EnvelopeCategoryApiSchema } from "./categories.js";
import { ExpenseApiSchema } from "./expenses.js";
import { paginatedSchema } from "./pagination.js";

export const ENVELOPE_PROGRESS_STATUSES = [
  "unlimited",
  "normal",
  "warning",
  "exceeded",
] as const;

export type EnvelopeProgressStatus =
  (typeof ENVELOPE_PROGRESS_STATUSES)[number];
export const EnvelopeProgressStatusSchema = z.enum(ENVELOPE_PROGRESS_STATUSES);

/** List filter values: each status plus `all` and `alert` (warning + exceeded). */
export const ENVELOPE_STATUS_FILTERS = [
  "all",
  "normal",
  "warning",
  "alert",
  "exceeded",
  "unlimited",
] as const;

export type EnvelopeStatusFilter = (typeof ENVELOPE_STATUS_FILTERS)[number];
export const EnvelopeStatusFilterSchema = z.enum(ENVELOPE_STATUS_FILTERS);

export const ENVELOPE_SORTS = ["recent", "oldest"] as const;
export type EnvelopeSort = (typeof ENVELOPE_SORTS)[number];
export const EnvelopeSortSchema = z.enum(ENVELOPE_SORTS);

export const EnvelopeApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string().nullable(),
  currency: z.string().default("COP"),
  spent: z.string(),
  status: EnvelopeProgressStatusSchema,
  category: EnvelopeCategoryApiSchema.nullable(),
  description: z.string().nullable().optional(),
  firstExpenseDate: z.string().nullable().optional(),
  lastExpenseDate: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expenses: z.array(ExpenseApiSchema).optional(),
});
export type EnvelopeApi = z.infer<typeof EnvelopeApiSchema>;

export const EnvelopesApiSchema = paginatedSchema(EnvelopeApiSchema);
export type EnvelopesResponseApi = z.infer<typeof EnvelopesApiSchema>;
