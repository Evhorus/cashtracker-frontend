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
  const confirm = page
    .getByRole("alertdialog")
    .getByRole("button", { name: /^eliminar$/i });
  // Wait for the dialog before clicking it. click() auto-waits for the
  // element, but the alert dialog animates in, and a click that lands
  // mid-animation is dispatched at a element that has not settled -
  // the dialog stays open and the row never goes away.
  await expect(confirm).toBeVisible();
  await confirm.click();

  // The row going away, not the toast. A toast is transient by design -
  // asserting it turns a timing difference into a failure about
  // something the test does not care about.
  await expect(row).toHaveCount(0);

  // A second navigation, because the first one after a delete still
  // serves the old list - see the fixme at the bottom of this file.
  // Without it a caller that re-reads the page sees the row it just
  // deleted and concludes the delete failed.
  await page.goto("/dashboard/categories");
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

  // reload(), not goto(): a navigation straight after a delete still
  // renders the pre-delete list, which is its own defect and has its
  // own test below. Asserting it here would only be re-reporting that
  // one from a test about whether delete works at all - and it does.
  await page.goto("/dashboard/categories");
  await page.reload();
  await onScreen(page.getByPlaceholder(/buscar categoría/i)).fill(RENAMED);
  await expect(page.getByRole("row", { name: nameRe(RENAMED) })).toHaveCount(0);
});

/**
 * A real defect, and it is in the backend - not in this app's caching,
 * which is where two earlier attempts looked.
 *
 * Deleting a category updates the page you are on, but for roughly two
 * seconds afterwards the API keeps returning it, so a user who deletes
 * and navigates straight away sees it listed again.
 *
 * Measured, with the frontend taken out of the picture entirely: after
 * the UI delete resolves, calling GET /categories directly against the
 * backend with the same session token returns the deleted category, and
 * stops returning it about 2.5s later. Three runs out of three:
 *
 *     BACKEND immediately  status=200 deletedCategoryStillReturned=true
 *     BACKEND after 2.5s   status=200 deletedCategoryStillReturned=false
 *
 * What it is NOT, each ruled out by experiment rather than by reading:
 *
 *   - Not a tag mismatch. CategoriesService.getAll tags
 *     CATEGORY_TAGS.all and delete-category.action invalidates that
 *     exact tag.
 *   - Not a route-level cache. A URL nothing had ever rendered or
 *     prefetched (/dashboard/categories?nocache=<now>) was stale too.
 *   - Not fixable with revalidatePath: adding
 *     revalidatePath("/dashboard", "layout") changed nothing.
 *   - Not Next's Data Cache at all. With cache: "no-store" on that
 *     fetch - no caching anywhere in this app - the first read was
 *     still stale.
 *
 * It is time-based rather than navigation-based: the same unique URL
 * read 2.5s later is correct.
 *
 * Left as fixme because the fix belongs in cashtracker-backend, not
 * here. Nothing this app can do makes a read return data the API is
 * still serving. Remove .fixme once the backend stops doing it - this
 * test is the reproduction from the user's side.
 */
test.fixme("a deleted category is gone on the very next navigation", async ({
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
