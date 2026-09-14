import { expect, test } from "@playwright/test";

import {
  createEnvelope,
  deleteEnvelope,
  nameRe,
  openRowAction,
  uniqueName,
} from "../support/fixtures";

/**
 * The envelope lifecycle: create, read back, edit, delete.
 *
 * money-path.spec.ts already proves that spending against an envelope
 * moves its numbers. This covers the envelope itself - the three
 * mutations whose cache invalidation nothing else exercises. An update
 * that revalidated the detail page but not the list would pass every
 * other suite in the repo.
 *
 * Serial: each test builds on the row the previous one left.
 */

test.describe.configure({ mode: "serial" });

const NAME = uniqueName("env");
const RENAMED = `${NAME}-edit`;
const LIMIT = "200000";

test.afterAll(async ({ browser }) => {
  // A hook, not a final test: a test would be skipped when an earlier
  // one fails, which is exactly when there is something to clean up.
  const page = await browser.newPage();
  try {
    await deleteEnvelope(page, RENAMED);
    await deleteEnvelope(page, NAME);
  } finally {
    await page.close();
  }
});

test("a new envelope appears in the list", async ({ page }) => {
  await createEnvelope(page, NAME, LIMIT);

  await expect(page.getByRole("link", { name: nameRe(NAME) })).toBeVisible();
});

test("its detail page shows the limit it was given", async ({ page }) => {
  await page.goto(`/dashboard/envelopes?search=${encodeURIComponent(NAME)}`);
  await page.getByRole("link", { name: nameRe(NAME) }).click();
  await page.waitForURL(/\/dashboard\/envelope\//);

  // Nothing has been spent, so the derived figure is the assertion
  // worth making: 0% can only be right if the limit was read back and
  // divided into, rather than defaulted.
  await expect(page.getByText(/0[.,]0\s*% del límite/i)).toBeVisible();
  await expect(page.getByText(/200[.,]000/).first()).toBeVisible();
});

test("renaming it updates the list, not just the detail page", async ({
  page,
}) => {
  await page.goto(`/dashboard/envelopes?search=${encodeURIComponent(NAME)}`);

  // Wait for the filtered list to actually be filtered before acting on
  // it. The search is in the URL, so one envelope is all that can be on
  // screen - but only once it has rendered, and openRowAction picks the
  // first matching action in its scope.
  await expect(page.getByRole("link", { name: nameRe(NAME) })).toBeVisible();
  await openRowAction(
    page.getByRole("main"),
    /opciones de sobre/i,
    /editar sobre/i,
  );

  const form = page.getByRole("dialog");
  await form.getByLabel(/nombre del sobre/i).fill(RENAMED);
  await form
    .getByRole("button", { name: /guardar|actualizar/i })
    .last()
    .click();

  await expect(page.getByText(/sobre actualizado/i)).toBeVisible();

  // The list is a separate cached read from the detail page, tagged
  // separately. Asserting only the dialog closed would not notice an
  // action that invalidated one and not the other.
  await page.goto(`/dashboard/envelopes?search=${encodeURIComponent(RENAMED)}`);
  await expect(page.getByRole("link", { name: nameRe(RENAMED) })).toBeVisible();
});

test("deleting it removes it from the list", async ({ page }) => {
  await deleteEnvelope(page, RENAMED);

  await page.goto(`/dashboard/envelopes?search=${encodeURIComponent(RENAMED)}`);
  await expect(page.getByRole("link", { name: nameRe(RENAMED) })).toHaveCount(
    0,
  );
});
