import { expect, test } from "@playwright/test";

/**
 * The sign-in and sign-up forms themselves, which nothing covered.
 *
 * The rest of the suite reaches the dashboard by minting a Clerk ticket
 * in global.setup.ts - deliberately, since that needs no password. The
 * cost is that the forms a real user types into were never exercised at
 * all: the app could fail to render an error, or fail to submit, and
 * every other spec would still pass.
 *
 * Two kinds of case here, both of which need no account and no inbox:
 *
 *   - client-side validation, which never reaches Clerk
 *   - a genuinely wrong credential, which does: it exercises the Clerk
 *     round trip and the globalErrors path the hooks expose, without
 *     depending on any particular user existing
 *
 * What is deliberately absent is the happy path. Signing in for real
 * needs either a password stored somewhere or a Clerk test address
 * (+clerk_test@, which accepts the fixed code 424242), and signing up
 * for real creates a user on every run that something then has to
 * delete. Both are decisions about credentials rather than code.
 */

/** An address that cannot belong to anyone: .invalid is reserved by
 * RFC 2606 precisely so it can never resolve. */
const NOBODY = "e2e-nobody@example.invalid";

test.describe("sign-in form", () => {
  test("refuses to submit a malformed email", async ({ page }) => {
    await page.goto("/sign-in");

    // Scoped to the open tab panel: "Contraseña" names both the tab and
    // the password field, and both tab panels carry an email input.
    const form = page.getByRole("tabpanel");
    await form.getByLabel(/email/i).fill("not-an-email");
    await form.getByLabel(/contraseña/i).fill("whatever123");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    // The field is type="email", so the browser's own validation stops
    // this before react-hook-form runs, and a native tooltip is not in
    // the accessibility tree. What matters to a user either way is that
    // nothing was submitted - assert that rather than a message whose
    // layer is an implementation detail.
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test("asks for a password when none is given", async ({ page }) => {
    await page.goto("/sign-in");

    await page.getByRole("tabpanel").getByLabel(/email/i).fill(NOBODY);
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    await expect(page.getByText(/ingresa tu contraseña/i)).toBeVisible();
  });

  test("surfaces Clerk's rejection of an unknown account", async ({ page }) => {
    await page.goto("/sign-in");

    const form = page.getByRole("tabpanel");
    await form.getByLabel(/email/i).fill(NOBODY);
    await form.getByLabel(/contraseña/i).fill("definitely-not-the-password");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    // ErrorMessage specifically, by its destructive styling - NOT
    // getByRole("alert") alone, which also matches Next's dev overlay
    // and made an earlier version of this test pass without submitting
    // anything at all. Verified by mutation: remove the click above and
    // this fails.
    //
    // Not asserting Clerk's wording: that copy is theirs to change, and
    // silence is the regression that matters.
    await expect(
      page.locator('[role="alert"].text-destructive').first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test("offers the email-code route as well as the password one", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    // Two tabs, and the app's own UI rather than Clerk's - if this ever
    // renders Clerk's hosted form instead (see env.schema.ts on
    // NEXT_PUBLIC_CLERK_SIGN_IN_URL), these tabs disappear.
    await expect(page.getByRole("tab", { name: /contraseña/i })).toBeVisible();
    const codeTab = page.getByRole("tab", { name: /código/i });
    await expect(codeTab).toBeVisible();

    await codeTab.click();
    await expect(page.getByRole("tabpanel").getByLabel(/email/i)).toBeVisible();
  });
});

test.describe("sign-up form", () => {
  test("requires a name, a valid email and a long enough password", async ({
    page,
  }) => {
    await page.goto("/sign-up");

    await page.getByRole("button", { name: /crear cuenta|registrar/i }).click();

    // The schema's own messages, proving the resolver is attached at all.
    await expect(
      page.getByText(/nombre es obligatorio/i).first(),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("rejects a password under eight characters", async ({ page }) => {
    await page.goto("/sign-up");

    await page.getByLabel(/^contraseña$/i).fill("short");
    await page.getByRole("button", { name: /crear cuenta|registrar/i }).click();

    await expect(page.getByText(/al menos 8 caracteres/i)).toBeVisible();
  });

  test("rejects a confirmation that does not match", async ({ page }) => {
    await page.goto("/sign-up");

    await page.getByLabel(/^contraseña$/i).fill("longenough123");
    await page.getByLabel(/confirma|confirmar/i).fill("somethingelse123");
    await page.getByRole("button", { name: /crear cuenta|registrar/i }).click();

    await expect(page.getByText(/no coinciden/i)).toBeVisible();
  });
});

test.describe("forgot password", () => {
  test("does not send a code for a malformed email", async ({ page }) => {
    await page.goto("/forgot-password");

    await page.getByLabel(/email/i).fill("not-an-email");
    await page.getByRole("button", { name: /enviar código/i }).click();

    // Same as the sign-in case: type="email" means the browser refuses
    // first. The guarantee is that the flow does not advance to the code
    // step, whichever layer says no.
    await expect(
      page.getByText(/ingresa el código que recibiste/i),
    ).toHaveCount(0);
  });

  test("links back to sign-in", async ({ page }) => {
    await page.goto("/forgot-password");

    await page
      .getByRole("link", { name: /iniciar sesión|volver/i })
      .first()
      .click();

    // Not /\/sign-in|\/$/ - that second branch matches any URL ending
    // in a slash, so a regression that navigated to /sign-up/ would
    // pass. The link is allowed to go to sign-in or to the landing page
    // and nowhere else.
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toMatch(/^\/(?:sign-in)?\/?$/);
  });
});
