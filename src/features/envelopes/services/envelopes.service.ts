import { fetchApi } from "@/lib/api-client";
import {
  EnvelopeFormValues,
  EnvelopeAPIResponseSchema,
  EnvelopesAPIResponseSchema,
  EnvelopeApi,
  EnvelopesResponseApi,
} from "../schemas/envelope.schema";
import { Envelope, EnvelopesResponse } from "../types";
import { EnvelopeMapper } from "../mappers/envelope.mapper";

export const EnvelopesService = {
  getAll: async (): Promise<EnvelopesResponse> => {
    const response = await fetchApi<EnvelopesResponseApi>(
      "/envelopes",
      {
        next: { tags: ["all-envelopes"], revalidate: 60 },
      },
      EnvelopesAPIResponseSchema,
    );

    return {
      count: response.count,
      data: response.data.map(EnvelopeMapper.fromApi),
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
