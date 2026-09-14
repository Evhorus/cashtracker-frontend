import { fetchApi } from "@/shared/lib/api-client";
import {
  appendPaginationParams,
  type PaginationParams,
} from "@/shared/utils/pagination";
import {
  EnvelopeFormValues,
  EnvelopeAPIResponseSchema,
  EnvelopesAPIResponseSchema,
  EnvelopeApi,
  EnvelopesResponseApi,
} from "../schemas/envelope.schema";
import { Envelope, EnvelopesResponse } from "../types";
import { EnvelopeMapper } from "../mappers/envelope.mapper";
import type { EnvelopeStatusFilter } from "../lib/envelope-helpers";
import { ENVELOPE_TAGS } from "../lib/cache-tags";

// Mirrors GetExpensesParams (expenses.service.ts): the backend has no sort
// or date range for envelopes (they have no date of their own), just
// search and the derived spending status.
export interface GetEnvelopesParams extends PaginationParams {
  search?: string;
  /** Filtered in SQL by the backend, so `meta.total` counts the filtered
   * set - see EnvelopeStatusFilter and cashtracker-backend's
   * buildEnvelopeStatusPredicate. */
  status?: EnvelopeStatusFilter;
}

export const EnvelopesService = {
  getAll: async (params?: GetEnvelopesParams): Promise<EnvelopesResponse> => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    // "all" is the default; sending it would just be noise in the URL.
    if (params?.status && params.status !== "all") {
      query.set("status", params.status);
    }
    if (params) appendPaginationParams(query, params);
    const qs = query.toString();

    const response = await fetchApi<EnvelopesResponseApi>(
      `/envelopes${qs ? `?${qs}` : ""}`,
      {
        next: { tags: [ENVELOPE_TAGS.all], revalidate: 60 },
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
        next: { tags: [ENVELOPE_TAGS.detail(id)], revalidate: 60 },
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

  // Returns the removed entity, not a `{ message }` envelope like
  // create/update do (envelopes.service.ts's `remove()` in
  // cashtracker-backend returns `envelopesRepository.remove(envelope)`).
  // Typed `unknown` so no caller can read a `.message` off it that isn't
  // there - the delete action supplies its own success wording.
  delete: (id: string) => {
    return fetchApi<unknown>(`/envelopes/${id}`, {
      method: "DELETE",
    });
  },
};
