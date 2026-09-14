import { expect, test } from "@playwright/test";

/**
 * That switching language sticks.
 *
 * The locale is a cookie, not a route segment (see
 * shared/config/i18n/config.ts for that trade-off), which means nothing
 * in the URL carries it. A unit test can assert the catalogues match
 * and that the action writes a cookie; only a browser can answer
 * whether the choice survives a navigation and a reload, which is the
 * part a user would notice.
 *
 * Signed out, on the landing page - LocaleToggle renders there as well
 * as in the dashboard header, so this needs no session.
 */

const SPANISH_HEADING = /Toma el control/i;
const ENGLISH_HEADING = /Take control/i;

test.describe("locale", () => {
  test("defaults to Spanish with no cookie set", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: SPANISH_HEADING }),
    ).toBeVisible();
  });

  test("switching to English survives a reload and a navigation", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /idioma|language/i }).click();
    await page.getByRole("menuitem", { name: "English" }).click();

    await expect(
      page.getByRole("heading", { name: ENGLISH_HEADING }),
    ).toBeVisible();

    // The cookie is the whole mechanism, so assert it directly rather
    // than only inferring it from the rendered copy.
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "NEXT_LOCALE")?.value).toBe("en");

    // A reload re-runs the server render from scratch. If the cookie
    // were not being read there, this is where it would fall back.
    await page.reload();
    await expect(
      page.getByRole("heading", { name: ENGLISH_HEADING }),
    ).toBeVisible();

    // And a navigation to a different route, which renders from a
    // different layout.
    await page.goto("/sign-in");
    await expect(page.getByText(/sign in|continue/i).first()).toBeVisible();
  });

  test("switching back to Spanish works too", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /idioma|language/i }).click();
    await page.getByRole("menuitem", { name: "English" }).click();
    await expect(
      page.getByRole("heading", { name: ENGLISH_HEADING }),
    ).toBeVisible();

    await page.getByRole("button", { name: /idioma|language/i }).click();
    await page.getByRole("menuitem", { name: "Español" }).click();
    await expect(
      page.getByRole("heading", { name: SPANISH_HEADING }),
    ).toBeVisible();

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "NEXT_LOCALE")?.value).toBe("es");
  });
});
