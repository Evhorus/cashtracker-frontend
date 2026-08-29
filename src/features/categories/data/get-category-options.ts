import "server-only";

import { cache } from "react";
import { CategoriesService } from "@/features/categories/services/categories.service";

/**
 * The icon/color whitelist the create-category form's grid renders from
 * (GET /categories/options) - fetched instead of duplicated as a
 * hardcoded frontend constant, see category.schema.ts for why.
 *
 * Same per-request memoization and same server-only-function reasoning
 * as get-categories.ts.
 */
export const getCategoryOptions = cache(() => CategoriesService.getOptions());
