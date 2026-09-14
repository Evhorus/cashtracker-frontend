import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { ApiError, fetchApi } from "./api-client";

/**
 * The network boundary. This is the mechanism that turns a contract
 * change into an explicit error instead of corrupt data reaching the UI,
 * and until now nothing checked that it actually throws.
 *
 * It is not a hypothetical concern. Two contract drifts hit this app in
 * one day: the frontend started sending `?status=` before the backend
 * accepted it (400 in production), and the dashboard summary swapped
 * `label` for `month`. The first surfaced as an ApiError with a status;
 * the second is exactly the shape the Zod branch below exists to catch.
 *
 * What is deliberately NOT tested here: whether any particular endpoint's
 * schema matches the API. That is the backend's own e2e suite's job (it
 * asserts against a real database), and asserting it here would only
 * prove that a mock matches a schema someone wrote to match the mock.
 * These tests cover the wrapper's behaviour, nothing about the contracts
 * themselves.
 */

vi.mock("./authenticated-fetch", () => ({
  authenticatedFetch: vi.fn(),
}));

const { authenticatedFetch } = await import("./authenticated-fetch");
const mockFetch = vi.mocked(authenticatedFetch);

/** A Response, only as far as fetchApi actually reads one. */
function respond(
  body: unknown,
  { status = 200, contentType = "application/json" } = {},
) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: { get: () => contentType },
    json: async () => body,
    text: async () => String(body),
  } as unknown as Response;
}

/** The ApiError a call threw. Fails loudly if it resolved instead. */
async function thrownBy(call: Promise<unknown>): Promise<ApiError> {
  try {
    await call;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error("expected the call to throw, but it resolved");
}

beforeEach(() => {
  mockFetch.mockReset();
  // The Zod branch logs the issues before throwing - useful in a real
  // failure, noise in a test that asserts the throw.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("schema validation", () => {
  const schema = z.object({ id: z.string(), amount: z.string() });

  it("returns the parsed value when the response matches", async () => {
    mockFetch.mockResolvedValue(respond({ id: "1", amount: "500" }));

    await expect(fetchApi("/envelopes/1", undefined, schema)).resolves.toEqual({
      id: "1",
      amount: "500",
    });
  });

  it("throws when a field the UI needs is missing", async () => {
    // The `label` -> `month` case: a renamed field is a missing one from
    // the client's side. Without this branch the value would arrive as
    // undefined and render as blank, or crash somewhere further in.
    mockFetch.mockResolvedValue(respond({ id: "1" }));

    await expect(fetchApi("/envelopes/1", undefined, schema)).rejects.toThrow(
      ApiError,
    );
  });

  it("throws when a field has the wrong type", async () => {
    // Amounts arrive as decimal strings on purpose (float precision).
    // A number here means the API changed its mind about that, which
    // must not pass silently into money arithmetic.
    mockFetch.mockResolvedValue(respond({ id: "1", amount: 500 }));

    await expect(fetchApi("/envelopes/1", undefined, schema)).rejects.toThrow(
      ApiError,
    );
  });

  it("carries the Zod issues on the error, for the log to be useful", async () => {
    mockFetch.mockResolvedValue(respond({ id: "1" }));

    const error = await thrownBy(fetchApi("/envelopes/1", undefined, schema));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.data).toBeDefined();
  });

  it("skips validation entirely when no schema is given", async () => {
    // Mutations don't all validate their response - the wrapper must
    // stay usable without a schema rather than rejecting unknown shapes.
    mockFetch.mockResolvedValue(respond({ anything: true }));

    await expect(fetchApi("/envelopes", { method: "POST" })).resolves.toEqual({
      anything: true,
    });
  });
});

describe("HTTP errors", () => {
  it("throws ApiError carrying the status", async () => {
    // The status is load-bearing: the data layer turns 404 into a
    // redirect to the parent route (see get-envelope-by-id.ts) and
    // rethrows everything else.
    mockFetch.mockResolvedValue(
      respond({ message: "Envelope not found" }, { status: 404 }),
    );

    const error = await thrownBy(fetchApi("/envelopes/nope"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
  });

  it("prefers the API's own message over the status text", async () => {
    // This is what reaches the user through createSafeAction, so a
    // generic "Error" instead of the backend's reason is a real
    // downgrade.
    mockFetch.mockResolvedValue(
      respond({ message: "property status should not exist" }, { status: 400 }),
    );

    await expect(fetchApi("/envelopes")).rejects.toThrow(
      "property status should not exist",
    );
  });

  it("falls back to the status text when there is no message", async () => {
    mockFetch.mockResolvedValue(respond({}, { status: 500 }));

    const error = await thrownBy(fetchApi("/envelopes"));

    expect(error.message).toBeTruthy();
  });

  it("still throws when the error body is not JSON", async () => {
    // A proxy or gateway failing in front of the API returns HTML. The
    // wrapper used to be the only thing between that and the UI.
    mockFetch.mockResolvedValue(
      respond("<html>502 Bad Gateway</html>", {
        status: 502,
        contentType: "text/html",
      }),
    );

    const error = await thrownBy(fetchApi("/envelopes"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
  });

  it("does not mistake unparseable JSON for a valid empty response", async () => {
    const broken = respond(null);
    broken.json = async () => {
      throw new SyntaxError("Unexpected end of JSON input");
    };
    mockFetch.mockResolvedValue(broken);

    const schema = z.object({ id: z.string() });

    await expect(fetchApi("/envelopes/1", undefined, schema)).rejects.toThrow(
      ApiError,
    );
  });
});
