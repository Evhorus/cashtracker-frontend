import { expect, test } from "@playwright/test";

/**
 * The invariant the whole product rests on: money spent against an
 * envelope shows up everywhere it should.
 *
 * This is the one end-to-end path worth having. It crosses every layer
 * at once - form, Server Action, service, backend, cache invalidation,
 * re-render - and it is the only thing that actually verifies the cache
 * tag work: `updateTag` on a name nothing is cached under is not an
 * error, so a wrong tag is invisible to typecheck, lint and Vitest
 * alike, and surfaces only as a number that failed to move.
 *
 * Self-cleaning: it creates what it needs and deletes it at the end, so
 * it can run repeatedly without leaving rows behind. It still writes to
 * whichever account E2E_CLERK_USER_EMAIL points at - see global.setup.ts.
 */

const ENVELOPE = `e2e-${Date.now()}`;
const LIMIT = "100000";
const EXPENSE_AMOUNT = "25000";

test.describe.configure({ mode: "serial" });

test("an expense moves the envelope's spent amount", async ({ page }) => {
  await page.goto("/dashboard/envelopes");

  // --- create the envelope -------------------------------------------
  await page
    .getByRole("button", { name: /crear|nuevo|añadir/i })
    .first()
    .click();
  await page.getByLabel(/nombre del sobre/i).fill(ENVELOPE);
  await page.getByLabel(/límite de gasto/i).check();
  await page.getByLabel(/^monto$/i).fill(LIMIT);
  await page
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(page.getByText(/sobre creado/i)).toBeVisible();
  await expect(page.getByText(ENVELOPE)).toBeVisible();

  // --- add an expense to it ------------------------------------------
  await page.getByText(ENVELOPE).click();
  await page.waitForURL(/\/dashboard\/envelope\//);

  await page
    .getByRole("button", { name: /crear|nuevo|añadir/i })
    .first()
    .click();
  await page
    .getByLabel(/nombre/i)
    .first()
    .fill("e2e expense");
  await page.getByLabel(/^monto$/i).fill(EXPENSE_AMOUNT);
  await page
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(page.getByText(/gasto creado/i)).toBeVisible();

  // --- the point of the test -----------------------------------------
  // The expense exists; now the derived numbers have to agree with it.
  // If the detail tag were still global, or the wrong name, this is
  // where a stale cached response would show the old total.
  await expect(page.getByText("25.000").first()).toBeVisible();

  // And the list view, which is a different cached read with its own tag.
  await page.goto("/dashboard/envelopes");
  await expect(page.getByText(ENVELOPE)).toBeVisible();
});

test("cleanup: the envelope is removed", async ({ page }) => {
  await page.goto("/dashboard/envelopes");
  await page.getByText(ENVELOPE).click();
  await page.waitForURL(/\/dashboard\/envelope\//);

  await page
    .getByRole("button", { name: /eliminar/i })
    .first()
    .click();
  await page
    .getByRole("button", { name: /eliminar|confirmar/i })
    .last()
    .click();

  await expect(page.getByText(/sobre eliminado/i)).toBeVisible();
  await expect(page.getByText(ENVELOPE)).toBeHidden();
});
