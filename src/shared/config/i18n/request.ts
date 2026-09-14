import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, isSupportedLocale, LOCALE_COOKIE } from "./config";
import { MESSAGES } from "./messages";

// The locale is a cookie, not a route segment - see i18n/config.ts for
// why. Written by setLocaleAction (features/locale/actions), read here.
// The catalogue itself is assembled per feature - see i18n/messages.ts.
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(cookieLocale)
    ? cookieLocale
    : DEFAULT_LOCALE;

  return { locale, messages: MESSAGES[locale] };
});
