import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

import {
  createEnvelope,
  deleteEnvelope,
  nameRe,
  uniqueName,
} from "../support/fixtures";

/**
 * The expenses report end to end: an expense paid with a card shows up
 * under that card, not under "Sin medio de pago", in both views, and
 * the CSV carries it. Self-cleaning: everything here is created by
 * this spec.
 */
test.describe.configure({ mode: "serial" });

const ENVELOPE = uniqueName("rep-env");
const METHOD = uniqueName("rep-card");
const EXPENSE = uniqueName("rep-exp");

async function openAccountSection(page: Page) {
  await page.goto("/dashboard/account?section=paymentMethods");
  await expect(
    page.getByRole("heading", { name: /medios de pago/i }),
  ).toBeVisible();
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  try {
    await createEnvelope(page, ENVELOPE, "100000");

    await openAccountSection(page);
    await page.getByRole("button", { name: /agregar medio de pago/i }).click();
    const methodForm = page.getByRole("dialog");
    await methodForm.getByLabel(/^nombre/i).fill(METHOD);
    await methodForm.getByRole("button", { name: /guardar/i }).click();
    await expect(page.getByText(/medio de pago creado/i)).toBeVisible();

    // Dated today, so it falls in the report's default month.
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
    await form.getByLabel(/nombre del gasto/i).fill(EXPENSE);
    await form.getByLabel(/^monto/i).click();
    await form.getByLabel(/^monto/i).fill("25000");
    await form.getByRole("switch", { name: /medio de pago/i }).click();
    await form.getByRole("radio", { name: nameRe(METHOD) }).click();
    await form
      .getByRole("button", { name: /guardar|crear/i })
      .last()
      .click();
    await expect(page.getByText(/gasto creado/i)).toBeVisible();
  } finally {
    await page.close();
  }
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  try {
    await deleteEnvelope(page, ENVELOPE);
    await openAccountSection(page);
    const remove = page.getByRole("button", {
      name: new RegExp(`eliminar ${METHOD}`, "i"),
    });
    if (await remove.count()) {
      await remove.click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: /^eliminar$/i })
        .click();
    }
  } finally {
    await page.close();
  }
});

test("filters by payment method across envelopes", async ({ page }) => {
  await page.goto("/dashboard/expenses");
  const row = page.getByRole("row", { name: nameRe(EXPENSE) });
  await expect(row).toBeVisible();
  await expect(row).toContainText(ENVELOPE, { ignoreCase: true });

  await page.getByRole("button", { name: /sin medio de pago/i }).click();
  await expect(page).toHaveURL(/methods=none/);
  await expect(row).toHaveCount(0);

  // Both selected: the card's expense is back.
  await page.getByRole("button", { name: nameRe(METHOD) }).click();
  await expect(row).toBeVisible();
});

test("the split view groups it under its card", async ({ page }) => {
  await page.goto("/dashboard/expenses?view=split");
  const section = page.locator("section").filter({
    has: page.getByRole("heading", { name: nameRe(METHOD) }),
  });
  await expect(
    section.getByRole("row", { name: nameRe(EXPENSE) }),
  ).toBeVisible();
  await expect(section).toContainText(/\$\s?25\.000/);
});

test("the CSV carries the expense", async ({ page }) => {
  await page.goto("/dashboard/expenses");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /descargar csv/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^gastos-\d{4}-\d{2}\.csv$/);
  const csv = await readFile((await download.path())!, "utf8");
  const line = csv
    .split("\r\n")
    .find((candidate) =>
      candidate.toLowerCase().includes(EXPENSE.toLowerCase()),
    );
  expect(line).toBeDefined();
  expect(line).toContain(";25000");
});
