import { expect, test } from "@playwright/test";

/**
 * That every page names itself in the browser tab.
 *
 * A browser test rather than a unit test because the bug was in the
 * *template*, not in any one value. The root layout sets
 *
 *     title: { default: t("home.meta.title"), template: "%s | CashTracker" }
 *
 * and the landing page set that same string again as its own title, so
 * the template appended the product name to a string that already ended
 * with it: "CashTracker - Control de Finanzas Personales | CashTracker".
 * Reading either file alone shows nothing wrong. Only resolved metadata
 * does, which is why this lives here and not in Vitest.
 *
 * The three (auth) routes had the opposite bug - no title at all, so
 * they inherited that same marketing `default` and the tab read
 * "CashTracker - Control de Finanzas Personales" while you signed in.
 *
 * Asserted as shape, not as exact copy: pinning the literal strings
 * would turn every wording change into a failing test without catching
 * anything these assertions miss.
 */

const occurrences = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1;

/** Every route that renders its own <title> through the root layout's
 * template. The landing page is deliberately not here - it is the one
 * page whose title IS the `default`, so it has no suffix to assert. */
const TITLED_ROUTES = ["/sign-in", "/sign-up", "/forgot-password"];

test.describe("page titles", () => {
  let landingTitle = "";

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/");
    landingTitle = await page.title();
    await page.close();
  });

  test("the landing page names the product exactly once", async ({ page }) => {
    await page.goto("/");

    const title = await page.title();

    expect(title.trim()).not.toBe("");
    // The regression: "...Personales | CashTracker". One mention is the
    // product being named; two is the template applied to a string that
    // had already named it.
    expect(occurrences(title, "CashTracker"), `title was: ${title}`).toBe(1);
  });

  for (const path of TITLED_ROUTES) {
    test(`${path} has a title of its own`, async ({ page }) => {
      await page.goto(path);

      const title = await page.title();

      expect(occurrences(title, "CashTracker"), `title was: ${title}`).toBe(1);
      // The template, applied: a page name, then the product.
      expect(title).toMatch(/ \| CashTracker$/);
      // And it is genuinely this page's name rather than the inherited
      // marketing default, which is what the bug looked like.
      expect(title, "inherited the landing page's title").not.toBe(
        landingTitle,
      );
    });
  }

  test("each route's title is distinct", async ({ page }) => {
    const titles: string[] = [];
    for (const path of TITLED_ROUTES) {
      await page.goto(path);
      titles.push(await page.title());
    }

    // Three pages sharing one title means they are all falling back to
    // something rather than naming themselves - the same defect as
    // above, but invisible to the per-route check if the fallback ever
    // stops being the landing title.
    expect(new Set(titles).size).toBe(TITLED_ROUTES.length);
  });
});
