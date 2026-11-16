/**
 * The expenses report's filters, as they live in the URL - so a report
 * can be reloaded, bookmarked or shared - and as the API takes them.
 * Pure on purpose: the page (server) and the filter bar (client) both
 * use it.
 */

export const REPORT_PERIODS = ["month", "cycle", "custom"] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];

export const REPORT_VIEWS = ["single", "split"] as const;
export type ReportView = (typeof REPORT_VIEWS)[number];

/** The URL's id for "expenses without a payment method". */
export const UNASSIGNED_METHOD = "none";

export interface ReportFilters {
  methodIds: string[];
  includeUnassigned: boolean;
  period: ReportPeriod;
  /** `YYYY-MM`; used by `month` and `cycle`. */
  month: string;
  /** Both set only when `period` is `custom`. */
  startDate?: string;
  endDate?: string;
  view: ReportView;
}

export type ReportSearchParams = Partial<
  Record<"methods" | "period" | "month" | "from" | "to" | "view", string>
>;

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

function oneOf<T extends string>(
  values: readonly T[],
  value: string | undefined,
  fallback: T,
): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

export function parseReportFilters(
  params: ReportSearchParams,
  currentMonth: string,
): ReportFilters {
  const selected = (params.methods ?? "").split(",").filter(Boolean);
  const month =
    params.month && MONTH.test(params.month) ? params.month : currentMonth;
  const view = oneOf(REPORT_VIEWS, params.view, "single");
  const base = {
    methodIds: selected.filter((id) => id !== UNASSIGNED_METHOD),
    includeUnassigned: selected.includes(UNASSIGNED_METHOD),
    month,
    view,
  };

  const period = oneOf(REPORT_PERIODS, params.period, "month");
  if (period !== "custom") return { ...base, period };

  const { from, to } = params;
  // `YYYY-MM-DD` strings compare correctly as plain strings.
  const isValidRange =
    from !== undefined &&
    to !== undefined &&
    CALENDAR_DATE.test(from) &&
    CALENDAR_DATE.test(to) &&
    from <= to;
  return isValidRange
    ? { ...base, period, startDate: from, endDate: to }
    : { ...base, period: "month" };
}

/** The URL for these filters, leaving defaults out so the plain page
 * stays `/dashboard/expenses`. */
export function toSearchParams(
  filters: ReportFilters,
  currentMonth: string,
): URLSearchParams {
  const params = new URLSearchParams();
  const selected = [
    ...filters.methodIds,
    ...(filters.includeUnassigned ? [UNASSIGNED_METHOD] : []),
  ];
  if (selected.length > 0) params.set("methods", selected.join(","));
  if (filters.period !== "month") params.set("period", filters.period);
  if (filters.period === "custom") {
    params.set("from", filters.startDate ?? "");
    params.set("to", filters.endDate ?? "");
  } else if (filters.month !== currentMonth) {
    params.set("month", filters.month);
  }
  if (filters.view !== "single") params.set("view", filters.view);
  return params;
}

/** The query `GET /expenses/report` takes. */
export function toApiQuery(filters: ReportFilters): URLSearchParams {
  const query = new URLSearchParams({ period: filters.period });
  if (filters.period === "custom") {
    query.set("startDate", filters.startDate ?? "");
    query.set("endDate", filters.endDate ?? "");
  } else {
    query.set("month", filters.month);
  }
  if (filters.methodIds.length > 0) {
    query.set("paymentMethodIds", filters.methodIds.join(","));
  }
  if (filters.includeUnassigned) query.set("includeUnassigned", "true");
  return query;
}

/** `YYYY-MM` moved by `delta` months. */
export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return shifted.toISOString().slice(0, 7);
}

/** First and last calendar day of a `YYYY-MM` month. */
export function monthBounds(month: string): {
  startDate: string;
  endDate: string;
} {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}
