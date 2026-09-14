/** The categories feature's cache tags. See dashboard/lib/cache-tags.ts. */
export const CATEGORY_TAGS = {
  all: "all-categories",
  /** The icon/colour option list - changes only when the app ships new ones. */
  options: "category-options",
  /** Envelope counts per category, so any envelope write moves it too. */
  usage: "category-usage",
} as const;
