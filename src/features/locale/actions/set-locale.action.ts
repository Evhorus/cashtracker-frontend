"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  isSupportedLocale,
  LOCALE_COOKIE,
  type SupportedLocale,
} from "@/i18n/config";

/**
 * Writes the locale cookie. A Server Action rather than a client-side
 * `document.cookie` write because the locale is read on the server (in
 * i18n/request.ts) to pick the messages: setting it in the browser would
 * leave the already-rendered server output in the old language until
 * something happened to re-render it.
 *
 * A year, matching how long a language preference is reasonably
 * remembered, and `lax` so following a link into the app keeps it.
 */
export async function setLocaleAction(locale: SupportedLocale) {
  if (!isSupportedLocale(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // Every page's text depends on this, so the whole tree is stale.
  revalidatePath("/", "layout");
}
