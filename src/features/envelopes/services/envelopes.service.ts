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
import type { EnvelopeStatusFilter } from "../lib/envelope-helpers";

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
  getAll: async (
    params?: GetEnvelopesParams,
  ): Promise<EnvelopesResponse> => {
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
        // NOTE: this tag is global, not per-id, so invalidating it on a
        // mutation drops every cached envelope detail rather than just the
        // one that changed. Correct but wasteful - should become
        // `envelope-${id}`. Left as-is for now; see the audit follow-ups.
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
