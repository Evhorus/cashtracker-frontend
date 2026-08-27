import { Tag, type LucideIcon } from "lucide-react";
import type { Category } from "../types";
import { resolveIcon } from "./icon-registry";

export interface CategoryDef {
  id: string;
  label: string;
  /** oklch() color string - used for the icon and its soft background tint
   * (bg gets its own alpha suffix where it's used, this is the base color). */
  color: string;
  /** Raw icon key (one of CategoryOptions.icons), kept alongside the
   * resolved `Icon` component below so an edit form can pre-select it -
   * a LucideIcon component can't be reversed back into its key. */
  icon: string;
  Icon: LucideIcon;
  isDefault: boolean;
}

// Fallback for a category value that isn't one of the user's own categories
// (free text from before this existed, or anything else) - never invented,
// always a real, deliberate "we don't recognize this" state.
export const OTHER_CATEGORY: CategoryDef = {
  id: "otros",
  label: "Otros",
  color: "oklch(0.6 0.02 260)",
  icon: "tag",
  Icon: Tag,
  isDefault: false,
};

/**
 * Converts a fetched domain Category (icon stored as a string key) into
 * its renderable CategoryDef (icon resolved to an actual LucideIcon
 * component) - see resolveIcon.
 */
export function toCategoryDef(category: Category): CategoryDef {
  return {
    id: category.id,
    label: category.label,
    color: category.color,
    icon: category.icon,
    Icon: resolveIcon(category.icon),
    isDefault: category.isDefault,
  };
}

/**
 * Resolves a free-text `category` value (Envelope.category, still just a
 * string on the API) against the user's own categories, matched
 * case/whitespace-insensitively. An unrecognized value keeps its own
 * original text as the label (never silently renamed to "Otros") but
 * borrows OTHER_CATEGORY's icon/color, since there's nothing more specific
 * to show. Returns null only for "no category set" (empty/nullish).
 *
 * Takes the raw (serializable) Category[] rather than CategoryDef[] and
 * only resolves the one matched entry to a CategoryDef - callers that hold
 * a list fetched via a Server Component -> Client Component boundary
 * (CategoriesProvider) can't carry CategoryDef[] across it, since its
 * `Icon` is a live component reference and React can't serialize a
 * function as a client component prop.
 */
export function resolveCategory(
  value: string | null | undefined,
  categories: Category[],
): CategoryDef | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const match = categories.find(
    (category) => category.label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (match) return toCategoryDef(match);

  return { ...OTHER_CATEGORY, label: trimmed };
}
