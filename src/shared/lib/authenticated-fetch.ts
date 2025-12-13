'use server';

import { auth } from '@clerk/nextjs/server';

type AuthenticatedFetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

/**
 * Wrapper around fetch that automatically adds authentication token from Clerk
 * and builds the full API URL from a relative path
 * @param path - Relative API path (e.g., '/budgets' or '/budgets/123') or full URL
 * @param options - Fetch options (headers will be merged with auth header)
 * @returns Promise with the fetch response
 */
export async function authenticatedFetch(
  path: string,
  options?: AuthenticatedFetchOptions
): Promise<Response> {
  const { getToken } = await auth();
  const token = await getToken();

  // Build full URL if path is relative
  const url = path.startsWith('http') ? path : `${process.env.API_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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
