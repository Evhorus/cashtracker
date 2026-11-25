import type { ExpenseSortBy, ExpenseSortDirection } from "@cashtracker/shared";

/** Maps expense sort orders to URL/API `sort` + `sortBy` params ("newest" is the default and omitted). */

export const EXPENSE_ORDERS = [
  "newest",
  "oldest",
  "highest",
  "lowest",
] as const;
export type ExpenseOrder = (typeof EXPENSE_ORDERS)[number];

interface OrderParams {
  sort: ExpenseSortDirection;
  sortBy: ExpenseSortBy;
}

const PARAMS: Record<ExpenseOrder, OrderParams> = {
  newest: { sort: "DESC", sortBy: "date" },
  oldest: { sort: "ASC", sortBy: "date" },
  highest: { sort: "DESC", sortBy: "amount" },
  lowest: { sort: "ASC", sortBy: "amount" },
};

export function parseExpenseOrder(
  sort: string | null | undefined,
  sortBy: string | null | undefined,
): ExpenseOrder {
  const byAmount = sortBy === "amount";
  if (sort === "ASC") return byAmount ? "lowest" : "oldest";
  return byAmount ? "highest" : "newest";
}

export function expenseOrderParams(order: ExpenseOrder): OrderParams {
  return PARAMS[order];
}

export function writeExpenseOrder(
  params: URLSearchParams,
  order: ExpenseOrder,
): void {
  const { sort, sortBy } = PARAMS[order];
  if (sort === "DESC") params.delete("sort");
  else params.set("sort", sort);
  if (sortBy === "date") params.delete("sortBy");
  else params.set("sortBy", sortBy);
}
