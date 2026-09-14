import { expect, test, type Page } from "@playwright/test";

/**
 * The invariant the whole product rests on: money spent against an
 * envelope shows up everywhere it should.
 *
 * This is the one end-to-end path worth having. It crosses every layer
 * at once - form, Server Action, service, backend, cache invalidation,
 * re-render - and it is the only thing that verifies the cache tags:
 * `updateTag` on a name nothing is cached under is not an error, so a
 * wrong tag is invisible to typecheck, lint and Vitest alike and shows
 * up only as a number that failed to move.
 *
 * Self-cleaning: it creates what it needs and deletes it at the end, so
 * repeated runs neither collide nor leave rows behind. It still writes
 * to whichever account E2E_CLERK_USER_EMAIL names - see global.setup.ts.
 */

const ENVELOPE = `e2e-${Date.now()}`;

/**
 * The backend stores names lowercase for its own grouping and the
 * API->domain mapper capitalises the first letter on the way back (see
 * capitalize() in shared/lib/utils.ts), so what renders is never
 * byte-identical to what was typed. Matching case-insensitively is the
 * point rather than a workaround: this test should not care which layer
 * owns the casing.
 */
const ENVELOPE_RE = new RegExp(ENVELOPE, "i");

const LIMIT = "100000";
const EXPENSE_AMOUNT = "25000";

test.describe.configure({ mode: "serial" });

/** The card's link specifically: plain text matches twice, since the
 * card title and its link carry the same words, and Playwright's strict
 * mode rejects an ambiguous locator. */
const envelopeLink = (page: Page) =>
  page.getByRole("link", { name: ENVELOPE_RE });

test("an expense moves the envelope's spent amount", async ({ page }) => {
  // --- create the envelope -------------------------------------------
  await page.goto("/dashboard/envelopes");

  await page
    .getByRole("button", { name: /crear|nuevo|añadir/i })
    .first()
    .click();
  await page.getByLabel(/nombre del sobre/i).fill(ENVELOPE);
  // A Base UI Switch (role="switch"), not a checkbox - .check() only
  // works on real checkbox inputs. The amount field does not render at
  // all until this is on.
  await page.getByRole("switch").click();
  await page.getByLabel(/^monto/i).fill(LIMIT);
  await page
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(page.getByText(/sobre creado/i)).toBeVisible();
  await expect(envelopeLink(page)).toBeVisible();

  // --- add an expense to it ------------------------------------------
  await envelopeLink(page).click();
  await page.waitForURL(/\/dashboard\/envelope\//);

  await page.getByRole("button", { name: /agregar gasto/i }).click();
  await page.getByLabel(/nombre del gasto/i).fill("e2e expense");
  // "Monto COP", not "Monto": the expense field appends the envelope's
  // currency to its label, while the envelope form's does not. Hence a
  // prefix match rather than an exact one.
  await page.getByLabel(/^monto/i).fill(EXPENSE_AMOUNT);
  await page
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(page.getByText(/gasto creado/i)).toBeVisible();

  // --- the actual assertion ------------------------------------------
  // The expense exists; now the derived numbers have to agree. If the
  // detail tag were global rather than per id, or simply misspelled,
  // this is where a stale cached response would still show zero.
  //
  // The percentage is the strongest single assertion available: it can
  // only be right if the spend was re-read AND divided by the limit, so
  // it covers the invalidation and the derivation in one. A raw amount
  // match would not - the same figure is rendered several times, some
  // of them in responsive duplicates that are present but hidden.
  await expect(page.getByText(/25[.,]0\s*% del límite/i)).toBeVisible();

  // And the expense itself reached the history table.
  await expect(page.getByRole("row", { name: /e2e expense/i })).toBeVisible();
});

test("cleanup: the envelope is removed", async ({ page }) => {
  await page.goto("/dashboard/envelopes");
  await envelopeLink(page).click();
  await page.waitForURL(/\/dashboard\/envelope\//);

  await page.getByRole("button", { name: /^eliminar$/i }).click();

  // Delete is type-to-confirm: the action button stays disabled until
  // the field matches the envelope's name exactly, and "exactly" means
  // the capitalised form the UI displays, not the lowercase one that
  // was typed when creating it.
  await page
    .getByPlaceholder(/nombre del sobre/i)
    .fill(ENVELOPE.charAt(0).toUpperCase() + ENVELOPE.slice(1));

  await page
    .getByRole("button", { name: /eliminar|confirmar/i })
    .last()
    .click();

  // Deleting redirects to the list, so the success toast is racing a
  // navigation and is not a reliable thing to assert. What matters here
  // is the outcome: back on the list, the envelope is gone.
  await page.waitForURL("**/dashboard/envelopes");
  await expect(envelopeLink(page)).toHaveCount(0);
});
