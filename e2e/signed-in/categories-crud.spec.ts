import { expect, test } from "@playwright/test";

import {
  appears,
  nameRe,
  onScreen,
  openRowAction,
  uniqueName,
} from "../support/fixtures";

/**
 * The category lifecycle.
 *
 * Worth its own spec because categories are the one entity another
 * feature reads: an envelope picks one, and deleting a category is
 * explicitly defined not to touch the envelopes already using it (see
 * the deleteDialog copy). That makes its cache invalidation cross a
 * feature boundary, which nothing else here exercises.
 */

test.describe.configure({ mode: "serial" });

const NAME = uniqueName("cat");
const RENAMED = `${NAME}-edit`;

async function deleteCategory(
  page: import("@playwright/test").Page,
  name: string,
) {
  await page.goto("/dashboard/categories");
  await onScreen(page.getByPlaceholder(/buscar categoría/i)).fill(name);

  const row = page.getByRole("row", { name: nameRe(name) });
  if (!(await appears(row))) return;

  await openRowAction(row.first(), /opciones/i, /eliminar categoría/i);
  // Scoped to the alert dialog: its confirm button is labelled just
  // "Eliminar", while the row behind it still has "Eliminar categoría".
  // An unscoped match picks the row and reopens the same dialog.
  const dialog = page.getByRole("alertdialog");
  const confirm = dialog.getByRole("button", { name: /^eliminar$/i });
  // Wait for the dialog before clicking it. click() auto-waits for the
  // element, but the alert dialog animates in, and a click that lands
  // mid-animation is dispatched at a element that has not settled -
  // the dialog stays open and the row never goes away.
  await expect(confirm).toBeVisible();
  await confirm.click();

  // The dialog closing is what says the Server Action resolved. The row
  // vanishing does not: an open modal marks the page behind it
  // aria-hidden, so the row leaves the accessibility tree the moment
  // the dialog opens - about 800ms before the DELETE is processed.
  // Measured, polling the API with curl from the click:
  //
  //     +190ms  api_deleted=false  rowsMatching=0
  //     +969ms  api_deleted=true   rowsMatching=0
  //
  // An earlier version waited on the row and read the API immediately
  // after, which is how this suite "proved" a backend stale-read defect
  // that does not exist.
  await expect(dialog).toHaveCount(0);

  // The row going away, not the toast. A toast is transient by design -
  // asserting it turns a timing difference into a failure about
  // something the test does not care about.
  await expect(row).toHaveCount(0);
}

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  try {
    await deleteCategory(page, RENAMED);
    await deleteCategory(page, NAME);
  } finally {
    await page.close();
  }
});

test("a new category appears in the table", async ({ page }) => {
  await page.goto("/dashboard/categories");
  await page
    .getByRole("button", { name: /nueva categoría/i })
    .first()
    .click();

  const form = page.getByRole("dialog");
  await form.getByLabel(/^nombre/i).fill(NAME);
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(page.getByText(/categoría creada/i)).toBeVisible();
  await expect(page.getByRole("row", { name: nameRe(NAME) })).toBeVisible();
});

test("it is offered when creating an envelope", async ({ page }) => {
  // The point of the entity: a category that exists but cannot be
  // chosen is useless, and this read is cached separately from the
  // table above.
  await page.goto("/dashboard/envelopes");
  await page
    .getByRole("button", { name: /nuevo sobre|crear/i })
    .first()
    .click();

  // The picker is a combobox over a popover listbox, so the options do
  // not exist in the DOM until it is opened.
  const form = page.getByRole("dialog");
  await form.getByRole("combobox").last().click();

  await expect(page.getByRole("listbox").getByText(nameRe(NAME))).toBeVisible();
});

test("renaming it updates the table", async ({ page }) => {
  await page.goto("/dashboard/categories");
  await onScreen(page.getByPlaceholder(/buscar categoría/i)).fill(NAME);

  const target = page.getByRole("row", { name: nameRe(NAME) }).first();
  await expect(target).toBeVisible();
  await openRowAction(target, /opciones/i, /editar categoría/i);

  const form = page.getByRole("dialog");
  await form.getByLabel(/^nombre/i).fill(RENAMED);
  await form
    .getByRole("button", { name: /guardar|actualizar/i })
    .last()
    .click();

  await expect(page.getByText(/categoría actualizada/i)).toBeVisible();

  await page.goto("/dashboard/categories");
  await onScreen(page.getByPlaceholder(/buscar categoría/i)).fill(RENAMED);
  await expect(page.getByRole("row", { name: nameRe(RENAMED) })).toBeVisible();
});

test("deleting it removes it from the table", async ({ page }) => {
  await deleteCategory(page, RENAMED);

  await page.goto("/dashboard/categories");
  await onScreen(page.getByPlaceholder(/buscar categoría/i)).fill(RENAMED);
  await expect(page.getByRole("row", { name: nameRe(RENAMED) })).toHaveCount(0);
});

/**
 * That a delete is durable, not just visually applied.
 *
 * This test spent a while marked fixme against a backend defect that
 * turned out not to exist. The reproduction behind it waited for the
 * deleted row to disappear and then read the API, and "row gone" is not
 * "delete finished" - an open alert dialog makes the page behind it
 * aria-hidden, so the row leaves the accessibility tree as soon as the
 * dialog opens, roughly 800ms before the DELETE is processed. Every
 * "stale read" was a read taken before the delete had happened.
 *
 * Verified from the other side with plain curl, no JS HTTP client in the
 * loop: curl DELETE followed by curl GET shows the category gone at
 * t+0. There is no stale-read window.
 *
 * Keeping the test because the guarantee is still worth holding: a
 * delete has to survive a fresh navigation, not merely close a dialog.
 */
test("a deleted category is gone on the very next navigation", async ({
  page,
}) => {
  const doomed = uniqueName("cat-stale");

  await page.goto("/dashboard/categories");
  await page
    .getByRole("button", { name: /nueva categoría/i })
    .first()
    .click();
  const form = page.getByRole("dialog");
  await form.getByLabel(/^nombre/i).fill(doomed);
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();
  await expect(page.getByText(/categoría creada/i)).toBeVisible();

  await deleteCategory(page, doomed);

  await page.goto("/dashboard/categories");
  await onScreen(page.getByPlaceholder(/buscar categoría/i)).fill(doomed);
  await expect(page.getByRole("row", { name: nameRe(doomed) })).toHaveCount(0);
});
