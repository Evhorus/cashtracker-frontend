import { expect, test } from "@playwright/test";

/**
 * That a signed-out visitor never reaches the dashboard.
 *
 * Deliberately stated as the guarantee, not as "the layout calls
 * auth.protect()". Auth gating is not in middleware (see src/proxy.ts
 * for why), and it is held by three independent layers: dashboard
 * layout.tsx, each page's own auth.protect(), and authenticatedFetch
 * before any request goes out. Testing one of them would test an
 * implementation detail that is allowed to move.
 *
 * Verified non-vacuous by mutation, and the result is worth recording:
 * commenting out layout.tsx's auth.protect() does NOT fail this suite,
 * because the other two layers still redirect. That redundancy is the
 * app being defensive, not the test being weak - but it does mean this
 * suite catches a total regression, not a partial one. If you need to
 * know a specific layer still fires, that is a different test.
 *
 * Signed out on purpose: no auth fixture, nothing seeded, so this runs
 * anywhere the app runs.
 */

const PROTECTED_PATHS = [
  "/dashboard",
  "/dashboard/envelopes",
  "/dashboard/categories",
  "/dashboard/statistics",
  "/dashboard/account",
  // A detail route with a params segment. The id is nonsense on
  // purpose: auth has to be decided before anything tries to load it,
  // so a signed-out visitor must never reach a 404 that would confirm
  // whether the envelope exists.
  "/dashboard/envelope/00000000-0000-0000-0000-000000000000",
];

test.describe("signed out", () => {
  for (const path of PROTECTED_PATHS) {
    test(`${path} redirects to sign-in`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/sign-in/);
      // The redirect is not enough on its own - landing on a blank or
      // erroring sign-in page would also satisfy the URL check.
      await expect(
        page.getByRole("heading", { level: 1 }).or(page.locator("form")),
      ).toBeVisible();
    });
  }

  test("the landing page stays public", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: /Toma el control/i }),
    ).toBeVisible();
  });

  test("robots.txt keeps crawlers out of the dashboard", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Disallow: /dashboard");
  });
});
