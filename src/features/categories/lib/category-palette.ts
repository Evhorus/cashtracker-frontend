import {
  Briefcase,
  Car,
  Heart,
  House,
  PawPrint,
  PiggyBank,
  Plane,
  Tag,
  Ticket,
  User,
  type LucideIcon,
} from "lucide-react";

export interface CategoryDef {
  id: string;
  label: string;
  /** oklch() color string - used for the icon and its soft background tint
   * (bg gets its own alpha suffix where it's used, this is the base color).
   * All share the same lightness/chroma as the app's --primary, only hue
   * varies (same "family of accents" rule the rest of the redesign
   * follows) - Hogar reuses --primary's exact value (155) since it's the
   * default/most common category and ties back to the brand color. */
  color: string;
  Icon: LucideIcon;
}

// Predefined, frontend-only for now (see plan: a real Category entity with
// CRUD needs cashtracker-backend, out of scope here). Picked to match the
// category values already present in real envelope data, so existing
// envelopes get a real icon/color immediately instead of falling back to
// "Otros" for everything. Order here is the order they render in the
// picker.
export const CATEGORIES: readonly CategoryDef[] = [
  { id: "hogar", label: "Hogar", color: "oklch(0.72 0.14 153)", Icon: House },
  { id: "transporte", label: "Transporte", color: "oklch(0.7 0.13 211)", Icon: Car },
  { id: "ahorros", label: "Ahorros", color: "oklch(0.7 0.13 182)", Icon: PiggyBank },
  { id: "trabajo", label: "Trabajo", color: "oklch(0.7 0.13 240)", Icon: Briefcase },
  { id: "personal", label: "Personal", color: "oklch(0.7 0.13 269)", Icon: User },
  { id: "mascotas", label: "Mascotas", color: "oklch(0.7 0.13 327)", Icon: PawPrint },
  { id: "viajes", label: "Viajes", color: "oklch(0.7 0.13 124)", Icon: Plane },
  { id: "entretenimiento", label: "Entretenimiento", color: "oklch(0.7 0.13 298)", Icon: Ticket },
  { id: "salud", label: "Salud", color: "oklch(0.7 0.13 95)", Icon: Heart },
] as const;

// Fallback for a category value that isn't one of the predefined ones
// (free text from before this existed, or anything else) - never invented,
// always a real, deliberate "we don't recognize this" state.
export const OTHER_CATEGORY: CategoryDef = {
  id: "otros",
  label: "Otros",
  color: "oklch(0.6 0.02 260)",
  Icon: Tag,
};

/**
 * Resolves a free-text `category` value (Envelope.category, still just a
 * string on the API - see plan) to its predefined definition, matched
 * case/whitespace-insensitively. An unrecognized value keeps its own
 * original text as the label (never silently renamed to "Otros") but
 * borrows OTHER_CATEGORY's icon/color, since there's nothing more specific
 * to show. Returns null only for "no category set" (empty/nullish).
 */
export function resolveCategory(value?: string | null): CategoryDef | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const match = CATEGORIES.find(
    (category) => category.label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (match) return match;

  return { ...OTHER_CATEGORY, label: trimmed };
}
