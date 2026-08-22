import { fetchApi } from "@/lib/api-client";
import {
  appendPaginationParams,
  type PaginationParams,
} from "@/lib/pagination";
import {
  EnvelopeFormValues,
  EnvelopeAPIResponseSchema,
  EnvelopesAPIResponseSchema,
  EnvelopeApi,
  EnvelopesResponseApi,
} from "../schemas/envelope.schema";
import { Envelope, EnvelopesResponse } from "../types";
import { EnvelopeMapper } from "../mappers/envelope.mapper";

// Mirrors GetExpensesParams (expenses.service.ts): the backend has no sort
// or date range for envelopes (they have no date of their own), just search.
export interface GetEnvelopesParams extends PaginationParams {
  search?: string;
}

export const EnvelopesService = {
  getAll: async (
    params?: GetEnvelopesParams,
  ): Promise<EnvelopesResponse> => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params) appendPaginationParams(query, params);
    const qs = query.toString();

    const response = await fetchApi<EnvelopesResponseApi>(
      `/envelopes${qs ? `?${qs}` : ""}`,
      {
        next: { tags: ["all-envelopes"], revalidate: 60 },
      },
      EnvelopesAPIResponseSchema,
    );

    return {
      data: response.data.map(EnvelopeMapper.fromApi),
      meta: response.meta,
    };
  },

  getById: async (id: string): Promise<Envelope> => {
    const envelope = await fetchApi<EnvelopeApi>(
      `/envelopes/${id}`,
      {
        next: { tags: ["envelope"], revalidate: 60 },
      },
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
    return fetchApi<{ message: string }>(`/envelopes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(EnvelopeMapper.toApiRequest(data)),
    });
  },

  delete: (id: string) => {
    return fetchApi<{ message: string }>(`/envelopes/${id}`, {
      method: "DELETE",
    });
  },
};
