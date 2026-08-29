import { enUS, esMX } from "@clerk/localizations";
import { getLocale } from "next-intl/server";

import type { SupportedLocale } from "./config";

/**
 * Clerk ships its own translations for the strings it renders itself
 * (OAuth errors, the reverification prompts, its hosted flows). Those
 * were pinned to `esMX` in all three ClerkProvider layouts, so an
 * English reader who hit a Clerk-generated error got it in Spanish,
 * inside an otherwise English page.
 *
 * `enUS` is Clerk's built-in default; `esMX` rather than `esES` matches
 * the app's own Latin American Spanish.
 */
const CLERK_LOCALIZATIONS = { es: esMX, en: enUS } satisfies Record<
  SupportedLocale,
  unknown
>;

export async function getClerkLocalization() {
  return CLERK_LOCALIZATIONS[await getLocale()];
}
