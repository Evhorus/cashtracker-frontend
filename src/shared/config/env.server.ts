import "server-only";

import { z } from "zod";

/**
 * The single place `process.env` is read on the server.
 *
 * `server-only` is the barrier that makes this safe to put secrets in:
 * importing this module from a Client Component is a build error, so
 * CLERK_SECRET_KEY cannot reach the browser by accident.
 *
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is validated here rather than in a
 * client schema on purpose. A missing publishable key should break the
 * server render with a message that names it, not leave a blank screen
 * after the bundle has already travelled.
 */
const envSchema = z.object({
  API_URL: z.url({
    error:
      "API_URL must be the cashtracker-backend base URL (e.g. http://localhost:4000/api).",
  }),
  CLERK_SECRET_KEY: z
    .string()
    .min(1, "CLERK_SECRET_KEY is required. Copy it from the Clerk dashboard."),
  NEXT_PUBLIC_URL: z.url({
    error:
      "NEXT_PUBLIC_URL must be this app's own public origin (e.g. http://localhost:4001). It is what sitemap.xml and robots.txt advertise.",
  }),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(
      1,
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required. Copy it from the Clerk dashboard.",
    ),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    // Thrown, not logged: instrumentation.ts imports this module so the
    // process refuses to start rather than serving requests that will
    // each fail later in a less obvious place.
    throw new Error(
      `Invalid environment variables. Check .env against .env.template.\n\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}

export const env = parseEnv();
