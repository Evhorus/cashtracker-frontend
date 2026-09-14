import { expect, type Page } from "@playwright/test";

/**
 * Flows more than one spec needs, in one place.
 *
 * In support/, which matches neither project's glob, so nothing here is
 * ever collected as a test.
 *
 * Every name these produce starts with `e2e-`, which is what makes a
 * leftover row identifiable later: if a run dies halfway, what it left
 * behind says so in its own name.
 */

export const uniqueName = (prefix: string) =>
  `e2e-${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/** Case-insensitive, because the backend stores names lowercase for its
 * own grouping and the API->domain mapper capitalises the first letter
 * on the way back (capitalize() in shared/lib/utils.ts). What renders is
 * never byte-identical to what was typed, and no test should care which
 * layer owns that. */
export const nameRe = (name: string) => new RegExp(name, "i");

/** The dialog currently on screen. Every form below lives in one, and
 * scoping to it is what keeps a locator from matching the page behind
 * it - the envelopes list renders its own "Monto" column while the
 * create dialog is open. */
const dialog = (page: Page) => page.getByRole("dialog");

export async function createEnvelope(
  page: Page,
  name: string,
  limit?: string,
): Promise<void> {
  await page.goto("/dashboard/envelopes");
  await page
    .getByRole("button", { name: /nuevo sobre|crear/i })
    .first()
    .click();

  const form = dialog(page);
  await form.getByLabel(/nombre del sobre/i).fill(name);

  if (limit) {
    // A Base UI Switch (role="switch"), not a checkbox - .check() only
    // works on real checkbox inputs, and the amount field does not
    // render at all until this is on.
    await form.getByRole("switch").click();
    await form.getByLabel(/^monto/i).fill(limit);
  }

  await form
    .getByRole("button", { name: /guardar|crear/i })
    .last()
    .click();
  await expect(page.getByText(/sobre creado/i)).toBeVisible();
}

/** Deletes by name, and tolerates the envelope already being gone so it
 * is safe to call from an afterAll that may run after a failure. */
export async function deleteEnvelope(page: Page, name: string): Promise<void> {
  await page.goto(`/dashboard/envelopes?search=${encodeURIComponent(name)}`);

  const link = page.getByRole("link", { name: nameRe(name) });
  if (!(await appears(link))) return;

  const displayed = (await link.first().innerText()).trim();
  await link.first().click();
  await page.waitForURL(/\/dashboard\/envelope\//);

  await page.getByRole("button", { name: /^eliminar$/i }).click();
  // Type-to-confirm: the action stays disabled until this matches the
  // name exactly, and exactly means the capitalised form the UI shows.
  await page.getByPlaceholder(/nombre del sobre/i).fill(displayed);
  await page
    .getByRole("button", { name: /eliminar|confirmar/i })
    .last()
    .click();
  await page.waitForURL("**/dashboard/envelopes");
}

/**
 * Picks a per-row action, from wherever this layout puts it.
 *
 * `scope` is the row the action belongs to, and passing it is not
 * optional politeness: an unscoped page.getByRole("button", { name:
 * /eliminar/i }).first() matches the first such button in the TABLE,
 * which is only the intended row once filtering has settled. It silently
 * acts on somebody else's row otherwise - deleting the wrong record and
 * then failing on an assertion about the right one, which reads like a
 * flaky test rather than the destructive mistake it is.
 *
 * The same action lives in two places depending on width: inline on the
 * row at desktop size, and behind an icon-only drawer trigger
 * (ActionsDrawer, named e.g. "Opciones de Sobre") on narrow screens.
 */
export async function openRowAction(
  scope: import("@playwright/test").Locator,
  menuName: RegExp,
  actionName: RegExp,
): Promise<void> {
  const action = scope.getByRole("button", { name: actionName }).first();
  if (await action.isVisible().catch(() => false)) {
    await action.click();
    return;
  }

  await scope.getByRole("button", { name: menuName }).first().click();
  // The drawer renders in a portal at the end of the body, outside the
  // row, so the item itself cannot be scoped to it.
  await scope.page().getByRole("button", { name: actionName }).first().click();
}

/**
 * The one that is actually on screen.
 *
 * Several controls render twice - a desktop copy and a mobile one, both
 * in the DOM, one hidden by CSS. `.first()` picks whichever comes first
 * in source order, which is the hidden one often enough that it is not
 * worth guessing: a fill() against it waits the full timeout and then
 * fails with "element is not visible" rather than saying why.
 */
export const onScreen = (locator: import("@playwright/test").Locator) =>
  locator.filter({ visible: true }).first();

/**
 * Whether the element shows up within `timeout`, without failing if it
 * does not.
 *
 * isVisible() and count() answer instantly from the current DOM, so
 * against a list that filters as you type they report "not there" for a
 * row that is about to render. Used as a guard, that silently skips the
 * work - a cleanup helper that deletes nothing and reports success.
 */
export async function appears(
  locator: import("@playwright/test").Locator,
  timeout = 5_000,
): Promise<boolean> {
  return locator
    .first()
    .waitFor({ state: "visible", timeout })
    .then(() => true)
    .catch(() => false);
}
