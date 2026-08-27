import {
  Briefcase,
  Car,
  Gift,
  GraduationCap,
  Heart,
  House,
  PawPrint,
  PiggyBank,
  Plane,
  ShoppingBag,
  Tag,
  Ticket,
  User,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps an icon key (one of the backend's GET /categories/options `icons`
 * - see category.schema.ts for why that whitelist is fetched rather than
 * duplicated here) to the LucideIcon component that actually renders it.
 * This mapping itself can only ever live on the frontend - lucide-react
 * components don't exist on the backend - so it's not something a fetch
 * could replace. An icon key the backend added that isn't in here yet
 * just falls back to Tag (see resolveIcon below) rather than breaking.
 */
const ICON_REGISTRY: Record<string, LucideIcon> = {
  house: House,
  car: Car,
  "piggy-bank": PiggyBank,
  briefcase: Briefcase,
  user: User,
  "paw-print": PawPrint,
  plane: Plane,
  ticket: Ticket,
  heart: Heart,
  "shopping-bag": ShoppingBag,
  utensils: Utensils,
  "graduation-cap": GraduationCap,
  gift: Gift,
  zap: Zap,
  tag: Tag,
};

/** Resolves an icon key to its LucideIcon component. An unknown key (the
 * backend added one this registry doesn't have yet, or corrupt data)
 * falls back to Tag rather than throwing - same "never invented, always
 * a deliberate fallback" rule category-palette.ts's OTHER_CATEGORY
 * already follows. */
export function resolveIcon(key: string): LucideIcon {
  return ICON_REGISTRY[key] ?? Tag;
}
