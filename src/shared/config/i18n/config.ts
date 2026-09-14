/**
 * The locale vocabulary, in one place so the request config, the cookie
 * action and the switcher can't disagree about what's supported.
 *
 * No `[locale]` route segment: the locale is a cookie, so URLs stay the
 * same in either language. That's a deliberate trade - it costs
 * per-language URLs (and the SEO that comes with them), which this app
 * doesn't need since everything but the landing page is behind auth.
 */
export const SUPPORTED_LOCALES = ["es", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "es";

/** Cookie name next-intl reads by convention. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isSupportedLocale(
  value: string | undefined | null,
): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

/** What each locale calls itself - never translated, by convention: a
 * language picker should be readable to someone who can't read the
 * current language. */
export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  es: "Español",
  en: "English",
};
