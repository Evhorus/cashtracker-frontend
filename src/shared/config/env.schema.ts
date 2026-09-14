import { z } from "zod";

/**
 * The shape of the server environment, with no side effects.
 *
 * Split from env.server.ts so it can be imported and exercised without
 * booting: that module parses `process.env` at import time and throws on
 * a bad environment, which is exactly the behaviour wanted at boot and
 * exactly what makes it untestable. This file has no `server-only`
 * marker for the same reason - it holds no values, only the rules.
 */
/**
 * A required string whose message survives the variable being absent.
 *
 * `z.string().min(1, msg)` reads as if it covers both, and does not: an
 * absent variable fails the type check first and reports "Invalid input:
 * expected string, received undefined", so the message explaining what
 * to set never appears. Passing `error` covers the undefined case too,
 * which is the common one - a variable missing from .env entirely.
 */
const required = (message: string) =>
  z.string({ error: message }).min(1, message);

/**
 * An http(s) URL.
 *
 * `z.url()` alone is weaker than it looks: it accepts "localhost:4000",
 * because `new URL("localhost:4000")` is valid with protocol
 * "localhost:". That value then fails at the first fetch instead of at
 * boot, which is the whole thing this module exists to prevent.
 */
const httpUrl = (message: string) =>
  z.url({ error: message, protocol: /^https?$/ });

/**
 * A path within this app, like "/sign-in".
 *
 * A path rather than a URL: these are relative by design, and an
 * absolute one would send users to another origin - which is the exact
 * failure being guarded against.
 */
const appPath = (name: string, why: string) =>
  required(`${name} is required. ${why}`).startsWith(
    "/",
    `${name} must be a path beginning with "/". ${why}`,
  );

export const envSchema = z.object({
  API_URL: httpUrl(
    "API_URL must be the cashtracker-backend base URL (e.g. http://localhost:4000/api).",
  ),
  CLERK_SECRET_KEY: required(
    "CLERK_SECRET_KEY is required. Copy it from the Clerk dashboard.",
  ),
  NEXT_PUBLIC_URL: httpUrl(
    "NEXT_PUBLIC_URL must be this app's own public origin (e.g. http://localhost:4001). It is what sitemap.xml and robots.txt advertise.",
  ),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: required(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required. Copy it from the Clerk dashboard.",
  ).startsWith(
    "pk_",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_ - a value starting with sk_ is the SECRET key, which must never reach the browser.",
  ),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: appPath(
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "Without it Clerk sends users to its own hosted sign-in page instead of this app's /sign-in.",
  ),
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: appPath(
    "NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL",
    "It is where a user lands after signing in (e.g. /dashboard).",
  ),
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: appPath(
    "NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL",
    "It is where a user lands after signing up (e.g. /dashboard).",
  ),
});
