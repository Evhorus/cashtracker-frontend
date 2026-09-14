import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_COOKIE,
  SUPPORTED_LOCALES,
} from "./config";

/**
 * The cookie -> catalogue path. Entirely this app's own: the API has no
 * notion of a locale and never will, since the words are presentation.
 *
 * The catalogue tests next door check the messages, and
 * no-hardcoded-copy checks that components use them. Neither covers the
 * step in between - which locale a request resolves to. That step is the
 * one with the hazards: an unwritten cookie (the original bug, where
 * messages/en.json was unreachable because nothing ever wrote one), a
 * stale value from an older release, or a hand-edited one.
 *
 * Deliberately not tested: that the browser actually re-renders in the
 * new language. That needs a browser, and it was verified there.
 */

const store = new Map<string, { value: string; options?: unknown }>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      store.has(name) ? { name, value: store.get(name)!.value } : undefined,
    set: (name: string, value: string, options?: unknown) =>
      store.set(name, { value, options }),
  }),
}));

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

/**
 * Under Vitest, `next-intl/server` resolves to its react-client build,
 * whose getRequestConfig throws "not supported in Client Components".
 * Mocked to hand the callback straight back, which is all this test
 * wants: the subject is the resolver this app wrote, not next-intl's
 * wrapper around it.
 */
vi.mock("next-intl/server", () => ({
  getRequestConfig: (resolver: unknown) => resolver,
}));

/**
 * Calls the resolver `request.ts` passes to getRequestConfig (see the
 * mock above). `requestLocale` is unused by this app's config - the
 * cookie is the only source - but the signature requires it.
 */
async function resolveRequestConfig() {
  const mod = await import("./request");
  const config = mod.default as unknown as (arg: {
    requestLocale: Promise<string | undefined>;
  }) => Promise<{ locale: string; messages: Record<string, unknown> }>;

  return config({ requestLocale: Promise.resolve(undefined) });
}

beforeEach(() => {
  store.clear();
  revalidatePath.mockClear();
  vi.resetModules();
});

describe("resolving the locale from the cookie", () => {
  it("falls back to the default when no cookie is set", async () => {
    // A first-time visitor, and the case that hid the bug: with nothing
    // writing the cookie, this was the *only* branch that ever ran.
    const { locale } = await resolveRequestConfig();

    expect(locale).toBe(DEFAULT_LOCALE);
  });

  it("uses the cookie when it names a supported locale", async () => {
    store.set(LOCALE_COOKIE, { value: "en" });

    const { locale } = await resolveRequestConfig();

    expect(locale).toBe("en");
  });

  it("falls back rather than throwing on a locale that isn't supported", async () => {
    // A cookie from a release that offered a language this one dropped,
    // or one somebody edited. Throwing here would 500 every page.
    store.set(LOCALE_COOKIE, { value: "fr" });

    const { locale } = await resolveRequestConfig();

    expect(locale).toBe(DEFAULT_LOCALE);
  });

  it("returns a populated catalogue for whichever locale it picked", async () => {
    for (const locale of SUPPORTED_LOCALES) {
      vi.resetModules();
      store.set(LOCALE_COOKIE, { value: locale });

      const config = await resolveRequestConfig();

      expect(config.locale).toBe(locale);
      // Guards against the merge in messages.ts silently producing {}.
      expect(Object.keys(config.messages).length).toBeGreaterThan(5);
    }
  });
});

describe("writing the locale", () => {
  it("persists a supported locale under the name next-intl reads", async () => {
    const { setLocaleAction } =
      await import("@/features/locale/actions/set-locale.action");

    await setLocaleAction("en");

    expect(store.get(LOCALE_COOKIE)?.value).toBe("en");
  });

  it("ignores a value that isn't a supported locale", async () => {
    // The action is a server entry point: its argument arrives over the
    // wire and is not to be trusted just because the type says so.
    const { setLocaleAction } =
      await import("@/features/locale/actions/set-locale.action");

    await setLocaleAction("de" as never);

    expect(store.has(LOCALE_COOKIE)).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("revalidates the whole layout, since every page's text changes", async () => {
    const { setLocaleAction } =
      await import("@/features/locale/actions/set-locale.action");

    await setLocaleAction("en");

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("sets a cookie that survives leaving and coming back", async () => {
    const { setLocaleAction } =
      await import("@/features/locale/actions/set-locale.action");

    await setLocaleAction("en");
    const options = store.get(LOCALE_COOKIE)?.options as {
      path?: string;
      maxAge?: number;
      sameSite?: string;
    };

    // Site-wide, long-lived, and surviving a cross-site link into the
    // app - a session cookie or a "strict" one would silently reset the
    // language the user chose.
    expect(options.path).toBe("/");
    expect(options.maxAge).toBeGreaterThan(60 * 60 * 24 * 30);
    expect(options.sameSite).toBe("lax");
  });
});

describe("the locale vocabulary", () => {
  it("agrees with itself about what is supported", async () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(isSupportedLocale(locale)).toBe(true);
    }
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale(undefined)).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
  });

  it("has a default that is itself supported", async () => {
    expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
  });
});
