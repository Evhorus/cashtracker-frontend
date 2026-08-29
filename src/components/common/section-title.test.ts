import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { DASHBOARD_NAV_ITEMS } from "./nav-items";

/**
 * A section page must not render its own visible title above `md`.
 *
 * CustomHeader shows the section name there (as the page's h1), so a
 * second copy makes the same word appear three times on one screen -
 * header, highlighted sidebar item, and the page's own heading. That is
 * the state this app was actually in before it was fixed.
 *
 * Worth a test because the mistake is silent and easy: add a page,
 * render `<PageHeader title={...} />` the way every other page does, and
 * nothing complains. It also fails the other way - a page that hides its
 * title where the header shows nothing leaves the reader with no title
 * at all.
 *
 * What it cannot check: that exactly one h1 is *visible*. Tailwind's
 * breakpoints only resolve in a real browser, and jsdom does not
 * evaluate them. This is a source-level guard on the markers that
 * produce that outcome, verified by hand in a browser at 390px and
 * 1600px when they were introduced.
 */

/** Hides the element above `md`, or hands the title to the app header. */
const DESKTOP_HIDDEN_MARKERS = ["md:hidden", "md:sr-only"];
const HANDS_OFF_PROP = "hideTitleOnDesktop";

/**
 * Pages whose heading is NOT the section name, with the reason. The
 * summary page greets the reader by name ("Hola, Sebastián"), which the
 * header does not repeat, so it keeps its heading at every width.
 */
const KEEPS_ITS_OWN_HEADING = new Map([
  ["/dashboard", "a greeting with the user's name, not the section name"],
]);

function pageFileFor(href: string): string {
  return `src/app${href}/page.tsx`;
}

/** Does this file render a page title, and is that title desktop-hidden? */
function inspect(file: string): { rendersTitle: boolean; hidden: boolean } {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );

  let rendersTitle = false;
  let hidden = false;

  const attributes = (node: ts.JsxSelfClosingElement | ts.JsxOpeningElement) =>
    node.attributes.properties.filter(ts.isJsxAttribute);

  /**
   * Walks up looking for a className that hides this above `md`.
   *
   * A wrapping `<div className="md:hidden">` parses as a JsxElement, and
   * its props live on that element's `openingElement` - stepping over
   * JsxElement rather than unwrapping it is why the first version of
   * this reported two false failures.
   */
  const hiddenByAncestor = (node: ts.Node): boolean => {
    for (
      let current: ts.Node | undefined = node;
      current;
      current = current.parent
    ) {
      const element = ts.isJsxElement(current)
        ? current.openingElement
        : ts.isJsxSelfClosingElement(current) || ts.isJsxOpeningElement(current)
          ? current
          : undefined;
      if (!element) continue;

      const className = attributes(element).find(
        (attribute) => attribute.name.getText(source) === "className",
      );
      const literal =
        className?.initializer && ts.isStringLiteral(className.initializer)
          ? className.initializer.text
          : "";
      if (DESKTOP_HIDDEN_MARKERS.some((marker) => literal.includes(marker))) {
        return true;
      }
    }
    return false;
  };

  const visit = (node: ts.Node): void => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const name = node.tagName.getText(source);
      const isH1Heading =
        name === "Heading" &&
        attributes(node).some(
          (attribute) =>
            attribute.name.getText(source) === "as" &&
            attribute.initializer &&
            ts.isStringLiteral(attribute.initializer) &&
            attribute.initializer.text === "h1",
        );

      if (name === "PageHeader" || isH1Heading) {
        rendersTitle = true;
        if (
          attributes(node).some(
            (attribute) => attribute.name.getText(source) === HANDS_OFF_PROP,
          ) ||
          hiddenByAncestor(node)
        ) {
          hidden = true;
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return { rendersTitle, hidden };
}

describe("section pages and the app header agree about the title", () => {
  const sections = DASHBOARD_NAV_ITEMS.filter(
    (item) => !KEEPS_ITS_OWN_HEADING.has(item.href),
  );

  it("has a page file for every nav destination", () => {
    // A nav item pointing at nothing would make every check below pass
    // by vacuously skipping it.
    for (const item of DASHBOARD_NAV_ITEMS) {
      expect(existsSync(pageFileFor(item.href)), item.href).toBe(true);
    }
  });

  it.each(sections)(
    "$href does not repeat the section name above md",
    ({ href }) => {
      const { rendersTitle, hidden } = inspect(pageFileFor(href));

      // Not rendering a title at all is fine - the header supplies it.
      if (!rendersTitle) return;

      expect(
        { href, hidden },
        `${pageFileFor(href)} renders a page title. The app header already ` +
          `shows the section name above md, so pass ${HANDS_OFF_PROP} to ` +
          `PageHeader or wrap the heading in one of ` +
          `${DESKTOP_HIDDEN_MARKERS.join(" / ")}.`,
      ).toEqual({ href, hidden: true });
    },
  );

  it("still renders a title on the pages that own theirs", () => {
    // The other direction: an opt-out has to actually keep its heading,
    // or that page has no title at any width.
    for (const href of KEEPS_ITS_OWN_HEADING.keys()) {
      expect(inspect(pageFileFor(href)).rendersTitle, href).toBe(true);
    }
  });

  it("checks the files it thinks it checks", () => {
    // Guards against the glob/path convention drifting - e.g. a route
    // group appearing between src/app and the segment.
    const tracked = execSync("git ls-files src/app/dashboard", {
      encoding: "utf8",
    });
    for (const item of DASHBOARD_NAV_ITEMS) {
      expect(tracked).toContain(pageFileFor(item.href));
    }
  });
});
