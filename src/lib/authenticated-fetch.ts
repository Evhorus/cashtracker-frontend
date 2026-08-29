import "server-only";

import { auth } from "@clerk/nextjs/server";

/**
 * Checked before use rather than interpolated blind.
 * A missing API_URL used to produce request URLs like
 * "undefined/envelopes", which surfaced as an opaque fetch failure
 * several layers away from the actual cause (a .env that was never
 * filled in). Failing here names the problem.
 */
function getApiBaseUrl(): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error(
      "API_URL is not set. Copy .env.template to .env and point API_URL at the cashtracker-backend instance (e.g. http://localhost:4000/api).",
    );
  }
  return apiUrl;
}

export type AuthenticatedFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

/**
 * Wrapper around fetch that automatically adds authentication token from Clerk
 * and builds the full API URL from a relative path
 * @param path - Relative API path (e.g., '/envelopes' or '/envelopes/123') or full URL
 * @param options - Fetch options (headers will be merged with auth header)
 * @returns Promise with the fetch response
 */
export async function authenticatedFetch(
  path: string,
  options?: AuthenticatedFetchOptions,
): Promise<Response> {
  await auth.protect();
  const { getToken } = await auth();
  const token = await getToken();

  // Build full URL if path is relative
  const url = path.startsWith("http") ? path : `${getApiBaseUrl()}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
