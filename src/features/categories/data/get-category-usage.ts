import "server-only";

import { CategoriesService } from "@/features/categories/services/categories.service";

/**
 * Envelope counts per category, keyed by category id. Categories with no
 * envelopes are absent - callers treat a missing key as zero.
 *
 * Plain server-only function, see envelopes/data/get-envelopes.ts.
 */
export const getCategoryUsage = () => CategoriesService.getUsage();
