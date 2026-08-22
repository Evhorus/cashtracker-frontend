"use server";
import { auth } from "@clerk/nextjs/server";
import {
  EnvelopesService,
  type GetEnvelopesParams,
} from "@/features/envelopes/services/envelopes.service";

export const getEnvelopesAction = async (params?: GetEnvelopesParams) => {
  await auth.protect();

  try {
    // Delegates to EnvelopesService (fetchApi + Zod validation +
    // EnvelopeMapper) instead of an unchecked raw fetch, so a malformed
    // API response fails loudly here instead of reaching the UI as
    // `undefined` fields.
    return await EnvelopesService.getAll(params);
  } catch (error) {
    console.error("Error fetching envelopes:", error);
    throw error;
  }
};
