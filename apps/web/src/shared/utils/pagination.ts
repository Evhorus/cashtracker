import type { PaginationMeta } from "@cashtracker/shared";

export type { PaginationMeta };

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
