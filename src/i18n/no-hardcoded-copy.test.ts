import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Stops copy from creeping back into components.
 *
 * The catalogue tests next door check the *translations*; nothing
 * checked that components actually use them. That gap was not
 * theoretical: converting the app to next-intl, an accent-based grep
 * reported "zero Spanish left in src" while 31 strings were still
 * hardcoded - "Guardar", "Eliminar", "Sobres", "Escribe … para
 * confirmar:", none of which contain an accented character. This test
 * found every one of them.
 *
 * It parses each file with the TypeScript compiler rather than grepping.
 * A line-based scan can't tell JSX prose from a line of code: the same
 * heuristic that found 31 real strings by regex also produced ~480 false
 * positives on type annotations and `return (`.
 *
 * Two rules, both about text a user can read:
 *
 *  1. No JSX text node may contain letters. Everything a reader sees
 *     should arrive as `{t(...)}`, so what's left inline is punctuation
 *     and separators ("·", "%", "+").
 *  2. Props that render as text may not be plain string literals.
 *
 * It cannot catch a hardcoded string passed through a variable, or one
 * built by string concatenation. It catches the shape people actually
 * write.
 */

/** Props whose value is read by a person, not by the browser. */
const USER_FACING_PROPS = new Set([
  "label",
  "placeholder",
  "title",
  "description",
  "aria-label",
  "alt",
]);

/**
 * Allowed inline text, with the reason each one is not copy.
 *
 * Kept as exact strings rather than patterns: a pattern would quietly
 * grow to cover the next violation too.
 */
const ALLOWED_TEXT = new Map([
  ["CashTracker", "the product name - the same in every language"],
  ["CashTracker.", "product name, followed by the footer's own period"],
  ["&copy;", "an HTML entity, not a word"],
  ["Google", "a brand name - never translated"],
  ["Facebook", "a brand name - never translated"],
]);

const ALLOWED_PROP_VALUES = new Map([
  ["123456", "an example verification code - digits, not words"],
  ["0", "the price input's zero placeholder - a digit"],
]);

/**
 * `src/components/ui/**` is excluded: those are vendored shadcn
 * primitives, kept close to upstream so they can be re-synced. Their
 * stock English defaults (e.g. PaginationPrevious's "Go to previous
 * page") are all overridden by the app-level wrappers that use them -
 * verified for pagination-controls.tsx, the only consumer.
 */
function sourceFiles(): string[] {
  return execSync("find src -name '*.tsx'", { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(
      (file) =>
        !file.endsWith(".test.tsx") && !file.startsWith("src/components/ui/"),
    );
}

interface Finding {
  where: string;
  what: string;
}

function scan(file: string): Finding[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );
  const findings: Finding[] = [];
  const lineOf = (node: ts.Node) =>
    source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) {
      const text = node.text.trim();
      // \p{L} rather than a Spanish-character class - the point is that
      // *no* language's prose belongs inline, not that Spanish doesn't.
      if (/\p{L}/u.test(text) && !ALLOWED_TEXT.has(text)) {
        findings.push({ where: `${file}:${lineOf(node)}`, what: text });
      }
    }

    if (
      ts.isJsxAttribute(node) &&
      USER_FACING_PROPS.has(node.name.getText(source)) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      !ALLOWED_PROP_VALUES.has(node.initializer.text)
    ) {
      findings.push({
        where: `${file}:${lineOf(node)}`,
        what: `${node.name.getText(source)}="${node.initializer.text}"`,
      });
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return findings;
}

describe("no hardcoded copy in components", () => {
  const files = sourceFiles();

  it("finds files to check", () => {
    // A broken glob would make every assertion below pass vacuously.
    expect(files.length).toBeGreaterThan(40);
  });

  it("renders no inline prose", () => {
    const findings = files.flatMap(scan).filter((f) => !f.what.includes('="'));

    expect(findings).toEqual([]);
  });

  it("passes no user-facing prop a string literal", () => {
    const findings = files.flatMap(scan).filter((f) => f.what.includes('="'));

    expect(findings).toEqual([]);
  });
});
