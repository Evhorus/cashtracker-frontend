import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./config";
import { MESSAGES, MESSAGE_SOURCES } from "./messages";

/**
 * The failure mode i18n always has: someone adds a key to one file and
 * not the other, and the missing language silently falls back to the key
 * name (or throws) on a screen nobody opened. Nothing else in the build
 * catches it - the JSON is valid either way.
 *
 * Since the catalogues are assembled per feature (see messages.ts), one
 * more failure mode joins it: two feature files claiming the same
 * top-level namespace. The spread that merges them would silently keep
 * the last one and drop the other's keys.
 */

type Messages = Record<string, unknown>;

/** Every leaf path, e.g. "envelopes.form.name". */
function paths(obj: Messages, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === "object"
      ? paths(value as Messages, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

/** ICU placeholders like {name} and {count, plural, ...}. */
function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort();
}

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

const catalogues: Record<string, Messages> = MESSAGES;
const es = MESSAGES.es;
const en = MESSAGES.en;

describe("message catalogues", () => {
  it("covers every supported locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(
        catalogues[locale],
        `messages/${locale}.json is missing`,
      ).toBeDefined();
    }
    expect(catalogues[DEFAULT_LOCALE]).toBeDefined();
  });

  it("has exactly the same keys in every language", () => {
    const reference = paths(es).sort();

    for (const locale of SUPPORTED_LOCALES) {
      const actual = paths(catalogues[locale]).sort();

      // Reported as two lists rather than a boolean, so a failure names
      // the keys instead of just saying the objects differ.
      expect({
        locale,
        missing: reference.filter((k) => !actual.includes(k)),
        extra: actual.filter((k) => !reference.includes(k)),
      }).toEqual({ locale, missing: [], extra: [] });
    }
  });

  it("uses the same placeholders for the same key in every language", () => {
    // A translation that drops {name} renders a sentence with a hole in
    // it; one that invents a placeholder throws at runtime.
    const reference = leaves(es);

    for (const locale of SUPPORTED_LOCALES) {
      const actual = leaves(catalogues[locale]);

      for (const [key, message] of Object.entries(reference)) {
        expect(
          placeholders(actual[key] ?? ""),
          `placeholders differ for "${key}" in ${locale}`,
        ).toEqual(placeholders(message));
      }
    }
  });

  it("has no empty messages", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const empty = Object.entries(leaves(catalogues[locale]))
        .filter(([, value]) => value.trim() === "")
        .map(([key]) => key);

      expect({ locale, empty }).toEqual({ locale, empty: [] });
    }
  });

  it("does not leave a translation identical to Spanish by accident", () => {
    // Some are legitimately identical (proper nouns, "Google", the app
    // name). Anything longer than a couple of words that matches exactly
    // is far more likely to be an untranslated copy-paste.
    const ALLOWED_IDENTICAL = new Set([
      "common.appName",
      "common.passwordPlaceholder",
      "locale.label",
      "auth.oauth.google",
      "auth.oauth.facebook",
    ]);

    const spanish = leaves(es);
    const english = leaves(en);

    const suspicious = Object.entries(spanish)
      .filter(([key, value]) => {
        if (ALLOWED_IDENTICAL.has(key)) return false;
        if (value.split(/\s+/).length < 3) return false;
        return english[key] === value;
      })
      .map(([key]) => key);

    expect(suspicious).toEqual([]);
  });
});

describe("per-feature catalogue sources", () => {
  it("has no two files claiming the same namespace", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const seen = new Map<string, number>();

      for (const source of MESSAGE_SOURCES[locale]) {
        for (const namespace of Object.keys(source)) {
          seen.set(namespace, (seen.get(namespace) ?? 0) + 1);
        }
      }

      const duplicated = [...seen]
        .filter(([, count]) => count > 1)
        .map(([namespace]) => namespace);

      expect({ locale, duplicated }).toEqual({ locale, duplicated: [] });
    }
  });

  it("loses nothing in the merge", () => {
    // If a namespace were dropped (or a file forgotten in messages.ts),
    // the merged catalogue would just be missing screens' worth of
    // copy, and only the screens nobody opened would show it.
    for (const locale of SUPPORTED_LOCALES) {
      const fromSources = MESSAGE_SOURCES[locale].flatMap((source) =>
        Object.keys(source),
      );

      expect(Object.keys(catalogues[locale]).sort()).toEqual(
        fromSources.sort(),
      );
    }
  });

  it("splits the same namespaces in every language", () => {
    // A namespace living in features/envelopes for Spanish but in
    // i18n/messages for English would still merge to the same shape,
    // and drift from there unnoticed.
    const shape = (locale: string) =>
      MESSAGE_SOURCES[locale as keyof typeof MESSAGE_SOURCES].map((source) =>
        Object.keys(source).sort().join(","),
      );

    expect(shape("en")).toEqual(shape("es"));
  });
});
