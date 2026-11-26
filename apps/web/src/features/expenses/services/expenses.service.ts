import type { Expense } from "@/features/expenses/types";
import { fetchApi } from "@/shared/lib/api-client";
import {
  appendPaginationParams,
  type PaginationParams,
} from "@/shared/utils/pagination";
import {
  ExpenseMapper,
  type ExpenseActionPayload,
} from "@/features/expenses/mappers/expense.mapper";
import {
  ExpenseAPIResponseSchema,
  ExpensesAPIResponseSchema,
  type ExpenseApi,
  type ExpensesPaginationMeta,
  type ExpensesResponseApi,
} from "@/features/expenses/schemas/expense.schema";

export interface GetExpensesParams extends PaginationParams {
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: "ASC" | "DESC";
  sortBy?: "date" | "amount";
  paymentMethodIds?: string[];
  includeUnassigned?: boolean;
}

export interface ExpensesResponse {
  data: Expense[];
  meta: ExpensesPaginationMeta;
}

export const ExpensesService = {
  getAll: async (
    envelopeId: string,
    params?: GetExpensesParams,
  ): Promise<ExpensesResponse> => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    if (params?.search) query.set("search", params.search);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.sortBy && params.sortBy !== "date") {
      query.set("sortBy", params.sortBy);
    }
    if (params?.paymentMethodIds?.length) {
      query.set("paymentMethodIds", params.paymentMethodIds.join(","));
    }
    if (params?.includeUnassigned) query.set("includeUnassigned", "true");
    if (params) appendPaginationParams(query, params);
    const qs = query.toString();

    const response = await fetchApi<ExpensesResponseApi>(
      `/envelopes/${encodeURIComponent(envelopeId)}/expenses${qs ? `?${qs}` : ""}`,
      undefined,
      ExpensesAPIResponseSchema,
    );

    return {
      data: response.data.map(ExpenseMapper.fromApi),
      meta: response.meta,
    };
  },

  getById: async (envelopeId: string, expenseId: string): Promise<Expense> => {
    const expense = await fetchApi<ExpenseApi>(
      `/envelopes/${encodeURIComponent(envelopeId)}/expenses/${encodeURIComponent(expenseId)}`,
      undefined,
      ExpenseAPIResponseSchema,
    );

    return ExpenseMapper.fromApi(expense);
  },

  create: (envelopeId: string, data: ExpenseActionPayload) =>
    fetchApi<{ message: string }>(
      `/envelopes/${encodeURIComponent(envelopeId)}/expenses`,
      {
        method: "POST",
        body: JSON.stringify(ExpenseMapper.toApiRequest(data)),
      },
    ),

  update: (envelopeId: string, expenseId: string, data: ExpenseActionPayload) =>
    fetchApi<{ message: string }>(
      `/envelopes/${encodeURIComponent(envelopeId)}/expenses/${encodeURIComponent(expenseId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(ExpenseMapper.toApiRequest(data)),
      },
    ),

  delete: (envelopeId: string, expenseId: string) =>
    fetchApi<{ message: string }>(
      `/envelopes/${encodeURIComponent(envelopeId)}/expenses/${encodeURIComponent(expenseId)}`,
      {
        method: "DELETE",
      },
    ),
};
