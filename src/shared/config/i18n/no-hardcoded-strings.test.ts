import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { MESSAGES } from "./messages";

/**
 * The failure mode messages.test.ts cannot see.
 *
 * That test compares the two catalogues against each other, so it
 * catches a key present in one language and missing from the other. A
 * string that was never put in a catalogue at all is invisible to it:
 * the catalogues stay in perfect agreement while the component renders
 * Spanish to an English reader.
 *
 * That is not hypothetical. envelope-chart.tsx rendered
 *
 *     {isExceeded ? "Excedido" : "Disponible"}
 *
 * while holding a `t` from useTranslations("envelopes.chart") and using
 * it two lines above, with `exceeded` and `available` already translated
 * in both files. Nothing failed - not tsc, not eslint, not Vitest. It
 * surfaced only by loading the page in English and reading it.
 *
 * The check needs no word list and no guessing about what "looks
 * Spanish": if a literal in a component is character-for-character a
 * value in the Spanish catalogue, the translation already exists and the
 * component should be reaching it through t().
 */

const SOURCE_ROOTS = ["src/app", "src/features", "src/shared"];

/** Values identical in both languages ("COP", "CashTracker", "Euro")
 * carry no information: writing one as a literal is not a missed
 * translation, because there is nothing to translate. Only values the
 * two catalogues actually disagree on are evidence. */
const MIN_LENGTH = 5;

type Messages = Record<string, unknown>;

function leaves(obj: Messages, prefix = ""): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value && typeof value === "object") {
        return { ...acc, ...leaves(value as Messages, `${prefix}${key}.`) };
      }
      acc[`${prefix}${key}`] = String(value);
      return acc;
    },
    {},
  );
}

function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return tsxFiles(path);
    return entry.name.endsWith(".tsx") && !entry.name.endsWith(".test.tsx")
      ? [path]
      : [];
  });
}

/** Comments are prose about the code, and prose about a Spanish UI
 * quotes Spanish constantly - hero-balance-card.tsx explains itself in
 * terms of "Disponible". Stripping them is what keeps this check to
 * strings that actually render. Replaced with spaces rather than
 * removed so line numbers survive. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
}

describe("no hardcoded translations", () => {
  const es = leaves(MESSAGES.es as Messages);
  const en = leaves(MESSAGES.en as Messages);

  /** Spanish values worth flagging, longest first so the report names
   * the most specific match rather than a fragment of it. */
  const translated = Object.entries(es)
    .filter(([key, value]) => value.length >= MIN_LENGTH && en[key] !== value)
    // A value carrying an ICU placeholder cannot appear verbatim in
    // source anyway - "{count} gastos" is assembled at render time.
    .filter(([, value]) => !value.includes("{"))
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value.length - a.value.length);

  it("has Spanish values to check against", () => {
    // Guards the check itself: if the catalogue moved or the shape
    // changed, every assertion below would pass vacuously.
    expect(translated.length).toBeGreaterThan(50);
  });

  it("no component renders a string the catalogue already translates", () => {
    const offenders: string[] = [];

    for (const root of SOURCE_ROOTS) {
      for (const file of tsxFiles(root)) {
        const lines = stripComments(readFileSync(file, "utf8")).split("\n");

        lines.forEach((line, index) => {
          const hit = translated.find(({ value }) => line.includes(value));
          if (!hit) return;
          offenders.push(
            `${file}:${index + 1}\n    "${hit.value}" is ${hit.key} - use t("${hit.key}")`,
          );
        });
      }
    }

    expect(offenders, `\n${offenders.join("\n")}\n`).toEqual([]);
  });
});
