import { fetchApi } from "@/shared/lib/api-client";
import { CategoryMapper } from "../mappers/category.mapper";
import {
  CategoriesAPIResponseSchema,
  CategoryOptionsAPIResponseSchema,
  CategoryUsageAPIResponseSchema,
  type CategoriesResponseApi,
  type CategoryFormValues,
  type CategoryOptionsApi,
  type CategoryUsageApi,
} from "../schemas/category.schema";
import type { Category, CategoryOptions } from "../types";

export const CategoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await fetchApi<CategoriesResponseApi>(
      "/categories",
      undefined,
      CategoriesAPIResponseSchema,
    );

    return response.map(CategoryMapper.fromApi);
  },

  getOptions: async (): Promise<CategoryOptions> =>
    fetchApi<CategoryOptionsApi>(
      "/categories/options",
      undefined,
      CategoryOptionsAPIResponseSchema,
    ),

  getUsage: async (): Promise<Record<string, number>> => {
    const rows = await fetchApi<CategoryUsageApi>(
      "/categories/usage",
      undefined,
      CategoryUsageAPIResponseSchema,
    );

    return Object.fromEntries(
      rows.map((row) => [row.categoryId, row.envelopeCount]),
    );
  },

  create: (data: CategoryFormValues) =>
    fetchApi<{ id: string; message: string }>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: CategoryFormValues) =>
    fetchApi<{ message: string }>(`/categories/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/categories/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
