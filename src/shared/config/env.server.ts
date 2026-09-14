import "server-only";

import { z } from "zod";

import { envSchema } from "./env.schema";

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
 *
 * The three Clerk URLs are here for a sharper reason: nothing in this
 * codebase reads them - Clerk's SDK picks them up from process.env
 * itself - so when one is missing there is no crash and no error. Clerk
 * simply falls back to its hosted Account Portal, and a user who clicks
 * "sign in" lands on Clerk's own prebuilt English form instead of this
 * app's Spanish one. That URL also contains "/sign-in", so even an e2e
 * test asserting the redirect passes while showing the wrong page. A
 * defect that silent is worth refusing to boot over.
 */
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
