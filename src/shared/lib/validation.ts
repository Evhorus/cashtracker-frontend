import type { useTranslations } from "next-intl";

/**
 * The translator a form schema is built with.
 *
 * Form schemas are factories rather than module-level constants because
 * their messages are the ones the user actually reads, and a message
 * baked in at import time is stuck in whatever language the file was
 * written in. Only Client Components consume these (they're
 * react-hook-form resolvers - the Server Actions validate server-side
 * against the backend's own DTOs, not against these), so a plain
 * `useTranslations("validation")` in the form is all a factory needs.
 */
export type ValidationTranslator = ReturnType<
  typeof useTranslations<"validation">
>;
