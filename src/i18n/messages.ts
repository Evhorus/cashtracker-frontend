import accountEn from "@/features/account/messages/en.json";
import accountEs from "@/features/account/messages/es.json";
import authEn from "@/features/auth/messages/en.json";
import authEs from "@/features/auth/messages/es.json";
import categoriesEn from "@/features/categories/messages/en.json";
import categoriesEs from "@/features/categories/messages/es.json";
import dashboardEn from "@/features/dashboard/messages/en.json";
import dashboardEs from "@/features/dashboard/messages/es.json";
import envelopesEn from "@/features/envelopes/messages/en.json";
import envelopesEs from "@/features/envelopes/messages/es.json";
import expensesEn from "@/features/expenses/messages/en.json";
import expensesEs from "@/features/expenses/messages/es.json";
import localeEn from "@/features/locale/messages/en.json";
import localeEs from "@/features/locale/messages/es.json";
import homeEn from "@/app/(home)/messages/en.json";
import homeEs from "@/app/(home)/messages/es.json";
import sharedEn from "./messages/en.json";
import sharedEs from "./messages/es.json";
import type { SupportedLocale } from "./config";

/**
 * The message catalogues, assembled from one file per feature.
 *
 * Each feature owns the words for its own screens, next to the code
 * that renders them - the same reasoning that puts its actions,
 * schemas and components together. Deleting a feature deletes its
 * copy with it, and two people working on two features don't collide
 * in one 500-line JSON.
 *
 * `./messages/` holds only what belongs to no feature: `common`,
 * `validation`, `nav`, `pagination`, `errors`, `theme` and
 * `currencies`.
 *
 * Spread, not deep-merged: every source file contributes whole
 * top-level namespaces, and no two claim the same one (messages.test.ts
 * asserts that - a duplicate would silently win here and drop the
 * other's keys, which is the one failure mode this shape introduces).
 *
 * Static imports rather than `await import()`: a template-literal
 * dynamic import left the bundler no static edge to the JSON, so edits
 * during `next dev` never invalidated and newly added keys logged
 * MISSING_MESSAGE until the server was restarted. These are
 * server-side imports (getRequestConfig runs on the server), so the
 * client still only receives the active locale.
 */
export const MESSAGE_SOURCES = {
  es: [
    sharedEs,
    localeEs,
    homeEs,
    authEs,
    dashboardEs,
    envelopesEs,
    expensesEs,
    categoriesEs,
    accountEs,
  ],
  en: [
    sharedEn,
    localeEn,
    homeEn,
    authEn,
    dashboardEn,
    envelopesEn,
    expensesEn,
    categoriesEn,
    accountEn,
  ],
} as const satisfies Record<SupportedLocale, readonly object[]>;

/**
 * Spelled out as one object literal rather than built with
 * `Object.assign`/reduce: the type has to be statically known for
 * next-intl's key checking (see global.d.ts) to work, and a runtime
 * merge collapses to a union or an index signature.
 */
export const MESSAGES = {
  es: {
    ...sharedEs,
    ...localeEs,
    ...homeEs,
    ...authEs,
    ...dashboardEs,
    ...envelopesEs,
    ...expensesEs,
    ...categoriesEs,
    ...accountEs,
  },
  en: {
    ...sharedEn,
    ...localeEn,
    ...homeEn,
    ...authEn,
    ...dashboardEn,
    ...envelopesEn,
    ...expensesEn,
    ...categoriesEn,
    ...accountEn,
  },
} as const;

/** Spanish is the reference shape - messages.test.ts enforces that
 * every other language has exactly the same keys. */
export type Messages = typeof MESSAGES.es;
