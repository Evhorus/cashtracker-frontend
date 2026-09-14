import { describe, expect, it } from "vitest";

import { envSchema } from "./env.schema";

/**
 * The environment contract.
 *
 * Worth a test because the three Clerk URLs fail in the worst possible
 * way: nothing in this codebase reads them, so a missing one produces no
 * crash and no error. Clerk's SDK falls back to its hosted Account
 * Portal, and a user clicking "sign in" gets Clerk's prebuilt English
 * form instead of this app's Spanish one. That URL contains "/sign-in"
 * too, so even the e2e test asserting the redirect passes while showing
 * the wrong page - which is exactly how it reached CI unnoticed.
 *
 * These assertions are about the *rules*, not about any real
 * environment: env.schema.ts deliberately holds no values and reads no
 * process.env, which is what makes it importable here at all.
 */

const VALID = {
  API_URL: "http://localhost:4000/api",
  CLERK_SECRET_KEY: "sk_test_whatever",
  NEXT_PUBLIC_URL: "http://localhost:4001",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_whatever",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: "/dashboard",
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: "/dashboard",
};

/** The first message mentioning `name`, or "" - assertions read better
 * against the message a developer would actually see. */
const errorFor = (env: Record<string, string>, name: string) => {
  const result = envSchema.safeParse(env);
  if (result.success) return "";
  return (
    result.error.issues.find((i) => i.path.join(".") === name)?.message ?? ""
  );
};

describe("env schema", () => {
  it("accepts a complete environment", () => {
    expect(envSchema.safeParse(VALID).success).toBe(true);
  });

  it.each([
    "API_URL",
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_URL",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL",
    "NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL",
  ] as const)("refuses to boot without %s", (name) => {
    const incomplete: Record<string, string> = { ...VALID };
    delete incomplete[name];

    const result = envSchema.safeParse(incomplete);

    expect(result.success).toBe(false);
    // Named in the failure, because the message is the whole point: the
    // process dies at boot with the variable to go and set.
    expect(errorFor(incomplete, name)).toContain(name);
  });

  it.each(["//elsewhere.test/sign-in", "/\\elsewhere.test/sign-in"])(
    "rejects %s, which is not app-local despite the leading slash",
    (value) => {
      // A protocol-relative URL resolves to another origin, and browsers
      // normalise the backslash form to the same thing - both defeat the
      // guarantee this variable exists to provide.
      const message = errorFor(
        { ...VALID, NEXT_PUBLIC_CLERK_SIGN_IN_URL: value },
        "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
      );

      expect(message).toContain("this app");
    },
  );

  it("rejects a Clerk URL that is not a path", () => {
    // An absolute URL here would send users to another origin, which is
    // the failure this variable is supposed to prevent.
    const message = errorFor(
      { ...VALID, NEXT_PUBLIC_CLERK_SIGN_IN_URL: "https://elsewhere.test/in" },
      "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    );

    expect(message).toContain("path");
  });

  it("rejects the secret key pasted into the publishable slot", () => {
    // Same prefix shape, opposite secrecy: pk_ is public by design and
    // sk_ must never reach a browser. Worth catching at boot rather than
    // shipping it in a bundle.
    const message = errorFor(
      { ...VALID, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "sk_test_oops" },
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    );

    expect(message).toContain("pk_");
  });

  it("rejects an API_URL that is not a URL", () => {
    expect(
      errorFor({ ...VALID, API_URL: "localhost:4000" }, "API_URL"),
    ).toContain("API_URL");
  });
});
