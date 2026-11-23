import { fetchApi } from "@/shared/lib/api-client";
import {
  CategoryFormValues,
  CategoriesAPIResponseSchema,
  CategoriesResponseApi,
  CategoryOptionsAPIResponseSchema,
  CategoryOptionsApi,
  CategoryUsageAPIResponseSchema,
  CategoryUsageApi,
} from "../schemas/category.schema";
import { Category, CategoryOptions } from "../types";
import { CategoryMapper } from "../mappers/category.mapper";

export const CategoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await fetchApi<CategoriesResponseApi>(
      "/categories",
      undefined,
      CategoriesAPIResponseSchema,
    );

    return response.map(CategoryMapper.fromApi);
  },

  getOptions: async (): Promise<CategoryOptions> => {
    // This whitelist only ever changes on a backend deploy (a code
    // change to ICON_KEYS/PRESET_COLORS there), never per request/user.
    return fetchApi<CategoryOptionsApi>(
      "/categories/options",
      undefined,
      CategoryOptionsAPIResponseSchema,
    );
  },

  /**
   * Envelope counts per category. Its own request rather than a field on
   * getAll(): that list is fetched by the dashboard layout on every page
   * for the category picker, and only the categories page needs counts.
   */
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

  create: (data: CategoryFormValues) => {
    return fetchApi<{ id: string; message: string }>("/categories", {
      method: "POST",
      body: JSON.stringify(CategoryMapper.toApiRequest(data)),
    });
  },

  update: (id: string, data: CategoryFormValues) => {
    return fetchApi<{ message: string }>(
      `/categories/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(CategoryMapper.toApiRequest(data)),
      },
    );
  },

  delete: (id: string) => {
    return fetchApi<{ message: string }>(
      `/categories/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
  },
};
