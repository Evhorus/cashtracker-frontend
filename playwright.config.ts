import { loadEnvFile } from "node:process";

import { defineConfig, devices } from "@playwright/test";

import { STORAGE_STATE } from "./e2e/support/storage-state";

// Playwright does not read .env the way `next dev` does, so the app's
// own origin has to be loaded explicitly. NEXT_PUBLIC_URL is the same
// value the app advertises in sitemap.xml and robots.txt - reading it
// here rather than repeating the port means a changed port moves one
// line, not several, and the tests cannot quietly aim at the wrong app.
loadEnvFile(".env");

const baseURL = process.env.NEXT_PUBLIC_URL;
if (!baseURL) {
  throw new Error(
    "NEXT_PUBLIC_URL is not set. Copy .env.template to .env - the e2e suite needs to know which origin to drive.",
  );
}

/**
 * End-to-end tests, deliberately scoped to what only a real browser can
 * answer: that auth redirects actually happen, that a cookie survives a
 * navigation, that a page still works after a reload. Everything that
 * can be decided without a browser stays in Vitest, which runs in two
 * seconds.
 *
 * These are NOT part of the `verify` CI job. Running them there needs a
 * backend, a seeded database and Clerk test credentials as repository
 * secrets - real infrastructure, not a config flag. Until that exists,
 * a suite in CI that cannot pass is worse than one that lives locally.
 */
export default defineConfig({
  testDir: "./e2e",

  // Serial locally so a failure is readable; CI would parallelise.
  fullyParallel: false,

  // One worker, because fullyParallel: false was not enough on its own -
  // it serialises tests *within* a file, while separate spec files still
  // ran in parallel workers against a single `next dev`. Five files
  // submitting forms at once queued their Server Actions behind
  // on-demand compiles, and the failure looked nothing like contention:
  // the create dialog sat with every field disabled until the 5s
  // assertion gave up. Five tests failed and fifteen never ran; with one
  // worker the same suite passes. Revisit when these run against a
  // production build rather than a dev server.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],

  use: {
    baseURL,
    // Artifacts only for failures - passing runs should leave nothing.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    // Signed out. No fixture, nothing seeded, no Clerk credentials -
    // runs anywhere the app runs, which is why it is the default.
    {
      name: "signed-out",
      // A glob over the folder, not a list of filenames. The list was a
      // trap: a spec added at e2e/ root matched no project at all and
      // silently never ran - no error, no warning, just a file that
      // looks like a test and never executes. Both projects now match
      // the same way, so where a spec lives is what decides which
      // session it runs under.
      testMatch: "signed-out/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },

    // Signs in once and saves the session; the suite below reuses it.
    {
      name: "setup",
      testMatch: "support/global.setup.ts",
      use: { ...devices["Desktop Chrome"] },
    },

    // Signed in. Opt-in: without E2E_CLERK_USER_EMAIL the setup project
    // fails with an explanation rather than these failing as redirects.
    {
      name: "signed-in",
      testMatch: "signed-in/**/*.spec.ts",
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
    },
  ],

  // Reuses a dev server you already have running rather than fighting
  // it for port 4001. Note this runs `next dev`, not a production
  // build: these tests are about behaviour, not about performance.
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
