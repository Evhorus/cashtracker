import { z } from "zod";

/** Mirrors backend `PaginatedResponseDto` meta shape. */
export const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const paginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function appendPaginationParams(
  params: URLSearchParams,
  { page, limit }: PaginationParams,
) {
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
}
