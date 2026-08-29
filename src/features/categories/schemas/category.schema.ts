import { z } from "zod";

import type { ValidationTranslator } from "@/lib/validation";

export const CategoryAPIResponseSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
  icon: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CategoryApi = z.infer<typeof CategoryAPIResponseSchema>;

// GET /categories returns a plain array (CategoryResponseDto.fromEntities),
// not the paginated envelope shape - the list is small (a handful of
// defaults plus whatever the user adds), no pagination needed.
export const CategoriesAPIResponseSchema = z.array(CategoryAPIResponseSchema);

export type CategoriesResponseApi = z.infer<typeof CategoriesAPIResponseSchema>;

// GET /categories/options - the icon/color whitelist CreateCategoryDto/
// UpdateCategoryDto validate against on the backend (IsIn(ICON_KEYS)/
// IsIn(PRESET_COLORS)). Fetched rather than duplicated as a hardcoded
// frontend constant, so the create-category form's grid can never drift
// out of sync with what the backend actually accepts.
export const CategoryOptionsAPIResponseSchema = z.object({
  icons: z.array(z.string()),
  colors: z.array(z.string()),
});

export type CategoryOptionsApi = z.infer<
  typeof CategoryOptionsAPIResponseSchema
>;

/*
 * Category Form
 */

// icon/color are plain non-empty strings, not a z.enum against a fixed
// list - the valid set is fetched at runtime (CategoryOptionsApi above),
// not known at module-load time. The create-category form only ever
// submits a value from that fetched list (a curated button grid, no free
// text), so this is really just a "something was picked" check - the
// backend's IsIn() validators are the actual enforcement.
export const buildCategoryFormSchema = (t: ValidationTranslator) =>
  z.object({
    label: z
      .string()
      .min(1, { message: t("categoryNameRequired") })
      .max(50)
      .refine((val) => val.trim().length > 0, t("notOnlySpaces"))
      .transform((val) => val.trim()),
    color: z.string().min(1, { message: t("colorRequired") }),
    icon: z.string().min(1, { message: t("iconRequired") }),
  });

export type CategoryFormValues = z.infer<
  ReturnType<typeof buildCategoryFormSchema>
>;

// GET /categories/usage - envelope counts per category, aggregated by
// the backend. Only categories actually in use appear; a missing entry
// means zero. Separate from the dashboard's category breakdown, which
// answers a different question (spending in one currency, excluding
// untouched envelopes) - see cashtracker-backend's endpoint comments.
export const CategoryUsageAPIResponseSchema = z.array(
  z.object({
    categoryId: z.string(),
    envelopeCount: z.number(),
  }),
);

export type CategoryUsageApi = z.infer<typeof CategoryUsageAPIResponseSchema>;
