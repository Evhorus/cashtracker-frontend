import { describe, expect, it } from "vitest";

import { appendPaginationParams } from "./pagination";

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
