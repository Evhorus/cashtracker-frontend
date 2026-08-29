import "server-only";

import {
  EnvelopesService,
  type GetEnvelopesParams,
} from "@/features/envelopes/services/envelopes.service";

/**
 * Read path for the envelope list. A plain server-only function, not a
 * Server Action: `"use server"` compiles a function into a public POST
 * endpoint the browser can invoke by action id, which is the right
 * trade for a mutation and pure extra attack surface for a read. Server
 * Components import this directly; nothing about their code changes.
 *
 * No auth.protect() here - authenticatedFetch (which every service call
 * goes through) already calls it, so it's impossible to reach the API
 * without a verified session, and the pages calling this protect
 * themselves too. See src/lib/authenticated-fetch.ts.
 *
 * Errors propagate on purpose: a failed fetch should reach
 * dashboard/error.tsx, not be swallowed into an empty list that reads
 * to the user as "you have no envelopes".
 */
export const getEnvelopes = (params?: GetEnvelopesParams) =>
  EnvelopesService.getAll(params);
