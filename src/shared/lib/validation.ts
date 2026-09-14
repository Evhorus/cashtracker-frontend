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

/**
 * The largest amount the API can store.
 *
 * Both `expense.amount` and `envelope.amount` are `decimal(12, 2)` in
 * the backend, which tops out at ten integer digits. Above that the
 * insert fails and the response is a bare 500, which the UI shows
 * verbatim as "Internal server error" - in English, in a Spanish app,
 * for what is really a validation failure.
 *
 * Here rather than in either feature because both forms share the
 * limit, and it is a property of the column, not of envelopes or of
 * expenses.
 */
export const MAX_AMOUNT = 9_999_999_999.99;
