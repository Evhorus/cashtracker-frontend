import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

// No `[locale]` route segment (see plan: Phase 1 keeps URLs unchanged) -
// the locale is just a cookie. Nothing sets this cookie yet - there's no
// switcher control in the app - so every request resolves to the default
// "es" for now. A later phase adds the switcher and starts writing it.
const DEFAULT_LOCALE = "es";
const SUPPORTED_LOCALES = ["es", "en"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(value: string | undefined): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("NEXT_LOCALE")?.value;
  const locale = isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
