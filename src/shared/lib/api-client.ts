import { authenticatedFetch, AuthenticatedFetchOptions } from './authenticated-fetch';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch wrapper that automatically handles JSON parsing and throws typed ApiError
 */
export async function fetchApi<T>(path: string, options?: AuthenticatedFetchOptions): Promise<T> {
  const response = await authenticatedFetch(path, options);
  
  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || response.statusText || 'Error en la petición API',
      data
    );
  }

  return data as T;
}
