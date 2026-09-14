import { expect, test } from "@playwright/test";

/**
 * The same guarantee as signed-out/page-titles.spec.ts, for the routes
 * that need a session. Split by session rather than by subject because
 * that is what decides which project can run a spec at all - the
 * signed-out suite runs anywhere, this one needs Clerk and a backend.
 *
 * Read-only: it navigates and reads document.title, nothing else. That
 * matters in this repo, where the local .env points the backend at the
 * production database (see CLAUDE.md), so a spec that created rows
 * would be creating them for real.
 */

const occurrences = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1;

/** The dashboard's own layout re-declares the template and sets
 * `default: "Dashboard"`, so a page here that sets no title of its own
 * falls back to that rather than to the landing copy. Both are wrong in
 * the same way: a tab that does not say which page you are on. */
const DASHBOARD_ROUTES = [
  "/dashboard",
  "/dashboard/envelopes",
  "/dashboard/categories",
  "/dashboard/statistics",
  "/dashboard/account",
];

test.describe("dashboard page titles", () => {
  for (const path of DASHBOARD_ROUTES) {
    test(`${path} has a title of its own`, async ({ page }) => {
      await page.goto(path);

      // A redirect here means the saved session was not applied, and
      // the title assertions below would be describing the sign-in
      // page - passing or failing for reasons that have nothing to do
      // with this route.
      expect(page.url(), "not signed in").not.toContain("/sign-in");

      const title = await page.title();

      expect(occurrences(title, "CashTracker"), `title was: ${title}`).toBe(1);
      expect(title).toMatch(/ \| CashTracker$/);
      expect(title, "fell back to the layout default").not.toBe(
        "Dashboard | CashTracker",
      );
    });
  }

  test("each route's title is distinct", async ({ page }) => {
    const titles: string[] = [];
    for (const path of DASHBOARD_ROUTES) {
      await page.goto(path);
      titles.push(await page.title());
    }

    expect(new Set(titles).size, `titles were: ${titles.join(", ")}`).toBe(
      DASHBOARD_ROUTES.length,
    );
  });
});
