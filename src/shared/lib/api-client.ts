import {
  authenticatedFetch,
  AuthenticatedFetchOptions,
} from './authenticated-fetch';
import { z } from 'zod';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch wrapper that automatically handles JSON parsing,
 * optional Zod validation, and throws typed ApiError.
 *
 * T is the expected return type. If a schema is provided,
 * the return type will be the output of that schema.
 */
export async function fetchApi<T>(
  path: string,
  options?: AuthenticatedFetchOptions,
  schema?: z.ZodSchema<T>,
): Promise<T> {
  const response = await authenticatedFetch(path, options);

  let data: unknown;
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (data as Record<string, unknown>)?.message as string || response.statusText || 'API request error',
      data,
    );
  }

  if (!schema) {
    return data as T;
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`API Validation Error at ${path}:`, result.error.format());
    throw new ApiError(
      response.status,
      `Server response does not match the expected format.`,
      result.error,
    );
  }

  return result.data as T;
}
