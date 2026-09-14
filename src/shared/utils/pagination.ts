import { z } from "zod";

/**
 * Shape of the `meta` block on every paginated API response
 * (mirrors PaginatedResponseDto on the backend).
 */
export const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/** Wraps an item schema into the standard `{ data, meta }` paginated shape. */
export const paginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Appends page/limit (if present) to a URLSearchParams instance. */
export function appendPaginationParams(
  params: URLSearchParams,
  { page, limit }: PaginationParams,
) {
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
}
