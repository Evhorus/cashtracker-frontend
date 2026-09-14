import { expect, test } from "@playwright/test";

import {
  appears,
  createEnvelope,
  deleteEnvelope,
  nameRe,
  openRowAction,
  uniqueName,
} from "../support/fixtures";

/**
 * The expense lifecycle, inside an envelope of its own.
 *
 * money-path.spec.ts covers creating one and the derived numbers it
 * moves. What it does not cover is editing or deleting one, and those
 * are the mutations where an envelope's spent total has to move *down*
 * again - a different code path from adding, and one where a cache left
 * unrevalidated shows a total that only ever grows.
 *
 * Every expense here lives in an envelope this spec creates and deletes,
 * so it never touches data it did not make.
 */

test.describe.configure({ mode: "serial" });

const ENVELOPE = uniqueName("exp-env");
const EXPENSE = uniqueName("exp");
const RENAMED = `${EXPENSE}-edit`;
const LIMIT = "100000";
const AMOUNT = "25000";
const REDUCED = "10000";

/** The detail page of the envelope these expenses belong to. */
async function openEnvelope(page: import("@playwright/test").Page) {
  await page.goto(
    `/dashboard/envelopes?search=${encodeURIComponent(ENVELOPE)}`,
  );
  await page
    .getByRole("link", { name: nameRe(ENVELOPE) })
    .first()
    .click();
  await page.waitForURL(/\/dashboard\/envelope\//);
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  try {
    await createEnvelope(page, ENVELOPE, LIMIT);
  } finally {
    await page.close();
  }
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  try {
    // Deleting the envelope takes its expenses with it (the delete
    // dialog says so), so this is the only cleanup needed.
    await deleteEnvelope(page, ENVELOPE);
  } finally {
    await page.close();
  }
});

test("an expense can be added to an envelope", async ({ page }) => {
  await openEnvelope(page);

  await page.getByRole("button", { name: /agregar gasto/i }).click();
  const form = page.getByRole("dialog");
  await form.getByLabel(/nombre del gasto/i).fill(EXPENSE);
  await form.getByLabel(/^monto/i).fill(AMOUNT);
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(page.getByText(/gasto creado/i)).toBeVisible();
  await expect(page.getByRole("row", { name: nameRe(EXPENSE) })).toBeVisible();
  // 25000 of 100000: the derived figure, which can only be right if the
  // write was read back and divided into the limit.
  await expect(page.getByText(/25[.,]0\s*% del límite/i)).toBeVisible();
});

test("editing its amount moves the envelope's total back down", async ({
  page,
}) => {
  await openEnvelope(page);

  const row = page.getByRole("row", { name: nameRe(EXPENSE) });
  await expect(row.first()).toBeVisible();
  await openRowAction(row.first(), /opciones de gasto/i, /editar gasto/i);

  const form = page.getByRole("dialog");
  await form.getByLabel(/nombre del gasto/i).fill(RENAMED);
  // clear() first: PriceInput reformats as you type, and fill() against
  // a populated one appends rather than replaces - 25.000 plus "10000"
  // became 250.000.010.000, which the backend answered with a 500.
  await form.getByLabel(/^monto/i).clear();
  await form.getByLabel(/^monto/i).fill(REDUCED);
  await form
    .getByRole("button", { name: /guardar|actualizar/i })
    .last()
    .click();

  await expect(page.getByText(/gasto actualizado/i)).toBeVisible();

  // Down from 25% to 10%. Spending totals that only ever grow is the
  // failure this is here for - an edit that revalidated nothing would
  // leave 25.0% on screen with a 10.000 expense underneath it.
  await expect(page.getByText(/10[.,]0\s*% del límite/i)).toBeVisible();
  await expect(page.getByRole("row", { name: nameRe(RENAMED) })).toBeVisible();
});

test("deleting it returns the envelope to zero", async ({ page }) => {
  await openEnvelope(page);

  const row = page.getByRole("row", { name: nameRe(RENAMED) });
  await expect(row.first()).toBeVisible();
  await openRowAction(row.first(), /opciones de gasto/i, /eliminar gasto/i);

  const confirm = page
    .getByRole("alertdialog")
    .getByRole("button", { name: /^eliminar$/i });
  await expect(confirm).toBeVisible();
  await confirm.click();

  await expect(page.getByText(/0[.,]0\s*% del límite/i)).toBeVisible();
  expect(await appears(row, 2_000)).toBe(false);
});

/**
 * An amount nobody can spend should be refused by the form, not by a
 * stack trace.
 *
 * expense.schema.ts bounds the amount with .min(1) and nothing above:
 * a large enough number passes client validation, reaches the API and
 * comes back as a 500, which the UI surfaces verbatim as "Internal
 * server error" - untranslated, and in English in a Spanish UI.
 *
 * Found by accident: fill() against PriceInput appends rather than
 * replaces, so an edit meant to write 10000 wrote 250.000.010.000 and
 * the backend fell over.
 *
 * Deliberately asserts the *behaviour* rather than a specific cap -
 * what the maximum should be is a product decision, and the backend's
 * column precision belongs to the other repo. Any validation message
 * satisfies this; a 500 does not.
 */
test.fixme("an impossible amount is refused by the form", async ({ page }) => {
  await openEnvelope(page);

  await page.getByRole("button", { name: /agregar gasto/i }).click();
  const form = page.getByRole("dialog");
  await form.getByLabel(/nombre del gasto/i).fill(uniqueName("huge"));
  await form.getByLabel(/^monto/i).fill("999999999999999");
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(page.getByText(/internal server error/i)).toHaveCount(0);
});
