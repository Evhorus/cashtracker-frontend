import { describe, expect, it } from "vitest";
import { z } from "zod";

import { appendPaginationParams, paginatedSchema } from "./pagination";

describe("appendPaginationParams", () => {
  it("appends page and limit when both are given", () => {
    const params = new URLSearchParams();
    appendPaginationParams(params, { page: 2, limit: 20 });

    expect(params.toString()).toBe("page=2&limit=20");
  });

  it("omits absent values instead of sending undefined", () => {
    const params = new URLSearchParams();
    appendPaginationParams(params, {});

    expect(params.toString()).toBe("");
  });

  it("preserves params the caller already set", () => {
    const params = new URLSearchParams({ search: "mercado" });
    appendPaginationParams(params, { page: 3 });

    expect(params.get("search")).toBe("mercado");
    expect(params.get("page")).toBe("3");
  });

  it("skips page 0, which the backend would reject", () => {
    // The `if (page)` guard doubles as a 0 check - pages are 1-indexed.
    const params = new URLSearchParams();
    appendPaginationParams(params, { page: 0, limit: 0 });

    expect(params.toString()).toBe("");
  });
});

describe("paginatedSchema", () => {
  const schema = paginatedSchema(z.object({ id: z.string() }));

  it("accepts a well-formed paginated response", () => {
    const result = schema.safeParse({
      data: [{ id: "a" }],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects a response missing the meta block", () => {
    // This is the boundary check that keeps malformed responses from
    // reaching the UI as undefined fields.
    expect(schema.safeParse({ data: [] }).success).toBe(false);
  });

  it("rejects items that don't match the item schema", () => {
    const result = schema.safeParse({
      data: [{ id: 42 }],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    expect(result.success).toBe(false);
  });
});
