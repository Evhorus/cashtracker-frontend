/**
 * The dashboard's cache tags, in one place.
 *
 * These were bare string literals: written once in dashboard.service.ts
 * and repeated in up to six Server Actions across three other features.
 * A tag that does not match its producer fails silently - updateTag with
 * a name nothing is cached under is not an error, it is just a write
 * that never invalidates, surfacing as a stale number nobody can trace
 * back to a typo.
 */
export const DASHBOARD_TAGS = {
  summary: "dashboard-summary",
  categoryBreakdown: "dashboard-category-breakdown",
  envelopeBreakdown: "dashboard-envelope-breakdown",
  nameBreakdown: "dashboard-name-breakdown",
  breakdownTotal: "dashboard-breakdown-total",
  recentExpenses: "dashboard-recent-expenses",
} as const;

/**
 * Every aggregate that moves when an envelope is created, edited or
 * deleted. Not the recent-activity list: that one is expenses only, and
 * an envelope write never adds or removes a row from it.
 */
export const DASHBOARD_ENVELOPE_WRITE_TAGS = [
  DASHBOARD_TAGS.summary,
  DASHBOARD_TAGS.categoryBreakdown,
  DASHBOARD_TAGS.envelopeBreakdown,
  DASHBOARD_TAGS.nameBreakdown,
  DASHBOARD_TAGS.breakdownTotal,
] as const;

/** An expense write moves the same aggregates, plus recent activity. */
export const DASHBOARD_EXPENSE_WRITE_TAGS = [
  ...DASHBOARD_ENVELOPE_WRITE_TAGS,
  DASHBOARD_TAGS.recentExpenses,
] as const;
