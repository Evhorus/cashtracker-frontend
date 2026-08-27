export interface Category {
  id: string;
  label: string;
  /** oklch() color string - one of CategoryOptions.colors. */
  color: string;
  /** Icon key - one of CategoryOptions.icons, resolved to a LucideIcon
   * component via resolveIcon (lib/icon-registry.ts) for rendering. */
  icon: string;
  /** True for the 9 categories seeded automatically on first fetch (see
   * CategoriesService.findAllForUser on the backend) - just informational,
   * doesn't restrict editing/deleting. */
  isDefault: boolean;
  createdAt: Date;
}

/**
 * The icon/color whitelist the backend accepts (GET /categories/options,
 * fetched rather than hardcoded here - see category.schema.ts's
 * CategoryOptionsAPIResponseSchema for why).
 */
export interface CategoryOptions {
  icons: string[];
  colors: string[];
}
