import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

import { STORAGE_STATE } from "./storage-state";

/**
 * Signs in once and saves the session for the signed-in suite to reuse.
 *
 * `clerkSetup()` fetches a testing token from Clerk's Backend API, which
 * is what lets a headless browser past bot protection. It refuses to run
 * against a production secret key - a deliberate guard, and the reason
 * this is safe to keep in the repo.
 *
 * The identity is an env var rather than a literal. Which account these
 * tests drive is a real decision with consequences (see below), not a
 * detail to hardcode.
 */

setup("authenticate", async ({ page }) => {
  const emailAddress = process.env.E2E_CLERK_USER_EMAIL;

  if (!emailAddress) {
    throw new Error(
      [
        "E2E_CLERK_USER_EMAIL is not set, so the signed-in suite cannot run.",
        "",
        "Set it to a user that exists in your Clerk DEVELOPMENT instance.",
        "These tests create and delete envelopes and expenses, so point it",
        "at a dedicated test account - not at an account whose data you",
        "care about, and never at production.",
        "",
        "A Clerk test address (anything+clerk_test@...) is the intended",
        "shape: it needs no password and no real inbox.",
      ].join("\n"),
    );
  }

  await clerkSetup();

  // /sign-in, not "/". The helper waits for window.Clerk, and the landing
  // page never defines it: ClerkProvider is deliberately kept out of the
  // root layout so the public marketing routes do not ship Clerk's client
  // bundle (see app/layout.tsx). /sign-in is public AND loads Clerk,
  // which is the combination this needs.
  await page.goto("/sign-in");
  await clerk.loaded({ page });

  // Ticket strategy: the helper mints a sign-in token through the
  // Backend API using CLERK_SECRET_KEY, so no password is needed or
  // stored anywhere.
  await clerk.signIn({ page, emailAddress });

  // Prove the session is real before saving it. Saving an unauthenticated
  // state would make every signed-in test fail with a redirect instead of
  // a message pointing here.
  await page.goto("/dashboard");
  await page.waitForURL("**/dashboard");

  await page.context().storageState({ path: STORAGE_STATE });
});
