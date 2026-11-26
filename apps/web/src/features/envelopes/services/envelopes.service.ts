import { fetchApi } from "@/shared/lib/api-client";
import {
  appendPaginationParams,
  type PaginationParams,
} from "@/shared/utils/pagination";
import type {
  EnvelopeSort,
  EnvelopeStatusFilter,
} from "@/features/envelopes/lib/envelope-helpers";
import { EnvelopeMapper } from "@/features/envelopes/mappers/envelope.mapper";
import type {
  EnvelopeFormValues,
  EnvelopeApi,
  EnvelopesResponseApi,
} from "@/features/envelopes/schemas/envelope.schema";
import {
  EnvelopeAPIResponseSchema,
  EnvelopesAPIResponseSchema,
} from "@/features/envelopes/schemas/envelope.schema";
import type { Envelope, EnvelopesResponse } from "@/features/envelopes/types";

export interface GetEnvelopesParams extends PaginationParams {
  search?: string;
  /** Filtered in SQL on the backend so `meta.total` reflects the filtered set. */
  status?: EnvelopeStatusFilter;
  /** "recent" is the backend's default, so it is not sent. */
  sort?: EnvelopeSort;
}

export const EnvelopesService = {
  getAll: async (params?: GetEnvelopesParams): Promise<EnvelopesResponse> => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    // "all" is the default; sending it would just be noise in the URL.
    if (params?.status && params.status !== "all") {
      query.set("status", params.status);
    }
    if (params?.sort === "oldest") query.set("sort", params.sort);
    if (params) appendPaginationParams(query, params);
    const qs = query.toString();

    const response = await fetchApi<EnvelopesResponseApi>(
      `/envelopes${qs ? `?${qs}` : ""}`,
      undefined,
      EnvelopesAPIResponseSchema,
    );

    return {
      data: response.data.map(EnvelopeMapper.fromApi),
      meta: response.meta,
    };
  },

  getById: async (id: string): Promise<Envelope> => {
    const envelope = await fetchApi<EnvelopeApi>(
      `/envelopes/${encodeURIComponent(id)}`,
      undefined,
      EnvelopeAPIResponseSchema,
    );

    return EnvelopeMapper.fromApi(envelope);
  },

  create: (data: EnvelopeFormValues) => {
    return fetchApi<{ message: string }>("/envelopes", {
      method: "POST",
      body: JSON.stringify(EnvelopeMapper.toApiRequest(data)),
    });
  },

  update: (id: string, data: EnvelopeFormValues) => {
    return fetchApi<{ message: string }>(
      `/envelopes/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(EnvelopeMapper.toApiRequest(data)),
      },
    );
  },

  delete: (id: string) => {
    return fetchApi<{ message: string }>(
      `/envelopes/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
  },
};
