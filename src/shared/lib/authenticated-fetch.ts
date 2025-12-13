'use server';

import { auth } from '@clerk/nextjs/server';

type AuthenticatedFetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

/**
 * Wrapper around fetch that automatically adds authentication token from Clerk
 * @param url - The URL to fetch
 * @param options - Fetch options (headers will be merged with auth header)
 * @returns Promise with the fetch response
 */
export async function authenticatedFetch(
  url: string,
  options?: AuthenticatedFetchOptions
): Promise<Response> {
  const { getToken } = await auth();
  const token = await getToken();

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
