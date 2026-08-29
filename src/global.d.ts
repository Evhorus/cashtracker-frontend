import type { SupportedLocale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";

/**
 * Types every `t("...")` call against the Spanish catalogue, which is
 * the reference one (messages.test.ts already enforces that every other
 * language has exactly the same keys, so checking against one is enough
 * to check against all).
 *
 * Without this, next-intl types message keys as plain `string`: a typo
 * or a key renamed in a catalogue compiles fine and only surfaces as a
 * MISSING_MESSAGE in the browser, on whichever screen happens to render
 * it. With it, the same mistake is a build error.
 */
declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
    Locale: SupportedLocale;
  }
}
