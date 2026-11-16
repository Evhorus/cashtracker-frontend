import { expect, test, type Page } from "@playwright/test";

import {
  createEnvelope,
  deleteEnvelope,
  nameRe,
  openRowAction,
  uniqueName,
} from "../support/fixtures";

/**
 * Payment methods end to end: created in Account, picked on an expense,
 * remembered when that expense is edited, and deletable without losing
 * the expense. Self-cleaning: everything here is created by this spec.
 */
test.describe.configure({ mode: "serial" });

const ENVELOPE = uniqueName("pm-env");
const METHOD = uniqueName("pm-card");
const EXPENSE = uniqueName("pm-exp");
/** An expense with no payment method, beside the tagged one. */
const UNTAGGED = uniqueName("pm-untagged");

async function openAccountSection(page: Page) {
  await page.goto("/dashboard/account?section=paymentMethods");
  await expect(
    page.getByRole("heading", { name: /medios de pago/i }),
  ).toBeVisible();
}

async function openEnvelope(page: Page) {
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
    await createEnvelope(page, ENVELOPE, "100000");
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

test("a credit card with a cut-off day is created in Account", async ({
  page,
}) => {
  await openAccountSection(page);
  await page.getByRole("button", { name: /agregar medio de pago/i }).click();

  const form = page.getByRole("dialog");
  await form.getByLabel(/^nombre/i).fill(METHOD);
  await form.getByLabel(/día de corte/i).fill("15");
  await form.getByRole("button", { name: /guardar/i }).click();

  await expect(page.getByText(/medio de pago creado/i)).toBeVisible();
  const row = page.getByRole("listitem").filter({ hasText: METHOD });
  await expect(row).toContainText(/corte el día 15/i);
});

test("the cut-off day only applies to credit cards", async ({ page }) => {
  await openAccountSection(page);
  await page.getByRole("button", { name: /agregar medio de pago/i }).click();

  const form = page.getByRole("dialog");
  await expect(form.getByLabel(/día de corte/i)).toBeVisible();
  await form.getByLabel(/^tipo/i).selectOption("cash");
  await expect(form.getByLabel(/día de corte/i)).toHaveCount(0);
});

test("an expense is tagged with it and keeps it on edit", async ({ page }) => {
  await openEnvelope(page);

  await page.getByRole("button", { name: /agregar gasto/i }).click();
  const form = page.getByRole("dialog");
  await form.getByLabel(/nombre del gasto/i).fill(EXPENSE);
  await form.getByLabel(/^monto/i).fill("25000");
  const toggle = form.getByRole("switch", { name: /medio de pago/i });
  await expect(toggle).not.toBeChecked();
  await expect(form.getByRole("radio")).toHaveCount(0);
  await toggle.click();
  await form.getByRole("radio", { name: nameRe(METHOD) }).click();
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();
  await expect(page.getByText(/gasto creado/i)).toBeVisible();

  const row = page.getByRole("row", { name: nameRe(EXPENSE) });
  await openRowAction(row.first(), /opciones de gasto/i, /editar gasto/i);
  await expect(
    page.getByRole("dialog").getByRole("radio", { name: nameRe(METHOD) }),
  ).toHaveAttribute("aria-checked", "true");
});

test("one created from the expense form does not submit the expense", async ({
  page,
}) => {
  // The payment method form opens on top of the expense form, and a
  // nested form's submit must not also submit the one underneath.
  const quick = `${METHOD}-quick`;
  await openEnvelope(page);
  await page.getByRole("button", { name: /agregar gasto/i }).click();
  await page.getByLabel(/nombre del gasto/i).fill(`${EXPENSE}-draft`);
  await page.getByRole("switch", { name: /medio de pago/i }).click();
  await page.getByRole("button", { name: /^nuevo$/i }).click();

  const methodForm = page.getByRole("dialog", {
    name: /nuevo medio de pago/i,
  });
  await methodForm.getByLabel(/^nombre/i).fill(quick);
  await methodForm.getByRole("button", { name: /guardar/i }).click();
  await expect(page.getByText(/medio de pago creado/i)).toBeVisible();

  // Back on the untouched expense form, with the new chip on offer.
  await expect(page.getByLabel(/nombre del gasto/i)).toHaveValue(
    `${EXPENSE}-draft`,
  );
  await expect(page.getByRole("radio", { name: nameRe(quick) })).toBeVisible();
  await expect(page.getByText(/gasto creado/i)).toHaveCount(0);

  // Tidy up the extra one.
  await openAccountSection(page);
  await page
    .getByRole("button", { name: new RegExp(`eliminar ${quick}`, "i") })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: /^eliminar$/i })
    .click();
  await expect(page.getByText(/medio de pago eliminado/i)).toBeVisible();
});

test("the envelope's expenses filter by payment method", async ({ page }) => {
  await openEnvelope(page);
  // A second expense, without a method: the filter only offers methods
  // that tell this envelope's expenses apart.
  await page.getByRole("button", { name: /agregar gasto/i }).click();
  const form = page.getByRole("dialog");
  await form.getByLabel(/nombre del gasto/i).fill(UNTAGGED);
  await form.getByLabel(/^monto/i).click();
  await form.getByLabel(/^monto/i).fill("5000");
  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();
  await expect(page.getByText(/gasto creado/i)).toBeVisible();

  const tagged = page.getByRole("row", { name: nameRe(EXPENSE) });
  const withoutMethod = page.getByRole("row", { name: nameRe(UNTAGGED) });
  const filters = page.getByRole("button", { name: /^filtros/i });

  // Only expenses without a method.
  await filters.click();
  await page
    .getByRole("menuitemcheckbox", { name: /sin medio de pago/i })
    .click();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/methods=none/);
  await expect(withoutMethod).toBeVisible();
  await expect(tagged).toHaveCount(0);
  await expect(filters).toHaveAccessibleName(/1 activo/i);

  // Only its card.
  await filters.click();
  await page
    .getByRole("menuitemcheckbox", { name: /sin medio de pago/i })
    .click();
  await page.getByRole("menuitemcheckbox", { name: nameRe(METHOD) }).click();
  await page.keyboard.press("Escape");
  await expect(tagged).toBeVisible();
  await expect(withoutMethod).toHaveCount(0);

  // No card the envelope does not use is offered.
  await filters.click();
  await expect(page.getByRole("menuitemcheckbox")).toHaveCount(2);
  await page.keyboard.press("Escape");
});

test("deleting it keeps the expense", async ({ page }) => {
  await openAccountSection(page);
  await page
    .getByRole("button", { name: new RegExp(`eliminar ${METHOD}`, "i") })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: /^eliminar$/i })
    .click();
  await expect(page.getByText(/medio de pago eliminado/i)).toBeVisible();

  await openEnvelope(page);
  await expect(page.getByRole("row", { name: nameRe(EXPENSE) })).toBeVisible();
  // 25.000 + the 5.000 untagged one, of 100.000.
  await expect(page.getByText(/30[.,]0\s*% del límite/i)).toBeVisible();
});
