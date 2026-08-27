import "server-only";
import { cache } from "react";
import { getCategoriesAction } from "../actions/get-categories.action";
import { getCategoryOptionsAction } from "../actions/get-category-options.action";

/**
 * Server-only, per-request-memoized category loader. Lets any Server
 * Component that needs to resolve a category (CategoryIcon/CategoryLabel
 * in category-badge.tsx, CategoryBreakdown, account/page.tsx) fetch the
 * user's categories itself without the caller threading them down as a
 * prop - React's cache() means N badges on one page still only hit the
 * backend once per request.
 *
 * Returns the raw (serializable) domain Category[], not CategoryDef[] -
 * this is also what seeds dashboard/layout.tsx's CategoriesProvider, and a
 * CategoryDef's `Icon` (a live component reference) can't cross the
 * Server Component -> Client Component boundary. Server Components that
 * need the resolved Icon call toCategoryDef()/resolveCategory()
 * themselves (category-palette.ts); client components do the same via
 * useCategories() + resolveIcon()/resolveCategory().
 */
export const getCategoriesCached = cache(getCategoriesAction);

/**
 * Same per-request memoization as getCategoriesCached() above, for the
 * icon/color whitelist (GET /categories/options) the create-category
 * form's grid renders from - see category.schema.ts for why this is
 * fetched instead of duplicated as a hardcoded frontend constant.
 */
export const getCategoryOptionsCached = cache(getCategoryOptionsAction);
