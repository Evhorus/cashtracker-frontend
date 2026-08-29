import "server-only";

import { cache } from "react";
import { CategoriesService } from "@/features/categories/services/categories.service";

/**
 * Read path for the user's categories - a plain server-only function
 * rather than a Server Action, see envelopes/data/get-envelopes.ts for
 * why.
 *
 * Wrapped in React's `cache()` so any Server Component that needs to
 * resolve a category (CategoryIcon/CategoryLabel in category-badge.tsx,
 * CategoryBreakdown, dashboard/layout.tsx) can just call this without
 * the caller threading the list down as a prop - N badges on one page
 * still hit the backend once per request.
 *
 * This replaces the old lib/get-categories-cached.ts, which existed
 * only to wrap the Server Action in cache(). Now that the read isn't an
 * action, the memoization lives on the read itself and that indirection
 * is gone.
 *
 * Returns the raw (serializable) domain Category[], not CategoryDef[] -
 * this is also what seeds dashboard/layout.tsx's CategoriesProvider, and
 * a CategoryDef's `Icon` (a live component reference) can't cross the
 * Server Component -> Client Component boundary. Server Components that
 * need the resolved Icon call toCategoryDef()/resolveCategory()
 * themselves (category-palette.ts); client components do the same via
 * useCategories() + resolveIcon()/resolveCategory().
 */
export const getCategories = cache(() => CategoriesService.getAll());
