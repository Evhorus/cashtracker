import { z } from "zod";

import { PaginationMetaSchema } from "./pagination.js";
import { ExpensePaymentMethodApiSchema } from "./payment-methods.js";

export const EXPENSE_SORT_DIRECTIONS = ["ASC", "DESC"] as const;
export type ExpenseSortDirection = (typeof EXPENSE_SORT_DIRECTIONS)[number];

export const EXPENSE_SORT_BY_FIELDS = ["date", "amount"] as const;
export type ExpenseSortBy = (typeof EXPENSE_SORT_BY_FIELDS)[number];

export const EXPENSE_DESCRIPTION_MAX_LENGTH = 500;

export const ExpenseApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  currency: z.string().default("COP"),
  date: z.string(),
  description: z.string().nullable().optional(),
  paymentMethod: ExpensePaymentMethodApiSchema.nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ExpenseApi = z.infer<typeof ExpenseApiSchema>;

export const ExpensesPaginationMetaSchema = PaginationMetaSchema.extend({
  totalAmount: z.coerce.number(),
});
export type ExpensesPaginationMeta = z.infer<
  typeof ExpensesPaginationMetaSchema
>;

export const ExpensesApiSchema = z.object({
  data: z.array(ExpenseApiSchema),
  meta: ExpensesPaginationMetaSchema,
});
export type ExpensesResponseApi = z.infer<typeof ExpensesApiSchema>;
