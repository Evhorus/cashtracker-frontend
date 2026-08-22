import "server-only";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ApiError } from "./api-error";

export type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function apiClient<T>(
  path: string,
  options?: ApiRequestOptions,
  schema?: z.ZodType<T>,
): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  const url = `${process.env.API_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  });

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : response.statusText || "API request error";

    throw new ApiError(response.status, message, data);
  }

  if (!schema) {
    return data as T;
  }

  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError(response.status, "Invalid API response.", result.error);
  }

  return result.data;
}
