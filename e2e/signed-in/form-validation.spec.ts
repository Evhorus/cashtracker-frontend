import { expect, test } from "@playwright/test";

import {
  createEnvelope,
  deleteEnvelope,
  nameRe,
  uniqueName,
} from "../support/fixtures";

/**
 * That the forms refuse bad input before it reaches the API.
 *
 * The schemas themselves are pure and could be unit tested, and the
 * messages are already checked by messages.test.ts. What neither covers
 * is the wiring: that the resolver is actually attached, that the
 * message is rendered next to the field rather than swallowed, and that
 * submitting does not fire anyway. A form with a perfectly good schema
 * that never calls it looks identical to both.
 *
 * Read-only in effect - every case here is a submission that must NOT
 * create anything.
 */

const ENVELOPE = uniqueName("val-env");

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  try {
    await createEnvelope(page, ENVELOPE, "50000");
  } finally {
    await page.close();
  }
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  try {
    await deleteEnvelope(page, ENVELOPE);
  } finally {
    await page.close();
  }
});

test("an envelope with no name is refused", async ({ page }) => {
  await page.goto("/dashboard/envelopes");
  await page
    .getByRole("button", { name: /nuevo sobre|crear/i })
    .first()
    .click();

  const form = page.getByRole("dialog");
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(
    form.getByText(/nombre del sobre es obligatorio/i),
  ).toBeVisible();
  // The dialog staying open is the half that matters: a message shown
  // while the action fires anyway would still read as "validated".
  await expect(form).toBeVisible();
});

test("a name of only spaces is refused", async ({ page }) => {
  await page.goto("/dashboard/envelopes");
  await page
    .getByRole("button", { name: /nuevo sobre|crear/i })
    .first()
    .click();

  const form = page.getByRole("dialog");
  await form.getByLabel(/nombre del sobre/i).fill("   ");
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  // Whatever the wording, something must complain and the dialog must
  // stay put - "   " is the input that slips past a bare required check.
  await expect(form).toBeVisible();
  await expect(page.getByText(/sobre creado/i)).toHaveCount(0);
});

test("an envelope with a limit switched on but no amount is refused", async ({
  page,
}) => {
  await page.goto("/dashboard/envelopes");
  await page
    .getByRole("button", { name: /nuevo sobre|crear/i })
    .first()
    .click();

  const form = page.getByRole("dialog");
  await form.getByLabel(/nombre del sobre/i).fill(uniqueName("no-amount"));
  await form.getByRole("switch").click();
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(form).toBeVisible();
  await expect(page.getByText(/sobre creado/i)).toHaveCount(0);
});

test("an expense with no name is refused", async ({ page }) => {
  await page.goto(
    `/dashboard/envelopes?search=${encodeURIComponent(ENVELOPE)}`,
  );
  await page
    .getByRole("link", { name: nameRe(ENVELOPE) })
    .first()
    .click();
  await page.waitForURL(/\/dashboard\/envelope\//);

  await page.getByRole("button", { name: /agregar gasto/i }).click();
  const form = page.getByRole("dialog");
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(
    form.getByText(/nombre del gasto es obligatorio/i),
  ).toBeVisible();
  await expect(page.getByText(/gasto creado/i)).toHaveCount(0);
});

test("a category with no name is refused", async ({ page }) => {
  await page.goto("/dashboard/categories");
  await page
    .getByRole("button", { name: /nueva categoría/i })
    .first()
    .click();

  const form = page.getByRole("dialog");
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();

  await expect(
    form.getByText(/nombre de la categoría es obligatorio/i),
  ).toBeVisible();
  await expect(page.getByText(/categoría creada/i)).toHaveCount(0);
});
